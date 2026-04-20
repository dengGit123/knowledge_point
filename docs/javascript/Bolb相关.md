### 一。Blob
#### 1. 作用
* `Blob`表示一个不可变、原始数据的类对象。可以存任意类型的二进制数据(视频，音频，图片)或者文本数据。
* `Blob`是`File`的父类
#### 2. 构造方法
* `new Blob(parts, options)`
  * 1. `parts:` 必须，一个数组：元素可以是：
    * 字符串（会被 UTF-8 编码）
    * `ArrayBuffer`、`TypedArray`（如 `Uint8Array`）、`DataView`
    * 其他 `Blob` 对象
  * 2. `options:` 可选,对象,包含：
    * `type`: 字符串，表示生成的`Blob`的`MIME`类型(如 `'text/plain'`、`'image/png'`)。默认为空字符串。
    * `endings`:字符串，仅当 `parts` 包含字符串时有效，控制换行符的处理。可选 `'transparent'`（默认，保持原样）或 `'native'`（转换为操作系统换行符，很少使用）
```javascript
const textBlob = new Blob(['Hello, world!'], { type: 'text/plain' });
const jsonBlob = new Blob([JSON.stringify({ a: 1 })], { type: 'application/json' });
const htmlBlob = new Blob(['<div>test</div>'], { type: 'text/html' });
const mixedBlob = new Blob([textBlob, ' ', jsonBlob]); // 合并多个 Blob
```
#### 3. 实例属性
1. `blob.size`：只读，`Blob` 的字节长度
2. `blob.type：`只读，`Blob` 的 `MIME` 类型（如果构造时未指定则为空字符串）
#### 4. 实例方法
|方法|描述|参数|返回值|
|:--:|:--:|:--:|:--:|
|`slice([start], [end], [contentType])`|截取部分数据生成新 Blob|`start：`起始字节索引（默认 0）
`end：`结束字节索引（默认 size）
`contentType：`新 Blob 的 MIME 类型|新的 Blob 对象|
|`text()`|读取 Blob 内容为 UTF-8 字符串|无|`Promise<string>`|
|`arrayBuffer()`|读取 Blob 内容为 ArrayBuffer|无|`Promise<ArrayBuffer>`|
|`stream()`|返回一个可读流（ReadableStream）|无|ReadableStream|

示例：分块处理大文件
```javascript
const largeBlob = new Blob(['a'.repeat(10 * 1024 * 1024)]); // 10MB
const chunk = largeBlob.slice(0, 1024 * 1024); // 取前 1MB
console.log(chunk.size); // 1048576
```
示例：直接读取文本（无需 FileReader）
```javascript
const blob = new Blob(['你好'], { type: 'text/plain' });
const text = await blob.text(); // "你好"
```
### 二。File 对象
#### 1. 作用
* `File` 继承自 `Blob`，用于表示来自文件系统的**实际文件**（例如用户通过 `<input type="file">` 选择的文件，或拖拽产生的文件）。相比` Blob`，它增加了文件元数据：文件名和最后修改时间
#### 2. 获取 File 对象的方式

##### 方式一：通过 <input type="file">
```js
<input type="file" id="upload" multiple>
<script>
  document.getElementById('upload').onchange = (e) => {
    const fileList = e.target.files; // FileList 对象，类数组
    const firstFile = fileList[0];
    console.log(firstFile.name, firstFile.size, firstFile.type);
  };
</script>
```
##### 方式二：通过拖拽（Drag & Drop）
```js
dropZone.ondrop = (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  // 处理 file
};
```
##### 方式三：手动构造 File 对象
* new File(parts, filename, options)
  * `parts`: 同 `Blob` 构造函数的 `parts` 参数
  * `filename`: 字符串，文件名
  * `options`: 可选，对象，包含：
    * `type：``MIME` 类型（默认 ''）
    * `lastModified：`时间戳（毫秒），默认当前时间
