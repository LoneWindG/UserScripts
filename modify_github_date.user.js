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
    console.log("[Github日期转换]相对时间标签数量: " + relative_times.length);

    var now = new Date();
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
        if (date.getFullYear() != now.getFullYear())
        {
            if (always_relative_time)
            {
                content = relative_time_formatter.format(date.getFullYear() - now.getFullYear(), "year");
            }
            else
            {
                content = content_formatter0.format(date);
            }
        }
        else
        {
            if (date.getMonth() != now.getMonth())
            {
                if (always_relative_time)
                {
                    content = relative_time_formatter.format(date.getMonth() - now.getMonth(), "month");
                }
                else
                {
                    content = content_formatter1.format(date);
                }
            }
            else if (date.getDate() != now.getDate())
            {
                var dayDiff = date.getDate() - now.getDate();
                if (dayDiff < -5)
                {
                    var dateWeek = getWeek(date);
                    var nowWeek = getWeek(now);
                    content = relative_time_formatter.format(dateWeek - nowWeek, "week");
                }
                else 
                { 
                    content = relative_time_formatter.format(dayDiff, "day");
                }
            }
            else if (date.getHours() != now.getHours())
            {
                content = relative_time_formatter.format(date.getHours() - now.getHours(), "hour");
            }
            else if (date.getMinutes() != now.getMinutes())
            {
                content = relative_time_formatter.format(date.getMinutes() - now.getMinutes(), "minute");
            }
            else
            {
                content = relative_time_formatter.format(date.getSeconds() - now.getSeconds(), "second");
            }
        }

        item.shadowRoot.textContent = content;
    }
}

function getWeek(date){
    var weekDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    var firstWeekDayInLastMouth = (weekDay == 0 ? 7 : weekDay) - 1;
    return Math.ceil((firstWeekDayInLastMouth + date.getDate()) / 7);
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
