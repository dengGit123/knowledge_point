# MySQL 索引（Index）

> 官方文档：[MySQL 8.0 - Optimization and Indexes](https://dev.mysql.com/doc/refman/8.0/en/optimization.html) / [CREATE INDEX](https://dev.mysql.com/doc/refman/8.0/en/create-index.html)

## 什么是索引？

**索引就像是书的"目录"**：没有目录时，找一个知识点要逐页翻遍整本书（全表扫描）；有目录时，先查目录定位到页码，直接翻过去（索引查找）。

```
users 表（100 万行）

没有索引时查 name='张三'：
  从第 1 行翻到第 100 万行，逐个比对 → 慢（全表扫描）

给 name 加索引后：
  先在"目录"里查到 name='张三' 在第 50 行 → 直接定位 → 快 ✅
```

| 对比 | 无索引 | 有索引 |
|-----|--------|--------|
| 查找方式 | 全表扫描（逐行比对） | B+树二分查找 |
| 查 100 万行 | ~100 万次比较 | ~20 次比较 |
| 速度 | 慢 | 快 |
| 代价 | 查询慢 | 占用额外磁盘、增删改变慢（要维护索引） |

> 💡 **核心权衡：** 索引让**查询变快**，但让**增删改变慢**（每次修改数据都要同步更新索引），还要占额外空间。**所以索引不是越多越好**，要加在"经常查询"的列上。

---

## 一、索引的底层结构：B+ 树

InnoDB 的索引底层是 **B+ 树（B+ Tree）**。理解它，才能理解为什么索引快、为什么有"最左前缀"。

### 1.1 B+ 树长什么样

```
                    [根节点]
                   /    |    \
              [中间节点们]（非叶子，只存"路标"）
              /     |     \
        [叶子节点] → [叶子节点] → [叶子节点]  ← 用链表串起来
       (存真实数据)            (存真实数据)
```

**关键特点：**

1. **数据只存在叶子节点**，非叶子节点只存"索引值 + 指针"，用来指路
2. **叶子节点之间用双向链表连接**，范围查询（如 `WHERE age > 18`）极快
3. **树很矮**：100 万行数据，B+ 树大约只要 3 层，查任意一行最多 3 次磁盘 IO

### 1.2 为什么用 B+ 树而不是其他

| 数据结构 | 问题 |
|---------|------|
| 二叉搜索树 | 数据多了树很高，磁盘 IO 次数多 |
| 哈希表 | 等值查询快，但**不支持范围查询、排序** |
| **B+ 树** | **矮胖、叶子链表支持范围查询、排序** ✅ |

> 💡 **提示：** 这就是为什么 MySQL 索引**默认用 B+ 树**，而不是哈希索引（哈希索引只适合 `= !=` 等值查询）。

---

## 二、聚簇索引 vs 非聚簇索引（二级索引）

这是 InnoDB 索引**最核心的概念**，必须搞懂。

### 2.1 聚簇索引（Clustered Index）

> **叶子节点直接存"整行数据"**的索引。**一张表只能有一个**聚簇索引（数据只能按一种顺序物理存放）。

- InnoDB 的**主键**就是聚簇索引
- 数据**按主键顺序**物理存储

```
聚簇索引（主键 id）的叶子节点：
  [id=1] → (id=1, name=张三, age=20, ...)   ← 整行数据
  [id=2] → (id=2, name=李四, age=25, ...)
```

### 2.2 非聚簇索引 / 二级索引（Secondary Index）

> **叶子节点存的是"索引列值 + 主键值"**，不存整行数据。一张表可以有多个。

- 给 `name`、`email` 等非主键列建的索引都是二级索引

```
二级索引（name 列）的叶子节点：
  [name=李四] → id=2   ← 只存主键，不存整行
  [name=张三] → id=1
```

### 2.3 回表（重点！）

用二级索引查到"主键 id"后，**还要回到聚簇索引里查整行数据**，这个过程叫**回表**。

```
查询：SELECT * FROM users WHERE name = '张三';

第 1 步：查 name 二级索引 → 得到 id = 1
第 2 步：拿着 id=1 回到聚簇索引 → 得到整行数据  ← 这就是"回表"
```

> ⚠️ **注意：** 回表意味着**多一次树查找**。如果查询很频繁且总回表，性能会有损耗。**用"覆盖索引"可以避免回表**（见下文）。

### 2.4 两者对比

| 对比 | 聚簇索引 | 二级索引 |
|-----|---------|---------|
| 叶子节点存什么 | **整行数据** | 索引列 + 主键 |
| 一张表几个 | **只能 1 个**（主键） | 可以多个 |
| 查找方式 | 直接拿到数据 | 先查到主键，再**回表** |
| 默认是谁 | InnoDB 主键 | 非主键列建的索引 |

> 💡 **提示：** 这也是为什么**主键最好用自增整数**：自增主键插入时顺序追加，B+ 树叶子节点不会频繁分裂移动，写入性能好。

---

## 三、索引的类型

### 3.1 主键索引（PRIMARY KEY）

```sql
-- 建表时定义主键（自动创建聚簇索引）
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50)
);

-- 每个表只能有一个主键，值唯一且非空
```

### 3.2 唯一索引（UNIQUE）

```sql
-- 列值不能重复（允许一个 NULL）
CREATE TABLE users (
    email VARCHAR(100) UNIQUE   -- 既是约束，也是索引
);

-- 给已有表加
ALTER TABLE users ADD UNIQUE INDEX uk_email (email);
```

### 3.3 普通索引（INDEX / KEY）

```sql
-- 最普通的索引，无约束，加速查询用
CREATE INDEX idx_name ON users(name);

-- 建表时加
CREATE TABLE users (
    ...,
    INDEX idx_name (name)
);
```

### 3.4 联合索引 / 复合索引（多列索引）

```sql
-- 给 (city, age) 两列建一个联合索引
CREATE INDEX idx_city_age ON users(city, age);
```

> ⚠️ **注意：** 联合索引有**顺序**，顺序决定了"最左前缀原则"（见下文）。`(city, age)` 和 `(age, city)` 是**不同**的索引。

### 3.5 全文索引（FULLTEXT）

```sql
-- 用于全文搜索（大段文本的关键词搜索，如文章内容）
CREATE FULLTEXT INDEX ft_content ON articles(content);

SELECT * FROM articles WHERE MATCH(content) AGAINST('数据库');
```

### 类型对比

| 类型 | 关键字 | 作用 | 唯一性 |
|-----|--------|------|--------|
| 主键索引 | `PRIMARY KEY` | 唯一标识每行 | ✅ 唯一且非空 |
| 唯一索引 | `UNIQUE` | 保证列值不重复 | ✅ 唯一 |
| 普通索引 | `INDEX` / `KEY` | 加速查询 | ❌ |
| 联合索引 | `INDEX(a, b)` | 多列组合加速 | 取决于定义 |
| 全文索引 | `FULLTEXT` | 文本关键词搜索 | ❌ |

---

## 四、联合索引的"最左前缀原则"（高频考点）

联合索引 `(a, b, c)` 实际上是按 `a → b → c` 的顺序组织的 B+ 树。**只有从最左边的列开始连续匹配，索引才能生效。**

### 4.1 哪些能用上索引

假设有联合索引 `idx_abc (a, b, c)`：

| 查询条件 | 能否用上索引 | 说明 |
|---------|:----------:|------|
| `WHERE a = 1` | ✅ | 用到 a |
| `WHERE a = 1 AND b = 2` | ✅ | 用到 a, b |
| `WHERE a = 1 AND b = 2 AND c = 3` | ✅ | 用到 a, b, c |
| `WHERE b = 2` | ❌ | 缺少最左列 a |
| `WHERE b = 2 AND c = 3` | ❌ | 缺少最左列 a |
| `WHERE a = 1 AND c = 3` | ⚠️ 部分 | 只用到 a（中间断了 b） |

### 4.2 范围查询会让后面的列失效

```sql
-- idx_abc (a, b, c)
-- a 用上索引；a 是范围，b、c 失效
WHERE a > 1 AND b = 2 AND c = 3   -- 只用到 a

-- a 等值、b 等值、c 范围
WHERE a = 1 AND b = 2 AND c > 3   -- 用到 a, b, c ✅（c 在最后，范围查询 OK）
```

> ⚠️ **注意：** `>`、`<`、`BETWEEN`、`LIKE 'x%'` 等范围查询会**打断**联合索引后续列的使用。**把范围查询的列尽量放在联合索引最后。**

### 4.3 一个经典优化：把区分度高的列放前面

```sql
-- 哪个建得更好？
INDEX idx1 (sex, age)        -- sex 只有男女，区分度低 ❌
INDEX idx2 (age, sex)        -- age 值多样，区分度高 ✅
```

> 💡 **提示：** 联合索引建议把**区分度高（值种类多）**、**经常等值查询**的列放前面，范围查询的列放后面。

---

## 五、覆盖索引（避免回表）

如果**查询的列全部包含在索引里**，就不用回表了，直接从索引就能拿到结果，这叫**覆盖索引**。

```sql
-- 有联合索引 idx_city_age (city, age)

-- ❌ 要回表：查了 name，但索引里没有 name
SELECT name, age FROM users WHERE city = '北京';
-- 先查索引得 id → 回表查 name

-- ✅ 覆盖索引：查的列(city, age)都在索引里，不回表
SELECT city, age FROM users WHERE city = '北京';

-- ✅ 覆盖索引：查主键 id（二级索引叶子节点本来就有主键）
SELECT id, city FROM users WHERE city = '北京';
```

> 💡 **提示：** `EXPLAIN` 看到 `Extra: Using index` 就说明用了覆盖索引，性能很好。**这就是为什么强调不要 `SELECT *`**——只查需要的列，更容易命中覆盖索引。

---

## 六、索引的创建与管理

### 6.1 创建索引

```sql
-- 方式一：CREATE INDEX（建表后）
CREATE INDEX idx_name ON users(name);
CREATE UNIQUE INDEX uk_email ON users(email);
CREATE INDEX idx_city_age ON users(city, age);

-- 方式二：ALTER TABLE
ALTER TABLE users ADD INDEX idx_name (name);
ALTER TABLE users ADD PRIMARY KEY (id);
ALTER TABLE users ADD UNIQUE KEY uk_email (email);
```

### 6.2 查看表的索引

```sql
SHOW INDEX FROM users;
-- 重点关注：
--   Key_name   索引名
--   Column_name 哪一列
--   Non_unique  0=唯一，1=非唯一
--   Seq_in_index 联合索引中的顺序
```

### 6.3 删除索引

```sql
DROP INDEX idx_name ON users;
-- 或
ALTER TABLE users DROP INDEX idx_name;
```

### 6.4 什么时候该加索引

```
✅ 建议加索引：
  - WHERE 条件经常用的列
  - JOIN 的连接列（ON 两边的列）
  - ORDER BY / GROUP BY 的列
  - 需要唯一约束的列

❌ 不建议加索引：
  - 数据量很小的表（几百行，全表扫描也快）
  - 很少查询、经常增删改的列
  - 区分度极低的列（如性别，只有男女）
  - 频繁更新的列（索引维护成本高）
```

---

## 七、用 EXPLAIN 分析索引（必会）

在 SQL 前加 `EXPLAIN`，查看 MySQL 实际怎么执行、有没有用索引。

```sql
EXPLAIN SELECT * FROM users WHERE city = '北京';
```

### 重点看的字段

| 字段 | 含义 | 重点关注 |
|-----|------|---------|
| **type** | 访问类型 | `ALL`=全表扫描❌；`index`=扫整个索引；`range`=范围；`ref`=等值匹配✅；`const`=主键等值，最快✅ |
| **key** | 实际用的索引 | `NULL`=没用索引❌ |
| **rows** | 预估扫描行数 | 越少越好 |
| **key_len** | 使用的索引长度 | 判断联合索引用了几列 |
| **Extra** | 额外信息 | `Using index`=覆盖索引✅；`Using filesort`=额外排序❌；`Using temporary`=用临时表❌ |

### type 好坏排序（从好到差）

```
system > const > eq_ref > ref > range > index > ALL
 快 --------------------------------------------------→ 慢
（至少要达到 range / ref 级别，看到 ALL 就要优化）
```

```sql
-- ❌ type=ALL，全表扫描
EXPLAIN SELECT * FROM users WHERE name + 1 = 2;

-- ✅ type=ref，用了索引
EXPLAIN SELECT * FROM users WHERE name = '张三';
```

---

## 八、索引失效的常见场景（高频面试题）

明明建了索引，查询却不用，往往是这些原因：

### 8.1 对索引列使用函数或运算

```sql
-- ❌ 对列用了函数 YEAR()，索引失效
WHERE YEAR(created_at) = 2026

-- ✅ 改成范围查询
WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01'

-- ❌ 对列做运算
WHERE age * 2 = 40

-- ✅ 运算移到右边
WHERE age = 20
```

### 8.2 隐式类型转换

```sql
-- phone 是 VARCHAR，却传了数字
WHERE phone = 13800138000      -- ❌ MySQL 隐式转换，索引失效
WHERE phone = '13800138000'    -- ✅ 类型匹配，用上索引
```

### 8.3 左模糊 LIKE '%xx'

```sql
WHERE name LIKE '张%'    -- ✅ 右模糊，可以用索引
WHERE name LIKE '%张'    -- ❌ 左模糊，索引失效
WHERE name LIKE '%张%'   -- ❌ 两边模糊，索引失效
```

### 8.4 OR 连接的条件有一侧没索引

```sql
-- 假设 name 有索引，age 没有
WHERE name = '张三' OR age = 20   -- ❌ OR 两侧必须都有索引才生效
```

### 8.5 不符合最左前缀（联合索引）

```sql
-- idx_abc(a, b, c)
WHERE b = 2   -- ❌ 缺最左列 a
```

### 8.6 使用 != 或 NOT

```sql
WHERE age != 20     -- 通常不走索引（要扫大部分数据）
-- 这种"否定条件"一般优化器会放弃索引
```

> 💡 **提示：** 不是说这些写法一定失效，而是**优化器判断"用索引还不如全表扫"时会放弃索引**。最终以 `EXPLAIN` 结果为准。

### 索引失效速查表

| 场景 | 是否失效 |
|-----|:--------:|
| 对索引列用函数 | ❌ |
| 对索引列做运算 | ❌ |
| 隐式类型转换 | ❌ |
| `LIKE '%xxx'` 左模糊 | ❌ |
| `LIKE 'xxx%'` 右模糊 | ✅ |
| OR 一侧无索引 | ❌ |
| 不符合最左前缀 | ❌ |
| `!=` / `NOT IN` | 通常 ❌ |
| `IS NULL` / `IS NOT NULL` | ✅（视数据而定） |

---

## 九、索引优化实战技巧

### 9.1 前缀索引（长字符串优化）

```sql
-- email 很长，全列建索引占空间。只对前 6 个字符建索引
ALTER TABLE users ADD INDEX idx_email (email(6));
```

> ⚠️ **注意：** 前缀索引**不能用于覆盖索引**，也**不能用于 ORDER BY / GROUP BY**。

### 9.2 用覆盖索引减少回表

```sql
-- ❌ 查 name，要回表
SELECT name FROM users WHERE city = '北京';

-- ✅ 把 name 加入联合索引 idx(city, name)，覆盖索引，不回表
```

### 9.3 深分页用游标代替 LIMIT

```sql
-- ❌ LIMIT 1000000, 10 深分页，扫描 100 万行
SELECT * FROM users ORDER BY id LIMIT 1000000, 10;

-- ✅ 记住上一页最大 id，用 WHERE 定位
SELECT * FROM users WHERE id > 1000000 ORDER BY id LIMIT 10;
```

### 9.4 避免在索引列上用 != / 函数

参考第八节，把条件改写成能走索引的形式。

---

## 十、常见问题

### Q1：索引建得越多越好吗？

```
❌ 不是。
  - 每个索引都占磁盘空间
  - 增删改数据时，所有相关索引都要更新，写入变慢
  - 优化器选择索引时也要花时间

经验：单表索引数量建议控制在 5 个以内，联合索引优先于多个单列索引。
```

### Q2：为什么不建议用 UUID 做主键？

```
UUID 是随机字符串，作为主键（聚簇索引）时：
  - 插入位置随机，B+ 树叶子节点频繁分裂、移动 → 写入性能差
  - 占用空间大（36 字符 vs INT 的 4 字节）→ 索引更大

建议：用自增整数（BIGINT AUTO_INCREMENT）做主键。
```

### Q3：建了索引为什么查询还是慢？

```
排查步骤：
  1. EXPLAIN 看是否真的用了索引（key、type、rows）
  2. 检查是否命中了"索引失效"的场景
  3. 检查数据量——如果查询返回大量数据，再快也慢
  4. 检查是否有锁等待、硬件瓶颈
```

### Q4：联合索引 (a,b,c)，WHERE a=1 AND c=3 能用几列？

```
只能用到 a（key_len 体现）。
因为中间的 b 没参与等值匹配，B+ 树在 b 这里"断了"，c 用不上。

优化：调整查询或调整联合索引列顺序。
```

### Q5：count(*) 很慢怎么办？

```
InnoDB 的 COUNT(*) 要扫描（聚簇索引或最小的索引）来计数，数据量大时慢。

优化：
  - 用近似值：SHOW TABLE STATUS（Rows 字段是估算值）
  - 维护一张单独的计数表
  - 业务允许时用 Redis 缓存计数
```

---

## 十一、快速参考

### 索引操作语句

```sql
-- 创建
CREATE INDEX idx_name ON 表名(列名);                    -- 普通
CREATE UNIQUE INDEX uk_name ON 表名(列名);              -- 唯一
CREATE INDEX idx_mul ON 表名(列1, 列2);                 -- 联合
ALTER TABLE 表名 ADD INDEX idx_name (列名);              -- ALTER 写法

-- 查看
SHOW INDEX FROM 表名;

-- 删除
DROP INDEX idx_name ON 表名;
ALTER TABLE 表名 DROP INDEX idx_name;
```

### 核心概念速记

```
B+ 树：矮胖、叶子链表，范围查询快
聚簇索引：主键，叶子存整行，只有 1 个
二级索引：非主键，叶子存主键，要回表
回表：二级索引查到主键 → 再查聚簇索引拿整行
覆盖索引：查询列都在索引里，不回表（Using index）
最左前缀：联合索引从最左列开始连续匹配才生效
EXPLAIN：type、key、rows、key_len、Extra 五大字段
```

### 加索引决策清单

```
□ 该列是否经常出现在 WHERE / JOIN / ORDER BY / GROUP BY？
□ 列的区分度够高吗？（值种类多）
□ 数据量够大吗？（小表不用加）
□ 是否会频繁增删改？（频繁更新的列少加）
□ 是否可以用联合索引替代多个单列索引？
□ 加完后用 EXPLAIN 验证是否生效？
```
