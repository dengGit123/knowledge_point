### Promise.allSettled：等待所有 Promise 完成

> 📖 [Promise.allSettled - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)

### 一、概述

`Promise.allSettled()` 是一个**静态方法**，用于批量执行多个 Promise，**无论每个 Promise 是成功还是失败，都会等待全部完成后才返回**。与 `Promise.all()` 不同，它不会因为某个 Promise 失败就立即终止，而是会收集所有 Promise 的最终状态。

这个方法适用于**需要等待所有任务完成，无论成功或失败的场景**，比如批量发送请求、同时执行多个互不依赖的独立任务。

### 二、核心概念

#### 工作原理

`Promise.allSettled()` 接收一个 **Promise 数组（或任何可迭代对象）**，并行执行它们，最终返回一个新的 Promise，该 Promise 会解析为一个**结果数组**，数组中包含每个 Promise 的最终状态对象。

每个结果对象的结构如下：

```js
// 成功的结果
{
  status: "fulfilled",
  value: 成功的返回值
}

// 失败的结果
{
  status: "rejected",
  reason: 失败的原因（通常是错误对象）
}
```

**关键特点**：

- **不会短路**：某个 Promise 失败不会影响其他 Promise 的执行
- **保持顺序**：结果数组的顺序与输入数组的顺序一致
- **总是成功**：返回的 Promise 总是 `fulfilled` 状态（永不会 `rejected`）

### 三、详细用法

#### 1. 基本用法

```js
// ✅ 基本示例：混合成功和失败的 Promise
const promise1 = Promise.resolve(42);
const promise2 = Promise.reject(new Error("出错了"));
const promise3 = Promise.resolve("完成");

const results = await Promise.allSettled([promise1, promise2, promise3]);

console.log(results);
// [
//   { status: "fulfilled", value: 42 },
//   { status: "rejected", reason: Error: 出错了 },
//   { status: "fulfilled", value: "完成" }
// ]
```

#### 2. 进阶用法：处理混合类型的 Promise

```js
// ✅ 不同类型任务的并行处理
const tasks = [
  fetchData(),           // 返回数据的 Promise
  logAnalytics(),       // void 类型，不返回数据
  validateUser(),       // 返回布尔值
  Promise.reject(new Error("某个任务失败"))
];

const results = await Promise.allSettled(tasks);

// 分别处理成功和失败的结果
// 注：额外的 r.value !== undefined 用来排除"成功但无返回值"的任务（如纯副作用函数）；
// 如果你的任务可能合法地返回 undefined，请只按 status 过滤
const successfulData = results
  .filter(r => r.status === "fulfilled" && r.value !== undefined)
  .map(r => r.value);

const errors = results
  .filter(r => r.status === "rejected")
  .map(r => r.reason.message);

console.log("成功获取的数据:", successfulData);
console.log("错误信息:", errors);
```

#### 3. 处理异步任务

```js
// ✅ 批量发送多个请求（即使部分失败也要全部完成）
const urls = [
  "https://api.example.com/users",
  "https://api.example.com/posts",
  "https://invalid-url.com"  // 这个会失败
];

const fetchPromises = urls.map(url => 
  fetch(url).then(res => res.json())
);

const results = await Promise.allSettled(fetchPromises);

// 处理结果：成功和失败分开处理
const successful = results
  .filter(result => result.status === "fulfilled")
  .map(result => result.value);

const failed = results
  .filter(result => result.status === "rejected")
  .map(result => result.reason);

console.log("成功的结果:", successful);
console.log("失败的错误:", failed);
```

#### 4. 完整 API 参考

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `iterable` | `Iterable<Promise<unknown>>` | Promise 数组或其他可迭代对象 |

| 返回值 | 类型 | 说明 |
| --- | --- | --- |
| `Promise<Array>` | `Promise<PromiseSettledResult<unknown>[]>` | 总是返回成功状态的 Promise，解析为结果数组 |

### 四、实际应用场景

#### 场景 1：批量上传文件，忽略失败继续处理

```js
// ✅ 批量上传用户文件，即使部分失败也要知道哪些成功了
async function uploadFiles(files) {
  const uploadPromises = files.map(file => uploadToServer(file));

  const results = await Promise.allSettled(uploadPromises);

  const successful = [];
  const failed = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successful.push({ file: files[index], data: result.value });
    } else {
      failed.push({ file: files[index], error: result.reason });
    }
  });

  return { successful, failed };
}
```

#### 场景 2：多个数据源聚合，收集所有可用数据

```js
// ✅ 从多个数据源获取数据，即使某些服务不可用也能收集其他数据
async function fetchFromMultipleSources(sources) {
  const promises = sources.map(source => 
    fetch(source.url).then(res => res.json())
  );

  const results = await Promise.allSettled(promises);

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return { source: sources[index].name, data: result.value };
    }
    return { source: sources[index].name, error: result.reason };
  });
}
```

#### 场景 3：清理操作，确保所有资源都被处理

```js
// ✅ 关闭多个连接，即使某些关闭失败也要尝试关闭所有连接
async function cleanupConnections(connections) {
  const closePromises = connections.map(conn => conn.close());

  const results = await Promise.allSettled(closePromises);

  // 检查是否有失败的关闭操作
  const failed = results.filter(r => r.status === "rejected");
  if (failed.length > 0) {
    console.warn(`${failed.length} 个连接关闭失败`);
  }

  console.log("清理操作完成");
}
```

