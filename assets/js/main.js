// assets/js/main.js

import { timeSlots, firstWeek } from './config.js';
// 【新增】导入颜色管理工具
import { getColorForCourse, resetColorAssignments } from './color-utils.js';

// --- 全局状态 ---
let currentWeek = 1;
let events = [];

// --- DOM 元素获取 ---
const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");
const logoutBtn = document.getElementById("logoutBtn");
const header = document.getElementById("header");
const timetable = document.getElementById("timetable");
const headerTitle = document.getElementById("header-title");

function renderTable(week) {
  // 【新增】每次重新渲染表格时，重置颜色分配
  resetColorAssignments();

  prevWeekBtn.disabled = (week <= 1);
  nextWeekBtn.disabled = (week >= 25);
  headerTitle.innerText = `课程表（第${week}周）`;
  timetable.innerHTML = ""; // 清空表格

  const displayWeekStart = new Date(firstWeek.getTime() + (week - 1) * 7 * 86400000);

  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = "<th>时间</th>";
  for (let i = 0; i < 7; i++) {
    const day = new Date(displayWeekStart.getTime() + i * 86400000);
    headerRow.innerHTML += `<th>${days[i]}<br>${day.getMonth() + 1}月${day.getDate()}日</th>`;
  }
  timetable.appendChild(headerRow);

  const spannedCells = Array(timeSlots.length).fill(0).map(() => Array(7).fill(false));
  for (let i = 0; i < timeSlots.length; i++) {
    const row = document.createElement("tr");
    const slot = timeSlots[i];
    
    row.innerHTML = `<th>第${i+1}节<br><small>${String(slot.startHour).padStart(2, '0')}:${String(slot.startMinute).padStart(2, '0')}-${String(slot.endHour).padStart(2, '0')}:${String(slot.endMinute).padStart(2, '0')}</small></th>`;

    for (let j = 0; j < 7; j++) {
      if (spannedCells[i][j]) continue;
      const td = document.createElement("td");
      const day = new Date(displayWeekStart.getTime() + j * 86400000);

      const event = events.find(ev => {
        // ... find logic is the same ...
        const cellYear = day.getFullYear();
        const cellMonth = day.getMonth();
        const cellDate = day.getDate();
        const eventDateObj = new Date(ev.start);
        const eventYear = eventDateObj.getFullYear();
        const eventMonth = eventDateObj.getMonth();
        const eventDate = eventDateObj.getDate();
        if (!(cellYear === eventYear && cellMonth === eventMonth && cellDate === eventDate)) return false;
        const eventTimeInMinutes = eventDateObj.getHours() * 60 + eventDateObj.getMinutes();
        const slotStartTimeInMinutes = slot.startHour * 60 + slot.startMinute;
        const slotEndTimeInMinutes = slot.endHour * 60 + slot.endMinute;
        return eventTimeInMinutes >= slotStartTimeInMinutes && eventTimeInMinutes < slotEndTimeInMinutes;
      });

      if (event) {
        // ... span calculation is the same ...
        const endDateObj = new Date(event.end);
        const endHour = endDateObj.getHours();
        const endMinute = endDateObj.getMinutes();
        let spanCount = 0;
        for (let k = i; k < timeSlots.length; k++) {
          const currentSlot = timeSlots[k];
          if (endHour > currentSlot.endHour || (endHour === currentSlot.endHour && endMinute >= currentSlot.endMinute)) {
            spanCount++;
          } else { break; }
        }
        if (spanCount === 0) spanCount = 1;
        if (spanCount > 1) {
          td.rowSpan = spanCount;
          for (let k = 1; k < spanCount; k++) {
            if (i + k < timeSlots.length) spannedCells[i + k][j] = true;
          }
        }
        
        // 【核心修改】通过JS动态设置颜色
        const courseColor = getColorForCourse(event.summary);
        td.style.backgroundColor = courseColor;
        td.style.color = '#fff'; // 确保文字在所有背景色上都清晰

        td.className = "course";
        td.innerText = `${event.summary}\n${event.teacher || ''}\n@${event.location}`;
      }
      row.appendChild(td);
    }
    timetable.appendChild(row);
  }
}

// ... (findInitialWeek, initializeSchedule, and event listeners remain unchanged) ...
function findInitialWeek() {
  if (events.length > 0) {
    const firstEventDate = new Date(events[0].start);
    const diffTime = firstEventDate - firstWeek;
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    currentWeek = diffWeeks + 1;
  }
  renderTable(currentWeek);
}
function initializeSchedule() {
  const eventsData = localStorage.getItem('courseEvents');
  if (!eventsData) {
    window.location.href = 'login.html';
    return;
  }
  try {
    const parsedEvents = JSON.parse(eventsData);
    events = parsedEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
    findInitialWeek();
  } catch (error) {
    console.error('解析本地课程数据失败:', error);
    alert('本地课程数据格式错误，将清除缓存并请您重新登录。');
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