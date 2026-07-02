# ArrayList 详解

> 📖 官方文档：[ArrayList (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html)

## 一、概述

**ArrayList 是 Java 中最常用的集合**，底层是一个**动态数组**——本质就是 `Object[]` 数组，长度不够时会自动扩容。

```
ArrayList 内部：
  Object[] elementData = [A, B, C, D, null, null, null, null, null, null]
                         └─────── 实际元素 ───────┘└─── 剩余空间 ───┘
                         size = 4              容量 = 10
```

### 三大特点

| 特点 | 说明 |
|-----|------|
| **有序** | 按插入顺序存储 |
| **可重复** | 允许存相同元素 |
| **查询快** | 按下标 `get(i)` 是 **O(1)** |
| **中间增删慢** | 要移动后面所有元素，**O(n)** |
| **非线程安全** | 多线程下要用 CopyOnWriteArrayList 或加锁 |

> 💡 **类比：** ArrayList 像一排**带编号的座位**，找第 N 个座位很快（O(1)）；但要在中间插一个座位，后面所有人都要往后挪（O(n)）。

---

## 二、基本用法

```java
import java.util.ArrayList;
import java.util.List;

// 创建
List<String> list = new ArrayList<>();          // 空列表
List<String> list2 = new ArrayList<>(100);      // 指定初始容量（优化用）
List<String> list3 = new ArrayList<>(list);     // 用已有集合创建

// 增
list.add("张三");                  // 尾部添加
list.add(0, "李四");               // 指定位置插入（后面的后移）
list.addAll(otherList);            // 批量添加

// 删
list.remove(0);                    // 按索引删（返回被删元素）
list.remove("张三");               // 按元素删（删第一个匹配的）
list.clear();                      // 清空

// 改
list.set(0, "王五");              // 替换指定位置的元素

// 查
list.get(0);                       // 取指定位置元素 O(1)
list.indexOf("张三");              // 找元素第一次出现的索引
list.contains("张三");             // 是否包含
list.size();                       // 元素个数
list.isEmpty();                    // 是否为空
```

> ⚠️ **注意 `remove` 的坑：** 当 List 存的是 `Integer` 时，`list.remove(1)` 是**按索引删**（删第 2 个元素），不是删元素 `1`。要按元素删整数用 `list.remove(Integer.valueOf(1))`。

---

## 三、扩容机制（核心原理！）

这是 ArrayList 最重要的原理，面试必考。

### 3.1 默认容量

```java
// ArrayList 内部源码
transient Object[] elementData;     // 存元素的数组
private static final int DEFAULT_CAPACITY = 10;   // 默认容量 10

// JDK 1.7：创建时就分配 10
// JDK 1.8+：创建时是空数组 {}，第一次 add 时才扩容到 10（懒加载）
```

### 3.2 扩容过程

```
1. add 元素时，检查 当前元素个数 size + 1 是否 > 数组容量
2. 超了 → 调用 grow() 扩容
3. 新容量 = 旧容量 × 1.5（oldCapacity + (oldCapacity >> 1)）
4. 把旧数组元素复制到新数组（Arrays.copyOf）
```

```java
// ArrayList 扩容源码简化
private void grow(int minCapacity) {
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1);  // 新容量 = 旧 × 1.5
    elementData = Arrays.copyOf(elementData, newCapacity); // 复制到新数组
}
```

**扩容示例：**

```
容量变化：10 → 15 → 22 → 33 → 49 → 73 → ... （每次 1.5 倍）

每次扩容都要【复制整个数组】，频繁扩容影响性能。
```

### 3.3 优化：提前指定容量

```java
// ❌ 如果知道要存 1000 个元素，却用默认 10，会扩容很多次（10→15→22→...）
List<Integer> list = new ArrayList<>();
for (int i = 0; i < 1000; i++) list.add(i);   // 多次数组复制，慢

// ✅ 提前指定容量，一次到位，不扩容
List<Integer> list = new ArrayList<>(1000);
```

```java
// 也可以先装满再trimToSize，去掉多余空间（省内存）
list.trimToSize();
```

> 💡 **提示：** 已知元素数量时，**构造时指定初始容量**，避免频繁扩容，是常见优化手段。

---

## 四、为什么查询快、中间增删慢

### 查询 O(1)

```java
list.get(5);
// 数组内存连续，直接算地址：基地址 + 5 × 元素大小 → 一步定位
```

### 中间插入 O(n)

```
在 index=2 插入元素 "X"：
  [A, B, C, D, E]      插入前
  [A, B, X, C, D, E]   插入后

  C, D, E 都要往后挪一位 → 移动 n-index 个元素
  头部插入要移动所有元素，最慢 O(n)
```

### 尾部增删快

```
add(e)：加在末尾，不用移动 → 接近 O(1)（不考虑扩容）
remove(size-1)：删末尾，不用移动 → O(1)
```

| 操作 | 时间复杂度 |
|-----|:--------:|
| `get(i)` / `set(i, e)` | O(1) |
| `add(e)` 尾部 | 均摊 O(1) |
| `add(i, e)` 中间 | O(n) |
| `remove(i)` 中间 | O(n) |
| `contains(e)` 查找 | O(n) |

---

## 五、线程不安全

ArrayList **不是线程安全**的，多线程同时 add 会导致数据丢失或抛异常：

```java
// ❌ 多线程下 ArrayList 出问题
List<Integer> list = new ArrayList<>();
for (int i = 0; i < 10; i++) {
    new Thread(() -> {
        for (int j = 0; j < 1000; j++) list.add(j);
    }).start();
}
// size 会小于 10000，甚至报 ArrayIndexOutOfBoundsException
```

**多线程下的替代方案：**

```java
// 方案1：Collections.synchronizedList 包装
List<String> list = Collections.synchronizedList(new ArrayList<>());

// 方案2：CopyOnWriteArrayList（读多写少时推荐）
List<String> list = new CopyOnWriteArrayList<>();

// 方案3：Vector（已淘汰，不推荐）
```

---

## 六、遍历与删除的坑

### 边遍历边删除

```java
List<String> list = new ArrayList<>(List.of("a", "b", "c", "b"));

// ❌ 方式1：for-each 中直接 remove → 抛 ConcurrentModificationException
for (String s : list) {
    if (s.equals("b")) list.remove(s);
}

// ❌ 方式2：普通 for 正向遍历删 → 漏删（删一个后索引前移）
for (int i = 0; i < list.size(); i++) {
    if (list.get(i).equals("b")) list.remove(i);   // 相邻的 "b" 会漏删
}

// ✅ 方式3：普通 for 倒序删（推荐）
for (int i = list.size() - 1; i >= 0; i--) {
    if (list.get(i).equals("b")) list.remove(i);
}

// ✅ 方式4：迭代器删除
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals("b")) it.remove();
}

// ✅ 方式5：Java 8+ removeIf（最简洁）
list.removeIf(s -> s.equals("b"));
```

---

## 七、常见问题

### Q1：ArrayList 默认容量是多少？什么时候分配？

```
默认容量 10。JDK 1.8+ 是懒加载：new 时是空数组 {}，第一次 add 才分配 10。
```

### Q2：ArrayList 扩容是扩多少？

```
扩到原来的 1.5 倍（newCapacity = oldCapacity + oldCapacity >> 1）。
```

### Q3：ArrayList 和数组什么关系？

```
ArrayList 底层就是 Object[] 数组，只是封装了自动扩容、增删等方法。
```

### Q4：ArrayList 和 LinkedList 怎么选？

```
查询多、增删在尾部 → ArrayList（绝大多数场景用它）
频繁在头部/中间增删 → LinkedList
日常开发 99% 用 ArrayList。
```

### Q5：Arrays.asList() 返回的 ArrayList 能用吗？

```
Arrays.asList() 返回的是 Arrays 的内部类，不是 java.util.ArrayList，
固定大小，不能 add/remove。要用就 new ArrayList<>(Arrays.asList(...))。
```

---

## 八、快速参考

### 核心 API

```java
add(e) / add(i, e)        // 增
remove(i) / remove(e)     // 删（注意 Integer 坑）
set(i, e)                 // 改
get(i)                    // 查 O(1)
size() / isEmpty() / contains(e)
```

### 关键特性

```
底层：动态数组 Object[]
默认容量：10，扩容 ×1.5
查询 O(1)，中间增删 O(n)
非线程安全
已知数量 → 构造时指定容量优化
遍历删除 → 用迭代器 / removeIf / 倒序 for
```
