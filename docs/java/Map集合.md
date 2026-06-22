# Map 集合详解

> 📖 官方文档：[Map (Java Platform SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Map.html)
> 📖 [HashMap (Java Platform SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html)
> 📖 菜鸟教程：[Java HashMap](https://www.runoob.com/java/java-hashmap.html)

## 一、概述

`Map` 是 Java 集合框架中专门用来存储**键值对（key-value）**的接口。它和 `Collection` 体系是**平级的**（不继承 Collection）。你可以把它理解为一本"**字典**"——通过"词条（key）"快速查到对应的"释义（value）"。

通俗地讲：

- **List / Set** 只能存单列数据，像一排储物柜；
- **Map** 存的是成对的数据，像电话簿：姓名（key）→ 电话号码（value）。

Map 接口的核心特点：

| 特点              | 说明                                                        |
| ----------------- | ----------------------------------------------------------- |
| **存键值对**      | 每个元素是一个 `Entry`，包含 key 和 value                   |
| **key 不可重复**  | 重复 put 同一个 key，新 value 会**覆盖**旧 value            |
| **value 可重复**  | 多个 key 可以指向相同的 value                               |
| **一个 key 对应一个 value** | key 是唯一的，是定位 value 的钥匙                 |
| **允许 null**     | HashMap 允许 key 和 value 为 null（Hashtable 不允许）       |

---

## 二、Map 接口体系结构

`Map` 是一个独立接口（不继承 Collection），它有多个实现类。最常用的是 `HashMap` 和 `ConcurrentHashMap`。

```
        ┌──────────────────┐
        │   Map<K,V>       │   ← Map 接口（存键值对）
        └────────┬─────────┘
                 │ implements
   ┌────────┬────┴──────┬──────────────┬───────────────────┐
   │        │           │              │                   │
┌──▼─────┐ ┌▼────────┐ ┌▼──────────┐ ┌▼──────────┐ ┌──────▼─────────────┐
│HashMap │ │Linked   │ │ TreeMap   │ │ Hashtable │ │ConcurrentHashMap   │
│数组+链表│ │HashMap  │ │红黑树     │ │古老,同步  │ │高并发推荐           │
│+红黑树 │ │保插入/访│ │按key排序  │ │不存null   │ │分段锁/CAS(JDK8)    │
│        │ │问顺序   │ │           │ │(已淘汰)   │ │                    │
└──┬─────┘ │(可做LRU)│ └───────────┘ └───────────┘ └────────────────────┘
   │ extends └────────┘
   │
   └── LinkedHashMap 是 HashMap 的子类
```

> 💡 **提示：** `Map` 虽然不和 `Collection` 继承，但它的 `keySet()`、`values()`、`entrySet()` 返回的都是 `Collection` 的视图，所以可以借助 Collection 的方法操作。

---

## 三、五大实现类简介

### 1. HashMap（最常用）

- **底层结构：** JDK 8+ 是 **数组 + 链表 + 红黑树**。
- **允许 null：** 允许一个 `null` 键和多个 `null` 值。
- **非线程安全：** 多线程下用 `ConcurrentHashMap`。
- **查询性能：** 平均 O(1)。
- **应用场景：** 绝大多数 key-value 缓存、映射场景。

### 2. LinkedHashMap

- 是 `HashMap` 的子类，多维护一条双向链表。
- 维护**插入顺序**或**访问顺序**（构造器传 `accessOrder=true`）。
- 设为访问顺序时，可配合 `removeEldestEntry` 实现 **LRU（最近最少使用）缓存**。
- 允许 null。

### 3. TreeMap

- **底层结构：** 红黑树。
- **按 key 排序：** key 必须实现 `Comparable` 或构造时传 `Comparator`。
- 不允许 key 为 `null`。
- 查询、增删 O(log n)。

### 4. Hashtable（已淘汰）

- JDK 1.0 的古老类，所有方法 `synchronized` 修饰，**线程安全但性能差**。
- **不允许 null 键和 null 值**。
- 已不推荐使用，用 `ConcurrentHashMap` 替代。

### 5. ConcurrentHashMap（高并发推荐）

- **线程安全**，性能远高于 `Hashtable`。
- JDK 7 用**分段锁（Segment）**；JDK 8 改用 **CAS + synchronized**（锁粒度细化到桶节点）。
- 不允许 null 键和 null 值。
- 应用场景：多线程下的共享 Map。

---

## 四、常用 API

```java
import java.util.HashMap;
import java.util.Map;

public class MapApiDemo {
    public static void main(String[] args) {
        Map<String, Integer> map = new HashMap<>();

        // 1. put(k, v)：添加/修改键值对（key 存在则覆盖旧值，返回旧值）
        map.put("Java", 1);
        map.put("Python", 2);
        map.put("Go", 3);
        Integer oldVal = map.put("Java", 10);  // 覆盖，返回旧值 1
        System.out.println("覆盖的旧值: " + oldVal); // 1

        // 2. get(k)：根据 key 取 value（不存在返回 null）
        System.out.println("Java的值: " + map.get("Java")); // 10

        // 3. getOrDefault(k, default)：取不到时返回默认值（避免 NPE）
        System.out.println("Rust的值: " + map.getOrDefault("Rust", 0)); // 0

        // 4. containsKey(k) / containsValue(v)：是否包含
        System.out.println("有Java键: " + map.containsKey("Java"));   // true
        System.out.println("有值2: " + map.containsValue(2));         // true

        // 5. size()：键值对个数
        System.out.println("个数: " + map.size()); // 3

        // 6. remove(k)：根据 key 删除，返回对应的 value
        Integer removed = map.remove("Go");
        System.out.println("删除的值: " + removed); // 3

        // 7. putIfAbsent(k, v)：key 不存在（或为 null）时才放入
        map.putIfAbsent("Rust", 4);   // Rust 不存在，放入
        map.putIfAbsent("Java", 99);  // Java 已存在，不放入
        System.out.println("Java的值: " + map.get("Java")); // 仍是 10

        // 8. replace(k, v)：仅当 key 存在时替换（JDK 8+）
        map.replace("Java", 100);
        // replace(k, oldValue, newValue)：仅当值等于 oldValue 才替换

        // 9. keySet()：返回所有 key 的集合
        System.out.println("所有键: " + map.keySet());

        // 10. values()：返回所有 value 的集合
        System.out.println("所有值: " + map.values());

        // 11. entrySet()：返回所有键值对 Entry 的集合
        System.out.println("所有键值对: " + map.entrySet());

        // 12. clear() / isEmpty()
        System.out.println("是否为空: " + map.isEmpty());
    }
}
```

### API 速查表

| 方法                                | 功能                          | 返回值               |
| ----------------------------------- | ----------------------------- | -------------------- |
| `put(K key, V value)`               | 添加/覆盖                     | `V`（旧值或 null）   |
| `putIfAbsent(K key, V value)`       | 仅当不存在时添加              | `V`（旧值或 null）   |
| `get(Object key)`                   | 取值                          | `V`                  |
| `getOrDefault(Object key, V def)`   | 取值（带默认值）              | `V`                  |
| `remove(Object key)`                | 删除                          | `V`（被删值）        |
| `containsKey(Object key)`           | 是否包含 key                  | `boolean`            |
| `containsValue(Object value)`       | 是否包含 value                | `boolean`            |
| `replace(K key, V value)`           | 仅当 key 存在时替换           | `V`（旧值）          |
| `size()`                            | 键值对个数                    | `int`                |
| `isEmpty()`                         | 是否为空                      | `boolean`            |
| `keySet()`                          | 所有 key 集合                 | `Set<K>`             |
| `values()`                          | 所有 value 集合               | `Collection<V>`      |
| `entrySet()`                        | 所有键值对                    | `Set<Map.Entry<K,V>>`|
| `clear()`                           | 清空                          | `void`               |

---

## 五、Map 的四种遍历方式（重点）

### 1. entrySet 遍历（最推荐）

同时拿到 key 和 value，**效率最高**，无需额外查表。

```java
// ✅ 方式1：entrySet + 增强 for（最推荐）
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    String key = entry.getKey();
    Integer value = entry.getValue();
    System.out.println(key + " = " + value);
}
```

### 2. keySet 遍历

只拿 key 集合，再用 `get(key)` 取 value。**比 entrySet 多一次查询**，性能略低。

```java
// ✅ 方式2：keySet 遍历
for (String key : map.keySet()) {
    Integer value = map.get(key);  // 多一次哈希查找
    System.out.println(key + " = " + value);
}
```

### 3. values 遍历（只要 value）

```java
// ✅ 方式3：只遍历 value
for (Integer value : map.values()) {
    System.out.println(value);
}
```

### 4. forEach + Lambda（JDK 8+，最简洁）

```java
// ✅ 方式4：forEach + Lambda
map.forEach((key, value) -> System.out.println(key + " = " + value));
```

### 四种遍历方式对比

| 遍历方式         | 是否同时拿到 key/value | 性能     | 适用场景              |
| ---------------- | ---------------------- | -------- | --------------------- |
| `entrySet`       | ✅ 是                  | **最高** | 同时需要 key 和 value |
| `keySet` + get   | ✅ 是（但需二次查询）  | 较低     | 只关心 key，偶尔取值  |
| `values`         | ❌ 只有 value          | 高       | 只需要所有值          |
| `forEach` Lambda | ✅ 是                  | 高       | JDK 8+，代码简洁      |

> 💡 **提示：** 需要 key 和 value 时**首选 entrySet**，避免 `keySet + get` 的二次哈希查找。

---

## 六、HashMap 底层原理（面试高频中的高频）

### 1. JDK 7 vs JDK 8 的结构差异

```
JDK 7：数组 + 链表（头插法）

   table[] ┌─────┐
           │ [0] │
           ├─────┤
           │ [1] │ → key4 → key1 → null   (新元素插在头部，头插法)
           ├─────┤                            ⚠️ 并发扩容可能形成环 → 死循环
           │ [2] │ → key3 → null
           └─────┘


JDK 8：数组 + 链表 + 红黑树（尾插法）

   table[] ┌─────┐
           │ [0] │
           ├─────┤
           │ [1] │ → key1 → key4 → null   (新元素插在尾部，尾插法)
           ├─────┤
           │ [2] │
           ├─────┤
           │ [3] │ → key7                 (链表长度≥8 且 数组长度≥64)
           │     │    ↕                    ↓ 转为红黑树
           │     │   🌳 红黑树              (节点≤6 时退化为链表)
           └─────┘
```

**JDK 8 的关键改进：**

- **头插法 → 尾插法**：解决 JDK 7 并发扩容时链表成环导致死循环的问题。
- **引入红黑树**：当链表过长时（≥8 且数组 ≥64）转为红黑树，把最坏查询从 O(n) 优化到 O(log n)。

### 2. 关键参数

| 参数           | 默认值 | 说明                                  |
| -------------- | ------ | ------------------------------------- |
| 初始容量       | 16     | 数组初始长度（必须是 2 的幂）         |
| 负载因子       | 0.75   | 装满 75% 就扩容                       |
| 扩容阈值       | 12     | = 容量 × 负载因子 = 16 × 0.75         |
| 树化阈值       | 8      | 链表长度 ≥ 8 且数组长度 ≥ 64 才树化   |
| 退化阈值       | 6      | 红黑树节点 ≤ 6 退化为链表             |

### 3. hash 计算与索引定位

```java
// HashMap 的 hash 方法（扰动函数，JDK 8）
static final int hash(Object key) {
    int h;
    // 把高 16 位和低 16 位异或，让高位也参与索引计算，减少哈希冲突
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}

// 索引计算（n 是数组长度，一定是 2 的幂）
int index = (n - 1) & hash;
```

**为什么用 `(n - 1) & hash` 而不是 `% n`？**
- 位运算 `&` 比 `%` 快。
- 因为 n 是 2 的幂，`(n-1)` 的二进制全是 1（如 16-1=15=`1111`），`&` 运算等价于取模，且分布均匀。

### 4. put 流程（简化版）

```
put(key, value)
    │
    ▼
┌────────────────────────────┐
│ 1. 计算 hash(key)          │
└─────────────┬──────────────┘
              ▼
┌────────────────────────────┐
│ 2. 数组为空？→ resize() 初始化 │
└─────────────┬──────────────┘
              ▼
┌────────────────────────────┐
│ 3. 定位桶 index = (n-1)&hash │
│    桶为空？→ 直接放入        │
└─────────────┬──────────────┘
              │ 桶非空（hash 冲突）
              ▼
┌────────────────────────────┐
│ 4. 遍历桶内元素:            │
│    key 相等？ → 覆盖 value   │
│    不相等？  → 追加到链表尾  │
│              或插入红黑树    │
└─────────────┬──────────────┘
              │ 链表长度 ≥ 8 且数组 ≥ 64
              ▼
┌────────────────────────────┐
│ 5. 链表转红黑树（树化）     │
└─────────────┬──────────────┘
              ▼
┌────────────────────────────┐
│ 6. size++ > 阈值？ → resize() 扩容(2倍) │
└────────────────────────────┘
```

> ⚠️ **注意：** 链表长度 ≥ 8 但**数组长度 < 64** 时，HashMap 会选择**扩容数组**而不是树化（因为数组小时冲突是正常的，扩容就能缓解）。

### 5. 扩容机制

- 当 `size > 阈值`（容量 × 0.75）时触发扩容。
- 容量翻倍（16 → 32 → 64...）。
- JDK 8 优化：元素要么留在原位置，要么移动到 `原位置 + 旧容量` 的位置（利用 `hash & oldCap` 判断）。

---

## 七、HashMap vs Hashtable vs ConcurrentHashMap

| 对比维度       | HashMap           | Hashtable         | ConcurrentHashMap       |
| -------------- | ----------------- | ----------------- | ----------------------- |
| 线程安全       | ❌ 否             | ✅ 是（synchronized）| ✅ 是（CAS+synchronized）|
| null 键值      | ✅ 允许（1 null 键）| ❌ 不允许         | ❌ 不允许               |
| 锁粒度         | 无锁              | 锁整个对象（粗）   | JDK8 锁单个桶节点（细） |
| 性能           | 最高（单线程）    | 差                | 高（并发优秀）          |
| 出现版本       | JDK 1.2           | JDK 1.0（古老）   | JDK 1.5                 |
| 是否推荐       | ✅ 单线程首选     | ❌ 已淘汰         | ✅ 多线程首选           |
| 底层结构       | 数组+链表+红黑树  | 数组+链表         | 数组+链表+红黑树        |

> 💡 **提示：** `Hashtable` 的 `t` 是小写（历史命名遗留），而 `HashMap`、`ConcurrentHashMap` 是驼峰命名。

---

## 八、注意事项与陷阱

### 1. 自定义对象作为 key 必须重写 hashCode 和 equals

和 Set 一样，Map 用 key 的 `hashCode` 定位桶、用 `equals` 判断相等。如果自定义类做 key 不重写，会出现"同一个对象"找不到的问题。

```java
// ✅ 正确做法：String、Integer 等已正确重写，适合做 key
Map<String, Integer> map = new HashMap<>();

// ⚠️ 自定义对象做 key，必须重写 hashCode 和 equals
Map<Student, String> map2 = new HashMap<>();
```

**不可变对象最适合做 key**（如 String），因为 key 存入后如果字段被修改，`hashCode` 会变，元素就"丢失"了。

### 2. get 返回 null 的两种含义

```java
Map<String, Integer> map = new HashMap<>();
map.put("A", null);

map.get("A");          // null（key 存在，value 是 null）
map.get("B");          // null（key 不存在）
// 无法区分！用 containsKey 来判断 key 是否存在
map.containsKey("A");  // true
map.containsKey("B");  // false
```

> ⚠️ **注意：** 需要区分"value 为 null"还是"key 不存在"时，用 `containsKey()`，而不是判断 `get() == null`。

### 3. 遍历时修改结构的 fail-fast

和 List 一样，HashMap 遍历时直接调用 `map.put/remove` 会抛 `ConcurrentModificationException`。正确做法：

```java
// ✅ 用 Iterator.remove() 或 entrySet 的 removeIf
map.entrySet().removeIf(e -> e.getValue() == null);
```

### 4. 容量初始化建议

如果能预估元素数量，建议指定初始容量，避免多次扩容：

```java
// ✅ 预计放 100 个元素，初始化容量 = 预估数 / 0.75 + 1，避免扩容
Map<String, String> map = new HashMap<>(134);
```

---

## 九、应用场景示例

### 场景 1：词频统计

```java
String[] words = {"apple", "banana", "apple", "cherry", "banana", "apple"};
Map<String, Integer> count = new HashMap<>();
for (String w : words) {
    // ✅ getOrDefault 比判断 null 更优雅
    count.put(w, count.getOrDefault(w, 0) + 1);
}
System.out.println(count); // {banana=2, apple=3, cherry=1}
```

### 场景 2：用 LinkedHashMap 实现 LRU 缓存

```java
import java.util.LinkedHashMap;
import java.util.Map;

// accessOrder=true 表示按访问顺序排序，最近访问的放最后
// 重写 removeEldestEntry，当超过容量时自动删除最久未使用的（最前面的）
class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
    public LRUCache(int capacity) {
        super(capacity, 0.75f, true); // accessOrder = true
        this.capacity = capacity;
    }
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity; // 超过容量删除最旧元素
    }
}
```

---

## 十、面试常见问题

### Q1：HashMap 的底层原理（JDK 8）？

答：JDK 8 的 HashMap 是 **数组 + 链表 + 红黑树**。数组是主体（默认长度 16），每个槽位叫一个桶。发生哈希冲突时（多个 key 算到同一桶），用链表（尾插法）存储。当链表长度 ≥ 8 且数组长度 ≥ 64 时，链表转为红黑树；红黑树节点 ≤ 6 时退化为链表。扩容阈值 = 容量 × 负载因子（0.75），超过就扩容为 2 倍。

### Q2：HashMap 的 hash 方法为什么要扰动？

答：`(h = hashCode()) ^ (h >>> 16)` 把高 16 位与低 16 位异或，让 hashCode 的高位也参与到索引计算（`(n-1) & hash` 时高位本来会被忽略）。这样可以减少哈希冲突，让元素分布更均匀。

### Q3：HashMap 什么时候链表转红黑树？

答：需要**同时满足两个条件**：① 链表长度 ≥ 8（`TREEIFY_THRESHOLD`）；② 数组长度 ≥ 64（`MIN_TREEIFY_CAPACITY`）。如果链表 ≥ 8 但数组 < 64，会优先扩容数组而不是树化。退化阈值是 6（`UNTREEIFY_THRESHOLD`），避免在 8 附近频繁来回转换。

### Q4：HashMap 和 Hashtable 的区别？

答：① 线程安全不同，HashMap 非线程安全，Hashtable 线程安全（方法都 synchronized）；② null 支持不同，HashMap 允许 null 键值，Hashtable 不允许；③ 性能不同，HashMap 更高；④ 底层结构不同，JDK8 的 HashMap 有红黑树，Hashtable 没有；⑤ 推荐度不同，HashMap 单线程首选，Hashtable 已淘汰，多线程用 ConcurrentHashMap。

### Q5：HashMap 为什么用 `(n-1) & hash` 而不是 `% n`？

答：① 位运算 `&` 比取模 `%` 快；② 因为数组容量 n 一定是 2 的幂，`(n-1)` 的二进制全是 1，`(n-1) & hash` 等价于 `hash % n`，结果还能均匀分布。这也是 HashMap 容量必须为 2 的幂的原因。

### Q6：为什么 HashMap 的容量必须是 2 的幂？

答：为了让 `(n-1) & hash` 能正确等价于取模运算（当 n 是 2 的幂时，n-1 的二进制全为 1），既高效又能让元素均匀分布。如果传非 2 的幂，HashMap 构造时会用 `tableSizeFor` 向上取整到最近的 2 的幂。

### Q7：HashMap 遍历用 entrySet 还是 keySet？

答：**优先 entrySet**。因为 entrySet 一次就能同时拿到 key 和 value，而 keySet + get 需要对每个 key 再做一次哈希查找，性能更低。

### Q8：ConcurrentHashMap 在 JDK 7 和 JDK 8 的实现区别？

答：JDK 7 用**分段锁（Segment）**，默认 16 个段，每段一把锁，最多支持 16 线程并发写。JDK 8 抛弃了 Segment，改为 **数组 + 链表 + 红黑树**，锁粒度细化到每个桶的头节点，用 **CAS + synchronized** 实现，并发度更高，性能更好。

---

## 十一、总结

1. `Map` 存储**键值对**，key 不可重复（后值覆盖前值），value 可重复。
2. 五大实现：`HashMap`（最常用）、`LinkedHashMap`（保序，可做 LRU）、`TreeMap`（排序）、`Hashtable`（已淘汰）、`ConcurrentHashMap`（并发推荐）。
3. HashMap 底层（JDK 8）：**数组 + 链表 + 红黑树**，初始容量 16，负载因子 0.75，链表 ≥ 8 且数组 ≥ 64 树化，节点 ≤ 6 退化，尾插法。
4. 索引定位用 `(n-1) & hash`（扰动后的 hashCode），容量必须为 2 的幂。
5. 遍历**首选 entrySet**；自定义对象做 key 必须重写 `hashCode` 和 `equals`，且最好是不可变对象。
6. 判断 key 是否存在用 `containsKey`，不要靠 `get() == null`（无法区分 value 为 null 的情况）。
