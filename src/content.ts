/** Marker at the beginning of injected CSS block */
export const RTL_START_MARKER =
    '/* RTL Text Support for Claude Code VS Code / Cursor / Antigravity Extension - Added by script */';

/** Marker at the end of injected CSS block */
export const RTL_END_MARKER =
    '/* End RTL Text Support for Claude Code VS Code / Cursor / Antigravity Extension */';

/** Marker at the beginning of injected JS block */
export const JS_START_MARKER = '/* RTL Toggle Button - Added by script */';

/** Marker at the end of injected JS block */
export const JS_END_MARKER = '/* End RTL Toggle Button */';

/** Marker to identify RTL mode inside injected CSS */
export const RTL_MODE_ACTIVE_MARKER = '/* RTL-MODE: active */';
export const RTL_MODE_ALWAYS_MARKER = '/* RTL-MODE: always */';
export const RTL_MODE_AUTO_MARKER = '/* RTL-MODE: auto */';
export const RTL_MODE_LTR_MARKER = '/* RTL-MODE: ltr */';

// ── CSS Building Blocks ───────────────────────────────────────────

const P = '.YBYrtl '; // selector prefix for scoped modes (Active/Auto)

const BUTTON_STYLES = `
/* ==========================================
   Toggle button - always visible
   ========================================== */

#yby-rtl-btn {
    font-size: 14px;
    font-weight: bold;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    color: var(--vscode-foreground);
    opacity: 0.5;
    transition: opacity 0.2s, background 0.2s;
    flex-shrink: 0;
}

#yby-rtl-btn:hover {
    opacity: 1;
}

#yby-rtl-btn.yby-active {
    opacity: 1;
    background: var(--vscode-button-background, rgba(128, 128, 128, 0.3));
}

/* Fallback wrapper when header is absent (active session on startup) */
#yby-rtl-btn-wrap {
    display: flex;
    justify-content: flex-end;
    padding: 0 8px;
}
`;

/** RTL content rules — prefix is prepended to each selector */
function rtlContentRules(p: string): string {
    return `
/* ==========================================
   RTL - Hebrew/Arabic content (active when .YBYrtl is on #root)
   ========================================== */

/* Messages container */
${p}[class*="messagesContainer_"] {
    direction: rtl;
}

/* User messages */
${p}[class*="userMessage_"],
${p}[class*="userMessageContainer_"] {
    direction: rtl;
    unicode-bidi: plaintext;
    text-align: right !important;
    align-items: flex-end !important;
    margin-left: auto !important;
    margin-right: 0 !important;
}

${p}[class*="content_"][class*="xGDvVg"],
${p}[class*="content_"] > span {
    unicode-bidi: plaintext;
}

/* Claude's markdown responses (excluding thinking block) */
${p}[class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) {
    direction: rtl;
    unicode-bidi: plaintext;
}

${p}[class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) > :is(p, ul, ol, h1, h2, h3, h4, blockquote),
${p}[class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) > :is(ul, ol) li {
    text-align: right;
}

${p}[class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) a {
    unicode-bidi: plaintext;
}

/* Question/answer blocks */
${p}[class*="questionBlock_"],
${p}[class*="questionHeader_"],
${p}[class*="answerText_"],
${p}[class*="optionText_"],
${p}[class*="optionContent_"] {
    direction: rtl;
    unicode-bidi: plaintext;
}

/* Prompt input — always auto-detect direction by first character */
[class*="messageInputContainer_"] > * {
    unicode-bidi: plaintext;
    text-align: start;
}
${p ? `
/* Force RTL on input when toggle is active */
${p}[class*="messageInputContainer_"] > * {
    direction: rtl;
    unicode-bidi: normal;
}
` : ''}`;
}

