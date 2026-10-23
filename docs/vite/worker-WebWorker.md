# worker 配置

> 📖 [官方文档：Worker Options](https://cn.vitejs.dev/config/worker-options.html)
>
> 📖 [官方文档：Web Workers](https://cn.vitejs.dev/guide/features.html#web-workers)

## 定义

`worker` 配置 Web Worker 的打包行为，控制 Worker 脚本的构建方式和输出格式。通常配合 `?worker` 导入后缀使用（见「注意事项」）。

**类型**：

```typescript
{
  format?: 'es' | 'iife'
  plugins?: () => (Plugin | PluginOption)[]
  rollupOptions?: RollupOptions
}
```

**默认值**：

```javascript
{
  format: 'iife',     // 经典脚本（IIFE）格式
  plugins: () => [],  // 无 Worker 专用插件
  rollupOptions: {}   // 使用 Vite 内部默认值
}
```

## 子属性详解

### format

**类型**：`'es' | 'iife'`

**默认值**：`'iife'`

Worker 产物的打包格式。

```javascript
// vite.config.js
export default {
  worker: {
    format: 'iife' // 默认：经典脚本，无模块语义
  }
}
```

```javascript
// vite.config.js
export default {
  worker: {
    format: 'es' // 模块 Worker：支持 import/export 与内部动态导入
  }
}
```

> 💡 **提示：** `iife` 产物以经典脚本运行，内部不能使用 `import`/`export`；`es` 产物依赖浏览器的模块 Worker 支持（如 Firefox 114+ 才支持）。需要 Worker 内部动态加载代码或拆分共享 chunk 时选择 `'es'`。

### plugins

**类型**：`() => (Plugin | PluginOption)[]`

**默认值**：`() => []`

Worker 专用的 Vite 插件。注意是**函数形式**：Worker 打包是一条独立的构建流程，每次构建都会调用该函数以获取全新的插件实例，避免与主包构建共用同一实例造成状态污染。

```javascript
// vite.config.js
export default {
  worker: {
    // 每次调用返回全新实例
    plugins: () => [myWorkerPlugin()]
  }
}
```

> ⚠️ **注意：** 顶层 `plugins` 只在**开发阶段**作用于 Worker 代码；**生产构建**时 Worker 产物只使用 `worker.plugins`。需要影响 Worker 构建产物的插件必须在这里配置。

### rollupOptions

**类型**：`RollupOptions`

**默认值**：`{}`

Worker 打包的 Rollup 选项。Worker 产物的输出格式由 `worker.format` 决定，插件走 `worker.plugins`，不要在这里覆盖这些由 Vite 控制的选项。

```javascript
// vite.config.js
export default {
  worker: {
    rollupOptions: {
      output: {
        // 自定义 Worker 产物路径与文件名
        entryFileNames: 'workers/[name]-[hash].js'
      }
    }
  }
}
```

## 可选值与使用方式

### 默认配置

```javascript
// vite.config.js
export default {
  worker: {
    format: 'iife',
    plugins: () => [],
    rollupOptions: {}
  }
}
```

### ES Module 格式

```javascript
// vite.config.js
export default {
  worker: {
    format: 'es' // 输出 ES Module 格式的 Worker
  }
}
```

### 自定义输出路径

```javascript
// vite.config.js
export default {
  worker: {
    rollupOptions: {
      output: {
        entryFileNames: 'workers/[name]-[hash].js',
        chunkFileNames: 'workers/[name]-[hash].js'
      }
    }
  }
}
```

### Worker 专用插件

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import workerPlugin from './worker-plugin'

export default defineConfig({
  worker: {
    // 函数形式：每次调用返回新实例
    plugins: () => [workerPlugin()]
  }
})
```

## 生效后的结果示例

### 默认打包

```javascript
// src/workers/compute.js
// Worker 线程：接收消息并把结果发回主线程
self.onmessage = (e) => {
  self.postMessage(e.data * 2)
}
```

```javascript
// src/main.js
// ?worker 后缀：导入的是 Worker 构造器
import Worker from './workers/compute.js?worker'

const worker = new Worker()
worker.onmessage = (e) => console.log(e.data) // 20
worker.postMessage(10)
```

Worker 与主包产物一样输出到 `build.assetsDir`（默认 `assets/`）目录，文件名带 hash，目录与文件名可通过 `worker.rollupOptions.output` 自定义：

```
dist/
└── assets/
    ├── index-abc123.js       # 主包
    └── compute-def456.js     # Worker 文件
```

### 使用 format: 'es'

```javascript
// vite.config.js
export default {
  worker: {
    format: 'es'
  }
}
```

`es` 格式下 Worker 以模块脚本运行；当 Worker 内部有动态 `import()` 时，还能拆出共享 chunk（文件名由 `chunkFileNames` 控制）。

## 使用场景

### 1. 后台计算

```javascript
// src/workers/processor.js
// Worker 入口：收到数据后计算并发回结果
self.onmessage = (e) => {
  // 耗时计算放在 Worker 中，避免阻塞主线程
  const result = e.data.reduce((acc, val) => acc + val, 0)
  self.postMessage(result)
}
```

```javascript
// src/main.js
import Worker from './workers/processor.js?worker'

const worker = new Worker()
worker.onmessage = (e) => {
  console.log('Result:', e.data)
}
worker.postMessage([1, 2, 3, 4, 5])
```

### 2. 数据处理

```javascript
// src/workers/data-parser.js
// 大 JSON 解析放到 Worker，避免阻塞主线程渲染
self.onmessage = (e) => {
  self.postMessage(JSON.parse(e.data))
}
```

```javascript
// src/main.js
import Worker from './workers/data-parser.js?worker'

const jsonString = '{"list": [1, 2, 3]}'

const worker = new Worker()
worker.onmessage = (e) => renderData(e.data) // renderData 为页面自己的渲染函数
worker.postMessage(jsonString)
```

### 3. 多线程并行

```javascript
// src/main.js
import ComputeWorker from './workers/compute.js?worker'

// 创建 4 个 Worker 实例并行处理
const workers = Array.from({ length: 4 }, () => new ComputeWorker())

// 按索引分发任务
chunkData.forEach((data, index) => {
  workers[index].postMessage(data)
})
```

### 4. TypeScript Worker

```typescript
// src/workers/types.ts
export interface WorkerMessage {
  type: 'compute' | 'status'
  data: number[]
}

export interface WorkerResponse {
  result: number
  error?: string
}
```

```typescript
// src/workers/compute.ts
/// <reference lib="webworker" />

import type { WorkerMessage, WorkerResponse } from './types'

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data

  if (type === 'compute') {
    const result = data.reduce((a, b) => a + b, 0)
    const response: WorkerResponse = { result }
    postMessage(response)
  }
}
```

```typescript
// src/main.ts
import Worker from './workers/compute.ts?worker'
import type { WorkerResponse } from './workers/types'

const worker = new Worker()
worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
  console.log(e.data.result)
}
```

## 注意事项

### 1. Worker 导入后缀

```javascript
// 默认：返回 Worker 构造器
import Worker from './worker.js?worker'

