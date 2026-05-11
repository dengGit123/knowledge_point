# Canvas 的坐标系与尺寸详解

## 一、Canvas 的两种尺寸

### 1. 物理尺寸（绘图缓冲区大小）

通过 HTML 属性设置，决定了 Canvas 内部像素网格的分辨率：

```html
<canvas width="800" height="600"></canvas>
```

或通过 JS 设置：

```javascript
canvas.width = 800;
canvas.height = 600;
```

**特点：**
- 决定 Canvas 的像素数量（width × height）
- 决定坐标系的最大范围
- 修改此值会清空 Canvas 内容

### 2. 显示尺寸（CSS 尺寸）

通过 CSS 样式设置，决定 Canvas 在页面中的显示大小：

```css
canvas {
  width: 400px;
  height: 300px;
}
```

```javascript
// 或通过 JS 设置
canvas.style.width = '400px';
canvas.style.height = '300px';
```

**特点：**
- 决定 Canvas 在页面中的视觉大小
- 不影响 Canvas 的像素数量
- 修改此值不会清空 Canvas 内容

---

## 二、坐标系

Canvas 使用**笛卡尔坐标系**，原点在**左上角**：

```
(0,0) ───────────► X轴 (+)
  │
  │
  │
  ▼
Y轴 (+)
```

**坐标规则：**
- X轴向右为正（0 到 width）
- Y轴向下为正（0 到 height）
- 所有坐标值都是相对于 Canvas 左上角
- 默认单位是像素

**坐标示例：**

```javascript
// 在 (100, 50) 位置绘制一个矩形
ctx.fillRect(100, 50, 200, 100);
//            ↑    ↑   ↑    ↑
//            x    y   宽度 高度
```

---

## 三、核心问题：绘制时使用哪种尺寸？

### ⭐ 重要结论

```
┌─────────────────────────────────────────────┐
│  绘制时的坐标和尺寸 → 基于【物理尺寸】        │
│  CSS 尺寸 → 只影响最终显示，不影响绘图        │
└─────────────────────────────────────────────┘
```

### 举例说明

```html
<canvas id="c" width="800" height="600" style="width: 200px; height: 150px;"></canvas>
```

```javascript
const ctx = c.getContext('2d');

// 这些坐标都是相对于物理尺寸 800×600
ctx.fillRect(400, 300, 200, 150);
//            ↑    ↑    ↑    ↑
//         坐标系范围是 0-800 × 0-600
```

### 对照表

| 绘制代码 | 物理占用 | 视觉大小(CSS 200×150时) |
|---------|---------|------------------------|
| `fillRect(0, 0, 800, 600)` | 800×600 物理像素 | 200×150 CSS像素 |
| `fillRect(0, 0, 400, 300)` | 400×300 物理像素 | 100×75 CSS像素 |
| `fillRect(0, 0, 100, 100)` | 100×100 物理像素 | 25×25 CSS像素 |

### 图示

```
物理画布: 800 × 600 (绘图坐标系基于这个)
┌──────────────────────────────────────┐
│████████████████                      │
│████████████████  400×300的矩形        │
│████████████████  (基于物理尺寸)       │
│████████████████                      │
│                                      │
└──────────────────────────────────────┘

CSS显示: 200 × 150 (只管显示，不影响绘图)
┌─────────┐
│████     │  100×75 (浏览器自动缩放)
│████     │
│████     │
│         │
└─────────┘
```

### 记忆要点

```javascript
canvas.width = 800;          // ← 决定绘图坐标系：0-800
canvas.height = 600;         // ← 决定绘图坐标系：0-600

canvas.style.width = '200px';  // ← 只影响显示，不改变坐标系
canvas.style.height = '150px';

// 绘图时永远按物理尺寸 800×600 来写坐标
ctx.fillRect(0, 0, 800, 600);  // ✓ 填满整个物理画布
```

### 使用 scale() 后的情况

```javascript
const dpr = 2;

canvas.width = 800 * dpr;   // 1600
canvas.height = 600 * dpr;  // 1200
canvas.style.width = '800px';
canvas.style.height = '600px';

ctx.scale(dpr, dpr);  // 缩放绘图坐标系

// scale 之后，绘图坐标变成了逻辑尺寸
ctx.fillRect(0, 0, 800, 600);
// 实际绘制到物理坐标 1600×1200 的区域
```

**`ctx.scale()` 的作用：将绘图坐标系缩放，方便用逻辑尺寸绘图。**

### 总结

| 情况 | 绘图坐标基于 |
|------|------------|
| 默认情况 | 物理尺寸（width/height） |
| scale() 之后 | 物理尺寸 ÷ 缩放比例 |
| CSS 尺寸变化 | **不影响绘图坐标** |

