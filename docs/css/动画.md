# CSS 动画

> 官方文档：[MDN - CSS Animations](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Animations)

## 什么是 CSS 动画？

**CSS 动画 = 让元素动起来，从一个样式逐步变化到另一个样式**

想象一下：
- ❌ Transition（过渡）：A → B，需要触发
- ✅ Animation（动画）：A → B → C → D，自动播放

```
过渡 vs 动画：

过渡：    A  ════>  B
         (hover 触发)

动画：    A → B → C → D → A → ...
         (自动循环播放)
```

**核心特点：**
- ✅ 不需要 JavaScript
- ✅ 可以自动播放
- ✅ 可以无限循环
- ✅ 可以控制播放状态（暂停/播放）
- ✅ 可以定义多个关键帧

---

## 一、基本语法

### 1.1 两步走

```css
/* 第一步：定义动画（关键帧）*/
@keyframes 动画名 {
  from { /* 开始状态 */ }
  to   { /* 结束状态 */ }
}

/* 第二步：应用动画 */
元素 {
  animation: 动画名 时长 速度曲线 延迟 次数 方向 填充模式 播放状态;
}
```

### 1.2 最简单的例子

```css
/* 定义动画：从红色变蓝色 */
@keyframes colorChange {
  from {
    background: red;
  }
  to {
    background: blue;
  }
}

/* 应用动画 */
.box {
  width: 100px;
  height: 100px;
  animation: colorChange 2s;
}
```

**效果：** 盒子在 2 秒内从红色渐变到蓝色

---

## 二、@keyframes 关键帧

### 2.1 基本语法

```css
/* 方式1：from / to */
@keyframes 动画名 {
  from {
    /* 开始状态 */
  }
  to {
    /* 结束状态 */
  }
}

/* 方式2：百分比（更灵活）*/
@keyframes 动画名 {
  0% {
    /* 开始状态 */
  }
  50% {
    /* 中间状态 */
  }
  100% {
    /* 结束状态 */
  }
}
```

### 2.2 多个关键帧

```css
@keyframes rainbow {
  0%   { background: red; }
  25%  { background: yellow; }
  50%  { background: green; }
  75%  { background: blue; }
  100% { background: purple; }
}

.box {
  animation: rainbow 4s;
}
```

**时间线：**
```
0%    25%    50%    75%    100%
│      │      │      │      │
红 → 黄 → 绿 → 蓝 → 紫
```

### 2.3 同时动画多个属性

```css
@keyframes moveAndScale {
  0% {
    transform: translateX(0) scale(1);
    opacity: 0;
  }
  50% {
    transform: translateX(100px) scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: translateX(200px) scale(1);
    opacity: 1;
  }
}
```

### 2.4 使用 from/to 关键字

```css
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## 三、animation 属性详解

### 3.1 完整简写

```css
animation: name duration timing-function delay iteration-count direction fill-mode play-state;
```

```css
.box {
  animation: bounce 1s ease-in-out 0.5s 3 alternate forwards running;
  /*         │     │      │            │    │         │         │      */
  /*         │     │      │            │    │         │         └─ 播放状态 */
  /*         │     │      │            │    │         └─────────── 填充模式 */
  /*         │     │      │            │    └───────────────────── 方向 */
  /*         │     │      │            └────────────────────────── 次数 */
  /*         │     │      └─────────────────────────────────────── 延迟 */
  /*         │     └────────────────────────────────────────────── 速度曲线 */
  /*         └─────────────────────────────────────────────────── 动画名 */
}
```

### 3.2 各个子属性

| 属性 | 说明 | 常用值 |
|-----|------|--------|
| `animation-name` | 动画名称 | 自定义名称 |
| `animation-duration` | 动画时长 | `2s`, `500ms` |
| `animation-timing-function` | 速度曲线 | `ease`, `linear`, `cubic-bezier()` |
| `animation-delay` | 延迟时间 | `0s`, `1s` |
| `animation-iteration-count` | 播放次数 | `1`, `2`, `infinite` |
| `animation-direction` | 播放方向 | `normal`, `alternate`, `reverse` |
| `animation-fill-mode` | 填充模式 | `forwards`, `backwards`, `both` |
| `animation-play-state` | 播放状态 | `running`, `paused` |

#### 3.2.1 animation-name - 动画名称

```css
/* 单个动画 */
animation-name: slideIn;

/* 多个动画（逗号分隔）*/
animation-name: slideIn, fadeIn;
```

#### 3.2.2 animation-duration - 动画时长

```css
animation-duration: 2s;      /* 2秒 */
animation-duration: 500ms;   /* 500毫秒 */

/* 多个动画对应多个时长 */
animation-name: slideIn, fadeIn;
animation-duration: 1s, 0.5s;
```

#### 3.2.3 animation-timing-function - 速度曲线

```css
/* 预设值 */
animation-timing-function: ease;       /* 默认，慢快慢 */
animation-timing-function: linear;     /* 匀速 */
animation-timing-function: ease-in;    /* 慢→快 */
animation-timing-function: ease-out;   /* 快→慢 */
animation-timing-function: ease-in-out; /* 慢快慢 */

