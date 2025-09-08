// assets/js/config.js

/**
 * 课时段定义
 */
export const timeSlots = [
  { startHour: 8, startMinute: 30, endHour: 9, endMinute: 15 },   // 1
  { startHour: 9, startMinute: 25, endHour: 10, endMinute: 10 },  // 2
  { startHour: 10, startMinute: 30, endHour: 11, endMinute: 15 }, // 3
  { startHour: 11, startMinute: 25, endHour: 12, endMinute: 10 }, // 4
  { startHour: 13, startMinute: 30, endHour: 14, endMinute: 15 }, // 5
  { startHour: 14, startMinute: 25, endHour: 15, endMinute: 10 }, // 6
  { startHour: 15, startMinute: 20, endHour: 16, endMinute: 5 },  // 7
  { startHour: 16, startMinute: 25, endHour: 17, endMinute: 10 }, // 8
  { startHour: 17, startMinute: 20, endHour: 18, endMinute: 5 },  // 9
  { startHour: 19, startMinute: 0, endHour: 19, endMinute: 45 },  // 10
  { startHour: 19, startMinute: 55, endHour: 20, endMinute: 40 }, // 11
  { startHour: 20, startMinute: 50, endHour: 21, endMinute: 35 }, // 12
  { startHour: 21, startMinute: 45, endHour: 22, endMinute: 30 }, // 13
];

/**
 * 第一周的起始日期 (周一)
 */
export const firstWeek = new Date("2025-09-08T00:00:00+08:00");