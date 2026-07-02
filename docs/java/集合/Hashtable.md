# Hashtable（遗留的线程安全 Map）

> 📖 官方文档：[Hashtable (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Hashtable.html)

## 一、概述

**Hashtable 是 Java 早期（JDK 1.0）的线程安全 Map**，现在已**被淘汰**，实际开发用 **ConcurrentHashMap** 代替。了解即可。

| 特性 | Hashtable | HashMap | ConcurrentHashMap |
|-----|-----------|---------|-------------------|
| 线程安全 | ✅（synchronized） | ❌ | ✅ |
| 允许 null | ❌ | ✅ | ❌ |
| 性能 | **差**（全表锁） | 快 | 快 |
| 版本 | JDK 1.0（老） | JDK 1.2 | JDK 1.5 |
| 推荐 | ❌ 淘汰 | ✅ | ✅ |

> 💡 **注意拼写：** 是 `Hashtable`（小写 t），不是 `HashTable`。HashMap 是大写 M。

---

## 二、为什么 Hashtable 性能差

Hashtable 给**每个方法**都加了 `synchronized`，锁住的是**整个 Hashtable 对象**：

```java
public synchronized V put(K key, V value) { ... }
public synchronized V get(Object key) { ... }
public synchronized int size() { ... }
// 所有方法都 synchronized
```

```
后果：
  - 同一时刻【整个表】只能被一个线程操作
  - 读读互斥、读写互斥、写写互斥
  - 即使两个线程操作【不同位置】，也要排队
  - 并发性能极差
```

**对比 ConcurrentHashMap：** 只锁单个桶，不同桶可并发，性能高得多。

---

## 三、Hashtable 的特点

```java
Hashtable<String, Integer> table = new Hashtable<>();

table.put("张三", 20);    // ✅
table.put(null, 1);       // ❌ NullPointerException（不允许 null key）
table.put("李四", null);  // ❌ NullPointerException（不允许 null value）

table.get("张三");
table.size();
```

| 特点 | 说明 |
|-----|------|
| 线程安全 | 每个方法 synchronized |
| 不允许 null | key 和 value 都不能为 null |
| 无序 | 存取顺序不保证 |
| 初始容量 | 11（不是 16） |
| 扩容 | `旧容量 × 2 + 1`（不是 ×2） |

---

## 四、HashMap vs Hashtable 详细对比

| 对比项 | HashMap | Hashtable |
|-------|---------|-----------|
| 线程安全 | ❌ | ✅（全表 synchronized） |
| null | 允许 1 个 null key，多个 null value | **不允许**任何 null |
| 初始容量 | 16 | 11 |
| 扩容 | ×2 | ×2 + 1 |
| 计算 hash | 用扰动函数（高16位异或） | 直接用 hashCode |
| 定位 | (n-1) & hash | (hash & 0x7FFFFFFF) % n |
| 父类 | AbstractMap | Dictionary（老） |
| 版本 | JDK 1.2 | JDK 1.0 |
| 推荐 | ✅ | ❌ |

---

## 五、替代方案

```
需要线程安全的 Map：
  ❌ Hashtable
  ✅ ConcurrentHashMap（强烈推荐）
  ✅ Collections.synchronizedMap(new HashMap<>())（次选）

ConcurrentHashMap 性能远优于 Hashtable，是现代标准。
```

```java
// ❌ 老写法
Map<String, Integer> map = new Hashtable<>();

// ✅ 新写法（多线程）
Map<String, Integer> map = new ConcurrentHashMap<>();

// ✅ 或（简单包装）
Map<String, Integer> map = Collections.synchronizedMap(new HashMap<>());
```

---

## 六、常见问题

### Q1：HashMap 和 Hashtable 的区别？

```
1. 线程安全：HashMap 不安全，Hashtable 安全（synchronized）
2. null：HashMap 允许，Hashtable 不允许
3. 容量：HashMap 初始16扩容×2，Hashtable 初始11扩容×2+1
4. 性能：HashMap 快，Hashtable 慢
5. 版本：HashMap JDK1.2，Hashtable JDK1.0
```

### Q2：为什么不推荐 Hashtable？

```
全表 synchronized，锁粒度太大，并发性能差。
需要线程安全时用 ConcurrentHashMap（细粒度锁，性能好）。
```

### Q3：Hashtable 和 ConcurrentHashMap 的区别？

```
都是线程安全的 Map。
- Hashtable：全表加锁，性能差，已淘汰
- ConcurrentHashMap：1.7 分段锁 / 1.8 CAS+synchronized 锁单个桶，性能好
- Hashtable 允许的 null？不，也不允许
```

### Q4：Hashtable 为什么不允许 null？

```
设计如此。contains/get 返回 null 会有二义性，
Hashtable 选择直接禁止，强制明确。
（ConcurrentHashMap 也是同样原因禁止 null）
```

---

## 七、快速参考

### 一句话总结

```
Hashtable = 线程安全但性能差的 Map（已淘汰）
全表 synchronized，锁粒度太大
不允许 null key/value
初始容量 11，扩容 ×2+1
```

### 牢记

```
看到 Hashtable → 知道是线程安全的老 Map，别用
需要线程安全 → ConcurrentHashMap
需要 null → HashMap（单线程）
```

### 对比速记

```
                 HashMap   Hashtable   ConcurrentHashMap
线程安全          ❌          ✅              ✅
性能              快          慢              快
null             ✅          ❌              ❌
推荐             ✅(单线程)   ❌              ✅(多线程)
```
