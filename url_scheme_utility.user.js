// ==UserScript==
// @name         URL Scheme工具箱
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  提供部分URL Scheme快捷跳转功能
// @author       Wind
// @match        https://*/*
// @icon         https://www.tampermonkey.net/favicon.ico
// @run-at       document-start
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// ==/UserScript==

TryRegisterMsStoreAndXboxCmd();
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

GM_registerMenuCommand("在Chrome中打开", function(){
    console.log("openinchrome://" + document.URL);
    window.open("openinchrome://" + document.URL);
}, 'c');

//#endregion

//#region 在Microsoft Store和Xbox中打开

function TryRegisterMsStoreAndXboxCmd()
{
    var productId = TryGetMsStoreProductId();
    if (productId == null || productId == undefined || productId == "") return;

    var storeUrl = "ms-windows-store://pdp/?productId=" + productId;
    GM_registerMenuCommand("在Microsoft Store中打开", function(){
        console.log(storeUrl);
        window.open(storeUrl, '_self');
    }, 's');

    var xboxUrl = "msxbox://game/?productId=" + productId;
    GM_registerMenuCommand("在Xbox APP中打开", function(){
        console.log(xboxUrl);
        window.open(xboxUrl, '_self');
    }, 's');
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