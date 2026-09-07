# 在 Vite 与 Webpack 中集成 SCSS

> 📖 官方文档：[Vite - CSS Pre-processors](https://vite.dev/guide/features.html#css-pre-processors)
>
> 📖 官方文档：[sass-loader](https://webpack.js.org/loaders/sass-loader/)

### 一、概述

现代前端项目几乎都在构建工具里使用 SCSS：**保存即编译、热更新、压缩、自动前缀**一条龙。本文覆盖 Vite 和 Webpack 两大构建工具的完整集成方案，以及全局变量注入、多主题等常见需求的落地写法。

### 二、Vite 中使用 SCSS

#### 1. 安装

Vite 原生支持 SCSS 的编译调度，只需要装编译器本身：

```bash
npm install -D sass
```

装完直接可用——`.scss` 文件、Vue SFC 里的 `lang="scss"` 都会自动编译：

```vue
<script setup></script>

<template>
  <div class="card">卡片</div>
</template>

<style lang="scss" scoped>
.card {
  padding: 16px;
  .title {
    font-size: 18px;
  }
}
</style>
```

#### 2. 全局变量/混入自动注入（最高频需求）

问题：每个组件都想用 `$primary`、`respond-to()`，但总不能每个文件都写一遍 `@use`。

解决：用 `css.preprocessorOptions.scss.additionalData` 自动注入：

```js
// vite.config.js
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 每个编译的 SCSS 文件头部都会自动加上这行（注意必须以分号或换行结尾）
        additionalData: `@use "@/styles/global.scss" as *;\n`,
      },
    },
  },
})
```

```scss
// src/styles/global.scss —— 被注入的公共内容
$primary: #409eff;
$spacing: ("sm": 8px, "md": 16px);

@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

```vue
<style lang="scss" scoped>
.card {
  color: $primary;            // ✅ 直接用，不用手动引入
  @include flex-center;
}
</style>
```

> ⚠️ **注意：**
>
> 1. `additionalData` 是**把内容拼在每个文件前面**，所以被注入的文件**不能包含会输出 CSS 的规则**（否则每个组件都会复制一份），只放变量、mixin、函数。
> 2. 注入语句**必须以分号结尾**（或换行），否则拼接后可能和后面的代码粘连报错。
> 3. 注入的文件里如果要再 `@use` 其他文件，`@use` 必须在最前面——这也是为什么推荐用一个 `global.scss` 做统一出口。

#### 3. 生产环境压缩

Vite 生产构建默认压缩 CSS，无需额外配置。想改输出格式可配 `build.cssMinify`。

#### 4. Sass 选项透传

需要传给 Dart Sass 的底层选项（如关闭废弃警告）时：

```js
// vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        silentWarnings: true, // Vite 透传给 Sass 的选项
        // 老项目迁移期压制 deprecation 警告（新版 sass 选项）
      },
    },
  },
})
```

> ⚠️ **注意：** 压制警告只是权宜之计，正确方向是尽快按警告迁移到新语法（`@use`、`math.div` 等）。

### 三、Webpack 中使用 SCSS

#### 1. 安装

```bash
npm install -D sass sass-loader css-loader style-loader
```

- `sass`：Dart Sass 编译器（不要用已废弃的 `node-sass`）
- `sass-loader`：让 Webpack 认识 `.scss`
- `css-loader`：处理 CSS 的导入
- `style-loader`：把 CSS 注入页面 `<style>` 标签（开发环境）

#### 2. 基础配置

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        // 从右到左执行：sass-loader → css-loader → style-loader
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
};
```

