# build 配置

## 定义

`build` 配置生产环境的构建行为。

## 属性层级结构

```
build
├── target
├── modulePreload
│   └── polyfill
├── polyfillModulePreload
├── outDir
├── assetsDir
├── assetsInlineLimit
├── cssCodeSplit
├── cssTarget
├── cssMinify
├── sourcemap
├── rollupOptions
│   ├── input
│   └── output
│       ├── chunkFileNames
│       ├── entryFileNames
│       ├── assetFileNames
│       ├── manualChunks
│       ├── format
│       ├── exports
│       ├── globals
│       ├── compact
│       ├── interop
│       ├── preserveModules
│       ├── preserveModulesRoot
│       ├── inlineDynamicImports
│       └── sourcemap
│   ├── external
│   ├── plugins
│   ├── onwarn
│   ├── preserveEntrySignatures
│   └── preserveModules
├── minify
├── terserOptions
│   ├── compress
│   └── format
├── write
├── emptyOutDir
├── copyPublicDir
├── manifest
├── ssrManifest
├── reportCompressedSize
├── chunkSizeWarningLimit
├── watch
├── commonjsOptions
├── dynamicImportVarsOptions
├── lib
│   ├── entry
│   ├── name
│   ├── fileName
│   └── formats
└── ssrEmitAssets
```

## 用法

```javascript
// vite.config.js
export default {
  build: {
    target: 'modules',
    modulePreload: true,
    polyfillModulePreload: true,
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    cssTarget: 'es2015',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {},
    minify: 'esbuild',
    terserOptions: {},
    write: true,
    emptyOutDir: true,
    copyPublicDir: true,
    manifest: false,
    ssrManifest: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    watch: false,
    commonjsOptions: {},
    dynamicImportVarsOptions: {},
    lib: {},
    ssrEmitAssets: false
  }
}
```

## 子属性详解

### target

**类型**：`string | string[] | false`

**默认值**：`'modules'`

设置最终构建的浏览器兼容性目标。

| 值 | 说明 |
|----|------|
| `'modules'` | 支持原生 ESM 的浏览器（现代浏览器） |
| `'esnext'` | 假设支持最新 ES 特性 |
| `'es2015'` ~ `'es2023'` | 指定 ES 版本 |
| `['chrome58', 'edge16']` | 浏览器列表（esbuild 目标格式） |
| `false` | 不做任何转换 |

```javascript
// 字符串形式
target: 'modules'
target: 'es2015'
target: 'es2020'

// 数组形式 - 指定多个浏览器目标
target: ['chrome58', 'edge16', 'firefox57']
target: ['ios11', 'safari11']

// 禁用转换
target: false

// 结合 browserslist
target: 'browserslist'
```

### modulePreload

**类型**：`boolean | { polyfill?: boolean }`

**默认值**：`true`

是否启用模块预加载功能。

```javascript
// 启用（默认）
modulePreload: true

// 禁用
modulePreload: false

// 对象形式 - 精细控制
modulePreload: {
  polyfill: true   // 是否注入 polyfill 脚本
}

modulePreload: {
  polyfill: false  // 假设浏览器原生支持
}
```

### polyfillModulePreload

**类型**：`boolean`

**默认值**：`true`

是否注入 module preload polyfill 脚本。

```javascript
polyfillModulePreload: true   // 注入 polyfill
polyfillModulePreload: false  // 不注入
```

### outDir

**类型**：`string`

**默认值**：`'dist'`

输出目录路径。

```javascript
// 相对路径
outDir: 'dist'
outDir: 'build'
outDir: '../output'

// 绝对路径
outDir: '/path/to/dist'

// 使用环境变量
outDir: process.env.NODE_ENV === 'production' ? 'dist' : 'dev-dist'
```

### assetsDir

**类型**：`string`

**默认值**：`'assets'`

静态资源存放目录（相对于 `outDir`）。

```javascript
assetsDir: 'assets'
assetsDir: 'static'
assetsDir: 'public'
assetsDir: ''  // 直接放在 outDir 根目录
```

### assetsInlineLimit

**类型**：`number`

**默认值**：`4096` (4KB)

小于此阈值的资源会被转为 base64 Data URL 内联，单位字节。

```javascript
// 禁用内联 - 所有资源都作为单独文件
assetsInlineLimit: 0

// 设置阈值
assetsInlineLimit: 4096   // 4KB（默认）
assetsInlineLimit: 8192   // 8KB
assetsInlineLimit: 10240  // 10KB

// 无限内联 - 所有资源都内联（不推荐）
assetsInlineLimit: Infinity
```

### cssCodeSplit

**类型**：`boolean`

**默认值**：`true`

是否启用 CSS 代码分割。

