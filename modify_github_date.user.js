// ==UserScript==
// @name         Github日期转换
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Github日期转换
// @author       Wind
// @match        https://github.com/*
// @icon         http://github.com/favicon.ico
// @grant        GM_registerMenuCommand
// ==/UserScript==

GM_registerMenuCommand("[Github日期转换]强制执行", modifyGithubDate);
modifyGithubDate();
setTimeout(modifyGithubDate, 2000);
listenClick();

function modifyGithubDate(){
    var relative_times = document.getElementsByTagName("relative-time");
    console.log("[Github日期转换]relative_time count: " + relative_times.length);

    var now_year = new Date().getFullYear();
    var now_time = Date.now();
    var title_formatter = new Intl.DateTimeFormat('zh-CN', { dateStyle:"full", timeStyle:"full", timeZone: "Asia/Shanghai" });
    var content_formatter0 = new Intl.DateTimeFormat('zh-CN', { dateStyle:"long", timeZone: "Asia/Shanghai" });
    var content_formatter1 = new Intl.DateTimeFormat('zh-CN', { month:"long", day:"numeric", timeZone: "Asia/Shanghai" });
    var relative_time_formatter = new Intl.RelativeTimeFormat('zh-CN', { numeric:"auto" });
    for (var item of relative_times) {
        if (item.getAttribute("modified") != null) continue;
        if (item.shadowRoot == null) continue;

        item.setAttribute("modified", "1");
        var date = item.date;
        var localeTime = title_formatter.format(date);
        item.title = localeTime;
        // console.log("[Github日期转换]localeTime: " + localeTime.toString());
        
        var content = item.shadowRoot.textContent;
        var always_relative_time = item.tense == "past";
        if (date.getFullYear() != now_year)
        {
            if (always_relative_time)
            {
                content = relative_time_formatter.format(date.getFullYear() - now_year, "year");
            }
            else
            {
                content = content_formatter0.format(date);
            }
        }
        else
        {
            var diff = (date.getTime() - now_time) / 1000;
            if (diff < -30 * 24 * 60 * 60)
            {
                if (always_relative_time)
                {
                    content = relative_time_formatter.format(Math.ceil(diff / (30 * 24 * 60 * 60)), "month");
                }
                else
                {
                    content = content_formatter1.format(date);
                }
            }
            else if (diff < -24 * 60 * 60)
            {
                content = relative_time_formatter.format(Math.ceil(diff / (24 * 60 * 60)), "day");
            }
            else if (diff < -60 * 60)
            {
                content = relative_time_formatter.format(Math.ceil(diff / (60 * 60)), "hour");
            }
            else if (diff < -60)
            {
                content = relative_time_formatter.format(Math.ceil(diff / 60), "minute");
            }
            else
            {
                content = relative_time_formatter.format(diff, "second");
            }
        }

        item.shadowRoot.textContent = content;
    }
}

function listenClick(){
    document.body.addEventListener("click", modifyAfterClick);
    // var assets = document.getElementsByClassName("f3 text-bold d-inline mr-3");
    // console.log(assets.length);
    // for (var item of assets) {
    //     item.removeEventListener('click', modifyAfterClick);
    //     item.addEventListener('click', modifyAfterClick);
    // }

    // var tabs = document.getElementsByClassName("js-selected-navigation-item subnav-item");
    // for (var item of tabs) {
    //     item.removeEventListener('click', modifyAfterClick);
    //     item.addEventListener('click', modifyAfterClick);
    // }
}

function modifyAfterClick(event){
    var target = event.target || event.srcElement;
    var nodeName = target.nodeName.toLocaleLowerCase();
    if (nodeName != "a" && nodeName != "span") return;

    console.log("[Github日期转换]modifyAfterClick");
    setTimeout(() =>{
        modifyGithubDate();
        listenClick();
    }, 2000);
}
