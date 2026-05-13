# Blob、File、FileReader 详解

> **一句话概括**：这三个 API 用来在浏览器中处理文件，比如上传、预览、下载等操作。

---

## 通俗理解

```
┌─────────────────────────────────────────────────────────────┐
│                    三者关系图                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    Blob（二进制数据容器）                                      │
│         │                                                    │
│         │ 继承                                                │
│         ▼                                                    │
│    File（带文件名的 Blob，有文件名、修改时间等）                   │
│         │                                                    │
│         │ 被...读取                                           │
│         ▼                                                    │
│    FileReader（用来读取 Blob/File 的内容）                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**简单类比：**
- **Blob** = 一个装数据的「盒子」，只能看大小和类型
- **File** = 贴了标签的「盒子」，还有文件名和日期
- **FileReader** = 用来打开「盒子」查看内容的工具

---

## 一、Blob（二进制数据盒子）

### 1.1 什么是 Blob？

Blob（Binary Large Object）就是**二进制大对象**，可以理解为一个**装数据的容器**。

```
┌────────────────────────────┐
│         Blob 对象            │
├────────────────────────────┤
│  内容：Hello World           │  ← 存放的数据（可以是文本、图片等）
│  大小：11 字节               │  ← size 属性
│  类型：text/plain           │  ← type 属性（MIME 类型）
└────────────────────────────┘
```

### 1.2 创建 Blob

```javascript
// 基本写法
const blob = new Blob(['数据内容'], { type: 'text/plain' });

// 更多例子
// 1. 存储文本
const textBlob = new Blob(['你好世界'], { type: 'text/plain' });

// 2. 存储 HTML
const htmlBlob = new Blob(['<h1>标题</h1>'], { type: 'text/html' });

// 3. 存储 JSON
const jsonData = { name: '张三', age: 18 };
const jsonBlob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
```

### 1.3 Blob 的属性和方法

```javascript
const blob = new Blob(['Hello World'], { type: 'text/plain' });

// ============ 属性 ============
blob.size  // 11 - 数据大小（字节）
blob.type  // "text/plain" - 数据类型

// ============ 方法 ============
// 切片：截取一部分
blob.slice(0, 5)  // 截取前 5 个字节

// 读文本：把内容变成字符串（返回 Promise）
blob.text()       // Promise resolves to "Hello World"

// 读二进制：把内容变成 ArrayBuffer
blob.arrayBuffer()
```

### 1.4 常见 MIME 类型（文件类型）

| 你想处理 | MIME 类型怎么写 |
|---------|----------------|
| 纯文本 | `text/plain` |
| HTML 网页 | `text/html` |
| JSON 数据 | `application/json` |
| JPEG 图片 | `image/jpeg` |
| PNG 图片 | `image/png` |
| PDF 文档 | `application/pdf` |
| ZIP 压缩包 | `application/zip` |

---

## 二、File（带信息的文件对象）

### 2.1 什么是 File？

**File 继承自 Blob**，相当于给 Blob 加上了文件名和修改时间。

```
┌─────────────────────────────────┐
│          File 对象               │
├─────────────────────────────────┤
│  (继承自 Blob 的属性)              │
│  ├── 内容：文件数据                │
│  ├── 大小：1024 字节              │
│  └── 类型：image/jpeg            │
│                                  │
│  (File 独有的属性)                │
│  ├── 文件名：photo.jpg            │  ← name
│  └── 修改时间：2024-01-01         │  ← lastModified
└─────────────────────────────────┘
```

### 2.2 获取文件对象

实际开发中，我们很少手动创建 File 对象，而是通过用户操作获取：

```javascript
// ============ 方式1：通过 input 选择文件 ============
// HTML: <input type="file" id="fileInput">

const input = document.querySelector('#fileInput');

input.addEventListener('change', (e) => {
  const file = e.target.files[0];  // 获取第一个文件

  console.log('文件名:', file.name);
  console.log('文件大小:', file.size);
  console.log('文件类型:', file.type);
});

// ============ 方式2：拖拽上传 ============
const dropArea = document.querySelector('#drop-area');

// 阻止浏览器默认打开文件的行为
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
});

dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  console.log('拖拽的文件:', file);
});

