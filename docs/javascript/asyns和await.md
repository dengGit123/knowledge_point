# async/await 详解

## 一、基础概念

### 1.1 什么是 async/await

`async/await` 是 ES2017 引入的语法糖，用于更优雅地处理异步操作。它是基于 Promise 构建的，让异步代码看起来像同步代码一样易读。

### 1.2 核心优势

| 特性 | 说明 |
|------|------|
| 可读性强 | 异步代码像同步代码一样线性阅读 |
| 错误处理 | 可用 try/catch 处理异步错误 |
| 调试友好 | 代码执行顺序清晰，便于断点调试 |
| 兼容性好 | 基于Promise，可与现有 Promise 代码无缝配合 |

---

## 二、async 关键字

### 2.1 基本用法

```javascript
// 声明 async 函数
async function foo() {}

// 函数表达式
const bar = async function() {};

// 箭头函数
const baz = async () => {};

// 对象方法
const obj = {
  async method() {}
};

// 类方法
class MyClass {
  async method() {}
}
```

### 2.2 返回值规则

```javascript
// 规则1: 返回普通值 → 包装成 fulfilled Promise
async function returnValue() {
  return 'hello';
  // 相当于: return Promise.resolve('hello')
}
returnValue().then(console.log); // 'hello'

// 规则2: 返回 Promise → 直接返回该 Promise
async function returnPromise() {
  return new Promise((resolve) => {
    setTimeout(() => resolve('delayed'), 1000);
  });
}
returnPromise().then(console.log); // 1秒后输出 'delayed'

// 规则3: 抛出异常 → 包装成 rejected Promise
async function throwError() {
  throw new Error('出错了');
  // 相当于: return Promise.reject(new Error('出错了'))
}
throwError().catch(console.error); // Error: 出错了
```

### 2.3 执行顺序

```javascript
console.log('1');

async function asyncFunc() {
  console.log('2');
  return '3';
}

asyncFunc().then(console.log);

console.log('4');

// 输出顺序: 1 → 2 → 4 → 3
// 说明: async 函数会同步执行函数体，但返回的 Promise 回调是异步的
```

---

## 三、await 关键字

### 3.1 基本用法

```javascript
// await 只能在 async 函数内部使用
async function fetchData() {
  // 等待 Promise 解决并获取结果
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}

// 如果 await 的值不是 Promise，会直接返回
async function demo() {
  const value = await 42; // 等同于 const value = 42;
  console.log(value); // 42
}
```

### 3.2 等待机制

```javascript
// await 会暂停函数执行，直到 Promise 完成
async function example() {
  console.log('开始');

  const promise = new Promise(resolve => {
    setTimeout(() => resolve('完成'), 1000);
  });

  const result = await promise; // 暂停 1 秒
  console.log(result); // '完成'
  console.log('结束');
}

example();
// 输出: 开始 → (1秒后) → 完成 → 结束
```

### 3.3 错误处理

```javascript
// 方式1: try...catch
async function fetchWithErrorHandling() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('请求失败:', error);
    // 可以返回默认值或重新抛出
    return { error: true };
  }
}

// 方式2: 使用 .catch()
async function alternative() {
  const data = await fetchData().catch(error => {
    console.error('请求失败:', error);
    return null;
  });
  return data;
}
```

---

## 四、进阶用法

### 4.1 并行执行

```javascript
// ❌ 错误: 顺序执行，浪费时间
async function sequential() {
  const result1 = await fetch('/api/1'); // 等待 1 秒
  const result2 = await fetch('/api/2'); // 等待 1 秒
  // 总耗时: 2 秒
}

// ✅ 正确: 并行执行
async function parallel() {
  const promise1 = fetch('/api/1');
  const promise2 = fetch('/api/2');

  const [result1, result2] = await Promise.all([promise1, promise2]);
  // 总耗时: 1 秒
}

// 使用 Promise.allSettled 处理部分失败
async function parallelWithPartialFailure() {
  const results = await Promise.allSettled([
    fetch('/api/1'),
    fetch('/api/2'),
    fetch('/api/3'),
  ]);

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`请求${index + 1}成功:`, result.value);
    } else {
      console.error(`请求${index + 1}失败:`, result.reason);
    }
  });
}
```