```javascript
// 启用（默认）- 每个 async chunk 的 CSS 会单独提取
cssCodeSplit: true

// 禁用 - 所有 CSS 打包到一个文件
cssCodeSplit: false
```

### cssTarget

**类型**：`string | string[]`

**默认值**：与 `target` 相同

CSS 的浏览器兼容目标。

```javascript
// 字符串
cssTarget: 'es2015'
cssTarget: 'chrome58'

// 数组
cssTarget: ['ios11', 'safari11']

// 使用不同目标
cssTarget: 'es2015'  // 即使 JS target 是 modules
```

### cssMinify

**类型**：`boolean | 'esbuild' | 'lightningcss'`

**默认值**：`true` (使用 `esbuild`)

是否压缩 CSS 代码。

```javascript
// 布尔值
cssMinify: true   // 压缩（使用 esbuild）
cssMinify: false  // 不压缩

// 指定压缩器
cssMinify: 'esbuild'       // 使用 esbuild
cssMinify: 'lightningcss'  // 使用 lightningcss
```

### sourcemap

**类型**：`boolean | 'inline' | 'hidden'`

**默认值**：`false`

是否生成 sourcemap 文件。

| 值 | 说明 |
|----|------|
| `false` | 不生成 sourcemap |
| `true` | 生成独立的 `.map` 文件，并在代码中引用 |
| `'inline'` | 将 sourcemap 作为 Data URI 内联到代码中 |
| `'hidden'` | 生成 `.map` 文件但不引用（用于错误追踪工具） |

```javascript
// 不生成
sourcemap: false

// 生成并引用
sourcemap: true

// 内联
sourcemap: 'inline'

// 生成但不引用
sourcemap: 'hidden'

// 不同模式不同配置
sourcemap: process.env.NODE_ENV === 'development' ? true : false

// 函数形式（高级）
sourcemap: (config) => {
  return config.command === 'serve' ? true : 'hidden'
}
```

### rollupOptions

**类型**：`RollupOptions`

直接配置底层的 Rollup 选项。

```javascript
rollupOptions: {
  // 输入配置
  input: {
    main: 'src/main.js',
    admin: 'src/admin.js'
  },

  // 输出配置
  output: {
    // 详见下方 "output 详解"
  },

  // 外部依赖
  external: ['vue', 'vue-router'],
  // 或函数
  external: (id) => id.startsWith(' @my-scope/'),

  // 插件
  plugins: [],

  // 其他 Rollup 选项
  onwarn: (warning, warn) => {
    // 忽略某些警告
    if (warning.code === 'CIRCULAR_DEPENDENCY') return
    warn(warning)
  },

  preserveEntrySignatures: 'strict',
  preserveModules: false
}
```

### output 详解

**类型**：`OutputOptions | OutputOptions[]`

Rollup 输出配置，控制产物的文件名、格式、路径等。

#### 文件名配置

##### chunkFileNames

**类型**：`string`

**默认值**：`"[name]-[hash].js"`

_chunk_（非入口代码块）的文件名模板。

```javascript
// 基础用法
chunkFileNames: '[name]-[hash].js'

// 带目录
chunkFileNames: 'js/[name]-[hash].js'

// 自定义 hash 长度
chunkFileNames: '[name]-[hash:8].js'  // 8 位 hash

// 使用 contenthash
chunkFileNames: '[name]-[contenthash].js'

// 完整路径
chunkFileNames: 'static/js/chunks/[name]-[hash:8].js'
```

**可用的占位符：**

| 占位符 | 说明 | 示例 |
|--------|------|------|
| `[name]` | chunk 名称 | `vendor` |
| `[hash]` | 内容哈希 | `abc123` |
| `[hash:n]` | 指定长度的哈希 | `abc12345` |
| `[contenthash]` | 内容哈希（同 hash） | `def456` |
| `[format]` | 输出格式 | `es` |
| `[ext]` | 扩展名 | `.js` |

##### entryFileNames

**类型**：`string`

**默认值：`"[name].js"`（开发环境）` / `"[name]-[hash].js"`（生产环境，非库模式）

入口文件的文件名模板。

```javascript
// 基础用法
entryFileNames: '[name].js'
entryFileNames: '[name]-[hash].js'

// 带目录
entryFileNames: 'js/[name]-[hash:8].js'

// 多入口时保持原名称
entryFileNames: '[name].js'

// 添加前缀
entryFileNames: 'entry-[name]-[hash].js'
```

##### assetFileNames

**类型**：`string | (assetInfo: AssetInfo) => string`

**默认值：`"[name]-[hash][extname]"`

静态资源（CSS、图片、字体等）的文件名模板。

### 字符串形式

```javascript
// 基础用法
assetFileNames: '[name]-[hash][extname]'

// 按类型分目录
assetFileNames: '[ext]/[name]-[hash:8].[ext]'

