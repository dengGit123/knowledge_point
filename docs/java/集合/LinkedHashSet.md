# LinkedHashSet 详解

> 📖 官方文档：[LinkedHashSet (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedHashSet.html)

## 一、概述

**LinkedHashSet 是 HashSet 的子类**，在 HashSet 基础上**多维护了一条链表**，用来记录元素的插入顺序。

```
HashSet：          [C, A, B]        存 A,B,C，取出顺序不定
LinkedHashSet：    [A, B, C]        存 A,B,C，取出顺序 = 插入顺序
```

| 特性 | HashSet | LinkedHashSet |
|-----|---------|---------------|
| 不重复 | ✅ | ✅ |
| 顺序 | 无序 | **按插入顺序** |
| 性能 | 略快 | 略慢（维护链表） |
| 内存 | 小 | 略大（链表指针） |

> 💡 **一句话：LinkedHashSet = HashSet 的去重能力 + 按插入顺序遍历。**

---

## 二、底层原理

```
LinkedHashSet 底层是 LinkedHashMap（HashMap 的子类）

LinkedHashMap 在 HashMap 基础上多了一条【双向链表】，
把所有元素按插入顺序串起来：

  哈希表部分（用于快速查找）：
  [0] [1] [2] [3] ...
   │       │
   ▼       ▼
  节点    节点

  链表部分（用于记录顺序）：
  head → A ⇄ B ⇄ C ← tail
        （插入顺序）

遍历时，沿着链表走，就能按插入顺序取出。
```

> 💡 **提示：** LinkedHashSet 的"Linked"指的就是这条维护顺序的双向链表。

---

## 三、基本用法

```java
// 按插入顺序遍历
Set<String> set = new LinkedHashSet<>();
set.add("张三");
set.add("李四");
set.add("王五");
set.add("张三");   // 重复，忽略

// 遍历 → 输出顺序和插入顺序一致
set.forEach(System.out::println);
// 张三
// 李四
// 王五
```

### 对比 HashSet 的顺序

```java
Set<String> hashSet = new HashSet<>();
hashSet.add("张三"); hashSet.add("李四"); hashSet.add("王五");
hashSet.forEach(System.out::println);   // 顺序不定（可能 李四/张三/王五）

Set<String> linkedHashSet = new LinkedHashSet<>();
linkedHashSet.add("张三"); linkedHashSet.add("李四"); linkedHashSet.add("王五");
linkedHashSet.forEach(System.out::println);  // 张三/李四/王五（插入顺序）
```

---

## 四、典型应用场景

### 1. 保持顺序的去重

```java
// 需求：给 List 去重，但要保持原来的顺序
List<String> list = List.of("c", "a", "b", "a", "c");

// ❌ HashSet：顺序乱了
List<String> r1 = new ArrayList<>(new HashSet<>(list));
// 可能是 [a, b, c]，顺序变了

// ✅ LinkedHashSet：保持原顺序
List<String> r2 = new ArrayList<>(new LinkedHashSet<>(list));
// [c, a, b]（保持第一次出现的顺序）
```

### 2. LRU 缓存的雏形

LinkedHashMap（LinkedHashSet 的底层）支持**访问顺序**模式，是 LRU 缓存的基础：

```java
// LinkedHashMap 开启访问顺序（LinkedHashSet 不直接支持，但底层原理一样）
Map<String, Integer> lru = new LinkedHashMap<>(16, 0.75f, true);
//                                                        ↑ accessOrder=true
// 每次访问会把元素移到链表尾部，淘汰时从头（最久未访问）淘汰
```

---

## 五、常见问题

### Q1：LinkedHashSet 和 HashSet 的区别？

```
HashSet：无序，性能略好，内存略省。
LinkedHashSet：按插入顺序遍历（多了条链表维护顺序），性能略低，内存略大。
底层：LinkedHashSet 继承 HashSet，内部用 LinkedHashMap。
```

### Q2：LinkedHashSet 是按插入顺序还是排序？

```
按插入顺序，不是排序（不自动排序）。
要排序用 TreeSet。
```

### Q3：LinkedHashSet 性能比 HashSet 差多少？

```
几乎没差别，查询/增删仍是 O(1)。只是多维护一条链表，常数项略大，
日常完全可以接受。需要顺序时直接用。
```

### Q4：LinkedHashSet 怎么保证顺序的？

```
底层 LinkedHashMap 多了一条双向链表，把元素按插入顺序串起来，
遍历时走链表而非哈希数组，所以顺序稳定。
```

---

## 六、快速参考

### 核心特性

```
底层：LinkedHashMap（HashMap + 双向链表）
不重复 + 按插入顺序遍历
性能接近 HashSet（O(1)）
内存比 HashSet 略大
非线程安全
```

### 三种 Set 选择

```
HashSet         → 不重复、不要顺序（首选）
LinkedHashSet   → 不重复、要插入顺序
TreeSet         → 不重复、要排序
```

### 典型用法

```java
// 保持顺序去重
List<X> dedup = new ArrayList<>(new LinkedHashSet<>(originList));
```
