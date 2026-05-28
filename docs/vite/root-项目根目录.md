# root 配置

## 定义

`root` 指定项目的根目录，所有相对路径解析的基准点，包括 `index.html` 的查找位置。

**类型**：`string`

**默认值**：`process.cwd()`（当前工作目录，通常是运行 `vite` 命令的目录）

## 可选值与使用方式

### 1. 相对路径

相对于配置文件所在目录的路径：

```javascript
// vite.config.js 位于项目根目录
export default {
  root: './'           // 当前目录（默认）
  root: './src'        // src 目录作为根目录
  root: './app'        // app 目录作为根目录
  root: '../'          // 父目录
}
```

### 2. 绝对路径

使用绝对路径指定根目录：

```javascript
import path from 'path'

export default {
  // 使用 path.resolve 生成绝对路径
  root: path.resolve(__dirname, './src'),
  root: path.resolve(__dirname, '../app'),

  // 或直接使用绝对路径（不推荐，可移植性差）
  root: '/Users/username/project/src'
}
```

### 3. 环境变量动态配置

```javascript
export default {
  root: process.env.VITE_ROOT_DIR || './'
}
```

## 生效后的结果示例

### 默认情况（不设置 root）

```javascript
// 项目结构
my-project/
├── index.html
├── vite.config.js
├── package.json
└── src/
    └── main.js

// vite.config.js
export default {
  // root 默认为 process.cwd()，即 my-project/
}

// 运行 vite 时
// - index.html 查找位置：my-project/index.html
// - publicDir 查找位置：my-project/public
// - 相对路径解析基准：my-project/
```

### 自定义 root 目录

```javascript
// 项目结构
my-project/
├── vite.config.js
└── app/
    ├── index.html
    ├── public/
    │   └── favicon.ico
    └── src/
        └── main.js

// vite.config.js
import path from 'path'

export default {
  root: path.resolve(__dirname, './app')
  // 或简单写法：root: './app'
}

// 运行 vite 时
// - index.html 查找位置：my-project/app/index.html
// - publicDir 查找位置：my-project/app/public
// - 相对路径解析基准：my-project/app/
```

### Monorepo 多应用结构

```javascript
// 项目结构
monorepo/
├── packages/
│   ├── admin/
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── src/
│   └── app/
│       ├── index.html
│       ├── vite.config.js
│       └── src/
├── package.json
└── pnpm-workspace.yaml

// packages/admin/vite.config.js
import path from 'path'

export default {
  // 将 admin 目录设为项目根
  root: path.resolve(__dirname, './'),
  build: {
    outDir: '../../dist/admin'
  }
}

// packages/app/vite.config.js
import path from 'path'

export default {
  root: path.resolve(__dirname, './'),
  build: {
    outDir: '../../dist/app'
  }
}
```

## 影响范围

`root` 配置会影响以下内容：

| 影响项 | 说明 |
|--------|------|
| `index.html` 查找位置 | 在 `<root>/index.html` 查找 |
| `publicDir` 默认路径 | 默认为 `<root>/public` |
| `cacheDir` 默认路径 | 默认为 `<root>/node_modules/.vite` |
| `envDir` 默认路径 | 默认为 `<root>` |
| 相对路径解析 | 所有相对路径都基于 `root` 解析 |
| 文件监听范围 | Vite 监听 `root` 下的文件变化 |

## 使用场景

### 1. 单仓库多应用

在 Monorepo 中管理多个独立应用：

```javascript
// 项目结构
workspace/
├── apps/
│   ├── web/
│   │   ├── index.html
│   │   ├── src/
│   │   └── vite.config.js
│   └── admin/
│       ├── index.html
│       ├── src/
│       └── vite.config.js
├── packages/
│   └── shared/
└── package.json

// apps/web/vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname),  // apps/web/
  base: '/web/',
  build: {
    outDir: path.resolve(__dirname, '../../dist/web')
  }
})

// apps/admin/vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname),  // apps/admin/
  base: '/admin/',
  build: {
    outDir: path.resolve(__dirname, '../../dist/admin')
  }
})
```

### 2. 自定义目录结构

当项目结构不符合 Vite 默认假设时：

```javascript
// 项目结构
my-project/
├── config/
│   └── vite.config.js      // 配置文件不在根目录
├── client/
│   ├── index.html
│   ├── public/
│   └── src/
└── server/

// config/vite.config.js
import path from 'path'

export default {
  // 设置 client 目录为项目根
  root: path.resolve(__dirname, '../client'),
  build: {
    outDir: path.resolve(__dirname, '../dist')
  }
}
```

### 3. 微前端架构

```javascript
// 项目结构
micro-frontend/
├── shell/
│   ├── index.html
│   └── vite.config.js
├── module-a/
│   ├── index.html
│   └── vite.config.js
└── module-b/
    ├── index.html
    └── vite.config.js

// module-a/vite.config.js
import path from 'path'

export default {
  root: path.resolve(__dirname),
  base: '/modules/a/',
  server: {
    port: 3001
  },
  build: {
    outDir: '../../dist/modules/a'
  }
}
```

### 4. 仅构建部分目录

```javascript
// 项目结构
project/
├── docs/              // 只想构建文档部分
│   ├── index.html
│   └── src/
├── src/               // 主应用源码
└── vite.config.js

// vite.config.js
export default {
  // 将 docs 作为根目录
  root: './docs',
  build: {
    outDir: '../dist-docs'
  }
}
```

