// ==UserScript==
// @name        網路小說閱讀進度標記
// @namespace   https://github.com/rye1014
// @version     1.2.0
// @description 專為 iPhone Safari (Stay) 優化的閱讀進度標記工具，精準支援 AO3 與 FC2 部落格，防止重整導致閱讀位置遺失。
// @author      rye1014
// @updateURL   https://raw.githubusercontent.com/rye1014/ReadingMarker/main/reading-marker.user.js
// @downloadURL https://raw.githubusercontent.com/rye1014/ReadingMarker/main/reading-marker.user.js
// @match       *://*.archiveofourown.org/works/*
// @match       *://*.blog.fc2.com/*
// @match       *://*.blog*.fc2.com/*
// @grant       none
// @run-at      document-start
// ==/UserScript==

(function () {
    'use strict';

    const host = window.location.hostname;
    const path = window.location.pathname;
    let workId = '';

    // AO3 作品頁：以作品 ID 當 key
    if (host.includes('archiveofourown.org')) {
        const ao3Match = path.match(/works\/(\d+)/);
        if (ao3Match) {
            workId = `ao3_bookmark_${ao3Match[1]}`;
        }
    } else if (host.includes('fc2.com') || path.includes('entry')) {
        // FC2 文章頁：以 host + entry ID 當 key，避免不同文章共用紀錄
        const fc2Match = path.match(/entry[-_](\d+)/) || window.location.href.match(/entry[-_](\d+)/);
        if (fc2Match) {
            workId = `fc2_bookmark_${host}_${fc2Match[1]}`;
        }
    }

    if (!workId) {
        return;
    }

    const injectTimer = setInterval(() => {
        if (document.getElementById('reading-marker-box')) {
            clearInterval(injectTimer);
            return;
        }

        if (!document.body) {
            return;
        }

        // 收合時用透明遮罩接住頁面點擊，避免誤觸內容。
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed !important;
            inset: 0 !important;
            z-index: 999998 !important;
            display: none !important;
            background: transparent !important;
            -webkit-tap-highlight-color: transparent !important;
            pointer-events: auto !important;
        `;

        const container = document.createElement('div');
        container.id = 'reading-marker-box';
        container.style.cssText = `
            position: fixed !important;
            right: 20px !important;
            bottom: 30px !important;
            left: auto !important;
            z-index: 999999 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-end !important;
            gap: 15px !important;
        `;

        const markBtn = document.createElement('div');
        markBtn.innerText = '■';
        styleActionButton(markBtn, '#990000', '#ffffff');

        const actionWrap = document.createElement('div');
        actionWrap.style.cssText = `
            display: none !important;
            flex-direction: column !important;
            align-items: flex-end !important;
            gap: 12px !important;
        `;

        const jumpBtn = document.createElement('div');
        jumpBtn.innerText = '▶';
        styleActionButton(jumpBtn, '#dddddd', '#888888');

        let isExpanded = false;
        let longPressTimer = null;
        let isLongPressed = false;
        let scrollIdleTimer = null;

        function updateJumpButtonState() {
            if (localStorage.getItem(workId)) {
                jumpBtn.style.setProperty('background-color', '#222222', 'important');
                jumpBtn.style.setProperty('color', '#ffffff', 'important');
                jumpBtn.style.opacity = '1';
            } else {
                jumpBtn.style.setProperty('background-color', '#dddddd', 'important');
                jumpBtn.style.setProperty('color', '#888888', 'important');
                jumpBtn.style.opacity = '0.6';
            }
        }

        function setExpanded(nextExpanded) {
            isExpanded = nextExpanded;

            if (isExpanded) {
                backdrop.style.setProperty('display', 'block', 'important');
                backdrop.style.setProperty('pointer-events', 'auto', 'important');
                actionWrap.style.setProperty('display', 'flex', 'important');
                markBtn.style.opacity = '1';
            } else {
                backdrop.style.setProperty('display', 'none', 'important');
                backdrop.style.setProperty('pointer-events', 'none', 'important');
                actionWrap.style.setProperty('display', 'none', 'important');
                markBtn.style.opacity = '0.55';
            }
        }

        function clearLongPressTimer() {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }

        // 停止滑動後，延遲一小段時間再展開，避免捲動中反覆閃爍。
        function scheduleExpand() {
            if (scrollIdleTimer) {
                clearTimeout(scrollIdleTimer);
            }

            scrollIdleTimer = setTimeout(() => {
                setExpanded(true);
            }, 650);
        }

        updateJumpButtonState();
        setExpanded(false);
        scheduleExpand();

        backdrop.addEventListener('click', () => {
            setExpanded(false);
        });

        // 點按鈕區域外的地方時切換收合狀態。
        function handleOutsideToggle(e) {
            if (e.target.closest && e.target.closest('#reading-marker-box')) {
                return;
            }

            if (!isExpanded) {
                setExpanded(true);
            }
        }

        document.addEventListener('click', handleOutsideToggle, true);

        markBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (isLongPressed) {
                return;
            }

            const currentScroll = window.scrollY || window.pageYOffset || 0;
            localStorage.setItem(workId, String(currentScroll));
            alert('已保存目前閱讀位置');
            updateJumpButtonState();
        });

        markBtn.addEventListener('touchstart', () => {
            isLongPressed = false;
            markBtn.style.transform = 'scale(0.9)';

            clearLongPressTimer();
            longPressTimer = setTimeout(() => {
                isLongPressed = true;
                if (confirm('要清除這篇文章的閱讀紀錄嗎？')) {
                    localStorage.removeItem(workId);
                    updateJumpButtonState();
                    alert('已清除閱讀紀錄');
                }
            }, 800);
        });

        markBtn.addEventListener('touchmove', () => {
            markBtn.style.transform = 'scale(1)';
            clearLongPressTimer();
        });

        markBtn.addEventListener('touchend', (e) => {
            markBtn.style.transform = 'scale(1)';
            clearLongPressTimer();

            if (isLongPressed) {
                e.preventDefault();
                setTimeout(() => {
                    isLongPressed = false;
                }, 0);
            }
        });

        markBtn.addEventListener('touchcancel', () => {
            markBtn.style.transform = 'scale(1)';
            clearLongPressTimer();
            isLongPressed = false;
        });

        jumpBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            const savedScroll = localStorage.getItem(workId);
            if (savedScroll) {
                window.scrollTo({
                    top: parseInt(savedScroll, 10),
                    behavior: 'smooth'
                });
            } else {
                alert('目前沒有可跳轉的位置');
            }
        });

        actionWrap.appendChild(jumpBtn);
        document.body.appendChild(backdrop);
        container.appendChild(markBtn);
        container.appendChild(actionWrap);
        document.body.appendChild(container);

        window.addEventListener('scroll', () => {
            setExpanded(false);
            scheduleExpand();
        }, { passive: true });

        window.addEventListener('touchmove', () => {
            setExpanded(false);
            scheduleExpand();
        }, { passive: true });
    }, 500);

    setTimeout(() => {
        clearInterval(injectTimer);
    }, 5000);

    function styleActionButton(btn, bgColor, textColor) {
        btn.style.cssText = `
            display: block !important;
            width: 46px !important;
            height: 46px !important;
            line-height: 46px !important;
            font-size: 18px !important;
            font-weight: bold !important;
            border-radius: 50% !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
            cursor: pointer !important;
            text-align: center !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
            transition: transform 0.1s ease !important;
            -webkit-transition: -webkit-transform 0.1s ease !important;
            touch-action: manipulation !important;
        `;
        btn.style.setProperty('background-color', bgColor, 'important');
        btn.style.setProperty('color', textColor, 'important');
    }

})();
