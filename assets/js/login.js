// assets/js/login.js

/**
 * 通过检查 User-Agent 字符串来判断是否为移动设备。
 * @returns {boolean} - 如果是移动设备则返回 true，否则返回 false。
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// --- 自动登录检查 ---
// 在脚本最开始运行时，检查localStorage中是否已有课程数据
// 如果有，则直接跳转到对应的页面，无需停留在登录页
const cachedEvents = localStorage.getItem('courseEvents');
if (cachedEvents) {
    if (isMobileDevice()) {
        window.location.replace('mobile.html');
    } else {
        window.location.replace('index.html');
    }
}

// --- DOM 元素获取 ---
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');

// --- 事件监听 ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // 阻止表单默认的刷新页面的行为

    const username = usernameInput.value;
    const password = passwordInput.value;

    // UI反馈：禁用按钮并显示加载信息
    submitBtn.disabled = true;
    submitBtn.textContent = '正在获取...';
    statusMessage.textContent = '';
    statusMessage.style.color = 'black';

    try {
        // 调用后端API
        const response = await fetch('/api/get-schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            // 如果后端返回错误（如密码错误），显示错误信息
            throw new Error(data.error || '未知错误');
        }

        // 成功获取数据
        statusMessage.textContent = '获取成功！正在跳转...';
        statusMessage.style.color = 'green';
        
        // 将课程数据存储在 localStorage 中
        localStorage.setItem('courseEvents', JSON.stringify(data));
        
        // 延迟一小段时间让用户看到成功信息，然后根据设备类型跳转
        setTimeout(() => {
            if (isMobileDevice()) {
                window.location.href = 'mobile.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);

    } catch (error) {
        statusMessage.textContent = `错误: ${error.message}`;
        statusMessage.style.color = 'red';
        // 恢复按钮
        submitBtn.disabled = false;
        submitBtn.textContent = '获取';
    }
});