# MySQL 查（SELECT）

> 官方文档：[MySQL 8.0 - SELECT Statement](https://dev.mysql.com/doc/refman/8.0/en/select.html)

## 什么是 SELECT？

**SELECT 就是"查数据"**，把表里的数据按你的要求找出来。这是数据库里**用得最多**的语句——绝大多数业务都是"读"多于"写"。

```
users 表
┌────┬────────┬─────┬────────┐
│ id │  name  │ age │  city  │
├────┼────────┼─────┼────────┤
│  1 │ 张三   │  20 │ 北京   │
│  2 │ 李四   │  25 │ 上海   │
│  3 │ 王五   │  30 │ 北京   │
│  4 │ 赵六   │  20 │ 广州   │
└────┴────────┴─────┴────────┘

SELECT name, age FROM users WHERE city = '北京';
-- 结果：找出所有北京用户的姓名和年龄
```

SELECT 是 MySQL 里功能最丰富、也最容易写错的语句，本文按"从简单到复杂"的顺序展开。

---

## 一、SELECT 完整语法与执行顺序（灵魂！）

### 1.1 完整语法骨架

```sql
SELECT    要查的列        -- 7️⃣ 最后才选出列
FROM      表名            -- 1️⃣ 先确定从哪张表查
[JOIN     关联表 ON ...]  --   关联其他表
WHERE     行级过滤条件     -- 2️⃣ 过滤行
GROUP BY  分组列          -- 3️⃣ 分组
HAVING    组级过滤条件     -- 4️⃣ 过滤分组
ORDER BY  排序列          -- 5️⃣（实际在 LIMIT 前后）排序
LIMIT     偏移, 数量;     -- 6️⃣ 分页截取
```

### 1.2 真实的执行顺序（必须记住）

**书写顺序**和**执行顺序**是不一样的，这是新手最常踩的坑：

```
书写顺序：  SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT
执行顺序：  FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
            ①       ②      ③        ④          ⑤        ⑥       ⑦        ⑧
```

**为什么要知道这个？** 因为它决定了**别名什么时候能用、WHERE 里能不能用聚合函数**：

```sql
-- ❌ 报错：WHERE 在 GROUP BY 之前执行，此时还没分组，不能用聚合函数 COUNT
SELECT city, COUNT(*) AS cnt
FROM users
WHERE cnt > 1        -- ❌ 别名和聚合都不能用在 WHERE
GROUP BY city;

-- ✅ 过滤分组结果要用 HAVING（在 GROUP BY 之后执行）
SELECT city, COUNT(*) AS cnt
FROM users
GROUP BY city
HAVING cnt > 1;      -- ✅ HAVING 里能用聚合函数
```

---

## 二、最基本的查询

### 2.1 查询所有列（SELECT *）

```sql
-- 查出 users 表的所有行、所有列
SELECT * FROM users;
```

> ⚠️ **注意：生产环境尽量避免 `SELECT *`！** 原因：
> - 查出不需要的列，浪费网络带宽和内存
> - 表加列后，`SELECT *` 结果变化，可能破坏程序
> - 无法利用"覆盖索引"优化，查询更慢
>
> **要查什么列，就写什么列名：** `SELECT id, name, age FROM users;`

### 2.2 查询指定列

```sql
-- 只查 name 和 age 两列
SELECT name, age FROM users;
```

### 2.3 给列起别名（AS）

```sql
-- 用 AS 给结果列起个更好看的名字
SELECT name AS 姓名, age AS 年龄 FROM users;
-- 结果列名显示为"姓名""年龄"

-- AS 可以省略
SELECT name 姓名, age 年龄 FROM users;
```

---

## 三、WHERE 条件过滤

`WHERE` 用来**筛选符合条件的行**，是查询里最核心的部分。

### 3.1 比较运算符

| 运算符 | 含义 | 示例 |
|-------|------|------|
| `=` | 等于 | `WHERE age = 20` |
| `<>` 或 `!=` | 不等于 | `WHERE age <> 20` |
| `>` `<` `>=` `<=` | 大小比较 | `WHERE age > 18` |
| `BETWEEN a AND b` | 在 a 和 b 之间（含两端） | `WHERE age BETWEEN 18 AND 60` |
| `IN (v1, v2)` | 在指定集合里 | `WHERE city IN ('北京','上海')` |
| `NOT IN (...)` | 不在集合里 | `WHERE city NOT IN ('北京')` |
| `IS NULL` | 是空值 | `WHERE email IS NULL` |
| `IS NOT NULL` | 不是空值 | `WHERE email IS NOT NULL` |

```sql
SELECT * FROM users WHERE age > 18;
SELECT * FROM users WHERE age BETWEEN 18 AND 60;
SELECT * FROM users WHERE city IN ('北京', '上海', '广州');
```

> ⚠️ **注意：判断 NULL 必须用 `IS NULL`，不能用 `= NULL`！**
> ```sql
> WHERE email = NULL    -- ❌ 永远查不到结果（NULL 不参与 = 比较）
> WHERE email IS NULL   -- ✅ 正确
> ```

### 3.2 逻辑运算符（AND / OR / NOT）

```sql
-- AND：两个条件都满足
SELECT * FROM users WHERE city = '北京' AND age > 18;

-- OR：满足任意一个条件
SELECT * FROM users WHERE city = '北京' OR city = '上海';

-- NOT：取反
SELECT * FROM users WHERE NOT city = '北京';
```

**优先级问题（用括号消除歧义）：**

```sql
-- ❌ 想查"北京或上海"且年龄大于18的人，但 AND 优先级高于 OR
SELECT * FROM users WHERE city = '北京' OR city = '上海' AND age > 18;
-- 实际含义：city='北京' OR (city='上海' AND age>18)

-- ✅ 用括号明确意图
SELECT * FROM users WHERE (city = '北京' OR city = '上海') AND age > 18;
```

> 💡 **提示：涉及 AND 和 OR 混用时，永远加括号**，避免优先级坑。

### 3.3 模糊查询 LIKE

```sql
-- % 匹配任意数量字符（含 0 个）
SELECT * FROM users WHERE name LIKE '张%';   -- 姓"张"的（张三、张三丰）
SELECT * FROM users WHERE name LIKE '%三';   -- 名字以"三"结尾
SELECT * FROM users WHERE name LIKE '%三%';  -- 名字含"三"

-- _ 匹配单个字符
SELECT * FROM users WHERE name LIKE '张_';   -- "张"开头且共2个字（张三，不含张三丰）
```

| 通配符 | 含义 | 类比 |
|-------|------|------|
| `%` | 任意多个字符 | 正则的 `.*` |
| `_` | 恰好一个字符 | 正则的 `.` |

> ⚠️ **注意：** `LIKE '%关键词%'`（前面带 `%`）**用不上索引**，会全表扫描，数据量大时很慢。
> - `LIKE '张%'`（只有后面 `%`）可以用索引 ✅
> - `LIKE '%张%'`（前面 `%`）用不上索引 ❌

### 3.4 去重 DISTINCT

```sql
-- 查询所有不同的城市（去掉重复）
SELECT DISTINCT city FROM users;

-- 多列去重：city + age 组合不重复
SELECT DISTINCT city, age FROM users;
```

---

## 四、排序 ORDER BY

```sql
-- 按年龄升序（ASC 是默认，可省略）
SELECT * FROM users ORDER BY age ASC;

-- 按年龄降序
SELECT * FROM users ORDER BY age DESC;

-- 多列排序：先按城市升序，城市相同的再按年龄降序
SELECT * FROM users ORDER BY city ASC, age DESC;
```

| 关键字 | 含义 |
|-------|------|
| `ASC` | 升序（从小到大，默认） |
| `DESC` | 降序（从大到小） |

```sql
-- 结合 WHERE：先过滤再排序
SELECT * FROM users WHERE city = '北京' ORDER BY age DESC;
```

> ⚠️ **注意：** 中文字符串排序默认按编码，不是按拼音。要按拼音排需指定排序规则或用 `CONVERT(name USING gbk)`。

---

## 五、分页 LIMIT

```sql
-- 每页 10 条，取第 1 页
SELECT * FROM users LIMIT 10;

-- 每页 10 条，取第 2 页（跳过前 10 条）
SELECT * FROM users LIMIT 10, 10;     -- 偏移量, 数量
-- 或写法：
SELECT * FROM users LIMIT 10 OFFSET 10;
```

### 分页公式

```sql
-- 第 page 页，每页 pageSize 条
-- 偏移量 = (page - 1) * pageSize
SELECT * FROM users LIMIT (page - 1) * pageSize, pageSize;

-- 例：第 3 页，每页 10 条 → 偏移 20
SELECT * FROM users ORDER BY id LIMIT 20, 10;
```

> ⚠️ **深分页性能坑：** `LIMIT 1000000, 10` 会先扫描前 100 万行再丢弃，非常慢。
> **优化方案（记录上一页的最大 id）：**
> ```sql
> -- ❌ 慢：深分页
> SELECT * FROM users ORDER BY id LIMIT 1000000, 10;
>
> -- ✅ 快：假设上一页最后一条 id = 1000000
> SELECT * FROM users WHERE id > 1000000 ORDER BY id LIMIT 10;
> ```

---

## 六、聚合函数

聚合函数把多行数据"压缩"成一个值。

| 函数 | 作用 | 示例 |
|-----|------|------|
| `COUNT(*)` | 统计行数 | `SELECT COUNT(*) FROM users;` |
| `COUNT(列)` | 统计该列非 NULL 的数量 | `COUNT(email)` |
| `SUM(列)` | 求和 | `SUM(price)` |
| `AVG(列)` | 平均值 | `AVG(age)` |
| `MAX(列)` | 最大值 | `MAX(age)` |
| `MIN(列)` | 最小值 | `MIN(age)` |

```sql
SELECT
    COUNT(*)      AS 总人数,
    AVG(age)      AS 平均年龄,
    MAX(age)      AS 最大年龄,
    MIN(age)      AS 最小年龄
FROM users;
```

### COUNT 的三种写法区别

```sql
COUNT(*)      -- 统计所有行（包括 NULL），最常用 ✅
COUNT(1)      -- 和 COUNT(*) 等价，统计所有行
COUNT(列名)   -- 只统计该列非 NULL 的行数
COUNT(DISTINCT 列名)  -- 统计该列不重复的非 NULL 值数量
```

> 💡 **提示：** InnoDB 下 `COUNT(*)` 和 `COUNT(1)` 性能基本一样，优化器会自动选最优索引。日常用 `COUNT(*)` 最直观。

---

## 七、分组 GROUP BY 与 HAVING

### 7.1 按某列分组统计

```sql
-- 统计每个城市有多少人
SELECT city, COUNT(*) AS 人数
FROM users
GROUP BY city;
```

```
结果：
┌────────┬──────┐
│  city  │ 人数 │
├────────┼──────┤
│ 北京   │   2  │
│ 上海   │   1  │
│ 广州   │   1  │
└────────┴──────┘
```

### 7.2 分组 + 多个聚合

```sql
-- 每个城市的：人数、平均年龄、最大年龄
SELECT
    city,
    COUNT(*)   AS 人数,
    AVG(age)   AS 平均年龄,
    MAX(age)   AS 最大年龄
FROM users
GROUP BY city;
```

### 7.3 HAVING 过滤分组（重点）

`WHERE` 过滤的是**行**（分组前），`HAVING` 过滤的是**组**（分组后）。

```sql
-- 找出人数大于 1 的城市
SELECT city, COUNT(*) AS 人数
FROM users
GROUP BY city
HAVING COUNT(*) > 1;
-- 或 HAVING 人数 > 1（MySQL 支持用别名）
```

### WHERE vs HAVING

| 对比项 | WHERE | HAVING |
|-------|-------|--------|
| 作用 | 过滤**行** | 过滤**分组** |
| 执行时机 | 分组**前** | 分组**后** |
| 能用聚合函数吗 | ❌ 不能 | ✅ 能 |
| 能用列别名吗 | ❌ | ✅（MySQL 支持） |

```sql
-- 组合：先用 WHERE 筛掉未成年，再按城市分组，最后 HAVING 筛掉人数<=1的
SELECT city, COUNT(*) AS cnt
FROM users
WHERE age >= 18          -- ① 先过滤行
GROUP BY city            -- ② 分组
HAVING cnt > 1;          -- ③ 再过滤组
```

---

## 八、连接查询 JOIN（重点）

`JOIN` 用来**把多张表按某种关系拼在一起**。因为数据通常拆分在多张表（如用户表 + 订单表），查询时要连起来。

### 8.1 准备第二张表

```sql
-- 订单表，通过 user_id 关联 users 表
CREATE TABLE orders (
    id      INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,            -- 关联 users.id
    amount  DECIMAL(10,2),  -- 订单金额
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 8.2 四种 JOIN 的区别（一图看懂）

```
假设：左表 users（用户），右表 orders（订单）
      有些用户没下过单，有些订单（异常）没有对应用户

INNER JOIN（内连接）：两边都有匹配的，才保留
      [用户] ∩ [订单]   （交集）

LEFT  JOIN（左连接）：以左表为主，右表没匹配的补 NULL
      [用户] 全保留 + 匹配的订单

RIGHT JOIN（右连接）：以右表为主，左表没匹配的补 NULL
      [订单] 全保留 + 匹配的用户

CROSS JOIN（交叉连接）：笛卡尔积，左表每行 × 右表每行
      [用户] × [订单]   （慎用，结果爆炸）
```

### 8.3 INNER JOIN 内连接（最常用）

```sql
-- 查询每个用户和他的订单
SELECT u.name, o.amount, o.id AS order_id
FROM users u
INNER JOIN orders o ON u.id = o.user_id;
-- 只返回"有订单的用户"（交集）
```

### 8.4 LEFT JOIN 左连接

```sql
-- 查询所有用户，及他们的订单（没下过单的用户也列出，订单字段为 NULL）
SELECT u.name, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- 左表(users)全部保留，右表(orders)没匹配的补 NULL
```

**经典用法：用 LEFT JOIN 找"没有匹配"的数据**

```sql
-- 找出"从未下过单"的用户
SELECT u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;   -- 右表字段为 NULL，说明没匹配到订单
```

### 8.5 多表连接

```sql
-- 三表连接：用户 + 订单 + 商品
SELECT u.name, o.id AS order_id, p.name AS product
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN products p ON o.product_id = p.id;
```

### JOIN 类型对比

| JOIN | 结果 | 用途 |
|------|------|------|
| `INNER JOIN` | 两表都有匹配的行 | 只要相关的 |
| `LEFT JOIN` | 左表全保留，右表补 NULL | 以左为主（最常用） |
| `RIGHT JOIN` | 右表全保留，左表补 NULL | 以右为主（少用，可改写成 LEFT） |
| `CROSS JOIN` | 笛卡尔积（m×n 行） | 组合所有情况 |

> 💡 **提示：** `JOIN` 默认就是 `INNER JOIN`，写 `JOIN` 即可。

---

## 九、子查询

子查询是**查询里嵌套的查询**，把一个查询的结果当作另一个查询的输入。

### 9.1 用在 WHERE 里

```sql
-- 查询"年龄大于平均年龄"的用户
SELECT * FROM users
WHERE age > (SELECT AVG(age) FROM users);

-- 查询"下过单"的用户（用 IN）
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders);

