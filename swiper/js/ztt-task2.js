/*
  作者：朱婷婷（24002120525）
  建立时间：2026-11-13
  使用大模型：DeepSeek-V4.1-Flash
  功能名称：任务二 · creative 仿写，七种 effect 配置生成与实时切换，变量统一 ztt_ 前缀
*/

// 函数功能：按传入的效果名生成 Swiper 配置对象，覆盖 slide/fade/cube/coverflow/flip/cards/creative 七种效果
function ztt_getOptions(ztt_effect) {
  var ztt_opt = {
    loop: true,
    speed: 800,
    autoplay: { delay: 3200, disableOnInteraction: false },
    pagination: { el: '#zttPag', clickable: true },
    keyboard: { enabled: true, onlyInViewport: true }
  };
  switch (ztt_effect) {
    case 'fade':
      ztt_opt.effect = 'fade';
      ztt_opt.fadeEffect = { crossFade: true };
      break;
    case 'cube':
      ztt_opt.effect = 'cube';
      ztt_opt.cubeEffect = { shadow: true, slideShadows: true };
      break;
    case 'coverflow':
      ztt_opt.effect = 'coverflow';
      ztt_opt.coverflowEffect = { rotate: 45, stretch: 0, depth: 180, modifier: 1, slideShadows: true };
      break;
    case 'flip':
      ztt_opt.effect = 'flip';
      ztt_opt.flipEffect = { slideShadows: true };
      break;
    case 'cards':
      ztt_opt.effect = 'cards';
      ztt_opt.cardsEffect = { slideShadows: true, rotate: true, perSlideRotate: 8, perSlideOffset: 10 };
      break;
    case 'creative':
      ztt_opt.effect = 'creative';
      ztt_opt.creativeEffect = {
        limitProgress: 1,
        shadowPerProgress: true,
        prev: {
          translate: ['-85%', 0, -320],
          rotate: [0, 0, -12],
          scale: 0.7,
          opacity: 0.55,
          shadow: true
        },
        next: {
          translate: ['85%', 0, 320],
          rotate: [0, 0, 12],
          scale: 1.05,
          opacity: 0.55,
          shadow: true
        }
      };
      break;
    default:
      ztt_opt.effect = 'slide';
  }
  return ztt_opt;
}

var ztt_sw = new Swiper('#zttCreative', ztt_getOptions('creative'));

// 函数功能：绑定效果切换按钮，点击后销毁旧实例并按新效果重建轮播
document.querySelectorAll('#zttFx button').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var fx = btn.getAttribute('data-fx');
    document.querySelectorAll('#zttFx button').forEach(function (b) { b.classList.remove('ztt-on'); });
    btn.classList.add('ztt-on');
    ztt_sw.destroy(true, true);
    ztt_sw = new Swiper('#zttCreative', ztt_getOptions(fx));
  });
});