// 自定义目录结构
assetFileNames: 'static/assets/[name]-[hash:8][extname]'

// 完整示例
assetFileNames: 'static/[ext]/[name]-[hash:8].[ext]'
```

**可用的占位符：**

| 占位符 | 说明 | 示例 |
|--------|------|------|
| `[name]` | 资源名称（不含扩展名） | `logo` |
| `[hash]` | 内容哈希值 | `abc123def456` |
| `[hash:n]` | 指定长度的哈希值 | `abc123de` |
| `[contenthash]` | 内容哈希（同 hash） | `def456` |
| `[ext]` | 扩展名（含点） | `.png` |
| `[extname]` | 扩展名（含点） | `.png` |

### 函数形式

```typescript
assetFileNames: (assetInfo: AssetInfo) => string
```

#### assetInfo 参数详解

**完整类型定义：**

```typescript
interface AssetInfo {
  name: string              // 文件名（含扩展名）
  source: string | Buffer   // 文件内容
  names: string[]           // 原始名称数组（可能是多个导入路径）
  type: 'asset'             // 资源类型，固定为 'asset'
  fileName?: string         // Rollup 内部使用的文件名
}
```

**参数说明：**

| 属性 | 类型 | 说明 | 示例值 |
|------|------|------|--------|
| `name` | `string` | 文件名，包含扩展名 | `logo.png`、`style.css` |
| `source` | `string \| Buffer` | 文件的原始内容 | 二进制数据或文本 |
| `names` | `string[]` | 所有导入该资源时使用的名称 | `['./logo.png', '@/assets/logo.png']` |
| `type` | `'asset'` | 资源类型标识 | 固定为 `'asset'` |

#### 函数调用时机

Rollup 会对**每个静态资源**调用此函数，包括：
- CSS 文件
- 图片（png, jpg, gif, svg, webp, avif 等）
- 字体（woff2, woff, ttf, otf, eot 等）
- 媒体文件（mp4, webm, mp3 等）
- 其他资源（json, wasm 等）

#### 返回值说明

**返回值类型：** `string`

返回资源文件的输出路径（相对于 `outDir`）。

```javascript
// 返回相对路径
return 'css/style.css'           // 输出到 css/style.css
return 'static/images/logo.png'  // 输出到 static/images/logo.png

