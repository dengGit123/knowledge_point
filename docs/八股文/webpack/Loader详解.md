# Loader 详解

> 官方文档：[Webpack Loader](https://webpack.docschina.org/concepts/loaders/)

> 官方文档：[Loader API](https://webpack.docschina.org/api/loaders/)

---

## 一、Loader 是什么

Loader 是 Webpack 的**文件转换器**，它让 Webpack 能够处理非 JavaScript 文件（CSS、图片、TypeScript、Vue 等），将其转换为 Webpack 能识别的模块。

```
Loader 的工作方式：

源文件 ──→ Loader1 ──→ Loader2 ──→ Loader3 ──→ JavaScript 模块

例如 .vue 文件：
Component.vue → vue-loader → babel-loader → JavaScript 模块

例如 .less 文件：
style.less → less-loader → postcss-loader → css-loader → style-loader → JS 模块
```

---

## 二、Loader 的执行顺序

Loader 按配置**从右到左**（从下到上）依次执行，采用**链式调用**。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/,
        // 执行顺序：less-loader → postcss-loader → css-loader → style-loader
        use: [
          'style-loader',       // ④ 将 CSS 注入到 <style> 标签
          'css-loader',         // ③ 解析 CSS 中的 @import 和 url()
          'postcss-loader',     // ② 添加浏览器前缀等后处理
          'less-loader'         // ① 将 Less 编译为 CSS
        ]
      }
    ]
  }
}
```

```
执行流程（从右到左）：

style.less
   │
   ▼ ① less-loader：Less → CSS
   │
   ▼ ② postcss-loader：CSS → 加前缀的 CSS
   │
   ▼ ③ css-loader：CSS → JS 模块（CSS in JS）
   │
   ▼ ④ style-loader：创建 <style> 标签插入 DOM
   │
   ▼ 最终：页面显示样式
```

### 执行顺序规则

```javascript
// enforce 属性可以改变执行分组
module.exports = {
  module: {
    rules: [
      // 前置 Loader（最先执行）
      { test: /\.js$/, enforce: 'pre', loader: 'eslint-loader' },

      // 普通 Loader（默认，按配置顺序）
      { test: /\.js$/, loader: 'babel-loader' },

      // 内联 Loader（在 import 语句中指定）
      // import 'raw-loader!./file.txt'

      // 后置 Loader（最后执行）
      { test: /\.js$/, enforce: 'post', loader: 'istanbul-instrumenter-loader' }
    ]
  }
}

// 完整执行顺序：
// pre → normal → inline → post（每组内部从右到左）
```

---

## 三、常用 Loader 分类

### JavaScript 处理

| Loader | 说明 |
|--------|------|
| `babel-loader` | ES6+ 降级为 ES5，支持 JSX |
| `ts-loader` | TypeScript 编译 |
| `eslint-loader` | ESLint 代码检查（已废弃，推荐用插件） |

```javascript
{
  test: /\.jsx?$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        ['@babel/preset-env', {
          useBuiltIns: 'usage',    // 按需引入 polyfill
          corejs: 3
        }]
      ],
      plugins: ['@babel/plugin-transform-runtime']
    }
  }
}
```

### CSS 处理

| Loader | 说明 |
|--------|------|
| `style-loader` | 将 CSS 注入 `<style>` 标签（开发环境） |
| `css-loader` | 解析 `@import` 和 `url()` |
| `postcss-loader` | PostCSS 处理（自动前缀等） |
| `less-loader` | Less → CSS |
| `sass-loader` | Sass/SCSS → CSS |
| `MiniCssExtractPlugin.loader` | 提取 CSS 为独立文件（生产环境） |

```javascript
// 开发环境
{
  test: /\.css$/,
  use: ['style-loader', 'css-loader', 'postcss-loader']
}

// 生产环境（提取为独立文件）
{
  test: /\.css$/,
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
}
```

### 静态资源处理（Webpack 5 资源模块）

| type | 替代的 Loader | 说明 |
|------|-------------|------|
| `asset/resource` | `file-loader` | 输出文件到目录 |
| `asset/inline` | `url-loader` | 转为 base64 Data URL |
| `asset/source` | `raw-loader` | 导出文件源码字符串 |
| `asset` | `url-loader` + `file-loader` | 自动选择（按大小） |

```javascript
{
  test: /\.(png|jpe?g|gif|svg)$/,
  type: 'asset',
  parser: {
    dataUrlCondition: {
      maxSize: 8 * 1024  // 8KB 以下 inline，以上输出文件
    }
  },
  generator: {
    filename: 'img/[hash:8][ext][query]'
  }
}
```

### 框架相关

| Loader | 说明 |
|--------|------|
| `vue-loader` | 处理 `.vue` 单文件组件 |
| `thread-loader` | 多线程编译（加速） |

---

## 四、自定义 Loader

### 基本结构

一个 Loader 就是一个**接收源文件字符串、返回转换结果的函数**。

```javascript
// loaders/replace-loader.js
module.exports = function(source) {
  // source 是文件的原始内容（字符串）
  const result = source.replace(/__NAME__/g, 'Webpack')
  return result
}
```

### 获取配置选项

```javascript
const { getOptions } = require('webpack').loader

