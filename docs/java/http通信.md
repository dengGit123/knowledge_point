# HTTP 通信

> 📖 官方文档：[Java SE HttpClient（Java 17）](https://docs.oracle.com/en/java/javase/17/docs/api/java.net.http/java/net/http/HttpClient.html) | [HttpURLConnection](https://docs.oracle.com/en/java/javase/17/docs/api/java.net/java/net/HttpURLConnection.html) | [JEP 321：HTTP Client（标准）](https://openjdk.org/jeps/321)
> 参考：[RFC 9110 - HTTP 语义](https://www.rfc-editor.org/rfc/rfc9110) | [菜鸟教程 - Java HTTP 请求](https://www.runoob.com/java/java-http-request.html)

---

## 一、概述

### 1. 什么是 HTTP

**HTTP（HyperText Transfer Protocol，超文本传输协议）** 是一种**应用层**协议，规定了浏览器（客户端）和服务器之间"怎么说话"——请求长什么样、响应长什么样、出错怎么办。

通俗地说：HTTP 就像是客户端和服务器之间约定好的一套**"对话规则"**。你在浏览器输入网址（或程序里发请求），本质都是用这套规则向服务器"提问"，服务器再用同样的规则"回答"你。

```
   客户端（浏览器 / 你的 Java 程序）              服务器
  ┌──────────┐      HTTP 请求（Request）        ┌──────────┐
  │          │ ───────────────────────────────► │          │
  │  我要...  │  GET /user HTTP/1.1             │  处理请求 │
  │          │  Host: api.example.com          │          │
  └──────────┘ ◄─────────────────────────────── └──────────┘
                  HTTP 响应（Response）
                  HTTP/1.1 200 OK
                  {"name":"张三"}
```

> 💡 **延伸阅读：** HTTP 协议建立在 **TCP** 之上（应用层 → 传输层）。关于 TCP 连接、三次握手、Socket 的底层原理，请先阅读 [Socket通信.md](./Socket通信.md) 和 [网络编程.md](./网络编程.md)。本文聚焦"应用层怎么用 Java 发 HTTP 请求"。

### 2. Java 中发起 HTTP 请求的方式

随着 Java 发展，官方提供的 HTTP 工具经历了演进，目前主流有三种选择：

| 方式                          | 来源              | 引入版本    | 特点                                       |
| ----------------------------- | ----------------- | ----------- | ------------------------------------------ |
| **`HttpURLConnection`**       | JDK 内置          | JDK 1.1     | 老牌、无依赖，但 API 繁琐、不支持异步       |
| **`HttpClient`**（新）        | JDK 内置          | JDK 11（标准）| 现代 API、支持 HTTP/2 与异步、推荐          |
| **第三方库**                  | 需引入依赖        | —           | Apache HttpClient、OkHttp、Feign 等，功能更丰富 |

> ⚠️ **注意：** `HttpClient` 是 **Java 11** 才正式成为标准 API（Java 9-10 为孵化模块 `jdk.incubator.httpclient`）。如果你的项目还在用 Java 8，要么用 `HttpURLConnection`，要么引入第三方库。

### 3. 三种方式怎么选

- **学习 / 新项目（JDK 11+）** → 优先用 **`HttpClient`**，API 现代、零依赖、支持异步和 HTTP/2。
- **Java 8 老项目 / 不想引依赖** → 用 **`HttpURLConnection`**。
- **企业级复杂场景**（连接池、拦截器、文件上传、自动重试等） → 用 **Apache HttpClient** 或 **OkHttp**。

---

## 二、HTTP 协议基础回顾

在动手写代码前，先快速回顾 HTTP 的基本概念。这些是理解后续 API 的前提。

### 1. 请求与响应的结构

一次 HTTP 通信 = 一个**请求** + 一个**响应**，它们结构相似，都由四部分组成：

**HTTP 请求：**

```
POST /api/user HTTP/1.1            ← ① 请求行：方法 + 路径 + 协议版本
Host: api.example.com              ← ② 请求头（Header），键值对
Content-Type: application/json
Authorization: Bearer xxx

{"name":"张三","age":20}            ← ③ 请求体（Body），GET 请求一般没有
```

**HTTP 响应：**

```
HTTP/1.1 200 OK                    ← ① 状态行：协议版本 + 状态码 + 状态文字
Content-Type: application/json     ← ② 响应头（Header）
Content-Length: 25

{"id":1,"name":"张三"}             ← ③ 响应体（Body）
```

> 💡 **提示：** 一个 HTTP 报文由 **起始行 + 头部（Headers）+ 空行 + 主体（Body）** 组成。中间那个**空行**是分隔头部和主体的标志，不能少。

### 2. 常用请求方法（Method）

| 方法     | 含义                   | 典型场景                 | 通常有请求体 |
| -------- | ---------------------- | ------------------------ | ------------ |
| **GET**  | 获取资源               | 查询列表 / 详情          | 否           |
| **POST** | 新增 / 提交数据        | 提交表单 / 创建资源      | 是           |
| **PUT**  | 更新（替换）整个资源   | 修改一条完整记录         | 是           |
| **PATCH**| 局部更新               | 只改某个字段             | 是           |
| **DELETE**| 删除资源              | 删除一条记录             | 通常无       |

### 3. 常见状态码（Status Code）

状态码是服务器对请求结果的"一句话总结"，第一位数字表示类别：

| 类别  | 含义       | 常见状态码                                                                  |
| ----- | ---------- | --------------------------------------------------------------------------- |
| **2xx** | 成功       | `200 OK`、`201 Created`、`204 No Content`                                   |
| **3xx** | 重定向     | `301 永久重定向`、`302 临时重定向`、`304 Not Modified`（资源未变，用缓存）  |
| **4xx** | 客户端错误 | `400 参数错误`、`401 未认证`、`403 无权限`、`404 找不到`、`429 请求过多`    |
| **5xx** | 服务器错误 | `500 服务器内部错误`、`502 网关错误`、`503 服务不可用`                      |

> 💡 **提示：** `HttpClient` 默认不会把 4xx/5xx 当作异常抛出——它照样返回响应对象，你需要自己检查 `statusCode()`。这与一些第三方库（如 Spring 的 `RestTemplate` 默认对 4xx/5xx 抛异常）行为不同。

### 4. 常用头部（Header）

| Header                 | 作用                                     |
| ---------------------- | ---------------------------------------- |
| `Content-Type`         | 请求/响应体的数据格式（如 `application/json`）|
| `Authorization`        | 认证信息（如 `Bearer <token>`）          |
| `Accept`               | 客户端希望接收的响应格式                  |
| `User-Agent`           | 客户端标识（浏览器/程序信息）             |
| `Cookie` / `Set-Cookie`| 维持会话状态                             |
| `Content-Length`       | 请求/响应体的字节长度                     |

常见的 `Content-Type` 取值：

| 值                                | 用途                 | 示例                                       |
| --------------------------------- | -------------------- | ------------------------------------------ |
| `application/json`                | JSON 数据            | `{"name":"张三"}`                          |
| `application/x-www-form-urlencoded`| 普通表单            | `name=张三&age=20`                         |
| `multipart/form-data`             | 文件上传表单         | 带 boundary 分隔的二进制                   |
| `text/html`                       | HTML 文本            | `<html>...</html>`                         |

---

## 三、HttpURLConnection（JDK 经典方式）

`HttpURLConnection` 是 Java 1.1 就有的内置类，位于 `java.net` 包。**不需要任何第三方依赖**，是 Java 8 及更早版本中"零依赖发 HTTP 请求"的主要手段。

### 1. 基本 GET 请求

```java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class HttpGetDemo {
    public static void main(String[] args) throws Exception {
        // 1. 创建 URL 对象，指向目标地址
        URL url = new URL("https://jsonplaceholder.typicode.com/todos/1");

        // 2. openConnection() 打开连接，强转为 HttpURLConnection
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        // 3. 设置请求方法和超时时间
        conn.setRequestMethod("GET");               // 指定为 GET
        conn.setConnectTimeout(5000);               // 连接超时：5 秒（建立 TCP 连接）
        conn.setReadTimeout(5000);                  // 读取超时：5 秒（等待服务器返回数据）

        // 4. 获取响应状态码
        int code = conn.getResponseCode();          // 200
        System.out.println("状态码: " + code);

        // 5. 读取响应体（状态码 2xx 时读正常流）
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            System.out.println("响应: " + sb);
        }

        // 6. 关闭连接（释放底层资源）
        conn.disconnect();
    }
}
```

### 2. POST 请求（发送 JSON）

POST 需要向服务器**写入请求体**，因此要打开输出流：

```java
import java.io.IOException;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class HttpPostDemo {
    public static void main(String[] args) throws IOException {
        URL url = new URL("https://jsonplaceholder.typicode.com/posts");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();

        // —— 请求配置 ——
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json; utf-8"); // 请求体是 JSON
        conn.setRequestProperty("Accept", "application/json");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);

        // 关键：POST 需要向服务器"写"数据，必须开启输出
        conn.setDoOutput(true);

        // —— 写入请求体 ——
        String json = "{\"title\":\"foo\",\"body\":\"bar\",\"userId\":1}";
        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = json.getBytes(StandardCharsets.UTF_8); // 用 UTF-8 编码，避免中文乱码
            os.write(input, 0, input.length);
        }

        // —— 读取响应 ——
        int code = conn.getResponseCode();
        System.out.println("状态码: " + code);

        // ❗ 重点：4xx/5xx 时 getInputStream() 会抛异常，要用 getErrorStream() 读错误信息
        java.io.InputStream stream =
                (code >= 200 && code < 400) ? conn.getInputStream() : conn.getErrorStream();
        try (var reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(stream, StandardCharsets.UTF_8))) {
            var sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
            System.out.println("响应: " + sb);
        }

        conn.disconnect();
    }
}
```

> ⚠️ **注意：** `HttpURLConnection` 在**出错时（4xx/5xx）**，`getInputStream()` 会抛 `IOException`。要读取服务器的错误提示，必须改用 `getErrorStream()`。这是新手最常踩的坑。

### 3. 设置请求头

```java
// 设置单个请求头
conn.setRequestProperty("Authorization", "Bearer your-token-here");
conn.setRequestProperty("User-Agent", "MyJavaApp/1.0");

// 同名头追加多个值（如多个 Cookie）
conn.addRequestProperty("Accept", "application/json");
```

### 4. 小结

`HttpURLConnection` 的缺点很明显：

- API 偏底层，要手动管理输入输出流、编码、状态判断。
- **不支持异步**（阻塞当前线程）。
- 不支持 HTTP/2。

因此现代项目（JDK 11+）更推荐下面的 `HttpClient`。

---

## 四、HttpClient（Java 11+ 现代方式）★ 重点

`HttpClient` 是 Java 11 正式引入的新一代 HTTP 客户端（包名 `java.net.http`），相比 `HttpURLConnection` 有质的飞跃：

- **API 现代、流畅**：用构建器（Builder）链式调用。
- **支持 HTTP/2**：多路复用，性能更好（默认优先尝试 HTTP/2）。
- **支持异步**：`sendAsync()` 返回 `CompletableFuture`，不阻塞线程。
- **线程安全**：一个 `HttpClient` 实例可被多线程共享复用。
- **内置连接池**：自动复用 TCP 连接。

### 1. 核心三要素

用 `HttpClient` 发请求，涉及三个核心类，各司其职：

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  HttpClient  │     │  HttpRequest │     │  HttpResponse    │
│ （客户端/引擎）│     │  （请求内容） │     │  （响应结果）     │
├──────────────┤     ├──────────────┤     ├──────────────────┤
│ 版本/超时     │     │ URL/方法     │     │ 状态码            │
│ 重定向策略    │     │ 头部         │     │ 响应头            │
│ 连接池        │ ──► │ 请求体       │ ──► │ 响应体            │
│              │     │              │     │                  │
│ send() 同步  │     │ 不可变       │     │ 不可变            │
│ sendAsync()异步│    │              │     │                  │
└──────────────┘     └──────────────┘     └──────────────────┘
   客户端一次创建        每次请求构建           send/sendAsync 返回
   可长期复用             一个新的                一个新的
```

### 2. 创建 HttpClient

`HttpClient` 应当**复用**（它内部管理连接池），不要每次请求都 new 一个。

```java
import java.net.http.HttpClient;
import java.time.Duration;

// 方式一：最简方式，使用默认配置
HttpClient client1 = HttpClient.newHttpClient();

// 方式二：通过 Builder 自定义配置（推荐）
HttpClient client = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_2)            // HTTP 版本（默认就是 HTTP_2，会自动降级到 1.1）
        .connectTimeout(Duration.ofSeconds(10))        // 连接超时
        .followRedirects(HttpClient.Redirect.NORMAL)   // 自动跟随重定向
        .build();
```

| 配置项               | 说明                                                                |
| -------------------- | ------------------------------------------------------------------- |
| `version()`          | `HTTP_2`（默认）或 `HTTP_1_1`。HTTP/2 不可用时自动降级到 1.1         |
| `connectTimeout()`   | 建立 TCP 连接的超时时间                                              |
| `followRedirects()`  | 重定向策略：`NEVER`（不跟随）、`ALWAYS`、`NORMAL`（https↔http 不跟随）|
| `authenticator()`    | 设置基础认证（Basic Auth）                                          |
| `proxy()`            | 设置代理                                                            |
| `sslContext()`       | 自定义 SSL 上下文（HTTPS 证书）                                      |

### 3. 构建请求 HttpRequest

`HttpRequest` 是不可变对象，每次请求构建一个。

```java
import java.net.URI;
import java.net.http.HttpRequest;
import java.time.Duration;

// GET 请求
HttpRequest getRequest = HttpRequest.newBuilder()
        .uri(URI.create("https://jsonplaceholder.typicode.com/todos/1"))
        .timeout(Duration.ofSeconds(10))   // 本次请求超时
        .header("Accept", "application/json")
        .GET()                             // GET 是默认方法，可省略
        .build();

// POST 请求（带请求体）
String json = "{\"title\":\"foo\",\"body\":\"bar\",\"userId\":1}";
HttpRequest postRequest = HttpRequest.newBuilder()
        .uri(URI.create("https://jsonplaceholder.typicode.com/posts"))
        .timeout(Duration.ofSeconds(10))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(json))  // 请求体用 BodyPublishers 包装
        .build();
