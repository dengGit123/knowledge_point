### 一、概述

> 📖 [GenericServlet（Oracle）](https://docs.oracle.com/javaee/7/api/javax/servlet/GenericServlet.html)

**GenericServlet** 是 `Servlet` 接口的**抽象实现类**，它提供了大部分方法的默认实现，只把 `service()` 留给子类实现。它是**协议无关**的——不依赖 HTTP，可用于任何协议。

大白话：GenericServlet 是一个「半成品」——它帮你把 `init()`、`destroy()`、`getServletConfig()` 这些通用方法都写好了，你只需要实现核心的 `service()` 方法。

> 💡 **提示：** GenericServlet 在 Web 开发中用得不多（Web 开发直接用 [[HttpServlet]]），但它的设计思想（模板方法模式）值得学习。

| 你将学到 | 说明 |
| --- | --- |
| GenericServlet 源码 | 它实现了什么、没实现什么 |
| 与 Servlet 接口的关系 | 比直接实现接口方便在哪 |
| 协议无关的特性 | 为什么不依赖 HTTP |
| 继承 GenericServlet 的示例 | 了解即可 |

---

### 二、GenericServlet 源码解析

```java
package javax.servlet;

public abstract class GenericServlet implements Servlet, ServletConfig, Serializable {

    private transient ServletConfig config;

    // 构造器：无（GenericServlet 不需要构造参数）
    public GenericServlet() {}

    // init 的默认实现：保存 config 引用
    public void init(ServletConfig config) throws ServletException {
        this.config = config;
        this.init();  // 调用无参 init()
    }

    // 无参 init()：子类可以重写这个，不用处理 ServletConfig
    public void init() throws ServletException {}

    // service() 仍然是抽象的——必须由子类实现
    public abstract void service(ServletRequest req, ServletResponse res)
            throws ServletException, IOException;

    // 实现了 ServletConfig 的所有方法
    public ServletConfig getServletConfig() { return config; }
    public String getInitParameter(String name) { return config.getInitParameter(name); }
    public Enumeration<String> getInitParameterNames() { return config.getInitParameterNames(); }
    public ServletContext getServletContext() { return config.getServletContext(); }
    public String getServletName() { return config.getServletName(); }

    // 其他默认实现...
    public String getServletInfo() { return ""; }
    public void destroy() {}  // 空实现
    public void log(String msg) { ... }  // 日志方法
}
```

---

### 三、GenericServlet 做了什么

| 功能 | 说明 |
| --- | --- |
| **实现了 `init(ServletConfig)`** | 自动保存 config，并调用无参 `init()` |
| **实现了 `ServletConfig` 的所有方法** | `getInitParameter()`、`getServletContext()` 等直接可用 |
| **提供了日志方法** | `log(String msg)` 输出到 Servlet 日志 |
| **`service()` 仍是抽象的** | 必须由子类实现 |
| **协议无关** | 不依赖 HTTP，可用于任何协议 |

> 💡 **提示：** GenericServlet 同时实现了 `Servlet` 和 `ServletConfig` 两个接口。这意味着你可以直接调用 `getServletContext()`、`getInitParameter()` 而不用先获取 `ServletConfig` 对象。

---

### 四、与 Servlet 接口的对比

| 对比 | 直接实现 Servlet 接口 | 继承 GenericServlet |
| --- | --- | --- |
| `init(ServletConfig)` | 必须自己保存 config | **自动保存**，还可重写无参 `init()` |
| `getServletConfig()` | 必须自己实现 | **已实现** |
| `getInitParameter()` | 必须通过 config 间接调用 | **直接调用** |
| `getServletContext()` | 必须通过 config 间接调用 | **直接调用** |
| `log()` | 没有 | **提供** |
| `service()` | 必须实现 | 必须实现 |
| 协议 | 通用（需手动转型） | 通用（需手动转型） |

---

### 五、继承 GenericServlet（了解即可）

```java
// 继承 GenericServlet——比直接实现 Servlet 简单，但仍需自己实现 service()
public class MyGenericServlet extends GenericServlet {

    @Override
    public void init() throws ServletException {
        // 重写无参 init()，不用处理 ServletConfig
        System.out.println("初始化");
    }

    @Override
    public void service(ServletRequest req, ServletResponse res)
            throws ServletException, IOException {
        // 仍然需要手动转型和判断方法
        res.getWriter().write("Hello from GenericServlet");
    }

    @Override
    public void destroy() {
        System.out.println("销毁");
    }
}
```

---

### 六、协议无关的特性

GenericServlet **不引入任何 HTTP 相关的类**（如 `HttpServletRequest`），它的参数类型是通用的 `ServletRequest` 和 `ServletResponse`。这意味着：

- **优点**：可以用于非 HTTP 协议（如 FTP、自定义 TCP 协议）
- **缺点**：Web 开发中需要手动转型为 HTTP 类型，不方便

> 💡 **提示：** 如果你要做 Web 开发，直接用 [[HttpServlet]]，它已经帮你处理了 HTTP 协议的所有细节。GenericServlet 更适合写通用协议服务。

---

### 七、在继承体系中的位置

```
Servlet（接口）
│   定义生命周期：init() / service() / destroy()
│
└── GenericServlet（抽象类）     ← 本类
    │   实现了：init() / getServletConfig() / getInitParameter() / log() / destroy()
    │   未实现：service()（仍是抽象的）
    │   特点：协议无关
    │
    └── HttpServlet（抽象类）    ← HTTP 专用，Web 开发用这个
```

---

### 八、总结

- **GenericServlet** 是 `Servlet` 接口的协议无关实现
- 它帮你实现了 `init()`、`destroy()`、`getServletConfig()` 等通用方法
- `service()` 仍是抽象的，必须由子类实现
- **协议无关**：不依赖 HTTP，可用于任何协议
- Web 开发中直接用 [[HttpServlet]] 更方便，GenericServlet 了解即可
