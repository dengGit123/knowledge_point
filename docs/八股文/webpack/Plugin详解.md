# Plugin 详解

> 官方文档：[Webpack Plugin](https://webpack.docschina.org/concepts/plugins/)

> 官方文档：[Compiler Hooks](https://webpack.docschina.org/api/compiler-hooks/)

---

## 一、Plugin 是什么

Plugin 是 Webpack 的**功能扩展器**，它可以在 Webpack 构建的整个生命周期中监听特定事件（钩子），在合适的时机执行自定义逻辑。

```
┌─ Webpack 构建生命周期 ──────────────────────────────────────────┐
│                                                                  │
│  初始化 → 编译开始 → 模块构建 → 代码生成 → 资源优化 → 输出      │
│    │         │          │          │          │         │        │
│    ▼         ▼          ▼          ▼          ▼         ▼        │
│  Plugin    Plugin     Plugin     Plugin     Plugin    Plugin    │
│  监听      监听        监听        监听        监听      监听     │
│  钩子      钩子        钩子        钩子        钩子      钩子     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

> **通俗理解**：Loader 负责"翻译文件"，Plugin 负责"干杂活"——生成 HTML、压缩代码、拷贝文件、注入环境变量等一切 Loader 做不了的事情。

---

## 二、常用 Plugin

### 开发效率类

| Plugin | 说明 |
|--------|------|
| `HtmlWebpackPlugin` | 自动生成 HTML 文件并注入打包资源 |
| `DefinePlugin` | 定义全局常量（环境变量） |
| `CopyWebpackPlugin` | 拷贝静态文件到输出目录 |
| `ProgressPlugin` | 显示构建进度条 |

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { DefinePlugin } = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',  // 模板文件
      filename: 'index.html',            // 输出文件名
      title: 'My App',                   // 页面标题
      favicon: './public/favicon.ico',   // 图标
      inject: 'body',                    // 注入位置
      minify: {                          // 压缩配置
        collapseWhitespace: true,
        removeComments: true
      }
    }),

    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_URL': JSON.stringify('https://api.example.com'),
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false'
    }),

    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/static', to: 'static' }
      ]
    })
  ]
}
```

### CSS 处理类

| Plugin | 说明 |
|--------|------|
| `MiniCssExtractPlugin` | 提取 CSS 为独立文件（生产环境替代 style-loader） |
| `CssMinimizerPlugin` | 压缩 CSS |

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css'
    })
  ],
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()]
  }
}
```

### 代码优化类

| Plugin | 说明 |
|--------|------|
| `TerserPlugin` | 压缩 JavaScript（Webpack 5 默认内置） |
| `BundleAnalyzerPlugin` | 可视化分析打包体积 |
| `CompressionPlugin` | 生成 gzip/brotli 压缩文件 |

```javascript
const TerserPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,               // 多线程压缩
        extractComments: false,       // 不生成 LICENSE 文件
        terserOptions: {
          compress: {
            drop_console: true,       // 移除 console
            drop_debugger: true       // 移除 debugger
          }
        }
      })
    ]
  },
  plugins: [
    // 打包分析（按需开启）
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    }),

    // Gzip 压缩
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,              // 10KB 以上才压缩
      minRatio: 0.8
    })
  ]
}
```

### 框架相关

| Plugin | 说明 |
|--------|------|
| `VueLoaderPlugin` | Vue 单文件组件支持 |
| `ReactRefreshWebpackPlugin` | React 热更新 |
| `ForkTsCheckerWebpackPlugin` | TypeScript 类型检查（多线程） |

---

## 三、Plugin 的核心机制——Tapable

Webpack 的插件系统基于 **Tapable** 事件流框架。Plugin 通过订阅 Webpack 构建过程中的钩子来执行逻辑。

### Tapable 钩子类型

| 类型 | 说明 | 触发方式 |
|------|------|---------|
| `SyncHook` | 同步串行钩子 | 依次执行 |
| `SyncBailHook` | 同步熔断钩子 | 返回非 undefined 时停止 |
| `SyncWaterfallHook` | 同步瀑布钩子 | 上一个返回值传给下一个 |
| `AsyncSeriesHook` | 异步串行钩子 | 异步依次执行 |
| `AsyncParallelHook` | 异步并行钩子 | 异步同时执行 |

### Compiler 和 Compilation

| 对象 | 说明 | 生命周期 |
|------|------|---------|
| **Compiler** | 全局编译器实例 | 整个 Webpack 运行期间（从启动到退出） |
| **Compilation** | 单次编译实例 | 每次文件变化重新编译时创建 |

```javascript
// Compiler 钩子（全局级别）
compiler.hooks.initialize.tap('MyPlugin', () => { /* 初始化 */ })
compiler.hooks.run.tap('MyPlugin', () => { /* 开始编译 */ })
compiler.hooks.done.tap('MyPlugin', (stats) => { /* 编译完成 */ })
compiler.hooks.emit.tap('MyPlugin', (compilation) => { /* 输出资源前 */ })

