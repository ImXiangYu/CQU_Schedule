// assets/js/mobile.js

import { timeSlots, firstWeek } from './config.js';

let currentWeek = 1;
let events = [];

const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");
const logoutBtn = document.getElementById("logoutBtn");
const headerTitle = document.getElementById("header-title");
const timetable = document.getElementById("timetable");

function renderTable(week) {
  prevWeekBtn.disabled = (week <= 1);
  nextWeekBtn.disabled = (week >= 25);
  headerTitle.innerText = `课程表(第${week}周)`;
  timetable.innerHTML = ""; 

  const displayWeekStart = new Date(firstWeek.getTime() + (week - 1) * 7 * 86400000);
  const days = ["一", "二", "三", "四", "五", "六", "日"];

  // 1. 渲染表头
  const corner = document.createElement('div');
  
  // --- 【核心修改】计算月份并放入左上角单元格 ---
  const month = displayWeekStart.getMonth() + 1; // getMonth()是0-11，所以+1
  corner.className = 'grid-item grid-header month-header'; // 使用新的CSS类进行美化
  corner.innerHTML = `<div>${month}</div><div>月</div>`; // 显示月份数字和“月”字
  timetable.appendChild(corner);
  // --- 修改结束 ---

  for (let i = 0; i < 7; i++) {
    const day = new Date(displayWeekStart.getTime() + i * 86400000);
    const dayHeader = document.createElement('div');
    dayHeader.className = 'grid-item grid-header day-header';
    dayHeader.innerHTML = `<div>${days[i]}</div><small>${day.getDate()}</small>`;
    timetable.appendChild(dayHeader);
  }

  // 2. 渲染背景格子和时间表头
  for (let i = 0; i < timeSlots.length; i++) {
      for (let j = 0; j < 8; j++) {
          const cell = document.createElement('div');
          cell.className = 'grid-item';
          if (j === 0) {
              cell.classList.add('time-header');
              cell.textContent = i + 1;
          }
          cell.style.gridRow = i + 2;
          cell.style.gridColumn = j + 1;
          timetable.appendChild(cell);
      }
  }

  // 3. 渲染当周的课程 (此部分无任何改动)
  const weekStart = displayWeekStart;
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
  const weekEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate >= weekStart && eventDate < weekEnd;
  });

  weekEvents.forEach(event => {
    const eventDate = new Date(event.start);
    let dayIndex = eventDate.getDay();
    if (dayIndex === 0) dayIndex = 7;
    const gridCol = dayIndex + 1; 

    const eventTimeInMinutes = eventDate.getHours() * 60 + eventDate.getMinutes();
    const startRowIndex = timeSlots.findIndex(slot => {
      const slotStartTimeInMinutes = slot.startHour * 60 + slot.startMinute;
      const slotEndTimeInMinutes = slot.endHour * 60 + slot.endMinute;
      return eventTimeInMinutes >= slotStartTimeInMinutes && eventTimeInMinutes < slotEndTimeInMinutes;
    });

    if (startRowIndex === -1) return; 
    
    const gridRow = startRowIndex + 2;

    const endDate = new Date(event.end);
    let spanCount = 0;
    for (let k = startRowIndex; k < timeSlots.length; k++) {
      const slot = timeSlots[k];
      const slotEndTimeInMinutes = slot.endHour * 60 + slot.endMinute;
      if (new Date(event.end).getTime() > new Date(event.start).getTime() && (endDate.getHours() * 60 + endDate.getMinutes() > slotEndTimeInMinutes)) {
        spanCount++;
      } else {
        break;
      }
    }
    spanCount = Math.max(1, spanCount);

    const courseDiv = document.createElement('div');
    courseDiv.className = 'course';
    courseDiv.innerHTML = `<div class="course-summary">${event.summary}</div><div class="course-location">${event.location}</div>`;
    courseDiv.style.setProperty('--grid-col', gridCol);
    courseDiv.style.setProperty('--grid-row', gridRow);
    courseDiv.style.setProperty('--grid-span', spanCount);
    timetable.appendChild(courseDiv);
  });
}

// 其他函数 (findInitialWeek, initializeSchedule, 事件监听) 保持不变
function findInitialWeek() {
    const firstEventDate = events.length > 0 ? new Date(events[0].start) : new Date();
    const diffTime = firstEventDate - firstWeek;
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    currentWeek = Math.max(1, diffWeeks + 1);
    renderTable(currentWeek);
}
function initializeSchedule() {
    const eventsData = localStorage.getItem('courseEvents');
    if (!eventsData) { window.location.href = 'login.html'; return; }
    try {
        events = JSON.parse(eventsData).sort((a, b) => new Date(a.start) - new Date(b.start));
        findInitialWeek();
    } catch (error) {
        alert('本地数据错误，请重新登录。');
        localStorage.removeItem('courseEvents');
        window.location.href = 'login.html';
    }
}
prevWeekBtn.addEventListener("click", () => { if (currentWeek > 1) { currentWeek--; renderTable(currentWeek); } });
nextWeekBtn.addEventListener("click", () => { currentWeek++; renderTable(currentWeek); });
logoutBtn.addEventListener("click", () => {
    if (confirm("您确定要退出登录并清除本地缓存吗？")) {
        localStorage.removeItem('courseEvents');
        alert("缓存已清除！");
        window.location.href = 'login.html';
    }
});
document.addEventListener('DOMContentLoaded', initializeSchedule);