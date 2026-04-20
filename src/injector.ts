import * as fs from 'fs/promises';
import { ClaudeExtensionInfo, RtlStatus } from './types.js';
import {
    FontOptions, RTL_JS_CODE,
    RTL_START_MARKER, RTL_END_MARKER,
    JS_START_MARKER, JS_END_MARKER,
    RTL_MODE_ALWAYS_MARKER, RTL_MODE_AUTO_MARKER,
    RTL_AUTO_JS_CODE,
    generateActiveCssRules, generateAlwaysCssRules, generateAutoCssRules,
} from './content.js';

const BIDI_OVERRIDE = '*{direction:ltr;unicode-bidi:bidi-override}';

/**
 * Check if a path exists.
 */
async function exists(p: string): Promise<boolean> {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if RTL CSS markers exist in the file.
 */
export async function isCssInstalled(cssPath: string): Promise<boolean> {
    try {
        const content = await fs.readFile(cssPath, 'utf-8');
        return content.includes(RTL_START_MARKER);
    } catch {
        return false;
    }
}

/**
 * Check if CSS is in "always" mode (no .YBYrtl class dependency).
 */
export async function isAlwaysMode(cssPath: string): Promise<boolean> {
    try {
        const content = await fs.readFile(cssPath, 'utf-8');
        return content.includes(RTL_MODE_ALWAYS_MARKER);
    } catch {
        return false;
    }
}

/**
 * Check if CSS is in "auto" mode (per-element Hebrew detection).
 */
export async function isAutoMode(cssPath: string): Promise<boolean> {
    try {
        const content = await fs.readFile(cssPath, 'utf-8');
        return content.includes(RTL_MODE_AUTO_MARKER);
    } catch {
        return false;
    }
}

/**
 * Check if JS toggle markers exist in the file.
 */
async function isJsInstalled(jsPath: string | null): Promise<boolean> {
    if (!jsPath) return false;
    try {
        const content = await fs.readFile(jsPath, 'utf-8');
        return content.includes(JS_START_MARKER);
    } catch {
        return false;
    }
}

/**
 * Strip a marked block from content string.
 */
function stripBlock(content: string, startMarker: string, endMarker: string): string {
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);
    if (startIdx === -1 || endIdx === -1) return content;

    let actualStart = startIdx;
    const actualEnd = endIdx + endMarker.length;

    // Remove preceding newline if present
    if (actualStart > 0 && content[actualStart - 1] === '\n') {
        actualStart -= 1;
    }

    return content.substring(0, actualStart) + content.substring(actualEnd);
}

// ── Injection helpers ─────────────────────────────────────────────

interface InjectionResult {
    messages: string[];
    changed: boolean;
}

/**
 * Restore a file from backup (or create backup if first time),
 * then append injected content.
 */
async function injectFile(
    filePath: string,
    injectedContent: string,
    label: string,
    messages: string[],
    options?: { fixBidi?: boolean },
): Promise<boolean> {
    try {
        const backupPath = filePath + '.bak';

        if (await exists(backupPath)) {
            await fs.copyFile(backupPath, filePath);
            messages.push(`  ${label}: Restored from backup`);
        } else {
            await fs.copyFile(filePath, backupPath);
            messages.push(`  ${label}: Backup created: ${backupPath}`);
        }

        let content = await fs.readFile(filePath, 'utf-8');

        if (options?.fixBidi && content.includes(BIDI_OVERRIDE)) {
            content = content.replace(BIDI_OVERRIDE, '');
            messages.push(`  ${label}: Removed bidi-override rule`);
        }

        await fs.writeFile(filePath, content + '\n' + injectedContent, 'utf-8');
        return true;
    } catch (e: unknown) {
        const err = e as NodeJS.ErrnoException;
        if (err.code === 'EPERM' || err.code === 'EACCES') {
            messages.push(`  ${label}: Permission denied: ${filePath}`);
            messages.push('       Try running with elevated privileges');
        } else {
            messages.push(`  ${label}: Error: ${err.message}`);
        }
        return false;
    }
}

/**
 * Restore a file from backup and delete the backup.
 * Used when removing JS injection in Always mode.
 */
async function restoreAndDeleteBackup(
    filePath: string,
    label: string,
    messages: string[],
): Promise<boolean> {
    const backupPath = filePath + '.bak';
    if (!(await exists(backupPath))) return false;

    try {
        await fs.copyFile(backupPath, filePath);
        await fs.unlink(backupPath);
        messages.push(`  ${label}: Restored from backup (backup deleted)`);
        return true;
    } catch (e: unknown) {
        messages.push(`  ${label}: Error restoring: ${(e as Error).message}`);
        return false;
    }
}

// ── Status ────────────────────────────────────────────────────────

/**
 * Get RTL status for all found extensions.
 */
export async function getStatus(extensions: ClaudeExtensionInfo[]): Promise<RtlStatus[]> {
    const statuses: RtlStatus[] = [];

    for (const ext of extensions) {
        let cssContent = '';
        try {
            cssContent = await fs.readFile(ext.cssPath, 'utf-8');
        } catch { /* file unreadable — treat as not installed */ }

        const cssInstalled = cssContent.includes(RTL_START_MARKER);
        const autoMode = cssInstalled && cssContent.includes(RTL_MODE_AUTO_MARKER);
        const alwaysMode = cssInstalled && !autoMode && cssContent.includes(RTL_MODE_ALWAYS_MARKER);

        statuses.push({
            extension: ext,
            cssInstalled,
            jsInstalled: await isJsInstalled(ext.jsPath),
            cssBackupExists: await exists(ext.cssPath + '.bak'),
            jsBackupExists: ext.jsPath ? await exists(ext.jsPath + '.bak') : false,
            mode: autoMode ? 'auto' : alwaysMode ? 'always' : cssInstalled ? 'active' : 'inactive',
        });
    }

    return statuses;
}

