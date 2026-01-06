// ==UserScript==
// @name         Keylol 增强
// @namespace    http://tampermonkey.net/
// @version      2026-01-06
// @description  其乐Keylol 论坛功能增强和自定义脚本
// @author       Wind
// @match        https://keylol.com/*
// @icon         https://keylol.com/favicon.ico
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
        .index_navi_left { min-width: 720px !important; }
        .bbs_top.frame.move-span.cl.frame-1-1 { min-height: 462px !important; }
        .module.cl.xl.xl1 { min-height: 422px !important; }
    `);
    addBodyStyle("nv_forum", "1260px");
    addBodyStyle("nv_home", "1260px");

})();

function addBodyStyle(bobyId, minWidth) {
    GM_addStyle(`
        #${bobyId} {
            display: flex;
            flex-direction: column;
            min-width: ${minWidth} !important;
        }

        #${bobyId} > header {
            min-width: ${minWidth} !important;
        }

        #${bobyId} > div {
            order: 10;
        }

        #${bobyId} > #wp {
            order: 1;
            min-width: ${minWidth} !important;
        }
        #${bobyId} > #wp > * {
            min-width: ${minWidth};
        }

        #${bobyId} > #wp > .index_middle_subject.clearfix > div {
            min-width: 32%;
        }

        #${bobyId} > .floatcontainer.doc_header.wp.cl {
            order: 2;
            min-width: ${minWidth};
        }

        #${bobyId} > .floatcontainer.doc_header.wp.cl > * {
            min-width: ${minWidth};
        }

        #${bobyId} > .rnd_ai_f {
            min-width: ${minWidth};
        }

        #${bobyId} > .rnd_ai_f > a > img {
            width: ${minWidth} !important;
            height: auto !important;
            object-fit: cover !important; /* 防止图片拉伸变形 */
        }
    `);
}