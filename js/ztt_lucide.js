// 函数功能：把页面中所有 data-lucide 标记替换为内联 SVG 图标（卷二图标样本页使用）
function ztt_renderLucide() {
  if (typeof lucide === "undefined" || typeof lucide.createIcons !== "function") {
    return;
  }
  lucide.createIcons();
}

// 函数功能：在页面结构就绪后调用图标渲染，避免脚本先于占位元素执行
function ztt_bootLucide() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ztt_renderLucide);
  } else {
    ztt_renderLucide();
  }
}

ztt_bootLucide();
