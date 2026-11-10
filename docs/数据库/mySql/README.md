# MySQL 知识点目录

> 官方文档：[MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)

本目录按"从基础到进阶"组织 MySQL 知识点，每篇一个主题。文档约定：

- 每篇开头附官方文档链接，配通俗类比 + 完整示例
- 示例统一使用 `users` 表（定义见《增(insert).md》开头）
- 标注适用版本（MySQL 5.7 / 8.0），示例默认 MySQL 8.0
- 提示统一用 💡 **提示** / ⚠️ **注意** 引用块标出

## 学习路线

```
阶段一：入门（是什么、怎么用）
  数据库 → 表结构(DDL) → 数据类型 → 增/删/改/查

阶段二：进阶（怎么用得好）
  索引(index) → SQL性能优化 → 事务(transaction)

阶段三：扩展（数据库还提供什么能力）
  视图与触发器 → 函数与存储过程 → 用户与权限管理 → 备份与恢复
```

## 文档列表

### 阶段一：入门

| 文档 | 内容 | 前置 |
|------|------|------|
| [数据库.md](数据库.md) | 库的创建/切换/删除、字符集、系统库速览 | 无 |
| [表结构(DDL).md](表结构(DDL).md) | 建表、约束、ALTER、引擎与字符集 | 数据库.md |
| [数据类型.md](数据类型.md) | 数值/字符串/日期时间/JSON 类型与选型 | 表结构(DDL).md |
| [增(insert).md](增(insert).md) | 插入、批量插入、处理重复数据 | 表结构(DDL).md |
| [查(select).md](查(select).md) | SELECT 全语法：WHERE/GROUP BY/JOIN/子查询 | 增(insert).md |
| [改(update).md](改(update).md) | 更新、关联更新、CASE WHEN、乐观锁 | 增(insert).md |
| [删(delete).md](删(delete).md) | DELETE/TRUNCATE/DROP 对比、软删除 | 增(insert).md |

### 阶段二：进阶

| 文档 | 内容 | 前置 |
|------|------|------|
| [索引(index).md](索引(index).md) | B+ 树、聚簇/二级索引、回表、最左前缀、EXPLAIN | 查(select).md |
| [SQL性能优化.md](SQL性能优化.md) | 慢查询日志、EXPLAIN 深入、分库分表 | 索引(index).md |
| [事务(transaction).md](事务(transaction).md) | ACID、隔离级别、锁、MVCC、死锁 | 增删改查 |

### 阶段三：扩展

| 文档 | 内容 | 前置 |
|------|------|------|
| [视图与触发器.md](视图与触发器.md) | 视图的用途与限制、触发器语法与慎用原因 | 查(select).md |
| [函数与存储过程.md](函数与存储过程.md) | 内置函数速查、自定义函数、存储过程 | 查(select).md |
| [用户与权限管理.md](用户与权限管理.md) | user@host、GRANT/REVOKE、角色、安全实践 | 数据库.md |
| [备份与恢复.md](备份与恢复.md) | mysqldump、XtraBackup、binlog、PITR | 用户与权限管理.md |

## 主题互查

| 你想知道… | 看这篇 |
|-----------|--------|
| 存金额用什么类型 | [数据类型.md](数据类型.md) 定点数一节 |
| 为什么查询不走索引 | [索引(index).md](索引(index).md) 第八节 |
| DELETE 和 TRUNCATE 区别 | [删(delete).md](删(delete).md) 第二节 |
| 深分页很慢怎么办 | [查(select).md](查(select).md) 分页一节 / [SQL性能优化.md](SQL性能优化.md) |
| 误删数据怎么救 | [备份与恢复.md](备份与恢复.md) 误删抢救实战 |
| 应用层怎么写事务 | [事务(transaction).md](事务(transaction).md) 第十节 |

## 官方文档速查

- [数据类型](https://dev.mysql.com/doc/refman/8.0/en/data-types.html) · [SQL 语句](https://dev.mysql.com/doc/refman/8.0/en/sql-statements.html) · [优化](https://dev.mysql.com/doc/refman/8.0/en/optimization.html) · [InnoDB](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html) · [备份与恢复](https://dev.mysql.com/doc/refman/8.0/en/backup-and-recovery.html) · [安全](https://dev.mysql.com/doc/refman/8.0/en/security.html)
