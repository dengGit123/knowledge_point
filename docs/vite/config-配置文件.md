# configFile 配置

## 定义

`configFile` 指定 Vite 配置文件的路径，或禁用配置文件使用默认配置。

**类型**：`string | false`

**默认值**：`'vite.config.js'`（自动查找支持的配置文件）

## 配置文件查找规则

### 支持的配置文件名

Vite 会按照以下优先级自动查找配置文件：

| 优先级 | 文件名 | 说明 |
|--------|--------|------|
| 1 | `vite.config.js` | 标准 JavaScript 配置 |
| 2 | `vite.config.mjs` | ES Module 格式 |
| 3 | `vite.config.ts` | TypeScript 配置 |
| 4 | `vite.config.mts` | TypeScript ES Module |
| 5 | `vite.config.cjs` | CommonJS 格式 |
| 6 | `vite.config.cts` | TypeScript CommonJS |

### 查找顺序

从当前工作目录（`process.cwd()`）开始，向上递归查找：

```javascript
// 运行 vite 命令时
// 当前目录：/home/user/project/app/

// 查找顺序：
// 1. /home/user/project/app/vite.config.js
// 2. /home/user/project/vite.config.js
// 3. /home/user/vite.config.js
// ... 直到找到或到达根目录
```

## 可选值与使用方式

### 1. 指定配置文件路径

```javascript
// 注意：此配置通常通过 CLI 指定，而非写在配置文件中

// 命令行方式（推荐）
vite --config vite.admin.config.js
vite --config config/vite.config.js

// 或使用短命令
vite -c vite.admin.config.js
```

### 2. 禁用配置文件

```javascript
// 方式一：通过配置文件
export default {
  configFile: false
}

// 方式二：通过命令行
vite --configFile false

// 效果：使用 Vite 默认配置，不加载任何配置文件
```

### 3. 在配置文件中指定（特殊用法）

```javascript
// vite.config.js
export default {
  // 指定另一个配置文件（较少使用）
  configFile: './vite.prod.config.js'
}
```

## 生效后的结果示例

### 使用自定义配置文件

```javascript
// 项目结构
project/
├── config/
│   ├── vite.dev.config.js     // 开发环境配置
│   ├── vite.prod.config.js    // 生产环境配置
│   └── vite.base.config.js    // 基础配置
├── src/
└── package.json

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

使用方式：

```bash
# 开发环境
vite --config config/vite.dev.config.js

# 生产构建
vite build --config config/vite.prod.config.js

# 添加到 package.json
{
  "scripts": {
    "dev": "vite --config config/vite.dev.config.js",
    "build": "vite build --config config/vite.prod.config.js"
  }
}
```

### 禁用配置文件

```bash
# 使用完全默认配置
vite --configFile false

# 或在代码中
// vite.config.js
export default {
  configFile: false,
  // 其他配置仍然可以生效
  server: {
    port: 3000
  }
}
```

### Monorepo 多配置文件

```javascript
// 项目结构
monorepo/
├── apps/
│   ├── web/
│   │   └── vite.config.js
│   └── admin/
│       └── vite.config.js
├── packages/
│   └── shared/
└── vite.base.config.js          // 共享基础配置

// vite.base.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@shared': '/packages/shared'
    }
  },
  // 其他共享配置...
})

// 在子应用中继承基础配置
// apps/web/vite.config.js
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

### 1. 环境分离配置

根据不同环境使用不同的配置文件：

```javascript
// config/vite.development.js
export default {
  server: {
    host: true,
    port: 5173,
    open: true
  },
  define: {
    __DEV__: true
  }
}

// config/vite.production.js
export default {
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  define: {
    __DEV__: false
  }
}

// config/vite.staging.js
export default {
  base: '/staging/',
  build: {
    outDir: 'dist-staging'
  }
}
```

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

### 2. Monorepo 应用配置

```javascript
// apps/web/vite.config.js
export default {
  base: '/web/',
  server: { port: 5173 }
}

// apps/admin/vite.config.js
export default {
  base: '/admin/',
  server: { port: 5174 }
}

// 根目录 package.json
{
  "scripts": {
    "dev:web": "vite --config apps/web/vite.config.js",
    "dev:admin": "vite --config apps/admin/vite.config.js"
  }
}
```

### 3. 配置文件组织

将配置文件放在专门目录中：

