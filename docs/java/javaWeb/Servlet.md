### 一、概述

> 📖 [Java Servlet 规范（Oracle）](https://javaee.github.io/servlet-spec/) ｜ [Servlet 4.0 API](https://docs.oracle.com/javaee/7/api/javax/servlet/package-summary.html)

**Servlet（Server Applet）** 是运行在服务端、用来处理 HTTP 请求并返回响应的 Java 类。它是整个 JavaWeb 的核心——所有请求最终都进入 Servlet，由它调用业务逻辑、访问数据库、生成响应。

大白话：Servlet 就是 JavaWeb 的「大脑」。浏览器发来请求，Tomcat 把请求交给 Servlet，Servlet 处理后把结果交回 Tomcat，Tomcat 再返回给浏览器。

> 💡 **提示：** Spring MVC 的 `DispatcherServlet` 本质上就是一个特殊的 Servlet，它是所有请求的统一入口。学懂 Servlet，才能理解框架。

| 你将学到 | 说明 |
| --- | --- |
| Servlet 生命周期 | init → service → destroy |
| Servlet API 核心结构 | 接口与类的继承体系 |
| Servlet / GenericServlet / HttpServlet | 三个核心组件的详解 |
| ServletContext | 整个应用的上下文 |
| 配置方式 | 注解 vs web.xml |
| 请求处理流程 | 请求怎么到达 Servlet |
| ServletConfig / ServletContext | 配置对象和上下文对象 |
| 线程安全问题 | Servlet 为什么不是线程安全的 |

---

### 二、Servlet 生命周期

Servlet 的生命周期由 **Tomcat 容器**管理，程序员不用 `new`，容器负责创建、调用、销毁。

```
容器启动或首次请求
        ↓
   ① 创建 Servlet 实例（调用构造器）
        ↓
   ② init() 初始化（只执行一次）
        ↓
   ③ service() 处理请求（每次请求都执行）
        ↓    ↖
        ↓      └─ 每次请求循环调用 service()
        ↓
   ④ destroy() 销毁（容器关闭时执行一次）
```

#### 生命周期各阶段详解

| 阶段 | 方法 | 执行时机 | 执行次数 | 用途 |
| --- | --- | --- | --- | --- |
| **实例化** | 构造器 | 容器启动或首次请求 | 1 次 | 创建对象 |
| **初始化** | `init()` | 实例化后 | 1 次 | 加载配置、连接池等资源 |
| **服务** | `service()` | 每次请求 | N 次 | 处理请求的核心方法 |
| **销毁** | `destroy()` | 容器关闭 | 1 次 | 释放资源（关闭连接、保存数据） |

> 💡 **提示：** 默认情况下，Servlet 在**第一次被请求时才创建**（懒加载）。如果想容器启动就创建，设置 `@WebServlet(loadOnStartup = 1)`。

#### 代码示例：观察生命周期

```java
@WebServlet(value = "/life", loadOnStartup = 1)
public class LifeCycleServlet extends HttpServlet {

    public LifeCycleServlet() {
        System.out.println("① 构造器：创建实例");
    }

    @Override
    public void init() throws ServletException {
        System.out.println("② init：初始化");
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        System.out.println("③ service：处理请求");
        resp.getWriter().write("Hello");
    }

    @Override
    public void destroy() {
        System.out.println("④ destroy：销毁");
    }
}

// 控制台输出（容器启动时）：
// ① 构造器：创建实例
// ② init：初始化

// 每次请求时：
// ③ service：处理请求

// 容器关闭时：
// ④ destroy：销毁
```

---

### 三、Servlet API 核心结构

JavaWeb 的 Servlet API 核心类和接口：

```
javax.servlet
├── Servlet（接口）           ← 所有 Servlet 必须实现
├── GenericServlet（抽象类）  ← 通用实现，协议无关
└── HttpServlet（抽象类）     ← HTTP 专用，最常用 ★

javax.servlet.http
├── HttpServletRequest       ← 封装请求信息
├── HttpServletResponse      ← 封装响应信息
├── HttpSession              ← 会话对象
└── Cookie                   ← Cookie 对象

javax.servlet
├── ServletConfig            ← 单个 Servlet 的配置
└── ServletContext           ← 整个 Web 应用的上下文
```

#### 三个核心方法（Servlet 接口）

```java
public interface Servlet {
    void init(ServletConfig config) throws ServletException;  // 初始化
    void service(ServletRequest req, ServletResponse res);    // 处理请求
    void destroy();                                           // 销毁
}
```

#### HttpServlet 的处理分发

`HttpServlet` 的 `service()` 方法会根据请求方法，自动调用对应的 `doXxx()`：

```java
// HttpServlet.service() 源码逻辑（简化）
protected void service(HttpServletRequest req, HttpServletResponse resp) {
    String method = req.getMethod();
    if ("GET".equals(method)) {
        doGet(req, resp);
    } else if ("POST".equals(method)) {
        doPost(req, resp);
    } else if ("PUT".equals(method)) {
        doPut(req, resp);
    } else if ("DELETE".equals(method)) {
        doDelete(req, resp);
    }
    // ...
}
```

> 💡 **提示：** 实际开发中，我们**继承 `HttpServlet`，重写 `doGet()`/`doPost()`**，而不是直接实现 `Servlet` 接口。

---

### 四、Servlet 核心接口与类概览

Servlet API 中有四个核心组件，它们各自有单独的文档详细讲解：

| 组件 | 类型 | 作用 | 详见 |
| --- | --- | --- | --- |
| **Servlet** | 接口 | 定义生命周期方法：`init()` / `service()` / `destroy()` | [[Servlet接口]] |
| **GenericServlet** | 抽象类 | 协议无关的通用实现，实现了 `init()`/`destroy()` 等 | [[GenericServlet]] |
| **HttpServlet** | 抽象类 | HTTP 专用，`service()` 按请求方法分发到 `doXxx()` | [[HttpServlet]] |
| **ServletContext** | 接口 | 整个应用的上下文，全局共享数据、读取配置、获取资源 | [[ServletContext]] |

#### 继承关系

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
         └── 你的 Servlet
              │   重写：doGet() / doPost() 等
              │   可选重写：init() / destroy() / getLastModified()
```

> 💡 **提示：** 实际开发中**继承 `HttpServlet`，重写 `doGet()`/`doPost()`**，其他三个了解即可。

---

### 五、编写一个 Servlet

#### 方式一：注解配置（推荐，Servlet 3.0+）

```java
@WebServlet(
    name = "helloServlet",
    urlPatterns = {"/hello", "/hi"},  // 可配置多个 URL
    loadOnStartup = 1                  // 容器启动就加载
)
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 设置响应类型和编码
        resp.setContentType("text/html;charset=UTF-8");

        // 获取请求参数
        String name = req.getParameter("name");
        if (name == null) name = "World";

        // 向响应中写入 HTML
        resp.getWriter().write("<h1>Hello, " + name + "!</h1>");
    }
}
```

访问 `http://localhost:8080/项目名/hello?name=张三` 即可看到页面。

