# cacheDir 配置

> 📖 [官方文档：Shared Options](https://cn.vitejs.dev/config/shared-options.html)

## 定义

`cacheDir` 指定缓存文件的存储目录。此目录下保存 Vite 预打包的依赖以及其他缓存文件，用于提升冷启动和按需加载的速度。需要重新生成缓存时，可以使用 `--force` 命令行选项，或手动删除该目录。

**类型**：`string`

**默认值**：`'node_modules/.vite'`（相对于项目根目录；未检测到 `package.json` 时默认为 `.vite`）

## 可选值与使用方式

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  // 默认值
  // cacheDir: 'node_modules/.vite',

  // 或自定义相对路径（相对于项目根目录）
  // cacheDir: '.vite-cache',

  // 或绝对路径，例如 Docker 挂载目录、monorepo 共享目录
  // cacheDir: path.resolve(__dirname, '../../.vite-cache'),

  // 或交给环境变量控制
  cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite'
})
```

## 缓存目录结构

```text
node_modules/.vite/
├── deps/
│   ├── _metadata.json      ← 预构建元数据（依赖版本、hash、chunk 映射）
│   ├── vue.js              ← 预打包后的依赖产物
│   ├── vue-router.js
│   └── chunk-XXXX.js       ← 被多个依赖共享的公共 chunk
└── deps_temp_XXXX/         ← 重新预构建时的临时目录，完成后替换 deps/
```

| 路径 | 内容 | 说明 |
|------|------|------|
| `deps/` | 预构建产物 | CommonJS 等格式转成 ESM 后的依赖文件 |
| `deps/_metadata.json` | 元数据 | 记录依赖版本与 hash，用于判断缓存是否有效 |
| `deps_temp_*/` | 临时目录 | 重新预构建过程中使用，成功后替换旧的 `deps/` |

## 生效后的结果示例

```javascript
// vite.config.js —— 不配置 cacheDir 时等价于使用默认值
export default {}
```

```text
project/
├── node_modules/
│   └── .vite/              ← 缓存目录（默认位置）
│       └── deps/
├── src/
├── package.json
└── vite.config.js
```

自定义后缓存目录随之移动：

```javascript
// vite.config.js
export default {
  cacheDir: '.vite-cache'
}
```

```text
project/
├── .vite-cache/            ← 自定义缓存目录
│   └── deps/
├── node_modules/
├── src/
├── package.json
└── vite.config.js
```

## 使用场景

### 1. 把缓存移出 node_modules

```javascript
// vite.config.js
export default {
  cacheDir: '.vite'
}
```

```text
# .gitignore 需自行补充
.vite/
```

> 💡 **提示：** 默认放在 `node_modules/.vite` 的好处是 `node_modules` 已被 git 忽略、重装依赖时可一并清理；移出后记得把新目录加入 `.gitignore`。

### 2. Docker 持久化缓存

容器内缓存目录挂载到宿主机或命名卷，避免每次启动都重新预构建：

```javascript
// vite.config.js
export default {
  // 使用固定路径便于挂载
  cacheDir: '/cache/.vite'
}
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    volumes:
      - ./vite-cache:/cache/.vite
    command: npm run dev
```

### 3. CI/CD 缓存加速

```javascript
// vite.config.js
export default {
  cacheDir: process.env.CI ? '.vite-ci' : 'node_modules/.vite'
}
```

完整流水线配置见下文「完整示例」。

### 4. 测试环境独立缓存

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    // 测试模式使用独立目录，避免污染开发缓存
    cacheDir: mode === 'test' ? '.vite-test' : 'node_modules/.vite'
  }
})
```

### 5. 无法通过配置禁用缓存

> ⚠️ **注意：** `cacheDir` 类型是 `string`，不接受 `false`，预构建缓存无法通过配置关闭。

**替代方案**：强制重新预构建或删除缓存目录。

```bash
# 方式一：--force 忽略已有缓存，强制重新预构建
vite --force

# 方式二：删除缓存目录后启动
rm -rf node_modules/.vite && vite
```

