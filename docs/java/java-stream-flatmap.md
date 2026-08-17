# Java Stream flatMap 用法

## 一、概述

`flatMap` 是 Java Stream API 中一个重要的**中间操作**，用于将每个元素转换成流，然后将所有流连接成一个扁平的流。简单来说，就是"将嵌套的结构展平"。

> 📖 [Oracle 官方文档 - Stream 接口](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html)

## 二、基本概念

### 2.1 为什么需要 flatMap

当我们有一个流，其中每个元素本身也是一个集合或流，想要获取所有内部集合中的元素时，就需要 `flatMap`。

例如：
- 有一个包含多个列表的列表，想把所有列表的元素合并成一个流
- 有一个包含多个字符串的流，想把每个字符串拆分成字符流
- 有一个包含多个对象的流，每个对象有一个列表字段，想把所有列表元素提取出来

### 2.2 工作原理

`flatMap` 的工作过程：

```
流 A: [List1, List2, List3]
         ↓ flatMap (每个 List 转成 Stream)
         ↓
中间态: [Stream1, Stream2, Stream3]
         ↓ 扁平化（连接所有流）
         ↓
结果流: [List1元素, List2元素, List3元素]
```

与 `map` 的区别：

| 方法 | 输入 → 输出 | 结果结构 |
| --- | --- | --- |
| `map` | 元素 → 另一个元素 | 一对一，结构不变 |
| `flatMap` | 元素 → Stream | 多对一，结构被展平 |

## 三、详细用法

### 3.1 基本用法

#### 示例 1：将嵌套列表展平

```java
import java.util.*;
import java.util.stream.*;

List<List<Integer>> nestedLists = Arrays.asList(
    Arrays.asList(1, 2),
    Arrays.asList(3, 4, 5),
    Arrays.asList(6)
);

// 使用 flatMap 展平
List<Integer> flattened = nestedLists.stream()
    .flatMap(List::stream) // 将每个 List 转换成 Stream
    .collect(Collectors.toList());

System.out.println(flattened); // [1, 2, 3, 4, 5, 6]
```

#### 示例 2：将字符串拆分成字符

```java
List<String> words = Arrays.asList("Hello", "World");

List<String> characters = words.stream()
    .flatMap(word -> word.chars().mapToObj(c -> String.valueOf((char) c)))
    .collect(Collectors.toList());

System.out.println(characters); // [H, e, l, l, o, W, o, r, l, d]
```

### 3.2 进阶用法

#### 示例 3：提取对象中的嵌套集合

```java
class User {
    String name;
    List<String> emails;

    User(String name, List<String> emails) {
        this.name = name;
        this.emails = emails;
    }

    List<String> getEmails() {
        return emails;
    }
}

List<User> users = Arrays.asList(
    new User("Alice", Arrays.asList("alice@example.com", "alice.work@example.com")),
    new User("Bob", Arrays.asList("bob@example.com")),
    new User("Charlie", Arrays.asList("charlie@example.com", "charlie.home@example.com", "charlie.work@example.com"))
);

// 提取所有用户的邮箱
List<String> allEmails = users.stream()
    .flatMap(user -> user.getEmails().stream())
    .collect(Collectors.toList());

System.out.println(allEmails);
// [alice@example.com, alice.work@example.com, bob@example.com, charlie@example.com, charlie.home@example.com, charlie.work@example.com]
```

#### 示例 4：处理可选值（Optional）

```java
List<Optional<String>> optionals = Arrays.asList(
    Optional.of("A"),
    Optional.empty(),
    Optional.of("B"),
    Optional.empty(),
    Optional.of("C")
);

// 过滤掉空的 Optional 并获取值
List<String> values = optionals.stream()
    .flatMap(Optional::stream) // Java 9+ 方法
    .collect(Collectors.toList());

System.out.println(values); // [A, B, C]
```

#### 示例 5：一对多转换

```java
class Order {
    String id;
    List<String> items;

    Order(String id, List<String> items) {
        this.id = id;
        this.items = items;
    }

    List<String> getItems() {
        return items;
    }
}

List<Order> orders = Arrays.asList(
    new Order("O1", Arrays.asList("苹果", "香蕉")),
    new Order("O2", Arrays.asList("橙子")),
    new Order("O3", Arrays.asList("葡萄", "西瓜", "草莓"))
);

// 获取所有订单中的商品，去重后统计数量
long distinctItemsCount = orders.stream()
    .flatMap(order -> order.getItems().stream())
    .distinct()
    .count();

System.out.println(distinctItemsCount); // 5
```

### 3.3 完整 API 参考

