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

/** RTL CSS rules to inject — identical to Python RTL_CSS_RULES */
export const RTL_CSS_RULES = `
/* RTL Text Support for Claude Code VS Code / Cursor Extension - Added by script */
/* RTL-MODE: active */

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

/* ==========================================
   RTL - Hebrew/Arabic content (active when .YBYrtl is on #root)
   ========================================== */

/* Messages container + user messages */
.YBYrtl [class*="messagesContainer_"] {
    direction: rtl;
}

.YBYrtl [class*="userMessage_"],
.YBYrtl [class*="userMessageContainer_"] {
    direction: rtl;
    unicode-bidi: plaintext;
    text-align: right !important;
    align-items: flex-end !important;
    margin-left: auto !important;
    margin-right: 0 !important;
}

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

/* Prompt input — auto-detect direction by first character */
.YBYrtl [class*="messageInput_"] {
    unicode-bidi: plaintext;
    text-align: start;
}

/* ==========================================
   LTR overrides - Code, Tools, UI
   ========================================== */

.YBYrtl [class*="slashCommandMessage_"],
.YBYrtl [class*="slashCommandResultMessage_"],
.YBYrtl [class*="header_"][class*="aqhumA"],
.YBYrtl [class*="sessionsButtonText_"],
.YBYrtl [class*="dotSuccess_"],
.YBYrtl [class*="dotFailure_"],
.YBYrtl [class*="dotProgress_"],
.YBYrtl [class*="dotWarning_"],
.YBYrtl [class*="progressContent_"],
.YBYrtl [class*="inputContainer_"][class*="cKsPxg"],
.YBYrtl [class*="inputWrapper_"],
.YBYrtl [class*="iconButton_"],
.YBYrtl [class*="copyButton_"],
.YBYrtl [class*="actionButton_"],
.YBYrtl [class*="selectionAttachment_"],
.YBYrtl [class*="attachmentInfo_"],
.YBYrtl [class*="attachmentText_"],
.YBYrtl [class*="permissionRequest"],
.YBYrtl [class*="errorMessage_"],
.YBYrtl [class*="secondaryLine_"],
.YBYrtl [class*="todoListContainer_"],
.YBYrtl [class*="todoList_"],
.YBYrtl [class*="todoItem_"],
.YBYrtl [class*="auth_"],
.YBYrtl [class*="authUrl"] {
    direction: ltr !important;
}

/* Code blocks - LTR + alignment */
.YBYrtl pre,
.YBYrtl code,
.YBYrtl [class*="codeBlockWrapper_"] {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left !important;
}

/* Tool containers - LTR + alignment */
.YBYrtl [class*="toolUse_"],
.YBYrtl [class*="toolSummary_"],
.YBYrtl [class*="toolBody_"],
.YBYrtl [class*="toolBodyGrid_"],
.YBYrtl [class*="toolBodyRow_"],
.YBYrtl [class*="toolBodyRowContent_"],
.YBYrtl [class*="toolBodyRowLabel_"],
.YBYrtl [class*="toolResult_"],
.YBYrtl [class*="toolNameText_"],
.YBYrtl [class*="toolReference_"] {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left !important;
}

/* Thinking block - LTR + alignment */
.YBYrtl [class*="thinking_"],
.YBYrtl [class*="thinkingContent_"],
.YBYrtl [class*="thinkingContainer_"],
.YBYrtl [class*="thinkingHeader_"],
.YBYrtl [class*="spinnerRow_"],
.YBYrtl [class*="timelineMessage_"]:has([class*="thinking_"]) {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left !important;
}

.YBYrtl [class*="thinkingContent_"] [class*="root_"] :is(ul, ol, li) {
    direction: ltr !important;
    text-align: left !important;
}

/* End RTL Text Support for Claude Code VS Code / Cursor Extension */
`;

/** RTL JS toggle button code — identical to Python RTL_JS_CODE */
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

/** Auto-mode JS — scans bubbles for Hebrew and adds .YBYrtl class.
 *  CSS (with .YBYrtl prefix) handles the rest. */
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

/**
 * Generate CSS rules without `.YBYrtl` class dependency and no button styles.
 * Used by both "Always" and "Auto" modes — only the marker differs.
 */
function generateBaseCssRules(modeMarker: string): string {
    let css = RTL_CSS_RULES;

    // Replace mode marker
    css = css.replace(RTL_MODE_ACTIVE_MARKER, modeMarker);

    // Remove button styling section
    css = css.replace(
        /\/\* =+\s*\n\s*Toggle button - always visible\s*\n\s*=+ \*\/[\s\S]*?#yby-rtl-btn\.yby-active\s*\{[^}]*\}/,
        '',
    );

    // Remove `.YBYrtl ` prefix from all selectors
    css = css.replace(/\.YBYrtl\s+/g, '');

    return css;
}

/**
 * Generate CSS rules for "Always" mode.
 */
export function generateAlwaysCssRules(): string {
    return generateBaseCssRules(RTL_MODE_ALWAYS_MARKER);
}

/**
 * Generate CSS rules for "Auto" mode — keeps `.YBYrtl` prefix (like Active),
 * removes button styles and messagesContainer rule.
 * JS will add `.YBYrtl` class per-bubble based on Hebrew detection.
 */
export function generateAutoCssRules(): string {
    let css = RTL_CSS_RULES;

    // Replace mode marker
    css = css.replace(RTL_MODE_ACTIVE_MARKER, RTL_MODE_AUTO_MARKER);

    // Remove button styling section
    css = css.replace(
        /\/\* =+\s*\n\s*Toggle button - always visible\s*\n\s*=+ \*\/[\s\S]*?#yby-rtl-btn\.yby-active\s*\{[^}]*\}/,
        '',
    );

    // Remove messagesContainer rule (not needed — .YBYrtl is on individual bubbles, not on root)
    css = css.replace(
        /\.YBYrtl\s+\[class\*="messagesContainer_"\]\s*\{[^}]*\}\s*/,
        '',
    );

    // Add self-matching rules (no space) for elements where .YBYrtl is on the same element
    // In Auto mode, .YBYrtl is added directly to the bubble, not to #root
    css += `
/* Auto mode — self-matching rules for .YBYrtl on the bubble itself */
.YBYrtl[class*="userMessage_"],
.YBYrtl[class*="userMessageContainer_"] {
    direction: rtl;
    unicode-bidi: plaintext;
    text-align: right !important;
    align-items: flex-end !important;
    margin-left: auto !important;
    margin-right: 0 !important;
}

.YBYrtl[class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) {
    direction: rtl;
    unicode-bidi: plaintext;
}

.YBYrtl[class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) > :is(p, ul, ol, h1, h2, h3, h4, blockquote),
.YBYrtl[class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) > :is(ul, ol) li {
    text-align: right;
}

/* Prompt input — no .YBYrtl ancestor in Auto mode, so target directly */
[class*="messageInput_"] {
    unicode-bidi: plaintext;
    text-align: start;
}
`;

    return css;
}