module.exports = function(source) {
  const options = getOptions(this) || {}

  const name = options.name || 'World'
  const result = source.replace(/__NAME__/g, name)
  return result
}
```

```javascript
// webpack.config.js
{
  test: /\.js$/,
  use: [{
    loader: path.resolve(__dirname, 'loaders/replace-loader.js'),
    options: { name: 'MyApp' }
  }]
}
```

### 返回 Source Map

```javascript
module.exports = function(source) {
  const result = source.replace(/__NAME__/g, 'Webpack')

  // 返回转换结果 + Source Map
  this.callback(null, result, /* sourceMap */)
  return  // 使用 callback 时不需要 return
}
```

### 异步 Loader

```javascript
module.exports = function(source) {
  const callback = this.async()  // 声明为异步

  // 模拟异步处理
  setTimeout(() => {
    const result = source.replace(/__NAME__/g, 'Webpack')
    callback(null, result)
  }, 1000)
}
```

### Pitch Loader

Pitch 阶段在正常 Loader 执行之前，从**左到右**执行。如果某个 pitch 返回值，则跳过后续 pitch 和所有正常 loader。

```javascript
module.exports = function(source) {
  return source
}

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  // pitch 从左到右执行
  // 如果返回值，则跳过后续 loader，直接回到前一个 loader
  console.log('pitch 执行')
  // return 'some value'  // 会中断后续 loader 执行
}
```

---

## 五、Loader 的原理

```
┌─ Loader 链式调用原理 ──────────────────────────────────┐
│                                                         │
│  源文件内容                                              │
│     "body { color: red; }"                              │
│         │                                               │
│         ▼ less-loader（将 Less 编译为 CSS）              │
│     "body { color: red; }"                              │
│         │                                               │
│         ▼ postcss-loader（添加浏览器前缀）               │
│     "body { -webkit-color: red; color: red; }"          │
│         │                                               │
│         ▼ css-loader（解析 import/url，导出 JS 模块）     │
│     "exports.push([module.i, 'body{...}', ''])"         │
│         │                                               │
│         ▼ style-loader（创建 style 标签插入 DOM）        │
│     最终在页面中生效                                      │
│                                                         │
│  每一步接收上一步的输出作为输入（管道模式）                │
└─────────────────────────────────────────────────────────┘
```

---

## 六、面试常见问题

### Q1：Loader 的执行顺序是怎样的？

Loader 分为四个分组：**pre → normal → inline → post**，每组内部**从右到左**（从下到上）执行。这是因为 Loader 采用**函数组合（compose）**的方式，类似 `fn3(fn2(fn1(source)))`。

### Q2：如何写一个自定义 Loader？

1. 导出一个接收 `source`（源文件内容）的函数
2. 对 source 进行转换处理
3. 返回转换后的结果
4. 可选：使用 `this.callback()` 返回 source map，使用 `this.async()` 处理异步

### Q3：css-loader 和 style-loader 的区别？

- **`css-loader`**：解析 CSS 文件中的 `@import` 和 `url()`，将 CSS 转为 JS 模块（CSS in JS 形式）
- **`style-loader`**：接收 css-loader 的输出，动态创建 `<style>` 标签插入到 DOM 中

生产环境通常用 `MiniCssExtractPlugin.loader` 替代 `style-loader`，将 CSS 提取为独立文件。

### Q4：Webpack 5 的 Asset Modules 有什么改进？

Webpack 5 内置了资源模块类型，替代了 `file-loader`、`url-loader`、`raw-loader`：
- `asset/resource`：输出文件（替代 file-loader）
- `asset/inline`：base64 内联（替代 url-loader）
- `asset/source`：导出源码（替代 raw-loader）
- `asset`：自动选择（默认 8KB 以下内联，以上输出文件）

不再需要安装额外 loader，配置更简洁。
