### 一、概述

> 📖 [Spring Core - Aspect Oriented Programming](https://docs.spring.io/spring-framework/reference/core/aop.html)

**AOP（Aspect Oriented Programming，面向切面编程）** 是 Spring 的另一块基石（第一块是 IoC）。它解决的是「**横切关注点**」——那些散落在各个方法里、重复出现的逻辑，比如日志、事务、权限、性能监控。

大白话：想象一栋写字楼，每层都要装「门禁系统」。如果每个楼层自己各装一套，既重复又难统一管理。AOP 的做法是——**统一在电梯口（公共切点）装一套门禁，所有人进出都自动经过**，不用每个楼层单独操心。

| 你将学到 | 说明 |
| --- | --- |
| AOP 解决什么 | 横切逻辑的统一处理 |
| 核心术语 | 切面/切点/通知/连接点/织入 |
| 五种通知 | Before/After/Around 等 |
| 切入点表达式 | 怎么指定「拦截哪些方法」 |
| 底层原理 | JDK 动态代理 vs CGLIB |

> 📌 AOP 是 [[Spring事务管理]] 的底层支撑（`@Transactional` 本质就是个切面）。

---

### 二、为什么需要 AOP

看一段没有 AOP 的代码——每个业务方法都要手动记日志：

```java
public class UserService {
    public User findById(Long id) {
        long start = System.currentTimeMillis();        // ❌ 重复的日志逻辑
        log.info("findById 开始, id={}", id);            // ❌
        User user = userDao.findById(id);
        log.info("findById 结束, 耗时={}ms", System.currentTimeMillis() - start); // ❌
        return user;
    }

    public void save(User user) {
        long start = System.currentTimeMillis();        // ❌ 又来一遍
        log.info("save 开始, user={}", user);            // ❌
        userDao.save(user);
        log.info("save 结束, 耗时={}ms", System.currentTimeMillis() - start); // ❌
    }
}
```

日志逻辑**侵入**了业务代码，每个方法都要写一遍。AOP 把这类逻辑抽到「**切面**」里，业务方法恢复干净：

```java
public class UserService {
    public User findById(Long id) {       // ✅ 业务方法干干净净
        return userDao.findById(id);
    }
}
```

---

### 三、核心术语（必须搞懂）

AOP 术语容易绕晕，用一张图 + 表格一次说清：

```
                     切面 Aspect
            （LogAspect：装着日志逻辑的类）
                  │
        ┌─────────┼──────────┐
        ▼         ▼          ▼
     通知      切点         连接点
   (Advice)  (Pointcut)  (JoinPoint)
   "做什么"  "在哪做"    "潜在的所有位置"
        │         │
        └────┬────┘
             ▼
          织入 Weaving
     （把切面套到目标方法上，Spring 用动态代理实现）
```

| 术语 | 含义 | 通俗理解 | Spring 里的体现 |
| --- | --- | --- | --- |
| **切面 Aspect** | 横切逻辑的封装 | 「门禁系统整体」 | `@Aspect` 标注的类 |
| **连接点 JoinPoint** | 程序执行的某个点 | 「每层的入口」（所有可能拦截处） | 方法的执行 |
| **切点 Pointcut** | 真正要拦截的连接点 | 「装了门禁的那几个口」 | `execution(...)` 表达式 |
| **通知 Advice** | 在切点处要做的动作 | 「刷卡的逻辑」 | `@Before`、`@Around` 等 |
| **织入 Weaving** | 把切面应用到目标 | 「把门禁装上去」 | 运行时动态代理 |

> 💡 **记忆：** **切面 = 切点（在哪）+ 通知（做什么）**。织入就是把切面装到目标对象上的过程。

---

### 四、五种通知类型

通知决定「在方法执行的什么时机切入」：

| 通知 | 注解 | 时机 | 能否改返回值/阻断 |
| --- | --- | --- | --- |
| 前置通知 | `@Before` | 方法**执行前** | 否 |
| 后置通知 | `@After` | 方法**执行后**（无论成功失败） | 否 |
| 返回通知 | `@AfterReturning` | 方法**正常返回后** | 可改返回值 |
| 异常通知 | `@AfterThrowing` | 方法**抛异常后** | 否 |
| **环绕通知** | `@Around` | **包围**方法（前后都能控制） | **能**（最强大） |

> 💡 **提示：** `@Around` 是最强大的，能决定是否执行目标方法、修改参数、修改返回值、捕获异常。日常日志/计时用它最方便，但要注意别吞异常。

#### 执行顺序

```
@Around (前半段)
  └─ @Before
        └─ 目标方法执行
              ├─ 正常 ──► @AfterReturning ──► @After ──► @Around (后半段)
              └─ 异常 ──► @AfterThrowing   ──► @After ──► @Around (后半段)
```

---

### 五、切入点表达式

切点表达式回答「**拦截哪些方法**」。最常用的是 `execution`：

```
execution(修饰符 返回值 包.类.方法(参数))
```

| 表达式 | 含义 |
| --- | --- |
| `execution(public * com.example.service.*.*(..))` | service 包下所有类的所有方法 |
| `execution(* com.example..*.*(..))` | com.example 及子包的所有方法 |
| `execution(* save*(..))` | 所有以 save 开头的方法 |
| `execution(* *(String, ..))` | 第一个参数是 String 的方法（`..` 代表其余任意） |

通配符：`*` 匹配任意，`..` 匹配任意数量参数/子包。

#### 按注解匹配（推荐）

更优雅的方式是按注解拦截——只拦截标了某注解的方法：

```
@annotation(com.example.annotation.Log)
```

---

### 六、完整示例：自定义 `@Log` 注解 + 计时切面

#### 1. 定义注解

```java
@Target(ElementType.METHOD)        // 标在方法上
@Retention(RetentionPolicy.RUNTIME) // 运行时保留
public @interface Log {
    String value() default "";      // 业务描述
}
```

#### 2. 定义切面

```java
@Aspect         // 声明这是一个切面
@Component      // 切面本身也要是 Bean，交给容器管理
public class LogAspect {

    // 切点：拦截所有标了 @Log 注解的方法
    @Pointcut("@annotation(com.example.annotation.Log)")
    public void logPointcut() { }

    // 环绕通知：在方法前后记录耗时
    @Around("logPointcut()")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        // 方法签名，用于拿到 @Log 注解里的描述
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        Log log = signature.getMethod().getAnnotation(Log.class);

        long start = System.currentTimeMillis();
        System.out.println("【" + log.value() + "】开始执行, 参数=" + Arrays.toString(pjp.getArgs()));

        try {
            Object result = pjp.proceed();   // ✅ 执行目标方法，必须调用，否则方法不会执行
            System.out.println("【" + log.value() + "】执行成功, 耗时=" + (System.currentTimeMillis() - start) + "ms");
            return result;
        } catch (Throwable e) {
            System.out.println("【" + log.value() + "】执行异常: " + e.getMessage());
            throw e;   // ⚠️ 异常必须重新抛出，否则上游感知不到
        }
    }
}
```

#### 3. 使用

```java
@Service
public class UserService {

    @Log("查询用户")           // 加上注解，方法就自动被切面拦截
    public User findById(Long id) {
        return userDao.findById(id);
    }

    @Log("保存用户")
    public void save(User user) {
        userDao.save(user);
    }
}
```

> 💡 **提示：** 要开启 AOP 支持，需加 `@EnableAspectJAutoProxy`（Spring Boot 引入 `spring-boot-starter-aop` 后自动开启）。

---

### 七、底层原理：JDK 动态代理 vs CGLIB

Spring AOP 的「织入」是靠**动态代理**实现的——给目标对象生成一个「替身（代理对象）」，替身里织入了通知逻辑：

```
调用方 ──► 代理对象（带切面逻辑）
              │
              ├─ 执行 @Before 通知
              ├─ 调用真实对象的目标方法
              └─ 执行 @After 通知
```

Spring 用两种代理方式：

| 对比 | JDK 动态代理 | CGLIB |
| --- | --- | --- |
| 要求 | 目标类**实现接口** | 目标类**无需接口** |
| 原理 | 基于 `Proxy.newProxyInstance` | 基于**生成子类**（继承） |
| 限制 | 只能代理接口里的方法 | 不能代理 `final` 类/方法 |
| Spring 默认 | 有接口时默认用它 | 无接口时用它 |

> ⚠️ **注意：** 强制全部用 CGLIB：`@EnableAspectJAutoProxy(proxyTargetClass = true)`（Spring Boot 2.x 起默认就是 CGLIB 优先，避免「接口代理 vs 类代理」的混乱）。

> 💡 **这解释了为什么自调用会失效：** `this.method()` 直接调的是真实对象，不经过代理 → 切面不生效。这也是 [[Spring事务管理]] 里 `@Transactional` 自调用失效的根因。

---

### 八、实际应用场景

1. **日志记录**：如上例，统一记录方法调用、参数、耗时。
2. **事务管理**：`@Transactional` 就是 Spring 提供的声明式事务切面，见 [[Spring事务管理]]。
3. **权限校验**：拦截需要权限的方法，校验当前用户角色。
4. **缓存**：`@Cacheable` 底层也是 AOP（见 [[../Spring其他生态/缓存抽象]]）。
5. **接口限流**：自定义注解 + 切面实现简单的令牌桶限流。

---

### 九、常见问题与注意事项

> ⚠️ **注意：**
> - **自调用失效**：同一个类里 `a()` 调 `b()`，`b()` 上的切面/事务不生效（走了 `this` 而非代理）。解决：把方法拆到不同类，或注入自身代理调用。
> - **只能代理 Spring 管理的 Bean**：自己 `new` 的对象，AOP 不生效。
> - **`private` 方法不生效**：Spring AOP 基于代理，代理不到私有方法。
> - `@Around` 里**忘记调用 `proceed()`** 会导致目标方法不执行；**吞掉异常**会导致上层感知不到错误。

> 💡 **提示：** AOP 是「对业务逻辑的横向增强」，应该保持切面**轻量、专注**。复杂的业务分支判断不该写在切面里，那是业务代码的职责。

---

### 十、总结

- **AOP 解决横切关注点**：把日志、事务等散落各处的逻辑统一管理。
- **核心三要素**：切面（封装）、切点（在哪做）、通知（做什么）。
- **五种通知**：`@Before` / `@After` / `@AfterReturning` / `@AfterThrowing` / `@Around`（最强大）。
- **切入点**：`execution` 按方法签名匹配，`@annotation` 按注解匹配（更优雅）。
- **底层是动态代理**：有接口用 JDK 代理，无接口用 CGLIB；自调用和私有方法不生效。

下一篇，AOP 的最重要应用——声明式事务：[[Spring事务管理]]。
