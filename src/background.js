var /**
     * Supported fonts
     */
    fonts = {
        'Fira Code': 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap',
        'Source Code Pro': 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@200;300;400;500;600;700;900&display=swap',
        'Roboto Mono': 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100;200;300;400;500;600;700&display=swap',
        'Ubuntu Mono': 'https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap',
        'Courier Prime': 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap',
        'JetBrains Mono': 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap',
        'Share Tech Mono': 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap',
        'Fira Mono': 'https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap',
        'PT Mono': 'https://fonts.googleapis.com/css2?family=PT+Mono&display=swap',
        'Oxygen Mono': 'https://fonts.googleapis.com/css2?family=Oxygen+Mono&display=swap',
        'Space Mono': 'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap',
        Inconsolata: 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@200;300;400;500;600;700;800;900&display=swap',
        'Anonymous Pro': 'https://fonts.googleapis.com/css2?family=Anonymous+Pro:ital,wght@0,400;0,700;1,400;1,700&display=swap',
        'IBM Plex Mono':
            'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap',
    },
    selectors = {
        code: '.blob-code-inner',
        intentGuides: '[data-rgh-whitespace="space"]',
    };

// add a listener to tabs.onUpdated event
chrome.tabs.onUpdated.addListener(function (tabId, info) {
    // if the tab is completely loaded
    if (info.status === 'complete') {
        chrome.storage.sync.get(['gt_font_family', 'gt_font_weight', 'gt_font_link', 'gt_indent_guides'], function (data) {
            if (Object.keys(data).length > 0) {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'loadFont',
                        font: {
                            font: data.gt_font_family,
                            link: data.gt_font_link,
                        },
                    });
                });

                applyFontFamily(data.gt_font_family);
                applyFontWeight(data.gt_font_weight);
                data.gt_indent_guides ? showIndentGuides() : hideIndentGuides();
            }
        });

        // Intercept the load font message from the popup script
        // and resend the same request to the content script
        chrome.runtime.onMessage.addListener(function (request) {
            if (request.type === 'loadFont') {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, request);
                });
            }
        });
    }
});

/**
 * Apply the giving css styles to Github code container
 * @param {String} styles
 * @returns true
 */
function applyStyles(selector, styles) {
    const css = stylesToCss(styles);
    chrome.tabs.insertCSS({
        code: `${selector} {${css}}`,
    });
}

/**
 * Converts the giving css styles object into a regular CSS string
 * @param {Object} styles
 * @returns {String}
 */
function stylesToCss(styles) {
    var css = '';
    for (let property in styles) {
        const value = styles[property];
        if (!Object.prototype.hasOwnProperty.call(styles, property) || !value) {
            continue;
        }
        css += `${property}: ${value} !important;`;
    }

    return css;
}

/**
 * Applies the giving font family to the html github code container
 * @param {String} family
 */
function applyFontFamily(family) {
    applyStyles(selectors.code, { 'font-family': family });
    chrome.extension.sendMessage({
        type: 'loadFont',
        font: {
            font: family,
            link: fonts[family],
        },
    });
}

/**
 * Applies the provided weight to the html github code container
 * @param {String} weight
 */
function applyFontWeight(weight) {
    applyStyles(selectors.code, { 'font-weight': weight });
}

function hideIndentGuides() {
    applyStyles(selectors.intentGuides, { visibility: 'hidden' });
}

function showIndentGuides() {
    applyStyles(selectors.intentGuides, { visibility: 'visible' });
}

/**
 * Just a shortcut for the native target.addEventListener
 * @param {DOMElement} ele
 * @param {String} event
 * @param {function} handler
 */
function addEvent(ele, event, handler) {
    ele.addEventListener(event, handler.bind(this), false);
}
