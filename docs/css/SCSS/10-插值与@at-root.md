# SCSS 插值 `#{}` 与 @at-root

> 📖 官方文档：[Sass Interpolation](https://sass-lang.com/documentation/interpolation/)
>
> 📖 官方文档：[Sass @at-root](https://sass-lang.com/documentation/at-rules/at-root/)

### 一、概述

- **插值 `#{}`**：把 SassScript 表达式的结果"嵌入"到选择器、属性名、字符串等位置——它是 SCSS 里的"模板字符串"
- **`@at-root`**：让嵌套的样式"逃出"外层选择器，直接输出到样式表根部

这两个特性常一起出现在"动态生成选择器"的高级场景中。

### 二、插值 `#{}`

#### 1. 能用在哪

插值几乎可以出现在样式表的任何位置：

```scss
// ① 选择器
@mixin corner-icon($name) {
  .icon-#{$name} {
    background-image: url("/icons/#{$name}.svg"); // ② 字符串/url 里
    position: absolute;
  }
}
@include corner-icon("mail"); // → .icon-mail { background-image: url("/icons/mail.svg") ... }

// ③ 属性名
@mixin prefix($property, $value, $prefixes) {
  @each $prefix in $prefixes {
    -#{$prefix}-#{$property}: $value; // → -moz-filter / -webkit-filter
  }
  #{$property}: $value;
}
@include prefix(filter, grayscale(50%), moz webkit);

// ④ CSS 自定义属性的值（唯一注入动态值的方式）
:root {
  --primary: #{$primary};
}

// ⑤ @media、@extend、注释等位置也支持
```

#### 2. 插值返回的是"无引号字符串"

`#{}` 的结果永远是**无引号字符串**，引号字符串插值后引号会被去掉：

```scss
.example {
  unquoted: #{"string"}; // 输出 string（引号没了）
}
```

想显式转换引号，用 `string.unquote()` / `string.quote()` 更清晰。

#### 3. 最大的坑：不要对数字用插值

```scss
// ❌ 反面教材：结果是字符串 "16px"，不是数字！
$num: 16;
$value: #{$num}px;

// 字符串不能参与数学运算
// width: $value * 2; ❌ 报错

// ✅ 正确做法：让变量本身带单位，或用乘法补单位
$num: 16;
$value: $num * 1px;   // 数字 16px，可继续运算
```

官方明确建议：**插值几乎不需要用在属性值上**。`color: #{$accent}` 完全可以写成 `color: $accent`；带单位的计算用单位算术而不是字符串拼接。

#### 4. 自定义属性中的插值（重要）

CSS 自定义属性的值在 SCSS 中**默认按纯文本处理**（因为它的值可能是任何东西、可能被 JS 读取），**插值是唯一的动态注入方式**：

```scss
$primary: #81899b;

:root {
  --primary: #{$primary};  // ✅ 注入 #81899b
  --raw: $primary;         // 原样输出字符串 "$primary"（不会求值）
}
```

插值会去掉字符串引号，想给自定义属性传"带引号的字体列表"，用 `meta.inspect()` 保留引号：

```scss
@use "sass:meta";

$font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;

:root {
  --font-family: #{meta.inspect($font-family)};
  // 输出 --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto（引号保留）
}
```

### 三、@at-root

#### 1. 基本用法：跳出嵌套

`@at-root <选择器> { ... }` 让块内样式输出到**文档根部**，不带外层选择器前缀：

```scss
.wrapper {
  color: red;

  @at-root .escaped {
    color: blue; // 输出为 .escaped，而不是 .wrapper .escaped
  }
}
```

```css
.wrapper { color: red; }
.escaped { color: blue; } /* 没有 .wrapper 前缀 */
```

也可以不带选择器，包一组规则：`@at-root { .a { } .b { } }`。

#### 2. 经典场景：配合 `&` 和选择器函数

嵌套内用插值生成的选择器，Sass 依然会自动加上外层前缀——想生成"干净"的选择器必须用 `@at-root`：

```scss
@use "sass:selector";

// 目标：把 .wrapper .field 变成 .wrapper input.field（元素与类组合）
@mixin unify-parent($child) {
  @at-root #{selector.unify(&, $child)} {
    @content;
  }
}

.wrapper .field {
  @include unify-parent("input") { border: 1px solid; }
  @include unify-parent("select") { border: 2px solid; }
}
```

```css
.wrapper input.field { border: 1px solid; }
.wrapper select.field { border: 2px solid; }
```

#### 3. 控制保留哪些规则：`with` / `without`

默认 `@at-root` 只跳出**样式规则**，`@media` 等环绕的 at-rule 仍会保留。用 `(without: ...)` / `(with: ...)` 精确控制：

```scss
@media print {
  .page {
    width: 8in;

    @at-root (without: media) {
      color: #111;   // 跳出 @media，输出在根部
    }

    @at-root (with: rule) {
      font-size: 1.2em; // 只保留样式规则、跳出所有 at-rule
    }
  }
}
```

```css
@media print {
  .page { width: 8in; }
}
.page { color: #111; }
.page { font-size: 1.2em; }
```

两个特殊值：

| 值 | 含义 |
| --- | --- |
| `rule` | 样式规则 |
| `all` | 所有规则和 at-rule（`without: all` = 输出到最根部） |

```scss
// 常用：跳出 @media 和样式规则
@at-root (without: all) { ... }
```

#### 4. 实用场景：嵌套中的 keyframes

在组件嵌套里写 `@keyframes`，用它跳出（虽然 `@keyframes` 本身就会输出在根部，但配合动态命名时更直观）：

```scss
@use "sass:string";

@mixin inline-animation($duration) {
  $name: inline-#{string.unique-id()}; // 动态唯一名
  @at-root @keyframes #{$name} {
    @content;
  }
  animation: $name $duration infinite;
}

.pulse {
  @include inline-animation(2s) {
    from { background-color: yellow; }
    to { background-color: red; }
  }
}
```

### 四、常见问题与注意事项

1. **插值 ≠ 变量使用**：属性值里直接写 `$var` 即可，`#{$var}` 反而把它变成字符串。插值只在"语法位置"（选择器、属性名、自定义属性值、字符串内）需要。
2. **插值结果失去类型**：数字、颜色经插值都变字符串，失去运算能力。
3. **`@at-root` 不影响 `&`**：跳出后 `&` 表达式依然能取到原父选择器，只是输出不带前缀。
4. **`without: media` vs `without: all`**：前者只剥离 `@media`，后者连 `@supports` 等所有 at-rule 一起剥。
5. **选择器插值与解析顺序**：Sass 先解析插值再解析选择器，所以插值生成任意选择器片段都是安全的。

### 五、总结

- `#{}` 用在选择器、属性名、自定义属性值、字符串拼接；**属性值直接用变量，别套插值**
- 数字拼接单位是插值的重灾区，改用 `$num * 1px` 或带单位的变量
- `@at-root` 跳出嵌套输出到根部；`(without: media/rule/all)` 控制剥离范围
- 插值 + `&` + `selector` 函数 + `@at-root` = 动态选择器生成的四件套
