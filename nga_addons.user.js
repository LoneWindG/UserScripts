// ==UserScript==
// @name         NGA 增强
// @namespace    http://tampermonkey.net/
// @version      2026-01-06
// @description  NGA 论坛功能增强和自定义脚本
// @author       Wind
// @match        https://bbs.nga.cn/*
// @icon         https://bbs.nga.cn/favicon.ico
// @run-at       document-start
// @grant        GM.setClipboard
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    GM_registerMenuCommand("分享链接", copyShareLink, 's');
    GM_addStyle(`
        body > #mmc {
            width: 77%;
            margin: 0 auto !important;
        }

        body > #mmc > #mc > #mainmenu {
            margin-left: 10px;
            margin-right: 10px;
        }

        body > #mmc > #custombg {
            margin-left: 10px;
            margin-right: 10px;
        }
    `);
    var show = GM_getValue("showToptopics", false);
    if (show) {
        showToptopics();
    }else {
        hideToptopics();
    }
})();

function hideToptopics() {
    var style = GM_addStyle(`
        #toptopics span.postrow {
            display: none !important;
        }
    `);
    var commandId = 0;
    commandId = GM_registerMenuCommand("显示版头", () => {
        GM_setValue("showToptopics", true);
        style.remove();
        GM_unregisterMenuCommand(commandId);
        showToptopics();
    });
}

function showToptopics() {
    var commandId = 0;
    commandId = GM_registerMenuCommand("隐藏版头", () => {
        GM_setValue("showToptopics", false);
        GM_unregisterMenuCommand(commandId);
        hideToptopics();
    });
}

function copyShareLink() {
    if (!document.URL.startsWith("https://bbs.nga.cn/thread.php?fid=") && !document.URL.startsWith("https://bbs.nga.cn/read.php?tid=")) {
        return;
    }
    var subject = document.getElementById("postsubject0");
    if (subject === null){
        copyContent(document.title.replace(" NGA玩家社区 P1", "") + "\n" + document.URL);
    }
    else {
        copyContent(subject.innerText + "\n" + document.URL);
    }
}

async function copyContent(content) {
    console.log(content);
    try {
        await GM.setClipboard(content, "text");
        window.alert("分享链接拷贝成功:\n\n" + content);
    }
    catch (err) {
        prompt("由于浏览器限制无法复制到剪切板, 请手动拷贝:", content);
        console.error('拷贝失败: ', err);
    }
}
