// ==UserScript==
// @name         Bilibili 分享
// @namespace    http://tampermonkey.net/
// @version      2025-06-17
// @description  自动拷贝QQ/Weibo的B站视频分享内容
// @author       Wind
// @match        https://connect.qq.com/widget/shareqq/index.html?url=*
// @match        https://service.weibo.com/share/share.php?url=*
// @run-at       document-start
// @grant        GM.setClipboard
// @icon         https://i0.hdslb.com/bfs/static/jinkela/long/images/favicon.ico
// ==/UserScript==

copyBlibliShareUrl();

function copyBlibliShareUrl() {
    var url = new URL(document.URL);
    if (url.hostname != "connect.qq.com" && url.hostname != "service.weibo.com") {
        console.log("跳过自动拷贝分享链接, 未知的域名: " + url.hostname)
        return;
    }

    var params = url.searchParams;
    params.forEach((value, key) => {
        console.log(`分享参数:${key} - ${value}`);
    });

    var shareUrl = params.get("url");
    if (shareUrl == null || !shareUrl.startsWith("https://www.bilibili.com/video/")) {
        return;
    }
    var title = params.get("desc");
    title = title == null ? params.get("title") : title;
    if (title == null) {
        copyContent(shareUrl);
    }
    else {
        copyContent(`${title}\n${shareUrl}`);
    }
}

async function copyContent(content) {
    console.log(content);
    var copy = false;
    try {
        await GM.setClipboard(content, "text");
        copy = true;
    }
    catch (err) {
        prompt("由于浏览器限制无法复制到剪切板, 请手动拷贝:", content);
        console.error('拷贝失败: ', err);
    }
    if (copy && window.confirm("自动拷贝分享链接成功, 点击确认关闭标签页\n\n" + content))
    {
        window.close();
    }
}