#### 方式二：web.xml 配置（传统方式）

```xml
<!-- web.xml -->
<web-app>
    <servlet>
        <servlet-name>helloServlet</servlet-name>
        <servlet-class>com.example.HelloServlet</servlet-class>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>helloServlet</servlet-name>
        <url-pattern>/hello</url-pattern>
        <url-pattern>/hi</url-pattern>
    </servlet-mapping>
</web-app>
```

> 💡 **提示：** 注解和 web.xml **不要同时配置**，否则会创建两个实例。现代项目优先用注解。

#### @WebServlet 常用属性

| 属性 | 类型 | 说明 | 示例 |
| --- | --- | --- | --- |
| `value` / `urlPatterns` | `String[]` | URL 映射路径 | `"/login"` |
| `name` | `String` | Servlet 名称 | `"loginServlet"` |
| `loadOnStartup` | `int` | 启动加载顺序（负数=懒加载） | `1` |
| `initParams` | `WebInitParam[]` | 初始化参数 | `@WebInitParam(name="encoding", value="UTF-8")` |

---

### 六、URL 路径匹配规则

`urlPatterns` 支持四种匹配方式：

| 匹配方式 | 示例 | 说明 | 优先级 |
| --- | --- | --- | --- |
| **精确匹配** | `/login` | 完全一致才匹配 | 最高 |
| **目录匹配** | `/admin/*` | 以 `/admin/` 开头都匹配 | 中 |
| **扩展名匹配** | `*.do` | 以 `.do` 结尾都匹配 | 低 |
| **默认匹配** | `/` | 兜底，匹配所有未匹配的请求 | 最低 |

```java
// 精确匹配
@WebServlet("/user/login")     // 只匹配 /user/login

// 目录匹配
@WebServlet("/user/*")         // 匹配 /user/login、/user/list、/user/123 等

// 扩展名匹配
@WebServlet("*.do")            // 匹配 /login.do、/user/list.do 等

// 默认匹配（处理静态资源等，Tomcat 自带一个 DefaultServlet）
@WebServlet("/")
```

