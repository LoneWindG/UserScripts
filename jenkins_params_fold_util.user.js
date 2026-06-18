// ==UserScript==
// @name         Jenkins 配置页面参数折叠工具
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Jenkins 配置页面折叠工具：默认折叠显示参数和构建步骤内容, 降低大量参数任务手动维护复杂度
// @author       Gemini
// @match        *://*/job/*/configure
// @match        *://*/*/job/*/configure
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ====== 配置项 ======
    const DEFAULT_COLLAPSED = true; // 是否默认全部折叠？ true=是, false=否
    let globalShowDesc = false;     // 是否默认全局显示参数描述？ true=是, false=否
    // ====================

    // URL路径检查，确保只在任务配置页运行
    if (!/\/job\/.*\/configure(?:\?.*)?$/.test(window.location.href)) return;

    // 向页面注入全局统一的样式表
    const styleBlock = document.createElement('style');
    styleBlock.innerHTML = `
        /* 【通用基础样式】适用于 “▲ 折叠” 按钮 —— 白底细边框 */
        .jk-btn-param {
            padding: 4px 12px;
            font-size: 12px;
            cursor: pointer;
            border: 1px solid #cbd5e1;
            background: #fff;
            border-radius: 4px;
            font-weight: bold;
            color: #475569;
            display: inline-block;
            vertical-align: middle;
            outline: none;
            transition: background 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.1s ease-in-out;
        }
        .jk-btn-param:hover {
            background: #f8fafc;
            border-color: #64748b;
            color: #1e293b;
        }
        .jk-btn-param:active {
            box-shadow: 0 0 0 3px rgba(71, 85, 105, 0.2);
        }

        /* “▼ 展开” 按钮 —— 保留细边框，背景融入底色 */
        .jk-btn-expand-only {
            background: #f0f0f0 !important;
            color: #475569;
        }
        .jk-btn-expand-only:hover {
            background: #cbd5e1 !important;
            border-color: #94a3b8 !important;
            color: #1e293b;
        }

        /* 顶部全局控制按钮样式 */
        .jk-btn-global {
            padding: 5px 12px;
            background: #e2e8f0;
            border: 1px solid #cbd5e1;
            cursor: pointer;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: #334155;
            outline: none;
            transition: background 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.1s ease-in-out;
        }
        .jk-btn-global:hover {
            background: #cbd5e1;
            border-color: #94a3b8;
        }
        .jk-btn-global:active {
            box-shadow: 0 0 0 3px rgba(51, 65, 85, 0.25);
        }
    `;
    document.head.appendChild(styleBlock);

    // 初始化单个区块（参数块 或 构建步骤块）
    function initParamChunk(chunk) {
        if (chunk.classList.contains('jk-processed')) return;
        chunk.classList.add('jk-processed');

        let chunkName = chunk.getAttribute('name') || '';
        let isBuilder = chunkName.toLowerCase().includes('builder');

        let nameInput = null;
        let descInput = null;
        let paramName = '';

        if (isBuilder) {
            let idx = Array.from(chunk.parentNode.children).indexOf(chunk);
            paramName = `Step ${idx}`;
        } else {
            nameInput = chunk.querySelector('input[name="parameter.name"]') ||
                        chunk.querySelector('input[name="_.name"]') ||
                        chunk.querySelector('input[name="name"]');
            paramName = nameInput ? nameInput.value : '';

            descInput = chunk.querySelector('textarea[name="parameter.description"]') ||
                        chunk.querySelector('input[name="parameter.description"]') ||
                        chunk.querySelector('[name="_.description"]') ||
                        chunk.querySelector('[name="description"]');
        }

        let header = chunk.querySelector('.repeated-chunk__header');

        // 过滤所有空格（\\s），"String Parameter" 压缩为 "StringParameter"
        let paramType = header ? header.innerText.replace(/[\s\r\n➖]/g, '').replace(/\?/g, '').trim() : (isBuilder ? 'BuildStep' : 'Parameter');
        paramType = paramType.replace(/Parameter$/, '');

        // 摘要外壳（背景色为 #f5f5f5）
        let summaryRow = document.createElement('div');
        summaryRow.className = 'jk-param-summary';
        summaryRow.style.cssText = 'display: none; flex-direction: column; gap: 6px; padding: 10px 15px; background: #f5f5f5; border: 1px dashed #bbb; border-radius: 4px; margin: 8px 0; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);';

        // 紧凑流式 Flex 布局
        let topRow = document.createElement('div');
        topRow.style.cssText = 'display: flex; align-items: center; gap: 8px;'; // 元素间距微调至 8px，视觉更密实

        // 紧凑的类型标签
        let typeSpan = document.createElement('span');
        typeSpan.style.cssText = 'color:#64748b; font-family:monospace; white-space: nowrap;';
        typeSpan.innerText = `[${paramType}]`;

        // 名称文本
        let titleTextSpan = document.createElement('span');
        titleTextSpan.className = 'jk-title-text';
        titleTextSpan.style.cssText = 'color:#111; font-weight:bold; font-size:14px; white-space: nowrap;';
        titleTextSpan.innerText = paramName || (isBuilder ? '' : '(未命名参数)');

        // 展开按钮
        let expandBtn = document.createElement('button');
        expandBtn.type = 'button';
        expandBtn.innerText = '▼ 展开';
        expandBtn.className = 'jk-btn-param jk-btn-expand-only';

        // 紧凑流式挂载：[类型] 名称 展开
        topRow.appendChild(typeSpan);
        topRow.appendChild(titleTextSpan);
        topRow.appendChild(expandBtn);
        summaryRow.appendChild(topRow);

        let descRow = null;

        // 管理描述行生命周期的核心闭包函数
        function updateDescDisplay() {
            if (isBuilder || !descInput) {
                if (descRow) { descRow.remove(); descRow = null; }
                return;
            }

            let fullDesc = (descInput.value || '').trim();
            if (fullDesc) {
                if (!descRow) {
                    descRow = document.createElement('div');
                    descRow.className = 'jk-desc-row';
                    descRow.style.cssText = 'color: #64748b; font-size: 12px; font-family: sans-serif; white-space: pre-wrap; word-break: break-word; padding-left: 2px; margin-top: 2px;';
                    summaryRow.appendChild(descRow);
                }
                descRow.innerText = fullDesc;
                descRow.style.display = globalShowDesc ? 'block' : 'none';
            } else {
                if (descRow) {
                    descRow.remove();
                    descRow = null;
                }
            }
        }

        if (nameInput) {
            nameInput.addEventListener('input', () => {
                titleTextSpan.innerText = nameInput.value || '(未命名参数)';
            });
        }
        if (descInput) {
            document.addEventListener('input', (e) => {
                if (e.target === descInput) updateDescDisplay();
            });
        }

        chunk.insertBefore(summaryRow, chunk.firstChild);

        // 【二次确认逻辑】拦截原生删除按钮的误触
        let deleteBtn = chunk.querySelector('.repeatable-delete');
        if (deleteBtn && !deleteBtn.classList.contains('jk-confirm-bound')) {
            deleteBtn.classList.add('jk-confirm-bound');
            deleteBtn.addEventListener('click', (e) => {
                const currentName = titleTextSpan.innerText;
                if (!confirm(`⚠️ 确定要删除该项吗？\n\n当前目标: ${currentName}\n\n该操作无法撤销！`)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }, true);
        }

        // 在原生的 Header 里塞入【▲ 折叠】按钮
        if (header) {
            let foldBtn = document.createElement('button');
            foldBtn.type = 'button';
            foldBtn.innerText = '▲ 折叠';
            foldBtn.className = 'jk-btn-param';
            foldBtn.style.cssText = 'margin-left: 15px;';

            header.appendChild(foldBtn);

            foldBtn.addEventListener('click', (e) => { e.preventDefault(); toggle(true); });
        }

        expandBtn.addEventListener('click', (e) => { e.preventDefault(); toggle(false); });

        let originalElements = Array.from(chunk.children).filter(el => el !== summaryRow);

        // 控制折叠/展开的核心函数
        function toggle(collapse) {
            if (collapse) {
                if (isBuilder) {
                    titleTextSpan.innerText = paramName;
                } else {
                    if (nameInput) titleTextSpan.innerText = nameInput.value || '(未命名参数)';
                    updateDescDisplay();
                }
                originalElements.forEach(el => el.style.setProperty('display', 'none', 'important'));
                summaryRow.style.setProperty('display', 'flex', 'important');
                chunk.style.padding = '0';
                chunk.style.border = 'none';
            } else {
                originalElements.forEach(el => el.style.display = '');
                summaryRow.style.display = 'none';
                chunk.style.padding = '';
                chunk.style.border = '';
            }
        }

        chunk.jkToggle = toggle;

        if (DEFAULT_COLLAPSED) {
            setTimeout(() => toggle(true), 100);
        }
    }

    // 全局控制按钮注入逻辑
    function injectGlobalButtons() {
        if (document.getElementById('jk-global-fold-panel')) return;

        let label = Array.from(document.querySelectorAll('label')).find(el => el.textContent.includes('This project is parameterized'));
        if (!label) return;

        let wrapper = label.closest('.jenkins-checkbox-help-wrapper');
        if (!wrapper) return;

        let panel = document.createElement('div');
        panel.id = 'jk-global-fold-panel';
        panel.style.cssText = 'margin-left: 15px; display: inline-flex; gap: 8px; align-items: center; vertical-align: middle;';
        panel.innerHTML = `
            <button type="button" id="jk-btn-fold-all" class="jk-btn-global">📁 全部折叠</button>
            <button type="button" id="jk-btn-unfold-all" class="jk-btn-global">📂 全部展开</button>
            <button type="button" id="jk-btn-toggle-desc" class="jk-btn-global">${globalShowDesc ? '👁️‍🗨️ 隐藏描述' : '👁️ 显示描述'}</button>
        `;

        wrapper.appendChild(panel);

        document.getElementById('jk-btn-fold-all').addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.repeated-chunk').forEach(chunk => {
                if (chunk.jkToggle) chunk.jkToggle(true);
            });
        });

        document.getElementById('jk-btn-unfold-all').addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.repeated-chunk').forEach(chunk => {
                if (chunk.jkToggle) chunk.jkToggle(false);
            });
        });

        document.getElementById('jk-btn-toggle-desc').addEventListener('click', (e) => {
            e.preventDefault();
            globalShowDesc = !globalShowDesc;
            e.target.innerText = globalShowDesc ? '👁️‍🗨️ 隐藏描述' : '👁️ 显示描述';

            document.querySelectorAll('.jk-desc-row').forEach(row => {
                row.style.display = globalShowDesc ? 'block' : 'none';
            });
        });
    }

    // 主执行逻辑
    function mainLoop() {
        injectGlobalButtons();
        document.querySelectorAll('.repeated-chunk').forEach(chunk => {
            initParamChunk(chunk);
        });
    }

    // MutationObserver 监听
    let debounceTimer = null;
    const domObserver = new MutationObserver(() => {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(mainLoop, 50);
    });

    domObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    mainLoop();
})();