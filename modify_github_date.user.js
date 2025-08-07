// ==UserScript==
// @name         Github日期转换
// @namespace    http://tampermonkey.net/
// @version      2025-08-07
// @description  将GitHub的日期显示转换为中文，规则尽量与GitHub一致
// @author       Wind
// @match        https://github.com/*
// @grant        none
// ==/UserScript==

if (window !== top) {
    return;
}

modifyGithubDate();

function modifyGithubDate() {
    'use strict';

    console.log('[Github日期转换] 脚本已加载');

    var title_formatter = new Intl.DateTimeFormat('zh-CN', { dateStyle: "full", timeStyle: "full", timeZone: "Asia/Shanghai" });
    var content_formatter0 = new Intl.DateTimeFormat('zh-CN', { dateStyle: "long", timeZone: "Asia/Shanghai" });
    var content_formatter1 = new Intl.DateTimeFormat('zh-CN', { month: "long", day: "numeric", timeZone: "Asia/Shanghai" });
    var relative_time_formatter = new Intl.RelativeTimeFormat('zh-CN', { numeric: "auto" });

    // 英文到中文的映射
    const map = [
        { re: /^now$/i, zh: '刚刚' },
        { re: /^just now$/i, zh: '刚刚' },
        { re: /^(\d+)\s*seconds?\s*ago$/i, zh: '$1秒前' },
        { re: /^(\d+)\s*minutes?\s*ago$/i, zh: '$1分钟前' },
        { re: /^(\d+)\s*hours?\s*ago$/i, zh: '$1小时前' },
        { re: /^yesterday$/i, zh: '昨天' },
        { re: /^(\d+)\s*days?\s*ago$/i, zh: '$1天前' },
        { re: /^last?\s*week$/i, zh: '上周' },
        { re: /^(\d+)\s*weeks?\s*ago$/i, zh: '$1周前' },
        { re: /^last?\s*month$/i, zh: '上个月' },
        { re: /^(\d+)\s*months?\s*ago$/i, zh: '$1个月前' },
        { re: /^last?\s*year$/i, zh: '去年' },
        { re: /^(\d+)\s*years?\s*ago$/i, zh: '$1年前' },
    ];

    function en2zh(text) {
        for (const { re, zh } of map) {
            if (re.test(text)) {
                // console.log(`[Github日期转换] 匹配到: "${text}" => "${text.replace(re, zh)}"`);
                return text.replace(re, zh);
            }
        }
        return null;
    }

    function translateNode(node) {
        if (!node || node.shadowRoot == null) return;

        const content = node.shadowRoot.textContent;
        if (content.startsWith('\u200b')) {
            return;
        }

        var date = node.date;
        var localeTime = title_formatter.format(date);
        node.title = localeTime;
        var newContent = en2zh(content);

        var always_relative_time = node.tense == "past";
        if (newContent === null) {
            // newContent = formatDate(date);
            newContent = formatDateZh(date, always_relative_time);
            console.log(`[Github日期转换] 格式化日期: "${content}" => "${newContent}"`);
        }
        node.shadowRoot.textContent = "\u200b" + newContent;
    }

    function formatDate(date) {
        const now = new Date();
        var content = "";
        if (date.getFullYear() != now.getFullYear()) {
            content = content_formatter0.format(date);
        } else {
            content = content_formatter1.format(date);
        }
        return content;
    }

    function formatDateZh(date, always_relative_time) {
        const now = new Date();
        var content = "";
        if (date.getFullYear() != now.getFullYear()) {
            if (always_relative_time) {
                content = relative_time_formatter.format(date.getFullYear() - now.getFullYear(), "year");
            }
            else {
                content = content_formatter0.format(date);
            }
        }
        else {
            if (date.getMonth() != now.getMonth()) {
                if (always_relative_time) {
                    content = relative_time_formatter.format(date.getMonth() - now.getMonth(), "month");
                }
                else {
                    content = content_formatter1.format(date);
                }
            }
            else if (date.getDate() != now.getDate()) {
                var dayDiff = date.getDate() - now.getDate();
                if (dayDiff < -5) {
                    var dateWeek = getWeek(date);
                    var nowWeek = getWeek(now);
                    content = relative_time_formatter.format(dateWeek - nowWeek, "week");
                }
                else {
                    content = relative_time_formatter.format(dayDiff, "day");
                }
            }
            else if (date.getHours() != now.getHours()) {
                content = relative_time_formatter.format(date.getHours() - now.getHours(), "hour");
            }
            else if (date.getMinutes() != now.getMinutes()) {
                content = relative_time_formatter.format(date.getMinutes() - now.getMinutes(), "minute");
            }
            else {
                content = relative_time_formatter.format(date.getSeconds() - now.getSeconds(), "second");
            }
        }
        return content;
    }

    function getWeek(date) {
        var weekDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        var firstWeekDayInLastMouth = (weekDay == 0 ? 7 : weekDay) - 1;
        return Math.ceil((firstWeekDayInLastMouth + date.getDate()) / 7);
    }

    function translateCommitTitle(node) {
        var content = node.textContent;
        if (content.startsWith('\u200b')) {
            return;
        }
        const prefix = 'Commits on';
        if (!content.startsWith(prefix)) {
            return;
        }
        var contentDate = content.substring(prefix.length).trim();
        var date;
        try {
            date = new Date(contentDate);
        } catch (e) {
            console.error(`[Github日期转换] 无法解析日期: "${node}"`, e);
            return;
        }
        node.textContent = "\u200b提交于 " + content_formatter0.format(date);
    }

    function modifyAll() {
        const elements = document.querySelectorAll('relative-time');
        // console.log(`[Github日期转换] 检测到DOM变化，重新转换, ${elements.length}个待转换日期元素`);
        if (elements.length !== 0) {
            elements.forEach(translateNode);
        }
        const commitElements = document.querySelectorAll("h3[data-testid='commit-group-title']")
        // console.log(`[Github日期转换] 检测到DOM变化，重新转换, ${commitElements.length}个待转换提交标题元素`);
        if (commitElements.length !== 0) {
            commitElements.forEach(translateCommitTitle);
        }
    }

    // 初始转换
    modifyAll();

    // 监听 DOM 变化，动态转换
    const observer = new MutationObserver(modifyAll);
    observer.observe(document.body, { childList: true, subtree: true });
}