-- 查询"没下过单"的用户（用 NOT IN）
SELECT * FROM users
WHERE id NOT IN (SELECT user_id FROM orders WHERE user_id IS NOT NULL);
```

### 9.2 用在 FROM 里（派生表）

```sql
-- 把"每个城市的平均年龄"当作一张临时表，再筛选
SELECT t.city, t.avg_age
FROM (
    SELECT city, AVG(age) AS avg_age
    FROM users
    GROUP BY city
) t
WHERE t.avg_age > 20;
```

### 9.3 EXISTS 用法（性能更好）

```sql
-- 查询"下过单"的用户，用 EXISTS（关联子查询，通常比 IN 快）
SELECT * FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

### IN vs EXISTS

```sql
-- IN：先执行子查询，再拿结果去外层匹配
-- 适合：子查询结果集小的情况

-- EXISTS：外层每行都去子查询里"看一眼有没有"
-- 适合：外层结果集小，或子查询表大且有索引的情况

-- 经验：子查询表小用 IN，子查询表大用 EXISTS
```

---

## 十、UNION 合并结果集

`UNION` 把多个 `SELECT` 的结果**上下拼接**成一张表（要求列数和类型一致）。

```sql
-- 把"北京用户"和"上海用户"合并
SELECT name, city FROM users WHERE city = '北京'
UNION
SELECT name, city FROM users WHERE city = '上海';
```

