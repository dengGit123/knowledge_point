### 一、概述

> 📖 [Servlet 接口（Oracle）](https://docs.oracle.com/javaee/7/api/javax/servlet/Servlet.html)

**Servlet 接口**是所有 Servlet 的**根**，它定义了 Servlet 的生命周期方法。容器（Tomcat）就是通过这三个方法来管理 Servlet 的：**初始化 → 服务 → 销毁**。

大白话：Servlet 接口就是 Servlet 的「合同」——你答应我实现 `init()`、`service()`、`destroy()`，我（容器）就按这个顺序调用你。

> 💡 **提示：** 直接实现 `Servlet` 接口非常繁琐，实际开发中没人这么写。本文目的是帮你理解 Servlet 的本质，具体开发请用 [[HttpServlet]]。

| 你将学到 | 说明 |
| --- | --- |
| Servlet 接口源码 | 5 个方法的作用 |
| 生命周期方法 | init / service / destroy |
| ServletRequest / ServletResponse | 通用请求响应对象 |
| 直接实现接口的示例 | 为什么没人这么写 |

---

### 二、Servlet 接口源码

```java
package javax.servlet;

public interface Servlet {

    // 初始化：Servlet 创建后容器调用一次，传入配置信息
    void init(ServletConfig config) throws ServletException;

    // 获取 ServletConfig 对象（包含初始化参数和 ServletContext）
    ServletConfig getServletConfig();

    // 服务：每次请求都调用，核心处理方法
    void service(ServletRequest req, ServletResponse res)
            throws ServletException, IOException;

    // 获取 Servlet 信息（作者、版本等，一般返回空字符串）
    String getServletInfo();

    // 销毁：容器关闭时调用一次，用于释放资源
    void destroy();
}
```

---

### 三、各方法详解

| 方法 | 执行次数 | 作用 | 程序员常用？ |
| --- | --- | --- | --- |
| `init(ServletConfig)` | 1 次 | 初始化，容器传入配置 | 偶尔重写（如加载资源） |
| `getServletConfig()` | N 次 | 获取配置对象 | 很少直接调用 |
| `service(ServletRequest, ServletResponse)` | 每次请求 | 处理请求的核心方法 | **直接实现接口时必须重写** |
| `getServletInfo()` | N 次 | 返回描述信息 | 几乎不用 |
| `destroy()` | 1 次 | 销毁前清理资源 | 偶尔重写（如关闭连接池） |

---

### 四、ServletRequest 与 ServletResponse

`service()` 方法接收的参数类型是 `ServletRequest` 和 `ServletResponse`，它们是**协议无关的通用对象**：

- `ServletRequest`：封装客户端的请求信息（参数、属性、输入流）
- `ServletResponse`：封装服务端的响应信息（输出流、编码、头部）

在 HTTP 场景下，容器实际传入的是它们的子类型 `HttpServletRequest` 和 `HttpServletResponse`（详见 [[Request与Response]]）。

---

### 五、直接实现 Servlet 接口（了解即可）

```java
// 直接实现 Servlet 接口——最原始的方式，实际开发不这么写
public class RawServlet implements Servlet {

    private ServletConfig config;

    @Override
    public void init(ServletConfig config) throws ServletException {
        this.config = config;
        System.out.println("初始化");
    }

    @Override
    public void service(ServletRequest req, ServletResponse res)
            throws ServletException, IOException {
        // 需要手动转型为 HTTP 类型
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        // 需要手动判断请求方法
        String method = request.getMethod();
        if ("GET".equals(method)) {
            // 处理 GET...
        } else if ("POST".equals(method)) {
            // 处理 POST...
        }
    }

    @Override
    public ServletConfig getServletConfig() {
        return config;
    }

    @Override
    public String getServletInfo() {
        return "RawServlet v1.0";
    }

    @Override
    public void destroy() {
        System.out.println("销毁");
    }
}
```

> ⚠️ **注意：** 直接实现 `Servlet` 接口非常繁琐——要手动转型为 HTTP 类型、手动判断请求方法。实际开发中**没人这么写**，都是继承 [[GenericServlet]] 或 [[HttpServlet]]。

---

### 六、Servlet 接口在继承体系中的位置

```
Servlet（接口）                      ← 定义生命周期三方法
│
└── GenericServlet（抽象类）          ← 实现了协议无关的通用方法
    │
    └── HttpServlet（抽象类）         ← HTTP 专用，按请求方法分发
        │
        └── 你的 Servlet             ← 重写 doGet() / doPost()
```

> 💡 **提示：** 完整的继承体系详解见 [[HttpServlet]] 中的「继承关系总结」部分。

---

### 七、总结

- **Servlet 接口**定义了 5 个方法，核心是 `init()` / `service()` / `destroy()`
- `service()` 接收**协议无关**的 `ServletRequest` / `ServletResponse`
- 直接实现接口很繁琐，了解即可
- 实际开发用 [[HttpServlet]]，它已经帮你处理了 HTTP 协议的所有细节
