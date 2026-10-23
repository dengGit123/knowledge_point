# envPrefix 配置

> 📖 [官方文档：Shared Options · envPrefix](https://cn.vitejs.dev/config/shared-options.html#envprefix)

## 定义

`envPrefix` 指定暴露给客户端的环境变量前缀：只有以该前缀开头的变量，才会通过 `import.meta.env` 暴露给客户端代码。

**类型**：`string | string[]`

**默认值**：`'VITE_'`

## 可选值与使用方式

### 1. 单个前缀

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  envPrefix: 'VITE_' // 默认值，可省略
})

// 自定义前缀
export default defineConfig({
  envPrefix: 'APP_'
})
```

### 2. 多个前缀

数组形式可同时启用多个前缀：

```javascript
// vite.config.js
export default defineConfig({
  envPrefix: ['VITE_', 'PUBLIC_', 'CLIENT_']
})
```

### 3. 空字符串（禁止）

```javascript
// vite.config.js
export default defineConfig({
  envPrefix: '' // ❌ 危险！
})
```

> ⚠️ **注意：** 官方文档明确警告不要把 `envPrefix` 设为空字符串——它会暴露**所有**环境变量，把数据库密码、私钥等敏感信息一起打进客户端产物，Vite 检测到空字符串时会直接报错拦截。如果确实需要暴露一个无前缀变量，官方推荐改用 `define` 配置项注入全局常量（构建期静态文本替换，与 `envPrefix` 的前缀机制无关）：

```javascript
// vite.config.js
export default defineConfig({
  define: {
    APP_VERSION: JSON.stringify('1.0.0')
  }
})
```

## 生效后的结果示例

### 默认配置（`VITE_`）

```bash
# .env
VITE_API_URL=https://api.example.com     # ✅ 以 VITE_ 开头，可访问
VITE_APP_TITLE=My App                    # ✅ 可访问
DATABASE_URL=postgresql://...            # ❌ 无前缀，不可访问
SECRET_KEY=abc123                        # ❌ 不可访问
```

```javascript
// src/main.js
console.log(import.meta.env.VITE_API_URL) // → "https://api.example.com"
console.log(import.meta.env.SECRET_KEY)   // → undefined
```

### 自定义前缀

```javascript
// vite.config.js
export default defineConfig({
  envPrefix: 'APP_'
})
```

```bash
# .env
APP_API_URL=https://api.example.com      # ✅ 前缀匹配，可访问
APP_VERSION=1.0.0                        # ✅ 可访问
VITE_API_URL=https://api.example.com     # ❌ 前缀不再是 VITE_，不可访问
```

### 多前缀

```javascript
// vite.config.js
export default defineConfig({
  envPrefix: ['VITE_', 'PUBLIC_']
})
```

```bash
# .env
VITE_API_URL=https://api.example.com     # ✅ 可访问
PUBLIC_CDN_URL=https://cdn.example.com   # ✅ 可访问
APP_API_URL=https://api.example.com      # ❌ 前缀不在列表中，不可访问
```

## 使用场景

### 1. 从 vue-cli 迁移

vue-cli 约定使用 `VUE_APP_` 前缀，迁移到 Vite 时保留它可以让存量代码零改动：

```javascript
// vite.config.js
export default defineConfig({
  envPrefix: ['VITE_', 'VUE_APP_'] // 兼容旧的 VUE_APP_ 变量
})
```

```bash
# .env
VUE_APP_API_URL=https://api.example.com  # 旧代码中的 import.meta.env 写法继续可用
```

### 2. 多项目共用一套变量

共享配置用统一前缀，各项目自己的变量仍用 `VITE_`：

```javascript
// vite.config.js
export default defineConfig({
  envPrefix: ['VITE_', 'SHARED_']
})
```

```bash
# .env
VITE_API_URL=https://api.example.com
SHARED_CONFIG_URL=https://config.example.com
```

### 3. 明确区分客户端与私有变量

用一个语义化前缀标记"允许进客户端"的变量，其余一律不暴露：

```javascript
// vite.config.js
export default defineConfig({
  envPrefix: 'CLIENT_'
})
```

```bash
# .env
CLIENT_API_URL=https://api.example.com   # 客户端可访问
DATABASE_URL=postgresql://...            # 仅服务端可访问
SECRET_KEY=abc123                        # 仅服务端可访问
```

## 安全原则

所有被暴露的变量都会**原样打进客户端产物**，任何访问者都能在浏览器里看到，因此只暴露公开信息：

```bash
# ❌ 错误：敏感信息一旦带上暴露前缀就会泄露
VITE_SECRET_KEY=abc123
VITE_DATABASE_PASSWORD=secret
VITE_ADMIN_PASSWORD=123456

