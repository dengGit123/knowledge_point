# configFile 配置

> 📖 [官方文档：配置 Vite](https://cn.vitejs.dev/config/)
>
> 📖 [官方文档：命令行界面](https://cn.vitejs.dev/guide/cli.html)

## 定义

`configFile` 用于指定 Vite 配置文件的路径，或设为 `false` 完全禁用配置文件。

**类型**：`string | false`

**默认值**：在项目根目录下按以下顺序查找第一个存在的文件：

```text
vite.config.js → vite.config.mjs → vite.config.ts → vite.config.cjs → vite.config.mts → vite.config.cts
```

## 配置文件查找规则

### 支持的配置文件名

| 文件名 | 说明 |
|--------|------|
| `vite.config.js` | 根据 `package.json` 的 `type` 字段决定按 ESM 还是 CJS 加载 |
| `vite.config.mjs` | 明确按 ES Module 格式加载 |
| `vite.config.ts` | TypeScript，Vite 会先用 esbuild 转译 |
| `vite.config.cjs` | CommonJS 格式 |
| `vite.config.mts` | TypeScript ES Module |
| `vite.config.cts` | TypeScript CommonJS |

多个文件同时存在时按上表顺序取第一个。例如同时有 `vite.config.js` 和 `vite.config.ts` 时，只会加载 `vite.config.js`。

### 查找位置

配置文件在项目根目录（`root` 配置项，默认 `process.cwd()`）下查找，不会向上递归查找父目录：

```text
# 在 /home/user/project/app/ 下运行 vite
# 只查找 /home/user/project/app/vite.config.{js,mjs,ts,cjs,mts,cts}
# 不会去 /home/user/project/ 或更上层找
```

## 可选值与使用方式

### 1. 指定配置文件路径（通过 CLI）

`configFile` 通常通过命令行 `--config`（简写 `-c`）指定，而不是写在配置文件里：

```bash
# 指定其他文件名的配置
vite --config vite.admin.config.js
vite -c vite.admin.config.js

# 指定子目录中的配置（相对当前工作目录解析）
vite --config config/vite.config.js
```

### 2. 禁用配置文件（`false`）

`configFile: false` 主要用于 JS API 编程式调用（如测试环境、嵌入其他工具）：

```javascript
// 使用 Vite 默认配置，不加载任何配置文件
import { createServer } from 'vite'

const server = await createServer({
  configFile: false
})
```

CLI 没有传 `false` 的写法；不需要配置文件的简单项目，直接不创建配置文件即可。

## 生效后的结果示例

### 使用自定义配置文件

```text
project/
├── config/
│   ├── vite.dev.config.js     # 开发配置
│   └── vite.prod.config.js    # 生产配置
├── src/
└── package.json
```

```javascript
// config/vite.dev.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

```javascript
// config/vite.prod.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
})
```

```json
// package.json
{
  "scripts": {
    "dev": "vite --config config/vite.dev.config.js",
    "build": "vite build --config config/vite.prod.config.js"
  }
}
```

### Monorepo 共享基础配置

```text
monorepo/
├── apps/
│   ├── web/
│   │   └── vite.config.js
│   └── admin/
│       └── vite.config.js
├── packages/
│   └── shared/
└── vite.base.config.js        # 共享基础配置
```

```javascript
// vite.base.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@shared': '/packages/shared'
    }
  }
})
```

```javascript
// apps/web/vite.config.js - 继承基础配置
import { defineConfig } from 'vite'
import baseConfig from '../../vite.base.config.js'

export default defineConfig({
  ...baseConfig,
  base: '/web/',
  build: {
    outDir: '../../dist/web'
  }
})
```

## 使用场景

### 1. 按环境拆分配置文件

```bash
# package.json
{
  "scripts": {
    "dev": "vite --config config/vite.development.js",
    "build": "vite build --config config/vite.production.js",
    "build:staging": "vite build --config config/vite.staging.js"
  }
}
```

### 2. 配置拆分与合并

把公共配置抽成独立文件，用 Vite 内置的 `mergeConfig` 合并（能正确处理嵌套对象与数组）：

```javascript
// config/vite.base.js
import { fileURLToPath, URL } from 'node:url'

