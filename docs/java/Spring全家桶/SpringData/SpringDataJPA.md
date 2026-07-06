### 一、概述

> 📖 [Spring Data JPA 官方参考文档](https://docs.spring.io/spring-data/jpa/reference/) ｜ [Hibernate 官方文档](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html)

**Spring Data JPA** 是 Spring Data 子项目里最常用的一个，专门用于操作**关系型数据库**。它在 JPA 规范之上，再叠加了一层 Spring Data 的「**接口即实现**」魔法——让你几乎不用写 SQL 就能完成大部分 CRUD。

先理清三个名字的关系：

```
JPA（Java Persistence API）   ← 规范（接口，只定义标准）
        │ 由谁实现？
        ▼
Hibernate                     ← JPA 的一种实现（最主流）
        │ Spring 又包了一层
        ▼
Spring Data JPA               ← 在 JPA 上加「Repository 魔法」，进一步省代码
```

大白话：**JPA 是「规定」，Hibernate 是「照规定做的人」，Spring Data JPA 是「在这人基础上又雇了个秘书帮你跑腿」。** 三者层层叠加，越往上越省事。

> 💡 **提示：** 本文假设你已经读过 [[SpringData概述]]，了解 Repository 接口体系和方法名查询。下面聚焦 JPA 的实战用法。

---

### 二、引入依赖与配置

#### 1. Maven 依赖

```xml
<!-- Spring Data JPA（自带 Hibernate 实现） -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- MySQL 驱动（运行时需要） -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

> 💡 **提示：** `spring-boot-starter-data-jpa` 已经把 Hibernate 作为默认 JPA 实现打包进来了，不用再单独引 Hibernate 的依赖。MySQL 8.x 驱动的 groupId 是 `com.mysql`，artifactId 是 `mysql-connector-j`（旧版叫 `mysql-connector-java`）。

#### 2. application.yml 配置

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=utf8
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    # 启动时根据实体自动建/更新表（开发用，生产别开）
    hibernate:
      ddl-auto: update
    # 控制台打印 SQL，方便调试
    show-sql: true
    properties:
      hibernate:
        format_sql: true          # 格式化打印的 SQL
        dialect: org.hibernate.dialect.MySQLDialect
```

| `ddl-auto` 取值 | 行为 |
| --- | --- |
| `none` | 什么都不做（**生产推荐**） |
| `validate` | 只校验实体和表结构是否一致，不改表 |
| `update` | 实体改了就自动改表（开发用） |
| `create` | 每次启动**删表重建**（慎用！数据全没） |
| `create-drop` | 启动建表、停止删表（单元测试用） |

> ⚠️ **注意：** **生产环境绝不能用 `update` / `create`**，否则可能自动改坏线上表结构或丢数据。生产用 `none` 或 `validate`，表结构变更走数据库迁移工具（Flyway / Liquibase）。

---

### 三、实体映射注解

JPA 用注解把 Java 类和数据库表对应起来。一张用户表的完整映射：

```java
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity                                   // 声明这是个 JPA 实体（对应一张表）
@Table(name = "t_user")                   // 指定表名（不写就默认用类名 User）
public class User {

    @Id                                   // 主键
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // 主键自增（MySQL）
    private Long id;

    @Column(name = "user_name", length = 50, nullable = false, unique = true)
    private String username;              // 映射到 user_name 列

    @Column                               // 不指定 name，列名默认 = 字段名 age
    private Integer age;

    @Column(length = 100)                 // 邮箱，限长
    private String email;

    @Transient                            // 标记不映射到数据库（纯内存字段）
    private String tempData;

    // 省略 getter / setter / 无参构造（JPA 要求实体有无参构造）
}
```

常用注解速查表：

| 注解 | 作用 | 说明 |
| --- | --- | --- |
| `@Entity` | 声明实体类 | 必须有，否则 JPA 不认 |
| `@Table(name=...)` | 指定表名 | 可选，不写默认用类名 |
| `@Id` | 标记主键 | 每个实体必须有且仅有一个 |
| `@GeneratedValue` | 主键生成策略 | `IDENTITY`（自增）/ `SEQUENCE` / `UUID` |
| `@Column` | 列属性 | 可设列名、长度、是否可空、是否唯一 |
| `@Transient` | 不入库 | 标记的字段不映射到表 |
| `@TableField` | （❌ 这是 **MyBatis-Plus** 的，别混用） | JPA 里没有这个注解 |

> ⚠️ **注意：** JPA 注解的包是 `jakarta.persistence.*`（Spring Boot 3 / Jakarta EE）。如果是老的 Spring Boot 2.x，包名是 `javax.persistence.*`。两个包里的注解同名但**不通用**，别引错。

---

### 四、定义 Repository 接口

只要继承 `JpaRepository`，CRUD 方法全免费：

```java
import org.springframework.data.jpa.repository.JpaRepository;

// ✅ 两个泛型：实体类型 User，主键类型 Long
public interface UserRepository extends JpaRepository<User, Long> {
    // 此处空着，下面再加自定义查询
}
```

继承后**立刻拥有**这些方法（不用写实现）：

| 方法 | 作用 |
| --- | --- |
| `save(entity)` | 新增或更新（有 id 就更新，无 id 就新增） |
| `findById(id)` | 按主键查，返回 `Optional<User>` |
| `findAll()` | 查全部 |
| `findAll(Pageable)` | 分页查询，返回 `Page<User>` |
| `count()` | 总数 |
| `deleteById(id)` | 按主键删 |
| `existsById(id)` | 是否存在 |
| `saveAll(iterable)` | 批量保存 |

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User create(User user) {
        return userRepository.save(user);              // ✅ 新增
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                             .orElse(null);            // ✅ 没找到返回 null
    }

    public void delete(Long id) {
        userRepository.deleteById(id);                 // ✅ 删除
    }
}
```

---

### 五、三种查询方式

#### 方式一：方法名查询（最简单）

按 [[SpringData概述]] 里讲的规则定义方法名，自动生成 SQL：

```java
public interface UserRepository extends JpaRepository<User, Long> {

