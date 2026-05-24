# CSS Transition 过渡效果

> 官方文档：[MDN - CSS Transitions](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Transitions)

## 什么是过渡？

**过渡 = 从一个状态变到另一个状态时的"渐变动画"**

想象一下：
- ❌ 没有过渡：像开关灯，瞬间变化
- ✅ 有过渡：像调光台灯，慢慢变亮

```
状态 A  ────渐变────→  状态 B
     ↑
  transition 控制这个过程
```

**最简单的例子：**
```css
/* 鼠标悬停时，背景色慢慢变化（而不是瞬间变化）*/
.box {
  background: blue;
  transition: background 0.3s;  /* 0.3秒完成过渡 */
}

.box:hover {
  background: red;
}
```

---

## 一、基本语法

### 1.1 简写公式

```css
transition: 属性 时长 速度曲线 延迟;
```

```css
/* 完整写法 */
transition: width 0.5s ease 0.2s;
/*            │    │    │    │
/*            │    │    │    └─ 等0.2秒再开始
/*            │    │    └────── 速度曲线
/*            │    └─────────── 0.5秒完成
/*            └──────────────── 过渡的属性
```

### 1.2 最常用写法

```css
/* 写法1：过渡所有变化 */
transition: all 0.3s ease;

/* 写法2：只过渡指定属性 */
transition: background 0.3s, transform 0.3s;

/* 写法3：最简单（只写属性和时长）*/
transition: width 0.5s;
```

---

## 二、四个核心属性

| 属性 | 作用 | 常用值 |
|-----|------|--------|
| `transition-property` | 过渡哪个属性 | `all`, `width`, `background` |
| `transition-duration` | 多长时间完成 | `0.3s`, `500ms` |
| `transition-timing-function` | 变化速度曲线 | `ease`, `linear`, `ease-in` |
| `transition-delay` | 等多久开始 | `0s`, `0.2s` |

### 2.1 transition-property - 过渡什么

```css
/* 过渡所有能过渡的属性 */
transition-property: all;

/* 过渡指定属性 */
transition-property: width;
transition-property: width, height, background-color;

/* 不过渡任何属性 */
transition-property: none;
```

**哪些属性能过渡？**

> **核心原则：属性必须能在两个值之间产生"中间值"**

```
判断方法：能不能"插值"？

100px → 200px      ✅ 可以（150px 是中间值）
red → blue         ✅ 可以（紫色是中间值）
0 → 1              ✅ 可以（0.5 是中间值）
block → none       ❌ 不行（没有中间状态）
```

#### ✅ 完整可过渡属性列表

| 类型 | 属性 |
|-----|------|
| **颜色** | `color`, `background-color`, `border-color`, `text-decoration-color`, `outline-color` |
| **尺寸** | `width`, `height`, `min-width`, `max-width`, `min-height`, `max-height` |
| **间距** | `padding`, `padding-top/right/bottom/left`, `margin`, `margin-top/right/bottom/left` |
| **边框** | `border-width`, `border-color`, `border-radius` |
| **位置** | `left`, `right`, `top`, `bottom` |
| **透明度** | `opacity`, `visibility`* |
| **变换** | `transform` (translate, scale, rotate, skew) |
| **阴影** | `box-shadow`, `text-shadow`, `drop-shadow` |
| **滤镜** | `filter` (blur, brightness, contrast, grayscale, hue-rotate, invert, saturate, sepia) |
| **其他** | `font-size`, `font-weight`, `line-height`, `letter-spacing`, `word-spacing`, `text-indent`, `clip-path`, `object-position`, `background-position`, `background-size`, `z-index` |

#### ❌ 不能过渡的属性

| 属性 | 原因 | 替代方案 |
|-----|------|---------|
| `display` | block ↔ none 无中间状态 | 用 `opacity` + `visibility` |
| `position` | static ↔ absolute 跨越渲染模式 | 用 `transform` 代替 |
| `float` | left ↔ right 无中间值 | 用 `flex` 或 `grid` 布局 |
| `height: auto` | auto 无法计算中间值 | 用 `max-height` |
| `font-family` | 字体名称无法渐变 | 用 `@font-face` 预加载 |

#### ⚠️ 特殊情况说明

**1. visibility 的特殊行为**

