# TreeSet 详解

> 📖 官方文档：[TreeSet (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeSet.html)

## 一、概述

**TreeSet 底层是红黑树（基于 TreeMap）**，它的核心特性是**不重复 + 自动排序**。

```
TreeSet 特性：
  ✅ 不允许重复
  ✅ 自动排序（按元素大小/指定规则）
  ❌ 不允许 null（会抛 NullPointerException）
  ❌ 非线程安全
  ⚠️ 增删查都是 O(log n)
```

```
存入 5, 2, 8, 1, 3：
  HashSet：        [1, 2, 3, 5, 8]（顺序不定）
  LinkedHashSet：  [5, 2, 8, 1, 3]（插入顺序）
  TreeSet：        [1, 2, 3, 5, 8]（自动从小到大排序）✅
```

> 💡 **类比：** TreeSet 像一个"**自动排序的书架**"——你随手往里放书，它自动按字母顺序摆好，你拿出来的永远是排好序的。

---

## 二、底层原理：红黑树

```
TreeSet 内部是 TreeMap（key 存元素，value 固定占位），TreeMap 底层是【红黑树】。

红黑树是一种自平衡二叉搜索树：

        存入 5, 2, 8, 1, 3 后的结构：

                5
              /   \
             2     8
            / \
           1   3

  - 左子节点 < 父节点 < 右子节点
  - 自平衡：保证树高约 log n
  - 增删查都是 O(log n)
```

**红黑树的特点：**

| 特点 | 说明 |
|-----|------|
| 自平衡 | 插入删除后会自动调整，保持树大致平衡 |
| 有序 | 中序遍历得到有序序列 |
| 性能 | 增删查 O(log n)（比 HashSet 的 O(1) 慢，但能排序） |

> 💡 **提示：** TreeSet 比 HashSet 慢（O(log n) vs O(1)），但优势是**自动排序**和**范围查询**。

---

## 三、两种排序方式

TreeSet 怎么知道元素"谁大谁小"？有两种方式：

### 1. 自然排序（元素实现 Comparable）

让元素类实现 `Comparable` 接口：

```java
public class Student implements Comparable<Student> {
    String name;
    int age;

    // 定义比较规则：按年龄排序
    @Override
    public int compareTo(Student other) {
        return Integer.compare(this.age, other.age);
        // 负数：this < other
        // 0：相等（TreeSet 认为重复，不存）
        // 正数：this > other
    }
}
```

```java
TreeSet<Student> set = new TreeSet<>();
set.add(new Student("张三", 20));
set.add(new Student("李四", 18));
set.add(new Student("王五", 25));
// 遍历结果按年龄从小到大：李四(18) → 张三(20) → 王五(25)
```

### 2. 定制排序（构造时传 Comparator）

不改动元素类，在创建 TreeSet 时指定比较器：

```java
// 按字符串长度排序
TreeSet<String> set = new TreeSet<>((a, b) -> a.length() - b.length());
set.add("apple");    // 5
set.add("hi");       // 2
set.add("cat");      // 3
// 遍历：hi(2) → cat(3) → apple(5)
```

```java
// 逆序
TreeSet<Integer> set = new TreeSet<>(Comparator.reverseOrder());
set.add(1); set.add(3); set.add(2);
// 遍历：3 → 2 → 1（降序）
```

### 两种方式对比

| 方式 | 实现 | 适用 |
|-----|------|------|
| 自然排序 Comparable | 元素类实现 `compareTo` | 比较规则固定（如年龄、价格） |
| 定制排序 Comparator | 构造时传比较器 | 临时规则、不能改类、多种排序 |

> ⚠️ **注意：TreeSet 判定"重复"靠 compareTo 返回 0，不是 equals。** 所以 compareTo 返回 0 的两个元素会被当成重复，即使 equals 不同。

---

## 四、基本用法与特有方法

```java
TreeSet<Integer> set = new TreeSet<>();
set.add(5); set.add(2); set.add(8); set.add(1); set.add(3);

set.first();            // 最小元素 → 1
set.last();             // 最大元素 → 8
set.lower(3);           // 小于 3 的最大元素 → 2
set.higher(3);          // 大于 3 的最小元素 → 5
set.floor(3);           // ≤ 3 的最大 → 3
set.ceiling(3);         // ≥ 3 的最小 → 3

// 范围查询（TreeSet 的强项）
set.headSet(3);         // < 3 的元素 → [1, 2]
set.tailSet(3);         // ≥ 3 的元素 → [3, 5, 8]
set.subSet(2, 5);       // [2, 5) 之间的 → [2, 3]

// 删除并返回
set.pollFirst();        // 删除并返回最小 → 1
set.pollLast();         // 删除并返回最大 → 8
```

> 💡 **提示：** 这些范围查询方法（headSet/tailSet/subSet）是 TreeSet 独有的，HashSet 没有。需要"取前 N 小""区间内元素"时用 TreeSet。

---

## 五、TreeSet 不允许 null

```java
TreeSet<String> set = new TreeSet<>();
set.add(null);   // ❌ 抛 NullPointerException
```

**原因：** TreeSet 要比较元素大小，调用 `compareTo` 或 `compare` 时，null 会抛空指针。

> ⚠️ **注意：** HashSet/LinkedHashSet 允许 null，但 TreeSet 不允许。

---

## 六、三种 Set 对比

| 特性 | HashSet | LinkedHashSet | TreeSet |
|-----|---------|---------------|---------|
| 底层 | HashMap | LinkedHashMap | TreeMap（红黑树） |
| 顺序 | 无序 | 插入顺序 | **排序** |
| 允许 null | ✅ | ✅ | ❌ |
| 性能 | **O(1)** | O(1) | O(log n) |
| 范围查询 | ❌ | ❌ | ✅ |
| 适用 | 去重（首选） | 去重+保序 | 去重+排序 |

---

## 七、常见问题

### Q1：TreeSet 底层是什么？

```
红黑树（基于 TreeMap）。一种自平衡二叉搜索树。
```

### Q2：TreeSet 怎么排序的？

```
两种方式：
  1. 元素实现 Comparable 接口（自然排序）
  2. 构造 TreeSet 时传 Comparator（定制排序）
通过 compareTo / compare 的返回值决定顺序。
```

### Q3：TreeSet 怎么判断重复？

```
靠 compareTo 返回 0（不是 equals）。返回 0 即视为重复，不会存入。
```

### Q4：TreeSet 性能为什么比 HashSet 差？

```
TreeSet 增删查是 O(log n)（红黑树），HashSet 是 O(1)（哈希表）。
TreeSet 牺牲了速度换取了【排序】和【范围查询】能力。
```

### Q5：TreeSet 为什么不能存 null？

```
TreeSet 要比较元素，比较时调用 compareTo/compare，遇到 null 会抛 NullPointerException。
```

---

## 八、快速参考

### 核心特性

```
底层：TreeMap（红黑树）
不重复 + 自动排序
增删查 O(log n)
不允许 null
需要元素可比较（Comparable 或 Comparator）
```

### 两种排序

```java
// 自然排序：元素实现 Comparable
class Student implements Comparable<Student> {
    public int compareTo(Student o) { ... }
}

// 定制排序：构造时传 Comparator
new TreeSet<>(Comparator.comparing(Student::getAge));
```

### 独有方法

```java
first() / last()              // 最小/最大
lower(x) / higher(x)          // 小于/大于 x 的
headSet(x) / tailSet(x)       // 范围
subSet(from, to)              // 区间
pollFirst() / pollLast()      // 取出并删除
```

### 三种 Set 选择

```
去重不要顺序 → HashSet
去重要插入顺序 → LinkedHashSet
去重要排序 / 范围查询 → TreeSet
```
