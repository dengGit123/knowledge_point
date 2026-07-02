### 一、概述

RPC（Remote Procedure Call，远程过程调用）是一种通信思想：**让你调用「另一台机器上的方法」，就像调用本地方法一样自然**。

大白话：平时你写 `userService.getUser(1)`，这个方法在你自己的程序里执行。RPC 做的事是——`userService` 对象其实在另一台服务器上，但你调用它时**完全感觉不到**，代码写法和本地一模一样。RPC 框架在背后偷偷帮你把请求通过网络发过去，把结果取回来。

> 💡 **提示：** RPC 不是某个具体 API，而是一种**编程模型 + 一堆框架实现**。Java 自带了最古老的 RMI，业界主流则是 Dubbo、gRPC 等。

| 概念 | 说明 |
| --- | --- |
| **RPC** | 一种思想：远程调用像本地调用一样 |
| **RMI** | Java 自带的 RPC 实现（Remote Method Invocation） |
| **Stub（存根）** | 客户端的「代理对象」，伪装成本地对象 |
| **Skeleton（骨架）** | 服务端接收请求并调用真实对象（新版 Java 已内置） |

---

### 二、核心原理

#### 1. RPC 调用流程

```
   客户端                                          服务端
┌──────────┐                                ┌──────────────────┐
│ 调用      │                                │ 真实对象          │
│ userService.getUser(1)                     │ UserServiceImpl   │
│    │                                       └────────▲─────────┘
│    ▼                                       网络传输 │ 调用
│ Stub 代理  │ ──① 序列化请求(方法名+参数)──► │ Skeleton 接收    │
│ (本地代表) │                                │ 反序列化→找到方法 │
│           │ ◄──② 序列化返回结果─────────── │ 执行→返回结果     │
│ 返回结果给调用方                              └──────────────────┘
└──────────┘
```

完整一次 RPC 调用步骤：

1. 客户端调用本地的**代理对象（Stub）**
2. Stub 把「调用哪个方法、参数是什么」**序列化**成字节
3. 通过**网络**（TCP/HTTP）发给服务端
4. 服务端**反序列化**，找到对应的真实对象和方法，执行
5. 把执行结果序列化后**网络返回**
6. 客户端 Stub 反序列化，把结果交给调用方

> 💡 **提示：** 序列化是 RPC 的关键环节，对象要在网络传输必须能被序列化。详见 [[序列化和反序列化]]。

#### 2. RPC 的核心组成

一个完整 RPC 框架通常包含五大部件：

| 部件 | 作用 |
| --- | --- |
| **客户端（Caller）** | 发起调用的一方 |
| **客户端 Stub** | 代理对象，封装序列化、网络发送 |
| **网络传输** | 通信通道（TCP、HTTP、Netty） |
| **服务端 Stub** | 接收请求，反序列化，调用真实方法 |
| **服务端（Callee）** | 真正提供方法实现的对象 |

---

### 三、Java RMI 基本用法

RMI 是 Java 原生的 RPC，虽然现在很少用，但理解它有助于掌握 RPC 原理。

#### 1. 定义远程接口

远程接口必须 `extends Remote`，每个方法要声明 `throws RemoteException`：

```java
import java.rmi.Remote;
import java.rmi.RemoteException;

// ✅ 远程接口必须继承 Remote
public interface HelloService extends Remote {
    String sayHello(String name) throws RemoteException;
}
```

#### 2. 实现远程接口

实现类必须 `extends UnicastRemoteObject`，这样才能作为远程对象导出：

```java
import java.rmi.RemoteException;
import java.rmi.server.UnicastRemoteObject;

public class HelloServiceImpl extends UnicastRemoteObject implements HelloService {

    // ✅ UnicastRemoteObject 要求显式构造方法声明异常
    protected HelloServiceImpl() throws RemoteException {
        super();
    }

    @Override
    public String sayHello(String name) throws RemoteException {
        return "你好, " + name + "!";
    }
}
```

#### 3. 服务端：注册远程对象

```java
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class RmiServer {
    public static void main(String[] args) throws Exception {
        // 创建远程对象
        HelloService service = new HelloServiceImpl();

        // 创建本地注册表，端口 1099
        Registry registry = LocateRegistry.createRegistry(1099);
        // 绑定名字 → 远程对象
        registry.rebind("HelloService", service);

        System.out.println("RMI 服务端启动...");
    }
}
```

#### 4. 客户端：查找并调用

```java
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;

public class RmiClient {
    public static void main(String[] args) throws Exception {
        // 查找服务端的注册表
        Registry registry = LocateRegistry.getRegistry("127.0.0.1", 1099);

        // 根据名字找到远程对象的「代理」（Stub）
        HelloService service = (HelloService) registry.lookup("HelloService");

        // ✅ 调用远程方法，写法和本地一模一样
        String result = service.sayHello("张三");
        System.out.println(result);   // 你好, 张三!
    }
}
```

**运行顺序：** 先启动 `RmiServer`，再启动 `RmiClient`。

