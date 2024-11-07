// 创建弹出层
function createPopup() {
    const popup = document.createElement('div');
    popup.className = 'fixed z-50 bg-white rounded-lg shadow-lg p-2 border border-gray-200';

    const generateButton = document.createElement('button');
    generateButton.className = 'px-3 py-1 bg-green-500 border-none text-xl text-white rounded hover:bg-green-600 cursor-pointer';
    generateButton.textContent = '创建密码';

    popup.appendChild(generateButton);
    popup.left = -10000 + 'px';
    popup.top = -10000 + 'px';

    return popup;
}

// 获取元素的绝对位置
function getAbsolutePosition(element) {
    const rect = element.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.bottom + window.scrollY
    };
}

// 初始化popup
const popup = createPopup();
let currentInput = null;
let currentPasswordInputs = []

// 监听所有password类型的input
document.addEventListener('click', function (e) {
    let clickedPasswordInput = null;
    //
    let passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        if (e.target === input) {
            clickedPasswordInput = input;
        }
    });
    if (!clickedPasswordInput) {
        let index = currentPasswordInputs.indexOf(e.target)
        if (index >= 0) clickedPasswordInput = currentPasswordInputs[index]
    }
    // Add each password input to currentPasswordInputs if not already present
    passwordInputs.forEach(input => {
        if (!currentPasswordInputs.includes(input)) {
            currentPasswordInputs.push(input);
        }
    });

    if (clickedPasswordInput) {
        currentInput = clickedPasswordInput;
        currentInput.select();
        document.body.appendChild(popup);
        popup.style.display = 'block';
        //
        const pos = getAbsolutePosition(clickedPasswordInput);
        const inputHeight = clickedPasswordInput.offsetHeight;
        const popupHeight = popup.offsetHeight;

        popup.style.left = pos.left + 'px';
        popup.style.top = (pos.top - inputHeight - popupHeight - 5) + 'px'; // 在输入框上方5px的位置

    } else if (!popup.contains(e.target)) {
        popup.style.display = 'none';
    }
});

// 处理生成密码按钮点击
popup.querySelector('button').addEventListener('click', async function () {
    if (!currentInput) return;

    try {
        // 获取存储的配置
        const result = await chrome.storage.local.get('passwordConfig');
        const config = result.passwordConfig || {
            length: 20,
            uppercase: true,
            lowercase: true,
            numbers: true,
            symbols: true,
            strict: true
        };

        // 向background script发送消息来生成密码
        chrome.runtime.sendMessage({ action: 'generatePassword', config }, response => {
            if (response.password) {
                currentInput.value = response.password;
                popup.style.display = 'none';
                currentInput.type = "text";
                currentInput.select()
                navigator.clipboard.writeText(response.password);
            }
        });
    } catch (error) {
        console.error('Error generating password:', error);
    }
}); 