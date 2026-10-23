# build 配置

> 📖 [官方文档：Build Options](https://cn.vitejs.dev/config/build-options.html)

## 定义

`build` 用于配置生产构建（`vite build`）的行为，包括构建目标、产物输出、代码压缩、代码分割等。开发时的行为由 `server` 等配置控制，本页所有选项只对构建生效。

## 属性层级结构

```
build
├── target                      # 构建目标
├── modulePreload               # 模块预加载
│   └── polyfill
├── polyfillModulePreload       # （已废弃，改用 modulePreload.polyfill）
├── outDir                      # 输出目录
├── assetsDir                   # 静态资源目录
├── assetsInlineLimit           # 资源内联阈值
├── cssCodeSplit                # CSS 代码分割
├── cssTarget                   # CSS 转换目标
├── cssMinify                   # CSS 压缩器
├── sourcemap                   # sourcemap
├── rollupOptions               # Rollup 底层配置
│   ├── input / external / plugins / onwarn
│   ├── preserveEntrySignatures / preserveModules
│   └── output
│       ├── entryFileNames / chunkFileNames / assetFileNames
│       ├── manualChunks / inlineDynamicImports
│       ├── preserveModules / preserveModulesRoot
│       └── format / exports / globals / compact / interop / sourcemap
├── minify                      # JS 压缩器
├── terserOptions               # Terser 选项
├── write                       # 是否写盘
├── emptyOutDir                 # 是否清空输出目录
├── copyPublicDir               # 是否复制 public 目录
├── manifest / ssrManifest      # 产物清单
├── reportCompressedSize        # 报告压缩后体积
├── chunkSizeWarningLimit       # chunk 体积警告阈值
├── watch                       # 监听模式
├── commonjsOptions             # CJS 转 ESM 选项
├── dynamicImportVarsOptions    # 动态导入变量选项
├── lib                         # 库模式
│   ├── entry / name / fileName / formats
└── ssrEmitAssets               # SSR 构建输出静态资源
```

## 用法

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // 输出目录（默认 'dist'）
    outDir: 'dist',
    // 静态资源目录，相对于 outDir（默认 'assets'）
    assetsDir: 'assets',
    // 构建目标（Vite 7 起默认 'baseline-widely-available'）
    target: 'baseline-widely-available',
    // JS 压缩器（默认 'esbuild'，'terser' 需额外安装）
    minify: 'esbuild',
    // 生产构建默认不生成 sourcemap
    sourcemap: false,
    // 小于 4096 字节的资源内联为 base64 Data URL
    assetsInlineLimit: 4096,
    // 调整底层 Rollup 行为，例如手动分包
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor' // 第三方依赖单独分包
          }
        }
      }
    }
  }
})
```

## 子属性详解

### target

**类型**：`string | string[] | false`

**默认值**：`'baseline-widely-available'`（Vite 7 起由 `'modules'` 改为该值）

设置最终产物的浏览器兼容目标，esbuild 会据此决定哪些语法需要转译、哪些 polyfill 需要注入。

| 值 | 说明 |
|----|------|
| `'baseline-widely-available'` | 对应 Baseline「Widely Available」标准，即各主流浏览器已普遍支持 30 个月以上的特性（当前默认） |
| `'modules'` | 支持原生 ESM 的浏览器，映射为 `['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']`（旧版默认值） |
| `'esnext'` | 不转译，假定支持最新 ES 特性 |
| `'es2015'` ~ `'es2024'` | 指定 ES 年份版本 |
| `['chrome100', 'safari18']` | esbuild 格式的浏览器列表 |
| `'browserslist'` | 读取项目中的 browserslist 配置 |
| `false` | 关闭语法转译（需自行保证兼容性） |

```javascript
// 常见写法
build: {
  target: 'es2020',                          // 指定 ES 版本
  // target: ['chrome100', 'firefox100'],    // 多个浏览器目标
  // target: 'browserslist',                 // 使用 browserslist 配置
  // target: false                           // 不做语法转换
}
```

> ⚠️ **注意：** Vite 7 起 `target` 默认值变更为 `'baseline-widely-available'`，比旧的 `'modules'` 更现代。如果需要兼容更旧的浏览器（如 Safari 14/15），应显式设置该选项。

### modulePreload

**类型**：`boolean | { polyfill?: boolean, resolveDependencies?: Function }`

**默认值**：`{ polyfill: true }`

控制构建产物中 `<link rel="modulepreload">` 的注入行为。默认情况下 Vite 会注入一段 polyfill 脚本，用于处理直接 import 的 CSS 等非 ESM 资源的预加载。

```javascript
build: {
  modulePreload: true              // 启用（默认，等价于 { polyfill: true }）
  // modulePreload: false          // 完全关闭模块预加载
  // modulePreload: {
  //   polyfill: false             // 关闭 polyfill 注入（假定浏览器原生支持）
  // }
}
```

`resolveDependencies` 可自定义每个入口对应的预加载依赖列表（Vite 5.1 起支持），常用于 SSR 等需要干预依赖解析的场景。

### polyfillModulePreload

**类型**：`boolean`

**默认值**：`true`

**已废弃**：请改用 `build.modulePreload.polyfill`。

```javascript
// ❌ 旧写法（已废弃）
build: {
  polyfillModulePreload: false
}

