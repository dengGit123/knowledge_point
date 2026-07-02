### 一、概述

> 📖 [Java URL（Oracle 官方教程）](https://docs.oracle.com/javase/tutorial/networking/urls/)

URL（Uniform Resource Locator，统一资源定位符）是网络上资源的「地址」。Java 用 `URL` 和 `URLConnection` 类来**读取和访问网络资源**。

大白话：URL 就是你在浏览器地址栏输入的那串网址（如 `https://www.example.com/index.html`）。Java 的 `URL` 类让你能用同样的方式，在程序里「打开」一个网络地址并读取内容。

| 类 | 作用 |
| --- | --- |
| `URL` | 表示一个网络地址，可以解析其中的各部分 |
| `URLConnection` | 打开到该地址的连接，读写数据 |
| `HttpURLConnection` | `URLConnection` 的子类，专门处理 HTTP/HTTPS |

> 💡 **提示：** `URL` / `URLConnection` 偏底层、适合简单的资源读取。如果要做复杂的 HTTP 请求（自定义头、异步），优先用 [[HTTP通信]] 里的 `HttpClient`。

---

### 二、URL 的结构

一个完整 URL 由多个部分组成：

```
https://user:pass@www.example.com:8080/path/to/file.html?key=value#anchor
  │       │     │         │          │        │              │       │
  协议    用户信息   主机名     端口      路径       查询参数       锚点
```

| 组成 | 说明 | 示例 |
| --- | --- | --- |
| 协议 (protocol) | 访问方式 | `http`、`https`、`ftp`、`file` |
| 主机 (host) | 域名或 IP | `www.example.com` |
| 端口 (port) | 服务端口 | `8080`（http 默认 80，https 默认 443） |
| 路径 (path) | 资源在服务器上的位置 | `/path/to/file.html` |
| 查询参数 (query) | 附带的键值对 | `?key=value&page=1` |
| 锚点 (ref) | 页面内位置 | `#section` |

#### 用 Java 解析 URL 各部分

```java
import java.net.URL;

public class UrlParseDemo {
    public static void main(String[] args) throws Exception {
        URL url = new URL("https://www.example.com:8080/path/file.html?name=dyc#top");

        System.out.println("协议: " + url.getProtocol());   // https
        System.out.println("主机: " + url.getHost());        // www.example.com
        System.out.println("端口: " + url.getPort());        // 8080
        System.out.println("路径: " + url.getPath());        // /path/file.html
        System.out.println("查询: " + url.getQuery());       // name=dyc
        System.out.println("锚点: " + url.getRef());         // top
        System.out.println("默认端口: " + url.getDefaultPort()); // 443
    }
}
```

---

### 三、基本用法：读取网络资源

#### 1. 用 `URL.openStream()` 读取（最简单）

适合直接读一个网络文本/资源：

```java
import java.io.*;
import java.net.URL;

public class UrlReadDemo {
    public static void main(String[] args) throws Exception {
        URL url = new URL("https://www.example.com");

        // openStream() 直接返回输入流
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(url.openStream(), "UTF-8"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        }
    }
}
```

> 💡 **提示：** `openStream()` 是 `openConnection().getInputStream()` 的简写，最省事，但无法设置请求头、超时。

#### 2. 用 `URLConnection` 读取（可配置）

需要设置超时、请求头时，用 `URLConnection`：

```java
import java.io.*;
import java.net.URL;
import java.net.URLConnection;

public class UrlConnectionDemo {
    public static void main(String[] args) throws Exception {
        URL url = new URL("https://www.example.com");
        URLConnection conn = url.openConnection();

        // ✅ 在 getInputStream() 之前设置参数
        conn.setConnectTimeout(10000);   // 连接超时 10 秒
        conn.setReadTimeout(10000);      // 读取超时 10 秒
        conn.setRequestProperty("User-Agent", "MyJavaApp/1.0");  // 请求头

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(conn.getInputStream(), "UTF-8"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        }
    }
}
```

---

### 四、读取响应信息

`URLConnection` 不仅能读内容，还能拿到响应的元信息：

```java
import java.net.URL;
import java.net.URLConnection;

public class MetaInfoDemo {
    public static void main(String[] args) throws Exception {
        URL url = new URL("https://www.example.com/logo.png");
        URLConnection conn = url.openConnection();
        conn.connect();   // 主动发起连接

        System.out.println("内容类型: " + conn.getContentType());   // image/png
        System.out.println("内容长度: " + conn.getContentLengthLong()); // 字节数
        System.out.println("最后修改: " + conn.getLastModified());
        System.out.println("编码: " + conn.getContentEncoding());

        // 读取所有响应头
        conn.getHeaderFields().forEach((key, values) -> {
            System.out.println(key + ": " + values);
        });
    }
}
```

> 💡 **提示：** 通过 `getContentType()` 可以判断资源类型（图片、HTML、JSON…），下载文件时很有用。

---

### 五、下载文件到本地

```java
import java.io.*;
import java.net.URL;

public class DownloadDemo {
    public static void main(String[] args) throws Exception {
        URL url = new URL("https://www.example.com/sample.pdf");

        try (InputStream in = url.openStream();
             FileOutputStream out = new FileOutputStream("sample.pdf")) {

            byte[] buffer = new byte[8192];
            int len;
            while ((len = in.read(buffer)) != -1) {
                out.write(buffer, 0, len);
            }
            System.out.println("下载完成");
        }
    }
}
```

---

### 六、用 `URI` 和 `URL` 编码

URL 里如果有中文、空格、特殊字符，必须**编码**后才能正确传输，否则会出错。

```java
import java.net.URLEncoder;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

public class EncodeDemo {
    public static void main(String[] args) {
        // 编码：中文/特殊字符 → %xx 形式
        String encoded = URLEncoder.encode("张三 李四", StandardCharsets.UTF_8);
        System.out.println(encoded);   // %E5%BC%A0%E4%B8%89+%E6%9D%8E%E5%9B%9B

        // 解码
        String decoded = URLDecoder.decode(encoded, StandardCharsets.UTF_8);
        System.out.println(decoded);   // 张三 李四
    }
}
```

> ⚠️ **注意：** 拼接带中文参数的 URL 时，**一定要先 `URLEncoder.encode`**，否则请求会失败或乱码。

#### URI 与 URL 的关系

- **URI**（统一资源标识符）：是一个更宽泛的概念，强调「标识」
- **URL**：是 URI 的子集，强调「定位」（包含访问方式）
- Java 中常先用 `URI` 规范化字符串，再转 `URL`，能避免一些特殊字符的解析错误：

```java
// ✅ 推荐写法：先 URI 再 URL，处理特殊字符更稳健
URI uri = new URI("https", "www.example.com", "/search", "name=张三", null);
URL url = uri.toURL();
```

---

### 七、完整 API 参考

#### `URL` 常用方法

| 方法 | 说明 |
| --- | --- |
| `URL(String spec)` | 用字符串构造 URL |
| `getProtocol()` | 获取协议 |
| `getHost()` | 获取主机名 |
| `getPort()` | 获取端口 |
| `getPath()` | 获取路径 |
| `getQuery()` | 获取查询参数 |
| `openConnection()` | 打开连接，返回 URLConnection |
| `openStream()` | 简写，直接返回输入流 |

#### `URLConnection` 常用方法

| 方法 | 说明 |
| --- | --- |
| `setConnectTimeout(int)` | 连接超时（毫秒） |
| `setReadTimeout(int)` | 读取超时（毫秒） |
| `setRequestProperty(k, v)` | 设置请求头 |
| `connect()` | 主动建立连接 |
| `getInputStream()` | 获取输入流 |
| `getContentType()` | 内容类型 |
| `getContentLengthLong()` | 内容长度 |
| `getHeaderFields()` | 所有响应头 |

---

### 八、实际应用场景

| 场景 | 用法 |
| --- | --- |
| 抓取网页内容（爬虫入门） | `openStream()` 读 HTML |
| 下载图片 / 文件 | 读流写入本地文件 |
| 读取本地 file: 资源 | `new URL("file:///path")` |
| 解析、拼接 URL | `getHost()`、`URI` 规范化 |

> 💡 **提示：** 复杂的 HTTP 场景（POST、自定义头、JSON、异步）请用 [[HTTP通信]] 中的 `HttpClient`，比 `URLConnection` 更现代、更强大。

---

### 九、常见问题与注意事项

#### 1. 不设超时会卡死

`openStream()` 默认无限等待。网络异常时会一直阻塞。务必通过 `URLConnection` 设置超时。

#### 2. 中文参数未编码

```java
// ❌ 中文直接拼进 URL，会出错
URL url = new URL("https://example.com/search?name=张三");

// ✅ 先编码
String name = URLEncoder.encode("张三", StandardCharsets.UTF_8);
URL url = new URL("https://example.com/search?name=" + name);
```

#### 3. 乱码

读取流时务必指定编码：`new InputStreamReader(in, "UTF-8")`。

#### 4. `URL` vs `HttpClient` 怎么选

| 需求 | 选择 |
| --- | --- |
| 简单读取一个网络资源 | `URL.openStream()` |
| 需要超时、请求头 | `URLConnection` |
| POST、JSON、异步、HTTP/2 | `HttpClient`（Java 11+） |

---

### 十、总结

- `URL` 表示网络地址，可解析协议、主机、端口、路径等
- 读资源最简单：`url.openStream()`
- 需要配置（超时、头）：`url.openConnection()` 得到 `URLConnection`
- 涉及中文/特殊字符的参数，务必 `URLEncoder.encode`
- 复杂 HTTP 场景转用 [[HTTP通信]] 的 `HttpClient`