    // WHERE username = ?
    User findByUsername(String username);

    // WHERE username = ? AND age > ?
    List<User> findByUsernameAndAgeGreaterThan(String username, int age);

    // WHERE age BETWEEN ? AND ?  ORDER BY age DESC
    List<User> findByAgeBetweenOrderByIdDesc(int min, int max);
}
```

> 💡 **提示：** 简单、固定条件的查询首选方式一。但条件一旦复杂（动态、可选条件），方法名会变成一长串，这时改用方式三的 Example 或方式二。

#### 方式二：@Query 注解（写 JPQL 或原生 SQL）

方法名搞不定时，用 `@Query` 手写查询语句。**JPQL** 是面向对象的查询语言（查的是实体和属性，不是表名和列名）：

```java
public interface UserRepository extends JpaRepository<User, Long> {

    // ✅ JPQL：查 User 实体的 username、age 属性（不是表名 t_user）
    @Query("SELECT u FROM User u WHERE u.age > :age ORDER BY u.id DESC")
    List<User> findOlderThan(@Param("age") int age);

    // ✅ 原生 SQL：nativeQuery = true，直接写 MySQL 方言
    @Query(value = "SELECT * FROM t_user WHERE email LIKE %:keyword%", nativeQuery = true)
    List<User> searchByEmail(@Param("keyword") String keyword);

