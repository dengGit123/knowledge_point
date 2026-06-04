# Grid 布局（网格布局）

> 官方文档：[MDN - CSS Grid](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_grid_layout)

> 深入学习：[Grid 布局详解](../../css/grid布局.md)

---

## 一、核心概念

CSS Grid 是一种**二维布局系统**，可以同时控制**行和列**，适合复杂的页面整体布局。

> 通俗类比：Flex 是"串糖葫芦"（一维），Grid 是"摆棋盘"（二维）。

```
         列1     列2     列3
       ┌──────┬──────┬──────┐
  行1  │  A   │  B   │  C   │
       ├──────┼──────┼──────┤
  行2  │  D   │  E   │  F   │
       ├──────┼──────┼──────┤
  行3  │  G   │  H   │  I   │
       └──────┴──────┴──────┘
```

### 基本术语

| 术语 | 说明 |
|------|------|
| **容器（container）** | 设置 `display: grid` 的元素 |
| **项目（item）** | 容器的直接子元素 |
| **行（row）** | 水平方向 |
| **列（column）** | 垂直方向 |
| **网格线（grid line）** | 行列的分界线，从 1 开始编号 |
| **单元格（cell）** | 行列交叉形成的区域 |
| **轨道（track）** | 两条相邻网格线之间的空间（一行或一列） |
| **间距（gap）** | 行列之间的间隔 |

---

## 二、容器属性

### 2.1 display — 启用 Grid

```css
.container {
  display: grid;        /* 块级网格 */
  display: inline-grid; /* 行内网格 */
}
```

### 2.2 grid-template-columns / rows — 定义行列

```css
.container {
  /* 固定宽度 */
  grid-template-columns: 200px 200px 200px;

  /* 使用 repeat 简写 */
  grid-template-columns: repeat(3, 200px);

  /* fr 单位（fraction，比例分配） */
  grid-template-columns: 1fr 2fr 1fr; /* 1:2:1 比例 */

  /* 混合使用 */
  grid-template-columns: 200px 1fr 2fr;

  /* auto-fill 自动填充列 */
  grid-template-columns: repeat(auto-fill, 200px);

  /* auto-fit 自适应（推荐） */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

  /* 行定义 */
  grid-template-rows: 100px auto 100px;
}
```

### 2.3 fr 单位

`fr`（fraction）表示可用空间的一份，类似 Flex 的 `flex-grow`：

```css
/* 容器宽 600px */
grid-template-columns: 1fr 2fr 1fr;
/* 列1: 150px, 列2: 300px, 列3: 150px */

/* 与固定值混合 */
grid-template-columns: 200px 1fr 2fr;
/* 列1: 200px, 列2: 133px, 列3: 267px */
```

### 2.4 minmax() 函数

```css
.container {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  /* 每列最小 200px，最大 1fr */
  /* 自动根据容器宽度决定列数 */
}
```

### 2.5 gap — 间距

```css
.container {
  gap: 20px;             /* 行列间距都是 20px */
  row-gap: 10px;         /* 行间距 */
  column-gap: 20px;      /* 列间距 */
}
```

### 2.6 grid-template-areas — 命名区域

```css
.container {
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 60px 1fr 60px;
  grid-template-areas:
    "header header  header"
    "sidebar content aside"
    "footer footer  footer";
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

```
┌──────────────────────────────────────────┐
│                 header                    │
├──────────┬─────────────────┬─────────────┤
│          │                 │             │
│ sidebar  │     content     │    aside    │
│          │                 │             │
├──────────┴─────────────────┴─────────────┤
│                 footer                    │
└──────────────────────────────────────────┘
```

### 2.7 对齐属性

```css
.container {
  /* 所有项目在单元格内的对齐 */
  justify-items: start | end | center | stretch; /* 水平 */
  align-items: start | end | center | stretch;   /* 垂直 */
  place-items: center; /* align-items + justify-items */

  /* 整个网格在容器内的对齐 */
  justify-content: start | end | center | space-between | space-around | space-evenly;
  align-content: start | end | center | space-between | space-around | space-evenly;
}
```

---

## 三、项目属性

### 3.1 基于网格线的定位

```css
.item {
  /* 起止网格线编号 */
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 3;

  /* 简写 */
  grid-column: 1 / 3;  /* 从第1条线到第3条线 */
  grid-row: 1 / 3;

  /* span 关键字 */
  grid-column: 1 / span 2; /* 从第1条线开始，跨越2列 */
  grid-column: span 2;     /* 跨越2列（自动放置） */
}
```

### 3.2 grid-area — 区域定位

```css
.item {
  /* 使用命名区域 */
  grid-area: header;

  /* 使用网格线编号：row-start / column-start / row-end / column-end */
  grid-area: 1 / 1 / 3 / 4;
}
```

---

## 四、常用 Grid 布局模式

### 4.1 响应式卡片网格（无媒体查询）

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
```

> 自动根据容器宽度调整列数，无需 `@media` 断点！

### 4.2 经典页面布局

```css
.page {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "header header"
    "sidebar content"
    "footer footer";
  min-height: 100vh;
}
```

### 4.3 瀑布流（近似）

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 10px;
  gap: 16px;
}

.masonry .item:nth-child(1) { grid-row: span 15; }
.masonry .item:nth-child(2) { grid-row: span 20; }
.masonry .item:nth-child(3) { grid-row: span 12; }
```

### 4.4 仪表盘布局

```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto;
  gap: 16px;
}

.widget-wide { grid-column: span 2; }
.widget-tall { grid-row: span 2; }
.widget-big  { grid-column: span 2; grid-row: span 2; }
```

---

## 五、常见面试题

### Q1：Grid 和 Flexbox 的区别？怎么选？

**答：**
- Flexbox 是**一维**布局（一次处理一行或一列），Grid 是**二维**布局（同时控制行和列）。
- Flex 适合组件内部（导航栏、按钮组、卡片内容），Grid 适合页面整体（header/sidebar/content/footer）。
- 实际开发中常**混合使用**：Grid 管大框架，Flex 管组件内部。

### Q2：`fr` 单位和 `%` 的区别？

**答：** `fr` 分配的是**剩余空间**（扣除固定尺寸和 gap 之后），`%` 是基于整个容器宽度计算。`fr` 会自动考虑 gap，`%` 不会。在 Grid 中推荐使用 `fr`。

### Q3：`auto-fill` 和 `auto-fit` 的区别？

**答：**
- `auto-fill`：创建尽可能多的列轨道，**即使有些是空的**（保留空列）
- `auto-fit`：创建列后，**将空列折叠为 0 宽度**，让有内容的列拉伸填满

```
auto-fill（容器宽 600px，每列 200px）：
[■■■] [■■■] [____]  ← 3列，第3列为空但占空间

auto-fit（相同条件）：
[■■■■■■] [■■■■■■]    ← 空列折叠，2列拉伸填满
```

### Q4：如何实现不使用媒体查询的响应式网格？

**答：** 使用 `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`。`minmax(280px, 1fr)` 保证每列最小 280px，`auto-fit` 自动根据容器宽度决定列数，容器缩小时列数自动减少。

---

## 六、注意事项

1. **`grid-template-areas` 命名规则**：必须为矩形区域，不能出现 L 形或不规则形状
2. **网格线从 1 开始**：不是 0，第一条线编号为 1，最后一条线编号为 N+1
3. **`repeat(auto-fit, 1fr)` 无效**：必须搭配 `minmax()` 使用，如 `minmax(0, 1fr)`
4. **子元素 `float` 无效**：Grid 子项的 `float`、`clear`、`vertical-align` 均无效