// ✅ 新写法
build: {
  modulePreload: {
    polyfill: false
  }
}
```

### outDir

**类型**：`string`

**默认值**：`'dist'`

构建产物的输出目录，相对项目 `root` 解析；也可以写相对路径指向 root 之外，或写绝对路径。

```javascript
build: {
  outDir: 'dist',          // 默认值
  // outDir: 'build',                    // 自定义目录名
  // outDir: fileURLToPath(new URL('./output', import.meta.url))  // 绝对路径
}
```

> ⚠️ **注意：** 当 `outDir` 位于项目 `root` 之外时，Vite 默认**不会**清空该目录（见 `emptyOutDir`），构建时会在终端给出提示，避免误删 root 外的文件。

### assetsDir

**类型**：`string`

**默认值**：`'assets'`

静态资源（JS 产物、CSS、图片等）的存放目录，相对于 `outDir`。

```javascript
build: {
  assetsDir: 'static'  // 产物输出到 dist/static/ 下
}
```

库模式下，JS 产物文件名由 `lib.fileName` 决定，`assetsDir` 只影响 CSS 等静态资源的位置。

### assetsInlineLimit

**类型**：`number | ((filePath: string, content: Buffer) => boolean | undefined)`

**默认值**：`4096`（4KB）

小于该阈值（单位：字节）的导入资源会被内联为 base64 Data URL，否则生成独立文件。内联能减少请求数，但会增大 bundle 体积。

```javascript
build: {
  assetsInlineLimit: 0        // 不内联，所有资源都生成独立文件
  // assetsInlineLimit: 8192  // 8KB 以内的资源内联
  // assetsInlineLimit: (filePath, content) => {
  //   // 自定义规则：SVG 一律内联，其余走默认阈值
  //   if (filePath.endsWith('.svg')) return true
  // }
}
```

> 💡 **提示：** 函数形式的返回值为 `true` / `false` 时强制内联 / 不内联，返回 `undefined` 时回落到数值阈值逻辑；函数内不能抛出异常。Git LFS 占位文件、显式带 `?url` / `?raw` 声明的资源不会被内联。

### cssCodeSplit

**类型**：`boolean`

**默认值**：`true`

是否启用 CSS 代码分割。

```javascript
build: {
  cssCodeSplit: true   // 默认：异步 chunk 引入的 CSS 单独拆成文件，按需加载
  // cssCodeSplit: false  // 所有 CSS 合并成一个大文件，页面加载时一次性引入
}
```

> 💡 **提示：** 库模式下默认关闭 CSS 分割，所有样式会聚合到一个文件中。

### cssTarget

**类型**：`string | string[]`

**默认值**：与 `build.target` 一致

CSS 的降级 / 压缩目标，用于控制 CSS 语法（如嵌套、自定义属性降级）的处理程度。只有当产物面向非主流浏览器时才需要单独设置。

```javascript
build: {
  target: 'esnext',         // JS 保持最新语法
  cssTarget: 'chrome61'     // CSS 单独降级到更旧的目标
}
```

### cssMinify

**类型**：`boolean | 'esbuild' | 'lightningcss'`

**默认值**：`true`（使用 esbuild）

CSS 压缩器选择。`'lightningcss'` 需要安装 `lightningcss` 依赖。

```javascript
build: {
  cssMinify: true                // 默认：用 esbuild 压缩
  // cssMinify: 'lightningcss'   // 改用 lightningcss（需 npm add -D lightningcss）
  // cssMinify: false            // 不压缩 CSS
}
```

### sourcemap

**类型**：`boolean | 'inline' | 'hidden'`

**默认值**：`false`

是否生成 sourcemap，便于定位生产环境报错。

| 值 | 说明 |
|----|------|
| `false` | 不生成（默认，产物体积最小） |
| `true` | 生成独立 `.map` 文件并在产物末尾引用 |
| `'inline'` | 以 Data URI 形式内联到产物中（产物变大，但不会多发请求） |
| `'hidden'` | 生成 `.map` 文件但不在产物中引用，适合交给错误监控平台 |

```javascript
build: {
  sourcemap: true       // 生成并引用 .map 文件
  // sourcemap: 'hidden'  // 生成但不在代码中引用
}
```

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    build: {
      // 按模式区分：预发/测试环境出问题需要排查时开启
      sourcemap: mode === 'staging' ? 'hidden' : false
    }
  }
})
```

