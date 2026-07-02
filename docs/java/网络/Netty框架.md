### 一、概述

> 📖 [Netty 官方文档](https://netty.io/wiki/index.html) ｜ [Netty GitHub](https://github.com/netty/netty)

Netty 是一个**基于 Java NIO 的高性能网络通信框架**。它把原生 NIO 复杂的 API 封装得简单易用，解决了 NIO 的各种坑，成为 Java 领域网络编程的**事实标准**。

大白话：原生 NIO（[[IO模型]]）就像「手动挡汽车」——性能好但难开，要自己管 Selector、处理半包、处理断线重连，很容易写出 bug。Netty 是「自动挡」——把脏活累活都封装好了，你只管写业务逻辑。

**为什么几乎所有 Java 高性能网络组件都用 Netty？**

| 它解决的痛点 | 说明 |
| --- | --- |
| NIO API 复杂 | Netty 提供简洁的、声明式的 API |
| NIO 半包/粘包 | Netty 内置多种解码器处理 |
| 空轮询 bug | Netty 修复了 JDK epoll 空轮询导致 CPU 100% 的 bug |
| 断线重连 | Netty 提供现成机制 |
| 线程模型 | 内置主从 Reactor 线程模型 |
| 性能 | 零拷贝、内存池化，极致优化 |

> 💡 **提示：** Dubbo、RocketMQ、Spark、Elasticsearch、gRPC Java、Spring WebFlux 等知名项目，底层网络通信都用 Netty。

---

### 二、Netty 的核心组件

Netty 有几个核心概念，理解它们就理解了 Netty 的设计：

| 组件 | 作用 | 类比 |
| --- | --- | --- |
| **Channel** | 一个网络连接（socket 的抽象） | 一根管道 |
| **EventLoop** | 处理 Channel 上所有事件的循环（绑一个线程） | 值班员 |
| **EventLoopGroup** | 一组 EventLoop（线程池） | 值班组 |
| **ChannelPipeline** | 处理数据的「责任链」 | 流水线 |
| **ChannelHandler** | 流水线上的一个处理单元（编解码、业务） | 流水线工位 |
| **ByteBuf** | Netty 的数据容器（增强版 ByteBuffer） | 货箱 |
| **Bootstrap** | 客户端启动引导 | 启动器 |
| **ServerBootstrap** | 服务端启动引导 | 启动器 |

---

### 三、核心概念详解

#### 1. EventLoop 与 EventLoopGroup

- **EventLoop**：本质是一个**单线程执行器**，绑定一个 Selector，负责处理分配给它的所有 Channel 的事件
- 一个 Channel 一生只由一个 EventLoop 处理（绑定后不变）
- 一个 EventLoop 可以处理多个 Channel

```
EventLoopGroup（线程组）
 ├── EventLoop1（线程1） ── Channel1, Channel2
 ├── EventLoop2（线程2） ── Channel3
 └── EventLoop3（线程3） ── Channel4, Channel5, Channel6
```

#### 2. ChannelPipeline 与 ChannelHandler（责任链模式）

数据进出 Channel 时，会经过一条**流水线（Pipeline）**，上面挂着一串**处理器（Handler）**，每个处理器做一件事：

```
入站数据（读）：  Socket ──► [解码器] ──► [业务Handler] ──► 应用
出站数据（写）：  应用 ──► [业务Handler] ──► [编码器] ──► Socket
```

- **入站（Inbound）Handler**：处理读进来的数据（如把字节解码成对象）
- **出站（Outbound）Handler**：处理写出去的数据（如把对象编码成字节）

> 💡 **提示：** 这种「责任链」设计让你能灵活组合「编解码 + 加密 + 日志 + 业务」等处理器，互不干扰，非常优雅。

#### 3. ByteBuf

Netty 的数据缓冲区，比 NIO 的 `ByteBuffer` 强大得多：

| 特性 | 说明 |
| --- | --- |
| 读写指针分离 | `readerIndex` 和 `writerIndex` 分开，不用 flip |
| 池化 | 可复用，减少 GC（`PooledByteBufAllocator`） |
| 堆内/堆外 | 支持 `heapBuffer` 和 `directBuffer`（堆外，配合零拷贝） |
| 组合 | `CompositeByteBuf` 可逻辑合并多个 Buffer，不实际拷贝 |

---

### 四、Netty 的线程模型（主从 Reactor）

Netty 默认采用 [[IO多路复用]] 篇讲过的**主从 Reactor 多线程模型**：

```
                 bossGroup（主 Reactor，1个线程）
                         │ 只负责 accept 新连接
                         ▼
                 把新连接分配给
                         │
                 workerGroup（从 Reactor，N个线程）
              ┌──────────┼──────────┐
           EventLoop   EventLoop   EventLoop
           （读写+业务处理）
```

```java
// ✅ 主从 Reactor 两组 EventLoop
EventLoopGroup bossGroup = new NioEventLoopGroup(1);     // 接收连接
EventLoopGroup workerGroup = new NioEventLoopGroup();    // 处理读写（默认 CPU 核数×2）
```

> 💡 **提示：** `bossGroup` 通常 1 个线程就够（只接连接）；`workerGroup` 默认是 CPU 核数×2，负责所有已连接的 IO 读写。

---

### 五、入门示例：Netty 服务端

一个最简单的 Netty 服务端（收到消息原样回显）：

```java
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.string.StringDecoder;
import io.netty.handler.codec.string.StringEncoder;

public class NettyServer {
    public static void main(String[] args) throws Exception {
        // ① 两个线程组
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        EventLoopGroup workerGroup = new NioEventLoopGroup();

        try {
            // ② 服务端启动器
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(bossGroup, workerGroup)          // 设置主从线程组
                .channel(NioServerSocketChannel.class)       // 指定服务端 Channel 实现
                .option(ChannelOption.SO_BACKLOG, 128)       // 连接队列大小
                .childOption(ChannelOption.SO_KEEPALIVE, true) // 保持连接
                // ③ 给每个连接配置 Pipeline（责任链）
                .childHandler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) {
                        ChannelPipeline pipeline = ch.pipeline();
                        pipeline.addLast("decoder", new StringDecoder());  // 入站：字节→String
                        pipeline.addLast("encoder", new StringEncoder());  // 出站：String→字节
                        pipeline.addLast("handler", new MyServerHandler()); // 业务处理
                    }
                });

            // ④ 绑定端口启动
            ChannelFuture future = bootstrap.bind(8080).sync();
            System.out.println("Netty 服务端启动，端口 8080");

            // ⑤ 等待服务端关闭
            future.channel().closeFuture().sync();
        } finally {
            // 优雅关闭
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
    }
}

// 业务 Handler：继承入站处理器
class MyServerHandler extends ChannelInboundHandlerAdapter {
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) {
        System.out.println("收到: " + msg);
        ctx.writeAndFlush("echo: " + msg);   // 回显给客户端
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
        cause.printStackTrace();
        ctx.close();
    }
}
```

#### 对比原生 NIO

同样的功能，原生 NIO（见 [[IO模型]]）要自己写事件循环、遍历 selectedKeys、处理 Buffer flip、管半包……Netty 只需「**配 Pipeline + 写 Handler**」，清晰太多了。

---

### 六、Netty 客户端

```java
import io.netty.bootstrap.Bootstrap;
import io.netty.channel.*;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.string.*;

public class NettyClient {
    public static void main(String[] args) throws Exception {
        EventLoopGroup group = new NioEventLoopGroup();
        try {
            Bootstrap bootstrap = new Bootstrap();
            bootstrap.group(group)
                .channel(NioSocketChannel.class)
                .handler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel ch) {
                        ch.pipeline()
                            .addLast(new StringDecoder())
                            .addLast(new StringEncoder())
                            .addLast(new ChannelInboundHandlerAdapter() {
                                @Override
                                public void channelActive(ChannelHandlerContext ctx) {
                                    // 连接建立时发消息
                                    ctx.writeAndFlush("你好，Netty 服务端！");
                                }
                                @Override
                                public void channelRead(ChannelHandlerContext ctx, Object msg) {
                                    System.out.println("服务端回复: " + msg);
                                }
                            });
                    }
                });

            // 连接服务端
            ChannelFuture future = bootstrap.connect("127.0.0.1", 8080).sync();
            future.channel().closeFuture().sync();
        } finally {
            group.shutdownGracefully();
        }
    }
}
```

---

### 七、解决粘包/半包（核心能力）

TCP 是字节流无边界（见 [[TCP协议]]），会有粘包/半包。Netty 内置多种解码器，一行代码解决：

| 解码器 | 策略 |
| --- | --- |
| `FixedLengthFrameDecoder` | 固定长度切分 |
| `LineBasedFrameDecoder` | 按换行符切分 |
| `DelimiterBasedFrameDecoder` | 按自定义分隔符切分 |
| `LengthFieldBasedFrameDecoder` | **按消息头长度字段切分（最常用）** |

```java
// ✅ 在 Pipeline 最前面加解码器，自动处理半包
pipeline.addLast(new LengthFieldBasedFrameDecoder(1024, 0, 4, 0, 4));
//                       最大长度   长度字段偏移 长度字段字节数 ...
```

> 💡 **提示：** 用 Netty 写自定义协议，几乎都会用 `LengthFieldBasedFrameDecoder`（长度+内容的协议）配合编解码器。

---

### 八、Netty 为什么这么快

Netty 的性能优化手段：

| 手段 | 说明 |
| --- | --- |
| **主从 Reactor + 多路复用** | 极少线程扛海量连接（见 [[IO多路复用]]） |
| **零拷贝** | `FileRegion` 封装 transferTo；`CompositeByteBuf` 逻辑合并（见 [[零拷贝]]） |
| **ByteBuf 池化** | 复用缓冲区，减少 GC |
| **堆外内存** | 配合零拷贝，减少内核↔用户态拷贝 |
| **无锁串行化** | 一个 Channel 的事件在同一 EventLoop 单线程处理，无锁 |
| **高效的并发调度** | 自己实现的任务队列和定时任务 |

---

### 九、实际应用

| 领域 | 用 Netty 的项目 |
| --- | --- |
| RPC 框架 | Dubbo、gRPC Java |
| 消息队列 | RocketMQ、Kafka（部分） |
| 大数据 | Spark、Flink |
| 搜索 | Elasticsearch |
| 网关 | Spring Cloud Gateway、Zuul 2 |
| 游戏服务器 | Netty 是 Java 游戏服首选 |
| IM | 几乎所有 Java IM 底层都是 Netty |

> 💡 **提示：** 几乎所有需要「**高并发、长连接、自定义协议**」的 Java 场景，Netty 都是首选。

---

### 十、常见问题与注意事项

#### 1. 为什么要 `shutdownGracefully`？

EventLoopGroup 持有线程和资源，程序退出前必须优雅关闭，否则线程不会结束。

#### 2. 为什么 Handler 不要做耗时操作？

Handler 跑在 worker 的 EventLoop 线程上，**一个 EventLoop 处理多个连接**。如果某个 Handler 阻塞了，会拖慢它负责的所有连接。耗时业务（DB、远程调用）应**丢到业务线程池**异步处理。

#### 3. ChannelFuture 是什么？

Netty 的 IO 操作是异步的，返回 `ChannelFuture`（类似 [[IO模型]] AIO 的回调思想）。要 `.sync()` 等待完成，或 `.addListener()` 异步回调。

#### 4. Netty 用的是 BIO 还是 NIO？

默认 NIO（`NioEventLoopGroup`）。也提供 `EpollEventLoopGroup`（Linux 原生 epoll，更快）和 `OioEventLoopGroup`（BIO，基本不用）。

#### 5. 学习 Netty 的前提

先掌握 [[Socket通信]]（BIO 基础）、[[IO模型]]（NIO）、[[IO多路复用]]（Reactor 思想），否则会很难懂。

---

### 十一、总结

| 要点 | 说明 |
| --- | --- |
| 定位 | 基于 NIO 的高性能、易用网络框架 |
| 核心组件 | Channel、EventLoop、Pipeline、Handler、ByteBuf |
| 线程模型 | 主从 Reactor（bossGroup 接连接，workerGroup 处理 IO） |
| 编程模型 | 配置 Pipeline（责任链）+ 编写 Handler |
| 优势 | 简化 NIO、解决半包、高性能（零拷贝+池化+多路复用） |
| 地位 | Java 高性能网络编程的事实标准 |

Netty 是 Java 网络编程系列的「集大成者」——它把前面学的 BIO/NIO、多路复用、Reactor、零拷贝全部封装成了优雅的框架。掌握 Netty，才算真正进入了 Java 高性能网络编程的大门。

相关文档：[[IO模型]]、[[IO多路复用]]、[[零拷贝]]、[[网络编程基础]]、[[NIO]]。
