# MySQL SQL 性能优化

> 官方文档：[MySQL 8.0 - Optimization](https://dev.mysql.com/doc/refman/8.0/en/optimization.html) / [EXPLAIN Output Format](https://dev.mysql.com/doc/refman/8.0/en/explain-output.html) / [The Slow Query Log](https://dev.mysql.com/doc/refman/8.0/en/slow-query-log.html)

## 为什么要做性能优化？

```
一条慢 SQL 的危害：
  😱 一个查询要 3 秒，用户疯狂刷新 → 数据库连接被占满
  😱 连接占满 → 新请求进不来 → 整个系统崩溃（雪崩）
  😱 慢查询阻塞其他查询 → 全站变卡

优化目标：
  - 让查询从"秒级"降到"毫秒级"
  - 让数据库扛住更高并发
  - 让用户感觉"快"
```

**性能优化的整体思路（按性价比排序）：**

```
1. 先定位问题：慢查询日志找出最慢的 SQL
2. 分析原因：用 EXPLAIN 看执行计划，找到瓶颈
3. 加索引：90% 的慢查询靠加索引解决（成本最低）
4. 优化 SQL 写法：避免索引失效、减少回表
5. 优化表结构：合理的数据类型、适度冗余
6. 引入缓存：Redis 缓存热点数据
7. 分库分表：数据量极大时的终极方案
```

> 💡 **核心原则：** 优化要**先定位、后优化、再验证**。不要盲目改，每改一步都用 EXPLAIN 验证效果。索引是性价比最高的优化手段。

---

## 一、慢查询日志：找出最慢的 SQL

**慢查询日志**记录所有执行时间超过阈值的 SQL，是发现性能问题的第一步。

### 1.1 开启慢查询日志

```sql
-- 动态开启（重启后失效）
SET GLOBAL slow_query_log = ON;

-- 设置慢查询阈值：超过 1 秒就记录（默认 10 秒）
SET GLOBAL long_query_time = 1;

-- 记录没有使用索引的查询（很有用！）
SET GLOBAL log_queries_not_using_indexes = ON;

-- 查看慢查询日志文件位置
SHOW VARIABLES LIKE 'slow_query_log_file';
```

**永久生效**需改配置文件 `my.cnf`：

```ini
[mysqld]
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
log_queries_not_using_indexes = 1
```

> ⚠️ **注意：** 生产环境**别把 `long_query_time` 设成 0**，会记录所有 SQL，日志爆炸拖垮磁盘。建议 0.5~1 秒。

### 1.2 查看慢查询状态

```sql
-- 慢查询是否开启
SHOW VARIABLES LIKE 'slow_query_log';

-- 慢查询阈值
SHOW VARIABLES LIKE 'long_query_time';

-- 查看累计的慢查询数量
SHOW STATUS LIKE 'Slow_queries';
```

### 1.3 分析慢查询日志

慢查询日志是文本文件，可以直接看，但 SQL 多了不好分析。用专门工具：

**mysqldumpslow（MySQL 自带）：**

```bash
# 按总耗时排序，看最耗时的慢查询
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log

# 参数：
#   -s t  按总时间排序（c=次数，l=锁时间，r=返回行数）
#   -t 10 只看前 10 条
```

**pt-query-digest（Percona Toolkit，更强大，推荐）：**

```bash
# 详细的慢查询分析报告
pt-query-digest /var/log/mysql/slow.log

# 它会自动归类相似 SQL、统计执行次数/耗时/返回行数，
# 并按"对系统影响"排序，找出最该优化的 SQL
```

> 💡 **提示：** 优化顺序不是"最慢的那条"，而是"**总耗时最大**"的（执行次数多 × 单次慢）。pt-query-digest 能帮你找出这种"量大管饱"的 SQL。

---

## 二、EXPLAIN 执行计划深入（核心！）

在 SQL 前加 `EXPLAIN`，看 MySQL 实际怎么执行这条查询。**这是性能优化最重要的工具。**

```sql
EXPLAIN SELECT * FROM users WHERE city = '北京';
```

### 2.1 EXPLAIN 输出的 12 个字段

| 字段 | 含义 | 重要度 |
|-----|------|:------:|
| **id** | 查询的序号（越大越先执行） | ⭐ |
| **select_type** | 查询类型（SIMPLE/PRIMARY/SUBQUERY...） | ⭐ |
| **table** | 涉及的表 | ⭐ |
| **type** | **访问类型**（用没用索引、怎么访问的） | ⭐⭐⭐ |
| **possible_keys** | 可能用上的索引 | ⭐⭐ |
| **key** | **实际用的索引** | ⭐⭐⭐ |
| **key_len** | 使用的索引长度（判断联合索引用了几列） | ⭐⭐ |
| **ref** | 索引比较的来源（常量/某列） | ⭐ |
| **rows** | **预估扫描行数** | ⭐⭐⭐ |
| **filtered** | 过滤后剩余百分比 | ⭐ |
| **Extra** | **额外信息**（Using index/filesort/temporary） | ⭐⭐⭐ |

### 2.2 type 字段：访问类型（重点看！）

`type` 表示 MySQL 怎么找到数据的，**性能从好到差**：

```
system > const > eq_ref > ref > range > index > ALL
 最快 ---------------------------------------------------→ 最慢（全表扫描）
```

| type | 含义 | 示例 |
|------|------|------|
| `system` | 表只有一行（系统表） | 极少 |
| `const` | 主键/唯一索引等值查询，最多匹配 1 行 | `WHERE id = 1` |
| `eq_ref` | JOIN 时用主键/唯一索引，最多匹配 1 行 | `JOIN ON a.id = b.id` |
| `ref` | 普通索引等值匹配，可匹配多行 | `WHERE name = '张三'` |
| `range` | 索引范围扫描 | `WHERE id > 10`、`BETWEEN`、`IN` |
| `index` | 扫描整个索引（比 ALL 好，但也要全扫） | 仅查索引列时 |
| `ALL` | **全表扫描**（最慢，要优化！） | 无索引或索引失效 |

> 💡 **提示：** 看到 `type = ALL` 就要警惕，通常意味着没用上索引，是大优化点。**目标是至少达到 `range` 或 `ref`**。

### 2.3 key 与 possible_keys

```sql
EXPLAIN SELECT * FROM users WHERE email = 'a@x.com';
```

| 字段 | 说明 |
|-----|------|
| `possible_keys` | MySQL 认为**可能**用的索引 |
| `key` | **实际**用的索引 |

- `possible_keys` 有值，但 `key` 是 `NULL` → 索引可用但没用上，可能优化器认为全表扫更快
- `possible_keys` 和 `key` 都是 `NULL` → **没有任何索引可用**，需要建索引

### 2.4 key_len：判断联合索引用了几列

```sql
-- 联合索引 idx_city_age_name (city, age, name)

EXPLAIN SELECT * FROM users WHERE city = '北京';
-- key_len = 152（假设 city 是 varchar(50) utf8mb4：50*4+2=202，简化看大致值）
-- 只用到第 1 列

EXPLAIN SELECT * FROM users WHERE city = '北京' AND age = 20;
-- key_len 变大 → 用到了 2 列

EXPLAIN SELECT * FROM users WHERE city = '北京' AND age = 20 AND name = '张三';
-- key_len 最大 → 用到了 3 列
```

> 💡 **提示：** `key_len` 越大，说明联合索引用到的列越多，效率越高。看它能判断"最左前缀"实际命中了几列。

### 2.5 rows：预估扫描行数

```
rows 是 MySQL 预估要扫描的行数，越少越好。

  rows = 1000000  → 要扫 100 万行，慢
  rows = 10       → 只扫 10 行，快

优化就是想办法让 rows 变小（靠索引精确定位）。
```

### 2.6 Extra：额外信息（重点看！）

`Extra` 是优化的关键信号灯：

| Extra 值 | 含义 | 好坏 |
|---------|------|:----:|
| `Using index` | **覆盖索引**，直接从索引拿数据，不回表 | ✅ 最好 |
| `Using where` | 用 WHERE 过滤（正常） | 中性 |
| `Using index condition` | 索引下推 ICP（5.6+），减少回表 | ✅ 好 |
| `Using filesort` | **额外排序**（没走索引排序） | ❌ 要优化 |
| `Using temporary` | **用了临时表**（GROUP BY/DISTINCT 常见） | ❌ 要优化 |
| `Using join buffer` | JOIN 没用上索引，用内存缓冲 | ❌ 要优化 |
| `Using filesort` + `Using temporary` | 两个都中，**严重警告** | ❌❌ |

```sql
-- ❌ Using filesort：order by 的列没索引，要额外排序
EXPLAIN SELECT * FROM users ORDER BY age;
-- Extra: Using filesort

-- ✅ Using index：覆盖索引，最快
EXPLAIN SELECT id, city FROM users WHERE city = '北京';
-- Extra: Using index（假设有 idx_city 索引）
```

### 2.7 怎么读 EXPLAIN（实战）

```sql
EXPLAIN SELECT u.name, o.amount
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.city = '北京'
ORDER BY o.amount;
```

**读法（逐行看）：**

```
1. 看 type 列：有没有 ALL（全表扫描）？有的话加索引
2. 看 key 列：实际用了哪个索引？是 NULL 吗？
3. 看 rows 列：扫描行数大不大？
4. 看 Extra 列：有没有 Using filesort / Using temporary？
5. JOIN 场景：被驱动表的 JOIN 列有没有索引？
```

> ⚠️ **注意：** EXPLAIN 多张表时，**id 大的先执行**。MySQL 优化器会自动选"小表驱动大表"的顺序。

---

## 三、索引优化策略（重点，详见《索引(index).md》）

索引是性能优化的第一手段。这里讲**实战策略**，原理见 `索引(index).md`。

### 3.1 覆盖索引：消除回表

```sql
-- 有索引 idx_city_age (city, age)

-- ❌ 要回表：查了 name，索引里没有
SELECT name, age FROM users WHERE city = '北京';

-- ✅ 覆盖索引：查的列都在索引里（Extra: Using index）
SELECT id, city, age FROM users WHERE city = '北京';
```

> 💡 **这就是为什么不要 `SELECT *`**——只查需要的列，更容易命中覆盖索引。

### 3.2 最左前缀 + 范围放最后

```sql
-- 联合索引 (a, b, c)
-- ✅ 范围查询放最后，前面的列能完整用上索引
WHERE a = 1 AND b = 2 AND c > 3   -- a,b,c 都用上

-- ❌ 范围放中间，后面的列失效
WHERE a = 1 AND b > 2 AND c = 3   -- 只用上 a, b
```

### 3.3 索引下推 ICP（Index Condition Pushdown）

MySQL 5.6+ 的优化：把 `WHERE` 条件下推到存储引擎层，**在索引层先过滤**，减少回表次数。

```sql
-- 联合索引 idx_name_age (name, age)
SELECT * FROM users WHERE name LIKE '张%' AND age > 18;

-- 没有 ICP：先用 name 前缀匹配，拿到所有"张X"的记录 → 全部回表 → 再过滤 age
-- 有 ICP：先用 name 前缀匹配，同时在索引层用 age 过滤 → 只回表满足条件的
-- Extra: Using index condition（说明用了 ICP）
```

### 3.4 避免索引失效（详见《索引(index).md》第八节）

```sql
-- ❌ 索引失效的写法
WHERE YEAR(created_at) = 2026    -- 函数
WHERE age + 1 = 20               -- 运算
WHERE phone = 13800138000        -- 隐式类型转换
WHERE name LIKE '%张'            -- 左模糊
WHERE a = 1 OR b = 2             -- OR 一侧无索引
```

---

## 四、SQL 编写优化

### 4.1 避免 SELECT *

```sql
-- ❌ 查所有列，浪费带宽、无法覆盖索引
SELECT * FROM users WHERE id = 1;

-- ✅ 只查需要的列
SELECT name, age FROM users WHERE id = 1;
```

### 4.2 大 IN 列表优化

```sql
-- ❌ IN 列表太长（几千个），效率低
SELECT * FROM users WHERE id IN (1,2,3,...,5000);

-- ✅ 改用 JOIN 临时表，或分批查询
-- 方式1：用 JOIN
SELECT u.* FROM users u
JOIN (SELECT 1 AS id UNION SELECT 2 ...) tmp ON u.id = tmp.id;

-- 方式2：分批，每批 500
SELECT * FROM users WHERE id IN (1,...,500);
SELECT * FROM users WHERE id IN (501,...,1000);
```

### 4.3 深分页优化

```sql
-- ❌ LIMIT 1000000, 10：先扫 100 万行再丢弃
SELECT * FROM users ORDER BY id LIMIT 1000000, 10;

-- ✅ 方案1：记住上一页最大 id（要求 id 连续且排序）
SELECT * FROM users WHERE id > 1000000 ORDER BY id LIMIT 10;

-- ✅ 方案2：延迟关联（先查主键，再 JOIN 取数据）
SELECT u.* FROM users u
JOIN (SELECT id FROM users ORDER BY id LIMIT 1000000, 10) t
ON u.id = t.id;
```

### 4.4 子查询改 JOIN

```sql
-- ❌ 子查询，可能产生临时表
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE amount > 100);

-- ✅ 改 JOIN（优化器更容易优化）
SELECT DISTINCT u.* FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.amount > 100;
```

### 4.5 JOIN 优化

```sql
-- ✅ JOIN 的连接列要有索引
-- 被 JOIN 的表（被驱动表），它的连接列必须建索引
SELECT * FROM users u JOIN orders o ON u.id = o.user_id;
-- orders.user_id 要有索引！

-- ✅ 小表驱动大表：用数据量小的表当"驱动表"
-- MySQL 优化器一般会自动选，但用 STRAIGHT_JOIN 可强制指定顺序（慎用）
```

### 4.6 用 UNION ALL 代替 UNION

```sql
-- ❌ UNION 会去重（内部排序去重，耗资源）
SELECT name FROM users WHERE city = '北京'
UNION
SELECT name FROM users WHERE city = '上海';

-- ✅ 确定无重复时用 UNION ALL，省去去重开销
SELECT name FROM users WHERE city = '北京'
UNION ALL
SELECT name FROM users WHERE city = '上海';
```

### 4.7 批量代替循环

```sql
-- ❌ 循环 1000 次单条 INSERT
INSERT INTO users(name) VALUES('a');
INSERT INTO users(name) VALUES('b');
...

-- ✅ 批量插入，一条语句
INSERT INTO users(name) VALUES('a'),('b'),...;

-- ✅ 大数据导入用 LOAD DATA
LOAD DATA INFILE 'data.csv' INTO TABLE users;
```

---

## 五、表结构与架构优化

### 5.1 合理的数据类型（详见《表结构(DDL).md》）

```
- 能用 INT 别用 VARCHAR（数字存成字符串浪费空间、慢）
- 能用 TINYINT 别用 INT（状态值用 0/1/2）
- 金额用 DECIMAL
- 定长用 CHAR，变长用 VARCHAR
- 字符集用 utf8mb4
- 主键用 BIGINT 自增（避免 UUID 导致 B+树频繁分裂）
```

### 5.2 适度反范式（空间换时间）

```
范式（规范）：数据不冗余，但查询要多表 JOIN
反范式：适度冗余，减少 JOIN，查询更快

例子：订单表里直接存"商品名"（冗余），
      查询时不用 JOIN 商品表，更快。
      代价：商品改名要同步改订单表（但订单一般不改）。

权衡：高频读、低频改的字段，可以适度冗余。
```

### 5.3 缓存：Redis

```
热点数据（首页、热门商品）放 Redis，不查数据库。
读：先查 Redis → 没有再查 MySQL → 写回 Redis
写：更新 MySQL → 删除 Redis（而非更新，避免并发不一致）

注意缓存问题：缓存穿透、缓存击穿、缓存雪崩（属于 Redis 专题）
```

---

## 六、分库分表（数据量极大时的终极方案）

### 6.1 什么时候要分库分表？

```
单表数据量警戒线：
  - MySQL 单表 500 万~1000 万行，或单表 30GB 以上，性能开始下降
  - 单库数据量过大、连接数打满、单机磁盘扛不住

信号：
  - 加索引也优化不动了
  - 慢查询越来越多
  - 主从延迟严重
  - 单机扛不住并发
```

> ⚠️ **注意：分库分表是"最后的手段"，代价很大。** 能用缓存、索引、读写分离解决的，就别急着分。**数据量没到瓶颈别分**，否则自找麻烦。

### 6.2 拆分维度：垂直 vs 水平

```
垂直拆分：把"列"或"表"拆开
  垂直分表：一张宽表拆成多张窄表（按字段冷热拆）
    user(id, name, age, addr, intro, avatar...)
    → user_base(id, name, age)          热门字段
    → user_ext(id, addr, intro, avatar) 冷门字段

  垂直分库：按业务拆到不同库
    用户库、订单库、商品库 各自独立

水平拆分：把"行"拆开（同一个表结构，数据分散到多个库/表）
  水平分表：orders 拆成 orders_0, orders_1, orders_2...
  水平分库：订单分散到 db0, db1, db2...
```

### 6.3 分片策略（数据怎么分？）

| 策略 | 做法 | 优点 | 缺点 |
|-----|------|------|------|
| **范围分片** | 按 id/时间范围（0~1000万一个库） | 范围查询方便 | 热点问题（最新数据集中） |
| **哈希分片** | `hash(id) % N` 取模 | 数据均匀 | 扩容麻烦（N 变了要迁移） |
| **一致性哈希** | 哈希环 | 扩容只迁移部分数据 | 实现复杂 |
| **查表路由** | 单独的路由表记录每条数据在哪 | 灵活 | 路由表本身是瓶颈 |

```java
// 哈希分片示例（ShardingSphere 等中间件帮你做）
// 用户 id = 12345，分 4 个库
int dbIndex = 12345 % 4;  // → 1，存到 db1
int tableIndex = (12345 / 4) % 4;  // 库内分表
```

### 6.4 分库分表带来的难题（重点！）

分库分表后，原本简单的事变复杂了：

| 问题 | 说明 | 解决方案 |
|-----|------|---------|
| **跨库 JOIN** | 数据在不同库，不能 JOIN | 应用层组装、冗余字段、广播表 |
| **分布式事务** | 跨库事务难保证 ACID | Seata、最终一致性、TCC |
| **全局唯一 ID** | 各库自增 ID 会冲突 | 雪花算法 Snowflake、号段模式 |
| **跨库分页排序** | `LIMIT` 要合并多库结果 | 各库查 → 内存合并（深分页极难） |
| **聚合统计** | COUNT/SUM 跨库 | 各库聚合再汇总 |
| **数据迁移** | 已有数据要重新分配 | 双写、影子表、灰度切换 |

### 6.5 全局唯一 ID：雪花算法

```
分库分表后，自增主键会冲突，需要全局唯一 ID。

雪花算法（Snowflake）：
  64 位 = 1位符号 + 41位时间戳 + 10位机器ID + 12位序列号
  → 每毫秒每机器可生成 4096 个不重复 ID
  → 趋势递增、不依赖数据库、性能高

其他方案：
  - 号段模式：数据库批量发号（美团 Leaf）
  - UUID：唯一但不递增，做主键索引差
  - Redis INCR：依赖 Redis
```

### 6.6 分库分表中间件

| 中间件 | 类型 | 特点 |
|-------|------|------|
| **ShardingSphere-JDBC** | 客户端 | 轻量，Java 嵌入，性能好（主流） |
| **ShardingSphere-Proxy** | 代理 | 独立部署，多语言通用 |
| **MyCat** | 代理 | 老牌，社区不活跃 |
| **Vitess** | 代理 | YouTube 开源，云原生 |

**ShardingSphere-JDBC 配置示例（Java）：**

```yaml
# application.yml
spring:
  shardingsphere:
    datasource:
      names: db0,db1
      db0: { ... 主库0配置 ... }
      db1: { ... 主库1配置 ... }
    rules:
      sharding:
        tables:
          orders:
            actual-data-nodes: db${0..1}.orders_${0..3}
            database-strategy:
              standard:
                sharding-column: user_id
                sharding-algorithm-name: db-mod
            table-strategy:
              standard:
                sharding-column: user_id
                sharding-algorithm-name: table-mod
```

> 💡 **提示：** 应用代码**几乎不用改**，中间件自动做路由。但你要清楚分片键（`user_id`），**不带分片键的查询会广播到所有库**，很慢。

### 6.7 什么时候不该分库分表

```
❌ 数据量没到瓶颈（几百万行用索引就够）
❌ 团队没经验，维护不了分布式复杂性
❌ 业务还在快速变化（表结构频繁改）
❌ 没有运维支撑（分库分表后备份、监控、迁移都更难）

替代方案（先考虑）：
  - 加索引、优化 SQL
  - 读写分离（主写从读）
  - 缓存热点数据
  - 冷热数据分离（历史数据归档）
  - 升级硬件（SSD、加内存）
```

---

## 七、其他优化手段

### 7.1 连接池

```
应用层用数据库连接池（HikariCP、Druid），复用连接，
避免频繁创建/销毁连接的开销。

不要每个请求新建 Connection，那是灾难。
```

### 7.2 读写分离

```
主库负责写，从库负责读，分担主库压力。
（基于主从复制，详见《备份与恢复.md》第八节）

注意：主从有延迟，写完立刻读可能读到旧数据（主从延迟问题）。
```

### 7.3 count(*) 优化

```sql
-- InnoDB 的 COUNT(*) 要扫描计数，大表慢
SELECT COUNT(*) FROM users;

-- 替代方案：
SHOW TABLE STATUS LIKE 'users';  -- Rows 字段是估算值
-- 或维护一张计数表
-- 或用 Redis 缓存总数
```

---

## 八、常见问题与注意事项

### 问题 1：加了索引还是很慢？

```
排查步骤：
  1. EXPLAIN 看 type/key/rows，确认索引真生效了吗
  2. 是否命中了"索引失效"场景（函数、隐式转换、左模糊...）
  3. 数据量是不是太大（需要分库分表或缓存）
  4. 是否锁等待、硬件瓶颈（看 SHOW PROCESSLIST）
  5. 统计信息过期（ANALYZE TABLE 表名 重新统计）
```

### 问题 2：EXPLAIN 显示用了索引，但还是慢？

```
原因：
  - 索引区分度低（如性别字段），优化器放弃索引
  - 回表太多（查询列不在索引里）
  - 数据量本身大，范围扫描行数多
  - 锁等待 / IO 瓶颈

解决：覆盖索引、缩小范围、缓存
```

### 问题 3：如何找出最该优化的 SQL？

```bash
# 用 pt-query-digest 分析慢查询日志
# 它会按"总耗时"排序，找"次数多 × 单次慢"的 SQL
pt-query-digest slow.log
```

### 问题 4：ORDER BY 出现 Using filesort 怎么办？

```sql
-- 给 ORDER BY 的列建索引，让排序走索引
-- 联合索引顺序：WHERE 条件列在前，ORDER BY 列在后
CREATE INDEX idx_city_age ON users(city, age);

-- 这样 WHERE city=? ORDER BY age 能用索引完成过滤+排序
```

### 问题 5：分库分表后怎么做分页？

```
这是分库分表最难的问题之一。
  - 浅分页：各库查 LIMIT，内存合并
  - 深分页：禁止跳深页（产品限制）、用游标、二次查询法、ES 辅助

实际中常配合 Elasticsearch 做复杂查询和分页。
```

### 问题 6：表一定要有主键吗？

```
✅ 一定要有！
  - 没主键，InnoDB 会用唯一索引或生成隐藏列，性能差
  - 没主键无法做主从复制的高效同步
  - 自增 BIGINT 主键最佳
```

---

## 九、快速参考

### 优化排查流程

```
1. 开慢查询日志 → 找慢 SQL
2. EXPLAIN → 看 type / key / rows / Extra
3. type=ALL 或 key=NULL → 加索引
4. Extra 有 filesort/temporary → 优化 ORDER BY/GROUP BY
5. rows 太大 → 覆盖索引 / 缩小范围
6. 单表数据量大 → 缓存 / 读写分离 / 分库分表
7. 验证：改完再用 EXPLAIN 确认效果
```

### EXPLAIN 速判表

| 字段 | 健康值 | 异常值 | 对策 |
|-----|--------|--------|------|
| `type` | const/ref/range | ALL | 加索引 |
| `key` | 有索引名 | NULL | 加索引 |
| `rows` | 小 | 很大 | 精确索引/缩小范围 |
| `Extra` | Using index | Using filesort/temporary | 优化排序/分组/加覆盖索引 |

### 索引失效速查

```
函数/运算/隐式转换/左模糊/OR单侧无索引/不符合最左前缀/!= /
```

### SQL 优化速记

```
✅ 只查需要的列（别 SELECT *）
✅ WHERE/JOIN/ORDER BY 列加索引
✅ 联合索引遵循最左前缀，范围放最后
✅ 深分页用游标或延迟关联
✅ 大 IN 改 JOIN 或分批
✅ 子查询改 JOIN
✅ UNION ALL 代替 UNION
✅ 批量代替循环
❌ 避免 SELECT *、避免索引失效写法
```

### 分库分表决策

```
数据量 < 500 万：索引 + SQL 优化即可
数据量 500~2000 万：缓存 + 读写分离
数据量 > 2000 万 / 单机扛不住：考虑分库分表

分片策略：范围 / 哈希 / 一致性哈希
中间件：ShardingSphere-JDBC（主流）
全局 ID：雪花算法
代价：跨库 JOIN、分布式事务、全局 ID、跨库分页（要做好心理准备）
```
