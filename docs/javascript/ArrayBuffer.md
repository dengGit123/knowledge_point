# ArrayBuffer 二进制数据处理指南

## 1. 什么是 ArrayBuffer？

### 简单理解

想象 `ArrayBuffer` 是一**排连续的储物柜**：

```
┌─────────────────────────────────────┐
│  [0]  [1]  [2]  [3]  [4]  ...  [15]  │  ← 16个字节的储物柜
└─────────────────────────────────────┘
   每个柜子只能存 0-255 的数字（1字节）
```

- 你不能直接往柜子里放东西，需要通过"管理员"（视图）来操作
- 一旦建好，柜子数量就固定了
- 多个管理员可以同时管理同一排柜子

### 定义

`ArrayBuffer` 是 JavaScript 中表示**固定长度原始二进制数据缓冲区**的对象，是处理二进制数据的核心基础。

### 核心特点

| 特点 | 说明 |
|------|------|
| 📦 固定长度 | 创建后大小不能改变，需预先指定字节数 |
| 🔒 原始存储 | 存储的是原始字节（0-255的整数） |
| 👀 间接操作 | 不能直接读写，必须通过"视图"来操作 |
| 🔄 可共享 | 多个视图可引用同一个 ArrayBuffer |

---

## 2. 创建 ArrayBuffer

```js
// 创建 16 字节的缓冲区
const buffer = new ArrayBuffer(16);
console.log(buffer.byteLength); // 16

// 创建时指定长度（单位：字节）
const buffer2 = new ArrayBuffer(32); // 32字节 = 256位

// 检查是否是 ArrayBuffer
console.log(buffer instanceof ArrayBuffer); // true
```

> 💡 **提示**：1 字节（Byte）= 8 位（bit），范围 0-255

---

## 3. 视图（View）：操作 ArrayBuffer 的方式

ArrayBuffer 本身像一排锁着的柜子，你需要用"钥匙"（视图）来打开它。

### 3.1 TypedArray（类型化数组）

最常用的视图，每种类型决定了如何解读字节：

```js
const buffer = new ArrayBuffer(16);

// ┌──────────────────────────────────────────────────┐
// │ 不同的视角，看到不同的数据                        │
// └──────────────────────────────────────────────────┘

// 16个 Int8（每个占1字节）
const int8View = new Int8Array(buffer);
console.log(int8View.length); // 16

// 8个 Int16（每个占2字节）
const int16View = new Int16Array(buffer);
console.log(int16View.length); // 8

// 4个 Int32（每个占4字节）
const int32View = new Int32Array(buffer);
console.log(int32View.length); // 4
```

#### 常用 TypedArray 类型

| 类型 | 每个元素大小 | 描述 |
|------|-------------|------|
| `Int8Array` | 1 字节 | 8位有符号整数 (-128 ~ 127) |
| `Uint8Array` | 1 字节 | 8位无符号整数 (0 ~ 255) |
| `Int16Array` | 2 字节 | 16位有符号整数 |
| `Uint16Array` | 2 字节 | 16位无符号整数 |
| `Int32Array` | 4 字节 | 32位有符号整数 |
| `Uint32Array` | 4 字节 | 32位无符号整数 |
| `Float32Array` | 4 字节 | 32位浮点数 |
| `Float64Array` | 8 字节 | 64位浮点数 |

```js
// 实际使用示例
const buffer = new ArrayBuffer(12);

// 以不同方式读写同一块内存
const uint8 = new Uint8Array(buffer);
const uint32 = new Uint32Array(buffer);

uint8[0] = 255;        // 写入单字节
uint8[1] = 128;

console.log(uint32[0]); // 2147559167 (四个字节组成的32位整数)
```

### 3.2 DataView（数据视图）

提供更灵活的读写方式，可以精确控制每个位置的数据类型：

```js
const buffer = new ArrayBuffer(16);
const view = new DataView(buffer);

// 写入不同类型的数据到不同位置
view.setInt8(0, 127);           // 位置0：写入8位整数
view.setUint16(2, 65535);       // 位置2：写入16位无符号整数
view.setFloat32(4, 3.14159);    // 位置4：写入32位浮点数

// 读取数据
console.log(view.getInt8(0));        // 127
console.log(view.getUint16(2));      // 65535
console.log(view.getFloat32(4));     // 3.14159
```

#### TypedArray vs DataView

| 对比项 | TypedArray | DataView |
|--------|-----------|----------|
| 性能 | ⚡ 更快 | 🐢 稍慢 |
| 灵活性 | 固定数据类型 | 可混合类型 |
| 字节序 | 使用系统默认 | 可指定字节序 |
| 使用场景 | 大量同类型数据 | 复杂数据结构 |

---

## 4. 字节序（Endianness）

字节序决定多字节值在内存中的存储顺序。

```
大端序（Big-Endian）        小端序（Little-Endian）
高位 → 低位                  低位 → 高位
┌────┬────┬────┬────┐       ┌────┬────┬────┬────┐
│ 12 │ 34 │ 56 │ 78 │       │ 78 │ 56 │ 34 │ 12 │
└────┴────┴────┴────┘       └────┴────┴────┴────┘
 地址递增 →                  地址递增 →

(以 0x12345678 为例)
```