### UNION vs UNION ALL

| 关键字 | 是否去重 | 性能 |
|-------|---------|------|
| `UNION` | ✅ 去重（自动排序去重） | 慢 |
| `UNION ALL` | ❌ 不去重（保留所有） | 快 |

```sql
-- 明确知道没有重复数据，或不需要去重时，用 UNION ALL 更快
SELECT name FROM users
UNION ALL
SELECT name FROM blacklist;
```

> 💡 **提示：** 不需要去重就用 `UNION ALL`，省去排序去重的开销。

---

## 十一、常用字符串与日期函数

### 字符串函数

```sql
SELECT CONCAT('姓名:', name, ', 年龄:', age) FROM users;  -- 拼接
SELECT LENGTH(name)        FROM users;   -- 字符串长度（字节数）
SELECT CHAR_LENGTH(name)   FROM users;   -- 字符数（中文按1算）
SELECT UPPER('abc');                    -- ABC，转大写
SELECT LOWER('ABC');                    -- abc，转小写
SELECT SUBSTRING('Hello', 1, 3);        -- Hel，截取（从第1位取3个）
SELECT TRIM('  abc  ');                 -- abc，去两端空格
SELECT REPLACE('abc','b','B');          -- aBc，替换
```

### 日期函数

```sql
SELECT NOW();              -- 当前日期时间 2026-07-02 12:00:00
SELECT CURDATE();          -- 当前日期 2026-07-02
SELECT CURTIME();          -- 当前时间 12:00:00
SELECT YEAR(NOW());        -- 年份 2026
SELECT DATE_FORMAT(created_at, '%Y-%m-%d') FROM users;  -- 格式化日期
SELECT DATEDIFF('2026-07-02', '2026-01-01');  -- 相差天数 182
```

