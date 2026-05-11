# CSS 各种单位

## 单位分类概览

| 分类 | 单位 |
|------|------|
| **绝对长度** | `px`, `pt`, `pc`, `cm`, `mm`, `in` |
| **相对字体** | `em`, `rem`, `ch`, `ex` |
| **视口相对** | `vw`, `vh`, `vmin`, `vmax` |
| **百分比** | `%` |
| **颜色** | `#hex`, `rgb()`, `hsl()`, `color()`, `oklch()` |
| **角度** | `deg`, `rad`, `grad`, `turn` |
| **时间** | `s`, `ms` |
| **分数** | `fr` (Grid 专用) |

---

## 绝对长度单位

| 单位 | 名称 | 换算 | 使用场景 |
|------|------|------|----------|
| `px` | 像素 | 1/96 inch | 最常用，边框、圆角等 |
| `pt` | 磅 | 1/72 inch ≈ 1.33px | 打印样式 |
| `pc` | 派卡 | 12 pt = 16px | 打印样式 |
| `cm` | 厘米 | - | 打印样式 |
| `mm` | 毫米 | - | 打印样式 |
| `in` | 英寸 | 2.54cm = 96px | 打印样式 |

### px（像素）

```css
/* 参照点：设备像素，受 DPI 影响 */
border: 1px solid #ccc;
border-radius: 4px;
font-size: 14px;
```

**特点**：
- 最常用，兼容性最好
- 不随父元素变化
- 受浏览器缩放影响

**使用场景**：边框、阴影、圆角、小间距

```css
button {
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

---

## 相对字体单位

### em

```css
/* 参照点：父元素的 font-size */
.box {
  font-size: 16px;
  padding: 1em;  /* = 16px */
}

.box .child {
  font-size: 0.5em;  /* = 8px，相对于父元素 */
  padding: 2em;      /* = 16px，相对于自己的 font-size */
}
```

**特点**：
- 会累积/继承，嵌套时可能混乱
- 用于需要随字体缩放的属性（padding、margin、width）

**使用场景**：
- 组件内部间距
- 段落首行缩进

```css
p {
  text-indent: 2em;  /* 首行缩进两个字符 */
}
```

### rem（root em）

```css
/* 参照点：根元素（html）的 font-size */
html {
  font-size: 16px;
}

.box {
  font-size: 1rem;    /* = 16px */
  padding: 1.5rem;    /* = 24px */
  margin: 2rem;       /* = 32px */
}
```

**特点**：
- 始终相对于根元素，不累积
- 通过改变 html 字号可实现整体缩放
- 移动端响应式常用

**使用场景**：
- 全局布局尺寸
- 间距系统
- 移动端适配

```css
/* 响应式字号 */
html {
  font-size: 16px;
}

@media (max-width: 768px) {
  html {
    font-size: 14px;  /* 全局缩小 */
  }
}

.container {
  width: 50rem;  /* 桌面 800px，移动端 700px */
}
```

### ch（字符宽度）

```css
/* 参照点：数字 0 的宽度 */
.box {
  width: 40ch;  /* 约 40 个字符宽 */
}
```

**使用场景**：
- 限制文本宽度提升可读性
- 代码块宽度

```css
article p {
  max-width: 65ch;  /* 最佳阅读宽度 */
  line-height: 1.6;
}
```

### ex（x 高度）

```css
/* 参照点：字体 x-height（小写字母 x 的高度） */
.box {
  margin: 1ex;
}
```

**使用场景**：较少使用，精确排版时

---

## 视口相对单位

| 单位 | 参照点 | 示例（视口 1920×1080）|
|------|--------|---------------------|
| `vw` | 视口宽度 | 1vw = 19.2px |
| `vh` | 视口高度 | 1vh = 10.8px |
| `vmin` | vw 和 vh 中较小值 | 1vmin = 10.8px |
| `vmax` | vw 和 vh 中较大值 | 1vmax = 19.2px |

### vw / vh

```css
/* 全屏元素 */
.hero {
  width: 100vw;
  height: 100vh;
}

/* 响应式字号 */
h1 {
  font-size: 5vw;  /* 视口宽度的 5% */
}
```

**注意事项**：
- 移动端地址栏会影响 vh（iOS 动态变化）
- 大屏幕上字号可能过大

```css
/* 移动端 vh 问题的解决方案 */
.full-height {
  height: 100vh;
  height: 100dvh;  /* 动态视口高度，iOS 16+ */
}

/* 或使用 CSS 变量 */
.full-height {
  height: 100vh;
  height: calc(100vh - env(safe-area-inset-top));
}
```

### vmin / vmax

```css
/* 始终保持在屏幕内 */
.square {
  width: 80vmin;
  height: 80vmin;  /* 正方形，不超过屏幕任一边 */
}
```

**使用场景**：
- 全屏居中元素
- 响应式正方形/圆形
- 背景图案尺寸

---

## 百分比 %

```css
/* 参照点：父元素的同一属性 */
.container {
  width: 800px;
}

.item {
  width: 50%;      /* = 400px，参照父元素宽度 */
  padding: 10%;    /* = 80px，参照父元素宽度 */
  font-size: 50%;  /* 参照父元素字号 */
}
```

**注意**：
- 不同属性参照点不同
- `width/height` 参照父元素内容盒
- `padding/margin`（上下）也参照父元素宽度（不是高度！）

```css
.parent {
  width: 400px;
  height: 300px;
}

