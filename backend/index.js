// backend/index.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

app.post('/api/get-schedule', async (req, res) => {
    const { username, password } = req.body;
    const apiKey = process.env.API_SUBSCRIPTION_KEY;

    if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    if (!apiKey) {
        console.error('错误: .env 文件中未找到 API_SUBSCRIPTION_KEY');
        return res.status(500).json({ error: '服务器未配置API密钥' });
    }

    try {
        const response = await axios.post(
            'https://api.schedule.dl444.net/v1/subscription',
            { username, password },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': apiKey,
                },
            }
        );

        const icsContent = response.data?.data?.icsContent;
        if (!icsContent) {
            console.error('[BACKEND LOG] API响应中未找到icsContent:', response.data);
            return res.status(400).json({ error: '无法获取课表数据，请检查学号或密码。' });
        }

        const events = parseIcsToJSON(icsContent);
    
        res.json(events);

    } catch (error) {
        const errorMsg = error.response ? error.response.data : error.message;
        res.status(500).json({ error: `获取课表失败: ${JSON.stringify(errorMsg)}` });
    }
});

function parseIcsToJSON(icsContent) {
    // 【核心修改】从 .env 文件中读取时区偏移量，如果未设置则默认为 0
    const tzOffsetHours = parseInt(process.env.TIMEZONE_OFFSET || '0', 10);
    console.log(`[TIMEZONE] Using timezone offset: +${tzOffsetHours} hours.`);

    const events = [];
    const lines = icsContent.split(/\r\n|\n/);
    let currentEvent = null;

    for (const line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
            currentEvent = {};
        } else if (line.startsWith('END:VEVENT')) {
            if (currentEvent) {
                events.push(currentEvent);
                currentEvent = null;
            }
        } else if (currentEvent) {
            const separatorIndex = line.indexOf(':');
            if (separatorIndex === -1) continue;
            
            const key = line.substring(0, separatorIndex);
            const value = line.substring(separatorIndex + 1).trim();

            if (key.startsWith('SUMMARY')) currentEvent.summary = value;
            if (key.startsWith('LOCATION')) currentEvent.location = value;
            if (key.startsWith('DESCRIPTION') && value.includes('教师')) {
                 currentEvent.teacher = value.replace('教师: ', '').replace(/\\n/g, ' ').trim();
            }
            if (key.startsWith('DTSTART')) {
                currentEvent.start = parseIcsDate(value, tzOffsetHours);
            }
            if (key.startsWith('DTEND')) {
                currentEvent.end = parseIcsDate(value, tzOffsetHours);
            }
        }
    }
    return events;
}

function parseIcsDate(icsDate, tzOffsetHours) {
    const year = icsDate.substring(0, 4);
    const month = icsDate.substring(4, 6);
    const day = icsDate.substring(6, 8);
    const hour = icsDate.substring(9, 11);
    const minute = icsDate.substring(11, 13);
    const second = icsDate.substring(13, 15);
    
    const utcDate = new Date(Date.UTC(year, parseInt(month) - 1, day, hour, minute, second));
    
    const offsetMilliseconds = tzOffsetHours * 60 * 60 * 1000;
    const localDate = new Date(utcDate.getTime() + offsetMilliseconds);
    
    const yearStr = localDate.getFullYear();
    const monthStr = String(localDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(localDate.getDate()).padStart(2, '0');
    const hourStr = String(localDate.getHours()).padStart(2, '0');
    const minuteStr = String(localDate.getMinutes()).padStart(2, '0');
    const secondStr = String(localDate.getSeconds()).padStart(2, '0');

    return `${yearStr}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:${secondStr}`;
}

app.listen(PORT, '127.0.0.1', () => {
    console.log(`后端服务已启动，正在监听 http://localhost:${PORT}`);
});