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
| 时间精度 | 实际延迟 ≥ 设定值（受事件循环繁忙程度影响；嵌套 ≥5 次后被浏览器节流到最小 4ms） |
| setInterval 堆积 | 如果函数执行时间 > 间隔，回调会堆积 |
| 嵌套 setTimeout | 深度嵌套（>5次）会有最小 4ms 限制 |

### this 指向问题示例

```javascript
const obj = {
  name: 'Alice',
  sayHi() {
    // 普通函数作为定时器回调 - this 丢失，指向 window（严格模式下是 undefined）
    setTimeout(function() {
      console.log(this.name); // ''（浏览器里 window.name 本身存在、值为空字符串；严格模式下这里会直接抛 TypeError）
    }, 1000);

    // 箭头函数 - 继承外层 sayHi 的 this（即 obj）
    setTimeout(() => {
      console.log(this.name); // 'Alice'
    }, 1000);
  }
};

obj.sayHi();
```

> ⚠️ **注意：** 箭头函数的 `this` 取决于**外层函数**。如果把箭头函数写在对象字面量顶层（不在普通函数里），它的 `this` 是所在作用域的 `this`（模块/脚本全局），并不指向对象本身。

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
// 实用模式：清除的同时置 null，并返回新值让调用方更新自己的变量
// （直接在函数里 timer = null 不影响外部变量——参数是按值传递的）
function safeClear(timer) {
  if (timer) {
    clearTimeout(timer);
  }
  return null;
}

let timer = setTimeout(fn, 1000);
timer = safeClear(timer); // 清除并把 timer 置为 null

// Vue 3 组件卸载时的典型用法
import { onMounted, onUnmounted } from 'vue';

let timer = null;

onMounted(() => {
  timer = setTimeout(fn, 1000);
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
  timer = null;
});
```

**注意**：设置为 `null` **不会自动清除定时器**，仍需手动调用 `clearTimeout/clearInterval`。

## 6. 常见面试题

### Q1: setTimeout 最小延迟是多少？

浏览器环境：嵌套超过 5 层后，最小 4ms
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
```
