# mode 配置

## 定义

`mode` 指定应用的运行模式，决定了加载哪个环境变量文件以及默认的开发/生产行为。

**类型**：`string`

**默认值**：
- `vite` / `vite dev` 命令：`'development'`
- `vite build` 命令：`'production'`
- `vite preview` 命令：`'production'`

## 可选值

| 值 | 说明 | 使用场景 |
|----|------|----------|
| `'development'` | 开发模式 | 本地开发调试，启用 HMR、SourceMap |
| `'production'` | 生产模式 | 生产构建，代码压缩、优化 |
| `'staging'` | 预发布模式 | 测试环境部署 |
| `'test'` | 测试模式 | 单元测试、集成测试 |
| 自定义字符串 | 任意模式名称 | 多环境部署需求 |

## 命令行指定

```bash
# 开发服务器 - 默认 development
vite
vite --mode development

# 构建 - 默认 production
vite build
vite build --mode production

# 自定义模式
vite --mode staging
vite build --mode staging

# 预览
vite preview --mode staging
```

## 在配置文件中使用

```javascript
// vite.config.js
export default {
  mode: 'staging'  // 强制使用 staging 模式
}

// 使用函数形式根据不同模式返回不同配置
export default defineConfig(({ mode }) => {
  console.log('当前模式:', mode)  // development | production | staging

  return {
    // 根据模式返回不同配置
    define: {
      __DEV__: mode === 'development',
      __PROD__: mode === 'production'
    }
  }
})
```

## 环境变量文件加载

### 文件命名规则

| 文件名 | 加载时机 | 优先级 | Git 追踪 |
|--------|----------|--------|----------|
| `.env` | 所有模式 | 最低 | ✅ 是 |
| `.env.local` | 所有模式 | 最高 | ❌ 否 |
| `.env.[mode]` | 指定模式 | 中等 | ✅ 是 |
| `.env.[mode].local` | 指定模式 | 最高 | ❌ 否 |

### 加载优先级（从高到低）

```
1. .env.[mode].local      (如 .env.production.local)
2. .env.local
3. .env.[mode]            (如 .env.production)
4. .env
```

### 环境变量文件示例

```bash
# .env - 所有环境通用
VITE_APP_TITLE=My App
VITE_API_BASE_URL=http://localhost:3000

# .env.development - 开发环境
VITE_API_BASE_URL=http://localhost:3000
VITE_DEBUG=true
VITE_MOCK_API=true

# .env.production - 生产环境
VITE_API_BASE_URL=https://api.example.com
VITE_DEBUG=false
VITE_MOCK_API=false

# .env.staging - 预发布环境
VITE_API_BASE_URL=https://staging-api.example.com
VITE_DEBUG=true

# .env.local - 本地覆盖（不提交 Git）
VITE_API_KEY=your-secret-key
```

## 运行时访问模式信息

在代码中可以通过 `import.meta.env` 获取当前模式信息：

```javascript
// 内置环境变量
console.log(import.meta.env.MODE)        // 当前模式：'development' | 'production' | 'staging'
console.log(import.meta.env.BASE_URL)   // 基础路径：来自 base 配置
console.log(import.meta.env.PROD)        // 是否生产模式：true | false
console.log(import.meta.env.DEV)         // 是否开发模式：true | false
console.log(import.meta.env.SSR)         // 是否 SSR 构建：true | false

// 自定义环境变量（需以 VITE_ 开头）
console.log(import.meta.env.VITE_API_URL)
console.log(import.meta.env.VITE_APP_TITLE)
```

## 生效后的结果示例

### 开发模式

```bash
vite --mode development
# 或
vite
```

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    // mode = 'development'
    build: {
      // 开发构建不压缩
      minify: false,
      // 生成 sourcemap
      sourcemap: true
    },
    define: {
      __DEV__: JSON.stringify(true),
      __PROD__: JSON.stringify(false)
    }
  }
})
```

加载的环境变量：
```bash
.env.local (最高优先级)
.env.development
.env (最低优先级)
```

### 生产模式

```bash
vite build --mode production
# 或
vite build
```

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    // mode = 'production'
    build: {
      // 生产构建压缩
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      sourcemap: false
    },
    define: {
      __DEV__: JSON.stringify(false),
      __PROD__: JSON.stringify(true)
    }
  }
})
```

加载的环境变量：
```bash
.env.production.local
.env.production
.env
```

### 自定义模式（staging）

```bash
vite build --mode staging
```

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  const isStaging = mode === 'staging'

  return {
    // 根据 mode 配置不同行为
    base: isStaging ? '/staging/' : '/',
    build: {
      sourcemap: isStaging,  // staging 模式生成 sourcemap
      minify: isStaging ? false : 'terser'  // staging 不压缩
    }
  }
})
```

创建对应的环境变量文件：

```bash
# .env.staging
VITE_API_BASE_URL=https://staging-api.example.com
VITE_APP_TITLE=My App (Staging)
VITE_SENTRY_DSN=https://sentry.io/...
```

## 使用场景

### 1. 多环境配置

根据不同环境配置不同的 API 地址和行为：

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    define: {
      __API_URL__: JSON.stringify(
        mode === 'production' ? 'https://api.example.com' :
        mode === 'staging' ? 'https://staging-api.example.com' :
        'http://localhost:3000'
      )
    }
  }
})
```