---

## 十二、在 Java 中执行查询

### 12.1 JDBC 基本用法

```java
String sql = "SELECT id, name, age FROM users WHERE city = ? AND age > ?";

try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, "北京");
    ps.setInt(2, 18);

    try (ResultSet rs = ps.executeQuery()) {  // 查询用 executeQuery
        while (rs.next()) {                   // 遍历每一行
            int id = rs.getInt("id");
            String name = rs.getString("name");
            int age = rs.getInt("age");
            System.out.println(id + " " + name + " " + age);
        }
    }
}
```

> ⚠️ **注意：查询用 `executeQuery()`（返回 ResultSet），增删改用 `executeUpdate()`（返回影响行数）。别用错了。**

### 12.2 MyBatis 查询

```xml
<select id="findByCity" resultType="User">
    SELECT id, name, age FROM users
    WHERE city = #{city}
    <if test="minAge != null">
        AND age &gt;= #{minAge}   <!-- XML 里 > 要写成 &gt; -->
    </if>
    ORDER BY id DESC
</select>
```

```java
List<User> users = userMapper.findByCity("北京");
```

### 12.3 动态条件查询（MyBatis）

```xml
<select id="search" resultType="User">
    SELECT * FROM users
    <where>
        <if test="city != null">AND city = #{city}</if>
        <if test="minAge != null">AND age &gt;= #{minAge}</if>
        <if test="name != null">AND name LIKE CONCAT('%', #{name}, '%')</if>
    </where>
    ORDER BY id
</select>
```

