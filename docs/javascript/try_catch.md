### try...catch...finally

> 📖 [MDN - try...catch](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/try...catch)

`try...catch...finally` 是 JavaScript 中用于**捕获和处理异常**的错误处理机制。它让程序在遇到错误时不会直接崩溃，而是可以「**优雅地处理错误**」—— 记录日志、给用户提示、执行降级逻辑等。

可以把 `try...catch` 想象成「**安全气囊**」—— 正常情况下不会生效，一旦发生碰撞（异常），它就会弹出来保护程序不直接「撞毁」。

---

### 一、基本语法

```js
try {
  // 可能抛出异常的代码
} catch (err) {
  // 捕获并处理异常，err 是抛出的错误对象
} finally {
  // 无论是否发生异常都会执行（可选）
}
```

#### 三种组合方式

| 写法 | 说明 |
| --- | --- |
| `try...catch` | 捕获异常并处理 |
| `try...finally` | 不捕获异常，但保证清理代码执行 |
| `try...catch...finally` | 既捕获异常，又保证清理代码执行 |

> ⚠️ **注意：** `try` 块后面**必须至少跟随** `catch` 或 `finally` 之一，否则会报语法错误。

---

### 二、try 块的作用

`try` 块用来**包裹可能抛出异常的代码**。当 `try` 中的代码抛出异常时，**控制流立即转向** `catch` 块（如果有的话），`try` 块中剩余的代码不会继续执行。

```js
try {
  console.log('第1行：执行');
  throw new Error('出错了');   // 抛出异常
  console.log('第2行：不会执行'); // ❌ 这行被跳过
} catch (err) {
  console.log('捕获到:', err.message); // '出错了'
}
```

#### 核心规则

- `try` 中的异常会**中断**当前块的后续代码
- 异常会被**最近的** `catch` 捕获（如果有的话）
- 如果没有 `catch`，异常会**向上层调用栈传播**

---

### 三、catch 块的作用

`catch` 块用来**接收并处理** `try` 中抛出的异常。参数 `err` 包含了错误的信息，可以使用任意合法的变量名。

```js
try {
  JSON.parse('{非法json}');
} catch (err) {
  console.log(err.name);    // 'SyntaxError'
  console.log(err.message); // 具体的错误描述
}
```

#### catch 块的行为

| 情况 | catch 是否执行 |
| --- | --- |
| try 中无异常 | ❌ 不执行 |
| try 中抛出异常 | ✅ 执行 |
| catch 中再次抛出异常 | 异常继续向上传播 |

#### 可选 catch 绑定（ES2019）

如果你的 catch 块**不需要使用错误对象**，可以省略参数：

```js
try {
  riskyOperation();
} catch {
  // 不需要错误对象时，直接省略参数（ES2019+）
  console.log('操作失败了');
}
```

#### 重新抛出异常

当 catch 块**无法处理当前异常**时，可以重新抛出，让上层调用者处理：

```js
try {
  parseData();
} catch (err) {
  console.log('记录日志:', err.message);
  throw err; // 重新抛出，交给上层处理
}
```

> 💡 **提示：** 不要为了「不出错」而**吞掉所有异常**。如果无法处理，应该重新抛出或包装后抛出。

---

### 四、finally 块的作用

`finally` 块中的代码**无论是否发生异常都会执行**，常用于**清理资源**（关闭文件、释放连接、隐藏 loading 等）。

```js
let isLoading = true;
try {
  await fetchData();
} catch (err) {
  console.error('请求失败:', err);
} finally {
  isLoading = false; // 无论成功失败都要关闭 loading
}
```

#### finally 的特殊行为

**1. 即使 try/catch 中有 return，finally 仍然会执行：**

```js
function demo() {
  try {
    return 'try 的返回值';
  } finally {
    console.log('finally 先执行'); // 先执行这行
  }
}
```

**2. finally 中的 return 会覆盖 try/catch 的返回值：**