> ⚠️ **注意：** `/` 和 `/*` 是不同的：
> - `/` 是默认 Servlet（兜底），处理未匹配的请求，**不会**拦截 JSP
> - `/*` 匹配**所有**请求（包括 JSP、静态资源），会覆盖 Tomcat 自带的 DefaultServlet

---

### 七、ServletConfig 与 ServletContext

#### 1. ServletConfig — 单个 Servlet 的配置

每个 Servlet 有自己的 `ServletConfig`，用于读取该 Servlet 的初始化参数。

```java
@WebServlet(
    value = "/config",
    initParams = {
        @WebInitParam(name = "encoding", value = "UTF-8"),
        @WebInitParam(name = "version", value = "1.0")
    }
)
public class ConfigServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 通过 getInitParameter 读取初始化参数
        String encoding = getInitParameter("encoding");  // UTF-8
        String version = getInitParameter("version");    // 1.0

        // 也可以直接获取 ServletConfig 对象
        ServletConfig config = getServletConfig();
        System.out.println(config.getServletName());     // config

        resp.getWriter().write("encoding=" + encoding);
    }
}
```

#### 2. ServletContext — 整个应用的上下文

**整个 Web 应用只有一个 `ServletContext`**，用于：
- 读取全局初始化参数
- 共享数据（所有用户、所有 Servlet 都能访问）
- 获取资源文件路径

> 💡 **提示：** `ServletContext` 的详细用法（获取方式、动态注册、Listener、资源读取等）见 [[ServletContext]]。

```java
// 读取全局参数（配置在 web.xml 的 <context-param>）
String appName = getServletContext().getInitParameter("appName");

// 共享数据（setAttribute 设置，其他 Servlet 通过 getAttribute 读取）
getServletContext().setAttribute("visitCount", 100);

// 获取资源的真实磁盘路径
String realPath = getServletContext().getRealPath("/WEB-INF/config.xml");

// 获取资源的 InputStream（推荐，war 包也适用）
InputStream is = getServletContext().getResourceAsStream("/WEB-INF/config.xml");
```

#### ServletConfig vs ServletContext

| 对比 | ServletConfig | ServletContext |
| --- | --- | --- |
| 作用域 | **单个 Servlet** | **整个应用**（所有 Servlet 共享） |
| 数量 | 每个 Servlet 一个 | 整个应用一个 |
| 用途 | 读取该 Servlet 的私有配置 | 读取全局配置、共享数据、获取资源 |
| 获取方式 | `getServletConfig()` | `getServletContext()` |

---

### 八、Servlet 的线程安全问题

#### 为什么不是线程安全的

**一个 Servlet 实例只有一个**，多个请求是**多线程并发调用同一个实例的 `service()` 方法**。如果 Servlet 中有**实例变量**（成员变量），就会出现线程安全问题。

```java
@WebServlet("/unsafe")
public class UnsafeServlet extends HttpServlet {

    private int count = 0;  // ❌ 多线程共享的成员变量

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        count++;  // ❌ 并发下 count 不准确
        resp.getWriter().write("count=" + count);
    }
}
```

#### 解决方案

```java
// ✅ 方案一：不用成员变量，用局部变量
@WebServlet("/safe1")
public class SafeServlet1 extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int count = 0;  // 局部变量，每个线程独立
        count++;
        resp.getWriter().write("count=" + count);
    }
}

// ✅ 方案二：用 ThreadLocal（线程隔离）
@WebServlet("/safe2")
public class SafeServlet2 extends HttpServlet {
    private ThreadLocal<Integer> count = new ThreadLocal<>();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        count.set(count.get() == null ? 1 : count.get() + 1);
        resp.getWriter().write("count=" + count.get());
    }
}

// ✅ 方案三：加锁 synchronized（性能差，不推荐）
@WebServlet("/safe3")
public class SafeServlet3 extends HttpServlet {
    private int count = 0;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        synchronized (this) {
            count++;
        }
        resp.getWriter().write("count=" + count);
    }
}
```

> ⚠️ **注意：** 实际开发中**不要在 Servlet 里放业务状态**。业务逻辑交给 Service 层，Servlet 只做请求转发和响应。

---

### 九、Servlet 3.0+ 新特性

Servlet 3.0（Java EE 6，Tomcat 7+）引入了很多便利特性：

| 特性 | 说明 |
| --- | --- |
| **注解配置** | `@WebServlet`、`@WebFilter`、`@WebListener`，告别 web.xml |
| **异步处理** | `AsyncContext`，请求可以异步处理，释放线程 |
| **文件上传** | `@MultipartConfig` + `request.getPart()`，无需第三方库 |
| **动态注册** | `ServletContext.addServlet()` 动态添加 Servlet |
| **可插拔性** | web-fragment.xml，模块化配置 |

