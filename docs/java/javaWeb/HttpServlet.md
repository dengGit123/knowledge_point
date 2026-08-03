### 一、概述

> 📖 [HttpServlet（Oracle）](https://docs.oracle.com/javaee/7/api/javax/servlet/http/HttpServlet.html)

**HttpServlet** 继承 `GenericServlet`，专门为 **HTTP 协议**定制。它是实际开发中**使用最多的类**——你写的 99% 的 Servlet 都继承它。

大白话：HttpServlet 是 GenericServlet 的「HTTP 特化版」。它帮你按请求方法（GET/POST/PUT/DELETE）自动分发，你只需要重写对应的 `doGet()`/`doPost()` 就行。

> 💡 **提示：** Spring MVC 的 `DispatcherServlet` 本质上就是一个特殊的 HttpServlet。学懂它，才能理解所有 Java Web 框架。

| 你将学到 | 说明 |
| --- | --- |
| HttpServlet 核心改进 | 比 GenericServlet 强在哪 |
| service() 源码逻辑 | 请求方法如何分发 |
| 各种 doXxx() 方法 | doGet/doPost/doPut/doDelete |
| 条件请求处理 | getLastModified 与 304 缓存 |
| 实际开发示例 | 完整的 CRUD Servlet |
| 继承关系总结 | Servlet → GenericServlet → HttpServlet |

---

### 二、HttpServlet 的核心改进

| 改进 | 说明 |
| --- | --- |
| **实现了 `service()`** | 根据请求方法自动分发到 `doGet()`/`doPost()` 等 |
| **HTTP 专用** | 参数直接是 `HttpServletRequest`/`HttpServletResponse` |
| **内置各种 `doXxx()`** | `doGet`、`doPost`、`doPut`、`doDelete`、`doHead`、`doOptions`、`doTrace` |
| **默认返回 405** | 没重写的方法会返回「405 Method Not Allowed」 |

---

### 三、service() 方法的完整源码逻辑

`HttpServlet` 的 `service()` 方法会根据请求方法，自动调用对应的 `doXxx()`：

```java
// HttpServlet.service() 源码（简化版）
protected void service(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException {
    String method = req.getMethod();

    if ("GET".equals(method)) {
        // 处理 GET（含条件请求 If-Modified-Since 的 304 逻辑）
        doGet(req, resp);
    } else if ("HEAD".equals(method)) {
        doHead(req, resp);
    } else if ("POST".equals(method)) {
        doPost(req, resp);
    } else if ("PUT".equals(method)) {
        doPut(req, resp);
    } else if ("DELETE".equals(method)) {
        doDelete(req, resp);
    } else if ("OPTIONS".equals(method)) {
        doOptions(req, resp);
    } else if ("TRACE".equals(method)) {
        doTrace(req, resp);
    } else {
        // 不支持的方法，返回 501 Not Implemented
        resp.sendError(HttpServletResponse.SC_NOT_IMPLEMENTED);
    }
}
```

---

### 四、各种 doXxx() 方法

#### 默认实现

每个 `doXxx()` 方法都有默认实现——返回 **405 Method Not Allowed**：

```java
// GET 的默认实现
protected void doGet(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException {
    String msg = "GET method not supported";
    resp.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED, msg);
}

// POST 的默认实现
protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException {
    String msg = "POST method not supported";
    resp.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED, msg);
}

// PUT、DELETE 等方法的默认实现类似，都返回 405
```

> 💡 **提示：** 如果你只重写了 `doGet()`，用户发 POST 请求就会收到 **405**。这就是为什么「405 方法不允许」错误如此常见。

#### 各 doXxx() 方法一览

| 方法 | 请求类型 | 典型用途 |
| --- | --- | --- |
| `doGet()` | GET | 查询数据、页面展示 |
| `doPost()` | POST | 新增数据、表单提交 |
| `doPut()` | PUT | 更新数据（整体替换） |
| `doDelete()` | DELETE | 删除数据 |
| `doHead()` | HEAD | 返回响应头（无 Body），用于检查资源 |
| `doOptions()` | OPTIONS | 返回支持的方法（CORS 预检） |
| `doTrace()` | TRACE | 回显请求（调试用，一般禁用） |

---

### 五、条件请求处理（If-Modified-Since）

`doGet()` 内部还处理了 HTTP 的**条件请求**——如果资源未修改，返回 **304 Not Modified**（让浏览器用缓存）：

```java
// HttpServlet.doGet() 中的条件请求逻辑（简化）
protected long getLastModified(HttpServletRequest req) {
    return -1;  // 默认返回 -1，表示未知
}

// 子类可以重写 getLastModified() 来支持缓存
@Override
protected long getLastModified(HttpServletRequest req) {
    // 返回资源的最后修改时间（毫秒时间戳）
    return file.lastModified();
}
```

> 💡 **提示：** 重写 `getLastModified()` 可以让浏览器自动使用缓存，节省带宽。适用于静态资源或很少变化的数据。

---

### 六、实际开发中的 HttpServlet 用法

```java
@WebServlet("/user")
public class UserServlet extends HttpServlet {

    private UserService userService = new UserServiceImpl();

    // 初始化：加载资源（可选）
    @Override
    public void init() throws ServletException {
        // 如：初始化数据库连接池、读取配置
    }

    // 处理 GET 请求（查询、页面展示）
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("text/html;charset=UTF-8");

        String id = req.getParameter("id");
        if (id != null) {
            // 查询单个用户
            User user = userService.findById(Long.parseLong(id));
            req.setAttribute("user", user);
            req.getRequestDispatcher("/user/detail.jsp").forward(req, resp);
        } else {
            // 查询列表
            List<User> list = userService.findAll();
            req.setAttribute("userList", list);
            req.getRequestDispatcher("/user/list.jsp").forward(req, resp);
        }
    }

    // 处理 POST 请求（新增、修改、删除）
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        req.setCharacterEncoding("UTF-8");

        String action = req.getParameter("action");
        if ("save".equals(action)) {
            // 保存用户...
        } else if ("delete".equals(action)) {
            // 删除用户...
        }

        // 重定向（防重复提交）
        resp.sendRedirect(req.getContextPath() + "/user");
    }

    // 处理 PUT 请求（RESTful 风格）
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        // 更新用户...
    }

    // 处理 DELETE 请求（RESTful 风格）
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        Long id = Long.parseLong(req.getParameter("id"));
        userService.deleteById(id);
        resp.setStatus(HttpServletResponse.SC_NO_CONTENT);  // 204
    }

    // 销毁：释放资源（可选）
    @Override
    public void destroy() {
        // 如：关闭连接池
    }
}
```

---

### 七、继承关系总结

```
Servlet（接口）
│   定义生命周期：init() / service() / destroy()
│
└── GenericServlet（抽象类）
    │   实现了：init() / getServletConfig() / getInitParameter() / log() / destroy()
    │   未实现：service()（仍是抽象的）
    │   特点：协议无关
    │
    └── HttpServlet（抽象类）
         │   实现了：service()（按请求方法分发）
         │   提供了：doGet() / doPost() / doPut() / doDelete() / ...
         │   特点：HTTP 专用
         │
         └── YourServlet（你的类）
              │   重写：doGet() / doPost() 等
              │   可选重写：init() / destroy() / getLastModified()
```

#### 三层各自的职责

| 层级 | 职责 | 你需要做的 |
| --- | --- | --- |
| **Servlet 接口** | 定义生命周期契约 | 了解即可 |
| **GenericServlet** | 实现通用方法，协议无关 | 了解即可 |
| **HttpServlet** | HTTP 方法分发 | **继承它，重写 doXxx()** |

---

### 八、常见问题与注意事项

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| 405 方法不允许 | 没重写对应的 `doXxx()` | 重写 `doGet`/`doPost` 等 |
| 响应中文乱码 | 没设 Content-Type 编码 | `resp.setContentType("text/html;charset=UTF-8")` |
| 请求中文乱码（POST） | 没设请求编码 | `req.setCharacterEncoding("UTF-8")` 必须在 `getParameter` 之前 |
| 请求中文乱码（GET） | Tomcat 默认 ISO-8859-1 解码 URL | server.xml 加 `URIEncoding="UTF-8"` |
| 线程安全问题 | Servlet 成员变量被并发修改 | 用局部变量或 ThreadLocal |

> ⚠️ **注意：** 不要重写 `service()` 方法（除非你知道自己在做什么）。重写它会破坏 HttpServlet 的请求方法分发逻辑。

---

### 九、总结

- **HttpServlet** 是 Web 开发中使用最多的类，**继承它，重写 `doGet()`/`doPost()`**
- `service()` 方法按请求方法自动分发：GET → `doGet()`、POST → `doPost()`、PUT → `doPut()`、DELETE → `doDelete()`
- 没重写的 `doXxx()` 默认返回 **405 Method Not Allowed**
- 重写 `getLastModified()` 可以支持 HTTP 缓存（304）
- 继承关系：`Servlet` → `GenericServlet` → `HttpServlet` → 你的 Servlet
- 详见 [[Servlet]] 中的完整用法和配置方式
