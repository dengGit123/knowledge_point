### 一、概述

> 📖 [HTTP/1.1 规范（RFC 7230）](https://tools.ietf.org/html/rfc7230) ｜ [MDN - HTTP](https://developer.mozilla.org/zh-CN/docs/Web/HTTP)

**HTTP（HyperText Transfer Protocol，超文本传输协议）** 是浏览器和服务端之间通信的规则。它规定了「浏览器怎么问」和「服务端怎么答」的格式。

大白话：HTTP 就是浏览器和服务端的「对话语言」。你发一个 **请求**（Request），服务端回一个 **响应**（Response），双方都按固定格式写，对方才能看懂。

> 💡 **提示：** HTTP 是 [[HTTP协议]] 在 JavaWeb 中的具体应用视角。本文侧重「JavaWeb 开发者需要了解的 HTTP 知识」。

| 你将学到 | 说明 |
| --- | --- |
| 请求/响应的结构 | 报文长什么样 |
| HTTP 方法 | GET、POST 等方法的含义与区别 |
| 状态码 | 200、301、404、500 代表什么 |
| 常用头部字段 | Content-Type、Cookie、Location 等 |
| HTTP 的无状态性 | 为什么需要 Cookie/Session |

---

### 二、HTTP 请求报文结构

一个 HTTP 请求由 **请求行 + 请求头 + 空行 + 请求体** 四部分组成：

```
POST /login HTTP/1.1                ← 请求行（方法 + 路径 + 协议版本）
Host: localhost:8080                ←
Content-Type: application/x-www-form-urlencoded  ← 请求头（键值对）
Content-Length: 29                  ←
                                    ← 空行（必须！）
username=admin&password=123         ← 请求体（POST 的数据）
```

#### 1. 请求行

格式：`方法 路径 HTTP/版本`

```
GET /index.html HTTP/1.1
```

- **方法**：GET、POST、PUT、DELETE 等
- **路径**：要访问的资源路径
- **版本**：HTTP/1.1 或 HTTP/2

#### 2. 请求头（Request Headers）

请求头是键值对，告诉服务端「附加信息」：

| 头部字段 | 含义 | 示例 |
| --- | --- | --- |
| `Host` | 请求的目标主机和端口 | `Host: www.example.com` |
| `User-Agent` | 客户端信息（浏览器/系统） | `User-Agent: Chrome/120.0` |
| `Content-Type` | 请求体的数据格式 | `Content-Type: application/json` |
| `Content-Length` | 请求体的字节长度 | `Content-Length: 29` |
| `Cookie` | 携带的 Cookie 数据 | `Cookie: JSESSIONID=abc123` |
| `Referer` | 从哪个页面跳转过来 | `Referer: http://xxx.com/` |
| `Accept` | 客户端能接收的响应类型 | `Accept: text/html,application/json` |

#### 3. 请求体（Body）

- **GET 请求没有请求体**，参数拼在 URL 上：`/login?username=admin`
- **POST 请求有请求体**，数据放在 Body 中

请求体的格式由 `Content-Type` 决定：

| Content-Type | 格式 | 示例 |
| --- | --- | --- |
| `application/x-www-form-urlencoded` | 键值对（默认） | `username=admin&password=123` |
| `application/json` | JSON | `{"username":"admin","password":"123"}` |
| `multipart/form-data` | 表单文件上传 | 文件 + 文本混合 |

---

### 三、HTTP 响应报文结构

服务端处理完请求，返回的响应也由四部分组成：

```
HTTP/1.1 200 OK                     ← 状态行（版本 + 状态码 + 原因短语）
Content-Type: text/html;charset=UTF-8  ←
Content-Length: 1024                ← 响应头
Set-Cookie: JSESSIONID=abc123       ←
                                    ← 空行
<html>...</html>                    ← 响应体（HTML/JSON/文件等）
```

#### 1. 状态行

格式：`HTTP/版本 状态码 原因短语`

```
HTTP/1.1 200 OK
HTTP/1.1 404 Not Found
HTTP/1.1 500 Internal Server Error
```

#### 2. 响应头（Response Headers）

| 头部字段 | 含义 | 示例 |
| --- | --- | --- |
| `Content-Type` | 响应体的数据格式 | `Content-Type: text/html` |
| `Content-Length` | 响应体字节长度 | `Content-Length: 1024` |
| `Set-Cookie` | 让浏览器设置 Cookie | `Set-Cookie: name=value; Path=/` |
| `Location` | 重定向目标地址 | `Location: /login` |
| `Cache-Control` | 缓存策略 | `Cache-Control: no-cache` |

#### 3. 响应体

响应体就是浏览器真正收到的内容：HTML 页面、JSON 数据、图片、文件等。

---

### 四、HTTP 方法

HTTP 定义了一组方法，表示「要对资源做什么操作」：

| 方法 | 含义 | 是否幂等 | 是否有请求体 | 典型用途 |
| --- | --- | --- | --- | --- |
| **GET** | 获取资源 | ✅ | ❌ | 查询、搜索、访问页面 |
| **POST** | 提交数据 | ❌ | ✅ | 登录、注册、新增 |
| **PUT** | 更新资源（整体替换） | ✅ | ✅ | 修改整条记录 |
| **DELETE** | 删除资源 | ✅ | ❌ | 删除记录 |
| **PATCH** | 更新资源（部分修改） | ❌ | ✅ | 修改某个字段 |
| **HEAD** | 获取响应头（无 Body） | ✅ | ❌ | 检查资源是否存在 |
| **OPTIONS** | 询问支持的方法 | ✅ | ❌ | CORS 预检请求 |

> 💡 **幂等：** 多次执行结果相同就是幂等。GET 多次查结果一样（幂等）；POST 多次提交会创建多条记录（不幂等）。

#### GET vs POST 对比

这是面试高频题，也是实际开发最容易搞混的地方：

| 对比项 | GET | POST |
| --- | --- | --- |
| 参数位置 | URL 查询字符串 `?key=value` | 请求体 Body 中 |
| 数据量 | 受 URL 长度限制（浏览器一般 ~2KB~8KB） | 无限制（可传大文件） |
| 安全性 | 参数暴露在 URL（浏览器历史、日志） | 相对安全（但明文传输一样不安全） |
| 缓存 | 可被缓存 | 不缓存 |
| 书签 | 可以收藏为书签 | 不可以 |
| 语义 | **获取**数据（不应该有副作用） | **提交**数据（有副作用） |

> ⚠️ **注意：** GET 比 POST「不安全」只是相对 URL 可见而言。**HTTP 下 GET 和 POST 都是明文传输**，真正安全要用 **HTTPS**（见 [[HTTPS]]）。

---

### 五、HTTP 状态码

状态码是服务端告诉客户端「请求处理结果」的三位数字：

| 类别 | 含义 | 常见状态码 |
| --- | --- | --- |
| **1xx** | 信息性，请求已接收继续处理 | 100 Continue |
| **2xx** | 成功 | **200** OK、**201** Created、**204** No Content |
| **3xx** | 重定向，需要进一步操作 | **301** 永久重定向、**302** 临时重定向、**304** 未修改（缓存） |
| **4xx** | 客户端错误 | **400** 请求格式错误、**401** 未认证、**403** 无权限、**404** 资源不存在、**405** 方法不允许 |
| **5xx** | 服务端错误 | **500** 服务端内部错误、**502** 网关错误、**503** 服务不可用 |

#### 重点状态码详解

**200 OK** — 请求成功，最正常的响应。

**301 Moved Permanently** — 永久重定向，资源已永久搬到新地址。浏览器会**缓存**这个重定向。

**302 Found** — 临时重定向，资源临时在新地址。**不缓存**，下次还问原地址。

**304 Not Modified** — 资源未修改，用缓存版本。配合 `If-Modified-Since` 头部使用，节省带宽。

**400 Bad Request** — 请求报文格式错误（如 JSON 语法错、缺少必填参数）。

**401 Unauthorized** — 未认证，需要登录（「未授权」是历史翻译错误，实际是「未认证」）。

**403 Forbidden** — 已认证但无权限访问（服务端拒绝了）。

**404 Not Found** — 资源不存在（URL 写错了、资源被删了）。

**405 Method Not Allowed** — 请求方法不对（如 Servlet 只重写了 `doGet`，你发 POST 就 405）。

**500 Internal Server Error** — 服务端代码抛异常了。看日志定位。

> 💡 **提示：** 在 JavaWeb 中，`response.sendRedirect()` 返回的是 **302**；`request.getRequestDispatcher().forward()` 是服务端内部转发，**URL 不变，只返回一次 200**。

---

### 六、HTTP 的无状态性

#### 1. 什么是无状态

**无状态（Stateless）** 是指 HTTP 协议**每次请求都是独立的**，服务端不会记住上一次请求是谁发的。

```
第 1 次请求：GET /home    → 200 OK（但服务端不知道你是谁）
第 2 次请求：GET /profile  → 200 OK（服务端还是不知道你是谁）
```

#### 2. 为什么无状态

无状态是为了**简化服务端设计**——不用为每个客户端保存状态，服务端处理完请求就可以释放资源，容易做水平扩展。

#### 3. 怎么解决无状态

需要「记住用户」时（如登录后保持登录态），用 **会话跟踪技术**：

| 技术 | 存储位置 | 安全性 | 容量 | 生命周期 |
| --- | --- | --- | --- | --- |
| **Cookie** | 客户端（浏览器） | 低（可被篡改） | ~4KB | 可设过期时间 |
| **Session** | 服务端 | 高 | 无限制 | 默认 30 分钟无操作失效 |
| **Token（JWT）** | 客户端 | 中（签名防篡改） | ~4KB | 由 Token 本身决定 |

> 💡 **提示：** Cookie 和 Session 的详细机制见 [[Cookie与Session与Token]] 和本系列的 [[Cookie与Session]]。

---

### 七、常用 Content-Type 详解

`Content-Type` 是 JavaWeb 开发中最常打交道的头部，它告诉对方「Body 里的数据是什么格式」。

| Content-Type | 用途 | JavaWeb 中怎么处理 |
| --- | --- | --- |
| `application/x-www-form-urlencoded` | 普通表单提交 | `request.getParameter("key")` 直接取 |
| `multipart/form-data` | 文件上传 | `@MultipartConfig` + `request.getPart()` |
| `application/json` | JSON 数据（前后端分离常用） | 用 Jackson/Gson 解析 InputStream |
| `text/html` | HTML 页面 | 浏览器直接渲染 |
| `text/plain` | 纯文本 | 直接读字符串 |
| `application/octet-stream` | 二进制流（文件下载） | `response.getOutputStream()` 写文件 |

#### JSON 请求的处理示例

```java
// 前端发：POST /api/user  Body: {"name":"张三","age":20}
// Content-Type: application/json

@WebServlet("/api/user")
public class UserServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // ① 读取请求体中的 JSON 字符串
        BufferedReader reader = req.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        String json = sb.toString();  // {"name":"张三","age":20}

        // ② 用 Jackson 解析 JSON（需要 jackson-databind 依赖）
        ObjectMapper mapper = new ObjectMapper();
        User user = mapper.readValue(json, User.class);

        // ③ 处理业务...
        System.out.println(user.getName());  // 张三

        // ④ 返回 JSON 响应
        resp.setContentType("application/json;charset=UTF-8");
        resp.getWriter().write("{\"code\":200,\"msg\":\"success\"}");
    }
}
```

---

### 八、实际应用场景

#### 场景 1：RESTful API 设计

```
GET    /api/users        获取用户列表
GET    /api/users/1      获取 ID=1 的用户
POST   /api/users        创建新用户
PUT    /api/users/1      更新 ID=1 的用户
DELETE /api/users/1      删除 ID=1 的用户
```

#### 场景 2：重定向 vs 转发

```java
// 重定向（redirect）：服务端告诉浏览器「你再发一次请求到新地址」
// 浏览器 URL 会变，可以跨域，是两次请求
response.sendRedirect("/login");

// 转发（forward）：服务端内部把请求转给另一个资源处理
// 浏览器 URL 不变，只能项目内部，是一次请求
request.getRequestDispatcher("/login.jsp").forward(request, response);
```

| 对比 | 重定向 sendRedirect | 转发 forward |
| --- | --- | --- |
| 请求次数 | 2 次 | 1 次 |
| URL 变化 | 变 | 不变 |
| 数据共享 | 不能共享 request 域数据 | 可以共享 request 域 |
| 适用范围 | 可以跳到外部地址 | 只能项目内部 |
| 性能 | 较慢（多一次请求） | 较快 |

#### 场景 3：文件下载

```java
@WebServlet("/download")
public class DownloadServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String filename = req.getParameter("file");

        // ① 告诉浏览器这是下载文件，不是直接打开
        resp.setContentType("application/octet-stream");

        // ② 设置下载文件名（Content-Disposition）
        resp.setHeader("Content-Disposition", "attachment;filename=" + URLEncoder.encode(filename, "UTF-8"));

        // ③ 读取文件写入响应输出流
        InputStream in = getServletContext().getResourceAsStream("/files/" + filename);
        OutputStream out = resp.getOutputStream();
        byte[] buf = new byte[1024];
        int len;
        while ((len = in.read(buf)) != -1) {
            out.write(buf, 0, len);
        }
        in.close();
    }
}
```

---

### 九、常见问题与注意事项

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| 中文乱码 | 请求/响应编码不一致 | 统一 UTF-8：`request.setCharacterEncoding("UTF-8")` + `response.setContentType("text/html;charset=UTF-8")` |
| GET 请求中文乱码 | Tomcat 默认用 ISO-8859-1 解码 URL | 修改 server.xml 加 `URIEncoding="UTF-8"`，或用 `new String(param.getBytes("ISO-8859-1"), "UTF-8")` |
| 405 方法不允许 | Servlet 没重写对应方法 | 重写 `doGet`/`doPost`，或重写 `service()` |
| 404 找不到资源 | URL 路径不匹配 | 检查 `@WebServlet` 注解路径、web.xml 配置 |
| JSON 解析失败 | Content-Type 不是 application/json | 前端设置 `Content-Type: application/json` |

> ⚠️ **注意：** HTTP/1.1 默认使用**持久连接（Keep-Alive）**，一次 TCP 连接可以发多个请求。HTTP/2 更进一步支持多路复用。

---

### 十、总结

- HTTP 是**请求-响应**模型：请求行/头/体 + 状态行/头/体
- **GET 查、POST 提交、PUT 改、DELETE 删**（RESTful 风格）
- 状态码：**2xx 成功、3xx 重定向、4xx 客户端错、5xx 服务端错**
- HTTP 是**无状态**的，需要 Cookie/Session 做会话跟踪
- `Content-Type` 决定 Body 的解析方式，JSON 用 `application/json`
- **重定向**（URL 变，两次请求）vs **转发**（URL 不变，一次请求）