### 2. 条件编译

根据模式执行不同代码：

```javascript
// src/utils/index.js
if (import.meta.env.MODE === 'development') {
  // 开发模式：启用调试工具
  enableDebugTools()
  console.log('Debug mode enabled')
}

if (import.meta.env.PROD) {
  // 生产模式：启用性能监控
  enablePerformanceMonitoring()
}

// 使用 define 定义的条件变量
if (__DEV__) {
  console.log('开发环境特定代码')
}

if (__PROD__) {
  // 生产环境代码
}
```

### 3. 测试环境

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  if (mode === 'test') {
    return {
      // 测试配置
      test: {
        environment: 'jsdom',
        setupFiles: './src/test/setup.js'
      }
    }
  }

  return {
    // 正常配置
  }
})
```

```bash
# .env.test
VITE_API_BASE_URL=http://test-api.example.com
VITE_MOCK_DB=true
```

### 4. SSR 应用区分

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  const isSSR = mode === 'ssr'

  return {
    build: {
      ssr: isSSR,
      emptyOutDir: !isSSR
    },
    optimizeDeps: {
      // SSR 构建时禁用依赖预构建
      disabled: isSSR ? 'build' : false
    }
  }
})
```

## 注意事项

### 1. mode ≠ NODE_ENV

Vite 会自动设置 `NODE_ENV`，但它们不完全相同：

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  // mode 是用户指定的模式名
  console.log('mode:', mode)  // 'staging'

  // NODE_ENV 由 Vite 根据 mode 自动设置
  // development → NODE_ENV=development
  // production → NODE_ENV=production
  // 其他 → NODE_ENV=development（除非显式设置）

  return {
    // 可以通过 define 手动设置
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  }
})
```

### 2. 环境变量命名规范

只有以 `VITE_` 开头的变量才会暴露给客户端：

```bash
# .env.production
VITE_PUBLIC_KEY=abc123    # ✅ 暴露给客户端
DATABASE_URL=xxx          # ❌ 仅服务端可用
SECRET_KEY=xxx            # ❌ 仅服务端可用
```

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
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 4. 配置文件中的模式判断

```javascript
// vite.config.js
export default defineConfig(({ command, mode }) => {
  // command: 'serve' | 'build'
  // mode: 'development' | 'production' | 'staging' 等

  // command 与 mode 的关系
  // vite (dev) → command='serve', mode='development'
  // vite build → command='build', mode='production'
  // vite build --mode staging → command='build', mode='staging'

  if (command === 'serve') {
    return { /* 开发服务器配置 */ }
  }

  return { /* 构建配置 */ }
})
```

### 5. 环境变量文件位置

环境变量文件默认放在项目根目录（`root`）下：

```javascript
// vite.config.js
export default {
  // 自定义环境变量目录
  envDir: './config/env'
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `envDir` | 环境变量文件的查找目录 |
| `envPrefix` | 控制哪些环境变量暴露给客户端（默认 `VITE_`） |
| `define` | 常与 `mode` 配合做条件编译 |
| `build.minify` | 生产模式（`mode: 'production'`）默认启用 |
| `build.sourcemap` | 开发模式默认启用，生产模式默认禁用 |
| `optimizeDeps.disabled` | SSR 模式通常需要禁用依赖预构建 |

## 完整示例

### 多环境配置方案

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // 加载环境变量文件
  const env = loadEnv(mode, process.cwd())

  return {
    // 基础路径
    base: mode === 'production' ? '/app/' : '/',

    // 定义全局常量
    define: {
      __APP_ENV__: JSON.stringify(mode),
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
      __API_URL__: JSON.stringify(env.VITE_API_URL),
      __APP_VERSION__: JSON.stringify(env.npm_package_version)
    },

    // 开发服务器
    server: {
      port: mode === 'development' ? 5173 : 4173,
      open: mode === 'development'
    },

    // 构建配置
    build: {
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      } : {}
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

export default defineConfig(({ mode }) => {
  return {
    ...configByMode[mode] || configByMode.development
  }
})
```

## 常见问题

### 问题 1：环境变量不生效

**原因**：文件命名错误或未重启服务器

**解决**：
```bash
# 确保文件命名正确
.env                  ✅
.env.local            ✅
.env.development      ✅
.env.production       ✅
.env.staging          ✅
.env.dev.local        ✅
.env.dev              ❌ (需加上 .mode)

# 修改环境变量后需要重启开发服务器
```

### 问题 2：客户端无法访问环境变量

**原因**：变量未以 `VITE_` 开头

**解决**：
```javascript
// ❌ 错误
API_URL=http://api.example.com

// ✅ 正确
VITE_API_URL=http://api.example.com

// 或修改前缀（不推荐）
export default {
  envPrefix: ['VITE_', 'APP_']  // 支持 APP_ 前缀
}
```

### 问题 3：构建后环境变量仍是开发值

**原因**：未指定正确的模式

**解决**：
```bash
# ❌ 默认会使用 production 模式
vite build

# ✅ 指定 staging 模式
vite build --mode staging

# 或在配置文件中强制
export default {
  mode: 'staging'
}
```

## 官方文档

[Shared Config: mode - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#mode)

[Env Variables - Vite 官方文档](https://cn.vitejs.dev/guide/env-and-mode.html)
