# CSS3 新特性

> 官方文档：[MDN - CSS 参考手册](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference)

---

## 一、核心概念

CSS3 并非单一标准，而是将 CSS 拆分为多个**模块**（Modules），每个模块独立演进。以下是面试中常考的 CSS3 特性。

---

## 二、新增选择器

### 2.1 属性选择器

```css
/* 有 title 属性的元素 */
[title] { }

/* title 等于 "hello" */
[title="hello"] { }

/* title 包含 "hello" */
[title*="hello"] { }

/* title 以 "hello" 开头 */
[title^="hello"] { }

/* title 以 "hello" 结尾 */
[title$="hello"] { }
```

### 2.2 伪类选择器

```css
/* 第一个子元素 */
li:first-child { }

/* 最后一个子元素 */
li:last-child { }

/* 第 n 个子元素 */
li:nth-child(2) { }       /* 第2个 */
li:nth-child(odd) { }     /* 奇数 */
li:nth-child(even) { }    /* 偶数 */
li:nth-child(3n+1) { }    /* 1, 4, 7... */

/* 唯一子元素 */
p:only-child { }

/* 没有子元素的元素 */
div:empty { }

/* 非 X 的元素 */
div:not(.active) { }

/* 被选中的表单元素 */
input:checked { }

/* 禁用的表单元素 */
input:disabled { }
```

### 2.3 伪元素选择器

```css
/* 元素内容之前插入 */
p::before {
  content: "★ ";
}

/* 元素内容之后插入 */
p::after {
  content: " ★";
}

/* 文本选中样式 */
p::selection {
  background: #ff0;
  color: #000;
}

/* 第一行 */
p::first-line {
  font-weight: bold;
}

/* 第一个字母 */
p::first-letter {
  font-size: 2em;
}
```

---

## 三、圆角与阴影

### 3.1 border-radius（圆角）

```css
.box {
  /* 统一圆角 */
  border-radius: 10px;

  /* 四个角分别设置：左上 右上 右下 左下 */
  border-radius: 10px 20px 30px 40px;

  /* 圆形 */
  border-radius: 50%;

  /* 椭圆角 */
  border-radius: 20px / 40px; /* 水平 / 垂直 */
}
```

### 3.2 box-shadow（盒子阴影）

```css
.box {
  /* 水平偏移 垂直偏移 模糊半径 扩展半径 颜色 */
  box-shadow: 5px 5px 10px 0 rgba(0, 0, 0, 0.3);

  /* 内阴影 */
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);

  /* 多层阴影 */
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.1);
}
```

### 3.3 text-shadow（文字阴影）

```css
.text {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  /* 多层文字阴影 */
  text-shadow:
    1px 1px 0 #000,
    2px 2px 0 #333;
}
```

---

## 四、背景增强

### 4.1 多背景

```css
.box {
  background:
    url(top.png) no-repeat center top,
    url(bottom.png) no-repeat center bottom,
    linear-gradient(#fff, #eee);
}
```

### 4.2 background-size

```css
.box {
  background-size: cover;    /* 覆盖容器，可能裁切 */
  background-size: contain;  /* 完整显示，可能留白 */
  background-size: 100% 200px;
}
```

### 4.3 background-clip 与 background-origin

```css
.box {
  /* 背景裁切区域 */
  background-clip: border-box;  /* 默认，包含 border */
  background-clip: padding-box; /* 不包含 border */
  background-clip: content-box; /* 仅 content */
  background-clip: text;        /* 背景只显示在文字区域 */

  /* 背景定位区域 */
  background-origin: padding-box; /* 默认 */
  background-origin: content-box;
}
```

---

## 五、渐变

### 5.1 线性渐变

```css
.box {
  /* 从上到下 */
  background: linear-gradient(#e66465, #9198e5);

  /* 从左到右 */
  background: linear-gradient(to right, #e66465, #9198e5);

  /* 对角线 */
  background: linear-gradient(135deg, #e66465, #9198e5);

  /* 多个颜色停止点 */
  background: linear-gradient(to right, red, orange, yellow, green, blue);
}
```

