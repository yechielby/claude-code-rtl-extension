/** Marker at the beginning of injected CSS block */
export const RTL_START_MARKER =
    '/* RTL Text Support for Claude Code VS Code / Cursor Extension - Added by script */';

/** Marker at the end of injected CSS block */
export const RTL_END_MARKER =
    '/* End RTL Text Support for Claude Code VS Code / Cursor Extension */';

/** Marker at the beginning of injected JS block */
export const JS_START_MARKER = '/* RTL Toggle Button - Added by script */';

/** Marker at the end of injected JS block */
export const JS_END_MARKER = '/* End RTL Toggle Button */';

/** Marker to identify RTL mode inside injected CSS */
export const RTL_MODE_ACTIVE_MARKER = '/* RTL-MODE: active */';
export const RTL_MODE_ALWAYS_MARKER = '/* RTL-MODE: always */';
export const RTL_MODE_AUTO_MARKER = '/* RTL-MODE: auto */';

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

/* Prompt input — auto-detect direction by first character */
${p}[class*="messageInput_"] {
    unicode-bidi: plaintext;
    text-align: start;
}
`;
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
${p}[class*="permissionRequest"],
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

/* Question/answer blocks */
.YBYrtl [class*="questionBlock_"],
.YBYrtl [class*="questionHeader_"],
.YBYrtl [class*="answerText_"],
.YBYrtl [class*="optionText_"],
.YBYrtl [class*="optionContent_"] {
    direction: rtl;
    unicode-bidi: plaintext;
}

/* Prompt input — no .YBYrtl ancestor in Auto mode, so target directly */
.YBYrtl [class*="messageInput_"] {
    unicode-bidi: plaintext;
    text-align: start;
}
`;

// ── CSS Assembly ──────────────────────────────────────────────────

function assembleCss(modeMarker: string, parts: string[]): string {
    return `
${RTL_START_MARKER}
${modeMarker}
${parts.join('\n')}
${RTL_END_MARKER}
`;
}

/** Active mode — .YBYrtl prefix + toggle button */
export const RTL_CSS_RULES = assembleCss(RTL_MODE_ACTIVE_MARKER, [
    BUTTON_STYLES,
    rtlContentRules(P),
    ltrOverrideRules(P),
]);

/** Always mode — no prefix, no button */
export function generateAlwaysCssRules(): string {
    return assembleCss(RTL_MODE_ALWAYS_MARKER, [
        rtlContentRules(''),
        ltrOverrideRules(''),
    ]);
}

/** Auto mode — dedicated RTL rules (no descendant/self conflicts) + LTR overrides */
export function generateAutoCssRules(): string {
    return assembleCss(RTL_MODE_AUTO_MARKER, [
        AUTO_RTL_RULES,
        ltrOverrideRules(P),
    ]);
}

// ── JavaScript ────────────────────────────────────────────────────

/** RTL JS toggle button code */
export const RTL_JS_CODE = `
/* RTL Toggle Button - Added by script */
(function() {
    var BTN_ID = 'yby-rtl-btn';
    var ROOT_CLASS = 'YBYrtl';

    function tryInsertButton() {
        if (document.getElementById(BTN_ID)) return;
        var header = document.querySelector('[class*="header_"]');
        if (!header) return;

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

        header.appendChild(btn);
    }

    // Wait for React to render the header
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
/* End RTL Toggle Button */
`;
