# LinkedHashMap 详解

> 📖 官方文档：[LinkedHashMap (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedHashMap.html)

## 一、概述

**LinkedHashMap 是 HashMap 的子类**，在 HashMap 基础上多维护了一条**双向链表**，用来记录元素的顺序。

```
HashMap：       {B=2, A=1, C=3}        无序
LinkedHashMap： {A=1, B=2, C=3}        按插入顺序（或访问顺序）
```

| 特性 | HashMap | LinkedHashMap |
|-----|---------|---------------|
| 顺序 | 无序 | **插入顺序 / 访问顺序** |
| 性能 | 略快 | 略慢（维护链表） |
| 内存 | 小 | 略大（链表指针） |
| 底层 | 数组+链表+红黑树 | 同 + 双向链表 |

> 💡 **一句话：LinkedHashMap = HashMap + 顺序。** 是实现 LRU 缓存的基础。

---

## 二、底层原理

```
LinkedHashMap 在 HashMap 基础上，每个 Entry 多了 before、after 两个指针，
把所有键值对按顺序串成一条双向链表：

  哈希表部分（快速查找）：
  [0] [1] [2] [3] ...
       │
       ▼
     Entry

  链表部分（记录顺序）：
  head ⇄ A ⇄ B ⇄ C ⇄ tail
        （插入顺序）

遍历时沿链表走，顺序稳定。
```

---

## 三、两种顺序模式

LinkedHashMap 有两种顺序模式，由构造参数 `accessOrder` 控制：

### 1. 插入顺序（默认）

```java
// 默认 accessOrder = false，按插入顺序
LinkedHashMap<String, Integer> map = new LinkedHashMap<>();
map.put("A", 1); map.put("B", 2); map.put("C", 3);

map.get("A");   // 访问 A，不影响顺序

// 遍历：A → B → C（插入顺序不变）
```

### 2. 访问顺序（LRU 基础）

```java
// accessOrder = true，按访问顺序
LinkedHashMap<String, Integer> map = new LinkedHashMap<>(16, 0.75f, true);
//                                                          ↑ accessOrder=true
map.put("A", 1); map.put("B", 2); map.put("C", 3);

map.get("A");   // 访问 A，A 被移到链表末尾

// 遍历：B → C → A（最近访问的在后面）
```

> 💡 **提示：访问顺序模式下，每次 get/put 一个元素，它都会被移到链表尾部。** 这样链表头部就是"最久没访问的"，尾部是"最近访问的"——这正是 **LRU（最近最少使用）缓存**的原理。

---

## 四、实现 LRU 缓存（经典应用）

利用 LinkedHashMap 的访问顺序 + 重写 `removeEldestEntry`，可以轻松实现 LRU 缓存：

```java
// 一个最多存 3 个元素的 LRU 缓存
public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);   // accessOrder = true
        this.capacity = capacity;
    }

    // 当元素超过容量时，是否删除最老的（链表头部 = 最久未访问）
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;   // 超过容量就淘汰头部
    }
}
```

```java
LRUCache<String, Integer> cache = new LRUCache<>(3);
cache.put("A", 1);
cache.put("B", 2);
cache.put("C", 3);
cache.get("A");        // 访问 A
cache.put("D", 4);     // 超过 3 个，淘汰最久未访问的 B

// 缓存中剩下：C, A, D（B 被淘汰）
```

> 💡 **提示：** 这是面试经典题"实现 LRU 缓存"的标准答案。LinkedHashMap 帮你做了大部分工作。

---

## 五、基本用法

```java
LinkedHashMap<String, Integer> map = new LinkedHashMap<>();

map.put("张三", 20);
map.put("李四", 25);
map.put("王五", 30);

// 遍历 → 按插入顺序
map.forEach((k, v) -> System.out.println(k + "=" + v));
// 张三=20
// 李四=25
// 王五=30

// 其他用法和 HashMap 完全一样
map.get("张三");
map.containsKey("张三");
map.remove("张三");
```

---

## 六、常见问题

### Q1：LinkedHashMap 和 HashMap 的区别？

```
HashMap 无序，LinkedHashMap 有序（插入顺序或访问顺序）。
底层：LinkedHashMap 多了一条双向链表维护顺序。
性能：几乎一样，LinkedHashMap 略低（多维护链表）。
```

### Q2：LinkedHashMap 怎么实现 LRU？

```
开启 accessOrder=true（访问顺序），每次访问把元素移到链表尾部，
重写 removeEldestEntry 在超过容量时删除头部（最久未访问）。
```

### Q3：accessOrder 的两种模式？

```
false（默认）：插入顺序，遍历顺序 = put 的顺序。
true：访问顺序，被 get/put 的元素移到尾部，适合 LRU。
```

### Q4：LinkedHashMap 是线程安全的吗？

```
不是。多线程要加锁或用 Collections.synchronizedMap 包装。
```

---

## 七、快速参考

```
底层：HashMap + 双向链表
顺序：插入顺序（默认）/ 访问顺序（accessOrder=true）
核心应用：LRU 缓存
性能：接近 HashMap
非线程安全
```

### LRU 模板

```java
class LRUCache<K,V> extends LinkedHashMap<K,V> {
    private final int cap;
    LRUCache(int cap) { super(cap, 0.75f, true); this.cap = cap; }
    @Override protected boolean removeEldestEntry(Map.Entry<K,V> e) {
        return size() > cap;
    }
}
```