/** LTR override rules — prefix is prepended to each selector */
function ltrOverrideRules(p: string): string {
    return `
/* ==========================================
   LTR overrides - Code, Tools, UI
   ========================================== */

${p}[class*="slashCommandMessage_"],
${p}[class*="slashCommandResultMessage_"],
${p}[class*="header_"][class*="aqhumA"],
${p}[class*="sessionsButtonText_"],
${p}[class*="dotSuccess_"],
${p}[class*="dotFailure_"],
${p}[class*="dotProgress_"],
${p}[class*="dotWarning_"],
${p}[class*="progressContent_"],
${p}[class*="inputContainer_"][class*="cKsPxg"],
${p}[class*="inputWrapper_"],
${p}[class*="iconButton_"],
${p}[class*="copyButton_"],
${p}[class*="actionButton_"],
${p}[class*="selectionAttachment_"],
${p}[class*="attachmentInfo_"],
${p}[class*="attachmentText_"],
${p}[class*="errorMessage_"],
${p}[class*="secondaryLine_"],
${p}[class*="todoListContainer_"],
${p}[class*="todoList_"],
${p}[class*="todoItem_"],
${p}[class*="auth_"],
${p}[class*="authUrl"] {
    direction: ltr !important;
}

/* Code blocks - LTR + alignment */
${p}pre,
${p}code,
${p}[class*="codeBlockWrapper_"] {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left !important;
}

/* Tool containers - LTR + alignment */
${p}[class*="toolUse_"],
${p}[class*="toolSummary_"],
${p}[class*="toolBody_"],
${p}[class*="toolBodyGrid_"],
${p}[class*="toolBodyRow_"],
${p}[class*="toolBodyRowContent_"],
${p}[class*="toolBodyRowLabel_"],
${p}[class*="toolResult_"],
${p}[class*="toolNameText_"],
${p}[class*="toolReference_"] {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left !important;
}

/* Thinking block - LTR + alignment */
${p}[class*="thinking_"],
${p}[class*="thinkingContent_"],
${p}[class*="thinkingContainer_"],
${p}[class*="thinkingHeader_"],
${p}[class*="spinnerRow_"],
${p}[class*="timelineMessage_"]:has([class*="thinking_"]) {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left !important;
}

${p}[class*="thinkingContent_"] [class*="root_"] :is(ul, ol, li) {
    direction: ltr !important;
    text-align: left !important;
}
`;
}

/** Force-LTR content rules — unprefixed (LTR Always mode).
 *  Pins every content surface to left-to-right, overriding the webview's
 *  auto direction detection, so Hebrew/Arabic text renders in an LTR layout. */
const LTR_CONTENT_RULES = `
/* ==========================================
   LTR - Force left-to-right always
   ========================================== */

/* Messages container — anchor all bubbles to the left edge */
[class*="messagesContainer_"] {
    direction: ltr;
    align-items: flex-start !important;
}

/* User messages — pinned to the left, mirroring how RTL Always pins right */
[class*="userMessage_"],
[class*="userMessageContainer_"] {
    direction: ltr;
    unicode-bidi: isolate;
    text-align: left !important;
    align-items: flex-start !important;
    align-self: flex-start !important;
    margin-left: 0 !important;
    margin-right: auto !important;
}

[class*="content_"][class*="xGDvVg"],
[class*="content_"] > span {
    unicode-bidi: isolate;
}

/* Claude's markdown responses */
[class*="root_"] {
    direction: ltr;
    unicode-bidi: isolate;
}

[class*="root_"] > :is(p, ul, ol, h1, h2, h3, h4, blockquote),
[class*="root_"] > :is(ul, ol) li {
    text-align: left;
}

/* Question/answer blocks */
[class*="questionBlock_"],
[class*="questionHeader_"],
[class*="answerText_"],
[class*="optionText_"],
[class*="optionContent_"],
[class*="optionLabel_"],
[class*="optionDescription_"],
[class*="permissionsContainer_"],
[class*="permissionRequestContent_"] {
    direction: ltr;
    unicode-bidi: isolate;
    text-align: left;
}

/* Prompt input — force LTR instead of auto-detecting by first character */
[class*="messageInputContainer_"] > *,
[class*="otherInput_"] [contenteditable] {
    direction: ltr;
    unicode-bidi: isolate;
    text-align: left;
}
`;

