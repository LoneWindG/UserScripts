// ==UserScript==
// @name         URL Scheme工具箱
// @namespace    http://tampermonkey.net/
// @version      2025-08-07
// @description  提供部分URL Scheme快捷跳转功能
// @author       Wind
// @match        https://*/*
// @icon         data:image/png;base64,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
// @run-at       document-start
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// ==/UserScript==

if (window !== top) {
    return;
}

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
@set base64=%arg:~15,-1%
@echo %base64:_==% > %TEMP%\\openinchrome.txt
@certutil -f -decode %TEMP%\\openinchrome.txt %TEMP%\\openinchrome_decode.txt
@type %TEMP%\\openinchrome_decode.txt
@set /p url=<%TEMP%\\openinchrome_decode.txt
@if not %url_proto% == openinchrome:// (
    @echo 协议不是openinchrome://, 参数:, %arg%
    @pause
    goto end
)
start chrome.exe %url%
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
        var url = window.btoa(window.location.href).replaceAll('=', '_');
        console.log("openinchrome://" + url);
        window.open("openinchrome://" + url);
    }, 'c');
}

//#endregion

//#region 在Microsoft Store和Xbox中打开

function TryRegisterMsStoreAndXboxCmd()
{
    var productId = TryGetMsStoreProductId();
    if (productId === null || productId === undefined || productId == "") return;

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