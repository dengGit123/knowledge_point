# CSS Grid 网格布局

> 官方文档：[MDN - CSS Grid Layout](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout)

Grid 网格布局是 CSS3 中引入的一种**二维布局系统**，它允许我们通过定义行和列来创建复杂的页面布局。与 Flexbox 的一维布局不同，Grid 可以同时处理行和列。

## 基本概念

```
容器 (Container)
┌─────────────────────────────────────┐
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │  1  │ │  2  │ │  3  │ │  4  │  │  ← 网格项 (Item)
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │  5  │ │  6  │ │  7  │ │  8  │  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
└─────────────────────────────────────┘
   ↑       ↑       ↑       ↑       ↑
  列线    列线    列线    列线    列线
```

### Grid 核心概念

```
┌─────────────────────────────────────────────────────┐
│                    网格容器                          │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐        │  │
│  │  │网格项1 │  │网格项2 │  │网格项3 │        │  │
│  │  │(Item)  │  │(Item)  │  │(Item)  │        │  │
│  │  └────────┘  └────────┘  └────────┘        │  │
│  │                                             │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐        │  │
│  │  │网格项4 │  │网格项5 │  │        │        │  │
│  │  └────────┘  └────────┘  │ 空 Cell │        │  │
│  │                              └────────┘        │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 核心术语表

| 术语 | 英文 | 说明 |
|-----|------|-----|
| **网格容器** | Grid Container | 父元素，`display: grid` 的元素 |
| **网格项** | Grid Item | 容器的直接子元素 |
| **网格线** | Grid Line | 划分网格的横线和竖线 |
| **网格轨道** | Grid Track | 两条相邻网格线之间的空间（行/列）|
| **网格单元格** | Grid Cell | 最小网格单位，一行一列交叉形成 |
| **网格区域** | Grid Area | 任意数量的矩形单元格组成的区域 |

---

### 单元格 vs 网格项（重要！）

> **单元格 = 网格的"小房间"**
> **网格项 = 住进去的"住户"**

#### 单元格 (Grid Cell)

**单元格 = 网格的最小单位，由列线和行线交叉形成的方格**

```
列1    列2    列3    列4
 ↓      ↓      ↓      ↓
┌──────┬──────┬──────┬──────┐ 行1
│Cell1 │Cell2 │Cell3 │Cell4 │
├──────┼──────┼──────┼──────┤ 行2
│Cell5 │Cell6 │Cell7 │Cell8 │
├──────┼──────┼──────┼──────┤ 行3
│Cell9 │Cell10│Cell11│Cell12│
└──────┴──────┴──────┴──────┘

↑ 每个小方格就是一个单元格
```

| 特点 | 说明 |
|-----|------|
| **被动存在** | 定义网格后自动产生 |
| **不可见** | 只是逻辑上的划分 |
| **最小单位** | 不能再分割 |
| **可能是空的** | 不一定有内容 |

```css
.container {
  grid-template-columns: 100px 100px 100px;  /* 3列 */
  grid-template-rows: 100px 100px;           /* 2行 */
}
/* 自动产生 3×2 = 6 个单元格 */
```

#### 网格项 (Grid Item)

**网格项 = 网格容器的直接子元素**

```html
<div class="container">  ← 网格容器
  <div class="item1">网格项1</div>  ← 网格项
  <div class="item2">网格项2</div>  ← 网格项
  <div class="item3">网格项3</div>  ← 网格项