```js
const file = new File(['content'], 'example.txt', { type: 'text/plain', lastModified: Date.now() });
console.log(file.name);        // "example.txt"
console.log(file.lastModified); // 时间戳
```
#### 3. 实例方法
因为继承自 `Blob`，所以 `File` 同样拥有 `slice()`, `text()`, `arrayBuffer()`, `stream()` 方法，可以直接异步读取内容。

### 三。FileReader —— 传统异步读取器
#### 1. 作用
`FileReader` 提供了一种基于事件模型的异步读取 `Blob` 或 `File `内容的方式
#### 2. 主要读取方法
|方法|说明|参数|
|:--:|:--:|:--:|
|`readAsArrayBuffer(blob)`|读取为 `ArrayBuffer`|`blob：`要读取的 `Blob `或 `File` 对象|
|`readAsText(blob, [encoding])`|读取为字符串|`blob：`要读取的 `Blob `或 `File` 对象,`encoding`：可选，编码名称（默认 'UTF-8'）|
|`readAsDataURL(blob)`|读取为 DataURL（Base64 编码）|`blob：`要读取的 `Blob `或 `File` 对象|
#### 3. 事件处理
`FileReader` 对象会触发以下事件，通过赋值监听器处理：
|事件|触发时机|
|:--:|:--:|
|onloadstart|开始读取时|
|onprogress|读取过程中周期性触发（可获取进度）|
|onload|读取成功完成|
|onerror|读取出错|
|onloadend|读取完成（无论成功或失败）|
|onabort|调用 abort() 方法中止读取时|
#### 4.实例属性（在事件回调中访问）
* `reader.result：`读取的结果。根据使用的读取方法不同，结果类型可能是 `ArrayBuffer`、字符串或 `DataURL`。只有在 `onload` **触发后有效**

#### 5. 示例：读取文本并显示进度
```js
const input = document.getElementById('fileInput');
input.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onprogress = (event) => {
    if (event.lengthComputable) {
      const percent = (event.loaded / event.total) * 100;
      console.log(`已读取 ${percent}%`);
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
#### 6. 示例：图片预览（使用 DataURL）
```js
const preview = document.getElementById('preview');
fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      preview.src = ev.target.result; // DataURL 可直接用于 img.src
    };
    reader.readAsDataURL(file);
  }
};
```
### 四。TextEncoder 与 TextDecoder
用于字符串与二进制数据(`Uint8Array`)之间的**互相转换**

#### 1. `TextEncoder`: 将字符串编码为 `UTF-8` 格式的 `Uint8Array`
  * `encode(string)`：接受一个字符串，返回一个 `Uint8Array`，其中包含 UTF-8 编码后的字节序列
  ```js
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode('Hello 世界');
  console.log(uint8Array); // Uint8Array(13) [72, 101, 108, 108, 111, 32, 228, 184, 150, 231, 149, 140]
  ```
  * `encodeInto(string, targetUint8Array)`：将字符串编码后写入已有的 `Uint8Array`（用于性能优化，避免分配新数组）。返回一个对象 `{ read, written }`，`read` 是已读取的字符数，`written` 是写入的字节数。
  ```js
    const encoder = new TextEncoder();
    const str = 'abc';
    const buffer = new Uint8Array(10);
    const result = encoder.encodeInto(str, buffer);
    console.log(result); // { read: 3, written: 3 }
    console.log(buffer.slice(0, result.written)); // Uint8Array [97, 98, 99]
  ```
#### 2. `TextDecoder`: 将 `Uint8Array` 或 `ArrayBuffer` **解码**为字符串

  ```js
     /** 
     * `encoding`：可选，字符串，指定解码的编码格式，默认 `'utf-8'`。支持 `'utf-8'`、`'gbk'`、'`shift-jis'` 等（具体取决于浏览器实现）
     * options：可选，对象，属性：
     *          fatal：布尔值，默认 false。如果为 true，遇到非法字节序列会抛出 TypeError；否则用替换字符 � 代替。
     *          ignoreBOM：布尔值，默认 false。是否忽略字节顺序标记（BOM）
    */
    new TextDecoder(encoding, options)
  ```
   * `decode(buffer, options)`方法：将二进制数据**解码**为字符串
      * `buffer`：可以是 `ArrayBuffer`、`TypedArray`（如 `Uint8Array`）、`DataView` 或包含此类对象的 `ArrayBufferView`。
      * `options`：可选对象，包含 `stream` 属性（布尔值）。当解码数据是流式分块时，设置 `{ stream: true }` 表示未结束，保留内部状态以处理跨块的多字节字符。
#### 示例：基本解码
```js
let utf8decoder = new TextDecoder(); // default 'utf-8' or 'utf8'

