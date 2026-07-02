### 一、概述

> 📖 [Java Socket（Oracle 官方教程）](https://docs.oracle.com/javase/tutorial/networking/sockets/)

Socket 通信是 Java 网络编程中**最基础、最核心**的能力。它基于 **TCP 协议**，提供**可靠、有序、面向连接**的双向数据传输。

大白话：Socket 就像在两台机器之间拉一根「电话线」，拨通（建立连接）之后，双方可以随时说话（收发数据），挂电话（关闭连接）后才结束。

涉及的三个核心类：

| 类 | 角色 | 说明 |
| --- | --- | --- |
| `ServerSocket` | 服务端 | 绑定端口，监听并接受连接 |
| `Socket` | 客户端 / 连接 | 发起连接，收发数据 |
| `InetAddress` | 地址 | 表示 IP 地址 |

---

### 二、核心原理

#### 1. 客户端 / 服务端模型

```
        服务端                                  客户端
   ServerSocket(8080)                       Socket(ip,8080)
        │  bind 绑定端口                            │
        │  accept() 阻塞等待 ◄──── 建立连接 ────────┤ connect
        │                                          │
        │  ◄───── 通过 InputStream 读数据 ─────────┤ getOutputStream 写
        │  getOutputStream 写 ────── 通过读 ─────► │ getInputStream 读
        │                                          │
        └──── close() ◄──── 断开连接 ──────────────┘ close()
```

#### 2. 流（Stream）的概念

Socket 通信的本质是**读写流**：

- 客户端的「输出流」连接到服务端的「输入流」
- 客户端的「输入流」连接到服务端的「输出流」
- 写文本用 `BufferedReader` / `PrintWriter`；写二进制用 `DataInputStream` / `DataOutputStream`；传对象用 `ObjectInputStream` / `ObjectOutputStream`

> 💡 **提示：** 一条 Socket 连接同时有输入流和输出流，所以可以双向通信（全双工）。

---

### 三、基本用法

#### 1. 服务端：`ServerSocket`

```java
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

public class SimpleServer {
    public static void main(String[] args) {
        // ✅ try-with-resources 自动关闭 ServerSocket
        try (ServerSocket serverSocket = new ServerSocket(8080)) {
            System.out.println("服务端启动，等待连接...");

            // accept() 会阻塞，直到有客户端连接，返回一个 Socket
            Socket client = serverSocket.accept();
            System.out.println("客户端已连接: " + client.getInetAddress());

            // 读取客户端发来的消息（注意指定 UTF-8 编码）
            BufferedReader in = new BufferedReader(
                new InputStreamReader(client.getInputStream(), "UTF-8"));
            String msg = in.readLine();              // 读一行
            System.out.println("收到: " + msg);

            // 给客户端回复
            PrintWriter out = new PrintWriter(
                new OutputStreamWriter(client.getOutputStream(), "UTF-8"), true);
            out.println("你好，我是服务端");          // true 表示自动 flush

            client.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

#### 2. 客户端：`Socket`

```java
import java.io.*;
import java.net.Socket;

public class SimpleClient {
    public static void main(String[] args) {
        // ✅ 指定服务端 IP 和端口
        try (Socket socket = new Socket("127.0.0.1", 8080)) {
            // 先写后读
            PrintWriter out = new PrintWriter(
                new OutputStreamWriter(socket.getOutputStream(), "UTF-8"), true);
            out.println("你好，我是客户端");

            // 读取服务端的回复
            BufferedReader in = new BufferedReader(
                new InputStreamReader(socket.getInputStream(), "UTF-8"));
            System.out.println("服务端回复: " + in.readLine());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

**运行顺序：** 先启动 `SimpleServer`，再启动 `SimpleClient`。

> 💡 **提示：** `PrintWriter` 的第二个参数 `true` 表示开启 **自动刷新**（autoflush）。调用 `println` 时会立即把数据发出去，否则数据可能还在缓冲区里，对方收不到。

---

### 四、进阶用法

#### 1. 服务端持续接收多个客户端（多线程）

上面的服务端只能处理一个客户端。实际应用中，服务端要能**同时服务多个客户端**，标准做法是：每来一个连接，就开一个线程处理。

```java
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

public class MultiThreadServer {
    public static void main(String[] args) throws IOException {
        try (ServerSocket serverSocket = new ServerSocket(8080)) {
            System.out.println("服务端启动...");
            while (true) {
                Socket client = serverSocket.accept();   // 每次接受一个连接
                // 每个客户端用一个新线程处理，互不阻塞
                new Thread(new ClientHandler(client)).start();
            }
        }
    }
}

// 处理单个客户端的任务
class ClientHandler implements Runnable {
    private final Socket socket;

    public ClientHandler(Socket socket) {
        this.socket = socket;
    }

    @Override
    public void run() {
        try (socket;
             BufferedReader in = new BufferedReader(
                 new InputStreamReader(socket.getInputStream(), "UTF-8"));
             PrintWriter out = new PrintWriter(
                 new OutputStreamWriter(socket.getOutputStream(), "UTF-8"), true)) {

            String line;
            // 循环读取，直到客户端断开（读到 null）
            while ((line = in.readLine()) != null) {
                System.out.println("收到: " + line);
                out.println("echo: " + line);     // 回显给客户端
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

> 💡 **提示：** 用线程池（`ExecutorService`）替代直接 `new Thread()`，能控制并发数量，避免连接过多时线程爆炸。这是生产环境的推荐做法。

#### 2. 传输二进制数据（文件传输）

```java
// 服务端接收文件
try (Socket socket = serverSocket.accept();
     InputStream in = socket.getInputStream();
     FileOutputStream fos = new FileOutputStream("received.jpg")) {

    byte[] buffer = new byte[4096];
    int len;
    // 一直读，直到流结束（返回 -1）
    while ((len = in.read(buffer)) != -1) {
        fos.write(buffer, 0, len);
    }
}
```

#### 3. 传输对象（需序列化）

```java
// 对象必须实现 Serializable
public class User implements Serializable {
    private String name;
    private int age;
    // 构造方法、getter/setter 略
}

// 发送端
try (Socket socket = new Socket("127.0.0.1", 8080);
     ObjectOutputStream oos = new ObjectOutputStream(socket.getOutputStream())) {
    oos.writeObject(new User("张三", 20));
}

// 接收端
try (ObjectInputStream ois = new ObjectInputStream(socket.getInputStream())) {
    User user = (User) ois.readObject();
}
```

> ⚠️ **注意：** 传对象依赖 Java 序列化。关于对象序列化的细节，参考 [[序列化和反序列化]]。

#### 4. 设置超时时间

网络不可靠，不能无限等待。设置超时是生产环境必备：

```java
Socket socket = new Socket();
// 连接超时：3 秒内连不上就放弃
socket.connect(new InetSocketAddress("127.0.0.1", 8080), 3000);
// 读超时：读取阻塞超过 5 秒抛出 SocketTimeoutException
socket.setSoTimeout(5000);
```

---

### 五、完整 API 参考

#### `ServerSocket` 常用方法

| 方法 | 说明 |
| --- | --- |
| `ServerSocket(int port)` | 创建并绑定到指定端口 |
| `ServerSocket(int port, int backlog)` | backlog 为等待队列长度 |
| `accept()` | 阻塞等待连接，返回 Socket |
| `setSoTimeout(int timeout)` | accept 的超时时间（毫秒） |
| `close()` | 关闭服务端 |

#### `Socket` 常用方法

| 方法 | 说明 |
| --- | --- |
| `Socket(String host, int port)` | 创建并立即连接 |
| `getInputStream()` | 获取输入流（读对方数据） |
| `getOutputStream()` | 获取输出流（写给对方） |
| `getInetAddress()` | 对方的 IP 地址 |
| `getPort()` | 对方的端口 |
| `setSoTimeout(int timeout)` | 读操作超时（毫秒） |
| `setKeepAlive(boolean)` | 开启 TCP 保活 |
| `close()` | 关闭连接 |

---

### 六、实际应用场景

| 场景 | 说明 |
| --- | --- |
| 自定义协议通信 | 公司内部两套系统用自定义报文格式通信 |
| 即时通讯（IM） | QQ、微信早期的消息收发底层就是长连接 Socket |
| 游戏服务器 | 实时性要求高、需要维持长连接 |
| 文件传输 | FTP、点对点文件传输的底层实现 |
| 数据库连接 | JDBC 连接数据库底层也基于 Socket |
| RPC 框架 | Dubbo、gRPC 底层传输都依赖 Socket |

---

### 七、常见问题与注意事项

#### 1. 不刷新缓冲区，对方收不到数据

```java
// ❌ 没 flush，数据可能还在缓冲区
PrintWriter out = new PrintWriter(new OutputStreamWriter(...));
out.print("hello");  // 用 print 不会自动刷新

// ✅ 开启 autoflush 用 println
new PrintWriter(new OutputStreamWriter(...), true);
out.println("hello");
```

#### 2. `readLine()` 阻塞读不到

`readLine()` 按行读取，**遇到换行符才返回**。如果发送方没用换行符结尾，接收方会一直阻塞。

```java
// ❌ 发送方没换行，接收方 readLine 会卡住
out.print("hello");

// ✅ 用 println，自动带换行
out.println("hello");
```

#### 3. 读取结束判断

网络流读到底（对方关闭输出）会返回 `-1`（字节流）或 `null`（`readLine`）。**不要用 `available()` 判断是否读完**，它在网络流上不可靠。

#### 4. 必须关闭资源

连接是系统稀缺资源，忘记关闭会导致**句柄泄漏**，最终报 `Too many open files`。始终用 try-with-resources。

#### 5. 中文乱码

务必在 `InputStreamReader` / `OutputStreamWriter` 显式指定 `UTF-8`。

---

### 八、与相关通信方式对比

| 方式 | 协议 | 特点 | 适用场景 |
| --- | --- | --- | --- |
| **Socket（本篇）** | TCP | 可靠长连接，自由度最高 | 自定义协议、长连接 |
| **DatagramSocket** | UDP | 无连接、快、可丢包 | 实时通信、广播 |
| **HttpClient** | HTTP | 请求-响应模式，无状态 | 调用 Web 接口 |
| **WebSocket** | TCP（应用层） | 全双工、服务端可推送 | 网页实时通信 |

详见 [[UDP通信]]、[[HTTP通信]]、[[WebSocket通信]]。

---

### 九、总结

- Socket 是基于 TCP 的可靠双向通信，是 Java 网络编程的基石
- 服务端用 `ServerSocket.accept()` 等待连接，客户端用 `Socket` 连接
- 数据通过**输入流 / 输出流**读写，注意指定编码和刷新缓冲
- 多客户端要用**多线程 / 线程池**处理，避免互相阻塞
- 生产环境务必设置**超时**、用 **try-with-resources** 关闭资源
