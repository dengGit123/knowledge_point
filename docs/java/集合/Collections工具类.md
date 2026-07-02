# Collections 工具类详解

> 📖 官方文档：[Collections (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Collections.html)

## 一、概述

**Collections 是一个工具类**，提供对集合进行**排序、查找、打乱、线程安全包装**等静态方法。

> ⚠️ **注意区分：**
> - `Collection`（首字母大写，无 s）：接口，集合的根接口
> - `Collections`（加 s）：工具类，全是静态方法

> 💡 **类比：** `Collections` 之于集合，就像 `Arrays` 之于数组、`Math` 之于数学——一个装满实用静态方法的工具箱。

---

## 二、排序与查找

### 2.1 排序

```java
List<Integer> list = new ArrayList<>(List.of(3, 1, 4, 1, 5, 9));

Collections.sort(list);                      // 升序 [1, 1, 3, 4, 5, 9]
Collections.sort(list, Comparator.reverseOrder());  // 降序

// 对自定义对象排序（传 Comparator）
List<Student> students = ...;
Collections.sort(students, Comparator.comparing(Student::getAge));

// Java 8+ 也可以直接用 List 的 sort 方法（等价）
list.sort(Comparator.naturalOrder());
```

### 2.2 查找（二分查找，必须先排序）

```java
List<Integer> list = new ArrayList<>(List.of(1, 3, 5, 7, 9));
Collections.sort(list);                  // ⚠️ 二分查找前必须先排序

int index = Collections.binarySearch(list, 5);   // 找到 → 返回索引 2
int notFound = Collections.binarySearch(list, 6); // 找不到 → 返回负数
```

> ⚠️ **注意：`binarySearch` 要求列表已排序**，否则结果不对。

### 2.3 其他顺序操作

```java
Collections.reverse(list);        // 反转
Collections.shuffle(list);        // 随机打乱（洗牌）
Collections.swap(list, 0, 1);     // 交换两个位置的元素
Collections.rotate(list, 2);      // 循环移动（正数右移，负数左移）
```

---

## 三、极值

```java
List<Integer> list = List.of(3, 1, 4, 1, 5, 9);

Collections.max(list);                              // 最大值 → 9
Collections.min(list);                              // 最小值 → 1
Collections.max(list, Comparator.comparing(...));   // 按规则取最大
```

---

## 四、统计与查找元素

```java
List<Integer> list = List.of(1, 2, 2, 3, 2);

Collections.frequency(list, 2);        // 元素 2 出现的次数 → 3
Collections.replaceAll(list, 2, 99);   // 把所有 2 替换成 99

Collections.indexOfSubList(list, sub); // 子列表首次出现位置
Collections.disjoint(list1, list2);    // 两个集合是否无交集
```

---

## 五、不可变集合（防止修改）

```java
List<String> list = new ArrayList<>(List.of("a", "b"));
List<String> unmodifiable = Collections.unmodifiableList(list);
unmodifiable.add("c");   // ❌ UnsupportedOperationException

Set<String> set = Collections.unmodifiableSet(new HashSet<>());
Map<String, Integer> map = Collections.unmodifiableMap(new HashMap<>());
```

> 💡 **提示：** Java 9+ 推荐用 `List.of()` / `Set.of()` / `Map.of()` 直接创建不可变集合，更简洁。

---

## 六、线程安全包装（同步集合）

把非线程安全的集合包装成线程安全的：

```java
List<String> list = Collections.synchronizedList(new ArrayList<>());
Set<String> set = Collections.synchronizedSet(new HashSet<>());
Map<String, Integer> map = Collections.synchronizedMap(new HashMap<>());

// 这些包装类给每个方法加了 synchronized，线程安全但性能一般
```

> ⚠️ **注意：** 同步包装类的**迭代器仍然不是线程安全的**，遍历时仍要手动加锁：
>
> ```java
> List<String> syncList = Collections.synchronizedList(new ArrayList<>());
> synchronized (syncList) {   // 遍历时要加锁
>     for (String s : syncList) { ... }
> }
> ```
>
> **多线程优先用 `java.util.concurrent` 包的并发集合**（如 ConcurrentHashMap、CopyOnWriteArrayList），性能更好。

---

## 七、单元素集合与空集合

```java
// 单元素集合（不可变）
Set<String> one = Collections.singleton("only");
List<Integer> oneList = Collections.singletonList(1);
Map<String, Integer> oneMap = Collections.singletonMap("k", 1);

// 空集合（不可变）
List<Object> emptyList = Collections.emptyList();
Set<Object> emptySet = Collections.emptySet();
Map<Object, Object> emptyMap = Collections.emptyMap();

// 用途：方法返回空集合时，返回 emptyList() 比 null 更安全
public List<String> find(String name) {
    if (没找到) return Collections.emptyList();  // ✅ 调用方不用判空
}
```

---

## 八、常用方法速查表

| 方法 | 作用 |
|-----|------|
| `sort(list)` | 排序 |
| `binarySearch(list, key)` | 二分查找 |
| `reverse(list)` | 反转 |
| `shuffle(list)` | 随机打乱 |
| `swap(list, i, j)` | 交换元素 |
| `max(list)` / `min(list)` | 最大/最小值 |
| `frequency(list, obj)` | 元素出现次数 |
| `replaceAll(list, old, new)` | 批量替换 |
| `unmodifiableXxx()` | 包装成不可变 |
| `synchronizedXxx()` | 包装成线程安全 |
| `singletonXxx()` | 单元素集合 |
| `emptyXxx()` | 空集合 |
| `addAll(list, e1, e2, ...)` | 批量添加 |

---

## 九、常见问题

### Q1：Collection 和 Collections 的区别？

```
Collection：接口，集合根接口（List/Set/Queue 的父接口）。
Collections：工具类，提供排序、查找等静态方法。
```

### Q2：Collections.sort() 底层用什么算法？

```
List 的排序：底层是归并排序（TimSort），稳定排序，O(n log n)。
（集合转数组排序后再写回 List）
```

### Q3：synchronizedList 和 CopyOnWriteArrayList 怎么选？

```
synchronizedList：读写都加锁，适合写多读少或一般场景。
CopyOnWriteArrayList：读不加锁，写时复制，适合读多写少。
```

### Q4：Collections.emptyList() 返回的能修改吗？

```
不能，它是不可变集合，add/remove 会抛 UnsupportedOperationException。
好处是：返回它代替 null，调用方不用判空。
```

### Q5：binarySearch 为什么必须先排序？

```
二分查找基于"有序"的前提（每次折半缩小范围）。
没排序的话，结果完全错误。
```

---

## 十、快速参考

### 常用方法

```java
// 排序查找
Collections.sort(list);
Collections.binarySearch(list, key);
Collections.reverse(list);
Collections.shuffle(list);

// 极值统计
Collections.max(list) / min(list)
Collections.frequency(list, obj)

// 包装
Collections.unmodifiableList(list)   // 不可变
Collections.synchronizedList(list)   // 线程安全
Collections.singletonList(obj)       // 单元素
Collections.emptyList()              // 空集合
```

### 一句话总结

```
Collections 是集合的工具类：
  - 排序、查找、打乱、极值、统计
  - 包装成不可变 / 线程安全
  - 创建单元素 / 空集合
注意：Collection 是接口，Collections 是工具类（加 s）。
```

### 现代替代

```
Collections.emptyList()      → List.of()（Java 9+）
Collections.unmodifiableList → List.copyOf()（Java 10+）
Collections.synchronizedList → ConcurrentHashMap / CopyOnWriteArrayList
```
