### Promise
* 异步编程的解决方案
* 解决回调地狱
* 链式调用

### 1. Promise的状态
* 状态不可逆，一旦变为 `fulfilled`或`rejected`后不可更改
1. `pending`: 进行中，初始状态
2. `fulfilled`: 异步操作**成功**，执行then方法的第一个参数**回调函数**
3. `rejected`: 异步操作**失败**，执行catch方法的**回调函数**，或者then的第二个参数的**回调函数**

### 2. Promise的构造函数
* 接收一个函数，**立即同步执行**
```js
let p = new Promise((resolve,reject) => {
  //同步执行

})
```
* Promise的状态改变
1. resolve()
   * 1. 函数参数是一个**普通数据**(基本数据，普通对象)，得到的是一个 `fulfilled`(成功)的`Promise`
   * 2. `Promise`对象: 状态由参数Promise的状态决定
   * 3. 实现了`then`函数的对象：即 `{then: function(resolve,reject){}}`,状态分别由`resolve`，`reject`决定
2. reject()： 失败的Promise
3. 抛出异常: 失败的Promise
```js
let p = new Promise((resolve,reject) => {
  //1. resolve(普遍数据) --》 得到成功的Promise
  //1. resolve(Promise2对象) --》Promise2是成功的，得到的就是成功的Promise；  Promise2的状态是失败的，得到的就是失败的Promise
  //3. // resolve({
		  //then: function(resolve,reject){
			//resolve() //promise对象的状态为 fulfilled(已成功)
			//reject() //状态改为rejected(已失败)
		  // }
	    // })
  })
```
### 3. `.then`方法
* promise状态改变之后执行回调函数，**成功**执行第一个参数回调函数，**失败**执行第二个参数回调函数
* 得到一个新的Promise, 状态由**回调函数返回的结果**决定
* 可以链式调用
```js
let p = new Promise((resolve,reject) => {

})
p.then(() => {
  //1. 默认undefined,得到的是成功的Promise
  //2. return 普通数据，得到的是成功的Promise
  //3. return new Promise()promise对象， 状态由promise对象的状态决定
  //4. 抛出异常： 得到的是失败的Promise
},() => {
 //1. 默认undefined,得到的是成功的Promise
  //2. return 普通数据，得到的是成功的Promise
  //3. return new Promise()promise对象， 状态由promise对象的状态决定
  //4. 抛出异常： 得到的是失败的Promise
}).then(() => {
   //1. 默认undefined,得到的是成功的Promise
  //2. return 普通数据，得到的是成功的Promise
  //3. return new Promise()promise对象， 状态由promise对象的状态决定
  //4. 抛出异常： 得到的是失败的Promise
}).catch(() => {
   //1. 默认undefined,得到的是成功的Promise
  //2. return 普通数据，得到的是成功的Promise
  //3. return new Promise()promise对象， 状态由promise对象的状态决定
  //4. 抛出异常： 得到的是失败的Promise
})
```
1. 回调函数没有返回结果： 得到的是成功的Promise
2. 回调函数返回普通的数据： 得到的是成功的Promise
3. 回调函数返回的是 Promise对象:  得到的状态 由这个Promise对象的状态决定
### 4. `.catch`方法
* 错误状态执行回调函数
* 得到一个新的Promise,状态由返回结果决定
```js
let p = new Promise((resolve,reject) =>{
  reject(值)
})
let newP =  p.catch(() => {
   //1. 默认undefined,得到的是成功的Promise
  //2. return 普通数据，得到的是成功的Promise
  //3. return new Promise()promise对象， 状态由promise对象的状态决定
  //4. 抛出异常： 得到的是失败的Promise
})
```
### 5. `.finally`方法
* 成功还是错误都会执行

### 6. 静态方法
#### 1. `Promise.reject(参数)` : 得到失败的Promise;
#### 2. `Promise.resolve(参数)`: 得到新的Promise,状态由参数决定
  * 参数是**普通数据**， 状态是成功的Promise
  * 参数是**Promise**, 状态由**参数的Promise的状态**决定
#### 3. `Promise.all()`: 并行执行多个Promise，**全部成功**时返回成功的Promise,结果是一个数组；**任一失败则立即以该失败结果 reject**（其余 Promise 不会被取消，会照常执行完，只是结果被忽略）
#### 4. `Promise.race()`: 返回**最快**改变状态的**promise**，不管是成功还是失败

#### 5. `Promise.allSettled(iterable)`
等待所有 Promise 完成（无论成功失败），返回每个 Promise 的**结果描述数组**。与 `Promise.all` 不同，它**不会因为某个 Promise 失败而中断**。

```js
const results = await Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('出错'),
]);
console.log(results);
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: '出错' }
// ]
```

#### 6. `Promise.any(iterable)`
返回**最快成功**的那个 Promise 的结果。只有当**全部失败**时，才返回一个 `AggregateError`。

```js
const p1 = Promise.reject('失败1');
const p2 = new Promise((resolve) => setTimeout(() => resolve('成功'), 500));

Promise.any([p1, p2]).then((value) => {
  console.log(value); // '成功'
});
```

#### 静态方法对比

| 方法 | 成功条件 | 失败条件 | 典型场景 |
| --- | --- | --- | --- |
| `Promise.all` | 全部成功 | 任一失败 | 多个请求全部成功后才能继续 |
| `Promise.allSettled` | 总是成功（返回结果数组） | 永不失败 | 需要知道每个请求的最终结果 |
| `Promise.race` | 最快改变状态 | 最快改变状态（失败） | 请求超时控制 |
| `Promise.any` | 最快成功 | 全部失败 | 多个数据源取最快成功的 |

