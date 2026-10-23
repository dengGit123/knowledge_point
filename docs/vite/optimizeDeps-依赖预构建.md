# optimizeDeps 配置

> 📖 [官方文档：Dep Optimization Options](https://cn.vitejs.dev/config/dep-optimization-options.html)
>
> 📖 [官方文档：依赖预构建指南](https://cn.vitejs.dev/guide/dep-pre-bundling.html)

## 定义

`optimizeDeps` 配置依赖预构建（Dependency Pre-Bundling）行为。Vite 首次启动开发服务器时用 esbuild 对依赖进行预构建，目的有两个：

1. **格式转换**：浏览器只能识别 ESM，预构建把 CommonJS / UMD 格式的依赖转换为 ESM；
2. **减少请求**：把依赖内部的大量小模块（如 lodash-es 有 600+ 个模块）合并为单文件，避免开发时的瀑布式请求。

**类型**：

```typescript
{
  include?: string | string[]
  exclude?: string | string[]
  /** @experimental 内部/实验性字段，通常无需手动配置 */
  needsInterop?: string[]
  esbuildOptions?: EsbuildOptions
  force?: boolean
  /** @deprecated Vite 5.1 起弃用 */
  disabled?: boolean | 'build' | 'dev'
  noDiscovery?: boolean
  holdUntilCrawlEnd?: boolean
  entries?: string | string[]
}
```

> ⚠️ **注意：** 官方文档没有给出 `optimizeDeps` 的整体默认值，各子项说明以官方逐项描述为准（见下文）。

## 子属性详解

### include

**类型**：`string | string[]`

强制预构建指定的依赖。默认情况下，只有依赖扫描器从入口静态分析出的依赖才会被预构建；不在 `node_modules` 中的 linked 包（Monorepo 场景）无法被扫描发现，必须显式加入 `include`。

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 冷启动即预构建核心依赖，避免开发中"发现新依赖"引发二次预构建和整页刷新
    include: ['vue', 'vue-router', 'pinia'],

    // Monorepo / linked 包（不在 node_modules 中，扫描器发现不了）
    // include: ['@my-app/shared']

    // 深层导入路径也可以（官方示例写法）
    // include: ['my-lib/deep/file']
  }
}
```

```javascript
// ❌ include 不支持 glob 模式，必须是可解析的导入路径
include: ['@my-app/*']

// ✅ glob 只用于 entries（它指定扫描入口，不是依赖列表）
entries: ['src/**/*.ts']
```

### exclude

**类型**：`string | string[]`

排除预构建的依赖，这些依赖在开发时会按原始形式（不打包）直接被浏览器消费，因此要求本身是 ESM 或能被其他插件正常处理。

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // Monorepo 本地包：希望改动即时生效、不走缓存时排除
    exclude: ['@my-app/local-pkg']
  }
}
```

### needsInterop

**类型**：`string[]`（在 Vite 类型定义中标注为 `@experimental`）

**内部 / 实验性字段**，Vite 用它记录预构建过程中哪些依赖需要 CJS 到 ESM 的默认导出互操作。官方配置文档并未把它列为公开配置项，通常**无需手动配置**：

- 预构建会自动完成 CommonJS 依赖的互操作（给 `module.exports` 形式的包补上 default 导出）；
- lodash-es 这类纯 ESM 包本身不需要任何互操作，为它配置 `needsInterop` 没有意义；
- 遇到默认导出相关报错时，正确做法是把依赖加入 `include` 确保它被预构建，而不是设置 `needsInterop`。

### esbuildOptions

**类型**：`EsbuildOptions`

传递给 esbuild 的选项，**只作用于依赖扫描与预构建过程，不影响业务源码**。部分选项由 Vite 固定（如 `entryPoints`、`outdir`、`format` 等），修改它们会破坏预构建；`external` 不可用，请改用 `optimizeDeps.exclude`。

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    esbuildOptions: {
      // 预构建产物的语法目标
      target: 'es2020',

      // 全局替换：⚠️ 只影响被预构建的依赖
      define: {
        global: 'globalThis'
      },

      // Loader 映射：预构建的依赖里含特殊语法时才需要
      loader: {
        '.js': 'jsx'
      },

      // esbuild 插件：介入预构建过程
      // plugins: [myEsbuildPlugin()]
    }
  }
}
```

> ⚠️ **注意：** `esbuildOptions.define` 只对被预构建的依赖生效。`__VUE_OPTIONS_API__`、`__VUE_PROD_DEVTOOLS__` 这类 Vue 编译期常量必须配置在**顶层的 `define`** 选项中，放在 `esbuildOptions.define` 里不会影响业务代码。

### force

**类型**：`boolean`

强制忽略已缓存的预构建结果，重新执行预构建。等价手段：CLI 加 `--force`，或删除 `node_modules/.vite` 目录。

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 每次启动都重新预构建（排查问题时临时使用）
    force: true
  }
}
```

### disabled（已弃用）

**类型**：`boolean | 'build' | 'dev'`

