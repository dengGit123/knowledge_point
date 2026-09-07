# SCSS 模块化（@use、@forward 与 @import）

> 📖 官方文档：[Sass @use](https://sass-lang.com/documentation/at-rules/use/)
>
> 📖 官方文档：[Sass @forward](https://sass-lang.com/documentation/at-rules/forward/)
>
> 📖 官方文档：[Sass @import（已废弃）](https://sass-lang.com/documentation/at-rules/import/)

### 一、概述

样式表越写越大，必然要拆文件：变量一个文件、混入一个文件、各组件各一个文件。SCSS 的模块系统（`@use` + `@forward`）就是官方的拆分方案——**基于命名空间、每个文件只加载一次**。

> ⚠️ **注意：** 老项目里大量使用的 `@import` **从 Dart Sass 1.80.0 起已正式废弃**，将在 Dart Sass 3.0 移除。新代码一律用 `@use`。

### 二、文件拆分约定

| 概念 | 约定 | 说明 |
| --- | --- | --- |
| Partial（部分文件） | 文件名以 `_` 开头，如 `_variables.scss` | 只用于被引入、不单独编译成 CSS |
| 引入时 | 可省略 `_` 和扩展名 | `@use "variables"` 即引入 `_variables.scss` |
| Index 文件 | 目录下放 `_index.scss` | 引入目录名时自动加载它 |
| 路径分隔 | 一律用 `/`（正斜杠） | Sass 按 URL 加载文件，即使在 Windows 也不写 `\` |

典型目录结构：

```
styles/
├── _variables.scss      # 变量
├── _mixins.scss         # 混入
├── foundation/
│   ├── _code.scss
│   ├── _lists.scss
│   └── _index.scss      # @use 'code'; @use 'lists';
├── components/
│   ├── _button.scss
│   └── _card.scss
└── main.scss            # 入口：只做引入和组装
```

### 三、@use 基础

#### 1. 基本用法

```scss
// foundation/_code.scss
code {
  padding: 0.25em;
  line-height: 0;
}

// style.scss
@use 'foundation/code'; // 该文件的 CSS 被引入
@use 'foundation/lists';
```

要点：

- `@use` 必须写在**文件顶部**（任何样式规则之前；`@forward` 和用于配置的变量声明除外）
- 每条 `@use` 只能有一个 URL，**URL 必须加引号**
- 同一个模块无论被多少文件 `@use`，**只加载一次**，CSS 不会重复输出
- 被加载的文件称为**模块（module）**

#### 2. 命名空间访问成员

通过 `@use` 引入的变量、函数、mixin **不会进入全局**，必须通过 `命名空间.成员名` 访问。默认命名空间 = URL 最后一段：

```scss
// src/_corners.scss
$radius: 3px;
@mixin rounded {
  border-radius: $radius;
}

// style.scss
@use "src/corners";

.button {
  @include corners.rounded;      // mixin 用 命名空间.名字
  padding: 5px + corners.$radius; // 变量用 命名空间.$名字
}
```

> 💡 **提示：** 正因为有了命名空间隔离，模块内部可以放心用 `$radius`、`$width` 这类简单名字，不必像 `@import` 时代那样写 `$mat-corner-radius` 防撞名。

#### 3. 自定义命名空间 `as`

```scss
@use "src/corners" as c;

.button {
  @include c.rounded;
  padding: 5px + c.$radius;
}
```

#### 4. 无命名空间 `as *`（慎用）

```scss
@use "src/corners" as *;

.button {
  @include rounded;   // 直接用名字
  padding: 5px + $radius;
}
```

> ⚠️ **注意：** `as *` 会把成员放进当前文件的全局作用域，容易撞名。官方建议**只对自己写的文件**这么用。

#### 5. 私有成员

变量、函数、mixin 名以 `-` 或 `_` 开头即为**私有**，定义它的模块外不可见：

```scss
// src/_corners.scss
$-radius: 3px;            // 私有变量
@mixin rounded {
  border-radius: $-radius; // 模块内部正常使用
}

// style.scss
@use "src/corners";
.button {
  @include corners.rounded;    // ✅
  padding: corners.$-radius;   // ❌ 报错：私有成员不可访问
}
```

#### 6. 模块成员只对本文件可见

A 文件 `@use` 了 B，**不代表** A 的使用者能看到 B 的成员。想"集中转发"就用 `@forward`（见下文）。

### 四、@use 的配置：`with`

被引入模块中带 `!default` 的**顶层变量**可以在引入时配置：

```scss
// _library.scss
$black: #000 !default;
$border-radius: 0.25rem !default;
$box-shadow: 0 0.5rem 1rem rgba($black, 0.15) !default;

code {
  border-radius: $border-radius;
  box-shadow: $box-shadow;
}
```

```scss
// style.scss
@use 'library' with (
  $black: #222,
  $border-radius: 0.1rem
);
```

```css
/* 编译结果：默认值被覆盖 */
code {
  border-radius: 0.1rem;
  box-shadow: 0 0.5rem 1rem rgba(34, 34, 34, 0.15);
}
```

规则：

- `with` **只能作用于第一次加载该模块的那条 `@use`**——模块配置全局只有一份
- 同时用 `as` 和 `with` 时顺序固定：`@use ... as ... with ...`
- 只能配置模块**顶层的 `!default` 变量**

> 💡 **提示：** 官方还提供了更灵活的"mixin 配置"模式（库暴露 `configure()` 和 `styles()` 两个 mixin），适合复杂场景，详见官方文档 [Configuring Modules With Mixins](https://sass-lang.com/documentation/at-rules/use/#with-mixins)。

#### 加载后修改变量

```scss
// _override.scss
@use 'library';
library.$color: blue; // 给模块变量重新赋值

// 注意：内置模块的变量（如 math.$pi）不能赋值
```

### 五、@forward 转发

`@forward` 加载模块并把它的成员**继续暴露给下游**，自己却用不了（要用得再写一条 `@use`）。它是"门面文件/统一出口"的标准工具：

```scss
// src/_list.scss
@mixin list-reset {
  margin: 0;
  padding: 0;
  list-style: none;
}

// bootstrap.scss —— 门面（入口）
@forward "src/list";

// styles.scss —— 用户只需要引入门面
@use "bootstrap";

li {
  @include bootstrap.list-reset; // 像定义在 bootstrap 里一样使用
}
```

> 💡 **提示：** 同一文件对同一模块既 `@forward` 又 `@use` 时，**`@forward` 写在前面**——这样下游通过你配置后，你的 `@use` 才能拿到配置后的值。模块只会加载一次，不会重复。

#### 1. 加前缀 `as prefix-*`

给转发的成员统一加前缀，避免命名冲突：

```scss
// bootstrap.scss
@forward "src/list" as list-*;

// 下游使用：list-reset
li {
  @include bootstrap.list-reset;
}
```

#### 2. 控制可见性 `show` / `hide`

```scss
// 只转发指定成员（$ 要带上）
@forward "src/list" show list-reset, $horizontal-list-gap;

// 转发除指定成员外的所有成员
@forward "src/list" hide list-reset, $horizontal-list-gap;
```

#### 3. 转发时配置

`@forward ... with (...)` 与 `@use ... with` 类似，且配置值可加 `!default`——表示"我改默认值，但下游仍可覆盖"：

```scss
// _opinionated.scss
@forward 'library' with (
  $black: #222 !default,
  $border-radius: 0.1rem !default
);

// style.scss
@use 'opinionated' with ($black: #333); // 下游覆盖 $black，$border-radius 用 0.1rem
```

### 六、@import（旧方案，了解即可）

`@import` 是模块系统之前的引入方式，**语义完全不同**：

```scss
@import 'foundation/code', 'foundation/lists'; // 逗号分隔多个，且已废弃
```

`@use` vs `@import` 关键差异：

| 对比项 | `@use` | `@import` |
| --- | --- | --- |
| 成员作用域 | 仅当前文件可见，带命名空间 | **全部注入全局**，来源难追踪 |
| 重复加载 | 只加载一次 | **每次 import 都执行一次**，CSS 重复 |
| 书写位置 | 必须在文件顶部 | 可以嵌套在选择器、媒体查询里 |
| 私有成员 | `-`/`_` 前缀支持 | 无私有概念，全暴露 |
| 状态 | ✅ 官方推荐 | ⚠️ Dart Sass 1.80.0 起废弃，3.0 移除 |

老项目迁移可直接使用官方迁移工具：

```bash
sass-migrator module --migrate-deps ./styles/main.scss
```

### 七、实战：一套完整的模块化结构

```
styles/
├── _variables.scss     # 设计 token
├── _mixins.scss        # 通用 mixin
├── _functions.scss     # 通用函数
├── components/
│   ├── _index.scss     # @forward 'button'; @forward 'card';
│   ├── _button.scss
│   └── _card.scss
└── main.scss
```

```scss
// _variables.scss
$primary: #409eff !default;
$breakpoints: ("sm": 640px, "md": 960px) !default;
```

```scss
// components/_button.scss
@use "../variables" as var; // as var 起个短命名空间

.button {
  background: var.$primary;
}
```

```scss
// components/_index.scss
@forward "button";
@forward "card";
```

```scss
// main.scss —— 入口
@use "variables";
@use "mixins" as *;      // 高频 mixin 直接进全局
@use "components";        // 一条引入全部组件

// 页面级样式
.page {
  @include respond-to("md") {
    max-width: 960px;
  }
}
```

在 Vite/Vue 项目中还可以通过 `additionalData` 让变量文件自动注入每个 SCSS 文件（见 [01-SCSS基础与安装使用](./01-SCSS基础与安装使用.md)），避免每个文件手写 `@use`。

### 八、常见问题与注意事项

1. **`@use` 必须在最前面**：写在样式规则后面会直接报错（`@forward` 除外）。
2. **循环依赖会报错**：A `@use` B、B 又 `@use` A 不被允许，公共依赖抽到第三个文件。
3. **URL 大小写敏感**：`@use "Styles"` 和 `@use "styles"` 是两个模块（即使文件系统不区分大小写），会导致重复加载且在其他系统上出错。保持 URL 与实际文件名大小写一致。
4. **加载 `.css` 文件**：`@use 'code'` 可以引入 `code.css`，但它被当作纯 CSS——里面写任何 Sass 语法都会报错，也不能暴露变量/mixin。
5. **`pkg:` URL**：`@use "pkg:library"` 用于加载 npm 包分发的 Sass 库（需较新的 Dart Sass 与导入器支持），详见官方文档。
6. **`with` 只对第一次加载生效**：同一模块被多个文件加载时，只有第一个文件的 `with` 配置有效，其余会报错。

### 九、总结

- 拆分文件用 `_partial` 约定，入口组装用 `@use`
- `@use` = 命名空间 + 单次加载 + 私有成员；`as` 改名、`as *` 去命名空间（慎用）、`with` 配置 `!default` 变量
- `@forward` = 转发成员给下游，配 `show/hide` 和前缀做门面文件
- `@import` 已废弃，老项目用 `sass-migrator` 迁移
