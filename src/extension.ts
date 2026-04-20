import * as vscode from 'vscode';
import { ClaudeExtensionInfo, RtlMode } from './types.js';
import { findClaudeExtensions } from './finder.js';
import { addRtl, addRtlAlways, addRtlAuto, removeRtl, fixBidi, getStatus } from './injector.js';
import { FontOptions } from './content.js';
import { createStatusBarItem, updateStatusBar, disposeStatusBar } from './statusBar.js';

const STATE_MODE_KEY = 'rtl.mode';
const STATE_VERSION_KEY = 'rtl.version';

function getFontOptions(): FontOptions {
    const cfg = vscode.workspace.getConfiguration('claude-rtl');
    return {
        textFont: cfg.get<string>('textFont', '').trim(),
        codeFont: cfg.get<string>('codeFont', '').trim(),
    };
}

let outputChannel: vscode.OutputChannel;
let globalState: vscode.Memento;
let currentVersion: string;

function getOutputChannel(): vscode.OutputChannel {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('Claude RTL');
    }
    return outputChannel;
}

async function saveMode(mode: RtlMode): Promise<void> {
    await globalState.update(STATE_MODE_KEY, mode);
}

function getSavedMode(): RtlMode {
    return globalState.get<RtlMode>(STATE_MODE_KEY, 'inactive');
}

type InjectionAction = (ext: ClaudeExtensionInfo, fonts?: FontOptions) => Promise<{ messages: string[]; changed: boolean }>;

async function handleMode(
    label: string,
    mode: RtlMode,
    action: InjectionAction,
    noChangeMessage?: string,
): Promise<void> {
    const extensions = await findClaudeExtensions();
    if (extensions.length === 0) {
        vscode.window.showWarningMessage('No Claude Code extensions found.');
        return;
    }

    const channel = getOutputChannel();
    channel.clear();
    channel.appendLine(`${label}...\n`);

    const fonts = getFontOptions();
    let anyChanged = false;
    for (const ext of extensions) {
        const result = await action(ext, fonts);
        result.messages.forEach(m => channel.appendLine(m));
        if (result.changed) anyChanged = true;
    }

    channel.show(true);
    await saveMode(mode);

    if (anyChanged) {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    } else if (noChangeMessage) {
        vscode.window.showInformationMessage(noChangeMessage);
    }
}

async function handleFixBidi(): Promise<void> {
    // fixBidi preserves current mode; if was inactive, it activates as 'active'
    const currentSaved = getSavedMode();
    const mode = currentSaved === 'inactive' ? 'active' : currentSaved;
    await handleMode('Activating RTL support with BiDi fix', mode, fixBidi);
}

async function handleRemove(): Promise<void> {
    await handleMode('Deactivating RTL support', 'inactive', removeRtl, 'RTL is already inactive.');
}

async function handleStatus(): Promise<void> {
    const extensions = await findClaudeExtensions();
    if (extensions.length === 0) {
        vscode.window.showWarningMessage('No Claude Code extensions found.');
        return;
    }

    const statuses = await getStatus(extensions);
    const channel = getOutputChannel();
    channel.clear();
    const ideName = vscode.env.appName;
    channel.appendLine(`IDE: ${ideName}`);
    channel.appendLine(`Saved mode: ${getSavedMode()}`);
    channel.appendLine(`Found ${extensions.length} Claude Code extension(s):\n`);

    for (const s of statuses) {
        channel.appendLine(`  ${s.extension.name}`);
        channel.appendLine(`    CSS: ${s.cssInstalled ? 'INSTALLED' : 'Not installed'}  |  ${s.cssBackupExists ? 'Backup exists' : 'No backup'}`);
        channel.appendLine(`    JS:  ${s.jsInstalled ? 'INSTALLED' : 'Not installed'}  |  ${s.jsBackupExists ? 'Backup exists' : 'No backup'}`);
        channel.appendLine(`    Mode: ${s.mode}`);
        channel.appendLine(`    Path: ${s.extension.cssPath}\n`);
    }

    channel.show(true);
    await updateStatusBar();
}

interface MenuAction extends vscode.QuickPickItem {
    command: string;
}

async function handleShowMenu(): Promise<void> {
    const items: MenuAction[] = [
        { label: '$(check) Activate RTL', description: 'Enable RTL support with toggle button', command: 'claude-rtl.add' },
        { label: '$(pin) Activate RTL (Always)', description: 'Enable RTL permanently without toggle button', command: 'claude-rtl.addAlways' },
        { label: '$(eye) Activate RTL (Auto)', description: 'Auto-detect Hebrew per paragraph and set direction', command: 'claude-rtl.addAuto' },
        { label: '$(tools) Fix BiDi', description: 'Activate RTL and fix bidirectional text issues', command: 'claude-rtl.fixBidi' },
        { label: '$(close) Deactivate RTL', description: 'Disable RTL support and restore original files', command: 'claude-rtl.remove' },
        { label: '$(info) Check Status', description: 'Show current RTL status', command: 'claude-rtl.status' },
    ];

    const selection = await vscode.window.showQuickPick(items, {
        placeHolder: 'Claude Code RTL Support',
    });

    if (selection) {
        vscode.commands.executeCommand(selection.command);
    }
}

