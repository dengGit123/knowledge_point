# CSS 像素与单位

> 官方文档：[MDN - CSS 值与单位](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Values_and_Units)

> 深入学习：[CSS 单位详解](../../css/CSS单位.md)

---

## 一、核心概念

CSS 中的"像素"不一定等于屏幕上的物理像素。理解不同单位的区别，是做好移动端适配的基础。

---

## 二、像素类型

### 2.1 三种像素的关系

| 类型 | 全称 | 说明 |
|------|------|------|
| **CSS 像素（px）** | CSS Pixel | CSS 代码中使用的单位，逻辑像素 |
| **物理像素** | Physical Pixel | 屏幕上最小的显示单元 |
| **设备独立像素** | Device Independent Pixel (DIP) | 操作系统层面的逻辑像素 |

### 2.2 设备像素比（DPR）

```
DPR = 物理像素数 / CSS 像素数
```

| 设备 | 物理像素 | CSS 像素 | DPR |
|------|---------|---------|-----|
| 普通屏幕 | 1920×1080 | 1920×1080 | 1 |
| iPhone 14 | 2532×1170 | 844×390 | 3 |
| MacBook Retina | 2560×1600 | 1280×800 | 2 |

> **1 个 CSS 像素在 DPR=2 的屏幕上由 2×2=4 个物理像素渲染。**

```
DPR = 1:               DPR = 2:
┌─┐                    ┌──┬──┐
│px│                    │px│px│
└─┘                    ├──┼──┤
                        │px│px│
                        └──┴──┘
1个CSS像素 = 1个物理像素  1个CSS像素 = 4个物理像素
```

### 2.3 1px 边框问题

在 DPR=2 的屏幕上，CSS `1px` 实际由 2 个物理像素渲染，视觉上看起来**比实际 1 个物理像素粗**。

**解决方案：**

```css
/* 方案 1：transform 缩放（推荐） */
.border-1px {
  position: relative;
}
.border-1px::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #ccc;
  transform: scaleY(0.5);
  transform-origin: 0 0;
}

/* 方案 2：viewport 缩放 */
<!-- 在 HTML 中动态设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover">
<!-- 配合 JS 设置 scale = 1 / DPR -->
```

---

## 三、所有 CSS 单位对比

### 3.1 绝对单位

| 单位 | 名称 | 说明 |
|------|------|------|
| `px` | 像素 | 最常用，CSS 逻辑像素 |
| `pt` | 点 | 印刷单位，1pt = 1/72 英寸 |
| `cm/mm/in` | 厘米/毫米/英寸 | 印刷用，屏幕上不精确 |

### 3.2 相对单位

| 单位 | 相对于 | 典型用途 |
|------|--------|---------|
| `em` | **父元素**的 font-size | 段落缩进、组件内间距 |
| `rem` | **根元素** `<html>` 的 font-size | 全局尺寸、移动端适配 |
| `vw` | 视口宽度的 1% | 全屏宽度布局 |
| `vh` | 视口高度的 1% | 全屏高度布局 |
| `vmin` | `min(vw, vh)` | 保持方向一致 |
| `vmax` | `max(vw, vh)` | 保持方向一致 |
| `%` | 父元素的对应属性 | 弹性宽度/高度 |
| `ch` | 字符 "0" 的宽度 | 等宽文本限制 |
| `ex` | 字符 "x" 的高度 | 极少使用 |

### 3.3 px vs em vs rem

```css
/* px：固定值，不随任何元素变化 */
.text { font-size: 16px; }

/* em：相对于父元素的 font-size */
.parent { font-size: 16px; }
.child  { font-size: 1.5em; }  /* 16 × 1.5 = 24px */

/* rem：相对于根元素 font-size */
html   { font-size: 16px; }
.child { font-size: 1.5rem; }  /* 16 × 1.5 = 24px，无论嵌套多深 */
```

**em 的嵌套陷阱：**

