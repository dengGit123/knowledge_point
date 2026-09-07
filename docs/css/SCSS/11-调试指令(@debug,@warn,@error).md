# SCSS 调试指令（@debug、@warn、@error）

> 📖 官方文档：[Sass @debug](https://sass-lang.com/documentation/at-rules/debug/)
>
> 📖 官方文档：[Sass @warn](https://sass-lang.com/documentation/at-rules/warn/)
>
> 📖 官方文档：[Sass @error](https://sass-lang.com/documentation/at-rules/error/)

### 一、概述

SCSS 写到一定复杂度（大量变量、函数、循环）后，"样式为什么是这个值"会变得难以排查。官方提供三个调试指令，分别对应三种严重程度：

| 指令 | 作用 | 编译是否继续 | 类比 JS |
| --- | --- | --- | --- |
| `@debug` | 打印值，纯查看 | ✅ 继续 | `console.log` |
| `@warn` | 打印警告信息 | ✅ 继续 | `console.warn` |
| `@error` | 抛出错误 | ❌ **终止编译** | `throw new Error` |

输出位置：编译器终端（命令行 `sass` 命令、Vite/Webpack 的构建控制台）。

### 二、@debug：查看值

`@debug <表达式>` 把表达式的值打印到控制台，常用于检查变量计算：

```scss
@use "sass:map";
@use "sass:math";
@use "sass:meta";

$font-weights: ("regular": 400, "medium": 500, "bold": 700);

@debug 10px + 32px;          // 控制台：main.scss:1 DEBUG: 42px
@debug math.div(10, 3);      // DEBUG: 3.3333333333
@debug map.get($font-weights, "medium"); // DEBUG: 500
@debug "wide" in "hello";    // DEBUG: false
@debug meta.type-of(16px);   // DEBUG: number
```

调试 map/list 这类无法直接输出为 CSS 的复合值时，`@debug` 是唯一直观的手段：

```scss
$theme: ("primary": #409eff, "danger": #f56c6c);
@debug $theme; // DEBUG: ("primary": #409eff, "danger": #f56c6c)
```

> 💡 **提示：** `@debug` 每次都会输出（不像 `@warn` 可能被静默）。临时调试完记得删除，不要留在提交的代码里。

### 三、@warn：提示但不阻断

`@warn <消息>` 打印警告，编译继续。典型用途：**提示用法可能有问题**（传参不规范、走入了兜底分支、特性已废弃）：

```scss
@use "sass:list";

// 库作者提醒用户传参检查
@mixin triangle($size, $direction) {
  @if not list.index(up right down left, $direction) {
    @warn "triangle(): direction 应为 up/right/down/left，当前传入 #{$direction}，已回退为 up。";
  }
  // ... 继续生成样式
}
```

```scss
// 提示废弃用法
@mixin btn($args...) {
  @warn "btn() 已废弃，请改用 button()。";
  @include button($args...); // 兼容旧调用，但给出提示
}
```

特点：

- 警告信息会**带样式表文件名和行号**
- 用户可以通过命令行选项（如 `--quiet`）或构建配置**关闭警告**
- `@warn` 只能接收**字符串消息**（不能像 `@debug` 那样直接打印任意值），通常配合插值：`@warn "当前值：#{$value}"`

### 四、@error：直接终止编译

`@error <消息>` 抛出错误，**编译立即中断**——错误样式不会产出 CSS。适合"参数非法时快速失败"，把问题拦在构建阶段而不是留给浏览器：

```scss
@use "sass:map";

$breakpoints: ("sm": 640px, "md": 960px);

@mixin respond-to($bp) {
  @if not map.has-key($breakpoints, $bp) {
    // 传了不存在的断点名，立即报错并终止
    @error "未知的断点名称 `#{$bp}`，可选值：#{map.keys($breakpoints)}";
  }
  @media (min-width: map.get($breakpoints, $bp)) {
    @content;
  }
}

@include respond-to("lg"); // ❌ 编译终止：未知的断点名称 "lg"，可选值："sm", "md"
```

函数里做参数校验同样是标配写法：

```scss
@use "sass:math";
@use "sass:meta";

@function strip-unit($value) {
  @if meta.type-of($value) != "number" {
    @error "strip-unit() 需要 number 类型参数，收到 #{meta.type-of($value)}";
  }
  @return math.div($value, $value * 0 + 1); // 去单位的老技巧
}
```

> ⚠️ **注意：** `@error` 会**阻断整个编译**，适合"绝不该发生的情况"；只是"可能有问题"的场景用 `@warn`，别让使用者构建失败。

### 五、三者怎么选

```
收到参数 → 合法吗？
   │
   ├─ 不合法，必须拦截 ──────▶ @error（终止编译，构建期暴露问题）
   │
   ├─ 不规范，但有兜底 ──────▶ @warn（提示 + 继续）
   │
   └─ 只是想看看中间值 ──────▶ @debug（开发期临时打印）
```

### 六、配套工具：meta 模块的检查函数

调试指令常搭配 `sass:meta` 的存在性检查函数使用：

```scss
@use "sass:meta";

// 检查变量/函数/mixin 是否存在
@debug meta.variable-exists($name: "primary");       // 当前作用域是否有 $primary
@debug meta.global-variable-exists($name: "primary"); // 全局是否有
@debug meta.function-exists("darken");                // 函数是否存在
@debug meta.mixin-exists("flex-center");              // mixin 是否存在

// 万能值查看器：任何值转字符串
@debug meta.inspect($theme); // 调试复合值
```

> 💡 **提示：** `meta.variable-exists("name")` 传的是**不带 `$` 的名字字符串**。

### 七、实际应用场景

```scss
// 场景一：设计 token 取值器（error 兜底）
@use "sass:map";

$spacing: ("sm": 8px, "md": 16px, "lg": 32px);

@function spacing($key) {
  @if not map.has-key($spacing, $key) {
    @error "spacing(): 不存在的间距 `#{$key}`，可用：#{map.keys($spacing)}";
  }
  @return map.get($spacing, $key);
}

.card { padding: spacing("md"); }  // ✅ 16px
.card { padding: spacing("xxl"); } // ❌ 编译报错，及时发现问题
```

```scss
// 场景二：调试循环生成过程
@use "sass:math";

@for $i from 1 through 3 {
  @debug "生成 col-#{$i}，宽度 #{math.div(100%, 12) * $i}"; // 观察每轮计算
  .col-#{$i} { width: math.div(100%, 12) * $i; }
}
```

```scss
// 场景三：库的废弃提示（warn）
$-old-theme-map: null;

@mixin old-deprecated-mixin {
  @warn "old-deprecated-mixin 将在 2.0 移除，请迁移到 new-mixin";
  @include new-mixin;
}
```

### 八、常见问题与注意事项

1. **看不到输出？** 用 Vite/Webpack 时调试信息打印在**构建终端**而不是浏览器控制台——SCSS 是编译期的东西，别去浏览器里找。
2. **`@warn` 消息必须是字符串**，打印值要先插值；`@debug` 什么类型都能打。
3. **`@error` 之后的代码不会执行**，整个编译产物都不会生成——不要在"可恢复"的场景滥用。
4. **行号信息**：警告/错误会带 `文件:行号`，顺着找即可；如果经过 mixin 层层嵌套，报错位置是**触发处**而非定义处。
5. 调试完成后清理 `@debug`，长期保留的只应是 `@warn`/`@error` 这类"给使用者看"的信息。

### 九、总结

- `@debug` 打印任意值（console.log）、`@warn` 字符串警告不阻断（console.warn）、`@error` 终止编译（throw）
- 库作者三件套：入口校验用 `@error`、废弃提示用 `@warn`、开发排查用 `@debug`
- 搭配 `map.has-key` + `@error` 实现"传错 key 就构建失败"，把错误拦在上线前
