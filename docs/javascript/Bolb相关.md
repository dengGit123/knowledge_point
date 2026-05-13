# Blob、File 与二进制数据处理

## 目录

1. [Blob 对象](#1-blob-对象)
2. [File 对象](#2-file-对象)
3. [FileReader](#3-filereader)
4. [TextEncoder 与 TextDecoder](#4-textencoder-与-textdecoder)
5. [协同工作与最佳实践](#5-协同工作与最佳实践)
6. [MIME 类型速查表](#6-mime-类型速查表)

---

## 1. Blob 对象

### 1.1 什么是 Blob？

```
┌─────────────────────────────────────────┐
│            Blob (Binary Large Object)   │
├─────────────────────────────────────────┤
│  📦 不可变的原始数据容器                  │
│  📄 可以存储任何类型的数据                │
│     - 文本、JSON、HTML                    │
│     - 图片、音频、视频                    │
│     - 二进制文件                         │
└─────────────────────────────────────────┘
```

**简单理解**：Blob 就像一个**密封的箱子**，里面装着数据，你只能整体搬运或切分，不能直接修改里面的内容。

### 1.2 构造函数

```js
new Blob(parts, options)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `parts` | Array | 必须。包含数据的数组，元素可以是字符串、ArrayBuffer、TypedArray、其他 Blob |
| `options` | Object | 可选。`{ type: MIME类型, endings: 'transparent'/'native' }` |

```js
// 基础用法
const textBlob = new Blob(['Hello, world!'], { type: 'text/plain' });
const jsonBlob = new Blob([JSON.stringify({ a: 1 })], { type: 'application/json' });
const htmlBlob = new Blob(['<div>test</div>'], { type: 'text/html' });

// 合并多个 Blob
const mixedBlob = new Blob([textBlob, ' ', jsonBlob]);

// 从 ArrayBuffer 创建
const buffer = new Uint8Array([72, 101, 108, 108, 111]);
const bufferBlob = new Blob([buffer]);
```

### 1.3 实例属性

```js
const blob = new Blob(['Hello'], { type: 'text/plain' });

blob.size    // 5 - 字节长度（只读）
blob.type    // "text/plain" - MIME 类型（只读）
```

### 1.4 实例方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `slice(start, end, contentType)` | 截取部分数据生成新 Blob | 新的 Blob |
| `text()` | 读取为 UTF-8 字符串 | `Promise<string>` |
| `arrayBuffer()` | 读取为 ArrayBuffer | `Promise<ArrayBuffer>` |
| `stream()` | 返回可读流 | `ReadableStream` |

```js
// 分块处理大文件
const largeBlob = new Blob(['a'.repeat(10 * 1024 * 1024)]); // 10MB
const chunk = largeBlob.slice(0, 1024 * 1024); // 取前 1MB
console.log(chunk.size); // 1048576

// 直接读取文本（无需 FileReader）
const blob = new Blob(['你好'], { type: 'text/plain' });
const text = await blob.text(); // "你好"
```

---

## 2. File 对象

### 2.1 什么是 File？

```
        继承关系
    Blob (父类)
       │
       │ + name: 文件名
       │ + lastModified: 修改时间
       ▼
    File (子类)
```

**简单理解**：File 是一个**带标签的 Blob**，不仅有数据，还有文件名和修改时间等元信息。

### 2.2 获取 File 对象

#### 方式一：文件选择框

```html
<input type="file" id="upload" multiple>
<script>
  document.getElementById('upload').onchange = (e) => {
    const fileList = e.target.files; // FileList 对象（类数组）
    const firstFile = fileList[0];
    console.log(firstFile.name, firstFile.size, firstFile.type);
  };
</script>
```

#### 方式二：拖拽上传

```js
const dropZone = document.getElementById('dropZone');

dropZone.ondragover = (e) => e.preventDefault();
dropZone.ondrop = (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  console.log('拖拽的文件:', file.name);
};
```

#### 方式三：手动构造

```js
new File(parts, filename, options)
```

```js
const file = new File(
  ['content'],
  'example.txt',
  {
    type: 'text/plain',
    lastModified: Date.now()
  }
);

console.log(file.name);         // "example.txt"
console.log(file.lastModified); // 时间戳
console.log(file instanceof Blob); // true - File 也是 Blob
```

### 2.3 File 特有属性

| 属性 | 说明 | 类型 |
|------|------|------|
| `name` | 文件名（含扩展名） | string |
| `lastModified` | 最后修改时间戳 | number |
| `webkitRelativePath` | 文件相对路径（webkit 目录选择） | string |

### 2.4 继承的方法

因为继承自 Blob，File 同样拥有：
- `slice()`, `text()`, `arrayBuffer()`, `stream()`

---

## 3. FileReader

### 3.1 什么是 FileReader？

```
┌─────────────────────────────────────────┐
│           FileReader (传统方式)          │
├─────────────────────────────────────────┤
│  🔧 基于**事件模型**的异步读取器          │
│  📡 通过事件回调处理读取结果              │
│  🎯 适合需要监听读取进度的场景            │
└─────────────────────────────────────────┘
```

> ⚠️ **注意**：现在 Blob 有 `text()` 和 `arrayBuffer()` 方法，大多数场景下不再需要 FileReader。

### 3.2 读取方法

| 方法 | 说明 | result 类型 |
|------|------|-------------|
| `readAsArrayBuffer(blob)` | 读取为 ArrayBuffer | ArrayBuffer |
| `readAsText(blob, encoding)` | 读取为字符串 | string |
| `readAsDataURL(blob)` | 读取为 Base64 DataURL | string |

### 3.3 事件处理

| 事件 | 触发时机 |
|------|----------|
| `onloadstart` | 开始读取 |
| `onprogress` | 读取中（可获取进度） |
| `onload` | 读取成功 |
| `onerror` | 读取出错 |
| `onloadend` | 读取结束（无论成败） |
| `onabort` | 中止读取 |

### 3.4 实例属性

```js
reader.result    // 读取结果（onload 后有效）
reader.error     // 错误信息
reader.readyState // 读取状态：0/1/2
```

### 3.5 实战示例

#### 读取文本并显示进度

```js
const input = document.getElementById('fileInput');

input.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onprogress = (event) => {
    if (event.lengthComputable) {
      const percent = (event.loaded / event.total) * 100;
      console.log(`已读取 ${percent.toFixed(1)}%`);
    }
  };

  reader.onload = (ev) => {
    console.log('文件内容:', ev.target.result);
  };

  reader.onerror = () => {
    console.error('读取失败:', reader.error);
  };

  reader.readAsText(file, 'UTF-8');
};
```

#### 图片预览（DataURL）

```js
const preview = document.getElementById('preview');

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file?.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    preview.src = ev.target.result; // DataURL 直接用于 img.src
  };
  reader.readAsDataURL(file);
};
```

---

## 4. TextEncoder 与 TextDecoder

### 4.1 它们是什么？

```
┌─────────────────────┐         ┌─────────────────────┐
│   TextEncoder       │         │   TextDecoder       │
├─────────────────────┤         ├─────────────────────┤
│  字符串 → Uint8Array │         │  Uint8Array → 字符串  │
│  (UTF-8 编码)       │         │  (UTF-8 解码)       │
└─────────────────────┘         └─────────────────────┘
```

### 4.2 TextEncoder

将字符串编码为 UTF-8 格式的 Uint8Array。

```js
const encoder = new TextEncoder();

// 基础编码
const uint8Array = encoder.encode('Hello 世界');
console.log(uint8Array);
// Uint8Array(13) [72, 101, 108, 108, 111, 32, 228, 184, 150, 231, 149, 140]

// 高性能：写入已有数组
const buffer = new Uint8Array(10);
const result = encoder.encodeInto('abc', buffer);
console.log(result);  // { read: 3, written: 3 }
```

### 4.3 TextDecoder

将 Uint8Array 或 ArrayBuffer 解码为字符串。

```js
// 构造函数
new TextDecoder(encoding, options)
```

| 参数 | 说明 |
|------|------|
| `encoding` | 编码格式，默认 'utf-8'。支持 'gbk', 'shift-jis' 等 |
| `options.fatal` | 是否在非法字节时抛错，默认 false |
| `options.ignoreBOM` | 是否忽略 BOM，默认 false |

```js
// 基础解码
const decoder = new TextDecoder();
const u8arr = new Uint8Array([240, 160, 174, 183]);
console.log(decoder.decode(u8arr)); // "𠮷"

// 处理 GBK 编码
const gbkDecoder = new TextDecoder('gbk');
const gbkText = gbkDecoder.decode(gbkBuffer);
```

### 4.4 流式解码

适合处理分块传输的数据：

```js
const decoder = new TextDecoder('utf-8');
const chunk1 = new Uint8Array([0xE4, 0xBD]); // '你' 的前两字节
const chunk2 = new Uint8Array([0xA0]);        // '你' 的最后一字节

// stream: true 表示数据未结束，保留内部状态
const partial = decoder.decode(chunk1, { stream: true }); // ""（不完整）
const final = decoder.decode(chunk2);                     // "你"

console.log(partial + final); // "你"
```

---

## 5. 协同工作与最佳实践

### 5.1 API 选用指南

```
                    需要读取 Blob/File
                          │
         ┌────────────────┴────────────────┐
         │                                 │
    需要？                            不需要
   显示进度                          直接读取
         │                                 │
    FileReader                    blob.text()
         │                        blob.arrayBuffer()
         │                                 │
    readAsText()                       ┌────┴────┐
    readAsDataURL                需要指定编码？   否
                                     │           │
                                  是          直接使用
                                     │           │
                            TextDecoder       blob.text()
                            ('gbk'等)
```

### 5.2 场景示例

#### 场景一：读取非 UTF-8 编码的文本文件

```js
// blob.text() 只能处理 UTF-8，GBK 会乱码
async function readTextFile(file, encoding = 'utf-8') {
  const buffer = await file.arrayBuffer();
  const decoder = new TextDecoder(encoding);
  return decoder.decode(buffer);
}

// 使用
const gbkText = await readTextFile(file, 'gbk');
```

#### 场景二：将字符串存入 Blob（指定编码）

```js
// new Blob([str]) 默认 UTF-8
// 如需其他编码，先用 TextEncoder
const encoder = new TextEncoder();
const uint8Array = encoder.encode('你好');
const blob = new Blob([uint8Array], { type: 'text/plain' });
```

#### 场景三：大文件流式处理（内存优化）

```js
async function processLargeFile(file) {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder('utf-8');
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // value 是 Uint8Array
    result += decoder.decode(value, { stream: true });
  }

  // 完成解码（处理可能剩余的字节）
  result += decoder.decode();
  return result;
}
```

#### 场景四：Blob 下载

```js
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url); // 释放内存
}

