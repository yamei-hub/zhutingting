/**
 * 任务二 · 手势卡片
 * 作者：朱婷婷（24002120525）
 * 功能：中华美食卡片左右滑动切换 —— 40px 阈值判方向、300ms 冷却防连跳、
 *      0.3s 过渡动画、首尾边界提示；卡片容器 pan-y 保证纵向仍可滚动。
 * 变量与函数统一 ztt_ 前缀。
 */
(function () {
  'use strict';

  var ztt_stage = document.getElementById('zttStage2');
  var ztt_track = document.getElementById('zttTrack2');
  var ztt_dotsBox = document.getElementById('zttDots2');
  var ztt_pageText = document.getElementById('zttPage2');
  var ztt_hint = document.getElementById('zttHint2');
  var ztt_prevBtn = document.getElementById('zttPrev2');
  var ztt_nextBtn = document.getElementById('zttNext2');

  var ztt_total = ztt_track.children.length; // 4 张卡片
  var ztt_index = 0;                         // 当前第几张（0 起）
  var ztt_locked = false;                    // 冷却锁：防止一次手势跳两张
  var ztt_startX = 0;
  var ztt_startY = 0;
  var ztt_hintTimer = null;

  var ZTT_THRESHOLD = 40;  // 滑动阈值（px）：小于它算误触
  var ZTT_COOLDOWN = 300;  // 冷却时间（ms）：与 0.3s 过渡对齐

  // 函数功能：按卡片数量生成底部圆点
  function ztt_buildDots() {
    for (var ztt_i = 0; ztt_i < ztt_total; ztt_i++) {
      var ztt_dot = document.createElement('i');
      if (ztt_i === 0) {
        ztt_dot.className = 'ztt-on';
      }
      ztt_dotsBox.appendChild(ztt_dot);
    }
  }

  // 函数功能：切换到第 n 张 —— 平移轨道、更新页码、同步圆点（三者只依赖 ztt_index）
  function ztt_update(n) {
    if (n < 0) { n = 0; }
    if (n > ztt_total - 1) { n = ztt_total - 1; }
    ztt_index = n;

    ztt_track.style.transform = 'translateX(' + (-ztt_index * 100) + '%)';
    ztt_pageText.textContent = '第 ' + (ztt_index + 1) + ' / ' + ztt_total + ' 张';

    for (var ztt_i = 0; ztt_i < ztt_dotsBox.children.length; ztt_i++) {
      ztt_dotsBox.children[ztt_i].className = (ztt_i === ztt_index) ? 'ztt-on' : '';
    }
  }

  // 函数功能：在提示区显示一句话，1.2 秒后自动淡出
  function ztt_showHint(text) {
    ztt_hint.textContent = text;
    if (ztt_hintTimer) {
      clearTimeout(ztt_hintTimer);
    }
    ztt_hintTimer = setTimeout(function () {
      ztt_hint.textContent = '';
    }, 1200);
  }

  // 函数功能：按方向切换一张（-1 上一张 / 1 下一张），带冷却与边界提示
  function ztt_step(dir) {
    if (ztt_locked) {
      return;
    }
    if (dir < 0 && ztt_index === 0) {
      ztt_showHint('已经是第一张了');
      return;
    }
    if (dir > 0 && ztt_index === ztt_total - 1) {
      ztt_showHint('已经是最后一张了');
      return;
    }

    ztt_locked = true;
    ztt_hint.textContent = '';
    ztt_update(ztt_index + dir);

    setTimeout(function () {
      ztt_locked = false;
    }, ZTT_COOLDOWN);
  }

  // 函数功能：touchstart —— 记录起点坐标
  function ztt_onStart(e) {
    var ztt_t = e.touches[0];
    ztt_startX = ztt_t.clientX;
    ztt_startY = ztt_t.clientY;
  }

  // 函数功能：touchend —— 用 changedTouches 算位移，先过阈值，再比主方向
  function ztt_onEnd(e) {
    var ztt_t = e.changedTouches[0];
    var ztt_dx = ztt_t.clientX - ztt_startX;
    var ztt_dy = ztt_t.clientY - ztt_startY;

    // ① 阈值：位移太小说明只是点了一下 / 手抖，不切换
    if (Math.abs(ztt_dx) < ZTT_THRESHOLD) {
      return;
    }
    // ② 方向：纵向位移更大说明用户想上下滚页面，交给浏览器
    if (Math.abs(ztt_dy) > Math.abs(ztt_dx)) {
      return;
    }
    // ③ 谁大听谁的：左滑 dx<0 去下一张，右滑 dx>0 回上一张
    if (ztt_dx < 0) {
      ztt_step(1);
    } else {
      ztt_step(-1);
    }
  }

  ztt_buildDots();
  ztt_update(0);

  ztt_stage.addEventListener('touchstart', ztt_onStart, { passive: true });
  ztt_stage.addEventListener('touchend', ztt_onEnd);
  ztt_prevBtn.addEventListener('click', function () { ztt_step(-1); });
  ztt_nextBtn.addEventListener('click', function () { ztt_step(1); });
})();