### rollupOptions

**类型**：`RollupOptions`

直接透传给底层 Rollup 的选项，用于定制 Vite 默认没有覆盖的构建行为，例如多入口、外部化依赖、自定义输出等。常用子项：

```javascript
build: {
  rollupOptions: {
    // 多入口
    input: {
      main: 'src/main.js',
      admin: 'src/admin.js'
    },

    // 外部化依赖：不参与打包，运行时从外部获取
    // external: ['vue', 'vue-router'],
    external: (id) => id.startsWith('@my-scope/'),

    // 追加 Rollup 插件（区别于 Vite 插件，缺少部分 Vite 专属钩子）
    plugins: [],

    // 过滤构建警告
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return // 忽略循环依赖警告
      warn(warning)
    },

    // 控制入口导出是否可被 tree-shaking（默认 'auto'）
    preserveEntrySignatures: 'strict',

    // 保留原始模块结构，不打包成单文件（常用于发布未打包的库）
    preserveModules: false,

    // 输出配置，见下文
    output: {}
  }
}
```

> ⚠️ **注意：** `rollupOptions` 会影响 Vite 内部的默认值合并（例如改掉 `output.entryFileNames` 会覆盖 Vite 生成 HTML 引用的文件名），修改前建议先了解 Rollup 对应文档。

#### output 详解

**类型**：`OutputOptions | OutputOptions[]`

Rollup 输出配置，控制产物文件名、模块格式、分包策略等。

##### entryFileNames / chunkFileNames / assetFileNames

三者分别控制入口文件、异步 chunk、静态资源的命名模板。

| 选项 | 类型 | Vite 默认值（含 assetsDir 前缀） |
|------|------|----------------------------------|
| `entryFileNames` | `string \| ((chunkInfo) => string)` | `assets/[name]-[hash].js` |
| `chunkFileNames` | `string \| ((chunkInfo) => string)` | `assets/[name]-[hash].js` |
| `assetFileNames` | `string \| ((assetInfo) => string)` | `assets/[name]-[hash][extname]` |

> 💡 **提示：** Rollup 本身的默认值是 `[name].js`（入口）与 `[name]-[hash].js`（chunk），Vite 会在其上加上 `assetsDir` 前缀并统一带内容 hash，这是产物能长期缓存的关键。

```javascript
build: {
  rollupOptions: {
    output: {
      // 入口文件命名
      entryFileNames: 'js/[name]-[hash].js',
      // 异步 chunk 命名
      chunkFileNames: 'js/[name]-[hash:8].js',   // [hash:8] 限制哈希长度为 8 位
      // 静态资源命名（字符串模板）
      assetFileNames: 'static/[ext]/[name]-[hash:8][extname]'
    }
  }
}
```

可用占位符：

