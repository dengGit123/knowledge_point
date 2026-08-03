### 一、概述

> 📖 [JSP 规范（Oracle）](https://javaee.github.io/servlet-spec/) ｜ [JSTL 官方文档](https://docs.oracle.com/javaee/5/jstl/1.2/docs/tlddocs/)

**JSP（JavaServer Pages）** 是一种在 HTML 中嵌入 Java 代码的技术，用于动态生成网页。它本质上是 Servlet 的「语法糖」——JSP 文件最终会被 Tomcat 编译成 Servlet 执行。

大白话：JSP 让你不用一行行 `write()` 拼 HTML，而是直接在 HTML 里写 Java 代码，像写模板一样生成动态页面。

> ⚠️ **注意：** JSP 是**过时技术**。现代开发用「前后端分离」（Vue/React + RESTful API），JSP 已被淘汰。本文目的是帮你**维护老项目**或**理解历史代码**，新项目不要再用。

| 你将学到 | 说明 |
| --- | --- |
| JSP 原理 | JSP 如何被编译成 Servlet |
| JSP 语法 | 脚本、表达式、声明 |
| 内置对象 | 九大内置对象 |
| EL 表达式 | 简化 JSP 中的 Java 代码 |
| JSTL | 标准标签库，替代脚本 |
| MVC 模式 | JSP 在 MVC 中的定位 |

---

### 二、JSP 的工作原理

JSP 的生命周期：

```
① 浏览器请求 xxx.jsp
        ↓
② Tomcat 检查是否已编译过（存在对应的 Servlet .class）
        ↓
③ 首次访问：JSP → 翻译成 Servlet 源码（.java）→ 编译成 .class
        ↓
④ 后续访问：直接执行已编译的 Servlet
        ↓
⑤ 输出 HTML 响应
```

JSP 被编译后的 Servlet 大致长这样：

```java
// Tomcat 自动生成的 Servlet（简化版）
public class hello_jsp extends HttpServlet {
    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) {
        // JSP 中的 HTML 变成 out.write() 调用
        out.write("<html>");
        out.write("<body>");
        // JSP 中的 Java 代码原样保留
        String name = req.getParameter("name");
        out.write("<h1>Hello, " + name + "</h1>");
        out.write("</body>");
        out.write("</html>");
    }
}
```

> 💡 **提示：** JSP 编译后的 Servlet 源码可以在 Tomcat 的 `work/Catalina/localhost/` 目录下找到。

---

### 三、JSP 语法

#### 1. 脚本元素（Scriptlet）

`<% ... %>` 里面写 Java 代码，会被原样放到编译后的 Servlet 中：

```jsp
<%-- JSP 注释（不会出现在响应中） --%>
<!-- HTML 注释（会出现在响应中） -->

<%
    // Java 代码
    String name = request.getParameter("name");
    int age = 20;
    if (age >= 18) {
%>
    <p>成年人</p>
<%
    } else {
%>
    <p>未成年人</p>
<%
    }
%>
```

#### 2. 表达式（Expression）

`<%= ... %>` 输出变量的值，相当于 `out.print()`：

```jsp
<p>用户名：<%= request.getParameter("name") %></p>
<p>当前时间：<%= new java.util.Date() %></p>
<p>1+1 = <%= 1 + 1 %></p>
```

> ⚠️ **注意：** 表达式末尾**不要加分号**（`<%= expr %>` 正确，`<%= expr; %>` 错误）。

#### 3. 声明（Declaration）

`<%! ... %>` 声明成员变量或方法（放到编译后的 Servlet 类级别）：

```jsp
<%! 
    // 成员变量
    private int count = 0;

    // 方法
    public String sayHello(String name) {
        return "Hello, " + name;
    }
%>

<p><%= sayHello("张三") %></p>
```

#### 4. 指令（Directive）

`<%@ ... %>` 设置 JSP 页面的全局属性：

```jsp
<!-- page 指令：设置页面属性 -->
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List, java.util.ArrayList" %>
<%@ page session="true" %>  <!-- 是否创建 Session（默认 true） -->
<%@ page errorPage="/error.jsp" %>  <!-- 出错时跳转的页面 -->

<!-- include 指令：静态包含（编译时合并） -->
<%@ include file="/common/header.jsp" %>

<!-- taglib 指令：引入标签库 -->
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
```

---

### 四、JSP 九大内置对象

JSP 编译后的 Servlet 会自动声明这些对象，可以直接使用：

| 内置对象 | 类型 | 作用 | 作用域 |
| --- | --- | --- | --- |
| **request** | `HttpServletRequest` | 获取请求数据 | Request 域 |
| **response** | `HttpServletResponse` | 设置响应 | - |
| **session** | `HttpSession` | 会话数据 | Session 域 |
| **application** | `ServletContext` | 全局上下文 | Context 域 |
| **out** | `JspWriter` | 输出内容到响应 | - |
| **pageContext** | `PageContext` | 页面上下文，可访问其他所有对象 | Page 域 |
| **config** | `ServletConfig` | Servlet 配置 | - |
| **page** | `Object` | 当前 JSP 页面实例（this） | Page 域 |
| **exception** | `Throwable` | 异常信息（仅在错误页可用） | - |

```jsp
<%
    // 直接使用内置对象
    String name = request.getParameter("name");
    session.setAttribute("user", name);
    application.setAttribute("count", 100);

    // out 输出
    out.write("<p>Hello, " + name + "</p>");
%>
```

---

### 五、EL 表达式

#### 1. 什么是 EL

**EL（Expression Language）** 是 JSP 2.0 引入的表达式语言，用于**替代 JSP 脚本**，让页面更简洁。

```jsp
<!-- ❌ 旧方式：脚本 -->
<%= request.getParameter("name") %>
<%= session.getAttribute("user") %>

<!-- ✅ 新方式：EL 表达式 -->
${param.name}
${sessionScope.user}
```

#### 2. EL 基本用法

```jsp
<!-- 获取请求参数 -->
${param.name}              <!-- 相当于 request.getParameter("name") -->
${paramValues.hobby[0]}    <!-- 获取多选框第一个值 -->

<!-- 获取域对象中的属性（从小到大依次查找：page → request → session → application） -->
${user}                    <!-- 自动从四个域中查找 -->
${requestScope.user}       <!-- 只在 request 域找 -->
${sessionScope.user}       <!-- 只在 session 域找 -->
${applicationScope.count}  <!-- 只在 application 域找 -->

<!-- 访问 JavaBean 属性 -->
${user.name}               <!-- 调用 user.getName() -->
${user["name"]}            <!-- 同上，支持动态属性名 -->

<!-- 访问集合 -->
${list[0]}                 <!-- 获取 List 第一个元素 -->
${map.key}                 <!-- 获取 Map 的值 -->
${map["key"]}              <!-- 同上 -->

<!-- 运算 -->
${1 + 2}                   <!-- 算术运算 -->
${1 > 2}                   <!-- 关系运算 -->
${empty list}              <!-- 判断是否为空（null 或空集合） -->
${a > b ? "大" : "小"}     <!-- 三元运算 -->
```

#### 3. EL 隐式对象

| EL 隐式对象 | 对应 JSP 内置对象 | 用途 |
| --- | --- | --- |
| `param` | - | 获取请求参数 |
| `paramValues` | - | 获取请求参数数组 |
| `header` | - | 获取请求头 |
| `cookie` | - | 获取 Cookie |
| `initParam` | - | 获取 context-param |
| `pageContext` | pageContext | 访问其他所有对象 |

```jsp
<!-- 获取 Cookie 中的 JSESSIONID -->
${cookie.JSESSIONID.value}

<!-- 获取请求头 User-Agent -->
${header["User-Agent"]}

<!-- 获取项目上下文路径（最常用！） -->
${pageContext.request.contextPath}
```

> 💡 **提示：** `${pageContext.request.contextPath}` 用于获取项目上下文路径，写前端资源引用时非常有用：
> ```jsp
> <link rel="stylesheet" href="${pageContext.request.contextPath}/css/style.css">
> <form action="${pageContext.request.contextPath}/login" method="post">
> ```

---

### 六、JSTL 标签库

#### 1. 什么是 JSTL

**JSTL（JSP Standard Tag Library）** 是 JSP 标准标签库，用**标签**替代 Java 代码，让 JSP 页面更干净。

```jsp
<!-- 引入 JSTL -->
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
```

#### 2. 核心标签（c 标签）

```jsp
<!-- 变量设置和输出 -->
<c:set var="name" value="张三" scope="request"/>
<c:out value="${name}"/>  <!-- 输出（自动转义 HTML） -->

<!-- 条件判断 -->
<c:if test="${age >= 18}">
    <p>成年人</p>
</c:if>

<c:choose>
    <c:when test="${score >= 90}">优秀</c:when>
    <c:when test="${score >= 60}">及格</c:when>
    <c:otherwise>不及格</c:otherwise>
</c:choose>

<!-- 循环遍历 -->
<c:forEach items="${userList}" var="user" varStatus="status">
    <tr>
        <td>${status.index}</td>  <!-- 循环索引（从 0 开始） -->
        <td>${user.name}</td>
        <td>${user.age}</td>
    </tr>
</c:forEach>

<!-- 遍历 Map -->
<c:forEach items="${map}" var="entry">
    Key: ${entry.key}, Value: ${entry.value}
</c:forEach>

<!-- 固定次数循环 -->
<c:forEach begin="1" end="10" var="i">
    <span>${i}</span>
</c:forEach>

<!-- URL 处理（自动拼接上下文路径） -->
<c:url value="/user/detail">
    <c:param name="id" value="123"/>
</c:url>
<!-- 输出：/myapp/user/detail?id=123 -->

<!-- 重定向 -->
<c:redirect url="/login"/>
```

#### 3. 格式化标签（fmt 标签）

```jsp
<!-- 日期格式化 -->
<fmt:formatDate value="${user.createTime}" pattern="yyyy-MM-dd HH:mm:ss"/>

<!-- 数字格式化 -->
<fmt:formatNumber value="${price}" type="currency"/>  <!-- ¥100.00 -->
<fmt:formatNumber value="3.14159" maxFractionDigits="2"/>  <!-- 3.14 -->
```

---

### 七、JSP 在 MVC 中的角色

在 JavaWeb 的 MVC 模式中：

```
Model（模型）     → JavaBean / Service / DAO（业务逻辑和数据）
View（视图）      → JSP（展示层，只负责渲染）
Controller（控制）→ Servlet（接收请求，调用 Model，转发到 View）
```

```java
// Controller（Servlet）
@WebServlet("/user/list")
public class UserListServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // ① 调用 Model 获取数据
        List<User> userList = userService.findAll();

        // ② 把数据存入 request 域
        req.setAttribute("userList", userList);

        // ③ 转发到 View（JSP）渲染
        req.getRequestDispatcher("/user/list.jsp").forward(req, resp);
    }
}
```

```jsp
<!-- View（JSP）- 只负责展示，不写业务逻辑 -->
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html>
<body>
    <h1>用户列表</h1>
    <table>
        <tr><th>ID</th><th>姓名</th><th>年龄</th></tr>
        <c:forEach items="${userList}" var="user">
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.age}</td>
            </tr>
        </c:forEach>
    </table>
</body>
</html>
```

> ⚠️ **注意：** JSP 中**不应该写业务逻辑**（查数据库、处理业务）。JSP 只做展示，业务逻辑全部在 Servlet/Service 中完成。

---

### 八、JSP 的包含与转发

#### 1. 静态包含（编译时合并）

```jsp
<%@ include file="/common/header.jsp" %>
```

- 编译时把目标 JSP 的内容**合并**到当前 JSP，生成一个 Servlet
- 共享同一个 request 域
- 适合公共页面片段（页头、页脚、导航栏）

#### 2. 动态包含（运行时合并）

```jsp
<jsp:include page="/common/header.jsp"/>
```

- 运行时**分别编译**，把输出结果合并
- 不共享变量（各自独立）
- 适合内容动态变化的模块

#### 3. 转发

```jsp
<jsp:forward page="/target.jsp">
    <jsp:param name="name" value="张三"/>
</jsp:forward>
```

等价于：
```java
request.getRequestDispatcher("/target.jsp?name=张三").forward(request, response);
```

---

### 九、常见问题与注意事项

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| JSP 修改后不生效 | Tomcat 缓存了旧的编译结果 | 重启 Tomcat 或删除 `work` 目录下对应文件 |
| EL 表达式不生效 | JSP 版本太低 / 配置了 `isELIgnored=true` | 确保 `web.xml` 的 `web-app` 版本 ≥ 2.4 |
| JSP 页面中文乱码 | pageEncoding 没设 UTF-8 | `<%@ page pageEncoding="UTF-8" %>` |
| JSTL 报 ClassNotFoundException | 没引入 jstl 依赖 | 添加 `jstl` 的 jar 包 |
| JSP 中 Java 代码和 HTML 混在一起 | 脚本用太多 | 用 EL + JSTL 替代脚本 |

> ⚠️ **注意：** JSP 中**不要写业务逻辑**（查数据库、处理业务）。JSP 只做展示，业务逻辑全部在 Servlet/Service 中完成。

---

### 十、总结

- **JSP 本质是 Servlet**，会被 Tomcat 编译成 Servlet 执行
- JSP 语法：脚本 `<% %>`、表达式 `<%= %>`、声明 `<%! %>`、指令 `<%@ %>`
- **九大内置对象**：request、response、session、application、out、pageContext、config、page、exception
- **EL 表达式** `${}` 简化数据获取，`${pageContext.request.contextPath}` 获取上下文路径
- **JSTL 标签**替代脚本：`<c:forEach>`、`<c:if>`、`<c:set>` 等
- MVC 中 JSP 只做 **View（展示）**，业务逻辑在 Servlet/Service
- **JSP 已过时**，现代开发用前后端分离，本文主要用于维护老项目
