# CSS BFC 原理

> 官方文档：[MDN - Block formatting context](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Block_formatting_context)

## 什么是 BFC？

**BFC = Block Formatting Context（块级格式化上下文）**

用通俗的话说：**BFC 是一个独立的"渲染区域"，内部元素的布局不受外部影响，外部也不受内部影响。**

```
┌─────────────────────────────────────────────────────┐
│                  普通文档流                          │
│                                                      │
│   ┌─────────────────┐      ┌─────────────────┐     │
│   │    BFC 区域     │      │   另一个 BFC    │     │
│   │  ┌───────────┐  │      │                 │     │
│   │  │ 内部元素  │  │      │   互不干扰       │     │
│   │  │  独立布局 │  │      │                 │     │
│   │  └───────────┘  │      │                 │     │
│   └─────────────────┘      └─────────────────┘     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### 生活化理解

想象 BFC 就像一个**独立房间**：
- 房间内的家具怎么摆，不影响房间外
- 房间外的变化，也不影响房间内
- 每个房间有自己的规则

---

## 一、BFC 的布局规则

进入 BFC 的元素会遵循以下规则：

| 规则 | 说明 |
|-----|------|
| 1. 垂直排列 | 子元素垂直方向，一个接一个排列 |
| 2. 垂直间距 | 相邻元素的 margin 会发生折叠 |
| 3. 左对齐 | 子元素的左边触碰包含块的左边 |
| 4. 浮动计算 | BFC 区域不会与浮动元素重叠 |
| 5. 隔离性 | 内部布局与外部完全隔离 |

---

## 二、如何触发 BFC

满足以下**任意一个条件**就会创建 BFC：

| 方法 | 说明 |
|-----|------|
| `html` 根元素 | 默认就是 BFC |
| `float: left/right` | 浮动元素 |
| `position: absolute/fixed` | 绝对/固定定位 |
| `overflow: hidden/auto/scroll` | 非 visible 的 overflow |
| `display: inline-block` | 行内块元素 |
| `display: table-cell` | 表格单元格 |
| `display: flex/grid` | 弹性/网格容器的子元素 |
| `contain: layout/strict` | contain 属性 |

```css
/* 常用触发方式 */
.bfc {
  overflow: hidden;        /* 最常用 */
  display: inline-block;
  float: left;
  position: absolute;
  display: flow-root;      /* 专门创建 BFC */
}
```

> 💡 **推荐使用 `display: flow-root`**（现代浏览器），副作用最小！

---

## 三、BFC 能解决什么问题？

### 问题1：外边距折叠（Margin Collapse）

#### 现象

相邻块级元素的垂直 margin 会合并成较大的那个值：

```html
<div class="box1">盒子1</div>
<div class="box2">盒子2</div>
```

```css
.box1 {
  margin-bottom: 20px;
  background: red;
}

.box2 {
  margin-top: 30px;
  background: blue;
}

/* 你以为的间距：20px + 30px = 50px */
/* 实际间距：max(20px, 30px) = 30px  😱 */
```

#### 解决方案：将其中一个元素放入 BFC

```html
<div class="box1">盒子1</div>
<div class="bfc-wrapper">
  <div class="box2">盒子2</div>
</div>
```

```css
.bfc-wrapper {
  overflow: hidden;  /* 创建 BFC */
}

/* 现在 margin 不会折叠了！*/
```

---

### 问题2：高度坍塌（Float 导致）

#### 现象

父元素只包含浮动子元素时，高度会坍塌为 0：

```html
<div class="parent">
  <div class="float-child">浮动元素</div>
</div>
```

```css
.parent {
  border: 2px solid red;
  /* 高度为 0，边框合在一起 😱 */
}

.float-child {
  float: left;
  height: 100px;
}
```

```
期望效果：
┌─────────────────────┐
│  ┌───────────────┐  │
│  │  浮动元素      │  │
│  └───────────────┘  │
└─────────────────────┘

实际效果：
┌─────────────────────┐
└─────────────────────┘  ← 高度为0！
  ┌───────────────┐
  │  浮动元素      │  ← 跑到外面去了
  └───────────────┘
```

#### 解决方案：给父元素创建 BFC

```css
.parent {
  overflow: hidden;  /* 创建 BFC */
  border: 2px solid red;
}

/* 现在父元素会包裹浮动元素了！*/
```

**其他解决方案对比：**

```css
/* 方案1：创建 BFC（推荐）*/
.parent {
  overflow: hidden;
}

/* 方案2：浮动父元素 */
.parent {
  float: left;
}

/* 方案3：display: flow-root（最推荐）*/
.parent {
  display: flow-root;  /* 专门为创建 BFC 设计 */
}

/* 方案4：clearfix（老式方法）*/
.parent::after {
  content: "";
  display: table;
  clear: both;
}
```

---

### 问题3：元素被浮动元素覆盖

#### 现象

非浮动元素会与浮动元素重叠：

```html
<div class="float-left">左浮动</div>
<div class="content">普通内容会被覆盖...</div>
```

```css
.float-left {
  float: left;
  width: 100px;
  height: 100px;
}

.content {
  /* 文字环绕浮动元素，背景被覆盖 */
}
```

```
┌──────┐
│浮动  │  普通内容文字会环绕...
│      │  但背景色会跑到浮动元素下面
└──────┘
  普通内容...
```

#### 解决方案：给非浮动元素创建 BFC

```css
.content {
  overflow: hidden;  /* 创建 BFC */
  /* 现在不会与浮动元素重叠了！*/
}
```

---

### 问题4：两栏布局

利用 BFC 不与浮动元素重叠的特性实现自适应两栏：

```html
<div class="layout">
  <div class="sidebar">侧边栏（固定宽度）</div>
  <div class="main">主内容（自适应）</div>
