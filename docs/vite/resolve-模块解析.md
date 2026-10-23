# resolve 配置

> 📖 [官方文档：Shared Options](https://cn.vitejs.dev/config/shared-options.html)

## 定义

`resolve` 配置模块解析行为，包括别名、扩展名、入口字段、导出条件等，控制 Vite 如何把一个导入语句定位到磁盘上的具体文件。

官方按子项分别定义，常用子项及类型汇总如下：

```typescript
{
  alias?: Record<string, string> | Array<{ find: string | RegExp; replacement: string }>
  extensions?: string[]
  mainFields?: string[]
  conditions?: string[]
  dedupe?: string[]
  preserveSymlinks?: boolean
  tsconfigPaths?: boolean
}
```

**默认值**（仅列出官方文档给出的默认值）：

```javascript
{
  extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  mainFields: ['browser', 'module', 'jsnext:main', 'jsnext'],
  conditions: ['module', 'browser', 'development|production'],
  preserveSymlinks: false,
  tsconfigPaths: false
}
```

> ⚠️ **注意：** 官方未给 `alias` 和 `dedupe` 定义默认值，不配置即不启用对应能力。`mainFields` 与 `conditions` 的默认值仅在客户端（浏览器）解析时生效，SSR 构建有独立配置（见下文）。

## 子属性详解

### alias

**类型**：`Record<string, string> | Array<{ find: string | RegExp; replacement: string }>`

定义用于替换 `import` 或 `require` 语句中值的别名，工作方式类似 [rollup-plugin-alias](https://github.com/rollup/plugins/tree/master/packages/alias)。

官方明确两条规则：

- **条目的顺序很重要**，最先定义的规则会首先应用。
- **别名值使用文件系统路径时，必须用绝对路径**。相对路径的别名值会原封不动地被使用，无法被正常解析。

#### 对象形式

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      // 覆盖依赖入口：使用完整版 Vue（含模板编译器）
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  }
})
```

#### 数组形式（可配合正则）

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: [
      // 把 @/xxx 解析到 src/xxx，$1 引用正则的第一个捕获组
      { find: /^@\/(.*)$/, replacement: path.resolve(__dirname, './src/$1') },
      // 官方示例：把 .js 结尾的导入替换为 .alias 结尾
      { find: /^(.*)\.js$/, replacement: '$1.alias' }
    ]
  }
})
```

> 💡 **提示：** 需要精确控制匹配顺序（例如多个别名互为前缀），或需要正则捕获时，使用数组形式；简单的键值映射用对象形式即可。

### extensions

**类型**：`string[]`

**默认值**：`['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

导入时省略扩展名后依次尝试的扩展名列表，列表顺序即匹配优先级。

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    // 在默认列表后追加自定义扩展名
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
})
```

> ⚠️ **注意：** 官方**不建议**省略 `.vue` 这类自定义导入类型的扩展名，否则会影响 IDE 提示和类型支持。默认列表已覆盖常见场景，通常无需修改。

### mainFields

**类型**：`string[]`

**默认值**：`['browser', 'module', 'jsnext:main', 'jsnext']`

解析包入口时尝试的 `package.json` 字段及优先级。官方说明：**它的优先级低于 `exports` 字段的条件导出**——只要能从 `exports` 成功解析出入口，`mainFields` 就会被忽略。

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    // 兼容只提供 CommonJS main 入口的包：在默认值基础上补充 main 做兜底
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext', 'main']
  }
})
```

**package.json 示例**：

```json
{
  "name": "my-package",
  "browser": "dist/index.browser.js",
  "module": "dist/index.esm.js",
  "main": "dist/index.cjs.js"
}
```

> 💡 **提示：** 默认列表不含 `main`。若某个依赖只提供 CommonJS 的 `main` 入口且解析失败，按上面的方式手动补上即可。SSR 构建的入口字段由 `ssr.resolve.mainFields` 单独控制，默认 `['module', 'jsnext:main', 'jsnext']`。

### conditions

**类型**：`string[]`

**默认值**：`['module', 'browser', 'development|production']`

解析包的条件导出（`exports` 字段）时，**额外允许**的条件。默认值之外的要点：

- `development|production` 是特殊值，会根据 `process.env.NODE_ENV` 替换为 `production` 或 `development`。
- `import`、`require`、`default` 条件在满足要求时始终会被应用。
- 解析样式导入（如 `@import 'my-library'`）时会应用 `style` 条件；Sass、Less 分别还会应用 `sass`、`less` 条件。

**package.json exports 示例**：

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js",
      "custom": "./dist/custom.js",
      "default": "./dist/index.js"
    }
  }
}
```

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    // 追加自定义条件后，上面的 "custom" 出口才会被命中
    conditions: ['custom']
  }
})
```

### dedupe

**类型**：`string[]`

当应用中出现同一依赖的多份副本（常见于 monorepo 的依赖提升或 link 包）时，强制 Vite 始终把列出的依赖解析为同一份副本（从项目根目录解析）。

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    // 保证整个应用只加载一份 Vue 运行时
    dedupe: ['vue', 'vue-router', 'pinia']
  }
})
```

