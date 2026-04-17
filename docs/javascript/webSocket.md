### WebSocket 详解
* WebSocket 是一种在单个 TCP 连接上提供**全双工通信**的协议(即双向通信)。
### 一。WebSocket 与 HTTP 的区别
|特性|HTTP|WebSocket|
|:--:|:--:|:--:|
|通信模式	|单向：客户端请求，服务器响应	|全双工：双方随时可发送数据|
|连接建立	|每次请求**都要三次握手（短连接）**|	一次 HTTP 升级握手，维持**长连接**|
|头部开销	|每次请求携带冗长的头部	|少量控制帧，数据帧极轻量|
|实时性	|需轮询或长轮询，延迟高	|无额外延迟，服务端可主动推送|
|二进制支持	|需 base64 或 chunked	|原生支持二进制帧|
### 二. WebSocket API（浏览器端）
```javascript
// 1. 创建连接（注意使用 ws:// 或 wss:// 协议）
const ws = new WebSocket('ws://localhost:8080/chat');

// 2. 事件监听
ws.onopen = () => {
  console.log('连接已建立');
  ws.send('Hello Server!');   // 发送文本
};

ws.onmessage = (event) => {
  console.log('收到消息:', event.data); // data 可以是字符串或 Blob/ArrayBuffer
};

ws.onerror = (error) => {
  console.error('连接错误:', error);
};

ws.onclose = (event) => {
  console.log('连接关闭，code:', event.code, 'reason:', event.reason);
  // 可在这里尝试重连
};

// 3. 发送二进制数据
const buffer = new ArrayBuffer(8);
ws.send(buffer);

// 4. 主动关闭连接
ws.close(1000, '正常关闭');
```
#### 1. `ws.onopen`
执行时机：当 `WebSocket` 连接成功建立（即 HTTP 升级握手完成）后立即执行
* 此时 `ws.readyState` 变为 `WebSocket.OPEN`（值为 1）
* 表明客户端已经可以与服务器进行双向通信，可以安全地调用 `ws.send()` 发送数据
* 如果连接失败（如网络问题、服务器拒绝、协议错误等），`onopen` 不会执行，而会触发 `onerror` 或 `onclose`
```js
ws.onopen = () => {
  console.log('连接已打开，可以发送消息');
  ws.send('Hello Server');
};
```
#### 2. `ws.onmessage`
执行时机：当 WebSocket 接收到一个完整的消息帧（从服务器推送的数据）时执行
* 消息可以是文本（`event.data` 为字符串）或二进制（`event.data` 为 `Blob` 或 `ArrayBuffer`，取决于 `binaryType` 设置）
* 该事件只在连接处于 `OPEN` 状态时触发。若连接已关闭或尚未打开，不会触发
> 注意：即使连接因网络波动即将关闭，只要在关闭前完整收到了一个消息，onmessage 仍会执行
```js
ws.onmessage = (event) => {
  console.log('收到消息:', event.data);
};
```
#### 3. `ws.onerror`
执行时机：当 WebSocket 连接发生不可恢复的错误时执行
* 常见错误场景: 
  - 网络中断（如 WiFi 断开、服务器宕机）
  - 无法完成握手（HTTP 升级失败，如 404、500、协议不支持）
  - 连接中途因协议违规（如非法的帧数据）而被迫关闭
  - DNS 解析失败、端口不可达
  > 注意：event 对象不提供详细的错误描述（出于安全考虑），只能用于触发逻辑
```js
ws.onerror = (error) => {
  console.error('WebSocket 错误', error);
  // 此时 readyState 可能已变为 CLOSING 或 CLOSED
};
```
#### 4. `ws.onclose`
执行时机：当 WebSocket 连接完全关闭后执行
* 触发场景:
  - 客户端主动调用 `ws.close()`
  - 服务器主动关闭连接（发送关闭帧）
  - 网络故障导致连接异常断开（此时 onerror 会先触发，然后 onclose 触发）
  - 页面关闭或刷新（浏览器会自动关闭所有 WebSocket 连接）
