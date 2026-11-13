/*
  作者：朱婷婷
  建立时间：2026-11-04
  使用大模型：GLM
  功能名称：汽车导购 Tab 选项卡交互脚本（可复用组件）
  命名规则：所有 JS 变量、函数名均以 ztt 开头
*/

/**
 * 函数功能：初始化一组可复用的 Tab 选项卡（作者：朱婷婷）。
 *          为每个选项卡按钮绑定点击监听事件，点击时先清除所有选项卡
 *          （按钮与面板）的选中状态，再设置当前元素为选中状态，
 *          实现选项卡与内容面板的联动切换。
 * @param {string} zttBoxSelector - 选项卡最外层容器的选择器
 * @returns {Object} zttInstance - 选项卡实例，包含 zttSwitchTo 方法，
 *          可供外部复用（如自动轮播、外部按钮控制切换）
 */
function zttInitTabs(zttBoxSelector) {
  // 获取选项卡最外层容器
  var zttBox = document.querySelector(zttBoxSelector);
  // 获取所有选项卡按钮
  var zttButtons = zttBox.querySelectorAll(".zttTabBtn");
  // 获取所有内容面板
  var zttPanels = zttBox.querySelectorAll(".zttTabPanel");

  /**
   * 函数功能：清除所有选项卡的选中状态。
   *          遍历移除每个按钮与面板上的 zttActive 类名。
   */
  function zttClearActive() {
    zttButtons.forEach(function (zttBtn) {
      zttBtn.classList.remove("zttActive");
    });
    zttPanels.forEach(function (zttPanel) {
      zttPanel.classList.remove("zttActive");
    });
  }

  /**
   * 函数功能：切换到指定索引的选项卡。
   *          先清除所有选项卡的选中状态，再设置当前元素的选中状态。
   * @param {number} zttIndex - 目标选项卡的索引（从 0 开始）
   */
  function zttSwitchTo(zttIndex) {
    // 第一步：清除所有选项卡的选中状态
    zttClearActive();
    // 第二步：设置当前元素的选中状态
    zttButtons[zttIndex].classList.add("zttActive");
    zttPanels[zttIndex].classList.add("zttActive");
  }

  // 为每个选项卡按钮绑定点击监听事件
  zttButtons.forEach(function (zttBtn, zttIndex) {
    zttBtn.addEventListener("click", function () {
      zttSwitchTo(zttIndex);
    });
  });

  // 返回实例，供外部复用
  return {
    zttSwitchTo: zttSwitchTo,
    zttButtons: zttButtons,
    zttPanels: zttPanels
  };
}

// 函数功能：页面加载完成后初始化汽车导购选项卡，默认选中"导购"面板
document.addEventListener("DOMContentLoaded", function () {
  zttInitTabs("#zttTabBox");
});
