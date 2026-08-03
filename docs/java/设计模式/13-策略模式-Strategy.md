# 策略模式（Strategy）⭐⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 策略模式](https://www.runoob.com/design-pattern/strategy-pattern.html)
> - [Refactoring.Guru - 策略模式](https://refactoring.guru/zh/design-patterns/strategy)

---

## 一、概述

### 1. 是什么

**策略模式（Strategy）** 定义一系列算法，把它们各自封装成类，并且使它们**可以互相替换**。策略模式让算法的变化独立于使用算法的客户端。

### 2. 解决什么问题

- 消除大量的 `if-else` / `switch` 分支
- 同一件事有多种实现方式，需要灵活切换
- 算法需要独立于使用者变化

### 3. 通俗类比

出行方式——同样的「从 A 到 B」，可以选公交、地铁、打车、骑行（不同策略）。你随时可以切换策略，不影响「出行」这件事本身。

### 4. 最大价值

**消除大量的 `if-else`。**

### 5. 类图简图

```
┌─────────────────┐  uses   ┌──────────────────┐
│   Context       │────────▶│  <<interface>>   │
│ -strategy       │         │   Strategy       │
│ +execute()      │         │ +algorithm()     │
└─────────────────┘         └────────┬─────────┘
                                     △
                                     │ implements
                  ┌──────────────────┼──────────────────┐
            ┌─────┴─────┐       ┌─────┴─────┐      ┌─────┴─────┐
            │ StrategyA │       │ StrategyB │      │ StrategyC │
            └───────────┘       └───────────┘      └───────────┘
```

**核心角色：**
- **Strategy（抽象策略）**：定义算法接口
- **ConcreteStrategy（具体策略）**：实现具体算法
- **Context（上下文）**：持有策略引用，可动态切换

---

## 二、代码示例：支付方式选择

```java
// 抽象策略
interface PaymentStrategy { void pay(double amount); }
// 具体策略：微信支付
class WechatPay implements PaymentStrategy {
    public void pay(double amount) { System.out.println("微信支付 " + amount + " 元"); }
}
// 具体策略：支付宝
class Alipay implements PaymentStrategy {
    public void pay(double amount) { System.out.println("支付宝支付 " + amount + " 元"); }
}
// 具体策略：银行卡
class CardPay implements PaymentStrategy {
    public void pay(double amount) { System.out.println("银行卡支付 " + amount + " 元"); }
}
// 上下文：持有策略，可动态切换
class PaymentContext {
    private PaymentStrategy strategy;
    public void setStrategy(PaymentStrategy s) { this.strategy = s; }
    public void checkout(double amount) { strategy.pay(amount); }
}

// 使用
PaymentContext ctx = new PaymentContext();
ctx.setStrategy(new WechatPay());   ctx.checkout(100);   // 微信
ctx.setStrategy(new Alipay());      ctx.checkout(100);   // 支付宝
ctx.setStrategy(new CardPay());     ctx.checkout(100);   // 银行卡
```

---

## 三、对比 if-else 写法

### ❌ if-else 写法

```java
// 每加一种支付方式都要改这里，违背开闭原则
void checkout(String type, double amount) {
    if ("wechat".equals(type)) { /* 微信 */ }
    else if ("alipay".equals(type)) { /* 支付宝 */ }
    else if ("card".equals(type)) { /* 银行卡 */ }
    // 新增支付方式又得加一个 else if……
}
```

### ✅ 策略模式

```java
// 新增支付方式只需新增策略类，不改老代码
class BitcoinPay implements PaymentStrategy {
    public void pay(double amount) { System.out.println("比特币支付 " + amount + " 元"); }
}
ctx.setStrategy(new BitcoinPay());  // 直接可用
```

---

## 四、结合工厂模式（实战常用）

```java
// 策略工厂：根据类型返回策略
class PaymentFactory {
    private static final Map<String, PaymentStrategy> strategies = new HashMap<>();
    static {
        strategies.put("wechat", new WechatPay());
        strategies.put("alipay", new Alipay());
        strategies.put("card", new CardPay());
    }
    public static PaymentStrategy get(String type) {
        PaymentStrategy s = strategies.get(type);
        if (s == null) throw new IllegalArgumentException("未知支付类型");
        return s;
    }
}
// 使用：一行代码
PaymentFactory.get("wechat").pay(100);
```

---

## 五、Lambda 简化（Java 8+）

当策略接口只有一个方法时（函数式接口），可以用 Lambda 简化：

```java
// 策略接口（函数式接口）
@FunctionalInterface
interface DiscountStrategy {
    double calculate(double price);
}

// 使用 Lambda 直接创建策略
DiscountStrategy vip = price -> price * 0.8;
DiscountStrategy student = price -> price * 0.9;
DiscountStrategy normal = price -> price;

System.out.println(vip.calculate(100));     // 80.0
System.out.println(student.calculate(100)); // 90.0
```

---

## 六、适用场景

| 场景 | 例子 |
| --- | --- |
| 多种算法可互换 | 支付方式、排序算法、压缩算法 |
| 需要消除 if-else | 不同用户等级不同折扣 |
| 算法需要独立变化 | 不同的数据校验规则 |
| 隐藏算法实现细节 | 加密算法（AES、DES、RSA） |

---

## 七、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `Comparator` —— 给 `Collections.sort` 传不同比较策略 |
| JDK | `ThreadPoolExecutor` 的 `RejectedExecutionHandler` —— 拒绝策略 |
| JDK | `ResourceBundle` —— 不同语言环境的资源加载策略 |
| Spring | `Resource` 接口 —— 不同资源加载策略（ClassPath、File、URL） |
| Spring | `InstantiationStrategy` —— Bean 的实例化策略 |

---

## 八、注意事项

1. **策略数量不宜过多** —— 如果策略太多，考虑用其他方式（如规则引擎）。
2. **客户端必须知道有哪些策略** —— 策略模式不负责选择策略，选择逻辑在客户端。
3. **与状态模式的区别** —— 策略是客户端主动选择，状态是对象内部状态自动切换。
4. **策略对象可以共享** —— 如果策略无状态，多个 Context 可以共享同一个策略实例。

---

## 九、面试常见问题

### Q：策略模式解决了什么问题？请举一个 JDK 的例子。

**答：** 策略模式解决了**算法可互换**问题，本质是**消除大量 if-else 分支**，让算法的变化独立于使用者。

JDK 经典例子：`java.util.Comparator`——给 `Collections.sort(list, comparator)` 传不同的比较器（策略），排序算法不变，排序规则可灵活替换。Lambda 表达式让策略模式写得更简洁。

### Q：策略模式和模板方法模式有什么区别？

**答：**
- **模板方法**：基于**继承**，父类定义算法骨架（流程），子类重写某些步骤。**流程固定，步骤可变**。
- **策略**：基于**组合**，把整个算法封装成对象，运行时切换。**整个算法可换**。
- 一句话：模板方法重定义**算法的局部步骤**，策略重定义**整个算法**。

### Q：策略模式和状态模式的区别？

**答：**
- **策略模式**：客户端**主动选择**策略，策略之间互相独立，没有关联。
- **状态模式**：对象**内部状态自动切换**，状态之间有关联（如订单状态：待支付 → 已支付 → 已发货）。
- 结构几乎一样，但**意图不同**：策略是「我选哪个算法」，状态是「我处于哪个状态」。
