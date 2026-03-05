/** Represents a discovered Claude Code extension installation */
export interface ClaudeExtensionInfo {
    /** Full path to the extension directory */
    dir: string;
    /** Full path to webview/index.css */
    cssPath: string;
    /** Full path to webview/index.js (may not exist) */
    jsPath: string | null;
    /** Directory name, e.g. "anthropic.claude-code-2.1.49-win32-x64" */
    name: string;
}

/** RTL operating mode */
export type RtlMode = 'active' | 'always' | 'auto' | 'inactive';

/** RTL installation status for a single extension */
export interface RtlStatus {
    extension: ClaudeExtensionInfo;
    cssInstalled: boolean;
    jsInstalled: boolean;
    cssBackupExists: boolean;
    jsBackupExists: boolean;
    mode: RtlMode;
}