---

## 四、尺寸关系与缩放

### 当 物理尺寸 ≠ 显示尺寸 时

浏览器会自动缩放 Canvas 内容以适应显示尺寸：

```html
<!-- 物理尺寸 800×600，显示为 400×300 -->
<canvas width="800" height="600" style="width: 400px; height: 300px;"></canvas>
```

**缩放计算：**

```
X轴缩放比例 = CSS宽度 / 物理宽度 = 400 / 800 = 0.5
Y轴缩放比例 = CSS高度 / 物理高度 = 300 / 600 = 0.5
```

**视觉效果：**
- 浏览器会进行**双线性插值**缩放
- 当放大时可能导致模糊
- 当缩小时可能丢失细节

### 图示说明

```
物理尺寸: 800×600 (可以绘制800×600个像素点)
┌────────────────────────────────────┐
│                                    │ 400px
│         实际800×600像素             │ 显示尺寸
│         压缩显示在这里              │
│                                    │
└────────────────────────────────────┘
            800px
```

---

## 五、关键概念对比

| 概念 | 获取/设置方式 | 说明 |
|------|--------------|------|
| **width/height 属性** | `canvas.width = 800` | 物理像素数量，坐标系范围 |
| **CSS width/height** | `canvas.style.width` | 视觉显示大小 |
| **clientWidth/clientHeight** | `canvas.clientWidth` (只读) | CSS显示尺寸（不含边框） |
| **offsetWidth/offsetHeight** | `canvas.offsetWidth` (只读) | 显示尺寸（含边框） |
| **getBoundingClientRect()** | `canvas.getBoundingClientRect()` | 相对视口的显示区域和位置 |
| **devicePixelRatio** | `window.devicePixelRatio` | 设备像素比（高清屏通常为2或3） |

---

## 六、常见问题与解决方案

### 问题1：Canvas 在高清屏上模糊

**原因：** 物理像素不够，导致浏览器插值放大

**解决方案：** 根据 devicePixelRatio 调整物理尺寸

```javascript
function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  // 设置物理尺寸 = 显示尺寸 × 像素比
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // 缩放绘图上下文，使绘图坐标与显示坐标一致
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  return ctx;
}

// 使用
const canvas = document.querySelector('canvas');
canvas.style.width = '400px';
canvas.style.height = '300px';
const ctx = setupCanvas(canvas);

// 现在可以直接使用显示尺寸的坐标
ctx.fillRect(0, 0, 400, 300);
```

### 问题2：鼠标点击位置不准确

**原因：** 鼠标事件坐标是视口坐标，需要转换为 Canvas 坐标

**解决方案：**

```javascript
canvas.addEventListener('click', (e) => {
  // 获取 Canvas 在视口中的位置和尺寸
  const rect = canvas.getBoundingClientRect();

  // 计算缩放比例
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  // 转换坐标
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  console.log(`Canvas坐标: (${x}, ${y})`);
});
```

### 问题3：动态调整 Canvas 尺寸

**注意：** 修改 `width/height` 属性会清空 Canvas 内容

```javascript
// 保存当前内容
function resizeCanvas(canvas, newWidth, newHeight) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(canvas, 0, 0);

  // 调整尺寸
  canvas.width = newWidth;
  canvas.height = newHeight;

  // 恢复内容
  const ctx = canvas.getContext('2d');
  ctx.drawImage(tempCanvas, 0, 0);
}
```

### 问题4：如何让坐标数据自适应屏幕大小（不出现滚动条）

**场景：** 有一组坐标数据，希望在任何页面大小下都能完整展示。

**推荐方案：** Canvas 物理尺寸 = 容器尺寸，通过坐标变换将数据映射到 Canvas