> ⚠️ **注意：** SSR 构建输出为 ESM 时，去重可能不生效，必要时可改用 CJS 输出。仅在确实出现多副本问题（如 "Invalid hook call"、组件实例判断失败类报错）时使用。

### preserveSymlinks

**类型**：`boolean`

**默认值**：`false`

启用后，Vite 用**原始文件路径**（不跟随符号链接）而不是**真实文件路径**（跟随符号链接后）来确定文件身份。

```javascript
// 默认 false：跟随符号链接，解析到链接指向的真实路径
// 设为 true：保留符号链接路径本身作为文件身份
```

典型场景是 pnpm workspace、`npm link` 调试本地包时，希望 Vite 保留链接路径。相关实现与 esbuild 的 `preserveSymlinks`、webpack 的 `resolve.symlinks` 对应。

### tsconfigPaths

**类型**：`boolean`

**默认值**：`false`

启用后，Vite 直接使用 `tsconfig.json` 中的 `paths` 选项来解析导入，省去在 `vite.config.js` 里重复写一份别名。

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    // 使用 tsconfig.json 的 paths 解析导入
    tsconfigPaths: true
  }
})
```

> ⚠️ **注意：** `paths` 只作用于被该 `tsconfig.json` 的 `include`/`files` 匹配到的文件；CSS 等非 JS 文件需要显式列在 `include` 中（如 `"include": ["src", "src/**/*.css"]`）才会生效。

## 生效后的结果示例

### 别名生效前后

```javascript
// src/components/Header.vue —— 配置前：深层相对路径难维护
import Button from '../../../components/Button.vue'
import { formatDate } from '../../../utils/date.js'

// 配置后：统一从项目 src 根出发
import Button from '@/components/Button.vue'
import { formatDate } from '@/utils/date.js'
```

### dedupe 生效

```text
配置前：依赖各自携带 Vue 副本，运行时存在多份 Vue
node_modules/vue
node_modules/dependency-a/node_modules/vue
node_modules/dependency-b/node_modules/vue
```

```javascript
// vite.config.js —— 配置后：所有 import vue 都指向项目根下的同一份
resolve: {
  dedupe: ['vue']
}
```

### conditions 生效

```json
{
  "exports": {
    ".": {
      "custom": "./dist/custom.js",
      "default": "./dist/index.js"
    }
  }
}
```

配置 `resolve.conditions: ['custom']` 后，导入该包会解析到 `./dist/custom.js`；不配置则落到 `default` 出口。

## 使用场景

### 1. Monorepo 引用 workspace 包

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  resolve: {
    // 指向其他 workspace 包的源码，改动即时生效、无需先构建
    alias: {
      '@my-app/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@my-app/utils': path.resolve(__dirname, '../../packages/utils/src')
    },
    // 共享依赖去重，避免各包安装的副本不一致
    dedupe: ['vue', 'vue-router', '@my-app/shared']
  }
})
```

### 2. 使用完整版 Vue

需要运行时编译组件模板（如收到字符串模板、动态组件）时，把 `vue` 别名指向含编译器的构建产物：

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  }
}
```

### 3. TypeScript 项目同步别名

Vite 侧与 `tsconfig.json` 侧各配一份，编辑器的类型跳转才能生效：

```javascript
// vite.config.ts
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

若不想维护两份，可改用 `resolve.tsconfigPaths: true`（见上文子项详解）。

### 4. 库开发

```javascript
// vite.config.js
export default {
  resolve: {
    // 兼容只提供 main 入口的消费方依赖
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext', 'main'],
    // 按需精简扩展名，减少无效的文件尝试
    extensions: ['.mjs', '.js', '.mts', '.ts', '.json']
  }
}
```

### 5. 符号链接调试

```javascript
// vite.config.js
export default {
  resolve: {
    // npm link / pnpm link 调试本地包时，保留链接路径
    preserveSymlinks: true
  }
}
```

## 注意事项

### 1. 别名路径格式

```javascript
// 以下均为 resolve 节选，path 需在文件顶部自行导入

// ✅ 正确：绝对路径（官方推荐）
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}

// ✅ 可用：以 / 开头，Vite 按项目根目录解析
resolve: {
  alias: {
    '@': '/src'
  }
}

// ❌ 错误：相对路径会原样保留，无法解析
resolve: {
  alias: {
    '@': './src'
  }
}
```

