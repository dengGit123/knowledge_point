# CSS 方法和变量

## 目录

- [CSS 变量](#css-变量)
- [数学函数](#数学函数)
- [颜色函数](#颜色函数)
- [变换函数](#变换函数)
- [滤镜函数](#滤镜函数)
- [渐变函数](#渐变函数)
- [形状函数](#形状函数)
- [其他函数](#其他函数)

---

## CSS 变量

### 定义和使用

```css
/* 定义 */
:root {
  --primary-color: #3b82f6;
  --spacing-unit: 8px;
  --font-size-base: 16px;
}

/* 使用 */
.button {
  color: var(--primary-color);
  padding: var(--spacing-unit);
  font-size: var(--font-size-base);
}
```

### 默认值

```css
/* 变量不存在时使用默认值 */
color: var(--unknown-color, #333);
padding: var(--spacing, 10px);

/* 嵌套默认值 */
color: var(--color, var(--fallback-color, #000));
```

### 作用域

```css
/* 全局变量 */
:root {
  --global-color: blue;
}

/* 局部变量 */
.card {
  --card-bg: #fff;
  background: var(--card-bg);
}

/* 子元素继承 */
.card .title {
  /* 可以访问 --global-color 和 --card-bg */
  color: var(--global-color);
}
```

### JavaScript 操作

```javascript
// 获取变量
getComputedStyle(element).getPropertyValue('--primary-color');

// 设置变量
element.style.setProperty('--primary-color', '#ff0000');

// 删除变量
element.style.removeProperty('--primary-color');
```

### 注意事项

| 问题 | 说明 |
|------|------|
| 循环依赖 | `--a: var(--b); --b: var(--a);` 会导致无效 |
| 属性名无效 | `--0color` 数字开头无效，`--color-0` 有效 |
| 大小写敏感 | `--color` 和 `--Color` 是不同变量 |
| 无法在 @import 中使用 | `@import url(var(--url))` 无效 |

### 优缺点

| 优点 | 缺点 |
|------|------|
| 动态修改，实时生效 | IE11 及以下不支持 |
| 减少重复代码 | 需要考虑降级方案 |
| 作用域控制 | 计算属性相对复杂 |
| JS 交互方便 | 性能略低于硬编码 |

---

## 数学函数

### calc()

```css
/* 语法: calc(表达式) */
width: calc(100% - 20px);
height: calc(50vh + 100px);
margin: calc(1rem + 10px);

/* 混合单位 */
width: calc(100% - 2em);
font-size: calc(16px + 1vw);

/* 复杂运算 */
width: calc((100% - 40px) / 3);
```

**参数**：支持 `+`, `-`, `*`, `/` 和括号

**注意事项**：
- `+` 和 `-` 前后必须有空格
- `*` 右边必须是数字
- `/` 右边必须是数字（非 0）

```css
/* ❌ 错误 */
width: calc(100%-20px);

/* ✅ 正确 */
width: calc(100% - 20px);
```

### min() / max()

```css
/* 取最小值 */
width: min(800px, 90%);
/* 相当于: 如果 90% < 800px，使用 90%，否则 800px */

/* 取最大值 */
font-size: max(16px, 1vw);
/* 相当于: 如果 1vw > 16px，使用 1vw，否则 16px */
```

**使用场景**：

```css
/* 响应式容器 */
.container {
  width: min(90%, 1200px);
  margin: 0 auto;
}

/* 最小字号保护 */
body {
  font-size: max(14px, 1rem);
}

/* 间距控制 */
.gap {
  gap: max(20px, 2vw);
}
```

### clamp()

```css
/* 语法: clamp(最小值, 推荐值, 最大值) */
font-size: clamp(16px, 4vw, 24px);
width: clamp(300px, 50%, 800px);
```

**逻辑**：
- 推荐值 < 最小值 → 使用最小值
- 最小值 ≤ 推荐值 ≤ 最大值 → 使用推荐值
- 推荐值 > 最大值 → 使用最大值

```css
/* 实用示例 */
.title {
  /* 最小 1.5rem，推荐 5vw，最大 3rem */
  font-size: clamp(1.5rem, 5vw, 3rem);
}

.card {
  /* 最小 280px，推荐 50%，最大 400px */
  width: clamp(280px, 50%, 400px);
}
```

### round() / mod() / rem()

```css
/* 四舍五入到最接近的倍数 */
width: round(var(--width), 50px);  /* 50 的倍数 */

/* 取余 */
margin-left: mod(250px, 50px);  /* = 0 */

/* 除法取整 */
columns: rem(100, 3);  /* = 33 */
```

**兼容性**：较新函数，注意浏览器支持

---

## 颜色函数

### rgb() / rgba()

```css
/* 传统语法 */
color: rgb(255, 0, 0);
color: rgba(255, 0, 0, 0.5);

/* 现代语法（无逗号） */
color: rgb(255 0 0);
color: rgb(255 0 0 / 0.5);
color: rgb(255 0 0 / 50%);

/* 百分比 */
color: rgb(100% 0% 0%);
```

### hsl() / hsla()

```css
/* 色相(0-360) 饱和度%(0-100) 亮度%(0-100) / 透明度 */
color: hsl(220, 90%, 50%);
color: hsl(220 90% 50% / 0.8);

/* 主题色变体 */
:root {
  --primary: 220 90% 50%;  /* 不含 hsl()，方便计算 */
}
.button {
  color: hsl(var(--primary));
  color: hsl(from var(--primary) h s 80%);  /* 变亮 */
}
```

### color() / oklch() / lab()

```css
/* 广色域支持 */
color: color(display-p3 0 1 0);
color: color(srgb 1 0 0);

/* 感知均匀的颜色空间 */
color: oklch(50% 0.2 220);
color: lab(50% 40 20);

/* 颜色插值 */
background: color-mix(in srgb, blue, white 50%);
```

### relative-color 语法

```css
/* 基于现有颜色创建新颜色 */
:root {
  --base: #3b82f6;
}

/* 变亮 20% */
.lighter {
  color: hsl(from var(--base) h s calc(l + 20%));
}

/* 反色 */
.inverted {
  color: rgb(from var(--base) calc(255 - r) calc(255 - g) calc(255 - b));
}

/* 降低透明度 */
.faded {
  color: rgb(from var(--base) r g b / 0.5);
}
```

---

## 变换函数

### translate()

```css
/* 位移 */
transform: translate(100px);           /* X 轴 */
transform: translate(100px, 50px);     /* X, Y */
transform: translateX(100px);
transform: translateY(50px);
transform: translateZ(100px);          /* 3D */
transform: translate3d(100px, 50px, 0);

/* 百分比相对于自身 */
transform: translate(50%, 50%);  /* 向右下移动自身尺寸的一半 */
```

### rotate()

```css
/* 旋转 */
transform: rotate(45deg);           /* 顺时针 45 度 */
transform: rotate(-90deg);          /* 逆时针 90 度 */
transform: rotateX(45deg);
transform: rotateY(45deg);
transform: rotate3d(1, 1, 1, 45deg);

/* 单位 */
transform: rotate(1rad);            /* 弧度 */
transform: rotate(0.25turn);        /* 圈 */
```

### scale()

```css
/* 缩放 */
transform: scale(1.5);              /* 整体放大 1.5 倍 */
transform: scale(1.5, 0.8);         /* X=1.5, Y=0.8 */
transform: scaleX(1.5);
transform: scaleY(0.8);
transform: scaleZ(2);
transform: scale3d(1.5, 0.8, 1);

/* 负值 = 翻转 */
transform: scale(-1, 1);            /* 水平翻转 */
```

### skew()

```css
/* 倾斜 */
transform: skew(10deg);             /* X 轴倾斜 10 度 */
transform: skew(10deg, 5deg);       /* X=10, Y=5 */
transform: skewX(10deg);
transform: skewY(5deg);
```

### 组合变换

```css
/* 注意顺序！从右向左执行 */
transform: translate(100px) rotate(45deg);
/* 先旋转 45 度，再向右移动 100px */

/* 单个 transform 多个函数 */
transform: translate(100px, 50px) rotate(45deg) scale(1.2);
```

**注意事项**：
- 顺序不同，结果不同
- 建议按：位移 → 旋转 → 缩放

---

## 滤镜函数

### blur()

```css
/* 高斯模糊 */
filter: blur(5px);
filter: blur(0.5em);

backdrop-filter: blur(10px);  /* 背景模糊 */
```

### brightness() / contrast()

```css
/* 亮度：100% 原样，<100% 变暗，>100% 变亮 */
filter: brightness(150%);
filter: brightness(0.5);

/* 对比度：100% 原样 */
filter: contrast(200%);
filter: contrast(0.5);

/* 组合 */
filter: brightness(1.2) contrast(1.1);
```

### grayscale() / sepia()

```css
/* 灰度：0% 原样，100% 完全灰度 */
filter: grayscale(100%);
filter: grayscale(50%);

/* 复古：0% 原样，100% 完全褐色 */
filter: sepia(100%);
```

### saturate() / hue-rotate()

```css
/* 饱和度：100% 原样，>100% 更饱和 */
filter: saturate(200%);
filter: saturate(0);  /* 完全去色 */

/* 色相旋转 */
filter: hue-rotate(90deg);
filter: hue-rotate(180deg);  /* 反色 */
```

### invert() / opacity()

```css
/* 反转：100% 完全反转 */
filter: invert(100%);

/* 透明度 */
filter: opacity(50%);  /* 类似 opacity: 0.5 */
```

### drop-shadow()

```css
/* 与 box-shadow 不同，会贴合元素形状 */
filter: drop-shadow(5px 5px 10px rgba(0,0,0,0.5));

/* 多重阴影 */
filter: drop-shadow(2px 2px 0 #fff)
        drop-shadow(4px 4px 0 #000);

/* 适用于不规则形状/透明图片 */
.avatar {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}
```

**drop-shadow vs box-shadow**

| 特性 | drop-shadow | box-shadow |
|------|-------------|------------|
| 形状 | 贴合元素轮廓 | 矩形 |
| 透明图 | ✅ 可见 | ❌ 矩形阴影 |
| 语法 | 不支持 spread | 支持 spread |

---

## 渐变函数

### linear-gradient()

```css
/* 语法: 方向/角度, 颜色1, 颜色2, ... */
background: linear-gradient(to right, red, blue);
background: linear-gradient(90deg, red, blue);
background: linear-gradient(to bottom right, red, blue);

/* 多色 */
background: linear-gradient(90deg, red, yellow, green, blue);

/* 指定位置 */
background: linear-gradient(90deg, red 0%, blue 50%, red 100%);

/* 硬边缘 */
background: linear-gradient(90deg, red 50%, blue 50%);
background: linear-gradient(90deg, red 50%, blue 50% 75%, green 75%);
```

### radial-gradient()

```css
/* 语法: 形状 大小 at 位置, 颜色... */
background: radial-gradient(circle, red, blue);
background: radial-gradient(circle at center, red, blue);
background: radial-gradient(circle at top left, red, blue);

/* 椭圆 */
background: radial-gradient(ellipse, red, blue);
background: radial-gradient(ellipse 100px 50px at center, red, blue);

/* 大小关键字 */
background: radial-gradient(circle closest-side, red, blue);
background: radial-gradient(circle closest-corner, red, blue);
background: radial-gradient(circle farthest-side, red, blue);
background: radial-gradient(circle farthest-corner, red, blue);
```

### conic-gradient()

```css
/* 锥形渐变 */
background: conic-gradient(from 0deg, red, blue, red);
background: conic-gradient(from 90deg at 50% 50%, red, blue);

/* 饼图 */
background: conic-gradient(
  red 0% 25%,
  blue 25% 50%,
  green 50% 75%,
  yellow 75% 100%
);
```

### repeating-linear-gradient()

```css
/* 重复线性渐变 */
background: repeating-linear-gradient(
  45deg,
  transparent,
  transparent 10px,
  #ccc 10px,
  #ccc 20px
);

/* 条纹效果 */
background: repeating-linear-gradient(
  90deg,
  #333,
  #333 10px,
  #fff 10px,
  #fff 20px
);
```

---

## 形状函数

### clip-path 形状

```css
/* 圆形 */
clip-path: circle(50% at 50% 50%);
clip-path: circle(100px at center);

/* 椭圆 */
clip-path: ellipse(50% 30% at 50% 50%);

/* 多边形 */
clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); /* 矩形 */

/* 插入矩形 */
clip-path: inset(10px 20px 30px 40px);
clip-path: inset(10px round 5px);  /* 圆角 */
```

### shape-outside（文字环绕）

```css
/* 圆形环绕 */
.shape {
  float: left;
  shape-outside: circle(50%);
  width: 200px;
  height: 200px;
}

/* 多边形环绕 */
.shape {
  shape-outside: polygon(0 0, 100% 0, 50% 100%);
}

/* 图片轮廓 */
.shape {
  shape-outside: url(image.png);
}
```

---

## 其他函数

### attr() - 获取 HTML 属性

```css
/* 获取属性值作为内容 */
a::after {
  content: " (" attr(href) ")";
}

/* data 属性 */
[data-tooltip]::after {
  content: attr(data-tooltip);
}

/* 注意：主要用于 content，其他属性支持有限 */
```

### counter() / counters()

```css
/* 定义计数器 */
body {
  counter-reset: chapter;
}

h2 {
  counter-increment: chapter;
}

h2::before {
  content: "Chapter " counter(chapter) ": ";
}

/* 嵌套计数 */
ol {
  counter-reset: section;
  list-style-type: none;
}

li::before {
  counter-increment: section;
  content: counters(section, ".") " ";
}

/* 自定义样式 */
h2::before {
  content: counter(chapter, upper-roman);
}
```

### url()

```css
/* 引入资源 */
background: url(image.png);
background: url('image.png');
background: url("image.png");

/* data URI */
background: url(data:image/png;base64,...);

/* SVG */
background: url('data:image/svg+xml;utf8,<svg...</svg>');
```

### image() / image-set()

```css
/* image 函数 */
background: image('image.png', 'image-fallback.png');

/* 响应式图片 */
background-image: image-set(
  'image-1x.png' 1x,
  'image-2x.png' 2x,
  'image-3x.png' 3x
);

/* 类型支持 */
background-image: image-set(
  url('image.avif') type('image/avif'),
  url('image.webp') type('image/webp'),
  url('image.jpg') type('image/jpeg')
);
```

### element()（实验性）

```css
/* 将元素作为图像（仅 Firefox） */
background: element(#myElement);
```

---

## 函数选择器

### :is() / :where()

```css
/* 分组选择器 */
:is(h1, h2, h3).title {
  color: blue;
}

/* :where 权重为 0 */
:where(h1, h2, h3).title {
  color: blue;  /* 权重 = 0.0.1（只有 class） */
}
```

### :not()

```css
/* 否定选择器 */
a:not(.external) {
  color: blue;
}

input:not([type="checkbox"]):not([type="radio"]) {
  border: 1px solid #ccc;
}
```

### :has()

```css
/* 父级选择器 */
figure:has(img) {
  border: 1px solid #ccc;
}

/* 包含特定元素的父元素 */
div:has(.danger) {
  background: #fee;
}

/* 多个条件 */
a:has(> img) {
  display: block;
}
```

---

## 兼容性参考

| 函数 | 兼容性 | 备注 |
|------|--------|------|
| var() | IE11+ | 需降级 |
| calc() | IE9+ | 广泛支持 |
| min/max/clamp | 较新 | 需 fallback |
| color-mix | 最新 | 实验性 |
| :has() | 较新 | Safari 15.4+ |
| drop-shadow | 现代浏览器 | IE 不支持 |

**降级示例**：

```css
.box {
  /* 降级 */
  width: 90%;
  max-width: 1200px;

  /* 现代浏览器 */
  width: min(90%, 1200px);
}

@supports (width: min(90%, 1200px)) {
  .box {
    width: min(90%, 1200px);
  }
}
```
