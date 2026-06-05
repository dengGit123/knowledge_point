# Webpack 与 Vite 对比

> Vite 官方文档：[Vite 中文文档](https://cn.vitejs.dev/)

> Webpack 官方文档：[Webpack](https://webpack.docschina.org/)

---

## 一、构建理念的根本区别

```
Webpack 的构建理念：
  打包一切 → 将所有模块预打包为 bundle → 浏览器加载 bundle

  开发环境：全量打包（慢）→ 启动开发服务器
  生产环境：全量打包 + 优化 → 生成静态文件

  ┌──────────────────────────────────────────────────┐
  │  源代码 → 全量打包 → bundle → 开发服务器/部署     │
  │          （项目越大越慢）                           │
  └──────────────────────────────────────────────────┘


Vite 的构建理念：
  按需编译 → 浏览器原生 ES Module → 开发时不打包

  开发环境：不打包，浏览器按需请求模块（快）
  生产环境：Rollup 打包 + 优化 → 生成静态文件

  ┌──────────────────────────────────────────────────┐
  │  源代码 → 浏览器直接请求模块 → 按需编译            │
  │          （启动速度与项目大小无关）                  │
  └──────────────────────────────────────────────────┘
```

> **通俗理解**：Webpack 像是"提前把所有食材做成便当盒"（全量打包），Vite 像是"自助餐，想吃什么现做"（按需编译）。

---

## 二、开发环境对比

### 启动速度

```
Webpack 开发启动：
  ① 读取配置
  ② 解析入口依赖（递归分析所有 import）
  ③ 调用 Loader 编译所有模块
  ④ 构建完整的模块依赖图
  ⑤ 打包生成 bundle
  ⑥ 启动开发服务器
  → 项目越大，步骤 ②-⑤ 越慢（可能几十秒甚至几分钟）

Vite 开发启动：
  ① 读取配置
  ② 启动开发服务器（几乎瞬间）
  ③ 浏览器请求入口 HTML
  ④ 浏览器加载入口 JS（原生 ESM）
  ⑤ 遇到 import 按需编译对应模块
  → 启动速度与项目大小无关（通常 < 1 秒）
```

| 指标 | Webpack | Vite |
|------|---------|------|
| 冷启动 | 慢（全量打包） | **极快**（不打包） |
| 热更新 | 快（增量编译） | **更快**（精确模块失效） |
| 大型项目启动 | 几十秒~几分钟 | < 1 秒 |
| 内存占用 | 较高 | 较低 |

### 热更新机制对比

```
Webpack HMR：
  文件变化 → 增量编译 → 重新打包涉及 chunk → WebSocket 通知 → 浏览器替换模块
  （需要重新构建模块依赖链）

Vite HMR：
  文件变化 → 确定受影响的模块边界 → 重新编译该模块 → WebSocket 通知 → 浏览器替换
  （精确到单个模块 URL，无需重新打包）
```

---

## 三、生产构建对比

| 维度 | Webpack | Vite |
|------|---------|------|
| 打包工具 | Webpack 自身 | **Rollup** |
| 代码分割 | 手动/自动 splitChunks | Rollup 自动分割 |
| Tree Shaking | ✅ | ✅（Rollup 更成熟） |
| CSS 处理 | Loader 链（css-loader + 插件） | 内置处理 |
| 静态资源 | Loader / Asset Modules | 内置处理 |
| 插件生态 | 非常丰富 | 快速增长中 |
| 配置复杂度 | 高 | 低 |

---

## 四、核心架构差异

### 模块处理方式

```html
<!-- Webpack 产物的 HTML -->
<script src="/js/main.3a4b.js"></script>
<script src="/js/vendor.c5d6.js"></script>
<!-- 浏览器加载预先打包好的 bundle -->

<!-- Vite 开发环境的 HTML -->
<script type="module" src="/src/main.js"></script>
<!-- 浏览器原生 ESM，按需请求模块 -->
```

```javascript
// Vite 开发环境：浏览器直接加载源码（按需编译）
// main.js
import { createApp } from 'vue'       // Vite 预构建（esbuild）→ /node_modules/.vite/vue.js
import App from './App.vue'            // Vite 按需编译 → 返回编译后的 JS
import './style.css'                   // Vite 注入 HMR 样式

// Webpack 开发环境：所有模块已打包在 bundle 中
// main.js 中所有 import 已被替换为 __webpack_require__
```

### 依赖预构建

Vite 使用 **esbuild**（Go 编写）进行依赖预构建，速度远超 Webpack 的 JavaScript 编译：

```javascript
// Vite 会将 CommonJS/UMD 依赖转为 ESM
// 并将多个小文件合并为单个模块（减少请求）
// node_modules/.vite/deps/
//   ├── vue.js          ← vue 合并为一个文件
//   ├── lodash-es.js    ← lodash-es 合并
//   └── _metadata.json  ← 预构建缓存信息
```

---

## 五、配置对比

### Webpack 配置（复杂）

```javascript
// webpack.config.js（简化版，实际项目通常 100+ 行）
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  module: {
    rules: [
      { test: /\.vue$/, loader: 'vue-loader' },
      { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
      { test: /\.less$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'] },
      { test: /\.(png|jpe?g)$/, type: 'asset', parser: { dataUrlCondition: { maxSize: 8192 } } }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({ template: './index.html' }),
    new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash:8].css' })
  ],
  devServer: {
    hot: true,
    port: 3000,
    historyApiFallback: true
  }
}
```

### Vite 配置（简洁）

```javascript
// vite.config.js（同样功能）
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': '/src' }
  },
  server: {
    port: 3000
  },
  css: {
    preprocessorOptions: {
      less: { /* less options */ }
    }
  }
})
// CSS、JS、静态资源处理开箱即用，不需要额外 Loader
```

---

## 六、生态与兼容性对比

| 维度 | Webpack | Vite |
|------|---------|------|
| **成熟度** | 非常成熟（2012 年至今） | 成熟（2020 年至今） |
| **插件生态** | 非常丰富（10,000+） | 快速增长（兼容 Rollup 插件） |
| **Loader/Plugin** | Loader + Plugin | Vite Plugin（统一接口） |
| **框架支持** | Vue / React / Angular 均支持 | Vue（官方推荐）/ React / Svelte 等 |
| **微前端** | Module Federation | 可用，但不如 Webpack 原生 |
| **旧项目兼容** | 天然兼容 | 迁移有成本 |
| **社区趋势** | 稳定维护 | **快速增长** |

---

## 七、如何选择

| 场景 | 推荐 | 原因 |
|------|------|------|
| 新项目 | **Vite** ✅ | 开发体验更好，配置简单 |
| Vue 3 项目 | **Vite** ✅ | 官方推荐，深度优化 |
| React 新项目 | **Vite** ✅ | 同样优秀 |
| 大型遗留项目 | **Webpack** | 迁移成本高 |
| 需要微前端 | **Webpack** | Module Federation 更成熟 |
| 需要特殊 Loader | **Webpack** | 生态更丰富 |
| Monorepo | 都可以 | Vite 对 Monorepo 支持已很好 |

---

## 八、面试常见问题

### Q1：Vite 为什么比 Webpack 快？

1. **开发时不打包**：利用浏览器原生 ES Module，按需编译，无需全量打包
2. **esbuild 预构建**：用 Go 编写的 esbuild 处理依赖预构建，比 JS 工具快 10~100 倍
3. **按需编译**：只编译当前页面实际用到的模块
4. **高效 HMR**：基于精确的模块边界计算，热更新速度不受项目规模影响

### Q2：Vite 的开发模式为什么不打包？

Vite 利用了浏览器原生的 **ES Module** 支持。当浏览器遇到 `<script type="module">` 时，会自动发起 HTTP 请求获取 import 的模块。Vite DevServer 拦截这些请求，实时编译对应模块并返回，无需提前打包。

### Q3：Vite 生产构建为什么用 Rollup 而不是 esbuild？

esbuild 虽然快，但在某些场景下不够灵活：
- 代码分割策略不如 Rollup 成熟
- 部分 CSS 处理有差异
- 插件 API 与 Rollup 不兼容

Rollup 在生产构建方面更加成熟稳定，输出的代码更高效。Vite 在生产构建时使用 Rollup（通过插件），同时使用 esbuild 进行 TS/JSX 转换以保持速度。

### Q4：Webpack 和 Vite 的 HMR 有什么区别？

- **Webpack HMR**：文件变化后需要增量编译并重新生成 chunk，通过 WebSocket 推送更新
- **Vite HMR**：文件变化后精确计算受影响的模块边界，直接让浏览器重新请求变化的模块 URL（通过添加时间戳参数绕过缓存），无需打包过程

Vite 的 HMR 速度**不受项目规模影响**，而 Webpack 在大型项目中 HMR 会逐渐变慢。
