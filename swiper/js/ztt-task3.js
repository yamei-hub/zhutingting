/*
  作者：朱婷婷（24002120525）
  建立时间：2026-11-13
  使用大模型：DeepSeek-V4.1-Flash
  功能名称：任务三 · 魔都号 + 联动封面流，主图 coverflow 与缩略图双向同步，变量统一 ztt_ 前缀
*/

// 先创建缩略图实例
var ztt_thumb = new Swiper('#zttThumbs', {
  spaceBetween: 8,
  slidesPerView: 'auto',
  freeMode: true,
  watchSlidesProgress: true,
  slideToClickedSlide: true
});

// 再创建主图实例（coverflow 大角度旋转），thumbs 绑定缩略图实例对象
var ztt_main = new Swiper('#zttMain', {
  effect: 'coverflow',
  centeredSlides: true,
  slidesPerView: 'auto',
  spaceBetween: 24,
  coverflowEffect: {
    rotate: 55,
    stretch: 0,
    depth: 260,
    modifier: 1,
    slideShadows: true
  },
  navigation: { nextEl: '#zttMainNext', prevEl: '#zttMainPrev' },
  // 四项课堂外能力：键盘 / 滚轮 / 双击缩放 / 视差
  keyboard: { enabled: true, onlyInViewport: true },
  mousewheel: { enabled: true, releaseOnEdges: true },
  zoom: { enabled: true, maxRatio: 3, minRatio: 1 },
  parallax: true,
  thumbs: { swiper: ztt_thumb }
});

// 函数功能：读取主图与缩略图的当前索引并写入页面读数，同时判定两者是否已同步
function ztt_syncReadout() {
  var mi = ztt_main.realIndex;
  var active = null;
  ztt_thumb.slides.forEach(function (s) {
    if (s.classList.contains('swiper-slide-thumb-active')) active = s;
  });
  var ti = active ? ztt_thumb.slides.indexOf(active) : mi;
  document.getElementById('zttMainIdx').textContent = mi + 1;
  document.getElementById('zttThumbIdx').textContent = ti + 1;
  var state = document.getElementById('zttSyncState');
  if (mi === ti) { state.textContent = '已同步'; state.className = 'ztt-good'; }
  else { state.textContent = '跟随中'; state.className = ''; }
}

ztt_main.on('slideChange', ztt_syncReadout);
ztt_thumb.on('slideChange', ztt_syncReadout);
ztt_syncReadout();
