# 设计模式在 JDK 和 Spring 中的应用

> 参考资源：
> - [菜鸟教程 - 设计模式](https://www.runoob.com/design-pattern/design-pattern-tutorial.html)
> - [Refactoring.Guru - 设计模式](https://refactoring.guru/zh/design-patterns)

---

## 一、设计模式在 JDK 中的应用

设计模式不是空中楼阁，它广泛存在于 JDK 源码中。带着「这里用了什么模式」的视角阅读源码，会发现框架设计「豁然开朗」。

### 创建型模式

| 模式 | JDK 中的应用 | 说明 |
| --- | --- | --- |
| **单例** | `Runtime.getRuntime()` | 运行时对象，全局唯一 |
| **单例** | `System.in` / `System.out` / `System.err` | 标准 IO 流，全局唯一 |
| **工厂方法** | `Calendar.getInstance()` | 根据时区/语言环境创建不同实例 |
| **工厂方法** | `LoggerFactory.getLogger()` | 创建日志器 |
| **工厂方法** | `NumberFormat.getInstance()` | 创建数字格式化器 |
| **抽象工厂** | `java.sql.Connection` | 创建 Statement、PreparedStatement 等 |
| **抽象工厂** | `DocumentBuilderFactory` | 创建 XML 解析器 |
| **建造者** | `StringBuilder` / `StringBuffer` | 链式 append 构建字符串 |
| **建造者** | `Stream.Builder` | 构建 Stream |
| **建造者** | `Locale.Builder` | 构建 Locale 对象 |
| **原型** | `Object.clone()` | 克隆对象 |
| **原型** | `ArrayList.clone()` | 浅拷贝列表 |

### 结构型模式

| 模式 | JDK 中的应用 | 说明 |
| --- | --- | --- |
| **适配器** | `InputStreamReader` | 字节流 → 字符流 |
| **适配器** | `OutputStreamWriter` | 字节流 → 字符流 |
| **适配器** | `Arrays.asList()` | 数组 → List |
| **装饰器** | Java IO 流体系 | `FilterInputStream` → `BufferedInputStream` |
| **装饰器** | `Collections.synchronizedList()` | 给 List 加同步功能 |
| **装饰器** | `Collections.unmodifiableList()` | 给 List 加只读功能 |
| **代理** | `Proxy.newProxyInstance()` | JDK 动态代理 |
| **外观** | `Logger`（SLF4J） | 统一日志接口 |
| **享元** | `Integer.valueOf()` | `-128~127` 缓存 |
| **享元** | `String` 常量池 | 相同字符串共享 |
| **享元** | `Boolean.valueOf()` | TRUE/FALSE 静态享元 |
| **组合** | `java.awt.Container` | Swing/AWT 组件树 |
| **桥接** | JDBC `DriverManager` | Driver 接口与具体实现分离 |

### 行为型模式

| 模式 | JDK 中的应用 | 说明 |
| --- | --- | --- |
| **策略** | `Comparator` | 比较策略可替换 |
| **策略** | `RejectedExecutionHandler` | 线程池拒绝策略 |
| **模板方法** | `AbstractList` | `addAll` 模板方法 |
| **模板方法** | `HttpServlet.service()` | 根据请求方法分发 |
| **模板方法** | `InputStream.read(byte[], int, int)` | 模板方法 |
| **观察者** | `PropertyChangeListener` | 属性变化监听 |
| **观察者** | AWT 事件监听器 | `ActionListener`、`MouseListener` |
| **责任链** | `FilterChain` | Servlet 过滤器链 |
| **命令** | `Runnable` / `Callable` | 任务封装成对象 |
| **迭代器** | `java.util.Iterator` | 集合遍历 |
| **状态** | `Thread` 状态流转 | NEW → RUNNABLE → TERMINATED |
| **备忘录** | `Serializable` | 序列化保存/恢复状态 |
| **解释器** | `java.util.regex.Pattern` | 正则表达式解释器 |

---

## 二、设计模式在 Spring 中的应用

Spring 是设计模式的「百科全书」，几乎用到了所有 GoF 23 种模式。

### 核心模式

| 模式 | Spring 中的应用 | 说明 |
| --- | --- | --- |
| **单例** | Bean 默认作用域 `singleton` | 容器中 Bean 默认单例 |
| **工厂** | `BeanFactory` / `ApplicationContext` | Bean 的创建和管理 |
| **工厂** | `FactoryBean` 接口 | 自定义 Bean 创建逻辑 |
| **代理** | AOP（JDK 动态代理 / CGLIB） | 事务、日志、权限 |
| **模板方法** | `JdbcTemplate` | 封装 JDBC 流程 |
| **模板方法** | `RestTemplate` | HTTP 请求模板 |
| **模板方法** | `TransactionTemplate` | 事务管理模板 |
| **观察者** | `ApplicationEvent` + `ApplicationListener` | 事件机制 |
| **责任链** | `HandlerInterceptor` | 拦截器链 |
| **责任链** | Spring Security 过滤器链 | 认证、授权、CSRF |
| **适配器** | `HandlerAdapter` | 适配不同类型 Controller |
| **装饰器** | `BeanWrapper` | Bean 属性编辑 |
| **策略** | `Resource` 接口 | 不同资源加载策略 |
| **策略** | `InstantiationStrategy` | Bean 实例化策略 |
| **中介者** | `DispatcherServlet` | 中介所有组件 |
| **命令** | `MethodInvocation` | AOP 方法调用封装 |

### 详细解析

#### 1. 单例模式 —— Bean 默认作用域

```java
// Spring 容器中默认 scope=singleton
@Component
public class UserService { }  // 容器中只有一个实例

// 获取的是同一个实例
UserService s1 = context.getBean(UserService.class);
UserService s2 = context.getBean(UserService.class);
// s1 == s2  → true
```

#### 2. 工厂模式 —— BeanFactory

```java
// Spring 的 BeanFactory 就是工厂
BeanFactory factory = new ClassPathXmlApplicationContext("beans.xml");
UserService service = factory.getBean("userService", UserService.class);
```

#### 3. 代理模式 —— Spring AOP

```java
// Spring AOP 底层是动态代理
// 目标有接口 → JDK 动态代理
// 目标无接口 → CGLIB 动态代理

@Service
public class UserService {
    @Transactional  // 事务代理
    public void save() { ... }
}
```

#### 4. 模板方法 —— JdbcTemplate

```java
// JdbcTemplate 封装了 JDBC 的固定流程
jdbcTemplate.query("SELECT * FROM user", (rs, rowNum) -> {
    // 只需要处理结果集，其他由模板处理
    return new User(rs.getString("name"));
});
```

#### 5. 观察者 —— Spring 事件

```java
// 发布事件
applicationEventPublisher.publishEvent(new OrderCreatedEvent(this, orderId));

// 监听事件
@EventListener
public void onOrderCreated(OrderCreatedEvent event) { ... }
```

#### 6. 责任链 —— HandlerInterceptor

```java
// Spring MVC 拦截器链
public boolean preHandle(HttpServletRequest request, ...) {
    // 返回 true 继续执行，false 中断
    return true;
}
```

---

## 三、设计模式在主流框架中的应用

### MyBatis

| 模式 | 应用 |
| --- | --- |
| 代理 | Mapper 接口代理（接口无实现类，运行时动态代理） |
| 工厂 | `SqlSessionFactory` 创建 `SqlSession` |
| 建造者 | `SqlSessionFactoryBuilder` |
| 模板方法 | `BaseExecutor` 定义查询流程 |
| 装饰器 | Cache 装饰器链（LRU、FIFO、SOFT、WEAK） |

### Netty

| 模式 | 应用 |
| --- | --- |
| 责任链 | `ChannelPipeline` —— 处理器链 |
| 工厂 | `ChannelFactory` 创建 Channel |
| 观察者 | `ChannelFutureListener` —— 异步回调 |
| 单例 | `InternalLoggerFactory` |

### Hibernate

| 模式 | 应用 |
| --- | --- |
| 代理 | 延迟加载（实体对象的关联属性用代理） |
| 工厂 | `SessionFactory` 创建 `Session` |
| 模板方法 | `AbstractEntityManagerImpl` |
| 状态 | 实体对象状态（transient、persistent、detached） |

---

## 四、阅读源码的学习建议

1. **带着模式视角读源码** —— 看到某个类/接口，思考「这里用了什么模式」。
2. **从简单到复杂** —— 先看 JDK 集合框架，再看 Spring 核心，最后看 Netty。
3. **画类图** —— 把源码中的类关系画成 UML 类图，加深理解。
4. **对比不同框架** —— 同一个模式在不同框架中的实现有何异同。
5. **动手实践** —— 模仿源码中的模式，写自己的小框架。

---

## 五、总结

| 维度 | 要点 |
| --- | --- |
| **JDK** | IO 流（装饰器）、集合（迭代器、模板方法）、多线程（命令、策略） |
| **Spring** | Bean 生命周期（工厂+单例）、AOP（代理+责任链）、事件（观察者） |
| **MyBatis** | Mapper 代理（代理模式）、SqlSession 工厂（工厂模式） |
| **Netty** | Pipeline（责任链）、Future 回调（观察者） |

> 💡 **提示：** 阅读框架源码时，带着「这里用了什么模式」的视角去看，会发现框架设计「豁然开朗」。这也是阅读优秀源码训练设计感的高效方法。
