// ==UserScript==
// @name         Github的URL工具箱
// @namespace    http://tampermonkey.net/
// @version      2024-08-07
// @description  提供一些Github的URL快捷跳转或复制菜单
// @author       Wind
// @match        https://github.com/*
// @icon         http://github.com/favicon.ico
// @run-at       document-start
// @grant        GM_registerMenuCommand
// ==/UserScript==

//路径组成
//https://github.com/创建人/仓库名/blob/分支名/文件路径
//https://raw.githubusercontent.com/创建人/仓库名/分支名/文件路径

// 这个页面是纯文本, 非HTML, 油猴无法注入, 暂不支持
// @match        https://raw.githubusercontent.com/*
verifyUrlAndRegisterMenu();

function getDomain(raw) {
    return raw ? "https://raw.githubusercontent.com" : "https://github.com";
}

function verifyUrlAndRegisterMenu() {
    var url = window.location.href;
    if (url.startsWith(getDomain(false))) {
        tryRegisterMenu(false);
    }
    else if (url.startsWith(getDomain(true))) {
        tryRegisterMenu(true);
    }
    else {
        console.log("不是一个有效的github链接:" + url);
    }
}


function tryRegisterMenu(raw) {
    var url = window.location.href;
    var array = raw ? null : [];
    var domain = getDomain(raw)
    var sepCount = raw ? 4 : 5;
    if (indexOfSeparator(url, domain.length, sepCount, array) !== sepCount) {
        return;
    }
    //commit, tree, blob三种存储类型, 只有是blob是链接显示的是文件
    if (!raw && url.substring(array[2] + 1, array[3]) !== "blob") {
        return;
    }
    if (raw) {
        GM_registerMenuCommand("跳转回Github", jumpRaw2RepositorieFile);
        GM_registerMenuCommand("跳转回Github对应分支", jumpRaw2RepositorieBranch);
        GM_registerMenuCommand("跳转回Github项目主页", jumpRaw2Repositorie);
    }
    else {
        GM_registerMenuCommand("拷贝文件raw链接", copyRawFileLinkByRepositorie);
        GM_registerMenuCommand("跳转文件raw链接", jumpRepositorieFile2Raw);
    }
}

/**
 * 用于获取https:// 之后的/分隔符的出现次数, 如果array有效, 会把每个获取到的索引按顺序添加进去
 * @param {string} url 要查询的url字符串
 * @param {number} start 开始查询时的索引
 * @param {number} maxCount 最高统计次数, 统计结果达到该次数后会直接返回该值不再进行统计, 传入的值小于0会直接返回0, 等于0时会统计剩余部分的全部次数
 * @param {number[]} array 获取到的索引结果, 默认为null, 不会将结果添加进去
 * @param {number} count 统计开始时的次数, 传入的值小于0会直接返回0
 * @returns 统计到的分隔符次数或传入的最大次数
 */
function indexOfSeparator(url, start, maxCount = 0, array = null, count = 0) {
    if (maxCount < 0 || count < 0) {
        return 0;
    }

    var index = url.indexOf("/", start);
    if (index < 0) {
        return count;
    }

    if (array) {
        array.push(index);
    }
    count++;
    if (maxCount > 0 && count >= maxCount) {
        return count;
    }

    return indexOfSeparator(url, index + 1, maxCount, array, count);
}

/**
 * 根据索引数组, 获取两两索引间的字符串, 并替换数组中的索引
 * @param {string} str
 * @param {Array} array
 */
function substringReplaceIndex(str, array) {
    for (let index = 0; index < array.length; index++) {
        const start = array[index] + 1;
        if (index + 1 == array.length) {
            array[index] = str.substring(start);
        }
        else {
            array[index] = str.substring(start, array[index + 1]);
        }
    }
}

function parseUrlInfo(raw) {
    var url = window.location.href;
    var array = [];

    var domain = getDomain(raw);
    var sepCount = raw ? 4 : 5;
    if (indexOfSeparator(url, domain.length, sepCount, array) !== sepCount) {
        return null;
    }
    substringReplaceIndex(url, array);
    if (!raw && array[2] !== "blob") {
        return null;
    }

    var info = {
        owner: array[0],
        name: array[1],
        branch: array[raw ? 2 : 3],
        file: array[raw ? 3 : 4],
    }
    return info;
}

//从文件raw的url跳转回仓库主分支
function jumpRaw2Repositorie() {
    var info = parseUrlInfo(true);
    if (info) {
        window.location.href = `${getDomain(false)}/${info.owner}/${info.name}`;
    }
}

//从文件raw的url跳转回仓库对应分支主页
function jumpRaw2RepositorieBranch() {
    var info = parseUrlInfo(true);
    if (info) {
        window.location.href = `${getDomain(false)}/${info.owner}/${info.name}/tree/${info.branch}`;
    }
}

//从文件raw的url跳转回仓库对应该文件目录
function jumpRaw2RepositorieFile() {
    var info = parseUrlInfo(true);
    if (info) {
        window.location.href = `${getDomain(false)}/${info.owner}/${info.name}/blob/${info.branch}/${info.file}`;
    }
}

//通过仓库文件的url生成raw对应的url, 并弹窗展示
function copyRawFileLinkByRepositorie() {
    var info = parseUrlInfo(false);
    if (info) {
        const url = `${getDomain(true)}/${info.owner}/${info.name}/${info.branch}/${info.file}`;
        copyContent(url);
    }
}

//从仓库文件的url跳转到raw对应的url(这个菜单其实没啥必要, 界面上都有了)
function jumpRepositorieFile2Raw() {
    var info = parseUrlInfo(false);
    if (info) {
        window.location.href = `${getDomain(true)}/${info.owner}/${info.name}/${info.branch}/${info.file}`;
    }
}

function copyContent(content) {
    let textarea = document.createElement('textarea');
    try {
        textarea.style = "width: 98%; height: 200px; user-select: auto;"
        textarea.value = content;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
    }
    catch (err) {
        prompt("由于浏览器限制无法复制到剪切板, 请手动拷贝:", content);
        console.error('拷贝失败: ', err);
    }
    finally {
        textarea.remove();
    }
}