# define 配置

> 📖 [官方文档：Shared Options · define](https://cn.vitejs.dev/config/shared-options.html#define)

## 定义

`define` 用于定义全局常量替换：**开发期**这些条目会以全局变量的形式注入，**构建期**则被静态文本替换（官方原文："Entries will be defined as globals during dev and statically replaced during build"）。源代码中出现的标识符会被原样替换为对应的值表达式。

**类型**：`Record<string, any>`

**默认值**：未定义任何常量（等效 `{}`）

值的硬性要求：必须是**可 JSON 序列化**的值（字符串、数字、布尔、`null`，或由它们组成的数组/对象）；**字符串值必须用 `JSON.stringify()` 包裹**（或写成 `'"1.0.0"'` 的字面量形式），否则会被当作代码文本原样替换，产生非法代码。

## 可选值与使用方式

### 1. 基本用法

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),          // 字符串必须序列化
    __API_URL__: JSON.stringify('https://api.example.com'),
    __DEV__: true,                                     // 布尔值可直接写
    __PROD__: false
  }
})
```

### 2. 环境变量注入

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    // 按"具体键"注入，不要把整个 process.env 对象交给客户端
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString())
  }
})
```

> ⚠️ **注意：** 浏览器里不存在 `process` 对象，客户端代码请优先使用 `import.meta.env` 读环境变量；`define` 只适合注入构建期就能确定的常量。

## 重要说明

### 值必须可 JSON 序列化

```javascript
// ❌ 错误：直接给对象字面量，构建期无法作为表达式正确替换
define: {
  __CONFIG__: { apiUrl: 'https://api.example.com' }
}

// ✅ 正确：对象先 JSON.stringify，替换后就是合法的对象字面量
define: {
  __CONFIG__: JSON.stringify({ apiUrl: 'https://api.example.com' })
}

// ❌ 错误：字符串未加引号，替换后得到 const url = https://api.example.com，语法错误
define: {
  __API_URL__: 'https://api.example.com'
}

// ✅ 正确：字符串用 JSON.stringify 包裹
define: {
  __API_URL__: JSON.stringify('https://api.example.com')
}
```

### 等效写法

`JSON.stringify(...)` 与字面量写法完全等效，选一种风格统一使用即可：

```javascript
define: {
  __API_URL__: JSON.stringify('https://api.example.com'), // 方式一
  __API_URL2__: '"https://api.example.com"',              // 方式二：手动写成字符串字面量
  __COUNT__: 100,                                         // 数字可直接写
  __ENABLED__: true                                       // 布尔值可直接写
}
```

## 生效后的结果示例

### 基本替换

```javascript
// vite.config.js
export default {
  define: {
    __VERSION__: JSON.stringify('1.0.0'),
    __DEV__: true
  }
}
```

```javascript
// src/main.js —— 源代码
console.log(__VERSION__)
if (__DEV__) {
  console.log('Development mode')
}
```

```javascript
// 构建产物 —— 静态替换后
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
// src/main.js —— 源代码
const config = __CONFIG__
console.log(config.apiUrl)
```

```javascript
// 构建产物 —— 替换后是合法的对象字面量
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

### 2. 环境判断（条件编译）

```javascript
// vite.config.js
import { defineConfig } from 'vite'

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

```javascript
// src/utils/index.js
if (__DEV__) {
  console.log('Debug info:', someData) // 生产构建时整个分支会被当作死代码剔除
}

if (__PROD__) {
  enableAnalytics()
}
```

### 3. API 地址按 mode 切换

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
export default defineConfig({
  define: {
    __ENABLE_ANALYTICS__: process.env.ENABLE_ANALYTICS === 'true' // 直接给布尔值
  }
})
```

```javascript
// src/main.js
if (__ENABLE_ANALYTICS__) {
  initAnalytics()
}
```

### 5. 注入无前缀常量

需要暴露一个不带 `VITE_` 前缀的值时，官方推荐用 `define`（而不是把 `envPrefix` 清空）。注意只注入构建期确定的**公开**常量，敏感值绝不能进客户端：

```javascript
// vite.config.js
export default defineConfig({
  define: {
    __APP_NAME__: JSON.stringify('My App'),
    __SCHEMA_VERSION__: JSON.stringify('2.1.0')
  }
})
```

## 注意事项

### 1. 值的类型速查

```javascript
define: {
  __STR__: JSON.stringify('text'),            // ✅ 字符串
  __STR_LIT__: '"text"',                      // ✅ 字符串（字面量写法）
  __NUM__: 100,                               // ✅ 数字可直接写
  __BOOL__: true,                             // ✅ 布尔值可直接写
  __OBJ__: JSON.stringify({ key: 'value' }),  // ✅ 对象需序列化
  __ARR__: JSON.stringify([1, 2, 3])          // ✅ 数组需序列化
}
```

### 2. TypeScript 类型声明

`define` 的常量对 TS 来说是未知标识符，需在声明文件中补类型：

```typescript
// src/vite-env.d.ts
declare const __APP_VERSION__: string
declare const __DEV__: boolean
declare const __PROD__: boolean
declare const __API_URL__: string
declare const __CONFIG__: {
  apiUrl: string
  timeout: number
}
```

### 3. 与 import.meta.env 的区别

```javascript
// .env + envPrefix：变量方式，代码里通过 import.meta.env 读取
// .env
//   VITE_API_URL=https://api.example.com
console.log(import.meta.env.VITE_API_URL)

