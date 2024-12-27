// ==UserScript==
// @name         URL Scheme工具箱
// @namespace    http://tampermonkey.net/
// @version      2024-12-27
// @description  提供部分URL Scheme快捷跳转功能
// @author       Wind
// @match        https://www.microsoft.com/*
// @match        https://www.xbox.com/*
// @match        https://microsoft.com/*
// @match        https://xbox.com/*
// @match        https://keylol.com/t*
// @match        https://store.epicgames.com/*
// @icon         https://www.tampermonkey.net/favicon.ico
// @run-at       document-start
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// ==/UserScript==

TryRegisterMsStoreAndXboxCmd();
TryRegisterOpenInChromeCmd();

//#region 在Chrome中打开

//Chrome没有向Windows添加URL Protocol注册表, 所以此功能为自行添加注册表调用Chrome.exe启动
/*注册表内容
Windows Registry Editor Version 5.00

[HKEY_CLASSES_ROOT\openinchrome]
"URL Protocol"=""
@="URL:openinchrome"

[HKEY_CLASSES_ROOT\openinchrome\shell]

[HKEY_CLASSES_ROOT\openinchrome\shell\open]

[HKEY_CLASSES_ROOT\openinchrome\shell\open\command]
@="\"盘符:\\自定义目录\\open_in_chrome.bat\" %1"
*/

/*调用chrome的bat内容, 因为系统调用注册表命令内容内的%1实际是openinchrome://url, 所以要把url部分拆分出来
@set arg=%1
@echo %arg%
@set url_proto=%arg:~0,15%
@echo %url_proto%
@set content=%arg:~15%
@echo %content%
@if not %url_proto% == openinchrome:// (
    @echo 协议不是openinchrome://, 参数:, %arg%
    @pause
    goto end
)
start chrome.exe %content%
::@pause
:end
*/

function TryRegisterOpenInChromeCmd()
{
    var uaData = navigator.userAgentData;
    if (uaData == null || uaData == undefined)
    {
        //部分浏览器不支持Navigator.userAgentData API, 此处使用ua字符串进行粗略判断
        //https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData

        //此方式依赖Windows注册表来调用chrome, 所以只支持Windows上使用
        if (!navigator.userAgent.includes("Windows")) return;

        //桌面浏览器应该只有Firefox不支持userAgentData, 所以此处应该只有Firefox会执行
        if (!navigator.userAgent.includes("Firefox"))
        {
            console.log("[URL Scheme工具箱]检查到不兼容uaData的浏览器, UA:" + navigator.userAgent);
            return;
        }
    }
    else
    {
        //此方式依赖Windows注册表来调用chrome, 所以只支持Windows上使用
        if (uaData.mobile || uaData.platform != "Windows") return;

        var brands = uaData.brands;
        if (brands.length <= 0 || brands[0].brand == "Google Chrome") return;
    }

    GM_registerMenuCommand("在Chrome中打开", function(){
        console.log("openinchrome://" + window.location.href);
        window.open("openinchrome://" + window.location.href);
    }, 'c');
}

//#endregion

//#region 在Microsoft Store和Xbox中打开

function TryRegisterMsStoreAndXboxCmd()
{
    var productId = TryGetMsStoreProductId();
    if (productId == null || productId == undefined || productId == "") return;

    var xboxUrl = "msxbox://game/?productId=" + productId;
    GM_registerMenuCommand("在Xbox APP中打开", function(){
        console.log(xboxUrl);
        window.open(xboxUrl, '_self');
    }, 'x');

    var storeUrl = "ms-windows-store://pdp/?productId=" + productId;
    GM_registerMenuCommand("在Microsoft Store中打开", function(){
        console.log(storeUrl);
        window.open(storeUrl, '_self');
    }, 's');

    var appsUrl = "https://apps.microsoft.com/detail/" + productId + "?hl=zh-cn";
    GM_registerMenuCommand("在Apps Store中打开", function(){
        console.log(appsUrl);
        window.open(appsUrl);
    }, 'a');
}

function TryGetMsStoreProductId()
{
    //匹配链接
    var url = window.location.href;
    var productId = "";
    var strs;
    if (url.startsWith("https://www.microsoft.com/"))
    {
        //https://www.microsoft.com/地区代码/p/产品名/产品ID(9WZDNCRFJBMP)
        strs = url.split('/');
        if (strs.length >= 7 && strs[4] === "p")
        {
            productId = strs[6];
        }
    }
    else if (url.startsWith("https://www.xbox.com/"))
    {
        //https://www.xbox.com/地区代码/games/store/产品名/产品ID
        strs = url.split('/');
        if (strs.length >= 8 && strs[4] === "games" && strs[5] === "store")
        {
            productId = strs[7];
        }
    }

    if (productId.length == 12) return productId;
    if (productId.length > 12) return productId.substring(0, 12);
    return "";
}

//#endregion