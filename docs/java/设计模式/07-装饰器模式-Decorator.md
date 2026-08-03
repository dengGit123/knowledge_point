# 装饰器模式（Decorator）⭐⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 装饰器模式](https://www.runoob.com/design-pattern/decorator-pattern.html)
> - [Refactoring.Guru - 装饰器模式](https://refactoring.guru/zh/design-patterns/decorator)

---

## 一、概述

### 1. 是什么

**装饰器模式（Decorator）** 动态地给一个对象**增加额外的职责**，比生成子类（继承）更灵活。

### 2. 解决什么问题

- 需要给对象动态增加功能，且能自由组合
- 不想通过继承导致类爆炸
- 需要运行时灵活叠加功能

### 3. 通俗类比

买奶茶——基础是「原味」，可以一层层加料（珍珠、椰果、奶盖），每加一层就是一个装饰器，最终组合出你要的口味。

### 4. 与继承的区别

- 继承是**静态的**（编译时确定），装饰器是**动态的**（运行时组合）
- 继承是「is-a」关系，装饰器是「has-a」关系
- 继承会导致子类爆炸，装饰器可以任意组合

### 5. 类图简图

```
┌────────────────┐  ◇(聚合自身)  ┌─────────────────┐
│   Component    │◀─────────────│   Decorator     │
│ +operation()   │              │ -component      │
└───────┬────────┘              │ +operation()    │
        △                       └────────┬────────┘
        │ implements                     │ extends
┌───────┴────────┐              ┌────────┴────────┐
│ ConcreteComp   │              │ ConcreteDecoA/B │
│ (被装饰对象)    │              │ (具体装饰器)     │
└────────────────┘              └─────────────────┘
```

**核心角色：**
- **Component（抽象组件）**：定义对象接口
- **ConcreteComponent（具体组件）**：被装饰的原始对象
- **Decorator（抽象装饰器）**：持有 Component 引用
- **ConcreteDecorator（具体装饰器）**：添加新功能

---

## 二、代码示例：咖啡加料

```java
// 抽象组件
interface Coffee { double cost(); String desc(); }
// 具体组件：基础咖啡
class SimpleCoffee implements Coffee {
    public double cost() { return 10; }
    public String desc() { return "咖啡"; }
}
// 抽象装饰器：实现了 Coffee 接口，并持有一个 Coffee
abstract class CoffeeDecorator implements Coffee {
    protected final Coffee coffee;
    public CoffeeDecorator(Coffee coffee) { this.coffee = coffee; }
}
// 具体装饰器：加奶
class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee c) { super(c); }
    public double cost() { return coffee.cost() + 3; }       // 在原价上加 3
    public String desc() { return coffee.desc() + " +奶"; }
}
// 具体装饰器：加糖
class SugarDecorator extends CoffeeDecorator {
    public SugarDecorator(Coffee c) { super(c); }
    public double cost() { return coffee.cost() + 1; }
    public String desc() { return coffee.desc() + " +糖"; }
}
// 具体装饰器：加奶泡
class WhipDecorator extends CoffeeDecorator {
    public WhipDecorator(Coffee c) { super(c); }
    public double cost() { return coffee.cost() + 5; }
    public String desc() { return coffee.desc() + " +奶泡"; }
}

// 使用：层层装饰
Coffee c = new SugarDecorator(new MilkDecorator(new SimpleCoffee()));
System.out.println(c.desc() + " 共 " + c.cost() + " 元");
// 输出：咖啡 +奶 +糖 共 14 元

// 自由组合：加奶+奶泡
Coffee c2 = new WhipDecorator(new MilkDecorator(new SimpleCoffee()));
System.out.println(c2.desc() + " 共 " + c2.cost() + " 元");
// 输出：咖啡 +奶 +奶泡 共 18 元
```

---

## 三、在 Java IO 中的应用

Java IO 流是装饰器模式的**经典应用**：

```java
// 一层层装饰：FileInputStream（读字节） → BufferedInputStream（加缓冲） → DataInputStream（读基本类型）
InputStream in = new DataInputStream(
                     new BufferedInputStream(
                         new FileInputStream("a.txt")));
```

| IO 类 | 角色 |
| --- | --- |
| `InputStream` | 抽象组件 Component |
| `FileInputStream` | 具体组件 ConcreteComponent |
| `FilterInputStream` | 抽象装饰器 Decorator |
| `BufferedInputStream`、`DataInputStream` | 具体装饰器 ConcreteDecorator |

---

## 四、适用场景

| 场景 | 例子 |
| --- | --- |
| 动态添加功能 | 给文本加粗、斜体、下划线 |
| 功能可组合 | 咖啡加料、披萨加 topping |
| 不想用继承扩展 | 避免子类爆炸 |
| 可以撤销功能 | 去掉某层装饰器 |

---

## 五、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | Java IO 流体系 —— `BufferedInputStream`、`DataInputStream` 等 |
| JDK | `Collections.synchronizedList()` —— 给 List 加同步功能 |
| JDK | `Collections.unmodifiableList()` —— 给 List 加只读功能 |
| Spring | `BeanWrapper` —— 给 Bean 增加属性编辑能力 |
| Spring | `TransactionAwareCacheDecorator` —— 给 Cache 增加事务感知 |

---

## 六、注意事项

1. **保持接口一致** —— 装饰器必须实现与被装饰对象相同的接口，对客户端透明。
2. **装饰器应尽量轻量** —— 如果装饰器逻辑太复杂，考虑用其他模式。
3. **多层装饰可能影响性能** —— 每层装饰器都是一次方法调用。
4. **对象 ID 问题** —— 装饰后的对象不再是原来的对象，`==` 判断会失败。

---

## 七、面试常见问题

### Q：装饰器模式和代理模式有什么区别？

**答：** 两者结构非常像（都持有目标对象引用并实现同一接口），但**目的不同**：

| 维度 | 装饰器 | 代理 |
| --- | --- | --- |
| 主要目的 | **增强**功能（加新行为） | **控制**访问（加权限/延迟/日志等横切关注点） |
| 关注点 | 调用方关心（调用方主动包装） | 被代理方关心（调用方无感） |
| 典型场景 | Java IO 流 | Spring AOP、远程代理 |
| 装饰层数 | 通常多层 | 通常一层 |

### Q：装饰器模式和继承相比有什么优势？

**答：**
- **灵活性**：装饰器可以在运行时动态组合功能，继承是编译时确定的。
- **避免类爆炸**：3 个功能用继承需要 8 个子类，用装饰器只需 3 个装饰器类。
- **单一职责**：每个装饰器只负责一个功能，符合 SRP。
- **开闭原则**：新增功能只需新增装饰器，无需修改已有代码。