| 占位符 | 说明 | 示例值 |
|--------|------|--------|
| `[name]` | chunk / 资源名称 | `vendor`、`logo` |
| `[hash]` | 内容哈希，内容不变则 hash 不变 | `B2HPk1mF` |
| `[hash:n]` | 限制哈希长度为 n 位 | `B2HPk1mF` 的前 8 位 |
| `[format]` | 输出格式（模块名） | `es`、`umd` |
| `[ext]` | 扩展名（**不含**点） | `png` |
| `[extname]` | 扩展名（**含**点） | `.png` |

`assetFileNames` 的函数形式常用于按类型分目录：

```javascript
build: {
  rollupOptions: {
    output: {
      assetFileNames(assetInfo) {
        // Rollup 4 起资源名放在 names 数组中
        const name = assetInfo.names?.[0] ?? ''

        if (/\.css$/i.test(name)) {
          return 'static/css/[name]-[hash:8][extname]'      // CSS
        }
        if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(name)) {
          return 'static/images/[name]-[hash:8][extname]'   // 图片
        }
        if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
          return 'static/fonts/[name]-[hash:8][extname]'    // 字体
        }
        if (/\.(mp4|webm|ogg|mp3|wav)$/i.test(name)) {
          return 'static/media/[name]-[hash:8][extname]'    // 媒体
        }
        return 'static/assets/[name]-[hash:8][extname]'     // 兜底，避免遗漏类型
      }
    }
  }
}
```

对应的 `AssetInfo` 关键字段：

```typescript
interface AssetInfo {
  names: string[]               // 资源名列表（一般取 names[0]）
  source: string | Uint8Array   // 文件内容，可能是二进制
  type: 'asset'                 // 固定为 'asset'
}
```

使用注意：

1. 路径分隔符统一写 `/`，Windows 下由 Vite 自动处理。
2. 必须返回非空路径，且建议始终保留 `[hash]` 占位符——丢失 hash 会让内容不同的文件互相覆盖，缓存失效。
3. 占位符只能写在**返回的字符串模板**里参与替换；函数内 `assetInfo.names[0]` 拿到的是真实文件名，可以直接拼进路径。
4. `public/` 目录的文件是原样复制，不经过 `assetFileNames`。

##### format

**类型**：`'es' | 'cjs' | 'umd' | 'iife' | 'system' | 'amd'`

**默认值**：`'es'`

输出模块格式。应用构建使用默认 `'es'` 即可；`'umd'` / `'iife'` 主要用于库模式（需配合 `globals` / `lib.name`）。

```javascript
output: {
  format: 'es'      // ES Module，浏览器与打包器通用（默认）
  // format: 'cjs'     // CommonJS，Node.js 环境
  // format: 'umd'     // UMD，兼容浏览器全局变量 / CJS / AMD
  // format: 'iife'    // 立即执行函数，通过 script 标签直接引入
}
```

##### exports

**类型**：`'auto' | 'default' | 'named' | 'none'`

**默认值**：`'auto'`

控制 CJS 环境消费 ESM 产物时的导出模式。`'auto'` 由 Rollup 根据入口的实际导出自动推断；`'none'` 表示不生成导出。

```javascript
output: {
  exports: 'named'   // 显式声明使用命名导出，避免 CJS 引用 default 多余一层
}
```

##### globals

**类型**：`{ [packageName: string]: string }`

**默认值**：`undefined`

`format` 为 `'umd'` / `'iife'` 时，把外部化依赖映射为全局变量名，否则产物会报「依赖未定义」。

```javascript
output: {
  format: 'umd',
  globals: {
    vue: 'Vue',                        // import vue → 访问全局 Vue
    'vue-router': 'VueRouter',
    axios: 'axios'
  }
}
```

##### compact

**类型**：`boolean`

**默认值**：`false`

尽可能压缩输出的空白字符。真正的代码压缩由 `build.minify` 负责，一般无需改动此项。

```javascript
output: {
  compact: true   // 仅做有限空白压缩，不等于 minify
}
```

##### interop

**类型**：`'compat' | 'auto' | 'esModule' | 'default' | 'defaultOnly'`

**默认值**：`'default'`

