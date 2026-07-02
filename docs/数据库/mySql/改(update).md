# MySQL 改（UPDATE）

> 官方文档：[MySQL 8.0 - UPDATE Statement](https://dev.mysql.com/doc/refman/8.0/en/update.html)

## 什么是 UPDATE？

**UPDATE 就是修改表里已有的数据**，相当于在 Excel 里双击某个单元格，改掉里面的内容。

```
users 表
┌────┬────────┬─────┐
│ id │  name  │ age │
├────┼────────┼─────┤
│  1 │ 张三   │  20 │  ← 把 age 从 20 改成 21
│  2 │ 李四   │  25 │  ← 保留
└────┴────────┴─────┘

UPDATE users SET age = 21 WHERE id = 1;
```

> ⚠️ **最高警告：和 DELETE 一样，UPDATE 一定要带 WHERE 条件！** 不带条件会把整张表每一行都改掉。

---

## 一、基本语法

### 1.1 修改单列

```sql
-- UPDATE 表名 SET 列 = 新值 WHERE 条件;
UPDATE users SET age = 21 WHERE id = 1;  -- 把 id=1 的年龄改成 21
```

### 1.2 修改多列

```sql
-- 多列用逗号隔开（注意是逗号，不是 AND）
UPDATE users
SET age = 21, email = 'newzs@xx.com'
WHERE id = 1;
```

> ⚠️ **注意：** 多列之间用**逗号 `,`** 分隔，千万别写成 `SET age = 21 AND email = '...'`。

### 1.3 更新前先 SELECT 确认

```sql
-- 改之前先查一下，确认改的是目标行
SELECT * FROM users WHERE id = 1;

-- 确认后再改
UPDATE users SET age = 21 WHERE id = 1;
```

---

## 二、值的计算方式

### 2.1 基于原值做运算

```sql
-- 所有人年龄 +1（在原值基础上加 1）
UPDATE users SET age = age + 1 WHERE id = 1;

-- 价格打 8 折
UPDATE products SET price = price * 0.8 WHERE id = 100;
```

### 2.2 使用函数

```sql
-- 名字转大写
UPDATE users SET name = UPPER(name) WHERE id = 1;

-- 更新时间戳为当前时间
UPDATE users SET updated_at = NOW() WHERE id = 1;

-- 拼接字符串
UPDATE users SET name = CONCAT(name, '_vip') WHERE id = 1;
```

### 2.3 把列设为 NULL 或默认值

```sql
-- 清空某个字段（设为 NULL）
UPDATE users SET email = NULL WHERE id = 1;

-- 用 DEFAULT 关键字恢复默认值
UPDATE users SET age = DEFAULT WHERE id = 1;
```

---

## 三、按条件批量更新

```sql
-- 所有未成年用户标记为"未成年"
UPDATE users SET status = 'minor' WHERE age < 18;

-- 所有北京用户的等级 +1
UPDATE users SET level = level + 1 WHERE city = '北京';

-- 限制更新数量：只更新前 100 个（防止一次更新太多）
UPDATE users SET status = 'inactive'
WHERE last_login < '2024-01-01'
LIMIT 100;
```

---

## 四、关联另一张表更新（UPDATE JOIN）

当要更新的值来自另一张表时，用 `JOIN`。

### 4.1 基本写法

```sql
-- 根据 users_detail 表里的真实年龄，更新 users 表
UPDATE users u
JOIN users_detail d ON u.id = d.user_id
SET u.age = d.real_age;
```

### 4.2 只更新匹配的行

```sql
-- 给"有下单记录"的用户增加积分
UPDATE users u
JOIN orders o ON u.id = o.user_id
SET u.points = u.points + 10
WHERE o.created_at > '2025-01-01';
```

### 4.3 UPDATE 多张表

```sql
-- 同时更新两张表的数据
UPDATE users u
JOIN accounts a ON u.id = a.user_id
SET u.status = 'verified',
    a.balance = a.balance + 100
WHERE u.id = 1;
```

---

## 五、用子查询更新

```sql
-- 把每个用户的积分，更新为他的订单总数
UPDATE users u
SET u.points = (
    SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id
)
WHERE u.id = 1;
```

> ⚠️ **注意：** MySQL 不允许在子查询里直接 UPDATE 正在更新的那张表，需要套一层临时表，或改用 `JOIN` 写法。

---

## 六、CASE WHEN 批量按条件更新

一条语句里，根据不同条件把列更新成不同的值（比多次 UPDATE 高效）。

```sql
-- 根据年龄范围，一次性给所有用户设置等级
UPDATE users
SET level = CASE
    WHEN age < 18  THEN 'minor'
    WHEN age < 60  THEN 'adult'
    ELSE 'senior'
END;

-- 只更新部分行（加 WHERE 限制范围）
UPDATE users
SET status = CASE
    WHEN age >= 18 THEN 'adult'
    ELSE 'minor'
END
WHERE status IS NULL;
```

> 💡 **提示：** `CASE WHEN` 相当于 SQL 里的 `if/else`，一个 UPDATE 搞定多种情况，避免写好几条 UPDATE。

---

## 七、在 Java 中执行 UPDATE

### 7.1 JDBC 基本用法

```java
String sql = "UPDATE users SET age = ?, email = ? WHERE id = ?";

try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setInt(1, 21);              // SET age = ?
    ps.setString(2, "new@xx.com"); // SET email = ?
    ps.setInt(3, 1);               // WHERE id = ?

    int rows = ps.executeUpdate();  // 返回更新的行数
    if (rows > 0) {
        System.out.println("更新成功，影响 " + rows + " 行");
    } else {
        System.out.println("没更新到，可能 id 不存在");
    }
}
```

### 7.2 动态拼接更新字段（常见场景）

实际开发中，表单提交时可能只改了部分字段，需要**动态构造 SET 子句**：

```java
// ❌ 危险：字符串拼接 SQL，有注入风险
String sql = "UPDATE users SET name = '" + name + "' WHERE id = " + id;

// ✅ 安全：动态拼好"哪些列要更新"，值用占位符
List<String> sets = new ArrayList<>();
List<Object> params = new ArrayList<>();

if (name != null) {
    sets.add("name = ?");
    params.add(name);
}
if (age != null) {
    sets.add("age = ?");
    params.add(age);
}

if (!sets.isEmpty()) {
    String sql = "UPDATE users SET " + String.join(", ", sets) + " WHERE id = ?";
    params.add(id);

    try (PreparedStatement ps = conn.prepareStatement(sql)) {
        for (int i = 0; i < params.size(); i++) {
            ps.setObject(i + 1, params.get(i));
        }
        ps.executeUpdate();
    }
}
```

### 7.3 MyBatis 动态 SQL

```xml
<update id="updateUser" parameterType="User">
    UPDATE users
    <set>
        <if test="name != null">name = #{name},</if>
        <if test="age != null">age = #{age},</if>
        <if test="email != null">email = #{email},</if>
    </set>
    WHERE id = #{id}
</update>
```

> 💡 **提示：** MyBatis 的 `<set>` 标签会自动处理多余的逗号，非常方便。

---

## 八、安全防护：别改错数据

### 8.1 安全更新模式

```sql
-- 开启后，UPDATE 必须带 WHERE 且条件含索引列
SET sql_safe_updates = 1;

-- ❌ 此时这条会报错（没有 WHERE）
UPDATE users SET age = 21;

-- ❌ 也会报错（name 不是索引列）
UPDATE users SET age = 21 WHERE name = '张三';

-- ✅ 通过（id 是主键/索引）
UPDATE users SET age = 21 WHERE id = 1;
```

### 8.2 乐观锁（防止并发覆盖）

多个用户同时改同一条数据时，后改的会覆盖先改的。用**版本号**解决：

```sql
-- 表加一个 version 字段
-- 每次更新时检查 version 是否变化，并 +1
UPDATE users
SET age = 21, version = version + 1
WHERE id = 1 AND version = 5;  -- 只有 version 还是 5 才更新

-- 如果返回 0 行，说明数据已被别人改过，需要重新读取再更新
```

---

## 九、常见问题与注意事项

### 问题 1：忘了加 WHERE，整表数据被改

```sql
-- ❌ 这条把所有用户的年龄都改成 21
UPDATE users SET age = 21;

-- 救命：在事务里就 ROLLBACK
ROLLBACK;
```

### 问题 2：多列用了错误的分隔符

```sql
-- ❌ 用了 AND（语法错误）
UPDATE users SET age = 21 AND email = 'x' WHERE id = 1;

-- ✅ 用逗号
UPDATE users SET age = 21, email = 'x' WHERE id = 1;
```

### 问题 3：更新后值"莫名其妙"

```sql
-- 注意：UPDATE 是"覆盖"，不是"追加"
UPDATE users SET name = '李四' WHERE id = 1;
-- id=1 的 name 直接变成 "李四"，原来的 "张三" 没了
```

### 问题 4：更新大量数据导致锁表/超时

```sql
-- ❌ 一次更新几百万行，会长时间锁表，拖垮业务
UPDATE big_table SET status = 1 WHERE created_at < '2024-01-01';

-- ✅ 分批更新，每次一小批
UPDATE big_table SET status = 1
WHERE created_at < '2024-01-01' AND status = 0
LIMIT 5000;
-- 循环执行，每次 sleep 一下，减轻数据库压力
```

### 问题 5：UPDATE 不触发 INSERT 触发器

```
触发器区分时机：
  - BEFORE/AFTER INSERT  → INSERT 时触发
  - BEFORE/AFTER UPDATE  → UPDATE 时触发
  - BEFORE/AFTER DELETE  → DELETE 时触发

UPDATE 只会触发 UPDATE 触发器，不会触发 INSERT 的。
做数据联动时要选对触发器类型。
```

### 问题 6：字符串比较大小写问题

```sql
-- 取决于字段的排序规则（collation）
-- utf8mb4_general_ci：不区分大小写（ci = case insensitive）
UPDATE users SET status = 'vip' WHERE name = 'zhangsan';
-- 会匹配到 name 为 ZhangSan、ZHANGSAN 的行

-- 如果要区分大小写，用 BINARY 或 _bin 排序规则
UPDATE users SET status = 'vip' WHERE BINARY name = 'zhangsan';
```

---

## 十、快速参考

### UPDATE 语法总览

```sql
-- 1. 条件更新（最常用）
UPDATE 表名 SET 列 = 值 WHERE 条件;

-- 2. 多列更新
UPDATE 表名 SET 列1 = 值1, 列2 = 值2 WHERE 条件;

-- 3. 基于原值运算
UPDATE 表名 SET 列 = 列 + 1 WHERE 条件;

-- 4. 关联另一张表更新
UPDATE 表a a JOIN 表b b ON a.id = b.aid
SET a.列 = b.列 WHERE ...;

-- 5. CASE WHEN 批量按条件更新
UPDATE 表名 SET 列 = CASE
    WHEN 条件1 THEN 值1
    WHEN 条件2 THEN 值2
    ELSE 值3
END WHERE ...;

-- 6. 限量更新（分批）
UPDATE 表名 SET 列 = 值 WHERE 条件 LIMIT 1000;
```

### 更新前自检清单

```
□ 用同样的 WHERE 先 SELECT 看了一遍吗？
□ 多列之间用的是逗号吗？
□ WHERE 条件用对了吗？有没有漏掉？
□ 大批量更新是否分批 + LIMIT？
□ 高并发场景是否用了乐观锁？
□ 是否在事务里执行（重要更新可回滚）？
```
