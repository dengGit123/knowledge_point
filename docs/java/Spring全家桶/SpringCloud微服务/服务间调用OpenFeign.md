### 一、概述

> 📖 [Spring Cloud OpenFeign 官方文档](https://docs.spring.io/spring-cloud-openfeign/reference/) ｜ [OpenFeign GitHub](https://github.com/OpenFeign/feign)

**OpenFeign** 是一种**声明式 HTTP 客户端**——你定义一个 Java 接口 + 几个注解，OpenFeign 就自动帮你发起 HTTP 请求、解析响应，**像调用本地方法一样调用远程服务**。

大白话：调远程服务，最原始的方式是用 `RestTemplate` 手动拼 URL、手动发请求、手动解析 JSON，又啰嗦又容易错。OpenFeign 让你**只写接口**（声明要调哪个服务、哪个接口、传什么参数），它像变魔术一样自动把接口实现出来——你调 `userClient.findById(1)`，背后自动变成 HTTP 请求打到 user 服务。

| 你将学到 | 说明 |
| --- | --- |
| 为什么用 Feign | RestTemplate 的痛点 |
| 声明式调用 | 定义接口就能调 |
| 负载均衡 | 配合 LoadBalancer |
| 进阶配置 | 超时、日志、拦截器、降级 |

> 📌 本文承接 [[服务注册与发现]]，配合 [[熔断降级]] 使用。

---

### 二、调用方式演进

#### 1. RestTemplate（原始，啰嗦）

```java
@Service
public class OrderService {
    @Autowired
    private RestTemplate restTemplate;

    public User getUser(Long id) {
        // ❌ 手动拼 URL、手动指定服务名（加 @LoadBalanced）、手动解析
        String url = "http://user-service/users/" + id;
        return restTemplate.getForObject(url, User.class);
    }
}
```

问题：每个调用都要拼字符串、手动转对象，URL 一改全得改，难以维护。

#### 2. OpenFeign（声明式，优雅）

```java
// 定义接口，自动生成实现
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/users/{id}")
    User findById(@PathVariable Long id);
}

// 调用方像用本地 Bean 一样
@Service
public class OrderService {
    @Autowired
    private UserClient userClient;       // 注入「接口」，OpenFeign 自动给了实现

    public User getUser(Long id) {
        return userClient.findById(id);  // ✅ 像调本地方法，背后是 HTTP 调用
    }
}
```

---

### 三、OpenFeign 实战

#### 1. 依赖与启用

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>   <!-- 负载均衡 -->
</dependency>
```

```java
@SpringBootApplication
@EnableFeignClients      // ✅ 开启 Feign 客户端
public class OrderApplication { }
```

#### 2. 定义 Feign 接口

```java
@FeignClient(name = "user-service")     // name = 要调用的服务名（注册中心里的名字）
public interface UserClient {

    @GetMapping("/users/{id}")
    User findById(@PathVariable("id") Long id);

    @PostMapping("/users")
    User create(@RequestBody User user);

    @GetMapping("/users")
    List<User> list(@RequestParam("page") int page);
}
```

> 💡 **提示：** 接口里的注解（`@GetMapping`/`@PathVariable` 等）和写 [[../SpringMVC/请求与响应处理]] 的 Controller 一模一样——本质就是**用 Spring MVC 注解描述一次 HTTP 请求**。

#### 3. 注入并调用

```java
@Service
public class OrderService {
    @Autowired
    private UserClient userClient;

    public Order createOrder(Long userId) {
        User user = userClient.findById(userId);   // 远程调用，自动负载均衡
        // ... 业务逻辑
    }
}
```

---

### 四、负载均衡：LoadBalancer

`@FeignClient(name = "user-service")` 里的 `user-service` 在注册中心可能有多个实例。OpenFeign 自动整合 **Spring Cloud LoadBalancer**（取代已停更的 Ribbon），从多个实例里选一个：

```
userClient.findById(1)
    │
    ▼
OpenFeign 发现 name="user-service"
    │
    ▼
LoadBalancer 从注册中心拿到 user-service 的多个实例
    │
    ▼
按策略选一个（默认轮询）→ 192.168.1.11:8081
    │
    ▼
发起 HTTP 请求：GET http://192.168.1.11:8081/users/1
```

> 💡 **提示：** OpenFeign + LoadBalancer + 注册中心 = 声明式、负载均衡的远程调用，**全程不用关心 IP**。

---

### 五、进阶配置

#### 1. 超时控制

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          default:                # 对所有 Feign 客户端生效
            connect-timeout: 3000   # 连接超时 3s
            read-timeout: 5000      # 读取超时 5s
          user-service:           # 单独针对 user-service
            read-timeout: 10000
```

#### 2. 日志级别

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          default:
            logger-level: FULL    # FULL 打印完整请求/响应（调试用）
```

| 级别 | 输出内容 |
| --- | --- |
| `NONE` | 不输出（默认，**生产用**） |
| `BASIC` | 请求方法、URL、响应状态码、耗时 |
| `HEADERS` | BASIC + 请求/响应头 |
| `FULL` | HEADERS + 请求/响应体（**调试用**） |

> ⚠️ **注意：** 还要把接口包的日志级别设成 `DEBUG`（`logging.level.com.example.feign=debug`），否则 Feign 日志不输出。

#### 3. 请求拦截器（统一加 token）

```java
@Bean
public RequestInterceptor authInterceptor() {
    return template -> {
        // 每次远程调用前，自动往请求头加 token
        String token = SecurityContextHolder.getContext().getAuthentication().getCredentials().toString();
        template.header("Authorization", "Bearer " + token);
    };
}
```

> 💡 **提示：** 微服务间调用要**传递登录态**（token），用 `RequestInterceptor` 统一加，不用每个接口手动传。

---

### 六、整合 Sentinel 做降级

远程调用可能失败（超时、服务挂了）。配合 [[熔断降级]] 的 Sentinel，能在失败时自动走「**兜底逻辑**」，避免雪崩：

```java
@FeignClient(name = "user-service", fallback = UserClientFallback.class)
public interface UserClient {
    @GetMapping("/users/{id}")
    User findById(@PathVariable Long id);
}

// 降级类：实现 Feign 接口，方法返回兜底数据
@Component
public class UserClientFallback implements UserClient {
    @Override
    public User findById(Long id) {
        return new User(id, "默认用户");   // user-service 挂了就返回默认值
    }
}
```

---

### 七、常见问题与注意事项

> ⚠️ **注意：**
> - **`name` 必须对应注册中心的服务名**，否则找不到服务。
> - **GET 请求别用 `@RequestBody`**：HTTP GET 没有 body，Feign 会报错。用 `@RequestParam`。
> - **超时与重试的雪崩风险**：read-timeout 设很长 + 重试多次，会把调用方拖死。合理设超时。
> - **Feign 接口和 Provider 的 Controller 路径要一致**，否则 404。常把接口抽到公共模块共享。
> - **`@FeignClient` 不能和 `@RestController` 放同一个类**（一个是调用方、一个是提供方）。

> 💡 **提示：** 生产环境一定配超时 + 降级（fallback），否则远程服务的故障会通过 Feign 蔓延到调用方，引发**雪崩**。

---

### 八、总结

- **OpenFeign = 声明式 HTTP 客户端**，定义接口就能调远程服务，像调本地方法。
- **三步**：`@EnableFeignClients` → 定义 `@FeignClient` 接口 → 注入调用。
- **自动负载均衡**：配合 LoadBalancer，从注册中心多实例里轮询。
- **进阶**：超时、日志、`RequestInterceptor`（传 token）、`fallback`（降级）。
- **铁律**：生产必配超时 + 降级，防雪崩。

下一篇，统一入口——API 网关：[[API网关Gateway]]。