生产环境把 `style-loader` 换成 MiniCssExtractPlugin（抽成独立 `.css` 文件）：

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash:8].css' })],
};
```

#### 3. 全局变量注入

`additionalData` 同样适用于 sass-loader：

```js
// webpack.config.js（sass-loader v12+ 的现代写法）
module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              additionalData: `@use "@/styles/global.scss" as *;\n`,
              sassOptions: {
                // 可配 loadPaths 等
              },
            },
          },
        ],
      },
    ],
  },
};
```

> 💡 **提示：** 老版本 sass-loader 用的选项名是 `prependData`（已废弃），新版本统一是 `additionalData`。

#### 4. 自定义加载路径

```js
// webpack.config.js
{
  loader: 'sass-loader',
  options: {
    sassOptions: {
      loadPaths: ['src/styles'], // @use "global" 可直接找到 src/styles/_global.scss
    },
  },
}
```

### 四、常见集成需求实现

#### 1. Vue 项目结构参考

```
src/
├── styles/
│   ├── global.scss        # 变量 + mixin（供 additionalData 注入，不输出 CSS）
│   ├── _variables.scss    # 详细变量（被 global.scss @forward）
│   └── index.scss         # 全局样式入口
├── components/
│   └── App.vue
└── main.js                import '@/styles/index.scss'
```

```js
// main.js —— 引入全局样式
import '@/styles/index.scss'
```

#### 2. 多主题（暗色模式）

编译期方案：变量 + map 切换：

```scss
// styles/theme.scss
$themes: (
  "light": ("bg": #fff, "text": #333),
  "dark": ("bg": #1a1a1a, "text": #eee),
);
```

运行时方案（推荐，可动态切换）：**Sass 编译 CSS 自定义属性 + JS 切 class**：

```scss
// 定义两套 CSS 变量
:root {
  --bg: #fff;
  --text: #333;
}

html.dark {
  --bg: #1a1a1a;
  --text: #eee;
}

// 组件里用 var() 取值
.card {
  background: var(--bg);
  color: var(--text);
}
```

```js
// 切换主题
document.documentElement.classList.toggle('dark')
```

> 💡 **提示：** 需求是"构建时定死"用 Sass 变量；需要"用户运行时切换"用 CSS 自定义属性。详见 [02-变量与数据类型](./02-变量与数据类型.md) 的对比表。

#### 3. PostCSS 配合（自动前缀等）

构建工具里 SCSS 与 PostCSS 是**上下游关系**：SCSS 先编译成 CSS，再由 PostCSS 处理（autoprefixer 等）。两者互不冲突：

```js
// vite.config.js —— SCSS 与 PostCSS 并存
export default defineConfig({
  css: {
    preprocessorOptions: { scss: { /* ... */ } },
    postcss: {
      plugins: [require('autoprefixer')],
    },
  },
})
```

### 五、常见问题与注意事项

1. **报错 `Sass has been deprecated...`**：老代码用了 `@import`、`/` 除法等废弃语法。方案：按警告逐条迁移（`@use`、`math.div`）；实在改不完再临时静默。
2. **additionalData 注入导致 `@use` 位置报错**：被注入文件自身也用了 `@use` 且没写在文件最开头。确保 `global.scss` 内 `@use`/`@forward` 全在最前，或拆成"注入内容"和"普通样式"两个文件。
3. **`node-sass` 安装失败**：一律换 `sass`（Dart Sass），sass-loader 对两者都兼容。
4. **每个组件都重复输出了一段公共 CSS**：说明把**会输出样式的文件**放进了 `additionalData`——注入的只能是不产 CSS 的变量/mixin/函数文件。
5. **scoped 样式里用了注入的 mixin，选择器穿透异常**：注意 scoped 会给选择器加属性，mixin 里若有嵌套选择器/子元素，命中范围受 scoped 限制，属正常现象。

### 六、总结

- Vite：装 `sass` 即用，`additionalData` 注入全局变量/混入，注入文件不得产出 CSS
- Webpack：`sass-loader` 链式处理，生产环境用 MiniCssExtractPlugin 抽离 CSS 文件
- 编译期定制用 Sass 变量，运行时换肤用 CSS 自定义属性
- 遇到废弃警告的正解是迁移语法，而不是长期静默
