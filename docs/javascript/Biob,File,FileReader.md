### 1. Blob: 二进制大对象
#### Blob 创建
* new Blob(Array,options)
- `Array`: 数组，包含`Blob`对象、`ArrayBuffer`对象、`ArrayBufferView`对象或者`USVString`对象
- `options`: 可选，配置项
  - `type`: MIME类型
  - `endings`: 指定包含行结束符\n的字符串如何被写，可选`transparent`或`native`
    - `transparent`: 默认值，不转换,代表会保持blob中保存的结束符不变
    - `native`: 转换,代表行结束符会被更改为适合宿主操作系统文件系统的换行符
```js
let blob = new Blob([],{type:'text/plain'})
```
### MIME类型
|MIME类型|描述|
|---|---|
|text/plain|纯文本文件|
|text/html|HTML文件|
|text/css|CSS文件|
|text/javascript|JavaScript文件|
|image/gif|GIF图片文件|
|image/jpeg|JPEG图片文件|
|image/png|PNG图片文件|
|application/pdf|PDF文件|
|application/zip|ZIP压缩包文件|
|application/xml|XML文件|
|application/json|JSON文件|

### 2. Blob实例属性
1. size: 返回Blob对象的大小，单位为字节
2. type: 返回Blob对象的MIME类型，如果类型未知，则返回空字符串

### 3. Blob实例方法
1. slice(start,end,contentType): 返回一个新的Blob对象，包含原Blob对象中指定字节范围的内容
- `start`: 可选，开始位置（字节），默认为0
- `end`: 可选，结束位置（字节），默认为Blob对象的大小
- `contentType`: 可选，返回的Blob对象的MIME类型
```js
let blob = new Blob(['Hello, world!'],{type:'text/plain'})
let newBlob = blob.slice(0,5) // 返回一个新的Blob对象: Blob {size: 4, type: 'text/plain'}
```
2. text(): 返回一个Promise对象，该对象解析为包含Blob内容的文本
3. arrayBuffer(): 返回一个Promise对象，该对象解析为包含Blob内容的ArrayBuffer
4. stream(): 返回一个可读流，用于读取Blob内容

### 4. Blob与File
* `var myFile = new File(bits, name[, options]);`
     * `bits`: 文件内容: 一个包含文件内容的数组，每个元素可以是字符串、Blob对象或ArrayBuffer对象等。
     * `name`: 文件名: 文件的名称。
     * `options`: 可选，配置项
        - lastModified: 最后修改时间（毫秒）
        - lastModifiedDate: 最后修改日期对象
        - type: MIME类型
        - error: 错误信息
        - webkitRelativePath: 文件在文件系统中的相对路径
```js
let file = new File(['Hello, world!'],'example.txt',{type:'text/plain'})
```
* `File`对象继承自`Blob`

#### 获取File
1. 用户通过`<input type="file">`选择文件
```js
const inputEl = document.querySelector("#file")

inputEl.onchange = e => {
    const files = e.target.files // -- 获取到用户选择的文件列表
    console.log(files)
}
```
2. 通过拖拽文件到网页上
```js
const dropArea = document.querySelector("#drop-area")
// 进入拖放容器
drapArea.addEventListener("dragover", e => {
    e.preventDefault() // -- 阻止默认行为，防止页面跳转
})
// 在拖放容器中释放
dropArea.addEventListener("drop", e => {
    e.preventDefault() // -- 阻止默认行为，防止页面跳转
    const files = e.dataTransfer.files // -- 获取到拖拽的文件列表
    console.log(files)
})
```
### 5. FileReader 对象
#### 异步读取一个 File 或 Blob
1. 创建 FileReader 对象
```js
let reader = new FileReader()
```
2. 读取文件
```js
// 1. 读取为文本
reader.readAsText(file, encoding);

// 2. 读取为 Data URL (base64编码)
reader.readAsDataURL(file);

// 3. 读取为 ArrayBuffer (二进制数据)
reader.readAsArrayBuffer(file);

// 4. 读取为二进制字符串 (已废弃，不推荐使用)
reader.readAsBinaryString(file);
```
3. 主要事件
```js
const reader = new FileReader();

// 读取开始时触发
reader.onloadstart = function(event) {
    console.log('开始读取文件');
};

// 读取过程中周期性触发
reader.onprogress = function(event) {
    if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        console.log(`读取进度: ${percent}%`);
    }
};

// 读取成功完成时触发
reader.onload = function(event) {
    const result = event.target.result;
    console.log('读取完成:', result);
};

// 读取错误时触发
reader.onerror = function(event) {
    console.error('读取错误:', reader.error);
};

// 读取被中止时触发
reader.onabort = function(event) {
    console.log('读取被中止');
};

// 读取结束时触发（无论成功或失败）
reader.onloadend = function(event) {
    console.log('读取结束');
};
```
### 6. 示例
1. 使用 Promise 封装
```js
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        
        reader.readAsText(file);
    });
}

// 使用示例
document.getElementById('fileInput').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    try {
        const content = await readFileAsText(file);
        console.log('文件内容:', content);
    } catch (error) {
        console.error('读取失败:', error);
    }
});
```
2. 读取多个文件
```js
async function readMultipleFiles(files) {
    const readers = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                content: reader.result
            });
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    });
    
    return await Promise.all(readers);
}

// 使用示例
document.getElementById('multipleFiles').addEventListener('change', async function(e) {
    const files = e.target.files;
    const results = await readMultipleFiles(files);
    console.log('所有文件内容:', results);
});
```
3. 大文件分片读取
```js
function readFileInChunks(file, chunkSize = 1024 * 1024) { // 默认1MB
    return new Promise((resolve, reject) => {
        const chunks = [];
        const fileSize = file.size;
        let offset = 0;
        
        function readNextChunk() {
            const chunk = file.slice(offset, offset + chunkSize);
            const reader = new FileReader();
            
            reader.onload = (e) => {
                chunks.push(e.target.result);
                offset += chunkSize;
                
                if (offset < fileSize) {
                    // 继续读取下一块
                    readNextChunk();
                } else {
                    // 所有块读取完成
                    resolve(chunks);
                }
            };
            
            reader.onerror = reject;
            reader.readAsArrayBuffer(chunk);
        }
        
        readNextChunk();
    });
}
```