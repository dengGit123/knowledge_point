# envPrefix 配置

## 定义

`envPrefix` 指定暴露给客户端的环境变量前缀，只有以该前缀开头的环境变量才能通过 `import.meta.env` 访问。

**类型**：`string | string[]`

**默认值**：`'VITE_'`

## 可选值与使用方式

### 1. 单个前缀

```javascript
// 默认值
export default {
  envPrefix: 'VITE_'
}

// 自定义前缀
export default {
  envPrefix: 'APP_'
}

// 使用 public 前缀
export default {
  envPrefix: 'PUBLIC_'
}
```

### 2. 多个前缀

```javascript
// 数组形式 - 支持多个前缀
export default {
  envPrefix: ['VITE_', 'APP_']
}

// 更多前缀
export default {
  envPrefix: ['VITE_', 'PUBLIC_', 'CLIENT_']
}
```

### 3. 空字符串（不推荐）

```javascript
// 暴露所有环境变量（安全隐患）
export default {
  envPrefix: ''
}
```

## 生效后的结果示例

### 默认配置

```javascript
// vite.config.js
export default {
  envPrefix: 'VITE_'  // 默认值
}
```

```bash
# .env
VITE_API_URL=https://api.example.com     ✅ 可访问
VITE_APP_TITLE=My App                    ✅ 可访问
DATABASE_URL=postgresql://...            ❌ 不可访问
SECRET_KEY=abc123                        ❌ 不可访问
```

### 自定义前缀

```javascript
// vite.config.js
export default {
  envPrefix: 'APP_'
}
```

```bash
# .env
APP_API_URL=https://api.example.com     ✅ 可访问
APP_VERSION=1.0.0                        ✅ 可访问
VITE_API_URL=https://api.example.com    ❌ 不可访问（前缀不匹配）
```

### 多前缀配置

```javascript
// vite.config.js
export default {
  envPrefix: ['VITE_', 'PUBLIC_']
}
```

```bash
# .env
VITE_API_URL=https://api.example.com     ✅ 可访问
PUBLIC_API_URL=https://api.example.com    ✅ 可访问
APP_API_URL=https://api.example.com      ❌ 不可访问
```

### 运行时访问

```javascript
// 在代码中访问
console.log(import.meta.env.VITE_API_URL)
console.log(import.meta.env.VITE_APP_TITLE)

// TypeScript 类型需要声明
```

## 使用场景

### 1. 自定义前缀

```javascript
// vite.config.js
export default {
  envPrefix: 'MYAPP_'
}
```

```bash
# .env
MYAPP_API_URL=https://api.example.com
MYAPP_VERSION=1.0.0
```

### 2. 多项目共用的环境变量

```javascript
// vite.config.js
export default {
  envPrefix: ['VITE_', 'SHARED_']
}
```

```bash
# .env
VITE_API_URL=https://api.example.com
SHARED_CONFIG_URL=https://config.example.com
```

### 3. 明确区分客户端和服务端变量

```javascript
// vite.config.js
export default {
  envPrefix: 'CLIENT_'
}
```

```bash
# .env
CLIENT_API_URL=https://api.example.com     # 客户端可访问
SERVER_DATABASE_URL=postgresql://...       # 仅服务端
SERVER_SECRET_KEY=abc123                   # 仅服务端
```

## 安全原则

### 1. 仅暴露必要变量

```bash
# ❌ 错误：暴露敏感信息
VITE_SECRET_KEY=abc123
VITE_DATABASE_PASSWORD=secret

# ✅ 正确：仅暴露公开信息
VITE_API_URL=https://api.example.com
VITE_APP_NAME=My App
```

### 2. 前缀规范

```javascript
// 推荐前缀
'VITE_'      // Vite 默认
'APP_'       // 应用相关
'PUBLIC_'    // 公开信息
'CLIENT_'    // 客户端相关
'GATSBY_'    // Gatsby 迁移（兼容）
```

## 注意事项

### 1. 客户端可访问

```javascript
// 所有暴露的环境变量都会打包到客户端代码中
// 不要存储敏感信息

// .env.production
VITE_STRIPE_KEY=pk_xxx        ✅ 公开密钥可以
VITE_STRIPE_SECRET=sk_xxx     ❌ 私密密钥不行
VITE_ADMIN_PASSWORD=123456    ❌ 密码不行
```