### 4.2 循环中的使用

```javascript
// 顺序执行（一个接一个）
async function processSequentially(items) {
  const results = [];
  for (const item of items) {
    const result = await processItem(item);
    results.push(result);
  }
  return results;
}

// 并发执行（同时进行）
async function processConcurrently(items) {
  const promises = items.map(item => processItem(item));
  return await Promise.all(promises);
}

// 分批并发（限制并发数）
async function processInBatches(items, batchSize = 5) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    );
    results.push(...batchResults);
  }
  return results;
}

// 使用 for...of 的顺序处理（可中断）
async function processWithBreak(items) {
  for (const item of items) {
    const result = await processItem(item);
    if (result.shouldStop) break;
  }
}
```

### 4.3 动态链式调用

```javascript
// 根据条件决定是否等待
async function conditionalWait(condition, value) {
  if (condition) {
    return await fetchValue(); // 等异步操作
  }
  return value; // 直接返回
}

// 等待多个 Promise，只取最快的
async function raceCondition() {
  const result = await Promise.race([
    fetch('/api/fast'),
    fetch('/api/slow'),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('超时')), 5000)
    ),
  ]);
  return result;
}
```

---

## 五、常见陷阱与注意事项

### 5.1 忘记使用 await

```javascript
// ❌ 错误: 忘记 await
async function mistake() {
  const data = fetchData(); // 返回 Promise，不是数据
  console.log(data); // Promise {<pending>}
}

// ✅ 正确
async function correct() {
  const data = await fetchData();
  console.log(data); // 实际数据
}
```

### 5.2 在循环中使用 await 的性能问题

```javascript
// ❌ 性能差: 顺序执行，总耗时 = N * 单次耗时
async function slow(items) {
  for (const item of items) {
    await processItem(item);
  }
}

// ✅ 性能好: 并发执行
async function fast(items) {
  await Promise.all(items.map(item => processItem(item)));
}
```

### 5.3 错误处理不完整

```javascript
// ❌ 错误: 没有处理错误
async function noErrorHandling() {
  const data = await fetchData();
  return data;
}

// ✅ 正确: 使用 try...catch
async function withErrorHandling() {
  try {
    const data = await fetchData();
    return data;
  } catch (error) {
    console.error('处理错误:', error);
    throw error; // 重新抛出让调用者处理
  }
}
```

### 5.4 并行错误处理

```javascript
// Promise.all: 任何一个失败都会立即拒绝
async function allOrNothing() {
  try {
    const results = await Promise.all([
      fetch('/api/1'),
      fetch('/api/2'),
    ]);
    return results;
  } catch (error) {
    // 无法知道是哪个请求失败
    console.error('有请求失败了');
  }
}

// Promise.allSettled: 等待所有完成，不管成功失败
async function tolerateFailures() {
  const results = await Promise.allSettled([
    fetch('/api/1'),
    fetch('/api/2'),
  ]);

  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);

  return { successful, failed };
}
```

### 5.5 顶层 await

```javascript
// ES2022+ 支持在模块顶层使用 await
// 必须在 type="module" 的模块中

// config.mjs
const response = await fetch('/api/config');
export const config = await response.json();

// 这是模块级别的代码，不需要包装在 async 函数中
```

---

## 六、最佳实践

### 6.1 错误处理模式

```javascript
// 模式1: 集中错误处理
async function apiCall(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`请求失败 ${url}:`, error);
    throw error; // 重新抛出
  }
}

// 模式2: 返回结果和错误（Go 风格）
async function safeAsync(fn) {
  try {
    const data = await fn();
    return [data, null];
  } catch (error) {
    return [null, error];
  }
}

// 使用
const [user, error] = await safeAsync(() => fetchUser(id));
if (error) {
  // 处理错误
} else {
  // 使用 user
}
```

