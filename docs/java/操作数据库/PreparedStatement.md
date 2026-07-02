### 一、概述

> 📖 [PreparedStatement（Java）](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/PreparedStatement.html)

`PreparedStatement` 是 JDBC 中**执行 SQL 的推荐方式**。它通过预编译 + 参数占位符（`?`），既能**防止 SQL 注入**，又能提升性能，是实际开发中唯一应该使用的 SQL 执行对象。

大白话：`Statement` 是「**现想现说**」——每次把 SQL 完整拼出来发出去；`PreparedStatement` 是「**填表格**」——先定好 SQL 模板（带 `?` 空位），再把参数填进去，参数只会被当成「数据」而不会当成「SQL 代码」。

| 对比 | Statement | PreparedStatement |
| --- | --- | --- |
| SQL 拼接 | 手动拼字符串 | 用 `?` 占位 + setXxx |
| SQL 注入 | ❌ 有风险 | ✅ 安全 |
| 性能 | 每次编译 | 预编译可复用 |
| 推荐度 | 不推荐 | **强烈推荐** |

> 💡 **提示：** 一句话——**实际开发永远用 PreparedStatement，不用 Statement**。

---

### 二、SQL 注入是什么（理解为什么要用 PreparedStatement）

#### 1. 注入原理

`Statement` 把用户输入**直接拼进 SQL**。如果用户输入里有 SQL 特殊字符，就能**篡改 SQL 结构**：

```java
// ❌ 登录校验：拼接用户名
String name = "admin' --";      // 用户输入
String sql = "SELECT * FROM user WHERE name='" + name + "' AND password='123'";

// 实际执行的 SQL：
// SELECT * FROM user WHERE name='admin' --' AND password='123'
//                                    ↑↑ 这是 SQL 注释，后面全被忽略！
// 结果：不用密码也能登录 admin！
```

更狠的注入：

```java
String name = "x'; DROP TABLE user; --";
// 执行后：user 表被删了！
```

#### 2. PreparedStatement 如何防注入

`PreparedStatement` 把参数当**纯数据**处理，特殊字符会被自动转义，不会改变 SQL 结构：

```java
// ✅ 用 ? 占位
PreparedStatement ps = conn.prepareStatement(
    "SELECT * FROM user WHERE name = ? AND password = ?");
ps.setString(1, "admin' --");   // 这串字符只会被当字符串，不会变成 SQL
ps.setString(2, "123");
ResultSet rs = ps.executeQuery();
// SQL 结构不变，安全
```

> 💡 **提示：** PreparedStatement 防 SQL 注入的本质：**参数和 SQL 结构彻底分离**，参数永远是「数据」，不可能变成「代码」。

---

### 三、基本用法

#### 1. 查询（SELECT）

```java
String sql = "SELECT id, name, age FROM user WHERE age > ? AND name LIKE ?";
try (Connection conn = getConnection();
     PreparedStatement ps = conn.prepareStatement(sql)) {  // ✅ 先传 SQL 预编译

    ps.setInt(1, 18);                  // 第 1 个 ? 填 int
    ps.setString(2, "张%");            // 第 2 个 ? 填字符串

    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            System.out.println(rs.getString("name"));
        }
    }
}
```

#### 2. 增删改（INSERT / UPDATE / DELETE）

```java
// 插入
String sql = "INSERT INTO user(name, age) VALUES(?, ?)";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, "李四");
    ps.setInt(2, 25);
    int rows = ps.executeUpdate();   // 返回影响行数
    System.out.println("插入了 " + rows + " 行");
}

// 修改
ps = conn.prepareStatement("UPDATE user SET age = ? WHERE name = ?");
ps.setInt(1, 26);
ps.setString(2, "李四");
ps.executeUpdate();

// 删除
ps = conn.prepareStatement("DELETE FROM user WHERE id = ?");
ps.setInt(1, 5);
ps.executeUpdate();
```

> 💡 **提示：** 增删改用 `executeUpdate()`，查用 `executeQuery()`，与 [[JDBC基础]] 一致。

---

### 四、参数设置方法

`setXxx(参数位置, 值)`——位置从 **1** 开始（不是 0！）：

| 方法 | 对应类型 |
| --- | --- |
| `setInt(int, int)` | int |
| `setLong(int, long)` | long |
| `setDouble(int, double)` | double |
| `setString(int, String)` | String |
| `setBoolean(int, boolean)` | boolean |
| `setDate(int, Date)` | 日期 |
| `setObject(int, Object)` | 通用（任意类型） |
| `setNull(int, int)` | NULL |

```java
ps.setInt(1, 100);          // ✅ 第 1 个参数
ps.setString(2, "hello");   // ✅ 第 2 个参数
// ps.setInt(0, 100);       // ❌ 位置从 1 开始，0 会越界
```

> ⚠️ **注意：** JDBC 的参数索引**从 1 开始**，这是初学者最常踩的坑（数组是从 0 开始，但 JDBC 参数是从 1）。

---

### 五、获取自增主键

插入数据后，常常需要拿到数据库**自动生成的主键**（如自增 id）：

```java
String sql = "INSERT INTO user(name, age) VALUES(?, ?)";
// ✅ 第二个参数声明要返回生成的 key
try (PreparedStatement ps = conn.prepareStatement(
        sql, Statement.RETURN_GENERATED_KEYS)) {

    ps.setString(1, "王五");
    ps.setInt(2, 30);
    ps.executeUpdate();

    // 获取自增主键
    try (ResultSet keys = ps.getGeneratedKeys()) {
        if (keys.next()) {
            long id = keys.getLong(1);
            System.out.println("新插入的 id: " + id);
        }
    }
}
```

