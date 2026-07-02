### 一、概述

> 📖 [Java NIO（Oracle）](https://docs.oracle.com/javase/8/docs/api/java/nio/package-summary.html) ｜ [Java AIO / AsynchronousChannel](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/nio/channels/AsynchronousChannel.html)

BIO、NIO、AIO 是 Java 网络编程里**最核心的三种 IO 模型**。它们决定了「服务端怎么同时处理大量客户端连接」。

大白话：想象你开了家餐厅，客人（客户端连接）络绎不绝：

- **BIO**：一个服务员盯一桌客人，客人不点菜服务员就傻站着——客人一多，服务员（线程）就不够了
- **NIO**：一个服务员轮流看所有桌子（轮询），哪桌举手了就去哪桌——一个服务员能管很多桌
- **AIO**：客人点完菜自己扫码付，付完系统通知厨房——服务员根本不用盯，干完活系统叫你

| 模型 | 全称 | 一句话 |
| --- | --- | --- |
| **BIO** | Blocking IO | 同步阻塞，一连接一线程 |
| **NIO** | Non-blocking IO | 同步非阻塞，一个线程管多个连接（多路复用） |
| **AIO** | Asynchronous IO | 异步非阻塞，操作完成自动回调 |

> 💡 **提示：** 这三种模型的本质区别，是上一节 [[网络编程基础]] 讲的「阻塞/非阻塞」「同步/异步」组合。

---

### 二、BIO（同步阻塞）

#### 1. 工作方式

BIO（Blocking IO）是传统的 IO 模型，[[Socket通信]] 用的就是 BIO。

```
服务端：
  accept()  → 没有客户端连接时，阻塞等待
  read()    → 没有数据可读时，阻塞等待
```

**核心问题**：一个线程只能处理一个连接，且这个线程大部分时间在「阻塞等待」，浪费严重。

#### 2. 多客户端怎么办？

只能「**一个连接一个线程**」：

```
客户端1 ──► 线程1（大部分时间阻塞）
客户端2 ──► 线程2（大部分时间阻塞）
客户端3 ──► 线程3（大部分时间阻塞）
...
```

#### 3. BIO 的痛点

- 连接数 = 线程数，**上万连接就要上万线程**，系统扛不住
- 线程切换开销大，内存占用高
- 大部分线程都在阻塞，资源严重浪费

> ⚠️ **注意：** BIO 只适合**连接数少、且每个连接要长时间处理**的场景（如内部管理系统）。高并发场景必须用 NIO。

#### 4. 优化：伪异步 IO（线程池）

用线程池限制线程数量，避免无限开线程，但**本质上还是 BIO**，连接数仍受线程池大小限制：

```java
ExecutorService pool = Executors.newFixedThreadPool(100);
while (true) {
    Socket client = server.accept();
    pool.execute(() -> handle(client));  // 交给线程池处理
}
```

---

### 三、NIO（同步非阻塞 + 多路复用）

#### 1. 三大核心组件

NIO（Java 1.4 引入）围绕三个核心组件：

| 组件 | 作用 | 类比 |
| --- | --- | --- |
| **Buffer（缓冲区）** | 数据读写都经过缓冲区 | 装货的箱子 |
| **Channel（通道）** | 数据的「双向」通道，可读可写 | 运货的管道 |
| **Selector（选择器）** | 一个线程监控多个 Channel 的事件 | 值班调度员 |

> 💡 **提示：** BIO 是「流」（单向、阻塞），NIO 是「Channel + Buffer」（双向、非阻塞）+ Selector（多路复用）。

#### 2. 工作方式

```
① 所有客户端 Channel 注册到 Selector
② Selector 轮询哪些 Channel 有事件（连接到达/数据可读/可写）
③ 哪个 Channel 准备好了，就处理哪个，没准备好的不阻塞等待
④ 一个线程就能管理成千上万个连接
```

```
            ┌── Channel1（有数据）──► 处理
一个线程 ── Selector ──┼── Channel2（无数据）──► 跳过
            └── Channel3（新连接）──► accept
```

#### 3. NIO 服务端骨架代码

```java
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.net.InetSocketAddress;
import java.util.Iterator;

public class NioServer {
    public static void main(String[] args) throws Exception {
        // ① 打开 Selector（选择器）
        Selector selector = Selector.open();

        // ② 打开 ServerSocketChannel，绑定端口
        ServerSocketChannel serverChannel = ServerSocketChannel.open();
        serverChannel.bind(new InetSocketAddress(8080));
        serverChannel.configureBlocking(false);   // ✅ 关键：设为非阻塞

        // ③ 把 serverChannel 注册到 selector，监听「连接到达」事件
        serverChannel.register(selector, SelectionKey.OP_ACCEPT);

        System.out.println("NIO 服务端启动...");

        // ④ 事件循环
        while (true) {
            selector.select();   // 阻塞直到有事件发生（只等「事件」，不等单个连接）

            // 遍历所有就绪的事件
            Iterator<SelectionKey> keys = selector.selectedKeys().iterator();
            while (keys.hasNext()) {
                SelectionKey key = keys.next();
                keys.remove();   // ✅ 处理完要移除，否则重复处理

                if (key.isAcceptable()) {
                    // 新连接到达
                    SocketChannel client = serverChannel.accept();
                    client.configureBlocking(false);
                    client.register(selector, SelectionKey.OP_READ);  // 监听读事件
                } else if (key.isReadable()) {
                    // 某个客户端有数据可读
                    SocketChannel client = (SocketChannel) key.channel();
                    ByteBuffer buffer = ByteBuffer.allocate(1024);
                    int len = client.read(buffer);   // 非阻塞读
                    if (len > 0) {
                        buffer.flip();
                        System.out.println("收到: " + new String(buffer.array(), 0, len));
                    }
                }
            }
        }
    }
}
```

> 💡 **提示：** NIO 编程较复杂，理解重点在于「**一个线程 + Selector 轮询多个 Channel**」。实际开发很少手写原生 NIO，而是用 [[Netty框架]] 封装。

#### 4. NIO 的优势

- **一个线程管多个连接**，连接数不再受线程数限制
- 线程不阻塞在单个连接上，利用率高
- 适合**高并发、连接多但每个连接传输量不大**的场景（如聊天室、IM）

#### 5. NIO 还是「同步」

注意：NIO 的 `read()` 虽然不阻塞了，但**读写数据仍然是线程自己去做的**（同步）。Selector 的 `select()` 会阻塞直到有事件——所以 NIO 是「**同步非阻塞**」。

---

### 四、AIO（异步非阻塞）

#### 1. 工作方式

AIO（Java 7 引入，Asynchronous IO）是真正的**异步**：

```
① 应用发起 read，立即返回（不阻塞、不等）
② 操作系统在后台完成数据读取
③ 读完后，操作系统回调通知应用「数据好了，给你」
```

应用**完全不用轮询**，操作系统做完后**主动通知**（事件回调 / Future）。

#### 2. AIO 示例（回调方式）

```java
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.nio.channels.CompletionHandler;

public class AioServer {
    public static void main(String[] args) throws Exception {
        AsynchronousServerSocketChannel server =
            AsynchronousServerSocketChannel.open().bind(new InetSocketAddress(8080));

        // 异步接收连接，传入回调
        server.accept(null, new CompletionHandler<AsynchronousSocketChannel, Void>() {
            @Override
            public void completed(AsynchronousSocketChannel client, Void attachment) {
                server.accept(null, this);  // 继续接收下一个连接

                ByteBuffer buffer = ByteBuffer.allocate(1024);
                // 异步读，再传一个回调
                client.read(buffer, null, new CompletionHandler<Integer, Void>() {
                    @Override
                    public void completed(Integer len, Void attachment) {
                        System.out.println("收到: " + new String(buffer.array(), 0, len));
                    }
                    @Override
                    public void failed(Throwable exc, Void attachment) {
                        exc.printStackTrace();
                    }
                });
            }
            @Override
            public void failed(Throwable exc, Void attachment) {
                exc.printStackTrace();
            }
        });

        System.out.println("AIO 服务端启动...");
        Thread.currentThread().join();  // 防止主线程退出
    }
}
```

#### 3. AIO 的现状

| 平台 | 支持 |
| --- | --- |
| Linux | 底层用 epoll 模拟（Java AIO 在 Linux 上表现一般） |
| Windows | 原生 IOCP 支持，性能好 |

> ⚠️ **注意：** 实践中，**AIO 在 Java 服务端并未大规模普及**。Netty 等主流框架仍然基于 NIO（因为 Linux 下 AIO 没有明显优势，且 NIO + Reactor 模式已经足够高效）。AIO 更多用于 Windows 环境。

---

### 五、三种模型对比（核心！）

| 对比项 | BIO | NIO | AIO |
| --- | --- | --- | --- |
| 阻塞方式 | 同步阻塞 | 同步非阻塞 | 异步非阻塞 |
| 连接处理 | 一连接一线程 | 一线程管多连接（多路复用） | 操作系统回调通知 |
| 核心 API | `ServerSocket`/`Socket` | `Channel`/`Selector`/`Buffer` | `AsynchronousChannel` |
| 线程数 | 与连接数相等 | 少量线程即可 | 少量线程即可 |
| 编程难度 | 简单 | 复杂 | 较复杂（回调地狱） |
| 吞吐量 | 低 | 高 | 高 |
| 适用场景 | 连接少、长连接 | 高并发、短数据 | 需要真正异步 |
| 典型框架 | 传统 Socket 程序 | **Netty、Mina** | 相对少 |

#### 形象类比（餐厅模型）

| 模型 | 类比 |
| --- | --- |
| BIO | 一桌一服务员，客人发呆服务员也干等 |
| NIO | 一个服务员（Selector）轮流巡查所有桌子 |
| AIO | 客人自助点单系统，点完系统通知厨房 |

---

### 六、为什么 NIO 能扛高并发

关键在 [[IO多路复用]]：一个线程通过 Selector（底层是 Linux 的 epoll），同时**监听成千上万个 Channel 的事件**，哪个有数据就处理哪个。线程不阻塞在单个连接上，所以用极少的线程就能处理海量连接。

这正是 Redis、Nginx、Netty 等高性能组件的核心原理。

---

### 七、实际应用场景

| 场景 | 推荐模型 |
| --- | --- |
| 内部管理后台、连接数 < 几百 | BIO（简单够用） |
| IM 聊天、弹幕、推送（海量连接） | NIO（用 Netty） |
| 文件传输 | NIO（配合零拷贝，见 [[零拷贝]]） |
| 需要真正异步、Windows 平台 | AIO |

> 💡 **提示：** 实际 Java 高并发网络编程，**NIO + Netty 是绝对主流**。理解 BIO/NIO/AIO 的原理即可，业务里直接用 Netty。

---

### 八、常见问题与注意事项

#### 1. NIO 的 Buffer 为什么要 flip？

Buffer 有 `position`（当前位置）和 `limit` 指针。写完后要读，必须 `flip()` 把指针复位，否则读不到刚写的数据。

#### 2. NIO 的 selectedKeys 处理完要 remove

遍历 `selectedKeys()` 后，处理过的 key 必须 `remove()`，否则下一轮会重复处理同一个事件。

#### 3. BIO 一定比 NIO 慢吗？

不一定。连接少时 BIO 简单且开销小，可能更快。**NIO 的优势在「连接数多」时才体现**。别盲目追求 NIO。

#### 4. Java 的 NIO 和操作系统的「非阻塞 IO」

Java NIO = 非阻塞 IO + 多路复用（Selector）。其高性能主要来自多路复用（epoll），而非「非阻塞」本身。

#### 5. Netty 用的哪个？

Netty 主要基于 NIO（`NioEventLoopGroup`），也有 OIO（BIO）和 epoll 原生实现可选。

---

### 九、总结

| 模型 | 本质 | 一句话 |
| --- | --- | --- |
| **BIO** | 同步阻塞 | 一连接一线程，线程傻等 |
| **NIO** | 同步非阻塞 + 多路复用 | 一线程轮询管多连接 |
| **AIO** | 异步非阻塞 | OS 做完回调通知 |

演进逻辑：**BIO 线程浪费太多 → NIO 用多路复用让一个线程管多连接 → AIO 连轮询都省了，做完直接通知**。

理解三种模型的本质，是迈向高性能网络编程（[[IO多路复用]]、[[Netty框架]]）的必经之路。

相关文档：[[网络编程基础]]、[[Socket通信]]、[[IO多路复用]]、[[Netty框架]]、[[NIO]]。
