# Modifier——读取修饰符

> 📖 官方文档：[Modifier (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/reflect/Modifier.html)

## 一、概述

反射拿到 `Field`、`Method`、`Constructor`、`Class` 之后，经常需要知道它们的**修饰符**：是 `public` 还是 `private`？是不是 `static`？是不是 `final`？

但这些类的 `getModifiers()` 返回的不是字符串，而是一个 **`int` 整数**——每一个二进制位代表一种修饰符的有无。`java.lang.reflect.Modifier` 就是官方提供的「**位标志解码器**」：把整数翻译成 `public static final` 这样的可读形式，或做单个修饰符的布尔判断。

> 💡 **类比：** 一个 `int` 有 32 个二进制位，就像 32 个并排的小开关。JVM 把一个成员的所有修饰符塞进这排开关里——第 1 位拨上去代表 `public`、第 4 位代表 `static`……`Modifier` 类提供「看某个开关」（`isStatic`）和「读整排开关」（`toString`）两种能力。

## 二、基本用法

### 1. 获取与解析

```java
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;

public class Demo {
    public static final int COUNT = 10;
    private String name;
    public static void helper() {}

    public static void main(String[] args) throws Exception {
        // 1. 拿到修饰符整数
        Field f = Demo.class.getDeclaredField("COUNT");
        int mods = f.getModifiers();
        System.out.println(mods);                          // 如 25（值随实现，别依赖具体数字）

        // 2. 整体翻译成字符串
        System.out.println(Modifier.toString(mods));       // public static final

        // 3. 单个判断（布尔）
        System.out.println(Modifier.isPublic(mods));       // true
        System.out.println(Modifier.isStatic(mods));       // true
        System.out.println(Modifier.isFinal(mods));        // true
        System.out.println(Modifier.isPrivate(mods));      // false

        // 4. 实例字段对照
        Field name = Demo.class.getDeclaredField("name");
        System.out.println(Modifier.toString(name.getModifiers())); // private（无修饰符时为空串）

        // 5. 方法和类同理
        Method m = Demo.class.getMethod("helper");
        System.out.println(Modifier.toString(m.getModifiers()));    // public static

        int clsMods = Demo.class.getModifiers();
        System.out.println(Modifier.isPublic(clsMods));             // true
    }
}
```

### 2. 位标志原理

`Modifier` 定义的常量都是「只有一位是 1」的掩码，判断就是一次按位与：

```java
// Modifier 源码的原理（简化）
public static final int PUBLIC     = 0x00000001; // 0001
public static final int PRIVATE    = 0x00000002; // 0010
public static final int PROTECTED  = 0x00000004; // 0100
public static final int STATIC     = 0x00000008; // 1000
public static final int FINAL      = 0x00000010;

// isStatic 的实现就是：mods & STATIC 是否非 0
public static boolean isStatic(int mod) {
    return (mod & STATIC) != 0;
}
```

`public static final` 三个标志叠加就是 `1 + 8 + 16 = 25`——这就是上面输出 25 的由来。判断组合也顺理成章：

```java
int mods = f.getModifiers();
boolean isPublicStaticFinal =
        Modifier.isPublic(mods) && Modifier.isStatic(mods) && Modifier.isFinal(mods);
```

### 3. 完整的修饰符常量

| 常量 | 判断方法 | 说明 |
| ---- | ---- | ---- |
| `PUBLIC` / `PRIVATE` / `PROTECTED` | `isPublic` / `isPrivate` / `isProtected` | 访问权限三兄弟 |
| `STATIC` | `isStatic` | 静态 |
| `FINAL` | `isFinal` | 不可变/不可重写 |
| `ABSTRACT` | `isAbstract` | 抽象（类/方法） |
| `SYNCHRONIZED` | `isSynchronized` | 同步方法 |
| `VOLATILE` / `TRANSIENT` | `isVolatile` / `isTransient` | 字段专用：可见性 / 不参与序列化 |
| `NATIVE` | `isNative` | 本地方法 |
| `INTERFACE` | `isInterface` | 接口标志 |
| `STRICT` | `isStrict` | strictfp（历史遗留） |
| `ANNOTATION` / `ENUM` | `isAnnotation` / `isEnum`（Class 上） | 注解 / 枚举标志 |

## 三、注意事项

1. **别依赖 `getModifiers()` 的具体数值**：不同 JVM 实现可能附加额外的内部标志位，数字会变；判断一律用 `Modifier.isXxx()`，展示一律用 `Modifier.toString()`。
2. **接口的隐式修饰符会被补全**：接口方法 `void foo();` 反射出的修饰符是 `public abstract`（隐式补全），接口字段是 `public static final`。判断「程序员写没写」不能靠 `getModifiers()`。
3. **`toString()` 顺序固定**：输出按 `public protected private abstract static final transient volatile synchronized native interface` 的固定顺序拼接，空格分隔，可直接用于展示。
4. **Java 9+ 的新选择 `accessFlags()`**：`Class` 上新增了 `accessFlags()` 方法（返回 `Set<AccessFlag>`），是更现代的修饰符表示；日常开发用 `Modifier` 仍然最普遍。

## 四、使用场景

| 场景 | 说明 |
| ---- | ---- |
| 类结构查看器 | 打印类/字段/方法的完整签名（`Modifier.toString` + 类型 + 名称） |
| 代码生成器 | 读取现有类修饰符，生成同风格的代码 |
| 框架过滤成员 | 序列化时跳过 `static`/`transient` 字段；扫描时只处理 `public` 方法 |
| 校验规范 | 检查工具类「是否全部由 public static 方法组成」、常量类是否不可实例化 |
| 调试与日志 | 输出成员修饰符辅助定位问题 |

一个序列化框架过滤字段的典型例子：

```java
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

public class FieldScanner {
    /** 收集一个类可被序列化的实例字段：非 static、非 transient */
    public static List<Field> serializableFields(Class<?> cls) {
        List<Field> result = new ArrayList<>();
        for (Field f : cls.getDeclaredFields()) {
            int mods = f.getModifiers();
            if (Modifier.isStatic(mods) || Modifier.isTransient(mods)) {
                continue; // ❌ 跳过静态与瞬态字段
            }
            result.add(f);
        }
        return result;
    }
}
```

## 五、总结

- `getModifiers()` 返回修饰符的**位标志整数**，`Modifier` 类负责解码：`Modifier.toString(mods)` 出可读字符串，`Modifier.isXxx(mods)` 做单项判断。
- 原理是「每 个修饰符占一个二进制位」，组合判断就是按位与；不要依赖具体数值，只用官方 API。
- 接口成员有隐式修饰符补全，`getModifiers()` 反映的是编译后的最终修饰符，不是源码里写了什么。
- 高频应用：序列化过滤 `static`/`transient` 字段、类结构打印、代码生成、编码规范校验。
