### 一、概述

> 📖 [HTTP Cookies（MDN）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies) ｜ [Using HTTP Cookies（MDN）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies)

HTTP 协议是**无状态**的——服务器记不住「上一次请求是谁发的」。但实际业务里，登录、购物车、个性化推荐都需要「记住用户」。于是有了 **Cookie、Session、Token** 三种会话保持方案。

大白话：
- **Cookie**：服务器在你浏览器里塞一张「**小卡片**」，你下次访问自动带上
- **Session**：服务器在它自己内存里开个「**档案柜**」记着你，给你一把钥匙（Session ID）
- **Token**：发给你一张「**电子通行证**」，你自己保管，上面有防伪签名，服务器不存

三者都是用来解决「**HTTP 无状态下如何识别用户**」的问题。

---

### 二、为什么需要它们——HTTP 无状态的困境

```
请求1: 登录      → 服务器验证密码，记住"这是用户A"
请求2: 查订单    → 服务器？？「你谁啊，我记不住你登录过」
```

因为 HTTP 无状态，请求2 服务器并不知道请求1 的登录状态。需要某种「**凭证**」让服务器识别用户。Cookie/Session/Token 就是这个凭证的不同实现。

---

### 三、Cookie

#### 1. 什么是 Cookie

Cookie 是**浏览器本地存储的一小段数据**（一般不超过 4KB），由服务器通过响应头下发，之后浏览器**每次请求自动带上**。

```
登录成功后：
服务器响应头: Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; Max-Age=3600

之后每次请求，浏览器自动带上：
请求头: Cookie: sessionId=abc123
```

#### 2. Cookie 的关键属性

| 属性 | 作用 |
| --- | --- |
| `Name=Value` | 键值对内容 |
| `Domain` | 生效的域名 |
| `Path` | 生效的路径 |
| `Max-Age` / `Expires` | 过期时间（不设则是会话 Cookie，关浏览器就没） |
| `Secure` | 只在 HTTPS 下发送 |
| `HttpOnly` | **JS 无法读取**（防 XSS 偷 Cookie） |
| `SameSite` | 跨站发送策略（防 CSRF） |

> ⚠️ **注意：** 存登录态等敏感信息的 Cookie，**务必加 `HttpOnly`**，否则 JavaScript 能用 `document.cookie` 读走，一旦有 XSS 漏洞就被盗号。

#### 3. Cookie 的特点

| 特点 | 说明 |
| --- | --- |
| 存储位置 | **浏览器端** |
| 大小 | 约 4KB |
| 自动携带 | 每次同域请求自动带上 |
| 跨域 | 受同源策略限制 |
| 安全 | 明文存储，需加 HttpOnly/Secure |

---

### 四、Session（会话）

#### 1. 什么是 Session

Session 是**服务器端**保存的会话数据。流程是：

```
① 用户登录 → 服务器验证通过
② 服务器在自己内存创建一个 Session 对象，存用户信息
③ 服务器生成唯一 Session ID，通过 Cookie 返回给浏览器
④ 之后请求，浏览器带上 Cookie（含 Session ID）
⑤ 服务器根据 Session ID 找到对应的 Session，识别用户
```

> 💡 **提示：** Session 的精髓——**数据存在服务器，客户端只拿一个 ID（钥匙）**。所以 Cookie 通常只是 Session ID 的载体。

#### 2. Session 的特点

| 特点 | 说明 |
| --- | --- |
| 存储位置 | **服务器端**（内存/Redis） |
| 安全性 | 高（数据不下发到客户端） |
| 大小 | 无限制（服务器存多少都行） |
| 扩展性 | ❌ 多服务器需共享 Session（痛点） |

#### 3. Session 的痛点：分布式下怎么办？

单台服务器时 Session 存内存没问题。但生产环境通常是**多台服务器 + 负载均衡**：

```
请求1 → 服务器A（登录，Session 存在 A）
请求2 → 负载均衡分到服务器B（B 没有这个 Session）→ 认为没登录！
```

解决 Session 共享的常见方案：

| 方案 | 说明 |
| --- | --- |
| **Session 粘性** | 负载均衡把同一用户固定分到同一台（简单但不灵活） |
| **Session 复制** | 服务器间同步 Session（开销大） |
| **集中存储** | Session 统一存 Redis 等外部存储（**主流方案**） |
| **Token** | 干脆不用 Session（见下文） |

> 💡 **提示：** 正是 Session 在分布式下的麻烦，催生了 Token（JWT）方案的流行。

---

### 五、Token（令牌）

#### 1. 什么是 Token

Token 是一个**自包含的、签名的字符串**。服务器不存任何会话状态，Token 本身就携带了用户信息，并带有签名防伪造。

```
登录成功 → 服务器签发一个 Token 返回
之后请求 → 客户端把 Token 放在请求头 Authorization: Bearer <token>
服务器 → 验证签名 → 信任 Token 里的用户信息
```

> 💡 **提示：** Token 模式下服务器**不存任何会话数据**（无状态），这是它和 Session 的根本区别——天然适合分布式/微服务。

#### 2. JWT（JSON Web Token）—— 最流行的 Token 格式

JWT 由三部分组成，用 `.` 分隔：

```
aaaa.bbbb.cccc
 │    │    │
 │    │    └─ 签名（Signature）
 │    └────── 载荷（Payload，真正的用户数据）
 └─────────── 头部（Header，算法类型）
```