> ⚠️ **注意：** Vite 5.1 起弃用。构建期间的依赖优化已被移除（生产构建由 Rollup 直接处理依赖），该选项不再有意义，未来版本将删除。若要禁止开发时的自动依赖发现，改用 `noDiscovery: true` 并保持 `include` 为空。

```javascript
// ❌ 旧写法（已弃用）
optimizeDeps: {
  disabled: true
}

// ✅ 新写法
optimizeDeps: {
  noDiscovery: true,
  include: []
}
```

### noDiscovery

**类型**：`boolean`

**默认值**：`false`

禁用自动依赖发现，只有 `include` 中列出的依赖会被预构建。

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 关闭自动扫描，依赖范围完全由 include 控制
    noDiscovery: true,
    include: ['vue', 'vue-router']
  }
}
```

### holdUntilCrawlEnd

**类型**：`boolean`

**默认值**：`true`（实验性，Vite 5.1 新增）

开启时（默认），冷启动阶段 Vite 会**挂起**初次访问的源码请求，直到入口静态导入的所有依赖都被抓取（crawl）并完成预构建后才放行，从而避免"发现新依赖 → 重新预构建 → 整页刷新"的连锁反应。

设为 `false` 时请求不再被挂起、页面能更早响应，但代价是开发中可能出现多次整页刷新。

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 允许请求先行，接受可能的整页刷新
    holdUntilCrawlEnd: false
  }
}
```

### entries

**类型**：`string | string[]`

指定依赖扫描的入口。默认行为：Vite 爬取项目中所有 `.html` 文件来发现入口（忽略 `node_modules`、`build.outDir`、`__tests__`、`coverage`）；若设置了 `build.rollupOptions.input`，则以它为准。两者都不满足需求（如非 HTML 入口的项目）时，才需要显式指定。

值是 glob 模式或模式数组（相对项目根目录），**支持通配符**：

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 单个 glob 模式（官方示例）
    entries: ['src/**/*.ts'],

    // 多个入口（多页面应用）
    // entries: ['src/main.js', 'src/renderer.js']
  }
}
```

> 💡 **提示：** `entries` 管"从哪些入口开始扫描"，`include` 管"哪些依赖必须预构建"。`entries` 支持 glob，`include` 不支持。

## 可选值与使用方式

### 默认行为

```javascript
// 不配置 optimizeDeps 时：Vite 自动扫描入口并预构建发现的依赖，
// 结果缓存在 node_modules/.vite/deps，
// 锁文件、vite.config、Vite/Node 版本变化时自动重新预构建
export default {}
```

### 基础配置

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 强制预构建（含扫描发现不了或深层导入的依赖）
    include: ['vue', 'element-plus'],
    // 排除本地 / 特殊依赖
    exclude: ['@monorepo/local-pkg']
  }
}
```

### 仅预构建指定依赖

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 关闭自动发现，只预构建 include 列出的依赖
    noDiscovery: true,
    include: ['vue', 'vue-router']
  }
}
```

## 生效后的结果示例

### 预构建前

```javascript
// lodash-es 内部有 600+ 个小模块
// 开发时浏览器需要按 import 关系逐个请求
import { debounce } from 'lodash-es'
```

### 预构建后

```javascript
// node_modules/.vite/deps/lodash-es.js
// 依赖被 esbuild 打成单文件，浏览器只需一次请求
// 响应带 Cache-Control: max-age=31536000, immutable，
// 整页刷新直接命中浏览器缓存；新一轮预构建用 ?v=hash 版本查询使旧缓存失效
import { debounce } from 'lodash-es'
```

### CommonJS 依赖转换

```javascript
// 预构建前：some-cjs-lib 用 module.exports 导出，浏览器无法直接消费
// 预构建时：esbuild 转成 ESM，并自动补上 default 导出（互操作）
// 预构建后：以下导入正常工作，无需手动配置 needsInterop
import pkg from 'some-cjs-lib'
```

## 使用场景

### 1. Monorepo 本地包

**场景**：linked 包不在 `node_modules` 中，无法被自动发现和预构建。

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['@my-app/shared', '@my-app/ui-components']
  }
}
```

> 💡 **提示：** 修改 linked 包源码后，用 `vite --force` 重启开发服务器，让改动重新预构建。

### 2. CommonJS 依赖

**场景**：CJS 格式的依赖在浏览器中报"未提供 default 导出"或语法错误。

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 确保该依赖被预构建（预构建会自动完成 CJS → ESM 互操作）
    include: ['some-cjs-lib']
  }
}
```

### 3. SSR / 构建期

**场景**：SSR 或生产构建中如何处理依赖优化。

```javascript
// vite.config.js
export default {
  // Vite 5.1 起构建期不再做依赖优化（由 Rollup 处理依赖），
  // dev 期的预构建也无法通过已弃用的 disabled 关闭；
  // SSR 外部化行为请使用 ssr.noExternal / ssr.external 控制
}
```

### 4. 调试预构建

**场景**：排查缓存相关问题时强制重新预构建。

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    force: true
  }
}
```

### 5. 深层导入的依赖