// 使用
const blob = new Blob(['Hello'], { type: 'text/plain' });
downloadBlob(blob, 'hello.txt');
```

#### 场景五：FormData 上传

```js
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  return response.json();
}
```

### 5.3 注意事项

| 问题 | 说明 | 解决方案 |
|------|------|----------|
| 内存泄漏 | `createObjectURL` 不会自动释放 | 用完调用 `URL.revokeObjectURL()` |
| 编码乱码 | 非 UTF-8 文件用 `blob.text()` | 用 `TextDecoder` 指定编码 |
| 大文件卡顿 | 一次性读取大文件 | 使用 `stream()` 分块处理 |
| 类型错误 | MIME 类型不匹配 | 检查 `file.type` 或手动指定 |

---

## 6. MIME 类型速查表

### 常见文件类型

| 扩展名 | MIME 类型 |
|--------|-----------|
| `.txt` | `text/plain` |
| `.html`, `.htm` | `text/html` |
| `.css` | `text/css` |
| `.js` | `text/javascript` / `application/javascript` |
| `.json` | `application/json` |
| `.xml` | `application/xml` / `text/xml` |

### 图片类型

| 扩展名 | MIME 类型 |
|--------|-----------|
| `.jpg`, `.jpeg` | `image/jpeg` |
| `.png` | `image/png` |
| `.gif` | `image/gif` |
| `.webp` | `image/webp` |
| `.svg` | `image/svg+xml` |
| `.ico` | `image/x-icon` |

### 音视频类型

| 扩展名 | MIME 类型 |
|--------|-----------|
| `.mp3` | `audio/mpeg` |
| `.wav` | `audio/wav` |
| `.ogg` | `audio/ogg` |
| `.mp4` | `video/mp4` |
| `.webm` | `video/webm` |
| `.avi` | `video/x-msvideo` |

### 其他类型

| 扩展名 | MIME 类型 |
|--------|-----------|
| `.pdf` | `application/pdf` |
| `.zip` | `application/zip` |
| `.tar` | `application/x-tar` |
| `.rar` | `application/vnd.rar` |
| `.doc` | `application/msword` |
| `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `.xls` | `application/vnd.ms-excel` |
| `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |

---

## 7. 快速参考

```js
// === Blob ===
const blob = new Blob(['data'], { type: 'text/plain' });
blob.size           // 字节长度
blob.type           // MIME 类型
blob.slice(0, 5)    // 截取
await blob.text()   // 读为字符串
await blob.arrayBuffer() // 读为 ArrayBuffer
blob.stream()       // 获取流

// === File ===
file.name               // 文件名
file.lastModified       // 修改时间
// 继承 Blob 的所有方法

// === FileReader ===
const reader = new FileReader();
reader.onload = (e) => console.log(e.target.result);
reader.readAsText(blob);      // 读为文本
reader.readAsDataURL(blob);   // 读为 DataURL
reader.readAsArrayBuffer(blob); // 读为 ArrayBuffer

// === TextEncoder/Decoder ===
new TextEncoder().encode('str')     // 字符串 → Uint8Array
new TextDecoder('utf-8').decode(bytes) // Uint8Array → 字符串

// === 下载 Blob ===
const url = URL.createObjectURL(blob);
a.href = url;
a.download = 'file.txt';
URL.revokeObjectURL(url); // 记得释放
```
