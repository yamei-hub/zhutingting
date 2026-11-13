/*
  作者：朱婷婷（24002120525）
  建立时间：2026-11-13
  使用大模型：DeepSeek-V4.1-Flash
  功能名称：任务一 · 两轮提示词对照（圆点分页器 clickable 有无对比），变量统一 ztt_ 前缀
*/

// 左：第 1 轮 · 只给 el，圆点只能看、不能点
var ztt_bad = new Swiper('#zttBad', {
  loop: true,
  speed: 800,
  autoplay: { delay: 3200, disableOnInteraction: false },
  pagination: { el: '#zttPagBad' },
  effect: 'cube',
  cubeEffect: { shadow: true, slideShadows: true }
});
ztt_bad.on('slideChange', function () {
  document.getElementById('zttBadIdx').textContent = this.realIndex;
});

// 右：第 2 轮 · 补齐 clickable: true，圆点是可点的遥控器
var ztt_good = new Swiper('#zttGood', {
  loop: true,
  speed: 800,
  autoplay: { delay: 3200, disableOnInteraction: false },
  pagination: { el: '#zttPagGood', clickable: true },
  effect: 'cube',
  cubeEffect: { shadow: true, slideShadows: true }
});
// 只更新索引；"已跳转"必须由下面点击探针判定，避免 autoplay 自动翻页误标为已跳转
ztt_good.on('slideChange', function () {
  document.getElementById('zttGoodIdx').textContent = this.realIndex;
});

// 函数功能：给分页器绑定点击探针，比对点击前后索引，变了判定为已跳转，没变则显示"没有跳转/可跳转"
function ztt_bindPaginationProbe(swiper, pagEl, idxId, stateId, canClick) {
  var pag = document.querySelector(pagEl);
  if (!pag) return;
  pag.addEventListener('click', function () {
    var before = swiper.realIndex;
    setTimeout(function () {
      var after = swiper.realIndex;
      document.getElementById(idxId).textContent = after;
      var state = document.getElementById(stateId);
      if (after !== before) {
        state.textContent = '已跳转';
        state.className = 'ztt-good-txt';
      } else {
        state.textContent = canClick ? '可跳转' : '没有跳转';
        state.className = canClick ? 'ztt-good-txt' : 'ztt-bad-txt';
      }
    }, 350);
  });
}

ztt_bindPaginationProbe(ztt_bad, '#zttPagBad', 'zttBadIdx', 'zttBadState', false);
ztt_bindPaginationProbe(ztt_good, '#zttPagGood', 'zttGoodIdx', 'zttGoodState', true);
