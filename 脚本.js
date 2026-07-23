// ==UserScript==
// @name         视频倍速调节器
// @namespace    https://github.com/
// @version      1.1
// @description  带常驻唤醒按钮，隐藏面板也能重新调出，0.25~10倍速记忆
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
    'use strict';
    const STORAGE_KEY = "videoPlayRate";
    const PANEL_ID = "videoSpeedPanel";
    const TOGGLE_BTN_ID = "speedToggleBtn";
    let currentRate = GM_getValue(STORAGE_KEY, 2);

    // 设置所有视频倍速
    function applyAllVideoRate(rate) {
        currentRate = rate;
        GM_setValue(STORAGE_KEY, rate);
        document.querySelectorAll("video").forEach(function (vid) {
            vid.playbackRate = rate;
        });
        const textDom = document.getElementById("rateText");
        const sliderDom = document.getElementById("rateSlider");
        const inputDom = document.getElementById("rateInput");
        if (textDom) textDom.innerText = "当前倍速：" + rate.toFixed(2) + "x";
        if (sliderDom) sliderDom.value = rate;
        if (inputDom) inputDom.value = rate;
    }

    // 创建常驻唤醒按钮（永久显示，不会隐藏）
    function createToggleBtn() {
        if (document.getElementById(TOGGLE_BTN_ID)) return;
        const toggleBtn = document.createElement("div");
        toggleBtn.id = TOGGLE_BTN_ID;
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            background: #007aff;
            color: #fff;
            border-radius: 50%;
            z-index: 9999999999;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 2px 8px #0005;
        `;
        toggleBtn.innerText = "倍速";
        // 点击唤醒主面板
        toggleBtn.onclick = function () {
            const panel = document.getElementById(PANEL_ID);
            if (panel) panel.style.display = "block";
        };
        document.documentElement.appendChild(toggleBtn);
    }

    // 创建主控制面板
    function createPanel() {
        if (document.getElementById(PANEL_ID)) return;
        const panel = document.createElement("div");
        panel.id = PANEL_ID;
        panel.style.cssText = `
            position: fixed;
            bottom: 70px;
            left: 20px;
            background: rgba(0,0,0,0.85);
            color: #fff;
            padding: 14px;
            border-radius: 10px;
            min-width: 220px;
            z-index: 9999999999;
            user-select: none;
            box-shadow: 0 2px 12px #0006;
        `;
        panel.innerHTML = `
            <h4 style="margin:0 0 10px 0;font-size:15px;">视频倍速控制</h4>
            <div id="rateText" style="margin-bottom:8px;"></div>
            <input id="rateSlider" type="range" min="0.25" max="10" step="0.05" style="width:100%;margin-bottom:10px;">
            <div style="display:flex;gap:6px;margin-bottom:10px;">
                <input id="rateInput" type="number" min="0.25" max="10" step="0.05" style="flex:1;padding:4px;border:none;border-radius:4px;">
            </div>
            <div style="display:flex;gap:6px;">
                <button id="btnReset" style="flex:1;padding:5px;border:none;border-radius:4px;background:#3684ff;color:#fff;cursor:pointer;">重置1倍</button>
                <button id="btnHide" style="flex:1;padding:5px;border:none;border-radius:4px;background:#555;color:#fff;cursor:pointer;">隐藏面板</button>
            </div>
        `;
        document.documentElement.appendChild(panel);

        const slider = document.getElementById("rateSlider");
        const numInput = document.getElementById("rateInput");
        const btnReset = document.getElementById("btnReset");
        const btnHide = document.getElementById("btnHide");

        slider.value = currentRate;
        numInput.value = currentRate;
        applyAllVideoRate(currentRate);

        slider.addEventListener("input", function () {
            const val = parseFloat(this.value);
            applyAllVideoRate(val);
        });

        numInput.addEventListener("input", function () {
            let val = parseFloat(this.value);
            if (isNaN(val)) val = 1;
            val = Math.max(0.25, Math.min(10, val));
            applyAllVideoRate(val);
        });

        btnReset.onclick = function () {
            applyAllVideoRate(1);
        };

        btnHide.onclick = function () {
            panel.style.display = "none";
        };
    }

    // 定时维护：自动重建面板/按钮、持续修正倍速
    setInterval(function () {
        createToggleBtn();
        if (!document.getElementById(PANEL_ID)) createPanel();
        document.querySelectorAll("video").forEach(function (vid) {
            if (Math.abs(vid.playbackRate - currentRate) > 0.01) {
                vid.playbackRate = currentRate;
            }
        });
    }, 250);

    // 初始化
    setTimeout(function () {
        createToggleBtn();
        createPanel();
    }, 600);

})();