> 💡 **提示：** `/src` 形式在开发与客户端构建中可用，但跨环境（SSR、Node 脚本）不如绝对路径稳定，优先用 `path.resolve` 或 `fileURLToPath(new URL('./src', import.meta.url))`。

### 2. 对象形式与顺序

```javascript
// ⚠️ 两个别名互为前缀：'@foo/bar' 会被先命中的 '@foo' 规则处理
// 对象形式无法保证顺序，结果可能不符合预期
resolve: {
  alias: {
    '@foo': '/src/foo',
    '@foo/bar': '/src/foo/bar'
  }
}

// ✅ 正确：用数组形式，把更具体的规则放在前面
resolve: {
  alias: [
    { find: /^@foo\/(.*)$/, replacement: '/src/foo/$1' },
    { find: /^@foo$/, replacement: '/src/foo' }
  ]
}
```

### 3. 正则别名的特殊字符

```javascript
// ✅ 正确：转义正则特殊字符
resolve: {
  alias: [
    {
      find: /^@components\/(.*)$/,
      replacement: '/src/components/$1'
    }
  ]
}

// ❌ 错误：/ 未转义，直接是非法正则，代码无法运行
resolve: {
  alias: [
    {
      find: /^@components/(.*)$/,
      replacement: '/src/components/$1'
    }
  ]
}
```

### 4. dedupe 按需使用

```javascript
// ✅ 建议：仅在出现多副本问题时，针对出问题的依赖启用
resolve: {
  dedupe: ['vue']
}
```

### 5. Vue 别名覆盖

```javascript
// 指向完整版后，所有 vue 导入都被改写，产物体积会变大
// 仅在确实需要运行时模板编译时使用
resolve: {
  alias: {
    vue: 'vue/dist/vue.esm-bundler.js'
  }
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `server.fs.strict` / `server.fs.allow` | 开发服务器限制可访问目录时，别名指向的目录需在允许范围内 |
| `optimizeDeps` | 依赖预构建同样遵循 `resolve.alias` 等解析配置 |
| `ssr.resolve.mainFields` / `ssr.resolve.conditions` | SSR 构建的入口字段与导出条件需单独配置 |
| `css.preprocessorOptions` | Sass、Less 的 `@import` 同样遵循 `resolve.alias` |

## 完整示例

### 标准 Vue 应用

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    // 路径别名：统一从 src 出发
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@views': path.resolve(__dirname, './src/views'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@api': path.resolve(__dirname, './src/api')
    },

    // 多副本时强制使用同一份 Vue
    dedupe: ['vue', 'vue-router', 'pinia'],

    // 其余子项保持默认即可
    // extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    // mainFields: ['browser', 'module', 'jsnext:main', 'jsnext'],
    // conditions: ['module', 'browser', 'development|production'],
    // preserveSymlinks: false
  }
})
```

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@views/*": ["src/views/*"],
      "@utils/*": ["src/utils/*"],
      "@api/*": ["src/api/*"]
    },
    "types": ["vite/client"]
  }
}
```

### 环境相关配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      },
      // 按模式追加导出条件，让依赖给出对应的构建产物
      conditions: isDev ? ['development'] : ['production'],
      // 开发期保留符号链接，便于调试 link 的本地包
      preserveSymlinks: isDev
    }
  }
})
```

## 常见问题

### 问题 1：别名不生效（编辑器报找不到模块）

**原因**：只配置了 Vite，`tsconfig.json` 未同步，编辑器按 TypeScript 的规则解析。

**解决**：在 `tsconfig.json` 的 `compilerOptions.paths` 中配置同样的映射；或改用 `resolve.tsconfigPaths: true` 让 Vite 直接读取 `paths`。

### 问题 2：Vue 模板编译报错（提示运行时版本不含编译器）

**原因**：默认的 `vue` 入口是仅运行时构建，不含模板编译器。

**解决**：

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  }
}
```

### 问题 3：Monorepo 包找不到

**原因**：别名相对路径或层级写错。

**解决**：用绝对路径指向包源码目录，并打印确认：

```javascript
import path from 'node:path'
console.log(path.resolve(__dirname, '../../packages/my-package/src'))
```

### 问题 4：导入 `.vue` 文件解析失败

**原因**：导入时省略了 `.vue` 扩展名，而它不在默认 `extensions` 列表中。

**解决**：官方建议直接写完整扩展名 `import Comp from './Comp.vue'`，这样对 IDE 与类型支持最友好；确实需要省略时再把 `'.vue'` 追加到 `resolve.extensions`。