// 返回包含占位符的路径
return 'images/[name][extname]'  // 使用占位符动态生成
```

### 详细用法示例

#### 按文件类型分类

```javascript
assetFileNames: (assetInfo) => {
  const { name } = assetInfo

  // CSS 文件
  if (name.endsWith('.css')) {
    return 'css/[name]-[hash:8][extname]'
  }

  // 图片文件
  if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(name)) {
    return 'images/[name]-[hash:8][extname]'
  }

  // 字体文件
  if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
    return 'fonts/[name]-[hash:8][extname]'
  }

  // 媒体文件
  if (/\.(mp4|webm|ogg|mp3|wav|flac)$/i.test(name)) {
    return 'media/[name]-[hash:8][extname]'
  }

  // 其他资源
  return 'assets/[name]-[hash:8][extname]'
}
```

#### 根据文件名模式分类

```javascript
assetFileNames: (assetInfo) => {
  const { name } = assetInfo

  // 第三方库的资源
  if (name.includes('node_modules')) {
    return 'vendor/[name][extname]'
  }

  // SVG 图标
  if (name.startsWith('icon-') && name.endsWith('.svg')) {
    return 'icons/[name][extname]'
  }

  // 默认
  return 'assets/[name]-[hash:8][extname]'
}
```

#### 使用 names 数组判断来源

```javascript
assetFileNames: (assetInfo) => {
  const { name, names } = assetInfo

  // 检查是否来自特定目录
  const fromComponents = names.some(n => n.includes('/components/'))
  const fromAssets = names.some(n => n.includes('/assets/'))

  if (name.endsWith('.css')) {
    if (fromComponents) {
      return 'css/components/[name][extname]'
    }
    return 'css/[name][extname]'
  }

  if (fromAssets) {
    return 'assets/[name]-[hash:8][extname]'
  }

  return 'other/[name]-[hash:8][extname]'
}
```

#### 根据文件大小分类

```javascript
assetFileNames: (assetInfo) => {
  const { name, source } = assetInfo

  // 获取文件大小
  const size = typeof source === 'string'
    ? source.length
    : source.byteLength

  const sizeKB = size / 1024

  // 大文件单独处理
  if (sizeKB > 100) {
    return 'large-assets/[name]-[hash:8][extname]'
  }

  if (name.endsWith('.css')) {
    return 'css/[name][extname]'
  }

  return 'assets/[name]-[hash:8][extname]'
}
```

#### 完整的生产配置

```javascript
rollupOptions: {
  output: {
    assetFileNames: (assetInfo) => {
      const { name } = assetInfo

      // CSS 文件
      if (/\.css$/i.test(name)) {
        return 'static/css/[name]-[hash:8][extname]'
      }

      // 图片文件
      if (/\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)$/i.test(name)) {
        return 'static/images/[name]-[hash:8][extname]'
      }

      // 字体文件
      if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
        return 'static/fonts/[name]-[hash:8][extname]'
      }

      // 媒体文件
      if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i.test(name)) {
        return 'static/media/[name]-[hash:8][extname]'
      }

      // 其他文件
      return 'static/assets/[name]-[hash:8][extname]'
    }
  }
}
```

### 注意事项

1. **路径分隔符**：始终使用 `/`，Windows 会自动转换
   ```javascript
   // ✅ 正确
   return 'css/style.css'

   // ❌ 错误（但在某些环境可能工作）
   return 'css\\style.css'
   ```

2. **返回值不能为空**
   ```javascript
   // ❌ 错误：空字符串会导致问题
   return ''

   // ✅ 正确：至少返回文件名
   return '[name][extname]'
   ```

3. **避免路径冲突**：不同类型资源应使用不同目录
   ```javascript
   // ❌ 可能冲突：所有资源都在同一目录
   return '[name][extname]'

   // ✅ 正确：按类型分目录
   if (name.endsWith('.css')) return 'css/[name][extname]'
   if (name.endsWith('.png')) return 'images/[name][extname]'
   ```

4. **占位符只能在字符串中使用**
   ```javascript
   // ✅ 正确
   return 'images/[name][extname]'

   // ❌ 错误：函数中不能直接使用占位符变量
   return `images/${name}`  // 这是模板字符串，不是占位符
   ```

5. **hash 是内容哈希**：同一文件在不同构建中 hash 相同
   ```javascript
   // logo.png 内容不变 → hash 不变 → 缓存友好
   return 'images/[name]-[hash:8][extname]'
   ```

6. **处理未知文件类型**：始终提供默认分支
   ```javascript
   assetFileNames: (assetInfo) => {
     const { name } = assetInfo

     if (name.endsWith('.css')) return 'css/[name][extname]'
     if (/\.(png|jpg)$/.test(name)) return 'images/[name][extname]'

     // ✅ 默认分支很重要
     return 'assets/[name]-[hash:8][extname]'
   }
   ```

7. **source 可能是 Buffer**：处理大文件时注意内存
   ```javascript
   assetFileNames: (assetInfo) => {
     const { source } = assetInfo

     // source 可能是 Buffer，不要直接转换成字符串
     const size = Buffer.isBuffer(source)
       ? source.byteLength
       : source.length

     // ...
   }
   ```

8. **与 publicDir 的区别**
   - `publicDir` 中的文件直接复制，不经过 `assetFileNames`
   - `assetFileNames` 只处理通过 import 导入的资源

### 调试技巧

```javascript
assetFileNames: (assetInfo) => {
  // 打印所有资源信息（调试用）
  console.log('Asset:', {
    name: assetInfo.name,
    names: assetInfo.names,
    type: assetInfo.type
  })

  // 实际逻辑
  if (assetInfo.name.endsWith('.css')) {
    return 'css/[name][extname]'
  }
  return 'assets/[name][extname]'
}
```

### 输出目录结构示例

使用以下配置：
```javascript
assetFileNames: (assetInfo) => {
  const { name } = assetInfo
  if (name.endsWith('.css')) return 'static/css/[name]-[hash:8][extname]'
  if (/\.(png|jpg|svg)$/.test(name)) return 'static/images/[name]-[hash:8][extname]'
  if (/\.(woff2|ttf)$/.test(name)) return 'static/fonts/[name]-[hash:8][extname]'
  return 'static/assets/[name]-[hash:8][extname]'
}
```

**输出结构：**
```
dist/
├── index.html
├── js/
│   ├── main-abc123.js
│   └── vendor-def456.js
└── static/
    ├── css/
    │   ├── main-ghi789.css
    │   └── chunk-jkl012.css
    ├── images/
    │   ├── logo-mno345.png
    │   └── icon-pqr678.svg
    ├── fonts/
    │   ├── inter-stu901.woff2
    │   └── noto-vwx234.ttf
    └── assets/
        └── data-yza567.json
