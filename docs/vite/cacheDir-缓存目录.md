# cacheDir 配置

## 定义

`cacheDir` 指定缓存文件的存储目录，用于存放预构建依赖和转换后的源码缓存，提高 Vite 启动和 HMR 速度。

**类型**：`string`

**默认值**：`'node_modules/.vite'`（相对于 `root` 目录）

## 可选值与使用方式

### 1. 相对路径

```javascript
// 默认值
export default {
  cacheDir: 'node_modules/.vite'
}

// 自定义缓存目录
export default {
  cacheDir: '.vite'
}

// 嵌套目录
export default {
  cacheDir: '.cache/vite'
}
```

### 2. 绝对路径

```javascript
import path from 'path'

export default {
  cacheDir: path.resolve(__dirname, './.vite-cache')
}

// 使用环境变量
export default {
  cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite'
}
```

### 3. 不同环境不同缓存目录

```javascript
export default defineConfig(({ mode }) => {
  return {
    cacheDir: mode === 'test' ? '.vite-test' : 'node_modules/.vite'
  }
})
```

## 缓存目录结构

```
node_modules/.vite/
├── deps/                    # 预构建依赖缓存
│   ├── _metadata.json       # 依赖元数据
│   ├── vue.js               # 预构建的 Vue
│   ├── vue-router.js        # 预构建的 Vue Router
│   ├── axios.js              # 预构建的 Axios
│   └── ...
├── fs/                      # 文件系统缓存
│   └── ...
└── metadata.json            # 缓存元信息
```

### 各目录说明

| 目录 | 内容 | 说明 |
|------|------|------|
| `deps/` | 预构建依赖 | CommonJS 转 ESM 后的依赖文件 |
| `fs/` | 文件系统缓存 | 文件监听和转换结果缓存 |
| `metadata.json` | 元数据 | 缓存版本和配置信息 |

## 生效后的结果示例

### 默认配置

```javascript
// vite.config.js
export default {
  // cacheDir: 'node_modules/.vite'  // 默认值
}
```

```
project/
├── node_modules/
│   └── .vite/          ← 缓存目录
│       ├── deps/
│       └── metadata.json
├── src/
├── vite.config.js
└── package.json
```

### 自定义缓存目录

```javascript
// vite.config.js
export default {
  cacheDir: '.vite-cache'
}
```

```
project/
├── .vite-cache/         ← 自定义缓存目录
│   ├── deps/
│   └── metadata.json
├── node_modules/
├── src/
├── vite.config.js
└── package.json
```

### 项目根目录外缓存

```javascript
import path from 'path'

// vite.config.js
export default {
  cacheDir: path.resolve(__dirname, '../../.vite-cache')
}
```

适用于 Monorepo 共享缓存场景。

## 使用场景

### 1. 避免 node_modules 污染

将缓存从 `node_modules` 分离：

```javascript
// vite.config.js
export default {
  cacheDir: '.vite'
}
```

**.gitignore 配置**：

```gitignore
.vite/
```

### 2. Docker 持久化缓存

Docker 容器中挂载缓存目录：

```javascript
// vite.config.js
export default {
  cacheDir: '/cache/.vite'
}
```

**Dockerfile**：

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# 创建缓存目录
RUN mkdir -p /cache/.vite
```

**docker-compose.yml**：

```yaml
services:
  app:
    build: .
    volumes:
      - ./vite-cache:/cache/.vite
    command: npm run dev
```

### 3. CI/CD 缓存

在 CI/CD 流程中缓存加速构建：

```javascript
// vite.config.js
export default {
  cacheDir: '.vite-ci'
}
```

**GitHub Actions**：

```yaml
- name: Cache Vite
  uses: actions/cache@v3
  with:
    path: .vite-ci
    key: ${{ runner.os }}-vite-${{ hashFiles('**/package-lock.json') }}
```

### 4. Monorepo 共享缓存

```javascript
// 项目结构
workspace/
├── packages/
│   ├── app1/
│   │   └── vite.config.js
│   └── app2/
│       └── vite.config.js
└── .vite-cache/           ← 共享缓存目录

// packages/app1/vite.config.js
import path from 'path'

export default {
  cacheDir: path.resolve(__dirname, '../../.vite-cache')
}
```

### 5. 测试环境独立缓存

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    cacheDir: mode === 'test' ? '.vite-test' : 'node_modules/.vite'
  }
})
```

### 6. 临时禁用缓存

```javascript
// vite.config.js
export default {
  cacheDir: false  // Vite 5.x 不支持，需要删除目录
}
```

**替代方案**：使用环境变量或脚本删除缓存

```bash
# 删除缓存后运行
rm -rf node_modules/.vite && vite
```

