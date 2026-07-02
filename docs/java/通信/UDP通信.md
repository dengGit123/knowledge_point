### 一、概述

> 📖 [Java Datagram（Oracle 官方教程）](https://docs.oracle.com/javase/tutorial/networking/datagrams/)

UDP（User Datagram Protocol，用户数据报协议）是一种**无连接、不可靠、但速度快**的传输协议。Java 用 `DatagramSocket` 和 `DatagramPacket` 来实现 UDP 通信。

大白话：UDP 就像**寄明信片**——你把消息写在卡片上（打包成 DatagramPacket），写上地址（IP + 端口），扔进邮筒（send）就不管了。不保证对方一定收到，也不保证顺序，但胜在简单、快速。

与 TCP 的核心区别：**UDP 没有「建立连接」这一步**，发数据前不需要先握手，双方都是「想发就发」。

| 核心类 | 作用 |
| --- | --- |
| `DatagramSocket` | 收发数据报的「插座」，相当于邮筒 |
| `DatagramPacket` | 一个数据报包，包含**数据 + 目标地址 + 端口** |

---

### 二、核心原理

#### 1. UDP vs TCP 工作流程对比

```
TCP（要握手）：                      UDP（不握手）：
  服务端 accept() 等待                  接收方 receive() 等待
  客户端 connect() 连接                 发送方 send() 直接发
  建立连接后用流读写                    每次发都打包成 Packet
```

UDP **没有明确的客户端/服务端之分**——双方都只用 `DatagramSocket`，谁需要收谁就 `receive()`，谁需要发谁就 `send()`。但通常我们仍约定一个「接收方」一直监听，一个「发送方」主动发。

#### 2. DatagramPacket 的两种用法

```java
// ① 用于「发送」：必须指定 目标IP + 目标端口
DatagramPacket sendPacket = new DatagramPacket(data, length, 目标IP, 端口);

// ② 用于「接收」：只要一个空容器，装对方发来的数据（地址会自动填）
DatagramPacket receivePacket = new DatagramPacket(buffer, buffer.length);
```

---

### 三、基本用法

#### 1. 接收端（监听方）

```java
import java.net.DatagramPacket;
import java.net.DatagramSocket;

public class UdpReceiver {
    public static void main(String[] args) throws Exception {
        // ✅ 在 9090 端口监听（接收方要绑定端口）
        try (DatagramSocket socket = new DatagramSocket(9090)) {
            System.out.println("接收端启动，等待数据...");

            // 准备一个空容器接收数据
            byte[] buffer = new byte[1024];
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);

            // receive() 会阻塞，直到收到数据包
            socket.receive(packet);

            // 取出真实数据（按实际长度截取，避免尾部空字节）
            String msg = new String(packet.getData(), 0, packet.getLength(), "UTF-8");
            System.out.println("收到: " + msg);
            System.out.println("来自: " + packet.getAddress() + ":" + packet.getPort());
        }
    }
}
```

#### 2. 发送端

```java
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

public class UdpSender {
    public static void main(String[] args) throws Exception {
        // ✅ 发送方一般不需要指定端口，系统随机分配
        try (DatagramSocket socket = new DatagramSocket()) {
            String msg = "你好，UDP!";
            byte[] data = msg.getBytes("UTF-8");

            // 打包：数据 + 目标IP + 目标端口
            DatagramPacket packet = new DatagramPacket(
                data, data.length,
                InetAddress.getByName("127.0.0.1"), 9090
            );

            socket.send(packet);   // 发出去就完事，不等确认
            System.out.println("已发送");
        }
    }
}
```

**运行顺序：** 先启动接收端（`UdpReceiver`），再启动发送端（`UdpSender`）。

> 💡 **提示：** UDP 发送端如果不绑定端口，操作系统会自动分配一个临时端口。所以发送端通常「无主」，随时可以跑。

---

### 四、进阶用法

#### 1. 双向聊天（双方都能收发）

把发送和接收放到不同线程，就能实现双向通信：

```java
import java.net.*;
import java.util.Scanner;

public class UdpChat {
    public static void main(String[] args) throws Exception {
        DatagramSocket socket = new DatagramSocket(9090); // 本机监听端口

        // 线程1：专门负责接收
        new Thread(() -> {
            byte[] buffer = new byte[1024];
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
            while (true) {
                try {
                    socket.receive(packet);
                    System.out.println("收到: " +
                        new String(packet.getData(), 0, packet.getLength(), "UTF-8"));
                } catch (Exception e) {
                    break;
                }
            }
        }).start();

        // 主线程：负责发送（从控制台读取输入）
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNextLine()) {
            String line = scanner.nextLine();
            byte[] data = line.getBytes("UTF-8");
            // 发给对方（这里假设对方也在本机 9091 端口）
            socket.send(new DatagramPacket(
                data, data.length, InetAddress.getByName("127.0.0.1"), 9091));
        }
    }
}
```

#### 2. 广播（Broadcast）

UDP 的一大优势是支持**广播**——一次发送，局域网内所有机器都能收到。常见用途是设备发现（如投屏、智能家居配网）。

```java
// 发送广播
DatagramSocket socket = new DatagramSocket();
socket.setBroadcast(true);  // ✅ 必须开启广播

byte[] data = "DISCOVER".getBytes("UTF-8");
// 广播地址 255.255.255.255（或网段广播地址如 192.168.1.255）
DatagramPacket packet = new DatagramPacket(
    data, data.length, InetAddress.getByName("255.255.255.255"), 9090);
socket.send(packet);
```

#### 3. 多播（Multicast）

多播比广播更精细——只有「加入了多播组」的机器才能收到，适合一对多的高效分发（如直播流）。

```java
// 接收端加入多播组
MulticastSocket socket = new MulticastSocket(9090);
InetAddress group = InetAddress.getByName("230.0.0.1");  // 多播地址（D 类）
socket.joinGroup(group);    // ✅ 加入组

byte[] buffer = new byte[1024];
DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
socket.receive(packet);     // 只有组内成员能收到
```

---

### 五、完整 API 参考

#### `DatagramSocket` 常用方法

| 方法 | 说明 |
| --- | --- |
| `DatagramSocket()` | 不绑定端口（发送方常用） |
| `DatagramSocket(int port)` | 绑定到指定端口（接收方常用） |
| `send(DatagramPacket p)` | 发送一个数据包 |
| `receive(DatagramPacket p)` | 接收一个数据包（阻塞） |
| `setSoTimeout(int timeout)` | 设置 receive 的超时时间 |
| `setBroadcast(boolean)` | 是否允许广播 |
| `close()` | 关闭 socket |

#### `DatagramPacket` 常用方法

| 方法 | 说明 |
| --- | --- |
| `getData()` | 获取数据字节数组 |
| `getLength()` | 获取实际数据长度 |
| `getAddress()` | 获取对方的 IP |
| `getPort()` | 获取对方的端口 |
| `setData(byte[])` | 重新设置数据 |

---

### 六、实际应用场景

| 场景 | 为什么用 UDP |
| --- | --- |
| DNS 域名解析 | 查询小而快，丢一次重查即可 |
| 视频直播 / 语音通话 | 实时性优先，丢几帧无所谓 |
| 在线游戏 | 玩家位置高频更新，旧数据丢了不要重传 |
| 心跳检测 / 局域网设备发现 | 广播能力，一台机器发现局域网所有设备 |
| TFTP 简单文件传输 | 协议简单 |

---

### 七、常见问题与注意事项

#### 1. 数据包大小限制

UDP 单个数据报理论上最大 65507 字节，但**实际建议不超过 MTU（约 1472 字节）**，否则会被分片，分片丢了整个包就废了。

> ⚠️ **注意：** 别用 UDP 传大文件，超过 MTU 容易因丢包导致整包丢失。

#### 2. `receive` 一直阻塞

`receive()` 默认无限阻塞。生产环境建议设置超时：

```java
socket.setSoTimeout(5000);  // 5 秒没收到就抛 SocketTimeoutException
```

#### 3. 乱码

和 TCP 一样，字节数组转字符串必须指定编码：`new String(data, 0, len, "UTF-8")`。

#### 4. 不可靠——会丢包

UDP 不保证送达。如果业务要求可靠，**应用层需要自己做确认 + 重传机制**（这正是 TCP 帮你做的事）。

#### 5. 取数据要用实际长度

```java
// ❌ 用 buffer 整个长度，会包含大量尾部空字节
String msg = new String(packet.getData(), "UTF-8");

// ✅ 用 getLength() 截取真实长度
String msg = new String(packet.getData(), 0, packet.getLength(), "UTF-8");
```

---

### 八、与 TCP（Socket）对比

| 对比项 | UDP（DatagramSocket） | TCP（Socket） |
| --- | --- | --- |
| 连接 | 无连接 | 面向连接（三次握手） |
| 可靠性 | 不保证送达 | 保证送达、有序 |
| 数据形式 | 数据报（Packet） | 字节流（Stream） |
| 速度 | 快 | 相对慢 |
| 通信方式 | 一对一 / 广播 / 多播 | 仅一对一 |
| 资源占用 | 少 | 多（需维护连接状态） |
| 典型应用 | DNS、直播、游戏 | HTTP、文件传输、邮件 |

选型一句话：**丢了没事、图个快 → UDP；一个字节都不能错 → TCP。** 详见 [[通信基础]] 的协议对比。

---

### 九、总结

- UDP 是无连接、不可靠、快速的协议，用 `DatagramSocket` 收发 `DatagramPacket`
- 接收方绑定端口 `receive()`，发送方 `send()` 直接发，无需握手
- 取数据务必用 `getLength()` 截取真实长度，注意编码
- UDP 支持**广播 / 多播**，这是 TCP 做不到的
- 适合实时性高、允许丢包的场景（直播、游戏、DNS、设备发现）
