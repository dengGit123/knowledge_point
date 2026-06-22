# List 集合详解

> 📖 官方文档：[List (Java Platform SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/List.html)
> 📖 [ArrayList (Java Platform SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ArrayList.html)
> 📖 菜鸟教程：[Java ArrayList](https://www.runoob.com/java/java-arraylist.html)

## 一、概述

`List` 是 Java 集合框架中**最常用**的接口之一，它继承自 `Collection` 接口，代表一个**有序、可重复**的元素集合。你可以把它理解为一个"**长度可变的数组**"——既能像数组一样通过索引（下标）快速访问元素，又不用提前固定大小，可以随时增删。

通俗地讲：

- **数组**就像一个固定排数（比如 10 个座位）的储物柜，满了就放不下了；
- **List** 就像一个会"自动扩容"的储物柜，东西多了它会自己加座位。

List 接口的三大核心特点：

| 特点       | 说明                                            |
| ---------- | ----------------------------------------------- |
| **有序**   | 存入顺序和取出顺序一致（按插入顺序保存）        |
| **可重复** | 允许存储相同的元素（用索引区分）                |
| **有索引** | 每个元素都有一个 int 类型的下标，从 0 开始      |

---

## 二、List 接口体系结构

`List` 是一个接口，它有多个实现类。日常开发中最常用的是 `ArrayList` 和 `LinkedList`，`Vector` 已基本不用。

```
        ┌──────────────────┐
        │   Iterable<T>    │   ← 可迭代接口（支持 for-each）
        └────────┬─────────┘
                 │ extends
        ┌────────▼─────────┐
        │ Collection<E>    │   ← 集合根接口
        └────────┬─────────┘
                 │ extends
        ┌────────▼─────────┐
        │   List<E>        │   ← List 接口（有序、可重复、有索引）
        └────────┬─────────┘
                 │ implements
   ┌─────────────┼─────────────────┐
   │             │                 │
┌──▼───────┐ ┌──▼────────┐ ┌──────▼──────┐
│ArrayList │ │ LinkedList│ │   Vector    │
│  (数组)  │ │  (双向链表)│ │(同步,已淘汰)│
└──────────┘ │ + Deque   │ └─────────────┘
             └───────────┘
```

> 💡 **提示：** `LinkedList` 同时实现了 `List` 和 `Deque`（双端队列）接口，所以它既可以当列表用，也可以当队列、栈用。

---

## 三、三大实现类详解

### 1. ArrayList（最常用）

**底层结构：基于动态数组（`Object[]`）**

```java
// ArrayList 内部本质就是一个数组
transient Object[] elementData;
```

**特点：**

- 查询（按下标 `get(i)`）非常快，时间复杂度 **O(1)**，因为数组在内存中是连续的，可以直接算出地址。
- 在**中间或头部**插入/删除元素慢，**O(n)**，因为要移动后面所有元素。
- **非线程安全**（多线程下不要直接用）。
- 允许存储 `null`。

**适用场景：** 读多写少、遍历频繁的场景（绝大多数业务场景都选它）。

### 2. LinkedList

**底层结构：基于双向链表**

```
双向链表结构示意：

    ┌──┐    ┌──┐    ┌──┐    ┌──┐
头→ │A │ ⇄  │B │ ⇄  │C │ ⇄  │D │ ←尾
    └──┘    └──┘    └──┘    └──┘
   每个节点(Node)保存: 数据 item + 前驱指针 prev + 后继指针 next
```

**特点：**

- 在**首尾**增删元素非常快，**O(1)**（只需修改指针，不用移动其他元素）。
- 按下标查询慢，**O(n)**，必须从头/尾顺藤摸瓜一个个找。
- 同时实现 `Deque` 接口，可用作队列（`offer/poll`）、栈（`push/pop`）。
- **非线程安全**。

**适用场景：** 频繁在头尾增删元素、需要队列/栈功能的场景。

### 3. Vector（已淘汰，了解即可）

**底层结构：基于动态数组，与 ArrayList 类似**

**特点：**

- 所有方法都用 `synchronized` 修饰，**线程安全**，但性能差。
- 扩容为原来的 **2 倍**（ArrayList 是 1.5 倍）。
- 是 JDK 1.0 的古老类，**已不推荐使用**。

> ⚠️ **注意：** 需要线程安全的 List 时，请用 `Collections.synchronizedList()` 或 `CopyOnWriteArrayList`，而不是 `Vector`。

---

## 四、常用 API

下面以 `ArrayList` 为例，演示 List 的常用方法。

```java
import java.util.ArrayList;
import java.util.List;

public class ListApiDemo {
    public static void main(String[] args) {
        // 1. 创建 List（JDK 7 开始支持菱形语法 <>）
        List<String> list = new ArrayList<>();

        // 2. add(e)：添加元素（尾部追加）
        list.add("Java");
        list.add("Python");
        list.add("Go");
        list.add("Java");      // 可重复
        System.out.println(list); // [Java, Python, Go, Java]

        // 3. add(index, e)：在指定位置插入元素
        list.add(1, "C++");
        System.out.println(list); // [Java, C++, Python, Go, Java]

        // 4. get(index)：根据索引获取元素
        String second = list.get(1);
        System.out.println("索引1的元素: " + second); // C++

        // 5. set(index, e)：修改指定位置的元素，返回旧值
        String old = list.set(0, "JavaScript");
        System.out.println("被替换的旧值: " + old); // Java

        // 6. size()：返回元素个数
        System.out.println("元素个数: " + list.size()); // 5

        // 7. contains(o)：是否包含某元素
        System.out.println("是否包含Go: " + list.contains("Go")); // true

        // 8. indexOf(o)：返回元素第一次出现的索引（不存在返回 -1）
        System.out.println("Java首次位置: " + list.indexOf("Java")); // 4
        System.out.println("Rust的位置: " + list.indexOf("Rust"));   // -1

        // 9. isEmpty()：是否为空
        System.out.println("是否为空: " + list.isEmpty()); // false

        // 10. remove(int index) vs remove(Object o) —— 注意重载！
        //    删除索引 0 的元素（按索引删）
        list.remove(0);
        //    删除值为 "Go" 的元素（按对象删，返回是否成功）
        list.remove("Go");

        // 11. subList(fromIndex, toIndex)：返回子列表（左闭右开，视图）
        List<String> sub = list.subList(0, 2);
        System.out.println("子列表: " + sub);

        // 12. clear()：清空集合
        list.clear();
        System.out.println("清空后: " + list + ", 是否为空: " + list.isEmpty());
    }
}
```

> ⚠️ **注意 `remove` 的重载陷阱：** 当 List 中存的是 `Integer` 时，`list.remove(1)` 会被当作按**索引删除**，而非删除值为 1 的对象！想按对象删应写成 `list.remove(Integer.valueOf(1))`。

### API 速查表

| 方法                                | 功能                          | 返回值               |
| ----------------------------------- | ----------------------------- | -------------------- |
| `add(E e)`                          | 尾部添加                      | `boolean`            |
| `add(int index, E e)`               | 指定位置插入                  | `void`               |
| `get(int index)`                    | 按索引取元素                  | `E`                  |
| `set(int index, E e)`               | 替换指定位置元素              | `E`（旧值）          |
| `remove(int index)`                 | 按索引删除                    | `E`（被删元素）      |
| `remove(Object o)`                  | 按对象删除（第一个匹配）      | `boolean`            |
| `size()`                            | 元素个数                      | `int`                |
| `contains(Object o)`                | 是否包含                      | `boolean`            |
| `indexOf(Object o)`                 | 第一次出现的索引              | `int`（无则 -1）     |
| `isEmpty()`                         | 是否为空                      | `boolean`            |
| `clear()`                           | 清空                          | `void`               |
| `subList(int from, int to)`         | 子列表（左闭右开视图）        | `List<E>`            |

---

## 五、List 的五种遍历方式

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

public class ListTraversalDemo {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("A");
        list.add("B");
        list.add("C");

        // ✅ 方式1：普通 for + get(i)（依赖索引，ArrayList 最快，LinkedList 慢）
        for (int i = 0; i < list.size(); i++) {
            System.out.print(list.get(i) + " ");
        }

        // ✅ 方式2：增强 for（底层是 Iterator，简洁，但不能修改结构）
        for (String s : list) {
            System.out.print(s + " ");
        }

        // ✅ 方式3：Iterator 迭代器（可以安全删除元素）
        Iterator<String> it = list.iterator();
        while (it.hasNext()) {
            String s = it.next();
            if ("B".equals(s)) {
                it.remove(); // ✅ 遍历中安全删除
            }
        }

        // ✅ 方式4：ListIterator（Iterator 的增强版，可双向遍历、可 set/add）
        ListIterator<String> lit = list.listIterator();
        while (lit.hasNext()) {
            String s = lit.next();
            // lit.hasPrevious(); lit.previous(); // 可向前遍历
            // lit.set("X"); // 替换当前元素
            // lit.add("Y"); // 在当前位置插入
        }

        // ✅ 方式5：forEach + Lambda（JDK 8+，最简洁）
        list.forEach(s -> System.out.print(s + " "));
    }
}
```

### 五种遍历方式对比

| 遍历方式             | 适用场景                       | 能否边遍历边删除 | 备注                          |
| -------------------- | ------------------------------ | ---------------- | ----------------------------- |
| 普通 for + get       | ArrayList 按索引操作           | 麻烦（需倒序删） | LinkedList 下标访问 O(n) 慢   |
| 增强 for             | 只读遍历                       | ❌ 报错          | 语法最简洁                    |
| Iterator             | 需要边遍历边删除               | ✅               | 单向遍历                      |
| ListIterator         | 需要双向遍历/修改              | ✅               | 仅 List 有                    |
| forEach + Lambda     | 只读遍历（JDK 8+）             | ❌ 报错          | 函数式风格                    |

---

## 六、ArrayList 扩容机制（面试高频）

### 1. 初始容量（懒加载）

- **JDK 7**：创建 `new ArrayList()` 时，**直接**初始化一个长度为 10 的数组。
- **JDK 8**：创建时数组指向一个**空数组** `{}`（`DEFAULTCAPACITY_EMPTY_ELEMENTDATA`），**第一次 add 时**才真正分配长度为 10 的数组（懒加载，节省内存）。

### 2. 扩容为 1.5 倍

当元素数量超过数组容量时触发扩容：

```java
// ArrayList 源码核心扩容逻辑（简化）
private int newCapacity(int minCapacity) {
    int oldCapacity = elementData.length;
    // 新容量 = 旧容量 + 旧容量/2（即 1.5 倍）
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    // ...
}
```

扩容后，用 `Arrays.copyOf()` 把旧数组数据复制到新数组：

```java
elementData = Arrays.copyOf(elementData, newCapacity);
```

### 3. 扩容流程图

```
   new ArrayList<>()            第一次 add
        │                            │
        ▼                            ▼
   ┌─────────────┐            ┌───────────────┐
   │ 空数组 {}    │  ────────▶ │ 分配长度 10    │   (JDK 8 懒加载)
   │ (JDK 8)     │            │ 的数组         │
   └─────────────┘            └───────┬───────┘
                                       │ 元素装满(到第11个)
                                       ▼
                              ┌────────────────┐
                              │ 扩容为 1.5 倍   │  10 → 15 → 22 → 33 ...
                              │ = 10 + 10/2 = 15│
                              └────────────────┘
                                       │ Arrays.copyOf 复制
                                       ▼
                                 指向新的更大数组
```

> 💡 **提示：** 如果能预估元素数量，建议用 `new ArrayList<>(100)` 指定初始容量，避免多次扩容（每次扩容都要数组复制，有性能开销）。

---

## 七、fail-fast 快速失败机制

### 1. 什么是 fail-fast？

在用 **Iterator 或增强 for** 遍历集合时，如果**其它途径**（比如直接调用 `list.add/remove`）修改了集合的"结构"（增删元素），迭代器会立即抛出 `ConcurrentModificationException`（并发修改异常）。这是一种"快速失败、尽早暴露问题"的保护机制。

### 2. 错误演示

```java
List<String> list = new ArrayList<>();
list.add("A");
list.add("B");
list.add("C");

// ❌ 错误：增强 for 中直接调用 list.remove，会抛 ConcurrentModificationException
for (String s : list) {
    if ("B".equals(s)) {
        list.remove(s); // ❌ 并发修改异常
    }
}
```

### 3. 正确删除方式

```java
// ✅ 方式1：用 Iterator.remove()
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if ("B".equals(it.next())) {
        it.remove(); // ✅ 迭代器自己的删除方法
    }
}

// ✅ 方式2：用 Java 8 的 removeIf（最简洁）
list.removeIf(s -> "B".equals(s));

// ✅ 方式3：普通 for 倒序删除（注意必须倒序，否则会跳过元素）
for (int i = list.size() - 1; i >= 0; i--) {
    if ("B".equals(list.get(i))) {
        list.remove(i);
    }
}
```

> ⚠️ **注意：** fail-fast 是通过 `modCount` 计数器实现的。迭代器在创建时记录 `expectedModCount`，每次 `next()` 都会比较两者，不一致就抛异常。这是**尽力而为**的机制，不能完全依赖它来保证并发安全。

---

## 八、ArrayList vs LinkedList 详细对比

| 对比维度     | ArrayList                  | LinkedList                       |
| ------------ | -------------------------- | -------------------------------- |
| 底层数据结构 | 动态数组                   | 双向链表                         |
| 查询 get(i)  | **O(1)**（按地址直接访问） | O(n)（从头/尾遍历）              |
| 中间插入删除 | O(n)（需移动元素）         | O(n)（定位慢，但删除本身 O(1)）  |
| 头部插入删除 | O(n)                       | **O(1)**                          |
| 尾部插入     | 均摊 O(1)                  | O(1)                             |
| 内存占用     | 较小（连续内存）           | 较大（每个节点多存两个指针）     |
| 随机访问     | ✅ 强                      | ❌ 弱                            |
| 可作队列/栈  | ❌ 不适合                  | ✅ 实现 Deque 接口               |
| 应用场景     | 读多写少、随机访问         | 频繁头尾增删、队列/栈            |

> 💡 **提示：** 实际开发中 **95% 的场景都用 ArrayList**。即使是"频繁增删"，只要不是在头部频繁操作，ArrayList 由于内存连续、缓存友好，性能往往也不输 LinkedList。

---

## 九、线程安全方案

ArrayList 和 LinkedList 都**非线程安全**。多线程下需要：

### 方案 1：Collections.synchronizedList()

```java
// 包装成线程安全的 List（所有方法加 synchronized 锁）
List<String> syncList = Collections.synchronizedList(new ArrayList<>());

// ⚠️ 遍历时仍需手动加锁
synchronized (syncList) {
    for (String s : syncList) {
        System.out.println(s);
    }
}
```

特点：读写都加锁，性能一般。

### 方案 2：CopyOnWriteArrayList（推荐读多写少场景）

```java
import java.util.concurrent.CopyOnWriteArrayList;

// 写时复制：每次写操作都复制一份新数组
CopyOnWriteArrayList<String> cowList = new CopyOnWriteArrayList<>();
cowList.add("A");
```

**原理：** 写操作（add/remove）时，先 `ReentrantLock` 加锁，然后**复制整个底层数组**到新数组，在新数组上修改，最后把引用指向新数组。

```
写时复制示意图：
   读线程 ──┐                          ┌── 始终读旧数组（无锁，极快）
            ├─→ 共享数组引用 ──────────┤
   写线程 ──┘                          └── 写时: 加锁 → 复制新数组 → 修改 → 切换引用
```

| 方案                       | 适用场景           | 读写性能             |
| -------------------------- | ------------------ | -------------------- |
| `synchronizedList`         | 读写都较多         | 读写都加锁，中等     |
| `CopyOnWriteArrayList`     | **读多写少**       | 读极快（无锁），写慢 |

---

## 十、面试常见问题

### Q1：ArrayList 和 LinkedList 的区别？

答：① 底层结构不同，ArrayList 是动态数组，LinkedList 是双向链表；② 查询性能不同，ArrayList 按下标 O(1)，LinkedList 是 O(n)；③ 增删性能不同，ArrayList 中间增删要移动元素 O(n)，LinkedList 头尾增删 O(1)；④ 内存占用不同，LinkedList 每个节点额外存前后指针，更占内存；⑤ 应用场景不同，读多写少用 ArrayList，频繁头尾操作用 LinkedList。

### Q2：ArrayList 的扩容机制？

答：JDK 8 中，`new ArrayList()` 创建时是空数组，**第一次 add** 才初始化长度为 10 的数组。当元素装满后，扩容为原来的 **1.5 倍**（`oldCapacity + (oldCapacity >> 1)`），通过 `Arrays.copyOf` 复制元素到新数组。

### Q3：遍历 List 时如何安全删除元素？

答：① 用 `Iterator.remove()`；② Java 8 用 `list.removeIf(条件)`；③ 用普通 for **倒序**删除。**不能**在增强 for 或迭代器遍历时直接调用 `list.remove()`，会抛 `ConcurrentModificationException`（fail-fast 机制）。

### Q4：ArrayList 是线程安全的吗？如何实现线程安全？

答：不是。可以：① `Collections.synchronizedList(new ArrayList<>())`；② 用 `CopyOnWriteArrayList`（读多写少场景，读无锁，写时复制）；③ 用 `Vector`（已淘汰，不推荐）。

### Q5：ArrayList 的 `remove(int)` 和 `remove(Object)` 怎么区分？

答：这是方法重载。`remove(int index)` 按索引删，`remove(Object o)` 按对象删。当 List 泛型是 `Integer` 时，`list.remove(1)` 默认匹配 `remove(int)` 即删除索引 1 的元素。想删除值为 1 的对象，要写 `list.remove(Integer.valueOf(1))`。

### Q6：CopyOnWriteArrayList 的原理和适用场景？

答：写时复制。每次写操作（add/remove）加锁后复制一份新数组来修改，读操作完全无锁。适合**读多写少**的场景（如监听器列表、配置缓存）。缺点是写操作开销大（要复制整个数组），且数据有短暂不一致（读到的是旧快照）。

---

## 十一、总结

1. `List` 是**有序、可重复、有索引**的集合，继承自 `Collection`。
2. 三大实现类：`ArrayList`（数组，查询快）、`LinkedList`（链表，头尾增删快）、`Vector`（已淘汰）。
3. `ArrayList` 扩容：首次 add 初始化容量 10，之后每次扩容 **1.5 倍**，用 `Arrays.copyOf` 复制。
4. 遍历有 5 种方式，**只读**用增强 for 或 forEach，**需删除**用 Iterator 或 removeIf。
5. 遍历时直接用集合方法增删会触发 **fail-fast**，抛 `ConcurrentModificationException`。
6. 实际开发 **首选 ArrayList**；需要线程安全用 `synchronizedList` 或 `CopyOnWriteArrayList`。
