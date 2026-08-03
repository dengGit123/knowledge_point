# 状态模式（State）⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 状态模式](https://www.runoob.com/design-pattern/state-pattern.html)
> - [Refactoring.Guru - 状态模式](https://refactoring.guru/zh/design-patterns/state)

---

## 一、概述

### 1. 是什么

**状态模式（State）** 允许一个对象在**内部状态改变时改变它的行为**，使得对象看起来像是改变了它的类。

### 2. 解决什么问题

- 对象的行为取决于它的状态，且状态转换时行为变化
- 需要消除大量的状态判断 `if-else`
- 状态转换逻辑复杂

### 3. 通俗类比

「订单状态」——同一个订单，在「待支付」「已支付」「已发货」「已完成」状态下，同样的操作（如取消）有不同的行为。状态模式把每个状态的行为封装起来。

### 4. 类图简图

```
┌─────────────────┐         ┌──────────────────┐
│   Context       │────────▶│  <<interface>>   │
│ (上下文)         │  持有    │   State          │
│ - state         │         │ + handle()       │
│ + request()     │         └────────┬─────────┘
└─────────────────┘                  △
                                     │ implements
                  ┌──────────────────┼──────────────────┐
            ┌─────┴─────┐       ┌─────┴─────┐      ┌─────┴─────┐
            │ StateA    │       │ StateB    │      │ StateC    │
            └───────────┘       └───────────┘      └───────────┘
```

**核心角色：**
- **Context（上下文）**：持有当前状态，委托状态处理请求
- **State（抽象状态）**：定义状态接口
- **ConcreteState（具体状态）**：实现特定状态下的行为

---

## 二、代码示例：订单状态

```java
// 抽象状态
interface OrderState {
    void pay(Order ctx);
    void ship(Order ctx);
    void cancel(Order ctx);
    void confirm(Order ctx);
}

// 具体状态：待支付
class PendingPaymentState implements OrderState {
    public void pay(Order ctx) {
        System.out.println("支付成功");
        ctx.setState(new PaidState());      // 状态转换
    }
    public void ship(Order ctx) { System.out.println("未支付，不能发货"); }
    public void cancel(Order ctx) {
        System.out.println("订单已取消");
        ctx.setState(new CancelledState());
    }
    public void confirm(Order ctx) { System.out.println("未支付，不能确认"); }
}

// 具体状态：已支付
class PaidState implements OrderState {
    public void pay(Order ctx) { System.out.println("已支付，无需重复支付"); }
    public void ship(Order ctx) {
        System.out.println("发货成功");
        ctx.setState(new ShippedState());
    }
    public void cancel(Order ctx) {
        System.out.println("已支付，退款后取消");
        ctx.setState(new CancelledState());
    }
    public void confirm(Order ctx) { System.out.println("未发货，不能确认"); }
}

// 具体状态：已发货
class ShippedState implements OrderState {
    public void pay(Order ctx) { System.out.println("已支付过了"); }
    public void ship(Order ctx) { System.out.println("已发货，不能重复发货"); }
    public void cancel(Order ctx) { System.out.println("已发货，不能取消"); }
    public void confirm(Order ctx) {
        System.out.println("确认收货");
        ctx.setState(new CompletedState());
    }
}

// 具体状态：已完成
class CompletedState implements OrderState {
    public void pay(Order ctx) { System.out.println("订单已完成"); }
    public void ship(Order ctx) { System.out.println("订单已完成"); }
    public void cancel(Order ctx) { System.out.println("订单已完成，不能取消"); }
    public void confirm(Order ctx) { System.out.println("订单已完成"); }
}

// 具体状态：已取消
class CancelledState implements OrderState {
    public void pay(Order ctx) { System.out.println("订单已取消"); }
    public void ship(Order ctx) { System.out.println("订单已取消"); }
    public void cancel(Order ctx) { System.out.println("订单已取消"); }
    public void confirm(Order ctx) { System.out.println("订单已取消"); }
}

// 上下文：订单
class Order {
    private OrderState state = new PendingPaymentState();

    public void setState(OrderState state) { this.state = state; }
    public void pay() { state.pay(this); }
    public void ship() { state.ship(this); }
    public void cancel() { state.cancel(this); }
    public void confirm() { state.confirm(this); }
}

// 使用
Order order = new Order();
order.pay();      // 支付成功
order.ship();     // 发货成功
order.confirm();  // 确认收货
order.cancel();   // 订单已完成，不能取消
```

---

## 三、对比 if-else 写法

### ❌ if-else 写法

```java
class Order {
    String status = "PENDING";
    void pay() {
        if ("PENDING".equals(status)) { status = "PAID"; }
        else if ("PAID".equals(status)) { /* 已支付 */ }
        else if ("SHIPPED".equals(status)) { /* 已发货 */ }
        // 每加一个状态就要加一个 else if……
    }
    void ship() { /* 又是一堆 if-else */ }
    void cancel() { /* 又是一堆 if-else */ }
}
```

### ✅ 状态模式

```java
// 每加一个状态只需新增一个状态类，不改老代码
// 每个状态类只关注自己状态下的行为
```

---

## 四、适用场景

| 场景 | 例子 |
| --- | --- |
| 状态驱动行为 | 订单状态机、工作流 |
| 消除状态 if-else | 游戏角色状态（站立、跑、跳） |
| 状态转换复杂 | TCP 连接状态（建立、断开、重连） |
| 权限控制 | 用户状态（未激活、正常、冻结、注销） |

---

## 五、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `Thread` 的状态流转（NEW → RUNNABLE → BLOCKED → WAITING → TERMINATED） |
| Spring | `StateMachine` —— 状态机框架 |
| 工作流 | Flowable、Activiti —— 流程状态机 |

---

## 六、注意事项

1. **状态数量不宜过多** —— 状态太多会导致类爆炸。
2. **状态转换逻辑** —— 可以在 Context 中集中管理，也可以分散在各个状态类中。
3. **与策略模式的区别** —— 结构几乎一样，但意图不同：策略是客户端主动选择，状态是对象内部状态自动切换。

---

## 七、面试常见问题

### Q：状态模式和策略模式的区别？

**答：**
- **策略模式**：客户端**主动选择**策略，策略之间互相独立。
- **状态模式**：对象**内部状态自动切换**，状态之间有关联（如订单状态：待支付 → 已支付 → 已发货）。
- 结构几乎一样，但**意图不同**：策略是「我选哪个算法」，状态是「我处于哪个状态」。

### Q：状态模式适合什么场景？

**答：** 当一个对象的行为取决于它的状态，且状态数量较多、状态转换复杂时，状态模式可以有效消除大量的状态判断 `if-else`。典型场景：订单状态机、游戏角色状态、TCP 连接状态、工作流引擎。
