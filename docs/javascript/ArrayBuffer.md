### 1. 什么是 ArrayBuffer？
* 一个表示通用、固定长度的原始**二进制数据缓冲区**的对象。javaScript 处理二进制数据的核心基础
#### 核心特点：
- 表示原始内存区域
- 固定长度，创建后大小不能改变
- 不能直接操作，需要通过"视图"来读写
- 存储的是原始字节（0-255的整数）
### 2. 创建 ArrayBuffer
```js
// 创建 16 字节的缓冲区
const buffer = new ArrayBuffer(16);
console.log(buffer.byteLength); // 16

// 创建时指定长度（单位：字节）
const buffer2 = new ArrayBuffer(32); // 32字节
```

### 3. 使用视图操作 ArrayBuffer
###### ArrayBuffer 本身不能直接读写，需要通过以下视图来操作：
1. `TypedArray`（类型化数组）
```js
const buffer = new ArrayBuffer(16);

// 不同的视图类型
const int8View = new Int8Array(buffer);     // 8位有符号整数
const uint8View = new Uint8Array(buffer);   // 8位无符号整数
const int16View = new Int16Array(buffer);   // 16位有符号整数
const uint16View = new Uint16Array(buffer); // 16位无符号整数
const int32View = new Int32Array(buffer);   // 32位有符号整数
const uint32View = new Uint32Array(buffer); // 32位无符号整数
const float32View = new Float32Array(buffer); // 32位浮点数
const float64View = new Float64Array(buffer); // 64位浮点数
```
2. `DataView`（数据视图）
###### DataView 提供了更灵活的方式来读写不同数据类型的值。
```js
const buffer = new ArrayBuffer(16);
const view = new DataView(buffer);

// 写入不同类型的数据
view.setInt8(0, 127);        // 在位置0写入8位整数
view.setUint16(2, 65535);    // 在位置2写入16位无符号整数
view.setFloat32(4, 3.14159); // 在位置4写入32位浮点数

// 读取数据
console.log(view.getInt8(0));     // 127
console.log(view.getUint16(2));   // 65535
console.log(view.getFloat32(4));  // 3.14159
```
### 4. 字节序（Endianness）
```js
const buffer = new ArrayBuffer(4);
const view = new DataView(buffer);

// 默认使用大端字节序（big-endian）
view.setUint32(0, 0x12345678);

// 读取字节
const uint8View = new Uint8Array(buffer);
console.log(uint8View[0]); // 0x12（大端：高位在前）
console.log(uint8View[1]); // 0x34
console.log(uint8View[2]); // 0x56
console.log(uint8View[3]); // 0x78

// 使用小端字节序
view.setUint32(0, 0x12345678, true); // 第三个参数为true表示小端
console.log(uint8View[0]); // 0x78（小端：低位在前）
console.log(uint8View[1]); // 0x56
console.log(uint8View[2]); // 0x34
console.log(uint8View[3]); // 0x12
```
### 5. 应用场景
1. 处理二进制数据
```js
// 创建一个表示RGB颜色的缓冲区
function createRGBColor(r, g, b, a = 255) {
    const buffer = new ArrayBuffer(4);
    const view = new Uint8Array(buffer);
    
    view[0] = r; // 红色
    view[1] = g; // 绿色
    view[2] = b; // 蓝色
    view[3] = a; // 透明度
    
    return buffer;
}

const redColor = createRGBColor(255, 0, 0);
```
2. 文件处理
```js
// 读取文件为ArrayBuffer
async function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        
        reader.readAsArrayBuffer(file);
    });
}

// 使用示例
document.querySelector('input[type="file"]').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const buffer = await readFileAsArrayBuffer(file);
    console.log(`文件大小: ${buffer.byteLength} 字节`);
});
```
3. 网络请求中的二进制数据
```js
// 发送二进制数据
async function sendBinaryData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream'
        },
        body: data
    });
    return response;
}

// 接收二进制数据
async function receiveBinaryData(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return buffer;
}
```

### 6. 常用属性和方法
#### ArrayBuffer 属性：
* `byteLength`: 只读，缓冲区的字节长度
* ArrayBuffer 方法：
   * `slice(begin, end):` 创建新的 ArrayBuffer，包含原缓冲区指定范围的数据
   ```js
   const buffer = new ArrayBuffer(16);
   const sliced = buffer.slice(4, 12); // 提取4-12字节
   console.log(sliced.byteLength); // 8
   ```
#### `TypedArray `常用属性：
- `buffer`: 引用的 ArrayBuffer
- `byteLength`: 字节长度
- `byteOffset`: 在 ArrayBuffer 中的偏移量
- `length`: 元素个数

### 7. 内存共享与复制
```js
// 共享内存（修改会影响所有视图）
const buffer = new ArrayBuffer(16);
const view1 = new Int32Array(buffer);
const view2 = new Int32Array(buffer);

view1[0] = 42;
console.log(view2[0]); // 42，两个视图共享同一内存

// 复制数据（创建新缓冲区）
const source = new Uint8Array([1, 2, 3, 4, 5]);
const copy = new Uint8Array(source); // 创建新的ArrayBuffer
source[0] = 99;
console.log(copy[0]); // 1，不受影响
```