// Compilation 钩子（单次编译级别）
compilation.hooks.buildModule.tap('MyPlugin', (module) => { /* 构建模块 */ })
compilation.hooks.seal.tap('MyPlugin', () => { /* 停止接收新模块 */ })
compilation.hooks.optimizeChunks.tap('MyPlugin', (chunks) => { /* 优化 chunk */ })
```

---

## 四、自定义 Plugin

### 基本结构

```javascript
class MyPlugin {
  // 构造函数接收配置
  constructor(options) {
    this.options = options
  }

  // apply 方法在 Webpack 初始化时调用
  apply(compiler) {
    const { name } = this.options

    // 监听 emit 钩子（输出资源到目录之前）
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 获取所有输出资源
      const assets = compilation.assets

      // 创建新文件
      const content = `// 构建时间: ${new Date().toISOString()}\n// 插件: ${name}`
      compilation.assets['build-info.txt'] = {
        source: () => content,
        size: () => content.length
      }

      callback()
    })
  }
}

module.exports = MyPlugin
```

### 实用自定义 Plugin 示例

#### 1. 文件列表生成插件

```javascript
class FileListPlugin {
  constructor({ filename = 'filelist.md' } = {}) {
    this.filename = filename
  }

  apply(compiler) {
    compiler.hooks.emit.tap('FileListPlugin', (compilation) => {
      const fileNames = Object.keys(compilation.assets)
      let content = '# 构建产物文件列表\n\n'
      fileNames.forEach(name => {
        const size = (compilation.assets[name].size() / 1024).toFixed(2)
        content += `- ${name} (${size} KB)\n`
      })

      compilation.assets[this.filename] = {
        source: () => content,
        size: () => content.length
      }
    })
  }
}
```

#### 2. 构建完成通知插件

```javascript
class BuildNotifyPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('BuildNotifyPlugin', (stats) => {
      const time = ((stats.endTime - stats.startTime) / 1000).toFixed(2)
      if (stats.hasErrors()) {
        console.error(`\n❌ 构建失败！耗时 ${time}s`)
      } else {
        console.log(`\n✅ 构建成功！耗时 ${time}s`)
      }
    })
  }
}
```

#### 3. 压缩图片插件（调用外部 API）

```javascript
class CompressImagePlugin {
  constructor({ quality = 80 }) {
    this.quality = quality
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('CompressImagePlugin', async (compilation, callback) => {
      const imageAssets = Object.entries(compilation.assets)
        .filter(([name]) => /\.(png|jpg|jpeg)$/.test(name))

      for (const [name, asset] of imageAssets) {
        try {
          const compressed = await compressImage(asset.source(), this.quality)
          compilation.assets[name] = {
            source: () => compressed,
            size: () => compressed.length
          }
        } catch (e) {
          console.warn(`压缩 ${name} 失败:`, e.message)
        }
      }

      callback()
    })
  }
}
```

---

## 五、常用钩子及触发时机

| 钩子 | 类型 | 触发时机 | 用途 |
|------|------|---------|------|
| `environment` | SyncHook | 初始化环境变量后 | 读取环境配置 |
| `entryOption` | SyncBailHook | 处理 entry 配置后 | 修改入口配置 |
| `afterPlugins` | SyncHook | 所有插件加载后 | 插件间通信 |
| `compilation` | SyncHook | 创建 Compilation 时 | 修改编译过程 |
| `make` | AsyncParallelHook | 从 Entry 开始编译 | 添加自定义入口 |
| `emit` | AsyncSeriesHook | 输出资源到目录前 | 修改/添加输出文件 |
| `afterEmit` | AsyncSeriesHook | 输出资源到目录后 | 文件上传、通知 |
| `done` | SyncHook | 编译完成 | 构建通知、统计 |
| `failed` | SyncHook | 编译失败 | 错误通知 |

---

## 六、面试常见问题

### Q1：Plugin 的工作原理？

Plugin 基于 **Tapable** 事件流框架。Webpack 在构建过程中会在各个阶段触发对应的钩子，Plugin 在 `apply()` 方法中订阅感兴趣的钩子，当钩子触发时执行自定义逻辑。Plugin 通过 `compiler` 和 `compilation` 对象访问 Webpack 的内部状态。

### Q2：Loader 和 Plugin 的区别？

| 维度 | Loader | Plugin |
|------|--------|--------|
| 定位 | 文件转换器 | 功能扩展器 |
| 处理对象 | 单个文件 | 整个构建过程 |
| 执行时机 | 模块加载时 | 构建生命周期各阶段 |
| 配置位置 | `module.rules` | `plugins` 数组 |
| 编写方式 | 导出一个函数 | 导出一个带 `apply()` 方法的类 |

### Q3：Webpack 常用的 Plugin 有哪些？

**必知**：`HtmlWebpackPlugin`、`DefinePlugin`、`MiniCssExtractPlugin`

**优化类**：`TerserPlugin`、`CssMinimizerPlugin`、`CompressionPlugin`

**分析类**：`BundleAnalyzerPlugin`

**框架类**：`VueLoaderPlugin`、`ForkTsCheckerWebpackPlugin`

### Q4：如何编写一个自定义 Plugin？

1. 创建一个类，实现 `apply(compiler)` 方法
2. 在 `apply` 中通过 `compiler.hooks.xxx.tap/tapAsync` 订阅钩子
3. 在钩子回调中通过 `compilation.assets` 操作输出资源
4. 异步钩子需要调用 `callback()` 通知 Webpack 继续
