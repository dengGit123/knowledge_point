### 一、概述

`overflow` 是 CSS 的**简写属性**，用来控制**当内容超出元素盒子时会发生什么**——是任由它溢出、裁掉、还是显示滚动条。

> 📖 [MDN：overflow](https://developer.mozilla.org/zh-CN/docs/Web/CSS/overflow)
>
> 📖 [CSS Overflow Module Level 3 规范](https://drafts.csswg.org/css-overflow-3/)

一个直观的类比：元素盒子像一个**固定大小的箱子**，内容是往里装的东西。箱子装不下时怎么办？`overflow` 就是那道指令——「多出来的部分露在外面」（`visible`）、「把盖子焊死切掉多余的」（`hidden`）、「给箱子装上抽屉滑轨」（`scroll` / `auto`）。

### 二、核心概念：什么是"溢出"

元素盒子的大小由 `width` / `height`（加上 padding、border）决定，而内容的实际尺寸可能超过这个盒子：

```html
<div class="box">
  <!-- 文字太多，高度超过了 .box 设定的 100px -->
  <p>很长的文字……</p>
</div>
```

```css
.box {
  width: 200px;
  height: 100px; /* 高度被限制，内容装不下 → 发生溢出 */
}
```

溢出默认**不会被裁剪**，内容会"画出"盒子边界，盖到相邻元素上——这就是默认值 `visible` 的行为。`overflow` 属性就是用来改变这个默认行为的。

几个前置要点：

- `overflow` 是 `overflow-x`（水平方向）和 `overflow-y`（垂直方向）的**简写**
- **不继承**：父元素设置了 `overflow`，子元素不会自动获得，需要逐层单独设置
- 默认值：`visible`
- 适用于：块级容器、flex 容器、grid 容器（对行内非替换元素无效）
- 溢出裁剪的边界是 **padding box（内边距盒）**：包含 padding 区域、不含 border；`box-shadow` 不参与裁剪，仍会显示

> ⚠️ **注意：** 想让 `overflow` 产生可见效果，块级容器在对应方向上必须有确定的尺寸约束——设置了 `height` / `max-height`（垂直方向），或者内容是 `white-space: nowrap` 的不换行文本（水平方向）。如果盒子高度是自动撑开的（默认行为），内容永远"刚好装下"，也就永远不会溢出。

### 三、六个取值详解

| 值 | 溢出内容 | 滚动条 | 用户能否滚动 | 能否编程滚动（`scrollTop`） | 创建 BFC | 是滚动容器 |
| --- | --- | --- | --- | --- | --- | --- |
| `visible`（默认） | 不裁剪，溢出显示 | 无 | — | — | 否 | 否 |
| `hidden` | 裁剪 | 无 | 不能 | **能** | 是 | **是** |
| `clip` | 裁剪 | 无 | 不能 | **不能** | 否 | 否 |
| `scroll` | 裁剪 | **始终显示**（即使没溢出） | 能 | 能 | 是 | 是 |
| `auto` | 裁剪 | 溢出时才显示 | 能 | 能 | 是 | 是 |
| `overlay`（已废弃） | 裁剪 | 溢出时显示，且**覆盖在内容上** | 能 | 能 | 是 | 是 |

#### 1. `visible`——默认，放任溢出

```css
.box {
  overflow: visible; /* 默认值，内容溢出盒子也照常渲染 */
}
```

#### 2. `hidden`——裁剪，但仍是"滚动容器"

```css
.box {
  height: 100px;
  overflow: hidden; /* 超出 100px 的部分被裁掉，不出现滚动条 */
}
```

关键细节：`hidden` 只是不让**用户**滚动（拖拽、滚轮无效），但 JavaScript 依然可以滚动它：

```js
// ✅ overflow: hidden 的元素可以通过 JS 滚动
const box = document.querySelector('.box');
box.scrollTop = 200;                                // 设置滚动位置
box.scrollTo({ top: 0, behavior: 'smooth' });       // 平滑滚回顶部
```

所以 `hidden` 的元素**依然是一个滚动容器**（scroll container）——这一点在多层级嵌套中非常重要，后文详述。

#### 3. `clip`——纯粹的裁剪，"焊死"的版本

`clip` 与 `hidden` 视觉效果基本相同，区别在于：

- **禁止一切滚动**，包括编程式滚动（`scrollTop` 赋值无效）
- **不是滚动容器**，也**不会创建 BFC**（`hidden` 会）
- 如果需要 BFC，搭配 `display: flow-root` 使用
- 裁剪边缘由 [`overflow-clip-margin`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/overflow-clip-margin) 控制，可以让内容多露出一段再裁（`hidden` 固定裁到 padding box，无此能力）

```css
/* ✅ 只要裁剪、不想要任何滚动能力的场景 */
.box {
  overflow: clip;
  display: flow-root; /* 需要清除浮动 / 隔离 margin 时再补这个 */
}
```

兼容性：Chrome 90+、Edge 90+、Firefox 81+、Safari 16+（2022 年 9 月起），现代项目可放心使用；需要兼容更老浏览器时用 `hidden` 兜底，视觉结果基本一致。注意 `overflow-clip-margin` 在 Safari 中至今未支持，只建议作为渐进增强使用。

#### 4. `scroll`——始终显示滚动条

```css
.box {
  overflow: scroll; /* 无论内容是否溢出，滚动条常驻 */
}
```

滚动条常驻的目的是**防止布局抖动**：内容从"不溢出"变成"溢出"时，如果滚动条突然出现，可用宽度会变化，导致内容跳动。`scroll` 提前占好位置。在 macOS / 触屏设备的"悬浮式滚动条"下，`scroll` 和 `auto` 视觉上可能看不出区别。

#### 5. `auto`——按需显示滚动条（最常用）

```css
.box {
  overflow: auto; /* 内容装得下就当没事，装不下才出滚动条 */
}
```

日常开发中 `overflow: auto` 是滚动容器的首选写法；明确知道内容一定会溢出、且要避免抖动时才用 `scroll`。

#### 6. `overlay`——已废弃，勿用

行为与 `auto` 相同，但滚动条**悬浮在内容之上、不占空间**。它源自 WebKit/Chromium 私有值，从未进入 CSS 标准；Chrome 已将其移除，现在各浏览器把它当作 `auto` 的别名处理。新代码不要使用；想控制滚动条占位，用 [`scrollbar-gutter`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/scrollbar-gutter) 属性。

### 四、基本用法

#### 1. 经典滚动区域

```html
<div class="scroll-panel">
  <p>很多内容……</p>
</div>
```

```css
.scroll-panel {
  width: 300px;
  height: 200px;      /* 固定高度，内容超出才会滚动 */
  overflow-y: auto;   /* 垂直方向按需出滚动条 */
}
```

#### 2. 单行文字省略号（配合 `text-overflow`）

```css
.ellipsis {
  width: 200px;
  white-space: nowrap;          /* 不换行，制造水平溢出 */
  overflow: hidden;             /* 裁掉溢出部分 */
  text-overflow: ellipsis;      /* 裁剪处显示省略号 */
}
```

`text-overflow` 只负责显示 `...`，真正裁剪和产生溢出的是另外两个属性，三者缺一不可。

#### 3. 多行文字省略号

```css
.ellipsis-3 {
  display: -webkit-box;              /* 旧弹性盒（写法沿用至今） */
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;             /* 最多显示 3 行 */
  overflow: hidden;                  /* 裁掉第 3 行之后的内容 */
}
```

### 五、overflow-x 与 overflow-y：简写与"值矫正"规则

`overflow` 可以接受一个或两个关键字：

```css
/* 一个值：x、y 相同 */
overflow: hidden;         /* 等价于 overflow-x: hidden; overflow-y: hidden; */

/* 两个值：第一个给 x（水平），第二个给 y（垂直） */
overflow: hidden auto;    /* 水平裁剪，垂直按需滚动 */
overflow: scroll hidden;  /* 水平常驻滚动条，垂直裁剪 */
```

> ⚠️ **注意：** 两个值时的顺序是 `overflow: <x> <y>`，与其他 `x y` 顺序的简写（如 `padding`、`margin` 的"上右下左"）不同，容易记混。

**值矫正规则**（重要且常被忽略）：当某一轴设为 `visible`，而另一轴设为 `hidden` / `scroll` / `auto` 时，`visible` 会被强制计算为 `auto`；同理，一轴为 `clip`、另一轴为这三者之一时，`clip` 会被计算为 `hidden`。MDN 对前者的原文表述是："如果 `overflow-y` 是 `hidden`、`scroll` 或 `auto`，而 `overflow-x` 是 `visible`（默认值），则该值会被隐式计算为 `auto`"。

```css
/* ❌ 想要"水平裁剪、垂直放任溢出"——做不到！ */
.box {
  overflow-x: hidden;
  overflow-y: visible;   /* 实际计算值为 auto，垂直方向变成滚动容器 */
}
```

原因：一个盒子不可能"水平方向是滚动容器、垂直方向随意溢出"，滚动容器必须各轴行为一致。所以常见的实际效果是：`overflow-x: hidden` 想只裁水平，结果垂直方向也变成了可滚动（`auto`）。

一个例外组合是 `overflow: hidden visible` 或 `visible clip`——`hidden` / `clip` 与 `visible` / `clip` 之间的组合不需要矫正，因为它们不涉及滚动机制。

### 六、多层级（嵌套）元素上的特点 ⭐

这是 `overflow` 最容易踩坑的部分。以下场景都是"父元素、子元素多层嵌套"时才会出现的行为。

#### 1. 不继承、逐层独立设置

`overflow` 不继承，每一层各自生效。裁剪是**逐层独立**发生的：内层裁剪不影响外层，外层也只管自己的边界。

```html
<div class="outer">          <!-- overflow: hidden -->
  <div class="inner">        <!-- overflow: auto，独立滚动 -->
    <div class="content">…</div>
  </div>
</div>
```

```css
.outer {
  height: 400px;
  overflow: hidden;   /* 只裁剪"包含块在自己内部"的溢出内容 */
}
.inner {
  height: 300px;
  overflow: auto;     /* 内层是独立的滚动容器，滚多少都不会让外层滚 */
}
```

#### 2. 滚动传播（scroll chaining）：内层滚到底，外层接着滚

多个滚动容器嵌套时（典型：页面里嵌一个可滚动的侧边栏），**内层滚动到边界后，继续滚动的动作会"传播"给最近的祖先滚动容器**，于是页面也开始滚动——这往往不是用户想要的效果。

```css
/* ✅ 用 overscroll-behavior 阻止滚动传播 */
.sidebar {
  height: 100vh;
  overflow-y: auto;
  overscroll-behavior: contain; /* 内层滚到底后，不再带动外层滚动 */
}
```

[`overscroll-behavior`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/overscroll-behavior) 的取值：

| 值 | 行为 |
| --- | --- |
| `auto`（默认） | 正常滚动传播 |
| `contain` | 阻止传播给祖先；元素自身的边界效果（如橡皮筋）保留 |
| `none` | 阻止传播，且连下拉刷新、发光提示等默认边界效果也禁用 |

弹窗 / 抽屉组件的滚动区域几乎都应该加 `overscroll-behavior: contain`，否则背景页面会跟着滚。Chrome 63+、Firefox 59+、Edge 18+、Safari 16+ 支持。

> 💡 **提示：** `overflow: hidden` 的元素虽然不可滚动，但按规范它"始终处于滚动边界"——在它上面设置 `overscroll-behavior: contain` 同样能切断滚动传播。这也是阻止弹窗背景滚动的手段之一。

#### 3. 绝对定位元素的"逃逸"：裁剪跟着包含块走

`overflow: hidden` 的祖先**不一定**能裁剪绝对定位的后代。规则是：**`overflow` 只裁剪"包含块在自己内部"的后代**。而 `position: absolute` 元素的包含块是最近的**定位祖先**（`position` 不是 `static` 的元素）。

```html
<!-- 场景一：会被裁剪 -->
<div style="overflow: hidden; position: relative">  <!-- 既是裁剪者又是包含块 -->
  <div style="position: absolute; top: -50px">我露不出去</div>
</div>

<!-- 场景二：逃逸成功 -->
<div style="position: relative">                     <!-- 包含块在外层 -->
  <div style="overflow: hidden">                     <!-- static 定位，只是中间层 -->
    <div style="position: absolute; top: -50px">我会溢出到外层，不被裁剪</div>
  </div>
</div>
```

场景二中，绝对定位元素的包含块是最外层的 `relative` 元素，溢出裁剪祖先（中间层）"管不到"包含块在它外面的元素，于是内容逃逸。

想让裁剪重新生效，常用手段：

```css
/* ✅ 方法一：让 overflow 元素同时成为包含块 */
.clipper {
  overflow: hidden;
  position: relative;
}

/* ✅ 方法二：用 clip-path 裁剪，它不受包含块规则限制 */
.clipper {
  clip-path: inset(0);
}

/* ✅ 方法三：contain: paint，裁剪并创建包含块 */
.clipper {
  contain: paint;
}
```

`position: fixed` 元素同理更难被裁剪——它的包含块通常是视口，普通祖先的 `overflow` 基本管不住它（除非祖先设置了 `transform`、`filter` 等使其成为 fixed 的包含块）。

#### 4. `position: sticky` 失效：中间层的 overflow 会"劫持"它

`sticky` 元素是相对**最近的滚动祖先（scrollport）**定位的。而 `overflow: hidden` / `auto` / `scroll` 的祖先**都是滚动容器**——即使它看起来根本不会滚动。

于是一个经典 bug：给标题加了 `position: sticky; top: 0`，却怎么也不吸顶。原因往往是某个中间祖先（甚至 `html` / `body`）设了 `overflow: hidden`：

```css
/* ❌ sticky 失效：父元素的 overflow: hidden 成了"最近的滚动祖先"，
   但这个容器自身不滚动，sticky 没有可以"贴"的滚动参照，就不会动 */
.wrapper {
  overflow: hidden;
}

/* ✅ 修复方式一：父元素改用 clip——它不创建滚动容器，sticky 恢复正常 */
.wrapper {
  overflow: clip;
}

/* ✅ 修复方式二：把 sticky 元素移出有 overflow 的祖先 */
```

排查口诀：从 sticky 元素向上逐层检查到目标滚动区（通常是视口）之间，**任何一层**的 `overflow` 是 `hidden` / `auto` / `scroll` 都可能劫持它。`html` / `body` 上的 `overflow-x: hidden` 是全局最常见的凶手，需要禁止横向滚动时可改用 `overflow-x: clip`。

#### 5. `html` / `body` 上的 overflow 会"传播"给视口

有一条特殊规则（自 CSS 2.1 沿袭至今）：设置在根元素（`html`）上的非 `visible` 的 `overflow` 会应用到**视口**上；如果 `html` 的 `overflow` 是 `visible`，则浏览器改为取 `body` 的 `overflow` 应用到视口。

```css
/* 这两条的实际效果都是"整个页面不出现滚动条"，
   并且传播者本身按 visible 处理 */
html { overflow: hidden; }
/* 或 */
body { overflow: hidden; }
```

> ⚠️ **注意：** 正因为存在视口传播，在 `html` / `body` 上随手设置 `overflow` 可能产生全局副作用（隐藏页面滚动条、破坏 sticky、影响移动端橡皮筋）。全局 overflow 只留给明确需要的场景（如锁滚动的全屏弹窗），并建议配合 `overscroll-behavior` 一起使用。

#### 6. 非 `visible` / `clip` 值会创建 BFC，改变嵌套布局

给元素设置 `hidden` / `scroll` / `auto` 会隐式创建**块级格式化上下文（BFC）**，带来两个布局副作用：

```css
.panel {
  overflow: hidden; /* 相当于免费获得一个 BFC */
}
```

- **margin 不再与外部折叠**：普通父子元素的垂直 margin 会"穿透"合并，加了 `overflow: hidden` 后被隔开
- **包含内部浮动**：内部浮动的子元素不再从父元素高度中"漏出去"，父元素能正常包裹浮动子元素（经典的"清浮动"手法之一）

历史上这两个特性被大量用于清浮动；现代写法更推荐语义明确的 `display: flow-root`（只创建 BFC、不裁剪）。注意 `clip` **不会**创建 BFC，这是它和 `hidden` 的重要差异。

#### 7. flex / grid 嵌套中的 `min-width: auto` 陷阱

在 flex 或 grid 容器里嵌套滚动区域时，一个高频坑：给子项里的盒子设了 `overflow: auto` 却"滚不起来"，内容反而把整个布局撑开。

原因：flex / grid 子项的 `min-width` / `min-height` 默认是 `auto`（即"不小于内容尺寸"），子项被内容撑大，永远不会真正溢出，`overflow` 自然无从生效。

```css
/* ❌ 内层滚动失效：.inner 被 min-height: auto 撑开 */
.outer {
  display: flex;
  height: 400px;
}
.inner {
  overflow-y: auto; /* 看起来对，但 .inner 高度被内容撑到超过 400px */
}

/* ✅ 显式放开最小尺寸限制 */
.outer {
  display: flex;
  height: 400px;
}
.inner {
  flex: 1;
  min-height: 0;    /* 关键：允许收缩到内容尺寸以下 */
  overflow-y: auto; /* 现在能正常滚动了 */
}
```

水平方向同理用 `min-width: 0`。这是 flex 布局 + 滚动容器组合的标准搭配。

### 七、实际应用场景

#### 1. 弹窗内容区滚动（锁背景、防传播）

```css
.modal__body {
  max-height: 60vh;               /* 内容多时限制高度 */
  overflow-y: auto;               /* 只有内容区滚动 */
  overscroll-behavior: contain;   /* 滚到底不带动背景页面 */
}
```

#### 2. 表格横向滚动

```css
.table-wrapper {
  overflow-x: auto;  /* 窄屏下表格可以横向滑动 */
}
```

#### 3. 多栏布局中独立滚动的侧边栏

```css
.layout {
  display: flex;
  height: 100vh;
}
.layout__sidebar {
  width: 240px;
  overflow-y: auto;             /* 侧边栏独立滚动 */
  overscroll-behavior: contain; /* 不影响主内容区 */
}
.layout__main {
  flex: 1;
  min-width: 0;
}
```

#### 4. 横向滚动的卡片列表

```css
.card-list {
  display: flex;
  gap: 12px;
  overflow-x: auto;             /* 横向滑动查看更多卡片 */
  scrollbar-width: thin;         /* 细滚动条（Firefox 69+/Chrome 121+/Safari 18.2+） */
}
.card-list::-webkit-scrollbar {  /* 自定义 webkit 系滚动条样式（非标准）
                                     ⚠️ 与 scrollbar-width 同用时后者优先，webkit 样式会失效 */
  height: 6px;
}
```

#### 5. 清除浮动（传统手法，了解即可）

```css
.legacy-clearfix {
  overflow: hidden; /* 创建 BFC 包住浮动子元素；新代码建议 display: flow-root */
}
```

### 八、常见问题与注意事项

**1. 设了 `overflow: hidden` 却"没生效"**

九成是因为盒子高度是自动的（没设 `height` / `max-height`），内容撑多高盒子就多高，根本不存在溢出。先确认盒子有确定的高度约束。

**2. `hidden` 不是绝对的安全锁**

- 编程滚动仍然可行（`scrollTop`），需要完全禁用滚动能力时用 `clip`
- 绝对定位后代可能"逃逸"（见第六节第 3 点）
- 想连 `position: fixed` 的内容也裁住，考虑 `clip-path: inset(0)` 或把裁剪者变成 fixed 的包含块（如加 `transform`）

**3. 滚动条会占据内容宽度**

在 Windows 等使用"经典滚动条"的平台，`auto` / `scroll` 出现的滚动条会挤占盒子宽度（约 15px，因平台而异），可能引起内容重排。需要稳定预留空间时用 `scrollbar-gutter: stable`；需要隐藏滚动条但保留滚动能力，用 `scrollbar-width: none`（标准写法，Firefox 69+ / Chrome 121+ / Safari 18.2+）配合 `::-webkit-scrollbar { display: none }`（非标准的 webkit 写法，做旧浏览器兜底）。

**4. 嵌套滚动 + `scroll` 常驻滚动条的抖动问题**

内层滚动条出现/消失会改变外层可用宽度，多层嵌套时逐级放大抖动。方案：内层直接用 `scroll` 常驻、或 `scrollbar-gutter: stable`、或干脆 `scrollbar-width: none` 隐藏。

**5. 移动端的"滚动穿透"**

弹窗锁滚动时，仅在 `body` 上加 `overflow: hidden` 在 iOS Safari 上不彻底（触摸滚动可能仍然穿透），常需配合 `position: fixed` body 或 `overscroll-behavior: contain` / `touch-action` 处理。

**6. 滚动锚定（scroll anchoring）带来的"跳动"**

浏览器（Chrome 56+、Firefox 66+；Safari 长期未支持）默认开启滚动锚定：内容在滚动位置上方插入/变化时，自动调整滚动量让可视内容不跳。个别场景（如聊天列表反向加载）反而需要关闭：

```css
.chat-list {
  overflow-anchor: none; /* 关闭本容器的滚动锚定 */
}
```

**7. 能力选择速查**

| 需求 | 写法 |
| --- | --- |
| 内容溢出时可滚动 | `overflow: auto` |
| 只裁剪，禁止一切滚动 | `overflow: clip` |
| 裁剪但保留 JS 滚动能力 | `overflow: hidden` |
| 防止滚动条出现/消失引起抖动 | `overflow: scroll` 或 `scrollbar-gutter: stable` |
| 阻止嵌套滚动传播 | `overscroll-behavior: contain` |
| 裁剪但不破坏内部 sticky | `overflow: clip`（不要用 `hidden`） |
| 清浮动 / 隔离 margin，不裁剪 | `display: flow-root` |

### 九、与相关概念对比

| 属性 / 概念 | 与 `overflow` 的关系 |
| --- | --- |
| `text-overflow` | 只负责溢出处显示 `...`，必须配合 `overflow: hidden` 等非 `visible` 值才有意义 |
| `overscroll-behavior` | 控制**滚动到边界之后**的行为（传播、下拉刷新），前提是有 `overflow` 滚动容器 |
| `clip-path` | 视觉裁剪，不创建滚动容器、不受包含块规则限制，可裁剪绝对定位后代 |
| `scrollbar-gutter` | 控制滚动条占位的预留空间，与 `overflow: auto` / `scroll` 配合 |
| `contain: paint` | 类似"裁剪版隔离"，会创建包含块并裁剪后代，常用于性能优化 |
| `display: flow-root` | 只创建 BFC 不裁剪，是 `overflow: hidden` 清浮动手法的现代替代 |

`hidden` 与 `clip` 的详细差异（多层级场景中最需要分清的一组）：

| 特性 | `hidden` | `clip` |
| --- | --- | --- |
| 视觉裁剪 | ✅ | ✅ |
| 创建 BFC | ✅ | ❌（需要时配 `display: flow-root`） |
| 是滚动容器 | ✅ | ❌ |
| JS 滚动（`scrollTop`） | ✅ | ❌ |
| 劫持内部 `sticky` | ✅ 会 | ❌ 不会 |
| 支持滚动传播链 | ✅ 在链上 | ❌ 不在链上 |

### 十、总结

- `overflow` 决定内容超出盒子时的命运：`visible` 放任、`hidden` / `clip` 裁剪、`scroll` / `auto` 滚动
- 多层级嵌套中记住四条核心规则：
  1. **不继承、逐层独立**，裁剪与滚动互不干扰
  2. **滚动传播**：内层滚到底会带动外层，用 `overscroll-behavior: contain` 切断
  3. **裁剪跟着包含块走**：绝对定位后代的包含块在裁剪祖先之外时，能"逃逸"
  4. **`hidden` / `auto` / `scroll` 都是滚动容器**：会劫持内部 `sticky`、会创建 BFC；不想要这些副作用就用 `clip`
- `html` / `body` 的 `overflow` 会传播给视口，全局副作用大，慎用
- flex / grid 里嵌套滚动区，记得 `min-width: 0` / `min-height: 0`
- 现代浏览器的首选心智模型：**要滚动用 `auto`，要裁剪用 `clip`，`hidden` 留给需要 JS 滚动或旧浏览器兼容的场景**
