### 一、概述

> 📖 [Java HttpClient 官方文档](https://docs.oracle.com/en/java/javase/17/docs/api/java.net.http/java/net/http/HttpClient.html)

HTTP 通信是 Java 程序**调用 Web 接口（API）最常用**的方式。无论是请求第三方服务、调用 RESTful API，还是微服务之间通信，HTTP 都是最主流的选择。

Java 提供了两套原生 HTTP 客户端：

| 方式 | 引入版本 | 特点 | 推荐度 |
| --- | --- | --- | --- |
| **`HttpClient`** | Java 11+ | 现代 API，支持异步、HTTP/2、WebSocket | ⭐⭐⭐⭐⭐ |
| **`HttpURLConnection`** | Java 1.1 | 老牌 API，API 笨重但兼容性好 | 兼容老项目 |

> 💡 **提示：** Java 11 及以上，**强烈推荐用 `HttpClient`**，API 设计现代、清晰，原生支持异步和 HTTP/2。`HttpURLConnection` 只在维护老项目时才考虑。

---

### 二、核心原理

#### 1. HTTP 请求-响应模型

```
客户端                                     服务端
  │  ── 请求(Request) ──────────────────►   │
  │     方法 + URL + 头 + 体                 │
  │                                          │
  │  ◄──────────── 响应(Response) ───────   │
  │     状态码 + 头 + 体                     │
```

一次 HTTP 通信 = 一个**请求** + 一个**响应**，无状态（每次请求相互独立）。

#### 2. 请求的四个要素

| 要素 | 说明 | 示例 |
| --- | --- | --- |
| **方法** | 表示「想干什么」 | `GET`（查）、`POST`（增）、`PUT`（改）、`DELETE`（删） |
| **URL** | 请求的地址 | `https://api.example.com/users` |
| **请求头** | 附加元信息 | `Content-Type: application/json` |
| **请求体** | 携带的数据（GET 一般没有） | `{"name":"张三"}` |

#### 3. 常见 HTTP 状态码

| 状态码 | 含义 | 说明 |
| --- | --- | --- |
| `200` | OK | 成功 |
| `201` | Created | 创建成功 |
| `301` / `302` | 重定向 | 资源换了地址 |
| `400` | Bad Request | 请求参数错误 |
| `401` | Unauthorized | 未认证（没登录） |
| `403` | Forbidden | 无权限 |
| `404` | Not Found | 资源不存在 |
| `500` | Internal Server Error | 服务器内部错误 |

---

### 三、HttpClient 基本用法（推荐）

#### 1. 发送 GET 请求

```java
import java.net.URI;
import java.net.http.*;
import java.net.http.HttpClient.Version;

public class HttpGetDemo {
    public static void main(String[] args) throws Exception {
        // 1. 创建 HttpClient（可复用，线程安全）
        HttpClient client = HttpClient.newBuilder()
            .version(Version.HTTP_2)        // 优先用 HTTP/2
            .connectTimeout(java.time.Duration.ofSeconds(10))  // 连接超时
            .build();

        // 2. 构建请求
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://jsonplaceholder.typicode.com/posts/1"))
            .timeout(java.time.Duration.ofSeconds(10))          // 读取超时
            .header("Accept", "application/json")
            .GET()    // GET 可省略，默认就是 GET
            .build();

        // 3. 发送请求，获取响应（同步）
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("状态码: " + response.statusCode());
        System.out.println("响应头: " + response.headers().firstValue("content-type").orElse(""));
        System.out.println("响应体: " + response.body());
    }
}
```

#### 2. 发送 POST 请求（带 JSON）

```java
import java.net.URI;
import java.net.http.*;
import java.net.http.HttpRequest.BodyPublishers;

public class HttpPostDemo {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        // 要发送的 JSON 数据
        String json = "{\"title\":\"foo\",\"body\":\"bar\",\"userId\":1}";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://jsonplaceholder.typicode.com/posts"))
            .header("Content-Type", "application/json; charset=UTF-8")  // ✅ 声明 JSON
            .POST(BodyPublishers.ofString(json))     // ✅ 请求体
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("状态码: " + response.statusCode());   // 201 表示创建成功
        System.out.println("响应体: " + response.body());
    }
}
```

> 💡 **提示：** `BodyPublishers` 负责把数据转成请求体，`BodyHandlers` 负责把响应体转成想要的形式（字符串、文件、字节数组等）。

---

### 四、HttpClient 进阶用法

#### 1. 异步请求（不阻塞）

```java
// sendAsync 返回 CompletableFuture，不阻塞当前线程
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(HttpResponse::body)             // 取响应体
    .thenAccept(System.out::println)           // 处理结果
    .exceptionally(e -> {                       // 异常处理
        e.printStackTrace();
        return null;
    });

System.out.println("请求已发出，继续干别的...");
// 主线程别退出，否则异步任务来不及执行
Thread.sleep(3000);
```

#### 2. 设置请求头 / 鉴权

```java
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .header("Authorization", "Bearer your_token_here")  // ✅ Token 鉴权
    .header("Accept-Language", "zh-CN")
    .setHeader("User-Agent", "MyJavaApp/1.0")            // setHeader 会覆盖同名头
    .GET()
    .build();
```

#### 3. 表单提交（application/x-www-form-urlencoded）

```java
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

// 手动拼接表单参数（键值对，用 & 连接）
String form = "username=" + URLEncoder.encode("张三", StandardCharsets.UTF_8)
            + "&password=" + URLEncoder.encode("123456", StandardCharsets.UTF_8);

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com/login"))
    .header("Content-Type", "application/x-www-form-urlencoded")
    .POST(BodyPublishers.ofString(form))
    .build();
```

#### 4. 上传文件

```java
import java.nio.file.Paths;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com/upload"))
    .header("Content-Type", "application/octet-stream")
    .POST(BodyPublishers.ofFile(Paths.get("/Users/dyc/avatar.png")))  // ✅ 直接发文件
    .build();
```

#### 5. 下载文件到本地

```java
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com/bigfile.zip"))
    .build();

// 响应体直接写入文件
HttpResponse<Void> response = client.send(request,
    HttpResponse.BodyHandlers.ofFile(Paths.get("download.zip")));
```

---

### 五、BodyPublishers / BodyHandlers 速查

#### `BodyPublishers`（请求体 → 发送）

| 方法 | 说明 |
| --- | --- |
| `noBody()` | 没有请求体（GET、DELETE 用） |
| `ofString(String)` | 字符串 |
| `ofByteArray(byte[])` | 字节数组 |
| `ofFile(Path)` | 文件 |
| `ofInputStream(Supplier)` | 输入流 |

#### `BodyHandlers`（响应体 → 接收）

| 方法 | 说明 |
| --- | --- |
| `ofString()` | 转成字符串 |
| `ofByteArray()` | 转成字节数组 |
| `ofFile(Path)` | 写入文件 |
| `ofLines()` | 按行流（适合大响应） |
| `discarding()` | 丢弃响应体（只关心状态码） |

---

### 六、HttpURLConnection 用法（老项目）

虽然推荐用 `HttpClient`，但维护老项目时仍可能遇到 `HttpURLConnection`：

```java
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class OldHttpDemo {
    public static void main(String[] args) throws Exception {
        URL url = new URL("https://jsonplaceholder.typicode.com/posts/1");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(10000);
        conn.setRequestProperty("Accept", "application/json");

        int code = conn.getResponseCode();
        System.out.println("状态码: " + code);

        // 根据状态码读不同的流
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(
                    code >= 400 ? conn.getErrorStream() : conn.getInputStream(),
                    StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            System.out.println("响应: " + sb);
        } finally {
            conn.disconnect();   // ✅ 必须断开
        }
    }
}
```

> ⚠️ **注意：** `HttpURLConnection` API 笨重（要手动判状态码选流、手动 disconnect），新项目请用 `HttpClient`。

---

### 七、实际应用场景

| 场景 | 方法/配置 |
| --- | --- |
| 调用第三方 API（天气、地图、支付） | `GET` / `POST` + JSON |
| 调用公司内部 RESTful 微服务 | `HttpClient` + JSON |
| 用户登录（提交账号密码） | `POST` 表单 / `POST` JSON + Token |
| 文件上传 / 下载 | `BodyPublishers.ofFile` / `BodyHandlers.ofFile` |
| 高并发批量请求 | `sendAsync` 异步 + `CompletableFuture` |

---

### 八、常见问题与注意事项

#### 1. 中文乱码

请求和响应都要指定 UTF-8。读取响应用 `BodyHandlers.ofString()` 时，会根据响应头 `Content-Type` 的字符集解码；没有指定时可能乱码，建议响应头带上 `charset=utf-8`，或用 `ofByteArray()` 后手动 `new String(bytes, "UTF-8")`。

#### 2. 超时设置

```java
HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(10))   // 连接超时
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .timeout(Duration.ofSeconds(10))           // 读取超时
    .uri(...)
    .build();
```

> ⚠️ **注意：** 生产环境**必须设超时**，否则网络异常时请求会无限挂起，拖垮线程池。

#### 3. HTTPS 证书问题

访问自签名证书（如内网 https）时，默认会校验失败。测试环境可临时跳过校验，**生产环境绝不要这么做**：

```java
// 仅用于测试，绕过 SSL 校验（生产环境禁止！）
// 通常需要自定义 SSLContext + TrustManager，这里不展开
```

#### 4. HttpClient 复用

`HttpClient` 是**线程安全**且可复用的，**不要每次请求都 new 一个**。应该全局创建一个实例共享，否则会浪费资源、无法复用连接池。

#### 5. 连接保持（Keep-Alive）

HTTP/1.1 默认开启 Keep-Alive，复用 TCP 连接。`HttpClient` 内部自动管理连接池，无需手动处理。

---

### 九、与相关通信方式对比

| 方式 | 模式 | 适用场景 |
| --- | --- | --- |
| **HTTP（本篇）** | 请求-响应，无状态 | 调用 Web 接口、RESTful API |
| **Socket** | 长连接双向 | 自定义协议、IM |
| **WebSocket** | 全双工长连接 | 服务端主动推送 |
| **RPC** | 像调本地方法 | 内部微服务高频调用 |

---

### 十、总结

- Java 11+ 用 `HttpClient`，老项目用 `HttpURLConnection`
- 三步走：`HttpClient` → `HttpRequest` → `client.send()`
- POST 用 `BodyPublishers`，接收响应用 `BodyHandlers`
- 异步用 `sendAsync` 返回 `CompletableFuture`
- 生产环境必备：**超时设置**、**HttpClient 复用**、**UTF-8 编码**
