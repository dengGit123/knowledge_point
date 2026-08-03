# 模板方法模式（Template Method）⭐⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 模板方法模式](https://www.runoob.com/design-pattern/template-pattern.html)
> - [Refactoring.Guru - 模板方法模式](https://refactoring.guru/zh/design-patterns/template-method)

---

## 一、概述

### 1. 是什么

**模板方法模式（Template Method）** 在一个方法中定义算法的**骨架**，而将一些步骤延迟到子类中实现。模板方法让子类在不改变算法结构的情况下，重新定义算法中的某些步骤。

### 2. 解决什么问题

- 多个类有相似的算法流程，只有部分步骤不同
- 需要固定算法骨架，只允许子类重写特定步骤
- 避免代码重复

### 3. 通俗类比

菜谱「做菜」——流程固定是「备料 → 起锅烧油 → 下锅炒 → 装盘」（骨架），但具体炒什么菜、放什么调料由子类（番茄炒蛋、青椒肉丝）决定。

### 4. 类图简图

```
┌─────────────────────────────────┐
│      AbstractClass (抽象类)      │
├─────────────────────────────────┤
│ + templateMethod() {            │  ← final，定义流程骨架
│     step1();                    │
│     step2();   ← 钩子/抽象方法   │
│     step3();                    │
│   }                             │
│ # step1()  { 默认实现 }          │
│ # step2()  { abstract }         │  ← 子类必须实现
│ # step3()  { 默认实现 }          │
└────────────┬────────────────────┘
             △ extends
     ┌───────┴────────┐
┌─────┴─────┐    ┌─────┴─────┐
│ ConcreteA │    │ ConcreteB │   ← 只重写需要变化的步骤
└───────────┘    └───────────┘
```

**核心角色：**
- **AbstractClass（抽象类）**：定义模板方法和算法骨架
- **ConcreteClass（具体类）**：实现抽象步骤

---

## 二、代码示例：冲泡饮料

```java
// 抽象模板类
abstract class CaffeineBeverage {
    // 模板方法：用 final 锁定流程，子类不能改顺序
    public final void prepare() {
        boilWater();       // 共性步骤，父类实现
        brew();            // 差异步骤，子类实现
        pourInCup();       // 共性步骤
        addCondiments();   // 差异步骤，子类实现
    }
    private void boilWater() { System.out.println("烧水"); }
    private void pourInCup() { System.out.println("倒入杯中"); }
    protected abstract void brew();          // 抽象：子类决定怎么泡
    protected abstract void addCondiments(); // 抽象：子类决定加什么料
}
// 具体子类：泡茶
class Tea extends CaffeineBeverage {
    protected void brew() { System.out.println("用沸水浸泡茶叶"); }
    protected void addCondiments() { System.out.println("加柠檬"); }
}
// 具体子类：冲咖啡
class Coffee extends CaffeineBeverage {
    protected void brew() { System.out.println("用沸水冲泡咖啡粉"); }
    protected void addCondiments() { System.out.println("加糖和牛奶"); }
}
// 使用
new Tea().prepare();      // 烧水→泡茶→倒杯→加柠檬
new Coffee().prepare();   // 烧水→冲咖啡→倒杯→加糖奶
```

---

## 三、钩子方法（Hook）

钩子方法是一种「可选」的步骤，子类可以选择是否重写：

```java
abstract class CaffeineBeverage {
    public final void prepare() {
        boilWater();
        brew();
        pourInCup();
        if (wantCondiments()) {   // 钩子：子类决定是否执行
            addCondiments();
        }
    }
    // 钩子方法：默认返回 true，子类可重写
    protected boolean wantCondiments() { return true; }
    protected abstract void brew();
    protected abstract void addCondiments();
}

// 子类：不想加调料
class PureCoffee extends CaffeineBeverage {
    protected void brew() { System.out.println("冲泡黑咖啡"); }
    protected void addCondiments() { /* 不会执行 */ }
    protected boolean wantCondiments() { return false; }  // 不加料
}
```

---

## 四、适用场景

| 场景 | 例子 |
| --- | --- |
| 算法骨架固定 | 数据库连接：获取连接 → 执行 SQL → 处理结果 → 关闭连接 |
| 多个类有相似流程 | 不同报表的生成流程 |
| 需要控制子类扩展点 | 框架中定义生命周期方法 |
| 代码复用 | 提取公共流程到父类 |

---

## 五、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `AbstractList` —— 定义 `addAll` 模板方法，子类实现 `get()`、`size()` |
| JDK | `AbstractMap` —— 定义 `putAll` 模板方法 |
| JDK | `HttpServlet.service()` —— 根据请求方法分发到 `doGet`、`doPost` |
| JDK | `InputStream.read(byte[], int, int)` —— 模板方法，子类实现 `read()` |
| Spring | `JdbcTemplate` —— 封装 JDBC 流程（获取连接 → 执行 SQL → 处理结果 → 关闭） |
| Spring | `RestTemplate` —— HTTP 请求模板 |
| Spring | `TransactionTemplate` —— 事务管理模板 |

---

## 六、模板方法 vs 策略模式

| 维度 | 模板方法 | 策略 |
| --- | --- | --- |
| 机制 | **继承** | **组合** |
| 变化点 | 算法的**局部步骤** | **整个算法** |
| 控制方 | 父类控制流程 | 客户端选择策略 |
| 扩展方式 | 新增子类 | 新增策略类 |
| 适用场景 | 流程固定，步骤可变 | 整个算法可换 |

---

## 七、注意事项

1. **模板方法用 final 修饰** —— 防止子类重写算法骨架。
2. **抽象方法不要太多** —— 如果大部分步骤都要子类实现，说明模板方法设计不合理。
3. **钩子方法提供默认实现** —— 让子类有选择权。
4. **好莱坞原则** —— 「别打电话给我们，我们会打给你」。父类调用子类方法，而不是子类调用父类。

---

## 八、面试常见问题

### Q：模板方法模式和策略模式有什么区别？

**答：**
- **模板方法**：基于**继承**，父类定义算法骨架（流程），子类重写某些步骤。**流程固定，步骤可变**。
- **策略**：基于**组合**，把整个算法封装成对象，运行时切换。**整个算法可换**。
- 一句话：模板方法重定义**算法的局部步骤**，策略重定义**整个算法**。
- 优先用策略（组合优于继承），模板方法适合「框架定义骨架、用户填充细节」的场景。

### Q：什么是钩子方法？

**答：** 钩子方法是模板方法模式中的一种特殊方法，它有一个默认实现（通常是空实现或返回默认值），子类可以选择是否重写。钩子方法让子类有「选择权」——可以选择是否参与某个步骤。典型应用：`wantCondiments()` 决定是否加调料。