控制 Rollup 如何处理 ESM 与 CJS 互操作时的 `default` 导出解析。通常保持默认即可，仅在产物被特殊环境消费时调整。

```javascript
output: {
  interop: 'default'   // 默认：把外部依赖的 default 导出当作模块本身
}
```

##### preserveModules

**类型**：`boolean`

**默认值**：`false`

保留原始模块结构输出，每个模块生成一个文件，而不是打包合并。常用于发布需要保留文件结构的库，配合 `preserveModulesRoot` 去掉路径前缀。

```javascript
output: {
  preserveModules: true,        // 保留模块结构
  preserveModulesRoot: 'src'    // 去掉 src/ 前缀，产物从 src 下一级开始映射
}
```

##### inlineDynamicImports

**类型**：`boolean`

**默认值**：`false`

将动态 `import()` 内联为静态导入，产物合并为单文件。开启后不能再做代码分割，且与多入口配置互斥。库模式下单入口时 Vite 会自动开启。

```javascript
output: {
  inlineDynamicImports: true   // 适合只需单个产物文件的场景
}
```

##### 其他常用 output 选项

```javascript
output: {
  sourcemap: true,                    // 覆盖 build.sourcemap，仅对该输出生效
  sourcemapExcludeSources: true,      // sourcemap 中不包含源码内容
  minifyInternalExports: true,        // 压缩内部导出名
  experimentalMinChunkSize: 20000     // 尝试合并过小的 chunk（字节，实验性）
}
```

##### manualChunks

**类型**：`{ [chunkName: string]: string[] } | ((id: string, ctx) => string | void)`

**默认值**：`undefined`

手动控制分包，把指定模块归入同一个 chunk。

函数形式的 `id` 是**模块的绝对路径**，返回字符串即 chunk 名，返回 `undefined` 交给 Rollup 默认策略：

```javascript
output: {
  manualChunks(id) {
    // Vue 生态单独分包，变化少、适合长期缓存
    if (/node_modules\/(vue|@vue|vue-router|pinia)\//.test(id)) {
      return 'vue-vendor'
    }
    // UI 库
    if (/node_modules\/(element-plus|@element-plus)\//.test(id)) {
      return 'ui-vendor'
    }
    // 工具库
    if (/node_modules\/(lodash-es|axios|dayjs)\//.test(id)) {
      return 'utils-vendor'
    }
    // 其余第三方依赖
    if (id.includes('node_modules')) {
      return 'vendor'
    }
    // 业务代码返回 undefined，走默认分割策略
  }
}
```

对象形式按包名列出映射，更直观但灵活性低：

```javascript
output: {
  manualChunks: {
    vue: ['vue', 'vue-router', 'pinia'],
    ui: ['element-plus'],
    utils: ['lodash-es', 'axios', 'dayjs']
  }
}
```

> ⚠️ **注意：** 不要把所有依赖塞进一个 vendor 大包，也不要按业务页面逐个强拆——前者让缓存失效更快，后者会产生过多小请求。分包后若出现「Cannot access xx before initialization」类报错，通常是手动分包引入了循环引用，应调整分组或改回默认策略。

### minify

**类型**：`boolean | 'esbuild' | 'terser'`

**默认值**：`'esbuild'`

JS 压缩器选择。

| 值 | 说明 |
|----|------|
| `true` / `'esbuild'` | esbuild 压缩，速度快（默认） |
| `'terser'` | 压缩配置更丰富，但慢很多，需 `npm add -D terser` |
| `false` | 不压缩 |

```javascript
build: {
  minify: 'esbuild'   // 默认
  // minify: 'terser'  // 需要更细粒度的压缩控制时使用
  // minify: false     // 调试构建产物时临时关闭
}
```

### terserOptions

**类型**：`EsbuildTerserOptions`

**默认值**：`undefined`（由 Terser 自身默认行为决定）

仅当 `minify: 'terser'` 时生效的 Terser 配置。

```javascript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,              // 移除所有 console.*
      drop_debugger: true,             // 移除 debugger
      passes: 2                        // 多跑一轮压缩，体积更小但更慢
    },
    format: {
      comments: false                  // 删除注释
    }
  }
}
```