/** Auto mode RTL rules — .YBYrtl is on the bubble itself, not on #root.
 *  Uses descendant selectors from the bubble, plus self-matching for the bubble element. */
const AUTO_RTL_RULES = `
/* ==========================================
   RTL - Auto mode (per-bubble detection)
   ========================================== */

/* Self-matching: bubble element itself */
.YBYrtl[class*="userMessage_"],
.YBYrtl[class*="userMessageContainer_"] {
    direction: rtl;
    unicode-bidi: plaintext;
    text-align: right !important;
    align-items: flex-end !important;
    margin-left: auto !important;
    margin-right: 0 !important;
}

/* Descendant: content inside RTL bubbles */
.YBYrtl [class*="content_"][class*="xGDvVg"],
.YBYrtl [class*="content_"] > span {
    unicode-bidi: plaintext;
}

/* Claude's markdown responses (excluding thinking block) */
.YBYrtl [class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) {
    direction: rtl;
    unicode-bidi: plaintext;
}

.YBYrtl [class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) > :is(p, ul, ol, h1, h2, h3, h4, blockquote),
.YBYrtl [class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) > :is(ul, ol) li {
    text-align: right;
}

.YBYrtl [class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) a {
    unicode-bidi: plaintext;
}

/* Prompt input container — no .YBYrtl ancestor in Auto mode, use #root
   for specificity to override *{unicode-bidi:bidi-override} */
#root [class*="messageInputContainer_"] > * {
    unicode-bidi: plaintext;
    text-align: start;
}

/* Question/answer blocks */
.YBYrtl [class*="questionBlock_"],
.YBYrtl [class*="questionHeader_"],
.YBYrtl [class*="answerText_"],
.YBYrtl [class*="optionText_"],
.YBYrtl [class*="optionContent_"] {
    direction: rtl;
    unicode-bidi: plaintext;
}

`;

// ── Permission RTL (shared across all modes) ─────────────────────

/** CSS for JS-driven permission RTL — no prefix needed, classes added by JS */
const PERMISSION_RTL_CSS = `
/* ==========================================
   Permission requests — dynamic RTL (JS-driven)
   ========================================== */

/* Container-level RTL when question contains RTL text */
.YBYperm-rtl[class*="permissionsContainer_"],
.YBYperm-rtl [class*="permissionRequestContent_"] {
    direction: rtl;
}

/* Question is LTR but individual option text has RTL */
.YBYopt-rtl[class*="optionLabel_"],
.YBYopt-rtl[class*="optionDescription_"] {
    direction: rtl;
    text-align: right;
}

/* Permission elements that must stay LTR */
.YBYperm-rtl [class*="buttonContainer_"],
.YBYperm-rtl [class*="keyboardHints_"] {
    direction: ltr !important;
}

/* Free-text input — auto-detect direction */
[class*="otherInput_"] [contenteditable] {
    unicode-bidi: plaintext;
    text-align: start;
}
`;