// 内联：Worker 代码以 base64 字符串内联进主包，不产生独立产物文件
import InlineWorker from './worker.js?worker&inline'

// URL：返回 Worker 产物文件的 URL 字符串
import workerUrl from './worker.js?worker&url'
```

### 2. 内联 Worker

```javascript
// src/main.js
import InlineWorker from './worker.js?worker&inline'

// 通过 blob URL 创建，适合体积小、不想多发一次请求的 Worker
const worker = new InlineWorker()
```

### 3. Worker 文件类型

```javascript
// .js / .ts / .jsx / .tsx 等会被 Vite 转换的文件都可作为 Worker 入口
import Worker from './worker.ts?worker'
```

### 4. 同构 Worker

```javascript
// 同一份代码既能在主线程也能在 Worker 中运行：
// Worker 环境有 self 但没有 window
const isWorker = typeof self !== 'undefined' && typeof window === 'undefined'

export function process(data) {
  if (isWorker) {
    // Worker 环境特有逻辑（如计算完成后 postMessage 回主线程）
  }
  return data
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.rollupOptions` | 主包（非 Worker）产物的打包配置，与 `worker.rollupOptions` 相互独立 |
| `plugins` | 顶层插件在开发阶段对 Worker 生效；生产构建需改用 `worker.plugins` |
| `build.assetsDir` | Worker 产物默认输出的目录 |

## 完整示例

### TypeScript Worker 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  worker: {
    format: 'iife',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/workers/[name]-[hash].js'
      }
    }
  },

  resolve: {
    alias: {
      '@': '/src' // 路径别名，Worker 模块内同样生效
    }
  }
})
```

### 多 Worker 项目

```javascript
// vite.config.js
export default {
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'workers/[name]-[hash].js',
        chunkFileNames: 'workers/[name]-[hash].js'
      }
    }
  }
}
```

```
src/
├── workers/
│   ├── compute.js
│   ├── parser.js
│   └── validator.js
└── main.js
```

```
dist/
├── assets/
│   └── index-abc123.js
└── workers/
    ├── compute-def456.js
    ├── parser-ghi789.js
    └── validator-jkl012.js
```

### Worker 插件配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

// Worker 专用插件：只在 Worker 打包流程中执行
function stripConsolePlugin() {
  return {
    name: 'worker-strip-console',
    transform(code, id) {
      // 跳过第三方依赖，减少处理量
      if (id.includes('node_modules')) return null
      return {
        code: code.replace(/console\.log\([^)]*\);?/g, ''),
        map: null
      }
    }
  }
}