```

**`BodyPublishers`** —— 把"请求体"转换成 HttpClient 能发送的形式：

| 方法                  | 输入             | 用途                       |
| --------------------- | ---------------- | -------------------------- |
| `ofString(s)`         | 字符串           | 发送 JSON / 文本           |
| `ofByteArray(byte[])` | 字节数组         | 发送二进制                 |
| `ofFile(Path)`        | 文件路径         | 直接发送文件内容           |
| `ofInputStream(sup)`  | 输入流           | 流式发送（大数据）         |
| `noBody()`            | —                | 无请求体（GET/DELETE）     |

### 4. 同步发送 send

`send()` 会**阻塞当前线程**，直到收到响应：

```java
import java.net.http.HttpResponse;

// 同步发送：传入"如何处理响应体"的处理器（这里用 ofString 把响应体读成字符串）
HttpResponse<String> response = client.send(postRequest, HttpResponse.BodyHandlers.ofString());

// 读取结果
int status = response.statusCode();           // 状态码，如 201
String body = response.body();                // 响应体字符串
response.headers()                            // 响应头（HttpHeaders 对象）
          .firstValue("Content-Type")         // 取某个头
          .ifPresent(System.out::println);

System.out.println("状态码: " + status);
System.out.println("响应: " + body);
```

> 💡 **提示：** `send()` 会抛 `IOException`（网络错误）和 `InterruptedException`（线程被中断），需要处理或声明。

### 5. 异步发送 sendAsync（推荐用于高并发）

`sendAsync()` 立即返回 `CompletableFuture`，**不阻塞线程**，响应就绪后再回调。这是 HttpClient 最大的亮点：

```java
// 异步发送：返回 CompletableFuture，立即返回，不阻塞
client.sendAsync(getRequest, HttpResponse.BodyHandlers.ofString())
        .thenApply(HttpResponse::body)              // 拿到响应后，提取 body
        .thenAccept(System.out::println)            // 打印 body
        .exceptionally(e -> {                       // 异常处理
            System.err.println("请求失败: " + e.getMessage());
            return null;
        });