```

#### 格式配置

##### format

**类型**：`'es' | 'module' | 'cjs' | 'commonjs' | 'umd' | 'iife' | 'system' | 'amd'`

**默认值：`'es'`

输出模块格式。

```javascript
format: 'es'           // ES Module（推荐）
format: 'module'       // 同 'es'
format: 'cjs'          // CommonJS
format: 'commonjs'     // 同 'cjs'
format: 'umd'          // UMD（浏览器 + CommonJS + AMD）
format: 'iife'         // 立即执行函数（浏览器）
format: 'system'       // SystemJS
format: 'amd'          // AMD
```

##### exports

**类型**：`'default' | 'named' | 'auto' | 'default-only'`

**默认值：`'auto'`

控制导出方式。

```javascript
exports: 'auto'         // 自动检测
exports: 'default'      // 使用 default 导出
exports: 'named'        // 使用命名导出
exports: 'default-only' // 仅使用 default 导出
```

#### 全局变量配置

##### globals

**类型**：`{ [packageName: string ]: string }`

**默认值：`undefined`

UMD/IIFE 格式时，指定依赖包的全局变量名。

```javascript
// 对象形式
globals: {
  vue: 'Vue',
  'vue-router': 'VueRouter',
  axios: 'axios',
  lodash: '_'
}

// 实际效果
// 在 UMD 中变成：
// define(['Vue', 'VueRouter'], function (Vue, VueRouter) { ... })
```

#### 其他配置

##### compact

**类型**：`boolean`

**默认值：`true`（生产环境）

是否压缩输出代码（格式化）。

```javascript
compact: true   // 压缩（去除换行、空格）
compact: false  // 保留格式（便于调试）
```

##### interop

**类型**：`boolean`

**默认值：`true`

是否处理 interop（不同模块系统间的互操作）。

```javascript
interop: true   // 启用 interop
interop: false  // 禁用
```

##### preserveModules

**类型**：`boolean`

**默认值：`false`

是否保留模块结构（不合并模块）。

```javascript
preserveModules: true   // 保留原始模块结构
preserveModules: false  // 合并模块（默认）
```

当启用时，输出文件结构会保留原始模块结构：
```
src/
  components/
    Header.js
    Footer.js
  utils/
    index.js
```

##### preserveModulesRoot

**类型**：`string`

**默认值**：`undefined`

与 `preserveModules` 配合使用，指定保留模块的根目录。

```javascript
preserveModules: true,
preserveModulesRoot: 'src'
// 输出时会保留 src 目录结构
```

##### inlineDynamicImports

**类型**：`boolean`

**默认值：`undefined`

是否内联动态导入。

```javascript
inlineDynamicImports: true   // 动态导入转为静态导入
inlineDynamicImports: false  // 保持动态导入（默认）
```

#### 完整示例

```javascript
output: {
  // 文件名配置
  chunkFileNames: 'static/js/chunks/[name]-[hash:8].js',
  entryFileNames: 'static/js/[name]-[hash:8].js',
  assetFileNames: (assetInfo) => {
    const name = assetInfo.name
    if (name.endsWith('.css')) {
      return 'static/css/[name]-[hash:8][extname]'
    }
    if (/\.(png|jpe?g|gif|svg|webp)$/i.test(name)) {
      return 'static/images/[name]-[hash:8][extname]'
    }
    if (/\.(woff2?|ttf|otf|eot)$/i.test(name)) {
      return 'static/fonts/[name]-[hash:8][extname]'
    }
    return 'static/assets/[name]-[hash:8][extname]'
  },

  // 格式配置
  format: 'es',
  exports: 'auto',

  // 其他配置
  compact: true,
  interop: true,

  // 库模式时的全局变量
  globals: {
    vue: 'Vue',
    'vue-router': 'VueRouter'
  },

  // 手动代码分割
  manualChunks: (id) => {
    if (id.includes('node_modules')) {
      return 'vendor'
    }
  },

  // 高级配置
  sourcemap: true,
  sourcemapExcludeSources: true,

  // 实验性功能
  experimentalMinChunkSize: 10000
}
```

### manualChunks 详解

**类型**：`object | (id: string) => string | void`

**默认值**：`undefined`

`manualChunks` 用于手动控制代码分割策略，将模块打包到指定的 chunk 中。

#### 函数形式

```typescript
manualChunks: (id: string) => string | void
```

**参数说明：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | **模块的绝对路径**，表示当前正在处理的模块文件路径 |

**参数 `id` 示例值：**

```
/node_modules/.vite/deps/vue.js
/Users/xxx/project/src/components/Header.vue
/Users/xxx/project/node_modules/lodash-es/lodash.js
/Users/xxx/project/src/utils/index.js
```

**返回值说明：**

| 返回值 | 类型 | 作用 |
|--------|------|------|
| `string` | chunk 名称 | 将当前模块放入指定的 chunk，相同名称的模块会被打包到一起 |
| `undefined` / `void` | 无返回值 | 不进行特殊处理，使用 Rollup 的默认分割策略 |

**函数调用时机：**

Rollup 会对**每个模块**调用此函数，根据返回值决定该模块归属于哪个 chunk。

```javascript
// 基础用法
manualChunks: (id) => {
  // id 是模块的绝对路径
  console.log('processing:', id)

  // 将所有 node_modules 中的模块打包到 vendor
  if (id.includes('node_modules')) {
    return 'vendor'  // 返回 chunk 名称
  }

  // 将 components 目录的模块打包到 components chunk
  if (id.includes('src/components')) {
    return 'components'
  }

  // 其他模块不处理，使用默认策略
  // 等同于 return undefined
}