> 💡 **提示：** `<where>` 标签会自动去掉多余的 `AND`，`LIKE` 拼接用 `CONCAT` 函数，不用字符串拼接（防注入）。

---

## 十三、查询性能优化

### 13.1 永远别用 SELECT *

```sql
-- ❌ 慢，查出无用列
SELECT * FROM users WHERE city = '北京';

-- ✅ 只查需要的列，可能走"覆盖索引"
SELECT id, name FROM users WHERE city = '北京';
```

### 13.2 给 WHERE / JOIN / ORDER BY 的列加索引

```sql
-- 经常按 city 查询，就给 city 加索引
CREATE INDEX idx_city ON users(city);

-- 经常按 (city, age) 组合查询，加联合索引
CREATE INDEX idx_city_age ON users(city, age);
```

### 13.3 用 EXPLAIN 看执行计划

```sql
-- 在 SELECT 前加 EXPLAIN，查看 MySQL 怎么执行这条查询
EXPLAIN SELECT * FROM users WHERE city = '北京';
```

重点看几个字段：

| 字段 | 关注点 |
|-----|--------|
| `type` | `ALL`=全表扫描（慢）；`ref`/`range`=用上索引（好） |
| `key` | 实际用的索引名；`NULL`=没用索引 |
| `rows` | 预估扫描行数，越少越好 |
| `Extra` | `Using index`=覆盖索引（好）；`Using filesort`=额外排序（差） |

