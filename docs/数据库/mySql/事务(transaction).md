# MySQL 事务（Transaction）

> 官方文档：[MySQL 8.0 - Transaction Management](https://dev.mysql.com/doc/refman/8.0/en/transaction.html)

## 什么是事务？

**事务就是"要么全部成功，要么全部失败"的一组操作**，相当于一个"打包执行"的原子操作。

```
经典场景：转账
  张三给李四转 100 元，分两步：
    1. 张三 -100
    2. 李四 +100

如果没有事务：
  步骤 1 成功 ✅
  步骤 2 失败 ❌（比如断电了）
  → 张三少了 100，李四没多，钱凭空消失了！😱

用事务包起来：
  要么两步都成功 → 提交（COMMIT）
  要么两步都失败 → 回滚（ROLLBACK）
  → 永远不会出现"做了一半"的中间状态 ✅
```

> 💡 **通俗理解：** 事务就像网购——你下单付款（开启事务），商家发货，你确认收货（提交）。如果中途任何一步出问题，整个订单"退回原状"（回滚），谁也不吃亏。

---

## 一、事务的 ACID 四大特性（必背）

事务能保证数据正确，靠的就是这四个特性：

| 特性 | 英文 | 含义 | 通俗解释 |
|-----|------|------|---------|
| **原子性** | Atomicity | 事务里的操作**要么全做，要么全不做** | "All or Nothing"，不能做一半 |
| **一致性** | Consistency | 事务执行前后，数据必须**保持一致**（满足约束） | 转账前后，两人总金额不变 |
| **隔离性** | Isolation | 多个事务**并发执行时互不干扰** | 你取钱时，别人转账不影响你看到的余额 |
| **持久性** | Durability | 事务提交后，数据**永久保存**，掉电也不丢 | 提交成功的数据，重启数据库还在 |

### 一句话记忆

> **A（原子）**：全做或全不做 → **C（一致）**：结果合法 → **I（隔离）**：互不干扰 → **D（持久）**：永久保存**

> 💡 **提示：** 一致性（C）是**最终目标**，原子性、隔离性、持久性是**实现手段**。AID 保证了 C。

---

## 二、基本用法：开启、提交、回滚

### 2.1 一个完整事务的流程

```sql
-- 1. 开启事务
START TRANSACTION;          -- 或写 BEGIN;

-- 2. 执行一组操作
UPDATE accounts SET balance = balance - 100 WHERE name = '张三';
UPDATE accounts SET balance = balance + 100 WHERE name = '李四';

-- 3. 检查：如果两步都成功
COMMIT;                     -- 提交，数据永久生效

-- 3'. 检查：如果出了问题
ROLLBACK;                   -- 回滚，撤销上面所有操作，恢复原状
```

### 2.2 事务里只有增删改查，COMMIT 前别人看不到

```sql
-- 事务 A
START TRANSACTION;
UPDATE users SET age = 99 WHERE id = 1;
-- 此时事务 A 自己能看到 age=99

-- 事务 B（另一个连接）
SELECT age FROM users WHERE id = 1;
-- 事务 B 看到的还是原来的值（还没 COMMIT）

-- 事务 A 提交后
COMMIT;
-- 事务 B 再查，才能看到 age=99
```

### 2.3 回滚的例子

```sql
START TRANSACTION;

DELETE FROM users WHERE id = 1;   -- 删了一行
UPDATE users SET age = 100 WHERE id = 2;

-- 发现删错了！回滚
ROLLBACK;
-- users 表恢复原样：id=1 回来了，id=2 的 age 也还原了 ✅
```

---

## 三、自动提交（autocommit）

MySQL 默认开启**自动提交**，意味着每条 SQL 都自动当成一个事务，执行完立即提交。

### 3.1 查看和设置

```sql
-- 查看自动提交状态
SELECT @@autocommit;   -- 默认 1（开启）

-- 关闭自动提交
SET autocommit = 0;    -- 之后所有语句都在一个事务里，必须手动 COMMIT
```

### 3.2 两种使用方式对比

```sql
-- 方式一：默认自动提交（单条语句自动生效）
UPDATE users SET age = 21 WHERE id = 1;   -- 立即生效，无法回滚

-- 方式二：显式开启事务（推荐，控制更精确）
START TRANSACTION;
UPDATE users SET age = 21 WHERE id = 1;
UPDATE users SET age = 22 WHERE id = 2;
COMMIT;   -- 或 ROLLBACK
```

> 💡 **提示：** `START TRANSACTION` 会**临时关闭自动提交**，直到 `COMMIT` 或 `ROLLBACK`。结束后自动恢复原来的设置。

### 3.3 哪些语句会"隐式提交"

有些语句执行时，会**自动把之前未提交的事务提交掉**（即使你没写 COMMIT）：

```sql
START TRANSACTION;
INSERT INTO users ... ;

-- 下面这些 DDL / 管理语句会触发"隐式提交"，把上面的 INSERT 自动提交
CREATE TABLE ...;
ALTER TABLE ...;
DROP TABLE ...;
TRUNCATE TABLE ...;
USE 数据库名;
-- ⚠️ 所以事务里尽量不要混入 DDL 语句
```

> ⚠️ **注意：** 这就是为什么 `TRUNCATE`、`DROP` **无法在事务中回滚**——它们执行时已经隐式提交了。

---

## 四、保存点 SAVEPOINT（局部回滚）

事务内可以设置"保存点"，方便**只回滚一部分**，而不是全部撤销。

```sql
START TRANSACTION;

INSERT INTO logs(msg) VALUES('步骤1');   -- 操作1
SAVEPOINT sp1;                            -- 设置保存点1

INSERT INTO logs(msg) VALUES('步骤2');   -- 操作2
SAVEPOINT sp2;                            -- 设置保存点2

INSERT INTO logs(msg) VALUES('步骤3');   -- 操作3

-- 发现步骤3 有问题，只回滚到 sp2（撤销步骤3，保留步骤1、2）
ROLLBACK TO SAVEPOINT sp2;

COMMIT;   -- 最终提交：步骤1、2 生效，步骤3 被撤销
```

| 操作 | 作用 |
|-----|------|
| `SAVEPOINT 名字` | 设置保存点 |
| `ROLLBACK TO SAVEPOINT 名字` | 回滚到该保存点（保留之前的操作） |
| `RELEASE SAVEPOINT 名字` | 删除保存点 |

---

## 五、并发问题：事务隔离要解决的麻烦

多个事务同时操作相同数据时，会出现三种"脏"问题：

### 5.1 脏读（Dirty Read）

```
事务 A 修改了数据但还没提交，事务 B 就读到了这个"未提交"的数据。
如果事务 A 回滚，事务 B 读到的就是"脏"的、根本不存在的数据。
```

### 5.2 不可重复读（Non-repeatable Read）

```
事务 A 第一次读数据是 100；
期间事务 B 修改并提交了数据；
事务 A 第二次读变成 200。
→ 同一个事务里，两次读同一行结果不一样（被别人改了）。
```

### 5.3 幻读（Phantom Read）

```
事务 A 第一次查询有 5 条记录；
期间事务 B 新增并提交了几条数据；
事务 A 第二次查询变成 8 条。
→ 同一个事务里，两次查询结果"行数"变了（像幻觉一样多/少了行）。
```

### 三者对比

| 问题 | 现象 | 根本原因 |
|-----|------|---------|
| **脏读** | 读到别人**没提交**的数据 | 隔离级别太低 |
| **不可重复读** | 同行数据**前后读不一样** | 别人**修改**了已提交数据 |
| **幻读** | 同条件查询**行数变了** | 别人**新增/删除**了数据 |

> 💡 **区别：** 不可重复读是"**同一行**被改了"，幻读是"**行数**变了（新增/删除）"。

---

## 六、四种隔离级别

隔离级别越高，数据越安全，但并发性能越低（因为加锁更多）。MySQL 需要在两者间权衡。

### 6.1 四个级别（从低到高）

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 性能 |
|---------|:----:|:--------:|:----:|:----:|
| **READ UNCOMMITTED** 读未提交 | ❌ 会发生 | ❌ 会发生 | ❌ 会发生 | 最高 |
| **READ COMMITTED** 读已提交 | ✅ 避免 | ❌ 会发生 | ❌ 会发生 | 高 |
| **REPEATABLE READ** 可重复读（MySQL 默认） | ✅ 避免 | ✅ 避免 | ✅ 避免* | 中 |
| **SERIALIZABLE** 串行化 | ✅ 避免 | ✅ 避免 | ✅ 避免 | 最低 |

> *\* MySQL 的 REPEATABLE READ 通过间隙锁，在 InnoDB 下也能避免大部分幻读。*

### 6.2 查看和设置隔离级别

```sql
-- 查看当前会话隔离级别（MySQL 8.0+）
SELECT @@transaction_isolation;

-- MySQL 5.7 及以前用这个
SELECT @@tx_isolation;

-- 设置隔离级别（全局 / 会话）
SET GLOBAL  transaction_isolation = 'READ-COMMITTED';
SET SESSION transaction_isolation = 'READ-COMMITTED';
```

### 6.3 各级别适用场景

| 级别 | 适用场景 |
|-----|---------|
| READ UNCOMMITTED | 几乎不用（脏读不可接受） |
| READ COMMITTED | Oracle/PostgreSQL 默认，对一致性要求不极高 |
| **REPEATABLE READ** | **MySQL 默认**，绝大多数业务用它 |
| SERIALIZABLE | 对数据一致性要求极高，且并发量小 |

> 💡 **提示：** 一般不需要改 MySQL 默认的 REPEATABLE READ。除非遇到特定的并发性能问题，才考虑降到 READ COMMITTED。

---

## 七、锁机制简述

隔离性靠**锁**来实现。理解锁能解释很多"为什么卡住、为什么死锁"。

### 7.1 两种基本锁

| 锁 | 写法 | 兼容性 |
|----|------|--------|
| **共享锁（S锁 / 读锁）** | `SELECT ... LOCK IN SHARE MODE` | 多个事务可同时读，但不能写 |
| **排他锁（X锁 / 写锁）** | `SELECT ... FOR UPDATE` | 只有一个事务能持有，别人读（带锁）写都不行 |

```sql
-- 加共享锁：别人能读（带锁），但不能写
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;

-- 加排他锁：别人读写都阻塞（直到我提交）
SELECT * FROM users WHERE id = 1 FOR UPDATE;
```

### 7.2 锁的粒度

| 粒度 | 说明 | 特点 |
|-----|------|------|
| **表锁** | 锁整张表 | 开销小，并发低（MyISAM 用） |
| **行锁** | 锁单行/几行 | 开销大，并发高（InnoDB 用） |
| **间隙锁** | 锁住"行与行之间的间隙" | 防止插入，解决幻读 |

> 💡 **提示：** InnoDB 默认用**行锁**，并且**基于索引**加锁。**如果 UPDATE/DELETE 没用上索引，会退化成表锁！** 所以一定要确保 WHERE 条件命中索引。

### 7.3 乐观锁 vs 悲观锁

```sql
-- 悲观锁：先加锁再操作（数据库层面）
START TRANSACTION;
SELECT * FROM goods WHERE id = 1 FOR UPDATE;   -- 先锁住这行
-- 业务处理...
UPDATE goods SET stock = stock - 1 WHERE id = 1;
COMMIT;   -- 释放锁

-- 乐观锁：不加锁，更新时检查版本号（应用层面）
-- 表加 version 字段
UPDATE goods SET stock = stock - 1, version = version + 1
WHERE id = 1 AND version = 5;   -- version 不匹配则更新失败，重试
```

| 对比 | 悲观锁 | 乐观锁 |
|-----|--------|--------|
| 实现 | `FOR UPDATE` | 版本号/CAS |
| 适合 | 写多读少、冲突频繁 | 读多写少、冲突少 |
| 性能 | 冲突多时更好 | 冲突少时更好 |

---

## 八、MVCC 多版本并发控制

**MVCC（Multi-Version Concurrency Control）** 是 InnoDB 提升并发性能的核心技术。

### 8.1 核心思想

> 同一行数据可以同时存在**多个版本**，读操作读"历史快照"，写操作创建"新版本"，读写互不阻塞。

```
事务 A 在读 id=1 的数据（读快照版本）
事务 B 同时在改 id=1 的数据（创建新版本）
→ A 读旧版本，B 写新版本，两者并行，互不等待 ✅
```

### 8.2 它是怎么做到的

每行数据隐藏了两个字段：
- **创建版本号**（trx_id）：最近一次修改它的事务 id
- **删除版本号**（roll_pointer）：删除它的事务 id

加上 `undo log`（回滚日志）保存历史版本，组成一个**版本链**。事务读取时，根据自己"开始时的快照"，找到对应版本。

### 8.3 快照读 vs 当前读

| 类型 | 含义 | 例子 |
|-----|------|------|
| **快照读** | 读历史版本（MVCC 生效） | 普通 `SELECT` |
| **当前读** | 读最新数据并加锁 | `UPDATE`、`DELETE`、`SELECT ... FOR UPDATE`、`SELECT ... LOCK IN SHARE MODE` |

```sql
-- 快照读：读快照，不加锁，性能好
SELECT * FROM users WHERE id = 1;

-- 当前读：读最新数据 + 加锁
SELECT * FROM users WHERE id = 1 FOR UPDATE;
UPDATE users SET age = 21 WHERE id = 1;   -- 隐含当前读
```

> 💡 **提示：** 这就是为什么 REPEATABLE READ 下，普通 `SELECT` 不会看到别人提交的新数据（读的是事务开始时的快照）。

---

## 九、死锁

### 9.1 什么是死锁

两个事务互相等待对方释放锁，谁也动不了，这就是死锁。

```
事务 A：锁了行 1，想锁行 2
事务 B：锁了行 2，想锁行 1
→ A 等 B 释放行 2，B 等 A 释放行 1 → 死锁 💀
```

### 9.2 InnoDB 怎么处理

InnoDB 有**死锁检测**机制：发现死锁后，会选择一个"代价小"的事务**主动回滚**（牺牲品），让另一个继续执行。

报错信息：`ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction`

### 9.3 怎么避免死锁

```sql
-- 1. 多表/多行操作时，按固定顺序加锁
--    事务 A、B 都先锁 users 再锁 orders，就不会循环等待
START TRANSACTION;
UPDATE users  ... WHERE id = 1;   -- 先锁 users
UPDATE orders ... WHERE user_id = 1;  -- 再锁 orders
COMMIT;

-- 2. 事务尽量短，尽快提交，减少持锁时间
-- 3. 大事务拆成小事务
-- 4. 必要时降低隔离级别
```

---

## 十、在 Java 中使用事务

### 10.1 JDBC 手动管理事务

```java
Connection conn = dataSource.getConnection();
try {
    conn.setAutoCommit(false);   // 1. 关闭自动提交，开启事务

    // 2. 转账两步
    PreparedStatement ps1 = conn.prepareStatement(
        "UPDATE accounts SET balance = balance - ? WHERE name = ?");
    ps1.setInt(1, 100);
    ps1.setString(2, "张三");
    ps1.executeUpdate();

    // 模拟异常
    if (true) throw new RuntimeException("出错了！");

    PreparedStatement ps2 = conn.prepareStatement(
        "UPDATE accounts SET balance = balance + ? WHERE name = ?");
    ps2.setInt(1, 100);
    ps2.setString(2, "李四");
    ps2.executeUpdate();

    conn.commit();   // 3. 全部成功 → 提交
} catch (Exception e) {
    conn.rollback();  // 4. 出错 → 回滚，恢复原状
    e.printStackTrace();
} finally {
    conn.setAutoCommit(true);  // 恢复
    conn.close();
}
```

### 10.2 Spring 声明式事务（推荐）

Spring 用 `@Transactional` 注解，**自动管理事务的开启、提交、回滚**，代码最简洁：

```java
@Service
public class TransferService {

    @Autowired
    private AccountMapper accountMapper;

    // 加这个注解，方法就成了一个事务
    // 方法正常结束 → 自动 COMMIT
    // 方法抛出运行时异常 → 自动 ROLLBACK
    @Transactional
    public void transfer(String from, String to, int amount) {
        accountMapper.decrease(from, amount);   // 张三 -100
        // 如果这里抛异常，上面"张三 -100"也会被回滚 ✅
        accountMapper.increase(to, amount);     // 李四 +100
    }
}
```

**`@Transactional` 常用配置：**

```java
@Transactional(
    rollbackFor = Exception.class,   // 默认只回滚 RuntimeException，加上这个连检查异常也回滚
    isolation  = Isolation.REPEATABLE_READ,  // 隔离级别
    propagation = Propagation.REQUIRED,      // 传播行为
    timeout = 30,    // 超时秒数
    readOnly = false  // 是否只读
)
```

> ⚠️ **注意 `@Transactional` 失效的常见坑：**
> 1. **方法必须是 `public`**（非 public 不生效）
> 2. **同类内部方法调用不生效**（Spring 基于 AOP 代理，自己调自己绕过代理）
> 3. **默认只回滚 `RuntimeException`**，普通 `Exception` 不回滚（加 `rollbackFor = Exception.class` 解决）
> 4. **异常被 `try-catch` 吞掉**，Spring 感知不到异常，不会回滚

```java
// ❌ 失效：异常被吞了，Spring 看不到异常，不回滚
@Transactional
public void transfer(...) {
    try {
        accountMapper.decrease(...);
        int x = 1 / 0;   // 异常
    } catch (Exception e) {
        log.error("出错了", e);  // 吞掉了，事务不回滚！数据已改！
    }
}

// ✅ 正确：要么抛出，要么手动回滚
@Transactional(rollbackFor = Exception.class)
public void transfer(...) throws Exception {
    accountMapper.decrease(...);
    // 异常直接抛出，让 Spring 回滚
}
```

---

## 十一、事务最佳实践

### 1. 事务尽量"小而快"

```sql
-- ❌ 不要在事务里做耗时操作（如调用外部接口、睡几秒）
START TRANSACTION;
-- 调用第三方支付接口（要 3 秒）...  锁一直持有，别人等着
UPDATE ... ;
COMMIT;

-- ✅ 把耗时操作移到事务外，事务只包必要的数据操作
调用第三方支付;   -- 事务外
START TRANSACTION;
UPDATE ... ;
COMMIT;
```

### 2. 事务只包数据操作，不包查询

```java
// ❌ 把查询也包进事务，白白占用连接
@Transactional
public void doSomething() {
    List<User> users = mapper.queryAll();  // 纯查询，不需要事务
    // 大量业务计算...
    mapper.update(...);   // 真正需要事务的只有这句
}

// ✅ 缩小事务范围
public void doSomething() {
    List<User> users = mapper.queryAll();  // 事务外查询
    this.updateData();   // 只在更新时开事务
}

@Transactional
public void updateData() {
    mapper.update(...);
}
```

### 3. 避免大事务

```
大事务（涉及几万行、执行很久）的危害：
  - 长时间持锁，阻塞其他事务
  - undo log 膨胀，占用大量空间
  - 主从延迟加剧

解决：拆分事务、批量处理时分批提交
```

### 4. 关键操作一定要用事务

| 场景 | 为什么需要事务 |
|-----|--------------|
| 转账、支付 | 多个账户要同步变动 |
| 下单（扣库存 + 创建订单 + 扣余额） | 多表联动，必须同时成功 |
| 批量导入数据 | 全部成功才提交，中途出错回滚 |
| 更新关联数据 | 主表子表要保持一致 |

---

## 十二、常见问题

### Q1：为什么我的 `@Transactional` 没回滚？

```
最常见原因：
  1. 异常被 try-catch 吞了 → 重新抛出或手动回滚
  2. 方法不是 public → 改成 public
  3. 抛的是检查异常 → 加 rollbackFor = Exception.class
  4. 同类内部方法调用 → 拆到另一个 Bean
  5. 数据库引擎不支持事务 → 检查表是不是 InnoDB（MyISAM 不支持事务！）
```

> ⚠️ **注意：** MyISAM 引擎**不支持事务**，只有 **InnoDB** 支持。建表一定要用 InnoDB（MySQL 5.5 后默认就是）。

### Q2：ROLLBACK 了为什么数据还在？

```sql
-- 原因：执行了"隐式提交"的语句，事务已经被提交了，回滚无效
START TRANSACTION;
INSERT INTO users ...;
TRUNCATE TABLE other_table;  -- ❌ 这里触发隐式提交，上面的 INSERT 已生效
ROLLBACK;   -- 回滚无效，INSERT 数据还在
```

### Q3：长事务怎么找出来？

```sql
-- 查看当前所有事务（MySQL 8.0 InnoDB）
SELECT * FROM information_schema.INNODB_TRX;

-- 重点看 trx_started（开始时间），运行很久的就是长事务
-- 还可以用 SHOW ENGINE INNODB STATUS 看锁等待情况
```

### Q4：脏读、幻读到底会不会影响我？

```
MySQL 默认 REPEATABLE READ，配合 MVCC：
  - 脏读：已避免
  - 不可重复读：已避免
  - 幻读：基本避免（快照读不幻读；当前读靠间隙锁）

绝大多数业务用默认级别就够了，不用纠结。
```

---

## 十三、快速参考

### 事务核心语法

```sql
START TRANSACTION;                -- 开启事务（或 BEGIN）
  ... 一组 SQL 操作 ...
SAVEPOINT 名字;                   -- 设置保存点
  ... 更多操作 ...
ROLLBACK TO SAVEPOINT 名字;       -- 回滚到保存点
COMMIT;                           -- 提交（生效）
ROLLBACK;                         -- 回滚（撤销全部）
```

### ACID + 隔离级别速记

```
ACID：原子 一致 隔离 持久

隔离级别（低→高）：
  读未提交 → 读已提交 → 可重复读(MySQL默认) → 串行化

并发问题（隔离级别越高越能避免）：
  脏读 → 不可重复读 → 幻读

读的类型：
  快照读（普通 SELECT，走 MVCC，不加锁）
  当前读（UPDATE/DELETE/FOR UPDATE，读最新并加锁）
```

### Java 事务对比

| 方式 | 写法 | 适用 |
|-----|------|------|
| JDBC 手动 | `setAutoCommit(false)` + `commit/rollback` | 不用框架时 |
| Spring 注解 | `@Transactional` | **最常用，推荐** |
| 编程式 | `TransactionTemplate` | 需要精细控制范围时 |

### 事务自检清单

```
□ 表引擎是 InnoDB 吗？（MyISAM 不支持事务）
□ 事务范围是不是足够小？（别包耗时操作、纯查询）
□ 异常有没有被吞掉？（@Transactional 才能自动回滚）
□ 多表操作顺序一致吗？（避免死锁）
□ 关键业务真的用事务了吗？（转账、下单等）
□ 隔离级别选对了吗？（一般用默认即可）
```