/** JS for dynamic permission RTL detection — shared across all modes */
const PERMISSION_RTL_JS = `
(function() {
    var PERM_RTL_RE = /[\\u0590-\\u05FF\\u0600-\\u06FF\\u0750-\\u077F\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/;
    var PERM_SEL = '[class*="permissionsContainer_"]';

    var LABEL_SEL = '[class*="optionLabel_"],[class*="optionDescription_"]';

    function handleContainer(container) {
        var question = container.querySelector('[class*="questionTextLarge_"]');
        if (question && PERM_RTL_RE.test(question.textContent || '')) {
            container.classList.add('YBYperm-rtl');
            return;
        }
        tagLabels(container);
    }

    function tagLabels(root) {
        var els = root.querySelectorAll(LABEL_SEL);
        for (var k = 0; k < els.length; k++) {
            if (PERM_RTL_RE.test(els[k].textContent || '')) {
                els[k].classList.add('YBYopt-rtl');
            }
        }
    }

    function scanPermissions() {
        var containers = document.querySelectorAll(PERM_SEL);
        for (var i = 0; i < containers.length; i++) {
            handleContainer(containers[i]);
        }
    }

    var permObs = new MutationObserver(function(muts) {
        for (var i = 0; i < muts.length; i++) {
            var added = muts[i].addedNodes;
            for (var j = 0; j < added.length; j++) {
                var nd = added[j];
                if (nd.nodeType !== 1) continue;
                if (nd.matches && nd.matches(PERM_SEL)) { handleContainer(nd); continue; }
                /* Re-rendered option — re-tag labels only if question was LTR */
                var parent = nd.closest ? nd.closest(PERM_SEL) : null;
                if (parent && !parent.classList.contains('YBYperm-rtl')) { tagLabels(parent); continue; }
                if (nd.querySelectorAll) {
                    var nested = nd.querySelectorAll(PERM_SEL);
                    for (var k = 0; k < nested.length; k++) handleContainer(nested[k]);
                }
            }
        }
    });

    if (document.body) {
        scanPermissions();
        permObs.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            scanPermissions();
            permObs.observe(document.body, { childList: true, subtree: true });
        });
    }
})();
`;

// ── Font Options ──────────────────────────────────────────────────

export interface FontOptions {
    textFont: string;
    codeFont: string;
}

export const NO_FONTS: FontOptions = { textFont: '', codeFont: '' };

/** Generate font CSS for chat — applied universally (independent of RTL state). */
function generateFontCss(fonts: FontOptions): string {
    const parts: string[] = [];

    if (fonts.textFont) {
        parts.push(`
/* Custom text font */
[class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) > :is(p, ul, ol, h1, h2, h3, h4, blockquote),
[class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) > :is(ul, ol) li,
[class*="userMessage_"],
[class*="content_"],
[class*="messageInputContainer_"] [contenteditable],
[class*="mentionMirror_"] {
    font-family: "${fonts.textFont}", sans-serif !important;
}`);
    }

    if (fonts.codeFont) {
        parts.push(`
/* Custom code font */
pre,
code,
[class*="codeBlockWrapper_"] {
    font-family: "${fonts.codeFont}", monospace !important;
}

/* Diff editor — Monaco sets font-family as inline style, needs !important */
[class*="diffEditorWrapper_"] .view-lines,
[class*="diffEditorWrapper_"] .view-overlays,
[class*="diffEditorWrapper_"] .margin-view-overlays,
[class*="diffEditorWrapper_"] .cursor,
[class*="diffEditorWrapper_"] .inputarea {
    font-family: "${fonts.codeFont}", monospace !important;
}`);
    }

    return parts.join('\n');
}

/** Generate font CSS for Plan Preview — scoped to #content (independent of RTL state). */
function generatePlanFontCss(fonts: FontOptions): string {
    const parts: string[] = [];

    if (fonts.textFont) {
        parts.push(`
#content {
    font-family: "${fonts.textFont}", sans-serif !important;
}`);
    }

    if (fonts.codeFont) {
        parts.push(`
#content pre,
#content code {
    font-family: "${fonts.codeFont}", monospace !important;
}`);
    }

    return parts.join('\n');
}

// ── CSS Assembly ──────────────────────────────────────────────────

function assembleCss(modeMarker: string, parts: string[]): string {
    return `
${RTL_START_MARKER}
${modeMarker}
${parts.join('\n')}
${RTL_END_MARKER}
`;
}

/** Active mode — .YBYrtl prefix + toggle button. Fonts are unscoped (orthogonal to RTL state). */
export function generateActiveCssRules(fonts: FontOptions = NO_FONTS): string {
    return assembleCss(RTL_MODE_ACTIVE_MARKER, [
        BUTTON_STYLES,
        rtlContentRules(P),
        ltrOverrideRules(P),
        generateFontCss(fonts),
    ]);
}

