# BFC（块级格式化上下文）

> 官方文档：[MDN - 块格式化上下文](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_display/Block_formatting_context)

> 深入学习：[BFC 原理详解](../../css/BFC原理.md)

---

## 一、核心概念

BFC（Block Formatting Context，块级格式化上下文）是 CSS 中一个**独立的渲染区域**，内部元素的布局不会影响外部元素。

> 通俗类比：BFC 就像一个**独立的房间**——房间里怎么摆放物品（布局）不会影响其他房间，外面的东西也不会随意进来。

```
┌─ 普通文档流 ─────────────────────────────┐
│                                           │
│  ┌─ BFC 区域（独立房间）──────────────┐   │
│  │                                    │   │
│  │  内部布局不影响外部                 │   │
│  │  外部浮动不会进入                   │   │
│  │                                    │   │
│  └────────────────────────────────────┘   │
│                                           │
└───────────────────────────────────────────┘
```

---

## 二、BFC 的布局规则

| 规则 | 说明 |
|------|------|
| 内部块级盒子垂直排列 | 从上到下依次排列 |
| 内部块级盒子垂直 margin 会合并 | 同一 BFC 内相邻块的 margin 合并 |
| BFC 区域不会与浮动元素重叠 | 可以用来清除浮动环绕 |
| BFC 可以包含浮动元素 | 可以解决高度塌陷 |
| 每个元素的左外边缘触碰到容器的左边缘 | 即使有浮动也是如此（除非元素也创建了新 BFC） |

---

## 三、触发 BFC 的条件

只要满足以下**任意一个**条件，就会创建新的 BFC：

| 条件 | CSS 属性 | 常用程度 |
|------|---------|---------|
| 根元素 `<html>` | 天然 BFC | — |
| 浮动元素 | `float` 不是 `none` | ⭐⭐⭐ |
| 绝对定位元素 | `position: absolute` / `fixed` | ⭐⭐ |
| 行内块元素 | `display: inline-block` | ⭐⭐ |
| 表格单元格 | `display: table-cell` | ⭐ |
| overflow 值不是 visible | `overflow: hidden` / `auto` / `scroll` | ⭐⭐⭐ |
| 弹性布局 | `display: flex` / `inline-flex` | ⭐⭐ |
| 网格布局 | `display: grid` / `inline-grid` | ⭐⭐ |
| **flow-root** | `display: flow-root` | ⭐⭐⭐⭐（推荐） |

### 最佳触发方式

```css
/* ✅ 推荐：语义最明确，无副作用 */
.container {
  display: flow-root;
}

/* ✅ 常用：兼容性好，但可能隐藏溢出内容 */
.container {
  overflow: hidden;
}

/* ✅ 常用：同时允许滚动 */
.container {
  overflow: auto;
}
```

```css
/* ❌ overflow: hidden 的副作用 */
.container {
  overflow: hidden;
  /* 如果子元素超出容器（如 tooltip、下拉菜单），会被裁切掉！ */
}

/* ✅ display: flow-root 没有副作用 */
.container {
  display: flow-root;
  /* 创建 BFC 但不会隐藏溢出内容 */
}
```

---

## 四、BFC 解决的四大经典问题

### 4.1 问题一：Margin 合并（塌陷）

**现象**：同一 BFC 中相邻块元素的垂直 margin 合并。

```html
<div class="box box-a">A</div>
<div class="box box-b">B</div>
```

```css
.box-a { margin-bottom: 30px; }
.box-b { margin-top: 20px; }
/* 实际间距 = max(30, 20) = 30px，不是 50px */
```

**解决**：将其中一个元素包裹在新的 BFC 中。

```html
<div class="box box-a">A</div>
<div class="bfc-wrapper">
  <div class="box box-b">B</div>
</div>
```

```css
.bfc-wrapper {
  display: flow-root; /* 创建新 BFC */
}
/* 现在间距 = 30 + 20 = 50px */
```

### 4.2 问题二：高度塌陷（浮动导致）

**现象**：父元素没有设置高度，子元素浮动后，父元素高度变为 0。

```html
<div class="parent">
  <div class="child" style="float: left; height: 100px;"></div>
</div>
<!-- parent 高度为 0，因为子元素浮动脱离了文档流 -->
```

**解决**：让父元素成为 BFC。

