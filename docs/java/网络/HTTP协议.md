### 一、概述

> 📖 [HTTP 概述（MDN）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview) ｜ [HTTP（维基百科）](https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE)

HTTP（HyperText Transfer Protocol，超文本传输协议）是应用层最广泛使用的协议，**整个 Web 的基石**。你在浏览器打开任何网页、前端调任何接口，底层基本都是 HTTP。

大白话：HTTP 是浏览器和服务器之间的「对话规则」。浏览器（客户端）按规则发一个请求，服务器按规则回一个响应，网页就显示出来了。

| 特性 | 说明 |
| --- | --- |
| 应用层协议 | 在 TCP 之上 |
| 请求-响应模式 | 一问一答 |
| 无状态 | 默认不记录历史请求（靠 Cookie/Session 弥补） |
| 可扩展 | 头部可自定义 |
| 文本协议 | HTTP/1.x 是明文（HTTP/2 起用二进制） |

> 💡 **提示：** 本文讲 HTTP **协议本身**（报文格式、方法、状态码、版本演进）。如果你想知道「Java 怎么发 HTTP 请求」，看 [[HTTP通信]]。

---

### 二、HTTP 的工作模型

```
   客户端（浏览器）                          服务器
       │  ── HTTP 请求（Request）──────►     │
       │     方法 + URL + 头 + 体             │
       │                                     │
       │  ◄──── HTTP 响应（Response）────     │
       │     状态码 + 头 + 体                 │
```

底层基于 TCP：浏览器先和服务器建立 TCP 连接（三次握手），然后在连接上发 HTTP 报文。

---

### 三、HTTP 报文结构

HTTP 报文分**请求**和**响应**两种，结构类似，都是「**起始行 + 头部 + 空行 + 体**」。

#### 1. HTTP 请求报文

```
POST /api/login HTTP/1.1            ← ① 请求行：方法 + 路径 + 版本
Host: www.example.com               ← ② 请求头（多行键值对）
Content-Type: application/json
Content-Length: 36
User-Agent: Mozilla/5.0
                                    ← ③ 空行（表示头部结束）
{"username":"admin","password":123} ← ④ 请求体（body）
```

#### 2. HTTP 响应报文

```
HTTP/1.1 200 OK                     ← ① 状态行：版本 + 状态码 + 原因
Content-Type: application/json      ← ② 响应头
Content-Length: 27
                                    ← ③ 空行
{"token":"xxx","role":"admin"}      ← ④ 响应体
```

> 💡 **提示：** 那个**空行非常关键**——它告诉对方「头部到此结束，后面是 body」。少了空行会导致解析错误。

---

### 四、HTTP 请求方法

方法表示「想对资源做什么」：

| 方法 | 含义 | 幂等 | 安全 | 有 body |
| --- | --- | --- | --- | --- |
| **GET** | 获取资源 | ✅ | ✅ | 一般无 |
| **POST** | 新增/提交数据 | ❌ | ❌ | ✅ |
| **PUT** | 完整更新（覆盖）资源 | ✅ | ❌ | ✅ |
| **DELETE** | 删除资源 | ✅ | ❌ | 可有 |
| **PATCH** | 部分更新资源 | ❌ | ❌ | ✅ |
| **HEAD** | 只取响应头（不要 body） | ✅ | ✅ | 无 |
| **OPTIONS** | 查询服务器支持的方法 | ✅ | ✅ | 无 |

#### 名词解释

- **幂等**：同一个请求执行**一次和多次**效果相同。比如 `DELETE /user/1` 删一次和删十次结果都一样（已删），是幂等的；`POST` 新增每次都产生新记录，不幂等。
- **安全**：不会修改服务器数据（只读）。GET、HEAD、OPTIONS 是安全的。

> 💡 **提示：** RESTful API 设计遵循：GET 查、POST 增、PUT/PATCH 改、DELETE 删。

---

### 五、HTTP 状态码

状态码用三位数字表示响应结果，按首位分类：

