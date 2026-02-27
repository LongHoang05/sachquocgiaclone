var threshold = 222;
var devtoolsOpen = false;
var isBlocked = false;
var emitEvent = (isOpen, orientation) => {
    globalThis.dispatchEvent(new globalThis.CustomEvent('devtoolschange', {
        detail: {
            isOpen,
            orientation,
        },
    }));
};
var mainEvent = ({ } = {}) => {
    var widthThreshold = globalThis.outerWidth - globalThis.innerWidth > threshold;
    var heightThreshold = globalThis.outerHeight - globalThis.innerHeight > threshold;
    var orientation = widthThreshold ? 'vertical' : 'horizontal';
    if (!(heightThreshold && widthThreshold) && ((globalThis.Firebug && globalThis.Firebug.chrome && globalThis.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
        devtoolsOpen = true;
        emitEvent(true, orientation);
    } else {
        devtoolsOpen = false;
        emitEvent(false, orientation);
    }
};
function undockedDevToolsDetection() {
    var originalClear = console.clear;
    console.clear = function () {
        devtoolsOpen = true;
        emitEvent(true, 'undocked');
        return originalClear.apply(console, arguments);
    };
};
function advancedDebuggerDetection() {
    var start = performance.now();
    debugger;
    var end = performance.now();
    if (end - start > 100) {
        return true;
    }
    return false;
};
function consoleDetection() {
    var element = new Image();
    Object.defineProperty(element, 'id', {
        get: function () {
            devtoolsOpen = true;
            emitEvent(true, 'inspect');
            return 'devtools-detector';
        }
    });
    return element;
};
function keyboardDetection() {
    document.addEventListener('keydown', (e) => {
        var blocked = false;
        if (['F12', 'F5'].includes(e.code) || ['F12', 'F5'].includes(e.key)) {
            blocked = true;
        }
        if (e.code === 'PrintScreen' || e.key === 'PrintScreen') {
            blocked = true;
        }
        if (e.ctrlKey && e.shiftKey && !e.altKey) {
            if (['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key) ||
                ['KeyI', 'KeyJ', 'KeyC'].includes(e.code)) {
                blocked = true;
            }
        }
        if (e.ctrlKey && !e.shiftKey && !e.altKey) {
            if (['U', 'u', 'S', 's', 'P', 'p', 'A', 'a', 'C', 'c', 'V', 'v', 'X', 'x', 'R', 'r'].includes(e.key) ||
                ['KeyU', 'KeyS', 'KeyP', 'KeyA', 'KeyC', 'KeyV', 'KeyX', 'KeyR'].includes(e.code)) {
                blocked = true;
            }
        }
        if (blocked) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    document.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
    });
};
function functionDetection() {
    var func = function () { };
    func.toString = function () {
        devtoolsOpen = true;
        emitEvent(true, 'function');
        return 'function() { [native code] }';
    };
    return func;
};
function blockAccess() {
    if (isBlocked) return;
    isBlocked = true;
    if (typeof UrlTracking !== 'undefined' && UrlTracking !== null && UrlTracking !== '') {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', UrlTracking, true);
        xhr.send();
    }
    clearLoginCookies();
    try {
        document.documentElement.innerHTML = '';
        var html = document.createElement('html');
        var head = document.createElement('head');
        var body = document.createElement('body');
        var title = document.createElement('title');
        title.textContent = 'Truy cập bị chặn';
        var style = document.createElement('style');
        style.textContent = `
            * { margin: 0; padding: 0; }
            body {
                background: #000;
                color: #ff0000;
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                text-align: center;
                overflow: hidden;
            }
            h1 { font-size: 36px; margin-bottom: 20px; }
            p { font-size: 18px; margin: 10px 0; }
            .countdown { font-size: 24px; color: #ffff00; }
        `;
        head.appendChild(title);
        head.appendChild(style);
        var container = document.createElement('div');
        var h1 = document.createElement('h1');
        h1.textContent = 'TRUY CẬP BỊ CHẶN';
        var p1 = document.createElement('p');
        p1.textContent = 'Vui lòng tắt Developer Tools (F12) để tiếp tục';
        var p2 = document.createElement('p');
        p2.className = 'countdown';
        p2.innerHTML = 'Trang sẽ tự động tải lại sau <span id="timer">5</span> giây...';
        container.appendChild(h1);
        container.appendChild(p1);
        container.appendChild(p2);
        body.appendChild(container);
        html.appendChild(head);
        html.appendChild(body);
        document.appendChild(html);
    } catch (e) {
        document.documentElement.innerHTML = `
            <html>
            <head>
                <title>Truy cập bị chặn</title>
                <style>
                    * { margin: 0; padding: 0; }
                    body {
                        background: #000;
                        color: #ff0000;
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        text-align: center;
                    }
                    h1 { font-size: 36px; margin-bottom: 20px; }
                    p { font-size: 18px; margin: 10px 0; }
                    .countdown { font-size: 24px; color: #ffff00; }
                </style>
            </head>
            <body>
                <div>
                    <h1>TRUY CẬP BỊ CHẶN</h1>
                    <p>Vui lòng tắt Developer Tools (F12) để tiếp tục</p>
                    <p class="countdown">Trang sẽ tự động tải lại sau <span id="timer">5</span> giây...</p>
                </div>
            </body>
            </html>
        `;
        setTimeout(() => {
            window.location.reload();
        }, 5000);
    }
    var count = 5;
    var timer = setInterval(() => {
        count--;
        var timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = count;
        }
        if (count <= 0) {
            clearInterval(timer);
            window.location.reload();
        }
    }, 1000);
    var blockEvent = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
    ['keydown', 'contextmenu', 'selectstart', 'dragstart'].forEach(eventType => {
        document.addEventListener(eventType, blockEvent, true);
    });
};
function clearLoginCookies() {
    document.cookie = ".AspNetCore.Identity.Application=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        if (name.toLowerCase().includes("auth")) {
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            var domain = window.location.hostname;
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + domain + ";";
            document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=." + domain + ";";
        }
    }
};
function initAdvancedDetection() {
    keyboardDetection();
    undockedDevToolsDetection();
    consoleDetection();
    functionDetection();
};
function injectIframeProtection() {
    var script = document.getElementById('blocker');
    var version = '';
    if (script) {
        var src = script.getAttribute('src');
        var match = src && src.match(/[?&]v=([^&]+)/);
        if (match) {
            version = match[0];
        }
    }
    var cssUrl = `/lib/plugin/style.css${version}`;
    var scriptUrl = `/lib/plugin/blocker.js${version}`;
    var processedIframes = new Set();
    var interval = setInterval(function () {
        var len = $("iframe").length;
        $("iframe").each(function (index, iframe) {
            if (processedIframes.has(iframe)) {
                return;
            }
            var contentHead = '';
            var contentBody = '';
            try {
                contentHead = iframe.contentDocument.head.innerHTML;
            } catch (err) {
                contentHead = '';
            }
            if (contentHead == '') {
                try {
                    contentHead = iframe.contentDocument.head.getInnerHTML();
                } catch (err) {
                    contentHead = '';
                }
            }
            try {
                contentBody = iframe.contentDocument.body.innerHTML;
            } catch (err) {
                contentBody = '';
            }
            if (contentBody == '') {
                try {
                    contentBody = iframe.contentDocument.body.getInnerHTML();
                } catch (err) {
                    contentBody = '';
                }
            }
            try {
                var isAppendHead = false;
                var isAppendBody = false;
                if (contentHead !== '' && !contentHead.includes(cssUrl)) {
                    var cssLink = document.createElement("link");
                    cssLink.href = cssUrl;
                    cssLink.rel = "stylesheet";
                    cssLink.type = "text/css";
                    iframe.contentDocument.head.appendChild(cssLink);
                    isAppendHead = true;
                }
                if (contentBody !== '' && !contentBody.includes(scriptUrl)) {
                    var cssScript = document.createElement("script");
                    cssScript.src = scriptUrl;
                    iframe.contentDocument.body.appendChild(cssScript);
                    isAppendBody = true;
                }
                if (contentHead.includes(cssUrl) && contentBody.includes(scriptUrl)) {
                    processedIframes.add(iframe);
                    allProcessed = true;
                }
            } catch (err) {
                console.debug("Không thể truy cập iframe:", err);
            }
            if (processedIframes.size === len) {
                clearInterval(interval);
            }
        });
    }, 200);
}
mainEvent({ emitEvents: false });
setInterval(mainEvent, 500);
document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener('devtoolschange', event => {
        if (event.detail.isOpen) {
            blockAccess();
        } else {
            if (advancedDebuggerDetection()) {
                blockAccess();
            }
        }
    });
    initAdvancedDetection();
});
document.onselectstart = () => false;
document.ondragstart = () => false;
document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
}, false);
var style = document.createElement('style');
style.textContent = `
    * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
    }
    input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
    }
`;
document.head.appendChild(style);
document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
});
document.addEventListener('drop', (e) => {
    e.preventDefault();
    return false;
});
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    return false;
});
document.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
    }
    e.preventDefault();
    return false;
});
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});
console.log("%c VUI LÒNG TẮT F12 ĐỂ TIẾP TỤC ĐỌC SÁCH. %c", 'font-family: "Arial", Arial, sans-serif;font-size:35px;color:red;-webkit-text-fill-color:red;-webkit-text-stroke: 1px red;', "font-size:35px;color:red;");
console.log("%c Để bảo về quyền lợi cho nhà phát hành và khách hàng, vui lòng tắt F12 để có thể tiếp tục đọc sách, chúc bạn đọc sách vui vẻ ! %c", 'font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;font-size:16px;color:#515152;-webkit-text-fill-color:#515152;-webkit-text-stroke: 1px #515152;', "font-size:16px;color:#515152;");