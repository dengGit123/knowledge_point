# HashMap 详解（核心！）

> 📖 官方文档：[HashMap (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html)

## 一、概述

**HashMap 是 Java 中最常用的 Map 实现**，存储**键值对（key-value）**，根据 key 快速找到 value。

```
HashMap = 哈希表实现的键值对集合

  key   →   value
  "张三" →   20
  "李四" →   25
  "王五" →   30

  根据 key "李四" 能 O(1) 找到 value 25
```

### 核心特性

| 特性 | 说明 |
|-----|------|
| 键值对 | key 唯一，value 可重复 |
| 允许 null | 一个 null key，多个 null value |
| 无序 | 存取顺序不保证 |
| 非线程安全 | 多线程要用 ConcurrentHashMap |
| 高效 | put/get/contains 平均 O(1) |

> 💡 **类比：** HashMap 像一本"**字典**"——你按"词条"（key）查"释义"（value），不用从头翻，直接定位。HashMap 是面试重灾区，底层原理必须掌握。

---

## 二、底层结构（JDK 1.8+）

HashMap 底层是 **数组 + 链表 + 红黑树**：

```
table 数组（桶）
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│  0  │  1  │  2  │  3  │  4  │ ... │ 14  │ 15  │
└──┬──┴─────┴──┬──┴─────┴─────┴─────┴─────┴─────┘
   │           │
   ▼           ▼
 [k1,v1]    [k2,v2] → [k3,v3] → [k4,v4] → ... → [k8,v8]
            │                              (链表，长度 ≥8 且容量 ≥64 时转红黑树)
            ▼
         [k5,v5]
```

```
- 数组（table）：主体结构，每个位置叫一个"桶"（bucket）
- 链表：哈希冲突时，多个元素挂在同一个桶上（拉链法）
- 红黑树：链表太长（≥8 且数组容量≥64）时转成红黑树，加速查找
  链表查找 O(n)，红黑树 O(log n)
```

> 💡 **JDK 版本差异：**
> - JDK 1.7：数组 + 链表（头插法，多线程可能成环导致死循环）
> - JDK 1.8：数组 + 链表 + 红黑树（尾插法，解决了成环问题）

---

## 三、关键参数

```java
// HashMap 源码中的关键常量
static final int DEFAULT_INITIAL_CAPACITY = 16;   // 默认初始容量 16
static final float DEFAULT_LOAD_FACTOR = 0.75f;   // 默认负载因子 0.75
static final int TREEIFY_THRESHOLD = 8;           // 链表转红黑树的阈值
static final int UNTREEIFY_THRESHOLD = 6;         // 红黑树退化为链表的阈值
static final int MIN_TREEIFY_CAPACITY = 64;       // 树化要求的最小数组容量
```

| 参数 | 默认值 | 含义 |
|-----|-------|------|
| 初始容量 | 16 | 数组初始大小（必须是 2 的幂） |
| 负载因子 | 0.75 | 元素数 > 容量×0.75 时扩容 |
| 树化阈值 | 8 | 链表长度 ≥8 时考虑转红黑树 |
| 退化阈值 | 6 | 红黑树节点 ≤6 时退化成链表 |

> 💡 **为什么负载因子是 0.75？** 时间和空间的折中——太大（接近1）冲突多查询慢，太小（如0.5）空间浪费。0.75 是经验最优。

---

## 四、put 过程（核心原理）

```java
map.put("张三", 20);
```

**执行流程：**

```
1. 计算 key 的 hash 值
   hash = (h = key.hashCode()) ^ (h >>> 16)   // 扰动函数，让高位也参与运算

2. 定位桶：index = (n - 1) & hash   // n 是数组长度
   （等价于 hash % n，但位运算更快；所以容量必须是 2 的幂）

3. 该桶为空 → 直接放入

4. 该桶有元素 → 比较 key
   ├─ key 相同（hash 相等且 equals 返回 true）→ 覆盖旧 value
   └─ key 不同 → 哈希冲突，挂到链表/红黑树末尾

5. 链表长度 ≥8 且数组容量 ≥64 → 链表转红黑树（树化）

6. 元素总数 > 容量 × 0.75 → 扩容（resize，容量翻倍）
```

### 为什么用扰动函数？

```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
// 把高 16 位异或到低 16 位，让 hashCode 的高位也参与定位桶，
// 减少哈希冲突（因为定位桶只用低位）。
```

---

## 五、get 过程

```java
map.get("张三");
```

```
1. 计算 key 的 hash
2. 定位桶 index = (n-1) & hash
3. 桶为空 → 返回 null
4. 桶的第一个元素 key 匹配 → 返回它的 value
5. 不匹配 → 沿链表/红黑树查找，找到匹配 key 就返回
6. 找不到 → 返回 null
```

---

## 六、扩容机制

```
扩容触发：size > 容量 × 负载因子（默认 16 × 0.75 = 12）

扩容过程：
  1. 数组容量翻倍（16 → 32 → 64 → ...）
  2. 创建新数组
  3. 重新计算每个元素的位置（rehash），搬到新数组
     - JDK 1.8 优化：元素要么在原位置，要么在 原位置 + 旧容量

扩容很耗时（要搬运所有元素），所以能用初始容量就提前指定。
```

```java
// ✅ 已知要存 1000 个，提前算好容量，避免扩容
// 容量 = 预期数量 / 0.75 + 1（向上取 2 的幂）
Map<String, Integer> map = new HashMap<>(1024 / 0.75 + 1 > 0 ? 2048 : 0);
// 简单写：new HashMap<>(2048);
```

---

## 七、基本用法

```java
Map<String, Integer> map = new HashMap<>();

// 增 / 改
map.put("张三", 20);              // 添加，key 已存在则覆盖
map.putIfAbsent("张三", 99);      // 仅当 key 不存在时添加
map.put("李四", 25);

// 查
map.get("张三");                  // 20，不存在返回 null
map.getOrDefault("王五", 0);      // 不存在返回默认值 0
map.containsKey("张三");          // 是否有这个 key
map.containsValue(20);            // 是否有这个 value
map.size();                       // 键值对个数

// 删
map.remove("张三");               // 删除
map.clear();                      // 清空

// 遍历
for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + " = " + e.getValue());
}

// Java 8+ 简洁写法
map.forEach((k, v) -> System.out.println(k + "=" + v));

// Java 8+ 实用方法
map.putIfAbsent(k, v);            // 不存在才放
map.computeIfAbsent(k, key -> 默认计算);  // 不存在则计算并放入
map.merge(k, v, (old, newV) -> 合并);     // 合并
```

---

## 八、链表与红黑树的转换（重点）

```
什么时候链表 → 红黑树（树化）？
  - 链表长度 ≥ 8（TREEIFY_THRESHOLD）
  - 且数组容量 ≥ 64（MIN_TREEIFY_CAPACITY）
  - 两个条件都满足才树化

什么时候红黑树 → 链表（退化）？
  - 红黑树节点数 ≤ 6（UNTREEIFY_THRESHOLD）

为什么是 8？
  - 哈希分布良好时，链表长度达到 8 的概率极低（约千万分之一）
  - 红黑树节点占内存大，只在极端冲突时才用
  - 8 是基于泊松分布算出的阈值
```

> ⚠️ **注意：** 数组容量 < 64 时，即使链表到 8，也不会树化，而是**优先扩容**（扩容能直接缓解冲突）。

---

## 九、自定义对象作为 key

**作为 HashMap 的 key，必须重写 hashCode 和 equals**（和 HashSet 一样的道理）：

```java
public class User {
    String id;
    String name;

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User u)) return false;
        return Objects.equals(id, u.id);
    }
}

Map<User, String> map = new HashMap<>();
// ✅ 重写后，id 相同的 User 会被当作同一个 key
```

> ⚠️ **注意：作为 key 的对象，其参与 hashCode/equals 的字段应该是不可变的（final）**。如果 put 之后修改了字段，hashCode 变了，就再也 get 不出来了（找不到原来的桶）。

---

## 十、常见问题（面试高频）

### Q1：HashMap 的底层原理？

```
JDK 1.8：数组 + 链表 + 红黑树。
  - 用 hash 定位数组位置（桶）
  - 哈希冲突时用拉链法（链表）解决
  - 链表 ≥8 且数组 ≥64 转红黑树
默认初始容量 16，负载因子 0.75，扩容翻倍。
```

### Q2：为什么容量必须是 2 的幂？

```
因为定位桶用 index = (n-1) & hash（位运算代替取模，更快），
只有 n 是 2 的幂时，(n-1) & hash 才等价于 hash % n，且分布均匀。
```

### Q3：HashMap 什么时候扩容？扩到多少？

```
size > 容量 × 负载因子（12）时扩容，容量翻倍（16→32）。
扩容要 rehash 所有元素，很耗时。
```

### Q4：链表什么时候转红黑树？

```
链表长度 ≥8 且数组容量 ≥64。否则即使链表到 8，也只是扩容不树化。
退化阈值是 6。
```

### Q5：HashMap 允许 null 吗？

```
允许：一个 null key（hash 当 0 处理），多个 null value。
（Hashtable、ConcurrentHashMap 不允许 null）
```

### Q6：HashMap 是线程安全的吗？

```
不是。多线程下会丢数据、死循环（1.7 头插法）、结构破坏。
多线程用 ConcurrentHashMap 或 Collections.synchronizedMap。
```

### Q7：JDK 1.7 和 1.8 的 HashMap 区别？

```
1.7：数组 + 链表，头插法（多线程扩容可能成环导致死循环）
1.8：数组 + 链表 + 红黑树，尾插法（解决了成环问题，加了树化优化）
```

### Q8：两个 key 的 hashCode 相同怎么办？

```
哈希冲突。HashMap 用拉链法：相同桶位置的元素用链表（或红黑树）串起来。
查找时再靠 equals 区分。
```

---

## 十一、快速参考

### 核心结构

```
底层：数组 + 链表 + 红黑树（JDK 1.8）
定位桶：(n-1) & hash
哈希冲突：拉链法（链表 → 树化）
默认容量 16，负载因子 0.75，扩容 ×2
树化：链表 ≥8 且容量 ≥64
```

### 关键原理

```
hash 扰动：高16位异或低16位
容量2的幂：(n-1)&hash 等价 hash%n 且更快
null key：放在 index 0 的桶
扩容 rehash：1.8 优化，元素在原位或原位+旧容量
```

### 注意事项

```
✅ 自定义 key 必须重写 hashCode + equals
✅ key 字段应该是不可变的
✅ 知道数量时指定初始容量
❌ 多线程用 HashMap（用 ConcurrentHashMap）
❌ 字段被 put 后再修改（会找不到）
```

### 后续

```
HashMap        → 本篇（无序、非线程安全）
LinkedHashMap  → 加顺序
TreeMap        → 排序
ConcurrentHashMap → 线程安全
Hashtable      → 遗留
```
