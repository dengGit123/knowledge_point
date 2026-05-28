# worker 配置

## 定义

`worker` 配置 Web Worker 的打包行为，控制 Worker 脚本的构建方式和输出格式。

**类型**：

```typescript
{
  format?: 'es' | 'iife' | 'module'
  plugins?: Plugin[]
  rollupOptions?: RollupOptions
  enabled?: boolean
}
```

**默认值**：

```javascript
{
  format: 'iife',
  plugins: [],
  rollupOptions: {},
  enabled: true
}
```

## 子属性详解

### format

**类型**：`'es' | 'iife' | 'module'`

**默认值**：`'iife'`

Worker 输出格式。

```javascript
format: 'iife',      // 立即执行函数（默认）
format: 'es',        // ES Module
format: 'module'     // 同 'es'
```

### plugins

**类型**：`Plugin[]`

**默认值**：`[]`

Worker 专用插件。

```javascript
plugins: [
  // 仅在 Worker 构建时使用的插件
]
```

### rollupOptions

**类型**：`RollupOptions`

**默认值**：`{}`

Worker 打包的 Rollup 选项。

```javascript
rollupOptions: {
  output: {
    entryFileNames: 'workers/[name]-[hash].js'
  }
}
```

### enabled

**类型**：`boolean`

**默认值**：`true`

是否启用 Worker 打包。

```javascript
enabled: true   // 启用（默认）
enabled: false  // 禁用
```

## 可选值与使用方式

### 默认配置

```javascript
// vite.config.js
export default {
  worker: {
    format: 'iife',
    plugins: [],
    rollupOptions: {},
    enabled: true
  }
}
```

### ES Module 格式

```javascript
export default {
  worker: {
    format: 'es'  // 输出 ES Module
  }
}
```

### 自定义输出路径

```javascript
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
import { defineConfig } from 'vite'
import workerPlugin from './worker-plugin'

export default defineConfig({
  worker: {
    plugins: [
      workerPlugin()  // 仅在 Worker 构建时运行
    ]
  }
})
```

### 禁用 Worker 打包

```javascript
export default {
  worker: {
    enabled: false  // 禁用 Worker 打包
  }
}
```

## 生效后的结果示例

### 默认打包

```javascript
// src/workers/compute.js
export default function compute(data) {
  return data * 2
}

// src/main.js
import Worker from './workers/compute.js?worker'

const worker = new Worker()
worker.postMessage(10)
worker.onmessage = (e) => console.log(e.data)
```

**构建输出**：

```
dist/
├── assets/
│   └── index-abc123.js
└── workers/
    └── compute-def456.js   # Worker 文件
```

### ES Module 格式

```javascript
// vite.config.js
export default {
  worker: {
    format: 'es'
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
        entryFileNames: 'assets/workers/[name]-[hash].js'
      }
    }
  }
}
```

```
dist/
└── assets/
    ├── index-abc123.js
    └── workers/
        └── compute-def456.js
```

## 使用场景

### 1. 后台计算

```javascript
// src/workers/processor.js
export function process(data) {
  // 耗时计算
  return data.reduce((acc, val) => acc + val, 0)
}

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
export function parseData(rawData) {
  // 大量数据处理
  return JSON.parse(rawData)
}

// src/main.js
import Worker from './workers/data-parser.js?worker'

const worker = new Worker()
worker.onmessage = (e) => {
  renderData(e.data)
}
worker.postMessage(jsonString)
```

### 3. 多线程并行

```javascript
// src/main.js
const workers = []
for (let i = 0; i < 4; i++) {
  const Worker = await import('./workers/compute.js?worker')
  workers.push(new Worker.default())
}

// 分配任务
workers.forEach((worker, index) => {
  worker.postMessage({ data: chunkData[index], index })
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

// src/workers/compute.ts
/// <reference lib="webworker" />

type Message = WorkerMessage
type Response = WorkerResponse

self.onmessage = (e: MessageEvent<Message>) => {
  const { type, data } = e.data

  if (type === 'compute') {
    const result = data.reduce((a, b) => a + b, 0)
    postMessage({ result })
  }
}

// src/main.ts
import Worker from './workers/compute.ts?worker'

const worker = new Worker()
worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
  console.log(e.data.result)
}
```

