# 工厂模式（Factory）⭐⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 工厂模式](https://www.runoob.com/design-pattern/factory-pattern.html)
> - [Refactoring.Guru - 工厂方法](https://refactoring.guru/zh/design-patterns/factory-method)
> - [Refactoring.Guru - 抽象工厂](https://refactoring.guru/zh/design-patterns/abstract-factory)

---

## 一、概述

### 1. 是什么

**工厂模式** 定义一个用于创建对象的接口，让子类决定实例化哪个类。工厂模式把对象的创建逻辑封装起来，调用方无需关心对象怎么 `new`。

### 2. 解决什么问题

- 对象的创建逻辑复杂时，调用方不需要知道细节
- 需要根据不同条件创建不同对象时，避免调用方写大量 `if-else`
- 解耦对象的创建和使用

### 3. 通俗类比

一家「奶茶店」——你只要说「要珍珠奶茶」，店员（工厂）帮你制作，你不用关心制作过程。工厂模式就是帮你「生产对象」的中间人。

### 4. 三种演进形态

工厂模式有三种演进形态，层层递进：**简单工厂 → 工厂方法 → 抽象工厂**。

---

## 二、简单工厂（Simple Factory / 静态工厂）

### 1. 概念

简单工厂不是 GoF 23 种模式之一，但它是最常用的工厂雏形。一个工厂类根据传入的参数决定创建哪种产品。

### 2. 类图简图

```
┌──────────────────┐        ┌──────────────────┐
│  <<产品>>        │        │  SimpleFactory   │
│   Product        │◀───────│ + create(type)   │
└──────┬───────────┘  创建  └──────────────────┘
       △
       │ implements
┌──────┴───────┐
│ ConcreteProA │
└──────────────┘
```

### 3. 代码示例

```java
// 抽象产品
interface MilkTea { void drink(); }
// 具体产品
class PearlMilkTea implements MilkTea { public void drink() { System.out.println("珍珠奶茶"); } }
class CoconutMilkTea implements MilkTea { public void drink() { System.out.println("椰果奶茶"); } }

// 简单工厂
class MilkTeaFactory {
    public static MilkTea create(String type) {
        switch (type) {
            case "pearl":   return new PearlMilkTea();
            case "coconut": return new CoconutMilkTea();
            default: throw new IllegalArgumentException("未知类型");
        }
    }
}
// 使用：MilkTea t = MilkTeaFactory.create("pearl");
```

- **优点**：实现简单，客户端无需关心创建细节。
- **缺点**：每新增一种奶茶都要修改工厂的 `switch`，违背**开闭原则**。

---

## 三、工厂方法（Factory Method）

### 1. 概念

**核心改进：** 把工厂也抽象化，每种产品对应一个工厂类。新增产品时只需新增产品类 + 工厂类，**不改老代码**。

### 2. 类图简图

```
┌──────────────┐        ┌──────────────────┐
│  <<产品>>    │        │  <<工厂>>        │
│   Product    │◀───创建│   Factory        │
└──────┬───────┘        └────────┬─────────┘
       △                         △
       │ implements              │ implements
┌──────┴───────┐        ┌────────┴─────────┐
│ ConcreteProA │        │ ConcreteFactoryA │──▶ new ConcreteProA()
└──────────────┘        └──────────────────┘
```

### 3. 代码示例

```java
// 产品接口 + 工厂接口
interface MilkTea { void drink(); }
interface MilkTeaFactory { MilkTea create(); }

// 珍珠奶茶 + 其工厂
class PearlMilkTea implements MilkTea { public void drink() { System.out.println("珍珠奶茶"); } }
class PearlMilkTeaFactory implements MilkTeaFactory {
    public MilkTea create() { return new PearlMilkTea(); }
}
// 椰果奶茶 + 其工厂
class CoconutMilkTea implements MilkTea { public void drink() { System.out.println("椰果奶茶"); } }
class CoconutMilkTeaFactory implements MilkTeaFactory {
    public MilkTea create() { return new CoconutMilkTea(); }
}

// 使用
MilkTeaFactory factory = new PearlMilkTeaFactory();
factory.create().drink();   // 珍珠奶茶
```

- **优点**：符合开闭原则，扩展容易。
- **缺点**：类数量翻倍（每加一种产品加两个类）。

---

## 四、抽象工厂（Abstract Factory）

### 1. 概念

当需要创建**一族相关**的产品时（如「现代风家具」：现代沙发+现代椅子+现代桌子；「古典风家具」：古典沙发+...），抽象工厂提供一个接口，创建一系列相关或相互依赖的对象。

### 2. 类图简图

```
┌─────────────────────┐        ┌─────────────────────┐
│  AbstractFactory    │        │  AbstractProductA   │
│ + createProductA()  │───────▶│ + operationA()      │
│ + createProductB()  │        └─────────────────────┘
└──────────┬──────────┘        ┌─────────────────────┐
           │                   │  AbstractProductB   │
           └──────────────────▶│ + operationB()      │
                               └─────────────────────┘
```

### 3. 代码示例

```java
// 一族产品接口
interface Chair { void sit(); }
interface Sofa { void lie(); }

// 抽象工厂：创建一整族家具
interface FurnitureFactory {
    Chair createChair();
    Sofa createSofa();
}
// 现代风格工厂
class ModernFurnitureFactory implements FurnitureFactory {
    public Chair createChair() { return new ModernChair(); }
    public Sofa createSofa() { return new ModernSofa(); }
}
// 古典风格工厂
class ClassicalFurnitureFactory implements FurnitureFactory {
    public Chair createChair() { return new ClassicalChair(); }
    public Sofa createSofa() { return new ClassicalSofa(); }
}

// 具体产品
class ModernChair implements Chair { public void sit() { System.out.println("坐现代椅"); } }
class ModernSofa implements Sofa { public void lie() { System.out.println("躺现代沙发"); } }
class ClassicalChair implements Chair { public void sit() { System.out.println("坐古典椅"); } }
class ClassicalSofa implements Sofa { public void lie() { System.out.println("躺古典沙发"); } }

// 使用
FurnitureFactory factory = new ModernFurnitureFactory();
factory.createChair().sit();   // 坐现代椅
factory.createSofa().lie();    // 躺现代沙发
```

---

## 五、三种工厂对比

| 维度 | 简单工厂 | 工厂方法 | 抽象工厂 |
| --- | --- | --- | --- |
| 结构复杂度 | 低 | 中 | 高 |
| 扩展新产品 | 需改工厂（违背 OCP） | 新增类（符合 OCP） | 新增风格易，新增产品族难 |
| 创建产品数 | 单一 | 单一 | 一族多个 |
| 适用场景 | 产品少且稳定 | 产品种类多 | 需创建产品族 |
| 是否 GoF 模式 | ❌ | ✅ | ✅ |

---

## 六、适用场景

| 场景 | 例子 |
| --- | --- |
| 对象创建过程复杂 | 需要多步骤组装的对象 |
| 需要根据不同条件创建不同对象 | 根据配置创建不同数据库连接 |
| 需要解耦创建和使用 | 框架中 Bean 的创建 |
| 需要创建一族相关产品 | 跨平台 UI 组件库（Windows/Mac 风格） |

---

## 七、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `Calendar.getInstance()` —— 根据时区/语言环境创建不同实例 |
| JDK | `LoggerFactory.getLogger()` —— 工厂方法创建日志器 |
| JDK | `java.sql.Connection` —— 抽象工厂创建 Statement、PreparedStatement |
| Spring | `BeanFactory` / `ApplicationContext` —— 工厂方法创建 Bean |
| Spring | `FactoryBean` 接口 —— 自定义 Bean 的创建逻辑 |

---

## 八、注意事项

1. **不要过度使用** —— 如果产品种类很少且不会扩展，直接 `new` 即可。
2. **简单工厂 vs 工厂方法的选择** —— 产品少且稳定用简单工厂；产品多且频繁扩展用工厂方法。
3. **抽象工厂的局限** —— 新增一个产品族（如新增「北欧风」）很容易；但新增一个产品类型（如新增「桌子」接口）需要修改所有工厂类，违背 OCP。

---

## 九、面试常见问题

### Q：工厂方法模式与抽象工厂模式的区别？

**答：**
- **工厂方法**：一个工厂只创建**一种**产品，针对「产品等级结构」（同一类型的不同实现）。新增产品只需新增对应工厂，符合开闭原则。
- **抽象工厂**：一个工厂创建**一族**相关产品（如现代风格家具族），针对「产品族」。适合「成套创建」场景。
- 一句话：工厂方法关注**单一产品的扩展**，抽象工厂关注**产品族的切换**。

### Q：Spring 中工厂模式的应用？

**答：** Spring 的 `BeanFactory` 和 `ApplicationContext` 就是工厂模式的典型应用。Spring 容器负责创建和管理 Bean，客户端只需通过 `getBean()` 获取实例，无需关心 Bean 的创建过程。`FactoryBean` 接口允许用户自定义 Bean 的创建逻辑。