### 5.2 径向渐变

```css
.box {
  background: radial-gradient(circle, #e66465, #9198e5);
  background: radial-gradient(ellipse at top, #e66465, #9198e5);
}
```

### 5.3 锥形渐变

```css
/* 饼图效果 */
.pie {
  background: conic-gradient(red 0% 30%, blue 30% 70%, green 70% 100%);
  border-radius: 50%;
}
```

---

## 六、滤镜

### 6.1 filter

```css
img {
  filter: blur(5px);            /* 模糊 */
  filter: brightness(1.2);      /* 亮度 */
  filter: contrast(1.5);        /* 对比度 */
  filter: grayscale(100%);      /* 灰度 */
  filter: sepia(100%);          /* 复古 */
  filter: saturate(2);          /* 饱和度 */
  filter: hue-rotate(90deg);    /* 色相旋转 */
  filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.5)); /* 投影（跟随形状） */
}
```

### 6.2 backdrop-filter

```css
/* 毛玻璃效果 */
.glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}
```

---

## 七、其他 CSS3 特性

### 7.1 border-image

```css
.box {
  border: 20px solid;
  border-image: url(border.png) 30 round;
}
```

### 7.2 resize

```css
textarea {
  resize: both;   /* 可调整大小 */
  resize: horizontal; /* 只能水平 */
  resize: vertical;   /* 只能垂直 */
  resize: none;       /* 禁止调整 */
}
```

### 7.3 outline-offset

```css
.box:focus {
  outline: 2px solid blue;
  outline-offset: 4px; /* 轮廓偏移 */
}
```

### 7.4 word-wrap / overflow-wrap

```css
.text {
  overflow-wrap: break-word; /* 长单词在任意位置断行 */
}
```

---

## 八、用 CSS3 画图形

### 8.1 三角形

```css
.triangle-up {
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-bottom: 100px solid red;
}
```

### 8.2 梯形

```css
.trapezoid {
  width: 100px;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 60px solid blue;
}
```

---

## 九、常见面试题

### Q1：CSS3 有哪些新特性？

**答：** 主要包括：① 新选择器（属性选择器、nth-child、:not 等）；② 圆角（border-radius）；③ 阴影（box-shadow、text-shadow）；④ 渐变（linear/radial/conic-gradient）；⑤ 背景（多背景、background-size/clip）；⑥ 过渡和动画（transition、animation）；⑦ 变换（transform）；⑧ 滤镜（filter、backdrop-filter）；⑨ Flex 和 Grid 布局；⑩ 媒体查询；⑪ CSS 变量（Custom Properties）。

### Q2：如何用 CSS 画一个三角形？

**答：** 设置一个宽高为 0 的元素，三条边设置为透明，一条边设置颜色：

```css
.triangle {
  width: 0;
  height: 0;
  border: 50px solid transparent;
  border-top-color: red; /* 向下的三角形 */
}
```

### Q3：`filter: drop-shadow()` 和 `box-shadow` 的区别？

**答：** `box-shadow` 只能画矩形的阴影，`drop-shadow` 会跟随元素的实际形状（包括透明区域）。比如不规则 PNG 图标，`box-shadow` 会给整个矩形区域加阴影，`drop-shadow` 只给不透明像素加阴影。

### Q4：如何实现毛玻璃效果？

**答：** 使用 `backdrop-filter: blur(10px)` 配合半透明背景 `background: rgba(255, 255, 255, 0.2)`。`backdrop-filter` 会对元素**背后的内容**应用滤镜效果。

---

## 十、注意事项

1. **CSS3 模块化**：CSS3 不是一个标准，而是多个独立模块的统称
2. **浏览器前缀**：新特性可能需要 `-webkit-`、`-moz-` 前缀，推荐使用 Autoprefixer 自动处理
3. **性能考量**：`filter` 和 `backdrop-filter` 是 GPU 加速属性，但大量使用会影响性能
4. **渐进增强**：使用 CSS3 特性时，确保不支持时有合理的降级方案
