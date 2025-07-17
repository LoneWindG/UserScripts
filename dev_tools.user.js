// ==UserScript==
// @name         开发工具箱
// @namespace    http://tampermonkey.net/
// @version      2025-07-17
// @description  一个简单的开发工具箱, 提供一些常用的开发功能
// @author       Wind
// @match        https://*/*
// @icon         data:image/webp;base64,UklGRkQCAABXRUJQVlA4WAoAAAAQAAAAPwAAPwAAQUxQSEkAAAABR0A0gpl1n0wji7qICJWcGahpJKt6yRPxDECPFiokvJoKA+9jfQWQRPR/AmRngz5kVaNPb8MW1EnK+/ualAd1LmWrmKeyk/ApAFZQOCDUAQAAUAoAnQEqQABAAD7RYKVOqCWjIiYM6QAaCWoAybg08JMAA9XPTVd5pK/Q37YE4BBQmYJ5lOLfa492aUaT7/QXg1OwcMU+uUr4fmGCdZN6oujwS3idWqK0o8zk6AD8ZFUOoOxffzLFcNem9rec8X/9ZX//Mr//mV/tGbUQLFgK+DOvBvV5QlnYCMcSgq5TRyo7HWv8YJeBtahNHFTntfpt3DcWsTkwTMUWHOVQQn+0vjZdLVPftNTbY59qrfO5mtlmuFHlbABbOz0qs4ceNZ0KiRRPyZGBd/0rPn2Q+2GP96BgQDR6m1YM4QyFZ2aZCER95SNbhEqnrrqLY+GIvVJvs6cUATRAl5Ic5znT16s3uemOBncwr3dkSh+dHbY7b7iIaC8K2YJ5F93QEkdsOZTu7ZnE8LaMcx1mzePBFwBBA0RVj3SO21fHDiRDbvx71B0g0W8/jFz5jGgmBCzioa7EvEfXK7Sz4NqNtuS2JwhaBPBtBp7TuGPpZXcXlrTDdLM5pJBorl5k7YIxWtcCnOBksWD5QGojKc0FEmQr86E2d1gpY0u9/K6dxwwKQ5fbm6rbZ0VWTQeoubtemvG/NvH7OkLi/LGF1akn1Qi/AjawfzNgT4AA
// @grant        GM_registerMenuCommand
// @grant        GM.setClipboard
// ==/UserScript==

GM_registerMenuCommand("XOR加密", xorEncryptMenu);
GM_registerMenuCommand("XOR解密", xorDecryptMenu);

function xorEncryptMenu() {
    xorCryptoMenu(true);
}

function xorDecryptMenu() {
    xorCryptoMenu(false);
}

function xorCryptoMenu(isEncrypt) {
    const inputLabel = isEncrypt ? '请输入要加密的文本:' : '请输入要解密的Base64文本:';
    const inputEmptyMsg = isEncrypt ? '要加密的文本不能为空' : '要解密的Base64文本不能为空';
    const keyLabel = '请输入密钥:';
    const keyEmptyMsg = '密钥不能为空';

    const input = prompt(inputLabel);
    if (input === null) {
        alert('操作已取消');
        return;
    }
    if (input.length <= 0) {
        alert(inputEmptyMsg);
        return;
    }
    const key = prompt(keyLabel);
    if (key === null) {
        alert('操作已取消');
        return;
    }
    if (key.length <= 0) {
        alert(keyEmptyMsg);
        return;
    }

    let output = isEncrypt ? xorEncrypt(input, key) : xorDecrypt(input, key);
    let verifyInput = isEncrypt ? xorDecrypt(output, key) : xorEncrypt(output, key);
    const operateType = isEncrypt ? '加密' : '解密';
    if (input !== verifyInput) {
        const verifyType = isEncrypt ? '解密' : '加密';
        const inputType = isEncrypt ? '明文' : '密文';
        alert(`${operateType}失败，${verifyType}校验不通过:
            ${inputType}:${input}
            密钥:${key}
            ${operateType}结果:${output}
            ${verifyType}校验结果:${verifyInput}`);
        return;
    }
    prompt(operateType + '后的结果:', output);
}

function xorEncrypt(text, key) {
    const textBytes = toUtf8Bytes(text);
    const keyBytes = toUtf8Bytes(key);
    const resultBytes = xor(textBytes, keyBytes);
    return bytesToBase64(resultBytes);
}

function xorDecrypt(base64, key) {
    const encryptedBytes = base64ToBytes(base64);
    const keyBytes = toUtf8Bytes(key);
    const resultBytes = xor(encryptedBytes, keyBytes);
    return toUtf8String(resultBytes);
}

function xor(bytes, key) {
    return bytes.map((b, i) => b ^ key[i % key.length]);
}

function toUtf8Bytes(str) {
    return new TextEncoder().encode(str);
}

function toUtf8String(bytes) {
    return new TextDecoder().decode(bytes);
}

function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

function bytesToBase64(bytes) {
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
}