```js
function demo() {
  try {
    return 'try 的返回值';
  } finally {
    return 'finally 的返回值'; // ❌ 覆盖了
  }
}
console.log(demo()); // 'finally 的返回值'
```

> ⚠️ **注意：** **不要在 finally 中写 return**，这会意外覆盖 try/catch 的返回值，造成难以排查的 bug。

**3. finally 中抛出异常也会覆盖 try/catch 的异常：**

```js
try {
  throw new Error('try 中的错误');
} finally {
  throw new Error('finally 中的错误'); // ❌ 覆盖了原来的错误
}
```

---

### 五、return 在 try/catch/finally 中的行为

`return` 在 `try...catch...finally` 中的行为是面试高频考点，也是实际开发中**最容易踩坑的地方**。核心规则：**`finally` 中的 `return` 会覆盖 `try`/`catch` 中的返回值，`finally` 中抛出异常会覆盖 `try`/`catch` 中的异常**。

#### 1. 执行顺序

当 `try`/`catch` 中有 `return` 时，JavaScript 会：

1. **先计算 return 的表达式**，将结果**暂存**起来
2. **执行 finally 块**
3. 如果 finally 中没有 return/throw，则将**暂存的结果**作为函数返回值
4. 如果 finally 中有 return/throw，则**覆盖**暂存的结果

```js
function demo() {
  try {
    return 'A'; // ① 暂存 'A'
  } finally {
    console.log('B'); // ② 执行 finally
  }
  // ③ 返回暂存的 'A'
}
console.log(demo()); // 先输出 'B'，再输出 'A'
```

#### 2. try 中的 return

```js
function getValue() {
  try {
    return 'try 返回'; // 暂存后，执行 finally
  } finally {
    // 没有 return，不影响
  }
}
console.log(getValue()); // 'try 返回'
```

#### 3. catch 中的 return

```js
function getValue() {
  try {
    throw new Error('出错');
  } catch (err) {
    return 'catch 返回'; // 暂存后，执行 finally
  } finally {
    // 没有 return，不影响
  }
}
console.log(getValue()); // 'catch 返回'
```

#### 4. finally 中的 return 覆盖 try 的返回值（⚠️ 重点）

```js
function getValue() {
  try {
    return 'try 返回'; // 暂存 'try 返回'
  } finally {
    return 'finally 返回'; // ❌ 覆盖了暂存的值
  }
}
console.log(getValue()); // 'finally 返回'
```

#### 5. finally 中的 return 覆盖 catch 的返回值

```js
function getValue() {
  try {
    throw new Error('出错');
  } catch (err) {
    return 'catch 返回'; // 暂存 'catch 返回'
  } finally {
    return 'finally 返回'; // ❌ 覆盖了暂存的值
  }
}
console.log(getValue()); // 'finally 返回'
```

#### 6. finally 中抛出异常覆盖原有返回值

```js
function getValue() {
  try {
    return 'try 返回'; // 暂存 'try 返回'
  } finally {
    throw new Error('finally 抛出'); // ❌ 覆盖了返回值，函数抛出异常
  }
}
try {
  getValue();
} catch (err) {
  console.log(err.message); // 'finally 抛出'
}
```

#### 7. 返回值是引用类型时的表现

当返回值是**对象**等引用类型时，由于暂存的是**引用**，在 finally 中修改对象的属性会影响最终返回值：

```js
function getObj() {
  try {
    return { name: '张三' }; // 暂存对象的引用
  } finally {
    // 没有 return，但修改了对象属性
    // 注意：这里无法直接访问 try 中返回的对象
  }
}

// ⚠️ 但如果 finally 中 return 一个新对象，会完全覆盖
function getObj2() {
  try {
    return { name: '张三' };
  } finally {
    return { name: '李四' }; // ❌ 完全覆盖
  }
}
console.log(getObj2()); // { name: '李四' }
```

#### 8. 综合对比表