</div>
```

| 特点 | 说明 |
|-----|------|
| **主动存在** | 需要开发者创建 HTML 元素 |
| **可见内容** | 实际的内容元素 |
| **可占多个单元格** | 一个网格项可以跨越多个单元格 |
| **必须是直接子元素** | 孙元素不是网格项 |

#### 关系对比

```
┌─────────────────────────────────────────────┐
│              Grid 容器                        │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │Cell1│ │Cell2│ │Cell3│ │Cell4│          │
│  │ ┌───┤ │     │ │     │ │     │          │
│  │ │Item│ │     │ │     │ │     │          │
│  │ └───┘ │     │ │     │ │     │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│                                                  │
│  Cell = 虚线框（逻辑划分）                     │
│  Item = 实际内容（可以跨越多个Cell）            │
└─────────────────────────────────────────────┘
```

| | 单元格 (Cell) | 网格项 (Item) |
|---|-------------|--------------|
| **定义方式** | CSS 定义网格产生 | HTML 写元素 |
| **是否可见** | 逻辑概念，不可见 | 实际内容，可见 |
| **数量关系** | 固定（列×行） | 可以少于或多于单元格数 |
| **占用关系** | 被占用 | 可以占1个或多个 |

#### 实际例子对比

**1. 一对一（项目数 = 单元格数）**

```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;  /* 2列 */
  grid-template-rows: 50px 50px;    /* 2行 */
}
```

```
┌──────────┬──────────┐
│  项目1   │  项目2   │
├──────────┼──────────┤
│  项目3   │  项目4   │
└──────────┴──────────┘
```

**2. 一个项目占多个单元格**

```css
.large {
  grid-column: 1 / 3;  /* 跨越2列 */
  grid-row: 1 / 2;     /* 占1行 */
}
```

```
┌──────────────────────┬──────────┐
│       大项目         │ 小项目1  │ ← 大项目占2个单元格
├──────────────────────┼──────────┤
│       小项目2        │    空    │
└──────────────────────┴──────────┘
```

**3. 项目少于单元格（空单元格）**

```css
.container {
  grid-template-columns: repeat(3, 1fr);  /* 3列 */
  grid-template-rows: repeat(2, 100px);    /* 2行 */
}
/* 6个单元格，只有2个项目 */
```

```
┌──────────┬──────────┬──────────┐
│  项目1   │    空    │    空    │
├──────────┼──────────┼──────────┤
│  项目2   │    空    │    空    │
└──────────┴──────────┴──────────┘
```

#### 记忆口诀

```
单元格 = 房间
  - 盖好房子就固定了
  - 可以是空的
  
网格项 = 家具
  - 需要搬进来
  - 可以占多个房间
  - 可以比房间多（自动加房间）
```

---

## 一、容器属性

> 应用于网格容器（父元素）

### 1.1 display - 创建网格容器

```css
.container {
  display: grid;       /* 块级网格容器 */
  display: inline-grid; /* 行内网格容器 */
}
```

### 1.2 grid-template-columns / grid-template-rows - 定义行列尺寸

定义列的宽度/行的行高及其数量。

| 单位/函数 | 说明 |
|-----------|------|
| `fr` | 分数单位，表示剩余空间的分配比例 |
| `repeat()` | 重复定义列或行的尺寸 |
| `auto-fill` | 自动填充尽可能多的列/行（可能留空） |
| `auto-fit` | 自动适应并扩展列/行填充空间 |
| `minmax()` | 定义尺寸的最小值和最大值 |

```css
.container {
  /* 固定尺寸 */
  grid-template-columns: 100px 200px 300px;
  grid-template-rows: 50px 100px;

  /* fr 单位 (分数单位) */
  grid-template-columns: 1fr 2fr 1fr; /* 中间列是两侧的两倍宽 */

  /* repeat() 函数 - 重复模式 */
  grid-template-columns: repeat(3, 100px);           /* 3个100px的列 */
  grid-template-columns: repeat(2, 1fr 2fr);         /* (1fr 2fr 1fr 2fr) */
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); /* 响应式 */

  /* 为网格线命名 */
  grid-template-columns: [first] 100px [second] 200px [third] 100px [end];

  /* minmax() 函数 */
  grid-template-columns: 1fr minmax(200px, 1fr) 1fr;
}
```

**auto-fill vs auto-fit 的区别：**

```css
/* auto-fill - 创建空轨道但不扩展项目 */
grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));