**Header（头部）**：声明算法类型
```json
{ "alg": "HS256", "typ": "JWT" }
```

**Payload（载荷）**：存放声明（用户 ID、过期时间等）
```json
{ "userId": 1001, "username": "admin", "exp": 1700000000 }
```

**Signature（签名）**：防篡改的关键
```
签名 = HMAC( base64(Header) + "." + base64(Payload), 服务器密钥 )
```

> ⚠️ **注意：** JWT 的 Payload 是 **Base64 编码，不是加密**！任何人都能解开看到内容。所以**绝不要在 JWT 里放密码等敏感信息**。JWT 的安全靠的是**签名防篡改**（改了内容签名对不上），不是加密防查看。

#### 3. JWT 的验证原理

```
服务器收到 Token → 用自己密钥重新算签名
  → 和 Token 里的签名一致？ → 内容没被篡改，信任
  → 不一致？ → 被改过，拒绝
  → 检查 exp 是否过期
```

#### 4. Token 的特点

| 特点 | 说明 |
| --- | --- |
| 存储位置 | 客户端（localStorage / Cookie） |
| 服务器状态 | **无状态**（不存会话） |
| 扩展性 | ✅ 天然适合分布式 |
| 跨域 | 友好（放 Header，不依赖 Cookie） |
| 撤销 | ❌ 难（签发后到过期前都有效，需额外黑名单机制） |

---

### 六、三者核心对比

| 对比项 | Cookie | Session | Token |
| --- | --- | --- | --- |
| 存储位置 | 客户端（浏览器） | 服务端 | 客户端 |
| 服务器是否存状态 | 否（只是个载体） | **是** | **否** |
| 安全性 | 较低（明文） | 较高 | 较高（签名） |
| 分布式扩展 | - | 麻烦（需共享） | **简单** |
| 大小限制 | ~4KB | 无 | 无（但不宜太大） |
| 主动失效 | 改过期/删 Cookie | 容易（删服务端记录） | 较难（需黑名单） |
| 跨域支持 | 受限 | 受限（依赖 Cookie） | 好 |
| 典型场景 | 存偏好/Session ID | 传统单体 Web | 前后端分离/移动端/微服务 |

#### 一句话区分

- **Cookie** 是**存储机制**（浏览器存数据的地方）
- **Session** 是**会话机制**（服务器记住你，靠 Cookie 传 ID）
- **Token** 是**凭证机制**（自包含的签名通行证，服务器不存）

---

### 七、实际应用场景

#### 1. 传统 Web 站点（Java/PHP 渲染页面）

**Cookie + Session** 最常见：
```
登录 → 服务端建 Session，Set-Cookie 下发 sessionId
后续 → Cookie 自动带 sessionId，服务端识别
```

#### 2. 前后端分离 / 移动端 / 小程序

**Token（JWT）** 更合适：
```
登录 → 服务端签发 JWT，返回给前端
前端存 localStorage，请求放 Authorization 头
服务端验证签名，无需查会话存储
```

> 💡 **提示：** 前后端分离 + 移动端多端共用一套接口，Token 方案几乎是标配。

#### 3. 第三方登录（OAuth2）

用 **Access Token + Refresh Token** 机制：
- Access Token：访问资源的令牌，短期有效
- Refresh Token：用来换取新 Access Token，长期有效

---

### 八、常见问题与注意事项

#### 1. Cookie 被盗怎么办？

- 加 `HttpOnly` 防 JS 读取
- 加 `Secure` 只走 HTTPS
- 加 `SameSite=Strict/Lax` 防 CSRF
- 关键操作二次验证

#### 2. JWT 怎么实现「退出登录」？

JWT 签发后服务端没有记录，**无法直接作废**。常见做法：
- 缩短 Token 有效期（如 15 分钟）
- 配合 Refresh Token
- 维护一个**黑名单**（存要作废的 Token，校验时查）

#### 3. XSS 和 CSRF 区别（结合 Cookie）

- **XSS（跨站脚本）**：注入恶意 JS 偷你的 Cookie → 用 `HttpOnly` 防御
- **CSRF（跨站请求伪造）**：借用你浏览器里已登录的 Cookie 发请求 → 用 `SameSite` / CSRF Token 防御

#### 4. Token 放哪里存？

| 位置 | 优劣 |
| --- | --- |
| **localStorage** | 简单，但有 XSS 风险 |
| **Cookie（HttpOnly）** | 防 XSS 偷取，但有 CSRF 风险 |
| **内存（变量）** | 最安全（刷新丢失），适合短 Token |

#### 5. Session 还是 Token 怎么选？

- **传统单体应用、浏览器为主** → Session（Cookie+Session，简单省事）
- **前后端分离、多端、微服务** → Token（无状态、易扩展）
- **高安全要求** → Session（服务端可控作废）+ 短时 Token

---

### 九、总结

| 方案 | 一句话 |
| --- | --- |
| **Cookie** | 浏览器本地的小卡片，自动携带 |
| **Session** | 服务端的档案柜，靠 Cookie 传钥匙（Session ID） |
| **Token/JWT** | 自包含的签名通行证，服务端无状态 |

三者本质都是给无状态的 HTTP 加上「**身份识别能力**」：

- 想简单、服务端可控 → **Session**
- 想无状态、好扩展、多端通用 → **Token**
- Cookie 既是存储方式，也常作为 Session ID / Token 的载体

理解它们的取舍，是做用户认证方案选型的基础。

相关文档：[[HTTP协议]]、[[HTTPS]]。