/** Always mode — no prefix, no button */
export function generateAlwaysCssRules(fonts: FontOptions = NO_FONTS): string {
    return assembleCss(RTL_MODE_ALWAYS_MARKER, [
        rtlContentRules(''),
        ltrOverrideRules(''),
        generateFontCss(fonts),
    ]);
}

/** Auto mode — dedicated RTL rules (no descendant/self conflicts) + LTR overrides.
 *  Fonts are unscoped so they apply to all bubbles (including English-only) and the diff editor. */
export function generateAutoCssRules(fonts: FontOptions = NO_FONTS): string {
    return assembleCss(RTL_MODE_AUTO_MARKER, [
        AUTO_RTL_RULES,
        ltrOverrideRules(P),
        PERMISSION_RTL_CSS,
        generateFontCss(fonts),
    ]);
}

/** LTR Always mode — force left-to-right everywhere, no prefix, no button */
export function generateLtrCssRules(fonts: FontOptions = NO_FONTS): string {
    return assembleCss(RTL_MODE_LTR_MARKER, [
        LTR_CONTENT_RULES,
        ltrOverrideRules(''),
        generateFontCss(fonts),
    ]);
}

// ── JavaScript ────────────────────────────────────────────────────

/** RTL JS toggle button code */
export const RTL_JS_CODE = `
/* RTL Toggle Button - Added by script */
(function() {
    var BTN_ID = 'yby-rtl-btn';
    var WRAP_ID = 'yby-rtl-btn-wrap';
    var ROOT_CLASS = 'YBYrtl';

    function mkBtn() {
        var btn = document.createElement('button');
        btn.id = BTN_ID;
        btn.textContent = '\\u21C4';
        btn.title = 'Toggle RTL mode';

        btn.addEventListener('click', function() {
            var root = document.getElementById('root');
            if (!root) return;
            var isActive = root.classList.toggle(ROOT_CLASS);
            btn.classList.toggle('yby-active', isActive);
        });

        return btn;
    }

    function tryInsertButton() {
        var header = document.querySelector('[class*="header_"]');
        var existing = document.getElementById(BTN_ID);

        // Already placed in the header — nothing to do
        if (existing && header && header.contains(existing)) return;

        // Header appeared but button is in fallback position — migrate to header
        if (header && existing) {
            var oldWrap = document.getElementById(WRAP_ID);
            if (oldWrap) oldWrap.remove(); else existing.remove();
            header.appendChild(mkBtn());
            return;
        }

        // Header exists, no button yet — place in header
        if (header && !existing) {
            header.appendChild(mkBtn());
            return;
        }

        // No header, button already in fallback — keep it
        if (existing) return;

        // No header, no button — fallback: active session without header
        // Place above the input prompt when messages are visible
        var input = document.querySelector('[class*="inputContainer_"]');
        if (!input || !input.parentNode) return;
        if (!document.querySelector('[class*="messagesContainer_"]')) return;

        var wrap = document.createElement('div');
        wrap.id = WRAP_ID;
        wrap.appendChild(mkBtn());
        input.parentNode.insertBefore(wrap, input);
    }

    // Wait for React to render
    var observer = new MutationObserver(function() {
        tryInsertButton();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    if (document.readyState !== 'loading') {
        tryInsertButton();
    } else {
        document.addEventListener('DOMContentLoaded', tryInsertButton);
    }
})();
/* End RTL Toggle Button */
`;

// ── Plan Preview ──────────────────────────────────────────────────

/** Markers for Plan Preview CSS injection inside extension.js */
export const PLAN_CSS_START_MARKER = '/* RTL Plan Preview Start */';
export const PLAN_CSS_END_MARKER = '/* RTL Plan Preview End */';
export const PLAN_JS_START_MARKER = '/* RTL Plan Preview JS Start */';
export const PLAN_JS_END_MARKER = '/* RTL Plan Preview JS End */';