const MODE_ACTIONS: Record<string, InjectionAction> = {
    active: addRtl,
    always: addRtlAlways,
    auto: addRtlAuto,
};

async function silentInject(extensions: ClaudeExtensionInfo[], action: InjectionAction, fonts?: FontOptions): Promise<boolean> {
    let anyChanged = false;
    for (const ext of extensions) {
        const result = await action(ext, fonts);
        if (result.changed) anyChanged = true;
    }
    return anyChanged;
}

async function saveVersion(): Promise<void> {
    await globalState.update(STATE_VERSION_KEY, currentVersion);
}

/**
 * Detect the active RTL mode from file contents.
 * Returns the mode of the first extension that has RTL installed,
 * or 'inactive' if none found.
 */
async function detectModeFromFiles(extensions: ClaudeExtensionInfo[]): Promise<RtlMode> {
    const statuses = await getStatus(extensions);
    for (const s of statuses) {
        if (s.mode !== 'inactive') return s.mode;
    }
    return 'inactive';
}

/**
 * Auto-reactivate RTL if needed.
 * Runs silently on every activation to ensure RTL stays injected
 * even after Claude Code updates replace the files.
 */
async function autoReactivate(): Promise<void> {
    const savedVersion = globalState.get<string>(STATE_VERSION_KEY);
    const savedMode = getSavedMode();
    const hasModeKey = globalState.get<string>(STATE_MODE_KEY) !== undefined;

    // ── First install (no version ever saved) ─────────────────────
    if (!savedVersion) {
        const extensions = await findClaudeExtensions();

        // Upgrade from old version that didn't save version:
        // detect mode from existing files to preserve user's choice
        if (extensions.length > 0) {
            const detectedMode = await detectModeFromFiles(extensions);
            if (detectedMode !== 'inactive') {
                await saveMode(detectedMode);
                await saveVersion();
                // Re-inject with latest code
                const action = MODE_ACTIONS[detectedMode];
                if (action && await silentInject(extensions, action, getFontOptions())) {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
                return;
            }
        }

        // User had explicitly deactivated in old version
        if (hasModeKey && savedMode === 'inactive') {
            await saveVersion();
            return;
        }

        // True first install — auto-activate
        await saveMode('active');
        await saveVersion();
        if (extensions.length === 0) return;

        if (await silentInject(extensions, addRtl, getFontOptions())) {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
        return;
    }

    // ── Version upgrade ───────────────────────────────────────────
    if (savedVersion !== currentVersion) {
        await saveVersion();
        // Re-inject to apply updated code, respecting saved mode
        if (savedMode === 'inactive') return;

        const extensions = await findClaudeExtensions();
        if (extensions.length === 0) return;

        const action = MODE_ACTIONS[savedMode];
        if (action && await silentInject(extensions, action, getFontOptions())) {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
        return;
    }

    // ── Same version — only re-inject if Claude Code overwrote files ─
    if (savedMode === 'inactive') return;

    const extensions = await findClaudeExtensions();
    if (extensions.length === 0) return;

    const statuses = await getStatus(extensions);
    const needsReinjection = statuses.some(s => s.mode !== savedMode);
    if (!needsReinjection) return;

    const action = MODE_ACTIONS[savedMode];
    if (action && await silentInject(extensions, action, getFontOptions())) {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
}

async function handleFontSettingChange(): Promise<void> {
    const savedMode = getSavedMode();
    if (savedMode === 'inactive') return;

    const extensions = await findClaudeExtensions();
    if (extensions.length === 0) return;

    const action = MODE_ACTIONS[savedMode];
    if (action && await silentInject(extensions, action, getFontOptions())) {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
}

export function activate(context: vscode.ExtensionContext): void {
    globalState = context.globalState;
    currentVersion = context.extension.packageJSON.version ?? '0.0.0';

    const statusBar = createStatusBarItem();
    context.subscriptions.push(statusBar);

    context.subscriptions.push(
        vscode.commands.registerCommand('claude-rtl.add', () => handleMode('Activating RTL support', 'active', addRtl)),
        vscode.commands.registerCommand('claude-rtl.addAlways', () => handleMode('Activating RTL Always mode', 'always', addRtlAlways)),
        vscode.commands.registerCommand('claude-rtl.addAuto', () => handleMode('Activating RTL Auto mode', 'auto', addRtlAuto)),
        vscode.commands.registerCommand('claude-rtl.fixBidi', handleFixBidi),
        vscode.commands.registerCommand('claude-rtl.remove', handleRemove),
        vscode.commands.registerCommand('claude-rtl.status', handleStatus),
        vscode.commands.registerCommand('claude-rtl.showMenu', handleShowMenu),
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('claude-rtl.textFont') || e.affectsConfiguration('claude-rtl.codeFont')) {
                handleFontSettingChange().catch(err => console.error('RTL font update failed:', err));
            }
        }),
    );

    autoReactivate().catch(err => console.error('RTL auto-reactivation failed:', err));
    updateStatusBar().catch(err => console.error('RTL status bar update failed:', err));
}

export function deactivate(): void {
    disposeStatusBar();
    outputChannel?.dispose();
}
