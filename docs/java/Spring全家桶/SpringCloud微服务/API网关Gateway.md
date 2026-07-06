### 一、概述

> 📖 [Spring Cloud Gateway 官方文档](https://docs.spring.io/spring-cloud-gateway/reference/)

**API 网关（Gateway）** 是微服务的「**统一入口**」——所有外部请求先到网关，再由网关路由到具体的内部服务。它把鉴权、限流、日志、跨域这些**横切关注点**集中在网关处理，内部服务就能专注于业务。

大白话：没有网关，前端得记几十个服务的地址，还要每个服务自己搞登录校验、跨域。有了网关，前端只认一个地址（网关），网关像「**大厦前台**」——统一做安检（鉴权）、指路（路由）、必要时限流（人多时控制进入），再把客人送到对应楼层（服务）。

| 你将学到 | 说明 |
| --- | --- |
| 网关的作用 | 路由、鉴权、限流、跨域 |
| 三大核心 | Route / Predicate / Filter |
| 路由配置 | yml 配置 + 编程式 |
| 全局过滤器 | 自定义鉴权 |

> 📌 本文承接 [[微服务架构概述]]，是微服务对外暴露的统一入口。

---

### 二、网关的作用

| 职责 | 说明 |
| --- | --- |
| **路由转发** | 把请求转发到对应的内部服务 |
| **统一鉴权** | 在网关校验登录/权限，内部服务不用重复校验 |
| **限流** | 防止恶意流量冲垮服务 |
| **跨域处理（CORS）** | 统一处理跨域，内部服务不用各自配 |
| **日志监控** | 统一记录访问日志 |
| **协议转换** | 如外部 HTTP 转 gRPC |
| **负载均衡** | 配合注册中心，转发时负载均衡 |

> 💡 **提示：** 网关是「**所有请求的必经之路**」，所以它必须**高可用**（一般集群部署）且**高性能**（否则成为瓶颈）。Spring Cloud Gateway 基于 WebFlux + Netty，非阻塞，性能很好。

---

### 三、Spring Cloud Gateway vs Zuul

| 对比 | Zuul 1.x | Zuul 2.x | Spring Cloud Gateway |
| --- | --- | --- | --- |
| 模型 | **阻塞**（Servlet） | 非阻塞（Netty） | **非阻塞**（WebFlux + Netty） |
| 性能 | 一般 | 好 | **好** |
| 现状 | Netflix 内部 | 停滞 | **Spring 官方主推** |
| 推荐 | 否 | 否 | **是** ✅ |

新项目一律用 Spring Cloud Gateway。

---

### 四、三大核心概念

网关的配置围绕三个概念，理解了它仨就理解了 Gateway：

| 概念 | 作用 | 通俗理解 |
| --- | --- | --- |
| **Route（路由）** | 完整的转发规则（id + 目标 + 条件 + 过滤器） | 「**一条转发规则**」 |
| **Predicate（断言）** | 匹配条件（哪些请求走这条路由） | 「**什么情况用这条规则**」 |
| **Filter（过滤器）** | 对请求/响应做加工（加头、改路径） | 「**转发前后做点什么**」 |

一条 Route 的构成：

```
Route = ID + 目标 URI + Predicate（匹配条件）+ Filter（加工逻辑）

例：
  id: user-route
  uri: lb://user-service         ← 目标（lb:// 表示负载均衡到注册中心的 user-service）
  predicates: Path=/api/users/** ← 匹配 /api/users/** 的请求
  filters: StripPrefix=1         ← 转发前去掉第 1 段路径
```

---

### 五、路由配置的两种方式

#### 1. yml 配置（推荐）

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-route                          # 路由 id（唯一）
          uri: lb://user-service                  # 目标：负载均衡到 user-service
          predicates:
            - Path=/api/users/**                  # 匹配 /api/users/** 的请求
          filters:
            - StripPrefix=1                       # 去掉第 1 段（/api/users/1 → /users/1）

        - id: order-route
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
            - Method=GET,POST                     # 只匹配 GET/POST
          filters:
            - StripPrefix=1
```

```
请求 GET /api/users/1
  │
  ▼ 匹配 user-route（Path=/api/users/**）
  │
  ▼ Filter: StripPrefix=1 → 路径变成 /users/1
  │
  ▼ 负载均衡到 user-service 的某实例
  │
  ▼ 转发：GET http://user-service实例/users/1
```

#### 2. 编程式（Java Bean）

```java
@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-route", r -> r
                .path("/api/users/**")                  // Predicate
                .filters(f -> f.stripPrefix(1))         // Filter
                .uri("lb://user-service"))              // URI
            .build();
    }
}
```

---

### 六、Predicate（断言）

Predicate 决定「**哪些请求匹配这条路由**」：

| 断言 | 含义 | 示例 |
| --- | --- | --- |
| `Path` | 路径匹配 | `Path=/api/users/**` |
| `Method` | HTTP 方法 | `Method=GET,POST` |
| `Host` | 请求的 Host 头 | `Host=**.example.com` |
| `Header` | 请求头存在/匹配 | `Header=X-Request-Id, \d+` |
| `Query` | 查询参数存在 | `Query=token` |
| `After` / `Before` / `Between` | 按时间匹配 | `After=2026-01-01...`（定时上线） |
| `Cookie` | Cookie 匹配 | `Cookie=session, abc.` |

> 💡 **提示：** 多个 Predicate 是 **AND 关系**（都要满足才匹配）。

---

### 七、Filter（过滤器）

Filter 对请求/响应做加工：

| 过滤器 | 作用 |
| --- | --- |
| `StripPrefix=N` | 去掉路径前 N 段 |
| `PrefixPath=/api` | 路径前加前缀 |
| `RewritePath` | 用正则改写路径 |
| `AddRequestHeader` | 加请求头 |
| `AddRequestParameter` | 加查询参数 |
| `SetStatus` | 设置响应状态码 |
| `RequestRateLimiter` | **限流**（配合 Redis 令牌桶） |

---

### 八、全局过滤器 GlobalFilter（自定义鉴权）

Gateway 内置的 Filter 是「路由级」的（配在每条 Route 上）。而**全局过滤器**对所有路由生效，**自定义鉴权、日志**通常用 GlobalFilter：

```java
@Component
public class AuthGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // 1. 放行登录等公开接口
        if (path.contains("/login")) {
            return chain.filter(exchange);
        }

        // 2. 校验 token
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();   // ✅ 直接返回 401，不放行
        }

        // 3. 校验通过，放行（可把解析出的用户信息加到请求头传给下游）
        String userId = JwtUtil.parse(token.substring(7));
        ServerHttpRequest request = exchange.getRequest().mutate()
            .header("X-User-Id", userId)        // 加请求头，下游服务可取
            .build();
        return chain.filter(exchange.mutate().request(request).build());
    }

    @Override
    public int getOrder() {
        return -1;    // 数字越小优先级越高（先执行）
    }
}
```

> 💡 **提示：** 网关统一鉴权后，把用户身份通过请求头（如 `X-User-Id`）传给下游，下游服务直接信任网关、不用再校验——这就是「**网关鉴权、服务信任**」的微服务安全模式。

---

### 九、实际应用场景

1. **统一鉴权**：所有请求在网关校验 token，下游服务免鉴权。
2. **限流**：用 `RequestRateLimiter`（Redis 令牌桶）保护后端服务。
3. **跨域**：网关统一配 CORS，前端不再有跨域问题。
4. **灰度发布**：根据请求头/权重，把部分流量路由到新版本服务。
5. **API 聚合**：一个请求在网关聚合多个服务的结果（复杂场景）。

---

### 十、常见问题与注意事项

> ⚠️ **注意：**
> - **Gateway 基于 WebFlux（非阻塞）**，不要在里面写阻塞代码（如同步 JDBC），会拖垮性能。
> - **网关本身要高可用**：集群部署 + Nginx/LB 前置，单点网关挂了整个系统就瘫了。
> - **`lb://` 需要注册中心**：用 `lb://service-name` 时，网关必须能连上 [[服务注册与发现]]（Nacos/Eureka）。
> - **StripPrefix 容易配错**：路径对不上通常是前缀去多去少了，调试时打印实际转发路径。

> 💡 **提示：** 网关是微服务的「**门面**」，配置虽简单但责任重大。鉴权、限流、日志这些横切逻辑放网关，能让内部服务代码大幅简化、职责更纯粹。

---

### 十一、总结

- **网关 = 微服务统一入口**，负责路由、鉴权、限流、跨域。
- **三大核心**：Route（路由）= Predicate（匹配条件）+ Filter（加工）+ 目标 URI。
- **两种配置**：yml（推荐）和编程式 `RouteLocator`。
- **全局过滤器 `GlobalFilter`**：自定义鉴权、日志，对所有路由生效。
- **`lb://service-name`**：配合注册中心做负载均衡路由。

下一篇，保护系统不雪崩：[[熔断降级]]。
