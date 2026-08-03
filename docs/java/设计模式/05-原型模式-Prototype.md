# 原型模式（Prototype）⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 原型模式](https://www.runoob.com/design-pattern/prototype-pattern.html)
> - [Refactoring.Guru - 原型模式](https://refactoring.guru/zh/design-patterns/prototype)

---

## 一、概述

### 1. 是什么

**原型模式（Prototype）** 通过**克隆（拷贝）**一个已有对象来创建新对象，而不是通过 `new` 关键字。

### 2. 解决什么问题

- 创建对象成本大（如需要查数据库、网络请求），而已有对象足够相似时
- 需要大量相似对象时，避免重复初始化
- 想隔离对象的创建细节

### 3. 通俗类比

「复印机」——你已经有一份文件（原型），直接复印一份出来，比重新手写快得多。原型模式就是对象的「复印机」。

### 4. 类图简图

```
┌──────────────────┐
│  <<interface>>   │
│   Prototype      │
│ + clone()        │
└────────┬─────────┘
         △ implements
┌────────┴─────────┐
│ ConcretePrototype│
│ + clone()        │
└──────────────────┘
```

---

## 二、Java 实现：Cloneable 接口

Java 通过 `Cloneable` 接口和 `clone()` 方法实现原型模式。

### 1. 浅拷贝（默认 clone）

```java
// 实现 Cloneable，重写 clone()
class User implements Cloneable {
    String name;
    int age;

    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    protected User clone() throws CloneNotSupportedException {
        return (User) super.clone();   // 浅拷贝
    }
}

// 使用
User prototype = new User("张三", 28);
User copy = prototype.clone();         // 克隆出新对象
```

### 2. 浅拷贝 vs 深拷贝

```java
class Address {
    String city;
    public Address(String city) { this.city = city; }
}

class Person implements Cloneable {
    String name;
    Address address;   // 引用类型

    public Person(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    // 浅拷贝：只复制基本类型和引用（address 指向同一对象）
    @Override
    protected Person clone() throws CloneNotSupportedException {
        return (Person) super.clone();
    }

    // 深拷贝：递归克隆引用类型
    protected Person deepClone() throws CloneNotSupportedException {
        Person copy = (Person) super.clone();
        copy.address = new Address(this.address.city);  // 重新创建引用对象
        return copy;
    }
}
```

### 3. 浅拷贝的问题演示

```java
Address addr = new Address("北京");
Person p1 = new Person("张三", addr);
Person p2 = p1.clone();

p2.address.city = "上海";
System.out.println(p1.address.city);  // 上海！被影响了（浅拷贝共享引用）
```

### 4. 深拷贝的三种实现方式

#### 方式一：手动递归克隆

```java
@Override
protected Person deepClone() throws CloneNotSupportedException {
    Person copy = (Person) super.clone();
    copy.address = new Address(this.address.city);
    return copy;
}
```

#### 方式二：序列化（推荐，简单可靠）

```java
import java.io.*;

class Person implements Serializable {
    String name;
    Address address;

    // 通过序列化实现深拷贝
    @SuppressWarnings("unchecked")
    public Person deepClone() {
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ObjectOutputStream oos = new ObjectOutputStream(bos);
            oos.writeObject(this);   // 序列化

            ByteArrayInputStream bis = new ByteArrayInputStream(bos.toByteArray());
            ObjectInputStream ois = new ObjectInputStream(bis);
            return (Person) ois.readObject();   // 反序列化 = 全新对象
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

#### 方式三：JSON 序列化（常用）

```java
// 使用 Gson/Jackson 实现深拷贝
Gson gson = new Gson();
Person copy = gson.fromJson(gson.toJson(original), Person.class);
```

---

## 三、适用场景

| 场景 | 例子 |
| --- | --- |
| 对象创建成本高 | 数据库查询结果缓存后克隆 |
| 需要大量相似对象 | 游戏中的角色模板 |
| 保护对象创建细节 | 隐藏复杂的初始化逻辑 |
| 对象状态快照 | 撤销操作、历史记录 |

---

## 四、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `Object.clone()` —— 原型模式的基础 |
| JDK | `ArrayList` 的 `clone()` —— 浅拷贝列表 |
| Spring | `BeanDefinition` 的原型作用域（`prototype`）—— 每次 getBean 都克隆一个新实例 |

---

## 五、注意事项

1. **Cloneable 是标记接口** —— 没有方法，只是告诉 JVM 「这个类允许被克隆」。
2. **clone() 是 protected** —— 需要重写为 public 才能外部调用。
3. **final 字段问题** —— `clone()` 无法修改 final 字段，需要特殊处理。
4. **构造方法不执行** —— 克隆对象时不会调用构造方法，可能跳过初始化逻辑。
5. **推荐用拷贝构造或工厂替代 clone** —— Effective Java 建议优先使用拷贝构造方法或拷贝工厂。

```java
// 拷贝构造方法（推荐）
class Person {
    String name;
    Address address;
    // 拷贝构造
    public Person(Person other) {
        this.name = other.name;
        this.address = new Address(other.address.city);
    }
}
```

---

## 六、面试常见问题

### Q：深拷贝和浅拷贝的区别？

**答：**
- **浅拷贝**：只复制对象本身和其中基本类型字段，引用类型字段只复制引用（指向同一对象）。
- **深拷贝**：递归复制对象及其所有引用类型字段，完全独立。
- Java 默认的 `clone()` 是浅拷贝，深拷贝需要手动实现（递归克隆、序列化、JSON 转换）。

### Q：原型模式和 new 的区别？

**答：** `new` 走完整的构造流程（分配内存 → 调用构造方法 → 初始化字段）；`clone()` 直接从已有对象复制内存状态，不调用构造方法。当对象创建成本高且新对象与已有对象相似时，`clone()` 更高效。