    // ✅ 更新 / 删除操作必须加 @Modifying
    @Modifying
    @Query("UPDATE User u SET u.age = :age WHERE u.id = :id")
    int updateAge(@Param("id") Long id, @Param("age") int age);
}
```

| 关键点 | 说明 |
| --- | --- |
| JPQL vs SQL | JPQL 用**类名和属性名**（`User`、`u.age`）；SQL 用**表名和列名**（`t_user`、`age`） |
| 参数绑定 | `:name` 配合 `@Param("name")`，或 `?1` `?2` 用位置 |
| 原生 SQL | 加 `nativeQuery = true` |
| 更新/删除 | 必须加 `@Modifying`，且方法需在 `@Transactional` 中调用 |

> ⚠️ **注意：** `@Modifying` 的更新方法**不会清空持久化上下文（一级缓存）**，可能导致同一事务里再查到旧数据。新版可加 `@Modifying(clearAutomatically = true)` 解决。

#### 方式三：Example 动态查询（条件可选）

业务里常见的「条件填了才查、没填就不查」动态查询，用 `Example`：

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> search(User condition) {
        // 把传入的对象包成 Example
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withMatcher("username", m -> m.contains())   // username 模糊匹配
                .withIgnoreCase("email")                      // email 忽略大小写
                .withNullHandler(ExampleMatcher.NullHandler.IGNORE);  // null 字段忽略

        Example<User> example = Example.of(condition, matcher);
        return userRepository.findAll(example);
    }
}
```

```java
// 调用示例：只填了 username，就只按 username 模糊查；填了 email 再加 email 条件
User q = new User();
q.setUsername("张");          // 只设这个条件 → WHERE user_name LIKE '%张%'
List<User> result = userService.search(q);
```

> 💡 **提示：** `Example` 适合**条件可多可少**的后台列表查询。但它的局限是只能做 `= / like` 等简单匹配，**做不了 `大于、between` 这种**——那种动态查询得用 `Specification` 或 QueryDSL（进阶话题）。

---

### 六、分页与排序

JPA 的分页用 `Pageable`，排序用 `Sort`，返回 `Page<T>`：

```java
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public void listByPage() {
        // 第 0 页（页码从 0 开始），每页 10 条，按 id 倒序
        Pageable pageable = PageRequest.of(0, 10, Sort.by("id").descending());

        Page<User> page = userRepository.findAll(pageable);

        page.getContent();        // 当前页数据 List<User>
        page.getTotalElements();  // 总记录数
        page.getTotalPages();     // 总页数
        page.getNumber();         // 当前页码
        page.hasNext();           // 是否有下一页
    }
}
```

也可以把 `Pageable` 直接加到自定义方法上，分页 + 方法名查询组合用：

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // 查大于某年龄的用户，并分页
    Page<User> findByAgeGreaterThan(int age, Pageable pageable);
}
```

| 对象 | 作用 |
| --- | --- |
| `PageRequest.of(page, size)` | 构造分页参数（page 从 0 开始） |
| `PageRequest.of(page, size, Sort)` | 分页 + 排序 |
| `Sort.by("字段").descending()` | 排序规则 |
| `Page<T>` | 含数据 + 总数 + 总页数等分页信息 |

> ⚠️ **注意：** `Pageable` 的页码**从 0 开始**，不是从 1。前端传页码时要注意减一转换。

---

### 七、常见问题与注意事项

#### 1. N+1 查询问题（头号性能杀手）

场景：查 N 个订单，每个订单关联一个用户。JPA 默认懒加载关联对象，结果是**查 1 次订单列表 + 查 N 次用户 = N+1 条 SQL**，列表越大越慢。

```
❌ 触发 N+1：
SELECT * FROM orders;                 -- 1 次
SELECT * FROM users WHERE id = ?;     -- × N 次（每个订单查一次用户）
```

三种解法：

```java
// 解法 1：@Query + JOIN FETCH（一次性 join 查出来）
@Query("SELECT o FROM Order o JOIN FETCH o.user")
List<Order> findAllWithUser();

// 解法 2：@EntityGraph（声明式指定要预加载的关联）
@EntityGraph(attributePaths = {"user"})
List<Order> findAll();