### 2. 空字符串的风险

```javascript
// envPrefix: '' 会暴露所有环境变量
export default {
  envPrefix: ''  // 危险！包括 NODE_ENV 等所有变量
}
```

### 3. TypeScript 类型声明

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 自定义前缀的类型声明
  readonly APP_API_URL: string
  readonly APP_VERSION: string

  // 默认 VITE_ 前缀
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 4. 大小写敏感

```javascript
// vite.config.js
export default {
  envPrefix: 'VITE_'  // 大写
}
```

```bash
# .env
VITE_API_URL=...    ✅ 可访问
vite_api_url=...     ❌ 不可访问（大小写不匹配）
Vite_Api_Url=...     ❌ 不可访问（大小写不匹配）
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `envDir` | 环境变量文件所在目录 |
| `mode` | 决定加载哪个 `.env.[mode]` 文件 |
| `define` | `define` 可以手动注入非前缀变量 |

## 完整示例

### 自定义前缀配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  envPrefix: 'APP_'
})
```

```bash
# .env
APP_API_URL=https://api.example.com
APP_VERSION=1.0.0
APP_DEBUG=true

# .env.production
APP_API_URL=https://production-api.example.com
APP_DEBUG=false
```

```javascript
// src/main.js
const apiUrl = import.meta.env.APP_API_URL
const version = import.meta.env.APP_VERSION
const isDebug = import.meta.env.APP_DEBUG === 'true'
```

### 多前缀配置

```javascript
// vite.config.js
export default {
  envPrefix: ['VITE_', 'PUBLIC_', 'CLIENT_']
}
```

```bash
# .env
VITE_APP_TITLE=My App
PUBLIC_CDN_URL=https://cdn.example.com
CLIENT_THEME=dark
```

### 迁移其他项目

从其他构建工具迁移时保持兼容：

```javascript
// vite.config.js
export default {
  envPrefix: ['VITE_', 'GATSBY_']  // 兼容 Gatsby 变量
}
```

```bash
# .env
VITE_API_URL=...
GATSBY_API_URL=...  # 兼容旧代码
```

### 完整的安全配置

```javascript
// vite.config.js
export default defineConfig({
  envPrefix: 'PUBLIC_',  // 明确使用 PUBLIC_ 前缀
})
```

```bash
# .env - 环境变量文件
# 公开变量（客户端可访问）
PUBLIC_API_URL=https://api.example.com
PUBLIC_APP_NAME=My App
PUBLIC_VERSION=1.0.0

# 私有变量（仅服务端可访问）
DATABASE_URL=postgresql://...
SECRET_KEY=abc123
ADMIN_PASSWORD=secret123
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
import.meta.env.BASE_URL    // 基础路径
import.meta.env.MODE        // 运行模式
import.meta.env.PROD        // 是否生产环境
import.meta.env.DEV         // 是否开发环境
import.meta.env.SSR         // 是否 SSR 构建
```

## 常见问题

### 问题 1：客户端无法访问环境变量

**原因**：前缀不匹配

```bash
# .env
APP_API_URL=https://api.example.com

# vite.config.js
envPrefix: 'VITE_'  # ❌ 前缀不匹配
```

**解决**：统一前缀

```bash
# 方案一：修改 .env
VITE_API_URL=https://api.example.com

# 方案二：修改配置
envPrefix: 'APP_'
```

### 问题 2：TypeScript 报错

**原因**：缺少类型声明

**解决**：

```typescript
// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly APP_API_URL: string
  readonly APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 问题 3：敏感信息泄露

**原因**：将敏感变量设置为可访问前缀

**解决**：使用不同前缀区分

```bash
# 客户端变量
PUBLIC_API_URL=https://api.example.com

# 服务端变量（不使用 PUBLIC_ 前缀）
DATABASE_URL=postgresql://...
SECRET_KEY=abc123
```

## 官方文档

[Shared Config: envPrefix - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#envprefix)

[Env Variables - Vite 官方文档](https://cn.vitejs.dev/guide/env-and-mode.html)
