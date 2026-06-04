# Flex 布局（弹性盒子）

> 官方文档：[MDN - Flexbox](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_flexible_box_layout)

> 深入学习：[Flex 布局详解](../../css/flex布局.md)

---

## 一、核心概念

Flexbox（弹性盒子布局）是一种**一维布局模型**，擅长在**行或列**方向上分配空间和对齐元素。

> 通俗类比：Flex 就像一根弹性绳上的珠子——你可以控制珠子的排列方向、间距、对齐方式，绳子会自动分配空间。

### 基本术语

```
                    主轴（main axis）→
         ┌─────────────────────────────────────┐
         │  ┌───────┐ ┌───────┐ ┌───────┐     │ ↓ 交叉轴（cross axis）
         │  │ item1 │ │ item2 │ │ item3 │     │
         │  └───────┘ └───────┘ └───────┘     │
         │  ← main start    main start →      │
         └─────────────────────────────────────┘
```

| 术语 | 说明 |
|------|------|
| **容器（container）** | 设置 `display: flex` 的元素 |
| **项目（item）** | 容器的直接子元素 |
| **主轴（main axis）** | 项目排列的方向（默认水平从左到右） |
| **交叉轴（cross axis）** | 与主轴垂直的方向 |

---

## 二、容器属性（设置在父元素上）

### 2.1 display — 启用 Flex

```css
.container {
  display: flex;        /* 块级 Flex 容器 */
  display: inline-flex; /* 行内 Flex 容器 */
}
```

### 2.2 flex-direction — 主轴方向

```css
.container {
  flex-direction: row;            /* → 水平（默认） */
  flex-direction: row-reverse;    /* ← 水平反向 */
  flex-direction: column;         /* ↓ 垂直 */
  flex-direction: column-reverse; /* ↑ 垂直反向 */
}
```

```
row:              row-reverse:       column:       column-reverse:
[1] [2] [3]       [3] [2] [1]       [1]           [3]
                                     [2]           [2]
                                     [3]           [1]
```

### 2.3 flex-wrap — 是否换行

```css
.container {
  flex-wrap: nowrap;   /* 不换行（默认），项目缩小 */
  flex-wrap: wrap;     /* 换行 */
  flex-wrap: wrap-reverse; /* 反向换行 */
}
```

### 2.4 justify-content — 主轴对齐

```css
.container {
  justify-content: flex-start;   /* 起点对齐（默认） */
  justify-content: flex-end;     /* 终点对齐 */
  justify-content: center;       /* 居中 */
  justify-content: space-between;/* 两端对齐，中间等距 */
  justify-content: space-around; /* 每项两侧等距 */
  justify-content: space-evenly; /* 完全均匀分布 */
}
```

```
flex-start:    [■■■] [■■■] [■■■]
flex-end:                      [■■■] [■■■] [■■■]
center:              [■■■] [■■■] [■■■]
space-between: [■■■]           [■■■]           [■■■]
space-around:    [■■■]      [■■■]      [■■■]
space-evenly:   [■■■]   [■■■]   [■■■]
```

### 2.5 align-items — 交叉轴对齐（单行）

```css
.container {
  align-items: stretch;    /* 拉伸填满（默认） */
  align-items: flex-start; /* 顶部对齐 */
  align-items: flex-end;   /* 底部对齐 */
  align-items: center;     /* 垂直居中 */
  align-items: baseline;   /* 文字基线对齐 */
}
```

### 2.6 align-content — 交叉轴对齐（多行）

> 仅在 `flex-wrap: wrap` 且有多行时有效。

```css
.container {
  align-content: flex-start;
  align-content: flex-end;
  align-content: center;
  align-content: space-between;
  align-content: space-around;
  align-content: stretch; /* 默认 */
}
```

### 2.7 gap — 间距

```css
.container {
  gap: 10px;            /* 行间距和列间距都是 10px */
  row-gap: 10px;        /* 行间距 */
  column-gap: 20px;     /* 列间距 */
}
```

---

## 三、项目属性（设置在子元素上）

### 3.1 order — 排列顺序

```css
.item {
  order: 0;  /* 默认，值越小越靠前 */
  order: -1; /* 排到最前面 */
  order: 1;  /* 排到后面 */
}
```

### 3.2 flex-grow — 放大比例

```css
/* 剩余空间按比例分配 */
.item-a { flex-grow: 1; } /* 占 1 份 */
.item-b { flex-grow: 2; } /* 占 2 份 */
.item-c { flex-grow: 1; } /* 占 1 份 */
/* 剩余空间按 1:2:1 分配 */
```

```
容器宽度 400px，三个子项各 80px，剩余空间 = 400 - 240 = 160px

flex-grow: 1 / 2 / 1
item-a: 80 + 160×(1/4) = 120px
item-b: 80 + 160×(2/4) = 160px
item-c: 80 + 160×(1/4) = 120px
```

### 3.3 flex-shrink — 缩小比例

```css
/* 空间不足时按比例缩小 */
.item-a { flex-shrink: 1; } /* 缩小 1 份（默认） */
.item-b { flex-shrink: 2; } /* 缩小 2 份 */
.item-c { flex-shrink: 0; } /* 不缩小 */
```

