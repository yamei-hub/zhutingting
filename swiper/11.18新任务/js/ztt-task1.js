/**
 * 任务一 · 事件侦探
 * 作者：朱婷婷（24002120525）
 * 功能：在探针区监听 touchstart / touchmove / touchend / touchcancel / click，
 *      按真实顺序写日志并累加计数，供观察记录使用。
 * 变量与函数统一 ztt_ 前缀。
 */
(function () {
  'use strict';

  var ztt_pad = document.getElementById('zttPad1');
  var ztt_logBox = document.getElementById('zttLog1');
  var ztt_clearBtn = document.getElementById('zttClear1');

  // 页面加载时刻：日志用相对毫秒数，比绝对时间更容易看出先后
  var ztt_t0 = Date.now();

  // 五类事件的累计次数
  var ztt_n = { start: 0, move: 0, end: 0, cancel: 0, click: 0 };

  // 本次手势状态：一次 touchstart 到 touchend 之间
  var ztt_sessionMoves = 0;
  var ztt_startTime = 0;
  var ztt_startX = 0;
  var ztt_startY = 0;

  // 函数功能：把内存里的计数同步到页面上的 5 个计数器
  function ztt_syncCount() {
    document.getElementById('zttCountStart').textContent = ztt_n.start;
    document.getElementById('zttCountMove').textContent = ztt_n.move;
    document.getElementById('zttCountEnd').textContent = ztt_n.end;
    document.getElementById('zttCountCancel').textContent = ztt_n.cancel;
    document.getElementById('zttCountClick').textContent = ztt_n.click;
  }

  // 函数功能：向日志区追加一条带相对时间的记录，并自动滚到底部（最多保留 80 条）
  function ztt_log(type, text) {
    var ztt_empty = ztt_logBox.querySelector('.ztt-log-empty');
    if (ztt_empty) {
      ztt_logBox.removeChild(ztt_empty);
    }

    var ztt_row = document.createElement('div');
    ztt_row.className = 'ztt-log-row';

    var ztt_time = document.createElement('span');
    ztt_time.className = 'ztt-time';
    ztt_time.textContent = (Date.now() - ztt_t0) + 'ms';

    var ztt_text = document.createElement('span');
    ztt_text.className = 'ztt-t-' + type;
    ztt_text.textContent = text;

    ztt_row.appendChild(ztt_time);
    ztt_row.appendChild(ztt_text);
    ztt_logBox.appendChild(ztt_row);

    while (ztt_logBox.children.length > 80) {
      ztt_logBox.removeChild(ztt_logBox.firstChild);
    }
    ztt_logBox.scrollTop = ztt_logBox.scrollHeight;
  }

  // 函数功能：按下时在接触点画一个向外扩散的橙色圆点，直观看到触点位置
  function ztt_drawDot(x, y) {
    var ztt_rect = ztt_pad.getBoundingClientRect();
    var ztt_dot = document.createElement('span');
    ztt_dot.className = 'ztt-dot';
    ztt_dot.style.left = (x - ztt_rect.left) + 'px';
    ztt_dot.style.top = (y - ztt_rect.top) + 'px';
    ztt_pad.appendChild(ztt_dot);
    setTimeout(function () {
      if (ztt_dot.parentNode) {
        ztt_dot.parentNode.removeChild(ztt_dot);
      }
    }, 620);
  }

  // 函数功能：touchstart —— 记录起点坐标与时间，重置本次 move 计数
  function ztt_onStart(e) {
    var ztt_t = e.touches[0];
    ztt_n.start++;
    ztt_sessionMoves = 0;
    ztt_startTime = Date.now();
    ztt_startX = ztt_t.clientX;
    ztt_startY = ztt_t.clientY;

    ztt_pad.classList.add('ztt-hit');
    ztt_drawDot(ztt_t.clientX, ztt_t.clientY);

    ztt_log('start', 'touchstart  (' + Math.round(ztt_startX) + ', ' + Math.round(ztt_startY) + ')  ' + e.touches.length + ' 指');
    ztt_syncCount();
  }

  // 函数功能：touchmove —— 累加次数；每 4 次输出一行坐标，避免日志刷屏
  function ztt_onMove(e) {
    ztt_n.move++;
    ztt_sessionMoves++;

    if (ztt_sessionMoves % 4 === 1) {
      var ztt_t = e.touches[0];
      ztt_log('move', 'touchmove   (' + Math.round(ztt_t.clientX) + ', ' + Math.round(ztt_t.clientY) + ')  第 ' + ztt_sessionMoves + ' 次');
    }
    ztt_syncCount();
  }

  // 函数功能：touchend —— 用 changedTouches 计算位移与耗时，给出本次手势的结论
  function ztt_onEnd(e) {
    ztt_n.end++;
    var ztt_t = e.changedTouches[0];
    var ztt_dx = ztt_t.clientX - ztt_startX;
    var ztt_dy = ztt_t.clientY - ztt_startY;
    var ztt_cost = Date.now() - ztt_startTime;

    ztt_pad.classList.remove('ztt-hit');
    ztt_log('end', 'touchend    dx=' + Math.round(ztt_dx) + ' dy=' + Math.round(ztt_dy) + '  ' + ztt_cost + 'ms  move×' + ztt_sessionMoves);
    ztt_syncCount();
  }

  // 函数功能：touchcancel —— 被系统打断（来电 / 横幅）时记录，并清掉本次手势状态
  function ztt_onCancel(e) {
    ztt_n.cancel++;
    ztt_sessionMoves = 0;
    ztt_pad.classList.remove('ztt-hit');
    ztt_log('cancel', 'touchcancel  手势被系统打断，本次状态已清理');
    ztt_syncCount();
  }

  // 函数功能：click —— 记录 touchend 之后补发的点击事件（能看出它总在最后）
  function ztt_onClick(e) {
    ztt_n.click++;
    ztt_log('click', 'click       (' + Math.round(e.clientX) + ', ' + Math.round(e.clientY) + ')');
    ztt_syncCount();
  }

  // 函数功能：清空日志与全部计数，恢复“等待触摸”的初始状态
  function ztt_reset() {
    ztt_n = { start: 0, move: 0, end: 0, cancel: 0, click: 0 };
    ztt_sessionMoves = 0;
    ztt_logBox.innerHTML = '<div class="ztt-log-empty">等待你的第一次触摸……</div>';
    ztt_pad.classList.remove('ztt-hit');
    ztt_syncCount();
  }

  // 探针区：touch-action:none 把这块区域的手势完全接管，页面其他区域照常滚动
  ztt_pad.addEventListener('touchstart', ztt_onStart, { passive: true });
  ztt_pad.addEventListener('touchmove', ztt_onMove, { passive: true });
  ztt_pad.addEventListener('touchend', ztt_onEnd);
  ztt_pad.addEventListener('touchcancel', ztt_onCancel);
  ztt_pad.addEventListener('click', ztt_onClick);

  ztt_clearBtn.addEventListener('click', ztt_reset);

  // 初始渲染一次计数，保证是 0
  ztt_syncCount();
})();
