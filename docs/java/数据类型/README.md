# Java 基本数据类型

> 📖 [Java Language Specification — Primitive Types and Values](https://docs.oracle.com/javase/specs/jls/se17/html/jls-4.html#jls-4.2)

## 一、概述

Java 是**强类型语言**，每一个变量都必须声明其数据类型。Java 提供了 **8 种基本数据类型**（Primitive Types），它们是构建所有数据的基础，直接存储在栈内存中，访问速度快。

这 8 种基本类型按存储特征分为四大类：

| 分类 | 类型 | 关键字 | 内存占用 | 默认值 |
| --- | --- | --- | --- | --- |
| **整数类型** | 字节型 | `byte` | 1 字节（8 bit） | `0` |
| | 短整型 | `short` | 2 字节（16 bit） | `0` |
| | 整型 | `int` | 4 字节（32 bit） | `0` |
| | 长整型 | `long` | 8 字节（64 bit） | `0L` |
| **浮点类型** | 单精度浮点 | `float` | 4 字节（32 bit） | `0.0f` |
| | 双精度浮点 | `double` | 8 字节（64 bit） | `0.0d` |
| **字符类型** | 字符型 | `char` | 2 字节（16 bit） | `' ' ` |
| **布尔类型** | 布尔型 | `boolean` | 1 bit（JVM 依赖） | `false` |

## 二、文档导航

本目录下按类型特征分为以下文档，方便按需查阅：

| 文档 | 内容 |
| --- | --- |
| [整数类型.md](./整数类型.md) | `byte`、`short`、`int`、`long` 四种整数类型详解 |
| [浮点类型.md](./浮点类型.md) | `float`、`double` 两种浮点类型详解 |
| [字符与布尔类型.md](./字符与布尔类型.md) | `char`、`boolean` 详解 |
| [类型转换.md](./类型转换.md) | 自动类型转换、强制类型转换规则 |
| [包装类型.md](./包装类型.md) | 8 种基本类型对应的包装类及自动装箱/拆箱 |

## 三、核心特点速览

### 1. 存储位置

基本类型的**变量**存储在**栈内存**中，直接持有数据值，访问效率远高于引用类型。

```java
int age = 25;       // 变量 age 在栈中直接存着 25
char c = 'A';       // 变量 c 在栈中直接存着字符 'A' 的 Unicode 值 65
```

### 2. 默认值

作为**成员变量**时，基本类型有默认值；作为**局部变量**时必须手动赋值才能使用。

```java
public class Demo {
    int x;          // 成员变量，默认值为 0

    public void test() {
        int y;      // 局部变量，没有默认值
        // System.out.println(y);  // ❌ 编译错误：变量 y 可能尚未初始化
        y = 10;     // ✅ 必须先赋值
        System.out.println(y);
    }
}
```

### 3. 取值范围

整数类型采用**补码**表示，范围关于 0 不对称（负数比正数多一个）：

| 类型 | 最小值 | 最大值 | 常量字段 |
| --- | --- | --- | --- |
| `byte` | -128 | 127 | `Byte.MIN_VALUE` / `Byte.MAX_VALUE` |
| `short` | -32,768 | 32,767 | `Short.MIN_VALUE` / `Short.MAX_VALUE` |
| `int` | -2,147,483,648 | 2,147,483,647 | `Integer.MIN_VALUE` / `Integer.MAX_VALUE` |
| `long` | -9,223,372,036,854,775,808 | 9,223,372,036,854,775,807 | `Long.MIN_VALUE` / `Long.MAX_VALUE` |

> ⚠️ **注意：** 超出范围会发生**溢出**（Overflow），结果会"绕回"到另一端，不会报错：

```java
int max = Integer.MAX_VALUE;  // 2147483647
System.out.println(max + 1);  // -2147483648  ⚠️ 溢出变成最小值
```

## 四、字面量规则

### 整数字面量

```java
int decimal = 100;        // 十进制
int binary = 0b1010;      // 二进制（前缀 0b 或 0B）
int octal = 012;          // 八进制（前缀 0）
int hex = 0xFF;           // 十六进制（前缀 0x 或 0X）

// 长整型字面量必须加 L 后缀（建议大写，避免与 1 混淆）
long big = 100L;          // ✅
// long wrong = 100;      // ❌ 编译错误：不兼容的类型
```

> 💡 **提示：** Java 7 起支持用**下划线**分隔数字字面量，提高可读性：

```java
int million = 1_000_000;
long creditCard = 1234_5678_9012_3456L;
double pi = 3.14_15_92;
```

### 浮点数字面量

```java
double d = 3.14;          // 默认是 double 类型
float f = 3.14f;          // float 必须加 f 或 F 后缀
double sci = 1.5e3;       // 科学计数法，表示 1.5 × 10³ = 1500.0
```

### 字符与布尔字面量

```java
char c1 = '中';           // 单引号包裹单个字符
char c2 = 65;             // 直接写 Unicode 码点值（0 ~ 65535）
char c3 = 'A';       // Unicode 转义
bool flag = true;         // 只能取 true 或 false
```

## 五、基本类型 vs 引用类型

| 对比项 | 基本类型 | 引用类型 |
| --- | --- | --- |
| 存储内容 | 直接存值 | 存对象的引用（地址） |
| 存储位置 | 栈内存 | 引用在栈，对象在堆 |
| 默认值 | 有默认值（如 `0`、`false`） | `null` |
| 比较方式 | `==` 比较值 | `==` 比较引用地址，`equals()` 比较内容 |
| 能否为 `null` | ❌ 不能 | ✅ 能 |
| 泛型支持 | ❌ 不能用作泛型参数 | ✅ 可以 |

## 六、常见陷阱

### 1. 整数除法截断

```java
int a = 5;
int b = 2;
System.out.println(a / b);  // 2  ⚠️ 不是 2.5，整数除法直接舍弃小数

// 正确做法：先转成浮点类型
System.out.println((double) a / b);  // 2.5
```

### 2. 浮点数精度问题

```java
System.out.println(0.1 + 0.2);  // 0.30000000000000004  ⚠️ 不是精确的 0.3
```

> 涉及金额计算时，应使用 `BigDecimal`，不要用 `float` 或 `double`。详见 [浮点类型.md](./浮点类型.md)。

### 3. 包装类比较陷阱

```java
Integer a = 127;
Integer b = 127;
System.out.println(a == b);     // true  （缓存池内）

Integer c = 128;
Integer d = 128;
System.out.println(c == d);     // false （超出缓存池，比较的是地址）
```

> 包装类比较应始终使用 `equals()`。详见 [包装类型.md](./包装类型.md)。

## 七、选择类型的最佳实践

- **整数首选 `int`**：除非内存紧张或有明确范围需求，否则默认用 `int`
- **大数用 `long`**：时间戳、ID 等可能超过 21 亿的数值
- **浮点首选 `double`**：精度更高，是默认的浮点类型
- **金额用 `BigDecimal`**：永远不要用 `float`/`double` 表示金额
- **开关/标志用 `boolean`**：最轻量的类型
- **二进制数据用 `byte[]`**：文件读写、网络传输场景

## 八、总结

Java 的 8 种基本类型是编程的基石。核心记忆点：

- **4 种整数**：`byte` → `short` → `int` → `long`，范围递增
- **2 种浮点**：`float`（单精度）→ `double`（双精度）
- **1 种字符**：`char`，2 字节，存 Unicode 字符
- **1 种布尔**：`boolean`，只有 `true` 和 `false`

理解每种类型的**取值范围**、**默认值**、**字面量写法**和**常见陷阱**，是写出健壮 Java 代码的第一步。