</div>
```

```css
.sidebar {
  float: left;
  width: 200px;
  height: 200px;
  background: lightblue;
}

.main {
  overflow: hidden;  /* 创建 BFC */
  height: 200px;
  background: lightcoral;
  /* 自动占满剩余空间 */
}
```

**效果：**
```
┌─────────┬─────────────────────────┐
│         │                         │
│ 侧边栏  │       主内容区域          │
│ 200px   │      自动适应宽度         │
│         │                         │
└─────────┴─────────────────────────┘
```

---

## 四、BFC 的应用场景总结

| 问题 | 解决方案 | 原理 |
|-----|---------|-----|
| margin 折叠 | 将元素放入 BFC | BFC 内部 margin 与外部隔离 |
| 高度坍塌 | 父元素创建 BFC | BFC 会计算浮动元素高度 |
| 元素被覆盖 | 创建 BFC | BFC 不与浮动元素重叠 |
| 两栏布局 | 右侧创建 BFC | 自动占据剩余空间 |
| 清除浮动 | 父元素创建 BFC | 包含浮动子元素 |

---

## 五、常用 BFC 创建方式对比

| 方式 | 优点 | 缺点 | 推荐度 |
|-----|-----|-----|-------|
| `overflow: hidden` | 简单 | 可能裁剪内容 | ⭐⭐⭐⭐ |
| `display: flow-root` | 无副作用 | 旧浏览器不支持 | ⭐⭐⭐⭐⭐ |
| `float: left` | 兼容性好 | 需要清除浮动 | ⭐⭐ |
| `position: absolute` | 兼容性好 | 脱离文档流 | ⭐⭐ |
| `display: inline-block` | 兼容性好 | 可能有间隙 | ⭐⭐⭐ |

**推荐方案：**

```css
/* 现代浏览器 */
.bfc {
  display: flow-root;
}

/* 需要兼容旧浏览器 */
.bfc {
  overflow: hidden;
}

/* 确定内容不会被裁剪时 */
.bfc {
  overflow: hidden;
}
```

---

## 六、深入理解

### 6.1 IFC（行内格式化上下文）

BFC 的"兄弟"，用于行内元素：

```css
.inline-elements {
  /* 创建 IFC */
  display: inline;
}
```

| 特性 | BFC | IFC |
|-----|-----|-----|
| 元素类型 | 块级 | 行内 |
| 排列方向 | 垂直 | 水平 |
| 宽高 | 可设置 | 由内容决定 |

### 6.2 GFC（网格格式化上下文）

```css
.grid {
  display: grid;  /* 创建 GFC */
}
```

### 6.3 FFC（弹性格式化上下文）

```css
.flex {
  display: flex;  /* 创建 FFC */
}
```

---

## 七、常见面试题

### Q1：什么是 BFC？

**答：** BFC（Block Formatting Context）块级格式化上下文，是一个独立的渲染区域，内部元素的布局不受外部影响。

### Q2：如何触发 BFC？

**答：** float、position、overflow、display 等多种方式，最常用的是 `overflow: hidden` 和 `display: flow-root`。

### Q3：BFC 有什么用？

**答：**
1. 清除浮动
2. 防止 margin 折叠
3. 阻止元素被浮动覆盖
4. 实现自适应两栏布局

### Q4：为什么 overflow: hidden 能清除浮动？

**答：** 因为 `overflow: hidden` 创建了 BFC，BFC 规则规定会计算浮动元素的高度，所以父元素会包裹浮动子元素。

---

## 八、实用代码模板

```css
/* ========== 清除浮动 ========== */
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}

/* 或者使用 BFC */
.clearfix {
  overflow: hidden;
}

/* ========== 现代方式：flow-root ========== */
.bfc {
  display: flow-root;  /* 推荐使用 */
}

/* ========== 防止 margin 折叠 ========== */
.wrapper {
  overflow: hidden;
}

/* ========== 两栏布局 ========== */
.sidebar {
  float: left;
  width: 200px;
}

.main {
  overflow: hidden;  /* 创建 BFC */
}

/* ========== 三栏布局（圣杯）==========/
.left {
  float: left;
  width: 200px;
}

.right {
  float: right;
  width: 200px;
}

.center {
  overflow: hidden;  /* 创建 BFC */
}
```

---

## 九、调试 BFC

### 使用浏览器开发者工具

```
Chrome DevTools → Elements → 选中元素 → 右侧面板
```

查看是否有 "Block Formatting Context" 标记：

```
┌─────────────────────────────┐
│  □ Block Formatting Context │ ← 显示 BFC
└─────────────────────────────┘
```

### 可视化调试

```css
/* 给所有 BFC 加个边框 */
* {
  outline: 1px solid red;
}

/* 查看 BFC 区域 */
.bfc {
  background: rgba(0, 0, 255, 0.1);
}
```

---

## 十、总结

### 核心要点

```
BFC = 独立的渲染区域

         ┌─────────────────┐
         │   外部世界      │
         │  ┌───────────┐  │
         │  │   BFC     │  │
         │  │  互不影响  │  │
         │  └───────────┘  │
         └─────────────────┘
```

| 要点 | 内容 |
|-----|------|
| 定义 | 独立的渲染区域 |
| 规则 | 内部布局与外部隔离 |
| 创建 | float, overflow, position, flow-root 等 |
| 应用 | 清浮动、防折叠、自适应布局 |
| 推荐 | `display: flow-root` |
