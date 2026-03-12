### 1. GeneratorFunction (生成器函数)
* 是一种特殊类型的函数，它返回一个``Generator``对象,能够控制函数的执行流程，可以暂停和恢复代码的执行。
```js
// 基本语法: function* 关键字,*前后可以有空格
 // 声明式
  function* generatorFunction() {
    yield 1;
    yield 2;
    yield 3;
  }

  // 函数表达式
  const generator = function*() {
    yield 'hello';
    yield 'world';
  };

  // GeneratorFunction 构造函数
  const GeneratorConstructor = new Function(
    'return function*() { yield 1; yield 2; }'
  )();
```

### 2. Generator对象
* 由``GeneratorFunction``返回的对象，它是一个迭代器对象。
* 提供了暂停和恢复执行的能力，通过`next()`方法可以逐个访问`Generator`函数中的值。
```js
function* exampleGenerator() {
    console.log('开始执行');
    yield 1;  // 暂停，返回 1
    console.log('继续执行');
    yield 2;  // 暂停，返回 2
    console.log('执行完成');
    return 3; // 结束，返回最终值
  }

  const gen = exampleGenerator(); // 创建 Generator 对象, 但不立即执行函数体里的代码；next() 方法会执行函数体里的代码,直到遇到 yield 暂停执行

  // Generator 方法
  console.log(gen);           // Generator 对象
  console.log(gen.next());    // { value: 1, done: false }
  console.log(gen.next());    // { value: 2, done: false }
  console.log(gen.next());    // { value: 3, done: true }
  console.log(gen.next());    // { value: undefined, done: true }
```

### 3. Genertor的主要方法
* 1. `next([value])`: 继续执行Generator函数，直到遇到下一个yield表达式。
  * value参数会作为给上一个yield表达式的返回值。
  * 返回一个对象，包含两个属性：value（当前yield的值）和done（是否完成）。
```js
function* counter() {
    let count = 0;
    while (true) {
      const increment = yield count;
      count += increment || 1;
    }
  }

  const gen = counter();
  console.log(gen.next());     // { value: 0, done: false }
  console.log(gen.next(2));    // { value: 2, done: false } , 2 作为上一个yield的返回值，所以count变为2+1=3
  console.log(gen.next(5));    // { value: 7, done: false }
```
* 2. `return(value)`: 立即结束Generator函数的执行，并返回一个对象。
```js
function* range(start, end) {
    for (let i = start; i <= end; i++) {
      yield i;
    }
  }

  const gen = range(1, 5);
  console.log(gen.next());    // { value: 1, done: false }
  console.log(gen.next());    // { value: 2, done: false }
  console.log(gen.return(99)); // { value: 99, done: true }
  console.log(gen.next());    // { value: undefined, done: true }
```
* 3. `throw(error)`: 向Generator函数抛出一个错误。
```js

  function* errorGenerator() {
    try {
      yield 1;
      yield 2;
    } catch (error) {
      console.log('捕获异常:', error.message);
      yield 3;
    }
  }

  const gen = errorGenerator();
  console.log(gen.next());        // { value: 1, done: false }
  console.log(gen.throw(new Error('测试错误'))); // 捕获异常: 测试错误
  console.log(gen.next());        // { value: 3, done: false }
```
### 4. 使用场景
*  1. 惰性计算和序列生成
```js
  // 斐波那契数列生成器
  function* fibonacci() {
    let [a, b] = [0, 1];
    while (true) {
      yield a;
      [a, b] = [b, a + b];
    }
  }

  const fib = fibonacci();
  console.log(fib.next().value); // 0
  console.log(fib.next().value); // 1
  console.log(fib.next().value); // 1
  console.log(fib.next().value); // 2


   // 有限序列
  function* range(start, end) {
    for (let i = start; i <= end; i++) {
      yield i;
    }
  }

  console.log([...range(1, 5)]); // [1, 2, 3, 4, 5]
```
* 2. 异步流程控制
```js
 // 异步任务管理器
  function* asyncTaskManager() {
    try {
      const result1 = yield fetchData1();
      const result2 = yield fetchData2(result1);
      const result3 = yield fetchData3(result2);
      return result3;
    } catch (error) {
      console.error('异步任务失败:', error);
      throw error;
    }
  }

  // 模拟异步函数
  function fetchData1() {
    return new Promise(resolve =>
      setTimeout(() => resolve('数据1'), 1000)
    );
  }

  function fetchData2(data) {
    return new Promise(resolve =>
      setTimeout(() => resolve(data + ' -> 数据2'), 1000)
    );
  }

  function fetchData3(data) {
    return new Promise(resolve =>
      setTimeout(() => resolve(data + ' -> 数据3'), 1000)
    );
  }

  // 运行异步生成器的工具函数
  function runAsyncGenerator(gen) {
    const iterator = gen();

    function handle(result) {
      if (result.done) {
        return Promise.resolve(result.value);
      }

      return Promise.resolve(result.value)
        .then(data => handle(iterator.next(data)))
        .catch(error => handle(iterator.throw(error)));
    }

    return handle(iterator.next());
  }

  // 使用
  runAsyncGenerator(asyncTaskManager)
    .then(result => console.log('最终结果:', result))
    .catch(error => console.error('错误:', error));


```