/* 自定义贝塞尔曲线 */
animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* 步进函数 */
animation-timing-function: steps(4);   /* 分4步完成 */
animation-timing-function: steps(4, end);
```

#### 3.2.4 animation-delay - 延迟时间

```css
animation-delay: 0s;      /* 立即开始 */
animation-delay: 1s;      /* 等1秒再开始 */
animation-delay: -1s;     /* 负值=跳过前1秒，直接从中间开始 */
```

#### 3.2.5 animation-iteration-count - 播放次数

```css
animation-iteration-count: 1;         /* 播放1次 */
animation-iteration-count: 3;         /* 播放3次 */
animation-iteration-count: infinite;  /* 无限循环 */
```

#### 3.2.6 animation-direction - 播放方向

```css
/* normal：正常方向（默认）*/
animation-direction: normal;

/* reverse：反向播放 */
animation-direction: reverse;

/* alternate：交替播放（正向→反向→正向...）*/
animation-direction: alternate;

/* alternate-reverse：反向交替（反向→正向→反向...）*/
animation-direction: alternate-reverse;
```

```
normal:        A → B → A → B → ...
reverse:       B → A → B → A → ...
alternate:     A → B → A → B → ... (平滑过渡)
```

#### 3.2.7 animation-fill-mode - 填充模式

```css
/* none：默认，动画结束后回到原样 */
animation-fill-mode: none;

/* forwards：动画结束后保持最后一帧 */
animation-fill-mode: forwards;

/* backwards：动画开始前显示第一帧 */
animation-fill-mode: backwards;

/* both：结合 forwards 和 backwards */
animation-fill-mode: both;
```

**示例对比：**

```css
@keyframes slide {
  0%   { transform: translateX(0); }
  100% { transform: translateX(100px); }
}

/* none：动画结束后回到原点 */
.box1 { animation: slide 1s none; }

/* forwards：动画结束后停在终点 */
.box2 { animation: slide 1s forwards; }
```

#### 3.2.8 animation-play-state - 播放状态

```css
/* running：播放（默认）*/
animation-play-state: running;

/* paused：暂停 */
animation-play-state: paused;
```

**配合 hover 实现悬停暂停：**

```css
.box {
  animation: rotate 3s linear infinite;
}

.box:hover {
  animation-play-state: paused;
}
```

### 3.3 多动画组合

```css
.box {
  animation:
    slideIn 1s ease-out,
    rotate 2s linear infinite,
    pulse 1.5s ease-in-out infinite;
}
```

---

## 四、动画与过渡的区别

| 特性 | Transition | Animation |
|-----|-----------|-----------|
| **触发方式** | 需要事件触发 | 自动播放 |
| **关键帧** | 只能 A→B | 可以 A→B→C→D |
| **循环** | 需要 JS | 可设置 infinite |
| **控制** | 有限 | 可暂停、倒退、延迟 |
| **复杂度** | 简单 | 复杂 |
| **适用场景** | 悬停、点击效果 | 加载动画、循环动画 |

```css
/* Transition：简单过渡 */
.box {
  transition: transform 0.5s;
}
.box:hover {
  transform: scale(1.2);
}

/* Animation：复杂动画 */
.box {
  animation: bounce 1s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
```

---

## 五、实际应用示例

### 示例1：加载旋转动画

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.loader {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

**效果：** 圆圈不停旋转

### 示例2：弹跳球

```css
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    animation-timing-function: ease-out;
  }
  50% {
    transform: translateY(-50px);
    animation-timing-function: ease-in;
  }
}

.ball {
  width: 50px;
  height: 50px;
  background: red;
  border-radius: 50%;
  animation: bounce 1s infinite;
}
```

**效果：** 球上下弹跳

### 示例3：呼吸效果

```css
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.button {
  animation: breathe 2s ease-in-out infinite;
}
```

**效果：** 按钮像呼吸一样缩放

### 示例4：淡入淡出

```css
@keyframes fadeInOut {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

.message {
  animation: fadeInOut 3s ease-in-out;
}
```

**效果：** 消息淡入，停留，淡出

### 示例5：打字机效果

```css
@keyframes typing {
  from { width: 0; }
  to   { width: 100%; }
}

@keyframes blink {
  50% { border-color: transparent; }
}

.typewriter {
  overflow: hidden;
  white-space: nowrap;
  border-right: 3px solid #333;
  animation:
    typing 3s steps(20) forwards,
    blink 0.5s step-end infinite;
}
```

**效果：** 逐字显示，光标闪烁

### 示例6：波浪文字

```css
@keyframes wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.wave-text span {
  display: inline-block;
  animation: wave 1s ease-in-out infinite;
}

.wave-text span:nth-child(1) { animation-delay: 0s; }
.wave-text span:nth-child(2) { animation-delay: 0.1s; }
.wave-text span:nth-child(3) { animation-delay: 0.2s; }
.wave-text span:nth-child(4) { animation-delay: 0.3s; }
```

```html
<div class="wave-text">
  <span>你</span><span>好</span><span>世</span><span>界</span>
</div>
```

**效果：** 文字依次上下波动

### 示例7：3D 翻转卡片

```css
@keyframes flip {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg); }
}