#### 场景 4：与 Promise.all() 的实际使用对比

```js
// ❌ 使用 Promise.all()：第一个失败就停止，其他请求被浪费
async function fetchDataWithAll() {
  const urls = ["url1", "url2", "url3"];
  try {
    const results = await Promise.all(urls.map(url => fetch(url)));
    return results;
  } catch (error) {
    // url1 失败，url2 和 url3 虽然可能成功，但结果被丢弃了
    console.log("某个请求失败:", error);
    throw error;
  }
}

// ✅ 使用 Promise.allSettled()：收集所有请求的结果
async function fetchDataWithAllSettled() {
  const urls = ["url1", "url2", "url3"];
  const results = await Promise.allSettled(urls.map(url => fetch(url)));
  
  // 即使 url1 失败，url2 和 url3 的结果仍可使用
  const successful = results
    .filter(r => r.status === "fulfilled")
    .map(r => r.value);
  
  const failed = results
    .filter(r => r.status === "rejected")
    .map(r => r.reason);
  
  return { successful, failed };
}
```

### 五、常见问题与注意事项

#### ❌ 错误用法：误用 Promise.allSettled 处理需要"只要一个失败就停止"的场景

```js
// ❌ 错误：这种场景应该用 Promise.all()，而不是 allSettled
// 如果某个请求失败，其他请求就不应该继续
async function uploadWithAllSettled() {
  const files = [/* 多个文件 */]; // 多个文件
  const results = await Promise.allSettled(
    files.map(file => uploadFile(file))
  );
  // 即使某个文件上传失败，其他文件也会继续上传
  // 这可能不是你想要的
}

// ✅ 正确：使用 Promise.all() 实现快速失败
async function uploadWithAll() {
  const files = [/* 多个文件 */];
  try {
    const results = await Promise.all(
      files.map(file => uploadFile(file))
    );
    return results;
  } catch (error) {
    // 第一个错误发生时立即以该错误 reject（注意：其他已发出的请求不会真被"取消"，
    // 只是它们的结果被忽略；如果需要真正中止请求，用 AbortController）
    console.log("上传失败:", error);
    throw error;
  }
}
```

> 💡 **提示**：**`Promise.all()` 会快速失败**——第一个 Promise 失败就立即返回错误；而 `Promise.allSettled()` 会等待所有 Promise 完成。选择哪一个取决于你的业务需求。

#### ⚠️ 注意：结果数组的顺序与输入数组一致

```js
// ✅ 结果数组顺序与输入一致
const p1 = new Promise(resolve => setTimeout(() => resolve(1), 300));
const p2 = new Promise(resolve => setTimeout(() => resolve(2), 100));
const p3 = new Promise(resolve => setTimeout(() => resolve(3), 200));

const results = await Promise.allSettled([p1, p2, p3]);
console.log(results.map(r => r.value));  // [1, 2, 3]（不是 [2, 3, 1]）
```

#### ⚠️ 注意：空数组会立即返回空数组

```js
// ✅ 空数组的情况
const results = await Promise.allSettled([]);
console.log(results);  // []
```

#### ⚠️ 注意：非 Promise 值会被视为已成功的 Promise

```js
// ✅ 非 Promise 值会被包装成已成功的 Promise
const results = await Promise.allSettled([
  42,
  "hello",
  Promise.resolve("world")
]);

console.log(results);
// [
//   { status: "fulfilled", value: 42 },
//   { status: "fulfilled", value: "hello" },
//   { status: "fulfilled", value: "world" }
// ]
```

### 六、与相关概念对比

| 方法 | 行为 | 适用场景 | 返回状态 |
| --- | --- | --- | --- |
| **`Promise.allSettled()`** | 等待所有 Promise 完成 | 需要收集所有结果，无论成功失败 | 总是 `fulfilled` |
| **`Promise.all()`** | 快速失败，任一失败立即返回 | 所有任务都必须成功，否则无意义 | 可能 `fulfilled` 或 `rejected` |
| **`Promise.race()`** | 返回第一个完成的结果 | 谁先完成用谁，只要一个就行 | 可能 `fulfilled` 或 `rejected` |
| **`Promise.any()`** | 返回第一个成功的结果 | 只需要一个成功即可 | 可能 `fulfilled` 或 `rejected`（全部失败时） |

### 七、总结

- **`Promise.allSettled()`** 等待所有 Promise 完成，**永不快速失败**
- 返回结果数组，包含每个 Promise 的状态和值/原因
- **适用场景**：批量任务、数据聚合、清理操作等需要"全部完成"的场景
- 与 `Promise.all()` 的核心区别：**allSettled 不短路，all 会短路**
- 结果数组顺序与输入数组顺序一致

> 💡 **核心记忆口诀**：allSettled = 全部 settle（完成），不管成功失败，都要等你到终点线。

---

**浏览器支持**：ES2020 引入，现代浏览器全支持，Node.js 12.9.0+ 支持。

**相关阅读**：
- [Promise.all() - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [Promise.race() - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
- [Promise.any() - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)