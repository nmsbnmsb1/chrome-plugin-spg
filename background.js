import { generator } from './generator/index.js';

// 默认配置
const DEFAULT_CONFIG = {
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    strict: true
};

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generatePassword') {
        try {
            const config = request.config || DEFAULT_CONFIG;
            const password = generator.generate(config);
            sendResponse({ password });
        } catch (error) {
            console.error('Error generating password:', error);
            sendResponse({ error: 'Failed to generate password' });
        }
    }
    return true; // 保持消息通道开启
});