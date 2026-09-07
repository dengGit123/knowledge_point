# SCSS 基础与安装使用

> 📖 官方文档：[Sass Documentation](https://sass-lang.com/documentation/)
>
> 📖 安装指南：[Sass Install](https://sass-lang.com/install/)

### 一、概述

**SCSS 是 CSS 的超集和预处理器**——它在 CSS 的基础上增加了变量、嵌套、混入、函数、模块化等编程能力，最终编译成普通的 CSS 交给浏览器。

用大白话说：**CSS 是"说明书"，SCSS 是"写说明书的工具"**。浏览器只认识 CSS，SCSS 写的代码必须先经过编译，转换成 CSS 才能生效。

```
┌──────────────┐    编译（Sass/构建工具）    ┌──────────────┐
│   .scss 文件  │  ─────────────────────▶   │  浏览器可用的  │
│  （你写的代码） │        自动进行            │   .css 文件   │
└──────────────┘                           └──────────────┘
```

### 二、Sass 与 SCSS 的关系

很多人分不清 Sass 和 SCSS，其实它们是**同一种预处理器的两种语法**：

| 对比项 | SCSS 语法（`.scss`） | Sass 语法（`.sass`） |
| --- | --- | --- |
| 大括号 | ✅ 需要 `{}` | ❌ 不需要，靠缩进表示层级 |
| 分号 | ✅ 每条声明需要 `;` | ❌ 不需要 |
| 变量符号 | `$color: red;` | `$color: red` |
| 与 CSS 兼容性 | 完全兼容，任何 CSS 都是合法 SCSS | 不兼容 |
| 市场占有 | 绝大多数项目使用 | 少数老项目 |

```scss
// SCSS 语法（推荐，本文档统一使用）
.nav {
  ul {
    margin: 0;
  }
}
```

```sass
// Sass 缩进语法（了解即可）
.nav
  ul
    margin: 0
```

> 💡 **提示：** 由于任何合法的 CSS 都是合法的 SCSS，你可以把现有 `.css` 文件直接改名为 `.scss` 开始渐进式使用，零成本上手。

### 三、安装与使用

#### 1. 方式一：在构建工具中使用（主流方式）

**Vite 项目**（最简单，无需安装任何东西）：

```js
// vite.config.js —— Vite 对 SCSS 开箱即用
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // 可选：自动给每个 SCSS 文件注入额外代码（如全局变量文件）
        additionalData: `@use "@/styles/variables.scss" as *;`,
      },
    },
  },
})
```

```vue
<!-- Vue 单文件组件中直接使用 -->
<style lang="scss" scoped>
.card {
  padding: 16px;
  .title {
    font-size: 18px; // 嵌套写法
  }
}
</style>
```

**Webpack 项目**（需要 `sass-loader`）：

```bash
npm install sass sass-loader --save-dev
```

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'], // 从右到左执行
      },
    ],
  },
}
```

#### 2. 方式二：命令行全局安装（独立编译）

```bash
# 全局安装 Dart Sass（官方主推的实现）
npm install -g sass

# 把 input.scss 编译成 output.css
sass input.scss output.css

# 监听文件变化，自动重新编译（开发时常用）
sass --watch input.scss output.css

# 监听整个目录
sass --watch src/scss:dist/css
```

#### 3. 方式三：可视化编译工具

- **Koala**：老牌图形化编译工具
- **VS Code 插件**：Live Sass Compiler（保存即编译）

> ⚠️ **注意：** 网上老教程可能提到 Ruby Sass 或 LibSass（node-sass），它们**已被官方废弃**（官网标注 ⚰）。新项目一律使用 **Dart Sass**（npm 包名就叫 `sass`），不要再用 `node-sass`。

### 四、SCSS 能做什么？（核心特性速览）

```scss
// 1. 变量：一处定义，处处使用
$primary-color: #409eff;

// 2. 嵌套：结构清晰，不再重复写选择器
.nav {
  .item {
    &:hover {
      color: $primary-color;
    }
  }
}

// 3. 混入（mixin）：可复用的样式代码块
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// 4. 模块化：拆分文件，按需引入
@use './variables';
```

函数与运算需先引入内置模块（`@use "sass:math"`）再调用，如 `math.div(100px, 2)` 得到 `50px`——详见 [09-函数](./09-函数.md)。

### 五、编译输出格式

命令行编译时可以用 `--style` 指定输出风格：

| 风格 | 说明 | 使用场景 |
| --- | --- | --- |
| `expanded` | 正常展开，每条规则一行行排 | 开发调试 |
| `compressed` | 压缩成一行，去掉所有空白注释 | 生产上线 |

```bash
sass input.scss output.css --style=compressed
```

### 六、常见问题与注意事项

1. **浏览器不能直接运行 SCSS**——所有 SCSS 必须经过编译，别忘了在构建工具里配置。
2. **文件命名约定**：只用于被引入、不单独编译的文件叫**partials（部分文件）**，命名以下划线开头（如 `_variables.scss`），引入时可以省略下划线。
3. **`node-sass` 已过时**：安装依赖时用 `sass` 包；遇到 `node-sass` 安装失败（Python、Node 版本问题）的老项目，建议迁移到 `sass`。
4. **不要把 SCSS 写成"编程语言"**：SCSS 的定位是"增强的 CSS"，样式逻辑过于复杂（深层循环、大量条件判断）会让代码难以维护。

### 七、总结

- SCSS 是 CSS 超集，**需编译后才能被浏览器使用**
- `.scss` 用大括号和分号，与 CSS 完全兼容；`.sass` 用缩进，了解即可
- 新项目用 **Dart Sass**（npm 包 `sass`），Vite 开箱即用
- 核心能力：变量、嵌套、混入、函数、模块化，后续文档逐一展开