## 注意事项

### 1. 缓存失效条件

出现以下情况时，Vite 会自动丢弃旧缓存并重新预构建：

- `package.json` 或 lock 文件中的依赖发生变化
- Vite 配置文件或插件发生变化
- Vite 版本升级导致缓存格式不匹配
- 手动执行 `--force` 或设置了 `optimizeDeps.force: true`

### 2. 手动清除缓存

```bash
# 删除默认缓存目录
rm -rf node_modules/.vite

# 删除自定义缓存目录
rm -rf .vite-cache
```

```json
{
  "scripts": {
    "clean": "rm -rf node_modules/.vite dist",
    "dev:clean": "npm run clean && vite"
  }
}
```

### 3. 与 root 的关系

```javascript
// vite.config.js
export default {
  root: './app',    // 项目根目录
  cacheDir: '.vite' // 相对路径基于 root，实际为 app/.vite
}
```

### 4. 与 optimizeDeps 的关系

```javascript
// vite.config.js
export default {
  cacheDir: 'node_modules/.vite',
  optimizeDeps: {
    // 被预构建的依赖产物统一存放在 cacheDir/deps/
    include: ['vue', 'vue-router']
  }
}
```

### 5. 多项目不要共用同一缓存目录

```javascript
// ❌ 错误：两个项目指向同一目录，预构建产物与元数据互相覆盖
// Project A: cacheDir: '/tmp/.vite'
// Project B: cacheDir: '/tmp/.vite'

// ✅ 正确：Monorepo 共享缓存的前提是依赖集合一致，否则各自独立
// Project A: cacheDir: '.vite-a'
// Project B: cacheDir: '.vite-b'
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | `cacheDir` 的相对路径基于项目根目录 |
| `optimizeDeps` | 预构建产物存放在 `cacheDir/deps/` |
| `optimizeDeps.force` | 设为 `true` 强制忽略缓存、重新预构建 |
| `--force` 命令行选项 | 效果同 `optimizeDeps.force`，无需改动配置 |

## 完整示例

### Monorepo 共享缓存

```text
workspace/
├── apps/
│   ├── web/
│   │   └── vite.config.js
│   └── admin/
│       └── vite.config.js
├── .vite-cache/        ← 共享缓存目录
└── package.json
```

```javascript
// apps/web/vite.config.js
import path from 'node:path'

export default {
  cacheDir: path.resolve(__dirname, '../../.vite-cache'),
  optimizeDeps: {
    // 共享缓存要求各应用依赖集合一致，显式声明避免差异
    include: ['vue', 'vue-router']
  }
}
```

### Docker 完整配置

```javascript
// vite.config.js
export default {
  cacheDir: '/app/.vite-cache',

  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      // 容器内文件事件可能无法传播，需要轮询监听
      usePolling: true
    }
  }
}
```

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
```

```yaml
# docker-compose.yml
services:
  vite-app:
    build: .
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - vite-cache:/app/.vite-cache
    environment:
      - CHOKIDAR_USEPOLLING=true

volumes:
  vite-cache:
```

### CI/CD 完整配置

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

**原因**：命中了旧缓存。

```bash
# 删除缓存后重启开发服务器
rm -rf node_modules/.vite
vite
```

### 问题 2：Docker 中文件监听不工作

**原因**：容器内的文件系统事件无法传播到 chokidar。

```javascript
// vite.config.js
export default {
  server: {
    watch: {
      usePolling: true // 轮询监听
    }
  }
}
```

### 问题 3：缓存体积过大

```bash
rm -rf node_modules/.vite
```

```json
{
  "scripts": {
    "clean:cache": "rm -rf node_modules/.vite"
  }
}
```

### 问题 4：依赖更新后仍加载旧代码

**原因**：缓存未按预期失效（常见于 link 本地包等改动不体现在 lock 文件中的场景）。

**解决**：

```javascript
// vite.config.js —— 临时开启强制预构建
export default {
  optimizeDeps: {
    force: true
  }
}
```

或直接执行 `vite --force`，排查完成后移除该配置。