// 更精细的控制
manualChunks: (id) => {
  // Vue 生态单独打包
  if (id.includes('node_modules/vue') ||
      id.includes('node_modules/@vue') ||
      id.includes('node_modules/vue-router') ||
      id.includes('node_modules/pinia')) {
    return 'vue-vendor'
  }

  // UI 库单独打包
  if (id.includes('node_modules/element-plus') ||
      id.includes('node_modules/element-plus/')) {
    return 'ui-vendor'
  }

  // 工具库单独打包
  if (id.includes('node_modules/lodash') ||
      id.includes('node_modules/axios')) {
    return 'utils-vendor'
  }

  // 其他第三方依赖
  if (id.includes('node_modules')) {
    return 'vendor'
  }
}

// 使用 path 模块处理路径
import path from 'path'

manualChunks: (id) => {
  // 获取 node_modules 中的包名
  if (id.includes('node_modules')) {
    const match = id.match(/node_modules\/([^/]+)/)
    if (match) {
      const packageName = match[1]
      // 每个包单独一个 chunk（谨慎使用，chunk 数量会很多）
      return `vendor-${packageName}`
    }
    return 'vendor'
  }
}

// 根据模块大小动态分割
manualChunks: (id) => {
  // 大型框架单独打包
  const largeLibs = ['react-dom', 'vue', 'three']
  for (const lib of largeLibs) {
    if (id.includes(`node_modules/${lib}`)) {
      return lib
    }
  }

  // 其他 node_modules
  if (id.includes('node_modules')) {
    return 'vendor'
  }
}

// 结合 getManualChunk API（Rollup 高级用法）
manualChunks: (id, { getModuleInfo, getModuleIds }) => {
  // 获取模块信息
  const moduleInfo = getModuleInfo(id)
  if (moduleInfo && moduleInfo.isEntry) {
    return  // 入口模块不处理
  }

  // 遍历所有模块
  for (const moduleId of getModuleIds()) {
    // ...
  }
}
```

#### 对象形式

```javascript
// 对象形式：指定包名到 chunk 的映射
manualChunks: {
  // chunk 名称: 依赖包名数组
  vue: ['vue', 'vue-router', 'pinia'],
  ui: ['element-plus', '@element-plus/icons-vue'],
  utils: ['lodash-es', 'axios', 'dayjs']
}

// 效果：
// - vue、vue-router、pinia 会被打包到 vue-[hash].js
// - element-plus 相关打包到 ui-[hash].js
// - lodash、axios、dayjs 打包到 utils-[hash].js
```

#### 完整示例

```javascript
rollupOptions: {
  output: {
    // 配合 chunk 文件名
    chunkFileNames: 'js/[name]-[hash:8].js',

    // 函数形式的 manualChunks
    manualChunks: (id) => {
      // 1. 处理 Vue 核心
      if (/node_modules\/(vue|@vue|vue-router|pinia)/.test(id)) {
        return 'vue-core'
      }

      // 2. 处理 UI 库
      if (/node_modules\/(element-plus|ant-design-vue|@arco)/.test(id)) {
        return 'ui-lib'
      }

      // 3. 处理工具库
      if (/node_modules\/(lodash|axios|dayjs|clsx)/.test(id)) {
        return 'utils'
      }

      // 4. 处理图表库（通常较大）
      if (/node_modules\/(echarts|chart\.js|d3)/.test(id)) {
        return 'charts'
      }

      // 5. 其他第三方依赖
      if (id.includes('node_modules')) {
        return 'vendor'
      }
    }
  }
}
```

**注意事项：**

1. **chunk 名称不能冲突**：不同的模块返回相同的 chunk 名称会被打包在一起
2. **入口模块**：不要对入口模块进行分割，可能导致问题
3. **循环依赖**：错误的分割策略可能导致循环依赖问题
4. **HTTP 请求**：chunk 数量过多会导致 HTTP 请求增加，影响性能
5. **缓存策略**：合理分割可以提高缓存命中率（如 vendor 变化较少）
6. **路径检查**：使用 `includes` 时注意路径的唯一性，避免误判
7. **性能**：函数会对每个模块调用，避免复杂计算

**推荐分割策略：**

```javascript
// 推荐配置：按功能和变化频率分割
manualChunks: (id) => {
  // 第三方依赖（变化少，适合长期缓存）
  if (id.includes('node_modules')) {
    // 大型框架单独分块
    if (id.includes('node_modules/vue')) return 'vue'
    if (id.includes('node_modules/react')) return 'react'

    // UI 库单独分块
    if (id.includes('node_modules/element-plus')) return 'ui'

    // 其他依赖统一打包
    return 'vendor'
  }

  // 业务模块（变化频繁）
  if (id.includes('src/pages')) return 'pages'
  if (id.includes('src/components')) return 'components'
}
```

### minify

**类型**：`boolean | 'esbuild' | 'terser'`

**默认值**：`'esbuild'`

代码压缩工具选择。

| 值 | 说明 |
|----|------|
| `true` / `'esbuild'` | 使用 esbuild 压缩（快速） |
| `'terser'` | 使用 terser 压缩（更多选项，但较慢） |
| `false` | 不压缩 |

```javascript
// 使用 esbuild（默认）
minify: true
minify: 'esbuild'

