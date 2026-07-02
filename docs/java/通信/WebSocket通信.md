### 一、概述

> 📖 [WebSocket（MDN）](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket) ｜ [Jakarta WebSocket 规范](https://jakarta.ee/specifications/websocket/)

WebSocket 是一种在**单个 TCP 连接上进行全双工通信**的协议。它解决了 HTTP「只能客户端发起请求、服务端无法主动推送」的问题。

大白话：

- **HTTP** 像「你问我才答」——客户端不问，服务端没法主动告诉你任何事
- **WebSocket** 像「接通的电话」——建立连接后，**双方随时可以说话**，服务端有新消息能立即推给你

典型应用：网页聊天、实时股价、在线协作文档、多人游戏、消息推送。

| 特性 | HTTP | WebSocket |
| --- | --- | --- |
| 通信方向 | 单向（客户端→服务端） | 双向（全双工） |
| 连接 | 每次请求新连接 / 短连接 | 长连接，保持 |
| 主动推送 | 不支持 | ✅ 服务端可主动推 |
| 开销 | 每次带完整头 | 握手后数据帧开销极小 |

---

### 二、核心原理

#### 1. 握手过程

WebSocket 连接从一个 **HTTP 请求**开始（带升级头），服务端同意后「升级」为 WebSocket 协议：

```
客户端                                服务端
  │ ── HTTP GET（Upgrade: websocket）──► │   ① 先用 HTTP 发起
  │ ◄──── 101 Switching Protocols ────── │   ② 服务端同意升级
  │                                       │
  │ ◄═══════ WebSocket 双向数据流 ═════► │   ③ 之后变成全双工
```

- 状态码 `101 Switching Protocols` 表示握手成功
- 握手后，通信不再走 HTTP，而是 WebSocket 自己的二进制分帧协议

#### 2. WebSocket vs HTTP 轮询

服务端要推送消息时，没有 WebSocket 之前只能这样：
- **短轮询**：客户端每隔几秒发一次请求问「有新消息吗？」—— 浪费大量无谓请求
- **长轮询**：请求挂着不返回，直到有消息 —— 改进但仍是 hack
- **WebSocket**：建一条持久连接，有消息服务端直接推 —— 真正的实时

---

### 三、客户端用法（浏览器）

前端（Vue 项目里也用这套）通过浏览器内置 `WebSocket` API 连接：

```javascript
// 1. 创建连接
const ws = new WebSocket('ws://localhost:8080/chat')
// 加密的用 wss://（类似 https）

// 2. 连接成功
ws.onopen = () => {
  console.log('连接已建立')
  ws.send('你好，服务端')   // 发送文本
}

// 3. 接收服务端消息
ws.onmessage = (event) => {
  console.log('收到: ' + event.data)
}

// 4. 出错
ws.onerror = (err) => {
  console.error('连接出错', err)
}

// 5. 关闭
ws.onclose = () => {
  console.log('连接已关闭')
}

// 主动发送消息
// ws.send(JSON.stringify({ type: 'chat', content: 'hello' }))
```

> 💡 **提示：** `ws://` 是明文，`wss://` 是加密的（类似 `http` vs `https`），生产环境用 `wss://`。

---

### 四、服务端用法（Java，Jakarta WebSocket）

Java 服务端用 **Jakarta WebSocket**（原 Java EE / JavaX WebSocket）规范。最常用的实现是 **注解驱动**。

#### 1. 引入依赖（以 Tomcat 内嵌或独立容器为例）

```xml
<!-- Jakarta WebSocket API -->
<dependency>
    <groupId>jakarta.websocket</groupId>
    <artifactId>jakarta.websocket-api</artifactId>
    <version>2.1.1</version>
    <scope>provided</scope>
</dependency>
```

> 💡 **提示：** WebSocket 服务端通常运行在 Servlet 容器里（Tomcat、Jetty、Undertow）。Spring Boot 项目可用 `spring-boot-starter-websocket`。

#### 2. 服务端端点（注解方式）

```java
import jakarta.websocket.*;
import jakarta.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

// @ServerEndpoint 定义服务端地址路径
@ServerEndpoint("/chat")
public class ChatEndpoint {

    // 用线程安全集合保存所有在线客户端（用于群发）
    private static final Set<Session> clients = new CopyOnWriteArraySet<>();

    // ① 客户端连接时
    @OnOpen
    public void onOpen(Session session) {
        clients.add(session);
        System.out.println("有人上线，当前在线: " + clients.size());
    }

    // ② 收到客户端消息时
    @OnMessage
    public void onMessage(String message, Session session) throws IOException {
        System.out.println("收到: " + message);
        // 群发给所有在线客户端
        for (Session client : clients) {
            if (client.isOpen()) {
                client.getBasicRemote().sendText("用户说: " + message);
            }
        }
    }

    // ③ 连接关闭时
    @OnClose
    public void onClose(Session session) {
        clients.remove(session);
        System.out.println("有人下线，当前在线: " + clients.size());
    }

    // ④ 出错时
    @OnError
    public void onError(Session session, Throwable error) {
        error.printStackTrace();
    }
}
```

四个核心注解对应连接的生命周期：

| 注解 | 触发时机 |
| --- | --- |
| `@OnOpen` | 客户端连上来 |
| `@OnMessage` | 收到客户端消息 |
| `@OnClose` | 客户端断开 |
| `@OnError` | 发生异常 |

#### 3. 服务端主动推送

WebSocket 的精髓就是**服务端不需要等客户端请求也能发消息**。比如有新公告，遍历所有 `Session` 推送：

```java
// 在任意业务代码中调用，主动推给所有客户端
public static void broadcast(String message) throws IOException {
    for (Session client : clients) {
        if (client.isOpen()) {
            client.getBasicRemote().sendText(message);
        }
    }
}
```

---

### 五、Spring Boot 整合 WebSocket（推荐）

实际 Java 后端项目多用 Spring Boot，整合步骤：

#### 1. 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

#### 2. 配置类

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

@Configuration
public class WebSocketConfig {
    // ✅ 这个 Bean 会自动注册 @ServerEndpoint
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
```

#### 3. 端点（和上面的 `ChatEndpoint` 写法一致）

`@ServerEndpoint` 标注的类由 Spring 容器管理，加上四个注解即可。前端连 `ws://localhost:8080/chat`。

---

### 六、进阶：心跳保活

TCP 连接长时间没数据可能被中间设备（路由器、防火墙）断掉。解决办法是定期发**心跳包**：

- **客户端**：每隔 30 秒发一条 ping 消息
- **服务端**：收到 ping 回 pong，或者定期检查最后活跃时间，超时就清理

```javascript
// 前端定时心跳
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send('ping')   // 心跳
  }
}, 30000)
```

> ⚠️ **注意：** 不做心跳，连接可能「假死」——你以为还连着，其实早断了。生产环境必须实现心跳和重连。

---

### 七、实际应用场景

| 场景 | 说明 |
| --- | --- |
| 即时通讯（IM） | 聊天室、客服系统、私聊 |
| 实时数据推送 | 股票行情、比赛比分、物流轨迹 |
| 协同编辑 | 多人文档、在线白板（配合 OT/CRDT） |
| 多人在线游戏 | 实时同步玩家状态 |
| 通知 / 告警 | 后台任务完成、监控报警实时弹出 |

---

### 八、常见问题与注意事项

#### 1. 连接断开没重连

网络抖动会导致断连，客户端必须有**自动重连**机制：

```javascript
ws.onclose = () => {
  setTimeout(() => {
    console.log('尝试重连...')
    // 重新创建 WebSocket 连接
  }, 3000)
}
```

#### 2. Session 线程安全

`Session` 集合要用线程安全容器（`CopyOnWriteArraySet`），因为并发连接/断开会同时修改。

#### 3. 群发时某个连接已失效

群发前务必判断 `client.isOpen()`，否则可能抛异常中断循环。

#### 4. 大消息 / 二进制

传图片、文件等二进制数据，用 `ByteBuffer` 或 `byte[]`，并在 `@OnMessage` 用对应类型接收。

#### 5. 鉴权

WebSocket 握手前是 HTTP，可借助 URL 参数或子协议（`Sec-WebSocket-Protocol`）传 Token。**不要在连接后明文传密码**。

---

### 九、与相关通信方式对比

| 方式 | 双向 | 主动推送 | 协议 | 适用场景 |
| --- | --- | --- | --- | --- |
| **HTTP** | ❌ | ❌ | 请求-响应 | 普通 API 调用 |
| **HTTP 长轮询** | 假双向 | 间接 | HTTP | 兼容老环境的妥协方案 |
| **WebSocket（本篇）** | ✅ | ✅ | 独立协议 | 实时双向通信 |
| **Socket（TCP）** | ✅ | ✅ | 自定义协议 | 非浏览器、自定义协议 |
| **SSE** | ❌ | ✅（仅服务端→客户端） | HTTP | 服务端单向推送（如通知） |

---

### 十、总结

- WebSocket 解决了 HTTP 不能主动推送的问题，实现**全双工长连接**
- 握手用 HTTP（`101` 升级），之后切换为 WebSocket 协议
- 客户端用浏览器 `WebSocket` API，服务端用 Jakarta WebSocket 注解（`@OnOpen` 等）
- Spring Boot 加 `spring-boot-starter-websocket` 即可快速集成
- 生产环境必备：**心跳保活**、**断线重连**、**鉴权**
- 适合聊天、推送、实时数据、协同编辑等场景
