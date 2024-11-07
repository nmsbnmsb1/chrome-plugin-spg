export class PasswordGenerator {
    constructor(container) {
        this.container = container;
        // 加载样式文件
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('styles/utilities.css');
        document.head.appendChild(link);
        //
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="flex flex-col gap-4">
                <div class="text-center">
                    <div class="flex items-center justify-center gap-2">
                        <h2 class="text-xl font-bold text-gray-700">密码生成器</h2>
                        <span id="versionNumber" class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">v1.0.0</span>
                    </div>
                    <hr class="my-3 border-gray-200">
                </div>

                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2">
                        <label>密码长度：</label>
                        <input type="number" id="passwordLength" min="8" max="32" value="20"
                            class="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="includeUppercase" checked class="w-4 h-4">
                            <label>包含大写字母</label>
                        </div>

                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="includeLowercase" checked class="w-4 h-4">
                            <label>包含小写字母</label>
                        </div>

                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="includeNumbers" checked class="w-4 h-4">
                            <label>包含数字</label>
                        </div>

                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="includeSymbols" checked class="w-4 h-4">
                            <label>包含特殊符号</label>
                        </div>
                    </div>

                    <div class="flex flex-col gap-2 w-full">
                        <input type="text" id="generatedPassword" readonly
                            class="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50">
                        <div class="grid grid-cols-2 gap-2">
                            <button id="generateButton"
                                class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer">
                                生成密码
                            </button>
                            <button id="copyButton"
                                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer">
                                复制
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();

        // 获取版本号并显示
        document.getElementById('versionNumber').textContent =
            `v${chrome.runtime.getManifest().version}`;
    }

    bindEvents() {
        this.passwordLength = this.container.querySelector('#passwordLength');
        this.includeUppercase = this.container.querySelector('#includeUppercase');
        this.includeLowercase = this.container.querySelector('#includeLowercase');
        this.includeNumbers = this.container.querySelector('#includeNumbers');
        this.includeSymbols = this.container.querySelector('#includeSymbols');
        this.generatedPassword = this.container.querySelector('#generatedPassword');
        this.generateButton = this.container.querySelector('#generateButton');
        this.copyButton = this.container.querySelector('#copyButton');

        this.generateButton.addEventListener('click', () => this.generatePassword());
        this.copyButton.addEventListener('click', () => this.copyPassword());

        // 加载保存的配置
        this.loadConfig();

        // 监听配置变化
        [this.passwordLength, this.includeUppercase, this.includeLowercase,
        this.includeNumbers, this.includeSymbols].forEach(element => {
            element.addEventListener('change', () => this.saveConfig());
        });
    }

    async loadConfig() {
        const result = await chrome.storage.local.get('passwordConfig');
        if (result.passwordConfig) {
            this.passwordLength.value = result.passwordConfig.length;
            this.includeUppercase.checked = result.passwordConfig.uppercase;
            this.includeLowercase.checked = result.passwordConfig.lowercase;
            this.includeNumbers.checked = result.passwordConfig.numbers;
            this.includeSymbols.checked = result.passwordConfig.symbols;
        }
    }

    async saveConfig() {
        const config = {
            length: parseInt(this.passwordLength.value),
            uppercase: this.includeUppercase.checked,
            lowercase: this.includeLowercase.checked,
            numbers: this.includeNumbers.checked,
            symbols: this.includeSymbols.checked,
            strict: true
        };
        await chrome.storage.local.set({ passwordConfig: config });
    }

    async generatePassword() {
        const config = {
            length: parseInt(this.passwordLength.value),
            uppercase: this.includeUppercase.checked,
            lowercase: this.includeLowercase.checked,
            numbers: this.includeNumbers.checked,
            symbols: this.includeSymbols.checked,
            strict: true
        };

        const response = await chrome.runtime.sendMessage({
            action: 'generatePassword',
            config
        });

        if (response.password) {
            this.generatedPassword.value = response.password;
            this.copyButton.textContent = '已复制!';
            setTimeout(() => {
                this.copyButton.textContent = '复制';
            }, 1500);
            await this.saveConfig();
            //
            // 触发input事件，确保其他脚本能感知到值的变化
            this.generatedPassword.dispatchEvent(new Event('input', { bubbles: true }));
            // 触发change事件
            this.generatedPassword.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    async copyPassword() {
        if (this.generatedPassword.value) {
            await navigator.clipboard.writeText(this.generatedPassword.value);
            this.copyButton.textContent = '已复制!';
            setTimeout(() => {
                this.copyButton.textContent = '复制';
            }, 1500);
        }
    }
} 