### 13.4 常见让索引失效的写法

```sql
-- ❌ 对索引列用函数，索引失效
WHERE YEAR(created_at) = 2026
-- ✅ 改成范围查询
WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01'

-- ❌ 对索引列做运算，索引失效
WHERE age + 1 = 20
-- ✅ 移到等号右边
WHERE age = 19

-- ❌ 左模糊，索引失效
WHERE name LIKE '%张'
-- ✅ 右模糊可以用索引
WHERE name LIKE '张%'

-- ❌ 隐式类型转换（字段是字符串，传了数字），索引失效
WHERE phone = 13800138000      -- phone 是 varchar
-- ✅ 类型匹配
WHERE phone = '13800138000'
```

---

## 十四、常见问题与注意事项

### 问题 1：聚合查询和非聚合列混用

```sql
-- ❌ 错误逻辑：选出 city 和"所有人最大年龄"，city 没分组，结果不确定
SELECT city, MAX(age) FROM users;

-- ✅ 要么把 city 也分组
SELECT city, MAX(age) FROM users GROUP BY city;
```

### 问题 2：NULL 的各种坑

```sql
-- NULL 参与运算/比较，结果都是 NULL（不是 false）
SELECT * FROM users WHERE age != 20;   -- age 为 NULL 的行查不出来！
-- NULL 不等于任何值，连"不等于"都不成立

-- 统计时注意 NULL
COUNT(*)        -- 包含 NULL 行
COUNT(age)      -- 不包含 age 为 NULL 的行
```

### 问题 3：分页数据重复或丢失

```sql
-- ❌ 没有 ORDER BY 的分页，结果顺序不保证，可能重复/丢失
SELECT * FROM users LIMIT 10, 10;

-- ✅ 分页一定要配合稳定的排序（最好是唯一列）
SELECT * FROM users ORDER BY id LIMIT 10, 10;
```

### 问题 4：GROUP BY 后选出非分组列

```sql
-- 严格模式下报错（only_full_group_by）
SELECT city, name FROM users GROUP BY city;  -- name 怎么取？

-- ✅ 用聚合函数明确取值
SELECT city, ANY_VALUE(name) FROM users GROUP BY city;
SELECT city, MAX(name) FROM users GROUP BY city;
```

---

## 十五、快速参考

### SELECT 完整模板

```sql
SELECT
    列1, 列2, 聚合函数(...)        -- 想要哪些列
FROM
    主表 别名
    [JOIN 关联表 别名 ON 关联条件]  -- 关联
WHERE
    行级过滤条件                     -- 过滤行
GROUP BY
    分组列                          -- 分组
HAVING
    组级过滤条件                     -- 过滤分组
ORDER BY
    排序列 [ASC|DESC]               -- 排序
LIMIT
    偏移量, 数量;                    -- 分页
```

### 查询思路清单

```
□ 要查哪些列？（SELECT）
□ 从哪些表查？要不要关联？（FROM / JOIN）
□ 要满足什么条件？（WHERE）
□ 要不要分组统计？（GROUP BY / 聚合）
□ 分组后还要筛选吗？（HAVING）
□ 结果怎么排序？（ORDER BY）
□ 要分页吗？（LIMIT）
□ 性能怎样？（EXPLAIN，索引是否生效）
```
