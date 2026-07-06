### 一、概述

> 📖 [Spring Core - Beans Overview](https://docs.spring.io/spring-framework/reference/core/beans/definition.html)

**Bean**，就是被 Spring IoC 容器创建和管理的对象。上一篇 [[IoC与DI]] 讲了「为什么要把对象交给容器」，这篇讲「**Bean 本身长什么样、怎么造出来、活多久**」。

大白话：Bean 就像是容器这个「大工厂」里生产出来的零件——有的零件全厂只有一份（单例），有的每次要都现做一个（原型）；有的零件用默认工艺造，有的要指定特殊工艺。

| 你将学到 | 说明 |
| --- | --- |
| Bean 的本质 | 容器里的「注册对象」 |
| 三种实例化方式 | 构造器 / 静态工厂 / 实例工厂 |
| Bean 的作用域 | singleton、prototype 等 |
| 单例与多例的陷阱 | 单例里注入原型会失效 |

> 📌 本文承接 [[IoC与DI]]，并和 [[依赖注入]]、[[Spring事务管理]] 紧密相关。

---

### 二、什么是 Bean

一个普通的 Java 对象，一旦被容器接管，就成了 Bean：

```java
// 普通类
public class User {
    private String name;
    // 构造器、getter/setter...
}

// 被容器管理后 → 它就是一个 Bean
@Component
public class User {
    // ...
}
```

Bean 和普通对象的根本区别：**Bean 的生老病死（创建、初始化、销毁）都由容器说了算**，而不是你 `new` 出来就归你管。

---

### 三、Bean 的三种实例化方式

「实例化」就是「容器怎么把这个 Bean 造出来」。有三种方式。

#### 1. 构造器实例化（最常用，默认）

容器直接调用类的**无参构造器**（或唯一构造器）创建对象：

```java
@Component
public class UserService {
    // 容器直接 new UserService() 创建
    public UserService() { }
}
```

99% 的情况都用这种。这也是为什么 Spring 要求 Bean 至少有一个可访问的构造器。

#### 2. 静态工厂实例化（适合整合老代码）

通过一个类的**静态方法**返回对象：

```java
// 老式的静态工厂
public class ConnectionFactory {
    public static Connection createConnection() {
        return DriverManager.getConnection("jdbc:mysql://...");
    }
}
```

```java
@Configuration
public class AppConfig {
    // 调用静态工厂方法，返回值注册为 Bean
    @Bean
    public Connection connection() {
        return ConnectionFactory.createConnection();
    }
}
```

#### 3. 实例工厂实例式（工厂本身也是对象）

工厂方法是**实例方法**，得先有工厂对象：

```java
// 实例工厂（非静态）
public class ClientFactory {
    public HttpClient createClient() {
        return HttpClient.newBuilder().build();
    }
}
```

```java
@Configuration
public class AppConfig {
    @Bean
    public ClientFactory clientFactory() {       // 先注册工厂本身
        return new ClientFactory();
    }

    @Bean
    public HttpClient httpClient(ClientFactory factory) {  // 调用实例方法
        return factory.createClient();
    }
}
```

| 方式 | 谁来创建 | 适用场景 |
| --- | --- | --- |
| 构造器 | 容器直接 new | **自己的类，默认首选** |
| 静态工厂 | 调用静态方法 | 整合老框架（如老版本数据库工厂） |
| 实例工厂 | 调用实例方法 | 工厂需要先做配置才能生产 |

> 💡 **提示：** 现代项目基本只用构造器方式。后两种主要在维护遗留代码或对接老框架时才会遇到。

---

### 四、Bean 的作用域（Scope）

作用域决定了「**容器造几份这个 Bean**」。用 `@Scope` 注解指定：

```java
@Component
@Scope("prototype")   // 改为多例
public class PrototypeBean { }
```

| 作用域 | 说明 | 典型场景 |
| --- | --- | --- |
| `singleton`（**默认**） | 整个容器**只有一份** | 无状态的服务、Dao、工具类 |
| `prototype` | **每次获取都新建一份** | 有状态的对象（如每次请求独立的数据载体） |
| `request` | 每个 HTTP 请求一份（Web 环境） | 请求级别的数据 |
| `session` | 每个 HTTP Session 一份（Web 环境） | 用户会话信息 |
| `application` | 每个 `ServletContext` 一份 | 全局应用级数据 |

### singleton vs prototype 的关键差异

```
singleton（单例）：
  getBean() ──► 每次返回【同一个对象】
  容器启动时就创建（预加载）

prototype（多例）：
  getBean() ──► 每次返回【新对象】
  获取时才创建（懒加载），创建后容器就不管它了
```

> ⚠️ **注意：** `prototype` 的 Bean 创建后交给调用方，**容器不会调用它的销毁方法**——生命周期管理责任转移给调用方。

---

### 五、经典陷阱：单例里注入原型会失效

看一个常见错误：单例 Service 里注入一个 prototype 的 Bean，期望「每次用它都是新对象」。

```java
@Service  // 默认 singleton
public class OrderService {

    @Autowired
    @Scope("prototype")
    private OrderContext orderContext;  // ❌ 期望每次都新，实际永远同一个

    public void process() {
        orderContext.reset();
        // 多次调用 process()，orderContext 其实是同一个对象，状态会串！
    }
}
```

**原因**：`OrderService` 是单例，容器只在它创建时注入**一次** `orderContext`，之后都是同一个对象——`prototype` 的「每次新建」失效了。

#### 正确解法：用 `ObjectFactory` / `Provider`

```java
@Service
public class OrderService {

    @Autowired
    private ObjectFactory<OrderContext> orderContextFactory;  // ✅ 注入工厂而非实例

    public void process() {
        // 每次调用都从工厂拿到【全新】的 prototype Bean
        OrderContext ctx = orderContextFactory.getObject();
        ctx.reset();
        // ...
    }
}
```

> 💡 **记忆：** 单例里的 `prototype` 注入是「一次性」的。要「每次都新」，得注入工厂（`ObjectFactory` / `Provider`）。

---

### 六、Bean 的命名

Bean 默认名字 = **类名首字母小写**：

| 类 | 默认 Bean 名 |
| --- | --- |
| `UserServiceImpl` | `userServiceImpl` |
| `UserController` | `userController` |

可以在注解里自定义名字：

```java
@Service("primaryUserService")   // 自定义 Bean 名
public class UserServiceImpl implements UserService { }
```

当**一个接口有多个实现**时，靠 Bean 名区分注入哪个——这就是 `@Qualifier` 的用武之地，详见 [[依赖注入]]。

---

### 七、实际应用场景

1. **无状态服务用单例**：`UserService`、`UserDao` 不持有可变状态，全应用共享一份，省内存。
2. **有状态对象用原型**：比如每次计算都需要的中间结果载体，用 `prototype` 避免状态污染。
3. **Web 请求级数据**：当前登录用户、请求 traceId，用 `request` 作用域，每个请求独立。
4. **整合第三方库**：用 `@Bean` + 工厂方法，把第三方的客户端、连接池注册成单例 Bean。

---

### 八、常见问题与注意事项

> ⚠️ **注意：**
> - 单例 Bean **不要持有可变的共享状态**（如实例字段做计数器），并发下会有线程安全问题。需要状态就加 `prototype` 或用局部变量。
> - 单例 Bean **不要直接持有 `prototype` Bean 的引用**（会失效），要用 `ObjectFactory`。
> - Bean 名字冲突会启动报错（`NoUniqueBeanDefinitionException`），用 `@Qualifier` 或自定义名字解决。

> 💡 **提示：** Bean 还有「**生命周期**」（初始化、销毁回调），那是另一个话题，核心就在「容器管它的生死」这一点上。

---

### 九、总结

- **Bean = 被容器管理的对象**，生死由容器决定。
- **实例化**：默认构造器，老代码用静态/实例工厂。
- **作用域**：默认 `singleton`（一份），`prototype` 每次新建；Web 环境还有 `request`/`session`/`application`。
- **核心陷阱**：单例里注入原型会失效 → 改用 `ObjectFactory`。
- **Bean 名**：默认类名首字母小写，可用注解自定义。

下一篇，深入依赖注入的细节与循环依赖：[[依赖注入]]。
