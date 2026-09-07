# SCSS 控制指令（@if、@each、@for、@while）

> 📖 官方文档：[Sass Flow Control](https://sass-lang.com/documentation/at-rules/control/)

### 一、概述

SCSS 提供四种**流程控制指令**，让你在样式表里做"编程"的事——按条件生成样式、批量循环生成规则。它们是 mixin、函数的"发动机"，几乎所有高级用法（工具类批量生成、主题切换）都靠它们驱动。

| 指令 | 作用 | 类比 JavaScript |
| --- | --- | --- |
| `@if / @else` | 条件判断 | `if / else` |
| `@each` | 遍历列表/映射 | `for...of` |
| `@for` | 按数字范围循环 | `for (i = 1; i <= n; i++)` |
| `@while` | 条件循环 | `while` |

### 二、@if 与 @else

#### 1. 基本用法

`@if <表达式> { ... }`，表达式为真时输出块内样式：

```scss
@use "sass:math";

@mixin avatar($size, $circle: false) {
  width: $size;
  height: $size;
  @if $circle {
    border-radius: math.div($size, 2); // 圆形时才加圆角
  }
}

.square-av { @include avatar(100px, $circle: false); }
.circle-av { @include avatar(100px, $circle: true); }
```

```css
.square-av { width: 100px; height: 100px; }
.circle-av {
  width: 100px;
  height: 100px;
  border-radius: 50px;
}
```

#### 2. `@else` 与 `@else if`

```scss
$light-bg: #f2ece4;
$dark-bg: #6b717f;

@mixin theme-colors($light-theme: true) {
  @if $light-theme {
    background-color: $light-bg;
  } @else {
    background-color: $dark-bg;
  }
}
```

链式 `@else if`，第一个为真的分支生效，其余跳过（官方三角形示例）：

```scss
@mixin triangle($size, $color, $direction) {
  border: $size solid transparent;
  @if $direction == up {
    border-bottom-color: $color;
  } @else if $direction == right {
    border-left-color: $color;
  } @else if $direction == down {
    border-top-color: $color;
  } @else if $direction == left {
    border-right-color: $color;
  } @else {
    @error "Unknown direction #{$direction}."; // 兜底直接抛错
  }
}
```

条件表达式里可以用布尔运算符 `and`、`or`、`not`：

```scss
@if $size > 0 and $size < 100 { ... }
@if not $disabled { ... }
```

#### 3. 真值与假值（重要）

Sass 只有 **`false` 和 `null` 是假值**，其他一切（包括 `0`、空字符串、空列表）都是真值：

```scss
@if 0 { /* ✅ 会执行 */ }
@if null { /* ❌ 不会执行 */ }
@if "" { /* ✅ 会执行！空字符串也是真 */ }
```

> ⚠️ **注意：** 这点和 JavaScript 不一样（JS 里 `0`、`""` 都是假值），从 JS 转过来的同学特别容易踩。

### 三、@each 遍历

#### 1. 遍历列表

`@each <变量> in <列表> { ... }`，常用于批量生成工具类：

```scss
$sizes: 40px, 50px, 80px;

@each $size in $sizes {
  .icon-#{$size} {
    font-size: $size;
    width: $size;
    height: $size;
  }
}
```

```css
.icon-40px { font-size: 40px; width: 40px; height: 40px; }
.icon-50px { font-size: 50px; width: 50px; height: 50px; }
.icon-80px { font-size: 80px; width: 80px; height: 80px; }
```

#### 2. 遍历映射（map）

`@each <键变量>, <值变量> in <map>`，主题色批量生成的标准写法：

```scss
$icons: ("eye": "\f112", "start": "\f12e", "stop": "\f12f");

@each $name, $glyph in $icons {
  .icon-#{$name}:before {
    font-family: "Icon Font";
    content: $glyph;
  }
}
```

```css
.icon-eye:before { font-family: "Icon Font"; content: "\f112"; }
.icon-start:before { font-family: "Icon Font"; content: "\f12e"; }
.icon-stop:before { font-family: "Icon Font"; content: "\f12f"; }
```

#### 3. 解构嵌套列表

列表的列表可以一次解构多个变量：

```scss
$icons:
  "eye" "\f112" 12px,
  "start" "\f12e" 16px,
  "stop" "\f12f" 10px;

@each $name, $glyph, $size in $icons { // 按位置解构
  .icon-#{$name}:before {
    content: $glyph;
    font-size: $size; // 内层列表不够长时对应变量为 null
  }
}
```

> 💡 **提示：** map 之所以能用 `@each $k, $v` 遍历，是因为**每个 map 本质上也是列表**（每个键值对是一个二元素子列表）。

### 四、@for 计数循环

两种写法的区别只在结尾是否包含：

| 写法 | 范围 | 类比 JS |
| --- | --- | --- |
| `@for $i from 1 to 4` | 1、2、3（**不含** 4） | `i < 4` |
| `@for $i from 1 through 4` | 1、2、3、4（**含** 4） | `i <= 4` |

```scss
@use "sass:color";

@for $i from 1 through 3 {
  ul:nth-child(3n + #{$i}) {
    background-color: color.adjust(#036, $lightness: $i * 5%); // 现代颜色函数写法
  }
}
```

- 起止数可以是任意表达式（变量、函数调用均可）
- **倒序循环**也支持：`@for $i from 3 through 1` 会得到 3、2、1

```scss
// 生成 12 列栅格系统（@use "sass:math" 后）
@for $i from 1 through 12 {
  .col-#{$i} {
    width: math.div(100%, 12) * $i;
  }
}
```

### 五、@while 条件循环

先判断条件，为真就一直执行。**必须在循环体内改变条件变量**，否则死循环：

```scss
$columns: 4;
$col-width: 20px;

@while $columns > 0 {
  .grid-#{$columns} {
    width: $col-width * $columns;
  }
  $columns: $columns - 1; // ⚠️ 忘了这行就死循环了
}
```

```css
.grid-4 { width: 80px; }
.grid-3 { width: 60px; }
.grid-2 { width: 40px; }
.grid-1 { width: 20px; }
```

> ⚠️ **注意：** `@while` 灵活但风险高（死循环），能用 `@for`/`@each` 表达的场景优先用它们。

### 六、配合调试指令

控制指令常和三个调试指令搭配（详见官方文档 [@debug](https://sass-lang.com/documentation/at-rules/debug/)、[@warn](https://sass-lang.com/documentation/at-rules/warn/)、[@error](https://sass-lang.com/documentation/at-rules/error/)）：

```scss
@use "sass:list";
@use "sass:math";

// @debug：打印值，编译继续（开发调试用）
@debug math.div(10, 3); // 3.3333333333

// @warn：打印警告，编译继续（提示用户用法问题）
@mixin triangle($size, $direction) {
  @if not list.index(up right down left, $direction) {
    @warn "direction 必须是 up/right/down/left，当前是 #{$direction}";
  }
}

// @error：直接终止编译（参数非法时快速失败）
@mixin triangle($size, $direction) {
  @if not list.index(up right down left, $direction) {
    @error "Invalid direction: #{$direction}"; // 编译到此中断
  }
}
```

### 七、流程控制中的作用域（易错点重申）

- 在 `@if`/`@each` 等块内给**已存在**的外层变量赋值 → 直接修改外层变量（不遮蔽）
- 在块内**新建**的变量 → 出块即不可见

```scss
$pos: 1;

@each $item in a b c {
  $pos: $pos + 1; // 修改的是外层的 $pos
}
@debug $pos; // 4

@each $item in a b {
  $inner: $item; // 新变量
}
// @debug $inner; // ❌ 报错：出块不可见
```

### 八、实际应用场景

```scss
// 场景一：主题色工具类（@each + map）
$theme-colors: (
  "primary": #409eff,
  "success": #67c23a,
  "warning": #e6a23c,
  "danger": #f56c6c,
);

@each $name, $color in $theme-colors {
  .text-#{$name} { color: $color; }
  .bg-#{$name} { background-color: $color; }
  .border-#{$name} { border-color: $color; }
}
```

```scss
// 场景二：层级阴影（@for）
@for $i from 1 through 3 {
  .elevation-#{$i} {
    box-shadow: 0 ($i * 2px) ($i * 4px) rgba(0, 0, 0, 0.1 * $i);
  }
}
```

```scss
// 场景三：设备适配（@if + mixin）
$device: mobile;

.container {
  @if $device == mobile {
    padding: 12px;
  } @else if $device == tablet {
    padding: 24px;
  } @else {
    padding: 40px;
  }
}
```

### 九、常见问题与注意事项

1. **`@while` 死循环**：忘了更新条件变量会让编译器卡死。
2. **控制指令生成了太多 CSS**：`@for $i from 1 through 100` 生成 100 条规则是瞬间的事，注意产物体积。可以问自己：这个循环能不能换成 CSS 变量 + 原生 CSS 实现？
3. **`0` 是真值**：条件判断别照搬 JS 直觉。
4. **不要在 `@if` 里用 `==` 比较不同单位**：`10px == 10` 为 `false`（单位不同即不同值）。
5. 循环变量名建议用 `$i`、`$item`、`$name` 这类约定俗成的短名，避免和业务变量混淆。

### 十、总结

- `@if/@else` 条件输出、`@each` 遍历列表/map（支持解构）、`@for` 计数（`to` 不含尾、`through` 含尾）、`@while` 条件循环
- 只有 `false` 和 `null` 是假值，`0`、空串都是真值
- 控制块内赋值已有变量 = 修改外层；新建变量出块失效
- 配合 `@debug/@warn/@error` 调试，配合 map 批量生成工具类是最常见的实战组合
