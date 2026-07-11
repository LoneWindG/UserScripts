// ==UserScript==
// @name         SteamWorks 生成版本日期转换
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  将 Steam 生成版本页面及详情页的美西时间转换为东八区 24 小时制（仅支持中/繁）
// @author       Gemini
// @match        https://partner.steamgames.com/apps/builds/*
// @match        https://partner.steamgames.com/apps/builddetails/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const WIDE_SPACER = '&ensp;';

    // 处理原始时间的显示格式 (例如转换为 "7 月 11 日  12:13  a.m.  PDT")
    function formatRawText(text, ptZoneName) {
        const match = text.match(/(.*?)(上午|下午)\s*(\d+:\d+)(.*)/);
        if (match) {
            const prefix = match[1].trim();
            const ampm = match[2] === '下午' ? 'p.m.' : 'a.m.';
            const timeStr = match[3];

            return `${prefix}${WIDE_SPACER}${timeStr}${WIDE_SPACER}${ampm}${WIDE_SPACER}${ptZoneName}`;
        }
        return `${text}${WIDE_SPACER}${ptZoneName}`;
    }

    // 核心时间转换函数
    function convertSteamTimeToCST(text) {
        const match = text.match(/(?:(\d+)\s*年\s*)?(\d+)\s*月\s*(\d+)\s*日\s*(上午|下午)\s*(\d+):(\d+)/);
        if (!match) return null;

        const currentYear = new Date().getFullYear();
        const year = match[1] ? parseInt(match[1]) : currentYear;
        const month = parseInt(match[2]) - 1;
        const day = parseInt(match[3]);
        const isPM = match[4] === '下午';
        let hour = parseInt(match[5]);
        const minute = parseInt(match[6]);

        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;

        const ptDate = new Date(year, month, day, hour, minute, 0);

        let ptZoneName = "PDT";
        try {
            ptZoneName = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Los_Angeles',
                timeZoneName: 'short'
            }).formatToParts(ptDate).find(p => p.type === 'timeZoneName').value;
        } catch(e) {
            ptZoneName = (month >= 2 && month <= 10) ? "PDT" : "PST";
        }

        const offsetHours = (ptZoneName === 'PDT') ? 15 : 16;
        const cstTimestamp = ptDate.getTime() + (offsetHours * 60 * 60 * 1000);
        const cstDate = new Date(cstTimestamp);

        const cstMonth = cstDate.getMonth() + 1;
        const cstDay = cstDate.getDate();
        const cstHour = String(cstDate.getHours()).padStart(2, '0');
        const cstMin = String(cstDate.getMinutes()).padStart(2, '0');

        // 去掉了末尾的 CST 后缀
        const formattedCST = `${cstMonth} 月 ${cstDay} 日${WIDE_SPACER}${cstHour}:${cstMin}`;
        const formattedRaw = formatRawText(text, ptZoneName);

        return {
            cstTimeStr: formattedCST,
            rawTimeStr: formattedRaw
        };
    }

    // 处理时间单元格的统一渲染函数
    function handleTimeCell(td, isBlockStyle) {
        const rawText = td.innerText.trim();
        if ((rawText.includes('上午') || rawText.includes('下午')) && !td.dataset.converted) {
            const result = convertSteamTimeToCST(rawText);
            if (result) {
                if (isBlockStyle) {
                    // 列表样式：原时间换行居下
                    td.innerHTML = `<strong>${result.cstTimeStr}</strong><span style="color: #888; font-size: 10px; display:block;">(${result.rawTimeStr})</span>`;
                } else {
                    // 详情样式：原时间紧跟其后
                    td.innerHTML = `<strong>${result.cstTimeStr}</strong><span style="color: #888; font-size: 12px; margin-left: 10px;">(${result.rawTimeStr})</span>`;
                }
                td.dataset.converted = "true";
            }
        }
    }

    // 处理【版本列表页】
    function processBuildsPage() {
        // 1. 转换原本的旧生成版本列表 (.build_row)
        const buildRows = document.querySelectorAll('tr.build_row');
        buildRows.forEach(row => {
            const tds = row.querySelectorAll('td');
            tds.forEach(td => handleTimeCell(td, true));
        });

        // 2. 转换底部的历史/全部版本 table (匹配首列包含时间的 td)
        const appFrame = document.getElementById('appFrame');
        if (appFrame) {
            const tables = appFrame.querySelectorAll('table');
            if (tables.length > 0) {
                const lastTable = tables[tables.length - 1]; // 锁定最后一个大表格
                const rows = lastTable.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const firstTd = row.querySelector('td'); // 拿到首列 td
                    if (firstTd) {
                        handleTimeCell(firstTd, true); // 应用列表换行样式
                    }
                });
            }
        }
    }

    // 处理【版本详情页】
    function processDetailsPage() {
        const appFrame = document.getElementById('appFrame');
        if (!appFrame) return;

        const rows = appFrame.querySelectorAll('table tbody tr');
        rows.forEach(row => {
            const tds = row.querySelectorAll('td');
            if (tds.length >= 3) {
                const titleText = tds[0].innerText.trim();
                if (titleText.includes('版本时间') || titleText.includes('版本時間')) {
                    handleTimeCell(tds[2], false); // 应用单行样式
                }
            }
        });
    }

    function run() {
        const url = window.location.href;
        if (url.includes('/builddetails/')) {
            processDetailsPage();
        } else {
            processBuildsPage();
        }
    }

    setTimeout(run, 500);

    const observer = new MutationObserver(() => {
        run();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();