```javascript
// 1. 计算数据的边界范围
function getDataBounds(points) {
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  return { minX, maxX, minY, maxY };
}

// 2. 设置Canvas物理尺寸为容器尺寸
function setupCanvas(container) {
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;

  // 获取容器尺寸
  const { width, height } = container.getBoundingClientRect();

  // 物理尺寸 = 容器尺寸 × DPR（保证清晰度）
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // CSS尺寸 = 容器尺寸（填充容器）
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  return { canvas, ctx, displayWidth: width, displayHeight: height };
}

// 3. 计算缩放和平移参数，将数据映射到Canvas
function fitDataToCanvas(bounds, canvasWidth, canvasHeight, padding = 40) {
  const dataWidth = bounds.maxX - bounds.minX;
  const dataHeight = bounds.maxY - bounds.minY;

  // 可用绘图区域（减去内边距）
  const availableWidth = canvasWidth - padding * 2;
  const availableHeight = canvasHeight - padding * 2;

  // 计算缩放比例（保持数据比例，居中显示）
  const scaleX = availableWidth / dataWidth;
  const scaleY = availableHeight / dataHeight;
  const scale = Math.min(scaleX, scaleY);

  // 计算偏移量（使数据居中）
  const offsetX = padding + (availableWidth - dataWidth * scale) / 2 - bounds.minX * scale;
  const offsetY = padding + (availableHeight - dataHeight * scale) / 2 - bounds.minY * scale;

  return { scale, offsetX, offsetY };
}

// 4. 完整渲染函数
function renderPoints(container, points) {
  const { canvas, ctx, displayWidth, displayHeight } = setupCanvas(container);
  const bounds = getDataBounds(points);

  // 清空容器，添加Canvas
  container.innerHTML = '';
  container.style.overflow = 'hidden'; // 防止滚动条
  container.appendChild(canvas);

  // 计算缩放参数
  const transform = fitDataToCanvas(bounds, displayWidth, displayHeight);

  // 应用变换并绘制
  ctx.save();
  ctx.translate(transform.offsetX, transform.offsetY);
  ctx.scale(transform.scale, transform.scale);

  // 绘制点
  ctx.fillStyle = '#3b82f6';
  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  return canvas;
}

// 使用示例
const points = [
  { x: 100, y: 200 },
  { x: 1500, y: 800 },
  { x: -100, y: -50 },
  { x: 500, y: 300 }
];

const container = document.getElementById('canvas-container');
renderPoints(container, points);
```

**HTML 结构：**

```html
<style>
  #canvas-container {
    width: 100vw;
    height: 100vh;
    /* 或指定具体尺寸 */
    /* width: 800px; */
    /* height: 600px; */
  }
</style>

<div id="canvas-container"></div>
```

**方案对比：**

| 方案 | 物理尺寸设置 | 优点 | 缺点 |
|------|------------|------|------|
| 用坐标最大值 | `width = maxX, height = maxY` | 简单直接 | 可能过大，CSS缩放导致模糊；内存浪费 |
| 用屏幕尺寸（推荐） | `width = 容器宽度 × DPR` | 始终清晰，内存合理 | 需要计算坐标变换 |
| 固定物理尺寸 | `width = 1920, height = 1080` | 可预测 | 不同屏幕效果不一致 |

**核心思路：**

```
┌─────────────────────────────────────────────┐
│  1. Canvas 物理尺寸 = 容器显示尺寸 × DPR     │
│     → 保证1:1显示，始终清晰                  │
│                                             │
│  2. 计算数据边界（minX, maxX, minY, maxY）  │
│     → 了解数据范围                          │
│                                             │
│  3. 计算缩放比例，将数据映射到Canvas         │
│     → 使用 translate + scale 变换           │
│                                             │
│  4. 按变换后的坐标绘制                       │
│     → 数据自动适应屏幕，不超出边界           │
└─────────────────────────────────────────────┘
```

---

## 七、记忆口诀

1. **物理尺寸（width/height）** = 画布的"分辨率"，决定能画多少像素
2. **显示尺寸（CSS）** = 画布的"大小"，决定用户看到多大
3. **坐标系** = 以左上角为原点，X向右、Y向下
4. **像素比（DPR）** = 高清屏需要物理尺寸 = 显示尺寸 × DPR
5. **修改物理尺寸会清空内容，修改显示尺寸不会**

---

## 八、实用代码模板

### 完整的高清屏 Canvas 设置

```javascript
class HDCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = null;
    this.dpr = window.devicePixelRatio || 1;
    this.setup();
  }

  setup() {
    // 获取CSS设置的显示尺寸
    const rect = this.canvas.getBoundingClientRect();

    // 设置物理尺寸
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;

    // 获取上下文并缩放
    this.ctx = this.canvas.getContext('2d');
    this.ctx.scale(this.dpr, this.dpr);

    // 设置CSS样式保持显示尺寸
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  // 获取相对于Canvas的坐标
  getCanvasCoordinates(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
}

// 使用
const canvas = document.querySelector('canvas');
const hdCanvas = new HDCanvas(canvas);

// 绘图（使用逻辑坐标）
hdCanvas.ctx.fillRect(0, 0, 100, 100);

// 获取点击坐标
canvas.addEventListener('click', (e) => {
  const pos = hdCanvas.getCanvasCoordinates(e);
  console.log(pos.x, pos.y);
});
```
