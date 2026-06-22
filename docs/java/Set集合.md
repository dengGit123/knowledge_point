# Set 集合详解

> 📖 官方文档：[Set (Java Platform SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Set.html)
> 📖 [HashSet (Java Platform SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashSet.html)
> 📖 [TreeSet (Java Platform SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/TreeSet.html)
> 📖 菜鸟教程：[Java HashSet](https://www.runoob.com/java/java-hashset.html)

## 一、概述

`Set` 接口继承自 `Collection` 接口，它的核心特点是**不允许存储重复元素**。你可以把它理解为数学里的"**集合**"概念——里面的元素都是唯一的，不会有重复。

通俗地讲：

- **List** 像一个购物清单，同一个商品可以买多次（可重复）；
- **Set** 像一个会员名册，同一个会员只能登记一次（不可重复）。

Set 接口的核心特点：

| 特点         | 说明                                                        |
| ------------ | ----------------------------------------------------------- |
| **不可重复** | 两个相等的元素（`equals` 返回 true）只能存一个              |
| **通常无序** | `HashSet` 不保证插入顺序（`LinkedHashSet` 会维护顺序）      |
| **无索引**   | 不能像 List 那样用 `get(int)` 按下标取元素                  |
| **允许 null**| 大多数实现允许存一个 `null`（`TreeSet` 除外）               |

> 💡 **提示：** Set 判断"是否重复"依赖的是元素的 `hashCode()` 和 `equals()` 方法，而不是 `==`。这是 Set 最重要的知识点。

---

## 二、Set 接口体系结构

`Set` 是一个接口，主要有三大实现类：`HashSet`、`LinkedHashSet`、`TreeSet`。

```
        ┌──────────────────┐
        │   Iterable<T>    │   ← 可迭代接口
        └────────┬─────────┘
                 │ extends
        ┌────────▼─────────┐
        │ Collection<E>    │   ← 集合根接口
        └────────┬─────────┘
                 │ extends
        ┌────────▼─────────┐
        │   Set<E>         │   ← Set 接口（不可重复）
        └────────┬─────────┘
                 │ implements
   ┌─────────────┼─────────────────────┐
   │             │                     │
┌──▼───────┐ ┌──▼──────────┐ ┌────────▼────────┐
│ HashSet  │ │LinkedHashSet│ │    TreeSet      │
│(HashMap) │ │(LinkedHashMap)│ │   (TreeMap红黑树)│
│  无序    │ │  维护插入顺序 │ │   自动排序      │
└────┬─────┘ └─────────────┘ └─────────────────┘
     │ extends
     └── LinkedHashSet 是 HashSet 的子类
```

> 💡 **提示：** 可以看出 Set 的实现类底层其实都是借助 **Map** 来完成的——Set 中的元素被当作 Map 的 key 存储（value 用一个固定占位对象）。

---

## 三、三大实现类详解

### 1. HashSet（最常用）

**底层结构：基于 `HashMap`**

```
HashSet 的元素实际是 HashMap 的 key：

   ┌────────────────────────────────┐
   │           HashMap              │
   │  ┌─────┬───────────────────┐  │
   │  │ key │  value(固定PRESENT)│  │
   │  ├─────┼───────────────────┤  │
   │  │ "A" │   PRESENT(new Object)│  │  ← 所有元素共享同一个 value
   │  │ "B" │   PRESENT          │  │
   │  └─────┴───────────────────┘  │
   └────────────────────────────────┘
```

**特点：**

- **无序**：不保证迭代顺序，也不保证顺序随时间保持不变。
- **查询速度极快**：`add/contains/remove` 平均时间复杂度 **O(1)**。
- 允许存储 `null`（只能存一个）。
- **非线程安全**。

**适用场景：** 需要去重、快速判断元素是否存在（如标签集合、黑名单）。

### 2. LinkedHashSet

**底层结构：基于 `LinkedHashMap`**

它是 `HashSet` 的子类，在 `HashSet` 的基础上多维护了一条**双向链表**，用来记录元素的插入顺序。

```
HashSet(哈希表)         +        LinkedHashSet(哈希表 + 链表)

   散列分布                     散列分布 + 一条记录顺序的链表
   ┌─┐ ┌─┐ ┌─┐                  A ⇄ B ⇄ C ⇄ D  (按插入顺序串起来)
   │A│ │C│ │B│                  遍历时按链表顺序输出: A B C D
   └─┘ └─┘ └─┘
   (遍历顺序不确定)              (遍历顺序 = 插入顺序)
```

**特点：**

- 维护**插入顺序**（先进先出）。
- 性能略低于 `HashSet`（多维护了链表），但迭代性能更好。
- 允许存 `null`。

**适用场景：** 需要去重，又希望按插入顺序遍历（如实现 LRU 缓存的基础）。

### 3. TreeSet

**底层结构：基于 `TreeMap`（红黑树）**

```
TreeSet 底层是一棵红黑树（自平衡二叉搜索树）：

              ┌───┐
              │ D │
           ┌──┴───┴──┐
           │         │
        ┌──┴──┐   ┌──┴──┐
        │  B  │   │  F  │       ← 元素按大小自动排序存放
        └──┬──┘   └─────┘
        ┌──┴──┐
        │  A  │
        └─────┘
   遍历结果（中序）: A B D F  （升序）
```

**特点：**

- **自动排序**：元素按自然顺序或指定比较器排序。
- 查询、增删时间复杂度 **O(log n)**（比 HashSet 慢，但有序）。
- **不允许存 `null`**（无法与其它元素比较）。

**适用场景：** 需要去重且需要排序的场景（如排行榜、按时间排序的记录）。

---

## 四、常用 API

Set 的 API 比 List 少，因为它**没有索引相关的方法**。

```java
import java.util.HashSet;
import java.util.Set;

public class SetApiDemo {
    public static void main(String[] args) {
        Set<String> set = new HashSet<>();

        // 1. add(e)：添加元素（重复元素会被自动过滤）
        set.add("Java");
        set.add("Python");
        set.add("Java");       // ❌ 重复，添加失败，返回 false
        System.out.println(set); // [Java, Python]（顺序不保证）

        // 2. size()：元素个数
        System.out.println("个数: " + set.size()); // 2

        // 3. contains(o)：是否包含
        System.out.println("包含Java: " + set.contains("Java")); // true

        // 4. isEmpty()：是否为空
        System.out.println("是否为空: " + set.isEmpty()); // false

        // 5. remove(o)：删除指定元素
        boolean removed = set.remove("Python");
        System.out.println("删除结果: " + removed); // true

        // 6. clear()：清空
        set.clear();
        System.out.println("清空后个数: " + set.size()); // 0
    }
}
```

### API 速查表

| 方法               | 功能                 | 返回值                  |
| ------------------ | -------------------- | ----------------------- |
| `add(E e)`         | 添加元素（自动去重） | `boolean`（是否成功）   |
| `remove(Object o)` | 删除元素             | `boolean`               |
| `contains(Object o)` | 是否包含           | `boolean`               |
| `size()`           | 元素个数             | `int`                   |
| `isEmpty()`        | 是否为空             | `boolean`               |
| `clear()`          | 清空                 | `void`                  |

---

## 五、Set 的三种遍历方式

因为 Set 没有索引，所以**不能用普通 for + get(i)**，只能用迭代器或 Lambda。

```java
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

public class SetTraversalDemo {
    public static void main(String[] args) {
        Set<String> set = new HashSet<>();
        set.add("Java");
        set.add("Python");
        set.add("Go");

        // ✅ 方式1：增强 for（最常用）
        for (String s : set) {
            System.out.println(s);
        }

        // ✅ 方式2：Iterator 迭代器
        Iterator<String> it = set.iterator();
        while (it.hasNext()) {
            System.out.println(it.next());
        }

        // ✅ 方式3：forEach + Lambda（JDK 8+）
        set.forEach(s -> System.out.println(s));
    }
}
```

---

## 六、核心：HashSet 去重原理（面试高频）

### 1. 去重的判断流程

当调用 `set.add(e)` 时，HashSet 会这样判断：

```
   add(e)
     │
     ▼
  ┌──────────────────────────┐
  │ 1. 计算 e.hashCode()      │
  └────────────┬─────────────┘
               │
       ┌───────▼────────┐
       │ 哈希值对应桶为空？│
       └───┬────────┬────┘
           │ 是     │ 否(已有元素)
           ▼        ▼
       直接存入   遍历该桶元素:
                  ┌───────────────────────┐
                  │ 2. 逐个比较:           │
                  │   - hashCode 是否相等? │
                  │   - equals 是否相等?   │
                  │   (用 == 或 equals)    │
                  └────┬──────────┬───────┘
                       │ 相等     │ 都不相等
                       ▼          ▼
                   视为重复     存入(哈希冲突,挂链表/红黑树)
                   不存入
```

**关键结论：** 两个对象要被判定为"同一个"（重复），必须满足：
- **`hashCode()` 相等**，**并且** **`equals()` 返回 true**

### 2. 自定义类存入 HashSet 必须重写 hashCode 和 equals

下面是一个完整的 `Student` 示例。假设"学号相同即同一学生"，去重应基于学号。

```java
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class Student {
    private int id;       // 学号
    private String name;  // 姓名

    public Student(int id, String name) {
        this.id = id;
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                         // 同一个对象
        if (o == null || getClass() != o.getClass()) return false; // 类型不同
        Student student = (Student) o;
        return id == student.id;                            // 学号相同即相等
    }

    @Override
    public int hashCode() {
        // 关键：equals 用到哪个字段，hashCode 就基于哪个字段
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Student{id=" + id + ", name='" + name + "'}";
    }

    public static void main(String[] args) {
        Set<Student> set = new HashSet<>();
        set.add(new Student(1, "张三"));
        set.add(new Student(2, "李四"));
        set.add(new Student(1, "张三"));  // 学号相同，视为重复

        System.out.println(set.size());  // ✅ 2（去重成功）
        // 若不重写 hashCode/equals，这里会是 3（去重失败）
    }
}
```

### 3. 为什么重写 equals 必须重写 hashCode？（契约关系）

Java 对 `hashCode` 和 `equals` 有一个**契约（约定）**：

> 如果两个对象 `equals` 相等，那么它们的 `hashCode` **必须**也相等。

**不重写的后果（灾难场景）：**

```
假设只重写 equals（基于 id 判断相等），不重写 hashCode（用默认的内存地址）：

  Student(1,"张三")          Student(1,"张三")
   equals? → true ✅          hashCode → 35657359    hashCode → 1735600055
   (我们认为相等)             (两个不相等!) ❌

  结果：两个"相等"的对象被分到不同的桶里 → HashSet 认为它们不同 → 重复元素被存进去！
```

| 情况                            | equals 相等 | hashCode 相等 | HashSet 判定 |
| ------------------------------- | ----------- | ------------- | ------------ |
| 默认（不重写）                  | 看地址      | 看地址        | 按地址去重   |
| 只重写 equals                   | 按字段      | 看地址        | ❌ 去重失败  |
| 只重写 hashCode                 | 看地址      | 按字段        | ❌ 去重失败  |
| **equals 和 hashCode 都重写**   | 按字段      | 按字段        | ✅ 正确去重  |

> ⚠️ **注意：** IDE（如 IDEA）可以用快捷键 `Alt + Insert` → `equals() and hashCode()` 自动生成正确的重写代码，推荐直接用工具生成。

---

## 七、TreeSet 的两种排序方式

存入 `TreeSet` 的元素**必须可比较**，否则抛 `ClassCastException`。有两种排序方式：

### 1. 自然排序（元素自己实现 `Comparable`）

让元素类实现 `Comparable<T>` 接口，定义默认排序规则。

```java
import java.util.TreeSet;

public class Person implements Comparable<Person> {
    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 定义比较规则：按年龄升序
    @Override
    public int compareTo(Person other) {
        return Integer.compare(this.age, other.age); // 负数<零<正数 → 升序
    }

    @Override
    public String toString() {
        return name + "(" + age + ")";
    }

    public static void main(String[] args) {
        TreeSet<Person> set = new TreeSet<>();
        set.add(new Person("张三", 25));
        set.add(new Person("李四", 20));
        set.add(new Person("王五", 30));
        // 自动按年龄升序排列
        System.out.println(set); // [李四(20), 张三(25), 王五(30)]
    }
}
```

> ⚠️ **注意：** `compareTo` 返回 0 时，TreeSet 认为是同一个元素，会被去重！如果要按多个字段去重，需要把多个字段都加入比较。

### 2. 定制排序（构造器传入 `Comparator`）

不想让类实现 `Comparable`，或者想用**不同的排序规则**时，可以在创建 TreeSet 时传入 `Comparator`。

```java
import java.util.Comparator;
import java.util.TreeSet;

public class TreeSetComparatorDemo {
    public static void main(String[] args) {
        // 按字符串长度排序，长度相同按字典序
        TreeSet<String> set = new TreeSet<>((s1, s2) -> {
            int num = Integer.compare(s1.length(), s2.length());
            return num != 0 ? num : s1.compareTo(s2);
        });

        set.add("banana");
        set.add("apple");
        set.add("cat");
        set.add("dog");
        System.out.println(set); // [cat, dog, apple, banana]
        // cat/dog 长度3，apple长度5，banana长度6
    }
}
```

> 💡 **提示：** 当 `Comparator` 和 `Comparable` 同时存在时，`Comparator`（定制排序）优先级更高。

---

## 八、HashSet vs LinkedHashSet vs TreeSet 对比

| 对比维度       | HashSet              | LinkedHashSet        | TreeSet               |
| -------------- | -------------------- | -------------------- | --------------------- |
| 底层结构       | HashMap（数组+链表+红黑树）| LinkedHashMap（HashMap+链表）| TreeMap（红黑树）     |
| 是否有序       | ❌ 无序              | ✅ 插入顺序          | ✅ 排序（升序）       |
| 是否自动排序   | ❌                   | ❌                   | ✅                    |
| 查询性能       | **O(1)**             | O(1)                 | O(log n)              |
| 能否存 null    | ✅ 能（一个）        | ✅ 能（一个）        | ❌ 不能               |
| 线程安全       | ❌                   | ❌                   | ❌                    |
| 排序要求       | 无                   | 无                   | 元素须 Comparable 或传 Comparator |
| 适用场景       | 通用去重             | 去重 + 保序          | 去重 + 排序           |

---

## 九、注意事项与陷阱

### 1. TreeSet 存入不可比较的类型会报错

```java
TreeSet<Object> set = new TreeSet<>();
set.add("A");
set.add(123);  // ❌ 运行时抛 ClassCastException（String 和 Integer 无法比较）
```

### 2. 可变对象作为 Set 元素的陷阱

如果对象存入 Set 后，**修改了参与 `hashCode`/`equals` 计算的字段**，会导致元素"丢失"（找不到它，也删不掉）。所以 Set 中的元素最好是**不可变对象**。

```java
// ❌ 危险示例
Set<Student> set = new HashSet<>();
Student s = new Student(1, "张三");
set.add(s);
s.setId(2);  // 修改了参与 hashCode 计算的字段
set.contains(s);  // false！元素找不到了
```

### 3. HashSet 的 null 处理

```java
Set<String> set = new HashSet<>();
set.add(null);  // ✅ 允许存一个 null
set.add(null);  // 重复，不会添加
System.out.println(set.contains(null)); // true
```

> ⚠️ **注意：** `TreeSet` 不允许存 `null`，因为 `null` 无法与其它元素比较，会抛 `NullPointerException`。

---

## 十、面试常见问题

### Q1：HashSet 的底层原理？如何去重？

答：HashSet 底层是 `HashMap`，元素作为 key 存储，value 是一个固定的 `PRESENT` 对象。去重流程：①先计算元素的 `hashCode` 定位桶；②如果桶为空直接存入；③如果桶非空，再逐个用 `equals` 比较，若都相等则视为重复不存入。即"**hashCode 相等且 equals 相等才视为重复**"。

### Q2：为什么重写 equals 必须重写 hashCode？

答：Java 规定：两个 `equals` 相等的对象，`hashCode` 必须相等。HashSet/HashMap 先用 `hashCode` 分桶定位，再用 `equals` 精确比较。如果只重写 `equals`，两个"逻辑相等"的对象可能 `hashCode` 不同，被分到不同桶里，HashSet 就会认为它们不重复，导致去重失败。

### Q3：HashSet、LinkedHashSet、TreeSet 的区别？

答：① 底层不同，分别是 HashMap、LinkedHashMap、TreeMap；② 顺序不同，HashSet 无序，LinkedHashSet 维护插入顺序，TreeSet 自动排序；③ 性能不同，HashSet 查询 O(1) 最快，TreeSet 是 O(log n)；④ TreeSet 不能存 null，另外两个能存一个 null。

### Q4：TreeSet 如何排序？

答：两种方式：① 自然排序，让元素类实现 `Comparable<T>` 接口并重写 `compareTo`；② 定制排序，在 `new TreeSet<>(comparator)` 时传入 `Comparator`。注意 `compareTo` 返回 0 时元素会被去重。

### Q5：HashSet 能存 null 吗？TreeSet 呢？

答：HashSet 和 LinkedHashSet 可以存一个 `null`。TreeSet **不能**存 `null`，因为 `null` 无法参与比较，调用比较方法时会抛 `NullPointerException`。

### Q6：Set 和 List 的核心区别？

答：① List 有序可重复有索引，Set 不可重复通常无序且无索引；② List 可以用 `get(int)` 按下标访问，Set 不能；③ Set 的核心用途是**去重**，List 的核心用途是**保存有序序列**。

---

## 十一、总结

1. `Set` 的核心特点是**不可重复**，依赖 `hashCode` + `equals` 判断。
2. 三大实现类：`HashSet`（无序，O(1)，最常用）、`LinkedHashSet`（保插入顺序）、`TreeSet`（自动排序，红黑树）。
3. 自定义类存入 HashSet，**必须同时重写 `hashCode` 和 `equals`**（契约关系）。
4. TreeSet 排序有两种：自然排序（`Comparable`）和定制排序（`Comparator`）；元素必须可比较，且不能存 `null`。
5. 日常去重首选 `HashSet`；需要保序用 `LinkedHashSet`；需要排序用 `TreeSet`。