`flatMap` 方法签名：

```java
<R> Stream<R> flatMap(Function<? super T, ? extends Stream<? extends R>> mapper)
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `mapper` | `Function<? super T, ? extends Stream<? extends R>>` | 将每个元素转换成流的函数 |
| 返回值 | `Stream<R>` | 包含所有扁平化后元素的新流 |

> 💡 **提示：** `mapper` 函数返回的是 `Stream`，而不是单个元素。这是 `flatMap` 和 `map` 的核心区别。

## 四、实际应用场景

### 场景 1：嵌套数据结构展平

从数据库查询到的结果可能是嵌套的结构，用 `flatMap` 可以方便地展平：

```java
// 模拟从数据库获取的数据
class Department {
    String name;
    List<Employee> employees;

    Department(String name, List<Employee> employees) {
        this.name = name;
        this.employees = employees;
    }

    List<Employee> getEmployees() {
        return employees;
    }
}

class Employee {
    String name;

    Employee(String name) {
        this.name = name;
    }

    String getName() {
        return name;
    }
}

List<Department> departments = Arrays.asList(
    new Department("技术部", Arrays.asList(
        new Employee("张三"),
        new Employee("李四")
    )),
    new Department("市场部", Arrays.asList(
        new Employee("王五"),
        new Employee("赵六"),
        new Employee("孙七")
    ))
);

// 获取所有部门的所有员工姓名
List<String> allEmployeeNames = departments.stream()
    .flatMap(dept -> dept.getEmployees().stream())
    .map(Employee::getName)
    .collect(Collectors.toList());

System.out.println(allEmployeeNames); // [张三, 李四, 王五, 赵六, 孙七]
```

### 场景 2：字符串处理

将多行文本中的每个单词提取出来：

```java
String multiLineText = "Hello World\nJava Stream\nflatMap Example";

List<String> words = multiLineText.lines() // Java 11+ 方法，按行分割
    .flatMap(line -> Arrays.stream(line.split(" ")))
    .collect(Collectors.toList());

System.out.println(words); // [Hello, World, Java, Stream, flatMap, Example]
```

### 场景 3：组合多个数据源

从多个不同的集合中查找满足条件的数据：

```java
List<List<Integer>> dataSources = Arrays.asList(
    Arrays.asList(1, 2, 3),
    Arrays.asList(4, 5, 6),
    Arrays.asList(7, 8, 9)
);

// 从所有数据源中找出偶数
List<Integer> evenNumbers = dataSources.stream()
    .flatMap(List::stream)
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());

System.out.println(evenNumbers); // [2, 4, 6, 8]
```

### 场景 4：构建笛卡尔积

```java
List<String> colors = Arrays.asList("红", "蓝", "绿");
List<String> sizes = Arrays.asList("S", "M", "L");

// 构建颜色和尺寸的所有组合
List<String> combinations = colors.stream()
    .flatMap(color -> sizes.stream()
        .map(size -> color + size))
    .collect(Collectors.toList());

System.out.println(combinations);
// [红S, 红M, 红L, 蓝S, 蓝M, 蓝L, 绿S, 绿M, 绿L]
```

### 场景 5：处理可能包含空值的集合

从可能包含 `null` 值的集合中提取有效数据：

```java
// 一个包含 null 的列表集合
List<List<Integer>> listsWithNulls = Arrays.asList(
    Arrays.asList(1, 2),
    null,
    Arrays.asList(3, 4),
    null,
    Arrays.asList(5)
);

// 使用 flatMap 安全地过滤掉 null 并展平
List<Integer> flattened = listsWithNulls.stream()
    .flatMap(list -> list == null ? Stream.empty() : list.stream())
    .collect(Collectors.toList());

System.out.println(flattened); // [1, 2, 3, 4, 5]
```

## 五、常见问题与注意事项

### 5.1 返回空流 vs 返回 null

> ⚠️ **注意：** `mapper` 函数应该返回一个流，而不是 `null`。返回 `null` 会导致 `NullPointerException`。

```java
// ❌ 错误：可能返回 null
List<Integer> result = lists.stream()
    .flatMap(list -> list == null ? null : list.stream())
    .collect(Collectors.toList());

// ✅ 正确：返回空流
List<Integer> result = lists.stream()
    .flatMap(list -> list == null ? Stream.empty() : list.stream())
    .collect(Collectors.toList());
```

### 5.2 与 map 的区别混淆

初学者容易混淆 `map` 和 `flatMap`：

```java
List<List<Integer>> lists = Arrays.asList(
    Arrays.asList(1, 2),
    Arrays.asList(3, 4)
);