// 主线程继续做其他事……
System.out.println("请求已发出，继续执行后续代码");
Thread.sleep(3000); // 演示用：等待异步任务完成
```

异步的强大之处在于可以用 `CompletableFuture` 的链式 API 编排多个请求：

```java
// 示例：第一个请求的结果，作为第二个请求的输入
client.sendAsync(request1, BodyHandlers.ofString())
        .thenCompose(resp -> {
            // 用第一个请求的结果，构建第二个请求
            HttpRequest request2 = buildRequest(resp.body());
            return client.sendAsync(request2, BodyHandlers.ofString()); // thenCompose 串联两个异步
        })
        .thenAccept(resp -> System.out.println("最终结果: " + resp.body()));
```

### 6. BodyHandlers —— 响应体处理器

与请求体的 `BodyPublishers` 对应，响应体用 `BodyHandlers` 决定"怎么读"：

| 处理器                | 返回类型              | 适用场景                       |
| --------------------- | --------------------- | ------------------------------ |
| `ofString()`          | `String`              | 读取文本 / JSON（最常用）      |
| `ofByteArray()`       | `byte[]`              | 读取二进制 / 图片              |
| `ofFile(Path)`        | `Path`（写到的文件）  | 大文件下载，直接落盘           |
| `ofInputStream()`     | `InputStream`         | 流式处理，避免一次性加载到内存 |
| `ofLines()`           | `Stream<String>`      | 逐行处理（如读大文本）         |
| `discarding()`        | `Void`（丢弃）        | 只关心状态码，不要响应体       |

### 7. 完整示例：GET 与 POST JSON

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

public class HttpClientDemo {
    // 复用一个 HttpClient（线程安全、内置连接池）
    private static final HttpClient CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public static void main(String[] args) throws Exception {
        getDemo();
        postJsonDemo();
    }

    static void getDemo() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://jsonplaceholder.typicode.com/todos/1"))
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("GET 状态码: " + response.statusCode());
        System.out.println("GET 响应: " + response.body());
    }

    static void postJsonDemo() throws Exception {
        String json = "{\"title\":\"学习 HTTP\",\"body\":\"HttpClient 真好用\",\"userId\":1}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://jsonplaceholder.typicode.com/posts"))
                .header("Content-Type", "application/json; charset=UTF-8")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8)) // 指定编码避免中文乱码
                .build();

        HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("POST 状态码: " + response.statusCode());
        System.out.println("POST 响应: " + response.body());
    }
}
```