.card {
  animation: flip 3s ease-in-out infinite;
  transform-style: preserve-3d;
}
```

### 示例8：进度条

```css
@keyframes progress {
  0% { width: 0; }
  100% { width: 100%; }
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #f0f0f0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  animation: progress 3s ease-out forwards;
}
```

### 示例9：脉冲警告

```css
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(231, 76, 60, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
  }
}

.alert {
  animation: pulse 2s infinite;
}
```

**效果：** 警告框红圈脉冲扩散

### 示例10：滑入动画序列

```css
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-item {
  opacity: 0;
  animation: slideInUp 0.5s ease-out forwards;
}

.list-item:nth-child(1) { animation-delay: 0.1s; }
.list-item:nth-child(2) { animation-delay: 0.2s; }
.list-item:nth-child(3) { animation-delay: 0.3s; }
.list-item:nth-child(4) { animation-delay: 0.4s; }
```

**效果：** 列表项依次滑入

---

## 六、性能优化

### 6.1 优先使用 GPU 加速属性

```css
/* ✅ 推荐：GPU 加速 */
@keyframes good {
  from { transform: translateX(0); opacity: 0; }
  to   { transform: translateX(100px); opacity: 1; }
}

/* ❌ 避免：触发布局重排 */
@keyframes bad {
  from { left: 0; width: 100px; }
  to   { left: 100px; width: 200px; }
}
```

### 6.2 使用 will-change 提示浏览器

```css
.animated-element {
  will-change: transform, opacity;
}
```

> ⚠️ 不要滥用，只在动画元素上使用

### 6.3 减少重绘

```css
/* 使用 transform 代替 position */
.animated {
  transform: translateX(100px);  /* ✅ */
  /* left: 100px;                  ❌ */
}
```

### 6.4 使用 steps() 优化帧动画

```css
/* 精灵图帧动画 */
@keyframes sprite {
  from { background-position: 0 0; }
  to   { background-position: -400px 0; }
}

.sprite {
  width: 50px;
  height: 50px;
  background: url(sprite.png);
  animation: sprite 0.5s steps(8) infinite;
}
```

---

## 七、动画事件

JavaScript 可以监听动画事件：

```javascript
const box = document.querySelector('.box');

// 动画开始
box.addEventListener('animationstart', function() {
  console.log('动画开始');
});

// 动画结束
box.addEventListener('animationend', function(e) {
  console.log('动画结束', e.animationName);
});

// 动画重复
box.addEventListener('animationiteration', function() {
  console.log('动画重复');
});
```

**实际应用：**

```javascript
// 动画结束后执行回调
box.addEventListener('animationend', function() {
  this.classList.add('finished');
  // 可以在这里触发下一个动画
});
```

---

## 八、实用代码模板

```css
/* ========== 旋转动画 ========== */
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ========== 淡入 ========== */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ========== 淡出 ========== */
@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}

/* ========== 滑入 ========== */
@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

/* ========== 缩放 ========== */
@keyframes scale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* ========== 弹跳 ========== */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* ========== 摇摆 ========== */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

---

## 九、常见问题

### Q1：动画不生效？

```css
/* 检查清单 */
.box {
  /* 1. 是否定义了 animation-name？*/
  animation-name: myAnimation;

  /* 2. 是否设置了 animation-duration？*/
  animation-duration: 2s;

  /* 3. @keyframes 名称是否匹配？*/
}
@keyframes myAnimation { ... }
```

### Q2：动画卡顿？

```css
/* 解决方案：使用 transform 代替 left/top */
/* ❌ 卡顿 */
.box { animation: moveLeft 2s; }
@keyframes moveLeft {
  from { left: 0; }
  to   { left: 100px; }
}

/* ✅ 流畅 */
.box { animation: moveTransform 2s; }
@keyframes moveTransform {
  from { transform: translateX(0); }
  to   { transform: translateX(100px); }
}
```

### Q3：动画结束后回到原样？

```css
/* 添加 forwards 保持最后一帧 */
.box {
  animation: move 2s forwards;
}
```

---

## 十、快速参考

### 完整示例

```css
/* 定义动画 */
@keyframes slideIn {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 应用动画 */
.element {
  /* 简写 */
  animation: slideIn 0.5s ease-out forwards;

  /* 或分开写 */
  animation-name: slideIn;
  animation-duration: 0.5s;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}
```

### 常用动画组合

```css
/* 无限循环 + 交替方向 */
animation: bounce 1s ease-in-out infinite alternate;

/* 延迟 + 保持最后一帧 */
animation: fadeIn 0.5s ease 0.3s forwards;

/* 多动画组合 */
animation: slideIn 0.5s, rotate 2s linear infinite;
```

### 时长建议

| 场景 | 推荐时长 |
|-----|---------|
| 加载动画 | 1-2s |
| 强调效果 | 0.3-0.5s |
| 页面切换 | 0.3-0.5s |
| 循环动画 | 2-4s |