export default {
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url))
    }
  }
}

// config/vite.dev.js
export default {
  server: {
    port: 5173,
    open: true
  }
}

// config/vite.prod.js
export default {
  build: {
    outDir: 'dist',
    sourcemap: false
  }
}
```

```javascript
// vite.config.js - 主入口
import { defineConfig, mergeConfig } from 'vite'
import baseConfig from './config/vite.base.js'
import devConfig from './config/vite.dev.js'
import prodConfig from './config/vite.prod.js'

export default defineConfig(({ mode }) => {
  const modeConfig = mode === 'production' ? prodConfig : devConfig
  return mergeConfig(baseConfig, modeConfig)
})
```

### 3. 无配置模式

简单项目可以不写任何配置文件，直接使用 Vite 默认配置：

```text
simple-project/
├── index.html
├── package.json
└── src/
    └── main.js
```

```bash
vite
```

## 注意事项

### 1. 推荐使用 ESM 语法

Vite 加载配置文件前会先用 esbuild 打包转译，因此即使 `package.json` 没有设置 `"type": "module"`，配置文件里也可以使用 ESM 语法。建议统一写 ESM 导出：

```javascript
// ❌ 不推荐：CommonJS 写法
module.exports = {
  server: { port: 3000 }
}

// ✅ 推荐：ESM 写法，defineConfig 提供类型提示
import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 3000 }
})
```

### 2. package.json 的 type 字段

```json
{
  "type": "module"
}
```

设置为 `"module"` 时，项目内的 `.js` 文件按 ESM 解析；确需 CommonJS 时使用 `.cjs` / `.cts` 扩展名（见「支持的配置文件名」表）。

### 3. 条件配置与异步配置

配置文件可以导出函数或 Promise，用于依赖运行时信息的场景：

```javascript
// vite.config.js
import { defineConfig } from 'vite'

// 函数形式：读取 command / mode 等运行时信息
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return { /* 开发配置 */ }
  }
  return { /* 构建配置 */ }
})

// 异步形式：配置中可以 await
export default defineConfig(async ({ command, mode }) => {
  const data = await getSomeData()
  return { /* 使用 data 的配置 */ }
})
```

### 4. 禁用配置文件的影响

`configFile: false` 后 Vite 完全使用内置默认值：开发服务器端口 `5173`、构建输出目录 `dist`，且不会加载任何插件。

### 5. 与 root 的区别

`--config` 只决定「用哪个配置文件」，不改变项目根目录；`root` 决定 `index.html`、`publicDir` 等入口位置，配置文件默认也是从 `root` 下查找的。

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | 配置文件默认在 `root` 目录（默认 `process.cwd()`）下查找，不向上递归 |
| `mode` | 配置文件通过函数入参读取当前 `mode`，mode 在配置加载前已确定 |
| `envDir` | 环境变量目录基于 `root`，与 `configFile` 的位置无关 |

## 完整示例

### 基础配置文件（JS）

```javascript
// vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 插件
  plugins: [vue()],

  // 路径别名
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // 开发服务器
  server: {
    port: 5173,
    open: true
  },

  // 构建
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### TypeScript 配置文件

```typescript
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    port: 5173
  },

  build: {
    outDir: 'dist',
    target: 'es2015'
  }
})
```

## 常见问题

### 问题 1：配置文件不生效

**原因一**：项目里同时存在多个配置文件，Vite 只加载优先级最高的那个（`vite.config.js` 优先于 `vite.config.ts`）。

```bash
# 删除多余文件，或明确指定
vite --config vite.config.ts
```

**原因二**：配置文件写法错误，如 CommonJS 导出（见「注意事项 1」）。

### 问题 2：TypeScript 配置文件报错

配置文件中使用 `__dirname` 等 Node API 时需要类型声明：

```bash
npm install -D @types/node
```

推荐改用 `import.meta.url` 方案（见上方 TypeScript 示例），无需额外类型声明。

### 问题 3：想按环境切换配置

优先使用条件配置（函数形式）配合 `--mode`，而不是维护多份配置文件；确需多份文件时再用 `--config` 指定。
