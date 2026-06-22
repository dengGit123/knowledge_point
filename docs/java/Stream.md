# Stream 流详解

> 官方文档：[Aggregate Operations（Oracle Java 教程）](https://docs.oracle.com/javase/tutorial/collections/streams/)、[java.util.stream 包文档](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/package-summary.html)
> 菜鸟教程：[Java 8 Stream](https://www.runoob.com/java/java8-streams.html)

## 一、概述

**Stream（流）** 是 Java 8 引入的一个全新的、用于对**集合/数组**进行**函数式、声明式**批量操作的 API。它把对数据的处理抽象成一条"流水线（pipeline）"：数据像水流一样从源头流出，经过一道道"工序"（过滤、映射、排序……）加工，最后产出结果。

> ⚠️ **注意：Stream（数据流）和 IO 流（InputStream / OutputStream）是完全不同的两个东西！**
> - **Stream**：在 `java.util.stream` 包下，用来对集合/数组做批量计算，处理的是**内存中的数据**。
> - **IO 流**：在 `java.io` 包下，用来做**文件读写、网络传输**等字节/字符的输入输出。
> 二者只是名字里都有"流"字，**没有任何继承或功能关系**。本文讲的是前者（数据流）。

> 💡 **提示（通俗类比）：** Stream 就像一条**工厂流水线**。原料（集合里的数据）放上传送带，依次经过"质检（filter）→ 加工（map）→ 排序（sorted）→ 装箱（collect）"等多道工序，最后变成成品。你只需**描述**要做什么（声明式），而不必关心每一步具体怎么做。

### 为什么需要 Stream？

传统 `for` 循环是**命令式**的：你要告诉计算机"怎么做"（怎么遍历、怎么累加、怎么判断）。而 Stream 是**声明式**的：你只要说"我要什么"（过滤大于 60 分的、求平均值），代码更简洁、更易读。

```java
// ❌ 传统 for 循环：命令式，关注"怎么做"，啰嗦
List<Student> result = new ArrayList<>();
for (Student s : students) {
    if (s.getScore() >= 60) {       // 判断及格
        result.add(s);              // 手动收集
    }
}

// ✅ Stream 写法：声明式，关注"要什么"，简洁直观
List<Student> result = students.stream()
        .filter(s -> s.getScore() >= 60)   // 过滤
        .collect(Collectors.toList());     // 收集结果
```

Stream 的四大价值：

1. **声明式**：代码表达"做什么"，而非"怎么做"，可读性强。
2. **可链式调用**：多个操作像链条一样串起来，一气呵成。
3. **可并行**：调用 `parallelStream()` 即可利用多核 CPU 并行处理。
4. **代码简洁**：用很少的代码完成复杂的过滤、分组、统计等操作。

---

## 二、Stream 的特点

| 特点            | 说明                                                                 |
| --------------- | -------------------------------------------------------------------- |
| **不存储数据**  | Stream 本身不存数据，数据来源于集合/数组等"数据源"                   |
| **不修改数据源**| 操作产生新结果，不改动原始集合（除非你在 `forEach` 里手动改）        |
| **惰性求值**    | 中间操作不会立即执行，直到遇到**终端操作**才触发整条流水线           |
| **一次性**      | 一个 Stream 只能被"消费"一次，执行完终端操作后就不能再用了           |
| **内部迭代**    | 迭代过程由 Stream 内部完成，不需要程序员写 `for` 循环（外部迭代）    |

### 1. 惰性求值（Lazy Evaluation）

中间操作（如 `filter`、`map`）是"懒惰"的，单独写它们**不会执行任何代码**。只有遇到终端操作（如 `collect`、`forEach`）时，整条流水线才会真正开始运转。

```java
List<Integer> list = Arrays.asList(1, 2, 3);

// 没有终端操作 —— 下面的 filter 不会被执行，"过滤..." 永远不会打印
list.stream().filter(x -> {
    System.out.println("过滤..." + x);  // 不会输出
    return x > 1;
});

// 加上终端操作 collect —— 流水线被触发
list.stream().filter(x -> {
    System.out.println("过滤..." + x);  // ✅ 会输出
    return x > 1;
}).collect(Collectors.toList());
```

> 💡 **提示：** 惰性求值的好处是**效率高**。配合 `limit` 等"短路"操作，Stream 可以做到"找到足够的结果就停"，不必遍历整个数据源。

### 2. 一次性（只能消费一次）

一个 Stream 实例只能使用一次，执行完终端操作后流就"关闭"了，再次使用会抛 `IllegalStateException`。

```java
Stream<Integer> stream = Stream.of(1, 2, 3);
stream.filter(x -> x > 1).forEach(System.out::println);  // ✅ 第一次使用

// ❌ 第二次使用会抛异常：stream has already been operated upon or closed
stream.filter(x -> x > 1).forEach(System.out::println);

// ✅ 正确做法：每次都从数据源重新创建流
Stream.of(1, 2, 3).filter(x -> x > 1).forEach(System.out::println);
```

---

## 三、创建 Stream

创建 Stream 有多种方式，常见方式如下表：

| 创建方式                          | 适用场景                 | 示例                                  |
| --------------------------------- | ------------------------ | ------------------------------------- |
| `collection.stream()`             | 从集合创建（最常用）     | `list.stream()`                       |
| `collection.parallelStream()`     | 从集合创建并行流         | `list.parallelStream()`               |
| `Arrays.stream(array)`            | 从数组创建               | `Arrays.stream(new int[]{1,2,3})`     |
| `Stream.of(T...)`                 | 从若干个值创建           | `Stream.of("a","b","c")`              |
| `Stream.generate(supplier)`       | 创建无限流（需 limit）   | `Stream.generate(() -> "x")`          |
| `Stream.iterate(seed, f)`         | 创建无限流（递推）       | `Stream.iterate(0, n -> n + 1)`       |
| `BufferedReader.lines()`          | 按行读取文件             | `reader.lines()`                      |
| `Pattern.splitAsStream(str)`      | 按正则拆分字符串         | `Pattern.compile(",").splitAsStream(s)`|

### 1. 从集合创建

```java
List<String> list = Arrays.asList("Java", "Python", "Go");
Stream<String> stream1 = list.stream();              // 顺序流
Stream<String> stream2 = list.parallelStream();      // 并行流
```

### 2. 从数组创建

```java
int[] nums = {1, 2, 3, 4, 5};
IntStream intStream = Arrays.stream(nums);           // 基本类型数组 → IntStream

String[] arr = {"a", "b", "c"};
Stream<String> strStream = Arrays.stream(arr);       // 引用类型数组 → Stream<T>
```

> 💡 **提示：** 基本类型数组（`int[]`、`long[]`、`double[]`）会得到 `IntStream`、`LongStream`、`DoubleStream`，可以避免装箱拆箱，效率更高。

### 3. 从若干个值创建

```java
Stream<Integer> stream = Stream.of(1, 2, 3, 4, 5);
Stream<String>  strStream = Stream.of("hello", "world");
```

### 4. 创建无限流（必须配合 limit 使用）

```java
// generate：不断用 supplier 生成
Stream<Double> randoms = Stream.generate(Math::random).limit(5);  // 5 个随机数

// iterate：seed 出发，每次应用函数
Stream<Integer> naturals = Stream.iterate(0, n -> n + 1).limit(10); // 0~9

// Java 9+ 增强：iterate 可加终止条件
Stream<Integer> even = Stream.iterate(0, n -> n < 20, n -> n + 2);  // 0,2,...,18
```

> ⚠️ **注意：** 无限流没有尽头，必须用 `limit()` 截断，否则终端操作会**无限执行**导致程序卡死。

### 5. 从文件/字符串创建

```java
// 按行读取文件（try-with-resources 自动关闭流）
try (Stream<String> lines = Files.lines(Paths.get("data.txt"))) {
    lines.filter(line -> line.contains("Java")).forEach(System.out::println);
} catch (IOException e) {
    e.printStackTrace();
}

// 按正则把字符串拆成流
Stream<String> parts = Pattern.compile(",").splitAsStream("a,b,c,d");
```

---

## 四、Stream 操作分类（核心）

Stream 的操作分为两大类：**中间操作**和**终端操作**。这是理解 Stream 最重要的概念。

```
        数据源（集合/数组）
              │
              ▼
       ┌──────────────┐
       │  创建 stream │
       └──────┬───────┘
              │
   ┌──────────▼──────────┐
   │   中间操作（可多个）  │  ← 返回 Stream，惰性求值，不触发执行
   │  filter / map / ...  │
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │   终端操作（仅 1 个） │  ← 触发整条流水线执行，产出最终结果
   │ collect/forEach/...  │
   └──────────┬──────────┘
              │
              ▼
          最终结果
```

### 中间操作（Intermediate Operations）

中间操作**返回一个新的 Stream**，本身不执行任何计算（惰性）。中间操作又分为**无状态**和**有状态**两种：

| 分类     | 方法                        | 说明                         |
| -------- | --------------------------- | ---------------------------- |
| **无状态** | `filter`、`map`、`flatMap`、`peek`、`mapToInt` 等 | 处理当前元素时不依赖其他元素，效率高 |
| **有状态** | `sorted`、`distinct`、`limit`、`skip` | 处理时需要看到多个/全部元素（如排序要先看完所有数据） |

> 💡 **提示：** "有状态"操作往往需要**缓存**中间结果（排序要缓存所有元素），因此会有额外内存开销。

### 终端操作（Terminal Operations）

终端操作**不返回 Stream**，而是返回一个具体结果（集合、值或 `void`），并触发整条流水线的执行：

| 分类       | 方法                                              | 返回类型           |
| ---------- | ------------------------------------------------- | ------------------ |
| **收集**   | `collect(Collector)`                              | 集合/Map/字符串     |
| **归约**   | `reduce(BinaryOperator)`、`count`、`min`、`max`   | Optional/数值       |
| **消费**   | `forEach(Consumer)`、`forEachOrdered`             | void               |
| **匹配**   | `anyMatch`、`allMatch`、`noneMatch`               | boolean            |
| **查找**   | `findFirst`、`findAny`                            | Optional           |

> ⚠️ **注意：** 一条 Stream 流水线**有且仅有一个**终端操作。没有终端操作的链是"哑巴"，什么都不会发生。

---

## 五、中间操作详解

### 1. filter —— 过滤

`filter(Predicate)` 接收一个断言（返回 boolean 的函数），保留满足条件的元素。

```java
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6);

// 过滤出偶数
List<Integer> evens = nums.stream()
        .filter(n -> n % 2 == 0)          // 保留偶数
        .collect(Collectors.toList());    // [2, 4, 6]
```

### 2. map —— 映射（一对一）

`map(Function)` 把每个元素**转换**成另一个元素（一对一）。

```java
List<String> names = Arrays.asList("tom", "jerry", "spike");

// 把每个名字转大写
List<String> upper = names.stream()
        .map(String::toUpperCase)         // 方法引用，等价于 s -> s.toUpperCase()
        .collect(Collectors.toList());    // [TOM, JERRY, SPIKE]

// 提取对象的某个属性
List<Student> students = getStudents();
List<String> nameList = students.stream()
        .map(Student::getName)            // 只取名字
        .collect(Collectors.toList());
```

### 3. flatMap —— 扁平化（一对多，重点）

`flatMap` 把每个元素转换成一个 Stream，然后把**所有小 Stream 打平合并**成一个大 Stream。常用于处理"嵌套结构"（如 `List<List<T>>`）。

```java
List<List<Integer>> nested = Arrays.asList(
        Arrays.asList(1, 2, 3),
        Arrays.asList(4, 5),
        Arrays.asList(6, 7, 8, 9)
);

// ❌ 用 map：结果是 Stream<List<Integer>>，嵌套结构没解开
List<List<Integer>> r1 = nested.stream()
        .map(list -> list)                // 还是嵌套的
        .collect(Collectors.toList());

// ✅ 用 flatMap：把每个子 List 拆开，合并成一个扁平的流
List<Integer> flat = nested.stream()
        .flatMap(Collection::stream)      // 每个子 List 变成 Stream，再合并
        .collect(Collectors.toList());    // [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

> 💡 **提示（通俗理解 map vs flatMap）：**
> - `map`：一封信装一个信封 → 一个信封里一封信（一一对应）。
> - `flatMap`：每个信封里拆出多封信，全部摊到桌上 → 一大摞信（一对多并打平）。

把字符串拆成字符流的经典示例：

```java
List<String> words = Arrays.asList("hello", "world");

// 取出每个单词里所有不重复的字母
List<String> chars = words.stream()
        .flatMap(w -> Arrays.stream(w.split("")))  // "hello"→h,e,l,l,o
        .distinct()
        .collect(Collectors.toList());    // [h, e, l, o, w, r, d]
```

### 4. sorted —— 排序

```java
List<Integer> nums = Arrays.asList(5, 1, 3, 2, 4);

// 自然排序（升序）
List<Integer> asc = nums.stream().sorted().collect(Collectors.toList());  // [1,2,3,4,5]

// 自定义排序（降序）
List<Integer> desc = nums.stream()
        .sorted(Comparator.reverseOrder())
        .collect(Collectors.toList());    // [5,4,3,2,1]

// 按对象属性排序：学生按分数从高到低
List<Student> sorted = students.stream()
        .sorted(Comparator.comparing(Student::getScore).reversed())
        .collect(Collectors.toList());
```

### 5. distinct —— 去重

`distinct()` 去除重复元素，去重依据是 `equals()` 方法。

```java
List<Integer> nums = Arrays.asList(1, 2, 2, 3, 3, 3, 4);
List<Integer> unique = nums.stream()
        .distinct()
        .collect(Collectors.toList());    // [1, 2, 3, 4]
```

> ⚠️ **注意：** 自定义对象去重时，必须正确重写 `equals()` 和 `hashCode()`，否则 `distinct` 不生效。

### 6. limit / skip —— 截取 / 跳过

```java
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8);

List<Integer> top3 = nums.stream().limit(3).collect(Collectors.toList());  // [1, 2, 3]
List<Integer> skip3 = nums.stream().skip(3).collect(Collectors.toList());  // [4, 5, 6, 7, 8]

// 取第 3~5 名（先跳过 2 个，再取 3 个）
List<Integer> range = nums.stream().skip(2).limit(3).collect(Collectors.toList()); // [3, 4, 5]
```

### 7. peek —— 查看（调试用）

`peek(Consumer)` 让你"偷看"流经的每个元素，常用于**调试日志**，不改变元素本身。

```java
List<Integer> result = Stream.of(1, 2, 3, 4)
        .peek(n -> System.out.println("过滤前: " + n))
        .filter(n -> n > 2)
        .peek(n -> System.out.println("过滤后: " + n))
        .collect(Collectors.toList());
```

> ⚠️ **注意：** `peek` 主要用于**调试**，不要用它来执行业务逻辑（修改状态）。要修改数据请用 `map` 或终端 `forEach`。而且 `peek` 是惰性的，没有终端操作时里面的代码可能根本不执行。

---

## 六、终端操作详解

### 1. forEach —— 遍历消费

```java
List<String> list = Arrays.asList("a", "b", "c");
list.stream().forEach(System.out::println);   // 逐个打印

// 并行流中 forEach 顺序不确定，若需要保证顺序用 forEachOrdered
list.parallelStream().forEachOrdered(System.out::println);
```

### 2. collect —— 收集（最重要）

`collect(Collector)` 把流中的元素收集成集合、字符串等。它配合 `Collectors` 工具类使用，是 Stream 中最强大的终端操作（详见第七章）。

```java
// 收集为 List / Set
List<Integer> list = stream.collect(Collectors.toList());
Set<Integer> set = stream.collect(Collectors.toSet());
```

### 3. count —— 计数

```java
long count = Stream.of(1, 2, 3, 4, 5)
        .filter(n -> n > 2)
        .count();   // 3
```

### 4. reduce —— 归约

`reduce` 把流中的所有元素**反复结合**，最终得到一个值（求和、求积、拼接字符串等）。

```java
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);