```css
/* ❌ em 嵌套会逐级放大 */
.level-1 { font-size: 1.2em; } /* 16 × 1.2 = 19.2px */
  .level-2 { font-size: 1.2em; } /* 19.2 × 1.2 = 23.04px */
    .level-3 { font-size: 1.2em; } /* 23.04 × 1.2 = 27.65px */

/* ✅ rem 始终相对根元素，不受嵌套影响 */
.level-1 { font-size: 1.2rem; } /* 16 × 1.2 = 19.2px */
  .level-2 { font-size: 1.2rem; } /* 16 × 1.2 = 19.2px */
    .level-3 { font-size: 1.2rem; } /* 16 × 1.2 = 19.2px */
```

### 3.4 单位选择建议

| 场景 | 推荐单位 | 原因 |
|------|---------|------|
| 边框、固定间距 | `px` | 精确控制 |
| 字体大小 | `rem` | 全局可控，适配方便 |
| 组件内部间距 | `em` | 跟随组件字体缩放 |
| 全屏宽度元素 | `vw` | 直接对应视口 |
| 全屏高度元素 | `vh` | 直接对应视口（注意移动端问题） |
| 响应式字体 | `clamp()` | 设置最小/最大值 |

---

## 四、移动端 100vh 问题

在移动端浏览器中，`100vh` 包含了地址栏的高度，导致内容被遮挡：

```css
/* ❌ 移动端可能超出可视区域 */
.fullscreen {
  height: 100vh;
}

/* ✅ 方案 1：使用 dvh（Dynamic Viewport Height） */
.fullscreen {
  height: 100dvh; /* 动态视口高度，排除地址栏 */
}

/* ✅ 方案 2：JS 设置 CSS 变量 */
/* JS: document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`) */
.fullscreen {
  height: calc(var(--vh, 1vh) * 100);
}

/* ✅ 方案 3：使用 100% 配合 min-height */
html, body { height: 100%; }
.fullscreen {
  min-height: 100%;
}
```

---

## 五、clamp() 响应式字体

```css
/* clamp(最小值, 首选值, 最大值) */
h1 {
  /* 最小 24px，首选 5vw，最大 48px */
  font-size: clamp(24px, 5vw, 48px);
}

/* 响应式间距 */
.container {
  padding: clamp(16px, 4vw, 32px);
}
```

---

## 六、常见面试题

### Q1：px、em、rem 的区别？

**答：**
- `px`：绝对单位（CSS 像素），固定值。
- `em`：相对单位，相对于**父元素**的 `font-size`。嵌套时逐级计算，容易失控。
- `rem`：相对单位，相对于**根元素** `<html>` 的 `font-size`。不受嵌套影响，全局统一。推荐用于字体大小。

### Q2：什么是 DPR？1px 边框问题怎么解决？

**答：** DPR（设备像素比）= 物理像素 / CSS 像素。在 DPR=2 的屏幕上，1 个 CSS 像素对应 2×2 个物理像素，导致 `border: 1px` 视觉上偏粗。解决方案：用 `transform: scaleY(0.5)` 缩放伪元素，或通过 JS 动态设置 viewport 的 scale 为 `1/DPR`。

### Q3：vw/vh 和 % 的区别？

**答：** `vw/vh` 相对于**视口**的宽/高，`%` 相对于**父元素**的对应属性。`vw/vh` 不受父元素限制，适合全屏布局；`%` 依赖父元素，适合局部弹性布局。

### Q4：为什么推荐用 rem 做移动端适配？

**答：** rem 相对于根元素 `font-size`，只需通过 JS 根据屏幕宽度动态设置 `html` 的 `font-size`，所有使用 rem 的元素就会等比缩放。一套代码适配所有屏幕尺寸。

---

## 七、注意事项

1. **`rem` 的基准值**：浏览器默认 `html` 的 `font-size` 为 `16px`，即 `1rem = 16px`
2. **`vw` 兼容性**：现代浏览器均支持，IE11 不支持
3. **`dvh` 兼容性**：Safari 15.4+、Chrome 108+，较新的标准
4. **`%` 的参照不固定**：`width: 50%` 参照父元素宽度，`padding-top: 50%` 也参照父元素**宽度**（不是高度）
