# Web Worker 详解

## 什么是 Web Worker

Web Worker 是 HTML5 提供的一种在后台线程中运行脚本的能力。它允许 JavaScript 代码在独立于主线程的后台线程中执行，**不会阻塞 UI 渲染和用户交互**。

### 核心特点

| 特性 | 说明 |
|------|------|
| 并行执行 | 在独立线程中运行，与主线程并行 |
| 不阻塞 UI | 耗时操作不影响页面响应 |
| 同源限制 | 只能加载同源脚本 |
| 通信机制 | 通过消息传递与主线程通信 |
| 环境限制 | 无法访问 DOM、window、document |

---

## 基本使用

### 1. 创建 Worker

```javascript
// 主线程代码
const worker = new Worker('worker.js');

// 或者使用 Blob 创建内联 Worker
const workerCode = `
  self.onmessage = function(e) {
    const result = e.data * 2;
    self.postMessage(result);
  };
`;
const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));
```

### 2. 消息通信

```javascript
// 主线程发送消息
worker.postMessage({ data: [1, 2, 3, 4] });

// 主线程接收消息
worker.onmessage = function(e) {
  console.log('收到 Worker 结果:', e.data);
};

// 错误处理
worker.onerror = function(e) {
  console.error('Worker 错误:', e.message);
};

// 终止 Worker
worker.terminate();
```

```javascript
// worker.js - Worker 线程代码
self.onmessage = function(e) {
  const data = e.data;
  // 执行计算密集型任务
  const result = data.map(n => n * n);
  // 发送结果回主线程
  self.postMessage(result);
};

// 或者使用 addEventListener
self.addEventListener('message', function(e) {
  self.postMessage(e.data + ' 处理完成');
});
```

### 3. 完整示例

```javascript
// main.js
const worker = new Worker('calculate.js');

worker.postMessage({ type: 'start', number: 10000000 });

worker.onmessage = (e) => {
  const { type, result } = e.data;
  if (type === 'progress') {
    console.log(`进度: ${result}%`);
  } else if (type === 'complete') {
    console.log('结果:', result);
    worker.terminate();
  }
};
```

```javascript
// calculate.js
self.onmessage = function(e) {
  const { type, number } = e.data;

  if (type === 'start') {
    let sum = 0;
    for (let i = 0; i <= number; i++) {
      sum += i;
      if (i % 100000 === 0) {
        self.postMessage({
          type: 'progress',
          result: Math.floor(i / number * 100)
        });
      }
    }
    self.postMessage({ type: 'complete', result: sum });
  }
};
```

---

## Worker 类型

### 1. Dedicated Worker（专用 Worker）

```javascript
// 最常用的 Worker，一对一关系
const worker = new Worker('worker.js');
```

### 2. Shared Worker（共享 Worker）

```javascript
// 可被多个脚本共享
const sharedWorker = new SharedWorker('shared-worker.js');

// 通过 port 通信
sharedWorker.port.start();
sharedWorker.port.postMessage('hello');
sharedWorker.port.onmessage = (e) => console.log(e.data);
```

```javascript
// shared-worker.js
const connections = [];

self.onconnect = function(e) {
  const port = e.ports[0];
  connections.push(port);

  port.onmessage = function(e) {
    connections.forEach(conn => {
      conn.postMessage(e.data);
    });
  };
};
```

### 3. Service Worker

用于网络请求拦截、缓存管理等，属于另一种用途。

---

## 重要限制

### Worker 环境中**不可用**的对象：

| 对象 | 说明 |
|------|------|
| `window` | 使用 `self` 或 `DedicatedWorkerGlobalScope` 代替 |
| `document` | 无法访问 DOM |
| `parent` | 无父窗口概念 |
| `DOM` | 无法操作 DOM 元素 |

### Worker 环境**可用**的对象：

- `setTimeout` / `setInterval`
- `XMLHttpRequest` / `fetch`
- `WebSocket`
- `IndexedDB`
- `Cache`
- `importScripts()` - 加载外部脚本

---

## 使用注意事项

### 1. 消息传递是拷贝而非引用

```javascript
// 对象会被序列化传输，大对象有性能开销
const largeData = new ArrayBuffer(1024 * 1024 * 100); // 100MB
worker.postMessage(largeData); // 整个数据被拷贝

// 使用 Transferable Objects 转移所有权，零拷贝
worker.postMessage(largeData, [largeData]);
// 转移后，主线程中的 largeData 不可再使用
```

### 2. 脚本加载限制

```javascript
// Worker 中加载外部脚本
importScripts('utils.js', 'helper.js');

// 必须同源，或设置正确的 CORS
```

### 3. 及时终止 Worker

```javascript
// 使用完毕后必须终止，释放资源
worker.terminate();

// Worker 内部也可以自我关闭
self.close();
```

### 4. 调试困难

- Worker 无法直接使用 `console.log` 在某些浏览器
- 需要使用 Chrome DevTools 的 Threads 面板调试

### 5. 浏览器兼容性

基本支持：IE 10+, 所有现代浏览器

```javascript
// 检测支持
if (typeof Worker !== 'undefined') {
  // 支持
} else {
  // 不支持，降级处理
}
```

---

## 典型应用场景

| 场景 | 示例 |
|------|------|
| 大量计算 | 数据分析、图像处理、加密解密 |
| 大数据处理 | JSON 解析、CSV 处理 |
| 实时处理 | 视频编解码、音频分析 |
| 轮询/长连接 | 定时检查状态、WebSocket 管理 |

```javascript
// 图像处理示例
const imageWorker = new Worker('image-processor.js');

canvas.toBlob(blob => {
  imageWorker.postMessage(blob, [blob]);
});

imageWorker.onmessage = (e) => {
  const processedBlob = e.data;
  // 显示处理后的图像
};
```

---

## 最佳实践

1. **合理划分任务** - 将 CPU 密集型操作放入 Worker
2. **控制 Worker 数量** - 建议不超过硬件并发数 `navigator.hardwareConcurrency`
3. **使用 Transferable Objects** - 减少大数据拷贝开销
4. **做好错误处理** - 监听 `error` 事件，避免 Worker 静默失败
5. **注意内存释放** - 及时 `terminate()` 不再使用的 Worker