// 使用 terser
minify: 'terser'

// 不压缩
minify: false

// 根据环境选择
minify: process.env.NODE_ENV === 'production' ? 'terser' : false
```

### terserOptions

**类型**：`TerserOptions`

**默认值**：详见 Terser 文档

Terser 压缩选项（仅当 `minify: 'terser'` 时生效）。

```javascript
terserOptions: {
  // 压缩选项
  compress: {
    drop_console: true,     // 删除 console
    drop_debugger: true,    // 删除 debugger
    pure_funcs: ['console.log'], // 仅删除特定函数
    passes: 2               // 压缩次数
  },

  // 格式化选项
  format: {
    comments: false,        // 删除注释
    preserve_annotations: false
  },

  // 其他选项
  ecma: 2015,
  keep_classnames: false,
  keep_fnames: false,
  module: true,
  safari10: false,
  toplevel: false
}
```

### write

**类型**：`boolean`

**默认值**：`true`

是否将构建结果写入磁盘。

```javascript
write: true   // 写入磁盘（默认）
write: false  // 不写入，用于插件模式
```

### emptyOutDir

**类型**：`boolean`

**默认值**：`true`（当 `outDir` 在 `root` 内时）

构建前是否清空输出目录。

```javascript
emptyOutDir: true   // 清空输出目录
emptyOutDir: false  // 保留已有文件

// 自定义判断
emptyOutDir: process.env.CI !== 'true'
```

### copyPublicDir

**类型**：`boolean`

**默认值**：`true`

是否复制 `publicDir` 内容到输出目录。

```javascript
copyPublicDir: true   // 复制
copyPublicDir: false  // 不复制
```

### manifest

**类型**：`boolean | string`

**默认值**：`false`

是否生成 manifest.json 文件（包含原始文件名到哈希文件名的映射）。

```javascript
// 生成 manifest.json
manifest: true

// 自定义文件名
manifest: 'manifest.json'
manifest: 'assets/manifest.json'
manifest: 'rev-manifest.json'

// 不生成
manifest: false
```

生成的 manifest 示例：
```json
{
  "main.js": "main-abc123.js",
  "style.css": "style-def456.css"
}
```

### ssrManifest

**类型**：`boolean | string`

**默认值**：`false`

是否生成 SSR manifest（用于 SSR 客户端 hydration）。

```javascript
ssrManifest: true
ssrManifest: 'ssr-manifest.json'
ssrManifest: false
```

### reportCompressedSize

**类型**：`boolean`

**默认值**：`true`

是否报告 gzip/brotli 压缩后的大小。

```javascript
reportCompressedSize: true   // 报告（默认）
reportCompressedSize: false  // 不报告（加快构建速度）
```

### chunkSizeWarningLimit

**类型**：`number`

**默认值**：`500`

chunk 大小警告阈值，单位 KB。

```javascript
// 设置警告阈值
chunkSizeWarningLimit: 500   // 500KB（默认）
chunkSizeWarningLimit: 1000  // 1MB
chunkSizeWarningLimit: 2000  // 2MB

// 禁用警告
chunkSizeWarningLimit: 0
```

### watch

**类型**：`boolean | null | WatcherOptions`

**默认值**：`false`

是否启用监听模式（构建时监听文件变化并重新构建）。

```javascript
// 禁用（默认）
watch: false

// 启用（使用默认配置）
watch: true

// 禁用（与 false 相同）
watch: null

