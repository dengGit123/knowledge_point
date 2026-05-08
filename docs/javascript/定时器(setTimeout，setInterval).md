# JavaScript 定时器 (setTimeout, setInterval)

## 1. 定义

**`setTimeout`** - 在指定延迟后执行一次函数

**`setInterval`** - 按指定周期重复执行函数

## 2. 基本用法

```javascript
// setTimeout - 延迟执行
const timeoutId = setTimeout(() => {
  console.log('2秒后执行一次');
}, 2000);

// setInterval - 周期执行
const intervalId = setInterval(() => {
  console.log('每1秒执行一次');
}, 1000);

// 带参数的写法
setTimeout((name) => {
  console.log(`Hello ${name}`);
}, 1000, 'Alice');
```

## 3. 清除定时器

```javascript
clearTimeout(timeoutId);   // 清除 setTimeout
clearInterval(intervalId); // 清除 setInterval
```

## 4. 注意事项

| 问题 | 说明 |
|------|------|
| this 指向 | 箭头函数保持外层 this，普通函数会丢失 |
| 时间精度 | 实际延迟 ≥ 设定值（最小 4ms，event loop 导致） |
| setInterval 堆积 | 如果函数执行时间 > 间隔，回调会堆积 |
| 嵌套 setTimeout | 深度嵌套（>5次）会有最小 4ms 限制 |

### this 指向问题示例

```javascript
const obj = {
  name: 'Alice',
  // 箭头函数 - 正确绑定 this
  arrow: setTimeout(() => {
    console.log(this.name); // 'Alice'
  }, 1000),

  // 普通函数 - this 丢失
  normal: setTimeout(function() {
    console.log(this.name); // undefined
  }, 1000)
};
```

### setInterval 堆积问题

```javascript
// 危险：如果 doSomething() 执行超过 1秒，回调会堆积
setInterval(() => {
  doSomething(); // 执行耗时操作
}, 1000);

// 推荐：用 setTimeout 递归代替
function loop() {
  doSomething();
  setTimeout(loop, 1000); // 等执行完再调度下一次
}
```

## 5. 设置为 null 的作用

```javascript
let timer = setTimeout(fn, 1000);
timer = null; // 有什么用？
```

**作用：**

1. **释放引用** - 让定时器 ID 可被垃圾回收
2. **防止重复清除** - 配合检查使用
3. **语义化标记** - 表示定时器已失效

```javascript
// 实用模式：防止重复清除
function safeClear(timer) {
  if (timer) {
    clearTimeout(timer);
    timer = null; // 标记已清除
  }
}

// React 组件卸载时的典型用法
useEffect(() => {
  let timer = setTimeout(fn, 1000);

  return () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
}, []);
```

**注意**：设置为 `null` **不会自动清除定时器**，仍需手动调用 `clearTimeout/clearInterval`。

## 6. 常见面试题

### Q1: setTimeout 最小延迟是多少？

浏览器环境：最小 4ms（嵌套超过 5 次后）
Node.js 环境：最小 1ms

### Q2: setTimeout(fn, 0) 何时执行？

不是立即执行，而是进入宏任务队列，等待主线程和微任务执行完毕后才执行。

### Q3: 如何实现一个带取消功能的延迟函数？

```javascript
function delay(ms) {
  let timer = null;
  const promise = new Promise(resolve => {
    timer = setTimeout(resolve, ms);
  });

  promise.cancel = () => clearTimeout(timer);
  return promise;
}

const p = delay(1000);
// p.cancel(); // 需要取消时调用
