// ==UserScript==
// @name         NGA 增强
// @namespace    http://tampermonkey.net/
// @version      2025-04-07
// @description  *
// @author       Wind
// @match        https://bbs.nga.cn/read.php?tid=*
// @icon         https://bbs.nga.cn/favicon.ico
// @grant        none
// ==/UserScript==

addNgaShareBtn();

function addNgaShareBtn() {
    var postInfo0 = document.getElementById("postInfo0");
    for (const element of postInfo0.children) {
        if (element.title == "分享菜单") {
            var clone = element.cloneNode(true);
            clone.addEventListener("click", copyShareLink, false);
            postInfo0.insertBefore(clone, element);
            element.remove();
            return;
        }
    }
    var subject = document.getElementById("postcontentandsubject0");
    if (subject === null) {
        return;
    }

    var child = subject.firstChild;
    console.log(child);
    if (child === null || child.nodeName.toLowerCase() != "div") {
        return;
    }

    child = child.firstChild;
    console.log(child);
    if (child === null || child.nodeName.toLowerCase() != "div") {
        return;
    }

    child = child.firstChild;
    console.log(child);
    if (child === null || child.nodeName.toLowerCase() != "span") {
        return;
    }

    var a = document.createElement("a");
    a.className = " white";
    a.title = "分享";
    a.href = "javascript:void(0)";
    a.innerHTML = `&nbsp;<svg xmlns="http://www.w3.org/1999/xlink" class="iconfont" style="margin: 0px 0.5em 0px 0.3em; height: 1em; transform: translate(0px, 15%); user-select: auto;" viewBox="0 0 896 1000 "><path d="M899.4 425.9 600.7 134.7c-22.6-24.3-49.8 0-49.8 38.8v145.6c-212.7 0-393.8 140.7-479.8 330-31.7 63.1-49.8 131.1-63.4 199C5.1 862.1 0 900 0 900h79.6s9.4-15.1 14.1-22.7c99.6-169.9 267.1-281.5 457.2-281.5v160.2c0 38.8 27.2 63.1 49.8 38.8l298.7-291.2c18.1-22.2 18.1-55.4 0-77.7Z" fill-rule="evenodd" style="user-select: auto;"></path></svg>&nbsp;&nbsp;`;
    a.addEventListener("click", copyShareLink, false);
    child.insertBefore(a, child.firstChild);
}

function copyShareLink() {
    var subject = document.getElementById("postsubject0");
    if (subject === null){
        copyContent(document.URL);
    }
    else {
        copyContent(subject.innerText + "\n" + document.URL);
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