> ⚠️ **注意中文编码：** `BodyPublishers.ofString(s)` 默认用 UTF-8 编码。但如果你的 `String` 中有中文且服务器对编码敏感，**显式传 `StandardCharsets.UTF_8`** 更稳妥：`ofString(json, StandardCharsets.UTF_8)`。

### 8. 文件下载与上传

**下载文件**（直接落盘，不占内存）：

```java
import java.nio.file.Path;
import java.nio.file.Paths;

HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://example.com/large-file.zip"))
        .GET()
        .build();

// ofFile 把响应体直接写入文件，适合下载大文件
Path target = Paths.get("./downloaded.zip");
HttpResponse<Path> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofFile(target));
System.out.println("下载完成，保存到: " + response.body());
```

**上传文件**（把本地文件作为请求体发送）：

```java
import java.nio.file.Path;
import java.nio.file.Paths;

Path file = Paths.get("./data.txt");

HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://example.com/upload"))
        .header("Content-Type", "application/octet-stream") // 二进制流
        .POST(HttpRequest.BodyPublishers.ofFile(file))      // 直接读文件作为请求体
        .build();

HttpResponse<String> response = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
```

> ⚠️ **注意：** 标准 `HttpClient` **不内置 `multipart/form-data` 支持**。如果服务器要求表单文件上传（即 `Content-Type: multipart/form-data`），需要：
> - 手动构造 `multipart` 报文体和 `boundary`（较繁琐），或
> - 使用第三方库（如 Apache HttpClient 的 `MultipartEntityBuilder`、OkHttp）。
>
> 这是原生 `HttpClient` 相对第三方库的一个明显短板。

