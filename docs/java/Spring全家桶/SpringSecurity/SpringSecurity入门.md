### 一、概述

> 📖 [Spring Security 官方文档](https://docs.spring.io/spring-security/reference/) ｜ [Spring Security 6 迁移指南](https://docs.spring.io/spring-security/reference/migration/index.html)

**Spring Security** 是 Java 安全领域的事实标准框架，专门解决两个核心问题：**认证（Authentication）** 和 **授权（Authorization）**。

大白话：
- **认证 = 你是谁**（登录验证身份，像进小区刷门禁卡）。
- **授权 = 你能干什么**（权限控制，像卡能进几号楼、能进机房吗）。

| 你将学到 | 说明 |
| --- | --- |
| 认证 vs 授权 | 两个核心概念 |
| 核心组件 | 过滤器链、UserDetailsService、PasswordEncoder |
| 基础配置（Security 6） | `SecurityFilterChain` Bean 写法 |
| 方法级授权 | `@PreAuthorize` |

> ⚠️ **注意：** 本文基于 **Spring Security 6.x**（Spring Boot 3.x）。旧版广泛使用的 `WebSecurityConfigurerAdapter` 在 5.7 已废弃、6.x 已删除，配置方式请用本文的 `SecurityFilterChain` Bean。

---

### 二、核心概念：认证与授权

| | 认证（Authentication） | 授权（Authorization） |
| --- | --- | --- |
| 解决 | 你是谁 | 你能干什么 |
| 时机 | 登录时 | 每次访问资源时 |
| 典型 | 账号密码、短信验证码、指纹 | 角色（管理员/普通用户）、权限（增删改查） |
| 例子 | 门禁刷卡进小区 | 卡能进 3 号楼但不能进机房 |

一个完整的请求处理：**先认证（你是谁）→ 再授权（能不能访问）→ 都通过才到 Controller**。

---

### 三、核心组件

Spring Security 有一套自己的概念体系，先认全这些「零件」：

| 组件 | 作用 | 通俗理解 |
| --- | --- | --- |
| **SecurityFilterChain** | 安全过滤器链，所有请求先经过它 | 小区的「安检通道」 |
| **Authentication** | 认证信息（主体 + 凭证 + 权限） | 你的「访客牌」 |
| **AuthenticationManager** | 认证管理器，协调认证 | 安检通道的「总调度」 |
| **UserDetailsService** | 加载用户信息（账号、密码、权限） | 「访客登记册」 |
| **UserDetails** | 用户信息的封装 | 登记册里的一条记录 |
| **PasswordEncoder** | 密码编码（加密 + 校验） | 密码的「保险箱」 |
| **GrantedAuthority** | 权限/角色 | 访客牌上的「可进入区域」标签 |
| **SecurityContext / SecurityContextHolder** | 存放当前登录用户（线程绑定） | 你身上挂着的「当前访客牌」 |

```
请求 ──► SecurityFilterChain（一连串 Filter）
            │
            ├─ 认证 Filter：核对账号密码 → 生成 Authentication
            │       └─ 存入 SecurityContextHolder（当前线程）
            │
            ├─ 授权 Filter：检查 Authentication 有没有访问权限
            │
            └─ 通过 ──► Controller
```

---

### 四、过滤器链工作原理

Spring Security 的核心是一条**过滤器链**（`SecurityFilterChain`），它套在 Servlet 容器和 DispatcherServlet 之间（比 [[../SpringMVC/拦截器]] 更靠外）：

```
请求 ──► Tomcat
           │
           ▼
   SecurityFilterChain（关键 Filter 依次执行）
     ├─ SecurityContextHolderFilter     ← 准备/清理安全上下文
     ├─ UsernamePasswordAuthenticationFilter  ← 处理表单登录（POST /login）
     ├─ ...（其他 Filter：JWT、记住我、CSRF 等）
     ├─ AuthorizationFilter             ← 【授权】校验当前用户能否访问该 URL
     └─ ExceptionTranslationFilter      ← 把安全异常转成 401/403
           │
           ▼
   DispatcherServlet ──► Controller
```

几个关键 Filter：

| Filter | 职责 |
| --- | --- |
| `UsernamePasswordAuthenticationFilter` | 拦截登录请求，做账号密码认证 |
| `AuthorizationFilter`（Security 6） | **授权**：检查 URL 权限，不满足返回 403 |
| `ExceptionTranslationFilter` | 把认证/授权异常翻译成 401/403 响应 |
| `CsrfFilter` | 防 CSRF 攻击（前后端分离一般关掉） |

> 💡 **提示：** 理解「过滤器链」是理解 Spring Security 的关键——它本质上就是一堆按顺序执行的 Filter，认证和授权都是某个 Filter 干的活。

---

### 五、实战一：基础配置（Spring Security 6）

#### 1. 引入依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

> ⚠️ **注意：** 引入这个依赖后，**所有接口默认都需要登录**（会跳出一个 Spring 自带的登录页）。这就是很多新手发现「我的接口突然访问不了」的原因。

#### 2. 配置类（核心）

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ① 配置安全过滤器链
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())                           // 前后端分离关掉 CSRF
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login", "/register").permitAll() // 放行登录、注册
                .requestMatchers("/admin/**").hasRole("ADMIN")      // /admin/** 需 ADMIN 角色
                .anyRequest().authenticated()                       // 其余都要登录
            )
            .formLogin(form -> form.disable())                      // 关掉默认表单登录页
            .sessionManagement(s -> s.sessionCreationPolicy(
                SessionCreationPolicy.IF_REQUIRED));                // 按需创建 session
        return http.build();
    }

    // ② 密码编码器（必须配，否则报错）
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();   // ✅ 推荐 BCrypt
    }
}
```

#### 3. 自定义用户认证（`UserDetailsService`）

从数据库加载用户信息：

```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        // 用 Spring 提供的 User.builder 构造 UserDetails
        return User.builder()
            .username(user.getUsername())
            .password(user.getPassword())        // 数据库里存的是 BCrypt 加密后的
            .roles(user.getRoles().toArray(new String[0]))   // 角色（如 ADMIN、USER）
            .build();
    }
}
```

> 💡 **提示：** `hasRole("ADMIN")` 内部会自动加 `ROLE_` 前缀，所以用 `.roles("ADMIN")` 时不用自己写 `ROLE_ADMIN`。

#### 4. 密码加密

```java
// 注册时：明文密码加密后入库
String rawPassword = "123456";
String encoded = passwordEncoder.encode(rawPassword);   // $2a$10$xxxxx...（每次加密结果不同）
user.setPassword(encoded);
userRepository.save(user);

