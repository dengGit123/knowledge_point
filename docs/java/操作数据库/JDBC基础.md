### 一、概述

> 📖 [JDBC 基础（Oracle 教程）](https://docs.oracle.com/javase/tutorial/jdbc/basics/index.html) ｜ [java.sql 包](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/package-summary.html)

JDBC（Java Database Connectivity）是 Java 操作数据库的**标准 API**。它提供了一套统一的接口，让 Java 程序能连接各种数据库、执行 SQL、处理结果——**不用为每种数据库学一套不同的 API**。

大白话：JDBC 是 Java 和数据库之间的「**翻译官**」。你用 Java 代码告诉 JDBC「查一下用户表」，JDBC 翻译成数据库听得懂的 SQL，再把查出来的数据翻译成 Java 对象还给你。

| 你将学到 | 说明 |
| --- | --- |
| JDBC 核心 API | DriverManager / Connection / Statement / ResultSet |
| 完整 CRUD 流程 | 连接 → 执行 SQL → 处理结果 → 关闭 |
| 驱动与 URL | 怎么连上数据库 |

> 💡 **提示：** 本文是「操作数据库」系列的入门总纲。各专题（[[PreparedStatement]]、[[ResultSet]]、[[事务管理]]、[[数据库连接池]]）见本目录其他文档。

---

### 二、JDBC 核心 API 体系

JDBC 的核心是这几个接口/类，理解它们的关系就理解了 JDBC：

```
DriverManager ──► getConnection(url) ──► Connection（连接）
                                              │
                                    createStatement() / prepareStatement()
                                              │
                                              ▼
                                         Statement / PreparedStatement（执行 SQL 的对象）
                                              │
                                    executeQuery() / executeUpdate()
                                              │
                                              ▼
                                         ResultSet（结果集）
```

| API | 作用 | 类比 |
| --- | --- | --- |
| `DriverManager` | 管理驱动，创建连接 | 总机接线员 |
| `Connection` | 一个数据库连接 | 接通的电话线 |
| `Statement` / `PreparedStatement` | 执行 SQL | 说出去的话 |
| `ResultSet` | 查询返回的结果 | 对方的回答 |

---

### 三、准备工作：引入驱动

JDBC 是接口，每种数据库需要对应的「**驱动**」（实现类）。以 MySQL 为例，引入 Maven 依赖：

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>
```

> 💡 **提示：** 不同数据库驱动不同（Oracle、PostgreSQL、SQL Server 各自的 jar）。但只要引入驱动，后续 JDBC 代码几乎不用改——这就是 JDBC 「统一接口」的价值。

#### 数据库连接 URL 格式

```
jdbc:mysql://主机:端口/数据库名?参数
```

```
jdbc:mysql://localhost:3306/test?useSSL=false&serverTimezone=UTC&characterEncoding=utf8
```

| 部分 | 含义 |
| --- | --- |
| `jdbc:mysql:` | 协议 + 子协议（mysql） |
| `localhost:3306` | 主机和端口 |
| `test` | 数据库名 |
| `?...` | 连接参数（编码、时区等） |

---

### 四、第一个 JDBC 程序（查询）

最经典的 JDBC 查询流程——**加载驱动 → 获取连接 → 创建 Statement → 执行 SQL → 处理结果 → 关闭**：

```java
import java.sql.*;

public class JdbcFirstDemo {
    public static void main(String[] args) {
        // ① 连接信息
        String url = "jdbc:mysql://localhost:3306/test?useSSL=false&serverTimezone=UTC&characterEncoding=utf8";
        String user = "root";
        String password = "123456";

        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;

        try {
            // ② 获取连接（JDBC 4.0+ 自动加载驱动，不用手动 Class.forName）
            conn = DriverManager.getConnection(url, user, password);

            // ③ 创建 Statement
            stmt = conn.createStatement();

            // ④ 执行查询
            rs = stmt.executeQuery("SELECT id, name, age FROM user");

            // ⑤ 遍历结果
            while (rs.next()) {
                int id = rs.getInt("id");
                String name = rs.getString("name");
                int age = rs.getInt("age");
                System.out.println(id + ", " + name + ", " + age);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            // ⑥ 关闭资源（顺序：rs → stmt → conn，逆序）
            close(rs, stmt, conn);
        }
    }

    // 统一关闭资源
    static void close(AutoCloseable... cs) {
        for (AutoCloseable c : cs) {
            if (c != null) {
                try { c.close(); } catch (Exception e) { e.printStackTrace(); }
            }
        }
    }
}
```

> 💡 **提示：** JDBC 4.0（Java 6）以后，驱动会**自动加载**，不必写 `Class.forName("com.mysql.cj.jdbc.Driver")`。但写了也无害，老教程里常见。

---

### 五、完整 CRUD（增删改查）

#### 1. 增（INSERT）

```java
// 用 Statement 执行更新（实际推荐 PreparedStatement，见下文）
int rows = stmt.executeUpdate(
    "INSERT INTO user(name, age) VALUES('张三', 20)");
System.out.println("影响了 " + rows + " 行");   // 1
```

#### 2. 删（DELETE）

```java
int rows = stmt.executeUpdate("DELETE FROM user WHERE id = 1");
```

#### 3. 改（UPDATE）

```java
int rows = stmt.executeUpdate("UPDATE user SET age = 21 WHERE name = '张三'");
```

#### 4. 查（SELECT）

```java
ResultSet rs = stmt.executeQuery("SELECT * FROM user");
while (rs.next()) {
    // 处理每一行
}
```

#### execute / executeQuery / executeUpdate 的区别

| 方法 | 返回 | 用途 |
| --- | --- | --- |
| `executeQuery` | `ResultSet` | SELECT 查询 |
| `executeUpdate` | `int`（影响行数） | INSERT / UPDATE / DELETE |
| `execute` | `boolean` | 任意 SQL（返回 true 表示有结果集） |

> 💡 **提示：** 记住——**查用 executeQuery，增删改用 executeUpdate**。

---

### 六、Statement vs PreparedStatement（重要）

上面用的是 `Statement`，它**直接拼接 SQL 字符串**，有 **SQL 注入**风险：

```java
// ❌ 危险！用户输入可能破坏 SQL 结构
String name = "1' OR '1'='1";
stmt.executeQuery("SELECT * FROM user WHERE name = '" + name + "'");
// 实际执行：SELECT * FROM user WHERE name = '1' OR '1'='1'  → 返回所有用户！
```

**实际开发一律用 `PreparedStatement`**（预编译、参数化，防注入）：

```java
// ✅ 用 ? 占位，参数自动转义
PreparedStatement ps = conn.prepareStatement("SELECT * FROM user WHERE name = ?");
ps.setString(1, "1' OR '1'='1");   // 安全
ResultSet rs = ps.executeQuery();
```

详见 [[PreparedStatement]]。

---

### 七、资源的正确关闭

数据库连接、Statement、ResultSet 都是**系统资源**，用完必须关闭，否则**连接泄漏**导致数据库连接耗尽。

#### 推荐写法：try-with-resources

```java
// ✅ JDK 7+，自动关闭（按声明逆序）
try (Connection conn = DriverManager.getConnection(url, user, password);
     PreparedStatement ps = conn.prepareStatement("SELECT * FROM user WHERE id = ?");
     ResultSet rs = ps.executeQuery()) {

    ps.setInt(1, 1);
    while (rs.next()) {
        System.out.println(rs.getString("name"));
    }
}   // 自动关闭 rs → ps → conn
```

#### 关闭顺序

**逆序关闭**：先关 ResultSet，再关 Statement，最后关 Connection。

> ⚠️ **注意：** 生产环境**绝不能忘记关闭连接**。连接泄漏是数据库故障的头号元凶。配合[[数据库连接池]]使用更佳。

---

### 八、JDBC 操作的标准步骤（记忆口诀）

```
1. 加载驱动（自动）
2. 获取连接（Connection）
3. 创建执行对象（PreparedStatement）
4. 设置参数（setXxx）
5. 执行 SQL（executeQuery / executeUpdate）
6. 处理结果（ResultSet）
7. 释放资源（close）
```

---

### 九、实际应用场景

| 场景 | 用法 |
| --- | --- |
| 学习数据库原理 | 直接写 JDBC，理解底层 |
| 小型工具/脚本 | JDBC 简单直接 |
| 框架底层 | MyBatis、Spring JDBC 底层都是 JDBC |
| 自研持久层 | JDBC + [[DAO模式]] 封装 |

> 💡 **提示：** 实际项目很少手写裸 JDBC，而是用 **MyBatis / MyBatis-Plus / Spring Data JPA** 等框架。但理解 JDBC 是理解这些框架的前提——它们底层全是 JDBC。

---

### 十、常见问题与注意事项

#### 1. ClassNotFoundException（找不到驱动）

没引入数据库驱动 jar，或驱动类名写错。检查 Maven 依赖。

#### 2. 连接超时 / 拒绝连接

- 数据库没启动
- 端口/主机/账号密码错
- 防火墙拦截（云数据库安全组）

#### 3. 时区报错

MySQL 8 连接报时区错误，URL 加 `serverTimezone=Asia/Shanghai`。

#### 4. 中文乱码

URL 加 `characterEncoding=utf8`，数据库/表也用 utf8mb4。详见 [[../流/字符编码]]。

#### 5. 忘记关闭连接

用 try-with-resources，或用连接池自动管理。

#### 6. SQL 注入

永远用 PreparedStatement，不要拼接 SQL。详见 [[PreparedStatement]]。

---

### 十一、本系列文档导航

| 文档 | 知识点 |
| --- | --- |
| **本文（JDBC 基础）** | 总纲、CRUD 流程 |
| [[PreparedStatement]] | 参数化、防 SQL 注入 |
| [[ResultSet]] | 结果集遍历 |
| [[事务管理]] | 事务、隔离级别 |
| [[数据库连接池]] | Druid、HikariCP |
| [[批处理]] | 批量操作 |
| [[元数据]] | 获取表/字段信息 |
| [[大对象处理]] | Blob/Clob |
| [[DAO模式]] | JDBC 封装实战 |

---

### 十二、总结

| 要点 | 说明 |
| --- | --- |
| JDBC | Java 操作数据库的标准 API |
| 核心 API | DriverManager → Connection → Statement → ResultSet |
| 标准流程 | 连接 → 执行 → 结果 → 关闭 |
| 执行方法 | 查用 executeQuery，增删改用 executeUpdate |
| 推荐 | 用 PreparedStatement、try-with-resources、连接池 |
| 现状 | 实战多用框架，但底层都是 JDBC |

掌握 JDBC，就掌握了 Java 操作数据库的「**第一性原理**」。

相关文档：[[PreparedStatement]]、[[ResultSet]]、[[数据库连接池]]、[[DAO模式]]。