| 场景 | try | catch | finally | 最终返回值 |
| --- | --- | --- | --- | --- |
| 无异常，try 中 return | `return 'A'` | 不执行 | 无 return | `'A'` |
| 有异常，catch 中 return | 抛出异常 | `return 'B'` | 无 return | `'B'` |
| finally 覆盖 try | `return 'A'` | 不执行 | `return 'C'` | `'C'` |
| finally 覆盖 catch | 抛出异常 | `return 'B'` | `return 'C'` | `'C'` |
| finally 抛异常覆盖 try | `return 'A'` | 不执行 | `throw new Error()` | 抛出异常 |
| finally 抛异常覆盖 catch | 抛出异常 | `return 'B'` | `throw new Error()` | 抛出异常 |

#### 9. 注意事项

> ⚠️ **绝对不要在 finally 中写 return** —— 这是业界公认的「坑」，它会：
> - 覆盖 try/catch 中精心计算的返回值
> - 吞掉 try/catch 中抛出的异常
> - 造成**极难排查的 bug**，因为代码逻辑看起来是正确的

> ⚠️ **绝对不要在 finally 中 throw** —— 同上，会覆盖原有的返回值或异常。

```js
// ❌ 反面教材：finally 中 return 吞掉了异常
function shouldThrow() {
  try {
    throw new Error('重要错误');
  } finally {
    return '正常值'; // 异常被吞掉了！
  }
}
// 调用者永远不知道发生了错误
console.log(shouldThrow()); // '正常值'

// ✅ 正确做法：finally 只做清理
function shouldThrow() {
  try {
    throw new Error('重要错误');
  } finally {
    cleanup(); // 只做清理，不返回不抛出
  }
}
// 异常正常向外传播
```

---

### 五、错误对象（Error）

JavaScript 中的错误是一个**对象**，包含以下常用属性：

| 属性 | 说明 |
| --- | --- |
| `name` | 错误类型（如 `TypeError`、`SyntaxError`） |
| `message` | 错误描述信息 |
| `stack` | 调用栈信息（调试时非常有用） |

#### 常见的错误类型

| 类型 | 触发场景 |
| --- | --- |
| `Error` | 通用错误 |
| `TypeError` | 类型错误（如对 null 调用方法） |
| `SyntaxError` | 语法错误（代码解析阶段） |
| `ReferenceError` | 引用错误（变量未定义） |
| `RangeError` | 数值超出范围 |
| `URIError` | URI 处理函数使用不当 |

#### 自定义错误类型

```js
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

try {
  throw new ValidationError('输入不合法');
} catch (err) {
  if (err instanceof ValidationError) {
    console.log('校验错误:', err.message);
  } else {
    console.log('其他错误:', err.message);
  }
}
```

---

### 六、同步代码中的 try...catch

对于**同步代码**，`try...catch` 可以直接捕获代码中抛出的异常：

#### 1. 捕获 JSON 解析错误

```js
function parseUserJson(json) {
  try {
    return JSON.parse(json);
  } catch (err) {
    console.error('JSON 解析失败，返回默认值');
    return { name: '匿名用户' };
  }
}

parseUserJson('{非法json}'); // { name: '匿名用户' }
parseUserJson('{"name":"张三"}'); // { name: '张三' }
```

#### 2. 捕获类型错误

```js
try {
  const obj = null;
  obj.name; // TypeError: Cannot read properties of null
} catch (err) {
  if (err instanceof TypeError) {
    console.error('类型错误:', err.message);
  }
}
```

#### 3. 捕获 eval 中的错误

```js
try {
  eval('var x = ;'); // 语法错误
} catch (err) {
  console.error('eval 执行失败:', err.message);
}
```

---

### 七、异步代码中的 try...catch

> ⚠️ **核心问题：** `try...catch` **无法直接捕获异步代码中抛出的异常**，因为异步回调会在事件循环的后续阶段执行，此时外层的 `try...catch` 已经执行完毕。

#### 1. 异步回调中的错误（❌ 无法捕获）

```js
// ❌ 错误：try...catch 捕获不到 setTimeout 中的异常
try {
  setTimeout(() => {
    throw new Error('异步错误');
  }, 1000);
} catch (err) {
  console.log('不会执行'); // 永远不会执行
}
```

