### 一、概述

> 📖 [ResultSet（Java）](https://docs.oracle.com/en/java/javase/17/docs/api/java.sql/java/sql/ResultSet.html)

`ResultSet`（结果集）是 JDBC 执行查询（`executeQuery`）后返回的对象，**封装了 SQL 查询出来的所有数据**。它像一个「**表格光标**」，初始指向第一行之前，逐行向后移动读取数据。

大白话：查询结果就像一张填满数据的表格，`ResultSet` 是你的「**手指**」——一开始指着表头，每调用一次 `next()` 手指往下移一行，然后用 `getXxx()` 读取这一行每列的值。

| 你将学到 | 说明 |
| --- | --- |
| 遍历结果集 | `next()` + `getXxx()` |
| 获取列值 | 按列名 / 按列号 |
| 结果集类型 | 只读向前 / 可滚动 / 可更新 |
| 转对象 | ResultSet → Java 对象 |

> 💡 **提示：** ResultSet 必须配合 Statement/Connection 使用，关闭时也要一起关（见 [[JDBC基础]]）。

---

### 二、基本遍历

#### 标准遍历流程

```java
try (Connection conn = getConnection();
     PreparedStatement ps = conn.prepareStatement("SELECT id, name, age FROM user");
     ResultSet rs = ps.executeQuery()) {

    // ✅ next() 光标下移一行，有数据返回 true，到末尾返回 false
    while (rs.next()) {
        int id = rs.getInt("id");            // 按列名取
        String name = rs.getString("name");
        int age = rs.getInt("age");
        System.out.println(id + ", " + name + ", " + age);
    }
}
```

#### 光标的初始位置

```
[id | name | age]   ← 光标初始在这（第一行之前）
[1  | 张三  | 20]    ← next() 第 1 次指向这里
[2  | 李四  | 25]    ← next() 第 2 次指向这里
                   ← next() 第 3 次返回 false（已到末尾）
```

> 💡 **提示：** ResultSet 一开始**不指向任何一行**，必须先 `next()` 才能读数据。这是初学者常忘的点。

---

### 三、获取列值：getXxx

#### 1. 按列名（推荐）

```java
int id = rs.getInt("id");           // ✅ 按列名，可读性好
String name = rs.getString("name");
```

#### 2. 按列号（从 1 开始）

```java
int id = rs.getInt(1);              // 第 1 列
String name = rs.getString(2);      // 第 2 列
```

> 💡 **提示：** 列号**从 1 开始**（和 PreparedStatement 参数一样）。推荐用**列名**，可读性好且不怕列顺序变。

#### 常用 getXxx 方法

| 方法 | 对应类型 | 数据库类型示例 |
| --- | --- | --- |
| `getInt` | int | INT |
| `getLong` | long | BIGINT |
| `getDouble` | double | DOUBLE |
| `getString` | String | VARCHAR / CHAR / TEXT |
| `getDate` | java.sql.Date | DATE |
| `getTime` | Time | TIME |
| `getTimestamp` | Timestamp | DATETIME / TIMESTAMP |
| `getBoolean` | boolean | BOOLEAN / TINYINT |
| `getBytes` | byte[] | BLOB / BINARY |
| `getObject` | Object | 任意类型 |

> 💡 **提示：** `getObject(int/String)` 是万能方法，返回 Object，可避免类型判断的麻烦，但需要强转。

---

### 四、空值处理（重要）

数据库字段可能是 `NULL`，`getInt` 等基本类型方法遇到 NULL 会返回 **0**（不是 null！），容易产生错误：

```java
int age = rs.getInt("age");   // ❌ 如果数据库是 NULL，返回 0，无法区分「0 岁」和「未填写」

// ✅ 先用 wasNull 判断
int age = rs.getInt("age");
if (rs.wasNull()) {           // 上一列读的是 NULL
    age = -1;                  // 自己处理
}
```

#### 更好的做法：用包装类型 / getObject

```java
Integer age = rs.getObject("age", Integer.class);   // NULL 时返回 null（而非 0）
// 或
Integer age = (Integer) rs.getObject("age");         // 可能为 null
```

> ⚠️ **注意：** 读取可能为 NULL 的数值字段，**用 Integer/Long 等包装类型**，避免基本类型把 NULL 误读成 0。

---

### 五、ResultSet → Java 对象（实战常用）

查询出来通常要转成 Java 对象（POJO）：

```java
public class User {
    private Integer id;
    private String name;
    private Integer age;
    // 构造方法、getter、setter 略
}

// 把 ResultSet 一行映射成 User 对象
public List<User> queryUsers() throws SQLException {
    List<User> list = new ArrayList<>();
    try (Connection conn = getConnection();
         PreparedStatement ps = conn.prepareStatement("SELECT * FROM user");
         ResultSet rs = ps.executeQuery()) {

        while (rs.next()) {
            User user = new User();
            user.setId(rs.getInt("id"));
            user.setName(rs.getString("name"));
            user.setAge(rs.getObject("age", Integer.class));   // 防止 NULL
            list.add(user);
        }
    }
    return list;
}
```

> 💡 **提示：** 这种「ResultSet → 对象」的映射，手写很繁琐。MyBatis 等框架就是帮你自动做这件事（底层仍是 ResultSet）。

---

### 六、结果集的类型（可滚动 / 可更新）

默认的 ResultSet **只能向前移动、只读**。可以通过 `createStatement` / `prepareStatement` 指定更高级的类型：

```java
// 参数1：结果集类型；参数2：并发模式
Statement stmt = conn.createStatement(
    ResultSet.TYPE_SCROLL_INSENSITIVE,   // 可滚动
    ResultSet.CONCUR_READ_ONLY);          // 只读
```

#### 结果集类型（type）

| 类型 | 说明 |
| --- | --- |
| `TYPE_FORWARD_ONLY` | **默认**，只能向前 next() |
| `TYPE_SCROLL_INSENSITIVE` | 可前后滚动，但对数据库变化不敏感 |
| `TYPE_SCROLL_SENSITIVE` | 可前后滚动，且反映数据库实时变化 |

#### 并发模式（concurrency）

| 模式 | 说明 |
| --- | --- |
| `CONCUR_READ_ONLY` | **默认**，只读 |
| `CONCUR_UPDATABLE` | 可通过 ResultSet 直接更新数据库 |

#### 可滚动 ResultSet 的额外方法

```java
rs.next();         // 向后
rs.previous();     // ✅ 向前
rs.first();        // 移到第一行
rs.last();         // 移到最后一行
rs.absolute(3);    // 移到第 3 行
rs.beforeFirst();  // 移到第一行之前
rs.afterLast();    // 移到最后一行之后
```

> 💡 **提示：** 可滚动 ResultSet 用得少（默认向前够用），且不是所有数据库/驱动都支持。了解即可。

---

### 七、可更新结果集

`CONCUR_UPDATABLE` 模式下，可以直接通过 ResultSet 修改数据：

```java
Statement stmt = conn.createStatement(
    ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);
ResultSet rs = stmt.executeQuery("SELECT id, age FROM user");

while (rs.next()) {
    rs.updateInt("age", 30);   // 修改当前行
    rs.updateRow();            // ✅ 提交修改到数据库
}
```

> ⚠️ **注意：** 可更新 ResultSet 实际很少用（直接写 UPDATE 更清晰高效）。一般了解即可。

---

### 八、常见问题与注意事项

#### 1. ResultSet 已关闭

ResultSet 依赖 Statement，Statement 关闭后 ResultSet 也不能用了。要在 Statement 关闭前把数据**读出来**（转成对象/集合），不要把 ResultSet 直接传出去。

```java
// ❌ 危险：返回时 ResultSet 已随连接关闭失效
public ResultSet query() { ... return rs; }

// ✅ 转成 List<User> 再返回
public List<User> query() { ... return list; }
```

#### 2. 一次只能读一行

`getXxx` 读的是**当前光标所在行**。读完一行要 `next()` 移到下一行。

#### 3. 列名大小写

部分数据库列名大小写敏感，`getInt("Name")` 和 `getInt("name")` 可能不同。建议统一小写或用列别名。

#### 4. 列名用别名

```java
// SQL 里起了别名，用别名取
rs.executeQuery("SELECT name AS username FROM user");
rs.getString("username");   // ✅ 用别名，不是 "name"
```

#### 5. 大数据量别一次读全

结果集很大时，逐行处理或分页，不要一次 `rs.next()` 到底全部加载进内存。

---

### 九、实际应用场景

| 场景 | 用法 |
| --- | --- |
| 普通查询遍历 | while(next) + getXxx |
| 转对象列表 | ResultSet → `List<User>` |
| 分页查询 | SQL LIMIT + ResultSet 遍历 |
| 统计 | getInt/getDouble 取聚合结果 |

```java
// 聚合查询（COUNT/SUM）取单值
PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM user");
ResultSet rs = ps.executeQuery();
if (rs.next()) {
    int total = rs.getInt(1);   // COUNT(*) 结果在第 1 列
}
```

---

### 十、总结

| 要点 | 说明 |
| --- | --- |
| 光标 | 初始在第一行之前，`next()` 下移 |
| 取值 | `getXxx(列名)` 或 `getXxx(列号)`，列号从 1 开始 |
| NULL 处理 | 用包装类型 / `wasNull()` 判断 |
| 默认类型 | 只向前、只读 |
| 高级类型 | 可滚动（previous/absolute）、可更新（updateRow） |
| 实战 | 转成 Java 对象再使用，别外泄 ResultSet |

ResultSet 是查询结果的「**容器 + 光标**」，掌握 `next + getXxx` 就能处理绝大多数查询。

相关文档：[[JDBC基础]]、[[PreparedStatement]]、[[元数据]]、[[大对象处理]]。