### 9. 设置与读取请求头

```java
// 构建请求时设置头部
HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://api.example.com/data"))
        .header("Authorization", "Bearer token123")
        .header("Accept", "application/json")
        // header() 同名头会追加；setHeader() 会替换同名头
        .build();

// 读取响应头
response.headers().firstValue("Content-Type").ifPresent(System.out::println);
```

---

## 五、第三方 HTTP 客户端（简要）

虽然 JDK 自带的工具够用，但企业项目常引入第三方库以获得更丰富的功能。这里做简要介绍。

### 1. Apache HttpClient

老牌、功能强大、生态成熟，是 Spring 等框架底层常用的实现。

**特点：** 完善的连接池、拦截器机制、支持 `multipart` 文件上传、配置项丰富。
**缺点：** API 相对繁琐，依赖较多。

> 📖 官方文档：[Apache HttpComponents](https://hc.apache.org/)

### 2. OkHttp

由 Square 公司开源，Android 开发的事实标准，服务端也常用。

**特点：** API 简洁现代、默认支持连接池与 GZIP、HTTP/2，支持 `multipart` 文件上传。
**缺点：** 非官方维护，需引入依赖。

> 📖 官方文档：[OkHttp](https://square.github.io/okhttp/)

> 💡 **提示：** 如果你在用 **Spring**，还有更高层的封装：同步的 `RestTemplate`（传统）、响应式的 `WebClient`（基于 Reactor，适合高并发），以及声明式的 `Feign`（接口式调用，微服务常用）。这些属于 Spring 生态，本文不展开。

### 几种 HTTP 客户端对比

| 特性                | `HttpURLConnection` | `HttpClient`（JDK 11+） | Apache HttpClient | OkHttp     |
| ------------------- | ------------------- | ------------------------ | ----------------- | ---------- |
| 依赖                | 无（JDK 内置）      | 无（JDK 内置）           | 需引入            | 需引入     |
| 异步支持            | ❌                  | ✅                        | ✅（较繁琐）       | ✅          |
| HTTP/2              | ❌                  | ✅                        | ✅                | ✅          |
| 连接池              | 弱                  | ✅（内置）                | ✅（强大）         | ✅（内置）  |
| multipart 文件上传  | ❌                  | ❌（需手动构造）          | ✅                | ✅          |
| API 易用性          | ⭐⭐（繁琐）          | ⭐⭐⭐⭐                    | ⭐⭐⭐              | ⭐⭐⭐⭐⭐    |
| 推荐场景            | 极简 / JDK 8        | 新项目（JDK 11+）         | 企业级复杂场景     | 现代 / Android |

---

## 六、实际应用场景

### 场景 1：调用第三方 RESTful API（最常见）

实际开发中，绝大多数 HTTP 请求就是"带着鉴权头，POST 一段 JSON，拿到结果"：

```java
public String callApi(String token, String payload) throws Exception {
    HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.example.com/v1/order"))
            .timeout(Duration.ofSeconds(10))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + token)   // 鉴权
            .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
            .build();

    HttpResponse<String> resp = CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

    // ❗ HttpClient 不会对 4xx/5xx 抛异常，要自己判断
    if (resp.statusCode() >= 400) {
        throw new RuntimeException("接口调用失败: " + resp.statusCode() + ", " + resp.body());
    }
    return resp.body();
}
```

### 场景 2：设置合理的超时

超时是生产环境的生命线——**没有超时的网络请求是定时炸弹**。两层超时都要设：

```java
HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))   // 连接超时：建立 TCP 连接
        .build();

HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://example.com/api"))
        .timeout(Duration.ofSeconds(10))          // 请求超时：整个请求+响应的时间
        .GET()
        .build();
```

| 超时类型     | 含义                               | 何时触发                    |
| ------------ | ---------------------------------- | --------------------------- |
| 连接超时     | 建立 TCP 连接的等待时间             | 服务器不可达 / 网络不通      |
| 读取/请求超时 | 建立连接后，等待数据返回的时间       | 服务器响应慢 / 卡住          |

> ⚠️ **注意：** `HttpClient` 的 `connectTimeout` 是**全局**的（创建客户端时设定，对所有请求生效）；`HttpRequest` 的 `timeout` 是**单次请求**的。两者都要设，缺一不可。

### 场景 3：表单提交（application/x-www-form-urlencoded）

发送"键值对"形式的表单：

```java
// 表单数据需要 URL 编码
String form = "username=" + URLEncoder.encode("张三", StandardCharsets.UTF_8)
            + "&password=123456";

HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create("https://example.com/login"))
        .header("Content-Type", "application/x-www-form-urlencoded")
        .POST(HttpRequest.BodyPublishers.ofString(form))
        .build();
```

### 场景 4：并发请求（异步提升吞吐）

需要同时请求多个接口时，用 `sendAsync` 并行发起，再用 `CompletableFuture.allOf` 等待全部完成：

```java
List<String> urls = List.of(
        "https://jsonplaceholder.typicode.com/todos/1",
        "https://jsonplaceholder.typicode.com/todos/2",
        "https://jsonplaceholder.typicode.com/todos/3"
);

// 每个请求异步发起，收集所有 Future
List<CompletableFuture<String>> futures = urls.stream()
        .map(url -> HttpRequest.newBuilder().uri(URI.create(url)).GET().build())
        .map(req -> CLIENT.sendAsync(req, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body))
        .toList();

// 等待所有请求完成
CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

// 逐个取出结果
for (CompletableFuture<String> f : futures) {
    System.out.println(f.getNow("请求失败"));
}
```

> 💡 **提示：** 异步并发请求时，`HttpClient` 内部的线程池和连接池会自动调度，无需手动管理线程，比传统"一个请求一个线程"的方式高效得多。

---

## 七、HTTPS 与证书

HTTPS = HTTP + TLS/SSL 加密。`HttpClient` 和 `HttpURLConnection` 都默认支持 HTTPS。

- **访问合法网站**（证书由受信任 CA 签发）：直接用 `https://` 即可，无需额外配置。
- **访问自签名证书的网站**（如本地测试、内网服务）：默认会因证书不受信任而报错。

> ⚠️ **注意：** 生产环境**不要**为了绕过证书校验而"信任所有证书"——这会让 HTTPS 失去加密防中间人的意义，相当于裸奔。仅在本地测试时临时使用，且务必配合明确的 `SSLContext` 配置。

测试自签名证书时，可通过自定义 `SSLContext` 加载信任的证书：

```java
// 思路：加载自己的证书到 TrustStore，构建 SSLContext，传给 HttpClient
HttpClient client = HttpClient.newBuilder()
        .sslContext(customSslContext)   // 自定义信任的证书
        .build();
// 具体证书加载代码较长，通常借助 KeyStore + TrustManagerFactory，此处仅示意方向。
```

> 📖 详情参考：[Java Secure Socket Extension (JSSE) 指南](https://docs.oracle.com/en/java/javase/17/security/java-secure-socket-extension-jsse-reference-guide.html)

---

## 八、常见问题与注意事项

### 1. 中文乱码

**原因：** 客户端和服务器对字符编码理解不一致（如一边 UTF-8，一边 GBK）。

**解决：**
- 请求体显式指定 UTF-8：`BodyPublishers.ofString(json, StandardCharsets.UTF_8)`。
- 请求头声明编码：`Content-Type: application/json; charset=UTF-8`。
- 读取响应时也用 UTF-8：`InputStreamReader(stream, StandardCharsets.UTF_8)`。

### 2. 忘记关闭资源 → 连接泄漏

- `HttpURLConnection`：用完必须 `disconnect()`。
- 流：用 **try-with-resources** 自动关闭。
- `HttpClient`：复用即可，不要频繁创建。

### 3. 4xx/5xx 不会自动抛异常

`HttpClient` 和 `HttpURLConnection` 收到错误状态码时，**仍会正常返回**（响应对象 / 流），需要自己检查 `statusCode()` / `getResponseCode()`，别以为"没异常就成功了"。

### 4. 连接复用与连接池

- `HttpClient` 内置连接池，**强烈建议复用同一个实例**。每次请求都 new 一个 `HttpClient`，连接池形同虚设，反而开销大。
- `HttpURLConnection` 默认会按 host 做连接复用，但建议显式管理。

### 5. 主线程阻塞 vs 异步

`send()` 是阻塞调用。如果在 Web 服务的请求处理线程里用它同步调下游，会**占用线程等待**——高并发下线程池容易耗尽。高并发场景优先用 `sendAsync()` 或第三方响应式客户端。

### 6. 重定向是否跟随

- `HttpClient` 默认**会**跟随重定向（`NORMAL`）。
- `HttpURLConnection` 默认也跟随（`setInstanceFollowRedirects(true)`）。
- 如需手动处理重定向（比如想拿到 302 的 Location 而不是跳转后的内容），要关闭自动跟随。

### 7. 线程安全

- `HttpClient`：**线程安全**，可多线程共享。
- `HttpRequest`：不可变对象，**线程安全**，可共享同一个请求对象重复发送。
- `HttpURLConnection`：**不是线程安全**的，一个连接一个线程用。

---

## 九、几种方式的速查对比

| 维度         | `HttpURLConnection`            | `HttpClient`（推荐）              |
| ------------ | ------------------------------ | --------------------------------- |
| 引入版本     | JDK 1.1                        | JDK 11（标准）                    |
| 是否需依赖   | 否                             | 否                                |
| API 风格     | 命令式，手动管流               | 构建器，链式调用                  |
| 异步         | 不支持                         | `sendAsync()` 返回 Future         |
| HTTP/2       | 不支持                         | 支持（默认优先）                  |
| 连接池       | 弱                             | 内置，自动复用                    |
| 适用场景     | 极简需求 / JDK 8 老项目        | 新项目首选                        |

**一句话总结：JDK 11+ 用 `HttpClient`，JDK 8 用 `HttpURLConnection` 或第三方库。**

---

## 十、总结

1. **HTTP 是应用层协议**，规定了客户端和服务器"怎么对话"，建立在 TCP 之上。
2. Java 发 HTTP 请求主要有三种途径：内置的 **`HttpURLConnection`**（老）、内置的 **`HttpClient`**（新，Java 11+）、**第三方库**（Apache HttpClient / OkHttp）。
3. **`HttpClient` 是现代首选**：API 流畅、支持 HTTP/2 与异步、内置连接池、线程安全。
4. **`HttpClient` 三要素**：`HttpClient`（客户端，复用）→ `HttpRequest`（请求，每次构建）→ `HttpResponse`（响应）。
5. 请求体用 **`BodyPublishers`** 包装，响应体用 **`BodyHandlers`** 决定读取方式。
6. **生产必备**：设置连接超时 + 请求超时；复用 `HttpClient`；处理 4xx/5xx；注意中文编码与资源关闭。
7. 原生 `HttpClient` 不支持 `multipart` 文件上传，复杂场景考虑第三方库。

> 💡 **延伸阅读：**
> - 底层 TCP / Socket 原理 → [Socket通信.md](./Socket通信.md)
> - 网络分层、TCP/UDP 基础 → [网络编程.md](./网络编程.md)
> - 高性能非阻塞 IO → [NIO.md](./NIO.md)
