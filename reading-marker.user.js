// ==UserScript==
// @name        網路小說閱讀進度標記
// @namespace   https://github.com/rye1014
// @version     1.0.0
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

(function() {
    'use strict'; 

    // --- 1. 識別當前平台 ---
    let workId = ''; 
    const host = window.location.hostname; 
    const path = window.location.pathname; 

    // ao3
    if (host.includes('archiveofourown.org')) {
        const ao3Match = path.match(/works\/(\d+)/); 
        if (ao3Match) workId = `ao3_bookmark_${ao3Match[1]}`; 
    }
    // fc2
    else if (host.includes('fc2.com') || path.includes('entry')) {
        const fc2Match = path.match(/entry[-_](\d+)/) || window.location.href.match(/entry[-_](\d+)/); 
        if (fc2Match) {
            workId = `fc2_bookmark_${host}_${fc2Match[1]}`; 
        }
    }

    if (!workId) return; 

    // --- 2. 
    let injectTimer = setInterval(() => {
        if (document.getElementById('reading-marker-box')) {
            clearInterval(injectTimer); 
            return; 
        }

        if (!document.body) return; 

        const container = document.createElement('div'); 
        container.id = 'reading-marker-box'; 
        container.style.cssText = `
            position: fixed !important;
            bottom: 30px !important;    /* 貼近底部，如果被 Safari 擋到再微調 */
            right: 20px !important;     /* 貼齊手機螢幕右側 */
            left: auto !important;      /* 防止被 FC2 原生樣式往左拉扯 */
            width: 46px !important;     /* 限制容器寬度，強制按鈕垂直置右排列 */
            z-index: 999999 !important; 
            display: flex !important;
            flex-direction: column !important;
            gap: 15px !important;
        `;

        // 標記按鈕
        const markBtn = document.createElement('div')
        markBtn.innerText = '■';
        styleButton(markBtn, '#990000', '#ffffff'); 

        // 跳轉按鈕
        const jumpBtn = document.createElement('div'); 
        jumpBtn.innerText = '▶';
        styleButton(jumpBtn, '#dddddd', '#888888');
        
        // 檢查是否有舊記錄
        if (localStorage.getItem(workId)) {
            jumpBtn.style.setProperty('background-color', '#222222', 'important'); 
            jumpBtn.style.setProperty('color', '#ffffff', 'important'); 
            jumpBtn.style.opacity = '1'; 
        }
        else {
            jumpBtn.style.setProperty('background-color', '#dddddd', 'important');
            jumpBtn.style.setProperty('color', '#888888', 'important');
            jumpBtn.style.opacity = '0.6';
        }

        // 
        markBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const currentScroll = window.scrollY || window.pageYOffset; 
            localStorage.setItem(workId, currentScroll); 
            alert('已成功標記當前位置！'); 
            jumpBtn.style.setProperty('background-color', '#222222', 'important');
            jumpBtn.style.setProperty('color', '#ffffff', 'important');
            jumpBtn.style.opacity = '1';
        }); 

        jumpBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const savedScroll = localStorage.getItem(workId); 
            if (savedScroll) {
                window.scrollTo({
                    top: parseInt(savedScroll, 10), 
                    behavior: 'smooth'
                }); 
            }
            else {
                alert('尚未標記位置'); 
            }
        }); 

        // 組合
        container.appendChild(markBtn); 
        container.appendChild(jumpBtn); 
        document.body.appendChild(container);

    }, 500); 

    setTimeout(() => { clearInterval(injectTimer); }, 5000); 

    // 
    function styleButton(btn, bgColor, textColor) {
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
        `; 
        btn.style.setProperty('background-color', bgColor, 'important'); 
        btn.style.setProperty('color', textColor, 'important'); 
    }
})(); 