// 解法 3：@BatchSize 批量加载（不是 1 次，但把 N 次降到 N/size 次）
@Entity
@org.hibernate.annotations.BatchSize(size = 50)
public class Order { ... }
```

> 💡 **提示：** 开发期建议打开 `spring.jpa.show-sql=true`，肉眼盯着有没有刷出一堆相同的 SQL——那就是 N+1。

#### 2. 懒加载与 Session 边界（LazyInitializationException）

关联字段默认懒加载，**只有在 Hibernate Session 还开着时才能查**。如果在 Controller 返回 JSON 时 Session 已关闭，访问关联对象就抛 `LazyInitializationException`。

```java
// ❌ 常见错误：Service 返回了懒加载实体，到 Controller 序列化时 Session 已关
@Transactional
public User getUser(Long id) {
    return userRepository.findById(id).get();  // user.orders 是懒加载的
}
// Controller 里 user.getOrders() → 报错：could not initialize proxy - no Session
```

解法：①在 `@Transactional` 事务内访问关联字段；②用 `JOIN FETCH` / `@EntityGraph` 提前加载；③相关的关联改成 `FetchType.EAGER`（不推荐，影响全局性能）。

#### 3. save 是新增还是更新？

`save` 会判断主键：**主键为 null → 新增（执行 INSERT）；主键有值 → 先查再更新（执行 UPDATE）**。所以千万别给「新增」的对象手动赋 id，否则会被当成更新。

#### 4. 脏检查（Dirty Checking）

被 JPA 托管的实体，**只要在事务内修改了字段，事务提交时会自动 UPDATE**，不用显式调用 `save`：

```java
@Transactional
public void rename(Long id) {
    User user = userRepository.findById(id).get();
    user.setUsername("新名字");   // ✅ 不用 save，提交时自动更新
}
```

> ⚠️ **注意：** 脏检查虽然方便，但实体一多会拖慢性能。可在实体上加 `@DynamicUpdate` 只更新变化的字段。

---

### 八、与相关概念对比

| 对比 | Spring Data JPA | MyBatis | Spring Data JDBC |
| --- | --- | --- | --- |
| 类型 | 全自动 ORM | 半自动 SQL 映射 | 轻量 ORM |
| 写 SQL | 自动生成 | 手写 | 简单的自动，复杂的手写 |
| 实体管理 | 有（脏检查、级联、懒加载） | 无 | 无（实体是纯 POJO） |
| 复杂度 | 高（魔法多） | 低 | 中 |
| 适合 | 模型规整的 CRUD 业务 | 复杂 SQL、性能敏感 | 想要 Spring Data 简洁但不要 JPA 魔法 |

详见 [[SpringData概述]] 的对比章节。

---

### 九、实际应用场景

| 场景 | 用法 |
| --- | --- |
| 用户/商品等标准 CRUD | 继承 `JpaRepository`，几乎零代码 |
| 后台列表搜索（条件可选） | `Example` + `Pageable` |
| 复杂统计/多表查询 | `@Query` 写 JPQL 或原生 SQL |
| 批量导入 | `saveAll()`，量大时配合分批 flush |
| 业务实体建模 | `@OneToMany` / `@ManyToOne` 表达关联 |

---

### 十、总结

- **JPA 是规范，Hibernate 是实现，Spring Data JPA 是省代码的封装**——三者层层叠加。
- **实体映射**用 `@Entity / @Table / @Id / @Column / @Transient`。
- **Repository** 继承 `JpaRepository` 即得全套 CRUD。
- **三种查询**：方法名（简单固定）、`@Query`（复杂 JPQL/SQL）、`Example`（动态可选条件）。
- **分页**用 `Pageable` + `Page<T>`，页码从 0 开始。
- **三大坑**：N+1 查询、懒加载 Session 边界、save 的新增/更新判断。

返回总览：[[SpringData概述]] ｜ 看 Redis 操作：[[SpringDataRedis]]。
