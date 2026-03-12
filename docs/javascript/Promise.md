### Promise
* 异步编程的解决方案
* 解决回调地狱
* 链式调用

### 1. Promise的状态
* 状态不可逆，一旦变为 `fullfilled`或`rejecte`后不可更改
1. `pendding`: 进行中，初始状态
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
### 3. then方法
* promise状态改变之后执行回调函数，**成功**执行第一个参数回调函数，**失败**执行第二个参数回调函数
* 得到一个新的Promise, 状态由**回调函数返回的结果**决定
* 可以链式调用
```js
let p = new Promise((resolve,reject) => {

})
p.then(() => {
  //1. 默认undefined,得到的是成功的Proise
  //2. return 普通数据，得到的是成功的Proise
  //3. return new Promise()promise对象， 状态由promise对象的状态决定
  //4. 抛出异常： 得到的是失败的Promise
},() => {
 //1. 默认undefined,得到的是成功的Proise
  //2. return 普通数据，得到的是成功的Proise
  //3. return new Promise()promise对象， 状态由promise对象的状态决定
  //4. 抛出异常： 得到的是失败的Promise
}).then(() => {
   //1. 默认undefined,得到的是成功的Proise
  //2. return 普通数据，得到的是成功的Proise
  //3. return new Promise()promise对象， 状态由promise对象的状态决定
  //4. 抛出异常： 得到的是失败的Promise
}).catch(() => {
   //1. 默认undefined,得到的是成功的Proise
  //2. return 普通数据，得到的是成功的Proise
  //3. return new Promise()promise对象， 状态由promise对象的状态决定
  //4. 抛出异常： 得到的是失败的Promise
})
1. 回调函数没有返回结果： 得到的是成功的Proise
2. 回调函数返回普通的数据： 得到的是成功的Promise
3. 回调函数返回的是 Promise对象:  得到的状态 由这个Promise对象的状态决定
```
### 4. catch返回
* 错误状态执行回调函数
```js
let p = new Promise((resolve,reject) =>{
  reject(值)
})
let newP =  p.catch(() => {
   //1. 默认undefined,得到的是成功的Proise
  //2. return 普通数据，得到的是成功的Proise
  //3. return new Promise()promise对象， 状态由promise对象的状态决定
  //4. 抛出异常： 得到的是失败的Promise
})
```
### 5. finally方法
* 成功还是错误都会执行

### 6. 静态方法
1. `Promise.reject(参数)` : 得到失败的Promise;
2. `Promise.resolve(参数)`: 得到新的Promise,状态由参数决定
  * 参数是**普通数据**， 状态是成功的Promise
  * 参数是**Promise**, 状态由**参数的Promise的状态**决定
3. `Promise.all()`: 并行执行多个Promise，**全部成功**时返回成功的Promise,结果是一个数组；**任一失败则立即终止**‌，错误的Promise 结果是失败的结果
4. `Promise.race()`: 返回**最快**改变状态的**promise**，不管是成功还是失败