#### 异步处理示例

```java
@WebServlet(value = "/async", asyncSupported = true)
public class AsyncServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 开启异步上下文（释放请求线程，让业务在另一个线程执行）
        AsyncContext asyncCtx = req.startAsync();

        // 模拟耗时操作（如调用外部 API、复杂计算）
        new Thread(() -> {
            try {
                Thread.sleep(5000);  // 模拟 5 秒耗时
                asyncCtx.getResponse().getWriter().write("异步处理完成");
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                asyncCtx.complete();  // 标记异步完成
            }
        }).start();
    }
}
```

> 💡 **提示：** 异步处理适用于**长耗时请求**（如导出大文件、调用外部服务），避免请求线程被长时间占用。

---

### 十、实际应用场景

#### 场景 1：用户登录

```java
@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    // 业务逻辑交给 Service 层（依赖注入或手动创建）
    private UserService userService = new UserServiceImpl();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException, ServletException {
        // ① 获取请求参数
        String username = req.getParameter("username");
        String password = req.getParameter("password");

        // ② 调用业务层
        User user = userService.login(username, password);

        // ③ 根据结果响应
        if (user != null) {
            // 登录成功：创建 Session，存入用户信息
            HttpSession session = req.getSession();
            session.setAttribute("loginUser", user);
            // 重定向到首页
            resp.sendRedirect(req.getContextPath() + "/home");
        } else {
            // 登录失败：转发回登录页，带错误信息
            req.setAttribute("errorMsg", "用户名或密码错误");
            req.getRequestDispatcher("/login.jsp").forward(req, resp);
        }
    }
}
```

#### 场景 2：RESTful 风格的 CRUD

```java
@WebServlet("/api/users/*")
public class UserApiServlet extends HttpServlet {
    private UserService userService = new UserServiceImpl();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();  // /123 或 null
        resp.setContentType("application/json;charset=UTF-8");

        if (pathInfo == null || "/".equals(pathInfo)) {
            // GET /api/users → 查询列表
            List<User> list = userService.findAll();
            resp.getWriter().write(new Gson().toJson(list));
        } else {
            // GET /api/users/123 → 查询单个
            Long id = Long.parseLong(pathInfo.substring(1));
            User user = userService.findById(id);
            resp.getWriter().write(new Gson().toJson(user));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // POST /api/users → 新增
        // 解析 JSON 请求体...
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) {
        // DELETE /api/users/123 → 删除
    }
}
```

---

### 十一、常见问题与注意事项

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| 404 找不到资源 | URL 路径不匹配 | 检查 `@WebServlet` 路径、项目上下文路径 |
| 405 方法不允许 | 没重写对应的 `doXxx()` | 重写 `doGet`/`doPost`/`doPut`/`doDelete` |
| 500 空指针异常 | 未初始化 Service 对象 | 检查依赖注入、`init()` 方法 |
| 中文乱码（GET） | Tomcat 默认 ISO-8859-1 解码 URL | server.xml 加 `URIEncoding="UTF-8"` |
| 中文乱码（POST） | 请求体编码未设置 | `request.setCharacterEncoding("UTF-8")` 必须在 `getParameter` 之前调用 |
| 线程安全问题 | Servlet 成员变量被并发修改 | 用局部变量或 ThreadLocal |

> ⚠️ **注意：** `request.setCharacterEncoding("UTF-8")` **只对请求体生效**（POST 有效），对 URL 参数（GET）无效。且必须在**第一次调用 `getParameter()` 之前**调用才有效。

---

### 十二、总结

- **Servlet 接口**定义了生命周期三方法：`init()` / `service()` / `destroy()`
- **GenericServlet** 实现了协议无关的通用方法，`service()` 仍是抽象的
- **HttpServlet** 是 HTTP 专用，`service()` 按请求方法分发到 `doGet()`/`doPost()` 等
- **ServletContext** 代表整个应用，用于全局共享数据、读取配置、获取资源
- 继承关系：`Servlet` → `GenericServlet` → `HttpServlet` → 你的 Servlet
- 开发时**继承 `HttpServlet`，重写 `doGet()`/`doPost()`**
- 配置用 `@WebServlet` 注解（Servlet 3.0+），不再需要 web.xml
- **Servlet 不是线程安全的**，不要使用成员变量存储请求状态
- 现代框架（Spring MVC）基于 Servlet 构建，学懂它是理解框架的前提