/* auto-fit - 创建轨道并扩展项目填充空位 */
grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
```

### 1.3 grid-template-areas - 区域布局 🎨

通过区域名称定义网格布局，更直观地描述页面结构。这是 Grid 布局中最具表现力的特性之一。

#### 语法规则

```css
.container {
  grid-template-areas:
    "区域1 区域2 区域3"
    "区域4 区域5 区域6"
    "区域7 区域8 区域9";
}
```

**规则说明：**

| 规则 | 说明 |
|-----|------|
| 每行字符串 | 代表网格的一行 |
| 区域名称(单元格) | 自定义标识符，用引号包围 |
| 空格分隔 | 同行区域之间用空格分隔 |
| 点号 `.` | 表示空单元格（可以多个连续） |
| 必须矩形 | 每个区域必须形成矩形，不能是 L 形 |

#### 基础示例

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "header header  header"
    "nav    main     aside"
    "footer footer  footer";
}

.header  { grid-area: header; }
.nav     { grid-area: nav; }
.main    { grid-area: main; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

**可视化效果：**
```
┌─────────────────────────────────┐
│           header                │  ← 跨越3列
├──────┬──────────────┬───────────┤
│ nav  │    main      │   aside   │
├──────┴──────────────┴───────────┤
│           footer                │  ← 跨越3列
└─────────────────────────────────┘
```

#### 空单元格的使用

使用一个或多个 `.` 表示空白区域：

```css
grid-template-areas:
  "header header  header"
  "nav    .       aside"    /* 中间留空 */
  "footer footer  footer";

/* 或者用多个点号表示空白单元格 */
grid-template-areas:
  "header  .      .      aside"
  "content content .      aside"
  "footer  footer footer footer";
```

#### 响应式布局示例

通过媒体查询重新定义区域，实现布局切换：

```css
/* 桌面端 - 三栏布局 */
.container {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
}

/* 平板端 - 两栏布局 */
@media (max-width: 768px) {
  .container {
    grid-template-areas:
      "header header"
      "nav    main"
      "aside  aside"
      "footer footer";
    grid-template-columns: 200px 1fr;
  }
}

