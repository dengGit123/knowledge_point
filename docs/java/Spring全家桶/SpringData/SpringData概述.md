### 一、概述

> 📖 [Spring Data 官方项目](https://spring.io/projects/spring-data) ｜ [Spring Data 参考文档](https://docs.spring.io/spring-data/commons/reference/)

**Spring Data** 是 Spring 官方为**数据访问层**打造的「全家桶中的全家桶」。它把关系型数据库、Redis、MongoDB、Elasticsearch、Elasticsearch 等各种数据源的访问方式，统一抽象成同一套编程模型——目标是**消灭数据访问层的样板代码**。

大白话：以前用 JDBC，你得自己写连接、写 SQL、写结果映射、写分页、写 try-catch 关资源……同样的增删改查逻辑，每个实体都要抄一遍。Spring Data 的核心卖点是：**你只要定义一个接口（连实现都不用写），Spring Data 在运行时帮你把实现类生成出来。**

> 💡 **提示：** Spring Data 是一组项目的统称，下面针对不同数据源有不同的子项目，最常用的是 **Spring Data JPA**（关系型）和 **Spring Data Redis**（缓存）。本文是总览，深度实战见 [[SpringDataJPA]] 和 [[SpringDataRedis]]。

---

### 二、核心抽象：Repository 接口体系

Spring Data 的统一入口是 `Repository` 接口。它本身是个**空标记接口**（Marker Interface），真正的能力由父→子一层层累加。理解下面这张继承图，就理解了 Spring Data 的「开箱即用」从哪来：

```
                ┌──────────────────────────┐
                │  Repository<T, ID>        │  ← 顶层标记接口（空的，只是声明「我是一个仓库」）
                └─────────────┬────────────┘
                              │ 继承
              ┌───────────────▼──────────────┐
              │  CrudRepository<T, ID>        │  ← 加了「增删改查」：save / findById / findAll / delete ...
              └───────────────┬──────────────┘
                              │ 继承
              ┌───────────────▼──────────────┐
              │  PagingAndSortingRepository   │  ← 加了「分页 + 排序」：findAll(Sort) / findAll(Pageable)
              └───────────────┬──────────────┘
                              │ 继承（JPA 子项目独有）
              ┌───────────────▼──────────────┐
              │  JpaRepository<T, ID>         │  ← 再加 JPA 专属：flush / saveAndFlush / findAll(Sort) ...
              └──────────────────────────────┘

        T   = 实体类型（如 User）
        ID  = 主键类型（如 Long）
```

| 接口 | 所在包 | 加了什么能力 | 典型方法 |
| --- | --- | --- | --- |
| `Repository` | `org.springframework.data.repository` | 标记接口，无方法 | （无） |
| `CrudRepository` | 同上 | 基本 CRUD | `save`、`findById`、`findAll`、`deleteById` |
| `PagingAndSortingRepository` | 同上 | 分页 + 排序 | `findAll(Pageable)`、`findAll(Sort)` |
| `JpaRepository` | `org.springframework.data.jpa.repository` | JPA 专属扩展 | `saveAndFlush`、`flush`、`findAll(Sort)` |

> 💡 **提示：** 日常用 JPA 时，**直接继承 `JpaRepository` 就够了**——它已经把上面三层的能力全继承了。Redis、MongoDB 等子项目各有自己的仓库体系，但思想一致。

用法演示：定义接口，**不写实现类**：

```java
// ✅ 只定义接口，Spring Data 启动时自动用动态代理生成实现类并注入容器
public interface UserRepository extends JpaRepository<User, Long> {
    // 继承下来就有：save / findById / findAll / deleteById ...
}

// 在 Service 里直接注入使用
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;   // 接口被自动实现了

    public User getOne(Long id) {
        return userRepository.findById(id).orElse(null);   // ✅ 不用写 SQL
    }
}
```

> ⚠️ **注意：** `Repository<T, ID>` 的两个泛型参数不能填错：第一个是**实体类**，第二个是**主键类型**。填反了启动期就会报错。

---

### 三、最大卖点：方法名派生查询

这是 Spring Data 最让人惊艳的能力：**你只要按规则定义方法名，Spring Data 会自动把它翻译成 SQL**，依然不用写实现。

#### 1. 关键字 → SQL 的翻译规则

方法名以 `findBy` / `getBy` / `readBy` / `countBy` / `existsBy` / `deleteBy` 开头，后面接**实体属性名 + 查询关键字**：

| 方法名 | 翻译出的 WHERE 条件 |
| --- | --- |
| `findByUsername(String name)` | `WHERE username = ?` |
| `findByAgeGreaterThan(int age)` | `WHERE age > ?` |
| `findByUsernameAndAge(String n, int a)` | `WHERE username = ? AND age = ?` |
| `findByUsernameOrEmail(String n, String e)` | `WHERE username = ? OR email = ?` |
| `findByAgeBetween(int a, int b)` | `WHERE age BETWEEN ? AND ?` |
| `findByUsernameLike(String k)` | `WHERE username LIKE ?` |
| `findByAgeGreaterThanEqualOrderByIdDesc(int a)` | `WHERE age >= ? ORDER BY id DESC` |
| `findByUsernameIsNull()` | `WHERE username IS NULL` |
| `findByUsernameIn(List<String> names)` | `WHERE username IN (...)` |
| `existsByUsername(String n)` | `SELECT count(*) > 0 ... WHERE username = ?` |

> 💡 **提示：** 完整关键字列表见 [Spring Data JPA - Query Creation](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)。常见的 `And/Or/Between/IsNull/In/OrderBy` 基本能覆盖 80% 日常查询。

#### 2. 代码示例

```java
public interface UserRepository extends JpaRepository<User, Long> {

    // ✅ 按用户名查
    User findByUsername(String username);

    // ✅ 查年龄大于某个值的用户，并按 id 倒序
    List<User> findByAgeGreaterThanOrderByIdDesc(int age);

    // ✅ 用户名 + 年龄组合查询
    List<User> findByUsernameAndAgeGreaterThan(String username, int age);

    // ✅ 判断某个用户名是否已存在（返回 boolean）
    boolean existsByUsername(String username);

    // ❌ 错误：属性名拼错了（实体里没有 userNeme），启动期直接报错
    // User findByUserNeme(String n);
}
```

> ⚠️ **注意：** 方法名里的属性名必须**和实体类字段严格对应**（大小写敏感）。写错了不会编译报错，但**项目启动时**会抛 `PropertyReferenceException`。这是方法名查询唯一的坑。

复杂查询（动态条件、聚合、原生 SQL）方法名会变得很长很难读，这时改用 `@Query` 注解，详见 [[SpringDataJPA]]。

---

### 四、子项目一览

Spring Data 是「伞形项目（Umbrella Project）」，下面挂了很多针对不同数据源的子项目，API 风格高度一致：

| 子项目 | 适用数据源 | 典型场景 | 入门难度 |
| --- | --- | --- | --- |
| **Spring Data JPA** | 关系型数据库（MySQL / PG / Oracle） | 业务系统的持久层主力 | 中 |
| **Spring Data JDBC** | 关系型数据库（轻量） | 不想要 JPA 的「魔法」，又想要 Spring Data 的简洁 | 低 |
| **Spring Data Redis** | Redis（K-V 缓存） | 缓存、分布式锁、计数器、排行榜 | 低 |
| **Spring Data MongoDB** | MongoDB（文档型 NoSQL） | 内容存储、日志、灵活 Schema | 中 |
| **Spring Data Elasticsearch** | Elasticsearch（搜索引擎） | 全文检索、日志分析、商品搜索 | 中高 |
| **Spring Data for Apache Cassandra** | Cassandra（列式 NoSQL） | 海量写入、时序数据 | 高 |
| **Spring Data R2DBC** | 关系型（响应式） | 响应式 + 高并发 I/O | 高 |

> 💡 **提示：** 后端日常 90% 的场景，会 **JPA + Redis** 两个就够了。MongoDB / Elasticsearch 在特定业务（搜索、大数据量文档）时再上。

---

### 五、与 MyBatis 的定位对比

国内 Java 后端最常用的两个持久层方案，正好是两个极端——**Spring Data JPA 是「全自动 ORM」，MyBatis 是「半自动 SQL 映射」**。

| 对比维度 | Spring Data JPA（自动） | MyBatis（半自动） |
| --- | --- | --- |
| SQL 由谁写 | **框架自动生成** | **程序员手写**（XML / 注解） |
| 样板代码 | 极少，定义接口即可 | 中等，要写 SQL + 映射 |
| 学习曲线 | 中（要懂实体关系映射） | 低（会 SQL 就行） |
| 复杂查询 | 方法名会变长，复杂 SQL 要 `@Query` | **强项**，复杂 SQL 写起来清晰可控 |
| 性能调优 | 较难（SQL 不可见，易踩 N+1） | **强项**，SQL 全透明 |
| 适合场景 | CRUD 多、模型规整的业务 | 复杂报表、多表联查、SQL 性能要求高 |
| 国内主流度 | 中 | **高**（互联网公司多用） |

大白话对比：

- **JPA** 像自动挡汽车——简单省心，踩油门就走，但你没法手动换挡。
- **MyBatis** 像手动挡——油离配合自己来，累一点，但复杂路况（复杂 SQL）操控更精准。

> ⚠️ **注意：** 不要陷入「谁更好」的争论。**JPA 适合模型清晰、CRUD 为主的业务；MyBatis 适合 SQL 复杂、性能敏感的系统。** 很多公司其实是两者混用——核心业务用 MyBatis，简单配置表用 JPA。底层都是 JDBC（见 [[../../操作数据库/JDBC基础]]）。

---

### 六、Spring Data 解决了什么痛点

回顾一下，Spring Data 的价值可以浓缩成三句话：

```
1. 消灭样板代码  ——  不用写 Repository 的实现类，接口即实现
2. 统一数据访问  ——  JPA / Redis / MongoDB ... 同一套编程模型
3. 声明式查询    ——  方法名 / 注解，框架自动生成 SQL
```

对应到 JDBC 时代的痛点（见 [[../../操作数据库/JDBC基础]]）：

| JDBC 时代要手写 | Spring Data 时代 |
| --- | --- |
| 获取连接、关资源 | 框架自动管理 |
| 拼接 SQL、setXxx 参数 | 方法名查询 / `@Query` |
| ResultSet → 对象映射 | 自动 ORM 映射 |
| 分页逻辑（limit / offset） | 一个 `Pageable` 参数搞定 |
| 事务管理 | `@Transactional` 声明式 |

---

### 七、本子目录文档导航

| 文档 | 知识点 |
| --- | --- |
| **本文（Spring Data 概述）** | 总览、Repository 体系、方法名查询、子项目对比 |
| [[SpringDataJPA]] | JPA 实体映射、Repository、三种查询、分页、N+1 问题 |
| [[SpringDataRedis]] | RedisTemplate、序列化、五大结构操作、缓存与分布式锁 |

---

### 八、总结

- **Spring Data 是数据访问层的统一抽象**：一份编程模型适配多种数据源。
- **核心是 `Repository` 接口体系**：`Repository → CrudRepository → PagingAndSortingRepository → JpaRepository`，能力逐层累加。
- **最大卖点是方法名派生查询**：定义 `findByXxx`，自动生成 SQL，不用写实现。
- **子项目分工**：JPA 管关系型、Redis 管缓存、MongoDB 管文档、Elasticsearch 管搜索。
- **与 MyBatis 是互补关系**：JPA 自动省心，MyBatis 精准可控，按场景选。

下一篇，深入最常用的关系型方案：[[SpringDataJPA]]。