**正确做法：在异步回调内部使用 try...catch**

```js
// ✅ 正确：在异步代码内部捕获
setTimeout(() => {
  try {
    throw new Error('异步错误');
  } catch (err) {
    console.log('内部捕获:', err.message);
  }
}, 1000);
```

#### 2. Promise 中的错误处理

Promise 有多种错误处理方式，各有适用场景：

**方式一：`.catch()` 方法**

```js
fetch('/api/user')
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.error('请求失败:', err));
```

**方式二：`.then` 的第二个参数**

```js
fetch('/api/user').then(
  (res) => res.json(),        // 成功回调
  (err) => console.error(err)  // 失败回调
);
```

> ⚠️ **注意：** `.then` 的第二个参数**只能捕获前面 Promise 的失败**，无法捕获当前 `.then` 成功回调中的异常。而 `.catch` 可以捕获**链中所有位置**的异常。

```js
// ❌ 第二个参数捕获不到成功回调中的异常
Promise.resolve()
  .then(
    () => { throw new Error('成功回调中的错误'); },
    (err) => console.log('不会执行') // 不会执行
  );

// ✅ catch 可以捕获链中所有异常
Promise.resolve()
  .then(() => { throw new Error('成功回调中的错误'); })
  .catch((err) => console.log('捕获到:', err.message));
```

**方式三：`.finally()` 清理**

```js
showLoading();
fetch('/api/data')
  .then((res) => res.json())
  .catch((err) => console.error(err))
  .finally(() => hideLoading()); // 无论成功失败都关闭 loading
```

#### 3. async/await 中的 try...catch（✅ 推荐）

`async/await` 让异步代码**看起来像同步代码**，此时 `try...catch` 可以像处理同步代码一样处理异步错误：

```js
async function getUser(id) {
  try {
    const res = await fetch(`/api/user/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('获取用户失败:', err.message);
    return null; // 降级返回值
  } finally {
    console.log('请求结束');
  }
}
```

#### 4. 异步方法中的错误向上传播

如果 `async` 函数中没有 `catch`，错误会**自动转化为 rejected 的 Promise**：

```js
async function fetchUser() {
  const res = await fetch('/api/user');
  return res.json(); // 如果 fetch 失败，这里会自动抛出
}

// 调用者负责捕获
fetchUser().catch((err) => console.error('失败:', err));
```

---

### 八、异步错误处理方式对比

| 方式 | 适用场景 | 优点 | 缺点 |
| --- | --- | --- | --- |
| `.catch()` | Promise 链 | 统一处理链中所有错误 | 链过长时可读性下降 |
| `.then(onF, onR)` | 需要区分成功失败逻辑 | 逻辑分离清晰 | 无法捕获成功回调中的异常 |
| `async/await + try...catch` | 现代异步代码 | 写法清晰，像同步代码 | 需要 async 函数环境 |
| 回调内 try...catch | 传统异步回调 | 精确控制 | 代码嵌套 |

---

### 九、嵌套 try...catch

`try...catch` 支持嵌套，内层 `catch` 处理不了的异常会**向外层传播**：

```js
try {
  try {
    throw new Error('内部错误');
  } catch (err) {
    console.log('内层捕获:', err.message);
    throw err; // 重新抛出，让外层处理
  }
} catch (err) {
  console.log('外层捕获:', err.message);
}
```

---

### 十、实际应用场景

#### 1. 安全的 JSON 解析工具函数

```js
function safeParse(json, defaultValue = null) {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

const data = safeParse(localStorage.getItem('user'), {});
```

#### 2. 请求重试机制

```js
async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.log(`第 ${i + 1} 次请求失败`);
      if (i === retries - 1) throw err; // 最后一次仍失败，抛出
      await new Promise((r) => setTimeout(r, 1000 * (i + 1))); // 延迟重试
    }
  }
}
```

#### 3. 表单校验

```js
function validateForm(data) {
  try {
    if (!data.email) throw new Error('邮箱不能为空');
    if (!data.email.includes('@')) throw new Error('邮箱格式不正确');
    if (data.password.length < 6) throw new Error('密码至少 6 位');
    return { valid: true };
  } catch (err) {
    return { valid: false, message: err.message };
  }
}
```

#### 4. 资源清理（如文件操作）

```js
async function processFile(path) {
  let fileHandle;
  try {
    fileHandle = await openFile(path);
    const content = await fileHandle.read();
    return content.toUpperCase();
  } catch (err) {
    console.error('文件处理失败:', err);
  } finally {
    if (fileHandle) await fileHandle.close(); // 确保文件被关闭
  }
}
```

---

### 十一、注意事项与常见陷阱

#### 1. 不要吞掉异常

```js
// ❌ 错误：静默吞掉异常，问题无法追踪
try {
  doSomething();
} catch (err) {
  // 什么都不做
}