| 类别 | 含义 |
| --- | --- |
| **1xx** | 信息性（很少见） |
| **2xx** | 成功 |
| **3xx** | 重定向 |
| **4xx** | 客户端错误 |
| **5xx** | 服务端错误 |

常见状态码：

| 状态码 | 含义 | 说明 |
| --- | --- | --- |
| `200` | OK | 请求成功 |
| `201` | Created | 创建成功（POST） |
| `204` | No Content | 成功但无内容返回 |
| `301` | Moved Permanently | 永久重定向 |
| `302` | Found | 临时重定向 |
| `304` | Not Modified | 资源未修改，用缓存 |
| `400` | Bad Request | 请求语法/参数错误 |
| `401` | Unauthorized | 未认证（没登录） |
| `403` | Forbidden | 已认证但无权限 |
| `404` | Not Found | 资源不存在 |
| `405` | Method Not Allowed | 方法不允许（如对只读接口用 POST） |
| `500` | Internal Server Error | 服务器内部错误 |
| `502` | Bad Gateway | 网关错误 |
| `503` | Service Unavailable | 服务不可用（过载/维护） |
| `504` | Gateway Timeout | 网关超时 |

> 💡 **提示：** 区分 **401（没登录）** 和 **403（登录了但没权限）**，这是面试和排错的常见点。

---

### 六、常见请求头 / 响应头

| 头部 | 方向 | 作用 |
| --- | --- | --- |
| `Host` | 请求 | 目标主机名（HTTP/1.1 必填，支持虚拟主机） |
| `User-Agent` | 请求 | 客户端信息（浏览器类型） |
| `Accept` | 请求 | 客户端能接受的内容类型 |
| `Content-Type` | 请求/响应 | body 的数据类型（如 `application/json`） |
| `Content-Length` | 请求/响应 | body 的字节长度 |
| `Authorization` | 请求 | 鉴权信息（如 `Bearer token`） |
| `Cookie` | 请求 | 携带的 Cookie |
| `Set-Cookie` | 响应 | 设置 Cookie |
| `Location` | 响应（3xx） | 重定向的目标地址 |
| `Cache-Control` | 请求/响应 | 缓存策略 |
| `Connection` | 请求/响应 | 是否保持连接（`keep-alive`） |

#### Content-Type 常见值

| 值 | 含义 |
| --- | --- |
| `text/html` | HTML 网页 |
| `text/plain` | 纯文本 |
| `application/json` | JSON 数据 |
| `application/x-www-form-urlencoded` | 表单提交 |
| `multipart/form-data` | 文件上传 |
| `application/octet-stream` | 二进制流（文件下载） |

---

### 七、HTTP 版本演进

| 版本 | 年代 | 关键改进 |
| --- | --- | --- |
| **HTTP/0.9** | 1991 | 只支持 GET，纯文本 |
| **HTTP/1.0** | 1996 | 引入头、状态码、多种方法；每次请求新建连接 |
| **HTTP/1.1** | 1997 | **Keep-Alive 长连接**、Host 头、管道化、缓存控制 |
| **HTTP/2** | 2015 | **二进制分帧**、多路复用、头部压缩、服务端推送 |
| **HTTP/3** | 2022 | 基于 **QUIC（UDP）**，连接迁移、无队头阻塞 |

#### HTTP/1.1 的关键改进

- **持久连接（Keep-Alive）**：默认复用 TCP 连接，不必每次请求重新握手
- **Host 头**：一个 IP 可托管多个域名（虚拟主机）
- 仍存在的问题：**队头阻塞**（一个慢请求会阻塞后面的）

#### HTTP/2 的关键改进

- **二进制分帧**：报文不再纯文本，拆成二进制帧传输
- **多路复用**：一个 TCP 连接上**并行**发多个请求，解决 HTTP/1.1 的队头阻塞
- **头部压缩（HPACK）**：减少重复头的传输
- **服务端推送**：服务器可主动推送资源

#### HTTP/3

- 抛弃 TCP，基于 **QUIC（UDP 之上）**
- 建连更快（握手+加密合并）
- 彻底解决 TCP 层的队头阻塞