// ============ 方式3：粘贴图片 ============
document.addEventListener('paste', (e) => {
  const items = e.clipboardData.items;
  for (let item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      console.log('粘贴的图片:', file);
    }
  }
});
```

---

## 三、FileReader（文件读取器）

### 3.1 什么是 FileReader？

FileReader 是用来**读取 File 或 Blob 内容**的工具。

```
┌─────────────────────────────────────────────────┐
│              FileReader 读取流程                  │
├─────────────────────────────────────────────────┤
│                                                  │
│   File/Blob ──→ FileReader ──→ 各种格式           │
│                     │                            │
│                     ├── readAsText()      → 文本  │
│                     ├── readAsDataURL()   → Base64│
│                     └── readAsArrayBuffer()→ 二进制│
│                                                  │
└─────────────────────────────────────────────────┘
```

### 3.2 三种常用读取方式

```javascript
const reader = new FileReader();
const file = /* 某个文件对象 */;

// ============ 方式1：读取为文本 ============
// 适用：txt、csv、json 等文本文件
reader.readAsText(file);
reader.onload = () => {
  console.log(reader.result);  // 文件内容（字符串）
};

// ============ 方式2：读取为 Data URL（Base64） ============
// 适用：图片预览
reader.readAsDataURL(file);
reader.onload = () => {
  console.log(reader.result);
  // "data:image/png;base64,iVBORw0KGgoAAAANS..."
  // 可以直接设置给 img 的 src
};

// ============ 方式3：读取为 ArrayBuffer ============
// 适用：二进制文件处理
reader.readAsArrayBuffer(file);
reader.onload = () => {
  console.log(reader.result);  // ArrayBuffer 对象
};
```

### 3.3 事件监听（处理读取过程）

```javascript
const reader = new FileReader();

// 1. 读取开始
reader.onloadstart = () => {
  console.log('开始读取...');
};

// 2. 读取中（显示进度）
reader.onprogress = (e) => {
  if (e.lengthComputable) {
    const percent = (e.loaded / e.total) * 100;
    console.log(`进度: ${percent.toFixed(1)}%`);
  }
};

// 3. 读取成功
reader.onload = (e) => {
  console.log('读取成功！内容:', e.target.result);
};

// 4. 读取失败
reader.onerror = () => {
  console.error('读取失败:', reader.error);
};

// 5. 读取结束（不管成功还是失败都会触发）
reader.onloadend = () => {
  console.log('读取结束');
};

// 开始读取
reader.readAsText(file);
```

---

## 四、实战案例

### 4.1 图片上传预览

```javascript
// HTML 结构
// <input type="file" id="upload" accept="image/*">
// <img id="preview" style="max-width: 300px;">

const upload = document.querySelector('#upload');
const preview = document.querySelector('#preview');

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  
  if (!file) return;
  
  // 验证是否是图片
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件！');
    return;
  }
  
  // 读取并显示
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;  // 设置图片 src
  };
  reader.readAsDataURL(file);
});
```

### 4.2 文件下载

```javascript
/**
 * 触发浏览器下载文件
 * @param {string|Blob} content - 文件内容
 * @param {string} filename - 文件名
 */
function downloadFile(content, filename) {
  // 1. 创建 Blob
  const blob = content instanceof Blob
    ? content
    : new Blob([content], { type: 'text/plain' });
  
  // 2. 创建下载链接
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  // 3. 触发下载
  a.click();
  
  // 4. 释放内存
  URL.revokeObjectURL(url);
}

// 使用示例
downloadFile('Hello World!', 'hello.txt');
downloadFile('{"name":"张三"}', 'data.json');
```

### 4.3 封装 Promise 版本的读取函数

```javascript
/**
 * 读取文件内容
 * @param {File} file - 文件对象
 * @param {string} method - 读取方式
 * @returns {Promise} 读取结果
 */
function readFile(file, method = 'readAsText') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    
    reader[method](file);
  });
}

// 使用 async/await
async function handleFile(file) {
  try {
    const text = await readFile(file);
    console.log('文件内容:', text);
  } catch (error) {
    console.error('读取失败:', error);
  }
}
```

### 4.4 导出 CSV 文件

```javascript
/**
 * 导出数据为 CSV 文件
 * @param {Array} data - 数据数组
 * @param {string} filename - 文件名
 */