# ✅ 正确：带前缀的只有公开变量
VITE_API_URL=https://api.example.com
VITE_APP_NAME=My App
```

> ⚠️ **注意：** 第三方公开密钥（如地图 Key、Stripe 可发布密钥 `pk_` 开头）可以暴露；私密密钥（`sk_` 开头）、密码、Token 绝不能加前缀。

## 注意事项

### 1. 大小写敏感

前缀匹配区分大小写，`.env` 中的键必须与 `envPrefix` 完全一致：

```bash
# envPrefix: 'VITE_' 时
VITE_API_URL=...    # ✅ 可访问
vite_api_url=...    # ❌ 大小写不匹配
Vite_Api_Url=...    # ❌ 大小写不匹配
```

### 2. TypeScript 类型声明

自定义前缀后，同步更新类型声明才能获得完整提示：

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_API_URL: string
  readonly APP_VERSION: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `envDir` | 决定从哪个目录加载 `.env` 文件 |
| `mode` | 决定加载哪些 `.env.[mode]` 文件 |
| `define` | 可注入无前缀的全局常量（官方推荐的无前缀暴露方式） |

## 完整示例

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // 用 PUBLIC_ 明确标记"允许进客户端"的变量
  envPrefix: 'PUBLIC_'
})
```

```bash
# .env
# 公开变量（客户端可访问）
PUBLIC_API_URL=https://api.example.com
PUBLIC_APP_NAME=My App
PUBLIC_VERSION=1.0.0

# 私有变量（仅服务端可访问，不带前缀）
DATABASE_URL=postgresql://...
SECRET_KEY=abc123
```

```javascript
// src/config/api.js
const config = {
  apiUrl: import.meta.env.PUBLIC_API_URL,
  appName: import.meta.env.PUBLIC_APP_NAME,
  version: import.meta.env.PUBLIC_VERSION
}

export default config
```

## 内置环境变量

无论 `envPrefix` 设置为何值，以下内置变量始终可用：

```javascript
import.meta.env.MODE     // 运行模式
import.meta.env.BASE_URL // 部署基础路径
import.meta.env.PROD     // 是否生产环境
import.meta.env.DEV      // 是否开发环境
import.meta.env.SSR      // 是否 SSR 环境
```

## 常见问题

### 问题 1：客户端读不到变量

前缀不匹配导致的，两种解法任选其一：

```bash
# .env 中写的是
APP_API_URL=https://api.example.com
```

```javascript
// 方案一：改配置，匹配现有前缀
export default defineConfig({ envPrefix: 'APP_' })

// 方案二：改变量名，匹配默认前缀 VITE_
// .env → VITE_API_URL=https://api.example.com
```

### 问题 2：TypeScript 提示属性不存在

缺少 `ImportMetaEnv` 类型声明，按「注意事项 2」在 `src/vite-env.d.ts` 中补齐即可。

### 问题 3：敏感信息泄露

检查带暴露前缀的变量里是否混入了密钥、密码；把敏感变量改成无前缀（或改用服务端读取），只保留公开变量带前缀。