```css
/* visibility 可以过渡，但只有最后瞬间才切换 */
.box {
  visibility: visible;
  transition: visibility 0.3s;
}
.box:hover {
  visibility: hidden;  /* 等待 0.3s 后瞬间隐藏 */
}

/* 推荐：配合 opacity 实现平滑过渡 */
.box {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s, visibility 0.3s;
}
.box.fade-out {
  opacity: 0;
  visibility: hidden;  /* opacity 动画完成后隐藏 */
}
```

**2. auto 值的解决方案**

```css
/* ❌ height: auto 无法过渡 */
.accordion-content {
  height: auto;
  transition: height 0.3s;
}

/* ✅ 方案1：用 max-height */
.accordion-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease-out;
}
.accordion-content.open {
  max-height: 1000px;  /* 设置足够大的值 */
}

/* ✅ 方案2：用 grid */
.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.5s;
}
.accordion-content.open {
  grid-template-rows: 1fr;
}
.accordion-inner {
  overflow: hidden;
}
```

**3. z-index 可以过渡**

```css
/* 虽然是整数，但也可以过渡 */
.card {
  z-index: 1;
  transition: z-index 0.3s;
}
.card:hover {
  z-index: 10;  /* 会经过中间的整数值 */
}
```

#### 完整对比示例

```css
/* ========== 全部可以过渡 ========== */
.smooth {
  transition: all 0.3s ease;
}
.smooth:hover {
  width: 200px;                    /* ✅ 100px → 200px */
  height: 100px;                   /* ✅ 50px → 100px */
  background: #3498db;             /* ✅ red → blue */
  color: #ffffff;                  /* ✅ black → white */
  border-radius: 50%;              /* ✅ 0 → 50% */
  opacity: 0.8;                    /* ✅ 1 → 0.8 */
  transform: scale(1.2) rotate(45deg);  /* ✅ 组合变换 */
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);  /* ✅ 阴影 */
  filter: blur(5px);               /* ✅ 滤镜 */
  letter-spacing: 2px;             /* ✅ 间距 */
}

/* ========== 这些无法过渡 ========== */
.no-transition {
  transition: all 0.3s ease;
}
.no-transition:hover {
  display: none;                   /* ❌ 瞬间消失 */
  position: absolute;              /* ❌ 瞬间切换 */
  float: right;                    /* ❌ 瞬间切换 */
  font-family: 'Arial', sans-serif;  /* ❌ 瞬间切换 */
}
```

### 2.2 transition-duration - 多长时间

```css
transition-duration: 0.3s;    /* 0.3秒 */
transition-duration: 500ms;   /* 500毫秒 = 0.5秒 */
```

**时长建议：**

| 场景 | 推荐时长 |
|-----|---------|
| 按钮悬停 | 100-200ms（快速响应） |
| 卡片效果 | 200-400ms（自然流畅） |
| 侧边栏 | 300-500ms（有明显动画感） |

### 2.3 transition-timing-function - 速度曲线

```
ease          ease-in       ease-out      linear
  │            │              │             │
  │╱╲          │╱             ╱╲            │─────
  │ ╲          │ ╲           │  ╲          │
  │  ╲         │  ╲          │   ╲         │
  └────────→  └─────────→  ──────────→  ─────────→
  慢快慢      慢→快        快→慢        匀速
```

| 值 | 效果 | 用途 |
|-----|------|-----|
| `ease` | 慢→快→慢（默认） | 日常使用 |
| `linear` | 匀速 | 进度条 |
| `ease-in` | 慢→快 | 进入屏幕 |
| `ease-out` | 快→慢 | 离开屏幕 |
| `ease-in-out` | 慢→快→慢 | 往返运动 |

```css
transition-timing-function: ease;       /* 默认，最常用 */
transition-timing-function: linear;    /* 匀速 */
transition-timing-function: ease-in;   /* 慢启动 */
transition-timing-function: ease-out;  /* 慢结束 */
```

**高级：贝塞尔曲线（实现特殊效果）**

```css
/* 弹跳效果 */
transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* 平滑减速 */
transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);

/* 轻微回弹 */
transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
```

**常用贝塞尔曲线参考：**

| 效果 | 曲线值 | 适用场景 |
|-----|--------|---------|
| 默认 | `cubic-bezier(0.25, 0.1, 0.25, 1)` | 日常使用 |
| Material | `cubic-bezier(0.4, 0, 0.2, 1)` | Material Design |
| iOS | `cubic-bezier(0.25, 0.1, 0.25, 1)` | iOS 风格 |
| 弹跳 | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | 强调效果 |
| 急刹车 | `cubic-bezier(0.1, 0.7, 1.0, 0.1)` | 特殊效果 |