// ── Injection modes ───────────────────────────────────────────────

/**
 * Add RTL support (Active mode) — CSS with .YBYrtl class + toggle button JS.
 */
export async function addRtl(ext: ClaudeExtensionInfo, fonts?: FontOptions): Promise<InjectionResult> {
    const messages: string[] = [];
    let changed = false;

    if (await injectFile(ext.cssPath, generateActiveCssRules(fonts), 'CSS', messages)) {
        messages.push(`  CSS: RTL support added to ${ext.name}`);
        changed = true;
    }

    if (!ext.jsPath) {
        messages.push('  JS:  index.js not found, skipping button injection');
    } else if (await injectFile(ext.jsPath, RTL_JS_CODE, 'JS', messages)) {
        messages.push(`  JS:  Toggle button added to ${ext.name}`);
        changed = true;
    }

    return { messages, changed };
}

/**
 * Add RTL "Always" mode — CSS without .YBYrtl class, no JS button.
 */
export async function addRtlAlways(ext: ClaudeExtensionInfo, fonts?: FontOptions): Promise<InjectionResult> {
    const messages: string[] = [];
    let changed = false;

    if (await injectFile(ext.cssPath, generateAlwaysCssRules(fonts), 'CSS', messages, { fixBidi: true })) {
        messages.push(`  CSS: RTL Always support added to ${ext.name}`);
        changed = true;
    }

    // Remove JS button if installed
    if (ext.jsPath && await isJsInstalled(ext.jsPath)) {
        if (await restoreAndDeleteBackup(ext.jsPath, 'JS', messages)) {
            changed = true;
        }
    } else {
        messages.push(`  JS:  No button to remove (Always mode — no JS needed)`);
    }

    return { messages, changed };
}

/**
 * Add RTL "Auto" mode — per-element Hebrew detection via JS MutationObserver.
 */
export async function addRtlAuto(ext: ClaudeExtensionInfo, fonts?: FontOptions): Promise<InjectionResult> {
    const messages: string[] = [];
    let changed = false;

    if (await injectFile(ext.cssPath, generateAutoCssRules(fonts), 'CSS', messages, { fixBidi: true })) {
        messages.push(`  CSS: RTL Auto support added to ${ext.name}`);
        changed = true;
    }

    if (!ext.jsPath) {
        messages.push('  JS:  index.js not found, skipping auto-detection injection');
    } else if (await injectFile(ext.jsPath, RTL_AUTO_JS_CODE, 'JS', messages)) {
        messages.push(`  JS:  Auto-detection script added to ${ext.name}`);
        changed = true;
    }

    return { messages, changed };
}

/**
 * Add RTL support and fix BiDi issue by removing the bidi-override rule.
 * Preserves the current mode.
 */
export async function fixBidi(ext: ClaudeExtensionInfo, fonts?: FontOptions): Promise<InjectionResult> {
    const currentlyAuto = await isAutoMode(ext.cssPath);
    const currentlyAlways = !currentlyAuto && await isAlwaysMode(ext.cssPath);
    const result = currentlyAuto ? await addRtlAuto(ext, fonts) : currentlyAlways ? await addRtlAlways(ext, fonts) : await addRtl(ext, fonts);

    // After injection, remove the bidi-override rule if still present
    try {
        const content = await fs.readFile(ext.cssPath, 'utf-8');
        if (content.includes(BIDI_OVERRIDE)) {
            const fixed = content.replace(BIDI_OVERRIDE, '');
            await fs.writeFile(ext.cssPath, fixed, 'utf-8');
            result.messages.push(`  CSS: Removed bidi-override rule`);
        }
    } catch (e: unknown) {
        result.messages.push(`  CSS: Error fixing BiDi: ${(e as Error).message}`);
    }

    return result;
}

// ── Removal ───────────────────────────────────────────────────────

/**
 * Remove an injected block from a file, trying backup restore first,
 * falling back to manual marker-based removal.
 */
async function removeInjected(
    filePath: string,
    isInstalled: boolean,
    startMarker: string,
    endMarker: string,
    label: string,
    extName: string,
    messages: string[],
): Promise<boolean> {
    if (!isInstalled) {
        messages.push(`  ${label}: RTL not installed in ${extName}`);
        return false;
    }

    // Try backup restore first
    if (await restoreAndDeleteBackup(filePath, label, messages)) {
        return true;
    }

    // Fallback: manual marker removal
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const cleaned = stripBlock(content, startMarker, endMarker);
        await fs.writeFile(filePath, cleaned, 'utf-8');
        messages.push(`  ${label}: RTL removed from ${extName}`);
        return true;
    } catch (e: unknown) {
        messages.push(`  ${label}: Error removing RTL: ${(e as Error).message}`);
        return false;
    }
}

/**
 * Remove RTL support from a single Claude Code extension.
 */
export async function removeRtl(ext: ClaudeExtensionInfo): Promise<InjectionResult> {
    const messages: string[] = [];
    let changed = false;

    if (await removeInjected(ext.cssPath, await isCssInstalled(ext.cssPath), RTL_START_MARKER, RTL_END_MARKER, 'CSS', ext.name, messages)) {
        changed = true;
    }

    const jsInstalled = ext.jsPath ? await isJsInstalled(ext.jsPath) : false;
    if (!ext.jsPath || !jsInstalled) {
        messages.push(`  JS:  Button not installed in ${ext.name}`);
    } else if (await removeInjected(ext.jsPath, jsInstalled, JS_START_MARKER, JS_END_MARKER, 'JS', ext.name, messages)) {
        changed = true;
    }

    return { messages, changed };
}
