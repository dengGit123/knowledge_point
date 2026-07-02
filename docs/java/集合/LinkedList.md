# LinkedList 详解

> 📖 官方文档：[LinkedList (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/LinkedList.html)

## 一、概述

**LinkedList 底层是双向链表**，它同时实现了 `List` 和 `Deque` 接口，所以既能当列表用，也能当**队列**和**栈**用。

```
LinkedList 内部结构（双向链表）：

  first                                          last
   │                                              │
   ▼                                              ▼
┌──────┐    ──►    ┌──────┐    ──►    ┌──────┐
│ A    │           │ B    │           │ C    │
│ next │           │ next │           │ next │ = null
│prev=null         │prev  │◄──        │prev  │◄──
└──────┘           └──────┘           └──────┘

每个节点 Node 存三个东西：prev(前驱) + item(数据) + next(后继)
```

### 节点结构（源码）

```java
private static class Node<E> {
    E item;          // 数据
    Node<E> next;    // 下一个节点
    Node<E> prev;    // 上一个节点

    Node(Node<E> prev, E element, Node<E> next) {
        this.item = element;
        this.next = next;
        this.prev = prev;
    }
}
```

### 三大特点

| 特点 | 说明 |
|-----|------|
| **增删快** | 头尾增删只需改指针，**O(1)** |
| **查询慢** | 必须从头/尾遍历，`get(i)` 是 **O(n)** |
| **有序可重复** | 作为 List 的特性 |
| **可当队列/栈** | 实现了 Deque 接口 |
| **非线程安全** | 多线程要用并发集合 |

> 💡 **类比：** LinkedList 像一串**手拉手的人**，每个人记着前后是谁。要插入新人，只需"松开两只手重新拉"，不用像数组那样整体移动；但要找第 N 个人，只能从第一个开始一个个数过去。

---

## 二、作为 List 使用

```java
LinkedList<String> list = new LinkedList<>();

list.add("张三");           // 尾部添加
list.add(0, "李四");        // 指定位置插入
list.get(0);               // ⚠️ 查询慢 O(n)，不要频繁用 get
list.set(0, "王五");
list.remove(0);
list.size();
```

> ⚠️ **注意：LinkedList 的 `get(i)` 是 O(n)**（要从头遍历），**不要用普通 for + get 遍历 LinkedList**，性能很差，要用迭代器。

---

## 三、作为队列 Queue 使用（先进先出 FIFO）

LinkedList 实现了 `Deque`，提供队列操作：

```java
LinkedList<String> queue = new LinkedList<>();

// 入队（从队尾进）
queue.offer("张三");    // 等价于 addLast
queue.offer("李四");

// 看队首（不删除）
queue.peek();          // "张三"

// 出队（从队首出）
queue.poll();          // 返回 "张三" 并删除

// 结果：先进先出，张三先出
```

| 队列方法 | 作用 | 失败时 |
|---------|------|--------|
| `offer(e)` | 入队 | 返回 false |
| `poll()` | 出队 | 返回 null |
| `peek()` | 查看队首 | 返回 null |
| `add(e)` / `remove()` / `element()` | 同上 | 抛异常 |

> 💡 **提示：** `offer/poll/peek` 失败返回 null/false（推荐），`add/remove/element` 失败抛异常。

---

## 四、作为栈 Stack 使用（后进先出 LIFO）

```java
LinkedList<String> stack = new LinkedList<>();

stack.push("张三");    // 压栈（加到头部）
stack.push("李四");
stack.push("王五");

stack.peek();          // 看栈顶 → "王五"
stack.pop();           // 弹栈 → 返回 "王五" 并删除

// 结果：后进先出，王五先出
```

| 栈方法 | 作用 | 等价于 |
|-------|------|--------|
| `push(e)` | 压栈 | addFirst |
| `pop()` | 弹栈 | removeFirst |
| `peek()` | 看栈顶 | peekFirst |

---

## 五、头尾操作（双向链表的强项）

```java
LinkedList<String> list = new LinkedList<>();

// 头部操作 O(1)
list.addFirst("A");     // 头部添加
list.removeFirst();     // 删除头部
list.getFirst();        // 获取头部

// 尾部操作 O(1)
list.addLast("Z");      // 尾部添加
list.removeLast();      // 删除尾部
list.getLast();         // 获取尾部
```

**这些头尾操作都是 O(1)**，这是 LinkedList 相比 ArrayList 最大的优势——ArrayList 头部增删是 O(n)。

---

## 六、为什么增删快、查询慢

### 增删快（O(1)）

```
删除中间节点 B：
  A ⇄ B ⇄ C      →      A ⇄ C
  只需改 A.next 和 C.prev 两个指针，不用移动其他元素

  但要注意：先要【找到】B 的位置，这个查找是 O(n)。
  所以 LinkedList 中间增删是 O(n)（查找耗时），头尾增删才是 O(1)。
```

> ⚠️ **注意：很多人误以为 LinkedList 增删一定快。其实**中间位置**的增删要先 O(n) 定位，整体还是 O(n)。LinkedList 真正快的是**头尾**增删。**

### 查询慢（O(n)）

```java
list.get(100);
// 链表不能像数组那样直接算地址，必须从头（或尾）一个个 next 走过去
// 不过 LinkedList 有优化：index < size/2 从头找，否则从尾找
```

---

## 七、ArrayList vs LinkedList 对比

| 对比项 | ArrayList | LinkedList |
|-------|-----------|-----------|
| 底层结构 | 动态数组 | 双向链表 |
| 查询 `get(i)` | **O(1)** | O(n) |
| 头部增删 | O(n) | **O(1)** |
| 尾部增删 | 均摊 O(1) | O(1) |
| 中间增删 | O(n) | O(n)（含查找） |
| 内存占用 | 小（连续数组） | **大**（每个节点多存 prev/next） |
| 随机访问 | 强 | 弱 |
| 当队列/栈 | 不适合 | **适合** |
| 缓存友好 | 好（连续内存） | 差（节点分散） |

```
选择建议：
  - 查询多、按索引访问 → ArrayList
  - 频繁头尾增删、当队列/栈 → LinkedList / ArrayDeque
  - 不确定 → ArrayList（默认选择，绝大多数场景更优）

💡 实际开发中 LinkedList 用得很少：
  - 当队列/栈用 ArrayDeque 比 LinkedList 更快
  - 当列表用 ArrayList 更快
  - 所以 LinkedList 显得"鸡肋"
```

---

## 八、常见问题

### Q1：LinkedList 和 ArrayList 谁更省内存？

```
ArrayList 更省。LinkedList 每个节点要额外存 prev、next 两个指针，内存开销大。
```

### Q2：LinkedList 的 get(i) 怎么实现的？

```
从头或尾遍历（index < size/2 从头，否则从尾），所以是 O(n)。
因此不要用 for + get 遍历 LinkedList，要用迭代器。
```

### Q3：LinkedList 是线程安全的吗？

```
不是。多线程要用 Collections.synchronizedList 包装，
或用 ConcurrentLinkedQueue（当队列用时）。
```

### Q4：为什么实际开发很少用 LinkedList？

```
当列表：ArrayList 随机访问快、内存省、缓存友好
当队列/栈：ArrayDeque 性能更好
所以 LinkedList 用武之地不多，主要在面试中考原理。
```

---

## 九、快速参考

### 核心特性

```
底层：双向链表（Node: prev + item + next）
实现：List + Deque（可当列表、队列、栈）
头尾增删 O(1)，中间增删/查询 O(n)
内存占用比 ArrayList 大
非线程安全
```

### 三种角色

```java
// 列表
list.add(e); list.get(i);

// 队列（FIFO）
queue.offer(e); queue.peek(); queue.poll();

// 栈（LIFO）
stack.push(e); stack.peek(); stack.pop();
```

### 选型

```
当列表 → ArrayList
当队列/栈 → ArrayDeque（优于 LinkedList）
LinkedList → 主要理解原理，实战少用
```
