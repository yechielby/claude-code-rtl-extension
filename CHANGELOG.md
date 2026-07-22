# Changelog

## Unreleased

- **New: Force LTR (Always) mode** (`Claude RTL: Force LTR (Always)`) — pins the whole chat (messages, input box, question/permission dialogs, Plan Preview) to left-to-right, even when the conversation contains Hebrew, Arabic, or Persian text. The direction choice is now symmetric: users who want RTL pick an RTL mode, users who prefer a stable LTR layout while chatting in an RTL language pick LTR Always. Shown in the status bar as `LTR: Always` and available from the status-bar menu; survives Claude Code updates via auto-reactivate like the other modes.

## v0.4.2

- **Fix file corruption with multiple IDE windows open** — Each open IDE window runs its own extension host, and they all patch the *same* Claude Code files on disk. Their backup/read/write cycles could interleave and truncate a file — in one report `webview/index.js` shrank from 4.8 MB to ~1 MB, which left the Claude panel completely blank. Injection is now:
  - **Serialized** with a per-extension-directory lock file, so only one window patches at a time (stale locks are auto-broken; the lock never hangs the extension).
  - **Atomic** — files are written to a temp path and renamed into place, so a reader never sees a half-written file.
  - **Guarded** — since injection only adds content, a result smaller than the pristine backup is rejected instead of written, preventing truncation from being persisted.
- Added a concurrency regression test (`npm test`) that patches one extension from 8 simulated windows at once and asserts no truncation, no stacked injections, pristine backups, and clean removal.

## v0.4.1

- **Fix Antigravity detection** — Antigravity renamed its data directory from `.antigravity` to `.antigravity-ide` in a recent release, so the extension could no longer find Claude Code's webview files and RTL stopped working. The finder now searches `.antigravity-ide` (and its server variant) first, falling back to the old `.antigravity` path for older installs.

## v0.4.0

- **Custom font settings** — Two new VS Code settings let you choose the fonts Claude Code uses:
  - `claude-code-rtl.textFont` — font family for messages and the input box (e.g. `Vazirmatn`, `Tahoma`)
  - `claude-code-rtl.codeFont` — font family for code blocks and diff editor (e.g. `JetBrains Mono`, `Fira Code`)
  - Leave a setting blank to keep Claude Code's default font. Settings apply across Chat and Plan Preview.
- **Kiro IDE support** — The extension now detects and supports Kiro alongside VS Code, Cursor, and Antigravity.

## v0.3.9

- **Plan Preview RTL support** — Claude Code's new Plan Mode tab (separate editor tab for plans) now gets full RTL support. In Auto mode, the plan content is automatically detected and switched to RTL when it contains Hebrew, Arabic, or Persian text. In Active mode, a ⇄ toggle button appears. In Always mode, the plan is always RTL. Code blocks within plans stay LTR.

## v0.3.8

- **Smart Permission RTL (Auto mode)** — In Auto mode, permission requests and follow-up questions now detect RTL direction per element. Questions and options in Hebrew, Arabic, or Persian flow right-to-left; English ones stay left-to-right.
- **Auto mode recommended** — Auto mode is now the recommended mode for the best mixed-language experience, including smart permission dialogs.

## v0.3.7

- **Antigravity IDE support** — The extension now detects and supports Antigravity alongside VS Code and Cursor.

## v0.3.6

- **Smart input direction** — The input field now detects text direction on the fly based on the first character you type. Start with a Hebrew, Arabic, or Persian letter and it flows RTL; start with English and it stays LTR. The only exception is in **Active** mode with the ⇄ button toggled on — in this case, the input is always RTL.
- **Fallback button placement** — When the chat header isn't rendered yet (e.g. resuming an active session on startup), the ⇄ toggle button now appears above the input area so you're never left without it.
- **Safer auto-reactivate** — Version tracking ensures RTL is cleanly re-injected after a Claude Code update instead of stacking on stale CSS.

## v0.3.5

- **Auto RTL mode** — An intelligent mode that auto-detects Hebrew, Arabic, and Persian text per chat bubble using a MutationObserver. Only bubbles containing RTL text get right-to-left direction — English-only bubbles stay LTR. No manual toggling needed.

## v0.3.0

- **Always RTL mode** — A new mode that permanently enables RTL without needing the toggle button. CSS is injected directly without class dependency, ensuring RTL is always active. You can switch between modes via the status bar menu or command palette.
- **Auto-reactivate** — RTL is automatically restored when Claude Code updates replace its files. No need to manually re-activate.
- **Auto-activate on install** — RTL activates automatically on first install.

## v0.2.0

- **Fix BiDi command** — Solves the reversed text issue where Hebrew/Arabic/Persian words appear mirrored (e.g. "םולש" instead of "שלום"). This happens because Claude Code injects a `* { direction: ltr; unicode-bidi: bidi-override; }` rule that forces all text to LTR. The new **Fix BiDi** command activates RTL and removes this problematic rule automatically.
