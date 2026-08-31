# Constructor——反射创建对象

> 📖 官方文档：[Constructor (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/reflect/Constructor.html) ｜ [Oracle 反射教程 - Creating New Class Objects](https://docs.oracle.com/javase/tutorial/reflect/member/ctorInstance.html)

## 一、概述

反射创建对象是通过 `java.lang.reflect.Constructor` 类完成的。`Constructor` 对象代表类里的**一个具体构造器**，调用它的 `newInstance(实参...)` 方法即可在运行时动态创建对象——效果等价于 `new 构造器(实参...)`，但构造器是**运行时才确定**的。

为什么不用 `new`？因为框架在写代码时根本不知道业务类是什么：Spring 拿到的只是类名字符串或 `Class` 对象，MyBatis 要给结果集建映射对象，JUnit 要实例化测试类——它们都必须**运行时动态创建对象**，这就是 `Constructor` 存在的意义。

> 💡 **类比：** `new` 是「照着图纸盖房子」，图纸编译期就定死了；反射创建是「拿着一张建筑档案（`Class` 对象），现场翻出某一张施工方案（`Constructor`），按方案盖房子」。方案是运行时才翻出来的，想换一套方案也不用重修图纸。

## 二、获取 Constructor 对象

四种获取方式（详见 [获取类结构信息.md](./获取类结构信息.md)）：

```java
Class<User> cls = User.class;

// 1. 无参 public 构造器 —— 最常用
Constructor<User> c1 = cls.getConstructor();

// 2. 指定参数的 public 构造器
Constructor<User> c2 = cls.getConstructor(String.class, int.class);

// 3. 声明的全部构造器（含 private）
Constructor<?>[] all = cls.getDeclaredConstructors();

// 4. 指定参数的构造器（含 private）—— 创建对象的推荐写法之一
Constructor<User> c3 = cls.getDeclaredConstructor(String.class, int.class);

// ✅ Java 9+ 官方推荐的「拿无参构造器」写法
Constructor<User> c4 = cls.getDeclaredConstructor();
```

> ⚠️ **注意：** `getDeclaredConstructor()` 不传参数 = 找**无参构造器**（含 private 的）。如果类没有无参构造器，抛 `NoSuchMethodException`。

## 三、用 Constructor 创建对象

### 1. 基本用法

`Constructor<T>.newInstance(Object... initargs)` 的签名（官方文档）：

- 参数 `initargs`：构造器实参，按声明顺序传入；基本类型自动装箱后传入
- 返回值：`T`——泛型直接给出目标类型，**无需强转**
- 声明抛出四个异常（见下文第五节）

```java
import java.lang.reflect.Constructor;

public class Demo {
    public static void main(String[] args) throws Exception {
        Class<User> cls = User.class;

        // 无参构造器
        User u1 = cls.getDeclaredConstructor().newInstance();

        // 有参构造器：按参数类型找到构造器，再按声明顺序传实参
        Constructor<User> c = cls.getDeclaredConstructor(String.class, int.class);
        User u2 = c.newInstance("张三", 20);
        System.out.println(u2.getName() + " " + u2.getAge()); // 张三 20

        // private 构造器（单例防御场景）：先 setAccessible 再创建
        Constructor<User> pri = cls.getDeclaredConstructor(int.class);
        pri.setAccessible(true);
        User u3 = pri.newInstance(99);
    }
}
```

### 2. 参数匹配规则（官方语义）

`newInstance` 传参遵循两条规则（摘自官方 javadoc）：

- **自动拆箱匹配基本类型**：实参会自动「拆包（unwrapping）」去匹配基本类型形参——形参是 `int`，传 `Integer.valueOf(20)` 即可
- **允许加宽、禁止收窄**：`Constructor` 允许加宽转换（widening），如形参 `double` 传 `Integer`？不行——注意这里说的是方法调用转换：**允许 `int` 实参传给 `double` 形参这类加宽，抛 `IllegalArgumentException` 的情况是收窄转换**（如形参 `int` 传 `Double`）

> ⚠️ **注意：** 装箱类型之间**没有**隐式转换。形参是 `Integer` 时传 `Object` 类型的值没问题，但形参是 `int` 时传 `Double` 会抛 `IllegalArgumentException`——`Double` 拆箱成 `double` 后无法加宽/转换成 `int`。传参前确认类型，或手动转好再传。

### 3. `Class.newInstance()` 已废弃

```java
// ❌ 已废弃（Java 9 起 @Deprecated）
User u = cls.newInstance();

// ✅ 替代写法
User u = cls.getDeclaredConstructor().newInstance();
```

废弃原因（官方 javadoc 原文要义）：`clazz.newInstance()` 会把**无参构造器抛出的任何异常（包括受检异常）原样向外传播**，绕过了编译期异常检查；而 `Constructor.newInstance` 会把构造器内部异常包装成 `InvocationTargetException` 抛出，异常检查不会失效。

两者的完整对比：

| 对比项 | `clazz.newInstance()` | `clazz.getDeclaredConstructor().newInstance()` |
| ---- | ---- | ---- |
| 状态 | Java 9 起 `@Deprecated` | ✅ 官方推荐 |
| 能调的构造器 | 只能 public 无参 | 任意构造器（配合 `setAccessible` 连 private 都行） |
| 构造器内部异常 | 原样抛出，绕过编译期检查 | 包装为 `InvocationTargetException` |
| 额外声明的异常 | `InstantiationException`、`IllegalAccessException` | 再加 `NoSuchMethodException`、`InvocationTargetException` |

## 四、创建对象的三条路径对比

| 路径 | 写法 | 适用场景 |
| ---- | ---- | ---- |
| 关键字 | `new User("张三", 20)` | 编译期确定类型，日常业务首选 |
| `Constructor` | `cls.getDeclaredConstructor(String.class, int.class).newInstance("张三", 20)` | 运行时确定类型/构造器，框架场景 |
| `Class.forName` 一条龙 | `Class.forName("com.example.User").getDeclaredConstructor().newInstance()` | 连类名都是字符串（配置文件驱动） |

第三条路径的完整示例——读取配置文件动态创建对象：

```java
// config.properties 内容：user.class=com.example.User
import java.io.InputStream;
import java.util.Properties;

public class FactoryDemo {
    public static void main(String[] args) throws Exception {
        Properties props = new Properties();
        try (InputStream in = FactoryDemo.class.getClassLoader()
                .getResourceAsStream("config.properties")) {
            props.load(in);
        }

        // 类名来自配置文件 —— 换实现只需改配置，无需改代码重新编译
        String className = props.getProperty("user.class");
        Object user = Class.forName(className).getDeclaredConstructor().newInstance();
        System.out.println(user.getClass().getName()); // com.example.User
    }
}
```

## 五、newInstance 的异常

`Constructor.newInstance` 声明抛出五个异常（另有 `getDeclaredConstructor` 的 `NoSuchMethodException`），各自含义必须分清：

| 异常 | 触发场景 |
| ---- | ---- |
| `NoSuchMethodException`（来自 `getDeclaredConstructor`） | 类里没有匹配参数的构造器 |
| `IllegalAccessException` | 构造器不可访问（如 private 未 `setAccessible(true)`） |
| `InstantiationException` | 声明类是**抽象类**，无法实例化（官方 javadoc：`if the class that declares the underlying constructor represents an abstract class`） |
| `InvocationTargetException` | **构造器内部抛了异常**，被包装后抛出，真实异常用 `getCause()` 获取 |
| `IllegalArgumentException` | 实参个数不对、拆箱失败、类型收窄、**目标构造器属于枚举类**等参数不匹配问题 |

```java
// InvocationTargetException 的正确解包姿势
try {
    Constructor<User> c = User.class.getDeclaredConstructor(String.class);
    User u = c.newInstance(null); // 假设构造器内部对 null 做了校验并抛出 IllegalArgumentException
} catch (InvocationTargetException e) {
    Throwable real = e.getCause(); // ✅ 拿到构造器里真正抛出的异常
    System.out.println("真实异常: " + real);
}
```

> ⚠️ **注意：** 直接 `e.getMessage()` 看不到真实原因，日志里若只打印 `InvocationTargetException` 而不追 `getCause()`，会丢失根因。这是反射排障的第一大坑。

## 六、注意事项

1. **内部类（非静态上下文）的第一个参数是外部实例**：反射创建内部类对象时，`newInstance` 的第一个实参必须是外部类对象（官方 javadoc 明确说明）。因此工具类反射实例化时优先选择静态嵌套类或顶层类。
2. **单例模式会主动防御反射**：`getDeclaredConstructor().setAccessible(true).newInstance()` 可以绕过 private 构造器破坏单例。防御手段是在构造器里判断实例已存在就抛异常，或改用枚举实现单例（JVM 保证枚举不被反射实例化——反射创建枚举对象会抛 `IllegalArgumentException`）。
3. **`Constructor` 对象可缓存复用**：每次 `getDeclaredConstructor()` 都有查找开销，高频场景应把 `Constructor` 存进静态变量或 `Map<Class<?>, Constructor<?>>` 缓存（见 [反射性能优化.md](./反射性能优化.md)）。
4. **`newInstance` 会触发类初始化**：如果声明类还没初始化，调用 `newInstance` 时会先执行静态代码块。

## 七、使用场景

| 场景 | 说明 |
| ---- | ---- |
| Spring IoC | 容器根据 Bean 定义反射调用构造器创建对象，构造器注入即 `Constructor.newInstance(依赖...)` |
| JDBC 驱动实例化 | `DriverManager` 内部根据注册的驱动类名反射实例化驱动 |
| 单元测试框架 | JUnit 为每个测试方法所在类反射创建实例 |
| 对象池 / 工厂 | 通用对象工厂 `create(String className, Object... args)`，配置化构造对象 |
| 反序列化 | Jackson、Fastjson 反序列化时先用无参构造器（或 `@JsonCreator` 指定的构造器）创建空对象再填充字段 |

## 八、总结

- `Constructor` 代表类的一个具体构造器，通过 `Class.getConstructor(s)` / `getDeclaredConstructor(s)` 获取，调用 `newInstance(实参...)` 动态创建对象。
- 官方推荐 `cls.getDeclaredConstructor().newInstance()` 取代已废弃的 `cls.newInstance()`：前者支持任意构造器，且把构造器内部异常包装成 `InvocationTargetException`，不破坏编译期异常检查。
- 参数匹配：基本类型自动拆箱，允许加宽禁止收窄；实参个数与类型必须对得上，否则 `IllegalArgumentException`。
- 五大异常要分清：`NoSuchMethodException`（找不到）、`IllegalAccessException`（不可访问）、`InstantiationException`（抽象类无法实例化）、`InvocationTargetException`（构造器内部异常，用 `getCause()` 还原）、`IllegalArgumentException`（参数不匹配，含对枚举类构造器调用）。
- 反射创建对象绕不过 private 构造器（配合 `setAccessible`），单例设计需主动防御，或改用枚举。
