### 一、概述

> 📖 [Java EE 教程（Oracle）](https://docs.oracle.com/javaee/7/tutorial/) ｜ [Apache Tomcat 官方文档](https://tomcat.apache.org/tomcat-9.0-doc/)

**JavaWeb** 就是用 Java 技术来做「网站/网页应用」那一套——浏览器发请求，服务端用 Java 处理，再把结果返回给浏览器。它本质上是 Java 在 **B/S 架构**（浏览器/服务端）下的应用。

大白话：你在浏览器输入一个网址，按回车，服务端收到请求后查数据库、算业务，生成一个页面返回给你——这一整套后端技术就是 JavaWeb。

JavaWeb 是整个 Java 后端开发的基石，**Servlet → Spring MVC → Spring Boot** 这条线的根就在这里。学懂 JavaWeb，才能理解框架帮你做了什么。

| 你将学到 | 说明 |
| --- | --- |
| B/S 架构与前后端交互 | 理解浏览器和服务端怎么「对话」 |
| HTTP 协议基础 | 请求和响应的结构 |
| Tomcat 服务器 | 运行 JavaWeb 项目的容器 |
| Servlet / JSP | JavaWeb 的两大核心组件 |
| 会话跟踪 Cookie/Session | 让「无状态」的 HTTP 记住用户 |
| 过滤器 / 监听器 | 请求处理的拦截与监听 |
| MVC 分层 | 经典代码组织方式 |

---

### 二、B/S 架构与前后端交互流程

#### 1. 什么是 B/S 架构

**B/S（Browser/Server）** 就是「浏览器作为客户端」的架构。用户只需要一个浏览器，不用安装额外软件。

```
[浏览器] ◄════ HTTP/HTTPS ════► [Web 服务端（Java）] ════► [数据库]
   ▲                                    │
   └──────────── HTML/CSS/JS ───────────┘
```

> 💡 **提示：** B/S 是 [[网络编程基础|C/S 与 B/S]] 中的 B/S 分支，JavaWeb 就是 Java 在 B/S 架构下的实现。

#### 2. 一次完整的请求流程

用户在浏览器输入 `http://localhost:8080/login` 到看到页面，中间发生了什么：

```
① 浏览器解析 URL，向服务端 8080 端口发起 HTTP 请求
        ↓
② 服务端（Tomcat）接收到请求，找到对应的 Servlet 处理
        ↓
③ Servlet 调用 Service 层处理业务，必要时查数据库
        ↓
④ 服务端把结果封装成 HTTP 响应（HTML/JSON），返回给浏览器
        ↓
⑤ 浏览器解析响应，渲染页面展示给用户
```

用代码视角看，核心就一句话：**JavaWeb 程序的工作就是「接收 HTTP 请求 → 处理业务 → 返回 HTTP 响应」**。

```java
// 一个最简 Servlet：接收请求，返回响应
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // ① 拿到请求参数（浏览器发来的数据）
        String name = req.getParameter("name");

        // ② 处理业务（这里简化为拼接字符串）
        String result = "Hello, " + (name != null ? name : "World");

        // ③ 把结果写回响应（浏览器收到的数据）
        resp.setContentType("text/html;charset=UTF-8");
        resp.getWriter().write("<h1>" + result + "</h1>");
    }
}
```

---

### 三、Tomcat 服务器

#### 1. 为什么需要 Tomcat

JavaWeb 程序不能像普通 `main` 方法那样直接运行——它需要一个 **Web 容器** 来管理请求分发、线程、生命周期等。**Tomcat** 就是最常用的免费 Web 容器（也叫 Servlet 容器）。

> 💡 **提示：** 你可以把 Tomcat 想象成一个「大管家」——它监听端口、接收请求、调用你写的 Servlet、把结果返回。

#### 2. Tomcat 目录结构

```
tomcat/
├── bin/            # 启动/关闭脚本（startup.sh / shutdown.sh）
├── conf/           # 配置文件（server.xml、web.xml）
├── lib/            # Tomcat 自带的 jar 包
├── logs/           # 日志文件
├── temp/           # 临时文件
├── webapps/        # ★ 你的项目放这里，部署的根目录
└── work/           # JSP 编译后的 Servlet 源码
```

#### 3. 项目的标准目录结构

一个 JavaWeb 项目的标准结构（Maven 项目）：

```
my-webapp/
├── src/
│   └── main/
│       ├── java/                    # Java 源码（Servlet、Service、DAO）
│       │   └── com/example/
│       │       ├── servlet/         # 控制层
│       │       ├── service/         # 业务层
│       │       └── dao/             # 数据层
│       ├── resources/               # 配置文件（.properties、.xml）
│       └── webapp/                  # ★ Web 资源根目录
│           ├── WEB-INF/             # 受保护目录，浏览器不能直接访问
│           │   ├── web.xml          # Web 项目配置（可省略，用注解替代）
│           │   └── classes/         # 编译后的 .class 文件
│           ├── css/
│           ├── js/
│           └── index.html           # 首页
└── pom.xml
```

> ⚠️ **注意：** `WEB-INF` 目录下的资源**不能通过浏览器直接访问**（如 `http://xxx/WEB-INF/web.xml` 会 404）。需要把公共资源放在 `webapp` 根目录下。

#### 4. 启动与部署

**方式一：IDEA 集成 Tomcat（开发用）**

1. Run → Edit Configurations → 添加 Tomcat Server (Local)
2. Deployment 标签 → 添加 Artifact（war 包）
3. 设置 Application context（访问路径前缀）
4. 启动，浏览器访问 `http://localhost:8080/你的项目名`

**方式二：打 war 包部署到独立 Tomcat（生产用）**

```bash
# Maven 打包
mvn clean package

# 把 target/xxx.war 复制到 tomcat/webapps/
cp target/my-webapp.war /path/to/tomcat/webapps/

# 启动 Tomcat（会自动解压 war 包）
./startup.sh
```

---

### 四、JavaWeb 核心技术体系

JavaWeb 的技术栈按学习顺序排列：

```
┌─────────────────────────────────────────────────────┐
│                  JavaWeb 知识体系                      │
├─────────────────────────────────────────────────────┤
│  基础: HTTP协议 → Tomcat → Servlet → JSP            │
│                                                     │
│  会话: Cookie / Session                              │
│                                                     │
│  进阶: Filter（过滤器）/ Listener（监听器）            │
│                                                     │
│  数据: JDBC → 数据库连接池                             │
│                                                     │
│  架构: MVC 分层（Servlet + JSP + JavaBean）          │
└─────────────────────────────────────────────────────┘
```

| 技术 | 作用 | 一句话解释 |
| --- | --- | --- |
| **Servlet** | 处理请求和响应 | JavaWeb 的「大脑」，所有请求都经过它 |
| **JSP** | 动态生成 HTML | 在 HTML 里写 Java 代码（已过时，了解即可） |
| **Filter** | 拦截请求/响应 | 请求进来和出去都要过它这一关 |
| **Listener** | 监听事件 | 监听「上下文创建、Session 创建」等事件 |
| **Cookie** | 客户端会话跟踪 | 把少量数据存在浏览器里 |
| **Session** | 服务端会话跟踪 | 把数据存在服务端，用 SessionID 关联 |
| **JDBC** | 数据库连接 | Java 程序操作数据库的标准 API |
| **MVC** | 代码分层架构 | Model-View-Controller，职责分离 |

---

### 五、开发环境搭建

#### 1. 所需工具

| 工具 | 用途 | 推荐版本 |
| --- | --- | --- |
| JDK | Java 运行和编译 | JDK 8 / 11 / 17 |
| IDEA | 开发 IDE | Ultimate 版（支持 JavaWeb） |
| Tomcat | Web 容器 | 9.0（匹配 Servlet 4.0） |
| Maven | 项目构建 | 3.6+ |
| MySQL | 数据库 | 5.7 / 8.0 |

#### 2. Maven 依赖（pom.xml）

```xml
<dependencies>
    <!-- Servlet API（Tomcat 已提供，编译时需要） -->
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>4.0.1</version>
        <scope>provided</scope>  <!-- 运行时由 Tomcat 提供 -->
    </dependency>

    <!-- JSP API -->
    <dependency>
        <groupId>javax.servlet.jsp</groupId>
        <artifactId>javax.servlet.jsp-api</artifactId>
        <version>2.3.3</version>
        <scope>provided</scope>
    </dependency>

    <!-- JSTL（JSP 标准标签库） -->
    <dependency>
        <groupId>jstl</groupId>
        <artifactId>jstl</artifactId>
        <version>1.2</version>
    </dependency>
</dependencies>
```

> ⚠️ **注意：** Servlet 和 JSP 的依赖 `scope` 必须设为 `provided`，因为它们由 Tomcat 运行时提供。设为 `compile`（默认）会和 Tomcat 自带的冲突。

---

### 六、实际应用场景

#### 场景 1：用户登录

```
浏览器 POST /login (username=admin&password=123)
    → LoginServlet 接收参数
    → 调用 UserService 校验账号密码
    → 成功：创建 Session，重定向到首页
    → 失败：转发回登录页，带错误提示
```

#### 场景 2：商品列表展示

```
浏览器 GET /product/list
    → ProductListServlet
    → 调用 ProductService 查数据库
    → 把 List<Product> 存入 request 域
    → 转发到 product.jsp 渲染
```

#### 场景 3：全局编码过滤器

```
所有请求 → CharacterEncodingFilter（统一设 UTF-8）
         → 目标 Servlet → 响应也要过 Filter
```

---

### 七、常见问题与注意事项

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| 404 找不到资源 | URL 路径写错 / 没部署成功 | 检查 `@WebServlet` 路径、项目是否部署到 Tomcat |
| 500 服务端异常 | Servlet 代码抛异常 | 看 Tomcat 日志（`logs/catalina.out`） |
| 中文乱码 | 请求/响应编码未统一 | 用 Filter 统一设置 `request.setCharacterEncoding("UTF-8")` |
| ClassNotFoundException | 缺少 jar 包 | 检查 `pom.xml` 依赖、jar 是否放到 `WEB-INF/lib` |
| 修改代码不生效 | 没重新编译/部署 | IDEA 需重新 Build 或开启热部署 |

> ⚠️ **注意：** JavaWeb 项目**不能直接 `main` 方法启动**，必须部署到 Tomcat 或其他 Servlet 容器中运行。

---

### 八、总结

- **JavaWeb = Java + B/S 架构**，核心任务是「接收请求、处理业务、返回响应」
- **Tomcat** 是运行 JavaWeb 项目的 Servlet 容器
- **Servlet** 是整个 JavaWeb 的基石，所有请求最终都进入 Servlet 处理
- 会话跟踪用 **Cookie（客户端）+ Session（服务端）**
- 代码组织推荐 **MVC 分层**
- 学习路径：HTTP → Tomcat → Servlet → Request/Response → Cookie/Session → Filter/Listener → JSP → MVC

> 💡 **提示：** 现代开发中 JSP 已被前后端分离（Vue/React + RESTful API）取代，但 **Servlet 的思想贯穿所有 Java 后端框架**（Spring MVC 的 `@Controller` 本质上就是一个 Servlet）。学懂 JavaWeb，是理解 Spring 系列框架的前提。
