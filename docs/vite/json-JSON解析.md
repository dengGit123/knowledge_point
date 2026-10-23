# json 配置

> 📖 [官方文档：Shared Options](https://cn.vitejs.dev/config/shared-options.html)

## 定义

`json` 配置 JSON 文件的导入行为：是否生成具名导出，以及是否以 `JSON.parse("...")` 的形式生成模块（大型 JSON 的性能优化）。

**类型**：

```typescript
{
  namedExports?: boolean
  stringify?: boolean | 'auto'
}
```

**默认值**：

```javascript
{
  namedExports: true,
  stringify: 'auto'   // Vite 6+ 默认；Vite 5 及之前为 false
}
```

## 子属性详解

### namedExports

**类型**：`boolean`

**默认值**：`true`

是否为 JSON 的顶层键生成具名导出。

```javascript
// data.json
{
  "name": "value",
  "items": [1, 2, 3]
}
```

```javascript
// namedExports: true（默认）：具名导入与默认导入都可用
import { name, items } from './data.json'
import data from './data.json'
```

```javascript
// namedExports: false：仅默认导入
import data from './data.json'

// ❌ 报错：该模块没有名为 name 的导出
import { name } from './data.json'
```

### stringify

**类型**：`boolean | 'auto'`

**默认值**：`'auto'`（Vite 6+；Vite 5 及之前仅支持 boolean，默认 `false`）

控制 JSON 模块的生成方式：

| 值 | 行为 |
|----|------|
| `'auto'`（默认） | 超过 10KiB 的 JSON 生成 `export default JSON.parse("...")`；小文件保持对象字面量，具名导出可用、利于 tree-shaking |
| `true` | 不论文件大小，都生成 `export default JSON.parse("...")` |
| `false` | 不启用 stringify（Vite 5 及之前的默认值） |

> 💡 **为什么更快：** JS 引擎解析一个巨大的对象字面量很慢，而 `JSON.parse` 解析字符串要快得多，因此大型 JSON 开启 stringify 能明显加快模块求值。

关键点：开启 stringify 后，导入拿到的**仍然是解析后的对象**——Vite 生成的是 `export default JSON.parse("...")`，`JSON.parse` 在模块内自动执行，不需要手动再 parse：

```javascript
// stringify 开启后
import data from './data.json'   // data 直接就是对象
console.log(data.name)

// 构建产物中的形态（示意）
// export default JSON.parse('{"name":"value",...}')
```

> ⚠️ **注意：** 被 stringify 的模块只有一个默认导出，具名导出不可用（`'auto'` 触发的大文件同样如此）。需要按键 tree-shaking 的小 JSON 应保持默认 `'auto'` 行为。

## 可选值与使用方式

### 默认行为（不配置）

```javascript
// vite.config.js — 不配置 json 时等价于以下内容
export default {
  json: {
    namedExports: true,   // 支持具名导出
    stringify: 'auto'     // 超过 10KiB 的大文件自动 stringify
  }
}
```

### 禁用具名导出

```javascript
export default {
  json: {
    namedExports: false   // 仅默认导入
  }
}
```

### 强制全部 stringify

```javascript
export default {
  json: {
    stringify: true       // 不论大小都转为 JSON.parse 形式
  }
}
```

### 以原始文本导入（替代方案）

需要原始 JSON 文本时，稳定版不支持 `stringify: 'source'` 一类的取值，用 `?raw` 后缀即可：

```javascript
import raw from './data.json?raw'   // raw 是原始 JSON 字符串
const data = JSON.parse(raw)
```

## 生效后的结果示例

### namedExports: true（默认）

```json
// src/data.json
{
  "name": "My App",
  "version": "1.0.0",
  "features": { "darkMode": true, "notifications": false }
}
```

```javascript
// src/main.js — 多种导入方式都可用

// 方式一：具名导入（便于 tree-shaking）
import { name, version, features } from './data.json'

// 方式二：默认导入
import data from './data.json'

// 方式三：混合导入
import data2, { version as v } from './data.json'
```

### namedExports: false

```javascript
// src/main.js — 仅默认导入
import data from './data.json'
console.log(data.name)

// ❌ 以下导入会报错
import { name } from './data.json'
```

### stringify: true

```javascript
// src/main.js
import data from './data.json'   // Vite 已用 JSON.parse 包裹，拿到的就是对象
console.log(data.name)
```

## 使用场景

### 1. i18n 词条：具名导入

```javascript
// vite.config.js
export default {
  json: {
    namedExports: true   // 保持默认即可
  }
}
```

```json
// src/i18n/zh.json
{
  "app": { "name": "我的应用", "slogan": "让开发更简单" }
}
```

```javascript
// src/i18n/index.js
import { app } from './zh.json'

export const zh = { appName: app.name, slogan: app.slogan }
```

### 2. 配置文件：仅默认导入

```javascript
// vite.config.js
export default {
  json: {
    namedExports: false   // 配置文件用默认导入
  }
}
```

```javascript
// src/config/index.js
import config from './config.json'
export default config
```

### 3. 大型数据集优化

```javascript
// vite.config.js
export default {
  json: {
    namedExports: false,   // 键很多的 JSON 没必要生成具名导出
    stringify: true        // 构建产物为 JSON.parse("...")，运行时求值更快
  }
}
```

```javascript
// src/main.js
import dataset from './data/large-dataset.json'   // 直接就是对象，无需手动 parse
processData(dataset.data)
```

### 4. 按环境差异化配置

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    json: {
      namedExports: mode === 'development',   // 开发保留具名导入的便利
      stringify: mode === 'production'        // 生产对大 JSON 优化
    }
  }
})
```

## 注意事项

### 1. 具名导出的命名限制

```javascript
// data.json
{
  "default": "value",   // ⚠️ 与默认导出冲突，无法具名导入
  "then": "value",      // ⚠️ 被 Vite/esbuild 特意排除：模块命名空间含 then 会变成 thenable，影响 await 模块的行为
  "my-key": "value"     // ❌ 不是合法的 JS 标识符，无法具名导入
}
```

```javascript
// ✅ 解决：默认导入后按需取值
import data from './data.json'
console.log(data.default, data['my-key'])
```

### 2. stringify 与 tree-shaking 的取舍

stringify 后整个 JSON 变成一次 `JSON.parse`，无法按键裁剪；保持对象字面量 + 具名导出的小文件才能被 tree-shaking。

### 3. TypeScript 类型

在 tsconfig.json 开启 `resolveJsonModule` 后，TS 会为具体的 `.json` 文件自动推断键的类型，通常无需手写声明。确实需要通配声明时：

```typescript
// src/vite-env.d.ts
declare module '*.json' {
  const value: Record<string, unknown>
  export default value
}
```

## 与其他属性的关系

`assetsInclude` 不需要也不应该包含 `.json`：JSON 由 `json` 配置专门处理。想拿 JSON 文件的 URL 或原文，用显式后缀即可：

```javascript
import url from './data.json?url'     // 文件 URL
import raw from './data.json?raw'     // 原始 JSON 文本
```

## 完整示例

### 国际化配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  json: {
    namedExports: true   // 支持具名导入
  }
})
```

