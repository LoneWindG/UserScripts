// ==UserScript==
// @name         网站地区&语言快捷切换工具
// @namespace    http://tampermonkey.net/
// @version      2025-08-07
// @description  快速切换部分网站的地区或语言
// @author       Wind
// @match        https://*.xbox.com/*
// @match        https://*.microsoft.com/*
// @match        https://apps.apple.com/*/app/*
// @match        https://www.reddit.com/r/*/comments/*/*
// @icon         https://www.gstatic.com/earth/00-favicon.ico
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

if (window !== top) {
    return;
}

function getBuiltinRegionMap() {
    return new Map([
        ["ms_regions", [ "[zh-CN]中国", "[zh-HK]香港", "[en-US]美国" ]],
        ["apple_regions", [ "[CN]中国", "[HK]香港", "[JP]日本", "[US]美国" ]]
    ]);
}

verifyDomain();

function verifyDomain() {
    var url = new URL(window.location.href);
    var domain = url.hostname;
    // console.log("当前域名: " + domain);
    // console.log("当前PathName: " + url.pathname);
    if (domain.endsWith("reddit.com")) {
        verifyRedditLanguage(url);
        return;
    }
    var regionKey;
    var changeMethod = changeRegion;
    if (domain.endsWith("apps.microsoft.com")) {
        regionKey = "ms_regions";
        changeMethod = changeMsAppsUrl;
    }
    if (domain.endsWith("microsoft.com") || domain.endsWith("xbox.com")) {
        regionKey = "ms_regions";
    }
    else if (domain.endsWith("apps.apple.com")) {
        regionKey = "apple_regions";
    }
    else {
        return;
    }
    registerRegions(url, regionKey, changeMethod);
}

function registerRegions(url, regionKey, changeMethod = null)
{
    var currentCode = getCurrentCode(url);
    // console.log("当前地区代码: " + currentCode);
    if (currentCode === null || currentCode === undefined) {
        return;
    }
    currentCode = currentCode.toLowerCase();

    var regions = GM_getValue(regionKey, null);
    if (regions == null || regions == undefined)
    {
        var builtin_regions = getBuiltinRegionMap().get(regionKey);
        GM_setValue(regionKey, builtin_regions);
        regions = builtin_regions;
    }

    for(var region of regions)
    {
        var codeStart = region.indexOf('[');
        var codeEnd = region.indexOf(']');
        var codeLength = codeEnd - codeStart - 1;
        // console.log("当前地区代码长度: " + codeLength);
        // console.log(codeLength !== 2 && codeLength !== 5);
        // console.log(codeLength === 5 && region[codeStart + 3] !== '-');
        // console.log(region[codeStart + 3]);
        if ((codeLength !== 2 && codeLength !== 5) || (codeLength === 5 && region[codeStart + 3] !== '-')) {
            console.log(`[网站地区&语言快捷切换工具] 菜单名称[${region}]无效, 无法获取有效的地区/语言代码`);
            continue;
        }
        var code = region.substring(codeStart + 1, codeEnd).toLowerCase();
        if (code === currentCode) {
            continue;
        }
        GM_registerMenuCommand(region, createMenuCommand(code, changeMethod));
    }
}

function createMenuCommand(code, method)
{
    return function() { method(code);}
}

function getCurrentCode(url)
{
    var pathname = url.pathname;
    var codeEnd = pathname.indexOf('/', 1);
    if (codeEnd === -1) {
        return null;
    }

    var codeLength = codeEnd - 1;
    // console.log("当前地区代码长度: " + codeLength);
    // console.log(codeLength !== 2 && codeLength !== 5);
    // console.log(codeLength === 5 && pathname[3] !== '-');
    // console.log(pathname[3]);
    if ((codeLength !== 2 && codeLength !== 5) || (codeLength === 5 && pathname[3] !== '-')) {
        return null;
    }
    return pathname.substring(1, codeEnd);
}

function changeRegion(code)
{
    if (code.length !== 2 && (code.length !== 5 || code[2] !== '-'))
    {
        alert(`地区代码[${code}]无效, 编码中间分隔符必须是-且长度必须为5`);
        return;
    }
    const href = window.location.href;
    var url = new URL(href);
    var currentCode = getCurrentCode(url);
    // console.log("当前地区代码: " + currentCode);
    // console.log("目标地区代码: " + code);
    window.location.href = href.replace(`/${currentCode}/`, `/${code}/`);
}

function verifyRedditLanguage(url) {
    var params = url.searchParams;
    if (params.has("tl") && params.get("tl") === "zh-hans") {
        return;
    }
    GM_registerMenuCommand("简体中文", changeReddit2zh);
}

function changeReddit2zh() {
    var url = new URL(window.location.href);
    var params = url.searchParams;
    params.set("tl", "zh-hans");
    if (params.has("show") && params.get("show") === "original") {
        params.delete("show");
    }
    // console.log(url.toString());
    // console.log(url.search);
    // console.log(params.toString());
    window.location.href = url.toString();
}

function changeMsAppsUrl(code)
{
    var url = new URL(window.location.href);
    var params = url.searchParams;
    var gl = params.has("gl") ? params.get("gl").toLowerCase() : null;
    var hl = params.has("hl") ? params.get("hl").toLowerCase() : null;

    var region = (code[3] + code[4]).toUpperCase();
    var change_hl = hl !== code;
    var change_gl = gl !== region;
    if (!change_hl && !change_gl)
    {
        alert("已是该语言&地区, 无需切换");
        return;
    }

    if (change_hl && change_gl)
    {
        change_hl = confirm("当前页面语言和地区可分开切换, 是否切换语言?");
        change_gl = confirm("当前页面语言和地区可分开切换, 是否切换地区?");
        if (!change_hl && !change_gl)
        {
            alert("语言和地区切换均被取消, 未进行切换");
            return;
        }
    }

    hl = change_hl ? code : hl;
    gl = change_gl ? region : gl;
    params.set("hl", hl);
    params.set("gl", gl);

    // console.log(url.toString());
    // console.log(url.search);
    // console.log(params.toString());
    window.location.href = url.toString();
}
