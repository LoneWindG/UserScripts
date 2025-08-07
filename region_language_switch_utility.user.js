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
// @icon         data:image/png;base64,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
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
