/**
 * 任务三 · 图片查看器
 * 作者：朱婷婷（24002120525）
 * 功能：双指缩放 1x～4x（以两指中点为基准，保证不跳）、双击 1x/2x 切换、
 *      放大后单指拖动、缩回 1x 自动居中、旋转屏幕保留状态并重新夹边界。
 * 变量与函数统一 ztt_ 前缀。
 */
(function () {
  'use strict';

  var ztt_viewer = document.getElementById('zttViewer3');
  var ztt_img = document.getElementById('zttImg3');
  var ztt_badge = document.getElementById('zttScale3');
  var ztt_resetBtn = document.getElementById('zttReset3');
  var ztt_dragHint = document.getElementById('zttDragHint3');

  var ZTT_MIN = 1;          // 最小缩放
  var ZTT_MAX = 4;          // 最大缩放
  var ZTT_TAP_MOVE = 20;    // 点击允许的最大位移（px）
  var ZTT_TAP_TIME = 250;   // 点击允许的最长时间（ms）
  var ZTT_DBL_GAP = 300;    // 双击间隔（ms）

  // 当前变换状态：scale 缩放，tx / ty 平移（相对容器中心）
  var ztt_state = { scale: 1, tx: 0, ty: 0 };

  var ztt_pinch = null;     // 双指手势起点：{ dist, scale, tx, ty }
  var ztt_drag = null;      // 单指拖动起点：{ x, y, tx, ty }
  var ztt_tap = null;       // 本次按下：{ x, y, time }
  var ztt_lastTap = 0;      // 上一次点击时间，用于双击判断
  var ztt_animTimer = null;
  var ztt_resizeTimer = null;
  var ztt_hintTimer = null;
  var ztt_hintShown = false; // 本次手势是否已经提示过“先放大再拖动”

  // 函数功能：算两根手指之间的直线距离（勾股定理）
  function ztt_distance(t1, t2) {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  }

  // 函数功能：取两指中点相对容器中心的坐标，作为缩放锚点
  function ztt_focal(t1, t2) {
    var ztt_rect = ztt_viewer.getBoundingClientRect();
    return {
      x: (t1.clientX + t2.clientX) / 2 - ztt_rect.left - ztt_rect.width / 2,
      y: (t1.clientY + t2.clientY) / 2 - ztt_rect.top - ztt_rect.height / 2
    };
  }

  // 函数功能：量出容器尺寸与图片 contain 后的实际显示尺寸（用于算边界）
  function ztt_metrics() {
    var ztt_rect = ztt_viewer.getBoundingClientRect();
    var ztt_nw = ztt_img.naturalWidth || ztt_rect.width;
    var ztt_nh = ztt_img.naturalHeight || ztt_rect.height;
    var ztt_base = Math.min(ztt_rect.width / ztt_nw, ztt_rect.height / ztt_nh);
    return {
      boxW: ztt_rect.width,
      boxH: ztt_rect.height,
      w: ztt_nw * ztt_base,
      h: ztt_nh * ztt_base
    };
  }

  // 函数功能：把缩放与位移限制在合法范围；缩回 1x 时强制居中
  function ztt_clamp() {
    var ztt_m = ztt_metrics();
    var ztt_maxX = Math.max(0, (ztt_m.w * ztt_state.scale - ztt_m.boxW) / 2);
    var ztt_maxY = Math.max(0, (ztt_m.h * ztt_state.scale - ztt_m.boxH) / 2);

    if (ztt_state.tx > ztt_maxX) { ztt_state.tx = ztt_maxX; }
    if (ztt_state.tx < -ztt_maxX) { ztt_state.tx = -ztt_maxX; }
    if (ztt_state.ty > ztt_maxY) { ztt_state.ty = ztt_maxY; }
    if (ztt_state.ty < -ztt_maxY) { ztt_state.ty = -ztt_maxY; }

    if (ztt_state.scale <= ZTT_MIN + 0.001) {
      ztt_state.scale = 1;
      ztt_state.tx = 0;
      ztt_state.ty = 0;
    }
  }

  // 函数功能：把状态写进 transform 并刷新比例角标；anim=true 时走 0.25s 过渡
  function ztt_apply(anim) {
    if (anim) {
      ztt_img.classList.remove('ztt-anim');
      void ztt_img.offsetWidth; // 强制重排，确保过渡从当前值开始
      ztt_img.classList.add('ztt-anim');
      if (ztt_animTimer) { clearTimeout(ztt_animTimer); }
      ztt_animTimer = setTimeout(function () {
        ztt_img.classList.remove('ztt-anim');
      }, 300);
    } else {
      ztt_img.classList.remove('ztt-anim');
      if (ztt_animTimer) {
        clearTimeout(ztt_animTimer);
        ztt_animTimer = null;
      }
    }

    ztt_img.style.transform = 'translate(' + ztt_state.tx.toFixed(2) + 'px,' +
      ztt_state.ty.toFixed(2) + 'px) scale(' + ztt_state.scale.toFixed(3) + ')';
    ztt_badge.textContent = ztt_state.scale.toFixed(1) + 'x';
  }

  // 函数功能：1x 状态下拖动时提示“先放大再拖动”，1.4s 后自动隐藏
  function ztt_showDragHint() {
    ztt_dragHint.classList.add('ztt-show');
    if (ztt_hintTimer) { clearTimeout(ztt_hintTimer); }
    ztt_hintTimer = setTimeout(function () {
      ztt_dragHint.classList.remove('ztt-show');
    }, 1400);
  }

  // 函数功能：以屏幕坐标 (x, y) 为锚点缩放目标倍数，保持该点不动
  function ztt_zoomAt(x, y, target) {
    var ztt_rect = ztt_viewer.getBoundingClientRect();
    var ztt_f = { x: x - ztt_rect.left - ztt_rect.width / 2, y: y - ztt_rect.top - ztt_rect.height / 2 };
    var ztt_k = target / ztt_state.scale;

    ztt_state.tx = ztt_f.x - ztt_k * (ztt_f.x - ztt_state.tx);
    ztt_state.ty = ztt_f.y - ztt_k * (ztt_f.y - ztt_state.ty);
    ztt_state.scale = target;
    ztt_clamp();
  }

  // 函数功能：判断单击是否构成双击，双击在 1x 与 2x 之间切换
  function ztt_onTap(x, y) {
    var ztt_now = Date.now();
    if (ztt_now - ztt_lastTap < ZTT_DBL_GAP) {
      ztt_lastTap = 0;
      if (ztt_state.scale > 1.01) {
        ztt_state = { scale: 1, tx: 0, ty: 0 };
        ztt_apply(true);
      } else {
        ztt_zoomAt(x, y, 2);
        ztt_apply(true);
      }
    } else {
      ztt_lastTap = ztt_now;
    }
  }

  // 函数功能：复位按钮 —— 回到 1x 并自动居中
  function ztt_reset() {
    ztt_state = { scale: 1, tx: 0, ty: 0 };
    ztt_apply(true);
  }

  // 函数功能：touchstart —— 双指时记距离与状态；单指时记拖动起点与点击时间
  function ztt_onStart(e) {
    if (e.touches.length >= 2) {
      ztt_drag = null;
      ztt_tap = null;
      ztt_pinch = {
        dist: ztt_distance(e.touches[0], e.touches[1]),
        scale: ztt_state.scale,
        tx: ztt_state.tx,
        ty: ztt_state.ty
      };
      return;
    }
    if (e.touches.length === 1) {
      var ztt_t = e.touches[0];
      ztt_drag = { x: ztt_t.clientX, y: ztt_t.clientY, tx: ztt_state.tx, ty: ztt_state.ty };
      ztt_tap = { x: ztt_t.clientX, y: ztt_t.clientY, time: Date.now() };
      ztt_hintShown = false;
    }
  }

  // 函数功能：touchmove —— 双指按距离比例缩放并锚定中点；单指在放大后拖动
  function ztt_onMove(e) {
    if (e.touches.length >= 2 && ztt_pinch) {
      e.preventDefault(); // 必须非被动模式，才能阻止整页缩放

      var ztt_d = ztt_distance(e.touches[0], e.touches[1]);
      var ztt_raw = ztt_pinch.scale * (ztt_d / ztt_pinch.dist);
      var ztt_next = Math.min(ZTT_MAX, Math.max(ZTT_MIN, ztt_raw));
      var ztt_k = ztt_next / ztt_pinch.scale;
      var ztt_f = ztt_focal(e.touches[0], e.touches[1]);

      // 锚点公式：t新 = f - k·(f - t旧)，保证中点下方那一点原地不动
      ztt_state.scale = ztt_next;
      ztt_state.tx = ztt_f.x - ztt_k * (ztt_f.x - ztt_pinch.tx);
      ztt_state.ty = ztt_f.y - ztt_k * (ztt_f.y - ztt_pinch.ty);

      ztt_clamp();
      ztt_apply(false);
      return;
    }

    if (e.touches.length === 1 && ztt_drag && ztt_state.scale > 1) {
      e.preventDefault();
      var ztt_t = e.touches[0];
      ztt_state.tx = ztt_drag.tx + (ztt_t.clientX - ztt_drag.x);
      ztt_state.ty = ztt_drag.ty + (ztt_t.clientY - ztt_drag.y);
      ztt_clamp();
      ztt_apply(false);
      return;
    }

    // 1x 状态下拖不动，给一次提示，避免误以为“拖动坏掉了”
    if (e.touches.length === 1 && ztt_drag && ztt_state.scale <= 1 && !ztt_hintShown) {
      var ztt_tt = e.touches[0];
      var ztt_moved = Math.hypot(ztt_tt.clientX - ztt_drag.x, ztt_tt.clientY - ztt_drag.y);
      if (ztt_moved > 12) {
        ztt_hintShown = true;
        ztt_showDragHint();
      }
    }
  }

  // 函数功能：touchend —— 双指剩一指时重建拖动起点；全部抬起时判断双击
  function ztt_onEnd(e) {
    if (e.touches.length === 1) {
      ztt_pinch = null;
      var ztt_t = e.touches[0];
      ztt_drag = { x: ztt_t.clientX, y: ztt_t.clientY, tx: ztt_state.tx, ty: ztt_state.ty };
      ztt_tap = null;
      return;
    }
    if (e.touches.length === 0) {
      ztt_pinch = null;
      ztt_drag = null;

      var ztt_end = e.changedTouches[0];
      if (ztt_tap) {
        var ztt_dt = Date.now() - ztt_tap.time;
        var ztt_dd = Math.hypot(ztt_end.clientX - ztt_tap.x, ztt_end.clientY - ztt_tap.y);
        if (ztt_dt < ZTT_TAP_TIME && ztt_dd < ZTT_TAP_MOVE) {
          ztt_onTap(ztt_end.clientX, ztt_end.clientY);
        }
      }
      ztt_tap = null;
    }
  }

  // 函数功能：手势被系统打断时清空临时状态，避免下一轮手势错乱
  function ztt_onCancel() {
    ztt_pinch = null;
    ztt_drag = null;
    ztt_tap = null;
  }

  // 函数功能：旋转屏幕 / 窗口尺寸变化后重新夹边界，保留缩放状态
  function ztt_onResize() {
    if (ztt_resizeTimer) { clearTimeout(ztt_resizeTimer); }
    ztt_resizeTimer = setTimeout(function () {
      ztt_clamp();
      ztt_apply(false);
    }, 120);
  }

  // 函数功能：检测演示视频是否已放入，未放入时保留占位提示
  function ztt_bindVideo() {
    var ztt_video = document.getElementById('zttVideo3');
    var ztt_empty = document.getElementById('zttVideoEmpty3');
    if (!ztt_video || !ztt_empty) { return; }

    ztt_video.addEventListener('loadeddata', function () {
      ztt_empty.classList.add('ztt-hide');
    });
    ztt_video.addEventListener('error', function () {
      ztt_empty.classList.remove('ztt-hide');
    });
  }

  ztt_viewer.addEventListener('touchstart', ztt_onStart, { passive: true });
  ztt_viewer.addEventListener('touchmove', ztt_onMove, { passive: false });
  ztt_viewer.addEventListener('touchend', ztt_onEnd);
  ztt_viewer.addEventListener('touchcancel', ztt_onCancel);
  window.addEventListener('resize', ztt_onResize);
  window.addEventListener('orientationchange', ztt_onResize);
  ztt_resetBtn.addEventListener('click', ztt_reset);

  ztt_bindVideo();
  ztt_apply(false);
})();
