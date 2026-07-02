# TreeMap 详解

> 📖 官方文档：[TreeMap (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeMap.html)

## 一、概述

**TreeMap 底层是红黑树**，核心特性是**按 key 自动排序**。

```
TreeMap 特性：
  ✅ key 自动排序
  ✅ key 唯一（value 可重复）
  ❌ 不允许 null key
  ❌ 非线程安全
  ⚠️ put/get/remove 都是 O(log n)
```

```
存入 {5,2,8,1,3}：
  HashMap：        无序
  LinkedHashMap：  插入顺序
  TreeMap：        {1,2,3,5,8}（key 自动从小到大排序）✅
```

> 💡 **类比：** TreeMap 像"**按字母排序的字典**"，插入时自动排好，还支持"查某段字母范围"。

---

## 二、底层原理：红黑树

```
TreeMap 底层是一棵红黑树（自平衡二叉搜索树）：

  存入 5,2,8,1,3：

              5
            /   \
           2     8
          / \
         1   3

  - 中序遍历得到有序 key 序列
  - 增删查 O(log n)
  - 自平衡，不会退化成链表
```

> 💡 **提示：** TreeMap 和 TreeSet 是一对——TreeSet 底层就是 TreeMap（元素当 key，value 占位）。

---

## 三、两种排序方式

和 TreeSet 一样，TreeMap 也需要 key 可比较：

### 1. 自然排序（key 实现 Comparable）

```java
TreeMap<String, Integer> map = new TreeMap<>();   // 默认按 String 自然顺序
map.put("banana", 2);
map.put("apple", 1);
map.put("cherry", 3);
// 遍历：apple → banana → cherry（按字母排序）
```

### 2. 定制排序（构造时传 Comparator）

```java
// 按 key 的字符串长度排序
TreeMap<String, Integer> map = new TreeMap<>(Comparator.comparing(String::length));
// 或降序
TreeMap<Integer, String> map = new TreeMap<>(Comparator.reverseOrder());
```

> ⚠️ **注意：** TreeMap 判断 key 重复靠 `compareTo` 返回 0，不是 equals。

---

## 四、特有方法（范围查询是强项）

```java
TreeMap<Integer, String> map = new TreeMap<>();
map.put(1, "a"); map.put(3, "c"); map.put(5, "e"); map.put(7, "g");

map.firstKey();          // 最小 key → 1
map.lastKey();           // 最大 key → 7
map.firstEntry();        // 最小的键值对 → 1=a
map.lastEntry();         // 最大的键值对 → 7=g

map.lowerKey(5);         // < 5 的最大 key → 3
map.higherKey(5);        // > 5 的最小 key → 7
map.floorKey(5);         // ≤ 5 的最大 → 5
map.ceilingKey(5);       // ≥ 5 的最小 → 5

// 范围查询
map.headMap(5);          // key < 5 的 → {1=a, 3=c}
map.tailMap(5);          // key ≥ 5 的 → {5=e, 7=g}
map.subMap(2, 6);        // [2, 6) → {3=c, 5=e}

// 删除并返回
map.pollFirstEntry();    // 删除最小 → 1=a
map.pollLastEntry();     // 删除最大 → 7=g
```

> 💡 **提示：** 需要按 key 范围查询（如"取年龄 18~30 的所有人"）时，TreeMap 比 HashMap 高效得多。

---

## 五、四种 Map 对比

| 特性 | HashMap | LinkedHashMap | TreeMap | Hashtable |
|-----|---------|---------------|---------|-----------|
| 底层 | 数组+链表+红黑树 | +双向链表 | 红黑树 | 数组+链表 |
| 顺序 | 无序 | 插入/访问顺序 | **排序** | 无序 |
| 允许 null | ✅ | ✅ | ❌ key | ❌ |
| 性能 | O(1) | O(1) | O(log n) | O(1) |
| 范围查询 | ❌ | ❌ | ✅ | ❌ |
| 线程安全 | ❌ | ❌ | ❌ | ✅ |

---

## 六、应用场景

```java
// 1. 需要按 key 排序的字典
TreeMap<String, String> dict = new TreeMap<>();

// 2. 成绩排行榜（按分数排序）
TreeMap<Integer, String> rank = new TreeMap<>(Comparator.reverseOrder());

// 3. 按时间范围查询
TreeMap<Long, Event> events = new TreeMap<>();
events.subMap(startTime, endTime);   // 取某个时间段的事件

// 4. 取 Top N
rank.pollFirstEntry();   // 取最高分
```

---

## 七、常见问题

### Q1：TreeMap 底层是什么？

```
红黑树（自平衡二叉搜索树），增删查 O(log n)。
```

### Q2：TreeMap 怎么排序？

```
两种：key 实现 Comparable（自然排序），或构造时传 Comparator（定制排序）。
```

### Q3：TreeMap 能存 null key 吗？

```
不能，会抛 NullPointerException（比较 null 时报错）。
```

### Q4：TreeMap 和 HashMap 怎么选？

```
要排序、范围查询 → TreeMap
只要快速查找 → HashMap（性能更好）
```

### Q5：TreeMap 怎么判断 key 重复？

```
靠 compareTo 返回 0，不是 equals。
```

---

## 八、快速参考

```
底层：红黑树
特性：按 key 自动排序，O(log n)
排序：Comparable 或 Comparator
不允许 null key
强项：范围查询（subMap/headMap/tailMap）
特有：firstKey/lastKey/lowerKey/higherKey/pollFirstEntry
```

### 四种 Map 选择

```
查找快、无序 → HashMap
要顺序 → LinkedHashMap
要排序/范围查询 → TreeMap
多线程 → ConcurrentHashMap
```