// 写法一：有初始值（identity），返回具体值
int sum1 = nums.stream().reduce(0, Integer::sum);          // 15，0 + 1+2+3+4+5

// 写法二：无初始值，返回 Optional（可能为空）
Optional<Integer> sum2 = nums.stream().reduce(Integer::sum);  // Optional[15]
int result = sum2.orElse(0);                               // 取不到给默认值 0

// 求积
int product = nums.stream().reduce(1, (a, b) -> a * b);    // 120
```

> 💡 **提示：** 无初始值的 `reduce` 在流为空时返回 `Optional.empty()`（避免返回 null），更安全。有初始值的版本一定有返回值。

### 5. min / max —— 求最值

返回 `Optional`（因为流可能为空，没有最值）。

```java
List<Integer> nums = Arrays.asList(3, 1, 4, 1, 5, 9);
Optional<Integer> min = nums.stream().min(Integer::compareTo);  // Optional[1]
Optional<Integer> max = nums.stream().max(Integer::compareTo);  // Optional[9]

// 取出值，处理空情况
int minVal = min.orElseThrow(() -> new RuntimeException("空集合"));
```

### 6. anyMatch / allMatch / noneMatch —— 匹配判断

| 方法         | 含义                                   | 返回    |
| ------------ | -------------------------------------- | ------- |
| `anyMatch`   | 是否**存在**至少一个满足条件的元素     | boolean |
| `allMatch`   | 是否**所有**元素都满足条件             | boolean |
| `noneMatch`  | 是否**没有任何**元素满足条件           | boolean |

```java
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);

