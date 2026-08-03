### 一、概述

> 📖 [HttpServletRequest（Oracle）](https://docs.oracle.com/javaee/7/api/javax/servlet/http/HttpServletRequest.html) ｜ [HttpServletResponse（Oracle）](https://docs.oracle.com/javaee/7/api/javax/servlet/http/HttpServletResponse.html)

在 JavaWeb 中，**HttpServletRequest** 和 **HttpServletResponse** 是 Servlet 处理请求时收到的两个核心对象：

- **Request（请求）**：封装了浏览器发来的所有信息（参数、头部、URL 等）
- **Response（响应）**：封装了服务端要返回给浏览器的所有信息（内容、头部、状态码）

大白话：Request 是「客户递过来的订单」，Response 是「你交给客户的成品」。Servlet 的工作就是读 Request、处理业务、写 Response。

| 你将学到 | 说明 |
| --- | --- |
| Request 获取请求数据 | 参数、头部、URL 信息 |
| Request 获取表单/JSON 数据 | 不同 Content-Type 的处理 |
| Request 域数据共享 | setAttribute / getAttribute |
| Response 设置响应 | 输出文本/JSON/文件 |
| 重定向与转发 | sendRedirect vs forward |
| 文件上传下载 | Multipart 处理 |

---

### 二、HttpServletRequest — 请求对象

#### 1. 获取请求参数

最常用的 API，用于获取表单字段、URL 查询参数：

```java
@WebServlet("/param")
public class ParamServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 获取单个参数（返回 String，没有返回 null）
        String name = req.getParameter("name");

        // 获取多选框等同名参数的多个值（返回 String[]）
        String[] hobbies = req.getParameterValues("hobby");
        // 如 hobby=reading&hobby=music → ["reading", "music"]

        // 获取所有参数名（返回 Enumeration）
        Enumeration<String> names = req.getParameterNames();

        // 获取所有参数的 Map（键=参数名，值=String[]）
        Map<String, String[]> map = req.getParameterMap();

        resp.getWriter().write("name=" + name);
    }
}
```

> ⚠️ **注意：** `getParameter()` 既能获取 URL 查询参数（GET），也能获取表单字段（POST form-urlencoded）。但**不能**获取 JSON 请求体的数据。

#### 2. 获取请求头信息

```java
// 获取 User-Agent（浏览器信息）
String userAgent = req.getHeader("User-Agent");

// 获取 Referer（从哪个页面跳转过来）
String referer = req.getHeader("Referer");

// 获取 Content-Type
String contentType = req.getContentType();

// 获取所有头部名称
Enumeration<String> headerNames = req.getHeaderNames();
```

#### 3. 获取请求的 URL 和路径信息

```java
// 完整 URL：http://localhost:8080/myapp/user/login?name=admin
StringBuffer url = req.getRequestURL();  // http://localhost:8080/myapp/user/login

// 请求 URI：/myapp/user/login
String uri = req.getRequestURI();        // /myapp/user/login

// 查询字符串：name=admin
String query = req.getQueryString();     // name=admin

// 项目上下文路径：/myapp
String ctxPath = req.getContextPath();   // /myapp

// Servlet 路径：/user/login
String servletPath = req.getServletPath(); // /user/login

// 路径信息（路径匹配时）：/123
String pathInfo = req.getPathInfo();     // 取决于 URL 映射方式
```

#### 4. 请求域数据共享

Request 域（`setAttribute`/`getAttribute`）用于在**一次请求的多个资源之间传递数据**（如 Servlet 转发给 JSP）：

```java
// Servlet 中设置数据
req.setAttribute("user", user);
req.setAttribute("msg", "操作成功");

// 转发到 JSP
req.getRequestDispatcher("/result.jsp").forward(req, resp);

// JSP 中取出数据（EL 表达式）
// ${user.name}  ${msg}
```

> 💡 **提示：** Request 域只在**一次请求内有效**（包括转发的目标页面）。重定向是两次请求，数据会丢失。

#### 5. 获取 JSON 请求体

当 Content-Type 是 `application/json` 时，`getParameter()` 取不到数据，需要手动读取请求体的 InputStream：

```java
@WebServlet("/api/user")
public class UserApiServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 读取请求体的全部内容
        BufferedReader reader = req.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        String json = sb.toString();
        // json = {"name":"张三","age":20}

        // 用 Jackson 解析（需要 jackson-databind 依赖）
        ObjectMapper mapper = new ObjectMapper();
        User user = mapper.readValue(json, User.class);
    }
}
```

#### 6. 请求转发（Forward）

转发是**服务端内部**把请求交给另一个资源处理，浏览器 URL 不变：

```java
// 转发到 JSP 页面
req.getRequestDispatcher("/result.jsp").forward(req, resp);

// 转发到另一个 Servlet
req.getRequestDispatcher("/other").forward(req, resp);
```

转发的特点：
- URL **不变**
- 只有**一次**请求
- 可以共享 **request 域**数据
- 只能转发到**项目内部**的资源

---

### 三、HttpServletResponse — 响应对象

#### 1. 输出文本/HTML

```java
// ① 设置响应类型和编码（必须在 getWriter 之前）
resp.setContentType("text/html;charset=UTF-8");

// ② 获取输出流
PrintWriter writer = resp.getWriter();

// ③ 写入内容
writer.write("<html><body><h1>Hello</h1></body></html>");
```

#### 2. 输出 JSON（前后端分离常用）

```java
@WebServlet("/api/data")
public class DataServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 设置 JSON 响应类型
        resp.setContentType("application/json;charset=UTF-8");

        // 构造数据
        Map<String, Object> data = new HashMap<>();
        data.put("code", 200);
        data.put("msg", "success");
        data.put("data", userService.findAll());

        // 用 Jackson 序列化为 JSON 字符串
        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(data);

        // 输出
        resp.getWriter().write(json);
    }
}
```

#### 3. 重定向（Redirect）

重定向是服务端告诉浏览器「你再发一次请求到新地址」，浏览器 URL 会变：

```java
// 重定向到项目内部
resp.sendRedirect(req.getContextPath() + "/login");

// 重定向到外部网站
resp.sendRedirect("https://www.baidu.com");
```

重定向的特点：
- URL **会变**
- 是**两次**请求
- **不能**共享 request 域数据
- 可以重定向到**任意地址**

#### 4. 设置响应头

```java
// 设置 Content-Type
resp.setContentType("text/html;charset=UTF-8");

// 设置自定义头部
resp.setHeader("X-Custom-Header", "value");

// 设置 Content-Disposition（文件下载时用）
resp.setHeader("Content-Disposition", "attachment;filename=report.xlsx");

// 设置 Cache-Control（禁止缓存）
resp.setHeader("Cache-Control", "no-cache, no-store");

// 设置 Cookie
resp.addCookie(new Cookie("token", "abc123"));
```

#### 5. 设置状态码

```java
// 200 OK（默认，不用手动设）
resp.setStatus(200);

// 302 重定向（sendRedirect 内部就是设 302）
resp.setStatus(302);
resp.setHeader("Location", "/login");

// 404 未找到
resp.sendError(404, "页面不存在");

// 500 服务端错误
resp.sendError(500, "服务器内部错误");
```

---

### 四、重定向 vs 转发 对比

| 对比项 | 重定向 sendRedirect | 转发 forward |
| --- | --- | --- |
| 请求次数 | **2 次** | **1 次** |
| URL 变化 | **会变** | **不变** |
| 数据共享 | 不能共享 request 域 | 可以共享 request 域 |
| 适用范围 | 任意地址（含外部） | 只能项目内部 |
| 性能 | 较慢（多一次网络往返） | 较快 |
| 使用场景 | 登录后跳转首页、表单提交后防重复提交 | Servlet → JSP 传数据、内部路由 |

#### 选择原则

```java
// 需要共享数据 → 用转发
req.setAttribute("user", user);
req.getRequestDispatcher("/home.jsp").forward(req, resp);

// 不需要共享数据、或要跳外部 → 用重定向
resp.sendRedirect("/login");

// 表单提交后 → 用重定向（防重复提交）
// 用户注册成功后重定向到详情页，刷新不会重复提交
resp.sendRedirect("/user/" + newUserId);
```

---

### 五、中文乱码问题

中文乱码是 JavaWeb 开发中最常见的问题，原因和解决方案：

#### 1. GET 请求参数乱码

**原因：** Tomcat 默认用 `ISO-8859-1` 解码 URL 中的参数。

**解决：** 修改 Tomcat 的 `conf/server.xml`：

```xml
<Connector port="8080" protocol="HTTP/1.1"
           URIEncoding="UTF-8"    ← 加这个属性
           ... />
```

或者手动转码（不推荐，每个参数都要转）：

```java
String name = new String(req.getParameter("name").getBytes("ISO-8859-1"), "UTF-8");
```

#### 2. POST 请求参数乱码

**原因：** 请求体默认编码不是 UTF-8。

**解决：** 在第一次调用 `getParameter()` 之前设置编码：

```java
// ✅ 必须在 getParameter 之前调用
req.setCharacterEncoding("UTF-8");
String name = req.getParameter("name");
```

> ⚠️ **注意：** `setCharacterEncoding("UTF-8")` **只对请求体生效**（POST 有效），对 URL 参数（GET）无效。

#### 3. 响应乱码

**原因：** 响应编码和浏览器解析编码不一致。

**解决：** 设置响应 Content-Type 时指定编码：

```java
// ✅ 方式一：setContentType 同时设类型和编码
resp.setContentType("text/html;charset=UTF-8");

// ✅ 方式二：分开设置
resp.setCharacterEncoding("UTF-8");
resp.setContentType("text/html");

// ❌ 错误：只设类型不设编码
resp.setContentType("text/html");
```

#### 4. 统一编码的最佳实践

实际项目中，用 **Filter 统一处理编码**（见本系列的 [[过滤器与监听器]]）：

```java
@WebFilter("/*")
public class EncodingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        chain.doFilter(request, response);  // 放行
    }
}
```

---

### 六、文件上传与下载

#### 1. 文件上传

Servlet 3.0 开始支持原生文件上传，无需第三方库：

```java
@WebServlet("/upload")
@MultipartConfig(  // 必须加这个注解
    fileSizeThreshold = 1024 * 1024,  // 内存阈值 1MB
    maxFileSize = 10 * 1024 * 1024,   // 单个文件最大 10MB
    maxRequestSize = 50 * 1024 * 1024 // 整个请求最大 50MB
)
public class UploadServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        // 获取普通表单字段
        String username = req.getParameter("username");

        // 获取上传的文件（name="avatar" 的 file 控件）
        Part filePart = req.getPart("avatar");

        // 获取文件名
        String fileName = filePart.getSubmittedFileName();

        // 保存到服务器
        String uploadPath = getServletContext().getRealPath("/uploads");
        filePart.write(uploadPath + File.separator + fileName);

        resp.getWriter().write("上传成功：" + fileName);
    }
}
```

> ⚠️ **注意：** 文件上传的表单必须设置 `enctype="multipart/form-data"`，且 `method="post"`：
> ```html
> <form action="/upload" method="post" enctype="multipart/form-data">
>     <input type="text" name="username">
>     <input type="file" name="avatar">
>     <button>上传</button>
> </form>
> ```

#### 2. 文件下载

```java
@WebServlet("/download")
public class DownloadServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String fileName = req.getParameter("file");

        // 获取文件的真实路径
        String filePath = getServletContext().getRealPath("/files/" + fileName);
        File file = new File(filePath);

        if (!file.exists()) {
            resp.sendError(404, "文件不存在");
            return;
        }

        // ① 设置响应头：告诉浏览器这是下载文件
        resp.setContentType("application/octet-stream");

        // ② 设置下载文件名（处理中文文件名乱码）
        String userAgent = req.getHeader("User-Agent");
        if (userAgent.contains("MSIE") || userAgent.contains("Trident")) {
            // IE 浏览器
            fileName = URLEncoder.encode(fileName, "UTF-8");
        } else {
            // 其他浏览器（Chrome、Firefox）
            fileName = new String(fileName.getBytes("UTF-8"), "ISO-8859-1");
        }
        resp.setHeader("Content-Disposition", "attachment;filename=" + fileName);

        // ③ 设置文件大小（浏览器显示下载进度）
        resp.setContentLengthLong(file.length());

        // ④ 读取文件写入响应输出流
        try (InputStream in = new FileInputStream(file);
             OutputStream out = resp.getOutputStream()) {
            byte[] buf = new byte[1024];
            int len;
            while ((len = in.read(buf)) != -1) {
                out.write(buf, 0, len);
            }
        }
    }
}
```

---

### 七、Request 域、Session 域、Context 域

JavaWeb 有三个域对象，用于在不同范围共享数据：

| 域对象 | 作用范围 | 生命周期 | 典型用途 |
| --- | --- | --- | --- |
| **Request 域** | 一次请求（含转发） | 请求开始到结束 | Servlet → JSP 传数据 |
| **Session 域** | 一个用户的所有请求 | 创建到超时/销毁 | 登录状态、购物车 |
| **ServletContext 域** | 所有用户、所有请求 | 应用启动到关闭 | 全局配置、在线人数 |

```java
// Request 域（一次请求内有效）
req.setAttribute("msg", "操作成功");
String msg = (String) req.getAttribute("msg");

// Session 域（同一用户多次请求有效）
HttpSession session = req.getSession();
session.setAttribute("loginUser", user);
User user = (User) session.getAttribute("loginUser");

// ServletContext 域（所有用户共享）
ServletContext context = getServletContext();
context.setAttribute("visitCount", 1000);
Integer count = (Integer) context.getAttribute("visitCount");
```

---

### 八、实际应用场景

#### 场景 1：登录校验

```java
@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        req.setCharacterEncoding("UTF-8");  // 防 POST 乱码

        String username = req.getParameter("username");
        String password = req.getParameter("password");

        User user = userService.login(username, password);
        if (user != null) {
            // 登录成功：Session 存用户信息，重定向到首页
            req.getSession().setAttribute("loginUser", user);
            resp.sendRedirect(req.getContextPath() + "/home");
        } else {
            // 登录失败：Request 存错误信息，转发回登录页
            req.setAttribute("errorMsg", "用户名或密码错误");
            req.getRequestDispatcher("/login.jsp").forward(req, resp);
        }
    }
}
```

#### 场景 2：RESTful API 统一响应

```java
@WebServlet("/api/*")
public class ApiServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json;charset=UTF-8");

        // 统一响应格式
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("msg", "success");
        result.put("data", data);

        new ObjectMapper().writeValue(resp.getOutputStream(), result);
    }
}
```

---

### 九、常见问题与注意事项

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| `getParameter()` 返回 null | 参数名拼写错误 / 没有该参数 | 检查表单字段名、URL 参数名 |
| `getWriter()` 和 `getOutputStream()` 冲突 | 同一个响应不能同时用两个 | 二选一，不要混用 |
| 重定向后 request 域数据丢失 | 重定向是两次请求 | 改用转发，或把数据存 Session |
| 文件上传报 500 | 没加 `@MultipartConfig` | 在 Servlet 上加 `@MultipartConfig` |
| 下载文件名中文乱码 | 不同浏览器编码方式不同 | 根据 User-Agent 分别处理 |
| 响应内容乱码 | `setContentType` 没设编码 | `resp.setContentType("text/html;charset=UTF-8")` |

> ⚠️ **注意：** `getWriter()`（字符流）和 `getOutputStream()`（字节流）**不能在同一响应中同时调用**，否则会抛 `IllegalStateException`。文本用 `getWriter()`，文件/图片用 `getOutputStream()`。

---

### 十、总结

- **Request** 封装请求信息：`getParameter()` 取参数、`getAttribute()` 取域数据、`getHeader()` 取头部
- **Response** 封装响应：`getWriter()` 输出文本、`getOutputStream()` 输出二进制、`sendRedirect()` 重定向
- **转发**（URL 不变，一次请求，共享 request 域）vs **重定向**（URL 变，两次请求）
- 中文乱码：GET 改 server.xml，POST 用 `setCharacterEncoding("UTF-8")`，响应用 `setContentType("...;charset=UTF-8")`
- 文件上传用 `@MultipartConfig` + `Part`，文件下载设 `Content-Disposition: attachment`
- 三个域：**Request（一次请求）< Session（一个用户）< Context（所有用户）**