```json
// src/i18n/zh.json
{
  "app": { "name": "我的应用", "slogan": "让开发更简单" }
}
```

```javascript
// src/i18n/index.js
import { app } from './zh.json'

export const zh = { appName: app.name, slogan: app.slogan }
```

### 大型数据优化

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  json: {
    namedExports: false,   // 禁用具名导出
    stringify: true        // 转为 JSON.parse 形式，大型 JSON 求值更快
  }
})
```

```javascript
// src/main.js
// 注意：导入值仍是对象（Vite 在模块内自动执行 JSON.parse），无需手动 parse
import dataset from './data/large-dataset.json'
processData(dataset.data)
```

## 常见问题

### 问题 1：具名导入报错

**原因**：键与 `default` 冲突、被特殊排除（`then`）或不是合法的 JS 标识符（如 `my-key`）。

```javascript
// ✅ 解决：默认导入后按需访问
import data from './data.json'
console.log(data.default, data['my-key'])
```

### 问题 2：大型 JSON 构建慢

**原因**：为大量键生成具名导出与对象字面量的开销较大。

```javascript
// ✅ 解决
export default {
  json: {
    namedExports: false,
    stringify: true   // 或保持默认 'auto'，超过 10KiB 自动启用
  }
}
```

### 问题 3：stringify 后拿到的不是预期值

**原因**：误以为"导入的是字符串、需要手动 JSON.parse"。实际上 Vite 生成 `export default JSON.parse("...")`，导入值就是对象。

```javascript
// ✅ 若确实需要原始 JSON 文本，用 ?raw 后缀
import rawJson from './data.json?raw'
```