> 💡 **提示：** 只想移除特定函数（如 `console.log`）时用 `compress.pure_funcs: ['console.log']`，比 `drop_console: true` 更细。

### write

**类型**：`boolean`

**默认值**：`true`

是否把产物写入磁盘。设为 `false` 时只返回产物在内存中的描述，用于以编程方式消费构建结果的插件场景，日常项目无需改动。

```javascript
build: {
  write: true   // 默认写入磁盘
  // write: false  // 程序化调用 build() 时只在内存中产出
}
```

### emptyOutDir

**类型**：`boolean`

**默认值**：`outDir` 位于项目 `root` 内时为 `true`，否则为 `false`

构建前是否清空输出目录，防止上一次构建的旧文件残留。

```javascript
build: {
  outDir: 'dist',
  emptyOutDir: true    // 默认行为：构建前清空 dist
  // emptyOutDir: false  // 保留输出目录中已有文件（增量式输出）
}
```

> ⚠️ **注意：** 当 `outDir` 在 `root` 之外时，出于安全考虑 Vite 不会自动清空，需要清空必须显式写 `emptyOutDir: true`。

### copyPublicDir

**类型**：`boolean`

**默认值**：`true`

是否把 `public` 目录内容原样复制到 `outDir`。资源全部走构建管线（如打包进库的产物）时可以关闭。

```javascript
build: {
  copyPublicDir: true   // 默认复制 public/ → dist/
  // copyPublicDir: false  // 不复制
}
```

### manifest

**类型**：`boolean | string`

**默认值**：`false`

构建时生成一份「源文件 → 带哈希产物」的清单文件（默认为 `outDir/manifest.json`），供后端渲染层等外部服务查找真实产物路径。字符串形式可自定义文件名（相对 `outDir`）。

```javascript
build: {
  manifest: true
  // manifest: 'manifests/my-manifest.json'  // 自定义文件名
}
```

生成的清单结构大致如下（键是源码模块 / 入口的 id）：

```json
{
  "index.html": {
    "file": "assets/index-B2HPk1mF.js",
    "name": "index",
    "src": "index.html",
    "isEntry": true,
    "css": ["assets/index-DmFfHl2k.css"]
  }
}
```

### ssrManifest

**类型**：`boolean | string`

**默认值**：`false`

生成 SSR 场景使用的清单文件（默认 `outDir/ssr-manifest.json`），记录客户端产物中的动态依赖信息，供服务端渲染时预加载和收集客户端资源使用。字符串形式可自定义文件名。

```javascript
build: {
  ssrManifest: true
  // ssrManifest: 'manifests/ssr-manifest.json'
}
```

### reportCompressedSize

**类型**：`boolean`

**默认值**：`true`

构建结束时是否计算并输出每个文件的 gzip / brotli 压缩后体积。计算压缩体积在大项目中有明显开销，CI 中追求构建速度时可以关闭。

```javascript
build: {
  reportCompressedSize: false   // 关闭体积报告，加快构建
}
```

### chunkSizeWarningLimit

**类型**：`number`

**默认值**：`500`（单位 kB）

chunk 的体积警告阈值，超过该值时 Vite 会在构建日志中提示体积过大。

```javascript
build: {
  chunkSizeWarningLimit: 1000   // 提高到 1000 kB 再触发警告
}
```

> 💡 **提示：** 调大阈值只是隐藏警告，更好的做法是通过 `manualChunks` 或动态导入把大 chunk 拆小。

### watch

**类型**：`object | null`

**默认值**：`null`

构建监听模式，文件变化后自动重新构建，适合「边改边构建产物」的集成场景。设为 `{}` 启用并使用默认监听选项；也可通过 CLI 的 `vite build --watch` 开启。

```javascript
build: {
  watch: {
    buildDelay: 100   // 变化触发重建的防抖延迟（毫秒）
    // 其余为 Rollup 的 WatchOptions（基于 chokidar）
  }
}
```

### commonjsOptions

**类型**：`CommonJSOptions`

**默认值**：`{ include: [/node_modules/], extensions: ['.js', '.cjs'] }`

传递给 `@rollup/plugin-commonjs` 的选项，用于把 CommonJS 依赖转换为 ESM。