boolean hasEven = nums.stream().anyMatch(n -> n % 2 == 0);   // true（有偶数）
boolean allPos  = nums.stream().allMatch(n -> n > 0);        // true（全为正）
boolean noNeg   = nums.stream().noneMatch(n -> n < 0);       // true（没有负数）
```

> 💡 **提示：** 这三个方法是**短路**操作——`anyMatch` 一旦找到一个满足的就立即结束，`allMatch` 一旦遇到不满足的也立即结束，不必遍历完所有元素。

### 7. findFirst / findAny —— 查找

```java
Optional<Integer> first = Stream.of(5, 3, 8, 1).findFirst();  // Optional[5]，取第一个

// findAny 在并行流中性能更好（随便找一个，不保证顺序）
Optional<Integer> any = nums.parallelStream().findAny();
```

> ⚠️ **注意：** 顺序流中 `findAny` 通常也返回第一个，但在**并行流**中可能返回任意一个，性能优于 `findFirst`。如果你不关心具体是哪一个，用 `findAny`。

---

## 七、Collectors 收集器（重点）

`java.util.stream.Collectors` 是一个工具类，提供各种现成的 `Collector`，让 `collect` 的能力大大增强。

### 1. toList / toSet / toMap

```java
// 收集为 List
List<String> names = students.stream().map(Student::getName).collect(Collectors.toList());

