# mode 配置

> 📖 [官方文档：Shared Options](https://cn.vitejs.dev/config/shared-options.html)
>
> 📖 [官方文档：Env Variables and Modes](https://cn.vitejs.dev/guide/env-and-mode.html)

## 定义

`mode` 指定应用的运行模式，决定加载哪些环境变量文件（`.env.[mode]` 等），以及 `import.meta.env.MODE` 的取值。

**类型**：`string`

**默认值**：

- `vite`（dev/serve）命令：`'development'`
- `vite build` 命令：`'production'`
- `vite preview` 命令：`'production'`

## 可选值

内置默认只有 `development` 和 `production` 两种，其余均为自定义模式：

| 值 | 类别 | 说明 |
|----|------|------|
| `'development'` | 内置 | 开发服务器默认值，启用 HMR |
| `'production'` | 内置 | `vite build` / `vite preview` 默认值，压缩优化 |
| `'staging'` | 自定义 | 社区惯用的预发布环境 |
| `'test'` | 自定义 | Vitest 默认使用的测试模式 |

## 命令行指定

`mode` 只能通过 CLI 的 `--mode`（简写 `-m`）或 JS API 的 `mode` 选项指定：

```bash
# 开发服务器，默认 development
vite
vite --mode development

# 构建，默认 production
vite build

# 自定义模式
vite --mode staging
vite build --mode staging
vite preview --mode staging
```

> ⚠️ **注意：** `mode` 在配置文件加载之前就已确定，因此在 `vite.config.js` 里写 `mode: 'staging'` 不会生效。配置文件只能通过函数形式的入参读取 mode（见下文）。

## 在配置文件中读取

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  // command: 'serve' | 'build'
  // mode: 'development' | 'production' | 自定义值

  // 对应关系：
  // vite            → command='serve',      mode='development'
  // vite build      → command='build',      mode='production'
  // vite build -m staging → command='build', mode='staging'

  if (command === 'serve') {
    return { /* 开发服务器配置 */ }
  }
  return { /* 构建配置 */ }
})
```

## 环境变量文件加载

`mode` 决定加载哪些 env 文件，这些文件都从 `envDir`（默认为 `root`）读取。

### 文件命名规则

| 文件名 | 加载时机 | Git 追踪 |
|--------|----------|----------|
| `.env` | 所有模式 | ✅ 通常提交 |
| `.env.local` | 所有模式 | ❌ 本地覆盖，一般不提交 |
| `.env.[mode]` | 指定模式 | ✅ 通常提交 |
| `.env.[mode].local` | 指定模式 | ❌ 本地覆盖，一般不提交 |

### 加载优先级（从高到低）

```text
1. 进程中已存在的环境变量（如 VITE_API=xxx vite build，不会被 .env 覆盖）
2. .env.[mode].local
3. .env.[mode]
4. .env.local
5. .env
```

> 💡 **提示：** 模式专属文件（如 `.env.production`）优先级高于通用文件（如 `.env`）；`.env.local` 不会覆盖 `.env.[mode]`。

### 环境变量文件示例

```bash
# .env - 所有模式通用
VITE_APP_TITLE=My App

# .env.development - 开发模式
VITE_API_BASE_URL=http://localhost:3000
VITE_MOCK_API=true

# .env.production - 生产模式
VITE_API_BASE_URL=https://api.example.com
VITE_MOCK_API=false

# .env.staging - 预发布模式（配合 --mode staging）
VITE_API_BASE_URL=https://staging-api.example.com

# .env.local - 本地覆盖，不提交 Git
VITE_API_KEY=your-secret-key
```

## 运行时访问模式信息

```javascript
// 内置环境变量
console.log(import.meta.env.MODE) // 当前模式：'development' | 'production' | 自定义值
console.log(import.meta.env.BASE_URL) // 基础路径：来自 base 配置
console.log(import.meta.env.PROD) // 是否生产环境：true | false
console.log(import.meta.env.DEV) // 是否开发环境：true | false
console.log(import.meta.env.SSR) // 是否 SSR 构建：true | false

// 自定义环境变量（需以 VITE_ 开头，前缀由 envPrefix 控制）
console.log(import.meta.env.VITE_API_BASE_URL)
```

## 生效后的结果示例

### 默认行为

| 命令 | mode | 加载的 env 文件（从高到低） |
|------|------|-----------------------------|
| `vite` | `development` | `.env.development.local` → `.env.development` → `.env.local` → `.env` |
| `vite build` | `production` | `.env.production.local` → `.env.production` → `.env.local` → `.env` |

### 自定义模式（staging）

```bash
vite build --mode staging
```

```bash
# .env.staging
VITE_API_BASE_URL=https://staging-api.example.com
VITE_APP_TITLE=My App (Staging)
```

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const isStaging = mode === 'staging'

  return {
    base: isStaging ? '/staging/' : '/',
    build: {
      // 预发布环境保留 sourcemap，便于排查问题
      sourcemap: isStaging
    }
  }
})
```

## 使用场景

### 1. 多环境 API 地址

推荐用 env 文件区分，代码里无需任何判断：

