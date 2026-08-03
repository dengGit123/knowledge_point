### 一、概述

> 📖 [Oracle JavaEE MVC 模式](https://www.oracle.com/technical-resources/articles/javase/mvc.html)

**MVC（Model-View-Controller）** 是一种代码分层架构模式，把程序按职责分成三层：

- **Model（模型）**：处理业务逻辑和数据（Service、DAO、JavaBean）
- **View（视图）**：负责展示（JSP、HTML）
- **Controller（控制器）**：接收请求，协调 Model 和 View（Servlet）

大白话：MVC 就是「各司其职」——Controller 是前台接待（接请求），Model 是后台员工（干活），Model 是前台展示（出结果）。谁该干什么，清清楚楚。

> 💡 **提示：** MVC 是 JavaWeb 中最重要的设计模式，Spring MVC、Spring Boot 都是在这个基础上发展起来的。

| 你将学到 | 说明 |
| --- | --- |
| MVC 原理 | 三层的职责和关系 |
| JavaWeb 中的 MVC 实现 | Servlet + JSP + JavaBean |
| 三层架构 | Controller → Service → DAO |
| 实际案例 | 用户管理的完整 MVC 实现 |
| MVC 的优缺点 | 为什么需要 MVC |

---

### 二、MVC 的工作原理

```
浏览器发请求
      ↓
① Controller（Servlet）接收请求，解析参数
      ↓
② Controller 调用 Model（Service）处理业务
      ↓
③ Model 访问数据库（DAO），返回结果
      ↓
④ Controller 把结果存入 request 域
      ↓
⑤ Controller 转发到 View（JSP）
      ↓
⑥ View 从 request 域取数据，渲染 HTML
      ↓
⑦ 响应返回浏览器
```

用一张图表示：

```
[浏览器] ──请求──► [Controller / Servlet]
                        │
                        ├──调用──► [Model / Service] ──调用──► [DAO] ──► [数据库]
                        │
                        └──转发──► [View / JSP] ──渲染──► [HTML 响应]
```

#### 各层职责

| 层级 | 职责 | JavaWeb 中的实现 | 不该做的事 |
| --- | --- | --- | --- |
| **Controller** | 接收请求、参数校验、调用 Model、选择 View | `Servlet` | 写业务逻辑、访问数据库 |
| **Model** | 业务逻辑、数据处理、数据库操作 | `Service` + `DAO` + `JavaBean` | 直接操作请求/响应 |
| **View** | 渲染页面、展示数据 | `JSP` / `HTML` | 写业务逻辑、访问数据库 |

---

### 三、JavaWeb 中的 MVC 实现

#### 1. Model 层 — JavaBean（实体类）

```java
// 实体类：封装数据（对应数据库表）
public class User implements Serializable {
    private Long id;
    private String username;
    private String password;
    private Integer age;
    private Date createTime;

    // 构造器、getter、setter 省略
}
```

#### 2. DAO 层 — 数据访问

```java
// DAO 接口
public interface UserDao {
    User findById(Long id);
    List<User> findAll();
    int save(User user);
    int update(User user);
    int deleteById(Long id);
}

// DAO 实现（使用 JDBC）
public class UserDaoImpl implements UserDao {
    private DataSource dataSource;  // 数据库连接池

    public UserDaoImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public User findById(Long id) {
        String sql = "SELECT * FROM user WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return mapRow(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("查询用户失败", e);
        }
        return null;
    }

    // 其他方法省略...

    private User mapRow(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setUsername(rs.getString("username"));
        user.setPassword(rs.getString("password"));
        user.setAge(rs.getInt("age"));
        user.setCreateTime(rs.getTimestamp("createTime"));
        return user;
    }
}
```

#### 3. Service 层 — 业务逻辑

```java
// Service 接口
public interface UserService {
    User login(String username, String password);
    User findById(Long id);
    List<User> findAll();
    boolean register(User user);
    boolean deleteById(Long id);
}

// Service 实现
public class UserServiceImpl implements UserService {
    private UserDao userDao = new UserDaoImpl(dataSource);

    @Override
    public User login(String username, String password) {
        User user = userDao.findByUsername(username);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (!user.getPassword().equals(password)) {
            throw new BusinessException("密码错误");
        }
        return user;
    }

    @Override
    public boolean register(User user) {
        // 业务校验
        if (user.getUsername() == null || user.getUsername().isEmpty()) {
            throw new BusinessException("用户名不能为空");
        }
        // 检查用户名是否已存在
        if (userDao.findByUsername(user.getUsername()) != null) {
            throw new BusinessException("用户名已存在");
        }
        return userDao.save(user) > 0;
    }

    // 其他方法省略...
}
```

#### 4. Controller 层 — Servlet

```java
@WebServlet("/user/*")
public class UserController extends HttpServlet {
    private UserService userService = new UserServiceImpl();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();

        if ("/list".equals(pathInfo)) {
            list(req, resp);
        } else if ("/detail".equals(pathInfo)) {
            detail(req, resp);
        } else if ("/delete".equals(pathInfo)) {
            delete(req, resp);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();

        if ("/save".equals(pathInfo)) {
            save(req, resp);
        }
    }

    // 查询列表
    private void list(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        List<User> userList = userService.findAll();
        req.setAttribute("userList", userList);
        req.getRequestDispatcher("/user/list.jsp").forward(req, resp);
    }

    // 查看详情
    private void detail(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        Long id = Long.parseLong(req.getParameter("id"));
        User user = userService.findById(id);
        req.setAttribute("user", user);
        req.getRequestDispatcher("/user/detail.jsp").forward(req, resp);
    }

    // 新增/修改
    private void save(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        req.setCharacterEncoding("UTF-8");
        String username = req.getParameter("username");
        String password = req.getParameter("password");
        int age = Integer.parseInt(req.getParameter("age"));

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        user.setAge(age);

        userService.register(user);
        resp.sendRedirect(req.getContextPath() + "/user/list");
    }

    // 删除
    private void delete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Long id = Long.parseLong(req.getParameter("id"));
        userService.deleteById(id);
        resp.sendRedirect(req.getContextPath() + "/user/list");
    }
}
```

#### 5. View 层 — JSP

```jsp
<!-- /user/list.jsp -->
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<html>
<head><title>用户列表</title></head>
<body>
    <h1>用户列表</h1>
    <a href="${pageContext.request.contextPath}/user/add.jsp">新增用户</a>
    <table border="1">
        <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>年龄</th>
            <th>操作</th>
        </tr>
        <c:forEach items="${userList}" var="user">
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.age}</td>
                <td>
                    <a href="${pageContext.request.contextPath}/user/detail?id=${user.id}">查看</a>
                    <a href="${pageContext.request.contextPath}/user/delete?id=${user.id}">删除</a>
                </td>
            </tr>
        </c:forEach>
    </table>
</body>
</html>
```

---

### 四、完整调用链示例

以「用户登录」为例，展示完整的 MVC 调用链：

```
① 浏览器 POST /user/login (username=admin&password=123)
      ↓
② UserController.doPost() 接收请求
      ↓ 调用
③ UserServiceImpl.login(username, password)
      ↓ 调用
④ UserDaoImpl.findByUsername(username)  →  SQL: SELECT * FROM user WHERE username = ?
      ↓ 返回
⑤ Service 校验密码，返回 User 对象
      ↓ 返回
⑥ Controller 把 User 存入 Session
      ↓ 重定向
⑦ 浏览器 GET /user/home
      ↓
⑧ 展示首页（已登录状态）
```

---

### 五、MVC 的优缺点

#### 优点

| 优点 | 说明 |
| --- | --- |
| **职责分离** | 各层只关注自己的事，代码清晰 |
| **可维护性** | 改业务逻辑不影响页面，改页面不影响业务 |
| **可复用性** | Service 可以被多个 Controller 调用 |
| **可测试性** | 每层可以独立测试 |
| **团队协作** | 前端做 View，后端做 Model/Controller，并行开发 |

#### 缺点

| 缺点 | 说明 |
| --- | --- |
| **代码量增加** | 简单的 CRUD 也要写很多类 |
| **学习成本高** | 新手理解分层需要时间 |
| **不适合小项目** | 简单页面用 MVC 反而更复杂 |

---

### 六、MVC 与三层架构的关系

MVC 和三层架构经常被混淆，它们是不同的概念：

| 对比 | MVC | 三层架构 |
| --- | --- | --- |
| 关注点 | **表现层**的分离 | **整个应用**的分层 |
| 分层 | Model - View - Controller | 表现层 - 业务层 - 数据层 |
| 范围 | 主要是前端展示 | 从前端到数据库 |

在 JavaWeb 中，两者结合使用：

```
表现层（MVC）
├── Controller（Servlet）  ← MVC 的 C
├── View（JSP）            ← MVC 的 V
└── Model                  ← MVC 的 M
    ├── Service（业务层）
    └── DAO（数据层）
```

> 💡 **提示：** MVC 的 Model 实际上包含了三层架构的「业务层 + 数据层」。

---

### 七、常见问题与注意事项

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| Servlet 里写大量业务逻辑 | 没分层 | 把业务逻辑抽到 Service |
| JSP 里写 SQL 查询 | View 越界 | JSP 只做展示，数据由 Controller 传入 |
| Service 直接操作 JDBC | 没 DAO 层 | 把数据库操作抽到 DAO |
| 代码重复（如获取连接） | 没抽取公共方法 | 用工具类或连接池 |
| 类之间紧耦合 | 直接 new 实现类 | 用接口 + 工厂模式 / 依赖注入 |

> ⚠️ **注意：** 实际开发中，Controller 不应该直接 `new ServiceImpl()`，而应该用**接口 + 工厂模式**或**依赖注入**（Spring 的核心功能）。这里为了简化示例直接 new 了。

---

### 八、总结

- **MVC** 把程序分成 Model（业务+数据）、View（展示）、Controller（调度）三层
- JavaWeb 中：Controller = Servlet，View = JSP，Model = Service + DAO + JavaBean
- 调用链：**请求 → Controller → Service → DAO → 数据库 → Controller → View → 响应**
- MVC 的核心价值：**职责分离、可维护、可复用**
- Spring MVC 是 MVC 模式的框架实现，学懂手写 MVC 才能理解 Spring MVC
