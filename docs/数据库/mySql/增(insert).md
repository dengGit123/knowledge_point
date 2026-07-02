# MySQL 增（INSERT）

> 官方文档：[MySQL 8.0 - INSERT Statement](https://dev.mysql.com/doc/refman/8.0/en/insert.html)

## 什么是 INSERT？

**INSERT 就是往数据库的表里"添加新数据"**，相当于在 Excel 表格的最后一行下面新增一行记录。

```
users 表（用户表）
┌────┬────────┬─────┬──────────────────┐
│ id │  name  │ age │      email       │
├────┼────────┼─────┼──────────────────┤
│  1 │ 张三   │  20 │ zhangsan@xx.com  │  ← 已有数据
│  2 │ 李四   │  25 │ lisi@xx.com      │  ← 已有数据
└────┴────────┴─────┴──────────────────┘
                        ↑
              INSERT 往这里新增一行
```

> 💡 **约定：** 本文及同目录其他文档，统一使用上面的 `users`（用户）表作为示例表，结构如下：
>
> ```sql
> CREATE TABLE users (
>   id         INT PRIMARY KEY AUTO_INCREMENT,  -- 主键，自增
>   name       VARCHAR(50)  NOT NULL,           -- 用户名，不能为空
>   age        INT          DEFAULT 0,           -- 年龄，默认 0
>   email      VARCHAR(100) UNIQUE,             -- 邮箱，唯一
>   created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  -- 创建时间
> );
> ```

---

## 一、基本语法

### 1.1 最基本的写法（指定值）

```sql
-- INSERT INTO 表名 (列1, 列2, ...) VALUES (值1, 值2, ...);
INSERT INTO users (name, age, email)
VALUES ('张三', 20, 'zhangsan@xx.com');
```

**执行结果：** 表里新增一行，`id` 自动生成（自增主键），`created_at` 自动填当前时间。

### 1.2 字符串和数字的区别

```sql
INSERT INTO users (name, age) VALUES ('王五', 30);
--                        字符串 ↑   ↑ 数字不要加引号
-- ❌ 错误写法：VALUES (王五, 30)   字符串没加引号会报错
```

> ⚠️ **注意：** SQL 里**字符串、日期**必须用单引号 `'...'` 包起来，**数字**不要加引号。

### 1.3 列的顺序可以自定义

```sql
-- 列的顺序不影响结果，只要"列"和"值"一一对应即可
INSERT INTO users (email, name, age)
VALUES ('zhaoliu@xx.com', '赵六', 28);
```

---

## 二、常见用法

### 2.1 省略列名（不推荐）

```sql
-- 省略列名时，VALUES 必须按表的所有列顺序填值（含主键）
INSERT INTO users
VALUES (NULL, '张三', 20, 'zhangsan@xx.com', NULL);
--      ↑ id 传 NULL，让自增主键自动生成

-- ❌ 不推荐原因：表结构一旦改变（加列/删列），这条语句就会错位
```

> 💡 **提示：** 实际开发中**永远写明列名**，这样表结构变化时 SQL 不会突然失效。

### 2.2 插入部分列（没写的列用默认值）

```sql
-- 只写必填的列，其他列用默认值或 NULL
INSERT INTO users (name)
VALUES ('钱七');
-- age 用默认值 0，email 为 NULL，created_at 用当前时间
```

### 2.3 一次插入多行数据（批量插入）

```sql
-- 多行用逗号隔开，效率比多次单行插入高得多
INSERT INTO users (name, age, email)
VALUES
  ('张三', 20, 'zhangsan@xx.com'),
  ('李四', 25, 'lisi@xx.com'),
  ('王五', 30, 'wangwu@xx.com');
```

> 💡 **提示：** 批量插入只需一次网络往返 + 一次事务提交，比循环 100 次 `INSERT` 快很多，**强烈推荐**。

### 2.4 INSERT ... SET 语法

```sql
-- 用 SET 的写法，可读性更好，适合插入的列较多时
INSERT INTO users
SET name = '孙八', age = 22, email = 'sunba@xx.com';
```

---

## 三、从查询结果插入（INSERT ... SELECT）

把一张表的查询结果，直接插入另一张表，常用于**数据迁移、备份、汇总**。

```sql
-- 把 users 表中年龄大于 18 的用户，复制到 adults 表
INSERT INTO adults (name, age, email)
SELECT name, age, email
FROM users
WHERE age > 18;
```

> ⚠️ **注意：** `SELECT` 查出来的列数和类型，必须和 `INSERT` 的列一一对应。

---

## 四、处理重复数据（重点）

当表有**唯一约束**（如 `email UNIQUE`）或主键时，插入重复数据会报错。MySQL 提供了三种处理方式：

### 4.1 INSERT IGNORE —— 重复就跳过

```sql
-- 如果 email 已存在，不报错，直接忽略这条插入
INSERT IGNORE INTO users (name, age, email)
VALUES ('张三', 20, 'zhangsan@xx.com');  -- 假设这个 email 已存在
-- 结果：0 行受影响，静默跳过
```

### 4.2 INSERT ... ON DUPLICATE KEY UPDATE —— 重复就更新

```sql
-- email 已存在则更新 age，不存在则正常插入（类似"有则更新，无则新增"）
INSERT INTO users (name, age, email)
VALUES ('张三', 21, 'zhangsan@xx.com')
ON DUPLICATE KEY UPDATE age = 21;
```

**用 `VALUES()` 函数引用待插入的值（MySQL 8.0.19 以前常用）：**

```sql
INSERT INTO users (name, age, email)
VALUES ('张三', 21, 'zhangsan@xx.com')
ON DUPLICATE KEY UPDATE age = VALUES(age);  -- 用新传入的 age 覆盖
```

> 💡 **提示：** MySQL 8.0.20 起，`VALUES()` 函数被标记为**已废弃**，推荐用别名写法：
>
> ```sql
> INSERT INTO users (name, age, email)
> VALUES ('张三', 21, 'zhangsan@xx.com') AS new_row
> ON DUPLICATE KEY UPDATE age = new_row.age;
> ```

### 4.3 REPLACE INTO —— 重复就先删再插

```sql
-- 遇到主键/唯一键冲突，先 DELETE 删掉旧行，再 INSERT 新行
REPLACE INTO users (id, name, age, email)
VALUES (1, '张三', 22, 'zhangsan_new@xx.com');
```

### 三种方式对比

| 方式 | 重复时行为 | 是否报错 | id 会变吗 | 适用场景 |
|-----|-----------|---------|----------|---------|
| `INSERT`（普通） | 直接报错 | ✅ 报错 | — | 必须保证不重复时 |
| `INSERT IGNORE` | 静默跳过 | ❌ | 不变 | 允许重复数据被忽略 |
| `ON DUPLICATE KEY UPDATE` | 更新旧行 | ❌ | 不变 | 有则更新、无则新增（最常用） |
| `REPLACE INTO` | 删除旧行再插新行 | ❌ | **可能变** | 完全覆盖旧数据 |

> ⚠️ **注意：** `REPLACE` 是"先删后插"，会触发表的自增 id 变化，且外键级联删除可能误删关联数据，**慎用**。日常优先选 `ON DUPLICATE KEY UPDATE`。

---

## 五、获取自增主键

插入数据后，常常需要拿到自动生成的 `id`（比如关联插入子表数据）。

### 5.1 SQL 层面：LAST_INSERT_ID()

```sql
INSERT INTO users (name, age, email) VALUES ('张三', 20, 'zs@xx.com');
SELECT LAST_INSERT_ID();  -- 返回刚刚 INSERT 生成的自增 id
```

### 5.2 Java JDBC 层面

```java
// 插入时声明要返回自增主键
String sql = "INSERT INTO users (name, age, email) VALUES (?, ?, ?)";

try (PreparedStatement ps =
         conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

    ps.setString(1, "张三");
    ps.setInt(2, 20);
    ps.setString(3, "zs@xx.com");

    ps.executeUpdate();  // 执行插入

    // 拿到自增主键
    try (ResultSet rs = ps.getGeneratedKeys()) {
        if (rs.next()) {
            int newId = rs.getInt(1);  // 新插入行的 id
            System.out.println("新用户 id = " + newId);
        }
    }
}
```

### 5.3 MyBatis 配置 useGeneratedKeys

```xml
<!-- MyBatis 映射：插入后自动把生成的 id 回填到 Java 对象 -->
<insert id="insertUser" parameterType="User"
        useGeneratedKeys="true" keyProperty="id">
    INSERT INTO users (name, age, email)
    VALUES (#{name}, #{age}, #{email})
</insert>
```

```java
User user = new User();
user.setName("张三");
user.setAge(20);
user.setEmail("zs@xx.com");

userMapper.insertUser(user);
System.out.println(user.getId());  // 插入后，id 已自动回填 ✅
```

---

## 六、在 Java 中执行 INSERT（综合示例）

### 6.1 原始 JDBC

```java
String sql = "INSERT INTO users (name, age, email) VALUES (?, ?, ?)";

try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, "张三");   // 第 1 个问号
    ps.setInt(2, 20);         // 第 2 个问号
    ps.setString(3, "zs@xx.com");  // 第 3 个问号

    int rows = ps.executeUpdate();  // 返回受影响行数
    System.out.println("成功插入 " + rows + " 行");
}
```

> ⚠️ **注意：永远用 `PreparedStatement` 的 `?` 占位符传参，不要拼接 SQL 字符串**，否则会有 **SQL 注入**风险：
>
> ```java
> // ❌ 危险！字符串拼接会被注入
> String sql = "INSERT INTO users (name) VALUES ('" + userInput + "')";
>
> // ✅ 安全！用占位符
> String sql = "INSERT INTO users (name) VALUES (?)";
> ps.setString(1, userInput);
> ```

### 6.2 批量插入（提升性能）

```java
String sql = "INSERT INTO users (name, age, email) VALUES (?, ?, ?)";

try (PreparedStatement ps = conn.prepareStatement(sql)) {
    // 模拟 1000 条数据
    for (int i = 0; i < 1000; i++) {
        ps.setString(1, "用户" + i);
        ps.setInt(2, 20 + i % 30);
        ps.setString(3, "user" + i + "@xx.com");
        ps.addBatch();  // 加入批处理

        // 每 500 条执行一次，避免内存占用过大
        if (i % 500 == 0) {
            ps.executeBatch();
        }
    }
    ps.executeBatch();  // 执行剩余的
}
```

---

## 七、常见问题与注意事项

### 问题 1：列数和值数不匹配

```sql
-- ❌ 列有 3 个，值只有 2 个
INSERT INTO users (name, age, email) VALUES ('张三', 20);
-- 报错：Column count doesn't match value count

-- ✅ 列和值一一对应
INSERT INTO users (name, age, email) VALUES ('张三', 20, 'zs@xx.com');
```

### 问题 2：违反非空约束

```sql
-- ❌ name 不能为空（NOT NULL），却没给值
INSERT INTO users (age) VALUES (20);
-- 报错：Field 'name' doesn't have a default value

-- ✅ 给 name 一个值
INSERT INTO users (name, age) VALUES ('张三', 20);
```

### 问题 3：违反唯一约束

```sql
-- 假设 email 是 UNIQUE，已经存在 'zs@xx.com'
-- ❌ 再次插入会报错
INSERT INTO users (name, email) VALUES ('李四', 'zs@xx.com');
-- 报错：Duplicate entry 'zs@xx.com' for key

-- ✅ 用 ON DUPLICATE KEY UPDATE 处理
INSERT INTO users (name, email) VALUES ('李四', 'zs@xx.com')
ON DUPLICATE KEY UPDATE name = '李四';
```

### 问题 4：插入中文乱码

```
原因：表/连接的字符集不是 utf8 / utf8mb4
```

```sql
-- 1. 建表时指定字符集
CREATE TABLE users (...) DEFAULT CHARSET=utf8mb4;

-- 2. 连接数据库后设置连接字符集
SET NAMES utf8mb4;

-- 3. JDBC 连接串里指定（注意参数）
-- jdbc:mysql://localhost:3306/db?useUnicode=true&characterEncoding=utf8
```

> 💡 **提示：** 永远用 `utf8mb4`（支持 emoji 表情），不要用 `utf8`（MySQL 的 `utf8` 是残缺版，最多 3 字节，存不下 emoji）。

### 问题 5：插入大量数据很慢

| 优化手段 | 说明 |
|---------|------|
| 用批量插入（多行 VALUES） | 一次提交多条，减少网络往返 |
| 临时关闭自动提交 + 手动事务 | `SET autocommit=0;` 插完再 `COMMIT;` |
| 临时关闭索引/约束检查 | 大数据导入时可临时 `ALTER TABLE ... DISABLE KEYS` |
| 用 `LOAD DATA INFILE` | 导入超大文本文件比 INSERT 快几十倍 |

---

## 八、快速参考

### INSERT 语法总览

```sql
-- 1. 最常用：指定列 + 多行
INSERT INTO 表名 (列1, 列2)
VALUES (值1, 值2), (值1, 值2);

-- 2. SET 写法
INSERT INTO 表名 SET 列1 = 值1, 列2 = 值2;

-- 3. 从查询结果插入
INSERT INTO 表名 (列1, 列2)
SELECT 列a, 列b FROM 另一张表 WHERE ...;

-- 4. 重复则跳过
INSERT IGNORE INTO 表名 (...) VALUES (...);

-- 5. 重复则更新（最常用）
INSERT INTO 表名 (...) VALUES (...)
ON DUPLICATE KEY UPDATE 列 = 值;
```

### 插入结果判断

```java
int rows = ps.executeUpdate();
// rows > 0  表示插入成功，rows 是受影响行数
// rows == 0 表示没有插入（比如 INSERT IGNORE 命中重复被跳过）
```
