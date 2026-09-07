# SCSS 映射（Map）

> 📖 官方文档：[Sass Maps](https://sass-lang.com/documentation/values/maps/)
>
> 📖 官方文档：[sass:map 模块](https://sass-lang.com/documentation/modules/map/)

### 一、概述

**Map（映射）是键值对的集合**，相当于 JavaScript 的对象/Map。它不能直接输出为 CSS（不是合法 CSS 值），主要用于**在编译期组织配置数据**（主题色表、断点表、字重表），再配合 `@each`、`map.get()` 等批量生成样式。

```scss
// 语法：(键: 值, 键: 值)，必须带括号
$font-weights: ("regular": 400, "medium": 500, "bold": 700);
```

一句话理解它的定位：**变量存"一个值"，map 存"一张表"**。

### 二、基本语法与规则

```scss
$theme-colors: (
  "primary": #409eff,
  "success": #67c23a,
  "warning": #e6a23c,
);

$breakpoints: (
  "sm": 640px,
  "md": 960px,
);
```

语法规则：

1. 必须用**圆括号**包起来，键值对用逗号分隔（最后一个的逗号可省可留）
2. **键必须唯一**，值可以重复
3. **键可以是任意 Sass 值**（字符串、数字甚至颜色），用 `==` 判断键是否相同
4. 空 map 写作 `()`
5. 允许尾随逗号

> ⚠️ **注意：** 官方建议键用**带引号的字符串**。像 `red` 这种写法看着是字符串，实际是颜色类型，用作键容易出诡异问题。

> 💡 **提示：** 每个 map 同时也是一个 list（每个键值对是一个二元素子列表），所以 `@each $a, $b in $map` 能直接解构遍历，list 系函数也能用。

### 三、map 常用操作（sass:map 模块）

使用 map 函数前需要引入模块：

```scss
@use "sass:map";
```

#### 1. `map.get($map, $key)` —— 取值

```scss
@use "sass:map";

$font-weights: ("regular": 400, "medium": 500, "bold": 700);

@debug map.get($font-weights, "medium");     // 500
@debug map.get($font-weights, "extra-bold"); // null（键不存在返回 null，不报错）
```

> ⚠️ **注意：** 旧代码常见的 `map-get()`（全局函数写法）是模块系统之前的写法，官方已不推荐，新代码统一用 `map.get()`。

#### 2. `map.has-key($map, $key)` —— 判断键是否存在

```scss
@use "sass:map";

@debug map.has-key($font-weights, "bold");   // true
@debug map.has-key($font-weights, "black");  // false
```

#### 3. `map.set($map, $key, $value)` —— 返回新增/修改后的**新 map**

```scss
@use "sass:map";

@debug map.set($font-weights, "extra-bold", 900);
// ("regular": 400, "medium": 500, "bold": 700, "extra-bold": 900)

@debug map.set($font-weights, "bold", 900);
// ("regular": 400, "medium": 500, "bold": 900)  // 覆盖已有键
```

#### 4. `map.merge($map1, $map2)` —— 合并两个 map

```scss
@use "sass:map";

$light-weights: ("lightest": 100, "light": 300);
$heavy-weights: ("medium": 500, "bold": 700);

@debug map.merge($light-weights, $heavy-weights);
// ("lightest": 100, "light": 300, "medium": 500, "bold": 700)
```

键冲突时**后者覆盖前者**：

```scss
@use "sass:map";

$weights: ("light": 300, "medium": 500);
@debug map.merge($weights, ("medium": 700));
// ("light": 300, "medium": 700)
```

#### 5. `map.remove($map, $keys...)` —— 删除键

```scss
@use "sass:map";

@debug map.remove($font-weights, "regular");
// ("medium": 500, "bold": 700)
```

#### 6. `map.keys()` / `map.values()` —— 取所有键/值（各返回一个 list）

```scss
@use "sass:map";

@debug map.keys($font-weights);  // "regular", "medium", "bold"
@debug map.values($font-weights); // 400, 500, 700
```

#### 7. 嵌套 map 深度操作

```scss
@use "sass:map";

$fonts: (
  "Helvetica": (
    "weights": ("regular": 400, "bold": 700),
  ),
);

// 深取值
@debug map.deep-get($fonts, "Helvetica", "weights", "regular"); // 400

// 深合并（递归合并嵌套 map）
@debug map.deep-merge($map1, $map2);

// 深删除
@debug map.deep-remove($fonts, "Helvetica", "weights", "regular");
```

### 四、map 是不可变的（immutable）

**所有 map 函数都返回新 map，绝不修改原 map**：

```scss
@use "sass:map";

$prefixes: ("firefox": moz, "safari": webkit);

@mixin add-browser-prefix($browser, $prefix) {
  // 必须 !global 重新赋值回去，原 map 才算被"更新"
  $prefixes: map.merge($prefixes, ($browser: $prefix)) !global;
}

@include add-browser-prefix("opera", o);

@debug $prefixes;
// ("firefox": moz, "safari": webkit, "opera": o)
```

> 💡 **提示：** 想"修改"map 只有一条路——把函数返回的新 map **赋值回变量**（全局的加 `!global`）。

### 五、遍历 map：@each

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

### 六、实际应用场景

#### 1. 主题色系统（最常见）

```scss
@use "sass:map";

$theme-colors: (
  "primary": #409eff,
  "success": #67c23a,
  "warning": #e6a23c,
  "danger": #f56c6c,
);

// 批量生成工具类
@each $name, $color in $theme-colors {
  .text-#{$name} { color: $color; }
  .bg-#{$name} { background-color: $color; }
}

// 单独取用
.button {
  background-color: map.get($theme-colors, "primary");
}
```

#### 2. 响应式断点管理

```scss
@use "sass:map";

$breakpoints: (
  "sm": 640px,
  "md": 960px,
  "lg": 1280px,
) !default;

@mixin respond-to($bp) {
  @if not map.has-key($breakpoints, $bp) {
    @error "No breakpoint named #{$bp}."; // 传错名字快速失败
  }
  @media (min-width: map.get($breakpoints, $bp)) {
    @content;
  }
}

.container {
  @include respond-to("md") {
    width: 960px;
  }
}
```

#### 3. z-index 层级管理

```scss
@use "sass:map";

$z-index: (
  "dropdown": 100,
  "sticky": 200,
  "overlay": 300,
  "modal": 400,
);

.modal { z-index: map.get($z-index, "modal"); } // z-index: 400
```

#### 4. 嵌套 map 组织整套配置

```scss
@use "sass:map";

$config: (
  "colors": (
    "primary": #409eff,
    "text": #333,
  ),
  "spacing": (
    "sm": 8px,
    "md": 16px,
  ),
);

.card {
  color: map.get($config, "colors", "text"); // map.get 支持多级取值
  padding: map.get($config, "spacing", "md");
}
```

> 💡 **提示：** `map.get($map, $k1, $k2, ...)` 支持多键深取（等价 `map.deep-get`），嵌套配置取值很方便。

### 七、常见问题与注意事项

1. **map 不能直接当属性值**：`.a { color: $map; }` ❌——编译器不知道怎么输出。map 只是编译期数据结构，最终一定要用 `map.get` 取出具体值。
2. **键不存在时 `map.get` 返回 `null` 而不报错**：属性值会是 `null`（该属性不输出），错误可能被悄悄吞掉。对"必须存在"的键，先用 `map.has-key` 校验并 `@error`。
3. **不要用插值动态拼变量名**，官方替代方案就是 map：`map.get($theme-colors, $name)`。
4. **合并配置的套路**：默认配置放前、用户配置放后，`map.merge($defaults, $user-config)` 实现覆盖。
5. **键的类型陷阱**：`("red": 1)` 的键是**颜色**不是字符串，`map.get($map, "red")` 取不到它。键统一加引号最稳。

### 八、总结

- map = 编译期键值表，键唯一、建议用带引号字符串、本身也是 list
- 核心函数：`map.get` / `map.set` / `map.merge` / `map.has-key` / `map.keys` / `map.values`，嵌套用 `deep-*` 系列
- map 不可变，"修改"就是重新赋值
- 三大实战场景：主题色批量生成、断点管理、配置聚合——配 `@each` 和 `!default` 食用最佳
