# define 配置

## 定义

`define` 用于定义全局常量替换，在构建时进行字符串查找替换，将定义的标识符替换为对应的值。

**类型**：`Record<string, string | number | boolean | undefined>`

**默认值**：`{}`

## 可选值与使用方式

### 1. 基本用法

```javascript
export default {
  define: {
    __APP_VERSION__: '"1.0.0"',     // 注意：值需要是字符串形式
    __DEV__: true,
    __PROD__: false,
    __API_URL__: '"https://api.example.com"'
  }
}
```

### 2. 环境变量注入

```javascript
export default {
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '')
  }
}
```

### 3. 条件编译

```javascript
export default defineConfig(({ mode }) => {
  return {
    define: {
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
      __MODE__: JSON.stringify(mode)
    }
  }
})
```

## 重要说明

### 值必须是表达式

```javascript
// ❌ 错误：直接使用对象
define: {
  __CONFIG__: { apiUrl: 'https://api.example.com' }
}

// ✅ 正确：使用 JSON.stringify
define: {
  __CONFIG__: JSON.stringify({ apiUrl: 'https://api.example.com' })
}

// ❌ 错误：未用引号包裹字符串
define: {
  __API_URL__: 'https://api.example.com'
}

// ✅ 正确：字符串需要 JSON.stringify 或引号
define: {
  __API_URL__: JSON.stringify('https://api.example.com')
}
```

### 类型安全

```javascript
// define 的值在代码中直接替换
// 以下两种方式等效：

// 方式一：JSON.stringify
define: {
  __API_URL__: JSON.stringify('https://api.example.com')
}

// 方式二：字符串形式
define: {
  __API_URL__: '"https://api.example.com"'
}

// 方式三：数字和布尔值直接使用
define: {
  __COUNT__: 100,
  __ENABLED__: true
}
```

## 生效后的结果示例

### 基本替换

```javascript
// vite.config.js
export default {
  define: {
    __VERSION__: '"1.0.0"',
    __DEV__: true
  }
}
```

```javascript
// src/main.js - 源代码
console.log(__VERSION__)
if (__DEV__) {
  console.log('Development mode')
}
```

```javascript
// 构建后的代码
console.log("1.0.0")
if (true) {
  console.log('Development mode')
}
```

### 对象替换

```javascript
// vite.config.js
export default {
  define: {
    __CONFIG__: JSON.stringify({
      apiUrl: 'https://api.example.com',
      timeout: 5000
    })
  }
}
```

```javascript
// src/main.js - 源代码
const config = __CONFIG__
console.log(config.apiUrl)
```

```javascript
// 构建后的代码
const config = { apiUrl: 'https://api.example.com', timeout: 5000 }
console.log(config.apiUrl)
```

## 使用场景

### 1. 版本号注入

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})
```

### 2. 环境判断

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    define: {
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
      __TEST__: mode === 'test'
    }
  }
})
```

```javascript
// src/utils/index.js
if (__DEV__) {
  console.log('Debug info:', someData)
}

if (__PROD__) {
  // 生产环境代码
  enableAnalytics()
}
```

### 3. API 地址配置

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  const apiUrl = mode === 'production'
    ? 'https://api.example.com'
    : mode === 'staging'
      ? 'https://staging-api.example.com'
      : 'http://localhost:3000'

  return {
    define: {
      __API_URL__: JSON.stringify(apiUrl)
    }
  }
})
```

### 4. 功能开关

```javascript
// vite.config.js
export default {
  define: {
    __ENABLE_ANALYTICS__: JSON.stringify(process.env.ENABLE_ANALYTICS === 'true'),
    __ENABLE_NEW_FEATURE__: JSON.stringify(process.env.FEATURE_FLAG === 'true')
  }
}
```

```javascript
// src/main.js
if (__ENABLE_ANALYTICS__) {
  initAnalytics()
}
```

### 5. 环境变量替代

对于不以 `VITE_` 开头的环境变量，可以通过 `define` 注入：

```javascript
// vite.config.js
export default {
  define: {
    // 将服务端环境变量注入客户端
    __SECRET_ENDPOINT__: JSON.stringify(process.env.SECRET_ENDPOINT || ''),
    '__process.env.NODE_ENV__': JSON.stringify(process.env.NODE_ENV || 'development')
  }
}
```

## 注意事项

### 1. 值的类型

```javascript
// 字符串必须用 JSON.stringify 或引号
define: {
  __STRING__: JSON.stringify('text'),     // ✅
  __STRING__: '"text"',                    // ✅
  __STRING__: 'text',                      // ❌ 会替换为变量名 text

  // 数字和布尔值直接使用
  __NUMBER__: 100,                         // ✅
  __BOOL__: true,                          // ✅

  // 对象和数组需要 JSON.stringify
  __OBJECT__: JSON.stringify({ key: 'value' }),  // ✅
  __ARRAY__: JSON.stringify([1, 2, 3])           // ✅
}
```

### 2. TypeScript 类型声明

```typescript
// src/vite-env.d.ts
declare const __VERSION__: string
declare const __DEV__: boolean
declare const __PROD__: boolean
declare const __API_URL__: string
declare const __CONFIG__: {
  apiUrl: string
  timeout: number
}
```

### 3. 与 envPrefix 的区别

```javascript
// envPrefix: 环境变量方式
// .env
VITE_API_URL=https://api.example.com
// 代码中
console.log(import.meta.env.VITE_API_URL)