/* 移动端 - 单栏布局 */
@media (max-width: 480px) {
  .container {
    grid-template-areas:
      "header"
      "nav"
      "main"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

#### 常见布局模式

**1. Holy Grail 布局（圣杯布局）**
```css
.holy-grail {
  display: grid;
  grid-template: auto 1fr auto / auto 1fr auto;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  min-height: 100vh;
}
```

**2. 仪表盘布局**
```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 80px 1fr 1fr 60px;
  grid-template-areas:
    "sidebar header  header  header"
    "sidebar stats   stats   chart1"
    "sidebar list    list    chart2"
    "sidebar footer  footer  footer";
}
```

**3. 卡片重叠效果**
```css
.card-layout {
  display: grid;
  grid-template-areas:
    "overlap overlap"
    "overlap normal";
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.overlap { grid-area: overlap; }
.normal { grid-area: normal; }
```

#### 高级技巧

**区域流动方向：**
```css
/* 从右到左的布局（RTL支持）*/
.rtl-layout {
  direction: rtl;
  grid-template-areas:
    "aside main nav"
    "footer footer header";
}
```

**隐式命名网格线：**
```css
grid-template-areas:
  "header header header";

/* 自动创建命名网格线：header-start / header-end */
.item {
  grid-column: header-start / header-end;
}
```

#### 注意事项

⚠️ **区域必须连续成矩形**

```css
/* ❌ 错误：L 形区域 */
grid-template-areas:
  "a a b"
  "a c b";

/* ✅ 正确：矩形区域 */
grid-template-areas:
  "a a b"
  "a a b";
```

⚠️ **每行单元格数必须相同**

```css
/* ❌ 错误：行不匹配 */
grid-template-areas:
  "header header header"
  "nav main";  /* 只有2个 */

/* ✅ 正确：用点号补齐 */
grid-template-areas:
  "header header header"
  "nav    main   .";
```

💡 **最佳实践**

1. 使用语义化的区域名称（如 `header`、`main`、`footer`）
2. 保持区域名称简洁且有意义
3. 配合注释标注布局意图
4. 在响应式设计中优先考虑区域重排

### 1.4 grid-template - 简写属性

同时定义 columns、rows 和 areas：

```css
.container {
  grid-template:
    "header header  header" 60px
    "nav    main     aside" 1fr
    "footer footer  footer" 40px
    / 200px 1fr 200px;
}
```

### 1.5 row-gap / column-gap / gap - 网格间距

定义网格项之间的间隙。

```css
.container {
  /* 简写 */
  gap: 10px;              /* 行间距和列间距都是10px */
  gap: 15px 10px;         /* 行间距15px，列间距10px */

  /* 分别设置 */
  row-gap: 15px;          /* 行间距 */
  column-gap: 10px;       /* 列间距 */
}
```

### 1.6 justify-items / align-items - 项目对齐

控制**所有网格项**在其单元格内的对齐方式。

```css
.container {
  /* 列方向对齐 */
  justify-items: start | end | center | stretch;

  /* 行方向对齐 */
  align-items: start | end | center | stretch;

  /* 简写 */
  place-items: <align-items> <justify-items>;
}
```

| 值 | 说明 |
|----|------|
| `start` | 起点/顶部对齐 |
| `end` | 终点/底部对齐 |
| `center` | 居中对齐 |
| `stretch` | 拉伸填充（默认值） |

### 1.7 justify-content / align-content - 网格对齐

当网格总大小**小于容器**时，控制整个网格在容器内的对齐。

```css
.container {
  justify-content: start | end | center | stretch | space-around | space-between | space-evenly;
  align-content: start | end | center | stretch | space-around | space-between | space-evenly;

  /* 简写 */
  place-content: <align-content> <justify-content>;
}
```

### 1.8 grid-auto-columns / grid-auto-rows - 隐式网格尺寸

定义隐式创建的网格轨道（超出显式定义的部分）的尺寸。

```css
.container {
  grid-template-columns: 1fr 1fr;  /* 只定义了2列 */
  /* 当项目位置超出时，自动创建的列宽100px */
  grid-auto-columns: 100px;

  /* 自动创建的行最小100px，最大auto */
  grid-auto-rows: minmax(100px, auto);
}
```

### 1.9 grid-auto-flow - 项目放置顺序

控制自动布局算法如何排列项目。

```css
.container {
  grid-auto-flow: row;         /* 按行填充（默认） */
  grid-auto-flow: column;      /* 按列填充 */
  grid-auto-flow: row dense;   /* 稠密填充，尝试填补空隙 */
  grid-auto-flow: column dense;
}
```

---

## 二、项目属性

> 应用于网格项（子元素）

### 2.1 grid-column / grid-row - 定位项目

定义项目所在的列和行范围。

```css
.item {
  /* 使用网格线编号 */
  grid-column: 1 / 3;      /* 从第1列线到第3列线 */
  grid-row: 2 / 4;         /* 从第2行线到第4行线 */

  /* 使用 span 关键字 */
  grid-column: 1 / span 2; /* 从第1列线开始，跨越2列 */
  grid-row: span 3;        /* 跨越3行 */

  /* 使用命名的网格线 */
  grid-column: first / third;

  /* 单独属性 */
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: span 2;
}
```

### 2.2 grid-area - 区域定位

通过区域名称或网格线定位项目。

```css
/* 方式一：使用 grid-template-areas 定义的区域名 */
.container {
  grid-template-areas:
    "header header  header"
    "nav    main     aside"
    "footer footer  footer";
}
.item {
  grid-area: main; /* 定位到名为'main'的区域 */
}

/* 方式二：直接指定网格线范围 */
.item {
  grid-area: 1 / 1 / 3 / 3; /* row-start / col-start / row-end / col-end */
}
```

### 2.3 justify-self / align-self - 单项对齐

控制**单个网格项**在其单元格内的对齐方式，覆盖容器级别的对齐设置。

```css
.item {
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;

  /* 简写 */
  place-self: <align-self> <justify-self>;
}
```

---

## 三、Grid 堆叠效果

Grid 允许多个项目占据相同的网格区域，实现堆叠效果。

### 3.1 基本原理

**核心：多个项目使用相同的 `grid-area` 或 `grid-column/row`**

```
┌─────────────────────────────────┐
│   Grid 容器 (3x3 网格)          │
│                                 │
│  ┌─────────────────────────┐    │
│  │    元素 A (下层)         │    │
│  │  ┌─────────────────┐    │    │
│  │  │   元素 B (上层)   │    │    │
│  │  └─────────────────┘    │    │
│  └─────────────────────────┘    │
│                                 │
│  两个元素都占据同一网格区域       │
└─────────────────────────────────┘
```

### 3.2 实现方法

#### 方法1：grid-area 重叠（推荐）

```css
.container {
  display: grid;
  grid-template-areas:
    "header header header"
    "main   main   main";
}

/* 两个元素占据同一区域 */
.content {
  grid-area: main;
  background: #f0f0f0;
  z-index: 1;
}

.overlay {
  grid-area: main;  /* 相同区域 = 重叠 */
  background: rgba(0, 0, 0, 0.5);
  z-index: 2;       /* 控制层级 */
}
```

#### 方法2：grid-column / grid-row 重叠

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 200px 200px;
}

.box1 {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  background: lightblue;
  z-index: 1;
}

.box2 {
  grid-column: 1 / 3;  /* 相同位置 */
  grid-row: 1 / 2;
  background: rgba(255, 0, 0, 0.5);
  z-index: 2;
}
```

#### 方法3：grid-auto-flow: dense 密集填充

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-flow: dense;  /* 自动填补空隙 */
}

.item1 {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}

.item2 {
  grid-column: 1 / 2;
  grid-row: 1 / 2;  /* 与 item1 部分重叠 */
  z-index: 2;
}
```

### 3.3 控制堆叠层级

使用 `z-index` 控制显示顺序：

```css
.stack-item {
  grid-area: overlay;
}

.stack-item:nth-child(1) { z-index: 1; }  /* 最底层 */
.stack-item:nth-child(2) { z-index: 2; }
.stack-item:nth-child(3) { z-index: 3; }  /* 最顶层 */
```

### 3.4 实用示例

#### 示例1：卡片堆叠效果

```css
.card-stack {
  display: grid;
  grid-template-columns: 300px;
  grid-template-rows: 400px;
  justify-content: center;
  align-content: center;
  min-height: 100vh;
  background: #f5f5f5;
}

.card {
  grid-area: 1 / 1 / 2 / 2;  /* 都占据同一位置 */
  width: 300px;
  height: 400px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

/* 卡片1：最底层，蓝色 */
.card:nth-child(1) {
  background: linear-gradient(135deg, #3498db, #2980b9);
  transform: rotate(-5deg) translate(-20px, 10px);
  z-index: 1;
}

/* 卡片2：中间，红色 */
.card:nth-child(2) {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  transform: rotate(2deg) translate(0, -5px);
  z-index: 2;
}

/* 卡片3：最顶层，绿色 */
.card:nth-child(3) {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  transform: rotate(-2deg) translate(20px, -20px);
  z-index: 3;
}

/* 悬停时展开 */
.card-stack:hover .card:nth-child(1) {
  transform: rotate(-15deg) translate(-80px, 20px);
}

.card-stack:hover .card:nth-child(2) {
  transform: rotate(5deg) translate(0, -20px);
}

.card-stack:hover .card:nth-child(3) {
  transform: rotate(-5deg) translate(80px, -40px);
}
```

```html
<div class="card-stack">
  <div class="card"></div>
  <div class="card"></div>
  <div class="card"></div>
</div>
```

#### 示例2：图片 + 遮罩层

```css
.banner {
  display: grid;
  grid-template-rows: 300px;
  grid-template-columns: 1fr;
}

.banner-bg {
  grid-area: 1 / 1 / 2 / 2;
  background: url('banner.jpg') center / cover;
}

.banner-overlay {
  grid-area: 1 / 1 / 2 / 2;  /* 重叠 */
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 30px;
  color: white;
  z-index: 1;
}
```

```html
<div class="banner">
  <div class="banner-bg"></div>
  <div class="banner-overlay">
    <h1>标题</h1>
    <p>描述文字</p>
  </div>
</div>
```

#### 示例3：装饰性背景元素

```css
.card {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 200px;
  position: relative;
}

.card-content {
  grid-area: 1 / 1 / 2 / 2;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 2;
}

/* 装饰圆圈 */
.card-decoration {
  grid-area: 1 / 1 / 2 / 2;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3498db, #e74c3c);
  border-radius: 50%;
  justify-self: end;  /* 靠右 */
  align-self: start; /* 靠上 */
  margin: -20px -20px 0 0;
  opacity: 0.3;
  z-index: 1;
}
```

#### 示例4：悬停显示遮罩

```css
.gallery-item {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 250px;
}

.gallery-image {
  grid-area: 1 / 1 / 2 / 2;
  background: url('image.jpg') center / cover;
  border-radius: 8px;
}

.gallery-overlay {
  grid-area: 1 / 1 / 2 / 2;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}
```

#### 示例5：文字叠加效果

```css
.text-overlay {
  display: grid;
  grid-template-rows: 200px;
  grid-template-columns: 1fr;
}

.text-bg {
  grid-area: 1 / 1 / 2 / 2;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.text-content {
  grid-area: 1 / 1 / 2 / 2;
  display: grid;
  place-items: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  z-index: 1;
}
```

### 3.5 堆叠效果快速模板

```css
/* ========== 基础堆叠 ========== */
.container {
  display: grid;
  grid-template-areas: "stack";
}

.bottom {
  grid-area: stack;
  z-index: 1;
}

.top {
  grid-area: stack;
  z-index: 2;
}

/* ========== 多层堆叠 ========== */
.stack {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.layer {
  grid-area: 1 / 1 / 2 / 2;
}

.layer:nth-child(1) { z-index: 1; }
.layer:nth-child(2) { z-index: 2; }
.layer:nth-child(3) { z-index: 3; }

/* ========== 图片 + 遮罩 ========== */
.banner {
  display: grid;
  grid-template-rows: 300px;
  grid-template-columns: 1fr;
}

.bg {
  grid-area: 1 / 1 / 2 / 2;
  background: url('bg.jpg') center / cover;
}

.overlay {
  grid-area: 1 / 1 / 2 / 2;
  /* 遮罩样式 */
  z-index: 1;
}
```

---

## 四、实用示例

### 4.1 经圣三栏布局

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "header header  header"
    "nav    main     aside"
    "footer footer  footer";
  min-height: 100vh;
}
```

### 4.2 响应式卡片网格

```css
.card-grid {
  display: grid;
  /* 自动适应，最小250px，最大平分剩余空间 */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
```

### 4.3 交错布局

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: 200px;
  gap: 10px;
}

.gallery-item:nth-child(3n+1) {
  grid-row: span 2; /* 每3个第1个跨两行 */
}

.gallery-item:nth-child(5n) {
  grid-column: span 2; /* 每5个跨两列 */
}
```

### 4.4 居中布局

```css
.center {
  display: grid;
  place-items: center;
  min-height: 100vh;
}
```

### 4.5 瀑布流效果

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 10px;
  gap: 10px;
}

.masonry-item {
  /* 通过 span 控制每个项的高度 */
  grid-row: span 20;
}
```

---

## 五、Grid vs Flexbox

| 特性 | Grid | Flexbox |
|-----|------|---------|
| 维度 | 二维（行+列） | 一维（行或列） |
| 适用场景 | 整体页面布局 | 组件内部布局 |
| 对齐 | 双向对齐 | 单向对齐 |
| 重叠 | 支持 `grid-area` 重叠 | 需要负 margin |

> 💡 **建议**：Grid 用于宏观布局，Flexbox 用于微观布局

---

## 六、浏览器兼容性

Grid 布局在现代浏览器中得到广泛支持：

- Chrome 57+
- Firefox 52+
- Safari 10.1+
- Edge 16+

如需支持更早版本，可使用 `@supports` 检测：

```css
@supports (display: grid) {
  .container {
    display: grid;
  }
}
```