// 收集为 Set（自动去重）
Set<String> nameSet = students.stream().map(Student::getName).collect(Collectors.toSet());

// 收集为 Map：key=学号, value=学生对象
Map<Integer, Student> map = students.stream()
        .collect(Collectors.toMap(Student::getId, s -> s));

// toMap 重复 key 处理：保留后一个值
Map<String, Integer> scoreMap = students.stream()
        .collect(Collectors.toMap(Student::getName, Student::getScore, (a, b) -> b));
```

> ⚠️ **注意：** `toMap` 时如果有**重复的 key**，会抛 `IllegalStateException`。必须提供第三个参数（合并函数）来解决冲突。

### 2. groupingBy —— 分组（重点）

`groupingBy(Function)` 按某个属性分组，结果是 `Map<分组键, List<元素>>`。

```java
class Employee {
    String name, dept;
    double salary;
    // 构造方法、getter 省略...
}

List<Employee> emps = Arrays.asList(
    new Employee("张三", "研发部", 15000),
    new Employee("李四", "研发部", 20000),
    new Employee("王五", "市场部", 12000),
    new Employee("赵六", "市场部", 18000)
);

// 按部门分组
Map<String, List<Employee>> byDept = emps.stream()
        .collect(Collectors.groupingBy(Employee::getDept));