// 详细配置
watch: {
  buildDelay: 1000,        // 重建延迟（毫秒）
  // 其他 chokidar 选项
  ignoreInitial: true,
  persistent: true
}
```

### commonjsOptions

**类型**：`CommonJSOptions`

CommonJS 转 ESM 的转换选项。

```javascript
commonjsOptions: {
  // 包含的文件
  include: [/node_modules/],
  // 排除的文件
  exclude: [/node_modules\/lodash-es/],

  // 扩展名
  extensions: ['.js', '.cjs'],

  // 其他选项
  ignoreTryCatch: false,
  ignoreGlobal: false,
  requireReturnsDefault: 'preferred',

  // ESMinify 选项
  esmExternals: false
}
```

### dynamicImportVarsOptions

**类型**：`DynamicImportVarsOptions`

动态导入变量选项。

```javascript
dynamicImportVarsOptions: {
  // 出错时是否警告
  warnOnError: true,

  // 排除的文件
  exclude: [/node_modules\/@babel\//]
}
```

### lib

**类型**：`false | LibraryOptions`

**默认值**：`false`

库模式配置，用于构建可复用的库。

```javascript
// 基本配置
lib: {
  entry: 'src/main.js',
  name: 'MyLib',
  fileName: 'my-lib',
  formats: ['es', 'umd']
}

// 多入口
lib: {
  entry: {
    main: 'src/main.js',
    utils: 'src/utils.js'
  },
  name: 'MyLib'
}

// fileName 使用函数
lib: {
  entry: 'src/index.js',
  name: 'MyComponentLib',
  fileName: (format) => {
    if (format === 'es') return 'my-lib.esm.js'
    if (format === 'umd') return 'my-lib.umd.js'
    return `my-lib.${format}.js`
  },
  formats: ['es', 'umd', 'cjs']
}

// 支持的格式
formats: ['es']      // ES Module
formats: ['cjs']     // CommonJS
formats: ['umd']     // UMD
formats: ['iife']    // 立即执行函数
formats: ['es', 'cjs', 'umd']  // 多种格式

// 禁用库模式
lib: false
```

### ssrEmitAssets

**类型**：`boolean`

**默认值**：`false`

SSR 构建时是否输出静态资源（CSS、图片等）。

```javascript
ssrEmitAssets: true   // 输出静态资源
ssrEmitAssets: false  // 仅输出 JS（默认）
```

## 作用

- 控制生产构建的输出
- 优化打包产物
- 配置代码分割策略
- 生成 sourcemap 用于调试

## 使用场景

1. **库开发**：使用 `lib` 模式构建库
2. **性能优化**：配置代码分割和 chunk 大小
3. **调试**：生成 sourcemap
4. **CDN 部署**：配置资源文件名和路径

## 注意事项

- `rollupOptions` 直接修改底层 Rollup 配置，需要了解 Rollup API
- `minify: 'terser'` 需要额外安装 `terser`：`npm add -D terser`
- `cssMinify: 'lightningcss'` 需要安装 `lightningcss`
- 库模式下 `index.html` 不会被处理
- `target` 的值会影响 `cssTarget` 的默认值

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `publicDir` | `copyPublicDir` 控制 public 内容是否复制 |
| `base` | 影响 `rollupOptions.output.assetFileNames` 路径 |
| `css` | CSS 相关配置优先于 `build` 中的 CSS 配置 |
| `mode` | 根据模式可以配置不同的构建选项 |

## 示例

```javascript
// 应用构建配置 - 完整版
export default {
  build: {
    // 输出配置
    outDir: 'dist',
    assetsDir: 'static',
    emptyOutDir: true,
    copyPublicDir: true,

    // 目标配置
    target: 'es2015',

    // SourceMap
    sourcemap: false,

    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },

    // 代码分割
    rollupOptions: {
      output: {
        // 文件命名
        chunkFileNames: 'static/js/[name]-[hash:8].js',
        entryFileNames: 'static/js/[name]-[hash:8].js',
        assetFileNames: 'static/[ext]/[name]-[hash:8].[ext]',

        // 手动分割
        manualChunks: (id) => {
          // node_modules 打包成 vendor
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          // 组件单独打包
          if (id.includes('src/components')) {
            return 'components'
          }
        },

        // 或对象形式的 manualChunks
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus'],
          utils: ['lodash-es', 'axios']
        }
      }
    },

    // Chunk 大小
    chunkSizeWarningLimit: 1000,

    // 是否生成 manifest
    manifest: 'manifest.json',

    // 是否报告压缩大小
    reportCompressedSize: false
  }
}

// 库构建配置
export default {
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'MyComponentLib',
      fileName: (format) => {
        const ext = format === 'es' ? 'mjs' : 'js'
        return `my-lib.${format}.${ext}`
      },
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // 外部依赖不打包
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter'
        }
      }
    },
    // 库通常不需要压缩，由使用者处理
    minify: false
  }
}

// 开发环境配置
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    build: {
      // 开发环境生成 sourcemap
      sourcemap: isDev,

      // 开发环境不压缩
      minify: isDev ? false : 'terser',

      // 开发环境更详细的 chunk 信息
      chunkSizeWarningLimit: isDev ? 100 : 500
    }
  }
})
```