## 注意事项

### 1. 缓存失效条件

缓存会在以下情况自动重建：

```javascript
// 1. 配置文件变化
// vite.config.js 修改后

// 2. 依赖变化
// package.json 或 lock 文件变化

// 3. 缓存版本不匹配
// Vite 版本升级后
```

### 2. 手动清除缓存

```bash
# 删除默认缓存目录
rm -rf node_modules/.vite

# 删除自定义缓存目录
rm -rf .vite-cache

# 使用 npm script
{
  "scripts": {
    "clean": "rm -rf node_modules/.vite dist",
    "dev": "vite",
    "dev:clean": "npm run clean && vite"
  }
}
```

### 3. .gitignore 配置

```gitignore
# Vite 缓存目录
.vite/
.vite-cache/
node_modules/.vite/

# 或者忽略所有 vite 缓存
**/.vite/
```

### 4. 与 root 的关系

```javascript
// vite.config.js
export default {
  root: './app',           // 项目根目录
  cacheDir: '.vite'        // 相对于 root，即 app/.vite
}
```

### 5. 缓存与 optimizeDeps 的关系

```javascript
export default {
  cacheDir: 'node_modules/.vite',
  optimizeDeps: {
    // 预构建依赖存放在 cacheDir/deps/
    include: ['vue', 'vue-router']
  }
}
```

### 6. 多项目缓存冲突

```javascript
// 避免多个项目使用同一缓存目录

// ❌ 错误：多个项目指向同一缓存
// Project A: cacheDir: '/tmp/.vite'
// Project B: cacheDir: '/tmp/.vite'

// ✅ 正确：使用项目特定的缓存
// Project A: cacheDir: '.vite-a'
// Project B: cacheDir: '.vite-b'
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | `cacheDir` 相对路径基于 `root` |
| `optimizeDeps` | 预构建依赖存放在 `cacheDir/deps/` |
| `server.force` | 强制重新预构建会重建缓存 |
| `build.rollupOptions` | 配置变化可能导致缓存失效 |

## 完整示例

### 开发/生产不同缓存

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    // 开发和生产使用不同缓存
    cacheDir: mode === 'development' ? '.vite-dev' : '.vite-prod'
  }
})
```

### Monorepo 共享缓存配置

```javascript
// 项目结构
workspace/
├── apps/
│   ├── web/
│   │   └── vite.config.js
│   └── admin/
│       └── vite.config.js
├── .vite-cache/        ← 共享缓存
└── package.json

// apps/web/vite.config.js
import path from 'path'

export default {
  cacheDir: path.resolve(__dirname, '../../.vite-cache'),
  optimizeDeps: {
    // 共享缓存需要确保依赖一致
    include: ['vue', 'vue-router']
  }
}
```

### Docker 完整配置

```javascript
// vite.config.js
export default {
  // 使用固定路径便于 Docker 挂载
  cacheDir: '/app/.vite-cache',

  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      // Docker 环境需要轮询
      usePolling: true
    }
  }
}
```

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源码
COPY . .

# 暴露端口
EXPOSE 5173

# 启动命令
CMD ["npm", "run", "dev"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  vite-app:
    build: .
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - vite-cache:/app/.vite-cache  # 持久化缓存
    environment:
      - CHOKIDAR_USEPOLLING=true

volumes:
  vite-cache:
```

### CI/CD 完整配置

```javascript
// vite.config.js
export default {
  cacheDir: process.env.CI ? '.vite-ci' : 'node_modules/.vite'
}
```

```yaml
# .github/workflows/build.yml
name: Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Cache Vite
        uses: actions/cache@v3
        with:
          path: .vite-ci
          key: ${{ runner.os }}-vite-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-vite-

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
```

## 常见问题

### 问题 1：修改配置后未生效

**原因**：缓存未失效

```bash
# 解决：删除缓存
rm -rf node_modules/.vite
vite
```

### 问题 2：Docker 中文件监听不工作

**原因**：缓存与文件监听配置冲突

```javascript
// vite.config.js
export default {
  server: {
    watch: {
      usePolling: true  // Docker 环境需要轮询
    }
  }
}
```

### 问题 3：缓存体积过大

**原因**：缓存积累过多

```bash
# 清理方案
rm -rf node_modules/.vite

# 或使用 npm script
{
  "scripts": {
    "clean:cache": "rm -rf node_modules/.vite"
  }
}
```

### 问题 4：依赖更新后缓存未更新

**原因**：缓存未失效

```javascript
// 强制重新预构建
export default {
  optimizeDeps: {
    force: true  // 强制重建
  }
}
```

## 官方文档

[Shared Config: cacheDir - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#cachedir)
