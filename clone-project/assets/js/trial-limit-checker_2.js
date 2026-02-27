(function () {
    'use strict';
    var configTrial = {
        isTrialMode: false,
        maxTrialPages: 1,
        currentPage: 1,        
        queryId: '',
        nameAscii: '',
        website: '',
        hasShownPopup: false
    };
    function createPopup() {
        var popupHtml = `
            <div id="trialLimitOverlay" class="trial-limit-overlay">
                <div class="trial-limit-popup">
                    <div class="trial-limit-header" style="position: relative;">
                        <button class="trial-limit-close" onclick="closeTrialPopup()">&times;</button>
                        <div style="font-size: 60px; margin-bottom: 10px;">📚</div>
                        <h2>Bạn đã đọc hết số trang đọc thử!</h2>
                        <p>Cảm ơn bạn đã quan tâm đến cuốn sách này</p>
                    </div>
                    <div class="trial-limit-body">
                        <div class="message">
                            Bạn đã đọc hết <span class="highlight">${configTrial.maxTrialPages} trang</span> đọc thử.<br>
                            Để tiếp tục đọc và khám phá toàn bộ nội dung cuốn sách,<br>
                            vui lòng <span class="highlight">Thuê ebook</span> hoặc <span class="highlight">nâng cấp tài khoản VIP</span>.
                        </div>
                        <div class="trial-limit-actions">
                            <a href="${configTrial.website}/${configTrial.nameAscii}-b${configTrial.queryId}.html" class="trial-limit-btn trial-limit-btn-primary">
                                🎁 Thuê ebook ngay
                            </a>
                            <a href="${configTrial.website}" class="trial-limit-btn trial-limit-btn-secondary">
                                ⭐ Nâng cấp VIP
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        var div = document.createElement('div');
        div.innerHTML = popupHtml;
        document.body.appendChild(div.firstElementChild);
    }
    function showTrialLimitPopup() {
        if (configTrial.hasShownPopup) return;
        var overlay = document.getElementById('trialLimitOverlay');
        if (overlay) {
            overlay.classList.add('active');
            configTrial.hasShownPopup = true;
        }
    }
    window.closeTrialPopup = function () {
        var overlay = document.getElementById('trialLimitOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            configTrial.hasShownPopup = false;
        }
    }
    function checkPageLimit(pageNumber, maxTrialPages = 0) {
        if (!configTrial.isTrialMode) return;
        if (maxTrialPages == 0)
            maxTrialPages = configTrial.maxTrialPages;
        if (maxTrialPages % 2 !== 0)
            maxTrialPages--;
        if (pageNumber >= maxTrialPages) {
            showTrialLimitPopup();
            return true;
        }
        return false;
    }
    function notifyCurrentPage(url, b, page = 0) {
        if (url != '' && url != null && url != undefined) {
            var url = page > 0 ? `${url}&numberpage=${page}&b=${b}` : `${url}&b=${b}`;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.send();
        }
    }
    window.initTrialLimitChecker = function (options) {
        configTrial = Object.assign(configTrial, options);
        if (!configTrial.isTrialMode || configTrial.maxTrialPages <= 0) {
            return;
        }
        createPopup();
    };
    window.TrialLimitChecker = {
        init: window.initTrialLimitChecker,
        check: checkPageLimit,
        show: showTrialLimitPopup,
        close: window.closeTrialPopup,
        page: notifyCurrentPage
    };
})();