// 登录时：Spring Security 自动用 passwordEncoder.matches() 校验
// 你不用自己比对
```

> ⚠️ **注意：** 数据库里**绝不存明文密码**。`BCryptPasswordEncoder` 每次加密加随机盐，所以同一个密码加密两次结果不同，但 `matches()` 能正确校验。

---

### 六、实战二：方法级授权

除了 URL 级别控制，还能在**方法**上控制权限，更细粒度：

```java
@Configuration
@EnableMethodSecurity   // ✅ 开启方法级安全（Security 6 取代 @EnableGlobalMethodSecurity）
public class MethodSecurityConfig { }
```

```java
@Service
public class OrderService {

    @PreAuthorize("hasRole('ADMIN')")                    // 调用前校验：需 ADMIN 角色
    public void deleteOrder(Long id) { ... }

    @PreAuthorize("hasAuthority('order:write')")         // 校验具体权限
    public void updateOrder(Order order) { ... }

    @PostAuthorize("returnObject.owner == authentication.name")  // 调用后校验：只能查自己的
    public Order getOrder(Long id) { ... }
}
```

| 注解 | 时机 | 表达式示例 |
| --- | --- | --- |
| `@PreAuthorize` | 方法**执行前** | `hasRole('ADMIN')`、`hasAuthority('x')`、`#id == authentication.principal.id` |
| `@PostAuthorize` | 方法**执行后** | `returnObject.owner == authentication.name` |
| `@PreFilter` / `@PostFilter` | 过滤集合参数/返回值 | `filterObject != 'admin'` |

