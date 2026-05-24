# CSS 盒子模型

> 官方文档：[MDN - box-sizing](https://developer.mozilla.org/zh-CN/docs/Web/CSS/box-sizing)

## 什么是盒子模型？

想象一下**快递包装**：

```
┌─────────────────────────────────────────┐
│           外边距 (Margin)               │  ← 包裹与包裹之间的距离
│   ┌─────────────────────────────────┐   │
│   │        边框 (Border)            │   │  ← 快递盒子的硬纸板
│   │   ┌─────────────────────────┐   │   │
│   │   │    内边距 (Padding)     │   │   │  ← 商品与盒子之间的缓冲泡沫
│   │   │   ┌─────────────────┐   │   │   │
│   │   │   │   内容 (Content) │   │   │   │  ← 你买的商品
│   │   │   └─────────────────┘   │   │   │
│   │   └─────────────────────────┘   │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

每个 HTML 元素都是一个"盒子"，由内到外四层组成：

| 部分 | 作用 | 生活比喻 |
|-----|------|---------|
| **Content** | 放内容 | 快递里的商品 |
| **Padding** | 内容与边框的间距 | 商品四周的泡沫 |
| **Border** | 边界线 | 快递盒子的纸板 |
| **Margin** | 与其他元素的距离 | 包裹与包裹的空隙 |

---

## 一、四个部分的属性

### 1. Content - 内容区

```css
.box {
  width: 200px;   /* 宽度 */
  height: 100px;  /* 高度 */
}
```

### 2. Padding - 内边距

```css
/* 简写：上 右 下 左 */
padding: 10px 20px 10px 20px;

/* 两值：上下 左右 */
padding: 10px 20px;

/* 单值：四边相同 */
padding: 10px;

/* 单独设置 */
padding-top: 10px;
padding-right: 20px;
padding-bottom: 10px;
padding-left: 20px;
```

**记住：padding 是元素内部的"填充"，会显示背景颜色**

### 3. Border - 边框

```css
/* 完整写法 */
border: 2px solid #333;

/* 三个要素缺一不可 */
border-width: 2px;    /* 宽度 */
border-style: solid;  /* 样式（必须有值才显示） */
border-color: #333;   /* 颜色 */

/* 单独设置某一边 */
border-top: 2px solid red;
border-right: 2px dashed blue;
```

**常用边框样式：**

| 值 | 效果 |
|-----|------|
| `solid` | 实线 ─── |
| `dashed` | 虚线 - - - |
| `dotted` | 点线 · · · |
| `double` | 双线 ═ |
| `none` | 无边框 |

### 4. Margin - 外边距

```css
/* 用法和 padding 一样 */
margin: 10px 20px 10px 20px;
margin: 10px 20px;
margin: 10px;

/* 单独设置 */
margin-top: 10px;
margin-right: 20px;
```

**记住：margin 是元素外部的"距离"，透明且不会显示背景**

**关键区别：**

```css
/* padding 可以设置背景色 */
padding: 20px;
background: lightblue;  /* 会覆盖 padding 区域 */

/* margin 永远透明，显示父元素背景 */
margin: 20px;  /* 透明区域 */
```

---

## 二、两种盒子模型（重点！）

### 标准盒子模型 vs IE 盒子模型

这是最容易混淆的地方，用一张图说清楚：

```
【标准盒子模型】width = 内容宽度
┌───────┐
│margin │ ← 不算在 width 里
│ ┌───┐ │
│ │bor│ │ ← 不算在 width 里
│ │ ┌─┤ ││
│ │ │p│ ││ ← 不算在 width 里
│ │ │╾│╲││
│ │ │content ││ ← width = 200px
│ │ │      200px││
│ │ └──────────┤ ││
│ └─────────────┘ │
└─────────────────┘
实际总宽度 = 200 + padding + border + margin

【IE盒子模型】width = 内容+padding+border 总宽度
┌───────┐
│margin │ ← 不算在 width 里
│ ┌─────────────────┐ │
│ │ ╔═══════════════╗ │ │ ← width = 200px 包含这三层
│ │ ║content  ║ │ │
│ │ ╚═══════════════╝ │ │
│ └─────────────────┘ │
└─────────────────┘
实际总宽度 = 200 + margin
```

### 用代码对比：

```css
/* 同样的 CSS */
.box {
  width: 200px;
  padding: 20px;
  border: 5px solid #333;
  margin: 10px;
}
```

| 模型 | width 含义 | 内容区宽度 | 元素总宽度 |
|-----|-----------|-----------|-----------|
| 标准模型 | 仅内容 | 200px | 200 + 40 + 10 + 20 = 270px |
| IE 模型 | 内容+padding+border | 150px | 200 + 20 = 220px |

### 切换盒子模型

```css
/* 标准模型（默认） */
box-sizing: content-box;

/* IE 模型（推荐！） */
box-sizing: border-box;
```

---

## 三、为什么推荐 border-box？

### 实际开发中的问题

```css
/* 假设要做两栏布局，每栏 50% */
.column {
  width: 50%;
  padding: 20px;
  /* 用标准模型：50% + 40px > 50%，换行了！😱 */
}

/* 用 border-box 解决 */
.column {
  box-sizing: border-box;
  width: 50%;
  padding: 20px;
  /* 总宽度就是 50%，padding 包含在内 ✅ */
}
```

### 最佳实践：全局设置

```css
/* 在项目最开始设置，所有元素都用 border-box */
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

**好处：**
- ✅ 设置 width 就是最终宽度，不用算来算去
- ✅ 百分比布局更简单
- ✅ 响应式设计更轻松

---

## 四、外边距折叠（坑！）

### 什么是外边距折叠？

垂直方向上，两个相邻元素的 margin 会"重叠"，取较大的那个值：

```html
<div class="box1" style="margin-bottom: 20px">盒子1</div>
<div class="box2" style="margin-top: 30px">盒子2</div>
```

```
你以为的间距：20px + 30px = 50px
实际间距：max(20px, 30px) = 30px  😱
```

### 三种折叠情况

**1. 兄弟元素**
```css
.box1 { margin-bottom: 20px; }
.box2 { margin-top: 30px; }
/* 实际间距：30px */
```

**2. 父子元素**
```html
<div class="parent">
  <div class="child">子元素</div>
</div>
```
```css
.parent { margin-top: 20px; }
.child { margin-top: 30px; }
/* 子元素的 margin"穿透"到父元素 */
```

**3. 空元素**
```css
.empty {
  margin-top: 20px;
  margin-bottom: 30px;
  height: 0;
}
/* 上下 margin 折叠成 30px */
```

### 解决办法

```css
/* 方法1：给父元素加 padding */
.parent {
  padding-top: 1px;
}

/* 方法2：给父元素加 border */
.parent {
  border-top: 1px solid transparent;
}

/* 方法3：使用 overflow */
.parent {
  overflow: hidden;
}

/* 方法4：使用 flex 或 grid */
.parent {
  display: flex;
}
```

---

## 五、块级 vs 行内 vs 行内块

| 类型 | 特点 | 能设宽高 | 独占一行 | 例子 |
|-----|------|---------|---------|------|
| **block** | 块级盒子 | ✅ | ✅ | div、p、h1 |
| **inline** | 行内盒子 | ❌ | ❌ | span、a、strong |
| **inline-block** | 行内块 | ✅ | ❌ | img、input |

```css
/* 转换盒子类型 */
div {
  display: inline;      /* 块级变行内 */
}

span {
  display: block;       /* 行内变块级 */
}

span {
  display: inline-block; /* 行内变行内块 */
}
```

---

## 六、常见问题与解决

### 问题1：子元素 margin 穿透父元素

```html
<div class="parent">
  <div class="child"></div>
</div>
```

```css
/* ❌ 子元素的 margin-top 把父元素"顶"下来了 */
.parent { background: #eee; }
.child { margin-top: 50px; }

/* ✅ 解决方案（任选其一） */
.parent {
  padding-top: 1px;           /* 方案1 */
  /* 或 */
  border-top: 1px solid transparent;  /* 方案2 */
  /* 或 */
  overflow: hidden;           /* 方案3 */
}
```

### 问题2：行内元素垂直 margin/padding 无效

```css
span {
  margin-top: 20px;  /* ❌ 无效 */
  padding-top: 20px; /* ❌ 无效（显示但不占空间）*/

  /* ✅ 改成行内块或块级 */
  display: inline-block;
  /* 或 */
  display: block;
}
```

### 问题3：百分比宽度的元素超出容器

```css
.column {
  width: 50%;
  padding: 20px;  /* 没用 border-box，宽度 > 50% */
}

/* ✅ 解决 */
.column {
  box-sizing: border-box;
}
```

---

## 七、调试技巧

### 用浏览器开发者工具查看盒子

```
Chrome DevTools → Elements → 选中元素 → 右侧面板底部
```

颜色对应：
- 🟦 **蓝色** = Content（内容）
- 🟩 **绿色** = Padding（内边距）
- 🟧 **橙色** = Border（边框）
- 🟨 **黄色** = Margin（外边距）

### 调试 border-box 是否生效

```css
/* 给所有元素加个彩色边框，一眼看出宽度计算 */
* {
  box-sizing: border-box;
  outline: 1px solid red;  /* outline 不占空间，调试用 */
}
```

---

## 八、快速参考

### 盒子尺寸计算

```css
/* border-box（推荐） */
width = content + padding + border

/* content-box（默认） */
width = content
总宽度 = width + padding + border + margin
```

### 常用简写

```css
/* 四值：上 右 下 左（顺时针）*/
margin: 10px 20px 30px 40px;

/* 三值：上 左右 下 */
margin: 10px 20px 30px;

/* 两值：上下 左右 */
margin: 10px 20px;

/* 单值：四边相同 */
margin: 10px;

/* 垂直居中一个块级元素 */
margin: 0 auto;  /* 上下0，左右自动（居中）*/
```

### 全局重置（推荐每个项目都加）

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```
