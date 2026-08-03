### 一、概述

> 📖 [Java Servlet 规范 - 会话跟踪](https://javaee.github.io/servlet-spec/downloads/servlet-4.0/servlet-4_0_FINAL-spec.pdf)

HTTP 是**无状态**的——服务端每次请求都不知道「你是谁」。但实际业务需要「记住用户」（如登录后保持登录态、购物车），这就需要**会话跟踪技术**。

**Cookie** 和 **Session** 是 JavaWeb 中最常用的两种会话跟踪机制：

- **Cookie**：把数据存在**客户端**（浏览器），每次请求自动带上
- **Session**：把数据存在**服务端**，通过 Cookie 里的 SessionID 关联

大白话：Cookie 是「会员卡」（存在你身上），Session 是「保险柜」（存在商场里），会员卡上的卡号就是 SessionID。

> 💡 **提示：** 更全面的会话跟踪技术（含 JWT/Token）见 [[Cookie与Session与Token]]。本文聚焦 JavaWeb 原生的 Cookie 和 Session。

| 你将学到 | 说明 |
| --- | --- |
| Cookie 机制 | 创建、读取、生命周期、路径 |
| Session 机制 | 创建、使用、销毁、钝化/活化 |
| Cookie vs Session | 对比与选择 |
| 会话跟踪的应用 | 登录、记住我、购物车 |

---

### 二、Cookie — 客户端会话跟踪

#### 1. Cookie 是什么

Cookie 是服务端发给浏览器的一小段文本数据（~4KB），浏览器会：
1. 保存这段数据
2. 之后每次访问该网站时，自动在请求头里带上这段数据

```
服务端 → 响应头 Set-Cookie: name=value → 浏览器保存
浏览器 → 请求头 Cookie: name=value → 服务端读取
```

#### 2. 创建和发送 Cookie

```java
@WebServlet("/cookie/set")
public class SetCookieServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // ① 创建 Cookie 对象（键值对）
        Cookie cookie = new Cookie("username", "张三");

        // ② 设置 Cookie 的属性
        cookie.setMaxAge(60 * 60 * 24 * 7);  // 有效期 7 天（秒）
        cookie.setPath(req.getContextPath()); // 作用路径
        cookie.setHttpOnly(true);              // 禁止 JS 访问（防 XSS）
        // cookie.setSecure(true);             // 仅 HTTPS 传输

        // ③ 添加到响应中（发送给浏览器）
        resp.addCookie(cookie);

        resp.getWriter().write("Cookie 已设置");
    }
}
```

#### 3. 读取 Cookie

```java
@WebServlet("/cookie/get")
public class GetCookieServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 获取请求中携带的所有 Cookie
        Cookie[] cookies = req.getCookies();

        // 遍历查找目标 Cookie
        String username = null;
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("username".equals(cookie.getName())) {
                    username = cookie.getValue();
                    break;
                }
            }
        }

        resp.getWriter().write("username=" + username);
    }
}
```

> ⚠️ **注意：** `Cookie` 的键和值**不能包含特殊字符**（空格、分号、逗号等）。中文需要编码：
> ```java
> // 设置时编码
> Cookie cookie = new Cookie("username", URLEncoder.encode("张三", "UTF-8"));
> // 读取时解码
> String username = URLDecoder.decode(cookie.getValue(), "UTF-8");
> ```

#### 4. Cookie 的生命周期

| 设置 | 效果 |
| --- | --- |
| `setMaxAge(-1)` | 默认值，Cookie 存在**浏览器内存**中，关闭浏览器就消失 |
| `setMaxAge(0)` | **删除** Cookie（让浏览器立即过期） |
| `setMaxAge(正数)` | Cookie 存在**硬盘**中，指定秒数内有效 |

```java
// 删除 Cookie：创建一个同名 Cookie，maxAge=0
Cookie cookie = new Cookie("username", "");
cookie.setMaxAge(0);
cookie.setPath(req.getContextPath());  // 路径必须和原来一致
resp.addCookie(cookie);
```

#### 5. Cookie 的路径

`setPath()` 控制 Cookie 的作用范围：

```java
// 只在 /myapp/admin/* 路径下发送
cookie.setPath(req.getContextPath() + "/admin");

// 在整个应用下都发送（推荐）
cookie.setPath(req.getContextPath());

// 默认：当前路径（容易出问题，建议显式设置）
```

#### 6. Cookie 的属性

| 属性 | 说明 | 安全建议 |
| --- | --- | --- |
| `name` / `value` | 键值对 | 不要存敏感数据（密码、身份证） |
| `maxAge` | 有效期（秒） | 敏感 Cookie 不要设太长 |
| `path` | 作用路径 | 设为最小必要范围 |
| `domain` | 作用域名 | 默认当前域，不要设太大 |
| `httpOnly` | 禁止 JS 访问 | **建议开启**（防 XSS 窃取） |
| `secure` | 仅 HTTPS 传输 | 生产环境**建议开启** |

---

### 三、Session — 服务端会话跟踪

#### 1. Session 是什么

Session 是服务端为每个用户创建的**私有存储空间**。服务端创建一个 Session 后，把 SessionID 通过 Cookie 发给浏览器，浏览器下次请求带上 SessionID，服务端就能找到对应的 Session。

```
① 浏览器首次请求 → 服务端创建 Session，生成 SessionID
② 响应：Set-Cookie: JSESSIONID=abc123
③ 浏览器再次请求 → Cookie: JSESSIONID=abc123
④ 服务端根据 SessionID 找到对应的 Session 对象
```

#### 2. 获取 Session

```java
@WebServlet("/session/set")
public class SetSessionServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 获取 Session（没有则自动创建）
        HttpSession session = req.getSession();

        // Session 信息
        System.out.println(session.getId());          // SessionID（如 abc123）
        System.out.println(session.isNew());          // 是否是新创建的
        System.out.println(session.getCreationTime()); // 创建时间戳
        System.out.println(session.getLastAccessedTime()); // 最后访问时间

        // 往 Session 存数据
        session.setAttribute("loginUser", user);
        session.setAttribute("cart", new Cart());

        resp.getWriter().write("Session 已设置");
    }
}
```

#### 3. 读取 Session

```java
@WebServlet("/session/get")
public class GetSessionServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 获取 Session（没有则返回 null，不创建）
        HttpSession session = req.getSession(false);

        if (session != null) {
            User user = (User) session.getAttribute("loginUser");
            resp.getWriter().write("当前用户：" + user.getName());
        } else {
            resp.getWriter().write("未登录");
        }
    }
}
```

#### 4. Session 的销毁

Session 有三种销毁方式：

```java
// 方式一：主动销毁（如退出登录）
session.invalidate();

// 方式二：超时自动销毁（默认 30 分钟无请求）
// 在 web.xml 中配置超时时间（分钟）
// <session-config>
//     <session-timeout>30</session-timeout>
// </session-config>

// 方式三：服务端关闭（正常关闭时 Session 会钝化到磁盘）
```

#### 5. Session 超时配置

```xml
<!-- web.xml：设置 Session 超时时间为 60 分钟 -->
<session-config>
    <session-timeout>60</session-timeout>
</session-config>
```

```java
// 代码中设置（分钟）
session.setMaxInactiveInterval(60 * 60);  // 1 小时
```

---

### 四、Cookie 与 Session 的配合

Session 默认依赖 Cookie 传递 SessionID，但浏览器禁用 Cookie 时怎么办？

#### URL 重写（了解即可）

当浏览器禁用 Cookie 时，可以用 **URL 重写** 把 SessionID 拼到 URL 里：

```java
// response.encodeURL() 会自动判断浏览器是否支持 Cookie
// 不支持时会在 URL 后追加 ;jsessionid=xxx
String url = response.encodeURL("/cart");
// 输出：/myapp/cart;jsessionid=abc123

// 重定向的 URL 重写
String redirectUrl = response.encodeRedirectURL("/login");
response.sendRedirect(redirectUrl);
```

> 💡 **提示：** 现代浏览器基本都支持 Cookie，URL 重写已很少用。但了解这个机制有助于理解 Session 的工作原理。

---

### 五、Cookie vs Session 对比

| 对比项 | Cookie | Session |
| --- | --- | --- |
| **存储位置** | 客户端（浏览器） | 服务端（Tomcat 内存） |
| **存储容量** | ~4KB，数量有限 | 理论上无限制 |
| **安全性** | 低（可被篡改、窃取） | 高（数据在服务端） |
| **性能** | 不占服务端资源 | 占用服务端内存 |
| **生命周期** | 可长期保存（硬盘） | 默认 30 分钟无请求失效 |
| **跨域** | 受域名限制 | 只在当前应用有效 |
| **数据类型** | 只能存 String | 可以存任意 Object |
| **适用场景** | 记住用户名、偏好设置 | 登录状态、购物车、敏感数据 |

#### 选择原则

```
存 Cookie：非敏感、小数据、需要长期保存（如「记住我」）
存 Session：敏感数据、大数据、临时数据（如登录状态）
```

---

### 六、Session 的钝化与活化

Tomcat 支持 Session 的**钝化（Passivation）**和**活化（Activation）**：

- **钝化**：Tomcat 正常关闭时，把内存中的 Session 序列化到磁盘（`work/Catalina/localname/SESSIONS.ser`）
- **活化**：Tomcat 重新启动时，从磁盘反序列化 Session 恢复到内存

> 💡 **提示：** 这意味着 Session 中存储的对象必须实现 `Serializable` 接口，否则钝化时会报错。

```java
// Session 中存储的类必须可序列化
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
    // ...
}
```

---

### 七、实际应用场景

#### 场景 1：登录（Session 存用户信息）

```java
@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String username = req.getParameter("username");
        String password = req.getParameter("password");

        User user = userService.login(username, password);
        if (user != null) {
            // 登录成功：Session 存用户信息
            HttpSession session = req.getSession();
            session.setAttribute("loginUser", user);

            // 如果勾选了「记住我」，用 Cookie 存用户名
            if ("on".equals(req.getParameter("remember"))) {
                Cookie cookie = new Cookie("rememberUser", URLEncoder.encode(username, "UTF-8"));
                cookie.setMaxAge(60 * 60 * 24 * 7);  // 7 天
                cookie.setPath(req.getContextPath());
                resp.addCookie(cookie);
            }

            resp.sendRedirect("home");
        } else {
            req.setAttribute("errorMsg", "用户名或密码错误");
            req.getRequestDispatcher("login.jsp").forward(req, resp);
        }
    }
}
```

#### 场景 2：退出登录

```java
@WebServlet("/logout")
public class LogoutServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 销毁 Session
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // 清除「记住我」的 Cookie
        Cookie cookie = new Cookie("rememberUser", "");
        cookie.setMaxAge(0);
        cookie.setPath(req.getContextPath());
        resp.addCookie(cookie);

        resp.sendRedirect("login");
    }
}
```

#### 场景 3：登录拦截（Filter 实现）

```java
@WebFilter("/*")
public class LoginFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) resp;

        String uri = request.getRequestURI();
        // 放行登录相关资源和静态资源
        if (uri.contains("/login") || uri.contains("/css/") || uri.contains("/js/")) {
            chain.doFilter(req, resp);
            return;
        }

        // 检查 Session 中是否有用户信息
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("loginUser") != null) {
            chain.doFilter(req, resp);  // 已登录，放行
        } else {
            response.sendRedirect(request.getContextPath() + "/login");  // 未登录，重定向
        }
    }
}
```

#### 场景 4：购物车（Session 存商品列表）

```java
@WebServlet("/cart/add")
public class CartServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String productId = req.getParameter("productId");

        // 获取购物车（Session 中），没有则创建
        HttpSession session = req.getSession();
        List<String> cart = (List<String>) session.getAttribute("cart");
        if (cart == null) {
            cart = new ArrayList<>();
            session.setAttribute("cart", cart);
        }
        cart.add(productId);

        resp.getWriter().write("购物车商品数：" + cart.size());
    }
}
```

---

### 八、常见问题与注意事项

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| Session 数据丢失 | 超时被销毁 / 服务端重启 | 调整超时时间，或把重要数据持久化到数据库 |
| Cookie 存不进去 | 值含特殊字符 | 用 `URLEncoder.encode()` 编码 |
| Cookie 读不到 | path 不匹配 | 设置 `cookie.setPath(req.getContextPath())` |
| 分布式下 Session 不一致 | 请求被分发到不同服务器 | 用 Redis 集中存储 Session（Spring Session） |
| Session 内存泄漏 | 对象存 Session 后一直不销毁 | 及时 `invalidate()`，避免存大对象 |
| 浏览器禁用 Cookie | SessionID 无法传递 | URL 重写（`response.encodeURL()`） |

> ⚠️ **注意：** Session 数据存在服务端内存中，**用户多时内存压力大**。分布式环境下需要用 Redis 等集中存储（Spring Session + Redis）。

---

### 九、总结

- **Cookie** 存在客户端，每次请求自动带上，适合存非敏感小数据
- **Session** 存在服务端，通过 SessionID（Cookie）关联，适合存敏感数据
- `req.getSession()` 获取 Session（没有则创建），`req.getSession(false)` 不创建
- Session 销毁：`invalidate()`、超时（默认 30 分钟）、服务端关闭
- Cookie 删除：`setMaxAge(0)` + 同名 Cookie 覆盖
- 登录场景：Session 存用户信息 + Cookie 实现「记住我」
- 分布式环境：Session 需要用 Redis 集中管理