.child {
  padding-top: 50%;  /* = 200px，参照宽度，不是高度 */
}
```

**使用场景**：
- 响应式宽度
- 相对定位（left: 50%）
- Flex/Grid 布局

---

## 颜色单位

### Hex（十六进制）

```css
/* #RRGGBB 或 #RGB */
color: #ff0000;        /* 红色 */
color: #f00;           /* 简写 */
color: #ff000080;      /* 带透明度 #RRGGBBAA */
color: #f008;          /* 带透明度简写 */
```

### rgb() / rgba()

```css
color: rgb(255, 0, 0);
color: rgba(255, 0, 0, 0.5);  /* 50% 透明度 */

/* 现代语法 */
color: rgb(255 0 0 / 50%);    /* 斜杠分隔 alpha */
```

### hsl() / hsla()

```css
/* 色相(0-360) 饱和度%(0-100) 亮度%(0-100) */
color: hsl(0, 100%, 50%);     /* 红色 */
color: hsl(120, 100%, 50%);   /* 绿色 */
color: hsl(240, 100%, 50%);   /* 蓝色 */
color: hsla(0, 100%, 50%, 0.5);

/* 现代语法 */
color: hsl(0 100% 50% / 0.5);
```

**优势**：调色更直观，只需调整饱和度/亮度

```css
/* 主题色变体 */
:root {
  --primary: hsl(220, 90%, 50%);
  --primary-dark: hsl(220, 90%, 35%);
  --primary-light: hsl(220, 90%, 75%);
}
```

### color() / oklch()

```css
/* 更广色域 */
color: color(display-p3 0 1 0);  /* P3 色域绿色 */
color: oklch(50% 0.2 220);       /* 感知均匀 */
```

**使用场景**：现代浏览器，广色域显示

### currentColor

```css
/* 继承当前元素的 color 值 */
.box {
  color: #333;
  border: 2px solid currentColor;  /* 边框也是 #333 */
  box-shadow: 0 0 10px currentColor;
}
```

---

## 角度单位

| 单位 | 说明 | 换算 |
|------|------|------|
| `deg` | 度 | 360deg = 一圈 |
| `rad` | 弧度 | 2π rad = 360deg |
| `grad` | 梯度 | 400grad = 360deg |
| `turn` | 圈 | 1turn = 360deg |

```css
/* 旋转 */
.rotate {
  transform: rotate(45deg);      /* 45 度 */
  transform: rotate(0.25turn);   /* 1/4 圈 = 90 度 */
  transform: rotate(1.57rad);    /* π/2 弧度 ≈ 90 度 */
}

/* 渐变角度 */
background: linear-gradient(90deg, red, blue);
background: conic-gradient(from 0deg, red, blue, red);
```

---

## 时间单位

```css
/* 秒 / 毫秒 */
transition: all 0.3s;
animation: slide 1.5s ease-in-out;
transition-delay: 100ms;
```

---

## Grid 专用单位 fr

```css
/* fraction：剩余空间的份数 */
.grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  /* 第一列占 1 份，第二列占 2 份，第三列占 1 份 */
}
```

```css
/* 混合使用 */
.grid {
  grid-template-columns: 200px 1fr 2fr;
  /* 第一列固定 200px，后两列按 1:2 分配剩余空间 */
}

/* minmax */
.grid {
  grid-template-columns: repeat(3, minmax(200px, 1fr));
  /* 每列最小 200px，最大平分剩余空间 */
}
```

---

## 单位选择指南

### 字号

| 场景 | 推荐 | 原因 |
|------|------|------|
| 根字号 | px | 精确控制基准 |
| 组件内部 | rem | 整体缩放 |
| 需随父级变化 | em | 继承父级 |

### 间距

| 场景 | 推荐 |
|------|------|
| 全局间距系统 | rem |
| 组件内间距 | px 或 em |
| 响应式间距 | % 或 vw |

### 宽高

| 场景 | 推荐 |
|------|------|
| 固定尺寸 | px |
| 响应式宽度 | % 或 fr |
| 视口相关 | vw/vh |
| 正方形 | vmin |

### 边框/圆角

```css
/* 始终用 px */
border: 1px solid #ddd;
border-radius: 4px;
```

---

## 实用技巧

### 移动端适配方案

```css
/* 方案 1：rem + 媒体查询 */
html {
  font-size: 16px;
}
@media (max-width: 375px) {
  html {
    font-size: 14px;
  }
}

/* 方案 2：rem + 动态计算 */
html {
  font-size: calc(100vw / 375 * 16);  /* 375 设计稿基准 */
}

/* 方案 3：vw 直接使用 */
.title {
  font-size: clamp(16px, 4vw, 24px);  /* 16px ~ 24px */
}
```

### clamp() 函数

```css
/* clamp(min, val, max) */
font-size: clamp(16px, 4vw, 24px);
width: clamp(300px, 50%, 800px);
```

### 无障碍建议

```css
/* 尊重用户设置 */
html {
  font-size: 100%;  /* 使用浏览器默认大小 */
}

body {
  /* 使用相对单位，支持用户缩放 */
  font-size: 1rem;
  line-height: 1.5;
}
```