---

### 7. 实际应用场景

#### 1. 封装异步请求

```js
function request(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => {
        if (res.ok) resolve(res.json());
        else reject(new Error(`请求失败: ${res.status}`));
      })
      .catch(reject);
  });
}

// 使用
request('/api/user')
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

#### 2. 多个请求并行 + 统一处理结果

```js
// 同时请求用户信息和订单信息
Promise.all([fetchUser(), fetchOrders()])
  .then(([user, orders]) => {
    console.log('用户:', user);
    console.log('订单:', orders);
  })
  .catch((err) => {
    console.error('任一请求失败:', err);
  });
```

#### 3. 请求超时控制

```js
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('请求超时')), ms)
  );
  return Promise.race([promise, timeout]);
}

// 使用：3秒超时
withTimeout(fetch('/api/data'), 3000)
  .then((res) => console.log(res))
  .catch((err) => console.error(err.message)); // '请求超时'
```

#### 4. 链式处理（逐步加工数据）

```js
fetch('/api/user/1')
  .then((res) => res.json())       // 解析 JSON
  .then((user) => user.orders)     // 取出订单列表
  .then((orders) => orders.filter((o) => o.paid)) // 筛选已支付
  .then((paidOrders) => {
    console.log('已支付订单:', paidOrders);
  })
  .catch((err) => {
    console.error('流程中任一环节出错:', err);
  });
```

#### 5. 将回调函数 Promise 化（promisify）

```js
// 把 Node.js 风格的回调函数转为 Promise
function readFilePromise(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// 使用
readFilePromise('./config.json')
  .then((content) => console.log(content))
  .catch((err) => console.error('读取失败:', err));
```

#### 6. 与 `async/await` 配合使用

`async/await` 是 Promise 的语法糖，让异步代码看起来像同步代码：

```js
// Promise 链式写法
function getUser(id) {
  return fetch(`/api/user/${id}`)
    .then((res) => res.json())
    .then((user) => fetch(`/api/orders/${user.id}`))
    .then((res) => res.json());
}

// async/await 写法（更清晰）
async function getUser(id) {
  const userRes = await fetch(`/api/user/${id}`);
  const user = await userRes.json();
  const ordersRes = await fetch(`/api/orders/${user.id}`);
  return ordersRes.json();
}
```

> 💡 **提示：** `async` 函数**始终返回 Promise**，函数内 `return` 的值相当于 `resolve`，`throw` 相当于 `reject`。

---

### 8. 注意事项与常见陷阱

#### 1. 忘记 return 导致链式断裂

```js
// ❌ 错误：没有 return，下一个 .then 收到的是 undefined
p.then((value) => {
  fetch('/api'); // 返回值被丢弃
}).then((result) => {
  console.log(result); // undefined
});

// ✅ 正确：return 下一个 Promise
p.then((value) => {
  return fetch('/api'); // 返回值传递给下一个 .then
}).then((result) => {
  console.log(result); // fetch 的结果
});
```

#### 2. 没有错误处理导致静默失败

```js
// ❌ 错误：没有 catch，错误会被静默吞掉
fetch('/api/data').then((res) => res.json());

// ✅ 正确：始终加上 catch
fetch('/api/data')
  .then((res) => res.json())
  .catch((err) => console.error('请求失败:', err));
```

#### 3. 构造函数中异步错误不会自动 reject

```js
// ❌ 错误：异步回调中的 throw 不会触发 reject
new Promise((resolve, reject) => {
  setTimeout(() => {
    throw new Error('异步错误'); // 不会被捕获！
  }, 1000);
});

// ✅ 正确：在异步回调中调用 reject
new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error('异步错误')); // ✅ 正确
  }, 1000);
});
```

#### 4. `Promise.all` 的「一失败就全失败」问题

```js
// 如果希望每个请求独立处理，用 allSettled
const results = await Promise.allSettled([
  fetch('/api/a'),
  fetch('/api/b'),
  fetch('/api/c'),
]);

// 分别处理每个结果
results.forEach((result) => {
  if (result.status === 'fulfilled') {
    console.log('成功:', result.value);
  } else {
    console.log('失败:', result.reason);
  }
});
```

#### 5. 状态不可逆，多次 resolve 只有第一次生效

```js
new Promise((resolve, reject) => {
  resolve('第一次');
  reject('第二次'); // ❌ 无效
}).then((v) => console.log(v)); // '第一次'
```

#### 6. `then` 中抛出异常会触发后续的 `catch`

```js
Promise.resolve()
  .then(() => {
    throw new Error('then 中抛出');
  })
  .then(() => {
    console.log('不会执行');
  })
  .catch((err) => {
    console.log('捕获到:', err.message); // 'then 中抛出'
  });
```

#### 7. `finally` 的返回值陷阱

```js
// finally 返回的 Promise 状态通常跟随前面的 Promise
// 但如果 finally 中抛出异常或返回 rejected 的 Promise，会覆盖前面的状态
Promise.resolve('成功')
  .finally(() => {
    throw new Error('finally 出错');
  })
  .catch((err) => {
    console.log(err.message); // 'finally 出错'（覆盖了成功状态）
  });
```

#### 8. 避免 Promise 构造函数反模式

```js
// ❌ 反模式：在 Promise 内部嵌套已有的 Promise（多余的包装）
function getData() {
  return new Promise((resolve, reject) => {
    fetch('/api/data').then(resolve, reject); // 多余的包装
  });
}

// ✅ 正确：直接返回已有的 Promise
function getData() {
  return fetch('/api/data');
}
```