## 注意事项

### 1. Worker 导入后缀

```javascript
// 必须使用 ?worker 后缀
import Worker from './worker.js?worker'

// 内联 Worker
import InlineWorker from './worker.js?worker&inline'

// 命名 Worker（生成唯一文件）
import NamedWorker from './worker.js?worker&file=my-worker'
```

### 2. 内联 Worker

```javascript
// ?worker&inline 会内联为 blob URL
import InlineWorker from './worker.js?worker&inline'

const worker = new InlineWorker()
// Worker 代码内联为 base64 blob
```

### 3. Worker 文件类型

```javascript
// 支持 .js, .ts, .jsx, .tsx 等
// tsWorker.ts
import Worker from './tsWorker.ts?worker'

// jsxWorker.jsx
import Worker from './jsxWorker.jsx?worker'
```

### 4. 同构 Worker

```javascript
// 检测是否在 Worker 环境
const isWorker = typeof self !== 'undefined' && typeof window === 'undefined'

// 代码可同时在主线程和 Worker 运行
export function process(data) {
  if (isWorker) {
    // Worker 特定逻辑
  }
  return data
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.rollupOptions` | 主线程打包配置 |
| `plugins` | Worker 可使用主插件（需确认兼容） |
| `resolve` | Worker 继承 resolve 配置 |

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

  // 确保 TypeScript 正确处理
  resolve: {
    alias: {
      '@': '/src'
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

// Worker 专用插件
function workerTransformPlugin() {
  return {
    name: 'worker-transform',
    transform(code, id) {
      if (id.includes('?worker')) {
        return {
          code: code.replace(/console\.log/g, '/* console.log */'),
          map: null
        }
      }
    }
  }
}

export default defineConfig({
  worker: {
    plugins: [
      workerTransformPlugin()
    ]
  }
})
```

### 动态 Worker 加载

```javascript
// src/main.js
async function loadWorker(name) {
  const Worker = await import(`./workers/${name}.js?worker`)
  return new Worker.default()
}

// 使用
const computeWorker = await loadWorker('compute')
computeWorker.postMessage(data)
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

// src/main.ts
import Worker from './workers/compute.worker.ts?worker'
import type { ComputeInput, ComputeOutput } from './workers/message.types'

const worker = new Worker()
worker.onmessage = (e: MessageEvent<ComputeOutput>) => {
  console.log(`${e.data.operation}: ${e.data.result}`)
}

const input: ComputeInput = {
  numbers: [1, 2, 3, 4, 5],
  operation: 'sum'
}
worker.postMessage(input)
```

## 常见问题

### 问题 1：Worker 加载失败

**原因**：缺少 `?worker` 后缀

```javascript
// ❌ 错误
import Worker from './worker.js'

// ✅ 正确
import Worker from './worker.js?worker'
```

### 问题 2：TypeScript 类型错误

**原因**：缺少类型声明

**解决**：

```typescript
// src/workers/worker.d.ts
/// <reference lib="webworker" />

export default function export() {}
```

### 问题 3：Worker 文件路径错误

**原因**：输出路径配置不当

**解决**：

```javascript
// vite.config.js
export default {
  worker: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/workers/[name]-[hash].js'
      }
    }
  },
  base: '/app/'  // 确保 base 正确
}
```

## 官方文档

[Worker Options: worker - Vite 官方文档](https://cn.vitejs.dev/config/worker-options.html)

[Web Workers - Vite 官方文档](https://cn.vitejs.dev/guide/features.html#web-workers)
