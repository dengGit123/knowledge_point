# Java NIO（New IO / Non-blocking IO）

> 官方文档：[Java NIO (Oracle Java Tutorials)](https://docs.oracle.com/javase/tutorial/essential/io/file.html) ｜ [java.nio (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/package-summary.html) ｜ [Buffer](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/class-use/Buffer.html) ｜ [Channel](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/channels/package-summary.html)
> 参考教程：[菜鸟教程 - Java NIO](https://www.runoob.com/java/java-nio.html)

---

## 一、概述

### 1. 什么是 NIO

**NIO** 全称有两种解读，两种都对：

- **New IO**：相对老一代 IO（`java.io`）而言，是 Java 1.4 引入的全新 IO API，放在 `java.nio` 包下。
- **Non-blocking IO**：它支持**非阻塞**模式与**多路复用（Selector）**，可以用一个线程同时管理成百上千个连接。

> 💡 **提示：** 注意区分 NIO 与 NIO.2。Java 7 引入的 `java.nio.file`（Path、Files 等）俗称 NIO.2，是对 NIO 文件操作的增强；本文讲的是核心 NIO（Buffer / Channel / Selector）。

### 2. 为什么需要 NIO

先看传统 **BIO（Blocking IO，阻塞 IO）** 的痛点：

> **BIO 模型**：`ServerSocket.accept()` 会一直阻塞，直到有客户端连接。于是服务端只能「**一个连接对应一个线程**」。

```
┌────────┐   连接1  ┌──────────┐
│ Client ├────────►│ Thread 1 │ (阻塞读，干等)
├────────┤         ├──────────┤
│ Client ├─连接2──►│ Thread 2 │ (阻塞读，干等)
├────────┤         ├──────────┤
│ Client ├─连接3──►│ Thread 3 │ (阻塞读，干等)
└────────┘         └──────────┘
```

连接数一旦上来（比如几万个），几万个线程的**创建开销、内存占用、上下文切换**会把服务器拖垮。即便大部分连接空闲，线程也都被"绑死"在那儿干等。

**NIO 的解法**：用 **Selector（多路复用器）**，让**一个线程**同时监听多个 Channel，哪个 Channel 有数据可读了，再去处理哪个，彻底摆脱「一对一」。

```
┌────────┐  连接1  ┌────────────┐
│ Client ├────────►│  Channel 1 │──┐
├────────┤  连接2  ├────────────┤  │   ┌──────────┐   ┌────────┐
│ Client ├────────►│  Channel 2 │──┼──►│ Selector │◄──►│ Thread │ (单线程)
├────────┤  连接3  ├────────────┤  │   └──────────┘   └────────┘
│ Client ├────────►│  Channel 3 │──┘   只在有事件时唤醒
└────────┘         └────────────┘
```

### 3. 通俗类比

| 模型 | 类比 |
| --- | --- |
| **BIO** | 银行「**一对一服务**」：每个客户配一个柜员，柜员在你填表、发呆时也只能干等，柜员（线程）被白白占用。 |
| **NIO** | 银行大厅的「**叫号机 + 大堂经理**」：大堂经理（Selector）同时照看所有窗口，谁叫号（有事件）就去谁那儿处理，一个经理能管几十个窗口。 |

---

## 二、NIO 与 BIO 的区别

| 对比项 | BIO（传统 IO） | NIO |
| --- | --- | --- |
| 引入版本 | Java 1.0 | Java 1.4 |
| **面向** | **流（Stream）** | **缓冲区（Buffer）** |
| **方向** | 单向（InputStream 或 OutputStream） | 双向（Channel 既可读也可写） |
| **阻塞** | **阻塞**（read 会一直等） | 支持**非阻塞** + 多路复用 |
| **线程模型** | 一个连接一个线程 | 一个线程管理多个连接 |
| **核心类** | `InputStream` / `OutputStream` / `Reader` / `Writer` | `Buffer` / `Channel` / `Selector` |
| **包** | `java.io` | `java.nio` |
| **是否支持文件** | 是 | 是（FileChannel） |
| **适用场景** | 连接数少、传输较稳定 | 连接数多、连接短、数据较轻（如聊天、IM、网关） |

> ⚠️ **注意：** NIO **并非完全取代** BIO。对于连接数少、逻辑简单的场景，BIO 写起来更简洁；高并发场景才用 NIO。

---

## 三、NIO 三大核心

NIO 的所有能力都围绕三个核心组件展开：**Buffer（缓冲区）、Channel（通道）、Selector（选择器）**。它们的关系如下：

```
                          ┌──────────┐
                          │ Selector │  (一个 Selector 监听多个 Channel)
                          └────┬─────┘
              注册 / 监听事件    │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Channel 1   │       │  Channel 2   │       │  Channel 3   │
│ (SocketChannel)│     │(ServerSocketCh)│     │(DatagramCh..)│
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │ 读/写                │ 读/写                │ 读/写
       ▼                      ▼                      ▼
┌────────────┐         ┌────────────┐         ┌────────────┐
│  Buffer    │         │  Buffer    │         │  Buffer    │  (数据都先放进缓冲区)
└────────────┘         └────────────┘         └────────────┘
```

> 💡 **提示：** 在 NIO 中，**数据不能直接在 Channel 和程序之间流动**，必须借助 Buffer 作为中转：读 = Channel → Buffer，写 = Buffer → Channel。

### 1. Buffer（缓冲区）

#### 1.1 是什么

**Buffer** 是一个**数据容器**，本质是一块固定大小的数组，用来暂存 Channel 读写的数据。它是 NIO 与 BIO 最大的区别之一——BIO 直接对流读写，NIO 必须经过 Buffer。

#### 1.2 四个核心属性

每个 Buffer 都有四个关键指针（属性），理解它们就理解了 Buffer 的工作原理：

| 属性 | 含义 | 取值范围 |
| --- | --- | --- |
| `capacity` | **容量**，缓冲区能装多少数据，创建后固定不变 | `> 0` |
| `position` | **当前位置**，下一个要读 / 写的元素索引 | `0 <= position <= limit` |
| `limit` | **界限**，第一个不应读 / 写的元素索引，是"可操作区的边界" | `position <= limit <= capacity` |
| `mark` | **标记**，调用 `mark()` 记录当前 position，`reset()` 可回到该位置 | 可选，未设置时为 `-1` |

它们满足不变式：`0 <= mark <= position <= limit <= capacity`

下面用一张图展示 Buffer 在「写模式 → flip → 读模式」过程中的指针变化（以 `capacity = 8` 为例）：

```
① 刚 allocate（写模式）：position=0, limit=capacity=8
┌───┬───┬───┬───┬───┬───┬───┬───┐
│   │   │   │   │   │   │   │   │
└───┴───┴───┴───┴───┴───┴───┴───┘
  ^
position

② 写入 5 个字节后：position=5, limit=8
┌───┬───┬───┬───┬───┬───┬───┬───┐
│ A │ B │ C │ D │ E │   │   │   │
└───┴───┴───┴───┴───┴───┴───┴───┘
                  ^
              position(下一个写入位置)

③ 调用 flip() 切换为读模式：position=0, limit=5
┌───┬───┬───┬───┬───┬───┬───┬───┐
│ A │ B │ C │ D │ E │   │   │   │
└───┴───┴───┴───┴───┴───┴───┴───┘
  ^                   ^
position              limit(只能读到第 5 个)

④ 读完后调用 clear()：position=0, limit=8（数据还在，只是逻辑清空，准备再写）
┌───┬───┬───┬───┬───┬───┬───┬───┐
│ A │ B │ C │ D │ E │   │   │   │
└───┴───┴───┴───┴───┴───┴───┴───┘
  ^
position
```

#### 1.3 操作四步骤

Buffer 的典型使用流程：**allocate → put（写） → flip（切换） → get（读） → clear / compact（复位）**

```java
import java.nio.ByteBuffer;

public class BufferDemo {
    public static void main(String[] args) {
        // 1️⃣ 分配一个容量为 10 的字节缓冲区
        ByteBuffer buffer = ByteBuffer.allocate(10);

        // 2️⃣ 写入数据（put 会移动 position）
        buffer.put((byte) 'H');
        buffer.put((byte) 'i');
        buffer.put((byte) '!');
        System.out.println("写入后 position=" + buffer.position()  // 3
                + ", limit=" + buffer.limit());                    // 10

        // 3️⃣ 切换为读模式（把 limit 设为 position，position 归零）
        buffer.flip();
        System.out.println("flip后 position=" + buffer.position()   // 0
                + ", limit=" + buffer.limit());                    // 3

        // 4️⃣ 读取数据（get 会移动 position）
        while (buffer.hasRemaining()) {           // position < limit
            System.out.print((char) buffer.get()); // 输出 Hi!
        }
        System.out.println("\n读取后 position=" + buffer.position()); // 3

        // 5️⃣ 复位，准备再次写入（position 归零，limit 恢复为 capacity）
        buffer.clear();
        System.out.println("clear后 position=" + buffer.position()  // 0
                + ", limit=" + buffer.limit());                    // 10
    }
}
```

常用方法汇总：

| 方法 | 作用 |
| --- | --- |
| `allocate(int n)` | 分配一个容量为 n 的堆内缓冲区 |
| `allocateDirect(int n)` | 分配堆外（直接）缓冲区 |
| `put(x)` / `put(byte[], off, len)` | 往缓冲区写入数据，position 前移 |
| `get()` / `get(byte[], off, len)` | 从缓冲区读出数据，position 前移 |
| `flip()` | 翻转：`limit = position; position = 0;`（写 → 读） |
| `rewind()` | 重绕：`position = 0;`（保留 limit，可重读） |
| `clear()` | 「清空」：`position = 0; limit = capacity;`（其实数据没删，只是逻辑复位） |
| `compact()` | 压缩：把未读数据移到开头，position 指向剩余数据末尾（读未完又想继续写时用） |
| `mark()` / `reset()` | 标记 / 回到 mark 处 |
| `hasRemaining()` | `position < limit`，是否还有可读数据 |
| `remaining()` | `limit - position`，剩余可读数量 |

> 💡 **提示：** `clear()` **不会真的删除**数据，只是把指针复位。如果只读了一部分就要写新数据，应该用 `compact()`，它会保留未读内容。

#### 1.4 常用子类

Buffer 是抽象基类，每种基本数据类型（除了 boolean）都有对应子类：

| Buffer 子类 | 存放类型 | 典型用途 |
| --- | --- | --- |
| `ByteBuffer` | `byte` | **最常用**，网络 / 文件 IO 都是字节 |
| `CharBuffer` | `char` | 字符处理 |
| `ShortBuffer` | `short` | 短整型 |
| `IntBuffer` | `int` | 整型 |
| `LongBuffer` | `long` | 长整型 |
| `FloatBuffer` | `float` | 单精度浮点 |
| `DoubleBuffer` | `double` | 双精度浮点 |
| `MappedByteBuffer` | `byte` | 文件内存映射（零拷贝相关） |

其中 **`ByteBuffer`** 是 NIO 网络编程中最核心的缓冲区。

#### 1.5 直接缓冲区 vs 非直接缓冲区

`ByteBuffer` 有两种分配方式，性能差异很大：

| 对比项 | 非直接缓冲区 `allocate()` | 直接缓冲区 `allocateDirect()` |
| --- | --- | --- |
| **内存位置** | JVM **堆内** | **堆外**（操作系统本地内存） |
| **分配速度** | 快 | 慢（要向 OS 申请） |
| **IO 性能** | 慢（数据要在堆和 OS 间多拷贝一次） | **快**（避免一次拷贝，接近「零拷贝」） |
| **释放** | 随 GC 回收 | 由 GC 间接回收，无法精确控制 |
| **适用场景** | 一般业务、短生命周期 | **大文件、高 IO、长生命周期** |

为什么直接缓冲区更快？画图说明一次磁盘读：

```
非直接缓冲区：磁盘 → 内核缓冲区 → JVM 堆缓冲区 (多一次拷贝)
直接缓冲区  ：磁盘 → 内核缓冲区 ═══════► 直接缓冲区 (省去一次拷贝)
                                 (直接就是堆外内存, OS 可直接写入)
```

```java
// ✅ 大文件拷贝、高吞吐场景用直接缓冲区
ByteBuffer direct = ByteBuffer.allocateDirect(1024 * 1024); // 1MB 堆外内存

// ✅ 一般业务、临时使用用堆内缓冲区（分配快，GC 管理）
ByteBuffer heap = ByteBuffer.allocate(1024);
```

> ⚠️ **注意：** 直接缓冲区分配成本高，且不归 GC 直接管，**不要**在频繁创建销毁的循环里用，否则可能导致堆外内存泄漏。

---

### 2. Channel（通道）

#### 2.1 是什么

**Channel** 是一个**双向的**数据传输通道，连接着数据源（文件、网络 Socket 等）和程序。可以把它理解为 BIO 中 Stream 的「升级版」。

#### 2.2 Channel 与 Stream 的区别

| 对比项 | Stream（流） | Channel（通道） |
| --- | --- | --- |
| **方向** | **单向**（要么读要么写） | **双向**（同一个 Channel 可读可写） |
| **是否阻塞** | 默认阻塞 | 可阻塞可非阻塞（可配置） |
| **是否结合 Buffer** | 直接操作字节 | **必须配合 Buffer** |
| **是否支持文件锁** | 否 | 是（FileChannel） |
| **关闭** | 不强制（但应关闭） | **必须显式 close()**（实现 `Closeable`） |

#### 2.3 常用 Channel 实现

| Channel | 作用 | 是否可非阻塞 |
| --- | --- | --- |
| `FileChannel` | 读写**文件**，只能工作在**阻塞模式** | 否（文件 IO 不支持非阻塞） |
| `SocketChannel` | TCP 客户端 / 服务端连接 | 是 |
| `ServerSocketChannel` | TCP 服务端，监听新连接 | 是 |
| `DatagramChannel` | UDP 收发数据 | 是 |

> 💡 **提示：** `FileChannel` 不能注册到 Selector（它不支持非阻塞），它主要用于文件读写和零拷贝。

#### 2.4 FileChannel 基本用法

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;

public class FileChannelDemo {
    public static void main(String[] args) throws Exception {
        // ✅ 写入文件：FileOutputStream → FileChannel → Buffer
        try (FileChannel out = new FileOutputStream("a.txt").getChannel()) {
            ByteBuffer buf = ByteBuffer.allocate(64);
            buf.put("Hello NIO".getBytes());
            buf.flip();                 // 写入 Channel 前必须切到读模式
            out.write(buf);             // 从 Buffer 读出 → 写入 Channel
        }

        // ✅ 读取文件：FileInputStream → FileChannel → Buffer
        try (FileChannel in = new FileInputStream("a.txt").getChannel()) {
            ByteBuffer buf = ByteBuffer.allocate(64);
            int len = in.read(buf);     // 从 Channel 读出 → 写入 Buffer
            buf.flip();
            byte[] data = new byte[len];
            buf.get(data);
            System.out.println(new String(data)); // Hello NIO
        }
    }
}
```

---

### 3. Selector（选择器 / 多路复用器）

#### 3.1 是什么

**Selector** 是 NIO 实现「一个线程管理多个连接」的关键。它就像一个**事件监控中心**：你把多个 Channel 注册进来，告诉它「我关心哪些事件」，它就会在有事件发生时通知你。

#### 3.2 四种监听事件

Selector 通过 `SelectionKey` 的常量定义了四种事件类型：

| 事件常量 | 值 | 含义 | 适用 Channel |
| --- | --- | --- | --- |
| `OP_ACCEPT` | `1 << 4 = 16` | 有新连接到达（**接受连接**） | `ServerSocketChannel` |
| `OP_CONNECT` | `1 << 3 = 8` | 连接建立成功 | `SocketChannel` |
| `OP_READ` | `1 << 0 = 1` | 有数据可读 | `SocketChannel` |
| `OP_WRITE` | `1 << 2 = 4` | 可以写数据（一般 socket 都可写，少用） | `SocketChannel` |

#### 3.3 SelectionKey

`SelectionKey` 表示「**一个 Channel 与一个 Selector 的注册关系**」，持有：

- 注册的 Channel 引用（`channel()`）
- 注册的 Selector 引用（`selector()`）
- 关注的事件集合（`interestOps()`）
- 就绪的事件集合（`readyOps()`）
- 可附加的对象（`attach(obj)` / `attachment()`，用于存业务上下文）

#### 3.4 工作流程

```
① 创建 Selector         Selector.open()
② Channel 设非阻塞      channel.configureBlocking(false)
③ 注册到 Selector       channel.register(selector, SelectionKey.OP_READ)
④ 循环轮询              while(true) { selector.select(); ... }
   ├─ select() 阻塞到至少一个 Channel 就绪
   ├─ selectedKeys() 拿到所有就绪的 key 集合
   ├─ 遍历每个 key，判断 readyOps() 是哪种事件
   └─ 根据事件类型处理（accept / read / write）
⑤ 处理完务必从集合中移除该 key   it.remove()
```

> ⚠️ **注意：** 注册到 Selector 的 Channel **必须是非阻塞模式**，否则会抛 `IllegalBlockingModeException`。

---

## 四、用 NIO 实现非阻塞服务器

下面给出一个**完整的、可运行**的 NIO 服务端示例，演示 Selector + ServerSocketChannel + SocketChannel 的经典配合。

### 1. 服务端

```java
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.util.Iterator;
import java.util.Set;

public class NioServer {

    public static void main(String[] args) throws Exception {
        // 1️⃣ 创建 Selector（事件监控中心）
        Selector selector = Selector.open();

        // 2️⃣ 创建服务端 Channel，绑定端口
        ServerSocketChannel server = ServerSocketChannel.open();
        server.socket().bind(new InetSocketAddress(8888));

        // 3️⃣ ⭐必须设为非阻塞模式才能注册到 Selector
        server.configureBlocking(false);

        // 4️⃣ 注册"接受连接"事件
        server.register(selector, SelectionKey.OP_ACCEPT);
        System.out.println("NIO Server 启动，监听 8888...");

        // 5️⃣ 事件循环（单线程照看所有 Channel）
        while (true) {
            // select() 阻塞，直到至少有一个 Channel 就绪；返回就绪 Channel 数量
            int readyCount = selector.select();
            if (readyCount == 0) continue;

            // 6️⃣ 拿到所有就绪的 key
            Set<SelectionKey> selectedKeys = selector.selectedKeys();
            Iterator<SelectionKey> it = selectedKeys.iterator();

            while (it.hasNext()) {
                SelectionKey key = it.next();

                // 7️⃣ ⭐处理完必须移除，否则下次还会拿到（重要陷阱！）
                it.remove();

                if (key.isAcceptable()) {
                    handleAccept(selector, server);
                } else if (key.isReadable()) {
                    handleRead(key);
                }
            }
        }
    }

    // 处理新连接
    private static void handleAccept(Selector selector, ServerSocketChannel server) throws Exception {
        SocketChannel client = server.accept();           // 接受新连接
        client.configureBlocking(false);                  // 客户端也设非阻塞
        client.register(selector, SelectionKey.OP_READ);  // 关注"可读"事件
        System.out.println("新连接接入：" + client.getRemoteAddress());
    }

    // 处理读事件
    private static void handleRead(SelectionKey key) throws Exception {
        SocketChannel client = (SocketChannel) key.channel();
        ByteBuffer buf = ByteBuffer.allocate(1024);
        int len = client.read(buf);

        if (len == -1) {
            // 客户端正常断开，read 返回 -1
            System.out.println("连接关闭：" + client.getRemoteAddress());
            key.cancel();
            client.close();
            return;
        }

        buf.flip();
        byte[] data = new byte[buf.remaining()];
        buf.get(data);
        System.out.println("收到 [" + client.getRemoteAddress() + "]：" + new String(data));

        // 简单回显
        ByteBuffer resp = ByteBuffer.wrap(("ECHO: " + new String(data)).getBytes());
        client.write(resp);
    }
}
```

### 2. 客户端（用 NIO，也可直接 telnet 测试）

```java
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;

public class NioClient {
    public static void main(String[] args) throws Exception {
        SocketChannel client = SocketChannel.open();
        client.configureBlocking(false);                       // 非阻塞

        // 发起连接（非阻塞下会立即返回）
        client.connect(new InetSocketAddress("127.0.0.1", 8888));

        // 等待连接完成
        while (!client.finishConnect()) {
            System.out.println("连接中...");
            Thread.sleep(10);
        }

        // 发送数据
        ByteBuffer buf = ByteBuffer.wrap("你好，NIO！".getBytes());
        client.write(buf);

        // 读取响应（简单起见，休眠后读一次）
        Thread.sleep(100);
        ByteBuffer readBuf = ByteBuffer.allocate(1024);
        int n = client.read(readBuf);
        if (n > 0) {
            readBuf.flip();
            System.out.println("收到回显：" + new String(readBuf.array(), 0, readBuf.limit()));
        }
        client.close();
    }
}
```

---

## 五、零拷贝（Zero-Copy）

### 1. 什么是零拷贝

**零拷贝**不是「完全不拷贝」，而是指**减少甚至消除 CPU 在内核态与用户态之间搬运数据**的次数。传统读写文件时，数据要在磁盘 → 内核缓冲区 → 用户缓冲区 → Socket 缓冲区 → 网卡之间反复搬运，CPU 负担重。

```
传统方式（4 次拷贝 + 4 次上下文切换）：
磁盘 ──DMA──> 内核缓冲区 ──CPU──> 用户空间 ──CPU──> Socket 缓冲 ──DMA──> 网卡

零拷贝（sendfile，2 次拷贝，CPU 不参与搬运）：
磁盘 ──DMA──> 内核缓冲区 ═════(直接引用)═════> 网卡
```

### 2. 两种底层方式

| 方式 | 全称 | 原理 | Java 实现 |
| --- | --- | --- | --- |
| **mmap** | memory map | 把内核缓冲区与用户空间**内存映射**到同一块物理内存，减少一次拷贝 | `FileChannel.map()` → `MappedByteBuffer` |
| **sendfile** | send file | 数据全程在**内核态**搬运，用户态完全不参与 | `FileChannel.transferTo()` / `transferFrom()` |

### 3. Java 中的实现

```java
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.channels.FileChannel;

public class ZeroCopyDemo {
    // ✅ transferTo：把当前 Channel 的数据直接传给目标 Channel（底层用 sendfile）
    public static void transferTo(String src, String dest) throws Exception {
        try (FileChannel in = new FileInputStream(src).getChannel();
             FileChannel out = new FileOutputStream(dest).getChannel()) {
            // 直接在内核态完成拷贝，不经过用户空间
            in.transferTo(0, in.size(), out);
        }
    }

    // ✅ transferFrom：从源 Channel 直接接收数据到当前 Channel
    public static void transferFrom(String src, String dest) throws Exception {
        try (FileChannel in = new FileInputStream(src).getChannel();
             FileChannel out = new FileOutputStream(dest).getChannel()) {
            out.transferFrom(in, 0, in.size());
        }
    }
}
```

### 4. 应用

零拷贝在主流中间件中被大量使用：

- **Kafka**：消费者拉取消息时用 `FileChannel.transferTo` 把日志段直接发送到网络，极大提升吞吐。
- **Netty**：通过 `FileRegion`（封装 `transferTo`）实现文件传输的零拷贝；`CompositeByteBuf` 在用户态合并多个 Buffer 也避免拷贝。
- **Nginx**：启用 `sendfile on;` 提升静态文件传输性能。

> 💡 **提示：** 面试中被问到「Kafka 为什么快」，零拷贝是必答的高频点之一。

---

## 六、NIO vs BIO vs AIO 三者对比

Java 三种 IO 模型是面试重灾区，核心区别在「**是否阻塞**」和「**是否同步**」。

| 对比项 | BIO | NIO | AIO（NIO.2） |
| --- | --- | --- | --- |
| 全称 | Blocking IO | New / Non-blocking IO | Asynchronous IO |
| 引入版本 | Java 1.0 | Java 1.4 | **Java 7** |
| **同步性** | 同步 | 同步 | **异步** |
| **阻塞性** | **阻塞** | **非阻塞** | **非阻塞** |
| **核心机制** | 流（Stream） | Buffer + Channel + Selector | Channel + **CompletionHandler 回调** |
| **数据到达后** | 线程一直等数据 | 线程主动轮询 / 被唤醒后读 | OS 读完回调通知应用 |
| **线程模型** | 一连接一线程 | 一线程管多连接 | 有效回调时才用线程 |
| **API 关键字** | `InputStream` / `ServerSocket` | `Selector` / `select()` | `AsynchronousChannel` / `Future` / `CompletionHandler` |
| **典型应用** | 传统 Tomcat BIO、简单 socket | **Netty、Tomcat NIO、Kafka** | Windows IOCP 较完善；Linux 支持有限 |
| **Linux 下现状** | — | 主流（epoll） | epoll 模拟，未真正异步，用得少 |

```
同步阻塞 BIO      同步非阻塞 NIO        异步非阻塞 AIO
┌──────┐          ┌──────┐             ┌──────┐
│ 等   │(干等)    │ 轮询 │(有空就问)   │ 注册 │(告诉 OS 读完叫我)
│ ────►│          │ ────►│             │ 回调 │
│ 读   │          │ 读   │             │ ────►│(OS 搬好数据后才通知)
└──────┘          └──────┘             └──────┘
线程全程占用        线程间歇工作          线程几乎不占用
```

> ⚠️ **注意：** 真正意义上的 AIO 需要 OS 支持（如 Windows IOCP）。Linux 下 Java AIO 底层仍基于 epoll 模拟，性能优势不明显，因此 Linux 服务端主流仍是 **NIO（Netty）**。

---

## 七、NIO 的应用场景

NIO 的高并发特性使其成为众多中间件和服务器的基石：

| 应用 | 如何使用 NIO |
| --- | --- |
| **Netty** | 基于 NIO（也支持 NIO.2）的高性能网络框架，封装了 Selector / ByteBuffer，解决了空轮询等问题。几乎所有 Java 高性能 RPC 都基于 Netty。 |
| **Tomcat** | 从 8.x 起默认使用 **NIO Connector**（`protocol="org.apache.coyote.http11.Http11NioProtocol"`），用少量线程处理大量请求。 |
| **Kafka** | 网络 IO 基于 NIO，文件传输用零拷贝（transferTo），是高吞吐的关键。 |
| **Dubbo** | RPC 通信底层基于 Netty（NIO），实现服务间异步高性能调用。 |
| **ZooKeeper** | 服务端使用 NIO 处理客户端连接与选举通信。 |
| **Mina / Grizzly** | 其它基于 NIO 的网络框架。 |

> 💡 **提示：** 实际工程中**很少直接用原生 NIO**（API 繁琐、易踩坑），多采用 **Netty** 这类封装良好的框架。但理解 NIO 原理是看懂 Netty 的前提。

---

## 八、注意事项与陷阱

### 1. `flip()` 忘记切换模式

最常见的坑：写完直接读，或读完直接写，没有用 `flip()` / `clear()` 切换指针。

```java
// ❌ 忘记 flip，position 在末尾，读不到数据
buffer.put("hello".getBytes());
// buffer.flip();  ← 漏了这一句
while (buffer.hasRemaining()) {
    System.out.print((char) buffer.get()); // 什么也读不到
}

// ✅ 写后必须 flip 才能读
buffer.put("hello".getBytes());
buffer.flip();
while (buffer.hasRemaining()) {
    System.out.print((char) buffer.get()); // hello
}
```

### 2. `clear()` 不删数据

`clear()` 只是重置指针，**旧数据依然在数组里**。如果只读了一半就 `clear()` 再写，写不完时会读到「半新半旧」的数据，建议读一半要写时用 `compact()`。

### 3. 字节序（Byte Order）

`ByteBuffer` 默认是**大端序**（高字节在前），与网络字节序一致。读写多字节基本类型（int / long）时要确保大小端一致，否则跨平台、跨语言通信会乱。

```java
ByteBuffer buf = ByteBuffer.allocate(8);
buf.order(ByteOrder.LITTLE_ENDIAN); // 显式指定小端
buf.putInt(1);
```

### 4. 直接缓冲区的释放

`allocateDirect` 分配的是堆外内存，**不归 GC 直接管**，频繁分配可能导致**堆外内存 OOM**。建议复用缓冲区或用池化方案（如 Netty 的 `PooledByteBufAllocator`）。

### 5. Selector 的空轮询 Bug（epoll bug）

在 Linux 下，由于 JDK / epoll 的 bug，`select()` 偶尔会**不该返回却立即返回 0**，导致事件循环变成**死循环（CPU 飙到 100%）**。

- **Netty 的修复**：通过「重建 Selector」解决——当空轮询阈值超过一定次数，创建一个新的 Selector，把旧 Channel 全部迁移过去。
- **原生 NIO 用户**：需要自己实现类似的检测与重建逻辑。

### 6. Channel 必须关闭

Channel 实现了 `Closeable`，用完务必 `close()`，否则可能**泄漏文件描述符（fd）**，导致 `Too many open files`。推荐 `try-with-resources`。

```java
// ✅ try-with-resources 自动关闭
try (FileChannel ch = FileChannel.open(path)) {
    // ...
}
```

### 7. `selectedKeys()` 处理后必须 `remove`

`selector.selectedKeys()` 返回的是**就绪集合的引用**，Selector 不会自动清空。处理完一个 key 必须 `it.remove()`，否则下一轮还会重复处理。

---

## 九、面试常见问题

### Q1：什么是 Java NIO？它和 BIO 有什么区别？

NIO 是 Java 1.4 引入的「新 IO」，支持**非阻塞**与**多路复用**。区别主要在四点：① NIO 面向**缓冲区（Buffer）**，BIO 面向**流（Stream）**；② NIO 的 Channel 是**双向**的，BIO 的 Stream 是**单向**的；③ NIO 支持**非阻塞**，BIO 是**阻塞**的；④ NIO 通过 **Selector** 实现**一个线程管理多个连接**，BIO 是「一个连接一个线程」。

### Q2：NIO 的三大核心是什么？

**Buffer（缓冲区）**、**Channel（通道）**、**Selector（选择器）**。Channel 负责连接数据源，Buffer 负责暂存数据，Selector 负责监听多个 Channel 的事件，三者配合实现非阻塞多路复用。

### Q3：Buffer 的四个核心属性是什么？它们的关系？

`capacity`（容量，固定不变）、`position`（当前位置，下一个读写位置）、`limit`（界限，可操作区的边界）、`mark`（标记位）。满足 `0 <= mark <= position <= limit <= capacity`。`flip()` 会把 `limit` 设为当前 `position`，`position` 归零，实现「写模式 → 读模式」的切换。

### Q4：Selector 的作用是什么？它是如何工作的？

Selector 是**多路复用器**，让一个线程同时监控多个 Channel 的事件。工作流程：创建 Selector → Channel 设非阻塞 → `register` 注册关注的事件 → 事件循环中 `select()` 阻塞等待就绪 → `selectedKeys()` 拿到就绪 key → 根据事件类型（accept / read / write）处理 → `remove` 已处理 key。

### Q5：什么是零拷贝？Java 中怎么实现？

零拷贝指减少 CPU 在内核态与用户态间搬运数据的次数（不是零次拷贝）。两种底层方式：**mmap**（内存映射，`MappedByteBuffer`）和 **sendfile**（数据全程在内核态，`FileChannel.transferTo` / `transferFrom`）。Kafka、Netty 都大量使用零拷贝提升吞吐。

### Q6：直接缓冲区和非直接缓冲区有什么区别？

直接缓冲区（`allocateDirect`）在**堆外内存**，IO 时少一次拷贝、速度快，但分配慢、不受 GC 直接管控，适合大文件 / 高 IO / 长生命周期场景；非直接缓冲区（`allocate`）在 **JVM 堆内**，分配快、由 GC 管理，适合一般业务和临时使用。

### Q7：NIO 和 AIO 的区别？为什么 Linux 下 AIO 用得少？

NIO 是**同步非阻塞**，应用线程仍要主动（被 Selector 唤醒后）去读数据；AIO 是**异步非阻塞**，数据由 OS 搬好后通过回调通知应用。真正异步需要 OS 支持（Windows IOCP），而 **Linux 下 Java AIO 底层仍用 epoll 模拟**，性能优势不明显，所以 Linux 服务端主流仍是 NIO（Netty）。

### Q8：Selector 的空轮询 Bug 是什么？Netty 是怎么解决的？

Linux 下 `select()` 偶尔会因 JDK / epoll 的 bug 在没有就绪事件时也立即返回 0，导致事件循环空转、CPU 飙升。Netty 的解决方案是**检测空轮询次数**，超过阈值后**新建一个 Selector**，把旧 Selector 上的 Channel 全部迁移到新 Selector 上，丢弃有问题的旧 Selector。

### Q9：NIO 文件操作（FileChannel）能注册到 Selector 吗？

**不能**。FileChannel 只支持**阻塞模式**，无法设置为非阻塞，因此不能注册到 Selector。Selector 只能用于网络 Channel（SocketChannel / ServerSocketChannel / DatagramChannel）。文件的高效传输靠**零拷贝**（transferTo）而非多路复用。

---

## 十、总结

- **NIO = New IO / Non-blocking IO**，Java 1.4 引入，核心是**非阻塞**与**多路复用**，解决 BIO「一个连接一个线程」的高并发瓶颈。
- **三大核心**：
  - **Buffer**：数据容器，靠 `capacity / position / limit / mark` 四个指针管理读写，掌握 `allocate → put → flip → get → clear` 五步即可。
  - **Channel**：双向通道，连接数据源；常用 `FileChannel`（阻塞，文件）、`SocketChannel` / `ServerSocketChannel`（可非阻塞，网络）。
  - **Selector**：多路复用器，一个线程监控多个 Channel 的事件（`OP_ACCEPT / OP_CONNECT / OP_READ / OP_WRITE`）。
- **零拷贝**：通过 `mmap` / `sendfile` 减少内核态与用户态间的数据搬运，是 Kafka、Netty 高吞吐的关键。
- **三种 IO 模型**：BIO 同步阻塞、NIO 同步非阻塞、AIO 异步非阻塞；Linux 服务端主流是 **NIO（Netty）**。
- **工程实践**：原生 NIO API 繁琐易踩坑（忘 flip、空轮询、fd 泄漏），实际多用 **Netty**；理解 NIO 原理是看懂 Netty 的前提。

> 🔗 **相关文档**：
> - 字节流：[字节流之输入流.md](./字节流之输入流.md) ｜ [字节流之输出流.md](./字节流之输出流.md)
> - 字符流：[字符流之输入流.md](./字符流之输入流.md) ｜ [字符流之输出流.md](./字符流之输出流.md)
> - 并发基础：[多线程.md](./多线程.md) ｜ [内存.md](./内存.md)
> - 反射 / 注解：[反射.md](./反射.md) ｜ [注解.md](./注解.md)