```javascript
build: {
  commonjsOptions: {
    include: [/node_modules/],             // 默认只处理 node_modules
    exclude: [/node_modules\/some-pkg/],   // 排除特定包
    extensions: ['.js', '.cjs'],           // 默认处理的扩展名
    requireReturnsDefault: 'auto',         // require 一个 ESM 模块时的返回策略
    esmExternals: true                     // ESM 形式的外部依赖处理方式
  }
}
```

### dynamicImportVarsOptions

**类型**：`DynamicImportVarsOptions`

**默认值**：`{ warnOnError: false, exclude: [] }`

传递给 `@rollup/plugin-dynamic-import-vars` 的选项，处理 `import(变量表达式)` 这类动态导入。

```javascript
build: {
  dynamicImportVarsOptions: {
    warnOnError: true,                     // 解析失败时输出警告而不是静默忽略
    exclude: [/node_modules/]              // 排除不需要处理的路径
  }
}
```

### lib

**类型**：`false | LibraryOptions`

**默认值**：`false`

库模式配置。设置后 Vite 以「发布一个库」为目标构建：入口不再要求是 `index.html`，产物按 `formats` 输出多种模块格式。

```javascript
build: {
  lib: {
    // 入口：字符串、字符串数组或对象（多入口）
    entry: 'src/index.js',
    // UMD / IIFE 格式的全局变量名，仅输出 es/cjs 时可省略
    name: 'MyLib',
    // 产物文件名，默认取 name；字符串或 (format) => string
    fileName: 'my-lib',
    // 输出格式，默认 ['es', 'umd']（未设置 name 时默认 ['es']）
    formats: ['es', 'umd']
  },
  // 库的使用者自己安装依赖，因此外部化 peer 依赖
  rollupOptions: {
    external: ['vue'],
    output: {
      globals: {
        vue: 'Vue'
      }
    }
  }
}
```

```javascript
// 多入口 + 自定义文件名
build: {
  lib: {
    entry: {
      main: 'src/index.js',
      utils: 'src/utils.js'
    },
    name: 'MyLib',
    fileName: (format) => `my-lib.${format}.js`   // 如 my-lib.es.js、my-lib.umd.js
  }
}
```

> ⚠️ **注意：** 库模式下 `index.html` 不参与构建；`lib.name` 在输出 `umd` / `iife` 格式时必须提供；CSS 默认聚合为单个文件随包发布。

### ssrEmitAssets

**类型**：`boolean`

**默认值**：`false`

SSR 构建时是否也输出 CSS、图片等静态资源文件。默认关闭是因为这些资源通常会由客户端构建产出，SSR 侧不需要重复输出；使用自定义 SSR 框架时按需开启。

```javascript
build: {
  ssrEmitAssets: true   // SSR 构建也输出静态资源
}
```

## 定义类型

```typescript
interface BuildOptions {
  target?: string | string[] | false
  modulePreload?: boolean | { polyfill?: boolean, resolveDependencies?: Function }
  polyfillModulePreload?: boolean          // 已废弃，改用 modulePreload.polyfill
  outDir?: string
  assetsDir?: string
  assetsInlineLimit?: number | ((filePath: string, content: Buffer) => boolean | undefined)
  cssCodeSplit?: boolean
  cssTarget?: string | string[]
  cssMinify?: boolean | 'esbuild' | 'lightningcss'
  sourcemap?: boolean | 'inline' | 'hidden'
  rollupOptions?: RollupOptions
  minify?: boolean | 'esbuild' | 'terser'
  terserOptions?: EsbuildTerserOptions
  write?: boolean
  emptyOutDir?: boolean
  copyPublicDir?: boolean
  manifest?: boolean | string
  ssrManifest?: boolean | string
  reportCompressedSize?: boolean
  chunkSizeWarningLimit?: number
  watch?: object | null
  commonjsOptions?: CommonJSOptions
  dynamicImportVarsOptions?: DynamicImportVarsOptions
  lib?: false | LibraryOptions
  ssrEmitAssets?: boolean
}
```

**默认值对照：**

