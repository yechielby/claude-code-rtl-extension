import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as vscode from 'vscode';
import { ClaudeExtensionInfo } from './types.js';

/**
 * Detect whether we are running in VS Code, Cursor, Antigravity, or Kiro.
 */
function detectIde(): 'vscode' | 'cursor' | 'antigravity' | 'kiro' {
    const appName = vscode.env.appName.toLowerCase();
    if (appName.includes('antigravity')) return 'antigravity';
    if (appName.includes('cursor')) return 'cursor';
    if (appName.includes('kiro')) return 'kiro';
    return 'vscode';
}

/**
 * Detect if running inside Windows Subsystem for Linux.
 */
async function isWsl(): Promise<boolean> {
    try {
        const content = await fs.readFile('/proc/version', 'utf-8');
        return content.toLowerCase().includes('microsoft');
    } catch {
        return false;
    }
}

/**
 * Get Windows user home directories accessible from WSL (e.g. /mnt/c/Users/John).
 */
async function getWslWindowsHomes(): Promise<string[]> {
    const homes: string[] = [];
    const skipUsers = new Set(['public', 'default', 'default user', 'all users']);

    for (const driveLetter of ['c', 'd']) {
        const usersDir = `/mnt/${driveLetter}/Users`;
        try {
            const entries = await fs.readdir(usersDir);
            for (const entry of entries) {
                if (skipUsers.has(entry.toLowerCase())) continue;
                const userHome = path.join(usersDir, entry);
                try {
                    const stat = await fs.stat(userHome);
                    if (stat.isDirectory()) {
                        homes.push(userHome);
                    }
                } catch { /* skip inaccessible */ }
            }
        } catch { /* directory doesn't exist or no permission */ }
    }

    return homes;
}

/**
 * Get Linux home directories inside WSL distros, accessible from Windows via \\wsl$\.
 */
async function getWslLinuxHomes(): Promise<string[]> {
    const homes: string[] = [];
    const skipUsers = new Set(['root']);

    for (const wslRoot of ['\\\\wsl$', '\\\\wsl.localhost']) {
        let distros: string[];
        try {
            distros = await fs.readdir(wslRoot);
        } catch { continue; }

        for (const distro of distros) {
            const homeDir = path.join(wslRoot, distro, 'home');
            try {
                const users = await fs.readdir(homeDir);
                for (const user of users) {
                    if (skipUsers.has(user)) continue;
                    const userHome = path.join(homeDir, user);
                    try {
                        const stat = await fs.stat(userHome);
                        if (stat.isDirectory()) {
                            homes.push(userHome);
                        }
                    } catch { /* skip */ }
                }
            } catch { /* skip */ }
        }
    }

    return homes;
}

/**
 * Build the list of directories to search for Claude Code extensions.
 */
async function getSearchDirectories(ide: 'vscode' | 'cursor' | 'antigravity' | 'kiro'): Promise<string[]> {
    const platform = process.platform;
    const dirs: string[] = [];

    const ideDirMap: Record<string, { local: string; server: string }> = {
        vscode: { local: '.vscode', server: '.vscode-server' },
        cursor: { local: '.cursor', server: '.cursor-server' },
        antigravity: { local: '.antigravity', server: '.antigravity-server' },
        kiro: { local: '.kiro', server: '.kiro-server' },
    };

    const addExtDirs = (home: string, ide: 'vscode' | 'cursor' | 'antigravity' | 'kiro') => {
        const { local, server } = ideDirMap[ide];
        dirs.push(path.join(home, local, 'extensions'));
        dirs.push(path.join(home, server, 'extensions'));
    };

    if (platform === 'win32') {
        const userprofile = process.env.USERPROFILE;
        if (userprofile) {
            addExtDirs(userprofile, ide);
        }

        // Also search inside WSL distros
        const wslHomes = await getWslLinuxHomes();
        for (const wslHome of wslHomes) {
            const serverDir = ideDirMap[ide].server;
            dirs.push(path.join(wslHome, serverDir, 'extensions'));
        }
    } else if (platform === 'darwin') {
        addExtDirs(os.homedir(), ide);
    } else if (platform === 'linux') {
        const home = os.homedir();
        addExtDirs(home, ide);

        // Also search other users' home directories
        try {
            const users = await fs.readdir('/home');
            for (const user of users) {
                const userHome = path.join('/home', user);
                if (userHome === home) continue;
                try {
                    const stat = await fs.stat(userHome);
                    if (stat.isDirectory()) {
                        addExtDirs(userHome, ide);
                    }
                } catch { /* skip */ }
            }
        } catch { /* /home not readable */ }

        // WSL: also search Windows-side
        if (await isWsl()) {
            const winHomes = await getWslWindowsHomes();
            for (const winHome of winHomes) {
                addExtDirs(winHome, ide);
            }
        }
    }

    return dirs;
}

/**
 * Check if a path exists (file or directory).
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
 * Find all installed Claude Code extension directories.
 * Searches platform-specific paths for anthropic.claude-code-* dirs
 * that contain webview/index.css.
 */
export async function findClaudeExtensions(): Promise<ClaudeExtensionInfo[]> {
    const ide = detectIde();
    const searchDirs = await getSearchDirectories(ide);
    const found: ClaudeExtensionInfo[] = [];

    for (const extDir of searchDirs) {
        if (!(await exists(extDir))) continue;

        let entries: string[];
        try {
            entries = await fs.readdir(extDir);
        } catch { continue; }

        const matches = entries
            .filter(name => name.startsWith('anthropic.claude-code-'))
            .sort();

        for (const match of matches) {
            const dir = path.join(extDir, match);
            const cssPath = path.join(dir, 'webview', 'index.css');
            const jsPath = path.join(dir, 'webview', 'index.js');

            if (!(await exists(cssPath))) continue;

            found.push({
                dir,
                cssPath,
                jsPath: (await exists(jsPath)) ? jsPath : null,
                name: match,
            });
        }
    }

    return found;
}