## 注意事项

### 1. index.html 必须在 root 目录下

```javascript
// ❌ 错误配置
export default {
  root: './src'  // index.html 不在 src 目录下
}
// 会报错：Error: Cannot find index.html

// ✅ 正确配置
export default {
  root: './'  // index.html 在根目录
}
```

### 2. 相对路径的基准

```javascript
// vite.config.js 位于 project/config/
export default {
  root: './src',  // 相对于配置文件目录

  // 以下路径都是相对于 root（即 project/src/）
  publicDir: './public',     // 实际指向 project/src/public
  cacheDir: './.vite',       // 实际指向 project/src/.vite

  // 如果想指向项目根目录，需要使用绝对路径
  build: {
    outDir: path.resolve(__dirname, '../dist')  // project/dist
  }
}
```

### 3. 配置文件查找

配置文件本身的查找从 `process.cwd()` 开始向上搜索，不受 `root` 配置影响：

```javascript
// 在 any-directory/ 下运行 vite
// Vite 会向上查找 vite.config.js
// 找到后，config.root 才生效

// 配置示例
export default {
  // root 不影响配置文件本身的查找
  root: './app'
}
```

### 4. 与 work 目录的区别

```javascript
// process.cwd() = 运行 vite 命令的目录
// root = 项目根目录（相对路径的解析基准）

// 示例
// 在 /home/user/projects/my-app/ 下运行 vite
// process.cwd() = /home/user/projects/my-app/

// vite.config.js
export default {
  root: './src',  // 项目根目录设置为 src 子目录
}

// 此时
// process.cwd() = /home/user/projects/my-app/
// root = /home/user/projects/my-app/src/
```

### 5. TypeScript 类型声明

```typescript
// vite-env.d.ts 或 global.d.ts
import { UserConfig } from 'vite'

const config: UserConfig = {
  root: './src'  // 自动类型提示
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `publicDir` | 默认值为 `<root>/public`，受 `root` 影响 |
| `cacheDir` | 默认值为 `<root>/node_modules/.vite`，受 `root` 影响 |
| `envDir` | 默认值为 `<root>`，环境变量文件查找位置 |
| `base` | `base` 是 URL 路径前缀，`root` 是文件系统路径，两者独立 |
| `configFile` | 配置文件查找不受 `root` 影响，从 `process.cwd()` 向上搜索 |
| `build.outDir` | 相对路径时相对于 `root` |
| `server.fs.allow` | 文件系统访问控制基于 `root` |

## 完整示例

### Monorepo 完整配置

```javascript
// 项目结构
workspace/
├── apps/
│   ├── web/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   └── main.js
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   └── vite.config.js
│   └── admin/
│       ├── index.html
│       ├── src/
│       └── vite.config.js
├── packages/
│   └── shared/
│       └── utils/
└── package.json

// apps/web/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  // 1. 设置项目根目录
  root: path.resolve(__dirname),

  // 2. 配置路径别名（解析到 workspace/packages）
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/shared')
    }
  },

  // 3. 输出配置
  base: '/web/',
  build: {
    outDir: path.resolve(__dirname, '../../dist/web'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },

  // 4. 开发服务器
  server: {
    port: 5173,
    open: true
  },

  // 5. 插件
  plugins: [vue()]
})

// apps/admin/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/shared')
    }
  },

  base: '/admin/',
  build: {
    outDir: path.resolve(__dirname, '../../dist/admin')
  },

  server: {
    port: 5174
  },

  plugins: [vue()]
})
```

### 动态 Root 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

// 根据环境变量或命令行参数设置 root
const getRoot = () => {
  const envRoot = process.env.VITE_ROOT
  if (envRoot) {
    return path.resolve(process.cwd(), envRoot)
  }

  // 默认使用当前目录
  return process.cwd()
}

export default defineConfig({
  root: getRoot(),

  // 确保输出目录正确
  build: {
    outDir: path.resolve(getRoot(), '../dist')
  }
})
```

```bash
# 使用不同的 root
VITE_ROOT=./client vite
VITE_ROOT=./admin vite
```

## 常见问题

### 问题 1：找不到 index.html

**原因**：`root` 设置错误，`index.html` 不在指定目录下

```javascript
// ❌ 错误
export default {
  root: './src'  // index.html 在项目根目录，不在 src/
}

// ✅ 正确
export default {
  root: './'  // 使用项目根目录
}
```

### 问题 2：public 文件无法访问

**原因**：`root` 改变后，`publicDir` 的默认位置也变了

```javascript
// 项目结构
project/
├── index.html
├── public/
│   └── favicon.ico
└── vite.config.js (在 config/ 子目录)

// config/vite.config.js
export default {
  root: path.resolve(__dirname, '..'),  // project/
  // publicDir 默认为 project/public，正确
}
```

### 问题 3：Monorepo 中路径解析错误

**原因**：别名配置与 `root` 不匹配

```javascript
// ❌ 错误
export default {
  root: './apps/web',
  resolve: {
    alias: {
      '@shared': '../packages/shared'  // 相对路径错误
    }
  }
}

// ✅ 正确 - 使用绝对路径
import path from 'path'

export default {
  root: path.resolve(__dirname, './apps/web'),
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './packages/shared')
    }
  }
}
```

## 官方文档

[Shared Config: root - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#root)