### 2.4 transition-delay - 延迟开始

```css
transition-delay: 0s;     /* 立即开始 */
transition-delay: 0.2s;   /* 等0.2秒再开始 */
transition-delay: -0.2s;  /* 负值=跳过前0.2秒，直接从中间开始 */
```

---

## 三、实际应用示例

### 示例1：按钮悬停效果

```css
.button {
  background: #3498db;
  transform: scale(1);
  transition: background 0.3s, transform 0.1s;
}

.button:hover {
  background: #2980b9;
  transform: scale(1.05);  /* 放大5% */
}

.button:active {
  transform: scale(0.95);  /* 点击时缩小 */
}
```

**效果：** 悬停放大，点击缩小，背景色平滑过渡

### 示例2：卡片悬停上浮

```css
.card {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transform: translateY(0);
  transition: box-shadow 0.3s, transform 0.3s;
}

.card:hover {
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  transform: translateY(-8px);  /* 向上移动8px */
}
```

**效果：** 悬停时卡片上浮，阴影加深

### 示例3：侧边栏滑入

```css
.sidebar {
  width: 0;
  padding: 0;
  transition: width 0.5s, padding 0.5s;
}

.sidebar.open {
  width: 250px;
  padding: 20px;
}
```

**效果：** 点击按钮时侧边栏平滑展开

### 示例4：依次延迟显示（波浪效果）

```css
.menu-item:nth-child(1) { transition-delay: 0s; }
.menu-item:nth-child(2) { transition-delay: 0.1s; }
.menu-item:nth-child(3) { transition-delay: 0.2s; }
.menu-item:nth-child(4) { transition-delay: 0.3s; }

.menu-item {
  opacity: 0;
  transform: translateX(-20px);
  transition: opacity 0.5s, transform 0.5s;
}

.menu:hover .menu-item {
  opacity: 1;
  transform: translateX(0);
}
```

**效果：** 菜单项依次出现，形成波浪效果

### 示例5：图片悬停放大

```css
.image-card {
  overflow: hidden;  /* 隐藏超出部分 */
}

.image-card img {
  width: 100%;
  transform: scale(1);
  transition: transform 0.5s ease;
}

.image-card:hover img {
  transform: scale(1.1);  /* 放大10% */
}
```

**效果：** 悬停时图片平滑放大，超出部分被裁剪

### 示例6：模态框淡入淡出

```css
.modal {
  opacity: 0;
  visibility: hidden;
  transform: scale(0.9);
  transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
}

.modal.active {
  opacity: 1;
  visibility: visible;
  transform: scale(1);
}
```

**效果：** 模态框从小变大并淡入

### 示例7：输入框焦点动画

```css
.input-wrapper {
  position: relative;
}

.input {
  border: 2px solid #ddd;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  outline: none;
}

/* 浮动标签效果 */
.label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  transition: all 0.3s ease;
  pointer-events: none;
}

.input:focus + .label,
.input:not(:placeholder-shown) + .label {
  top: 0;
  left: 8px;
  font-size: 12px;
  background: white;
  padding: 0 4px;
}
```

**效果：** 聚焦时边框变色发光，标签上浮

### 示例8：下拉菜单

```css
.dropdown {
  position: relative;
}

.dropdown-menu {
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
```

**效果：** 悬停时菜单从上方淡入

### 示例9：加载条动画

```css
.loading-bar {
  width: 0;
  height: 4px;
  background: linear-gradient(90deg, #3498db, #2980b9);
  transition: width 0.5s ease;
}

.loading-bar.loading {
  width: 100%;
}
```

**效果：** 加载时进度条平滑增长

### 示例10：3D 翻转卡片

```css
.flip-card {
  perspective: 1000px;
}

.flip-card-inner {
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateY(180deg);
}
```

**效果：** 悬停时卡片 3D 翻转显示背面

---

## 四、如何触发过渡

### 4.1 伪类触发（最常用）

```css
/* 鼠标悬停 */
.box:hover { width: 200px; }

/* 获取焦点 */
input:focus { border-color: blue; }

/* 点击时 */
.button:active { transform: scale(0.95); }
```

### 4.2 JavaScript 触发

```javascript
// 方法1：直接改样式
box.style.width = '300px';

// 方法2：切换类名（推荐）
box.classList.add('active');
```

```css
.box {
  width: 100px;
  transition: width 0.3s;
}

.box.active {
  width: 300px;
}
```