function exportCSV(data, filename = 'export.csv') {
  if (!data.length) return;
  
  // 1. 获取表头
  const headers = Object.keys(data[0]);
  
  // 2. 构建 CSV 内容
  const rows = [
    headers.join(','),  // 表头行
    ...data.map(row =>   // 数据行
      headers.map(h => {
        const value = row[h] ?? '';
        // 如果有逗号或换行，用引号包裹
        return value.includes(',') || value.includes('\n')
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    )
  ];
  
  // 3. 添加 BOM 让 Excel 正确识别中文
  const csv = '﻿' + rows.join('\n');
  
  // 4. 下载
  downloadFile(csv, filename);
}

// 使用示例
const data = [
  { name: '张三', age: 25, city: '北京' },
  { name: '李四', age: 30, city: '上海' }
];
exportCSV(data, '用户列表.csv');
```

### 4.5 多文件上传

```javascript
/**
 * 读取多个文件
 * @param {FileList} files - 文件列表
 * @returns {Promise<Array>} 读取结果数组
 */
async function readMultipleFiles(files) {
  const promises = Array.from(files).map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => resolve({
        name: file.name,
        size: file.size,
        type: file.type,
        content: reader.result
      });
      
      reader.onerror = () => reject(new Error(`读取 ${file.name} 失败`));
      reader.readAsText(file);
    });
  });
  
  return Promise.all(promises);
}

// 使用
document.querySelector('input[multiple]').addEventListener('change', async (e) => {
  try {
    const results = await readMultipleFiles(e.target.files);
    console.log('所有文件:', results);
  } catch (error) {
    console.error('读取失败:', error);
  }
});
```

---

## 五、常用工具函数

```javascript
// ============ 文件大小格式化 ============
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

// ============ 获取文件扩展名 ============
function getExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}
// getExtension('photo.jpg') → 'jpg'
// getExtension('no-extension') → ''

// ============ 判断文件类型 ============
function isImage(file) {
  return file.type.startsWith('image/');
}

function isVideo(file) {
  return file.type.startsWith('video/');
}

// ============ MIME 类型与扩展名对应 ============
function getExtensionFromMime(mime) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'application/json': 'json',
  };
  return map[mime] || 'bin';
}
```

---

## 六、常见坑与注意事项

### 6.1 内存泄漏：Blob URL 要释放

```javascript
// ❌ 错误：不释放 URL
const url = URL.createObjectURL(blob);
img.src = url;
// 用完就不管了 → 内存泄漏！

// ✅ 正确：使用后释放
const url = URL.createObjectURL(blob);
img.src = url;
// 图片加载完成后释放
img.onload = () => URL.revokeObjectURL(url);
```

### 6.2 FileReader 是异步的

```javascript
// ❌ 错误：以为 result 立即可用
const reader = new FileReader();
reader.readAsText(file);
console.log(reader.result);  // null！还没读完

// ✅ 正确：通过事件获取结果
const reader = new FileReader();
reader.onload = () => {
  console.log(reader.result);  // 这里才有数据
};
reader.readAsText(file);
```

### 6.3 大文件不要一次性读取

```javascript
// ❌ 大文件一次性读取可能导致浏览器崩溃
reader.readAsText(largeFile);  // 文件太大，内存爆炸！

// ✅ 使用 stream 分块处理
async function processLargeFile(file) {
  const stream = file.stream();
  const reader = stream.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    // 每次处理一小块
    console.log('收到 chunk:', value.length, '字节');
  }
}
```

---

## 七、速查表

| 我想做什么 | 怎么做 |
|-----------|--------|
| 创建数据容器 | `new Blob(['内容'], { type: 'mime/type' })` |
| 获取文件信息 | `file.name` / `file.size` / `file.type` |
| 读取为文本 | `reader.readAsText(file)` |
| 图片转 Base64 | `reader.readAsDataURL(file)` |
| 创建下载链接 | `URL.createObjectURL(blob)` |
| 触发下载 | `<a download="文件名" href="...">` |
| 格式化文件大小 | 手动计算 B/KB/MB/GB |
| 获取文件扩展名 | `file.name.split('.').pop()` |

---

## 八、总结

```
┌─────────────────────────────────────────────────────────┐
│                    核心要点速记                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Blob   → 数据容器，有 size 和 type                      │
│  File   → 继承 Blob，多了 name 和 lastModified            │
│  FileReader → 读取工具，异步返回内容                       │
│                                                         │
│  记住：                                                  │
│  1. URL.createObjectURL 用完要释放                        │
│  2. FileReader 是异步的，用 onload 获取结果               │
│  3. 大文件考虑分块处理                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
