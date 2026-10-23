# root 配置

> 📖 [官方文档：Shared Options](https://cn.vitejs.dev/config/shared-options.html)

## 定义

`root` 指定项目根目录，即 `index.html` 所在的位置，也是所有相对路径解析的基准点。

**类型**：`string`

**默认值**：`process.cwd()`（运行 `vite` 命令时的当前工作目录）

取值可以是绝对路径，也可以是相对于配置文件自身所在目录的相对路径。

## 可选值与使用方式

### 1. 相对路径（相对于配置文件所在目录）

```javascript
// vite.config.js
export default {
  // root 是单值属性，只能写一个；需要换用时直接替换值
  root: './app' // 把 app 目录作为项目根目录
}
```

### 2. 绝对路径

```javascript
// vite.config.js（CommonJS 环境有 __dirname）
import path from 'node:path'

export default {
  // 推荐：用 path.resolve 生成绝对路径，避免相对路径歧义
  root: path.resolve(__dirname, './app')
}
```

```javascript
// vite.config.js（"type": "module" 的 ESM 环境下没有 __dirname）
import { fileURLToPath, URL } from 'node:url'

export default {
  root: fileURLToPath(new URL('./app', import.meta.url))
}
```

### 3. 命令行指定

`root` 是 CLI 的位置参数，此时相对路径基于当前工作目录解析：

```bash
vite serve ./app   # 以 app 目录为根启动开发服务器
vite build ./app   # 以 app 目录为根构建
```

### 4. 环境变量动态配置

```javascript
// vite.config.js
export default {
  root: process.env.VITE_ROOT_DIR || './'
}
```

## 生效后的结果示例

### 默认情况（不设置 root）

```text
my-project/
├── index.html        # 入口：root/index.html
├── public/           # publicDir 默认：root/public
├── vite.config.js
├── package.json
└── src/
    └── main.js
```

`root` 默认为 `process.cwd()`（即 `my-project/`），Vite 从 `my-project/index.html` 启动开发服务器。

### 自定义 root 目录

```text
my-project/
├── vite.config.js
└── app/
    ├── index.html    # 入口移到 app/ 下
    ├── public/
    │   └── favicon.ico
    └── src/
        └── main.js
```

```javascript
// vite.config.js
export default {
  root: './app' // 项目根目录指向 app/
}
```

此时入口变为 `my-project/app/index.html`，`publicDir` 默认值也跟着变为 `my-project/app/public`。

## 影响范围

| 影响项 | 说明 |
|--------|------|
| `index.html` 查找位置 | 入口为 `<root>/index.html` |
| `publicDir` 默认路径 | 默认为 `<root>/public` |
| `cacheDir` 默认路径 | 默认为 `<root>/node_modules/.vite` |
| `envDir` 默认路径 | 环境变量文件默认从 `<root>` 读取 |
| 相对路径解析 | 其他配置项的相对路径默认基于 `root` 解析 |
| 配置文件查找 | Vite 在 `root` 下查找配置文件 |

## 使用场景

### 1. 单仓库多应用（Monorepo）

每个子应用拥有独立的 `index.html` 与配置，把各自的目录设为 `root`，产物输出到统一目录。完整配置见下方「完整示例」。

### 2. 自定义目录结构

当项目把入口放在 `client/`、配置放在 `config/` 这类非默认结构时：

```text
my-project/
├── config/
│   └── vite.config.js      # 配置文件不在根目录
├── client/
│   ├── index.html
│   ├── public/
│   └── src/
└── server/
```

```javascript
// config/vite.config.js
import path from 'node:path'

export default {
  // 把 client 目录设为项目根
  root: path.resolve(__dirname, '../client'),
  build: {
    // 输出目录想放在 root 之外时，用绝对路径
    outDir: path.resolve(__dirname, '../dist')
  }
}
```

### 3. 仅构建部分目录

```javascript
// vite.config.js
export default {
  root: './docs',           // 只把 docs 作为根目录参与构建
  build: {
    outDir: '../dist-docs'  // 相对 root，即 project/dist-docs
  }
}
```

## 注意事项

### 1. 相对路径的基准

配置文件内的 `root` 相对于配置文件所在目录解析；其余路径类配置（如 `publicDir`、`build.outDir`）的相对值默认基于 `root` 解析：

```javascript
// vite.config.js 位于 project/
export default {
  root: './src',             // 实际为 project/src/

  // 以下相对值都基于 project/src/ 解析
  publicDir: './public',     // project/src/public
  build: {
    // 想指向项目根目录之外时，建议用绝对路径
    outDir: path.resolve(__dirname, '../dist')  // project/dist
  }
}
```

### 2. 配置文件查找与 root

Vite 在 `root` 目录下查找配置文件，不会向上递归查找父目录；`root` 通过 CLI 指定时，配置文件也从指定的 root 目录里找。因此把 root 指向子目录后，配置文件通常也要放到该目录下，或用 `--config` 明确指定。

### 3. 与工作目录（cwd）的区别

```javascript
// process.cwd()：运行 vite 命令的目录
// root：项目根目录（相对路径的解析基准）

// 在 /home/user/projects/my-app/ 下运行 vite
// process.cwd() = /home/user/projects/my-app/
```

```javascript
// vite.config.js
export default {
  root: './src' // root = /home/user/projects/my-app/src/，cwd 不变
}
```

### 4. ESM 环境下没有 `__dirname`

`package.json` 设置了 `"type": "module"` 时，配置文件按 ESM 加载，`__dirname` 未定义，改用 `import.meta.url`：

```javascript
// vite.config.js
import { fileURLToPath, URL } from 'node:url'

export default {
  root: fileURLToPath(new URL('./app', import.meta.url))
}
```

> 💡 **提示：** Node.js 20.11+ 也可以直接使用 `import.meta.dirname`。

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `publicDir` | 默认值为 `<root>/public`，受 `root` 影响 |
| `cacheDir` | 默认值为 `<root>/node_modules/.vite`，受 `root` 影响 |
| `envDir` | 默认值为 `root`，环境变量文件查找位置 |
| `base` | `base` 是 URL 路径前缀，`root` 是文件系统路径，两者独立 |
| `configFile` | 配置文件默认在 `root` 目录下查找，不向上递归 |
| `build.outDir` | 相对路径时相对于 `root` |
| `server.fs.allow` | 默认基于工作区根目录计算，一般不等于 `root` |

## 完整示例

### Monorepo 多应用

```text
workspace/
├── apps/
│   ├── web/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   └── main.js
│   │   └── vite.config.js
│   └── admin/
│       ├── index.html
│       ├── src/
│       └── vite.config.js
├── packages/
│   └── shared/               # 共享代码包
└── package.json
```

```javascript
// apps/web/vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 1. 当前子应用目录即项目根
  root: fileURLToPath(new URL('.', import.meta.url)),

  // 2. 路径别名：@ 指向本应用，@shared 指向共享包
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../../packages/shared', import.meta.url))
    }
  },

  // 3. 部署路径与输出目录
  base: '/web/',
  build: {
    outDir: fileURLToPath(new URL('../../dist/web', import.meta.url)),
    emptyOutDir: true
  },

  plugins: [vue()]
})
```

```javascript
// apps/admin/vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../../packages/shared', import.meta.url))
    }
  },
  base: '/admin/',
  build: {
    outDir: fileURLToPath(new URL('../../dist/admin', import.meta.url))
  },
  server: {
    port: 5174
  },
  plugins: [vue()]
})
```

### 动态 Root

```javascript
// vite.config.js
import path from 'node:path'
import { defineConfig } from 'vite'

// 根据环境变量决定 root，便于一套配置构建多个子目录
const getRoot = () => {
  const envRoot = process.env.VITE_ROOT
  return envRoot ? path.resolve(process.cwd(), envRoot) : process.cwd()
}

export default defineConfig({
  root: getRoot(),
  build: {
    // 输出目录固定在 cwd 下的 dist，不随 root 变化
    outDir: path.resolve(process.cwd(), 'dist')
  }
})
```

```bash
# 分别构建不同子目录
VITE_ROOT=./client vite build
VITE_ROOT=./admin vite build
```

## 常见问题

### 问题 1：找不到 index.html

**原因**：`root` 指向的目录里没有 `index.html`，而它是 Vite 的入口。

```javascript
// ❌ 错误：index.html 在项目根目录，不在 src/ 里
export default {
  root: './src'
}

// ✅ 正确：root 指向 index.html 所在目录
export default {
  root: './'
}
```

### 问题 2：public 文件无法访问

**原因**：`root` 改变后，`publicDir` 的默认位置随之变为 `<root>/public`，原 public 目录不再生效。

```javascript
// 项目结构：public 在 project/public，配置文件在 config/ 子目录
// config/vite.config.js
export default {
  root: path.resolve(__dirname, '..') // 指回 project/，publicDir 默认 project/public
}
```

### 问题 3：Monorepo 中别名解析错误

**原因**：`resolve.alias` 写相对路径时基于 `root` 解析，容易指向错误位置。

```javascript
// ❌ 错误：相对路径解析结果不可控
export default {
  root: './apps/web',
  resolve: {
    alias: {
      '@shared': '../packages/shared'
    }
  }
}

// ✅ 正确：别名统一用绝对路径
import path from 'node:path'

export default {
  root: path.resolve(__dirname, './apps/web'),
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './packages/shared')
    }
  }
}
```
