/**
 * 任务四 · 摇一摇彩蛋
 * 作者：朱婷婷（24002120525）
 * 功能：监听 devicemotion，用 accelerationIncludingGravity 算合成加速度，
 *      超过阈值 18 触发“摇出今日菜谱”，1.5s 冷却防重复；
 *      iOS 走按钮授权；无传感器时提示不支持并提供“点我抽一次”降级。
 * 变量与函数统一 ztt_ 前缀。
 */
(function () {
  'use strict';

  var ztt_box = document.getElementById('zttSensorBox4');
  var ztt_status = document.getElementById('zttStatus4');
  var ztt_readout = document.getElementById('zttReadout4');
  var ztt_permitBtn = document.getElementById('zttPermit4');
  var ztt_fallbackBtn = document.getElementById('zttFallback4');
  var ztt_result = document.getElementById('zttResult4');
  var ztt_dishName = document.getElementById('zttDishName4');
  var ztt_dishTag = document.getElementById('zttDishTag4');
  var ztt_dishDesc = document.getElementById('zttDishDesc4');
  var ztt_tiltBox = document.getElementById('zttTiltBox4');
  var ztt_tiltReadout = document.getElementById('zttTiltReadout4');
  var ztt_tiltTip = document.getElementById('zttTiltTip4');
  var ztt_tiltLayers = ztt_tiltBox ? ztt_tiltBox.querySelectorAll('.ztt-tilt-layer') : [];

  var ZTT_THRESHOLD = 14;   // 合成加速度阈值（静止基线约 9.8，比课程例子 18 更灵敏）
  var ZTT_SPIKE = 6;        // 相邻两帧的变化量阈值：轻轻一甩也能触发
  var ZTT_COOLDOWN = 1500;  // 冷却时间（ms）

  var ztt_locked = false;   // 冷却锁
  var ztt_hasData = false;  // 是否收到过传感器数据
  var ztt_lastDish = -1;
  var ztt_lastRead = 0;
  var ztt_lastMag = 0;      // 上一帧合成加速度，用于算突变
  var ztt_hasOrient = false;
  var ztt_orientStarted = false;

  var ztt_dishes = [
    { name: '麻婆豆腐', tag: '川菜 · 麻辣鲜香', desc: '嫩豆腐配牛肉末，花椒面最后撒，麻、辣、烫、香、酥、嫩、鲜、活八字俱全。' },
    { name: '番茄炒蛋', tag: '家常菜 · 酸甜下饭', desc: '鸡蛋先炒到刚凝固盛出，番茄炒出汁再把蛋倒回，糖和盐各半勺，拌饭最好。' },
    { name: '红烧排骨', tag: '本帮菜 · 浓油赤酱', desc: '排骨焯水后冰糖炒糖色，加生抽老抽小火慢炖四十分钟，收汁到发亮。' },
    { name: '清蒸鲈鱼', tag: '粤菜 · 原汁原味', desc: '水开后大火蒸八分钟，倒掉腥水，铺葱丝姜丝淋热油和蒸鱼豉油。' },
    { name: '酸辣土豆丝', tag: '家常菜 · 脆爽开胃', desc: '土豆切细丝泡水去淀粉，热油爆干辣椒和花椒，大火快炒三十秒，出锅前淋醋。' },
    { name: '小笼包', tag: '江南点心 · 皮薄汁多', desc: '皮薄馅大、收口十八道褶，先开窗后喝汤，配姜丝香醋一起吃。' },
    { name: '白切鸡', tag: '粤菜 · 清鲜本味', desc: '整鸡浸熟后立刻过冰水，鸡皮爽脆，蘸姜葱蓉或沙姜酱油。' },
    { name: '蛋炒饭', tag: '家常菜 · 粒粒分明', desc: '隔夜饭打散，热锅冷油先炒蛋再下饭，出锅前撒葱花，锅气足才香。' }
  ];

  // 函数功能：设置状态文案与颜色（黄色=就绪，红色=不支持/未授权）
  function ztt_statusSet(text, color) {
    ztt_status.textContent = text;
    ztt_status.style.color = color || '#d9e3f5';
  }

  // 函数功能：随机抽一道菜并渲染，避免与上一次重复；带弹出动画
  function ztt_pick() {
    var ztt_i = Math.floor(Math.random() * ztt_dishes.length);
    if (ztt_dishes.length > 1 && ztt_i === ztt_lastDish) {
      ztt_i = (ztt_i + 1) % ztt_dishes.length;
    }
    ztt_lastDish = ztt_i;

    var ztt_d = ztt_dishes[ztt_i];
    ztt_dishName.textContent = ztt_d.name;
    ztt_dishTag.textContent = ztt_d.tag;
    ztt_dishDesc.textContent = ztt_d.desc;

    ztt_result.classList.remove('ztt-show');
    void ztt_result.offsetWidth; // 强制重排，让动画每次都重新播放
    ztt_result.classList.add('ztt-show');
  }

  // 函数功能：触发一次抽取：上锁 1.5s，卡片抖一下并出结果
  function ztt_trigger() {
    if (ztt_locked) {
      return;
    }
    ztt_locked = true;

    ztt_pick();

    ztt_box.classList.remove('ztt-shaking');
    void ztt_box.offsetWidth;
    ztt_box.classList.add('ztt-shaking');

    setTimeout(function () {
      ztt_locked = false;
    }, ZTT_COOLDOWN);
  }

  // 函数功能：devicemotion 回调 —— 算三轴合成加速度，超阈值即触发（读取限流 100ms）
  function ztt_onMotion(e) {
    var ztt_a = e.accelerationIncludingGravity;
    if (!ztt_a || typeof ztt_a.x !== 'number') {
      return;
    }

    if (!ztt_hasData) {
      ztt_hasData = true;
      ztt_statusSet('传感器已就绪，摇一摇试试', '#ffd166');
    }

    var ztt_now = Date.now();
    var ztt_mag = Math.hypot(ztt_a.x || 0, ztt_a.y || 0, ztt_a.z || 0);
    // 相邻帧突变：判定“快甩”，弥补合成值不高但动作很快的情况
    var ztt_delta = ztt_lastMag ? Math.abs(ztt_mag - ztt_lastMag) : 0;
    ztt_lastMag = ztt_mag;

    if (ztt_now - ztt_lastRead > 100) {
      ztt_lastRead = ztt_now;
      ztt_readout.textContent = 'x ' + (ztt_a.x || 0).toFixed(1) +
        '　y ' + (ztt_a.y || 0).toFixed(1) +
        '　z ' + (ztt_a.z || 0).toFixed(1) +
        '　合成 ' + ztt_mag.toFixed(1) + '（阈值 ' + ZTT_THRESHOLD + '）';
    }

    if (ztt_mag > ZTT_THRESHOLD || ztt_delta > ZTT_SPIKE) {
      ztt_trigger();
    }
  }

  // 函数功能：无传感器 / 无权限时的降级提示，保留“点我抽一次”入口
  function ztt_showUnsupported() {
    // iOS 只允许在 https（安全上下文）页面读取传感器，http / file 一律没有数据
    if (!window.isSecureContext) {
      ztt_statusSet('当前不是 https，iPhone 读不到传感器', '#fca5a5');
      ztt_readout.textContent = '合成加速度：http / file 页面拿不到传感器数据，请用 https 链接打开，或点下方按钮抽取';
      return;
    }
    ztt_statusSet('当前设备不支持，请用手机打开', '#fca5a5');
    ztt_readout.textContent = '合成加速度：未收到传感器数据（设备不支持或未授权），可点下方按钮抽取';
  }

  // 函数功能：开始监听 devicemotion，并在 1.5s 内没数据时自动降级
  function ztt_startMotion() {
    if (ztt_hasData) {
      return;
    }
    window.addEventListener('devicemotion', ztt_onMotion);
    setTimeout(function () {
      if (!ztt_hasData) {
        ztt_showUnsupported();
      }
    }, 1500);
  }

  // 函数功能：按倾斜角度驱动三层视差；gamma 左右、beta 前后，depth 越大位移越大
  function ztt_applyTilt(gamma, beta) {
    var ztt_g = Math.max(-30, Math.min(30, gamma || 0));
    var ztt_b = Math.max(-30, Math.min(30, beta || 0));

    for (var ztt_i = 0; ztt_i < ztt_tiltLayers.length; ztt_i++) {
      var ztt_depth = parseFloat(ztt_tiltLayers[ztt_i].getAttribute('data-depth')) || 10;
      var ztt_x = (ztt_g / 30) * ztt_depth;
      var ztt_y = (ztt_b / 30) * ztt_depth * 0.6;
      ztt_tiltLayers[ztt_i].style.transform =
        'translate3d(' + ztt_x.toFixed(1) + 'px,' + ztt_y.toFixed(1) + 'px,0)';
    }

    if (ztt_tiltReadout) {
      ztt_tiltReadout.textContent = 'γ 横滚：' + Math.round(gamma || 0) + '°　β 前后：' + Math.round(beta || 0) + '°';
    }
  }

  // 函数功能：deviceorientation 回调 —— 读出 β / γ 并驱动倾斜视差
  function ztt_onOrient(e) {
    if (e.gamma === null && e.beta === null) {
      return;
    }
    if (!ztt_hasOrient) {
      ztt_hasOrient = true;
      if (ztt_tiltTip) {
        ztt_tiltTip.textContent = '倾斜已生效：左右倾斜看横向视差，前后倾斜看纵向视差。';
      }
    }
    ztt_applyTilt(e.gamma, e.beta);
  }

  // 函数功能：开始监听 deviceorientation，1.5s 内无数据时给出降级说明
  function ztt_startOrientation() {
    if (ztt_orientStarted) {
      return;
    }
    ztt_orientStarted = true;
    window.addEventListener('deviceorientation', ztt_onOrient);
    setTimeout(function () {
      if (!ztt_hasOrient && ztt_tiltTip) {
        ztt_tiltTip.textContent = '未收到方向数据（iOS 需 https + 授权，桌面没有陀螺仪）；电脑上把鼠标移到框内即可预览。';
      }
    }, 1500);
  }

  // 函数功能：桌面预览 —— 用鼠标在视差框内的位置模拟 β / γ
  function ztt_onMouseTilt(e) {
    var ztt_rect = ztt_tiltBox.getBoundingClientRect();
    var ztt_gamma = ((e.clientX - ztt_rect.left) / ztt_rect.width - 0.5) * 60;
    var ztt_beta = ((e.clientY - ztt_rect.top) / ztt_rect.height - 0.5) * 40;
    ztt_applyTilt(ztt_gamma, ztt_beta);
  }

  // 函数功能：iOS 权限申请 —— 同一次点击里依次申请运动与方向权限
  function ztt_askPermission() {
    var ztt_motionReq = null;
    var ztt_orientReq = null;

    if (typeof window.DeviceMotionEvent !== 'undefined' &&
        typeof window.DeviceMotionEvent.requestPermission === 'function') {
      ztt_motionReq = window.DeviceMotionEvent.requestPermission();
    }
    if (typeof window.DeviceOrientationEvent !== 'undefined' &&
        typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      ztt_orientReq = window.DeviceOrientationEvent.requestPermission();
    }

    Promise.all([
      ztt_motionReq ? ztt_motionReq.catch(function () { return 'denied'; }) : Promise.resolve('granted'),
      ztt_orientReq ? ztt_orientReq.catch(function () { return 'denied'; }) : Promise.resolve('granted')
    ]).then(function (states) {
      if (states[0] === 'granted') {
        ztt_permitBtn.style.display = 'none';
        ztt_statusSet('授权成功，摇一摇试试', '#ffd166');
        ztt_startMotion();
      } else {
        ztt_statusSet('未获得运动权限，请点下方按钮抽取', '#fca5a5');
      }
      if (states[1] === 'granted') {
        ztt_startOrientation();
      }
    });
  }

  // 函数功能：检测演示视频是否已放入，未放入时保留占位提示
  function ztt_bindVideo() {
    var ztt_video = document.getElementById('zttVideo4');
    var ztt_empty = document.getElementById('zttVideoEmpty4');
    if (!ztt_video || !ztt_empty) {
      return;
    }
    ztt_video.addEventListener('loadeddata', function () {
      ztt_empty.classList.add('ztt-hide');
    });
    ztt_video.addEventListener('error', function () {
      ztt_empty.classList.remove('ztt-hide');
    });
  }

  // 启动判断：有 requestPermission（iOS 13+）就先显示授权按钮，否则直接监听
  if (typeof window.DeviceMotionEvent !== 'undefined' &&
      typeof window.DeviceMotionEvent.requestPermission === 'function') {
    ztt_permitBtn.style.display = 'inline-block';
    if (window.isSecureContext) {
      ztt_statusSet('iOS 需要先点下方按钮授权', '#ffd166');
    } else {
      ztt_statusSet('iPhone 需用 https 打开才能摇', '#fca5a5');
      ztt_readout.textContent = '合成加速度：http / file 页面拿不到传感器数据，可先用下方按钮抽取';
    }
    ztt_permitBtn.addEventListener('click', ztt_askPermission);
  } else if (typeof window.DeviceMotionEvent === 'undefined') {
    ztt_showUnsupported();
    ztt_startOrientation();
  } else {
    ztt_startMotion();
    ztt_startOrientation();
  }

  ztt_fallbackBtn.addEventListener('click', ztt_trigger);
  if (ztt_tiltBox) {
    ztt_tiltBox.addEventListener('mousemove', ztt_onMouseTilt);
  }
  ztt_bindVideo();
})();
