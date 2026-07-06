### 一、概述

> 📖 [Spring Core - The IoC Container](https://docs.spring.io/spring-framework/reference/core/beans.html)

**IoC（Inversion of Control，控制反转）** 和 **DI（Dependency Injection，依赖注入）** 是整个 Spring 体系的灵魂。理解了它俩，后面的 Boot、Cloud 都会顺理成章。

大白话：
- **IoC**——把「创建对象」的权力，从你的代码手里**交出去**，交给 Spring 容器。
- **DI**——容器创建好对象后，自动把对象**需要的东西（依赖）塞进去**。

> 💡 **类比：** 以前你去饭店吃饭，得自己进后厨炒菜（自己 `new` 对象）；现在你只管点单，后厨（Spring 容器）做好菜，服务员（DI）把菜端到你桌上。你只管「用」，不管「造」。

| 你将学到 | 说明 |
| --- | --- |
| IoC 与 DI 到底是什么 | 概念 + 它俩的关系 |
| IoC 容器 | BeanFactory 与 ApplicationContext |
| 如何把对象交给 Spring 管 | `@Component` 系列 + `@Configuration` |
| 纯注解写法 | 启动一个容器并完成注入 |

> 📌 本文是 [[Spring全家桶总览]] 的第一站，也是 [[Bean详解]]、[[依赖注入]] 的基础。

---

### 二、核心概念：为什么要「控制反转」

#### 1. 传统写法的痛点

看一段「传统」Java 代码——Service 里直接 `new` 一个 Dao：

```java
public class UserService {
    // ❌ 传统写法：自己 new，Service 和 UserDaoImpl 死死绑死
    private UserDao userDao = new UserDaoImpl();

    public User findUser(Long id) {
        return userDao.findById(id);
    }
}
```

问题在于：**Service 既要管业务，又要管「Dao 用哪个实现」**。哪天想换成 `UserDaoMysqlImpl`，必须改 Service 代码——这就是「**高耦合**」。

#### 2. IoC 怎么解决

IoC 的思路是：**Service 只声明「我需要一个 UserDao」，具体用哪个实现，由容器决定**。

```java
@Service
public class UserService {
    private final UserDao userDao;

    // ✅ IoC 写法：通过构造器告诉容器「我需要 UserDao」，容器会自动注入
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }

    public User findUser(Long id) {
        return userDao.findById(id);
    }
}
```

「**控制权反转**」体现在：从「**我主动 new**」反转成「**别人（容器）给我**」。

#### 3. IoC 与 DI 的关系

很多人把两者混着说，其实有侧重：

| | IoC（控制反转） | DI（依赖注入） |
| --- | --- | --- |
| 是什么 | 一种**思想**：对象创建权交出去 | 一种**手段**：把依赖塞给对象 |
| 关注点 | 「谁来创建」 | 「怎么给过去」 |
| 关系 | IoC 是目标 | DI 是实现 IoC 的方式 |

> 💡 **一句话：** IoC 是「思想」，DI 是「落地这个思想的手段」。Spring 通过 DI 实现了 IoC。

---

### 三、IoC 容器：BeanFactory 与 ApplicationContext

容器就是那个「负责创建、管理、装配对象」的大管家。Spring 提供两种容器：

| 对比 | `BeanFactory` | `ApplicationContext` |
| --- | --- | --- |
| 定位 | IoC 容器的**顶层接口** | `BeanFactory` 的**子接口**，功能更全 |
| 创建时机 | **懒加载**（用到才创建 Bean） | **预加载**（启动时就把单例 Bean 都创建好） |
| 功能 | 最基础 | 国际化、事件、AOP、注解支持…… |
| 使用场景 | 资源极度受限（很少用） | **日常开发都用它** |

> ⚠️ **注意：** 平时说的「Spring 容器」默认指 `ApplicationContext`。`BeanFactory` 主要是底层接口，几乎不直接用。

在 Spring Boot 里，启动时会自动创建 `ApplicationContext`，我们一般不手动 new。但为了理解原理，下面用纯注解手动启动一个容器。

---

### 四、如何把对象交给 Spring 管理

被 Spring 容器管理的对象，叫 **Bean**。声明 Bean 有两种主流方式。

#### 方式一：组件扫描 + `@Component` 系列（最常用）

给类打上注解，Spring 扫描到它就注册成 Bean。Spring 按三层架构提供了语义化的注解：

| 注解 | 用在哪 | 语义 |
| --- | --- | --- |
| `@Controller` | 控制层 | 处理 HTTP 请求 |
| `@Service` | 业务层 | 业务逻辑 |
| `@Repository` | 数据访问层 | 操作数据库（额外包了数据库异常转换） |
| `@Component` | 通用组件 | 不属于上面三类的通用 Bean |

> 💡 **提示：** 它们底层都是 `@Component`，功能等价，区别只在**语义**——用对注解能让代码「见名知意」。

要让 Spring 扫描到这些类，需要开启扫描：

```java
@Configuration
@ComponentScan("com.example.service")  // 告诉 Spring 去这个包下找 @Component
public class AppConfig {
}
```

#### 方式二：`@Configuration` + `@Bean`（适合第三方库）

第三方库的类（比如 `RestTemplate`）你改不了源码、没法加 `@Component`，这时就用 `@Bean` 方法：

```java
@Configuration
public class AppConfig {

    // 方法返回的对象会被注册成 Bean，方法名 restTemplate 就是 Bean 的名字
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

> 💡 **提示：** `@Bean` 用来「**引入外部对象**」，`@Component` 用来「**标记自己的类**」，两者配合使用。

---

### 五、一个完整的纯注解示例

下面用「最原始」的方式手动启动容器，看清 IoC/DI 到底怎么运作（Spring Boot 里这些都自动化了，但原理一致）：

```java
// ① 定义接口
public interface UserDao {
    User findById(Long id);
}

// ② 实现类，打上 @Repository，交给 Spring 管理
@Repository
public class UserDaoImpl implements UserDao {
    @Override
    public User findById(Long id) {
        // 实际从数据库查
        return new User(id, "张三");
    }
}

// ③ Service，通过构造器声明依赖（推荐方式）
@Service
public class UserService {
    private final UserDao userDao;

    // 容器会自动把 UserDao 的 Bean 注入进来
    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }

    public User findUser(Long id) {
        return userDao.findById(id);
    }
}