// define：直接替换方式，代码里写常量名
// vite.config.js
define: {
  __API_URL__: JSON.stringify('https://api.example.com')
}
console.log(__API_URL__)
```

优先用 `.env` 管理环境相关的值（可按 mode 切换、不进代码）；`define` 适合构建期才确定的常量（版本号、构建时间等）。

### 4. 构建时替换与死代码消除

`define` 是文本级替换：常量被替换成字面量后，打包工具可把永假分支整体剔除：

```javascript
// 源代码
if (__DEV__) {
  console.log('dev')
}

// 生产构建（__DEV__ 替换为 false）后：
if (false) {
  console.log('dev') // 这段死代码会被移除
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `envPrefix` | 控制哪些 `.env` 变量暴露给客户端；`define` 可注入无前缀常量 |
| `mode` | 常与 `mode` 配合做条件编译 |
| `replace` | Rollup 的 `replace` 插件与 `define` 功能类似，Vite 构建期内部就是用它实现替换 |

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
      __MODE__: JSON.stringify(mode),

      // 版本信息
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),

      // API 配置
      __API_URL__: JSON.stringify(
        mode === 'production'
          ? 'https://api.example.com'
          : mode === 'staging'
            ? 'https://staging-api.example.com'
            : 'http://localhost:3000'
      ),

      // 功能开关
      __ENABLE_ANALYTICS__: process.env.ENABLE_ANALYTICS === 'true'
    }
  }
})
```

```typescript
// src/vite-env.d.ts
declare const __DEV__: boolean
declare const __PROD__: boolean
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
  // 第三个参数传 '' 表示加载全部变量（默认只加载 VITE_ 前缀）
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      // 将 .env 变量注入为全局常量
      __API_URL__: JSON.stringify(env.VITE_API_URL || ''),
      __SERVER_URL__: JSON.stringify(env.SERVER_URL || '')
    }
  }
})
```

> ⚠️ **注意：** 不要把整个环境变量对象（如 `__ENV__: JSON.stringify(env)`）注入客户端——用 `''` 前缀加载的 `env` 里可能混有密钥，整包注入等于全部泄露。只挑需要的键逐个注入。

### 多环境配置

```javascript
// config/defines.js
export const developmentDefines = {
  __DEV__: true,
  __PROD__: false,
  __API_URL__: JSON.stringify('http://localhost:3000')
}

export const productionDefines = {
  __DEV__: false,
  __PROD__: true,
  __API_URL__: JSON.stringify('https://api.example.com')
}

export const stagingDefines = {
  __DEV__: false,
  __PROD__: false,
  __API_URL__: JSON.stringify('https://staging-api.example.com')
}
```

```javascript
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

### 问题 1：字符串没有变成带引号的值

字符串值没用 `JSON.stringify` 包裹。`__URL__: 'https://api.example.com'` 会被原样替换成裸文本，正确写法是 `__URL__: JSON.stringify('https://api.example.com')`。

### 问题 2：TypeScript 报"找不到名称"

缺少 `declare const` 类型声明，按「注意事项 2」在 `src/vite-env.d.ts` 补齐即可。

### 问题 3：替换后的代码语法错误

替换是纯文本替换，值本身必须是一段合法的 JS 表达式：

```javascript
// vite.config.js
define: {
  __API_URL__: 'https://api.example.com' // ❌ 缺少引号
}
```

```javascript
// 源代码
const url = __API_URL__

// 替换产物 —— 非法代码
const url = https://api.example.com
```
