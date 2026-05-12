# worker 配置

## 定义

`worker` 配置 Web Worker 的打包行为。

## 用法

```javascript
// vite.config.js
export default {
  worker: {
    format: 'iife',
    plugins: [],
    rollupOptions: {}
  }
}
```

## 子属性详解

### format

Worker 输出格式。

```javascript
format: 'iife',      // 立即执行函数（默认）
format: 'es',        // ES Module
format: 'module'     // 同 'es'
```

### plugins

Worker 专用插件。

```javascript
plugins: [
  // Worker 特定插件
]
```

### rollupOptions

Worker 打包的 Rollup 选项。

```javascript
rollupOptions: {
  output: {
    assetFileNames: 'workers/[name]-[hash].js'
  }
}
```

## 作用

- 配置 Web Worker 的打包方式
- 支持在 Worker 中使用 TypeScript 等
- 控制产物的输出格式

## 使用场景

1. **后台计算**：在 Worker 中执行耗时任务
2. **数据处理**：大量数据处理
3. **多线程**：利用多核 CPU

## 注意事项

- 使用 `?worker` 或 `?worker&inline` 后缀导入 Worker
- Worker 文件也可以使用 TypeScript
- 内联 Worker 不会生成单独文件

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.rollupOptions` | 主线程打包配置 |
| `plugins` | Worker 可使用主插件（需确认兼容） |

## 示例

```javascript
// 基本配置
export default {
  worker: {
    format: 'es'
  }
}

// 完整配置
export default {
  worker: {
    format: 'iife',
    plugins: [
      // Worker 特定插件
    ],
    rollupOptions: {
      output: {
        entryFileNames: 'workers/[name].js'
      }
    }
  }
}

// 在代码中使用
// 方式一：独立文件
import Worker from './worker.js?worker'
const worker = new Worker()

// 方式二：内联
import InlineWorker from './worker.js?worker&inline'
const worker = new InlineWorker()

// 方式三：命名 worker
import NamedWorker from './worker.ts?worker&file=worker-1'
```

## Worker 文件示例

```javascript
// worker.js
export default {
  // 发送消息
  self.onmessage = (e) => {
    const result = heavyComputation(e.data)
    self.postMessage(result)
  }
}

// 或使用类
export class MyWorker {
  constructor() {
    self.onmessage = this.handleMessage.bind(this)
  }

  handleMessage(e) {
    // 处理消息
  }
}
```