// ✅ 正确：至少记录日志
try {
  doSomething();
} catch (err) {
  console.error('doSomething 失败:', err);
}
```

#### 2. 避免过于宽泛的 catch

```js
// ❌ 不推荐：一个 try 包裹太多不相关的代码
try {
  const data = JSON.parse(raw);
  const result = processData(data);
  saveToDB(result);
} catch (err) {
  // 无法区分是哪一步出错
  console.error(err);
}

// ✅ 推荐：按逻辑分段处理
let data;
try {
  data = JSON.parse(raw);
} catch {
  console.error('数据格式错误');
  return;
}
try {
  const result = processData(data);
  saveToDB(result);
} catch (err) {
  console.error('处理失败:', err);
}
```

#### 3. finally 中不要写 return 或 throw

```js
// ❌ 错误：finally 中的 return 覆盖了 try 的返回值
function demo() {
  try {
    return 1;
  } finally {
    return 2; // 覆盖了
  }
}

// ✅ 正确：finally 只用于清理
function demo() {
  try {
    return 1;
  } finally {
    cleanup(); // 只做清理，不返回值
  }
}
```

#### 4. 异步代码必须用正确的捕获方式

```js
// ❌ 错误：try...catch 捕获不到 Promise 内部的 reject
async function demo() {
  try {
    fetch('/api/data'); // 忘记 await
  } catch (err) {
    console.log('不会执行');
  }
}

// ✅ 正确：await 才能让 try...catch 捕获
async function demo() {
  try {
    await fetch('/api/data');
  } catch (err) {
    console.log('捕获到:', err);
  }
}
```

#### 5. 循环中的 try...catch 注意性能

在**高性能场景**（如热循环）中，`try...catch` 可能影响引擎优化：

```js
// ⚠️ 在性能敏感的循环中，try...catch 可能阻止引擎优化
for (let i = 0; i < 1000000; i++) {
  try {
    doSomething(i);
  } catch (err) {
    // ...
  }
}

// ✅ 建议：把 try...catch 放在循环外部
try {
  for (let i = 0; i < 1000000; i++) {
    doSomething(i);
  }
} catch (err) {
  // ...
}
```

#### 6. Error 的跨域脚本限制

当引入的脚本来自**不同源**时，`catch` 中只能获取到 `Script error.`，无法获得详细错误信息。需要设置 `crossorigin` 属性才能获取详细信息：

```html
<script src="https://other-domain.com/app.js" crossorigin="anonymous"></script>
```

---

### 十二、总结

| 要点 | 说明 |
| --- | --- |
| **try** | 包裹可能抛出异常的代码，异常时中断执行 |
| **catch** | 接收并处理异常，可重新抛出 |
| **finally** | 无论是否异常都执行，用于清理资源 |
| **同步代码** | `try...catch` 可以直接捕获 |
| **异步回调** | 必须在回调内部使用 `try...catch` |
| **Promise** | 使用 `.catch()` 或 `async/await + try...catch` |
| **async/await** | `try...catch` 可以像同步代码一样捕获异步错误 |
| **最佳实践** | 不吞异常、finally 不 return、用 `instanceof` 区分错误类型 |
