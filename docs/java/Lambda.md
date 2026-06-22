# Lambda 表达式（Lambda Expressions）

> 官方文档：[Lambda Expressions (Oracle Java Tutorials)](https://docs.oracle.com/javase/tutorial/java/javaOO/lambdaexpressions.html) | [菜鸟教程：Java 8 Lambda 表达式](https://www.runoob.com/java/java8-lambda-expressions.html)

## 一、概述

**Lambda 表达式**是 Java 8 引入的重要特性，它支持**函数式编程**，用一种非常简洁的语法来表示"一段可传递的代码"——本质就是一个**匿名函数**：它没有名字、有参数列表、有方法体、可以有返回值。

> 💡 **提示：** 类比：Lambda 就像"一次性小函数"。以前你要传递一个行为（比如"怎么比较两个对象"），必须先写一个类或匿名内部类，包一层外壳；而 Lambda 让你直接把"行为"像数据一样传过去。就像把一句口头指令 `把苹果按价格从低到高排` 直接说出口，而不必先写一份《苹果排序操作手册》再交给对方。

### 1.1 为什么需要 Lambda

在 Lambda 出现之前，Java 中要把"行为"作为参数传递，通常要用**匿名内部类**，代码非常啰嗦：

```java
// ❌ 旧写法：匿名内部类，为了一个比较逻辑要写 6 行
List<Integer> list = new ArrayList<>(List.of(3, 1, 2));
Collections.sort(list, new Comparator<Integer>() {
    @Override
    public int compare(Integer a, Integer b) {
        return a - b;                              // 真正有用的只有这一行
    }
});

// ✅ 新写法：Lambda 表达式，一行搞定
list.sort((a, b) -> a - b);
```

Lambda 的核心价值：

| 价值 | 说明 |
| --- | --- |
| 简洁 | 用一行代码替代冗长的匿名内部类，只关注"做什么" |
| 行为参数化 | 把"行为（代码）"像数据一样当作参数传递 |
| 配合 Stream | 是 Stream API、Optional、新日期 API 等的基础设施 |
| 声明式编程 | 描述"想要什么"而不是"怎么做"，更接近自然语言 |

### 1.2 一个直观的例子

```java
public class LambdaDemo {
    public static void main(String[] args) {
        // 用 Lambda 创建一个新线程
        Runnable task = () -> System.out.println("Lambda: 我在子线程中运行");
        new Thread(task).start();

        // 用 Lambda 遍历集合
        List<String> names = List.of("张三", "李四", "王五");
        names.forEach(name -> System.out.println("你好，" + name));
    }
}
```

## 二、Lambda 语法

### 2.1 基本语法

Lambda 表达式由三部分组成，中间用箭头 `->` 连接：

```
(参数列表)  ->  {方法体}
   ↑           ↑
  左侧          右侧
 输入          输出
```

- **左侧**：参数列表，对应接口中抽象方法的参数。
- **`->`**：箭头操作符，把参数"传递"给方法体（读作"goes to"）。
- **右侧**：方法体，就是一段代码，可以是一条语句，也可以是多条语句。

### 2.2 各种简写形式

Java 提供了多种省略规则，让你写得尽可能短：

| 场景 | 完整写法 | 简写形式 | 说明 |
| --- | --- | --- | --- |
| 无参数 | `() -> { System.out.println("hi"); }` | `() -> System.out.println("hi")` | 单条语句可省 `{}` |
| 一个参数 | `(x) -> x * 2` | `x -> x * 2` | 一个参数可省小括号 |
| 类型推断 | `(Integer x, Integer y) -> x + y` | `(x, y) -> x + y` | 编译器能推断类型时省类型 |
| 单表达式返回 | `(a, b) -> { return a + b; }` | `(a, b) -> a + b` | 表达式自动作为返回值，省 `return` 和 `{}` |
| 多条语句 | —— | `(a, b) -> { int c = a + b; return c; }` | 必须用 `{}` 且显式 `return` |

代码示例对照：

```java
// 1. 无参数（对应 Runnable 的 run()）
Runnable r1 = () -> System.out.println("无参 Lambda");

// 2. 一个参数（对应 Consumer 的 accept(T)）
Consumer<String> c1 = x -> System.out.println(x);          // 省略小括号

// 3. 两个参数、类型推断（对应 Comparator 的 compare(T, T)）
Comparator<Integer> cmp = (a, b) -> a - b;                 // 省略类型 Integer

// 4. 单表达式自动返回（对应 Function 的 apply(T)）
Function<Integer, Integer> f1 = x -> x * x;                // 自动返回 x*x

// 5. 多条语句，必须 { } 且显式 return
Comparator<Integer> cmp2 = (a, b) -> {
    int diff = a - b;
    System.out.println("比较：" + a + " 和 " + b);
    return diff;                                           // 多条语句必须显式 return
};
```

> ⚠️ **注意：** 单条语句省略 `{}` 时，**不能**再写 `return`；写了 `{}` 就**必须**写 `return`。两者不能混用：
>
> ```java
> // ❌ 错误：省略了 {} 又写 return
> (a, b) -> return a + b;
> // ❌ 错误：写了 {} 却没有 return
> (a, b) -> { a + b; };
> // ✅ 正确：二者一致
> (a, b) -> a + b;
> (a, b) -> { return a + b; };
> ```

### 2.3 Lambda 的结构示意图

```
┌──────────────────────────────────────────────────────────┐
│            Lambda 表达式结构：(a, b) -> a + b              │
├──────────────┬───────────────────────────────────────────┤
│   (a, b)     │  参数列表（可省类型、可省小括号）            │
│      ↓       │                                           │
│     ->       │  箭头操作符：把参数"喂"给方法体             │
│      ↓       │                                           │
│   a + b      │  方法体（表达式自动作为返回值）              │
└──────────────┴───────────────────────────────────────────┘
```

## 三、函数式接口（Lambda 的基础）

### 3.1 什么是函数式接口

Lambda 表达式不能凭空存在，它**必须依附于一个函数式接口**。

**函数式接口（Functional Interface）**：有且只有**一个抽象方法**的接口。除了这一个抽象方法，它可以包含任意数量的默认方法（default）、静态方法（static）和私有方法（Java 9+）。

> 💡 **提示：** 为什么只能有一个抽象方法？因为 Lambda 只能提供"一个方法"的实现。接口里如果有两个抽象方法，编译器就无法判断你的 Lambda 到底实现了哪一个。这"唯一的一个抽象方法"叫做**函数式接口的函数描述符（Function Descriptor）**，决定了 Lambda 的参数和返回类型。

### 3.2 `@FunctionalInterface` 注解

```java
@FunctionalInterface                              // 标注这是一个函数式接口
public interface Calculator {
    int calculate(int a, int b);                  // 唯一的抽象方法

    // 默认方法：可以有多个，不影响"函数式接口"的判定
    default int square(int x) {
        return x * x;
    }

    // 静态方法：也可以有
    static Calculator addition() {
        return (a, b) -> a + b;
    }
}
```

| 特性 | 说明 |
| --- | --- |
| `@FunctionalInterface` 的作用 | 让编译器帮你**校验**：如果接口里有超过一个抽象方法，编译报错 |
| 是否强制 | 不强制。只要满足"一个抽象方法"就是函数式接口，不加注解也能用 Lambda |
| 加注解的好处 | 防止以后误加方法破坏"函数式"约定，相当于一份显式声明 |
| Object 类的方法 | 如 `equals`、`toString` 等不算抽象方法，不影响计数 |

```java
@FunctionalInterface
public interface MyComparator<T> {
    int compare(T o1, T o2);
    boolean equals(Object obj);        // 来自 Object，不计入抽象方法数量
    // 仍然是合法的函数式接口
}
```

### 3.3 Lambda 与函数式接口的关系

Lambda 表达式的**类型**就是它所实现的那个函数式接口；Lambda 的参数和返回值必须与接口中唯一的抽象方法签名匹配。

```java
@FunctionalInterface
interface MathOperation {
    int operate(int a, int b);
}

public class Demo {
    public static void main(String[] args) {
        // Lambda 赋值给函数式接口类型的变量
        MathOperation add = (a, b) -> a + b;
        MathOperation sub = (a, b) -> a - b;

        // 调用接口方法，实际执行的是 Lambda 方法体
        System.out.println(add.operate(10, 5));    // 输出 15
        System.out.println(sub.operate(10, 5));    // 输出 5
    }
}
```

## 四、内置函数式接口（java.util.function）

为了避免大家重复自定义接口，Java 8 在 `java.util.function` 包下提供了**一批常用的函数式接口**，覆盖绝大多数场景。掌握它们就基本不用自己写函数式接口了。

### 4.1 四大核心接口

| 接口 | 抽象方法 | 含义 | 通俗理解 |
| --- | --- | --- | --- |
| `Predicate<T>` | `boolean test(T t)` | 断言：传入 T，返回 boolean | "判断这个 T 合不合格" |
| `Consumer<T>` | `void accept(T t)` | 消费：传入 T，无返回 | "拿走这个 T 做点事" |
| `Function<T, R>` | `R apply(T t)` | 函数：传入 T，返回 R | "把 T 加工成 R" |
| `Supplier<T>` | `T get()` | 供给：无传入，返回 T | "给我一个 T" |

记忆口诀：**Predicate 判断真假，Consumer 只进不出，Function 有进有出，Supplier 不进只出**。

### 4.2 Predicate<T> —— 断言

`Predicate<T>` 接收一个参数，返回 `boolean`，常用于**过滤、条件判断**。

```java
import java.util.function.Predicate;

public class PredicateDemo {
    public static void main(String[] args) {
        // 判断字符串长度是否大于 3
        Predicate<String> isLong = s -> s.length() > 3;
        System.out.println(isLong.test("hello"));   // true
        System.out.println(isLong.test("hi"));      // false

        // 组合判断：and（且）、or（或）、negate（非）
        Predicate<String> notNull = s -> s != null;
        Predicate<String> check = notNull.and(isLong);          // 非空 且 长度>3
        Predicate<String> check2 = notNull.or(isLong);          // 非空 或 长度>3
        Predicate<String> notLong = isLong.negate();            // 长度<=3

        System.out.println(check.test("hello"));    // true
        System.out.println(notLong.test("hi"));     // true
    }
}
```

| 方法 | 说明 |
| --- | --- |
| `test(T t)` | 核心方法，执行判断 |
| `and(Predicate)` | 逻辑与（两者都成立） |
| `or(Predicate)` | 逻辑或（任一成立） |
| `negate()` | 逻辑非（取反） |
| `isEqual(Object)` | 静态方法，判断是否相等 |

### 4.3 Consumer<T> —— 消费

`Consumer<T>` 接收一个参数，无返回值，常用于**遍历、打印、副作用操作**。

```java
import java.util.function.Consumer;

public class ConsumerDemo {
    public static void main(String[] args) {
        // 打印字符串
        Consumer<String> printer = s -> System.out.println("消费：" + s);
        printer.accept("苹果");                      // 输出：消费：苹果

        // andThen：先执行当前，再执行传入的，实现链式消费
        Consumer<String> upper = s -> System.out.println("大写：" + s.toUpperCase());
        Consumer<String> chain = printer.andThen(upper);
        chain.accept("apple");
        // 输出：
        // 消费：apple
        // 大写：APPLE
    }
}
```

| 方法 | 说明 |
| --- | --- |
| `accept(T t)` | 核心方法，执行消费操作 |
| `andThen(Consumer)` | 链式组合，先执行当前，再执行参数中的 |

### 4.4 Function<T, R> —— 函数

`Function<T, R>` 接收一个参数 T，返回结果 R，常用于**类型转换、数据映射**。

```java
import java.util.function.Function;

public class FunctionDemo {
    public static void main(String[] args) {
        // 字符串转整数
        Function<String, Integer> toInt = s -> Integer.parseInt(s);
        System.out.println(toInt.apply("123"));       // 123

        // compose：先执行参数函数，再执行当前（即 f(g(x))）
        Function<Integer, Integer> doubleIt = x -> x * 2;
        Function<Integer, Integer> plusOne = x -> x + 1;
        Function<Integer, Integer> f = doubleIt.compose(plusOne); // 先 +1，再 *2
        System.out.println(f.apply(3));                // (3+1)*2 = 8

        // andThen：先执行当前，再执行参数函数（即 g(f(x))）
        Function<Integer, Integer> g = doubleIt.andThen(plusOne); // 先 *2，再 +1
        System.out.println(g.apply(3));                // 3*2+1 = 7
    }
}
```

| 方法 | 说明 |
| --- | --- |
| `apply(T t)` | 核心方法，执行转换 |
| `compose(Function)` | 先执行参数中的函数，再执行当前 |
| `andThen(Function)` | 先执行当前，再执行参数中的函数 |
| `identity()` | 静态方法，返回恒等函数 `x -> x` |

> 💡 **提示：** `compose` 和 `andThen` 容易混淆。记住：`andThen` 是"然后"，按书写顺序执行（先当前，后参数）；`compose` 是"组合"，先执行参数（被组合进来的先执行）。

### 4.5 Supplier<T> —— 供给

`Supplier<T>` 不接收参数，返回一个结果，常用于**工厂模式、懒加载、提供默认值**。

```java
import java.util.function.Supplier;

public class SupplierDemo {
    public static void main(String[] args) {
        // 每次调用都"生产"一个随机数
        Supplier<Double> randomSupplier = () -> Math.random();
        System.out.println(randomSupplier.get());     // 例如 0.731...

        // 提供默认值
        Supplier<String> defaultName = () -> "匿名用户";
        System.out.println(defaultName.get());        // 匿名用户
    }
}
```

| 方法 | 说明 |
| --- | --- |
| `get()` | 核心方法，返回一个结果 |

### 4.6 UnaryOperator / BinaryOperator

它们是 `Function` 的特化，输入和输出**同类型**。

| 接口 | 父接口 | 抽象方法 | 说明 |
| --- | --- | --- | --- |
| `UnaryOperator<T>` | `Function<T, T>` | `T apply(T t)` | 一元运算：T → T |
| `BinaryOperator<T>` | `BiFunction<T, T, T>` | `T apply(T t1, T t2)` | 二元运算：(T, T) → T |

```java
import java.util.function.UnaryOperator;
import java.util.function.BinaryOperator;
import java.util.Comparator;
import java.util.stream.Stream;

public class OperatorDemo {
    public static void main(String[] args) {
        UnaryOperator<Integer> square = x -> x * x;          // 一元：求平方
        System.out.println(square.apply(5));                 // 25

        BinaryOperator<Integer> add = (a, b) -> a + b;       // 二元：求和
        System.out.println(add.apply(3, 4));                 // 7

        // BinaryOperator 常用于 Stream 的 reduce：求最大值
        int max = Stream.of(3, 7, 2, 9, 5)
                .reduce(BinaryOperator.maxBy(Comparator.naturalOrder()))
                .orElse(0);
        System.out.println(max);                             // 9
    }
}
```

### 4.7 基本类型特化接口

泛型不能使用基本类型（只能用 `Integer`），这会带来**自动装箱/拆箱**的性能开销。为此 `java.util.function` 为 `int`、`long`、`double` 提供了特化版本，避免装箱。

| 泛型版本 | int 特化 | long 特化 | double 特化 |
| --- | --- | --- | --- |
| `Predicate<T>` | `IntPredicate` | `LongPredicate` | `DoublePredicate` |
| `Consumer<T>` | `IntConsumer` | `LongConsumer` | `DoubleConsumer` |
| `Function<T, R>` | `IntFunction<R>`、`ToIntFunction<T>` | `LongFunction<R>`、`ToLongFunction<T>` | `DoubleFunction<R>`、`ToDoubleFunction<T>` |
| `Supplier<T>` | `IntSupplier` | `LongSupplier` | `DoubleSupplier` |
| `UnaryOperator<T>` | `IntUnaryOperator` | `LongUnaryOperator` | `DoubleUnaryOperator` |
| `BinaryOperator<T>` | `IntBinaryOperator` | `LongBinaryOperator` | `DoubleBinaryOperator` |

```java
import java.util.function.IntPredicate;
import java.util.function.ToIntFunction;

public class PrimitiveDemo {
    public static void main(String[] args) {
        // IntPredicate：直接操作 int，无装箱
        IntPredicate isEven = n -> n % 2 == 0;
        System.out.println(isEven.test(4));          // true

        // ToIntFunction<String>：返回 int
        ToIntFunction<String> length = s -> s.length();
        System.out.println(length.applyAsInt("hello")); // 5
    }
}
```

> ⚠️ **注意：** 在循环或 Stream 处理大量数据时，优先使用基本类型特化接口（如 `IntStream`、`IntPredicate`），可显著减少装箱开销，提升性能。

## 五、方法引用（Method References ::）

### 5.1 什么是方法引用

当 Lambda 表达式的方法体**只是调用一个已存在的方法**时，可以用**方法引用**进一步简化。方法引用用双冒号 `::` 表示，可以看作 Lambda 的一种"语法糖"。

```java
// Lambda 写法
Consumer<String> c1 = s -> System.out.println(s);
// 方法引用写法：等价但更简洁
Consumer<String> c2 = System.out::println;
```

### 5.2 四种方法引用

| 类型 | 语法 | 示例 | 等价 Lambda |
| --- | --- | --- | --- |
| 静态方法引用 | `类名::静态方法` | `Math::abs` | `x -> Math.abs(x)` |
| 特定对象的实例方法引用 | `对象::实例方法` | `System.out::println` | `x -> System.out.println(x)` |
| 类名::实例方法 | `类名::实例方法` | `String::length` | `s -> s.length()` |
| 构造方法引用 | `类名::new` | `Student::new` | `() -> new Student()` |

#### 1. 静态方法引用

```java
import java.util.function.Function;

public class StaticRef {
    public static void main(String[] args) {
        // Lambda：x -> Math.abs(x)
        Function<Integer, Integer> abs1 = x -> Math.abs(x);
        // 方法引用：Math::abs
        Function<Integer, Integer> abs2 = Math::abs;
        System.out.println(abs2.apply(-5));     // 5
    }
}
```

#### 2. 特定对象的实例方法引用

```java
import java.util.function.Consumer;

public class InstanceRef {
    public static void main(String[] args) {
        // 对象 System.out 的 println 方法
        Consumer<String> printer1 = s -> System.out.println(s);
        Consumer<String> printer2 = System.out::println;       // 等价
        printer2.accept("通过方法引用打印");

        // 自定义对象也可引用
        StringBuilder sb = new StringBuilder();
        Consumer<String> appender = sb::append;                // 引用 sb 的 append 方法
        appender.accept("Hello ");
        appender.accept("World");
        System.out.println(sb.toString());                     // Hello World
    }
}
```

#### 3. 类名::实例方法（第一个参数作为调用者）

这种形式比较特殊：Lambda 的**第一个参数**会成为方法的调用者，其余参数作为方法的实参。

```java
import java.util.function.Function;
import java.util.function.BiPredicate;

public class ClassNameInstanceRef {
    public static void main(String[] args) {
        // 一个参数：s -> s.length()，第一个参数 s 就是调用者
        Function<String, Integer> length = String::length;
        System.out.println(length.apply("hello"));            // 5

        // 两个参数：(str, prefix) -> str.startsWith(prefix)
        // 第一个参数 str 是调用者，第二个 prefix 是实参
        BiPredicate<String, String> startsWith = String::startsWith;
        System.out.println(startsWith.test("hello", "he"));   // true
    }
}
```

#### 4. 构造方法引用

```java
import java.util.function.Supplier;
import java.util.function.Function;

class Student {
    String name;
    public Student() { this.name = "匿名"; }                  // 无参构造
    public Student(String name) { this.name = name; }          // 有参构造
    @Override public String toString() { return "Student{" + name + "}"; }
}

public class ConstructorRef {
    public static void main(String[] args) {
        // 无参构造：() -> new Student()
        Supplier<Student> s1 = Student::new;
        System.out.println(s1.get());                          // Student{匿名}

        // 有参构造：name -> new Student(name)
        Function<String, Student> s2 = Student::new;
        System.out.println(s2.apply("张三"));                  // Student{张三}
    }
}
```

> 💡 **提示：** 构造方法引用具体对应哪个构造函数，由**目标函数式接口的方法签名**自动匹配。`Supplier<Student>` 的 `get()` 无参，匹配无参构造；`Function<String, Student>` 的 `apply(String)` 有一个 String 参数，匹配 `Student(String)` 构造。

### 5.3 方法引用 vs Lambda 对照表

| 场景 | Lambda | 方法引用 |
| --- | --- | --- |
| 调用静态方法 | `x -> Math.abs(x)` | `Math::abs` |
| 调用对象的实例方法 | `x -> System.out.println(x)` | `System.out::println` |
| 调用参数的实例方法 | `s -> s.toLowerCase()` | `String::toLowerCase` |
| 无参构造 | `() -> new ArrayList<>()` | `ArrayList::new` |
| 有参构造 | `size -> new ArrayList<>(size)` | `ArrayList::new` |

## 六、Lambda vs 匿名内部类

Lambda 在很多场景下是匿名内部类的替代品，但二者并不完全等价。

| 对比项 | Lambda 表达式 | 匿名内部类 |
| --- | --- | --- |
| `this` 指向 | 指向**外层类的实例**（定义 Lambda 的那个类） | 指向**匿名内部类自己的实例** |
| 生成的 class 文件 | 一般不单独生成（通过 `invokedynamic` 动态生成） | 每个匿名内部类都会生成一个 `.class` 文件 |
| 实例状态 | 无自己的实例字段（除非捕获外部变量） | 可以定义自己的实例字段 |
| 支持的接口类型 | 只能实现**函数式接口**（单抽象方法） | 可继承类、可实现**任意接口**（含多方法） |
| 代码简洁度 | 非常简洁 | 冗长 |
| 能否定义额外方法 | 不能 | 能（但外部无法调用） |

### 6.1 `this` 指向的差异

```java
public class ThisDemo {
    private String name = "外层类";

    public void test() {
        // Lambda 的 this 指向外层类 ThisDemo
        Runnable lambda = () -> System.out.println("Lambda 的 this.name = " + this.name);

        // 匿名内部类的 this 指向匿名对象自身
        Runnable anon = new Runnable() {
            private String name = "匿名内部类";
            @Override
            public void run() {
                System.out.println("匿名的 this.name = " + this.name);
                System.out.println("访问外层用 ThisDemo.this.name = " + ThisDemo.this.name);
            }
        };

        lambda.run();
        // 输出：Lambda 的 this.name = 外层类

        anon.run();
        // 输出：匿名的 this.name = 匿名内部类
        //      访问外层用 ThisDemo.this.name = 外层类
    }

    public static void main(String[] args) {
        new ThisDemo().test();
    }
}
```

### 6.2 选择建议

| 场景 | 推荐 |
| --- | --- |
| 实现函数式接口（单方法） | **Lambda** |
| 需要定义自己的状态字段 | 匿名内部类 |
| 需要继承类或实现多方法接口 | 匿名内部类（或普通类） |
| 简单的回调、事件处理 | **Lambda** |

## 七、变量捕获（闭包）

### 7.1 什么是变量捕获

Lambda 表达式可以使用它**外层作用域**中的变量，这种机制叫**变量捕获（Capture）**，形成的结构也叫**闭包（Closure）**。

```java
public class CaptureDemo {
    public static void main(String[] args) {
        String prefix = "你好，";                  // 外层局部变量

        // Lambda 捕获了 prefix
        Runnable r = () -> System.out.println(prefix + "世界");
        r.run();                                   // 输出：你好，世界
    }
}
```

### 7.2 局部变量必须是"事实最终变量"

Lambda 捕获的局部变量必须是 **effectively final**（事实最终变量）—— 即虽然没有用 `final` 关键字声明，但在赋值后**从未被修改过**。

```java
public class EffectivelyFinalDemo {
    public static void main(String[] args) {
        String msg1 = "我可以被捕获";              // ✅ 赋值后没改过，是 effectively final
        Runnable r1 = () -> System.out.println(msg1);

        int count = 0;
        // count = count + 1;                      // ❌ 如果取消注释，count 就不是 effectively final
        // Runnable r2 = () -> System.out.println(count);  // ❌ 编译报错

        String msg2;
        msg2 = "我先声明后赋值";                   // ✅ 只赋值一次，也算 effectively final
        Runnable r3 = () -> System.out.println(msg2);
    }
}
```

> ⚠️ **注意：** `final` 修饰不是必须的，但"不可修改"是必须的。下面这样会编译报错：
>
> ```java
> int x = 10;
> Runnable r = () -> System.out.println(x);
> x = 20;                                          // ❌ 编译报错：x 被 Lambda 捕获，必须 effectively final
> ```

### 7.3 为什么有 effectively final 限制

| 原因 | 说明 |
| --- | --- |
| **线程安全** | Lambda 可能在另一个线程执行（如新线程、并行流）。如果允许修改捕获的局部变量，多线程下会出现数据不一致 |
| **一致性** | 局部变量存在栈上，方法返回后栈帧销毁。Lambda 捕获时实际上是**复制了一份值**，如果允许原变量变化，Lambda 内外看到的就是不一致的 |
| **并发模型简化** | 强制只读，避免了复杂的同步控制，让闭包的行为可预测 |

### 7.4 实例变量和静态变量无此限制

Lambda 可以**自由访问**外层类的实例变量和静态变量，且不要求 final：

```java
public class InstanceVarDemo {
    private int instanceCount = 0;        // 实例变量
    private static int staticCount = 0;   // 静态变量

    public void demo() {
        // ✅ 实例变量可以自由读写
        Runnable r1 = () -> {
            instanceCount++;
            staticCount++;
            System.out.println("实例：" + instanceCount + "，静态：" + staticCount);
        };
        r1.run();
    }

    public static void main(String[] args) {
        new InstanceVarDemo().demo();
    }
}
```

> 💡 **提示：** 区别在于：局部变量在栈上，Lambda 是"复制值"捕获；实例/静态变量在堆/方法区，Lambda 是"通过 this 引用"访问的，访问的就是变量本身，没有复制一致性问题。

### 7.5 捕获机制示意图

```
┌───────────────────────────────────────────────────────────┐
│                  Lambda 变量捕获机制                        │
├───────────────────────┬───────────────────────────────────┤
│   局部变量（栈上）      │   实例/静态变量（堆/方法区）        │
├───────────────────────┼───────────────────────────────────┤
│   复制一份值到 Lambda   │   通过 this 直接引用原始变量        │
│   所以必须 effectively │   所以可自由读写，无需 final        │
│   final（保证一致性）  │                                   │
└───────────────────────┴───────────────────────────────────┘
```

## 八、Lambda 的应用场景

### 8.1 集合排序

```java
import java.util.*;

public class SortDemo {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(5, 2, 8, 1, 9));

        // 用 Lambda 排序
        nums.sort((a, b) -> a - b);                         // 升序
        System.out.println(nums);                           // [1, 2, 5, 8, 9]

        // 降序
        nums.sort((a, b) -> b - a);
        System.out.println(nums);                           // [9, 8, 5, 2, 1]

        // 对象排序 + Comparator.comparing（更优雅）
        List<String> names = new ArrayList<>(List.of("Charlie", "Alice", "Bob"));
        names.sort(Comparator.comparing(s -> s.length()));  // 按长度排序
        names.sort(Comparator.comparing(String::length));   // 方法引用写法
        names.sort(Comparator.comparing(String::length).reversed()); // 降序
    }
}
```

### 8.2 集合遍历

```java
import java.util.List;
import java.util.Map;

public class ForEachDemo {
    public static void main(String[] args) {
        List<String> list = List.of("苹果", "香蕉", "橘子");

        // Lambda 遍历（最常用）
        list.forEach(fruit -> System.out.println("水果：" + fruit));

        // 方法引用遍历
        list.forEach(System.out::println);

        // Map 遍历
        Map<String, Integer> map = Map.of("张三", 90, "李四", 85);
        map.forEach((k, v) -> System.out.println(k + "：" + v + " 分"));
    }
}
```

### 8.3 自定义行为参数化

```java
import java.util.Arrays;
import java.util.List;
import java.util.function.Predicate;
import java.util.ArrayList;

public class BehaviorParamDemo {
    // 把"判断逻辑"作为参数传入，方法本身不关心具体怎么判断
    public static <T> List<T> filter(List<T> list, Predicate<T> condition) {
        List<T> result = new ArrayList<>();
        for (T item : list) {
            if (condition.test(item)) {                    // 调用传入的判断逻辑
                result.add(item);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6);

        // 传入不同的判断逻辑，复用同一个 filter 方法
        System.out.println(filter(nums, n -> n % 2 == 0));     // 偶数：[2, 4, 6]
        System.out.println(filter(nums, n -> n > 3));          // 大于 3：[4, 5, 6]
        System.out.println(filter(nums, n -> n > 10));         // 都不满足：[]
    }
}
```

### 8.4 配合 Stream API

Lambda 是 Stream API 的核心，让集合操作变得声明式、链式。完整内容详见 Stream 文档，这里给出一个预览：

```java
import java.util.List;

public class StreamDemo {
    public static void main(String[] args) {
        List<String> names = List.of("张三", "李四", "王五", "张伟", "赵六");

        // 找出所有姓"张"的名字，转大写，收集到新列表
        names.stream()
             .filter(n -> n.startsWith("张"))       // 过滤
             .map(String::toUpperCase)               // 转换
             .forEach(System.out::println);          // 遍历输出
    }
}
```

### 8.5 替换回调/事件处理

```java
import java.util.function.Supplier;

public class CallbackDemo {
    // 懒求值：只在需要时才调用 supplier 获取值
    public static String getOrDefault(boolean condition, Supplier<String> supplier, String defaultValue) {
        return condition ? supplier.get() : defaultValue;
    }

    public static void main(String[] args) {
        // supplier 只在 condition 为 true 时才执行，避免无谓的计算
        String result = getOrDefault(true, () -> expensiveCompute(), "默认值");
        System.out.println(result);
    }

    static String expensiveCompute() {
        System.out.println("执行了耗时计算");
        return "计算结果";
    }
}
```

## 九、注意事项与陷阱

### 9.1 Lambda 只能用于函数式接口

```java
// ❌ List 接口有很多抽象方法，不是函数式接口，不能用 Lambda 创建
// List<String> list = () -> ...;   // 编译报错

// ✅ Runnable 只有一个 run()，是函数式接口
Runnable r = () -> System.out.println("ok");
```

### 9.2 捕获变量必须 effectively final

见第七章，这是最常见的编译错误之一。

### 9.3 不要为了用 Lambda 而滥用 Lambda

Lambda 简洁，但**逻辑复杂时反而降低可读性**。如果 Lambda 方法体超过 3 行或包含嵌套逻辑，建议抽取成一个**命名方法**，再用方法引用：

```java
// ❌ 逻辑太复杂，塞进 Lambda 难以阅读
list.forEach(item -> {
    if (item != null) {
        String processed = item.trim().toLowerCase();
        if (processed.length() > 5) {
            // ... 一堆逻辑
        }
    }
});

// ✅ 抽取成命名方法，用方法引用调用
list.forEach(this::processItem);
```

### 9.4 并行流中的线程安全

在 `parallelStream` 中执行 Lambda 时，Lambda 可能被多个线程并发调用，必须保证**线程安全**：

```java
import java.util.*;

public class ParallelPitfall {
    public static void main(String[] args) {
        List<Integer> nums = List.of(1, 2, 3, 4, 5);

        // ❌ ArrayList 非线程安全，并行流下可能丢失数据或抛异常
        List<Integer> unsafe = new ArrayList<>();
        nums.parallelStream().forEach(unsafe::add);        // 有并发问题

        // ✅ 使用线程安全的集合，或用 collect 收集
        List<Integer> safe = nums.parallelStream().toList();
    }
}
```

### 9.5 方法引用的参数匹配

方法引用要求方法签名与目标接口的方法签名**兼容**，否则编译报错。注意 `类名::实例方法` 这种形式的参数对齐规则。

### 9.6 序列化问题

Lambda 默认不可序列化。如果框架（如某些 RPC 框架）需要序列化函数式接口实例，需要显式声明 Serializable：

```java
// 让 Lambda 可序列化（少见，通常不推荐）
Predicate<String> p = (Predicate<String> & java.io.Serializable) s -> s.length() > 3;
```

## 十、面试常见问题

### Q1：什么是 Lambda 表达式？它的本质是什么？

Lambda 表达式是 Java 8 引入的特性，用于简洁地表示一个**匿名函数**。它的本质是**函数式接口的实例**——编译器通过 `invokedynamic` 指令在运行时动态生成实现类，而不是像匿名内部类那样在编译期生成 `.class` 文件。Lambda 让我们能以更简洁的语法把"行为"作为参数传递。

### Q2：什么是函数式接口？`@FunctionalInterface` 注解的作用？

函数式接口是**有且只有一个抽象方法**的接口（可以包含默认方法、静态方法、私有方法）。
`@FunctionalInterface` 注解的作用是**让编译器校验**：如果接口内有多个抽象方法，编译时就会报错。它不是强制的（不加注解的接口只要满足条件也是函数式接口），但加上后能防止以后误增方法破坏约定，是一种良好的实践。

### Q3：Predicate、Consumer、Function、Supplier 有什么区别？

| 接口 | 签名 | 用途 |
| --- | --- | --- |
| `Predicate<T>` | `T -> boolean` | 判断条件，返回真假 |
| `Consumer<T>` | `T -> void` | 消费数据，无返回 |
| `Function<T, R>` | `T -> R` | 类型转换/映射 |
| `Supplier<T>` | `() -> T` | 提供/生产数据 |

记忆：Predicate 判断、Consumer 消费、Function 转换、Supplier 供给。

### Q4：方法引用有几种？分别举例。

四种：
1. **静态方法引用**：`Math::abs`（`类名::静态方法`）
2. **特定对象的实例方法引用**：`System.out::println`（`对象::方法`）
3. **类名::实例方法**：`String::length`（第一个参数作为调用者）
4. **构造方法引用**：`Student::new`（`类名::new`）

### Q5：Lambda 表达式和匿名内部类有什么区别？

1. **`this` 指向**：Lambda 的 `this` 指向外层类实例；匿名内部类的 `this` 指向自身。
2. **class 文件**：匿名内部类编译时生成单独的 `.class`；Lambda 通过 `invokedynamic` 动态生成，一般无独立 class 文件。
3. **适用范围**：Lambda 只能实现函数式接口；匿名内部类可继承类、可实现多方法接口。
4. **状态**：Lambda 无自己的实例字段；匿名内部类可定义实例字段。
5. **简洁度**：Lambda 远比匿名内部类简洁。

### Q6：为什么 Lambda 中使用的局部变量必须是 final 或 effectively final？

主要原因是**线程安全**和**一致性**：
- Lambda 可能在其他线程执行（新线程、并行流），如果允许修改捕获的局部变量，多线程下会出现数据竞争。
- 局部变量存在栈上，方法返回后栈帧销毁；Lambda 实际上**复制了一份变量的值**，如果原变量可变，Lambda 内外看到的就是不一致的。
- 强制只读简化了并发模型，让闭包行为可预测。

### Q7：下面代码能编译通过吗？为什么？

```java
int x = 10;
Runnable r = () -> System.out.println(x);
x = 20;
```

**不能**。`x` 被 Lambda 捕获后又被修改（`x = 20`），不再是 effectively final，编译器报错："Local variable x defined in an enclosing scope must be final or effectively final"。解决方法是要么不修改 `x`，要么把 `x` 声明为 `final`，要么改用数组或对象包装。

### Q8：`compose` 和 `andThen` 有什么区别？

两者都是 `Function` 的组合方法，区别在**执行顺序**：
- `f.andThen(g)`：先执行 `f`，再执行 `g`，即 `g(f(x))`。按书写顺序。
- `f.compose(g)`：先执行 `g`，再执行 `f`，即 `f(g(x))`。被组合进来的先执行。

### Q9：方法引用 `String::length` 对应的 Lambda 是什么？

`String::length` 属于"类名::实例方法"，第一个参数会成为调用者，所以对应 `s -> s.length()`（即 `Function<String, Integer>`）。如果目标接口是 `Function<String, Integer>`，则 `apply("hello")` 返回 5。

## 十一、总结

Lambda 表达式是 Java 走向函数式编程的关键一步，它的核心要点：

| 要点 | 内容 |
| --- | --- |
| **本质** | 函数式接口的实例（匿名函数） |
| **语法** | `(参数) -> {方法体}`，可省类型、括号、大括号、return |
| **基础** | 必须依附于**函数式接口**（单抽象方法接口） |
| **内置接口** | `Predicate`、`Consumer`、`Function`、`Supplier` 四大核心，外加 `UnaryOperator`/`BinaryOperator` 和基本类型特化版 |
| **方法引用** | `::` 语法糖，四种形式：静态、对象实例、类名实例、构造 |
| **变量捕获** | 局部变量必须 effectively final；实例/静态变量无此限制 |
| **与匿名内部类** | Lambda 更简洁、this 指向外层、无独立 class 文件，但只能用于函数式接口 |
| **应用场景** | 集合排序、遍历、行为参数化、Stream API、回调处理 |

**学习路径建议**：
1. 先掌握 Lambda 基本语法和简写规则。
2. 理解函数式接口的概念，熟记四大内置接口。
3. 学会方法引用，把能简化的 Lambda 都简化。
4. 理解变量捕获和 effectively final 的原理。
5. 结合 Stream API 综合运用，体会声明式编程的优雅。

> 💡 **提示：** Lambda 是 Stream API 的基础，掌握 Lambda 后，建议接着学习 Stream API，体会 `filter`、`map`、`reduce`、`collect` 等操作的强大之处。
