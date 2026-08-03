# 享元模式（Flyweight）⭐⭐

> 参考资源：
> - [菜鸟教程 - 享元模式](https://www.runoob.com/design-pattern/flyweight-pattern.html)
> - [Refactoring.Guru - 享元模式](https://refactoring.guru/zh/design-patterns/flyweight)

---

## 一、概述

### 1. 是什么

**享元模式（Flyweight）** 通过**共享**细粒度对象来有效地支持大量对象的复用，从而节省内存。

### 2. 解决什么问题

- 系统中存在大量相似对象，占用大量内存
- 这些对象的大部分状态可以共享（内部状态）
- 少量状态因对象而异（外部状态），由客户端传入

### 3. 通俗类比

「共享单车」——不需要每人买一辆单车，大家共享同一批单车。单车本身（内部状态）是共享的，骑行的人（外部状态）是变化的。

### 4. 类图简图

```
┌────────────────┐         ┌────────────────┐
│  Flyweight     │         │ FlyweightFactory│
│ + operation()  │◀────────│ - pool: Map    │
└───────┬────────┘  共享    │ + get(key)     │
        △                   └────────────────┘
        │                          │
┌───────┴────────┐                 │
│ConcreteFlyweight│◀────────────────┘
│ - intrinsicState│   工厂返回已有实例或创建新实例
└────────────────┘
```

**核心概念：**
- **内部状态（Intrinsic State）**：不随环境变化，可共享（如字符的 Unicode 编码）
- **外部状态（Extrinsic State）**：随环境变化，不可共享（如字符的颜色、位置）

---

## 二、代码示例：文本编辑器

```java
import java.util.*;

// 享元对象：字符
class Character {
    private final char symbol;   // 内部状态：字符本身（共享）
    public Character(char symbol) { this.symbol = symbol; }
    // 外部状态（颜色、位置）由客户端传入
    public void display(String color, int x, int y) {
        System.out.printf("字符 '%c' 颜色=%s 位置=(%d,%d)%n", symbol, color, x, y);
    }
}

// 享元工厂
class CharacterFactory {
    private final Map<Character, Character> pool = new HashMap<>();
    public Character getCharacter(char symbol) {
        Character c = pool.get(symbol);
        if (c == null) {
            c = new Character(symbol);
            pool.put(symbol, c);
            System.out.println("创建新享元：" + symbol);
        }
        return c;
    }
}

// 使用
CharacterFactory factory = new CharacterFactory();
// 文档中多次出现 'a'，但只创建一个 Character 对象
factory.getCharacter('a').display("红色", 0, 0);
factory.getCharacter('a').display("蓝色", 1, 0);  // 复用同一个 'a'
factory.getCharacter('b').display("红色", 2, 0);
factory.getCharacter('a').display("绿色", 3, 0);  // 复用同一个 'a'
```

---

## 三、适用场景

| 场景 | 例子 |
| --- | --- |
| 大量相似对象 | 文本编辑器中的字符、游戏中的子弹 |
| 对象大部分状态可共享 | 棋子（颜色共享，位置不共享） |
| 使用内存有限 | 移动端应用、嵌入式系统 |
| 对象 ID 可区分 | 数据库连接池中的连接 |

---

## 四、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `Integer.valueOf()` —— `-128~127` 缓存（享元） |
| JDK | `String` 常量池 —— 相同字符串共享同一对象 |
| JDK | `Boolean.valueOf()` —— `TRUE` 和 `FALSE` 是静态享元 |
| JDK | `ThreadLocal` —— 线程级别的享元思想 |
| 连接池 | 数据库连接池、线程池 —— 复用连接/线程对象 |

---

## 五、Integer 缓存源码分析

```java
// Integer.valueOf() 源码（简化）
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)  // -128 ~ 127
        return IntegerCache.cache[i + (-IntegerCache.low)];  // 返回缓存
    return new Integer(i);  // 超出范围才创建新对象
}

// 验证
Integer a = Integer.valueOf(100);
Integer b = Integer.valueOf(100);
System.out.println(a == b);  // true（共享缓存）

Integer c = Integer.valueOf(200);
Integer d = Integer.valueOf(200);
System.out.println(c == d);  // false（超出缓存范围，创建新对象）
```

---

## 六、注意事项

1. **区分内部状态和外部状态** —— 内部状态必须不可变，否则共享会出问题。
2. **线程安全** —— 享元工厂的池需要考虑并发访问。
3. **不要过度使用** —— 如果对象数量不多，没必要用享元模式。
4. **外部状态由客户端维护** —— 享元对象不持有外部状态。

---

## 七、面试常见问题

### Q：享元模式的核心思想是什么？

**答：** 享元模式的核心是**共享**。把对象的「内部状态」（可共享、不可变）和「外部状态」（不可共享、可变）分离，内部状态作为享元对象共享，外部状态由客户端传入。典型应用：`Integer.valueOf()` 的 `-128~127` 缓存、`String` 常量池。

### Q：享元模式和对象池（连接池）的区别？

**答：**
- **享元模式**：共享的是对象的**内部状态**，多个客户端共享同一个享元对象，外部状态由客户端传入。
- **对象池**：池中每个对象都是**独立的、完整的**，客户端独占使用，用完归还。
- 享元是「共享单车」，对象池是「共享充电宝」。