// define: 直接替换方式
// vite.config.js
define: {
  __API_URL__: '"https://api.example.com"'
}
// 代码中
console.log(__API_URL__)
```

### 4. 构建时替换

```javascript
// define 是构建时替换，不是运行时
// 以下代码：

if (__DEV__) {
  console.log('dev')
}

// 生产构建后变成：
if (false) {
  console.log('dev')
}
// 打包工具可能会移除这段死代码
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `envPrefix` | `envPrefix` 控制环境变量暴露，`define` 可以手动注入非前缀变量 |
| `mode` | 常与 `mode` 配合做条件编译 |
| `replace` | Rollup 的 `replace` 选项与 `define` 功能类似 |

## 完整示例

### 条件编译配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    define: {
      // 环境判断
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
      __TEST__: mode === 'test',
      __MODE__: JSON.stringify(mode),

      // 版本信息
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),

      // API 配置
      __API_URL__: JSON.stringify(
        mode === 'production' ? 'https://api.example.com' :
        mode === 'staging' ? 'https://staging-api.example.com' :
        'http://localhost:3000'
      ),

      // 功能开关
      __ENABLE_ANALYTICS__: JSON.stringify(
        process.env.ENABLE_ANALYTICS === 'true'
      )
    }
  }
})
```

```typescript
// src/vite-env.d.ts
declare const __DEV__: boolean
declare const __PROD__: boolean
declare const __TEST__: boolean
declare const __MODE__: string
declare const __APP_VERSION__: string
declare const __BUILD_DATE__: string
declare const __API_URL__: string
declare const __ENABLE_ANALYTICS__: boolean
```

### 环境变量注入

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    define: {
      // 将环境变量注入为全局常量
      __API_URL__: JSON.stringify(env.VITE_API_URL || ''),
      __APP_TITLE__: JSON.stringify(env.VITE_APP_TITLE || ''),

      // 注入非 VITE_ 前缀的环境变量
      __SERVER_URL__: JSON.stringify(env.SERVER_URL || ''),

      // 注入整个环境变量对象（不推荐，仅用于调试）
      __ENV__: JSON.stringify(env)
    }
  }
})
```

### 多环境配置

```javascript
// config/defines.js
export const developmentDefines = {
  __DEV__: true,
  __PROD__: false,
  __API_URL__: '"http://localhost:3000"'
}

export const productionDefines = {
  __DEV__: false,
  __PROD__: true,
  __API_URL__: '"https://api.example.com"'
}

export const stagingDefines = {
  __DEV__: false,
  __PROD__: false,
  __API_URL__: '"https://staging-api.example.com"'
}

// vite.config.js
import { defineConfig } from 'vite'
import { developmentDefines, productionDefines, stagingDefines } from './config/defines'

const definesByMode = {
  development: developmentDefines,
  production: productionDefines,
  staging: stagingDefines
}

export default defineConfig(({ mode }) => {
  return {
    define: definesByMode[mode] || developmentDefines
  }
})
```

## 常见问题

### 问题 1：字符串未正确替换

**原因**：字符串值未用 JSON.stringify

```javascript
// ❌ 错误
define: {
  __URL__: 'https://api.example.com'
}

// ✅ 正确
define: {
  __URL__: JSON.stringify('https://api.example.com')
}
```

### 问题 2：TypeScript 报错

**原因**：缺少类型声明

**解决**：

```typescript
// vite-env.d.ts
declare const __API_URL__: string
declare const __DEV__: boolean
```

### 问题 3：替换后的代码不符合预期

**原因**：替换是直接文本替换

```javascript
// vite.config.js
define: {
  __API_URL__: 'https://api.example.com'  // ❌ 缺少引号
}

// 源代码
const url = __API_URL__

// 替换后
const url = https://api.example.com  // ❌ 语法错误
```

## 官方文档

[Shared Config: define - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#define)
