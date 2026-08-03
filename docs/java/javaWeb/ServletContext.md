### 一、概述

> 📖 [ServletContext（Oracle）](https://docs.oracle.com/javaee/7/api/javax/servlet/ServletContext.html)

**ServletContext**（也叫 **application 对象**）代表**整个 Web 应用**。应用启动时创建，应用关闭时销毁，**整个应用只有一个**。它是 Servlet 之间、Servlet 和容器之间的桥梁。

大白话：ServletContext 是全村的「公告栏」——谁都能贴（`setAttribute`）、谁都能看（`getAttribute`），直到村子拆迁（应用关闭）才清空。

> 💡 **提示：** ServletContext 是整个应用的全局存储，和单个 Servlet 的私有配置 `ServletConfig` 不同。两者对比见本文末尾。

| 你将学到 | 说明 |
| --- | --- |
| ServletContext 的作用 | 8 大核心功能 |
| 获取 ServletContext 的方式 | 4 种方法 |
| 全局共享数据 | setAttribute / getAttribute |
| 读取全局配置参数 | context-param |
| 读取资源文件 | getRealPath / getResourceAsStream |
| 动态注册组件 | Servlet 3.0+ |
| ServletContextListener | 监听应用生命周期 |
| 与 ServletConfig 对比 | 作用域和用途的区别 |

---

### 二、ServletContext 的作用

| 作用 | 说明 |
| --- | --- |
| **全局共享数据** | `setAttribute()`/`getAttribute()`，所有用户、所有 Servlet 都能访问 |
| **读取全局配置参数** | `getInitParameter()` 读取 `<context-param>` |
| **获取资源路径** | `getRealPath()` 获取真实磁盘路径 |
| **读取资源文件** | `getResourceAsStream()` 获取 InputStream |
| **请求转发** | `getRequestDispatcher()` 获取 RequestDispatcher |
| **日志输出** | `log()` 写入 Servlet 日志 |
| **MIME 类型** | `getMimeType()` 根据文件名获取 MIME 类型 |
| **动态注册组件** | `addServlet()`/`addFilter()`（Servlet 3.0+） |

---

### 三、获取 ServletContext 的方式

```java
// 方式一：通过 GenericServlet 的 getServletContext()（最常用）
ServletContext context = getServletContext();

// 方式二：通过 ServletConfig
ServletContext context = getServletConfig().getServletContext();

// 方式三：通过 HttpSession
ServletContext context = request.getSession().getServletContext();

// 方式四：通过 ServletContextEvent（Listener 中）
ServletContext context = event.getServletContext();
```

---

### 四、全局共享数据

`ServletContext` 的数据是**所有用户共享**的，应用启动时创建，关闭时销毁。

```java
// Servlet A：设置数据
getServletContext().setAttribute("onlineCount", 100);
getServletContext().setAttribute("startTime", System.currentTimeMillis());

// Servlet B：读取数据（任何 Servlet 都能读到）
Integer count = (Integer) getServletContext().getAttribute("onlineCount");
Long startTime = (Long) getServletContext().getAttribute("startTime");
```

> ⚠️ **注意：**
> - 不要存**用户私有数据**（用 [[Cookie与Session|Session]]）
> - 不要存**大对象**（内存泄漏，应用关闭前一直在内存中）
> - 多线程并发操作时注意线程安全（用 `ConcurrentHashMap` 等线程安全容器）

---

### 五、读取全局配置参数（context-param）

```xml
<!-- web.xml：配置全局参数 -->
<web-app>
    <context-param>
        <param-name>appName</param-name>
        <param-value>我的网站</param-value>
    </context-param>
    <context-param>
        <param-name>version</param-name>
        <param-value>2.0</param-value>
    </context-param>
</web-app>
```

```java
// 读取全局参数
String appName = getServletContext().getInitParameter("appName");  // 我的网站
String version = getServletContext().getInitParameter("version");  // 2.0
```

---

### 六、读取资源文件

```java
// ① getRealPath()：获取真实磁盘路径（仅适用于解压部署）
String path = getServletContext().getRealPath("/WEB-INF/db.properties");
// 如：/Users/xxx/tomcat/webapps/myapp/WEB-INF/db.properties

// ② getResourceAsStream()：获取 InputStream（推荐，war 包也适用）
InputStream is = getServletContext().getResourceAsStream("/WEB-INF/db.properties");
Properties props = new Properties();
props.load(is);

// ③ getResource()：获取 URL（可判断资源是否存在）
URL url = getServletContext().getResource("/WEB-INF/db.properties");
```

> 💡 **提示：** 读取配置文件优先用 `getResourceAsStream()`，因为它在 **war 包部署**时也有效，而 `getRealPath()` 在 war 包部署时返回 null。

---

### 七、动态注册 Servlet（Servlet 3.0+）

```java
@WebListener
public class DynamicServletLoader implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext context = sce.getServletContext();

        // 动态注册一个 Servlet
        ServletRegistration.Dynamic registration =
            context.addServlet("dynamicServlet", new DynamicServlet());

        // 配置 URL 映射
        registration.addMapping("/dynamic");
        registration.setLoadOnStartup(1);

        // 动态注册 Filter
        FilterRegistration.Dynamic filterReg =
            context.addFilter("dynamicFilter", new DynamicFilter());
        filterReg.addMappingForUrlPatterns(null, false, "/*");
    }
}
```

---

### 八、ServletContextListener — 监听应用生命周期

`ServletContextListener` 用于在**应用启动和关闭**时执行回调，是最常用的监听器：

```java
@WebListener
public class AppInitListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // 应用启动时执行（所有 Servlet 初始化之前）
        ServletContext context = sce.getServletContext();

        // 读取全局配置
        String appName = context.getInitParameter("appName");

        // 初始化全局数据
        context.setAttribute("appName", appName);
        context.setAttribute("startTime", System.currentTimeMillis());
        context.setAttribute("onlineCount", 0);

        // 初始化数据库连接池等全局资源
        System.out.println("应用启动：" + appName);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // 应用关闭时执行（所有 Servlet 销毁之后）
        System.out.println("应用关闭");

        // 释放全局资源：关闭连接池、保存数据等
    }
}
```

> 💡 **提示：** 更多监听器用法见 [[过滤器与监听器]]。

---

### 九、ServletContext 与 ServletConfig 对比

| 对比 | ServletConfig | ServletContext |
| --- | --- | --- |
| **作用域** | 单个 Servlet | 整个应用 |
| **数量** | 每个 Servlet 一个 | 整个应用一个 |
| **配置来源** | `<servlet>` 下的 `<init-param>` | `<context-param>` |
| **获取方式** | `getServletConfig()` | `getServletContext()` |
| **典型用途** | 读取该 Servlet 的私有配置 | 全局共享数据、读取公共配置 |

```java
// ServletConfig：读取单个 Servlet 的私有配置
String myParam = getServletConfig().getInitParameter("myParam");

// ServletContext：读取全局配置
String globalParam = getServletContext().getInitParameter("globalParam");
```

---

### 十、三个域对象对比

JavaWeb 有三个域对象，用于在不同范围共享数据：

| 域对象 | 作用范围 | 生命周期 | 典型用途 |
| --- | --- | --- | --- |
| **Request 域** | 一次请求（含转发） | 请求开始到结束 | Servlet → JSP 传数据 |
| **Session 域** | 一个用户的所有请求 | 创建到超时/销毁 | 登录状态、购物车 |
| **ServletContext 域** | 所有用户、所有请求 | 应用启动到关闭 | 全局配置、在线人数 |

```java
// Request 域（一次请求内有效）
req.setAttribute("msg", "操作成功");

// Session 域（同一用户多次请求有效）
req.getSession().setAttribute("loginUser", user);

// ServletContext 域（所有用户共享）
getServletContext().setAttribute("onlineCount", 100);
```

---

### 十一、实际应用场景

#### 场景 1：应用启动时加载配置

```java
@WebListener
public class ConfigLoader implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext ctx = sce.getServletContext();

        // 读取数据库配置
        String dbUrl = ctx.getInitParameter("dbUrl");
        String dbUser = ctx.getInitParameter("dbUser");
        String dbPassword = ctx.getInitParameter("dbPassword");

        // 初始化连接池，存入全局
        DataSource ds = createDataSource(dbUrl, dbUser, dbPassword);
        ctx.setAttribute("dataSource", ds);
    }
}
```

#### 场景 2：统计在线人数

```java
@WebListener
public class OnlineCountListener implements HttpSessionListener {
    @Override
    public void sessionCreated(HttpSessionEvent se) {
        ServletContext ctx = se.getSession().getServletContext();
        Integer count = (Integer) ctx.getAttribute("onlineCount");
        ctx.setAttribute("onlineCount", count == null ? 1 : count + 1);
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        ServletContext ctx = se.getSession().getServletContext();
        Integer count = (Integer) ctx.getAttribute("onlineCount");
        if (count != null && count > 0) {
            ctx.setAttribute("onlineCount", count - 1);
        }
    }
}
```

#### 场景 3：读取项目资源文件

```java
@WebServlet("/init")
public class InitServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 读取 /WEB-INF/config.properties
        InputStream is = getServletContext().getResourceAsStream("/WEB-INF/config.properties");
        Properties props = new Properties();
        props.load(is);

        String appName = props.getProperty("appName");
        resp.getWriter().write("应用名：" + appName);
    }
}
```

---

### 十二、常见问题与注意事项

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| 全局数据被意外修改 | 多线程并发写入 | 用线程安全容器（`ConcurrentHashMap`） |
| 内存泄漏 | 大对象存 ServletContext 后不清理 | 及时 `removeAttribute()`，不要存大对象 |
| `getRealPath()` 返回 null | war 包部署时没有解压 | 用 `getResourceAsStream()` 替代 |
| 全局参数读不到 | 配置在 `<init-param>` 而非 `<context-param>` | 全局参数用 `<context-param>` |

> ⚠️ **注意：** ServletContext 的数据在应用关闭前一直存在，**不要存用户私有数据**（用 Session），**不要存大对象**（内存泄漏）。

---

### 十三、总结

- **ServletContext** 代表整个应用，应用启动时创建，关闭时销毁
- 用于：全局共享数据、读取全局配置、获取资源文件、动态注册组件
- 获取方式：`getServletContext()`（最常用）
- 读取资源优先用 `getResourceAsStream()`（war 包也有效）
- `ServletContextListener` 监听应用启动/关闭，用于初始化全局资源
- 与 `ServletConfig` 的区别：Config 是单 Servlet 私有，Context 是全局共享
- 三个域：**Request（一次请求）< Session（一个用户）< Context（所有用户）**
