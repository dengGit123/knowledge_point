# HTTP 与 HTTPS 详解

## 目录

- [一、HTTP 概述](#一http-概述)
- [二、HTTP 工作原理](#二http-工作原理)
- [三、HTTP 请求报文](#三http-请求报文)
- [四、HTTP 响应报文](#四http-响应报文)
- [五、常见请求头（Request Headers）](#五常见请求头request-headers)
- [六、常见响应头（Response Headers）](#六常见响应头response-headers)
- [七、HTTP 状态码](#七http-状态码)
- [八、HTTPS 概述](#八https-概述)
- [九、HTTPS 工作原理（TLS/SSL 握手）](#九https-工作原理tlsssl-握手)
- [十、HTTP 与 HTTPS 的区别](#十http-与-https-的区别)
- [十一、相关跳转链接](#十一相关跳转链接)

---

## 一、HTTP 概述

**HTTP（HyperText Transfer Protocol，超文本传输协议）** 是一种用于分布式、协作式和超媒体信息系统的应用层协议。它是万维网（World Wide Web）数据通信的基础。

### 核心特点

| 特点 | 说明 |
|------|------|
| **无状态** | 服务器不保存客户端的任何信息，每个请求都是独立的 |
| **请求-响应模型** | 客户端发起请求，服务器返回响应 |
| **基于 TCP** | HTTP 协议默认使用 TCP 作为传输层协议 |
| **明文传输** | 数据不加密，容易被窃听和篡改 |
| **灵活** | 支持任意类型的数据传输（通过 Content-Type 标识） |

### 默认端口

- HTTP 默认端口：**80**
- HTTPS 默认端口：**443**

> 📖 参考：[MDN - HTTP 概述](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview)

---

## 二、HTTP 工作原理

HTTP 采用**请求/响应（Request/Response）**模型，通信过程如下：

```
客户端（浏览器）                              服务器
    |                                          |
    |-------- 1. 建立 TCP 连接 --------------->|
    |                                          |
    |-------- 2. 发送 HTTP 请求 -------------->|
    |        (请求行 + 请求头 + 请求体)          |
    |                                          |
    |<------- 3. 返回 HTTP 响应 ---------------|
    |        (状态行 + 响应头 + 响应体)          |
    |                                          |
    |-------- 4. 关闭连接（或保持连接）-------->|
```

### 通信流程详解

1. **建立 TCP 连接**：客户端通过 DNS 解析获取服务器 IP 地址，与服务器建立 TCP 连接（三次握手）
2. **发送 HTTP 请求**：客户端向服务器发送请求报文
3. **服务器处理并响应**：服务器接收请求，处理后返回响应报文
4. **关闭或复用连接**：根据 `Connection` 头的设置，关闭连接或保持复用

### HTTP 版本演进

| 版本 | 特点 |
|------|------|
| **HTTP/1.0** | 每个请求需建立新的 TCP 连接，效率低 |
| **HTTP/1.1** | 引入持久连接（keep-alive）、管道化、分块传输 |
| **HTTP/2** | 多路复用、头部压缩、服务器推送、二进制分帧 |
| **HTTP/3** | 基于 QUIC 协议（UDP），减少延迟，改进拥塞控制 |

---

## 三、HTTP 请求报文

HTTP 请求报文由以下四个部分组成：

```
请求行（Request Line）
请求头（Request Headers）
空行（CRLF）
请求体（Request Body）
```

### 示例

```http
GET /api/users?name=zhangsan HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0
Accept: application/json
Content-Type: application/json
Authorization: Bearer token123

{"key": "value"}
```

### 各部分说明

| 组成部分 | 说明 |
|----------|------|
| **请求行** | 包含请求方法、请求 URI 和 HTTP 版本 |
| **请求头** | 以键值对形式传递附加信息（如客户端类型、接受的内容类型等） |
| **空行** | 分隔请求头和请求体（CRLF，即 `\r\n`） |
| **请求体** | 可选，用于 POST/PUT 等方法携带数据 |

### 常见请求方法

| 方法 | 说明 | 是否包含请求体 |
|------|------|----------------|
| `GET` | 获取资源 | 否 |
| `POST` | 提交数据/创建资源 | 是 |
| `PUT` | 更新资源（整体替换） | 是 |
| `PATCH` | 部分更新资源 | 是 |
| `DELETE` | 删除资源 | 否 |
| `HEAD` | 获取资源的元信息（只返回头） | 否 |
| `OPTIONS` | 查询服务器支持的请求方法 | 否 |

---

## 四、HTTP 响应报文

HTTP 响应报文由以下四个部分组成：

```
状态行（Status Line）
响应头（Response Headers）
空行（CRLF）
响应体（Response Body）
```

### 示例

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 27
Cache-Control: no-cache
Set-Cookie: sessionId=abc123; Path=/

{"name": "zhangsan", "age": 25}
```

### 各部分说明

| 组成部分 | 说明 |
|----------|------|
| **状态行** | 包含 HTTP 版本、状态码和状态描述 |
| **响应头** | 以键值对形式传递服务器附加信息 |
| **空行** | 分隔响应头和响应体 |
| **响应体** | 服务器返回的实际数据（HTML、JSON、图片等） |

---

## 五、常见请求头（Request Headers）

请求头用于客户端向服务器传递请求的附加信息。

### 5.1 通用请求头

| 请求头 | 说明 | 示例 |
|--------|------|------|
| `Host` | 指定请求的服务器域名和端口（HTTP/1.1 必需） | `Host: www.example.com` |
| `User-Agent` | 标识客户端的类型、操作系统、浏览器版本 | `User-Agent: Mozilla/5.0 (Windows NT 10.0)` |
| `Accept` | 客户端能够接收的内容类型（MIME） | `Accept: text/html, application/json` |
| `Accept-Language` | 客户端偏好的自然语言 | `Accept-Language: zh-CN, zh;q=0.9, en;q=0.8` |
| `Accept-Encoding` | 客户端支持的压缩算法 | `Accept-Encoding: gzip, deflate, br` |
| `Accept-Charset` | 客户端支持的字符集 | `Accept-Charset: utf-8` |
| `Connection` | 控制连接是否保持 | `Connection: keep-alive` 或 `close` |
| `Referer` | 表示请求来源页面的 URL | `Referer: https://www.example.com/page` |
| `Origin` | 标识跨域请求的来源（不含路径） | `Origin: https://www.example.com` |

### 5.2 认证与安全相关

| 请求头 | 说明 | 示例 |
|--------|------|------|
| `Authorization` | 携带身份认证凭证 | `Authorization: Bearer eyJhbGciOi...` |
| `Cookie` | 携带服务器设置的 Cookie 数据 | `Cookie: sessionId=abc123; theme=dark` |
| `X-Forwarded-For` | 标识客户端原始 IP（经过代理时） | `X-Forwarded-For: 192.168.1.1` |
| `X-Real-IP` | Nginx 中常用的真实客户端 IP | `X-Real-IP: 192.168.1.1` |

### 5.3 内容协商相关

| 请求头 | 说明 | 示例 |
|--------|------|------|
| `Content-Type` | 请求体的媒体类型（POST/PUT 时使用） | `Content-Type: application/json` |
| `Content-Length` | 请求体的字节长度 | `Content-Length: 1024` |
| `Content-Encoding` | 请求体的编码方式 | `Content-Encoding: gzip` |
| `If-Modified-Since` | 资源在指定日期之后是否修改过（缓存验证） | `If-Modified-Since: Wed, 21 Oct 2024 07:28:00 GMT` |
| `If-None-Match` | 携带 ETag 值进行缓存验证 | `If-None-Match: "33a64df5"` |

### 5.4 缓存相关

| 请求头 | 说明 | 示例 |
|--------|------|------|
| `Cache-Control` | 控制缓存行为 | `Cache-Control: no-cache` |
| `Pragma` | HTTP/1.0 遗留的缓存控制 | `Pragma: no-cache` |

### 5.5 内容类型（Content-Type）常见取值

| 取值 | 说明 |
|------|------|
| `application/json` | JSON 格式数据 |
| `application/x-www-form-urlencoded` | 表单默认编码格式（键值对） |
| `multipart/form-data` | 表单文件上传格式 |
| `text/html` | HTML 文档 |
| `text/plain` | 纯文本 |
| `application/xml` | XML 数据 |
| `application/octet-stream` | 二进制流（文件下载） |

> 📖 参考：[MDN - HTTP 请求头](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers#%E8%AF%B7%E6%B1%82%E5%A4%B4)

---

## 六、常见响应头（Response Headers）

响应头用于服务器向客户端传递响应的附加信息。

### 6.1 通用响应头

| 响应头 | 说明 | 示例 |
|--------|------|------|
| `Content-Type` | 响应体的媒体类型及字符编码 | `Content-Type: text/html; charset=utf-8` |
| `Content-Length` | 响应体的字节长度 | `Content-Length: 512` |
| `Content-Encoding` | 响应体的压缩编码方式 | `Content-Encoding: gzip` |
| `Content-Disposition` | 指示响应内容应如何展示（内联/附件） | `Content-Disposition: attachment; filename="file.zip"` |
| `Content-Language` | 响应内容的语言 | `Content-Language: zh-CN` |
| `Content-Location` | 资源的另一个位置 | `Content-Location: /index.en.html` |
| `Content-Range` | 部分内容响应的字节范围 | `Content-Range: bytes 0-499/2000` |
| `Transfer-Encoding` | 传输编码方式（如分块传输） | `Transfer-Encoding: chunked` |
| `Connection` | 连接管理 | `Connection: keep-alive` |
| `Server` | 服务器软件信息 | `Server: nginx/1.18.0` |
| `Date` | 响应生成的日期时间 | `Date: Thu, 31 Jul 2025 08:00:00 GMT` |
| `Vary` | 告诉缓存服务器哪些请求头影响缓存 | `Vary: Accept-Encoding, User-Agent` |

### 6.2 缓存相关

| 响应头 | 说明 | 示例 |
|--------|------|------|
| `Cache-Control` | 控制缓存策略（最重要） | `Cache-Control: max-age=3600, public` |
| `Expires` | 资源的过期时间（HTTP/1.0） | `Expires: Thu, 07 Aug 2025 08:00:00 GMT` |
| `ETag` | 资源的唯一标识符（用于缓存验证） | `ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"` |
| `Last-Modified` | 资源最后修改时间 | `Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT` |
| `Age` | 资源在缓存中的存活时间（秒） | `Age: 120` |

#### Cache-Control 常用指令

| 指令 | 说明 |
|------|------|
| `public` | 任何缓存都可以缓存响应 |
| `private` | 只有浏览器可以缓存，中间代理不能缓存 |
| `no-cache` | 使用前必须向服务器验证缓存有效性 |
| `no-store` | 禁止缓存响应内容 |
| `max-age=<seconds>` | 资源在指定秒数内有效 |
| `must-revalidate` | 缓存过期后必须向服务器验证 |
| `immutable` | 资源不会改变，无需重新验证 |

### 6.3 重定向相关

| 响应头 | 说明 | 示例 |
|--------|------|------|
| `Location` | 重定向的目标 URL | `Location: https://www.new-url.com` |

### 6.4 安全相关

| 响应头 | 说明 | 示例 |
|--------|------|------|
| `Strict-Transport-Security` | 强制使用 HTTPS（HSTS） | `Strict-Transport-Security: max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | 禁止浏览器 MIME 类型嗅探 | `X-Content-Type-Options: nosniff` |
| `X-Frame-Options` | 控制页面是否允许在 iframe 中加载 | `X-Frame-Options: DENY` 或 `SAMEORIGIN` |
| `X-XSS-Protection` | 浏览器 XSS 过滤器的开关 | `X-XSS-Protection: 1; mode=block` |
| `Content-Security-Policy` | 内容安全策略，限制资源加载 | `Content-Security-Policy: default-src 'self'` |
| `Referrer-Policy` | 控制 Referer 头的发送策略 | `Referrer-Policy: strict-origin-when-cross-origin` |
| `Permissions-Policy` | 控制浏览器功能的访问权限 | `Permissions-Policy: camera=(), microphone=()` |
| `Cross-Origin-Opener-Policy` | 控制跨域窗口交互 | `Cross-Origin-Opener-Policy: same-origin` |
| `Cross-Origin-Resource-Policy` | 控制跨域资源加载 | `Cross-Origin-Resource-Policy: same-origin` |

### 6.5 CORS 跨域相关

| 响应头 | 说明 | 示例 |
|--------|------|------|
| `Access-Control-Allow-Origin` | 允许跨域请求的来源 | `Access-Control-Allow-Origin: https://www.example.com` 或 `*` |
| `Access-Control-Allow-Methods` | 允许的 HTTP 方法 | `Access-Control-Allow-Methods: GET, POST, PUT, DELETE` |
| `Access-Control-Allow-Headers` | 允许的请求头 | `Access-Control-Allow-Headers: Content-Type, Authorization` |
| `Access-Control-Allow-Credentials` | 是否允许携带 Cookie | `Access-Control-Allow-Credentials: true` |
| `Access-Control-Max-Age` | 预检请求的缓存时间（秒） | `Access-Control-Max-Age: 86400` |
| `Access-Control-Expose-Headers` | 允许浏览器访问的响应头 | `Access-Control-Expose-Headers: X-Custom-Header` |

### 6.6 Cookie 相关

| 响应头 | 说明 | 示例 |
|--------|------|------|
| `Set-Cookie` | 服务器向客户端设置 Cookie | `Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; SameSite=Lax` |

#### Set-Cookie 属性说明

| 属性 | 说明 |
|------|------|
| `Domain` | Cookie 生效的域名 |
| `Path` | Cookie 生效的路径 |
| `Expires` / `Max-Age` | Cookie 的过期时间 |
| `HttpOnly` | 禁止 JavaScript 访问 Cookie（防 XSS） |
| `Secure` | 仅通过 HTTPS 传输 Cookie |
| `SameSite` | 控制跨站请求是否发送 Cookie（`Strict` / `Lax` / `None`） |

### 6.7 条件请求相关

| 响应头 | 说明 | 示例 |
|--------|------|------|
| `ETag` | 资源的实体标签（版本标识） | `ETag: "33a64df5"` |
| `Last-Modified` | 资源最后修改时间 | `Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT` |

> 📖 参考：[MDN - HTTP 响应头](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers#%E5%93%8D%E5%BA%94%E5%A4%B4)

---

## 七、HTTP 状态码

状态码用于表示服务器对请求的处理结果，分为五大类：

| 类别 | 说明 | 范围 |
|------|------|------|
| **1xx** | 信息性状态码，请求已接收，继续处理 | 100-199 |
| **2xx** | 成功状态码，请求已被成功处理 | 200-299 |
| **3xx** | 重定向状态码，需要进一步操作 | 300-399 |
| **4xx** | 客户端错误状态码，请求有误 | 400-499 |
| **5xx** | 服务器错误状态码，服务器处理失败 | 500-599 |

### 常见状态码

| 状态码 | 说明 | 使用场景 |
|--------|------|----------|
| `200` | OK，请求成功 | 正常的 GET 请求 |
| `201` | Created，资源创建成功 | POST 创建资源成功 |
| `204` | No Content，无响应体 | DELETE 删除成功 |
| `301` | Moved Permanently，永久重定向 | 网站更换域名 |
| `302` | Found，临时重定向 | 临时跳转 |
| `304` | Not Modified，资源未修改 | 缓存命中 |
| `400` | Bad Request，请求格式错误 | 参数缺失或格式错误 |
| `401` | Unauthorized，未认证 | 未登录或 Token 无效 |
| `403` | Forbidden，禁止访问 | 权限不足 |
| `404` | Not Found，资源不存在 | URL 路径错误 |
| `405` | Method Not Allowed，方法不允许 | 使用了不支持的 HTTP 方法 |
| `408` | Request Timeout，请求超时 | 请求耗时过长 |
| `429` | Too Many Requests，请求过于频繁 | 触发限流 |
| `500` | Internal Server Error，服务器内部错误 | 服务端代码异常 |
| `502` | Bad Gateway，网关错误 | 上游服务不可用 |
| `503` | Service Unavailable，服务不可用 | 服务过载或维护 |
| `504` | Gateway Timeout，网关超时 | 上游服务响应超时 |

> 📖 参考：[MDN - HTTP 状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)

---

## 八、HTTPS 概述

**HTTPS（HyperText Transfer Protocol Secure）** 是 HTTP 的安全版本，通过 **SSL/TLS** 协议对传输数据进行加密，确保数据在传输过程中的**机密性**、**完整性**和**身份认证**。

### HTTPS 的核心目标

| 目标 | 说明 |
|------|------|
| **机密性（Confidentiality）** | 通过加密防止数据被窃听 |
| **完整性（Integrity）** | 通过消息摘要防止数据被篡改 |
| **身份认证（Authentication）** | 通过数字证书验证服务器身份，防止中间人攻击 |

### HTTPS 与 HTTP 的关系

```
HTTP 协议栈：                  HTTPS 协议栈：
+-----------+                  +-----------+
|   HTTP    |                  |   HTTP    |
+-----------+                  +-----------+
|   TCP     |                  |  TLS/SSL  |
+-----------+                  +-----------+
|   IP      |                  |   TCP     |
+-----------+                  +-----------+
                               |   IP     |
                               +-----------+
```

> HTTPS = HTTP + TLS/SSL，HTTP 协议本身不变，只是在 HTTP 和 TCP 之间加了一层 TLS/SSL 加密层。

---

## 九、HTTPS 工作原理（TLS/SSL 握手）

HTTPS 的安全性依赖于 **TLS（Transport Layer Security，传输层安全协议）**，其前身是 SSL。目前广泛使用的是 TLS 1.2 和 TLS 1.3。

### TLS 握手过程（TLS 1.2）

```
客户端                                    服务器
  |                                         |
  |--- 1. ClientHello --------------------->|
  |    (支持的 TLS 版本、加密套件列表、       |
  |     客户端随机数)                        |
  |                                         |
  |<-- 2. ServerHello ----------------------|
  |    (选定的 TLS 版本、加密套件、           |
  |     服务器随机数)                        |
  |                                         |
  |<-- 3. Certificate ----------------------|
  |    (服务器数字证书)                      |
  |                                         |
  |<-- 4. ServerHelloDone ------------------|
  |                                         |
  |--- 5. ClientKeyExchange --------------->|
  |    (用服务器公钥加密的预主密钥)           |
  |                                         |
  |--- 6. ChangeCipherSpec --------------->|
  |    (通知后续使用协商的密钥加密)           |
  |                                         |
  |--- 7. Finished (Encrypted) ----------->|
  |                                         |
  |<-- 8. ChangeCipherSpec -----------------|
  |                                         |
  |<-- 9. Finished (Encrypted) -------------|
  |                                         |
  |===== 加密通信开始（对称加密） ============|
```

### 握手步骤详解

| 步骤 | 名称 | 说明 |
|------|------|------|
| 1 | **ClientHello** | 客户端发送支持的 TLS 版本、加密套件（Cipher Suites）列表、客户端随机数 |
| 2 | **ServerHello** | 服务器选择 TLS 版本和加密套件，发送服务器随机数 |
| 3 | **Certificate** | 服务器发送数字证书（包含公钥），证明自身身份 |
| 4 | **ServerHelloDone** | 服务器告知握手信息发送完毕 |
| 5 | **ClientKeyExchange** | 客户端生成预主密钥（Pre-Master Secret），用服务器公钥加密后发送 |
| 6-7 | **ChangeCipherSpec + Finished** | 双方协商出会话密钥，通知后续通信使用对称加密 |
| 8-9 | **ChangeCipherSpec + Finished** | 服务器确认切换到加密通信 |

### 密钥生成原理

```
客户端随机数 + 服务器随机数 + 预主密钥
              ↓
        伪随机函数（PRF）
              ↓
         主密钥（Master Secret）
              ↓
        密钥块（Key Block）
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
客户端写密钥  服务器写密钥 初始化向量
（对称加密）  （对称加密）
```

### TLS 1.3 的改进

TLS 1.3 对握手过程进行了大幅优化：

| 改进点 | 说明 |
|--------|------|
| **1-RTT 握手** | 将握手从 2-RTT 减少到 1-RTT，降低延迟 |
| **0-RTT 恢复** | 支持会话恢复时实现 0-RTT（有重放攻击风险） |
| **简化加密套件** | 移除了不安全的算法（如 RSA 密钥交换、RC4、SHA-1） |
| **前向安全** | 强制使用 ECDHE，确保即使私钥泄露也无法解密历史通信 |

### 数字证书与 CA

| 概念 | 说明 |
|------|------|
| **数字证书（Certificate）** | 由 CA 签发，包含服务器公钥、域名、有效期等信息 |
| **CA（Certificate Authority）** | 证书颁发机构，负责验证服务器身份并签发证书 |
| **证书链（Certificate Chain）** | 从服务器证书到根证书的信任链 |
| **公钥基础设施（PKI）** | 管理密钥和证书的框架体系 |

### 证书验证过程

1. 浏览器收到服务器证书
2. 检查证书中的域名是否与访问的域名匹配
3. 检查证书是否在有效期内
4. 检查证书是否由受信任的 CA 签发（通过证书链验证）
5. 检查证书是否被吊销（通过 CRL 或 OCSP）

> 📖 参考：[MDN - TLS 协议](https://developer.mozilla.org/zh-CN/docs/Web/Security/Transport_Layer_Security)

---

## 十、HTTP 与 HTTPS 的区别

| 对比项 | HTTP | HTTPS |
|--------|------|-------|
| **全称** | HyperText Transfer Protocol | HyperText Transfer Protocol Secure |
| **安全性** | 明文传输，不安全 | 加密传输，安全 |
| **默认端口** | 80 | 443 |
| **协议层** | 直接基于 TCP | 基于 TLS/SSL + TCP |
| **加密** | 无加密 | 使用 TLS/SSL 加密 |
| **证书** | 不需要 | 需要 CA 签发的数字证书 |
| **速度** | 较快（无握手开销） | 略慢（TLS 握手 + 加解密开销） |
| **SEO** | 无优势 | Google 等搜索引擎优先收录 HTTPS 站点 |
| **浏览器标识** | 显示"不安全" | 显示锁形图标 |
| **适用场景** | 内部系统、不敏感信息 | 登录、支付、用户隐私数据等 |

### HTTP 升级到 HTTPS 的步骤

1. **申请数字证书**：从受信任的 CA（如 Let's Encrypt、DigiCert）申请证书
2. **配置服务器**：在 Web 服务器（Nginx/Apache）上安装证书并配置 443 端口
3. **设置重定向**：配置 HTTP 到 HTTPS 的 301 永久重定向
4. **更新资源链接**：将页面中的 HTTP 资源引用改为 HTTPS（避免混合内容）
5. **启用 HSTS**：配置 `Strict-Transport-Security` 头，强制浏览器使用 HTTPS

---

## 十一、相关跳转链接

| 资源 | 链接 |
|------|------|
| MDN - HTTP 概述 | https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview |
| MDN - HTTP 请求头 | https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers#%E8%AF%B7%E6%B1%82%E5%A4%B4 |
| MDN - HTTP 响应头 | https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers#%E5%93%8D%E5%BA%94%E5%A4%B4 |
| MDN - HTTP 状态码 | https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status |
| MDN - TLS 协议 | https://developer.mozilla.org/zh-CN/docs/Web/Security/Transport_Layer_Security |
| MDN - CORS 跨域 | https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS |
| MDN - HTTP 缓存 | https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching |
| RFC 9110 - HTTP 语义 | https://httpwg.org/specs/rfc9110.html |
| Let's Encrypt（免费证书） | https://letsencrypt.org/zh-cn/ |