// 使用 map：结果是 Stream<Stream<Integer>>，不是展平的
Stream<Stream<Integer>> mappedStream = lists.stream()
    .map(list -> list.stream()); // ❌ 得到嵌套的流

// 使用 flatMap：结果是 Stream<Integer>，被展平
Stream<Integer> flattenedStream = lists.stream()
    .flatMap(list -> list.stream()); // ✅ 得到展平的流

// 验证类型
System.out.println(flattenedStream.collect(Collectors.toList())); // [1, 2, 3, 4]
```

### 5.3 性能考虑

`flatMap` 会创建多个流对象并进行合并，对于大数据集可能有一定性能开销。如果数据量非常大，考虑使用更高效的方式：

```java
// 对于简单场景，可能直接操作更高效
List<String> allItems = new ArrayList<>();
for (Order order : orders) {
    allItems.addAll(order.getItems());
}
```

### 5.4 保持顺序

`flatMap` 会保持元素的相对顺序（在顺序流中）：

```java
List<List<Integer>> lists = Arrays.asList(
    Arrays.asList(1, 2),
    Arrays.asList(3),
    Arrays.asList(4, 5)
);

List<Integer> result = lists.stream()
    .flatMap(List::stream)
    .collect(Collectors.toList());

System.out.println(result); // [1, 2, 3, 4, 5] - 顺序保持不变
```

### 5.5 并行流中的注意事项

在并行流中使用 `flatMap` 时，元素顺序可能不确定：

```java
List<Integer> result = lists.parallelStream()
    .flatMap(List::stream)
    .collect(Collectors.toList()); // 顺序可能不保证

// 如果需要保持顺序
List<Integer> orderedResult = lists.parallelStream()
    .flatMap(List::stream)
    .collect(Collectors.toList()); // 仍然保持顺序（toList 会保持相遇顺序）
```

## 六、与相关概念对比

### 6.1 flatMap vs map

| 特性 | `map` | `flatMap` |
| --- | --- | --- |
| 转换类型 | 元素 → 元素 | 元素 → Stream |
| 结果数量 | 一对一 | 一对多 |
| 结构变化 | 结构层级不变 | 结构层级减一 |
| 适用场景 | 简单转换 | 展平嵌套结构 |

代码对比：

```java
List<String> words = Arrays.asList("hello", "world");

// map：每个字符串转换成字符串数组
Stream<String[]> mapped = words.stream()
    .map(word -> word.split("")); // Stream<String[]>

// flatMap：每个字符串转换成字符流，然后展平
Stream<String> flattened = words.stream()
    .flatMap(word -> Arrays.stream(word.split(""))); // Stream<String>
```

### 6.2 flatMap vs flatMapToInt / flatMapToLong / flatMapToDouble

Stream API 提供了专门处理原始类型的 `flatMap` 变体，避免自动装箱：

```java
List<String> numberStrings = Arrays.asList("1", "2", "3", "4", "5");

// flatMap + mapToInt：需要两次操作
int sum1 = numberStrings.stream()
    .flatMap(s -> Stream.of(s))
    .mapToInt(Integer::parseInt)
    .sum();

// flatMapToInt：一次操作完成
int sum2 = numberStrings.stream()
    .flatMapToInt(s -> IntStream.of(Integer.parseInt(s)))
    .sum();
```

| 方法 | 返回类型 | 适用场景 |
| --- | --- | --- |
| `flatMap` | `Stream<R>` | 处理对象类型 |
| `flatMapToInt` | `IntStream` | 处理 int，避免装箱 |
| `flatMapToLong` | `LongStream` | 处理 long，避免装箱 |
| `flatMapToDouble` | `DoubleStream` | 处理 double，避免装箱 |

## 七、总结

`flatMap` 是 Stream API 中处理嵌套数据结构的强大工具：

**核心要点：**

- **展平嵌套结构**：将流中的每个元素（本身是一个集合/流）转换成流并合并
- **一对多转换**：实现一个输入对应多个输出的转换
- **保持顺序**：在顺序流中保持元素的相对顺序
- **灵活应用**：可与 `filter`、`map` 等其他操作组合使用

**最佳实践：**

1. 需要展平嵌套数据结构时，优先使用 `flatMap`
2. `mapper` 函数返回流而非 `null`
3. 注意与 `map` 的区别，选择正确的方法
4. 处理原始类型时使用 `flatMapToInt` 等变体提高性能
5. 在并行流中注意顺序问题

掌握 `flatMap` 能让你更优雅地处理复杂的嵌套数据结构，是 Stream 编程中的必备技能。