```css
/* 方案 1：推荐 */
.parent {
  display: flow-root;
}

/* 方案 2：常用 */
.parent {
  overflow: hidden;
}

/* 方案 3：clearfix（伪元素，也常见） */
.parent::after {
  content: '';
  display: block;
  clear: both;
}
```

### 4.3 问题三：浮动元素覆盖相邻内容

**现象**：浮动元素与后续的正常流元素重叠。

```html
<div class="float-box">我是浮动的</div>
<div class="normal-box">我是正常流的</div>
```

```css
.float-box {
  float: left;
  width: 100px;
  height: 100px;
}
/* normal-box 会跑到 float-box 下方，文字环绕 */
```

**解决**：给被覆盖的元素创建 BFC。

```css
.normal-box {
  display: flow-root; /* 不再与浮动元素重叠 */
}
```

### 4.4 问题四：两栏自适应布局

利用 BFC 不与浮动重叠的特性实现两栏布局：

```html
<div class="layout">
  <div class="left">左侧固定宽度</div>
  <div class="right">右侧自适应</div>
</div>
```

```css
.left {
  float: left;
  width: 200px;
  height: 100%;
}

.right {
  display: flow-root; /* 创建 BFC，不与 .left 重叠 */
  /* 自动填满剩余宽度 */
}
```

```
┌─────────────┬──────────────────────────┐
│   .left     │       .right             │
│  200px固定   │     自适应剩余宽度        │
│             │                          │
└─────────────┴──────────────────────────┘
```

---

## 五、BFC 解决方案对比

| 方案 | CSS | 优点 | 缺点 |
|------|-----|------|------|
| **flow-root** ✅ | `display: flow-root` | 语义清晰，无副作用 | IE 不支持 |
| **overflow** | `overflow: hidden` | 兼容性好 | 可能裁切溢出内容 |
| **clearfix** | `::after { clear: both }` | 不改变 display | 代码稍多 |
| **inline-block** | `display: inline-block` | 简单 | 会产生底部间隙 |

---

## 六、相关概念：其他格式化上下文

| 上下文 | 全称 | 触发条件 |
|--------|------|---------|
| BFC | Block Formatting Context | 见上文 |
| IFC | Inline Formatting Context | 块级容器中只包含行内级元素 |
| FFC | Flex Formatting Context | `display: flex / inline-flex` |
| GFC | Grid Formatting Context | `display: grid / inline-grid` |

---

## 七、常见面试题

### Q1：什么是 BFC？

**答：** BFC（块级格式化上下文）是一个独立的渲染区域，内部元素的布局不影响外部，外部的布局也不影响内部。它就像一个隔离的容器，内部块级盒子从上到下排列，垂直 margin 会合并，BFC 区域不会与浮动元素重叠，且可以包含浮动元素。

### Q2：如何触发 BFC？

**答：** 常见触发方式：`overflow: hidden/auto`、`display: flow-root`（推荐）、`float` 非 none、`position: absolute/fixed`、`display: flex/grid`。其中 `display: flow-root` 是最语义化的方式，专门为创建 BFC 设计，无副作用。

### Q3：BFC 能解决什么问题？

**答：** 四大经典问题：① 同一 BFC 内 margin 合并——创建新 BFC 隔离；② 浮动导致父元素高度塌陷——让父元素成为 BFC；③ 浮动元素覆盖相邻内容——给被覆盖元素创建 BFC；④ 两栏自适应布局——左浮动 + 右侧 BFC。

### Q4：为什么 `overflow: hidden` 能清除浮动？

**答：** 因为 `overflow` 不是 `visible` 的元素会创建新的 BFC。BFC 的特性之一就是**可以包含浮动元素**——计算 BFC 高度时，浮动子元素也会参与计算，所以父元素不再高度塌陷。

### Q5：BFC 与 margin 合并的关系？

**答：** 垂直 margin 合并只发生在**同一个 BFC 内**的相邻块级元素之间。要阻止合并，只需将其中一个元素放入新的 BFC 中——不同 BFC 之间的 margin 不会合并。

---

## 八、注意事项

1. **`display: flow-root` 兼容性**：现代浏览器均已支持，如需兼容旧浏览器可用 `overflow: hidden` 替代
2. **BFC 嵌套**：BFC 可以嵌套，内部可以再创建新的 BFC
3. **BFC 与性能**：大量 BFC 可能影响渲染性能，不要滥用
4. **`overflow: hidden` 的隐藏陷阱**：会裁切超出容器的子元素（如 tooltip、下拉菜单），使用时需评估