**场景**：依赖只通过深层路径导入，扫描器识别不到完整包。

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['my-lib/deep/file']
  }
}
```

## 注意事项

### 1. 重新预构建的触发条件

开发服务器在以下情况会自动重新预构建（无需手动干预）：

- 包管理器锁文件变化（`package-lock.json`、`yarn.lock`、`pnpm-lock.yaml`、`bun.lockb`）；
- patches 目录变化；
- `vite.config.js/ts` 配置文件变化（Vite 会自动重启）；
- Vite 版本或 Node 版本变化。

手动触发方式：CLI 加 `--force`，或删除 `node_modules/.vite` 目录。

### 2. 缓存位置

```javascript
// 预构建缓存存储在 cacheDir 中，默认 node_modules/.vite
// 预构建产物在 node_modules/.vite/deps，并生成 _metadata.json 记录版本信息
export default {
  cacheDir: 'node_modules/.vite' // 默认值，可按需修改
}
```

### 3. include 与 exclude 不要互相冲突

```javascript
// ❌ 同一依赖同时列入两者，行为不可控
optimizeDeps: {
  include: ['vue'],
  exclude: ['vue']
}

// ✅ 二选一
optimizeDeps: {
  include: ['vue']
}
```

### 4. 浏览器端缓存

预构建产物以 `Cache-Control: max-age=31536000, immutable` 下发，整页刷新不再请求开发服务器；重新预构建后产物 URL 携带新的 `?v=hash`，自然绕开旧缓存。

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `cacheDir` | 预构建缓存存储位置（默认 `node_modules/.vite`） |
| `resolve.alias` | 别名影响依赖解析和预构建 |
| `define` | 业务代码的编译期常量（`esbuildOptions.define` 只作用于被预构建的依赖） |
| `build.commonjsOptions` | 生产构建的 CJS 处理配置（对应预构建期的 `esbuildOptions`） |
| `server.fs.allow` | 文件系统访问权限影响依赖扫描 |

## 工作原理

```
┌──────────────────────────────────────────┐
│  1. 扫描项目中的依赖                     │
│     → 从 entries（默认全部 .html）爬取    │
│     → 用 esbuild 分析 import 语句        │
├──────────────────────────────────────────┤
│  2. 用 esbuild 打包依赖                  │
│     → CJS/UMD 转为 ESM（自动互操作）     │
│     → 合并内部小模块，应用 esbuildOptions │
├──────────────────────────────────────────┤
│  3. 缓存到 node_modules/.vite/deps       │
│     → 生成 _metadata.json 记录版本与哈希 │
├──────────────────────────────────────────┤
│  4. 后续启动直接用缓存                   │
│     → 锁文件/配置/版本未变则跳过预构建    │
│     → 浏览器端配合 immutable 缓存        │
└──────────────────────────────────────────┘
```

## 完整示例

### Vue 应用完整配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  // Vue 编译期常量放在顶层 define（不要放 esbuildOptions.define）
  define: {
    __VUE_OPTIONS_API__: JSON.stringify(true),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(false)
  },

  optimizeDeps: {
    // 预构建 Vue 生态核心依赖
    include: ['vue', 'vue-router', 'pinia', '@vueuse/core'],

    // 排除本地包
    exclude: ['@my-app/local-utils']
  }
})
```

### Monorepo 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    // 预构建 workspace 包（linked 包必须显式列出）
    include: ['@workspace/shared', '@workspace/ui'],

    // 关闭自动发现，依赖范围完全由 include 控制
    noDiscovery: true
  }
})
```

### 多入口配置

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    // 用 glob 指定扫描入口（类型为 string | string[]）
    entries: ['src/**/*.ts']
  }
}
```

## 常见问题

### 问题 1：Monorepo 本地包没有正确预构建

**原因**：linked 包不在 `node_modules` 中，自动扫描发现不了。

```javascript
// ✅ 显式加入 include
optimizeDeps: {
  include: ['@monorepo/shared']
}
```

### 问题 2：导入 CJS 包时报"未提供 default 导出"

**原因**：该 CJS 依赖没有被预构建，浏览器拿到了未转换的 CommonJS 代码。

```javascript
// ✅ 用 include 确保它被预构建（预构建自动补 default 导出）
optimizeDeps: {
  include: ['some-cjs-lib']
}
```

### 问题 3：预构建缓存损坏或内容过期

**解决**：

```bash
# 方法一：删除缓存目录
rm -rf node_modules/.vite

# 方法二：启动时强制重新预构建
vite --force
```

### 问题 4：依赖使用了 Node.js 特性，浏览器无法运行

**原因**：库依赖 Node 内置模块，转换后仍无法在浏览器执行。

```javascript
// ✅ 排除预构建，改由其他方式处理（如 polyfill、替换包）
optimizeDeps: {
  exclude: ['node-only-library']
}
```

## 命令行用法

```bash
# 强制忽略缓存、重新预构建
vite --force

# 只执行依赖预构建，不启动开发服务器
vite optimize

# 手动清空缓存目录
rm -rf node_modules/.vite

# 查看预构建产物
ls node_modules/.vite/deps
```
