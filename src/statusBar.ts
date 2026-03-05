import * as vscode from 'vscode';
import { findClaudeExtensions } from './finder.js';
import { getStatus } from './injector.js';

let statusBarItem: vscode.StatusBarItem;

export function createStatusBarItem(): vscode.StatusBarItem {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100,
    );
    statusBarItem.command = 'claude-rtl.showMenu';
    statusBarItem.show();
    return statusBarItem;
}

export async function updateStatusBar(): Promise<void> {
    if (!statusBarItem) return;

    const extensions = await findClaudeExtensions();

    if (extensions.length === 0) {
        statusBarItem.text = '$(globe) RTL: N/A';
        statusBarItem.tooltip = 'No Claude Code extensions found';
        return;
    }

    const statuses = await getStatus(extensions);
    const autoMode = statuses.some(s => s.mode === 'auto');
    const alwaysMode = statuses.some(s => s.mode === 'always');
    const activeMode = statuses.some(s => s.mode === 'active');

    if (autoMode) {
        statusBarItem.text = '$(globe) RTL: Auto';
        statusBarItem.tooltip = 'Claude Code RTL auto-detects Hebrew. Click to manage.';
    } else if (alwaysMode) {
        statusBarItem.text = '$(globe) RTL: Always';
        statusBarItem.tooltip = 'Claude Code RTL is always on. Click to manage.';
    } else if (activeMode) {
        statusBarItem.text = '$(globe) RTL: Active';
        statusBarItem.tooltip = 'Claude Code RTL support is active. Click to manage.';
    } else {
        statusBarItem.text = '$(globe) RTL: Inactive';
        statusBarItem.tooltip = 'Claude Code RTL support is not active. Click to add.';
    }
}

export function disposeStatusBar(): void {
    statusBarItem?.dispose();
}
