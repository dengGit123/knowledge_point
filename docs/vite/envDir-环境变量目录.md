# envDir 配置

> 📖 [官方文档：Shared Options · envDir](https://cn.vitejs.dev/config/shared-options.html#envdir)

## 定义

`envDir` 指定环境变量文件（`.env`、`.env.local`、`.env.[mode]` 等）的存放目录，Vite 会从这个目录加载它们。

**类型**：`string`

**默认值**：`root`（即项目根目录；路径可以是绝对路径，也可以是相对项目根目录 `root` 的相对路径）

## 可选值与使用方式

### 1. 相对路径

```javascript
// vite.config.js
export default {
  envDir: './' // 默认值：项目根目录
}

// 子目录
export default {
  envDir: './config/env'
}

// 父目录
export default {
  envDir: '../env'
}
```

### 2. 绝对路径

```javascript
// vite.config.js
import path from 'path'

export default {
  envDir: path.resolve(__dirname, './env')
}

// 或直接写绝对路径
export default {
  envDir: '/absolute/path/to/env'
}
```

### 3. 环境变量动态配置

```javascript
// vite.config.js
export default {
  // 可通过进程环境变量切换目录，常用于 CI/CD
  envDir: process.env.VITE_ENV_DIR || './'
}
```

## 与环境变量文件的关系

`envDir` 只决定"从哪里加载"。Vite 会从该目录中按当前 `mode` 加载四类文件：`.env`、`.env.local`、`.env.[mode]`、`.env.[mode].local`，优先级从高到低为 `.env.[mode].local` > `.env.[mode]` > `.env.local` > `.env`（模式专属优先于通用 local），且执行 Vite 时已存在的进程环境变量优先级最高。文件命名规则与 `.env` 语法详见《环境变量文件》一篇。

## 生效后的结果示例

### 默认配置

```javascript
// vite.config.js
export default {
  // envDir: './'  // 默认值，可省略
}
```

```text
project/
├── .env                    # 所有模式加载
├── .env.local              # 所有模式加载，优先级高（不提交 Git）
├── .env.development        # 开发模式加载
├── .env.development.local  # 开发模式加载，优先级最高（不提交 Git）
├── .env.production         # 生产模式加载
├── .env.production.local   # 生产模式加载，优先级最高（不提交 Git）
├── src/
├── vite.config.js
└── package.json
```

### 自定义 envDir

```javascript
// vite.config.js
export default {
  envDir: './config/env'
}
```

```text
project/
├── config/
│   └── env/                ← 环境变量目录
│       ├── .env
│       ├── .env.local
│       ├── .env.development
│       └── .env.production
├── src/
├── vite.config.js
└── package.json
```

### 不同模式不同目录

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    envDir: mode === 'test' ? './config/test-env' : './config/env'
  }
})
```

## 使用场景

### 1. 集中管理环境变量

将所有环境变量文件收进统一目录，避免项目根目录被 `.env` 系列文件占据：

```javascript
// vite.config.js
export default {
  envDir: './env'
}
```

```text
project/
├── env/
│   ├── .env
│   ├── .env.development
│   ├── .env.production
│   ├── .env.staging
│   └── .env.test
├── src/
└── vite.config.js
```

### 2. Monorepo 共享环境变量

多个子包指向同一份环境变量目录：

```javascript
// packages/app1/vite.config.js
import path from 'path'

export default {
  envDir: path.resolve(__dirname, '../../env')
}
```

```text
workspace/
├── packages/
│   ├── app1/
│   │   └── vite.config.js
│   └── app2/
│       └── vite.config.js
└── env/                      ← 共享环境变量
    ├── .env
    └── .env.production
```

### 3. 多项目配置

```javascript
// services/web/vite.config.js
import path from 'path'

export default {
  envDir: path.resolve(__dirname, '../shared-env')
}
```

```text
services/
├── web/
│   ├── vite.config.js
│   └── src/
├── api/
│   ├── vite.config.js
│   └── src/
└── shared-env/               ← 共享环境变量
    ├── .env
    └── .env.production
```

## 注意事项

### 1. 相对路径基于 root，而非配置文件位置

```javascript
// vite.config.js
export default {
  envDir: './env',   // 相对于 root 解析，不是相对于 vite.config.js
  root: './app'      // 设置了 root 后，实际读取 ./app/env/
}
```

### 2. 文件名必须与 mode 值一致

`vite build --mode staging` 只会加载 `.env.staging`。写成 `.env.stg`、`.env.prod` 这类"缩写"文件不会被加载，除非用同名 mode 运行（如 `--mode prod` 配合 `.env.prod`）。

### 3. `.env.local` 始终不提交 Git

```bash
# .gitignore
.env.local
.env.*.local
```

### 4. envDir 改变不影响暴露规则

无论 `.env` 文件放在哪里，暴露给客户端的仍只有 `envPrefix` 指定前缀（默认 `VITE_`）的变量；变量值的语法规则（注释、引号、变量展开、值均为字符串）也与 `envDir` 无关。

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | `envDir` 相对路径基于 `root` 解析，默认值就是 `root` |
| `mode` | 决定加载目录中的哪些 `.env.[mode]` 文件 |
| `envPrefix` | 控制哪些变量暴露给客户端（默认 `VITE_`） |
| `define` | 可手动定义全局常量，替代 `.env` 变量 |

## 完整示例

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // envDir 与 loadEnv 的目录参数保持一致，确保读到同一批文件
  const env = loadEnv(mode, './config/env')

  return {
    // 指定环境变量目录
    envDir: './config/env',

    // 可以在配置中使用环境变量
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL)
    }
  }
})
```

```text
project/
├── config/
│   └── env/
│       ├── .env
│       ├── .env.local
│       ├── .env.development
│       ├── .env.development.local
│       ├── .env.production
│       └── .env.production.local
├── src/
└── vite.config.js
```

## 常见问题

### 问题 1：环境变量文件不生效

依次排查：

```text
1. 文件是否放在 envDir 指定的目录里
2. 文件名是否与 mode 一致（--mode staging 对应 .env.staging）
3. 变量是否带暴露前缀（默认 VITE_）
4. 修改 .env 后是否重启了开发服务器（env 文件只在启动时加载）
```

### 问题 2：客户端无法访问变量

变量前缀与 `envPrefix` 不匹配（如配置了 `envPrefix: 'APP_'` 却写 `VITE_API_URL`），统一前缀即可，详见《envPrefix-环境变量前缀》一篇。

### 问题 3：`.env.local` 被提交到 Git

确保 `.gitignore` 包含：

```text
.env.local
.env.*.local
```
