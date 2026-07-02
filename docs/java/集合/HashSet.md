# HashSet 详解

> 📖 官方文档：[HashSet (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashSet.html)

## 一、概述

**HashSet 是最常用的 Set 实现**，底层基于 **HashMap**。它的核心特性是**不重复、无序**。

```
HashSet 特性：
  ✅ 不允许重复元素（去重）
  ✅ 允许 null（一个）
  ❌ 不保证顺序（存入和取出顺序可能不同）
  ❌ 非线程安全
```

> 💡 **类比：** HashSet 像一个"**自动去重的袋子**"——你往里丢东西，相同的只留一个；但你伸手去掏，掏出的顺序和放进去的顺序不一定一样。

---

## 二、底层原理：HashSet 就是 HashMap

这是 HashSet 最重要的原理——**HashSet 内部就是用一个 HashMap 来存数据**：

```java
// HashSet 源码核心
public class HashSet<E> extends AbstractSet<E> {
    private transient HashMap<E,Object> map;   // 内部就是一个 HashMap！

    // 一个固定的虚拟 value，所有元素都存成 key，value 用这个占位
    private static final Object PRESENT = new Object();

    public boolean add(E e) {
        return map.put(e, PRESENT) == null;    // 把元素当 key 存入 map
    }
}
```

```
HashSet 的元素 → 存成 HashMap 的 key
HashMap 的 value → 统一用一个固定的 PRESENT 对象（占位用）

所以 HashSet 的"去重"本质就是 HashMap 的"key 不重复"。
```

> 💡 **提示：** 要真正理解 HashSet，先理解 HashMap。HashSet 只是套了个壳，把元素当 key 存。

---

## 三、基本用法

```java
Set<String> set = new HashSet<>();

set.add("张三");            // 添加（重复的会被忽略）
set.add("李四");
set.add("张三");           // 不会重复添加，set.size() 还是 2
set.add(null);            // 允许一个 null

set.contains("张三");      // 是否包含（很快，O(1)）
set.remove("李四");        // 删除
set.size();               // 元素个数
set.isEmpty();
set.clear();
```

### 典型应用：去重

```java
// 列表去重：转成 Set 再转回 List
List<Integer> list = List.of(1, 2, 2, 3, 3, 3);
List<Integer> unique = new ArrayList<>(new HashSet<>(list));
// [1, 2, 3]（顺序可能变）

// 保持顺序的去重用 LinkedHashSet
List<Integer> unique2 = new ArrayList<>(new LinkedHashSet<>(list));
// [1, 2, 3]（保持原顺序）
```

---

## 四、去重原理：hashCode 和 equals（重点！）

HashSet 判断两个元素是否"重复"，靠的是 **hashCode() 和 equals()**：

```
add 元素时的判断流程：
  1. 调用元素的 hashCode()，定位到数组的某个位置
  2. 该位置没有元素 → 直接存
  3. 该位置有元素 → 调用 equals() 比较
     ├─ equals 返回 true  → 认为重复，不存
     └─ equals 返回 false → 认为不重复，存（哈希冲突，挂成链表/树）
```

### ⚠️ 自定义对象必须重写 hashCode 和 equals

```java
// ❌ 没重写：用 Object 默认的（按地址比较），两个内容相同的对象被认为是不同的
public class Student {
    String id;
    String name;
    // 没写 hashCode / equals
}

Set<Student> set = new HashSet<>();
set.add(new Student("001", "张三"));
set.add(new Student("001", "张三"));   // ⚠️ 会被当成两个不同对象！去重失败

// ✅ 重写 hashCode 和 equals（按 id 去重）
public class Student {
    String id;
    String name;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student s)) return false;
        return Objects.equals(id, s.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);   // 用 id 计算 hashCode
    }
}
```

> ⚠️ **最高警告：自定义对象放进 HashSet（或作为 HashMap 的 key），必须重写 hashCode() 和 equals()**，否则去重失效。**两个相等的对象必须返回相同的 hashCode**（这是契约）。

### hashCode 和 equals 的契约

```
1. equals 相等的两个对象，hashCode 必须相等
2. hashCode 相等的两个对象，equals 不一定相等（哈希冲突）
3. equals 不等，hashCode 尽量不等（减少冲突，提高性能）
```

> 💡 **提示：** IDEA 可以一键生成 hashCode 和 equals，不要手写。生成时选参与判断的字段（如 id）。

---

## 五、初始容量和负载因子

HashSet（基于 HashMap）有两个影响性能的参数：

```java
// 创建时指定
Set<String> set = new HashSet<>(16, 0.75f);
//                     ↑       ↑
//               初始容量    负载因子
```

| 参数 | 默认值 | 含义 |
|-----|-------|------|
| **初始容量** | 16 | 底层数组初始大小 |
| **负载因子** | 0.75 | 元素数达到 容量×0.75 时扩容（×2） |

```
容量 16，负载因子 0.75：
  当元素个数 > 16 × 0.75 = 12 时，扩容到 32
```

> 💡 **优化：** 如果知道元素数量，`new HashSet<>(预期数量 / 0.75 + 1)` 可避免扩容。

---

## 六、常见问题

### Q1：HashSet 怎么保证不重复？

```
通过 hashCode() 定位 + equals() 比较。本质是 HashSet 内部的 HashMap 的 key 不重复。
```

### Q2：HashSet 允许 null 吗？

```
允许一个 null。因为 HashMap 允许一个 null key。
```

### Q3：HashSet 是有序的吗？

```
不是。存取顺序不保证一致。要顺序用 LinkedHashSet，要排序用 TreeSet。
```

### Q4：HashSet 为什么查询快？

```
基于哈希表，add/contains/remove 都是平均 O(1)（哈希冲突严重时退化）。
```

### Q5：为什么自定义对象放 HashSet 要重写 hashCode 和 equals？

```
默认的 hashCode/equals 按内存地址比较，内容相同的两个对象会被当成不同对象，去重失败。
重写后，按业务字段（如 id）判断相等，才能正确去重。
```

---

## 七、快速参考

### 核心特性

```
底层：HashMap（元素当 key，value 用 PRESENT 占位）
不重复、无序、允许一个 null
add/contains/remove 平均 O(1)
非线程安全
自定义对象必须重写 hashCode + equals
初始容量 16，负载因子 0.75
```

### 去重原理

```
hashCode 定位位置
  → 位置空 → 存
  → 位置有 → equals 比较
            → 相等 → 重复，丢弃
            → 不等 → 哈希冲突，挂链表/红黑树
```

### 三种 Set 选择

```
不重复、不要顺序 → HashSet（首选）
不重复、要插入顺序 → LinkedHashSet
不重复、要排序 → TreeSet
```