### 6.2 顺序与并行选择

```javascript
// 依赖关系明确的 → 顺序执行
async function dependent() {
  const user = await getUser(userId);
  const posts = await getUserPosts(user.id);
  const comments = await getPostComments(posts[0].id);
  return comments;
}

// 相互独立的 → 并行执行
async function independent() {
  const [user, posts, comments] = await Promise.all([
    getUser(userId),
    getUserPosts(userId),
    getUserComments(userId),
  ]);
  return { user, posts, comments };
}
```

### 6.3 超时控制

```javascript
// 为异步操作设置超时
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`超时 ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// 使用
async function fetchWithTimeout() {
  try {
    const data = await withTimeout(fetch('/api/data'), 5000);
    return await data.json();
  } catch (error) {
    if (error.message.includes('超时')) {
      // 处理超时
    }
    throw error;
  }
}
```

### 6.4 重试机制

```javascript
async function retry(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      console.log(`第 ${attempt} 次失败，${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // 指数退避
    }
  }
}

// 使用
const data = await retry(() => fetch('/api/unstable'));
```

---

## 七、async/await vs Promise 对比

### 7.1 代码风格对比

```javascript
// Promise 链式调用
function promiseChain() {
  return fetchUser(userId)
    .then(user => fetchPosts(user.id))
    .then(posts => fetchComments(posts[0].id))
    .then(comments => {
      console.log(comments);
      return comments;
    })
    .catch(error => {
      console.error(error);
    });
}

// async/await
async function asyncAwait() {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    console.log(comments);
    return comments;
  } catch (error) {
    console.error(error);
  }
}
```

### 7.2 适用场景

| 场景 | 推荐方案 |
|------|----------|
| 简单异步操作 | Promise.then() |
| 复杂异步流程 | async/await |
| 需要并发 | Promise.all() |
| 错误需要细粒度处理 | Promise.catch() |
| 调试复杂逻辑 | async/await |

---

## 八、实际应用示例

### 8.1 API 请求封装

```javascript
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API 请求失败: ${url}`, error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }
}

// 使用
const api = new ApiClient('https://api.example.com');
const user = await api.get('/user/123');
```

### 8.2 文件上传进度

```javascript
async function uploadWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`上传失败: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('网络错误')));
    xhr.open('POST', '/api/upload');
    xhr.send(file);
  });
}

// 使用
async function uploadFile(file) {
  try {
    const result = await uploadWithProgress(file, (percent) => {
      console.log(`上传进度: ${percent.toFixed(1)}%`);
    });
    console.log('上传成功:', result);
  } catch (error) {
    console.error('上传失败:', error);
  }
}
```

### 8.3 顺序处理带依赖的数据

```javascript
async function processWorkflow(userId) {
  // 步骤1: 获取用户信息
  const user = await fetchUser(userId);
  console.log('用户:', user.name);

  // 步骤2: 获取用户订单
  const orders = await fetchOrders(userId);
  console.log('订单数量:', orders.length);

  // 步骤3: 处理每个订单
  for (const order of orders) {
    // 步骤3.1: 获取订单详情
    const details = await fetchOrderDetails(order.id);

    // 步骤3.2: 计算折扣
    const discount = await calculateDiscount(details);

    // 步骤3.3: 更新订单
    await updateOrder(order.id, { discount });
    console.log(`订单 ${order.id} 折扣已更新`);
  }

  return { user, processedOrders: orders.length };
}
```

---

## 九、总结

### 关键要点

1. **async 函数总是返回 Promise** - 无论返回什么值
2. **await 会暂停执行** - 直到 Promise 完成
3. **错误处理很重要** - 使用 try/catch 捕获错误
4. **注意并行执行** - 使用 Promise.all 提升性能
5. **合理选择** - 简单场景用 Promise，复杂流程用 async/await

### 记忆口诀

```
async 修饰函数，返回 Promise
await 等待结果，暂停执行
try-catch 包裹，处理异常
Promise.all 并行，提升性能
```
