### 1. try...catch...finally
```js
try {
  // 可能抛出异常的代码
} catch (err) {
  // 捕获并处理异常
} finally {
  // 无论是否发生异常都会执行的代码（可选）
}
```
### 2. try块
1. 包含可能会抛出异常的代码
2. 如果`try`块中的代码抛出了异常，那么控制流会立即转向`catch`块（如果有的话）或者`finally`块（如果有，并且没有`catch`块则会抛出异常到外部）

 注意：
 * `try`块后面必须跟着**至少要有**`catch`块或`finally`块，或者两者都有
 * 如果`try块`中的代码是**异步的**（比如使用了`setTimeout`、`Promise`等），那么try-catch**无法捕获异步代码中抛出的异常**。对于异步代码，需要使用其他错误处理机制，例如Promise的.catch()方法或者async/await中的try-catch
```js
// 异步错误无法被捕获
// 对于异步代码，最好在异步代码**内部使用**try-catch，或者使用Promise的catch方法
try {
setTimeout(() => {
throw new Error('异步错误');
}, 1000);
} catch (error) {
console.error('捕获错误:', error); // 这里不会执行，因为异步错误在事件循环中抛出，无法被这里的catch捕获
}
```
### 3. catch块
1. 捕获`try`块中抛出的异常
2. 参数`err`（可以使用任何合法的标识符）包含了抛出的异常信息
3. 如果`try`块中没有抛出异常，则`catch`块不会执行
4. 在`catch`块中，你可以选择是否重新抛出异常。如果你无法处理该异常，可以重新抛出（使用throw err）让上层调用者处理。

注意：`catch`块是可选的，但是如果没有`catch`块，则必须要有`finally`块

### 4. finally块
1. 无论是否发生异常，finally块中的代码都会执行
2. 常用于清理资源（如关闭文件、释放数据库连接等）
3. 如果在try或catch块中抛出了另一个异常，则finally块仍然会先于新的异常被处理

注意：如果在finally块中有return语句，则会覆盖掉之前try/catch块的返回值。如果想保留之前的返回值，可以在finally块中使用`return;`而不是具体的值或者表达式。

### 示例
```js
function readFile(filename) {
  let data = null;
  try {
    data = fs.readFileSync(filename); // 可能抛出错误
    console.log('读取成功');
  } catch (err) {
    console.error(`无法读取${filename}: ${err.message}`);
  } finally {
    // 这里可以添加一些清理资源的操作
    console.log('这里是finally部分，无论是否有异常都会执行');
  }
  return data;
}
```
在这个例子中，如果尝试读取的文件不存在，那么将捕获到异常并打印一条错误消息，然后执行finally块中的内容。最后返回null表示没有数据可读。