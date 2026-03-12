### 1. async
* `async` 关键字用于声明一个异步函数
* 异步函数返回一个 `Promise`对象
  * 如果函数内部返回一个值,这个值会被自动包装成一个 `已解决（fulfilled）` 的 `Promise`
  * 如果函数内部返回一个Promise,返回的状态就是这个`Promise`的状态的`promise`对象
  * 如果函数内部抛出异常,这个异常会被自动包装成一个 `已拒绝（rejected）` 的 `Promise`
```js
// 异步函数
let result = async function() {
  // return 'hello' // 成功的promise， 相当于 return Promise.resolve('hello')
  // throw new Error('error') // 失败的promise， 相当于 return Promise.reject(new Error('error'))
  // return new Promise((resolve, reject) => {
  //   setTimeout(() => resolve('hello'), 1000)
  // }) // 相当于 return Promise.resolve(new Promise((resolve, reject) => {}))
}
// result是一个函数，返回一个Promise对象
//状态为: 
// 返回一个值： 成功的promise
//抛出异常： 失败的promise
//返回一个Promise： 这个promise的状态就是返回的promise的状态
console.log(result()) // Promise {}
```

### 2. await
* `await` 关键字只能在 `async` 函数内部使用
* `await` 关键字用于**等待**一个异步操作的结果
* `await` 关键字会**暂停当前函数的执行**，直到等待的异步操作完成,然后**继续执行当前函数的剩余部分**
```js
// await ’表达式‘
// await后面的表达式可以是一个Promise对象，也可以是任何其他值
// await后面的表达式如果不是Promise对象，会直接返回这个值
// await后面的表达式是成功的Promise，会等待这个Promise解决（fulfilled），然后返回这个promise的结果
// await后面的表达式是失败的Promise，会抛出异常，需要try...catch捕获
async function fetchData() {
  let result = await someAsyncOperation() // 暂停执行，等待异步操作完成
  console.log(result) // 继续执行剩余部分
}
```
### 3. 进阶用法
* 并行执行多个异步操作
```js
async function fetchInParallel() {
  // 同时启动两个请求，而不是一个接一个
  const promise1 = fetch('/api/data1');
  const promise2 = fetch('/api/data2');

  // 等待两个 Promise 都完成
  const [result1, result2] = await Promise.all([promise1, promise2]);

  console.log(result1, result2);
}
```
* 在循环中使用
在 for 循环中使用 await，它会按顺序执行。如果想并发，可以使用 Promise.all
```js
// 顺序执行
async function processArray(array) {
  for (const item of array) {
    await processItem(item); // 等上一个完成再处理下一个
  }
}

// 并发执行
async function processArrayConcurrent(array) {
  const promises = array.map(item => processItem(item));
  await Promise.all(promises); // 同时处理所有项，等待全部完成
}
```