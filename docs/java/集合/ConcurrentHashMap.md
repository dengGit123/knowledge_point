# ConcurrentHashMap 详解

> 📖 官方文档：[ConcurrentHashMap (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html)

## 一、概述

**ConcurrentHashMap 是线程安全的 HashMap**，是高并发场景下 Map 的首选。

```
HashMap：          非线程安全，多线程下会丢数据、结构破坏
Hashtable：        线程安全但性能差（整个表加锁，已淘汰）
ConcurrentHashMap：线程安全且高性能（细粒度锁）✅ 推荐
```

| 特性 | 说明 |
|-----|------|
| 线程安全 | ✅ 多线程并发安全 |
| 高性能 | 锁粒度细，并发度高 |
| 不允许 null | key 和 value 都不能为 null |
| 弱一致性 | 遍历/size 是弱一致的（不锁） |

> 💡 **一句话：多线程要用 Map，无脑选 ConcurrentHashMap。**

---

## 二、为什么不用 HashMap 或 Hashtable？

### HashMap 的问题

```java
// ❌ 多线程下 HashMap 出问题
Map<String, Integer> map = new HashMap<>();
// 100 个线程同时 put
// → 数据丢失、size 不准
// → JDK 1.7 可能死循环（扩容时链表成环）
// → JDK 1.8 虽然不成环，但仍会丢数据
```

### Hashtable 的问题

```
Hashtable 给【所有方法】加 synchronized，锁住整个表：
  - 读读互斥、读写互斥
  - 一个线程操作时，其他所有线程都得等
  - 并发性能极差

ConcurrentHashMap 的思路：缩小锁范围，只锁【一个桶（一个数组位置）】，
不同桶的操作互不影响，大大提升并发度。
```

---

## 三、底层实现（重点，分版本）

### JDK 1.7：分段锁（Segment）

```
1.7 的 ConcurrentHashMap 由多个 Segment 组成（默认 16 个）：

  Segment[0]  Segment[1]  ... Segment[15]   ← 每个 Segment 是一个小的 HashMap
  (独立加锁)  (独立加锁)      (独立加锁)

  - 每个 Segment 是一把锁（ReentrantLock）
  - 不同 Segment 可以并发操作
  - 理论并发度 = Segment 数（默认 16）
  - 锁的粒度：整个 Segment
```

### JDK 1.8：CAS + synchronized（锁单个桶）

```
1.8 放弃了 Segment，结构改为和 HashMap 一样的【数组 + 链表 + 红黑树】，
锁的粒度细化到【单个桶（数组的某个位置）】：

  table 数组
  [0]  [1]  [2]  [3]  ... [15]
   │              │
   ▼              ▼
  锁桶0          锁桶3       ← 每个桶独立加锁（synchronized 锁桶头节点）
 (链表/树)      (链表/树)

  - 锁粒度：单个桶（比 Segment 更细）
  - 用 synchronized 锁桶的头节点（1.8 synchronized 优化后性能很好）
  - 空桶用 CAS 无锁写入
  - 并发度 = 数组长度（远大于 16）
```

> 💡 **1.7 vs 1.8 对比：**

| | JDK 1.7 | JDK 1.8 |
|---|---------|---------|
| 结构 | Segment 数组 | 数组 + 链表 + 红黑树 |
| 锁 | ReentrantLock（分段锁） | synchronized + CAS |
| 锁粒度 | Segment（一段） | 单个桶（更细） |
| 并发度 | 16（Segment 数） | 数组长度（很高） |

> ⚠️ **注意：1.8 为什么用 synchronized 而不是 ReentrantLock？** 因为 1.8 后 synchronized 经过多轮优化（偏向锁、轻量级锁），在低竞争下性能优于 ReentrantLock，且内存占用更少。

---

## 四、put 流程（1.8）

```java
map.put("张三", 20);
```

```
1. key、value 都不能为 null（否则抛 NullPointerException）

2. 计算 hash，定位桶

3. 桶为空 → CAS 无锁写入（成功就结束）

4. 桶不为空 → synchronized 锁住桶的头节点
   ├─ 遍历链表/红黑树
   ├─ key 相同 → 覆盖 value
   └─ key 不同 → 追加到链表/树

5. 链表长度 ≥8 且容量 ≥64 → 树化

6. 释放锁，更新元素计数
```

**与 HashMap put 的区别：**
- 多了 CAS + synchronized 加锁
- key/value 不能为 null（HashMap 可以）

---

## 五、为什么 ConcurrentHashMap 不允许 null？

```java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("k", null);   // ❌ NullPointerException
map.put(null, 1);     // ❌ NullPointerException
```

**原因：避免"二义性"问题。**

```
HashMap 允许 null value：
  map.get("k") 返回 null
  → 你不知道是"没有 k"，还是"k 的 value 就是 null"
  → 单线程下可以用 containsKey 区分

ConcurrentHashMap 多线程：
  get 返回 null 时，可能另一个线程刚 put 了 value=null，
  你用 containsKey 检查时，状态又变了 → 无法区分，产生歧义
  → 所以直接禁止 null，强制没有歧义
```

> 💡 **提示：** 这是 Doug Lea（作者）的设计权衡——禁止 null 消除多线程下的二义性。

---

## 六、基本用法

```java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();

map.put("张三", 20);
map.get("张三");
map.containsKey("张三");
map.remove("张三");
map.size();

// 遍历（弱一致性，遍历期间其他线程的修改可能看到也可能看不到）
map.forEach((k, v) -> System.out.println(k + "=" + v));
```

### 线程安全的原子操作

ConcurrentHashMap 提供了一些**复合原子操作**，避免"检查再操作"的竞态条件：

```java
// ❌ 非原子的"检查再操作"（HashMap 这样有并发问题）
if (!map.containsKey("k")) {
    map.put("k", 1);   // 两个线程可能都通过判断，重复 put
}

// ✅ ConcurrentHashMap 的原子方法
map.putIfAbsent("k", 1);                       // 不存在才放（原子）
map.computeIfAbsent("k", key -> 计算value);     // 不存在则计算并放入（原子）
map.compute("k", (key, oldV) -> 新值);          // 原子计算
map.merge("k", 1, Integer::sum);                // 原子合并（如计数器 +1）
```

```java
// 经典：线程安全的计数器
ConcurrentHashMap<String, Integer> counter = new ConcurrentHashMap<>();
// 多线程下安全累加
counter.merge("张三", 1, Integer::sum);   // 张三 +1，原子操作
```

---

## 七、size() 和弱一致性

```java
map.size();   // 返回元素个数
```

**ConcurrentHashMap 的 size 是"估算"的，弱一致：**

```
- size() 不会加锁（加锁会阻塞所有操作）
- 内部用 CounterCell 数组分散计数（类似 LongAdder），减少竞争
- 返回的是一个近似值，遍历过程中可能有变化

所以：高并发下 size() 可能不是 100% 精确，但够用。
需要精确值时用 map.reduceCounts 相关方法（会加锁，慢）。
```

**弱一致性还体现在：**
- 遍历时，其他线程的修改**可能**反映出来，也**可能**不反映
- 这是为了不阻塞遍历，牺牲了一点一致性换取并发性能

---

## 八、常见问题（面试高频）

### Q1：ConcurrentHashMap 怎么实现线程安全？

```
JDK 1.7：分段锁 Segment（ReentrantLock），每个段独立加锁。
JDK 1.8：CAS + synchronized，锁单个桶的头节点，粒度更细。
```

### Q2：1.7 和 1.8 的 ConcurrentHashMap 区别？

```
1.7：Segment 分段锁，并发度 = Segment 数（16）。
1.8：数组+链表+红黑树，synchronized 锁单个桶，并发度 = 数组长度（更高）。
     且去掉了 Segment，改用 CAS + synchronized。
```

### Q3：为什么 ConcurrentHashMap 不允许 null？

```
避免多线程下的二义性：get 返回 null 时无法区分是"不存在"还是"value 就是 null"。
禁止 null 强制消除歧义。
```

### Q4：ConcurrentHashMap 的 size() 准确吗？

```
不完全准确，是弱一致的近似值（内部用 CounterCell 分散计数，不加锁）。
高并发下可能略有偏差。
```

### Q5：ConcurrentHashMap 和 HashMap 的区别？

```
1. 线程安全：ConcurrentHashMap 安全，HashMap 不安全
2. null：ConcurrentHashMap 不允许 null key/value，HashMap 允许
3. 底层锁：ConcurrentHashMap 有锁（CAS+synchronized），HashMap 无
4. 性能：单线程 HashMap 略快；多线程用 ConcurrentHashMap
```

### Q6：ConcurrentHashMap 的 put 流程？

```
计算 hash → 桶空用 CAS 写入 → 桶非空 synchronized 锁住头节点 →
链表/树中找位置插入或覆盖 → 释放锁 → 计数。
```

---

## 九、快速参考

### 核心特性

```
线程安全的 HashMap（首选并发 Map）
JDK 1.8：数组+链表+红黑树，CAS + synchronized 锁单个桶
不允许 null key/value
size 弱一致（近似值）
提供原子方法：putIfAbsent / computeIfAbsent / merge
```

### 选型

```
单线程 → HashMap
多线程 → ConcurrentHashMap（不要用 Hashtable）
```

### 原子操作

```java
map.putIfAbsent(k, v);              // 不存在才放
map.computeIfAbsent(k, key -> 计算v); // 不存在则计算
map.merge(k, delta, Integer::sum);   // 计数器累加
```

### 牢记

```
✅ 多线程用 ConcurrentHashMap
❌ 多线程别用 HashMap（丢数据）
❌ 别用 Hashtable（性能差）
❌ key/value 不能为 null
```
