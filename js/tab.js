// 作者：朱婷婷
// 建立时间：2026-11-04
// 使用大模型：GLM
// 功能名称：可复用的 Tab 选项卡切换组件

/**
 * 函数功能：初始化一组可复用的 Tab 选项卡。
 *          为每个选项卡按钮绑定点击监听事件，点击时先清除所有选项卡
 *          （按钮与面板）的选中状态，再设置当前元素为选中状态，
 *          实现选项卡与内容面板的联动切换。
 * @param {Object} options - 配置项
 * @param {string} options.container  - 选项卡最外层容器选择器
 * @param {string} options.tabBtn     - 选项卡按钮选择器（默认 .tab-nav button）
 * @param {string} options.tabPanel   - 内容面板选择器（默认 .tab-panel）
 * @param {string} options.activeClass - 选中状态的类名（默认 active）
 * @returns {Object} 当前选项卡实例，包含 switchTo 方法，可在外部复用切换
 */
function initTabs(options) {
  // 获取选项卡容器
  var container = document.querySelector(options.container);
  // 获取所有选项卡按钮
  var tabButtons = container.querySelectorAll(options.tabBtn || ".tab-nav button");
  // 获取所有内容面板
  var tabPanels = container.querySelectorAll(options.tabPanel || ".tab-panel");
  // 选中状态的类名
  var activeClass = options.activeClass || "active";

  /**
   * 函数功能：清除所有选项卡按钮和内容面板的选中状态。
   *          遍历移除每个按钮与面板上的 active 类名。
   */
  function clearAllActive() {
    tabButtons.forEach(function (btn) {
      btn.classList.remove(activeClass);
    });
    tabPanels.forEach(function (panel) {
      panel.classList.remove(activeClass);
    });
  }

  /**
   * 函数功能：切换到指定索引的选项卡。
   *          先清除所有选中状态，再为当前按钮与对应面板添加选中状态。
   * @param {number} index - 目标选项卡的索引（从 0 开始）
   */
  function switchTo(index) {
    // 先清除所有选项卡的选中状态
    clearAllActive();
    // 再设置当前元素的选中状态
    tabButtons[index].classList.add(activeClass);
    tabPanels[index].classList.add(activeClass);
  }

  // 为每个选项卡按钮绑定点击监听事件
  tabButtons.forEach(function (btn, index) {
    btn.addEventListener("click", function () {
      switchTo(index);
    });
  });

  // 返回实例，供外部复用（例如自动轮播、外部按钮控制切换）
  return {
    switchTo: switchTo,
    buttons: tabButtons,
    panels: tabPanels
  };
}

// 函数功能：页面加载完成后，初始化新闻选项卡组件，国内新闻为默认选中项
document.addEventListener("DOMContentLoaded", function () {
  initTabs({ container: "#newsTabs" });
});