> 💡 **提示：** 队头阻塞（Head-of-Line Blocking）是 HTTP 演进要解决的核心问题。HTTP/2 解决了应用层的，HTTP/3 进一步解决传输层的。

---

### 八、HTTP 是无状态的

HTTP 协议本身**不记录上一次请求**——每个请求都是独立的，服务器默认不知道你是谁。

这带来一个问题：用户登录后，下次请求服务器怎么知道「还是你」？解决方案：

1. **Cookie + Session**：服务器发一个 Session ID（存 Cookie），下次请求带上来识别
2. **Token（如 JWT）**：登录后发一个 Token，每次请求放在 `Authorization` 头里

详见 [[Cookie与Session与Token]]。

---

### 九、HTTP 缓存（简述）

缓存能减少请求、加速访问。分两类：

| 缓存类型 | 相关头 | 说明 |
| --- | --- | --- |
| **强缓存** | `Cache-Control`、`Expires` | 在有效期内**直接用本地缓存**，不发请求 |
| **协商缓存** | `Last-Modified`/`ETag` | 发请求问服务器「变了吗」，没变返回 `304` |

```
强缓存流程：
  浏览器 → 有缓存且未过期？ → 是 → 直接用（200 from cache，没发请求）
                          → 否 → 进入协商缓存

协商缓存流程：
  浏览器 → 问服务器 → 没变 → 304 Not Modified → 用本地缓存
                   → 变了 → 200 + 新资源
```

---

### 十、常见问题与注意事项

#### 1. GET 和 POST 的区别

| 对比项 | GET | POST |
| --- | --- | --- |
| 参数位置 | URL 查询串 | 请求体 |
| 长度限制 | 浏览器对 URL 长度有限制 | 理论无限制 |
| 幂等 | 幂等 | 不幂等 |
| 安全性 | 参数暴露在 URL，会被缓存 | 相对隐蔽 |
| 可缓存 | 可被缓存/收藏 | 一般不缓存 |
| 语义 | 查询 | 提交/创建 |

> 💡 **提示：** 严格说 HTTP 规范没禁止 GET 带 body，但实践上**别这么干**，很多服务器/代理会忽略 GET 的 body。

#### 2. GET 参数有中文 / 特殊字符怎么办？

URL 只允许 ASCII 的部分字符，中文、空格、`&`、`=` 等必须 **URL 编码**（百分号编码），否则会解析错误或被截断。

#### 3. 跨域问题（CORS）

浏览器有**同源策略**：脚本默认不能请求不同源（协议+域名+端口不同）的接口。要跨域，服务端需设置 `Access-Control-Allow-Origin` 等响应头。详见前端跨域相关文档。

#### 4. HTTP 明文不安全

HTTP 传输是**明文**，能被窃听、篡改。涉及密码、隐私必须用 **HTTPS**。详见 [[HTTPS]]。

#### 5. 大文件上传/下载

- 上传：用 `multipart/form-data` 或分片上传
- 下载：用响应头 `Content-Disposition: attachment` 触发下载，或流式传输避免内存爆炸

---

### 十一、总结

| 要点 | 说明 |
| --- | --- |
| 模型 | 请求-响应，基于 TCP |
| 报文 | 起始行 + 头 + 空行 + 体 |
| 方法 | GET 查 / POST 增 / PUT 改 / DELETE 删 |
| 状态码 | 2xx 成功 / 3xx 重定向 / 4xx 客户端错 / 5xx 服务端错 |
| 版本 | 1.1（长连接）→ 2（多路复用）→ 3（QUIC） |
| 无状态 | 靠 Cookie/Session/Token 维持会话 |
| 安全 | 明文，敏感数据用 HTTPS |

HTTP 是 Web 通信的通用语言。学完协议本身，建议接着看 [[HTTPS]]（安全版）、[[DNS]]（域名解析）、[[Cookie与Session与Token]]（会话保持）。

相关文档：[[网络分层模型]]、[[TCP协议]]、[[HTTP通信]]。
