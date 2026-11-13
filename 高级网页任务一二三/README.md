# 高级网页设计 · 课堂实践作品集

朱婷婷（24002120525）· 2026-2027-1

纯静态 HTML / CSS / JavaScript 作品集，无需构建工具，双击 `index.html` 即可浏览。

## 快速开始

直接打开根目录的 `index.html`，或把整个文件夹拖入浏览器。页面之间全部使用相对路径，`file://` 下即可正常运行。

## 目录结构

```
ztt-swiper-gallery高级网页/
├── index.html              # 课堂实践总目录
├── guide.html              # 汽车导购 Tab 选项卡
├── css/ztt.css             # Tab 组件样式
├── js/ztt.js               # Tab 组件交互脚本（可复用实例）
├── font/index.html         # 字体练习
└── swiper/                 # Swiper 模块 · 大国重器光影展
    ├── index.html          # 模块导航
    ├── swiper-task.html    # 基础演示一~四（七种 effect 实时切换）
    ├── task1.html          # 任务一 · 提示词工程师（两轮提示词对照）
    ├── task2.html          # 任务二 · creative 电影选片墙
    ├── task3.html          # 任务三 · 魔都号 + 缩略图联动封面流
    ├── 提示词.html          # AI 对话记录与答辩要点
    ├── swiper/             # 本地 Swiper bundle（css / js）
    ├── swiper-imgs/        # 六张展品图片
    └── docs/               # 效果验证截图
```

## 内容说明

### Swiper 模块

以“大国重器光影展”为主题，六件展品：天宫空间站、复兴号动车组、C919 大飞机、奋斗者号、中国天眼 FAST、爱达·魔都号。

- **基础演示台**：最小可拖动轮播、分页圆点 + 箭头、自动翻页、slide / fade / cube / coverflow / flip / cards / creative 七种效果切换。
- **任务一**：同一需求的两轮提示词对比，展示“圆点不可点”到“clickable 可跳转”的修正过程。
- **任务二**：课堂未讲的第 7 种 effect `creative`，用 `creativeEffect.prev / next` 自定义上一张退场与下一张进场的位移、旋转、缩放、透明度，形成“电影选片墙”。
- **任务三**：新增第六件展品，`thumbs` 缩略图与主图双向联动，主图使用大角度 coverflow 旋转堆叠；并扩展 keyboard 键盘（← →）、mousewheel 滚轮、zoom 双击缩放、parallax 视差四项能力。
- **AI 对话记录**：三个任务的提示词原文、AI 回答、错误订正与答辩要点。

### Tab 选项卡模块

`guide.html` 一比一还原课堂测试效果图：导购 / 3-9万 / 9-17万 / 17-42万 / SUV 五个选项卡，样式与脚本分离，脚本封装为可复用实例。

## 技术要点

- 原生 HTML5 + CSS3 + ES5 JavaScript，无框架、无构建
- Swiper 使用本地 `swiper-bundle.min.js / .css`，不依赖 CDN
- 所有类名、ID、变量统一 `ztt` 前缀
- 响应式布局，支持窄屏（≤760px）单列显示
- 页面间使用相对路径互链，可直接本地打开

## 作者

朱婷婷 · 24002120525 · 高级网页设计 2026-2027-1
