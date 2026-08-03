# 单例模式（Singleton）⭐⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 单例模式](https://www.runoob.com/design-pattern/singleton-pattern.html)
> - [Refactoring.Guru - 单例模式](https://refactoring.guru/zh/design-patterns/singleton)

---

## 一、概述

### 1. 是什么

**单例模式（Singleton）** 确保一个类在整个程序生命周期中**只有一个实例**，并提供一个全局访问点。

### 2. 解决什么问题

全局共享的资源（如配置管理器、连接池、日志器、Spring 容器中的单例 Bean），如果到处 `new` 会浪费内存、导致状态不一致。

### 3. 通俗类比

想象一个「班级里只能有一个班主任」——不管谁来问「班主任是谁」，都指向同一个人。单例模式就是保证程序里某个类只能有一个实例的「班主任」。

### 4. 类图简图

```
┌───────────────────────┐
│      Singleton        │
├───────────────────────┤
│ - instance: Singleton │  ← 类持有唯一实例（static）
├───────────────────────┤
│ - Singleton()         │  ← 私有构造，禁止外部 new
│ + getInstance()       │  ← 全局访问点（static）
│ + doSomething()       │
└───────────────────────┘
```

**核心三要素：**
1. **私有构造方法**：禁止外部 `new`
2. **静态私有实例**：类自身持有唯一实例
3. **静态公有访问点**：对外提供获取实例的方法

---

## 二、五种实现方式

### 1. 饿汉式（线程安全，立即加载）

实例在类加载时就创建。利用 JVM 类加载机制天然保证线程安全。

```java
public class Singleton1 {
    // 类加载时即创建，JVM 保证线程安全
    private static final Singleton1 INSTANCE = new Singleton1();
    private Singleton1() {}              // 私有构造
    public static Singleton1 getInstance() { return INSTANCE; }
}
```

- **优点**：实现简单、线程安全、无需加锁、性能高。
- **缺点**：类加载即初始化，若未使用会浪费内存；不支持延迟加载。

---

### 2. 懒汉式（懒加载，需处理线程安全）

```java
// ❌ 简单懒汉式：多线程下不安全，可能创建多个实例
public class Singleton2 {
    private static Singleton2 instance;
    private Singleton2() {}
    public static Singleton2 getInstance() {
        if (instance == null) {
            instance = new Singleton2();   // 竞态条件！
        }
        return instance;
    }
}

// ✅ 加 synchronized：线程安全，但性能差（每次调用都加锁）
public static synchronized Singleton2 getInstance() {
    if (instance == null) instance = new Singleton2();
    return instance;
}
```

- **问题**：`synchronized` 锁太重，每次调用 `getInstance()` 都要加锁，即使实例早已创建。

---

### 3. 双重检查锁（DCL，Double-Checked Locking）⭐ 推荐

```java
public class Singleton3 {
    // volatile 防止「指令重排序」导致的半初始化对象问题
    private static volatile Singleton3 instance;
    private Singleton3() {}

    public static Singleton3 getInstance() {
        if (instance == null) {                 // 第一次检查：避免不必要的加锁
            synchronized (Singleton3.class) {
                if (instance == null) {         // 第二次检查：确保只创建一次
                    instance = new Singleton3();
                }
            }
        }
        return instance;
    }
}
```

> ⚠️ **注意：** `volatile` 在 DCL 中**必不可少**。`new` 操作分三步：分配内存 → 初始化 → 赋值引用，若被重排成「分配 → 赋值 → 初始化」，其他线程可能拿到未初始化完成的对象。`volatile` 通过内存屏障禁止这种重排。

---

### 4. 静态内部类（推荐，延迟加载 + 线程安全）

利用**类加载机制**：外部类加载时不会立即加载静态内部类，只有调用 `getInstance()` 时才加载，天然实现懒加载和线程安全。

```java
public class Singleton4 {
    private Singleton4() {}
    // 静态内部类，持有实例
    private static class Holder {
        private static final Singleton4 INSTANCE = new Singleton4();
    }
    public static Singleton4 getInstance() {
        return Holder.INSTANCE;     // 触发 Holder 类加载，JVM 保证线程安全
    }
}
```

- **优点**：兼顾懒加载和性能，实现简洁，无需 `synchronized`。
- **缺点**：无法向 getInstance() 传参来初始化。

---

### 5. 枚举实现（最优，防反射/反序列化攻击）

Effective Java 作者 Josh Bloch 推荐。枚举天然是单例，且天然防御反射攻击和反序列化漏洞。

```java
public enum Singleton5 {
    INSTANCE;                       // 唯一实例
    public void doSomething() {}
}
// 使用：Singleton5.INSTANCE.doSomething();
```

> 💡 **为什么枚举能防反射？** `Constructor.newInstance()` 内部会检查枚举类型并抛出异常，无法通过反射创建枚举实例。

---

## 三、五种实现对比

| 实现方式 | 线程安全 | 懒加载 | 性能 | 防反射/反序列化 | 推荐度 |
| --- | --- | --- | --- | --- | --- |
| 饿汉式 | ✅ | ❌ | 高 | ❌ | ⭐⭐⭐⭐ |
| 懒汉式 synchronized | ✅ | ✅ | 低 | ❌ | ⭐⭐ |
| 双重检查锁 DCL | ✅ | ✅ | 高 | ❌ | ⭐⭐⭐⭐⭐ |
| 静态内部类 | ✅ | ✅ | 高 | ❌ | ⭐⭐⭐⭐⭐ |
| 枚举 | ✅ | ❌ | 高 | ✅ | ⭐⭐⭐⭐⭐ |

---

## 四、破坏单例的方式与防御

### 1. 反射攻击

```java
// 通过反射强行调用私有构造
Constructor<Singleton1> c = Singleton1.class.getDeclaredConstructor();
c.setAccessible(true);
Singleton1 s = c.newInstance();  // 破坏！
```

**防御**：在枚举实现中天然免疫；其他实现需在构造中加检查抛出异常。

### 2. 反序列化攻击

```java
// 序列化后再反序列化，会创建新对象
ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("singleton.ser"));
oos.writeObject(Singleton1.getInstance());

ObjectInputStream ois = new ObjectInputStream(new FileInputStream("singleton.ser"));
Singleton1 s = (Singleton1) ois.readObject();  // 新对象！破坏！
```

**防御**：实现 `readResolve()` 方法返回已有实例。

```java
private Object readResolve() {
    return INSTANCE;  // 反序列化时返回已有实例
}
```

---

## 五、适用场景

| 场景 | 例子 |
| --- | --- |
| 全局配置管理 | `Runtime.getRuntime()`、配置中心客户端 |
| 线程池/连接池 | 数据库连接池、线程池对象 |
| 日志器 | `LoggerFactory.getLogger()` |
| 缓存 | 全局缓存管理器 |
| Spring Bean | 默认 `scope=singleton` 的 Bean |

---

## 六、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `Runtime.getRuntime()` —— 运行时单例 |
| JDK | `System.in` / `System.out` / `System.err` —— 标准 IO 单例 |
| Spring | Bean 默认作用域 `singleton` |

---

## 七、注意事项

1. **单例不适合需要频繁创建和销毁的对象** —— 单例常驻内存，可能造成内存泄漏（尤其是持有大对象时）。
2. **单例不利于单元测试** —— 全局状态会污染测试环境，难以 mock。
3. **分布式环境下单例失效** —— 每个 JVM 各有一个实例，跨进程需要借助分布式锁或外部存储。
4. **不要滥用单例** —— 不是所有「全局唯一」都适合单例，有时用静态工具类即可。

---

## 八、面试常见问题

### Q：单例模式有哪几种实现？哪种最优？

**答：** 常见五种——饿汉式、懒汉式（加 synchronized）、双重检查锁（DCL）、静态内部类、枚举。

- **最优推荐**：**枚举**（防反射和反序列化攻击，写法最简洁）；其次**静态内部类**和 **DCL**（兼顾懒加载和性能）。
- **线程安全**：饿汉式靠类加载天然安全；懒汉式需 `synchronized`；DCL 用 `volatile` + 双重检查；静态内部类靠类加载机制；枚举天然安全。

### Q：DCL 中 volatile 的作用？

**答：** 防止 `new` 操作的指令重排序。`new` 分三步：分配内存 → 初始化 → 赋值引用。若被重排成「分配 → 赋值 → 初始化」，其他线程可能拿到未初始化完成的对象（不为 null 但字段还是默认值）。`volatile` 通过内存屏障禁止这种重排。
