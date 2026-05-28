# json 配置

## 定义

`json` 配置 JSON 文件的解析行为，控制 JSON 文件的导入方式和优化。

**类型**：

```typescript
{
  namedExports?: boolean
  stringify?: boolean
}
```

**默认值**：

```javascript
{
  namedExports: true,
  stringify: false
}
```

## 子属性详解

### namedExports

**类型**：`boolean`

**默认值**：`true`

控制是否支持具名导出。

```javascript
// namedExports: true（默认）
// data.json
{
  "name": "value",
  "items": [1, 2, 3]
}

// 可以具名导入
import { name, items } from './data.json'

// 也可以默认导入
import data from './data.json'
```

```javascript
// namedExports: false
// 仅支持默认导入
import data from './data.json'

// ❌ 不支持具名导入
import { name } from './data.json'
```

### stringify

**类型**：`boolean`

**默认值**：`false`

是否将 JSON 转换为 `export default JSON.stringify(...)` 形式。

```javascript
// stringify: true
// data.json → 转换为字符串

import data from './data.json'
const parsed = JSON.parse(data)

// stringify: false（默认）
// data.json → 直接作为对象

import data from './data.json'
// data 是对象
```

## 可选值与使用方式

### 默认配置

```javascript
// vite.config.js
export default {
  json: {
    namedExports: true,   // 支持具名导出
    stringify: false       // 不序列化
  }
}
```

### 禁用具名导出

```javascript
// vite.config.js
export default {
  json: {
    namedExports: false  // 仅默认导出
  }
}
```

### 序列化模式

```javascript
// vite.config.js
export default {
  json: {
    stringify: true  // 转换为字符串
  }
}
```

### 完全禁用处理

```javascript
// vite.config.js
export default {
  json: {
    namedExports: false,
    stringify: false
  }
}
```

## 生效后的结果示例

### namedExports: true（默认）

```javascript
// vite.config.js
export default {
  json: {
    namedExports: true
  }
}
```

```json
// src/data.json
{
  "name": "My App",
  "version": "1.0.0",
  "features": {
    "darkMode": true,
    "notifications": false
  }
}
```

```javascript
// src/main.js - 支持多种导入方式

// 方式一：具名导入
import { name, version, features } from './data.json'
console.log(name, version, features)

// 方式二：默认导入
import data from './data.json'
console.log(data.name, data.version)

// 方式三：混合
import data, { version } from './data.json'
```

### namedExports: false

```javascript
// vite.config.js
export default {
  json: {
    namedExports: false
  }
}
```

```javascript
// src/main.js - 仅支持默认导入
import data from './data.json'
console.log(data.name)

// ❌ 以下导入会报错
import { name } from './data.json'
```

### stringify: true

```javascript
// vite.config.js
export default {
  json: {
    stringify: true
  }
}
```

```javascript
// src/main.js - JSON 被转为字符串
import dataJson from './data.json'
const data = JSON.parse(dataJson)
console.log(data.name)
```

## 使用场景

### 1. 具名导入（默认）

```javascript
// vite.config.js
export default {
  json: {
    namedExports: true
  }
}
```

```javascript
// src/i18n/en.json
{
  "welcome": "Welcome",
  "goodbye": "Goodbye"
}

// src/i18n/index.js
import { welcome, goodbye } from './en.json'
export { welcome, goodbye }
```

### 2. 仅默认导入

```javascript
// vite.config.js
export default {
  json: {
    namedExports: false
  }
}
```

```javascript
// src/config/index.js
import config from './config.json'
export default config
```

### 3. 大型 JSON 优化

```javascript
// vite.config.js
export default {
  json: {
    namedExports: false,  // 大型 JSON 禁用具名导出
    stringify: true        // 序列化减少体积
  }
}
```

### 4. 动态配置

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    json: {
      namedExports: mode === 'development',
      stringify: mode === 'production'
    }
  }
})
```

## 注意事项

### 1. 具名导出限制

```javascript
// 具名导出有命名限制
// data.json
{
  "default": "value",    // ⚠️ 可能冲突
  "then": "value",       // ⚠️ 保留字
  "my-key": "value"      // ❌ 不能用 - 符号
}

// 解决：使用默认导入
import data from './data.json'
console.log(data['my-key'])
```

### 2. stringify 的运行时解析

```javascript
// stringify: true 时需要手动解析
import dataJson from './data.json'
const data = JSON.parse(dataJson)
```

### 3. TypeScript 类型

```typescript
// src/data.json
{
  "name": "My App",
  "version": "1.0.0"
}

// src/vite-env.d.ts
declare module './data.json' {
  export const name: string
  export const version: string
}

// 或使用默认导入类型
declare module '*.json' {
  const value: Record<string, any>
  export default value
}
```

### 4. 与 build.target 的关系

某些旧浏览器可能不支持 JSON 解析，需注意目标环境。

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `assetsInclude` | JSON 文件不在 `assetsInclude` 范围内，有专门处理 |

## 完整示例

### 国际化配置

```javascript
// vite.config.js
export default {
  json: {
    namedExports: true  // 支持具名导入
  }
}
```

```json
// src/i18n/zh.json
{
  "app": {
    "name": "我的应用",
    "slogan": "让开发更简单"
  }
}
```

```javascript
// src/i18n/index.js
import { app } from './zh.json'

export const zh = {
  appName: app.name,
  slogan: app.slogan
}
```

### 配置文件管理

```javascript
// vite.config.js
export default {
  json: {
    namedExports: false  // 配置文件用默认导入
  }
}
```

```javascript
// src/config/index.js
import config from './config.json'
export default config
```

### 大型数据优化

```javascript
// vite.config.js
export default {
  json: {
    namedExports: false,  // 禁用具名导出
    stringify: false      // 保持对象形式
  }
}
```

```javascript
// src/data/large-dataset.json
{
  "data": [/* 大量数据 */]
}

// src/main.js
import dataset from './data/large-dataset.json'
processData(dataset.data)
```

### 类型安全配置

```typescript
// vite.config.ts
export default {
  json: {
    namedExports: true
  }
}
```

```typescript
// src/types/config.ts
export interface AppConfig {
  name: string
  version: string
  features: {
    darkMode: boolean
    notifications: boolean
  }
}

// src/config.json
{
  "name": "My App",
  "version": "1.0.0",
  "features": {
    "darkMode": true,
    "notifications": false
  }
}

// src/vite-env.d.ts
declare module './config.json' {
  export const name: string
  export const version: string
  export const features: AppConfig['features']
  export default {
    name: string
    version: string
    features: AppConfig['features']
  }
}
```

## 常见问题

### 问题 1：具名导入报错

**原因**：JSON 中使用了 JavaScript 保留字或特殊字符

```json
// data.json
{
  "default": "value",
  "my-key": "value"
}
```

**解决**：使用默认导入

```javascript
import data from './data.json'
console.log(data.default, data['my-key'])
```

### 问题 2：大型 JSON 构建慢

**原因**：具名导出需要额外处理

**解决**：禁用具名导出

```javascript
export default {
  json: {
    namedExports: false
  }
}
```

### 问题 3：TypeScript 类型错误

**原因**：缺少模块声明

**解决**：添加类型声明

```typescript
// vite-env.d.ts
declare module '*.json' {
  const value: Record<string, any>
  export default value
  // 或具名导出
  export const [key: string]: any
}
```

## 官方文档

[Shared Config: json - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#json)