// {研发部=[张三, 李四], 市场部=[王五, 赵六]}

// 二级分组：先按部门，再按工资高低
Map<String, Map<String, List<Employee>>> level2 = emps.stream()
        .collect(Collectors.groupingBy(
                Employee::getDept,
                Collectors.groupingBy(e -> e.getSalary() >= 15000 ? "高" : "低")
        ));

// 分组 + 统计数量：每个部门多少人
Map<String, Long> countByDept = emps.stream()
        .collect(Collectors.groupingBy(Employee::getDept, Collectors.counting()));

// 分组 + 求平均工资
Map<String, Double> avgSalary = emps.stream()
        .collect(Collectors.groupingBy(
                Employee::getDept,
                Collectors.averagingDouble(Employee::getSalary)
        ));
```

> 💡 **提示：** `groupingBy` 类似 SQL 中的 `GROUP BY`，是 Stream 中最实用的功能之一。第二个参数可以传入"下游收集器"对每组再做统计。

### 3. partitioningBy —— 分区

`partitioningBy(Predicate)` 按条件分成两组（key 固定为 `true`/`false`），是 `groupingBy` 的特殊情况。

```java
// 按是否高薪（>=15000）分区
Map<Boolean, List<Employee>> partition = emps.stream()
        .collect(Collectors.partitioningBy(e -> e.getSalary() >= 15000));
// {true=[张三, 李四, 赵六], false=[王五]}
```

### 4. joining —— 字符串拼接

```java
List<String> names = Arrays.asList("Tom", "Jerry", "Spike");

// 直接拼接
String s1 = names.stream().collect(Collectors.joining());          // TomJerrySpike

// 指定分隔符
String s2 = names.stream().collect(Collectors.joining(", "));      // Tom, Jerry, Spike

// 指定前后缀
String s3 = names.stream().collect(Collectors.joining(", ", "[", "]")); // [Tom, Jerry, Spike]
```

### 5. 统计类收集器

```java
// 计数
long count = emps.stream().collect(Collectors.counting());

// 求和
int totalAge = students.stream().collect(Collectors.summingInt(Student::getAge));

// 求平均
double avg = emps.stream().collect(Collectors.averagingDouble(Employee::getSalary));

// 一次性拿到 count/sum/min/max/avg（汇总统计）
IntSummaryStatistics stats = students.stream()
        .collect(Collectors.summarizingInt(Student::getScore));
stats.getCount();  // 总数
stats.getAverage();// 平均值
stats.getMax();    // 最大值
```

### Collectors 常用方法速查表

| 方法                 | 作用                         | 示例结果                |
| -------------------- | ---------------------------- | ----------------------- |
| `toList()`           | 收集为 List                  | `[a, b, c]`             |
| `toSet()`            | 收集为 Set（去重）           | `{a, b, c}`             |
| `toMap()`            | 收集为 Map                   | `{1=a, 2=b}`            |
| `joining()`          | 拼接字符串                   | `"a,b,c"`               |
| `groupingBy()`       | 分组                         | `{组1=[..], 组2=[..]}`  |
| `partitioningBy()`   | 分区（true/false 两组）      | `{true=[..], false=[..]}`|
| `counting()`         | 计数                         | `5`                     |
| `summingInt()`       | 求和                         | `100`                   |
| `averagingDouble()`  | 求平均                       | `85.5`                  |
| `summarizingInt()`   | 汇总统计（count/min/max/avg）| `IntSummaryStatistics`  |

---

## 八、Optional 类（重点）

`Optional<T>` 是一个**容器对象**，它可能包含一个非 null 的值，也可能为空。它和 Stream 一样是 Java 8 引入的，常被 Stream 的终端操作（`reduce`、`min`、`max`、`findFirst` 等）用来作为返回值。

### 引入目的：优雅处理 null，避免 NPE

```java
// ❌ 传统方式：手动判空，容易漏，忘了就 NullPointerException
String name = user.getName();
if (name != null) {
    System.out.println(name.toUpperCase());
}

// ✅ Optional 方式：强制你处理"可能为空"的情况
Optional<String> opt = Optional.ofNullable(user.getName());
opt.map(String::toUpperCase).ifPresent(System.out::println);
```

### 创建 Optional

```java
// of：值不能为 null，否则抛 NPE
Optional<String> o1 = Optional.of("hello");