---

## 五、常见问题

### ❌ 问题1：过渡不生效

```css
/* 错误：没有设置初始值 */
.box {
  transition: opacity 0.3s;
}
.box.hidden {
  opacity: 0;  /* 从什么值变过来？浏览器不知道 */
}

/* 正确：设置明确的初始值 */
.box {
  opacity: 1;  /* 明确的起始值 */
  transition: opacity 0.3s;
}
```

### ❌ 问题2：display 无法过渡

```css
/* 错误：display 不能过渡 */
.box {
  transition: display 0.3s;
  display: block;
}
.box.hidden {
  display: none;  /* 瞬间消失，没有过渡 */
}

/* 正确：用 opacity + visibility */
.box {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s, visibility 0.3s;
}
.box.hidden {
  opacity: 0;
  visibility: hidden;  /* 配合使用，元素不可交互 */
}
```

### ❌ 问题3：过渡卡顿

**原因：** 过渡了会触发重排的属性（如 width、height）

**解决：** 用 transform 代替

```css
/* 不推荐：会卡顿 */
.box {
  transition: width 0.3s, height 0.3s, left 0.3s;
}

/* 推荐：GPU加速，更流畅 */
.box {
  transition: transform 0.3s, opacity 0.3s;
}
.box.large {
  transform: scale(1.5);  /* 代替改变 width/height */
}
```

---

## 六、性能优化技巧

### 优先使用 GPU 加速的属性

```css
/* ✅ 推荐：GPU 加速 */
transition: transform 0.3s, opacity 0.3s, filter 0.3s;

/* ❌ 避免：触发重排重绘 */
transition: width 0.3s, height 0.3s, left 0.3s, top 0.3s;
```

### will-change 提示浏览器

```css
.animated-element {
  will-change: transform;  /* 提前告知浏览器这个元素要动 */
  transition: transform 0.3s;
}
```

> ⚠️ 注意：只在动画元素上用，不要滥用！

---

## 七、过渡 vs 动画

| | Transition | Animation |
|---|-----------|-----------|
| **触发方式** | 需要事件触发 | 自动播放 |
| **复杂度** | 简单（A→B） | 复杂（多阶段）|
| **循环** | 需要 JS | 可无限循环 |
| **适用场景** | 悬停、点击效果 | 加载动画、循环动画 |

```css
/* Transition：状态A到状态B */
.box {
  transition: transform 0.5s;
}
.box:hover {
  transform: rotate(360deg);
}

/* Animation：自动循环 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.box {
  animation: spin 2s linear infinite;  /* 无限循环 */
}
```

---

## 八、快速参考

### 常用写法模板

```css
/* 最常用：过渡所有变化 */
transition: all 0.3s ease;

/* 指定属性过渡 */
transition: background 0.3s, transform 0.3s;

/* 带延迟 */
transition: opacity 0.3s ease 0.2s;

/* 多属性不同参数 */
transition: width 0.3s ease, height 0.5s ease-in;
```

### 时长参考

```css
/* 快速响应：按钮、链接 */
transition: 0.15s;

/* 正常速度：卡片、菜单 */
transition: 0.3s;

/* 较慢动画：侧边栏、模态框 */
transition: 0.5s;
```

### 速度曲线选择

```css
/* 默认，大多数情况 */
transition-timing-function: ease;

/* 进入屏幕 */
transition-timing-function: ease-out;

/* 离开屏幕 */
transition-timing-function: ease-in;

/* 匀速（进度条）*/
transition-timing-function: linear;
```

---

## 九、过渡事件监听

JavaScript 可以监听过渡的开始和结束：

```javascript
const box = document.querySelector('.box');

// 过渡结束时
box.addEventListener('transitionend', function(e) {
  console.log('过渡完成！', e.propertyName);
  // e.propertyName 获取是哪个属性完成了过渡
});

// 过渡取消时
box.addEventListener('transitioncancel', function(e) {
  console.log('过渡被取消');
});

// 过渡开始时（部分浏览器支持）
box.addEventListener('transitionstart', function(e) {
  console.log('过渡开始');
});
```

**实用场景：**

```javascript
// 侧边栏动画完成后执行回调
sidebar.addEventListener('transitionend', function(e) {
  if (e.propertyName === 'width') {
    console.log('侧边栏展开完成');
    // 可以在这里加载侧边栏内容
  }
});
```

---

## 十、调试技巧

### 10.1 可视化过渡属性