```javascript
// 项目结构
project/
├── config/
│   ├── vite/
│   │   ├── base.js
│   │   ├── development.js
│   │   └── production.js
│   └── webpack/
├── src/
└── vite.config.js

// vite.config.js - 主入口
import { defineConfig } from 'vite'
import devConfig from './config/vite/development'
import prodConfig from './config/vite/production'

export default defineConfig(({ mode }) => {
  return mode === 'production' ? prodConfig : devConfig
})
```

### 4. 无配置模式

使用 Vite 默认配置，适合简单项目：

```bash
# 项目结构（无配置文件）
simple-project/
├── index.html
├── package.json
└── src/
    └── main.js

# 直接运行
vite
```

## 注意事项

### 1. 配置文件必须是 ESM 格式

```javascript
// ❌ 错误：CommonJS 格式（除非使用 .cjs 扩展名）
module.exports = {
  server: { port: 3000 }
}

// ✅ 正确：ESM 格式
export default {
  server: { port: 3000 }
}

// 或使用 defineConfig（推荐）
import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 3000 }
})
```

### 2. package.json 的 type 字段

```json
// package.json
{
  "type": "module"  // 使用 ES Module
}
```

当设置 `"type": "module"` 时，配置文件必须使用 ESM 格式。

### 3. 配置文件的模块解析

```javascript
// vite.config.ts 可以使用 TypeScript
import { defineConfig } from 'vite'

export default defineConfig({
  // 配置内容
})
```

TypeScript 配置文件会被 Vite 自动通过 esbuild 转译。

### 4. 禁用配置文件的影响

```javascript
// 禁用配置文件后
export default {
  configFile: false
}

// 以下功能使用默认值：
// - 开发服务器端口：5173
// - 构建输出目录：dist
// - 模块解析：基于浏览器原生 ESM
// - HMR：默认配置

// 但仍可以在配置文件中设置其他选项
```

### 5. 配置文件查找与 root 的区别

```javascript
// configFile 的查找
// - 从 process.cwd() 开始向上搜索
// - 不受 root 配置影响

// root 的作用
// - 指定项目根目录
// - 影响 index.html 等文件查找位置

export default {
  configFile: './config/vite.config.js',  // 配置文件位置
  root: './src'                           // 项目根目录
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | `configFile` 查找不受 `root` 影响，从 `process.cwd()` 向上搜索 |
| `mode` | 配置文件可以通过函数参数获取当前 `mode` |
| `envDir` | 环境变量目录查找基于 `root`，不受 `configFile` 位置影响 |

## 完整示例

### 基础配置文件

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // 插件
  plugins: [vue()],

  // 路径解析
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
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
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
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

### 动态配置合并

```javascript
// config/vite.base.js
export default {
  resolve: {
    alias: {
      '@': require('path').resolve(__dirname, './src')
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

// vite.config.js - 合并配置
import { defineConfig } from 'vite'
import { merge } = require('lodash/merge')
import baseConfig from './config/vite.base.js'
import devConfig from './config/vite.dev.js'
import prodConfig from './config/vite.prod.js'

export default defineConfig(({ mode }) => {
  const config = mode === 'production' ? prodConfig : devConfig
  return merge({}, baseConfig, config)
})
```

### 环境变量控制配置文件

```javascript
// package.json
{
  "scripts": {
    "dev": "vite --config $VITE_CONFIG",
    "dev:web": "VITE_CONFIG=config/web.vite.config.js vite",
    "dev:admin": "VITE_CONFIG=config/admin.vite.config.js vite"
  }
}

// 或使用 cross-env（跨平台）
{
  "scripts": {
    "dev:web": "cross-env VITE_CONFIG=config/web.vite.config.js vite --config $VITE_CONFIG"
  }
}
```

## 常见问题

### 问题 1：配置文件不生效

**原因**：配置文件格式错误或位置不对

```javascript
// ❌ 错误：CommonJS 格式（在 type: "module" 项目中）
module.exports = {
  port: 3000
}

// ✅ 正确：ESM 格式
export default {
  port: 3000
}
```

### 问题 2：TypeScript 配置文件报错

**原因**：缺少必要的类型声明

```bash
# 安装类型声明
npm install -D @types/node

# vite.config.ts 中添加引用
/// <reference types="node" />
```

### 问题 3：配置文件查找错误

**原因**：多个配置文件导致冲突

```javascript
// 项目中存在多个配置文件时
// vite.config.js
// vite.config.ts

// 明确指定使用哪一个
vite --config vite.config.js
```

## 官方文档

[Shared Config: configFile - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#config-file)

[Config File - Vite 官方文档](https://cn.vitejs.dev/config/)
