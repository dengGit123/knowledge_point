# Class 对象——反射的入口

> 📖 官方文档：[Class (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Class.html) ｜ [Oracle 反射教程 - Retrieving Class Objects](https://docs.oracle.com/javase/tutorial/reflect/class/classNew.html)

## 一、概述

反射的第一步永远是先拿到 `Class` 对象。`java.lang.Class` 是反射体系的**总入口**——只有拿到了某个类的 `Class` 对象，才能进一步查询它的构造器、方法、字段，进而做各种动态操作。

`Class` 对象是什么？可以这样理解：

- JVM 加载一个类时，会把类的元信息（类名、父类、接口、字段、方法、注解……）读进内存，并为之创建一个 `java.lang.Class` 类型的对象，这就是 **`Class` 对象**。
- 每个**被加载**的类，在每个**类加载器**下有且只有一个对应的 `Class` 对象。
- 反射的所有操作，都是从 `Class` 对象出发的「读元信息 → 拿成员 → 做操作」。

> 💡 **类比：** `Class` 对象就像一个类的「身份证 + 档案袋」。身份证上有类名、父类是谁；档案袋里装着这个类所有的构造器、方法、字段的详细记录。想了解一个类、甚至想不经过 `new` 就造出它的对象，都得先找到这个档案袋。

```text
┌──────────────────────────────────────────────────┐
│                     JVM 内存                      │
│                                                  │
│   类的元信息（方法区 / 元空间）                     │
│        │                                         │
│        ▼                                         │
│   ┌─────────────┐    1 个类 ↔ 1 个 Class 对象     │
│   │ Class 对象  │ ◄── 反射操作的唯一入口           │
│   └──────┬──────┘                                │
│          │ 查询/获取                              │
│          ▼                                       │
│   Constructor │ Method │ Field │ Annotation ...    │
└──────────────────────────────────────────────────┘
```

## 二、获取 Class 对象的三种方式

| 方式 | 语法示例 | 适用时机 | 是否触发类初始化 |
| ---- | ---- | ---- | ---- |
| 类字面量 | `String.class` | 编译期已知具体类型 | ❌ 否 |
| `getClass()` | `obj.getClass()` | 已有对象实例 | ❌ 否（对象已存在说明早就初始化了） |
| `Class.forName()` | `Class.forName("java.lang.String")` | 只有类名字符串 | ✅ **是** |

### 1. 方式一：类字面量 `类型.class`

编译期就知道具体类型时使用，**最安全、最高效**，且不会触发类的初始化。

```java
Class<String> strCls = String.class;     // 类的 Class 对象
Class<Integer> intCls = int.class;       // ✅ 基本类型也有 Class 对象
Class<Void> voidCls = void.class;        // void 也有
Class<String[]> arrCls = String[].class; // ✅ 数组类型也有
Class<int[][]> arr2 = int[][].class;     // 多维数组同样支持
```

> 💡 **提示：** 基本类型的 `Class` 对象只能通过 `int.class` 这种字面量方式获取（或 `Integer.TYPE`），因为基本类型没有对象，无法调用 `getClass()`。另外 `int.class == Integer.TYPE` 为 `true`，但 `int.class != Integer.class`——后者是包装类的 Class 对象。

### 2. 方式二：`对象.getClass()`

`getClass()` 定义在 `Object` 类中（`final` 方法），任何对象都能调用。当你**手里有一个对象**、想知道它的**真实类型**（运行时类型）时使用。

```java
Object obj = "hello";            // 编译期类型是 Object
Class<?> cls = obj.getClass();
System.out.println(cls.getName()); // java.lang.String —— 拿到的是运行时真实类型
```

注意它返回的是**运行时类型**，而不是编译期声明类型——这正是多态场景下判断对象真实身份的利器。

### 3. 方式三：`Class.forName("全限定类名")`

当类名只存在于**字符串**里（配置文件、注解属性、网络传输）时，唯一可行的动态加载方式。这是框架最常用的手法。

```java
// 全限定类名 = 包名 + 类名
Class<?> cls = Class.forName("java.util.HashMap");

// 数组类型要写成 JVM 的「二进制名称」格式
Class<?> strArr = Class.forName("[Ljava.lang.String;"); // String[]
Class<?> intArr = Class.forName("[I");                  // int[]
```

> ⚠️ **注意：** `Class.forName(String)` 等价于 `Class.forName(className, true, 当前类加载器)`——第二个参数 `initialize` 固定为 `true`，即**加载并初始化**该类：会执行 `static {}` 静态代码块和静态变量赋值。如果只想加载、不想初始化，用三参数重载并传 `false`：
>
> ```java
> // 只加载不初始化
> Class<?> cls = Class.forName("com.example.Foo", false, Foo.class.getClassLoader());
> ```
>
> JDBC 经典写法 `Class.forName("com.mysql.cj.jdbc.Driver")` 正是利用了「会触发初始化」这一点——驱动类的静态代码块会把自己注册到 `DriverManager`。（现代 JDBC 4.0+ 已通过 SPI 机制自动注册，不再需要手写这行。）

该方法抛出受检异常 `ClassNotFoundException`（类名写错或类不在 classpath 时），必须捕获或向上声明。

### 4. 验证：同一个类的 Class 对象是同一个

同一个类加载器加载的同一个类，无论用哪种方式获取，拿到的都是**同一个 `Class` 对象**（JVM 保证唯一）。

```java
Class<?> c1 = String.class;
Class<?> c2 = "hello".getClass();
Class<?> c3 = Class.forName("java.lang.String");

System.out.println(c1 == c2); // true —— 地址相同
System.out.println(c2 == c3); // true
```

正因为唯一，`Class` 对象经常被用作**锁对象**或**缓存 Map 的 key**（如各种 `Map<Class<?>, ?>` 元数据缓存）。

## 三、Class 对象能查到什么

拿到 `Class` 对象后，可以查询类的方方面面：

| 分类 | 常用方法 | 说明 |
| ---- | ---- | ---- |
| 类名信息 | `getName()` / `getSimpleName()` / `getCanonicalName()` | 全限定名 / 简单名 / 规范名 |
| 类的来源 | `getClassLoader()` / `getPackageName()` / `getModule()` | 类加载器、包名、模块 |
| 继承体系 | `getSuperclass()` / `getInterfaces()` | 父类、直接实现的接口 |
| 成员 | `getConstructors()` / `getMethods()` / `getFields()` | 构造器、方法、字段（详见 [获取类结构信息](./获取类结构信息.md)） |
| 类型判断 | `isInterface()` / `isEnum()` / `isArray()` / `isPrimitive()` / `isAnnotation()` / `isRecord()` | 判断类的种类 |
| 类型转换 | `cast()` / `asSubclass()` / `isInstance()` / `isAssignableFrom()` | 动态类型检查与转换 |
| 资源 | `getResourceAsStream()` | 读取类路径下的资源文件 |
| 实例化 | `getDeclaredConstructor().newInstance()` | 反射创建对象（详见 [Constructor](./Constructor.md)） |

### 类名三兄弟的区别

以 `java.util.Map.Entry`（Map 的静态内部类）和一个二维数组为例：

| 方法 | 普通类 `User` | 内部类 `Map.Entry` | 数组 `String[]` |
| ---- | ---- | ---- | ---- |
| `getName()` | `com.example.User` | `java.util.Map$Entry` | `[Ljava.lang.String;` |
| `getSimpleName()` | `User` | `Entry` | `String[]` |
| `getCanonicalName()` | `com.example.User` | `java.util.Map.Entry` | `java.lang.String[]` |

`getName()` 返回的是 JVM 的**二进制名称**（内部类用 `$` 分隔），传回 `Class.forName()` 时要用它；给人看的日志输出推荐 `getSimpleName()`。

### 四个类型判断/转换方法

这组方法在写泛型工具类、框架代码时非常常用：

```java
// isInstance(obj)：等价于 obj instanceof cls（动态版 instanceof）
Class<?> cls = ArrayList.class;
System.out.println(cls.isInstance(new ArrayList<>())); // true

// isAssignableFrom(cls)：判断「cls 能否赋值给本类型」，即 cls 是本类型或其子类
System.out.println(Object.class.isAssignableFrom(String.class)); // true
System.out.println(List.class.isAssignableFrom(ArrayList.class)); // true —— ArrayList 是 List 的一种

// cast(obj)：把 obj 动态转换为本类型（泛型工具里的安全强转）
Object o = "hello";
String s = String.class.cast(o);

// asSubclass(cls)：把本 Class 对象向下转型为 cls 的 Class 对象
Class<?> raw = Class.forName("java.util.ArrayList");
Class<? extends List> listCls = raw.asSubclass(List.class);
```

> 💡 **提示：** `X.class.isAssignableFrom(Y.class)` 与 `Y.class.isInstance(obj)` 是框架里高频出现的搭配——前者判断「两个类之间的关系」，后者判断「对象是否属于某类型」。读 Spring 源码时大量出现，务必分清方向：`A.isAssignableFrom(B)` 读作「**B 是不是 A**」。

## 四、类加载与初始化的区别（重要）

「拿到 `Class` 对象」和「类被初始化」是两回事，理解它是理解三种获取方式差异的关键。类的生命周期：**加载 → 链接（验证/准备/解析）→ 初始化 → 使用 → 卸载**。

| 操作 | 会发生什么 |
| ---- | ---- |
| `Foo.class`（类字面量） | 不触发初始化。类若未加载会被加载，但**不执行静态代码块** |
| `obj.getClass()` | 对象已存在，类必然早已初始化 |
| `Class.forName("X")` | 加载**并立即初始化**，执行 `static {}` |
| `Class.forName("X", false, loader)` | 只加载链接，**不初始化** |
| `new Foo()` / 反射 `newInstance()` | 触发初始化（若尚未初始化） |

一个能直接看出差别的例子：

```java
// 假设类 com.example.InitDemo 有如下静态代码块
public class InitDemo {
    static {
        System.out.println("静态代码块执行了！");
    }

    public static void main(String[] args) throws ClassNotFoundException {
        Class<?> c = InitDemo.class;                        // 什么都不打印 —— 未初始化
        System.out.println("---- 分隔线 ----");
        Class<?> c2 = Class.forName("com.example.InitDemo"); // 打印「静态代码块执行了！」—— 触发初始化
    }
}
```

> ⚠️ **注意：** 类的初始化是**懒执行**的——首次「主动使用」时才触发（创建实例、访问非编译期常量的静态成员、调用静态方法、反射初始化等）。这也解释了为什么仅写 `Foo.class` 不会执行静态代码块。

## 五、注意事项

1. **`Class.forName` 需要写全限定类名**，写简单类名会抛 `ClassNotFoundException`。内部类要用 `$`（如 `java.util.Map$Entry`），不能用 `.`。
2. **`getName()` 的返回值可以直接回传给 `Class.forName()`**，因为二者使用同一套二进制名称规则；`getSimpleName()` / `getCanonicalName()` 则不一定能回传。
3. **不要用 `==` 比较不同类加载器加载的同名类**——即使全限定类名相同，类加载器不同，`Class` 对象也不同，`==` 为 `false`。这是类加载器面试题的经典陷阱。
4. **`Class<T>` 是泛型类**。编译期已知类型时写成 `Class<User>`，能让后续 `getDeclaredConstructor().newInstance()` 返回带类型的 `User`，省去强转；未知类型时用 `Class<?>`。

## 六、使用场景

| 场景 | 说明 |
| ---- | ---- |
| 框架根据配置动态加载类 | Spring 读取 XML/注解中的类名字符串，`Class.forName` 加载后实例化 Bean |
| JDBC 驱动加载 | `Class.forName("com.mysql.cj.jdbc.Driver")` 触发驱动类静态块注册 |
| 判断对象真实类型 | 多态场景下 `obj.getClass()` 拿运行时类型，配合 `equals` 做类型安全判断 |
| 泛型工具方法 | `<T> T parse(String json, Class<T> clazz)` 这种「调用方传入 Class」的通用 API 设计 |
| 单元测试与调试 | 运行时枚举某类的信息，辅助打印对象的完整结构 |

## 七、总结

- `Class` 对象是 JVM 中某个类的「元信息载体」，反射的一切操作从它开始；同一个类（同一类加载器下）的 `Class` 对象**全局唯一**。
- 获取方式有三种：`类字面量.class`（不初始化）、`对象.getClass()`（拿运行时类型）、`Class.forName("全限定名")`（**会触发初始化**，框架动态加载的核心）。
- `Class` 对象能查类名、父类接口、构造器/方法/字段、注解，还能做动态类型判断与转换（`isInstance` / `isAssignableFrom` / `cast`）。
- 区分「类加载」与「类初始化」：`Foo.class` 不执行静态代码块，`Class.forName(String)` 会。