// ofNullable：值可以为 null（推荐）
Optional<String> o2 = Optional.ofNullable(getName());   // 可能为空

// empty：创建一个空的 Optional
Optional<String> o3 = Optional.<String>empty();
```

### 常用方法

| 方法                  | 说明                                            |
| --------------------- | ----------------------------------------------- |
| `isPresent()`         | 是否有值（返回 boolean）                        |
| `get()`               | 取出值，**为空时抛 NoSuchElementException**     |
| `orElse(default)`     | 有值就取值，没值就返回默认值                    |
| `orElseGet(supplier)` | 没值时调用 supplier 生成默认值（惰性）          |
| `orElseThrow()`       | 没值时抛异常                                    |
| `ifPresent(consumer)` | 有值时执行操作                                  |
| `map(function)`       | 对值做转换，仍返回 Optional                     |
| `filter(predicate)`   | 过滤，不满足返回空 Optional                     |

```java
Optional<String> opt = Optional.ofNullable(getName());

// ❌ 不推荐：直接 get()，为空时抛异常
if (opt.isPresent()) {
    System.out.println(opt.get().toUpperCase());
}

// ✅ 推荐：链式 + orElse
String name = opt.map(String::toUpperCase).orElse("DEFAULT");
System.out.println(name);

// 没值时抛自定义异常
String value = opt.orElseThrow(() -> new RuntimeException("名字不存在"));
```

> ⚠️ **注意：** 尽量避免直接用 `get()` 和 `isPresent()`（这就退化成了 if-null 判断）。Optional 的精髓在于**链式调用** `map`、`filter`、`orElse` 等，让"可能为空"的处理更优雅。

---

## 九、并行流（parallelStream）

`parallelStream()` 把流拆分成多个子任务，利用 `ForkJoinPool` 在**多核 CPU** 上并行处理，理论上能提升处理速度。

```
                    顺序流 stream()
   数据源: [1,2,3,4,5,6,7,8] ──→ 单线程逐个处理 ──→ 结果

                    并行流 parallelStream()
   数据源: [1,2,3,4,5,6,7,8]
            ┌──────┬──────┬──────┐
            │1,2  │3,4  │5,6  │7,8   ← 拆分给多个线程
            ▼      ▼      ▼      ▼
           线程1  线程2  线程3  线程4   ← ForkJoinPool 多核并行
            └──────┴──────┴──────┘
                    │
                  合并结果
```

### 使用示例

```java
// 顺序流
long sum1 = LongStream.rangeClosed(1, 10_000_000).sum();

// 并行流：只需加 .parallel() 或用 parallelStream()
long sum2 = LongStream.rangeClosed(1, 10_000_000).parallel().sum();
```

### 适用场景与注意事项

并行流**不是银弹**，使用不当反而更慢。判断是否用并行流：

| 条件                    | 是否适合并行流 |
| ----------------------- | -------------- |
| 数据量很大（万级以上）  | ✅ 适合        |
| 数据量很小（几百以内）  | ❌ 拆分开销 > 收益 |
| 每个元素操作很简单      | ❌ 不划算      |
| 每个元素操作很耗时      | ✅ 适合        |
| 涉及共享可变状态        | ❌ 危险        |
| 对顺序有严格要求        | ❌ 不适合（顺序不定）|

> ⚠️ **注意（最关键的陷阱）：** 并行流中**绝对不要修改共享可变状态**！下面是典型错误：

```java
// ❌ 错误：多线程同时操作共享的 ArrayList，会丢数据甚至抛异常
List<Integer> result = new ArrayList<>();
IntStream.range(0, 1000).parallel().forEach(i -> result.add(i));  // 结果长度可能 < 1000

// ✅ 正确：用线程安全的 collect 收集器
List<Integer> result = IntStream.range(0, 1000).parallel()
        .boxed()
        .collect(Collectors.toList());
```

> ⚠️ **注意：** 并行流底层用的是全局的 `ForkJoinPool.commonPool()`，所有并行流共享。如果在并行流里执行阻塞操作（如网络请求），会拖慢其他并行流。

---

## 十、综合示例

下面用一个完整的员工管理案例，对比传统写法和 Stream 写法。

```java
import java.util.*;
import java.util.stream.*;

class Employee {
    String name;
    String dept;
    double salary;
    int age;

    public Employee(String name, String dept, double salary, int age) {
        this.name = name; this.dept = dept; this.salary = salary; this.age = age;
    }
    public String getName() { return name; }
    public String getDept() { return dept; }
    public double getSalary() { return salary; }
    public int getAge() { return age; }
    @Override public String toString() { return name + "(" + salary + ")"; }
}

