// assets/js/color-utils.js

// 1. 定义一个预设的、视觉效果好的颜色调色板
const colorPalette = [
    '#1abc9c', '#3498db', '#9b59b6', '#e67e22',
    '#e74c3c', '#2ecc71', '#f1c40f', '#34495e',
    '#16a085', '#2980b9', '#8e44ad', '#d35400',
    '#c0392b', '#27ae60', '#f39c12', '#2c3e50'
];

// 2. 创建一个Map来存储已经分配给课程的颜色
// 格式: { "课程名": "#颜色代码", ... }
const courseColorMap = new Map();
let colorIndex = 0;

/**
 * 根据课程名称获取一个稳定一致的颜色。
 * @param {string} courseName - 课程的名称 (summary).
 * @returns {string} - 返回一个十六进制的颜色代码.
 */
export function getColorForCourse(courseName) {
    // 如果这门课还没有被分配过颜色
    if (!courseColorMap.has(courseName)) {
        // 从调色板中选择下一个颜色
        const color = colorPalette[colorIndex % colorPalette.length];
        // 将颜色存入Map中
        courseColorMap.set(courseName, color);
        // 索引递增，以便下一门新课获取不同颜色
        colorIndex++;
    }
    // 返回已经分配好的颜色
    return courseColorMap.get(courseName);
}

/**
 * 在切换周数或重新渲染时，需要重置颜色分配，以保证每次视图刷新时颜色一致
 */
export function resetColorAssignments() {
    courseColorMap.clear();
    colorIndex = 0;
}