> 💡 **提示：** 客户端拿到的 `service` 其实是个**网络代理**，调用 `sayHello` 时数据会发到服务端执行，但代码看起来和调本地方法没区别——这就是 RPC 的魅力。

---

### 四、主流 RPC 框架对比

RMI 只用 Java、且只适合学习。生产环境几乎都用第三方框架：

| 框架 | 出品 | 特点 | 适用场景 |
| --- | --- | --- | --- |
| **Dubbo** | 阿里 | Java 生态、配合 Spring、国内主流 | 国内微服务 |
| **gRPC** | Google | 跨语言、基于 HTTP/2、Protobuf 序列化 | 多语言微服务 |
| **Spring Cloud OpenFeign** | Spring | 声明式 HTTP 调用，本质是 HTTP | Spring Cloud 体系 |
| **Thrift** | Facebook | 跨语言、二进制高效 | 多语言、高性能 |
| **RMI** | Java 官方 | 仅 Java、古老 | 学习理解 RPC 原理 |

#### Dubbo 调用示例（概念）

```java
// 服务提供者：把自己注册到注册中心
@Service   // Dubbo 的 @Service
public class UserServiceImpl implements UserService {
    public User getUser(Long id) {
        return userDao.findById(id);
    }
}

// 服务消费者：声明要用的服务（远程代理）
@Reference  // Dubbo 注入远程代理
private UserService userService;

// 调用方式完全和本地一样
User user = userService.getUser(1L);
```

#### Feign 调用示例（本质是 HTTP）

```java
// 声明一个接口，Feign 自动生成 HTTP 调用的代理
@FeignClient(name = "user-service")
public interface UserApi {
    @GetMapping("/users/{id}")
    User getUser(@PathVariable("id") Long id);
}

// 注入后调用，底层是发 HTTP 请求
User user = userApi.getUser(1L);
```

> 💡 **提示：** Feign 严格说是「声明式 HTTP 客户端」，底层是 HTTP 而非自定义 TCP 协议，但使用体验和 RPC 一致，所以常被归入 RPC 范畴。

---

### 五、RPC vs HTTP API

| 对比项 | RPC（如 Dubbo、gRPC） | HTTP API（RESTful） |
| --- | --- | --- |
| 通信协议 | 通常自定义 TCP（或 HTTP/2） | HTTP |
| 序列化 | 二进制（Protobuf、Hessian），高效 | 多为 JSON，可读性好 |
| 调用体验 | 像调本地方法 | 拼 URL、构造请求 |
| 跨语言 | gRPC、Thrift 支持；Dubbo 偏 Java | 天然跨语言 |
| 性能 | 高（二进制 + 长连接） | 相对低（文本 + 头开销） |
| 适用场景 | 内部微服务高频调用 | 对外开放 API、前后端交互 |

**选型建议：**
- 内部微服务、追求性能、Java 体系 → **Dubbo**
- 多语言微服务 → **gRPC**
- 对外开放、前后端、第三方接入 → **RESTful + HTTP**（参考 [[HTTP通信]]）

---

### 六、实际应用场景

| 场景 | 说明 |
| --- | --- |
| 微服务间调用 | 订单服务调用户服务查用户信息 |
| 分布式系统协作 | 多个服务节点协同完成任务 |
| 服务网关后端聚合 | 网关把请求分发给多个内部服务 |
| 大数据 / 计算任务分发 | 调度节点把任务发给计算节点 |

---

### 七、常见问题与注意事项

#### 1. 序列化兼容性

RPC 传对象依赖序列化。**接口/实体改动要注意向后兼容**（比如加字段 OK，删字段、改类型可能导致旧客户端反序列化失败）。详见 [[序列化和反序列化]]。

#### 2. 超时与重试

网络调用必须设**超时**，否则服务端慢或宕机会拖垮调用方：

```java
// Dubbo 配置超时（示例）
@Reference(timeout = 3000)   // 3 秒超时
private UserService userService;
```

#### 3. 服务发现与注册中心

RPC 框架通常配合**注册中心**（Nacos、Zookeeper、Eureka）。服务端启动时注册地址，消费者从注册中心动态获取，而不是写死 IP。

#### 4. 容错与降级

调用失败时要考虑：重试？熔断？降级返回默认值？成熟的 RPC 框架（Dubbo、Spring Cloud）都内置了这些能力。

#### 5. 不要循环远程调用

远程调用比本地调用慢几个数量级，**避免在循环里高频 RPC**，尽量批量调用。

---

### 八、总结

- RPC 的核心是：**让远程调用像本地调用一样**，背后是 代理 + 序列化 + 网络传输
- Java 原生 RPC 是 RMI（`Remote` 接口 + `UnicastRemoteObject` + 注册表），适合理解原理
- 生产环境用 Dubbo（Java 生态）或 gRPC（跨语言），Spring Cloud 用 Feign
- RPC 比 HTTP 性能高、调用体验好，适合**内部微服务**；对外 API 仍用 RESTful
- 关键配套：注册中心、超时重试、容错降级、序列化兼容

相关文档：[[通信基础]]、[[Socket通信]]、[[HTTP通信]]、[[序列化和反序列化]]。
