// assets/js/redirect.js

(function() {
    /**
     * 通过检查 User-Agent 字符串来判断是否为移动设备。
     * @returns {boolean} - 如果是移动设备则返回 true，否则返回 false。
     */
    function isMobileDevice() {
        // 这是一个比较全面的正则表达式，可以识别绝大多数手机和平板设备
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    const onMobilePage = window.location.pathname.includes('mobile.html');
    const isMobile = isMobileDevice();

    if (isMobile && !onMobilePage) {
        // 如果是移动设备，但当前不在 mobile.html，则跳转过去
        window.location.replace('mobile.html');
    } else if (!isMobile && onMobilePage) {
        // 如果不是移动设备，但当前在 mobile.html，则跳回PC版
        window.location.replace('index.html');
    }
    // 其他情况（设备和页面匹配）则不进行任何操作
})();