let u8arr = new Uint8Array([240, 160, 174, 183]);
let i8arr = new Int8Array([-16, -96, -82, -73]);
let u16arr = new Uint16Array([41200, 47022]);
let i16arr = new Int16Array([-24336, -18514]);
let i32arr = new Int32Array([-1213292304]);

console.log(utf8decoder.decode(u8arr));
console.log(utf8decoder.decode(i8arr));
console.log(utf8decoder.decode(u16arr));
console.log(utf8decoder.decode(i16arr));
console.log(utf8decoder.decode(i32arr));
```
#### 示例：流式解码（分块）
```js
const decoder = new TextDecoder('utf-8');
const chunk1 = new Uint8Array([0xE4, 0xBD]); // '你' 的前两字节
const chunk2 = new Uint8Array([0xA0]);        // '你' 的最后一字节
const partial = decoder.decode(chunk1, { stream: true }); // 返回空字符串（不完整）
const final = decoder.decode(chunk2);                     // 返回 "你"
console.log(partial + final); // "你"
```

### 五。 它们之间的关系与协同工作
#### 1. 继承关系
* `File` 继承自 `Blob`，因此所有能使用 `Blob` 的地方（如 `FileReader` 的方法）都可以使用 `File`
#### 2. 与 TextEncoder/Decoder 的配合
* 从 Blob 读取文本：可以直接使用 `blob.text()`，内部使用 `UTF-8` 解码，无需手动介入
* 自定义编码解码：如果 `Blob `不是 `UTF-8` 编码（例如 `GBK`），`blob.text()` 会乱码。此时需要先用 `blob.arrayBuffer()` 获取 `ArrayBuffer`，再使用 `TextDecoder` **指定正确编码解码**
```js
const buffer = await blob.arrayBuffer();
const decoder = new TextDecoder('gbk');
const text = decoder.decode(buffer);
```
* 将字符串存入 `Blob`：`new Blob([str], { type })` 内部会自动将字符串按 UTF-8 编码。如果需要其他编码，可先用 `TextEncoder` 编码为 `Uint8Array` 再存入
```js
const encoder = new TextEncoder();
const uint8Array = encoder.encode('你好');
const blob = new Blob([uint8Array], { type: 'text/plain' });
```
#### 3. 与流式处理的配合,适合超大文件，内存优化
`blob.stream()` 返回 `ReadableStream`，每个 `chunk` 是 `Uint8Array`。可以使用 `TextDecoder `的流式解码选项逐步拼接文本：
```js
const reader = file.stream().getReader();
const decoder = new TextDecoder('utf-8');
let result = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  result += decoder.decode(value, { stream: true });
}
result += decoder.decode(); // 完成解码
```
### 6. MIME 对应表
|扩展名|MIME 类型|
|:--:|:--:|
|.txt|text/plain|
|.html, .htm|text/html|
|.css|text/css|
|.js|text/javascript (或 application/javascript)|
|.json|application/json|
|.jpg, .jpeg|image/jpeg|
|.png|image/png|
|.gif|image/gif|
|.pdf|application/pdf|
|.zip|application/zip|
|.mp3|audio/mpeg|
|.mp4|video/mp4|