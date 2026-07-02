# MySQL 删（DELETE）

> 官方文档：[MySQL 8.0 - DELETE Statement](https://dev.mysql.com/doc/refman/8.0/en/delete.html)

## 什么是 DELETE？

**DELETE 就是把表里的某些行删掉**，相当于在 Excel 里选中几行然后按删除键。

```
users 表
┌────┬────────┬─────┐
│ id │  name  │ age │
├────┼────────┼─────┤
│  1 │ 张三   │  20 │  ← DELETE 把这行删掉
│  2 │ 李四   │  25 │  ← DELETE 把这行删掉
│  3 │ 王五   │  30 │  ← 保留
└────┴────────┴─────┘

DELETE FROM users WHERE age < 28;  -- 删除年龄小于 28 的
```

> ⚠️ **最高警告：删除是不可逆的（除非有事务或备份）！** 一定要带 `WHERE` 条件，否则会把整张表的数据删光。

---

## 一、基本语法

### 1.1 删除符合条件的行

```sql
-- DELETE FROM 表名 WHERE 条件;
DELETE FROM users WHERE id = 1;     -- 删除 id 为 1 的那一行
DELETE FROM users WHERE age < 18;   -- 删除所有未成年用户
DELETE FROM users WHERE name = '张三';
```

### 1.2 删除前先 SELECT 确认（救命习惯）

```sql
-- 删数据前，先用同样的条件查一下，确认要删的就是这些行
SELECT * FROM users WHERE age < 18;  -- 先看看会删掉哪些

-- 确认无误后再删
DELETE FROM users WHERE age < 18;
```

> 💡 **提示：** 这是最重要的习惯——**删之前先查**，能避免无数次"删错了求怎么恢复"。

### 1.3 用 LIMIT 限制删除数量

```sql
-- 只删除满足条件的前 100 行（防止一次性删除太多把库搞挂）
DELETE FROM users WHERE status = 'inactive' LIMIT 100;
```

---

## 二、删除整表数据的三种方式（重点对比）

想把一张表的数据全部清空，有三种方式，**它们的差别非常大**：

### 2.1 DELETE —— 一行一行删

```sql
DELETE FROM users;  -- 不加 WHERE 就是删光所有数据（表结构还在）
```

### 2.2 TRUNCATE —— 直接清空重建

```sql
TRUNCATE TABLE users;  -- 直接清空整表，速度极快
```

### 2.3 DROP —— 连表结构一起删

```sql
DROP TABLE users;  -- 表的数据 + 表结构全部删除，表没了
```

### 三者核心对比

| 特性 | `DELETE` | `TRUNCATE` | `DROP` |
|-----|----------|------------|--------|
| **删除范围** | 数据行（可加 WHERE） | 所有数据行 | 数据 + 表结构 |
| **能加 WHERE 吗** | ✅ 能 | ❌ 不能 | ❌ 不能 |
| **速度** | 慢（逐行删） | **快**（直接清空） | **最快** |
| **自增 id 重置吗** | ❌ 不重置（继续递增） | ✅ 重置为 1 | 表都没了 |
| **触发器触发吗** | ✅ 触发 | ❌ 不触发 | ❌ 不触发 |
| **能回滚吗** | ✅ 在事务内可以 | ❌ 隐式提交，不能 | ❌ 不能 |
| **属于哪类 SQL** | DML（数据操作） | DDL（数据定义） | DDL（数据定义） |
| **日志记录** | 逐行记录（可恢复） | 不逐行记录 | 不记录 |
| **删除后** | 表空了，结构在 | 表空了，结构在 | **表不存在** |

### 什么时候用哪个？

```sql
-- 场景 1：只想删一部分数据 → DELETE
DELETE FROM users WHERE status = 'spam';

-- 场景 2：清空测试表，从头开始（id 也重置）→ TRUNCATE
TRUNCATE TABLE test_log;

-- 场景 3：这张表不要了 → DROP
DROP TABLE deprecated_table;
```

> ⚠️ **注意：** `TRUNCATE` 和 `DROP` 是 DDL，执行后**自动提交、无法回滚**。一旦执行，数据真没了。`DELETE` 在事务里执行的话，还可以 `ROLLBACK` 救回来。

---

## 三、多表关联删除（DELETE JOIN）

当删除条件需要用到另一张表时，可以用 `JOIN`。

### 3.1 同时删除多张表的数据

```sql
-- 删除 users 表中所有"已注销"的用户，同时删掉他们在 logs 表的记录
DELETE users, logs
FROM users
JOIN logs ON users.id = logs.user_id
WHERE users.status = 'cancelled';
```

### 3.2 根据"另一张表"删除本表数据

```sql
-- 删除 users 表中"出现在黑名单表 blacklist 里"的用户
DELETE users
FROM users
JOIN blacklist ON users.email = blacklist.email;
```

---

## 四、用子查询删除

```sql
-- 删除"最近一年都没下过单"的用户
DELETE FROM users
WHERE id NOT IN (
    SELECT DISTINCT user_id FROM orders WHERE created_at > '2025-01-01'
);
```

> ⚠️ **注意：** MySQL 中**不能在子查询里直接引用正在删除的那张表**，否则会报错。可以先 `SELECT` 出来再用 `JOIN` 删除。

---

## 五、软删除 vs 硬删除

生产环境中，**真正的物理删除（DELETE）很少用**，更常用的是**软删除（逻辑删除）**。

### 5.1 硬删除

```sql
-- 数据真的从磁盘删掉了，无法找回
DELETE FROM users WHERE id = 1;
```

### 5.2 软删除（推荐）

```sql
-- 只打一个"已删除"的标记，数据还在，查询时过滤掉即可
UPDATE users SET is_deleted = 1, deleted_at = NOW() WHERE id = 1;

-- 查询时排除已删除的
SELECT * FROM users WHERE is_deleted = 0;
```

### 对比

| 对比项 | 硬删除（DELETE） | 软删除（UPDATE 标记） |
|-------|-----------------|---------------------|
| 数据是否真消失 | ✅ 真消失 | ❌ 还在，只是标记 |
| 能恢复吗 | 难（靠备份/日志） | ✅ 改回标记即可 |
| 磁盘空间 | 释放（需整理） | 不释放 |
| 适合场景 | 临时数据、日志清理 | 用户、订单等核心业务数据 |
| 审计追溯 | ❌ | ✅ 可追溯删除时间 |

> 💡 **提示：** 像用户注销、订单取消这类操作，**优先软删除**，留好"后悔药"，也方便做数据审计。

---

## 六、在 Java 中执行 DELETE

### 6.1 JDBC 基本用法

```java
String sql = "DELETE FROM users WHERE id = ?";

try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setInt(1, 5);  // 删除 id = 5 的用户

    int rows = ps.executeUpdate();  // 返回删除的行数
    System.out.println("删除了 " + rows + " 行");

    if (rows == 0) {
        System.out.println("没删到，可能 id 不存在");
    }
}
```

### 6.2 MyBatis

```xml
<delete id="deleteById" parameterType="int">
    DELETE FROM users WHERE id = #{id}
</delete>
```

```java
int rows = userMapper.deleteById(5);  // 返回受影响行数
```

### 6.3 逻辑删除（MyBatis-Plus 风格）

```java
// 实体类加 @TableLogic 注解
// 执行 deleteById 时，框架自动把它转成 UPDATE ... SET deleted=1
userMapper.deleteById(5);
// 实际执行：UPDATE users SET deleted = 1 WHERE id = 5
```

---

## 七、安全防护：别删错数据

### 7.1 开启安全更新模式

```sql
-- 开启后，DELETE / UPDATE 不允许没有 WHERE（或 WHERE 不是索引列）
SET sql_safe_updates = 1;

-- ❌ 此时这条会报错（没有 WHERE）
DELETE FROM users;

-- ❌ 也会报错（name 不是索引列）
DELETE FROM users WHERE name = '张三';

-- ✅ 通过（id 是主键/索引）
DELETE FROM users WHERE id = 1;
```

> 💡 **提示：** 这个开关能防止你手滑执行 `DELETE FROM users` 把全表删光。可以在连接时默认开启，做一层保险。

### 7.2 删除前务必备份

```sql
-- 删除前，先把要删的数据存到备份表
CREATE TABLE users_backup_20260702 AS
SELECT * FROM users WHERE status = 'spam';

-- 然后再删
DELETE FROM users WHERE status = 'spam';
```

---

## 八、常见问题与注意事项

### 问题 1：忘了加 WHERE，全表删空了！

```sql
-- ❌ 这条会删掉 users 表所有数据
DELETE FROM users;

-- 救命：如果是在事务里，立刻回滚！
ROLLBACK;
```

> ⚠️ 这就是为什么强调：**DELETE 一定带 WHERE，执行前一定先 SELECT 确认**。

### 问题 2：删除速度太慢

```sql
-- 删除几百万行时，DELETE 很慢（逐行记录日志）
-- 优化方案：
-- 1. 分批删除，避免长事务锁表
DELETE FROM big_table WHERE created_at < '2020-01-01' LIMIT 10000;
-- 循环执行直到删完

-- 2. 如果是清空整表，用 TRUNCATE（快得多）
TRUNCATE TABLE big_table;

-- 3. 如果是删大部分数据，可以反向操作：
--    把要保留的数据复制到新表，再 DROP 旧表，改名新表
```

### 问题 3：删除时被外键约束阻止

```sql
-- 如果 user 被 orders 表通过外键引用
DELETE FROM users WHERE id = 1;
-- 报错：Cannot delete or update a parent row（外键约束）

-- 解决方案 1：先删子表数据，再删父表
DELETE FROM orders WHERE user_id = 1;
DELETE FROM users WHERE id = 1;

-- 解决方案 2：建表时用 ON DELETE CASCADE，删父行时自动删子行
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
```

### 问题 4：删除后磁盘空间没释放

```
DELETE 删除数据后，InnoDB 不会立刻释放磁盘空间，
而是把空间标记为"可复用"，留给后续插入使用。

要真正释放空间：
  OPTIMIZE TABLE users;
  -- 或
  ALTER TABLE users ENGINE=InnoDB;  -- 重建表
```

### 问题 5：自增 id 删除后不连续

```
DELETE 删掉 id=5 的行后，再插入新数据，id 是 6，不会复用 5。
这是正常设计，保证 id 唯一性，避免引用混乱。

想让 id 重新从 1 开始（仅清空整表时）：
  TRUNCATE TABLE users;  -- 会重置自增 id
```

---

## 九、快速参考

### DELETE 语法总览

```sql
-- 1. 条件删除（最常用）
DELETE FROM 表名 WHERE 条件;

-- 2. 限量删除（分批清理）
DELETE FROM 表名 WHERE 条件 LIMIT 1000;

-- 3. 多表关联删除
DELETE a, b FROM 表a a JOIN 表b b ON a.id = b.aid WHERE ...;

-- 4. 用子查询删除
DELETE FROM 表名 WHERE 列 IN (SELECT ...);

-- 5. 清空整表（按需选）
DELETE FROM 表名;        -- 慢，可回滚，不重置 id
TRUNCATE TABLE 表名;     -- 快，不可回滚，重置 id
DROP TABLE 表名;         -- 连表结构一起删
```

### 删除前自检清单

```
□ 用同样的 WHERE 先 SELECT 看了一遍吗？
□ WHERE 条件用对字段了吗？
□ 有没有遗漏 LIMIT 分批？
□ 重要数据是否软删除而非硬删除？
□ 是否在事务里执行（方便回滚）？
□ 大批量删除前是否备份了？
```