```bash
# .env.development / .env.staging / .env.production
VITE_API_BASE_URL=各环境对应的地址
```

```javascript
// 业务代码中直接读取
fetch(`${import.meta.env.VITE_API_BASE_URL}/user`)
```

### 2. 按模式区分构建行为

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  build: {
    // 仅生产构建压缩；开发构建保持可读
    minify: mode === 'production' ? 'terser' : false,
    // 仅非生产环境生成 sourcemap
    sourcemap: mode !== 'production'
  }
}))
```

### 3. 条件执行代码

```javascript
// src/utils/index.js
if (import.meta.env.DEV) {
  // 开发模式：启用调试工具
  enableDebugTools()
}

if (import.meta.env.PROD) {
  // 生产模式：启用性能监控
  enablePerformanceMonitoring()
}

if (import.meta.env.MODE === 'staging') {
  // 仅预发布环境执行的逻辑
}
```

### 4. 测试环境（Vitest）

Vitest 默认以 `mode: 'test'` 运行，可创建对应的 env 文件：

```bash
# .env.test
VITE_MOCK_API=true
```

## 注意事项

### 1. mode ≠ NODE_ENV

`NODE_ENV` 与 `mode` 是两个不同概念，官方给出的对应关系：

| 命令 | `NODE_ENV` | `mode` |
|------|------------|--------|
| `vite` | `development` | `development` |
| `vite build` | `production` | `production` |
| `vite preview` | `production` | `production` |

关键点：

- 自定义 mode 不会改变 `NODE_ENV`：`vite build --mode staging` 时 `NODE_ENV` 仍是 `production`，`import.meta.env.PROD` 仍为 `true`
- `import.meta.env.PROD` / `DEV` 由 `NODE_ENV` 决定，而 `MODE` 只反映 `--mode` 的取值
- 确需覆盖时可在命令前显式设置：`NODE_ENV=development vite build`

### 2. 环境变量命名规范

只有以 `VITE_` 开头（`envPrefix` 默认值）的变量才会暴露给客户端源码：

```bash
# .env.production
VITE_PUBLIC_KEY=abc123    # ✅ 会注入客户端代码
DATABASE_URL=xxx          # ❌ 仅构建过程可用，客户端读不到
```

> ⚠️ **注意：** 不要把密钥等敏感信息放进任何会暴露给客户端的变量。

### 3. TypeScript 类型声明

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
  // 自定义环境变量
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 4. 环境变量文件位置

env 文件默认放在项目根目录（`root`）下，可用 `envDir` 自定义：

```javascript
// vite.config.js
export default {
  envDir: './config/env'
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `envDir` | env 文件的查找目录，默认为 `root` |
| `envPrefix` | 暴露给客户端的变量前缀，默认 `VITE_` |
| `define` | 常与 mode 配合注入全局常量 |
| `build.minify` / `build.sourcemap` | 常按 mode 条件设置 |

## 完整示例

### 多环境配置方案

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // loadEnv(mode, envDir, prefixes)：读取 env 文件内容，供配置文件内的逻辑使用
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    base: mode === 'production' ? '/app/' : '/',

    define: {
      __APP_ENV__: JSON.stringify(mode)
    },

    server: {
      port: 5173,
      open: mode === 'development'
    },

    build: {
      sourcemap: mode !== 'production',
      minify: mode === 'production' ? 'terser' : false
    }
  }
})
```

```bash
# .env.development
VITE_API_URL=http://localhost:3000

# .env.staging
VITE_API_URL=https://staging-api.example.com

# .env.production
VITE_API_URL=https://api.example.com
```

### 使用模式选择器

```javascript
// vite.config.js
import { defineConfig } from 'vite'

const configByMode = {
  development: {
    server: { port: 5173 },
    build: { sourcemap: true }
  },
  staging: {
    base: '/staging/',
    build: { sourcemap: true }
  },
  production: {
    base: '/app/',
    build: { minify: 'terser' }
  }
}

export default defineConfig(({ mode }) => configByMode[mode] || configByMode.development)
```

## 常见问题

### 问题 1：修改环境变量不生效

env 文件在 Vite 启动时一次性加载，修改后必须重启开发服务器，同时确认文件名拼写：

```text
.env                  ✅ 所有模式加载
.env.local            ✅ 所有模式加载（一般不提交）
.env.development      ✅ mode 为 development 时加载
.env.staging          ✅ mode 为 staging 时加载
.env.dev              ⚠️ 仅当 mode 恰好为 dev 时加载，与 .env.development 无关
```

### 问题 2：客户端读不到环境变量

**原因**：变量未以 `VITE_` 开头。

```bash
# ❌ 客户端读不到
API_URL=http://api.example.com

# ✅ 客户端可读
VITE_API_URL=http://api.example.com
```

如需其他前缀，修改 `envPrefix`（如 `envPrefix: ['VITE_', 'APP_']`）。

### 问题 3：构建后取到的还是开发值

**原因**：`vite build` 默认 mode 为 `production`，要读取其他模式的 env 文件必须显式指定：

```bash
# 读取 .env.staging
vite build --mode staging
```
