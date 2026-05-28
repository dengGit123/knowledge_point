# envDir 配置

## 定义

`envDir` 指定环境变量文件的存放目录，`.env` 等文件会从此目录加载。

**类型**：`string`

**默认值**：`root` 目录（`'/'`，即 `process.cwd()` 或配置的 `root` 值）

## 可选值与使用方式

### 1. 相对路径

```javascript
// 默认值 - 项目根目录
export default {
  envDir: './'
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
import path from 'path'

export default {
  envDir: path.resolve(__dirname, './env')
}

// 或
export default {
  envDir: '/absolute/path/to/env'
}
```

### 3. 环境变量动态配置

```javascript
export default {
  envDir: process.env.VITE_ENV_DIR || './'
}
```

## 环境变量文件

### 文件命名规则

| 文件名 | 加载时机 | 优先级 | Git 追踪 |
|--------|----------|--------|----------|
| `.env` | 所有模式 | 低 | ✅ 是 |
| `.env.local` | 所有模式 | 高 | ❌ 否 |
| `.env.[mode]` | 指定模式 | 中 | ✅ 是 |
| `.env.[mode].local` | 指定模式 | 高 | ❌ 否 |

### 加载优先级

从高到低：

```
1. .env.[mode].local
2. .env.local
3. .env.[mode]
4. .env
```

## 生效后的结果示例

### 默认配置

```javascript
// vite.config.js
export default {
  // envDir: './'  // 默认值
}
```

```
project/
├── .env                    # 所有环境加载
├── .env.local              # 所有环境加载，优先级高（不提交）
├── .env.development        # 开发模式加载
├── .env.development.local  # 开发模式加载，优先级最高（不提交）
├── .env.production         # 生产模式加载
├── .env.production.local   # 生产模式加载，优先级最高（不提交）
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

```
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

### 不同环境不同目录

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    envDir: mode === 'test' ? './config/test-env' : './config/env'
  }
})
```

## 使用场景

### 1. 集中管理环境变量

将所有环境变量文件放在统一目录：

```javascript
// vite.config.js
export default {
  envDir: './env'
}
```

```
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

### 2. 环境隔离

开发环境和生产环境使用不同的环境变量目录：

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    envDir: `./config/env-${mode}`
  }
})
```

```
project/
├── config/
│   ├── env-development/
│   │   └── .env
│   └── env-production/
│       └── .env
├── src/
└── vite.config.js
```

### 3. Monorepo 共享环境变量

```javascript
// 项目结构
workspace/
├── packages/
│   ├── app1/
│   │   └── vite.config.js
│   └── app2/
│       └── vite.config.js
└── env/                      ← 共享环境变量
    ├── .env
    └── .env.production

// packages/app1/vite.config.js
import path from 'path'

export default {
  envDir: path.resolve(__dirname, '../../env')
}
```

### 4. 多项目配置

```javascript
// 项目结构
services/
├── web/
│   ├── vite.config.js
│   └── src/
├── api/
│   ├── vite.config.js
│   └── src/
└── shared-env/              ← 共享环境变量
    ├── .env.base
    └── .env.secrets

// services/web/vite.config.js
import path from 'path'

export default {
  envDir: path.resolve(__dirname, '../shared-env')
}
```

## 注意事项

### 1. 相对路径基准

```javascript
// vite.config.js
export default {
  envDir: './env',  // 相对于 root，而非配置文件目录
  root: './app'      // 如果设置了 root，envDir 相对于 app/
}
```

### 2. .env.local 始终被 Git 忽略

```bash
# .gitignore
.env.local
.env.*.local
```

### 3. 环境变量前缀限制

只有以 `VITE_` 开头的变量才会暴露给客户端：

```bash
# .env.production
VITE_API_URL=https://api.example.com  ✅ 可访问
DATABASE_URL=xxx                      ❌ 仅服务端可访问
```

### 4. 模式文件命名

```bash
# ✅ 正确
.env.development
.env.production
.env.staging

# ❌ 错误
.env.dev
.env.prod
```

### 5. 空值和引号

```bash
# .env
VITE_TITLE=My App          # ✅ 无引号
VITE_MESSAGE="Hello"      # ✅ 双引号
VITE_COUNT=5              # ✅ 数字
VITE_EMPTY=               # ✅ 空值（=后面没有空格）
VITE_WITH_SPACE=          # 空字符串
# VITE_COMMENT=# Comment   # ❌ 整行注释
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | `envDir` 相对路径基于 `root` |
| `mode` | 决定加载 `.env.[mode]` 文件 |
| `envPrefix` | 控制哪些变量暴露给客户端（默认 `VITE_`） |
| `define` | 可手动定义全局变量替代环境变量 |

## 完整示例

### 集中管理环境变量

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

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

```
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

### Monorepo 共享环境变量

```javascript
// packages/web/vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  // 使用根目录的 env 文件夹
  envDir: path.resolve(__dirname, '../../env'),

  // 其他配置...
})
```

### 不同项目不同环境变量

```javascript
// apps/web/vite.config.js
export default {
  envDir: './env'
}

// apps/admin/vite.config.js
export default {
  envDir: './env'
}
```

```
workspace/
├── apps/
│   ├── web/
│   │   ├── env/
│   │   │   ├── .env
│   │   │   └── .env.development
│   │   └── vite.config.js
│   └── admin/
│       ├── env/
│       │   ├── .env
│       │   └── .env.development
│       └── vite.config.js
```

## 常见问题

### 问题 1：环境变量未生效

**原因**：文件命名错误

```bash
# ❌ 错误
.env.dev
.env.prod

# ✅ 正确
.env.development
.env.production
```

### 问题 2：客户端无法访问环境变量

**原因**：变量前缀不正确

```bash
# .env.production
API_URL=https://api.example.com  ❌ 错误
VITE_API_URL=https://api.example.com  ✅ 正确
```

### 问题 3：.env.local 被提交到 Git

**解决**：确保 `.gitignore` 包含

```gitignore
.env.local
.env.*.local
```

## 官方文档

[Shared Config: envDir - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#envdir)

[Env Variables - Vite 官方文档](https://cn.vitejs.dev/guide/env-and-mode.html)
