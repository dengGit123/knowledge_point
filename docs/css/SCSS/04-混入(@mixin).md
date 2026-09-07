# SCSS 混入（@mixin 与 @include）

> 📖 官方文档：[Sass Mixins](https://sass-lang.com/documentation/at-rules/mixin/)

### 一、概述

**混入（mixin）是可复用的样式代码块**：定义一次，到处"粘贴"。和变量复用"值"不同，mixin 复用的是**一整段样式**，还能接收参数、按参数生成不同结果。

```scss
// 定义
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// 使用（@include 引入）
.modal {
  @include flex-center; // 样式被"复制"到 .modal 里
}
```

典型用途：

- 兼容性前缀、清浮动这类"通用样式片段"
- 需要传参数的动态样式（如响应式断点 mixin）
- 避免 `.float-left` 这类无语义的工具类污染 HTML

### 二、基本用法

#### 1. 定义与引入

```scss
@mixin reset-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

@mixin horizontal-list {
  @include reset-list; // mixin 内可以引用其他 mixin
  li {
    display: inline-block;
  }
}

nav ul {
  @include horizontal-list;
}
```

```css
/* 编译结果 */
nav ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
nav ul li {
  display: inline-block;
}
```

> 💡 **提示：** mixin 名中 `-` 和 `_` 等价：`reset-list` 和 `reset_list` 是同一个 mixin。mixin 名不能以 `--` 开头。

#### 2. mixin 里可以放什么

mixin 体几乎是"万能"的：属性声明、嵌套规则、`@media`、控制指令、甚至 `@include` 其他 mixin 都可以。

### 三、参数

#### 1. 位置参数与可选参数（默认值）

```scss
// $x、$y 是可选参数，有默认值
@mixin replace-text($image, $x: 50%, $y: 50%) {
  text-indent: -99999em;
  overflow: hidden;
  background-image: $image;
  background-position: $x $y;
}

.mail-icon {
  @include replace-text(url("/images/mail.svg"), 0);
  // $image = url(...), $x = 0, $y 用默认值 50%
}
```

```css
.mail-icon {
  text-indent: -99999em;
  overflow: hidden;
  background-image: url("/images/mail.svg");
  background-position: 0 50%;
}
```

> 💡 **提示：** 默认值可以是任意 SassScript 表达式，甚至可以引用**前面的参数**：`@mixin box($width, $height: $width)`。

#### 2. 关键字参数

调用时用 `参数名: 值` 的形式传参，可读性更好，还能跳过中间的可选参数：

```scss
@mixin square($size, $radius: 0) {
  width: $size;
  height: $size;
  @if $radius != 0 {
    border-radius: $radius;
  }
}

.avatar {
  @include square(100px, $radius: 4px); // $radius 用关键字传参
}
```

> ⚠️ **注意：** 因为参数可以按名传递，**重命名 mixin 的参数是破坏性变更**——别人代码里的 `$radius: 4px` 会直接报错。对外提供的公共 mixin 改参数名要谨慎。

#### 3. 可变参数 `$args...`

参数列表末尾写 `...`，即可接收**任意数量的参数**（收进一个列表）：

```scss
@use "sass:list";

@mixin order($height, $selectors...) {
  @for $i from 1 through list.length($selectors) {
    #{list.nth($selectors, $i)} {
      position: absolute;
      height: $height;
      margin-top: ($i - 1) * $height;
    }
  }
}

@include order(150px, "input.name", "input.address", "input.zip");
```

反过来，调用时**展开**列表/映射也可以用 `...`：

```scss
$form-selectors: "input.name", "input.address", "input.zip";
@include order(150px, $form-selectors...); // 列表展开成多个位置参数

// map 后跟 ... 会展开成关键字参数（前提是被调用的 mixin 声明了对应的可选参数）
@mixin shadow($x: 0, $y: 0, $blur: 0) {
  box-shadow: $x $y $blur rgba(0, 0, 0, 0.2);
}
$shadow-config: (x: 0, y: 4px, blur: 8px);
@include shadow($shadow-config...);
```

#### 4. 接收任意关键字参数：`meta.keywords()`

```scss
@use "sass:meta";

@mixin syntax-colors($args...) {
  // 把多余的关键字参数收成 map：(string: #080, comment: #800, ...)
  @each $name, $color in meta.keywords($args) {
    pre span.stx-#{$name} {
      color: $color;
    }
  }
}

@include syntax-colors(
  $string: #080,
  $comment: #800,
  $variable: #60b
);
```

> 💡 **提示：** 如果 mixin 的可变参数**从未**传给 `meta.keywords()`，调用时传了未声明的关键字参数会直接报错——这其实是好事，能帮你发现拼写错误的参数名。

### 四、内容块 `@content`

mixin 除了接收参数，还能接收**一整段样式块**——传入的块会替换 mixin 体内的 `@content` 处：

```scss
@mixin hover {
  &:not([disabled]):hover {
    @content; // 传入的内容块注入这里
  }
}

.button {
  border: 1px solid black;
  @include hover {
    border-width: 2px; // 这段样式进入 &:hover 规则内
  }
}
```

```css
.button {
  border: 1px solid black;
}
.button:not([disabled]):hover {
  border-width: 2px;
}
```

#### 1. 最经典的应用：响应式断点 mixin

```scss
@use "sass:map";

$breakpoints: (
  "sm": 640px,   // 手机横屏
  "md": 960px,   // 平板
  "lg": 1280px,  // 桌面
);

@mixin respond-to($bp) {
  @media (min-width: map.get($breakpoints, $bp)) {
    @content;
  }
}

.container {
  width: 100%;

  @include respond-to("md") {
    width: 960px; // 编译后包在 @media (min-width: 960px) 里
  }
}
```

#### 2. 给内容块传参数 `@content(...)` + `using`

```scss
@mixin media($types...) {
  @each $type in $types {
    @media #{$type} {
      @content($type); // 把 $type 传给内容块
    }
  }
}

// 用 using 接收内容块的参数
@include media(screen, print) using ($type) {
  h1 {
    font-size: 40px;
    @if $type == print {
      font-family: Calluna;
    }
  }
}
```

> ⚠️ **注意：** 作用域陷阱——内容块是**词法作用域**：它在"调用者所在的作用域"求值，**看不到 mixin 内部的局部变量**。想让内容块拿到信息，就用 `@content(...)` 传参或传 map。

### 五、mixin vs @include 的完整语法速查

| 语法 | 作用 |
| --- | --- |
| `@mixin name { ... }` | 定义无参 mixin |
| `@mixin name($a, $b: 默认值) { ... }` | 定义带参 mixin |
| `@mixin name($args...) { ... }` | 定义可变参数 mixin |
| `@include name` | 引入 mixin |
| `@include name(实参)` | 传参引入 |
| `@include name(实参) { ... }` | 传入内容块 |
| `@include name using ($x) { ... }` | 接收内容块参数 |
| `@content` / `@content(...)` | 在 mixin 内注入内容块 / 传参 |
| `@include module.name(...)` | 使用其他模块的 mixin |

### 六、实际应用场景

```scss
// 场景一：浏览器兼容前缀
@mixin prefix($property, $value, $prefixes) {
  @each $prefix in $prefixes {
    -#{$prefix}-#{$property}: $value;
  }
  #{$property}: $value;
}

.gray {
  @include prefix(filter, grayscale(50%), moz webkit);
}
```

```scss
// 场景二：单行/多行文本省略
@mixin ellipsis($lines: 1) {
  overflow: hidden;
  @if $lines == 1 {
    white-space: nowrap;
    text-overflow: ellipsis;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
  }
}

.title { @include ellipsis; }
.desc  { @include ellipsis(3); }
```

```scss
// 场景三：三角形（多参数 + 条件判断）
@mixin triangle($size, $color, $direction) {
  width: 0;
  height: 0;
  border: $size solid transparent;
  @if $direction == up    { border-bottom-color: $color; }
  @else if $direction == right { border-left-color: $color; }
  @else if $direction == down  { border-top-color: $color; }
  @else if $direction == left  { border-right-color: $color; }
  @else { @error "Unknown direction #{$direction}."; }
}

.tooltip::after {
  @include triangle(8px, #333, up);
}
```

### 七、常见问题与注意事项

1. **mixin 是"复制"不是"引用"**：每次 `@include` 都会把样式完整复制一份，输出 CSS 体积会随引入次数增长。高频复用的纯样式考虑用 `@extend` + 占位符（但两者取舍见 [05-继承(@extend)与占位符](./05-继承%28@extend%29与占位符.md)）。
2. **先定义后使用**（同一作用域内）。
3. **作用域**：mixin 内的变量遵循正常作用域规则；内容块是词法作用域，取调用处的变量。
4. **参数个数不匹配会报错**：必填参数漏传、多传（未声明可变参数时）都不行。
5. **参数列表允许尾随逗号**：`@include foo($a, $b,)` 合法，重构时不容易出错。

### 八、总结

- `@mixin` 定义、`@include` 使用；支持默认参数、关键字参数、可变参数
- `@content` 让 mixin 能包住一段样式（响应式断点 mixin 是教科书级应用）
- `meta.keywords($args)` 收集任意关键字参数成 map
- mixin 复制样式、可传参、优先级上下文就是引入处；`@extend` 合并选择器、不可传参——按需选择
