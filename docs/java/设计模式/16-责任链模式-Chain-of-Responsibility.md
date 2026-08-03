# 责任链模式（Chain of Responsibility）⭐⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 责任链模式](https://www.runoob.com/design-pattern/chain-of-responsibility-pattern.html)
> - [Refactoring.Guru - 责任链模式](https://refactoring.guru/zh/design-patterns/chain-of-responsibility)

---

## 一、概述

### 1. 是什么

**责任链模式（Chain of Responsibility）** 使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系。把这些对象连成一条**链**，并沿着这条链传递请求，直到有一个对象处理它为止。

### 2. 解决什么问题

- 多个对象可以处理同一请求，具体由谁处理运行时决定
- 需要按顺序依次校验/处理
- 想动态指定处理对象集合

### 3. 通俗类比

公司审批报销——员工提交报销单，先到组长，组长权限不够往上交给经理，经理权限不够再交给总经理……一级级往上，直到有人能拍板。

### 4. 类图简图

```
┌──────────────────────────────────────┐
│          Handler (抽象处理器)          │
├──────────────────────────────────────┤
│ - next: Handler    ◇(指向下一个)      │
│ + setNext(handler)                   │
│ + handle(request) {                   │
│     if 能处理 → 处理                  │
│     else if next != null → next.handle│
│   }                                   │
└──────────────────┬───────────────────┘
                   △ extends
    ┌──────────────┼──────────────┐
┌────┴────┐   ┌────┴────┐   ┌────┴────┐
│ Handler1│──▶│ Handler2│──▶│ Handler3│   组成一条链
└─────────┘   └─────────┘   └─────────┘
```

---

## 二、代码示例：审批流程

```java
// 抽象处理器
abstract class Approver {
    protected Approver next;     // 下一个处理者
    protected String name;
    public Approver(String name) { this.name = name; }
    public Approver setNext(Approver next) { this.next = next; return next; }  // 链式串联
    public abstract void approve(double amount);
}
// 组长：权限 1000
class TeamLeader extends Approver {
    public TeamLeader(String n) { super(n); }
    public void approve(double amount) {
        if (amount <= 1000) System.out.println(name + " 批准 " + amount + " 元");
        else if (next != null) next.approve(amount);
    }
}
// 经理：权限 10000
class Manager extends Approver {
    public Manager(String n) { super(n); }
    public void approve(double amount) {
        if (amount <= 10000) System.out.println(name + " 批准 " + amount + " 元");
        else if (next != null) next.approve(amount);
    }
}
// 总经理：权限无限
class GeneralManager extends Approver {
    public GeneralManager(String n) { super(n); }
    public void approve(double amount) { System.out.println(name + " 批准 " + amount + " 元"); }
}

// 使用：组装责任链
Approver chain = new TeamLeader("组长");
chain.setNext(new Manager("经理")).setNext(new GeneralManager("总经理"));
chain.approve(500);     // 组长 批准 500 元
chain.approve(5000);    // 经理 批准 5000 元
chain.approve(50000);   // 总经理 批准 50000 元
```

---

## 三、进阶：Web 请求过滤器

```java
// 抽象处理器
abstract class Filter {
    protected Filter next;
    public Filter setNext(Filter next) { this.next = next; return next; }
    public void doFilter(Request request) {
        handle(request);           // 当前处理器处理
        if (next != null) next.doFilter(request);  // 传递给下一个
    }
    protected abstract void handle(Request request);
}
// 具体处理器：登录校验
class AuthFilter extends Filter {
    protected void handle(Request request) {
        if (!request.isLogin()) throw new RuntimeException("未登录");
        System.out.println("[AuthFilter] 登录校验通过");
    }
}
// 具体处理器：权限校验
class PermissionFilter extends Filter {
    protected void handle(Request request) {
        if (!request.hasPermission("admin")) throw new RuntimeException("无权限");
        System.out.println("[PermissionFilter] 权限校验通过");
    }
}
// 具体处理器：日志记录
class LogFilter extends Filter {
    protected void handle(Request request) {
        System.out.println("[LogFilter] 记录请求日志：" + request.getPath());
    }
}

// 使用
Filter chain = new AuthFilter();
chain.setNext(new PermissionFilter()).setNext(new LogFilter());
chain.doFilter(request);  // 依次执行：登录→权限→日志
```

> ⚠️ **注意：** 上面的进阶示例和审批示例的区别：审批是「有一个处理就停止」，过滤器是「全部执行」。责任链模式两种都可以。

---

## 四、两种责任链变体

| 变体 | 行为 | 典型应用 |
| --- | --- | --- |
| **纯责任链** | 请求被一个处理器处理后停止 | 审批流程 |
| **不纯责任链** | 请求经过所有处理器 | Web 过滤器、Netty Pipeline |

---

## 五、适用场景

| 场景 | 例子 |
| --- | --- |
| 多级审批 | 报销审批、请假审批 |
| 数据校验 | 参数校验链（非空→格式→业务规则） |
| 请求过滤 | Web 过滤器、拦截器 |
| 日志处理 | 日志级别链（DEBUG → INFO → ERROR） |
| 异常处理 | 多级异常捕获 |

---

## 六、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| Servlet | `FilterChain` —— 过滤器链 |
| Spring MVC | `HandlerInterceptor` —— 拦截器链 |
| Spring Security | 过滤器链 —— 认证、授权、CSRF 等 |
| Netty | `ChannelPipeline` —— 处理器链 |
| OkHttp | 拦截器链 —— 请求/响应处理 |
| SLF4J | 日志级别处理链 |

---

## 七、注意事项

1. **链的长度** —— 链太长会影响性能，且难以调试。
2. **循环引用** —— 链中不能出现环，否则死循环。
3. **请求可能未被处理** —— 如果链中没有处理器能处理请求，需要有兜底策略。
4. **设置 next 的顺序** —— 链的顺序很重要，影响处理结果。

---

## 八、面试常见问题

### Q：责任链模式和策略模式的区别？

**答：**
- **策略模式**：客户端**选择一个策略**执行，只有一个策略生效。
- **责任链模式**：请求**沿链传递**，可能有多个处理器依次处理（或第一个匹配的处理）。
- 策略是「选一个」，责任链是「走一遍」。

### Q：Spring 中的责任链模式？

**答：** Spring MVC 的 `HandlerInterceptor` 和 Spring Security 的过滤器链都是责任链模式：
- 请求依次经过多个拦截器/过滤器
- 每个拦截器可以决定放行（调用 `chain.doFilter()`）或中断（不调用）
- 支持前置处理和后置处理