public class StreamDemo {
    public static void main(String[] args) {
        List<Employee> emps = Arrays.asList(
            new Employee("张三", "研发部", 25000, 28),
            new Employee("李四", "研发部", 18000, 24),
            new Employee("王五", "市场部", 30000, 35),
            new Employee("赵六", "市场部", 15000, 22),
            new Employee("钱七", "研发部", 40000, 40)
        );

        // 需求 1：找出工资 >= 20000 的员工，按工资降序，取名字列表
        List<String> highPaidNames = emps.stream()
                .filter(e -> e.getSalary() >= 20000)                       // 过滤
                .sorted(Comparator.comparing(Employee::getSalary).reversed())// 排序
                .map(Employee::getName)                                     // 取名字
                .collect(Collectors.toList());                              // 收集
        System.out.println("高薪员工: " + highPaidNames);                   // [钱七, 王五, 张三]

        // 需求 2：按部门分组
        Map<String, List<Employee>> byDept = emps.stream()
                .collect(Collectors.groupingBy(Employee::getDept));
        System.out.println("按部门分组: " + byDept);

        // 需求 3：求所有员工的平均工资
        double avgSalary = emps.stream()
                .collect(Collectors.averagingDouble(Employee::getSalary));
        System.out.println("平均工资: " + avgSalary);

        // 需求 4：每个部门的平均工资
        Map<String, Double> avgByDept = emps.stream()
                .collect(Collectors.groupingBy(
                        Employee::getDept,
                        Collectors.averagingDouble(Employee::getSalary)));
        System.out.println("各部门平均工资: " + avgByDept);

        // 需求 5：最高薪员工（用 reduce 或 max）
        Optional<Employee> top = emps.stream()
                .max(Comparator.comparing(Employee::getSalary));
        top.ifPresent(e -> System.out.println("最高薪: " + e.getName()));

        // 需求 6：工资总和（用 reduce）
        double total = emps.stream()
                .map(Employee::getSalary)
                .reduce(0.0, Double::sum);
        System.out.println("工资总和: " + total);

        // 需求 7：是否有未成年员工（anyMatch 短路）
        boolean hasMinor = emps.stream().anyMatch(e -> e.getAge() < 18);
        System.out.println("是否有未成年: " + hasMinor);
    }
}
```

对比传统 `for` 循环，需求 1 用传统写法需要：新建 List、for 遍历、if 判断、add 收集、再排序——至少 10 行。Stream 一条链 4 行搞定，**意图更清晰**。

---

## 十一、Stream vs 集合 vs 传统 for 循环

| 对比项          | 集合（Collection）     | Stream 流              | 传统 for 循环        |
| --------------- | ---------------------- | ---------------------- | -------------------- |
| **本质**        | 数据容器（存储数据）   | 数据的计算管道         | 控制流语句           |
| **数据存储**    | 存储                   | 不存储（借用数据源）   | 不存储               |
| **迭代方式**    | 外部迭代（Iterator）   | 内部迭代（自动）       | 外部迭代（手动）     |
| **是否可复用**  | 可以反复遍历           | 只能用一次             | 可以反复             |
| **修改数据源**  | 直接改                 | 不改（产生新结果）     | 可直接改             |
| **可读性**      | 中                     | 高（声明式）           | 低（命令式）         |
| **性能**        | -                      | 接近 for，可并行加速   | 一般最快（无封装）   |
| **适用场景**    | 存储管理数据           | 批量计算、过滤、统计   | 简单遍历、需提前 break/continue |

> 💡 **提示：** Stream 不会取代集合（集合负责存，Stream 负责算）。对于**极简单**的遍历，传统 `for` 循环可读性也很好且性能最优；对于**复杂**的过滤、分组、统计，Stream 优势明显。

---

## 十二、注意事项与陷阱

### 1. Stream 只能消费一次

```java
Stream<Integer> s = Stream.of(1, 2, 3);
s.count();
// s.limit(1);  // ❌ IllegalStateException，流已关闭
```

### 2. 没有 `forEach` 也行，但绝不能没有终端操作

中间操作链如果忘记写终端操作，整条链静默无效，不会报错，很难排查。

### 3. 无限流必须 `limit`

`Stream.generate` / `Stream.iterate` 是无限的，不 `limit` 会导致终端操作永不结束。

### 4. 并行流的线程安全

并行流中禁止修改共享可变状态（见第九章）。需要收集结果就用 `collect`。

### 5. `distinct`/`groupingBy`/`toMap` 依赖 `equals`/`hashCode`

自定义对象使用这些操作前，务必重写 `equals` 和 `hashCode`。

### 6. `peek` 不应替代 `forEach`

`peek` 是中间操作、惰性且语义是"偷看"，用它做业务逻辑（如写库、改状态）是**滥用**，且可能因惰性不执行。改状态请用 `map` 或终端 `forEach`。

### 7. `toMap` 重复 key 会抛异常

必须提供合并函数 `Collectors.toMap(k, v, (oldV, newV) -> newV)` 解决冲突。

### 8. 装箱开销

`Stream<Integer>` 处理基本类型会有装箱拆箱开销。大量数值计算优先用 `IntStream`、`LongStream`、`DoubleStream`。

---

## 十三、面试常见问题

### Q1：什么是 Stream？它和 IO 流有什么区别？

**Stream** 是 Java 8 引入的、对集合/数组进行函数式批量操作的 API（`java.util.stream`），处理的是**内存数据的计算**。**IO 流**（`java.io` 的 `InputStream`/`OutputStream`）用于**文件/网络的字节字符输入输出**。二者没有任何关系，只是名字都含"流"。

### Q2：中间操作和终端操作的区别？

| 维度       | 中间操作            | 终端操作            |
| ---------- | ------------------- | ------------------- |
| 返回值     | 返回新的 Stream     | 返回结果或 void     |
| 惰性       | 是（不立即执行）    | 否（触发执行）      |
| 数量       | 可以有多个          | 一条链只能有一个    |
| 典型方法   | filter/map/sorted   | collect/forEach/count|

### Q3：map 和 flatMap 的区别？

`map` 是**一对一**映射，每个元素变成一个新元素；`flatMap` 是**一对多**并**打平**，每个元素变成一个流，再把所有小流合并成一个大流。常用于把 `List<List<T>>` 拍平成 `List<T>`。

### Q4：什么是惰性求值？有什么好处？

中间操作不会立即执行，只有遇到终端操作时整条流水线才被触发。好处是：(1) 性能优化，避免无意义计算；(2) 支持**短路操作**（如 `limit`、`findFirst`、`anyMatch`）——找到足够结果就停止。

### Q5：reduce 怎么用？有初始值和无初始值的区别？

`reduce` 把所有元素反复合并成一个值。**有初始值**的版本一定有返回值（如 `reduce(0, Integer::sum)`）；**无初始值**的版本返回 `Optional`，因为流可能为空，需要用 `orElse` 处理。

### Q6：groupingBy 和 partitioningBy 的区别？

`groupingBy` 按任意分类器分组，key 可以有多个（如按部门分组）；`partitioningBy` 按 `Predicate` 分区，key 固定只有 `true`/`false` 两组。`partitioningBy` 是 `groupingBy` 的特殊情况，性能略优。

### Q7：Optional 解决了什么问题？为什么不要直接 get()？

Optional 优雅地表示"可能为空"的值，**强制调用方处理空的情况**，避免 `NullPointerException`。直接 `get()` 在为空时会抛 `NoSuchElementException`，等于退回了 if-null 的繁琐写法，丢失了 Optional 的优势。推荐用 `map`、`orElse`、`ifPresent` 等链式方法。

### Q8：并行流（parallelStream）的原理和注意事项？

底层用 `ForkJoinPool.commonPool()`，把数据拆分给多个线程并行处理。注意事项：(1) **不要操作共享可变状态**，会丢数据或抛异常，结果用 `collect` 收集；(2) 数据量小或操作简单时不划算，拆分开销 > 收益；(3) 不保证元素顺序；(4) 共享公共线程池，不要在里面做阻塞操作。

### Q9：Stream 能否重复使用？为什么？

不能。一个 Stream 实例只能消费一次，执行完终端操作后流就被消费/关闭了，再次使用抛 `IllegalStateException`。需要重复使用就要从数据源重新创建流。

### Q10：Stream 相比传统 for 循环的性能如何？

对于简单遍历，传统 for 略快（无封装开销）；对于复杂操作，Stream 性能接近且代码更清晰；对于大数据量计算，`parallelStream` 能利用多核加速。性能不是 Stream 的首要目标，**可读性和表达力**才是。

---

## 十四、总结

Stream 是 Java 8 函数式编程在集合领域的集大成者，掌握它能让代码大幅瘦身、可读性飞跃。核心要点回顾：

1. **本质**：对集合/数组的**声明式、函数式**批量计算管道（与 IO 流无关）。
2. **两大特性**：**惰性求值**（中间操作不立即执行）+ **一次性**（只能消费一次）。
3. **操作二分**：**中间操作**（返回 Stream，可多个）vs **终端操作**（触发执行，仅一个）。
4. **中间操作**：`filter` 过滤、`map` 一对一映射、`flatMap` 一对多打平、`sorted` 排序、`distinct` 去重、`limit`/`skip` 截断、`peek` 调试。
5. **终端操作**：`forEach` 遍历、`collect` 收集、`count` 计数、`reduce` 归约、`min`/`max`、`any/all/noneMatch` 匹配、`findFirst/findAny` 查找。
6. **Collectors**：`toList/toSet/toMap`、`groupingBy` 分组、`partitioningBy` 分区、`joining` 拼接、各类统计收集器。
7. **Optional**：优雅处理 null，避免 NPE，优先用链式 `map/orElse/ifPresent` 而非 `get()`。
8. **并行流**：大数据量 + 简单无状态操作才用，**严禁共享可变状态**。

> 💡 **提示：** 记住一条流水线的三段式：**创建 stream（数据源）→ 中间操作（filter/map…）→ 终端操作（collect/forEach…）**。缺终端操作就什么都不执行，这是新手最常踩的坑。
