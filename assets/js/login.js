// assets/js/login.js

// 自动登录检查
const cachedEvents = localStorage.getItem('courseEvents');
if (cachedEvents) {
    console.log('发现本地缓存，直接跳转到课表页面。');
    window.location.replace('index.html');
}

const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');
const statusMessage = document.getElementById('status-message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    submitBtn.disabled = true;
    submitBtn.textContent = '正在获取...';
    statusMessage.textContent = '';
    statusMessage.style.color = 'black';

    try {
        const response = await fetch('/api/get-schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '未知错误');
        }

        statusMessage.textContent = '获取成功！正在跳转...';
        statusMessage.style.color = 'green';
        
        localStorage.setItem('courseEvents', JSON.stringify(data));
        
        setTimeout(() => {
            // 【核心修改】登录成功后，根据设备宽度判断跳转地址
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                window.location.href = 'mobile.html';
            } else {
                window.location.href = 'index.html';
            }
        }, 1000);

    } catch (error) {
        statusMessage.textContent = `错误: ${error.message}`;
        statusMessage.style.color = 'red';
        submitBtn.disabled = false;
        submitBtn.textContent = '获取';
    }
});