* 回调接收一个 `CloseEvent` 对象，包含: 
  - `code：`关闭码（如 1000 正常关闭，1006 异常关闭）
  - `reason：`关闭原因（字符串）
  - `wasClean：`布尔值，`true` 表示**正常关闭**（双方交换了关闭帧），`false` 表示**异常断开**（如网络中断）
```js
ws.onclose = (event) => {
  console.log(`连接关闭，code=${event.code}, reason=${event.reason}, clean=${event.wasClean}`);
  // 可在此实现重连逻辑
};
```
### 三.` ws.onerror` 与 `ws.onclose` 的关系详解
> 💡 **提示：**   `onerror`的 `CloseEvent`<br/>
* `wasClean = true`:表示连接是**正常关闭**，双方交换了关闭帧。这种情况下 onerror 绝不会触发
* `wasClean = false`: 表示连接是**异常关闭**（code 通常为 1006，也可能是其他非标准值）。此时 onerror 通常会先触发（但并非绝对保证）
#### 1. 基本定义
|事件	|触发时机|	提供的信息|
|:--:|:--:|:--:|
|onerror|	连接发生不可恢复的错误时（如网络中断、握手失败、协议违规）|	仅表示“出错了”，无详细错误描述（安全限制）|
|onclose	|连接完全终止后（无论正常或异常）|	CloseEvent：code、reason、wasClean|
#### 2. 触发顺序的几种情形
##### 1. 正常关闭（双方协商）<br/>
* **[正常流程]  ws.close(1000)  →  onclose (code=1000, wasClean=true)**
  * 客户端调用 `ws.close()` 或服务器发送关闭帧
  * 不会触发 `onerror`
  * 直接触发 `onclose`，且 `wasClean = true`
##### 2. 异常断开（网络中断、服务器宕机、进程崩溃）
* **[异常流程]  网络断开 → onerror → onclose (code=1006, wasClean=false)**
  * 底层 TCP 连接意外丢失（没有收到关闭帧）
  * 浏览器检测到连接失效后，先触发 `onerror`（如果有错误信息），然后立即触发 `onclose`，且 `wasClean = false`
  * 实际测试中：`onerror` 几乎总是先于 `onclose`，但某些极少数实现可能只触发 `onclose`。为安全起见，不要把关键逻辑放在 `onerror` 中
##### 3. 握手阶段失败（如 HTTP 404、500、协议不支持）
  * 在连接尚未完全建立时就失败
  * `onopen` 永远不会触发
  * 某些浏览器会先触发 `onerror`，然后触发 `onclose`；有些浏览器可能只触发 `onclose`（code 为非 1000）。但总归 `onclose` 最终一定会触发
##### 4. 主动关闭过程中发生错误（罕见）
* 例如：调用 `ws.close()` 后，网络在发送关闭帧之前中断
* 表现类似于异常断开：`onerror` 可能触发，然后 `onclose（wasClean=false）`
#### 3. 最佳实践：如何利用这两个事件
> * 无论**正常**还是**异常关闭**，`onclose` 都会执行
> * `onerror`可能调用，也可能不掉用

✅ 正确做法
1. 重连逻辑写在 onclose 中;同时检查 `wasClean` 可以决定是否重连（例如 code=1000 时可能不需要立即重连
2. onerror 仅用于日志记录或统计，不要依赖它执行关键业务（如释放资源、重连），因为某些错误场景下它**可能不触发**
```javascript
ws.onclose = (event) => {
  if (!event.wasClean) {
    console.error(`连接异常关闭，code=${event.code}，尝试重连`);
    reconnect();
  } else {
    console.log(`正常关闭，不再重连`);
  }
};
ws.onerror = (err) => {
  console.warn('连接错误（详情未知）', err);
  // 这里只记录，实际重连由 onclose 负责
};
```
❌ 错误做法
* 在 `onerror` 中调用` ws.close()` —— 连接已经处于关闭或关闭中状态，无效
* 在 `onerror` 中立即重连 —— 可能导致多次重连（因为紧接着` onclose` 也会触发，会再次重连）
* 认为 `onerror` 一定会触发 —— 某些实现（如 iOS Safari 旧版本）在握手失败时只触发 `onclose`