> 💡 **提示：** `getGeneratedKeys()` 在 INSERT 后调用，能拿到自增主键。这在「插入后立即需要 id」的场景很常用。

---

### 六、PreparedStatement 的性能优势

#### 1. 预编译

`PreparedStatement` 创建时就把 SQL 发给数据库**预编译**（解析、优化执行计划）。之后多次执行只需传参数，**不用重新解析**：

```java
// ✅ 同一个 PreparedStatement 多次执行，只编译一次
PreparedStatement ps = conn.prepareStatement("INSERT INTO user(name) VALUES(?)");
for (String name : names) {
    ps.setString(1, name);
    ps.executeUpdate();   // 复用预编译结果
}
```

#### 2. Statement 每次都要重新解析

```java
// ❌ 每条 SQL 都不同，数据库都要重新解析
stmt.executeUpdate("INSERT INTO user(name) VALUES('A')");
stmt.executeUpdate("INSERT INTO user(name) VALUES('B')");
```

> 💡 **提示：** 预编译的优势在「**同一 SQL 多次执行**」时明显。配合 [[批处理]] 效果更好。注意：MySQL 默认未开启预编译（用 `useServerPrepStmts=true` 开启）。

---

### 七、Statement vs PreparedStatement 完整对比

| 对比项 | Statement | PreparedStatement |
| --- | --- | --- |
| SQL 形式 | 完整字符串 | 模板 + `?` 参数 |
| SQL 注入 | ❌ 有风险 | ✅ 安全 |
| 编译 | 每次重新 | 可预编译复用 |
| 参数 | 手动拼接 | setXxx |
| 可读性 | 差（一堆引号拼接） | 好 |
| 主键获取 | 不支持 RETURN_GENERATED_KEYS | 支持 |
| 适用 | 几乎没有 | **所有场景** |

---

### 八、常见问题与注意事项

#### 1. 表名/列名能用 ? 占位吗？

**不能！** `?` 只能占位「**值**」，不能占位表名、列名、SQL 关键字：

```java
// ❌ 错误：? 不能代替表名
ps = conn.prepareStatement("SELECT * FROM ?");

// ✅ 表名只能拼字符串（确保来源可信，防止注入）
String table = "user";   // 必须是可信来源
ps = conn.prepareStatement("SELECT * FROM " + table);
```

> ⚠️ **注意：** 动态表名/列名只能拼字符串，**必须自己校验**（白名单），否则仍有注入风险。

#### 2. LIKE 模糊查询的占位

```java
// ✅ 模糊查询：把 % 当参数的一部分
ps = conn.prepareStatement("SELECT * FROM user WHERE name LIKE ?");
ps.setString(1, "张%");   // % 在参数里，不是 SQL 里
```

#### 3. IN 子句的占位

`IN (?, ?, ?)` 的 `?` 个数**必须和元素个数一致**，不能用一个 `?` 代表多个值：

```java
// ❌ 一个 ? 不能代表多个值
"SELECT * FROM user WHERE id IN (?)"

// ✅ 动态生成对应数量的 ?
List<Integer> ids = Arrays.asList(1, 2, 3);
String placeholders = ids.stream().map(i -> "?").collect(Collectors.joining(","));
String sql = "SELECT * FROM user WHERE id IN (" + placeholders + ")";
PreparedStatement ps = conn.prepareStatement(sql);
for (int i = 0; i < ids.size(); i++) {
    ps.setInt(i + 1, ids.get(i));
}
```

#### 4. setDate 与 java.util.Date

`setDate` 要的是 `java.sql.Date`，不是 `java.util.Date`：

```java
ps.setTimestamp(1, new Timestamp(System.currentTimeMillis()));  // ✅ 常用
// 或
ps.setDate(1, new java.sql.Date(System.currentTimeMillis()));
```

#### 5. 重复使用要 clearParameters

同一个 PreparedStatement 反复设置参数时，注意旧参数残留。一般建议每次重新设置。

---

### 九、实际应用场景

| 场景 | 用法 |
| --- | --- |
| 所有数据库 CRUD | PreparedStatement（默认） |
| 用户登录校验 | 防 SQL 注入 |
| 动态条件查询 | 拼接 SQL 模板 + 参数 |
| 批量插入 | PreparedStatement + [[批处理]] |
| 获取自增主键 | RETURN_GENERATED_KEYS |

```java
// 动态条件查询示例（按条件拼 SQL）
StringBuilder sql = new StringBuilder("SELECT * FROM user WHERE 1=1");
List<Object> params = new ArrayList<>();
if (name != null) {
    sql.append(" AND name = ?");
    params.add(name);
}
if (age != null) {
    sql.append(" AND age = ?");
    params.add(age);
}
PreparedStatement ps = conn.prepareStatement(sql.toString());
for (int i = 0; i < params.size(); i++) {
    ps.setObject(i + 1, params.get(i));
}
```

---

### 十、总结

| 要点 | 说明 |
| --- | --- |
| 核心价值 | 防 SQL 注入 + 预编译提升性能 |
| 用法 | SQL 用 `?` 占位 + `setXxx` 填参 |
| 参数位置 | **从 1 开始** |
| 执行 | 查 executeQuery，增删改 executeUpdate |
| 主键 | RETURN_GENERATED_KEYS + getGeneratedKeys |
| 限制 | `?` 只能占值，不能占表名/列名 |

一句话：**永远用 PreparedStatement，永远不要拼接 SQL 字符串**。这是数据库操作的第一安全准则。

相关文档：[[JDBC基础]]、[[ResultSet]]、[[批处理]]、[[DAO模式]]。
