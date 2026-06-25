# Socket 通信

> 📖 官方文档：[Oracle Java Sockets 教程](https://docs.oracle.com/javase/tutorial/networking/sockets/) | [Socket API](https://docs.oracle.com/en/java/javase/17/docs/api/java.net/java/net/Socket.html) | [ServerSocket API](https://docs.oracle.com/en/java/javase/17/docs/api/java.net/java/net/ServerSocket.html)
> 参考教程：[菜鸟教程 - Java Socket 编程](https://www.runoob.com/java/socket-programming.html)

---

## 一、概述

### 1. 什么是 Socket

**Socket（套接字）** 是应用程序与网络之间进行通信的"端点"，它是操作系统提供的一组编程接口（API），让程序员不用关心底层网络协议的细节，就能在两台机器之间收发数据。

通俗地说：**Socket 就是插在网络上的一个"插座"**。一台电脑插上插座（创建 Socket），另一台电脑也插上插座，中间用网线（TCP/UDP 协议）连起来，两个程序就能互相"通电"——收发数据。

```
   应用程序 A                                    应用程序 B
  ┌──────────┐                                 ┌──────────┐
  │  你的代码 │                                 │  对方代码 │
  └────┬─────┘                                 └────┬─────┘
       │ 读写数据（通过输入/输出流）                 │ 读写数据
  ┌────▼─────┐                                 ┌────▼─────┐
  │  Socket  │ ◄══════ TCP/UDP 网络 ═════════► │  Socket  │
  │ (端点 1) │       通过 IP + 端口连接          │ (端点 2) │
  └──────────┘                                 └──────────┘
```

### 2. 为什么需要 Socket

网络协议（TCP/IP）非常复杂——要处理握手、丢包重传、流量控制、拥塞控制等一堆问题。如果每个程序员都要手写这些逻辑，那简直是灾难。

**操作系统把这些复杂逻辑封装好，对外暴露出简洁的 Socket API**，开发者只需调用几个方法（连接、读、写、关闭），就能实现可靠的网络通信。所以 Socket 是**应用层访问传输层服务的桥梁**。

### 3. Socket 与 TCP / UDP 的关系

Socket 本身不是协议，而是**使用协议的工具**。一个 Socket 对应一种传输协议：

| Socket 类型             | 底层协议 | Java 核心类                          | 特点                     |
| ----------------------- | -------- | ------------------------------------ | ------------------------ |
| **流式 Socket（Stream）** | **TCP**  | `Socket` / `ServerSocket`            | 面向连接、可靠、字节流    |
| **数据报 Socket（Datagram）** | **UDP**  | `DatagramSocket` / `DatagramPacket`  | 无连接、不可靠、有消息边界 |

> 💡 **提示：** 本文重点讲解基于 **TCP** 的流式 Socket（`Socket` / `ServerSocket`），因为它是日常开发（HTTP、RPC、数据库连接）的主流。UDP 相关内容请参考 [网络编程.md](./网络编程.md) 第四节。

> 💡 **延伸阅读：** 本文是 [网络编程.md](./网络编程.md) 的 Socket 专项深入篇。网络基础（三要素、分层模型、TCP/UDP 原理）请先阅读该文档；高性能非阻塞 Socket（NIO 的 `SocketChannel`）请参阅 [NIO.md](./NIO.md)。

---

## 二、Socket 的核心概念

### 1. Socket 的本质：端点 + 文件描述符

在操作系统层面，一个 Socket 对应一个**文件描述符（File Descriptor，简称 fd）**。Linux 中"一切皆文件"，网络连接也不例外——读写 Socket 就像读写文件一样。

```
应用层视角                      操作系统视角
┌──────────┐                  ┌───────────────────┐
│ Socket   │  ─── 映射 ───►   │ 文件描述符 fd=5    │
│ 对象     │                  │ 内核接收/发送缓冲区 │
└──────────┘                  └───────────────────┘
```

这也解释了为什么 Socket 用完**必须关闭**（`close()`）——不关闭会导致文件描述符泄漏，连接数累积到上限后，服务器将无法再接受新连接。

### 2. 连接的四元组

一条 TCP 连接由**四元组**唯一确定：

```
( 梳IP, 源端口, 目的IP, 目的端口 )
```

这意味着：一个 `ServerSocket` 监听同一个端口（如 8080），可以同时与成千上万个客户端建立连接——因为每个连接的"源 IP + 源端口"不同，四元组各不相同。

> 💡 **提示：** 服务端用 `accept()` 每接受一个连接，就会**新建一个 Socket**（占用一个新的文件描述符），专门用来和这个客户端通信。原来的 `ServerSocket` 继续监听，等待下一个连接。

### 3. 流（Stream）的概念

TCP 的 Socket 提供**字节流**：数据像水流一样连续不断地传输，**没有消息边界**。

```
发送方:  写 "Hello" → 写 "World"
              ↓
TCP 网络传输:  [H][e][l][l][o][W][o][r][l][d]   （连在一起的字节流）
              ↓
接收方:  可能读到 "HelloWorld"（一次读完）
         也可能读到 "Hel"、"loWorld"（分多次读完）
```

这就是后面要重点讲的**粘包 / 拆包**问题的根源。因为流没有边界，应用层必须自己定义"一条消息从哪里开始、到哪里结束"。

---

## 三、Java Socket API 详解

### 1. Socket 类（客户端 / 已连接端）

`java.net.Socket` 表示一个**客户端 Socket**，用来主动连接服务器；服务端 `accept()` 返回的也是 `Socket`，用来和该客户端通信。

#### 常用构造器

| 构造器                                          | 说明                                       |
| ----------------------------------------------- | ------------------------------------------ |
| `Socket(String host, int port)`                 | 连接指定主机和端口（**会阻塞直到连接成功**）|
| `Socket(InetAddress address, int port)`         | 同上，用 `InetAddress` 指定地址            |
| `Socket()`                                      | 创建未连接的 Socket，稍后用 `connect()` 连接（**可设置连接超时**）|
| `Socket(String host, int port, InetAddress localAddr, int localPort)` | 同时指定本地绑定的地址和端口 |

#### 常用方法

| 方法                                       | 作用                                             |
| ------------------------------------------ | ------------------------------------------------ |
| `InputStream getInputStream()`             | 获取输入流，**读取**对方发来的数据               |
| `OutputStream getOutputStream()`           | 获取输出流，**发送**数据给对方                   |
| `InetAddress getInetAddress()`             | 获取对方（远程）的 IP 地址                       |
| `int getPort()`                            | 获取对方（远程）的端口号                         |
| `InetAddress getLocalAddress()`            | 获取本机的 IP 地址                               |
| `int getLocalPort()`                       | 获取本机的端口号                                 |
| `void connect(SocketAddress endpoint)`     | 连接服务器（用于无参构造的 Socket）              |
| `void connect(SocketAddress endpoint, int timeout)` | 连接服务器，**设置连接超时**（毫秒）        |
| `void setSoTimeout(int timeout)`           | 设置 **读操作超时**（毫秒），0 表示永不超时      |
| `void shutdownInput()` / `shutdownOutput()`| **半关闭**输入流 / 输出流（见第八节）            |
| `void close()`                             | 关闭 Socket（触发四次挥手）                      |
| `boolean isClosed()` / `isConnected()`     | 判断 Socket 是否已关闭 / 是否已连接              |

> ⚠️ **注意：** `new Socket(host, port)` 这种构造器会**立即尝试连接**，如果服务器没启动会**一直阻塞**或抛出异常。需要控制连接超时时，应使用无参构造 + `connect(addr, timeout)`。

### 2. ServerSocket 类（服务端）

`java.net.ServerSocket` 表示**服务端 Socket**，负责监听端口、等待并接受客户端连接。

#### 常用构造器

| 构造器                                  | 说明                                       |
| --------------------------------------- | ------------------------------------------ |
| `ServerSocket(int port)`                | 绑定指定端口并开始监听（默认队列长度 50）   |
| `ServerSocket(int port, int backlog)`   | 指定端口和连接请求队列的最大长度           |
| `ServerSocket(int port, int backlog, InetAddress bindAddr)` | 再指定绑定的本地网卡 IP（多网卡场景）|
| `ServerSocket()`                        | 创建未绑定的 ServerSocket，稍后 `bind()`    |

#### 常用方法

| 方法                                 | 作用                                               |
| ------------------------------------ | -------------------------------------------------- |
| `Socket accept()`                    | **阻塞等待**客户端连接，返回一个新的 Socket 与该客户端通信 |
| `void bind(SocketAddress addr)`      | 绑定到指定端口（用于无参构造）                     |
| `void setSoTimeout(int timeout)`     | 设置 `accept()` 的超时时间（毫秒）                 |
| `void setReuseAddress(boolean on)`   | 设置 `SO_REUSEADDR`，允许端口复用                  |
| `InetAddress getInetAddress()`       | 获取服务端绑定的 IP                                |
| `int getLocalPort()`                 | 获取监听的端口号                                   |
| `void close()`                       | 关闭 ServerSocket（停止监听）                      |

### 3. 数据传输：基于流的读写

Socket 通信的本质就是**通过输入流 / 输出流收发字节**。Java 提供了丰富的流组合来满足不同需求：

| 需求                         | 使用的流                                            |
| ---------------------------- | --------------------------------------------------- |
| 原始字节读写                  | `InputStream` / `OutputStream`                     |
| 按行读写文本                  | `BufferedReader` + `PrintWriter`                   |
| 读写基本类型（int、long…）    | `DataInputStream` + `DataOutputStream`             |
| 读写 Java 对象（序列化）      | `ObjectInputStream` + `ObjectOutputStream`         |
| 高效缓冲传输                  | `BufferedInputStream` + `BufferedOutputStream`     |

---

## 四、Socket 通信完整流程

### 1. 通信流程图

```
        客户端 (Socket)                         服务端 (ServerSocket)
        ────────────────                        ──────────────────────
  ┌─ 1. new Socket(host, port) ───┐    ┌─ 1. new ServerSocket(port) ─┐
  │   主动发起连接                 │    │   绑定端口，开始监听         │
  └────────────────────────────────┘    └─────────────────────────────┘
   (触发 TCP 三次握手)                            │
                                                 ▼ 2. accept() 阻塞等待
        ◄═══════════ 连接建立 ════════════════════►   返回新 Socket
        │                                                  │
        ▼ 3. getOutputStream()                             ▼ 3. getInputStream()
        ──────── 发送数据 ──────────────────────────────► 读取数据
        ◄─────── 接收数据 ◄────────────────────────────── 发送数据
        │                                                  │
        ▼ 4. close()                                       ▼ 4. close()
                  (触发 TCP 四次挥手，连接关闭)
```

### 2. 基础示例：一问一答

**服务端：**

```java
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

public class Server {
    public static void main(String[] args) {
        // ✅ try-with-resources 自动关闭 ServerSocket，防止资源泄漏
        try (ServerSocket serverSocket = new ServerSocket(8888)) {
            System.out.println("服务端启动，监听 8888 端口...");

            // ✅ accept() 阻塞，直到有客户端连接，返回与该客户端通信的 Socket
            Socket socket = serverSocket.accept();
            System.out.println("客户端已连接：" + socket.getInetAddress());

            // 用字符流按行读写（更方便处理文本）
            BufferedReader in = new BufferedReader(
                    new InputStreamReader(socket.getInputStream()));
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true); // true 表示自动刷新

            String msg = in.readLine();          // 读取客户端发来的一行
            System.out.println("收到：" + msg);

            out.println("你好，我是服务端，已收到：" + msg); // 回复
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

**客户端：**

```java
import java.io.*;
import java.net.Socket;

public class Client {
    public static void main(String[] args) {
        // ✅ 连接本机 8888 端口
        try (Socket socket = new Socket("127.0.0.1", 8888)) {
            BufferedReader in = new BufferedReader(
                    new InputStreamReader(socket.getInputStream()));
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);

            out.println("Hello, 我是客户端！");   // 发送
            String reply = in.readLine();          // 接收回复
            System.out.println("收到回复：" + reply);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

> ⚠️ **注意：** 必须先启动服务端，再启动客户端。若服务端未启动，客户端会抛出 `java.net.ConnectException: Connection refused`（连接被拒绝）。

> 💡 **提示：** `PrintWriter` 的第二个参数 `true` 开启了 **autoFlush（自动刷新）**，每调用一次 `println` 就会立刻把数据刷到网络，对方才能读到。如果忘记设为 `true` 又没手动 `flush()`，对方会一直阻塞在 `readLine()` 读不到数据。

---

## 五、IO 流在 Socket 中的应用

### 1. 字节流：直接读写

最底层的方式，直接操作字节数组，适合传输二进制数据（图片、视频、文件）。

```java
// 发送方：通过输出流写字节
OutputStream out = socket.getOutputStream();
byte[] data = "二进制数据".getBytes();
out.write(data);
out.flush(); // 必须刷新，确保数据真正发出

// 接收方：通过输入流读字节
InputStream in = socket.getInputStream();
byte[] buffer = new byte[1024];
int len = in.read(buffer); // 阻塞读取，返回实际读到的字节数
String received = new String(buffer, 0, len);
```

> 💡 **提示：** `read()` 方法在**对方关闭输出流之前会一直阻塞**，读到 -1 表示对方已关闭连接。

### 2. 字符流：按行读写文本

处理文本最方便，`readLine()` 自动按换行符 `\n` 分割，`println()` 自动加换行。

```java
// 包装：字节流 → 字符流 → 缓冲流
BufferedReader in = new BufferedReader(
        new InputStreamReader(socket.getInputStream(), "UTF-8")); // 指定字符编码
PrintWriter out = new PrintWriter(
        new OutputStreamWriter(socket.getOutputStream(), "UTF-8"), true);

out.println("第一行");
out.println("第二行");
String line;
while ((line = in.readLine()) != null) { // 读到 null 表示对方关闭了输出
    System.out.println("收到：" + line);
}
```

> ⚠️ **注意：** 跨平台传输文本时，**务必指定字符编码**（如 `UTF-8`）。否则发送方和接收方的默认编码不一致，会导致中文乱码。

### 3. 数据流：读写基本类型

`DataOutputStream` / `DataInputStream` 提供了读写 `int`、`long`、`double`、`UTF 字符串` 等基本类型的方法，方便传输结构化数据。

```java
// 发送方
DataOutputStream out = new DataOutputStream(socket.getOutputStream());
out.writeInt(100);              // 写一个 int（固定 4 字节）
out.writeDouble(3.14);          // 写一个 double（固定 8 字节）
out.writeUTF("你好");           // 写一个 UTF 字符串（前面带长度）
out.flush();

// 接收方（必须按写入顺序读取）
DataInputStream in = new DataInputStream(socket.getInputStream());
int num = in.readInt();         // 读 int
double pi = in.readDouble();    // 读 double
String str = in.readUTF();      // 读 UTF 字符串
```

> 💡 **提示：** 数据流读写有**严格顺序**——先写的必须先读，且类型必须对应。`writeInt` 必须 `readInt`，不能 `readLong`，否则数据会错乱。

### 4. 对象流：传输 Java 对象

通过**序列化**，可以直接在网络上传输 Java 对象。要求传输的对象类必须实现 `Serializable` 接口。

```java
// 1. 定义可序列化的对象
class User implements Serializable {
    private static final long serialVersionUID = 1L; // 序列化版本号
    String name;
    int age;
    // 构造器、getter/setter...
}

// 发送方
ObjectOutputStream out = new ObjectOutputStream(socket.getOutputStream());
out.writeObject(new User("张三", 20));
out.flush();

// 接收方
ObjectInputStream in = new ObjectInputStream(socket.getInputStream());
User user = (User) in.readObject(); // 反序列化，强转回对象
```

> ⚠️ **注意：** 对象流要求发送方和接收方有**相同版本**的类（`serialVersionUID` 必须一致），否则反序列化会抛 `InvalidClassException`。跨语言通信（如 Java 服务端 + 前端）不能用对象流，应改用 JSON。

---

## 六、客户端与服务端详解

前面几章分别介绍了 API、通信流程和 IO 流。这一节把**服务端**和**客户端**两个角色单独拎出来，系统讲清楚各自的职责、可直接套用的实现模板和生产环境的注意事项。

### 1. 两个角色的职责对比

| 对比项      | 服务端（ServerSocket）                   | 客户端（Socket）                       |
| ----------- | ---------------------------------------- | -------------------------------------- |
| 角色定位    | 被动等待，提供服务                       | 主动发起，请求服务                     |
| 启动顺序    | 必须先启动、先监听                       | 后启动，主动连接                       |
| IP / 端口   | 绑定固定端口，被动等待连接               | 本地端口由系统随机分配，主动连向服务端 |
| Socket 数量 | 1 个 ServerSocket 监听 + 每客户端 1 个 Socket | 通常 1 个 Socket                       |
| 核心方法    | `bind` → `accept` → 循环处理             | `connect` → 读写 → `close`             |
| 生命周期    | 长期运行，持续接受连接                   | 用完即关（短连接）或长期保持（长连接） |

> 💡 **提示：** 打个比方，服务端是"营业中的餐厅"——必须先开门、挂招牌（绑定端口）再等客人；客户端是"上门的顾客"——想吃饭就主动走进餐厅（连接）。一个餐厅（一个端口）可以同时接待很多顾客（多个连接）。

### 2. 服务端详解

#### （1）服务端的工作循环

一个标准服务端始终在重复下面这个循环：

```
启动 → 绑定端口监听 → [循环: accept 等待连接 → 分发处理 → ...] → 优雅关闭
```

#### （2）生产级服务端模板

下面是一个结构完整的服务端模板，包含**线程池、读超时、最大并发限制和优雅关闭**：

```java
import java.io.*;
import java.net.*;
import java.util.concurrent.*;

public class RobustServer {
    private static final int PORT = 8888;
    private static final int MAX_THREADS = 200;     // 限制最大并发线程数
    private static volatile boolean running = true; // 优雅关闭标志

    public static void main(String[] args) throws IOException {
        // ✅ 用线程池处理连接，控制并发、复用线程
        ExecutorService pool = new ThreadPoolExecutor(
                10, MAX_THREADS, 60, TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(1000),
                Executors.defaultThreadFactory(),
                new ThreadPoolExecutor.CallerRunsPolicy()); // 队列满时由主线程兜底

        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("服务端启动，监听 " + PORT);

            // ✅ 注册关闭钩子：收到 kill 信号时优雅停机
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                running = false;
                pool.shutdown();
                try { pool.awaitTermination(10, TimeUnit.SECONDS); }
                catch (InterruptedException ignored) {}
            }));

            while (running) {
                try {
                    Socket socket = serverSocket.accept(); // 阻塞等待新连接
                    pool.execute(() -> handle(socket));     // 交给线程池处理
                } catch (SocketException e) {
                    if (!running) break; // 关闭导致的异常，正常退出
                    e.printStackTrace();
                }
            }
        }
        System.out.println("服务端已关闭");
    }

    // 处理单个客户端
    private static void handle(Socket socket) {
        // ✅ try-with-resources 确保 Socket 一定关闭
        try (Socket s = socket;
             BufferedReader in = new BufferedReader(new InputStreamReader(s.getInputStream()));
             PrintWriter out = new PrintWriter(s.getOutputStream(), true)) {

            s.setSoTimeout(30_000); // 读超时 30 秒，防止恶意长连接占用线程
            String line;
            while ((line = in.readLine()) != null) {
                out.println("echo: " + line);
            }
        } catch (SocketTimeoutException e) {
            System.out.println("客户端超时断开");
        } catch (IOException e) {
            System.out.println("处理异常：" + e.getMessage());
        }
    }
}
```

#### （3）服务端的四种并发模型

| 模型                  | 做法                        | 优点             | 缺点                      | 适用场景           |
| --------------------- | --------------------------- | ---------------- | ------------------------- | ------------------ |
| 单线程                | 一个线程 accept + 处理      | 简单             | 一次只能服务一个客户端    | 学习、极简工具     |
| 多线程（一连接一线程）| 每连接 new 一个线程         | 编程简单         | 线程数 = 连接数，多了爆炸 | 中低并发（< 几百） |
| **线程池**            | 用线程池处理连接            | 控制并发、复用线程 | 高并发仍受限（C10K）     | 企业级通用方案     |
| NIO 多路复用          | 一个 Selector 管理海量连接  | 极高并发、省线程 | 编程复杂                  | 高并发（万级连接） |

> 💡 **提示：** 从"一连接一线程"升级到"线程池"是必经优化；再升级到"NIO 多路复用"才能解决 C10K（单机 1 万连接）问题，详见 [NIO.md](./NIO.md)。

#### （4）服务端注意事项

- **限制并发量**：用固定大小线程池，否则海量连接会拖垮服务器。
- **设置读超时**：`setSoTimeout`，防止恶意客户端建立连接后不发数据，长期占用线程。
- **优雅关闭**：用关闭标志位 + 线程池 `shutdown`，让正在处理的请求处理完再退出。
- **区分 accept 异常**：关闭 ServerSocket 会让阻塞的 `accept` 抛异常，要区分"正常关闭"和"真实异常"。

### 3. 客户端详解

#### （1）客户端的工作流程

```
创建 Socket → connect 连接（设置连接超时）→ 设置读超时 → 读写数据 → 关闭
```

#### （2）标准客户端模板

```java
import java.io.*;
import java.net.*;

public class RobustClient {
    public static void main(String[] args) {
        Socket socket = new Socket(); // ✅ 无参构造，便于设置连接超时
        try {
            // ✅ 连接超时 3 秒，避免服务端无响应时长时间卡死
            socket.connect(new InetSocketAddress("127.0.0.1", 8888), 3000);
            socket.setSoTimeout(5000); // 读超时 5 秒

            BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true);

            out.println("ping");
            System.out.println("收到：" + in.readLine());
        } catch (SocketTimeoutException e) {
            System.out.println("操作超时：" + e.getMessage());
        } catch (ConnectException e) {
            System.out.println("连接被拒绝，请确认服务端已启动");
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try { socket.close(); } catch (IOException ignored) {}
        }
    }
}
```

#### （3）断线重连

网络不稳定时，连接可能中断。生产级客户端通常会**自动重连**：失败后等待一段时间再试，并限制最大重试次数。

```java
public class ReconnectClient {
    private static final int MAX_RETRY = 5;          // 最大重试次数
    private static final long RETRY_INTERVAL = 3000; // 重试间隔（毫秒）

    public static Socket connectWithRetry(String host, int port) {
        for (int i = 1; i <= MAX_RETRY; i++) {
            try {
                Socket socket = new Socket();
                socket.connect(new InetSocketAddress(host, port), 3000);
                System.out.println("第 " + i + " 次连接成功");
                return socket;
            } catch (IOException e) {
                System.out.println("第 " + i + " 次连接失败：" + e.getMessage());
                if (i < MAX_RETRY) {
                    try { Thread.sleep(RETRY_INTERVAL); } // 等待后重试
                    catch (InterruptedException ignored) { return null; }
                }
            }
        }
        System.out.println("达到最大重试次数，放弃连接");
        return null;
    }
}
```

> 💡 **提示：** 重连时建议使用**指数退避**（每次等待时间翻倍），避免服务端刚恢复就被大量客户端同时重连打爆（"惊群效应"）。重连成功后，记得恢复之前未完成的业务。

#### （4）客户端注意事项

- **设置连接超时**：用无参构造 + `connect(addr, timeout)`，不要用 `new Socket(host, port)`（无法控制超时）。
- **设置读超时**：防止服务端响应慢导致客户端永久阻塞。
- **读写分离**：长连接持续通信时，读和写分到不同线程，避免互相阻塞（见实战案例中的聊天室客户端）。
- **断线重连**：网络不可靠，关键业务要加重连逻辑。

### 4. 两端协作要点

| 协作要点     | 说明                                                                 |
| ------------ | -------------------------------------------------------------------- |
| **协议一致** | 两端必须遵守同一套消息格式（编码、消息边界、字段顺序），否则数据对不上 |
| **启动顺序** | 服务端先启动监听，客户端再连接                                       |
| **异常对端** | 一端异常关闭，另一端读写会抛 `IOException`（如 Connection reset），都要捕获 |
| **关闭顺序** | 通常客户端用完主动 close；服务端长期运行，靠关闭钩子优雅停机          |
| **编码统一** | 双方必须用相同字符编码（如 UTF-8）                                   |

---

## 七、实战案例

### 1. Echo 回显服务

服务端把收到的每一行原样回发，是最经典的 Socket 入门练习。

```java
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

public class EchoServer {
    public static void main(String[] args) throws IOException {
        try (ServerSocket serverSocket = new ServerSocket(8888)) {
            System.out.println("Echo 服务启动...");
            Socket socket = serverSocket.accept();

            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(socket.getInputStream()));
                 PrintWriter out = new PrintWriter(socket.getOutputStream(), true)) {

                String line;
                // 持续读取，直到客户端断开（readLine 返回 null）
                while ((line = in.readLine()) != null) {
                    System.out.println("收到：" + line);
                    out.println("Echo: " + line); // 原样回显
                }
            }
            System.out.println("客户端已断开");
        }
    }
}
```

### 2. 多人聊天室（多线程）

单线程服务端一次只能服务一个客户端。**多人聊天室**需要：服务端为每个客户端开一个线程，并维护一个"所有在线客户端"的集合，收到消息后**广播**给所有人。

**服务端：**

```java
import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;

public class ChatServer {
    // 所有在线客户端的输出流（线程安全的集合）
    private static final Set<PrintWriter> clients = ConcurrentHashMap.newKeySet();

    public static void main(String[] args) throws IOException {
        ExecutorService pool = Executors.newCachedThreadPool(); // 线程池管理客户端线程

        try (ServerSocket serverSocket = new ServerSocket(8888)) {
            System.out.println("聊天室服务端启动，监听 8888...");
            while (true) {
                Socket socket = serverSocket.accept();           // 接受新连接
                pool.execute(new ClientHandler(socket));          // 交给线程池处理
            }
        }
    }

    // 处理单个客户端的任务
    static class ClientHandler implements Runnable {
        private final Socket socket;
        private PrintWriter out;

        ClientHandler(Socket socket) { this.socket = socket; }

        @Override
        public void run() {
            try (BufferedReader in = new BufferedReader(
                    new InputStreamReader(socket.getInputStream()))) {
                out = new PrintWriter(socket.getOutputStream(), true);
                clients.add(out); // 加入在线列表

                out.println("欢迎进入聊天室！输入 bye 退出。");
                String line;
                while ((line = in.readLine()) != null) {
                    if ("bye".equalsIgnoreCase(line)) break;
                    // ✅ 广播消息给所有在线客户端
                    broadcast(socket.getInetAddress() + " 说：" + line);
                }
            } catch (IOException e) {
                System.out.println("客户端异常断开：" + e.getMessage());
            } finally {
                if (out != null) clients.remove(out); // 移出在线列表
            }
        }

        // 广播：遍历所有客户端，逐个发送
        private void broadcast(String msg) {
            for (PrintWriter client : clients) {
                client.println(msg);
            }
        }
    }
}
```

**客户端：**

```java
import java.io.*;
import java.net.Socket;
import java.util.Scanner;

public class ChatClient {
    public static void main(String[] args) throws IOException {
        Socket socket = new Socket("127.0.0.1", 8888);
        BufferedReader in = new BufferedReader(
                new InputStreamReader(socket.getInputStream()));
        PrintWriter out = new PrintWriter(socket.getOutputStream(), true);

        // ✅ 单开一个线程，专门负责"读取服务端消息"（否则会被控制台输入阻塞）
        new Thread(() -> {
            String msg;
            try {
                while ((msg = in.readLine()) != null) {
                    System.out.println(msg);
                }
            } catch (IOException e) {
                System.out.println("与服务端断开连接");
            }
        }).start();

        // 主线程负责"读取用户输入并发送"
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNextLine()) {
            String line = scanner.nextLine();
            out.println(line);
            if ("bye".equalsIgnoreCase(line)) break;
        }
        socket.close();
    }
}
```

> 💡 **提示：** 客户端之所以要开两个线程，是因为 `readLine()`（等服务器消息）和 `Scanner.nextLine()`（等用户输入）都会阻塞。单线程时一个阻塞住，另一个就没机会执行。这是"读 / 写分离"的经典模式。

### 3. 文件传输

文件传输是字节流的典型场景，注意要用**缓冲区循环读写**，避免一次性把大文件全读进内存。

**发送端：**

```java
import java.io.*;
import java.net.Socket;

public class FileClient {
    public static void main(String[] args) throws IOException {
        File file = new File("source.jpg");
        try (Socket socket = new Socket("127.0.0.1", 8888);
             // ✅ 先用数据流发送文件名和大小，再发文件内容
             DataOutputStream out = new DataOutputStream(socket.getOutputStream());
             FileInputStream fis = new FileInputStream(file)) {

            out.writeUTF(file.getName());           // 发送文件名
            out.writeLong(file.length());           // 发送文件大小（字节）

            byte[] buffer = new byte[8192];         // 8KB 缓冲区
            int len;
            // 循环读取文件并写入网络，直到读完（read 返回 -1）
            while ((len = fis.read(buffer)) != -1) {
                out.write(buffer, 0, len);
            }
            out.flush();
            System.out.println("文件发送完成：" + file.getName());
        }
    }
}
```

**接收端：**

```java
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

public class FileServer {
    public static void main(String[] args) throws IOException {
        try (ServerSocket serverSocket = new ServerSocket(8888)) {
            System.out.println("文件接收服务启动...");
            Socket socket = serverSocket.accept();

            try (DataInputStream in = new DataInputStream(socket.getInputStream())) {
                String fileName = in.readUTF();      // 读取文件名
                long size = in.readLong();           // 读取文件大小

                try (FileOutputStream fos = new FileOutputStream("recv_" + fileName)) {
                    byte[] buffer = new byte[8192];
                    long total = 0;
                    int len;
                    // 按大小循环读取，直到接收完指定字节数
                    while (total < size && (len = in.read(buffer, 0,
                            (int) Math.min(buffer.length, size - total))) != -1) {
                        fos.write(buffer, 0, len);
                        total += len;
                    }
                    System.out.println("文件接收完成：" + fileName + "（" + total + " 字节）");
                }
            }
        }
    }
}
```

> ⚠️ **注意：** 接收文件时**不能用 `while ((len = in.read(buffer)) != -1)` 来判断结束**！因为 TCP 是长连接，对方发完文件后连接还在，`read` 不会返回 -1，会一直阻塞。必须**靠前面发送的文件大小**来精确控制读取字节数（如上例所示）。这是文件传输最常见的坑。

---

## 八、Socket 选项（Socket Options）

Socket 选项用于调优网络行为，通过 `setXXX` / `getXXX` 设置。下面是最常用的几个。

### 1. SO_TIMEOUT（读超时）

设置 `read()` / `accept()` 的阻塞超时时间。超时后会抛出 `SocketTimeoutException`。

```java
Socket socket = new Socket("127.0.0.1", 8888);
socket.setSoTimeout(5000); // 读操作最多阻塞 5 秒，超过抛 SocketTimeoutException

// 服务端同理，给 accept() 设置超时
ServerSocket serverSocket = new ServerSocket(8888);
serverSocket.setSoTimeout(10000); // accept() 最多等 10 秒
```

> 💡 **应用：** 服务器不能让一个客户端无限挂起。设置读超时后，如果客户端长时间不说话，可以判定为"假死"并主动断开，释放资源。

### 2. SO_KEEPALIVE（TCP 保活）

开启后，操作系统会定期探测连接是否还活着。默认关闭。

```java
socket.setKeepAlive(true);
```

> 💡 **应用：** 防止"死连接"——如果客户端突然断电、拔网线，服务端无法立刻感知（没有正常挥手），连接会一直挂着。保活机制能在探测失败后自动关闭连接。但系统默认的保活探测间隔很长（通常 2 小时），生产环境一般用**应用层心跳**替代（见第十一节）。

### 3. TCP_NODELAY（禁用 Nagle 算法）

TCP 默认开启 **Nagle 算法**：会把小数据包攒起来，凑够一定量才发送，以减少网络上的小包数量。但这对实时性要求高的场景（如交互式命令、游戏）会造成延迟。

```java
socket.setTcpNoDelay(true); // 禁用 Nagle，数据立即发送，降低延迟
```

### 4. SO_REUSEADDR（端口复用）

允许 Socket 绑定到一个处于 `TIME_WAIT` 状态的端口。服务端重启时常遇到 "Address already in use"，开启此项可解决。

```java
ServerSocket serverSocket = new ServerSocket();
serverSocket.setReuseAddress(true);           // 必须在 bind 之前设置
serverSocket.bind(new InetSocketAddress(8888));
```

### 5. SO_RCVBUF / SO_SNDBUF（收发缓冲区大小）

设置接收 / 发送缓冲区的大小。缓冲区大，吞吐量高但占内存；缓冲区小，内存省但可能频繁触发网络传输。

```java
socket.setReceiveBufferSize(64 * 1024); // 接收缓冲区 64KB
socket.setSendBufferSize(64 * 1024);    // 发送缓冲区 64KB
```

> 💡 **提示：** 设置的值只是"建议值"，操作系统可能不严格遵循。一般不需要手动调整，除非有明确的性能调优需求。

### 6. SO_LINGER（关闭时的逗留）

控制 `close()` 时的行为。默认情况下，`close()` 会立即返回，未发送完的数据在后台继续发送。

```java
// close 时最多等待 5 秒发完数据，超时则强制丢弃（RST 关闭）
socket.setSoLinger(true, 5);
```

> ⚠️ **注意：** 一般保持默认即可。错误配置 `SO_LINGER` 可能导致连接被 `RST` 强制重置，引发"Connection reset"异常。

### 常用选项速查表

| 选项             | 方法                          | 作用                       | 典型场景           |
| ---------------- | ----------------------------- | -------------------------- | ------------------ |
| `SO_TIMEOUT`     | `setSoTimeout(ms)`            | 设置读 / accept 超时       | 防止客户端假死     |
| `SO_KEEPALIVE`   | `setKeepAlive(true)`          | 开启 TCP 保活探测          | 检测死连接         |
| `TCP_NODELAY`    | `setTcpNoDelay(true)`         | 禁用 Nagle，立即发送       | 低延迟交互场景     |
| `SO_REUSEADDR`   | `setReuseAddress(true)`       | 允许端口复用               | 服务端快速重启     |
| `SO_RCVBUF`      | `setReceiveBufferSize(bytes)` | 设置接收缓冲区             | 吞吐量调优         |
| `SO_LINGER`      | `setSoLinger(on, seconds)`    | 控制 close 行为            | 特殊关闭需求       |

---

## 九、连接超时、读超时与异常处理

### 1. 设置连接超时

`new Socket(host, port)` 没有超时控制——如果服务器无响应，客户端会卡很久。正确做法：

```java
Socket socket = new Socket();                                  // 无参构造，不立即连接
// ✅ connect 时指定超时：最多等 3 秒
socket.connect(new InetSocketAddress("127.0.0.1", 8888), 3000);
```

### 2. 常见异常及含义

| 异常                              | 含义                                         | 常见原因                         |
| --------------------------------- | -------------------------------------------- | -------------------------------- |
| `ConnectException: Connection refused` | 连接被拒绝                              | 服务端没启动 / 端口错误          |
| `SocketTimeoutException`          | 操作超时                                     | 连接超时或读超时触发             |
| `BindException: Address already in use` | 端口被占用                            | 端口已被其他程序（或上次没退净的程序）占用 |
| `SocketException: Connection reset` | 连接被重置                                  | 对端异常关闭 / 进程崩溃          |
| `UnknownHostException`            | 找不到主机                                   | 域名错误 / DNS 解析失败          |
| `EOFException`                    | 读到流的末尾却还在读                         | 数据流提前结束（如读对象时）     |

### 3. 健壮的客户端示例

```java
Socket socket = new Socket();
try {
    socket.connect(new InetSocketAddress("127.0.0.1", 8888), 3000); // 连接超时 3s
    socket.setSoTimeout(5000);                                       // 读超时 5s

    BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
    // ... 通信逻辑 ...
} catch (SocketTimeoutException e) {
    System.out.println("操作超时：" + e.getMessage());
} catch (ConnectException e) {
    System.out.println("连接被拒绝，请检查服务端是否启动");
} catch (IOException e) {
    System.out.println("IO 异常：" + e.getMessage());
} finally {
    try { socket.close(); } catch (IOException ignored) {} // 确保关闭
}
```

---

## 十、半关闭与优雅关闭

### 1. 为什么要半关闭

TCP 是**全双工**的——数据可以双向同时传输。一个 Socket 有**独立的输入和输出**两个方向。

直接调用 `close()` 会**同时关闭输入和输出**，无法再收发任何数据。但有时我们希望：**"我说完了（关闭输出），但还想继续听你说（保留输入）"**——这就是**半关闭**。

典型场景：上传文件。客户端发完文件后关闭输出（通知服务端"我发完了"），服务端据此开始处理并返回结果，客户端再从输入流读取结果。

### 2. shutdownOutput / shutdownInput

```java
// 客户端：发完数据后，关闭输出方向（会发送 FIN，对方 read 会返回 -1 / null）
socket.shutdownOutput();

// 此时仍可继续读取服务端的响应
String reply = in.readLine();
```

```
发送方                         接收方
  │                              │
  │ ─── 数据全部发送 ─────────►  │
  │ ─── shutdownOutput (FIN) ─►  │ 接收方 read() 返回 -1，知道对方发完了
  │                              │
  │ ◄── 处理结果 / 响应 ──────── │  接收方仍可继续发送
  │   (输入流仍可用)             │
```

> 💡 **提示：** `shutdownOutput()` 只关闭输出方向，**Socket 对象本身没关闭**，输入流仍可正常读取。最后仍需调用 `close()` 彻底释放资源。

### 3. close vs shutdownOutput 的区别

| 操作             | 关闭方向           | Socket 是否可继续用 |
| ---------------- | ------------------ | ------------------- |
| `close()`        | 输入 + 输出全关闭  | 否，彻底销毁        |
| `shutdownOutput()`| 仅输出             | 是，仍可读          |
| `shutdownInput()`| 仅输入             | 是，仍可写          |

---

## 十一、TCP 粘包 / 拆包及解决方案

这是 Socket 编程（尤其是 TCP 长连接）**最核心的难点**，也是高频面试题。

### 1. 问题复现

TCP 是**字节流**，没有消息边界。发送方连续发两条 `"Hello"` 和 `"World"`：

```
发送方连续发送:    [Hello]  [World]
                  ↓ TCP 字节流，无边界 ↓
接收方可能收到:    [HelloWorld]      ← 粘包（多条粘在一起）
接收方可能收到:    [Hel][loWo][rld]  ← 拆包（一条被拆成多次）
```

- **粘包**：多条消息被合并成一条接收。
- **拆包**：一条消息被拆成多次接收。

> 💡 **澄清误区：** "粘包"不是 TCP 的 bug，而是**字节流协议的固有特性**。TCP 只保证字节顺序正确到达，根本不知道"消息"是什么概念，应用层必须自己划定边界。

### 2. 三种解决方案

| 方案         | 做法                                       | 优缺点                          |
| ------------ | ------------------------------------------ | ------------------------------- |
| 消息定长     | 每条消息固定长度，不足补空格               | 简单，但浪费带宽                |
| 分隔符       | 用特殊字符（如 `\n`）作为消息结束标志      | 简单，但消息体本身不能含分隔符  |
| **长度字段** | 消息头中用固定字节表示消息体长度（最常用） | 灵活高效，自定义协议 / Netty 首选 |

### 3. 长度字段方案的完整实现（推荐）

核心思路：**每条消息 = 长度头（固定 4 字节 int） + 消息体**。接收方先读 4 字节拿到长度，再精确读取该长度的内容。

```java
import java.io.*;
import java.net.*;

public class LengthBasedProtocol {

    // ✅ 发送一条消息：先写长度，再写内容
    public static void send(DataOutputStream out, String msg) throws IOException {
        byte[] data = msg.getBytes("UTF-8");
        out.writeInt(data.length);  // 4 字节：消息体长度
        out.write(data);            // N 字节：消息体
        out.flush();
    }

    // ✅ 接收一条消息：先读长度，再按长度读内容
    public static String receive(DataInputStream in) throws IOException {
        int length = in.readInt();                  // 先读 4 字节长度
        byte[] data = new byte[length];             // 按长度分配缓冲区
        in.readFully(data);                         // readFully 会阻塞直到读满 length 字节
        return new String(data, "UTF-8");
    }
}
```

> 💡 **关键点：** 接收时用 `readFully()` 而非 `read()`。`read()` 不保证一次读满指定长度（可能只读到一部分），`readFully()` 会**循环阻塞直到读够**，正好解决了拆包问题。

> 💡 **延伸阅读：** 实际框架（如 Netty）提供了 `LengthFieldBasedFrameDecoder`，自动完成上述拆包逻辑，无需手写。详见 [NIO.md](./NIO.md)。

---

## 十二、心跳机制与长连接

### 1. 为什么需要心跳

长连接（保持连接不关闭、持续通信）面临一个问题：**如何发现"死连接"？** 如果客户端断电、拔网线，没有正常的四次挥手，服务端根本不知道对方已经没了，连接会一直占用资源。

虽然 `SO_KEEPALIVE` 能探测，但系统默认探测间隔太长（约 2 小时）。**应用层心跳**更灵活：双方定时互发一个很小的"心跳包"，超过一段时间收不到对方的回应，就判定连接已断。

```
客户端                        服务端
  │ ── 心跳 ping ──────────►  │  每隔 30 秒
  │ ◄─ 心跳 pong ───────────  │  立即回应
  │                            │
  │ （超过 3 次没收到 pong）    │
  │ ── 判定连接已死，关闭 ──►  │  释放资源
```

### 2. 心跳实现思路

```java
// 服务端为每个客户端维护"最后活跃时间"
// 收到任何消息（含心跳）就更新 lastActiveTime

// 另开一个定时线程，定期扫描所有连接
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
scheduler.scheduleAtFixedRate(() -> {
    long now = System.currentTimeMillis();
    for (Map.Entry<Socket, Long> entry : clientLastActive.entrySet()) {
        if (now - entry.getValue() > 90_000) { // 90 秒无响应
            System.out.println("心跳超时，断开死连接");
            closeQuietly(entry.getKey());      // 关闭并移除
        }
    }
}, 30, 30, TimeUnit.SECONDS); // 每 30 秒检查一次
```

> 💡 **提示：** 心跳是工业级网络应用（IM、推送、游戏服务器）的标配。Netty 内置了 `IdleStateHandler`，可以优雅地实现空闲检测和心跳。

---

## 十三、NIO 的 SocketChannel（简介）

上述所有内容都基于 **BIO（阻塞 IO）**——`accept()`、`read()` 会阻塞，导致必须为每个连接分配一个线程。当连接数上万时，线程开销会成为性能瓶颈。

Java NIO 引入了**非阻塞 + 多路复用**机制：

| BIO（本文）             | NIO                        |
| ----------------------- | -------------------------- |
| `ServerSocket` / `Socket` | `ServerSocketChannel` / `SocketChannel` |
| `InputStream` / `OutputStream` | `Buffer`（缓冲区）    |
| 每连接一线程，阻塞等待   | 一个 `Selector` 管理上万个连接，只有事件发生才处理 |

```java
// NIO 客户端示例（非阻塞）
SocketChannel channel = SocketChannel.open(new InetSocketAddress("127.0.0.1", 8888));
channel.configureBlocking(false); // 设置为非阻塞模式
ByteBuffer buffer = ByteBuffer.allocate(1024);
// 配合 Selector 实现一个线程管理多连接...
```

> 💡 **延伸阅读：** NIO 的 `Buffer` / `Channel` / `Selector` 详解、零拷贝、Reactor 模型等高性能编程内容，请参阅 **[NIO.md](./NIO.md)**。再进阶则是基于 NIO 封装的 **Netty** 框架。

---

## 十四、Socket 与 WebSocket、HTTP 的区别

| 对比项    | Socket（TCP）              | WebSocket                  | HTTP                          |
| --------- | -------------------------- | -------------------------- | ----------------------------- |
| 所在层级  | 传输层 API                 | 应用层协议（基于 TCP）     | 应用层协议（基于 TCP）        |
| 通信模式  | 全双工，长连接             | 全双工，长连接             | 请求-响应，通常短连接         |
| 连接建立  | 三次握手                   | HTTP 握手 + 升级（Upgrade）| 每次请求建立连接（HTTP/1.1 可复用）|
| 数据格式  | 原始字节流，需自定义协议   | 帧格式，浏览器原生支持     | 文本（请求行 + 头 + 体）      |
| 典型场景  | 自定义服务端、IM 底层、RPC | 网页实时聊天、推送、协同   | 网页、API 接口                |

> 💡 **理解层次：** Socket 是最底层的网络编程接口；**HTTP 和 WebSocket 都是基于 TCP（也就是基于 Socket 通信能力）构建的应用层协议**。WebSocket 通过一次 HTTP 协议升级（Upgrade），在 TCP 长连接上实现双向通信。

---

## 十五、注意事项与最佳实践

### 1. 资源必须关闭

Socket、ServerSocket、流用完必须关闭，否则会导致**文件描述符泄漏**，连接数累积后服务器无法再接受新连接。

```java
// ❌ 错误：异常时 close 执行不到，资源泄漏
Socket socket = new Socket("127.0.0.1", 8888);
// ... 使用 ...
socket.close();

// ✅ 正确：try-with-resources，无论是否异常都自动关闭
try (Socket socket = new Socket("127.0.0.1", 8888);
     BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
    // ... 使用 ...
}
```

### 2. 永远在子线程中处理网络 IO

主线程（如 UI 线程、主逻辑线程）绝对不能阻塞在网络 `read()` 上，否则界面会卡死、服务会停止响应。网络读写一律放在独立线程。

### 3. 统一字符编码

跨机器传输文本时，发送方和接收方必须用相同编码（推荐 `UTF-8`），否则中文乱码。

### 4. 处理好粘包 / 拆包

自定义 TCP 协议时，**必须**在应用层定义消息边界（推荐"长度字段"方案），不能假设一次 `read` 就能读到一条完整消息。

### 5. 设置合理的超时

生产环境必须为连接和读操作设置超时（`connect` 超时 + `setSoTimeout`），防止恶意或异常客户端长期占用连接。

### 6. 注意序列化兼容性

使用对象流传输对象时，务必显式声明 `serialVersionUID`，并保证两端类版本一致；跨语言通信不要用 Java 序列化，改用 JSON / Protobuf。

---

## 十六、面试常见问题

### Q1：Socket 是什么？和 HTTP 是什么关系？

**答：** Socket 是操作系统提供的网络编程接口，是应用层访问传输层（TCP/UDP）服务的桥梁。它本身不是协议，而是使用协议的工具。HTTP 是应用层协议，底层基于 TCP，也就是说 HTTP 的通信是建立在 Socket 能力之上的——一个 HTTP 服务器本质上就是一个监听 80/443 端口的 Socket 服务端。

### Q2：描述 Socket 通信的完整流程。

**答：** 服务端创建 `ServerSocket` 绑定端口并调用 `accept()` 阻塞等待；客户端创建 `Socket` 连接服务端（触发三次握手）；连接建立后，双方通过 `getInputStream` / `getOutputStream` 获取流互发数据；通信结束各自调用 `close()`（触发四次挥手），连接关闭。

### Q3：`accept()` 和三次握手是什么关系？

**答：** 三次握手是 TCP 协议层自动完成的。客户端 `new Socket(host, port)` 时发起握手，`accept()` 在握手完成后返回一个新的 Socket 代表这条已建立的连接。也就是说，握手成功后连接进入内核的"已完成连接队列"，`accept()` 从队列中取出它。

### Q4：什么是 TCP 粘包 / 拆包？如何解决？

**答：** TCP 是字节流协议，没有消息边界，多条消息可能被合并接收（粘包）或一条消息被拆成多次接收（拆包）。常用解决方案：① 消息定长；② 用特殊分隔符；③ 在消息头中用固定字节（如 4 字节 int）表示消息体长度——这是业界主流，读取时先读长度再 `readFully` 读对应字节。Netty 提供 `LengthFieldBasedFrameDecoder` 自动处理。

### Q5：`close()` 和 `shutdownOutput()` 的区别？

**答：** `close()` 彻底关闭 Socket，输入输出都不可再用。`shutdownOutput()` 是**半关闭**，只关闭输出方向（发送 FIN 通知对方"我发完了"），输入流仍可继续读取对方的响应。典型场景：客户端上传完文件后 `shutdownOutput`，再读取服务端的处理结果。

### Q6：为什么文件传输接收端不能用 `read() == -1` 判断结束？

**答：** 因为 TCP 是长连接，发送方发完文件后连接还在（没有关闭），`read()` 不会返回 -1，会一直阻塞等待更多数据。必须通过协议预先告知文件大小，接收方按字节数精确读取，或发送方发完后 `shutdownOutput` 半关闭。

### Q7：一个 ServerSocket 监听 8080，能建立多少个连接？

**答：** 一条 TCP 连接由四元组（源 IP、源端口、目的 IP、目的端口）唯一确定。目的 IP + 端口固定（都是服务端），但每个客户端的源 IP + 源端口不同，所以理论上可建立海量连接。实际受限于：① 内存（每条连接占收发缓冲区）；② 文件描述符数量（`ulimit -n`，默认往往只有 1024）；③ 线程数（BIO 模型下一连接一线程）。这也是高并发要用 NIO 的根本原因。

### Q8：BIO、NIO、AIO 的区别？

**答：** **BIO**（阻塞 IO）一连接一线程，连接空闲也占线程，并发上不去；**NIO**（非阻塞 IO）一个线程用 `Selector` 管理上万个连接，只在有事件（读 / 写 / 连接就绪）时处理，效率高；**AIO**（异步 IO）由操作系统完成后回调通知，Java 的 AIO 在 Linux 下实际用 epoll 模拟，业界主流仍是 NIO + Netty。

### Q9：如何检测和处理"死连接"？

**答：** 两种方式：① 开启 `SO_KEEPALIVE`，由操作系统定期探测，但默认间隔很长（约 2 小时）；② **应用层心跳**，双方定时互发心跳包，超过约定次数没收到响应就判定连接死亡并关闭。生产环境普遍用应用层心跳（配合空闲检测），Netty 提供 `IdleStateHandler` 实现。

### Q10：Socket 编程有哪些常见的坑？

**答：** ① 资源未关闭导致文件描述符泄漏；② 文本传输未统一字符编码导致乱码；③ TCP 粘包 / 拆包未处理导致数据错乱；④ 文件接收端误用 `read() == -1` 判断结束而永久阻塞；⑤ 主线程阻塞在网络 IO 上；⑥ 未设置超时导致死连接长期占用资源；⑦ 忘记 `flush()` 导致对方读不到数据。

---

## 十七、总结

Socket 是网络编程的核心，掌握它就拿到了理解所有网络通信（HTTP、RPC、数据库连接、IM）的钥匙。本文核心要点：

1. **本质**：Socket 是应用层访问传输层（TCP/UDP）的 API，一个 Socket 对应一个文件描述符。
2. **TCP Socket**：服务端用 `ServerSocket` 监听 + `accept()`；客户端用 `Socket` 连接；双方通过输入 / 输出流收发字节。
3. **流的选择**：字节流传二进制，`BufferedReader`/`PrintWriter` 传文本，`DataXxxStream` 传基本类型，`ObjectXxxStream` 传对象。
4. **核心实战**：Echo 回显、多线程聊天室（读写分离 + 广播）、文件传输（缓冲区循环读写 + 大小协议）。
5. **关键选项**：`SO_TIMEOUT`（超时）、`TCP_NODELAY`（禁 Nagle）、`SO_KEEPALIVE`（保活）、`SO_REUSEADDR`（端口复用）。
6. **进阶要点**：半关闭（`shutdownOutput`）、连接 / 读超时、**粘包拆包**（长度字段方案）、心跳机制。
7. **必避的坑**：资源关闭、统一编码、消息边界、文件结束判断、超时设置、flush 刷新。

> 💡 **学习路径建议：** 先彻底搞懂 BIO 的 Socket 通信 → 动手实现一个多人聊天室和文件传输 → 理解粘包拆包并手写"长度字段"协议 → 再进阶 [NIO.md](./NIO.md) 的 `SocketChannel` + `Selector` → 最后上手 Netty 框架。

相关文档：
- 网络基础（三要素、TCP/UDP 原理）：[网络编程.md](./网络编程.md)
- 高性能非阻塞 Socket（NIO）：[NIO.md](./NIO.md)
- 线程池（聊天室用到）：[多线程.md](./多线程.md)