/** Plan Preview button CSS — shared across Active/Auto modes */
const PLAN_BUTTON_CSS = `
#yby-plan-rtl-btn {
    position: fixed;
    top: 8px;
    right: 8px;
    font-size: 14px;
    font-weight: bold;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    opacity: 0.7;
    z-index: 200;
    transition: opacity 0.2s;
}
#yby-plan-rtl-btn:hover { opacity: 1; }
#yby-plan-rtl-btn.yby-active { opacity: 1; }
`;

/** Plan Preview RTL content rules — scoped to .YBYrtl class on #content */
const PLAN_RTL_SCOPED_CSS = `
#content.YBYrtl {
    direction: rtl;
    text-align: right;
}
#content.YBYrtl blockquote {
    border-left: none;
    border-right: 3px solid var(--vscode-textBlockQuote-border);
    padding-left: 0;
    padding-right: 12px;
}
#content.YBYrtl ul, #content.YBYrtl ol {
    padding-left: 0;
    padding-right: 32px;
}
#content.YBYrtl th, #content.YBYrtl td {
    text-align: right;
}
#content.YBYrtl pre,
#content.YBYrtl code {
    direction: ltr;
    unicode-bidi: isolate;
    text-align: left;
}
`;

/** Plan Preview RTL content rules — unscoped (Always mode) */
const PLAN_RTL_ALWAYS_CSS = `
#content {
    direction: rtl;
    text-align: right;
}
#content blockquote {
    border-left: none;
    border-right: 3px solid var(--vscode-textBlockQuote-border);
    padding-left: 0;
    padding-right: 12px;
}
#content ul, #content ol {
    padding-left: 0;
    padding-right: 32px;
}
#content th, #content td {
    text-align: right;
}
#content pre,
#content code {
    direction: ltr;
    unicode-bidi: isolate;
    text-align: left;
}
`;

/** Assembled Plan Preview CSS for Active mode — fonts scoped to #content (not .YBYrtl) so they apply regardless of toggle state */
export function generatePlanActiveCss(fonts: FontOptions = NO_FONTS): string {
    return PLAN_CSS_START_MARKER + '\n' +
        PLAN_BUTTON_CSS +
        PLAN_RTL_SCOPED_CSS +
        generatePlanFontCss(fonts) +
        '\n' + PLAN_CSS_END_MARKER;
}

/** Assembled Plan Preview CSS for Always mode */
export function generatePlanAlwaysCss(fonts: FontOptions = NO_FONTS): string {
    return PLAN_CSS_START_MARKER + '\n' +
        PLAN_RTL_ALWAYS_CSS +
        generatePlanFontCss(fonts) +
        '\n' + PLAN_CSS_END_MARKER;
}

/** Plan Preview force-LTR rules — unscoped (LTR Always mode) */
const PLAN_LTR_ALWAYS_CSS = `
#content {
    direction: ltr;
    unicode-bidi: isolate;
    text-align: left;
}
#content th, #content td {
    text-align: left;
}
#content pre,
#content code {
    direction: ltr;
    unicode-bidi: isolate;
    text-align: left;
}
`;

/** Assembled Plan Preview CSS for LTR Always mode */
export function generatePlanLtrCss(fonts: FontOptions = NO_FONTS): string {
    return PLAN_CSS_START_MARKER + '\n' +
        PLAN_LTR_ALWAYS_CSS +
        generatePlanFontCss(fonts) +
        '\n' + PLAN_CSS_END_MARKER;
}

/** Assembled Plan Preview CSS for Auto mode — fonts always apply, RTL is per-content */
export function generatePlanAutoCss(fonts: FontOptions = NO_FONTS): string {
    return PLAN_CSS_START_MARKER + '\n' +
        PLAN_BUTTON_CSS +
        PLAN_RTL_SCOPED_CSS +
        generatePlanFontCss(fonts) +
        '\n' + PLAN_CSS_END_MARKER;
}