**缩小计算公式**：

```
总溢出 = 子项总宽度 - 容器宽度
缩小权重 = 各项 (flex-shrink × item-width) 之和
每项缩小量 = 总溢出 × (该 item 的 flex-shrink × width) / 缩小权重
```

### 3.4 flex-basis — 初始大小

```css
.item {
  flex-basis: auto;   /* 默认，由 width 或内容决定 */
  flex-basis: 200px;  /* 固定初始大小 200px */
  flex-basis: 30%;    /* 占容器的 30% */
  flex-basis: 0;      /* 忽略内容大小，完全按 grow 分配 */
}
```

### 3.5 flex 简写（重要！）

```css
/* flex: flex-grow flex-shrink flex-basis */
.item { flex: 0 1 auto; }    /* 默认值 */

/* 常见写法 */
.item { flex: 1; }           /* 等同 flex: 1 1 0%  → 均分剩余空间 */
.item { flex: auto; }        /* 等同 flex: 1 1 auto → 根据内容分配 */
.item { flex: none; }        /* 等同 flex: 0 0 auto → 不放大不缩小 */
.item { flex: 0 0 100px; }   /* 固定 100px，不放大不缩小 */
```

| 简写 | 展开 | 效果 |
|------|------|------|
| `flex: 1` | `1 1 0%` | 均分所有空间（忽略内容大小） |
| `flex: auto` | `1 1 auto` | 按内容比例分配空间 |
| `flex: none` | `0 0 auto` | 固定大小，不参与伸缩 |
| `flex: 0 0 100px` | — | 固定 100px |

### 3.6 align-self — 单个项目交叉轴对齐

```css
.item {
  align-self: auto;       /* 继承 align-items */
  align-self: flex-start; /* 顶部对齐 */
  align-self: flex-end;   /* 底部对齐 */
  align-self: center;     /* 居中 */
  align-self: stretch;    /* 拉伸 */
}
```

---

## 四、常用 Flex 布局模式

### 4.1 水平垂直居中

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### 4.2 导航栏（左右分布）

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

```html
<nav class="navbar">
  <div class="logo">Logo</div>
  <div class="links">Link1 Link2 Link3</div>
</nav>
```

### 4.3 等高卡片

```css
.card-list {
  display: flex;
  gap: 20px;
  align-items: stretch; /* 默认值，所有卡片等高 */
}
```

### 4.4 圣杯布局

```css
.layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.header, .footer {
  flex: none; /* 固定高度 */
}

.main {
  flex: 1;   /* 占据剩余空间 */
  display: flex;
}

.sidebar {
  flex: 0 0 200px;
}

.content {
  flex: 1;
}
```

### 4.5 底部固定（Sticky Footer）

```css
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1; /* 内容区域占据剩余空间，footer 自然在底部 */
}
```

---

## 五、常见面试题

### Q1：`flex: 1` 和 `flex: auto` 的区别？

**答：** `flex: 1` 展开为 `1 1 0%`，`flex-basis` 为 0，意味着忽略内容大小，完全按 `flex-grow` 比例均分空间。`flex: auto` 展开为 `1 1 auto`，`flex-basis` 为 `auto`，会先保留内容本身的大小，剩余空间再按比例分配。**简单说：`flex: 1` 是绝对均分，`flex: auto` 是按内容比例分配。**

### Q2：flex-shrink 的计算方式？

**答：** 当空间不足时，每项的缩小量 = `总溢出量 × (该项 flex-shrink × width) / Σ(所有项 flex-shrink × width)`。注意是按 **flex-shrink × width 的加权比例**缩小，不是简单的 flex-shrink 比例。

### Q3：Flex 和 Grid 怎么选？

**答：** Flex 是**一维布局**（一行或一列），适合导航栏、工具栏、卡片列表等。Grid 是**二维布局**（行和列同时控制），适合整体页面布局、仪表盘、图片画廊等。实际开发中经常**混合使用**——Grid 管大布局，Flex 管小组件内部。

### Q4：Flex 布局中 `gap` 和 `margin` 的区别？

**答：** `gap` 只作用于项目之间，不会在容器边缘产生间距。`margin` 会作用于每个元素的指定方向，可能在边缘也产生间距。`gap` 更语义化，且不需要用 `:last-child` 去除最后一个元素的多余间距。

### Q5：`flex-basis` 和 `width` 的优先级？

**答：** 在 Flex 布局中，`flex-basis` 优先级**高于** `width`。如果同时设置了两者，`flex-basis` 生效。但 `flex-basis: auto` 时会回退到 `width`。注意 `min-width` 和 `max-width` 始终会约束 `flex-basis`。

---

## 六、注意事项

1. **Flex 容器的子元素**：`float`、`clear`、`vertical-align` 在 Flex 子项上无效
2. **最小宽度陷阱**：Flex 子项默认 `min-width: auto`，内容不会缩小到小于内容宽度。设置 `min-width: 0` 可解决
3. **文本溢出**：Flex 子项中长文本不换行时，需设置 `min-width: 0` 或 `overflow: hidden`
4. **`gap` 兼容性**：现代浏览器均支持，旧版 Safari（< 14.1）需要 `-webkit-gap`
