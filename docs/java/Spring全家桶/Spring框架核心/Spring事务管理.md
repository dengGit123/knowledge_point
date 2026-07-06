### 一、概述

> 📖 [Spring Data Access - Transactions](https://docs.spring.io/spring-framework/reference/data-access/transaction.html)

**事务（Transaction）** 保证一组数据库操作「**要么全成功，要么全回滚**」。Spring 把它简化成了**一个注解**——`@Transactional`。它的底层就是上一篇讲的 [[AOP面向切面]]：给方法套一层代理，方法前开启事务、方法正常结束就提交、抛异常就回滚。

| 你将学到 | 说明 |
| --- | --- |
| 声明式事务 | `@Transactional` 怎么用 |
| 事务传播行为 | 嵌套调用时事务怎么传递（7 种） |
| 事务隔离级别 | 并发下的事务隔离 |
| 【重点】事务失效场景 | 8 个常见踩坑点 |

> 💡 **类比：** 转账要扣 A 的钱、加 B 的钱两步。如果扣完 A 就崩了，B 没加上——钱就凭空消失了。事务保证「这两步绑在一起，一损俱损」。

---

### 二、编程式 vs 声明式

| | 编程式事务 | 声明式事务 |
| --- | --- | --- |
| 写法 | 手动 `begin`/`commit`/`rollback` | 加个 `@Transactional` 注解 |
| 侵入性 | 强（业务代码混入事务代码） | 无（业务代码干净） |
| 灵活度 | 高（能精确控制范围） | 中（按方法/类粒度） |
| 推荐 | 仅在需要精细控制时用 | **日常首选** |

声明式事务用法极简：

```java
@Service
public class TransferService {

    @Transactional   // ✅ 整个方法包在一个事务里
    public void transfer(Long from, Long to, BigDecimal amount) {
        accountDao.decrease(from, amount);
        accountDao.increase(to, amount);   // 任何一步抛异常，两步都回滚
    }
}
```

---

### 三、`@Transactional` 属性详解

```java
@Transactional(
    propagation = Propagation.REQUIRED,        // 传播行为
    isolation   = Isolation.DEFAULT,           // 隔离级别
    timeout     = 30,                          // 超时秒数
    readOnly    = false,                       // 是否只读
    rollbackFor = Exception.class,             // 哪些异常回滚
    noRollbackFor = BusinessException.class    // 哪些异常不回滚
)
```

| 属性 | 作用 | 常用值 |
| --- | --- | --- |
| `propagation` | 嵌套调用时事务怎么传播 | `REQUIRED`（默认） |
| `isolation` | 并发事务隔离级别 | `DEFAULT`（用数据库的） |
| `timeout` | 事务超时（秒） | 默认 -1（不超时） |
| `readOnly` | 标记只读事务，数据库可优化 | 查询方法设 `true` |
| `rollbackFor` | 遇到哪些异常回滚 | 建议 `Exception.class` |
| `noRollbackFor` | 遇到哪些异常**不**回滚 | 业务上可接受的异常 |

> 💡 **提示：** 标在**类**上，类里所有 `public` 方法都生效；标在**方法**上，方法级覆盖类级。

---

### 四、事务传播行为（7 种）

「传播行为」回答的是：**当前已经在一个事务里了，再调一个带 `@Transactional` 的方法，新方法该怎么做？**

| 传播行为 | 当前有事务 | 当前无事务 | 使用场景 |
| --- | --- | --- | --- |
| `REQUIRED`（默认） | **加入**当前事务 | 新建一个事务 | 绝大多数场景 |
| `REQUIRES_NEW` | **挂起**当前，**新建**独立事务 | 新建一个事务 | 日志记录（不受主事务回滚影响） |
| `NESTED` | 创建**嵌套**事务（基于保存点） | 新建一个事务 | 部分失败可回滚到保存点 |
| `SUPPORTS` | 加入当前事务 | 以**非事务**方式运行 | 查询（有事务就加入，没有也行） |
| `NOT_SUPPORTED` | 挂起当前，以**非事务**运行 | 以非事务方式运行 | 耗时操作不想占用事务连接 |
| `NEVER` | **抛异常** | 以非事务方式运行 | 明确要求不能在事务里执行 |
| `MANDATORY` | 加入当前事务 | **抛异常** | 明确要求必须在事务里执行 |

### 三个重点详解

```
场景：methodA() 调用 methodB()

【REQUIRED】（默认，最常用）
  A 有事务 ─► A、B 在【同一个】事务里，B 失败则 A 也回滚

【REQUIRES_NEW】
  A 有事务 ─► A 先挂起，B 开【全新独立】事务
              ├─ B 成功提交（即使 A 之后回滚，B 不受影响）
              └─ 典型：操作日志要保留，哪怕主业务失败

【NESTED】
  A 有事务 ─► B 作为 A 的子事务（基于数据库保存点）
              ├─ B 失败回滚到保存点，A 可选择继续或整体回滚
              └─ B 成功则跟随 A 一起提交
```

> ⚠️ **注意：** `REQUIRES_NEW` 会**占用两个数据库连接**，连接池小、并发高时容易耗尽连接。别滥用。

---

### 五、事务隔离级别

隔离级别解决并发事务下的「脏读 / 不可重复读 / 幻读」问题：

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
| --- | --- | --- | --- |
| `READ_UNCOMMITTED` 读未提交 | 可能 | 可能 | 可能 |
| `READ_COMMITTED` 读已提交 | 避免 | 可能 | 可能 |
| `REPEATABLE_READ` 可重复读 | 避免 | 避免 | 可能 |
| `SERIALIZABLE` 串行化 | 避免 | 避免 | 避免 |
| `DEFAULT`（用数据库的） | — | — | — |

> 💡 **提示：** 一般用 `DEFAULT`，让 Spring 用数据库的默认级别（MySQL InnoDB 默认 `REPEATABLE_READ`，Oracle 默认 `READ_COMMITTED`）。隔离级别越高越安全，但并发性能越低。

---

### 六、【重点】事务失效的常见场景

这是面试和实战的重灾区。`@Transactional` 在以下情况**不会生效**：

#### 1. 方法不是 `public`

```java
@Transactional
void transfer(Long from, Long to) { }   // ❌ 非 public，事务失效
```

> 原因：Spring AOP 默认只代理 public 方法。

#### 2. 自调用（同类内部方法调用）

```java
@Service
public class PayService {

    public void pay() {
        this.doPay();   // ❌ this 调用走的是原始对象，不经过代理，doPay 上的事务失效
    }

    @Transactional
    public void doPay() { }
}
```

> 原因：事务基于代理，`this.doPay()` 绕过了代理对象。详见 [[AOP面向切面]]。

#### 3. 异常被 try-catch 吞掉

```java
@Transactional
public void transfer() {
    try {
        dao.decrease();
        throw new RuntimeException("出错了");
    } catch (Exception e) {
        log.error("出错", e);
        // ❌ 异常被吞，Spring 感知不到异常 → 不会回滚！
    }
}
```

> 修正：catch 里 `throw new RuntimeException(e)` 重新抛出，或手动 `TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()`。

#### 4. 抛了「检查异常」默认不回滚

```java
@Transactional
public void transfer() throws IOException {
    dao.decrease();
    throw new IOException("IO 异常");   // ❌ 默认不回滚！IOException 是检查异常
}

// ✅ 修正：指定 rollbackFor
@Transactional(rollbackFor = Exception.class)
public void transfer2() throws IOException { }
```

> 原因：Spring 默认只对 `RuntimeException` 和 `Error` 回滚，对检查异常（`IOException`、`SQLException` 等）**不回滚**。**强烈建议永远写 `rollbackFor = Exception.class`**。

#### 5. 数据库引擎不支持事务

MySQL 的 MyISAM 引擎**不支持事务**，无论怎么加注解都不生效。要用 **InnoDB**。

#### 6. Bean 没被 Spring 管理

```java
// ❌ 没 @Service，是个普通对象，@Transactional 无效
public class OrderService {
    @Transactional
    public void create() { }
}
```

#### 7. 抛了但异常类型不在 `rollbackFor`

`rollbackFor = SQLException.class`，却抛了 `BusinessException`，则不回滚。

#### 8. 传播行为配置不当

```java
@Transactional(propagation = Propagation.NOT_SUPPORTED)  // 以非事务方式运行
public void transfer() { }
```

> 💡 **总结口诀：** 非公开、自调用、吞异常、检查异常、非 InnoDB、非 Bean、传播错——事务失效的「七宗罪」。

---

### 七、解决自调用失效

#### 方法一：注入自身代理（推荐）

```java
@Service
public class PayService {
    @Autowired
    private PayService self;   // 注入自身的代理对象

    public void pay() {
        self.doPay();   // ✅ 通过代理调用，事务生效
    }

    @Transactional
    public void doPay() { }
}
```

#### 方法二：通过 `AopContext` 获取代理

```java
public void pay() {
    ((PayService) AopContext.currentProxy()).doPay();   // ✅ 需开启 exposeProxy
}
// 需 @EnableAspectJAutoProxy(exposeProxy = true)
```

> 💡 **更优解：** 根本上避免自调用——把 `doPay` 拆到另一个 `@Service`，职责清晰，也不用纠结代理问题。

---

### 八、实际应用场景

1. **转账/下单**：多步操作必须原子性的经典场景。
2. **批量导入**：一批数据要么全入库要么全撤销。
3. **只读优化**：查询方法标 `@Transactional(readOnly = true)`，数据库可做只读优化、跳过脏检查。
4. **日志独立提交**：操作日志用 `REQUIRES_NEW`，保证主业务回滚后日志仍保留。
5. **跨服务事务**：分布式事务需要 Seata 等（见 [[../SpringCloud微服务/分布式事务]]，超出单机事务范畴）。

---

### 九、常见问题与注意事项

> ⚠️ **注意：**
> - **永远写 `@Transactional(rollbackFor = Exception.class)`**，避免检查异常不回滚的坑。
> - 事务方法尽量**短小、快速**，长时间持有数据库连接会拖垮连接池。
> - 事务方法里**别做耗时的非数据库操作**（如远程 HTTP 调用、大文件处理），否则事务长时间挂起。
> - `@Transactional` 加在接口上对**基于类的代理（CGLIB）无效**，建议加在类或方法上。

> 💡 **提示：** 遇到「数据莫名其妙没回滚」，按失效七宗罪逐一排查，99% 的问题都在里面。

---

### 十、总结

- **声明式事务**：一个 `@Transactional` 搞定，底层是 [[AOP面向切面]] 代理。
- **传播行为**：默认 `REQUIRED`；日志独立提交用 `REQUIRES_NEW`；部分回滚用 `NESTED`。
- **隔离级别**：一般用 `DEFAULT`，让数据库决定。
- **失效七宗罪**：非 public、自调用、吞异常、检查异常、非 InnoDB、非 Bean、传播错。
- **铁律**：写 `rollbackFor = Exception.class`，事务方法保持短小。

Spring 框架核心到此结束。下一步进入现代开发的标配：[[../SpringBoot/SpringBoot入门]]。
