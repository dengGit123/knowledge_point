### 一、概述

`flatMap` 是 Java Stream API 中一个**非常重要且容易混淆**的操作符。它用于将流中的每个元素转换成一个流，然后将这些流"扁平化"成一个单一的流。

> 📖 [Oracle Java 8 Stream API 文档](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html#flatMap-java.util.function.Function-)

简单来说，当你有一个**嵌套结构**（如集合的集合、嵌套数组），想要将其"拍平"成一维结构时，就需要用到 `flatMap`。

### 二、核心原理

#### Stream 处理流程对比

先看看 `map` 和 `flatMap` 的区别：

```
【map 的行为】
输入: [1, 2, 3]
  ↓ map(x -> [x, x+1])
输出: [[1,2], [2,3], [3,4]]  // 依然是嵌套结构

【flatMap 的行为】
输入: [1, 2, 3]
  ↓ flatMap(x -> Stream.of(x, x+1))
输出: [1, 2, 2, 3, 3, 4]      // 被扁平化成一维流
```

#### 工作原理

`flatMap` 的核心步骤：

1. **转换**：对流中每个元素应用转换函数，得到一个新的流（`Stream<T>`）
2. **合并**：将所有这些新生成的流合并成一个流
3. **返回**：返回合并后的流，供后续操作使用

用代码表示：

```java
// 假设有一个 List<List<Integer>>
List<List<Integer>> nested = List.of(
    List.of(1, 2),
    List.of(3, 4)
);

// 使用 flatMap 扁平化
List<Integer> flattened = nested.stream()
    .flatMap(list -> list.stream())  // 每个子列表转为流，然后合并
    .collect(Collectors.toList());
    // 结果: [1, 2, 3, 4]
```

> 💡 **类比记忆**：想象你有一个**装满盒子的大箱子**，每个盒子里装着苹果。`map` 会返回"每个盒子"本身，而 `flatMap` 会把所有盒子里的苹果都倒进一个新的大篮子里。

### 三、详细用法

#### 1. 基本用法

**场景：扁平化集合的集合**

```java
import java.util.*;
import java.util.stream.*;

class Student {
    private String name;
    private List<String> courses;

    public Student(String name, List<String> courses) {
        this.name = name;
        this.courses = courses;
    }

    public List<String> getCourses() {
        return courses;
    }
}

public class FlatMapBasic {
    public static void main(String[] args) {
        // 创建学生列表，每个学生有多个课程
        List<Student> students = Arrays.asList(
            new Student("张三", Arrays.asList("数学", "英语")),
            new Student("李四", Arrays.asList("物理", "化学")),
            new Student("王五", Arrays.asList("生物", "历史"))
        );

        // ❌ 使用 map 得到嵌套结构
        List<List<String>> nestedCourses = students.stream()
            .map(Student::getCourses)
            .collect(Collectors.toList());
        // 结果: [[数学, 英语], [物理, 化学], [生物, 历史]]

        // ✅ 使用 flatMap 扁平化所有课程
        List<String> allCourses = students.stream()
            .flatMap(student -> student.getCourses().stream())
            .collect(Collectors.toList());
        // 结果: [数学, 英语, 物理, 化学, 生物, 历史]

        System.out.println("所有课程: " + allCourses);
    }
}
```

**场景：扁平化数组**

```java
import java.util.stream.*;

public class FlatMapArray {
    public static void main(String[] args) {
        // 二维数组
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };

        // 将二维数组扁平化为一维流
        IntStream flatStream = Arrays.stream(matrix)
            .flatMapToInt(row -> Arrays.stream(row));

        // 转换为 List
        int[] result = flatStream.toArray();
        // 结果: [1, 2, 3, 4, 5, 6, 7, 8, 9]

        System.out.println("扁平化结果: " + Arrays.toString(result));
    }
}
```

#### 2. 进阶用法

**场景：多对一关系的展开**

```java
import java.util.*;
import java.util.stream.*;

class Order {
    private String orderId;
    private List<OrderItem> items;

    public Order(String orderId, List<OrderItem> items) {
        this.orderId = orderId;
        this.items = items;
    }

    public List<OrderItem> getItems() {
        return items;
    }
}

class OrderItem {
    private String productId;
    private int quantity;
    private double price;

    public OrderItem(String productId, int quantity, double price) {
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }

    public double getTotalPrice() {
        return quantity * price;
    }

    public String getProductId() {
        return productId;
    }
}

public class FlatMapAdvanced {
    public static void main(String[] args) {
        List<Order> orders = Arrays.asList(
            new Order("O001", Arrays.asList(
                new OrderItem("P001", 2, 10.0),
                new OrderItem("P002", 1, 20.0)
            )),
            new Order("O002", Arrays.asList(
                new OrderItem("P001", 3, 10.0),
                new OrderItem("P003", 2, 15.0)
            ))
        );

        // 计算所有订单项的总金额
        double totalAmount = orders.stream()
            .flatMap(order -> order.getItems().stream())  // 展开所有订单项
            .mapToDouble(OrderItem::getTotalPrice)
            .sum();

        System.out.println("总金额: " + totalAmount);  // 100.0

        // 找出出现最多的商品
        Map<String, Long> productCount = orders.stream()
            .flatMap(order -> order.getItems().stream())
            .collect(Collectors.groupingBy(
                OrderItem::getProductId,
                Collectors.counting()
            ));

        System.out.println("商品出现次数: " + productCount);
        // {P001=2, P003=1, P002=1}
    }
}
```

**场景：Optional 的嵌套处理**

```java
import java.util.*;
import java.util.stream.*;

class User {
    private Optional<Address> address;

    public User(Optional<Address> address) {
        this.address = address;
    }

    public Optional<Address> getAddress() {
        return address;
    }
}

class Address {
    private Optional<String> city;

    public Address(Optional<String> city) {
        this.city = city;
    }

    public Optional<String> getCity() {
        return city;
    }
}

public class FlatMapOptional {
    public static void main(String[] args) {
        User user = new User(Optional.of(
            new Address(Optional.of("北京"))
        ));

        // ❌ 不好的写法：多层嵌套的 isPresent 检查
        String cityName1 = null;
        if (user.getAddress().isPresent()) {
            Address address = user.getAddress().get();
            if (address.getCity().isPresent()) {
                cityName1 = address.getCity().get();
            }
        }

        // ✅ 使用 flatMap 优雅地处理嵌套 Optional
        String cityName2 = user.getAddress()
            .flatMap(Address::getCity)
            .orElse("未知城市");

        System.out.println("城市名: " + cityName2);  // 北京

        // 对列表中的 User 使用 flatMap
        List<User> users = Arrays.asList(
            new User(Optional.of(new Address(Optional.of("上海")))),
            new User(Optional.of(new Address(Optional.empty()))),
            new User(Optional.empty())
        );

        List<String> cities = users.stream()
            .flatMap(user -> user.getAddress()
                .flatMap(Address::getCity)
                .map(Stream::of)  // 转换为 Stream<Optional<String>>
                .orElseGet(Stream::empty)  // Optional 为空时返回空流
            )
            .collect(Collectors.toList());

        System.out.println("城市列表: " + cities);  // [上海]
    }
}
```

#### 3. 完整 API 参考

| 方法名 | 参数类型 | 返回类型 | 说明 |
|--------|----------|----------|------|
| `flatMap` | `` `Function<T, Stream<R>>` `` | `` `Stream<R>` `` | 将元素转换为流并扁平化 |
| `flatMapToInt` | `` `Function<T, IntStream>` `` | `` `IntStream` `` | 转换为 int 流并扁平化 |
| `flatMapToLong` | `` `Function<T, LongStream>` `` | `` `LongStream` `` | 转换为 long 流并扁平化 |
| `flatMapToDouble` | `` `Function<T, DoubleStream>` `` | `` `DoubleStream` `` | 转换为 double 流并扁平化 |

### 四、实际应用场景

#### 场景 1：批量处理文件内容

```java
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.*;

public class FileProcessing {
    public static void main(String[] args) throws IOException {
        // 假设有多个文件，需要读取所有文件的行
        Path dir = Paths.get("/path/to/files");
        List<String> allLines = Files.list(dir)
            .flatMap(file -> {
                try {
                    return Files.lines(file);
                } catch (IOException e) {
                    return Stream.empty();  // 读取失败时返回空流
                }
            })
            .collect(Collectors.toList());

        System.out.println("总行数: " + allLines.size());
    }
}
```

#### 场景 2：组合多个查询结果

```java
import java.util.*;
import java.util.stream.*;

public class DataQuery {
    public static void main(String[] args) {
        // 模拟从不同数据源查询用户
        List<String> dbUsers = Arrays.asList("user1", "user2");
        List<String> cacheUsers = Arrays.asList("user2", "user3");
        List<String> remoteUsers = Arrays.asList("user3", "user4");

        // 合并所有数据源的用户，去重
        Set<String> allUsers = Stream.of(dbUsers, cacheUsers, remoteUsers)
            .flatMap(List::stream)
            .collect(Collectors.toSet());

        System.out.println("所有用户: " + allUsers);
        // [user1, user2, user3, user4]
    }
}
```

#### 场景 3：树形结构的遍历

```java
import java.util.*;
import java.util.stream.*;

class TreeNode {
    private String value;
    private List<TreeNode> children;

    public TreeNode(String value, List<TreeNode> children) {
        this.value = value;
        this.children = children;
    }

    public List<TreeNode> getChildren() {
        return children != null ? children : Collections.emptyList();
    }
}

public class TreeTraversal {
    public static void main(String[] args) {
        // 构建树形结构
        TreeNode root = new TreeNode("A", Arrays.asList(
            new TreeNode("B", Arrays.asList(
                new TreeNode("D", Collections.emptyList()),
                new TreeNode("E", Collections.emptyList())
            )),
            new TreeNode("C", Arrays.asList(
                new TreeNode("F", Collections.emptyList())
            ))
        ));

        // 广度优先遍历（BFS）获取所有节点值
        List<String> bfsResult = bfs(root);
        System.out.println("BFS 结果: " + bfsResult);
        // [A, B, C, D, E, F]

        // 深度优先遍历（DFS）获取所有节点值
        List<String> dfsResult = dfs(root);
        System.out.println("DFS 结果: " + dfsResult);
        // [A, B, D, E, C, F]
    }

    // 使用 flatMap 实现 BFS
    private static List<String> bfs(TreeNode root) {
        List<TreeNode> currentLevel = Collections.singletonList(root);
        List<String> result = new ArrayList<>();

        while (!currentLevel.isEmpty()) {
            // 收集当前层级的值
            currentLevel.forEach(node -> result.add(node.value));

            // 使用 flatMap 获取下一层级
            currentLevel = currentLevel.stream()
                .flatMap(node -> node.getChildren().stream())
                .collect(Collectors.toList());
        }

        return result;
    }

    // 使用 flatMap 实现 DFS
    private static List<String> dfs(TreeNode root) {
        List<String> result = new ArrayList<>();
        dfsHelper(root, result);
        return result;
    }

    private static void dfsHelper(TreeNode node, List<String> result) {
        result.add(node.value);
        node.getChildren().forEach(child -> dfsHelper(child, result));
    }
}
```

#### 场景 4：字符串拆分与扁平化

```java
import java.util.*;
import java.util.stream.*;

public class StringProcessing {
    public static void main(String[] args) {
        // 多行文本，每行用逗号分隔
        List<String> lines = Arrays.asList(
            "apple,banana,cherry",
            "date,elderberry",
            "fig,grape,honeydew"
        );

        // 拆分所有行的所有单词
        List<String> words = lines.stream()
            .flatMap(line -> Arrays.stream(line.split(",")))
            .collect(Collectors.toList());

        System.out.println("所有单词: " + words);
        // [apple, banana, cherry, date, elderberry, fig, grape, honeydew]

        // 去重并排序
        List<String> uniqueSortedWords = lines.stream()
            .flatMap(line -> Arrays.stream(line.split(",")))
            .distinct()
            .sorted()
            .collect(Collectors.toList());

        System.out.println("去重排序后: " + uniqueSortedWords);
        // [apple, banana, cherry, date, elderberry, fig, grape, honeydew]
    }
}
```

#### 场景 5：组合多个任务的执行结果

```java
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

public class TaskExecution {
    public static void main(String[] args) throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(3);

        List<Callable<List<Integer>>> tasks = Arrays.asList(
            () -> Arrays.asList(1, 2, 3),
            () -> Arrays.asList(4, 5),
            () -> Arrays.asList(6, 7, 8, 9)
        );

        // 提交所有任务并扁平化结果
        List<Integer> allResults = executor.invokeAll(tasks).stream()
            .flatMap(future -> {
                try {
                    return future.get().stream();
                } catch (Exception e) {
                    return Stream.empty();  // 任务失败时返回空流
                }
            })
            .collect(Collectors.toList());

        System.out.println("所有结果: " + allResults);
        // [1, 2, 3, 4, 5, 6, 7, 8, 9]

        executor.shutdown();
    }
}
```

### 五、常见问题与注意事项

#### 1. map vs flatMap 的选择

```java
// ❌ 错误：应该用 flatMap 却用了 map
List<List<Integer>> wrongResult = lists.stream()
    .map(list -> list.stream())  // 得到 Stream<Stream<Integer>>
    .collect(Collectors.toList());  // List<Stream<Integer>>，不是我们想要的

// ✅ 正确：使用 flatMap
List<Integer> correctResult = lists.stream()
    .flatMap(list -> list.stream())  // 得到 Stream<Integer>
    .collect(Collectors.toList());  // List<Integer>
```

> 💡 **判断标准**：如果你的转换函数返回的是一个"集合"或"流"，那应该用 `flatMap`；如果返回的是单个值，用 `map`。

#### 2. 空值处理

```java
// ⚠️ 注意：flatMap 不会自动过滤 null 元素
List<List<Integer>> lists = Arrays.asList(
    Arrays.asList(1, 2),
    null,  // 包含 null
    Arrays.asList(3, 4)
);

List<Integer> result = lists.stream()
    .flatMap(list -> {
        if (list == null) {
            return Stream.empty();  // 必须显式处理 null
        }
        return list.stream();
    })
    .collect(Collectors.toList());
// 结果: [1, 2, 3, 4]
```

#### 3. 性能考虑

```java
// ⚠️ 注意：在 flatMap 中执行耗时的 I/O 操作可能导致性能问题
List<Path> files = getFiles();  // 假设有 1000 个文件

// 不好的写法：可能创建 1000 个并行的 I/O 操作
List<String> allLines = files.stream()
    .parallel()  // ❌ 并行 + I/O = 性能灾难
    .flatMap(file -> {
        try {
            return Files.lines(file);  // 每个文件都打开读取
        } catch (IOException e) {
            return Stream.empty();
        }
    })
    .collect(Collectors.toList());

// 好的写法：顺序处理或控制并发
List<String> allLinesBetter = files.stream()
    .flatMap(file -> {
        try {
            return Files.lines(file);
        } catch (IOException e) {
            return Stream.empty();
        }
    })
    .collect(Collectors.toList());
```

> ⚠️ **注意**：`flatMap` 本身是懒执行的，但不要在 lambda 中进行重 I/O 操作，特别是配合 `parallel()` 使用时。

#### 4. 与 Optional 配合使用

```java
// ✅ 优雅处理可能为空的嵌套结构
List<Optional<String>> optionals = Arrays.asList(
    Optional.of("A"),
    Optional.empty(),
    Optional.of("B")
);

List<String> nonEmptyValues = optionals.stream()
    .flatMap(Optional::stream)  // Java 9+：Optional.stream()
    .collect(Collectors.toList());
// 结果: [A, B]

// Java 8 兼容写法
List<String> nonEmptyValuesJava8 = optionals.stream()
    .flatMap(opt -> opt.map(Stream::of).orElseGet(Stream::empty))
    .collect(Collectors.toList());
```

#### 5. 类型转换

```java
// 使用 flatMap 进行类型转换和过滤
List<Object> mixedList = Arrays.asList(
    "hello", 123, "world", 45.6, "java"
);

// 只保留字符串，并转换为大写
List<String> strings = mixedList.stream()
    .flatMap(obj -> {
        if (obj instanceof String) {
            return Stream.of(((String) obj).toUpperCase());
        }
        return Stream.empty();  // 非字符串元素被过滤掉
    })
    .collect(Collectors.toList());
// 结果: [HELLO, WORLD, JAVA]
```

### 六、与相关概念对比

#### map vs flatMap

| 特性 | `map` | `flatMap` |
|------|-------|-----------|
| 转换结果 | 1 对 1（一个元素 → 一个元素） | 1 对 N（一个元素 → 多个元素） |
| 返回类型 | `` `Stream<R>` `` | `` `Stream<R>` ``（内部处理了流合并） |
| 嵌套结构 | 保留嵌套 | 扁平化 |
| 典型场景 | 转换每个元素的值 | 展开嵌套集合、处理 1:N 关系 |

```java
// 对比示例
List<String> words = Arrays.asList("hello", "world");

// map: 1 对 1
List<String[]> mapResult = words.stream()
    .map(word -> word.split(""))  // 每个单词拆成字符数组
    .collect(Collectors.toList());
// [[h, e, l, l, o], [w, o, r, l, d]]

// flatMap: 1 对 N
List<String> flatMapResult = words.stream()
    .flatMap(word -> Arrays.stream(word.split("")))  // 拆成字符并扁平化
    .collect(Collectors.toList());
// [h, e, l, l, o, w, o, r, l, d]
```

#### Stream.concat vs flatMap

| 特性 | `` `Stream.concat` `` | `flatMap` |
|------|-----------------|-----------|
| 用途 | 连接两个流 | 将元素转换为流并合并 |
| 适用数量 | 适合固定数量的流 | 适合动态数量的流 |
| 语法 | `` `Stream.concat(a, b)` `` | `stream.flatMap(...)` |

```java
// concat 适合连接固定的两个流
Stream<String> stream1 = Stream.of("a", "b");
Stream<String> stream2 = Stream.of("c", "d");
Stream<String> concat = Stream.concat(stream1, stream2);
// [a, b, c, d]

// flatMap 适合处理动态数量的流
List<Stream<String>> streams = Arrays.asList(
    Stream.of("a", "b"),
    Stream.of("c", "d"),
    Stream.of("e", "f")
);

Stream<String> flatMerged = streams.stream()
    .flatMap(Function.identity());
// [a, b, c, d, e, f]
```

### 七、总结

`flatMap` 是处理嵌套数据结构的利器，掌握它能让你的流式处理代码更简洁、更优雅。

**核心要点**：

1. **用途**：将嵌套的流/集合结构"拍平"成一维流
2. **与 map 的区别**：`map` 是 1 对 1 转换，`flatMap` 是 1 对 N 转换并合并
3. **常见场景**：
   - 扁平化集合的集合
   - 处理多对一关系（如用户-订单）
   - 嵌套 Optional 的处理
   - 树形结构的遍历
   - 多数据源的合并

**记忆口诀**：**"想拍平，用 flatMap"** —— 当你看到嵌套结构想要展开时，第一反应应该是 flatMap。

---

> 📖 **参考资料**
> - [Oracle Java 8 Stream API 文档](https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html)
> - [Java 8 in Action (书籍)](https://www.manning.com/books/java-8-in-action)