> 💡 **提示：** 方法级授权底层是 [[../Spring框架核心/AOP面向切面]]——所以它也有「**自调用失效**」的问题（同类内部调用不走代理，注解不生效）。

---

### 七、前后端分离场景（思路）

Spring Security 默认是「表单登录 + Session + Cookie」那一套（适合服务端渲染）。前后端分离通常用 **JWT**：

1. **登录**：Controller 接收 JSON 账号密码 → 校验通过 → 生成 **JWT** 返回给前端。
2. **后续请求**：前端把 JWT 放在 `Authorization` 请求头 → 后端用自定义 Filter（如 `OncePerRequestFilter`）解析 JWT → 构造 `Authentication` 存入 `SecurityContextHolder`。
3. **配置**：关掉 CSRF、设为无状态（`SessionCreationPolicy.STATELESS`）。

```java
// 自定义 JWT 过滤器（简化）
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse resp, FilterChain chain)
            throws ServletException, IOException {
        String token = req.getHeader("Authorization");
        if (token != null && jwtUtil.verify(token)) {
            Long userId = jwtUtil.parseUserId(token);
            // 构造 Authentication 并放入上下文
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(req, resp);
    }
}
```

然后在 `SecurityFilterChain` 里把它加到 `UsernamePasswordAuthenticationFilter` 之前：

```java
http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
```

> 💡 **提示：** JWT 的完整实战（签发、刷新、黑名单）是另一个大话题，本文只给对接思路。核心就是「**自定义 Filter 解析 token → 填充 SecurityContext**」。

---

### 八、常见问题与踩坑

> ⚠️ **注意：**
> - **引入依赖后接口全要登录**：这是默认行为。要放行接口，在 `authorizeHttpRequests` 里用 `permitAll()`。
> - **密码明文报 `There is no PasswordEncoder`**：必须配 `PasswordEncoder` Bean，且库里存的是加密后的密码。
> - **POST 请求 403**：很可能是 **CSRF 拦截**（默认开启）。前后端分离用 `.csrf(csrf -> csrf.disable())` 关掉。
> - **Security 5 → 6 配置失效**：`WebSecurityConfigurerAdapter` 没了；`authorizeRequests` 改名 `authorizeHttpRequests`；`antMatchers` 改名 `requestMatchers`；`@EnableGlobalMethodSecurity` 改 `@EnableMethodSecurity`。
> - **获取当前登录用户**：用 `SecurityContextHolder.getContext().getAuthentication()`。

> 💡 **提示：** Spring Security 出了名的「**功能强大但配置复杂**」。遇到问题先想「是认证问题（401）还是授权问题（403）」，再看过滤器链哪一步拦住了——方向对了，排查就快。

---

### 九、总结

- **两大核心**：认证（你是谁）+ 授权（你能干什么）。
- **核心是一条过滤器链**（`SecurityFilterChain`），认证和授权都是其中的 Filter 干的活。
- **基础配置（Security 6）**：定义 `SecurityFilterChain` Bean，配 `permitAll`/`hasRole`/`authenticated`。
- **密码加密**：用 `BCryptPasswordEncoder`，库里绝不存明文。
- **方法级授权**：`@EnableMethodSecurity` + `@PreAuthorize`（底层是 AOP）。
- **前后端分离**：用 JWT + 自定义 Filter，关掉 CSRF、设无状态。

SpringSecurity 子目录完成。下一步进入微服务：[[../SpringCloud微服务/微服务架构概述]]。
