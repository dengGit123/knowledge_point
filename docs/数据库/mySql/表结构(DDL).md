# MySQL 表结构（DDL）

> 官方文档：[MySQL 8.0 - Data Definition Statements](https://dev.mysql.com/doc/refman/8.0/en/sql-data-definition-statements.html) / [Data Types](https://dev.mysql.com/doc/refman/8.0/en/data-types.html)

## 什么是 DDL？

**DDL（Data Definition Language，数据定义语言）** 用来**定义和修改表结构本身**——建表、删表、改字段、加约束，而不是操作表里的数据。

```
DDL（管"结构"）     DML（管"数据"）
─────────────     ─────────────
CREATE 建表        INSERT 插数据
ALTER  改表结构    UPDATE 改数据
DROP   删表        DELETE 删数据
TRUNCATE 清空表
```

> 💡 **通俗理解：** DDL 是装修房子（建墙、拆墙、改格局），DML 是往房间里放东西、搬东西。本文讲"装修"，增删改查（`增(insert)` / `删(delete)` / `改(update)` / `查(select)`）讲"放东西"。

---

## 一、建表 CREATE TABLE

### 1.1 基本语法

```sql
CREATE TABLE 表名 (
    列名1  数据类型  [约束],
    列名2  数据类型  [约束],
    ...
    [表级约束],
    [表选项]
);
```

### 1.2 完整示例

```sql
CREATE TABLE users (
    id          INT          PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    name        VARCHAR(50)  NOT NULL                   COMMENT '用户名',
    age         TINYINT      DEFAULT 0                  COMMENT '年龄',
    email       VARCHAR(100) UNIQUE                     COMMENT '邮箱',
    balance     DECIMAL(10,2) DEFAULT 0.00              COMMENT '余额',
    status      TINYINT      DEFAULT 1                  COMMENT '状态 1正常 0禁用',
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 1.3 字段注释 COMMENT（强烈推荐）

```sql
-- 给每个字段加注释，方便团队理解含义
balance DECIMAL(10,2) COMMENT '余额，单位元'
```

> 💡 **提示：** 生产环境的表**一定要加 COMMENT**，否则几个月后没人记得每个字段是干嘛的。

---

## 二、常用数据类型

### 2.1 整数类型

| 类型 | 字节 | 范围（有符号） | 适用 |
|-----|------|--------------|------|
| `TINYINT` | 1 | -128 ~ 127 | 状态值、布尔 |
| `SMALLINT` | 2 | -32768 ~ 32767 | 小范围数 |
| `INT` | 4 | ±21 亿 | 普通整数、主键 |
| `BIGINT` | 8 | ±922 亿亿 | 大数、自增主键 |

```sql
age     TINYINT  UNSIGNED   -- UNSIGNED 表示无符号（0~255），存年龄不会负数
id      BIGINT   UNSIGNED   -- 主键常用 BIGINT，避免溢出
status  TINYINT  DEFAULT 1  -- 用 0/1 表示状态，比 VARCHAR 省空间
```

> 💡 **提示：** 主键建议用 `BIGINT UNSIGNED AUTO_INCREMENT`，空间够用（INT 21 亿可能不够大公司），且无符号全是正数。

### 2.2 小数类型

| 类型 | 说明 | 适用 |
|-----|------|------|
| `DECIMAL(M,D)` | 精确小数，M 总位数，D 小数位 | **金额**（必用） |
| `FLOAT` / `DOUBLE` | 浮点数（有精度误差） | 科学计算，**不要存钱** |

```sql
price   DECIMAL(10,2)   -- 最多 10 位，2 位小数。如 99999999.99
balance DECIMAL(10,2)   -- 金额必用 DECIMAL，避免浮点误差
```

> ⚠️ **注意：存金额、价格**永远用 `DECIMAL`，**不要用 `FLOAT`/`DOUBLE`**！浮点数有精度丢失：`0.1 + 0.2 = 0.30000000000000004`，存钱会出大问题。

### 2.3 字符串类型

| 类型 | 说明 | 适用 |
|-----|------|------|
| `CHAR(n)` | 定长字符串（不足补空格） | 固定长度（如手机号、编码） |
| `VARCHAR(n)` | 变长字符串 | **最常用**，姓名、标题、邮箱 |
| `TEXT` | 大文本（最多 64KB） | 文章正文、长描述 |
| `LONGTEXT` | 超大文本（最多 4GB） | 超长内容 |

```sql
phone    CHAR(11)         -- 手机号固定 11 位，用 CHAR
name     VARCHAR(50)      -- 姓名，变长
email    VARCHAR(100)     -- 邮箱
content  TEXT             -- 文章正文
```

**CHAR vs VARCHAR：**

| 对比 | `CHAR(n)` | `VARCHAR(n)` |
|-----|-----------|--------------|
| 存储 | 定长，不足补空格 | 实际长度 + 1~2 字节 |
| 性能 | 定长，存取快 | 变长，稍慢 |
| 适合 | 长度固定 | 长度不固定（绝大多数场景） |

> 💡 **提示：** 日常用 `VARCHAR` 居多。只有长度**真的固定**（如身份证 18 位、MD5 32 位）才用 `CHAR`。

### 2.4 日期时间类型

| 类型 | 格式 | 适用 |
|-----|------|------|
| `DATE` | `2026-07-02` | 只有日期（生日） |
| `TIME` | `12:30:00` | 只有时间 |
| `DATETIME` | `2026-07-02 12:30:00` | 日期+时间（**推荐**） |
| `TIMESTAMP` | `2026-07-02 12:30:00` | 时间戳，范围小（1970~2038） |

```sql
birthday   DATE       COMMENT '生日'
created_at DATETIME   COMMENT '创建时间'
```

**DATETIME vs TIMESTAMP：**

| 对比 | `DATETIME` | `TIMESTAMP` |
|-----|-----------|-------------|
| 范围 | 1000~9999 年 | 1970~2038 年 |
| 存储 | 8 字节 | 4 字节 |
| 时区 | 存什么是什么 | 存 UTC，读时转本地时区 |
| 推荐 | **存业务时间** | 存系统时间 |

> ⚠️ **注意：** `TIMESTAMP` 在 2038 年会溢出（"2038 年问题"）。**存"创建时间"等长期数据用 `DATETIME` 更安全。**

### 2.5 其他常用类型

| 类型 | 说明 |
|-----|------|
| `JSON` | 存 JSON 数据（MySQL 5.7+） |
| `ENUM('a','b')` | 枚举，只能取指定值 |
| `BLOB` | 二进制大对象（存图片、文件） |

```sql
tags  JSON                        -- 存标签数组
gender ENUM('男','女','未知')      -- 性别枚举
```

> 💡 **提示：** `ENUM` 修改可选值要改表结构，不够灵活。一般用 `TINYINT` + 业务层映射更实用。

---

## 三、约束（保证数据正确）

约束是给字段加的"规则"，防止脏数据进表。

### 3.1 各种约束

| 约束 | 关键字 | 作用 |
|-----|--------|------|
| 主键 | `PRIMARY KEY` | 唯一标识每行，非空且唯一 |
| 非空 | `NOT NULL` | 不能为空 |
| 唯一 | `UNIQUE` | 值不能重复 |
| 默认值 | `DEFAULT` | 不给值时用默认值 |
| 自增 | `AUTO_INCREMENT` | 自动递增（配合主键） |
| 外键 | `FOREIGN KEY` | 引用另一张表，保证关联有效 |
| 检查 | `CHECK` | 自定义条件（MySQL 8.0.16+ 真正生效） |

### 3.2 在建表时定义约束

```sql
CREATE TABLE users (
    id       INT PRIMARY KEY AUTO_INCREMENT,         -- 主键 + 自增
    name     VARCHAR(50) NOT NULL,                   -- 非空
    email    VARCHAR(100) UNIQUE,                    -- 唯一
    age      TINYINT DEFAULT 0,                      -- 默认值
    gender   CHAR(1) CHECK (gender IN ('男','女')),   -- 检查约束
    dept_id  INT,
    FOREIGN KEY (dept_id) REFERENCES dept(id)        -- 外键，关联 dept 表
);
```

### 3.3 主键的两种定义方式

```sql
-- 方式一：列级（单列主键）
id INT PRIMARY KEY

-- 方式二：表级（可定义联合主键）
CREATE TABLE score (
    student_id INT,
    course_id  INT,
    score      INT,
    PRIMARY KEY (student_id, course_id)   -- 联合主键
);
```

### 3.4 外键详解

```sql
-- 子表 orders，通过外键关联父表 users
CREATE TABLE orders (
    id      INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    amount  DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE        -- 删用户时，自动删其订单
        ON UPDATE CASCADE        -- 改用户 id 时，订单 user_id 跟着改
);
```

**外键的级联动作：**

| 动作 | 含义 |
|-----|------|
| `CASCADE` | 父行删/改，子行跟着删/改 |
| `SET NULL` | 父行删/改，子行该列设 NULL（列要允许 NULL） |
| `RESTRICT` / `NO ACTION` | 拒绝删/改父行（默认） |

> ⚠️ **注意：** 互联网公司**通常不用数据库外键**，而是在**应用层**保证关联（性能、灵活性、分库分表考虑）。外键会增加写入开销和级联锁。**了解概念即可，实战慎用。**

### 3.5 约束冲突时报错

```sql
-- 违反 NOT NULL
INSERT INTO users(name) VALUES(NULL);   -- 报错：不能为 NULL

-- 违反 UNIQUE
INSERT INTO users(email) VALUES('a@x.com');  -- 第二次插入同邮箱报错

-- 违反外键
INSERT INTO orders(user_id) VALUES(999);  -- 没有 id=999 的用户，报错
```

---

## 四、修改表结构 ALTER TABLE

### 4.1 增加列

```sql
-- 在最后加一列
ALTER TABLE users ADD COLUMN phone VARCHAR(20) COMMENT '手机号';

-- 在某列之后加
ALTER TABLE users ADD COLUMN nickname VARCHAR(50) AFTER name;

-- 在最前面加
ALTER TABLE users ADD COLUMN uuid VARCHAR(36) FIRST;
```

### 4.2 修改列

```sql
-- 改列类型 / 长度
ALTER TABLE users MODIFY COLUMN name VARCHAR(100);

-- 改列名和类型
ALTER TABLE users CHANGE COLUMN name username VARCHAR(100);

-- MODIFY vs CHANGE：
--   MODIFY 只改类型，不改列名
--   CHANGE 既可改列名，也可改类型
```

### 4.3 删除列

```sql
ALTER TABLE users DROP COLUMN nickname;
```

### 4.4 修改约束 / 索引

```sql
-- 加主键
ALTER TABLE users ADD PRIMARY KEY (id);

-- 加唯一约束
ALTER TABLE users ADD UNIQUE KEY uk_email (email);

-- 加普通索引
ALTER TABLE users ADD INDEX idx_name (name);

-- 删除主键
ALTER TABLE users DROP PRIMARY KEY;

-- 删除索引
ALTER TABLE users DROP INDEX idx_name;

-- 删除外键（要先查出外键名）
ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_1;
```

### 4.5 改表名 / 引擎 / 字符集

```sql
-- 改表名
ALTER TABLE users RENAME TO members;
-- 或
RENAME TABLE users TO members;

-- 改存储引擎
ALTER TABLE users ENGINE=InnoDB;

-- 改字符集
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4;
```

> ⚠️ **注意：大表 ALTER 很危险！** 给几千万行的表加列、改类型，可能锁表几小时。
> - MySQL 8.0 支持**部分在线 DDL**（如加列在末尾、加普通索引），不阻塞读写
> - 大表结构变更应使用 **pt-online-schema-change** 或 **gh-ost** 等在线工具

---

## 五、删除表 DROP / 清空 TRUNCATE

```sql
-- 删除整张表（数据 + 结构全没）
DROP TABLE users;

-- 删除多张表
DROP TABLE table1, table2;

-- 如果表存在才删（避免报错）
DROP TABLE IF EXISTS users;

-- 清空表数据（保留结构），重置自增 id，无法回滚
TRUNCATE TABLE users;
```

**DROP vs TRUNCATE vs DELETE**（详见 `删(delete).md`）：

| 操作 | 删什么 | 能回滚 | 重置自增 |
|-----|--------|:------:|:--------:|
| `DROP TABLE` | 数据 + 结构 | ❌ | 表没了 |
| `TRUNCATE TABLE` | 全部数据 | ❌ | ✅ |
| `DELETE FROM` | 数据（可带条件） | ✅（事务内） | ❌ |

---

## 六、表选项：引擎、字符集

### 6.1 存储引擎

```sql
CREATE TABLE users (...) ENGINE=InnoDB;
```

| 引擎 | 事务 | 行锁 | 适用 |
|-----|:----:|:----:|------|
| **InnoDB** | ✅ 支持 | ✅ | **默认，绝大多数场景** |
| MyISAM | ❌ 不支持 | ❌（表锁） | 只读历史项目，已淘汰 |
| Memory | ❌ | ❌ | 内存表，临时数据 |

> 💡 **提示：** 无脑选 **InnoDB**。它支持事务、行锁、外键，是 MySQL 5.5 后的默认引擎。

### 6.2 字符集（永远用 utf8mb4）

```sql
CREATE TABLE users (...) DEFAULT CHARSET=utf8mb4;

-- 全局默认字符集（推荐在建库时就设好）
CREATE DATABASE mydb DEFAULT CHARSET=utf8mb4;
```

| 字符集 | 字节/字符 | 能存 emoji 吗 |
|-------|----------|:------------:|
| `utf8`（MySQL 版） | 最多 3 字节 | ❌ |
| **`utf8mb4`** | 最多 4 字节 | ✅ |
| `latin1` | 1 字节 | ❌（中文都存不下） |

> ⚠️ **注意：永远用 `utf8mb4`**。MySQL 的 `utf8` 是残缺版（最多 3 字节），存不下 emoji 和部分生僻字，会导致插入失败或乱码。

### 6.3 排序规则（collation）

```sql
-- utf8mb4 默认排序规则
DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
```

| 后缀 | 含义 |
|-----|------|
| `_ci` | case insensitive，不区分大小写（默认） |
| `_cs` | 区分大小写 |
| `_bin` | 二进制比较，区分大小写 |

```sql
-- _ci 不区分大小写：'ABC' = 'abc'
-- 想区分大小写，用 _bin 或查询时加 BINARY
WHERE BINARY name = 'ABC'
```

---

## 七、常用辅助语句

### 7.1 查看表结构

```sql
DESC users;                    -- 查看字段结构（最常用）
DESCRIBE users;

SHOW CREATE TABLE users;       -- 查看建表完整语句（含索引、字符集）

SHOW COLUMNS FROM users;       -- 查看列信息

SHOW TABLES;                   -- 查看当前库所有表
```

### 7.2 CREATE TABLE ... LIKE（复制表结构）

```sql
-- 只复制结构，不复制数据
CREATE TABLE users_backup LIKE users;

-- 复制结构 + 数据
CREATE TABLE users_copy AS SELECT * FROM users;
```

### 7.3 临时表 TEMPORARY

```sql
-- 临时表，会话结束后自动删除
CREATE TEMPORARY TABLE temp_users (
    id INT,
    name VARCHAR(50)
);
-- 适合存放中间计算结果
```

---

## 八、一个完整的建表模板（参考）

实际项目里的表，通常包含这些"标配"字段：

```sql
CREATE TABLE `user` (
    `id`          BIGINT       UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name`        VARCHAR(50)  NOT NULL DEFAULT '' COMMENT '用户名',
    `phone`       VARCHAR(20)  NOT NULL DEFAULT '' COMMENT '手机号',
    `email`       VARCHAR(100)          DEFAULT NULL COMMENT '邮箱',
    `avatar`      VARCHAR(255)          DEFAULT NULL COMMENT '头像URL',
    `status`      TINYINT      NOT NULL DEFAULT 1 COMMENT '状态 1正常 0禁用',
    `version`     INT          NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    `is_deleted`  TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除 0否 1是',
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_phone` (`phone`),
    KEY `idx_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

**模板里的"标配"字段说明：**

| 字段 | 作用 |
|-----|------|
| `id` BIGINT 主键自增 | 唯一标识 |
| `status` | 业务状态 |
| `version` | 乐观锁（并发更新用） |
| `is_deleted` | 逻辑删除标记 |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间（自动更新） |

> 💡 **提示：** `updated_at ... ON UPDATE CURRENT_TIMESTAMP` 表示这条数据被修改时，该字段**自动更新为当前时间**，非常实用，不用代码手动维护。

---

## 九、常见问题与注意事项

### 问题 1：VARCHAR(n) 的 n 是字符数还是字节数？

```
是"字符数"，不是字节数。
VARCHAR(50) 能存 50 个字符——50 个英文字母或 50 个中文都行（只要不超过 50 个字）。
（前提是字符集为 utf8mb4，每个字符最多 4 字节）
```

### 问题 2：ALTER 大表卡死/锁表

```
原因：修改表结构时，MySQL 可能要重建整张表，期间锁表。

解决：
  - 避开业务高峰执行
  - 用 MySQL 8.0 的在线 DDL（INSTANT / INPLACE 算法）
  - 大表用 pt-online-schema-change / gh-ost 工具
```

### 问题 3：外键导致删数据失败

```sql
-- 有外键约束时，删被引用的父行会报错
DELETE FROM users WHERE id = 1;  -- 如果有订单引用该用户，报错

-- 解决：先删子表数据，或用 ON DELETE CASCADE 级联
```

### 问题 4：为什么存时间用 DATETIME 而不是 INT 时间戳？

```
- DATETIME：可读性好（2026-07-02 12:00:00），支持日期函数，范围大
- INT 时间戳：省空间（4 字节），但可读性差，2038 年溢出

折中：业务时间用 DATETIME，日志类高频写入可用 BIGINT 毫秒时间戳。
```

### 问题 5：建表忘了设 utf8mb4，中文乱码

```sql
-- 修复：转换字符集
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

---

## 十、快速参考

### DDL 语句总览

```sql
-- 建表
CREATE TABLE 表名 (列定义, 约束, ...) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 改表
ALTER TABLE 表名 ADD COLUMN 列 类型;          -- 加列
ALTER TABLE 表名 MODIFY COLUMN 列 类型;        -- 改类型
ALTER TABLE 表名 CHANGE COLUMN 旧列 新列 类型; -- 改列名
ALTER TABLE 表名 DROP COLUMN 列;               -- 删列
ALTER TABLE 表名 RENAME TO 新表名;             -- 改名
ALTER TABLE 表名 ADD INDEX 索引名(列);         -- 加索引

-- 删表 / 清空
DROP TABLE 表名;        -- 连结构一起删
TRUNCATE TABLE 表名;    -- 清空数据，保留结构

-- 查看
DESC 表名;              -- 看结构
SHOW CREATE TABLE 表名; -- 看建表语句
```

### 数据类型速选

```
主键 id         → BIGINT UNSIGNED AUTO_INCREMENT
金额 / 价格     → DECIMAL(10,2)
普通整数        → INT / TINYINT
姓名 / 标题     → VARCHAR
固定长度        → CHAR（手机号、编码）
文章正文        → TEXT
生日 / 日期     → DATE
创建时间        → DATETIME
状态值          → TINYINT（0/1/2）
JSON 数据       → JSON
```

### 建表自检清单

```
□ 主键是自增 BIGINT 吗？
□ 字符集是 utf8mb4 吗？
□ 引擎是 InnoDB 吗？
□ 金额用了 DECIMAL 吗？
□ 必填字段加了 NOT NULL 吗？
□ 有默认值的字段加了 DEFAULT 吗？
□ 每个字段加了 COMMENT 吗？
□ 高频查询字段加了索引吗？
□ 有 created_at / updated_at 吗？
□ 表加了 COMMENT 吗？
```