export default defineConfig({
  worker: {
    // 函数形式：每次调用返回新插件实例
    plugins: () => [stripConsolePlugin()]
  }
})
```

### 动态 Worker 加载

```javascript
// src/main.js
async function loadWorker(name) {
  // 动态导入 ?worker 模块：模块的 default 导出才是 Worker 构造器
  const mod = await import(`./workers/${name}.js?worker`)
  return new mod.default()
}

// 使用
loadWorker('compute').then((worker) => {
  worker.postMessage([1, 2, 3])
})
```

### 类型安全 Worker

```typescript
// src/workers/message.types.ts
export interface ComputeInput {
  numbers: number[]
  operation: 'sum' | 'average'
}

export interface ComputeOutput {
  result: number
  operation: string
}
```

```typescript
// src/workers/compute.worker.ts
/// <reference lib="webworker" />

import type { ComputeInput, ComputeOutput } from './message.types'

self.onmessage = (e: MessageEvent<ComputeInput>) => {
  const { numbers, operation } = e.data
  let result = 0

  switch (operation) {
    case 'sum':
      result = numbers.reduce((a, b) => a + b, 0)
      break
    case 'average':
      result = numbers.reduce((a, b) => a + b, 0) / numbers.length
      break
  }

  const output: ComputeOutput = { result, operation }
  postMessage(output)
}
```

```typescript
// src/main.ts
import Worker from './workers/compute.worker.ts?worker'
import type { ComputeOutput } from './workers/message.types'

const worker = new Worker()
worker.onmessage = (e: MessageEvent<ComputeOutput>) => {
  console.log(`${e.data.operation}: ${e.data.result}`)
}

worker.postMessage({
  numbers: [1, 2, 3, 4, 5],
  operation: 'sum'
})
```

## 常见问题

### 问题 1：Worker 加载失败

**原因**：直接 `import` Worker 文件，拿到的是模块本身而不是 Worker 构造器。

```javascript
// ❌ 错误：导入的是模块，new Worker() 并没有创建线程
import Worker from './worker.js'
```

```javascript
// ✅ 正确：加 ?worker 后缀，导入 Worker 构造器
import Worker from './worker.js?worker'
```

### 问题 2：TypeScript 类型错误

**原因**：Worker 文件缺少 WebWorker 环境的类型声明（`self`、`postMessage` 等报错）。

**解决**：在 `tsconfig.json` 的 `lib` 中加入 `"WebWorker"`：

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "WebWorker"]
  }
}
```

或在 Worker 文件顶部添加三斜线引用：

```typescript
// src/workers/compute.ts
/// <reference lib="webworker" />
```

> 💡 **提示：** 若使用 `import Worker from './xxx?worker'` 导入构造器，`vite/client` 类型已内置 `?worker` 的声明（在 `tsconfig.json` 的 `types` 中加入 `"vite/client"`，或创建 `env.d.ts` 引入）。

### 问题 3：Worker 文件路径 404

**原因**：部署路径与产物 URL 不一致。

**解决**：让 `base` 与线上部署路径保持一致，并按需自定义产物路径：

```javascript
// vite.config.js
export default {
  base: '/app/', // 部署在子路径时需与线上一致
  worker: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/workers/[name]-[hash].js'
      }
    }
  }
}
```
