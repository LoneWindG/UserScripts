// ==UserScript==
// @name         NGA 增强
// @namespace    http://tampermonkey.net/
// @version      2025-06-23
// @description  *
// @author       Wind
// @match        https://bbs.nga.cn/*
// @icon         https://bbs.nga.cn/favicon.ico
// @run-at       document-start
// @grant        GM.setClipboard
// @grant        GM_registerMenuCommand
// ==/UserScript==

GM_registerMenuCommand("分享链接", copyShareLink, 's');

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
        window.alert("拷贝成功");
    }
    catch (err) {
        prompt("由于浏览器限制无法复制到剪切板, 请手动拷贝:", content);
        console.error('拷贝失败: ', err);
    }
}