// ④ 配置类：开启组件扫描
@Configuration
@ComponentScan("com.example")
public class AppConfig {
    public static void main(String[] args) {
        // ⑤ 启动容器
        ApplicationContext context =
            new AnnotationConfigApplicationContext(AppConfig.class);

        // ⑥ 从容器里取出 UserService，它的依赖已被自动注入
        UserService userService = context.getBean(UserService.class);
        System.out.println(userService.findUser(1L));  // User{id=1, name='张三'}
    }
}
```

执行流程：

```
启动容器
  │
  ├─ @ComponentScan 扫描 com.example 包
  │     ├─ 发现 @Repository 的 UserDaoImpl → 注册为 Bean
  │     └─ 发现 @Service 的 UserService    → 注册为 Bean
  │
  ├─ 创建 UserService 时，发现构造器需要 UserDao
  │     └─ DI：从容器里找到 UserDaoImpl，注入进去（依赖注入）
  │
  └─ getBean(UserService.class) → 拿到装配好的对象
```

---

### 六、实际应用场景

1. **三层架构解耦**：Controller 依赖 Service，Service 依赖 Dao，全部用构造器注入，换实现只改配置不改业务代码。详见 [[依赖注入]]。
2. **整合第三方框架**：MyBatis、Redis 客户端等，都是通过 `@Bean` 或自动配置注册进容器，业务层直接注入使用。
3. **统一管理单例**：数据库连接池、HTTP 客户端等「全局唯一、创建昂贵」的对象，交给容器以单例管理，避免重复创建。
4. **AOP 的基础**：Spring 能在 Bean 创建时给它套代理（实现事务、日志），前提是对象得是容器管理的 Bean。见 [[AOP面向切面]]、[[Spring事务管理]]。

---

### 七、常见问题与注意事项

> ⚠️ **注意：**
> - **自己 `new` 出来的对象，Spring 不管它**——它的 `@Autowired` 注入、`@Transactional` 事务都会失效。要用就用容器里的 Bean。
> - Bean 名字默认是类名首字母小写（`UserServiceImpl` → `userServiceImpl`）。
> - `@ComponentScan` 不写包名时，默认扫描**配置类所在的包及其子包**。所以启动类一般放在根包下。

> 💡 **提示：** 依赖注入有三种写法（构造器、Setter、字段），**强烈推荐构造器注入**——原因和循环依赖有关，详见 [[依赖注入]]。

---

### 八、总结

- **IoC**：把创建对象的控制权交给 Spring 容器。
- **DI**：容器自动把依赖塞给对象，是 IoC 的落地手段。
- **容器**：日常用 `ApplicationContext`，它预加载单例 Bean。
- **声明 Bean**：`@Component` 系列标记自己的类，`@Bean` 引入第三方对象。
- **核心价值**：解耦——对象只管「用」，不管「造」和「找谁」。

下一篇，深入 Bean 本身：[[Bean详解]]。
