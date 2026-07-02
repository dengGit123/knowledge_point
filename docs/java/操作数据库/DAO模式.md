### 一、概述

> 📖 [DAO 模式（Oracle）](https://www.oracle.com/java/technologies/dataaccessobject.html)

DAO（Data Access Object，数据访问对象）是一种**设计模式**：把数据库访问的代码**封装到专门的类里**，让业务代码只管业务，不直接碰 JDBC 细节。

大白话：如果不封装，业务代码里会到处都是 `getConnection`、`prepareStatement`、`ResultSet`、`close` 这种样板代码，乱成一锅粥。DAO 模式像请一个「**专门的数据库管理员**」——业务层只要说「帮我查 id=1 的用户」，DAO 干完所有脏活累活，把干净的用户对象还给你。

| 你将学到 | 说明 |
| --- | --- |
| 为什么用 DAO | 解耦业务和数据库访问 |
| DAO 的结构 | Entity / DAO 接口 / DAO 实现 |
| BaseDao | 提取公共的增删改查模板 |
| 实战 | 完整的 UserDAO 示例 |

> 💡 **提示：** DAO 是手写 JDBC 时代的标配。MyBatis 等框架本质上就是帮你自动生成 DAO，省去样板代码。

---

### 二、为什么需要 DAO

#### 不用 DAO 的问题

```java
// ❌ 业务代码里直接写 JDBC，杂乱、重复
public class UserService {
    public User login(String name, String pwd) {
        try (Connection conn = DriverManager.getConnection(url, ...);
             PreparedStatement ps = conn.prepareStatement("SELECT ... WHERE name=?")) {
            ps.setString(1, name);
            ResultSet rs = ps.executeQuery();
            // ... 解析
        } catch (SQLException e) { ... }
        return user;
    }

    public boolean register(User u) {
        // 又是一堆 JDBC 代码
    }

    public List<User> findAll() {
        // 又是一堆 JDBC 代码
    }
}
```

问题：
- 业务逻辑和数据库代码**耦合**在一起
- `getConnection` / `close` 等**样板代码**到处重复
- 难以维护、测试

#### DAO 的解决思路

把数据库操作**全部抽到 DAO 类**，业务层只调方法：

```java
// ✅ 业务层：干净，只管业务
public class UserService {
    private UserDAO userDAO = new UserDAOImpl();

    public User login(String name, String pwd) {
        User user = userDAO.findByName(name);   // 一行搞定
        return (user != null && user.getPwd().equals(pwd)) ? user : null;
    }
}
```

---

### 三、DAO 的标准结构

一个完整的 DAO 分三层：

```
┌─────────────────────────────┐
│  Service（业务层）            │  ← 调用 DAO
├─────────────────────────────┤
│  DAO 接口 + DAO 实现          │  ← 封装数据库操作
├─────────────────────────────┤
│  Entity（实体类）             │  ← 和表对应的 Java 对象
└─────────────────────────────┘
```

#### 1. Entity（实体类）

和数据库表一一对应的 POJO：

```java
public class User {
    private Integer id;
    private String name;
    private Integer age;

    // 构造方法、getter、setter、toString 略
}
```

#### 2. DAO 接口（定义有哪些操作）

```java
import java.util.List;

public interface UserDAO {
    User findById(Integer id);
    User findByName(String name);
    List<User> findAll();
    int insert(User user);
    int update(User user);
    int deleteById(Integer id);
}
```

> 💡 **提示：** 面向接口编程——业务层依赖 `UserDAO` 接口，不依赖具体实现，方便切换（如从 JDBC 实现换成 MyBatis 实现）。

#### 3. DAO 实现（写 JDBC）

```java
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDAOImpl implements UserDAO {

    @Override
    public User findById(Integer id) {
        String sql = "SELECT id, name, age FROM user WHERE id = ?";
        try (Connection conn = JdbcUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);   // 复用映射方法
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);   // 把异常转成运行时异常抛出
        }
        return null;
    }

    @Override
    public List<User> findAll() {
        String sql = "SELECT id, name, age FROM user";
        List<User> list = new ArrayList<>();
        try (Connection conn = JdbcUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return list;
    }

    @Override
    public int insert(User user) {
        String sql = "INSERT INTO user(name, age) VALUES(?, ?)";
        try (Connection conn = JdbcUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, user.getName());
            ps.setInt(2, user.getAge());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) user.setId(keys.getInt(1));   // 回填自增主键
            }
            return 1;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    // ✅ 提取 ResultSet → User 的映射，复用
    private User mapRow(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getInt("id"));
        user.setName(rs.getString("name"));
        user.setAge(rs.getObject("age", Integer.class));   // 防 NULL
        return user;
    }

    // update / deleteById / findByName 类似，略
}
```

---

### 四、JdbcUtil 工具类

DAO 实现里反复用到的「获取连接」，应该抽到一个工具类（配合[[数据库连接池]]）：

```java
import com.zaxxer.hikari.HikariDataSource;
import java.sql.*;

public class JdbcUtil {
    private static final HikariDataSource DS;

    static {
        DS = new HikariDataSource();
        DS.setJdbcUrl("jdbc:mysql://localhost:3306/test?useSSL=false&serverTimezone=UTC");
        DS.setUsername("root");
        DS.setPassword("123456");
        DS.setMaximumPoolSize(20);
    }

    // ✅ 统一获取连接（来自连接池）
    public static Connection getConnection() throws SQLException {
        return DS.getConnection();
    }

    // ✅ 统一关闭（try-with-resources 时其实不需要）
    public static void close(AutoCloseable... cs) {
        for (AutoCloseable c : cs) {
            if (c != null) {
                try { c.close(); } catch (Exception e) { e.printStackTrace(); }
            }
        }
    }
}
```

---

### 五、BaseDao：提取公共模板（进阶）

每个 DAO 都有大量**重复的样板代码**（获取连接、关闭、异常处理）。可以抽一个 `BaseDao` 基类或模板方法：

```java
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.function.*;

public abstract class BaseDao<T> {

    // ✅ 通用查询（模板方法）
    protected List<T> queryList(String sql, RowMapper<T> mapper, Object... params) {
        List<T> list = new ArrayList<>();
        try (Connection conn = JdbcUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            setParams(ps, params);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapper.map(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        return list;
    }

    // ✅ 通用增删改
    protected int update(String sql, Object... params) {
        try (Connection conn = JdbcUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            setParams(ps, params);
            return ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    // 设置参数
    private void setParams(PreparedStatement ps, Object[] params) throws SQLException {
        for (int i = 0; i < params.length; i++) {
            ps.setObject(i + 1, params[i]);
        }
    }

    // 函数式接口：ResultSet → 对象 的映射
    @FunctionalInterface
    public interface RowMapper<T> {
        T map(ResultSet rs) throws SQLException;
    }
}
```

#### UserDAO 继承 BaseDao 后变得极简

```java
public class UserDAOImpl2 extends BaseDao<User> implements UserDAO {

    @Override
    public User findById(Integer id) {
        List<User> list = queryList("SELECT * FROM user WHERE id = ?",
            rs -> new User(rs.getInt("id"), rs.getString("name"), rs.getInt("age")),
            id);
        return list.isEmpty() ? null : list.get(0);
    }

    @Override
    public int insert(User user) {
        return update("INSERT INTO user(name, age) VALUES(?, ?)",
            user.getName(), user.getAge());
    }
}
```

> 💡 **提示：** BaseDao 把样板代码（连接、异常、参数设置）全部封装，子类只写 SQL + 映射。这就是 Spring 的 `JdbcTemplate` 的思路。

---

### 六、异常处理：DAO 的最佳实践

DAO 内部捕获 `SQLException`（受检异常），**转换成运行时异常**抛出，避免业务层被迫处理：

```java
// ✅ DAO 内部捕获，抛运行时异常
try {
    // JDBC 操作
} catch (SQLException e) {
    throw new RuntimeException("数据库操作失败", e);   // 自定义异常更好
}
```

> 💡 **提示：** 业务层不该关心 SQLException（那是 DAO 的事）。DAO 把它转成业务异常（如 `UserNotFoundException`、`DataAccessException`）。

---

### 七、实际应用场景

| 场景 | 用法 |
| --- | --- |
| 手写 JDBC 项目 | DAO + BaseDao 封装 |
| 学习理解 ORM | DAO 是 MyBatis/JPA 的基础 |
| 小型/遗留项目 | DAO 模式足够 |
| Spring 项目 | DAO + JdbcTemplate / MyBatis |

```java
// Service 层使用 DAO（解耦）
public class UserService {
    private UserDAO userDAO = new UserDAOImpl();

    public void register(User u) {
        if (userDAO.findByName(u.getName()) != null) {
            throw new RuntimeException("用户名已存在");
        }
        userDAO.insert(u);
    }
}
```

---

### 八、DAO vs MyBatis vs JPA

| 方案 | 说明 |
| --- | --- |
| **手写 DAO** | JDBC 全自己写，样板代码多，但理解底层 |
| **Spring JdbcTemplate** | 简化 JDBC，仍有 SQL |
| **MyBatis** | 半自动 ORM，SQL 自己写，映射自动（主流） |
| **JPA/Hibernate** | 全自动 ORM，连 SQL 都不用写 |

> 💡 **提示：** DAO 是「思想」，MyBatis/JPA 是「工具」。理解 DAO 后用 MyBatis，等于让框架帮你实现 DAO。

---

### 九、常见问题与注意事项

#### 1. 每个 DAO 别自己 new 连接池

连接池应该是**全局单例**，放 `JdbcUtil` 里，所有 DAO 共享。

#### 2. 事务跨多个 DAO 怎么办？

Service 层开启事务，多个 DAO 操作共用**同一个 Connection**（要传递 Connection，或用 ThreadLocal）。Spring 的 `@Transactional` 帮你处理这个。

#### 3. ResultSet 不能跨 DAO 方法返回

ResultSet 在 Connection 关闭后就失效。DAO 方法必须**把数据转成对象/集合**再返回，不能直接返回 ResultSet。

#### 4. 异常转换

DAO 把 `SQLException` 转成运行时异常，业务层不被强制处理。

#### 5. 别忘了资源关闭

DAO 里坚持 try-with-resources，避免连接泄漏。

---

### 十、总结

| 要点 | 说明 |
| --- | --- |
| 作用 | 解耦业务层和数据库访问 |
| 结构 | Entity（实体） + DAO 接口 + DAO 实现 |
| 公共抽取 | JdbcUtil（连接）+ BaseDao（CRUD 模板） |
| 异常 | DAO 内部捕获，抛运行时异常 |
| 演进 | DAO 思想 → JdbcTemplate → MyBatis → JPA |

一句话：**DAO 把「数据库怎么访问」和「业务怎么处理」分开**，是手写 JDBC 的标准组织方式，也是理解所有 ORM 框架的基础。

相关文档：[[JDBC基础]]、[[PreparedStatement]]、[[ResultSet]]、[[数据库连接池]]、[[事务管理]]。