```javascript
{
  target: 'baseline-widely-available',   // Vite 7 起；旧版为 'modules'
  modulePreload: { polyfill: true },
  outDir: 'dist',
  assetsDir: 'assets',
  assetsInlineLimit: 4096,
  cssCodeSplit: true,
  cssTarget: undefined,                  // 实际取 build.target 的值
  cssMinify: true,                       // 使用 esbuild
  sourcemap: false,
  rollupOptions: {},
  minify: 'esbuild',
  terserOptions: undefined,
  write: true,
  emptyOutDir: undefined,                // outDir 在 root 内时视为 true
  copyPublicDir: true,
  manifest: false,
  ssrManifest: false,
  reportCompressedSize: true,
  chunkSizeWarningLimit: 500,            // 单位 kB
  watch: null,
  commonjsOptions: { include: [/node_modules/], extensions: ['.js', '.cjs'] },
  dynamicImportVarsOptions: { warnOnError: false, exclude: [] },
  lib: false,
  ssrEmitAssets: false
}
```

## 作用与使用场景

- **产出可部署的静态产物**：转译到指定 `target`、压缩、按 `outDir` / `assetsDir` 组织输出。
- **性能优化**：通过 `rollupOptions.output.manualChunks` 与动态导入控制分包，用 `chunkSizeWarningLimit` 监控大 chunk。
- **问题排查**：开启 `sourcemap` 把线上报错映射回源码。
- **库开发**：`lib` 模式输出多格式产物，配合 `rollupOptions.external` / `globals` 处理依赖。
- **与部署环境协作**：`manifest` 供后端或 CDN 系统查找哈希产物；`emptyOutDir` / `copyPublicDir` 控制输出目录行为。

## 示例

### 应用构建完整配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // 输出
    outDir: 'dist',
    assetsDir: 'static',
    emptyOutDir: true,

    // 目标与压缩
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },

    // 产物命名与分包
    rollupOptions: {
      output: {
        chunkFileNames: 'static/js/[name]-[hash:8].js',
        entryFileNames: 'static/js/[name]-[hash:8].js',
        assetFileNames: 'static/[ext]/[name]-[hash:8][extname]',
        manualChunks(id) {
          if (/node_modules\/(vue|@vue|vue-router|pinia)\//.test(id)) {
            return 'vue-vendor'
          }
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    },

    // 体积与调试
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    reportCompressedSize: false
  }
})
```

### 库构建配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'MyComponentLib',
      fileName: (format) => `my-lib.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // 依赖由使用者提供，不打包进库
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter'
        }
      }
    },
    // 库产物一般不压缩，交给使用方按需处理
    minify: false
  }
})
```

### 按模式区分构建行为

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    build: {
      // 生产不压缩产物？仅在灰度排查时临时使用
      minify: isProd ? 'esbuild' : false,
      sourcemap: !isProd,
      chunkSizeWarningLimit: isProd ? 500 : 2000
    }
  }
})
```

## 注意事项

- `rollupOptions` 直接操作底层 Rollup，改动 `output` 相关默认值可能影响 HTML 引用与分包行为，修改前先确认影响面。
- `minify: 'terser'` 与 `cssMinify: 'lightningcss'` 都需要额外安装对应依赖：`npm add -D terser` / `npm add -D lightningcss`。
- `emptyOutDir` 在 `outDir` 位于 `root` 外时默认为 `false`，避免误删目录外文件。
- 库模式下 `index.html` 不参与构建，CSS 会聚合为单文件。
- `build.target` 的取值决定 `cssTarget` 的默认值；`target: false` 时不做语法转译，兼容性自行负责。
- 生产构建只在 `vite build` 时生效，`vite`（dev server）行为不受本节选项影响。

## 与其他配置的关系

| 配置 | 关系说明 |
|------|----------|
| `publicDir` | 是否复制由 `build.copyPublicDir` 控制，文件本身不经构建管线处理 |
| `base` | 决定产物中资源引用的 URL 前缀，与 `assetFileNames` 的相对路径叠加 |
| `css.*` | `css.preprocessorOptions` 等控制预处理行为，构建期同样生效；压缩由 `build.cssMinify` 控制 |
| `mode` | 通过 `defineConfig(({ mode }) => ...)` 按模式返回不同的 `build` 配置 |