```css
/* 调试时加个边框，看看元素实际大小 */
* {
  outline: 1px solid red;
}

/* 查看哪些属性在过渡 */
.box {
  transition: all 5s linear;  /* 放慢速度，仔细观察 */
}
```

### 10.2 Chrome DevTools 调试

1. 打开 DevTools (F12)
2. 切换到 Elements 面板
3. 选中元素，在 Styles 面板找到 transition
4. 勾选属性名旁边的小圆点图标
5. 触发过渡，会自动记录动画曲线

### 10.3 常见问题排查

```css
/* 问题：过渡不动 */
/* 检查：起始值和结束值是否都设置了？*/
.box {
  width: 100px;  /* ✅ 有起始值 */
  transition: width 0.3s;
}
.box:hover {
  width: 200px;  /* ✅ 有结束值 */
}

/* 问题：过渡方向不对 */
/* 检查：transition 写在哪边？*/
/* ✅ 正确：写在基础状态 */
.box {
  transition: width 0.3s;
}
.box:hover {
  width: 200px;
}

/* ❌ 错误：只写在 hover 状态 */
.box:hover {
  width: 200px;
  transition: width 0.3s;  /* 移出时没有过渡 */
}
```

---

## 十一、浏览器兼容性

### 11.1 支持情况

| 浏览器 | 最低版本 |
|--------|---------|
| Chrome | 26+ |
| Firefox | 16+ |
| Safari | 6.1+ |
| Edge | 12+ |
| IE | 10+ |

### 11.2 添加前缀（旧浏览器）

```css
.box {
  -webkit-transition: width 0.3s ease;  /* Safari 6-8 */
  -moz-transition: width 0.3s ease;     /* Firefox 4-15 */
  -o-transition: width 0.3s ease;       /* Opera 10.5-12 */
  transition: width 0.3s ease;
}
```

> 💡 **现代项目通常不需要前缀**，使用 [Autoprefixer](https://github.com/postcss/autoprefixer) 自动处理。

### 11.3 特性检测

```css
/* 检测浏览器是否支持 transition */
@supports (transition: width 0.3s) {
  .box {
    transition: width 0.3s;
  }
}

/* 不支持时的回退 */
@supports not (transition: width 0.3s) {
  .box:hover {
    width: 200px;  /* 直接变化，无过渡 */
  }
}
```

---

## 十二、完整代码示例

### 按钮组件完整代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    .button {
      padding: 12px 24px;
      font-size: 16px;
      color: white;
      background: #3498db;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transform: scale(1);
      box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
      transition:
        background 0.3s ease,
        transform 0.1s ease,
        box-shadow 0.3s ease;
    }

    .button:hover {
      background: #2980b9;
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
    }

    .button:active {
      transform: scale(0.96);
    }
  </style>
</head>
<body>
  <button class="button">点击我</button>
</body>
</html>
```

### 卡片组件完整代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    .card {
      width: 300px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background: white;
      transition:
        transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 0.4s ease;
    }

    .card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    }

    .card img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .card:hover img {
      transform: scale(1.08);
    }

    .card-content {
      padding: 16px;
    }

    .card-title {
      margin: 0 0 8px;
      font-size: 18px;
      transition: color 0.3s ease;
    }

    .card:hover .card-title {
      color: #3498db;
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="https://picsum.photos/300/180" alt="示例图片">
    <div class="card-content">
      <h3 class="card-title">卡片标题</h3>
      <p>这是一段描述文本，悬停卡片查看效果。</p>
    </div>
  </div>
</body>
</html>
```

---

## 十三、实用代码模板

```css
/* ========== 按钮效果 ========== */
.btn {
  transition: background 0.3s, transform 0.1s, box-shadow 0.3s;
}

/* ========== 卡片悬停 ========== */
.card {
  transition: transform 0.3s, box-shadow 0.3s;
}

/* ========== 淡入淡出 ========== */
.fade {
  transition: opacity 0.3s, visibility 0.3s;
}

/* ========== 滑入滑出 ========== */
.slide {
  transition: transform 0.3s ease-out;
}

/* ========== 图片放大 ========== */
.zoom img {
  transition: transform 0.5s ease;
}

/* ========== 边框动画 ========== */
.border-anim {
  transition: border-color 0.3s, box-shadow 0.3s;
}

/* ========== 颜色变化 ========== */
.color-change {
  transition: color 0.3s, background 0.3s;
}

/* ========== 完整通用模板 ========== */
.smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```