```js
const buffer = new ArrayBuffer(4);
const view = new DataView(buffer);

// 默认大端序
view.setUint32(0, 0x12345678);
const uint8View = new Uint8Array(buffer);
console.log([...uint8View]); // [18, 52, 86, 120] 即 [0x12, 0x34, 0x56, 0x78]

// 小端序
view.setUint32(0, 0x12345678, true); // true = 小端
console.log([...uint8View]); // [120, 86, 52, 18] 即 [0x78, 0x56, 0x34, 0x12]
```

> 💡 **提示**：大多数现代 CPU 使用小端序，网络传输使用大端序

---

## 5. 常用属性和方法

### 5.1 ArrayBuffer 属性/方法

```js
const buffer = new ArrayBuffer(16);

// 属性
buffer.byteLength        // 16 - 缓冲区字节长度
buffer.isView            // function - 判断是否是视图

// 方法
buffer.slice(4, 12)      // 返回新的 ArrayBuffer（包含 4-12 字节）
```

### 5.2 TypedArray 属性

```js
const buffer = new ArrayBuffer(16);
const view = new Uint32Array(buffer);

view.buffer       // ArrayBuffer - 引用的原始缓冲区
view.byteLength   // 16 - 总字节长度
view.byteOffset   // 0 - 在 ArrayBuffer 中的偏移量
view.length       // 4 - 元素个数（16字节 ÷ 4字节/个）
```

---

## 6. 内存共享与复制

```js
// 🔗 共享内存 - 同一块数据，多个视角
const buffer = new ArrayBuffer(16);
const view1 = new Int32Array(buffer);
const view2 = new Int32Array(buffer);

view1[0] = 42;
console.log(view2[0]); // 42 - 修改会影响所有视图

// 📋 复制数据 - 独立的新副本
const source = new Uint8Array([1, 2, 3, 4, 5]);
const copy = new Uint8Array(source);
source[0] = 99;
console.log(copy[0]); // 1 - 不受原数组影响

// 🔄 使用 slice 复制部分
const partial = source.slice(1, 4); // [2, 3, 4]
```

---

## 7. 实际应用场景

### 7.1 图像像素处理

```js
// 创建一个 2x2 的 RGBA 图像缓冲区（每个像素4字节）
function createImageBuffer(width, height) {
    return new ArrayBuffer(width * height * 4);
}

const imageBuffer = createImageBuffer(2, 2); // 2x2 = 4像素 = 16字节
const pixels = new Uint8ClampedArray(imageBuffer);

// 设置第一个像素为红色 (R, G, B, A)
pixels[0] = 255;  // R
pixels[1] = 0;    // G
pixels[2] = 0;    // B
pixels[3] = 255;  // A

console.log(pixels); // [255, 0, 0, 255, 0, 0, 0, 0, ...]
```

### 7.2 文件读取

```js
// 读取文件为 ArrayBuffer
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

### 7.3 网络二进制数据传输

```js
// 发送二进制数据
async function sendBinary(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: data // ArrayBuffer 或 TypedArray
    });
    return response;
}

// 接收二进制数据
async function receiveBinary(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return buffer;
}
```

### 7.4 WebSocket 二进制通信

```js
const ws = new WebSocket('ws://example.com');

ws.binaryType = 'arraybuffer';

ws.onmessage = (event) => {
    if (event.data instanceof ArrayBuffer) {
        const view = new Uint8Array(event.data);
        console.log('收到二进制数据:', view);
    }
};

// 发送二进制数据
const buffer = new ArrayBuffer(4);
const view = new Uint8Array(buffer);
view[0] = 1, view[1] = 2, view[2] = 3, view[3] = 4;
ws.send(buffer);
```

---

## 8. 注意事项与最佳实践

### ⚠️ 注意事项

1. **大小限制**：ArrayBuffer 有最大大小限制（约 2GB），取决于浏览器
2. **内存泄漏**：使用完后及时解除引用
3. **边界检查**：访问越界不会报错，但返回 undefined
4. **类型一致**：同一 TypedArray 只能存储一种类型

### ✅ 最佳实践

```js
// ✅ 好的做法：指定偏移量和长度
const buffer = new ArrayBuffer(100);
const view = new Int32Array(buffer, 4, 10); // 从第4字节开始，10个元素

// ✅ 好的做法：使用 slice 复制需要的数据
const copy = buffer.slice(0, 10);

// ❌ 避免：直接访问未初始化的数据
const badView = new Int32Array(buffer);
console.log(badView[1000]); // undefined，没有错误提示
```

---

## 9. 与其他 API 的关系

```
ArrayBuffer
    │
    ├─► TypedArray ──► Canvas ImageData
    │                  WebGL buffers
    │
    ├─► DataView ──────► 复杂数据解析
    │
    └─► Blob/File ──────► FileReader
       (转换方法)        (文件读取)

       ArrayBuffer ↔ Uint8Array ↔ Base64/String
```

### 转换示例

```js
// ArrayBuffer ↔ Base64
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
```

---

## 10. 快速参考

```js
// 创建
const buffer = new ArrayBuffer(16);

// TypedArray 视图
const view = new Uint8Array(buffer);

// DataView 视图
const dataView = new DataView(buffer);

// 常用操作
view[0] = 255;                           // 写入
const value = view[0];                   // 读取
view.set([1, 2, 3]);                     // 批量设置
const subView = view.subarray(0, 4);     // 获取子视图
const copied = new Uint8Array(view);     // 复制

// ArrayBuffer 操作
buffer.byteLength                        // 获取长度
const sliced = buffer.slice(0, 8);       // 切片
```