/** Plan Preview JS for Active mode — toggle button */
export const PLAN_ACTIVE_JS =
    PLAN_JS_START_MARKER + '\n' +
    `(function() {
    var btn = document.createElement('button');
    btn.id = 'yby-plan-rtl-btn';
    btn.textContent = '\\u21C4';
    btn.title = 'Toggle RTL';
    btn.addEventListener('click', function() {
        var c = document.getElementById('content');
        if (c) {
            var isRtl = c.classList.toggle('YBYrtl');
            btn.classList.toggle('yby-active', isRtl);
        }
    });
    document.body.appendChild(btn);
})();\n` +
    PLAN_JS_END_MARKER;

/** Plan Preview JS for Auto mode — auto-detect RTL + override button */
export const PLAN_AUTO_JS =
    PLAN_JS_START_MARKER + '\n' +
    `(function() {
    var RTL_RE = /[\\u0590-\\u05FF\\u0600-\\u06FF\\u0750-\\u077F\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/;
    var content = document.getElementById('content');
    if (!content) return;
    var btn = document.createElement('button');
    btn.id = 'yby-plan-rtl-btn';
    btn.textContent = '\\u21C4';
    btn.title = 'Toggle RTL';
    var manualOverride = false;
    btn.addEventListener('click', function() {
        manualOverride = true;
        var isRtl = content.classList.toggle('YBYrtl');
        btn.classList.toggle('yby-active', isRtl);
    });
    document.body.appendChild(btn);
    var obs = new MutationObserver(function() {
        if (manualOverride) return;
        if (RTL_RE.test(content.textContent || '')) {
            content.classList.add('YBYrtl');
            btn.classList.add('yby-active');
        } else {
            content.classList.remove('YBYrtl');
            btn.classList.remove('yby-active');
        }
    });
    obs.observe(content, { childList: true, subtree: true });
})();\n` +
    PLAN_JS_END_MARKER;

/** Auto-mode JS — scans bubbles for Hebrew and adds .YBYrtl class */
export const RTL_AUTO_JS_CODE = `
/* RTL Toggle Button - Added by script */
(function() {
    var RTL = /[\\u0590-\\u05FF\\u0600-\\u06FF\\u0750-\\u077F\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/;
    var CLS = 'YBYrtl';

    /* Bubble selectors — Claude responses and user messages */
    var BUBBLE_SEL = '[class*="timelineMessage_"],[class*="userMessageContainer_"]';

    /* Watch a single bubble — add .YBYrtl when RTL text is found, then stop watching */
    function watchBubble(el) {
        if (!el.matches || !el.matches(BUBBLE_SEL)) return;
        if (el.classList.contains(CLS)) return;

        /* Check immediately */
        if (RTL.test(el.textContent || '')) {
            el.classList.add(CLS);
            return;
        }

        /* Not found yet — observe this bubble for changes */
        var obs = new MutationObserver(function() {
            if (RTL.test(el.textContent || '')) {
                el.classList.add(CLS);
                obs.disconnect();
            }
        });
        obs.observe(el, { childList: true, subtree: true, characterData: true });
    }

    var root = document.getElementById('root');
    if (!root) return;

    /* Initial scan */
    root.querySelectorAll(BUBBLE_SEL).forEach(watchBubble);

    /* Watch for new bubbles appearing */
    new MutationObserver(function(muts) {
        for (var i = 0; i < muts.length; i++) {
            var m = muts[i];
            for (var j = 0; j < m.addedNodes.length; j++) {
                var nd = m.addedNodes[j];
                if (nd.nodeType !== 1) continue;
                if (nd.matches) watchBubble(nd);
                if (nd.querySelectorAll) {
                    nd.querySelectorAll(BUBBLE_SEL).forEach(watchBubble);
                }
            }
        }
    }).observe(root, { childList: true, subtree: true });
})();
${PERMISSION_RTL_JS}
/* End RTL Toggle Button */
`;
