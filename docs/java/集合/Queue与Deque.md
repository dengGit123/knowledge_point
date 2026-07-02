# Queue 与 Deque 详解（队列与双端队列）

> 📖 官方文档：[Queue (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Queue.html)、[Deque (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Deque.html)、[PriorityQueue](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/PriorityQueue.html)

## 一、概述

**Queue（队列）** 是"先进先出（FIFO）"的容器，**Deque（双端队列）** 两端都能进出，能当队列也能当栈。

```
队列 Queue（先进先出，像排队）：
  入队 → [A, B, C] → 出队
        先进来的 A 先出去

栈 Stack（后进先出，像弹夹）：
  压入 → [A, B, C] ← 弹出
        后进来的 C 先出去（用 Deque 实现）

双端队列 Deque（两端都能进能出）：
        →            →
   [A, B, C, D, E]
        ←            ←
```

> 💡 **类比：** Queue 像"**食堂打饭排队**"（先排的先打）；栈像"**弹夹装子弹**"（最后压进去的最先射出）；Deque 像"**两头都能开的车厢**"。

---

## 二、Queue 接口

### 2.1 两套方法（推荐返回值版）

Queue 提供两套功能相同的方法，区别在**失败时的行为**：

| 操作 | 抛异常 | 返回特殊值（推荐） |
|-----|--------|----------------|
| 入队 | `add(e)` | `offer(e)` 返回 false |
| 出队 | `remove()` | `poll()` 返回 null |
| 查看队首 | `element()` | `peek()` 返回 null |

```java
Queue<String> queue = new LinkedList<>();

queue.offer("张三");   // 入队（推荐，失败返回 false）
queue.offer("李四");

queue.peek();          // 看队首 → "张三"（不删除）
queue.poll();          // 出队 → "张三"（删除并返回）

// 先进先出：张三先出，李四后出
```

> 💡 **提示：优先用 `offer/poll/peek`**，它们失败时返回 null/false，不会抛异常打断程序。

---

## 三、Deque 接口（双端队列）

Deque（Double Ended Queue）两端都能增删，既能当队列也能当栈。

### 3.1 Deque 当队列用（FIFO）

```java
Deque<String> q = new ArrayDeque<>();
q.offerLast("张三");   // 队尾入队
q.offerLast("李四");
q.peekFirst();         // 看队首
q.pollFirst();         // 队首出队
// 等价于 Queue 的 offer/peek/poll
```

### 3.2 Deque 当栈用（LIFO）

```java
Deque<String> stack = new ArrayDeque<>();
stack.push("张三");    // 压栈（头部插入）
stack.push("李四");
stack.peek();          // 看栈顶 → "李四"
stack.pop();           // 弹栈 → "李四"
// 后进先出：李四先出
```

> 💡 **提示：Java 官方推荐用 `Deque`（如 ArrayDeque）代替老的 `Stack` 类。**

### 3.3 Deque 的完整方法

| 操作 | 头部 | 尾部 |
|-----|------|------|
| 增 | `addFirst` / `offerFirst` | `addLast` / `offerLast` |
| 删 | `removeFirst` / `pollFirst` | `removeLast` / `pollLast` |
| 查 | `getFirst` / `peekFirst` | `getLast` / `peekLast` |

| 栈语义 | 对应 Deque 方法 |
|-------|---------------|
| `push(e)` | addFirst(e) |
| `pop()` | removeFirst() |
| `peek()` | peekFirst() |

---

## 四、常用实现类

### 4.1 ArrayDeque（推荐）

**底层是循环数组**，当队列和栈都很快。

```java
Deque<String> deque = new ArrayDeque<>();
deque.offer("a"); deque.offer("b"); deque.offer("c");
deque.poll();   // a
```

| 特点 | 说明 |
|-----|------|
| 底层 | 循环数组 |
| 性能 | **比 LinkedList 快**（数组连续内存，缓存友好） |
| 容量 | 可扩容 |
| 不允许 null | 会抛异常 |

> 💡 **提示：无论当队列还是栈，都优先用 ArrayDeque**，它比 LinkedList 更快、更省内存。

### 4.2 LinkedList

LinkedList 实现了 Deque，也能当队列/栈（底层双向链表）。但性能不如 ArrayDeque。

```java
Deque<String> q = new LinkedList<>();
// 用法和 ArrayDeque 一样，但性能略差
```

### 4.3 PriorityQueue（优先队列）

**不按先进先出，而按优先级（大小）出队**，底层是**堆**。

```java
// 默认是小顶堆：最小的先出
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(5); pq.offer(1); pq.offer(3);

pq.poll();   // 1（最小的先出）
pq.poll();   // 3
pq.poll();   // 5
```

```java
// 大顶堆：用 Comparator 改成降序
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
maxHeap.offer(5); maxHeap.offer(1); maxHeap.offer(3);
maxHeap.poll();   // 5（最大的先出）
```

| 特点 | 说明 |
|-----|------|
| 底层 | 二叉堆（数组实现） |
| 出队顺序 | 按优先级（默认自然顺序，小的先出） |
| 性能 | offer/poll 是 O(log n) |
| 不保证遍历有序 | 遍历不是排序的，只有 poll 才有序 |
| 应用 | Top N 问题、任务调度 |

```java
// 经典：求第 K 大的元素
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
for (int n : nums) {
    minHeap.offer(n);
    if (minHeap.size() > k) minHeap.poll();   // 保持堆大小 k
}
minHeap.peek();   // 第 K 大的元素
```

> 💡 **提示：PriorityQueue 的 `peek` 看的是堆顶（最优先的），但遍历整个队列不是有序的。** 想要有序输出要用 poll 逐个取出。

---

## 五、ArrayDeque vs LinkedList vs PriorityQueue

| | ArrayDeque | LinkedList | PriorityQueue |
|---|---|---|---|
| 底层 | 循环数组 | 双向链表 | 二叉堆 |
| 当队列 | ✅ 快 | ✅ 慢点 | ❌（按优先级） |
| 当栈 | ✅ 快 | ✅ 慢点 | ❌ |
| 顺序 | FIFO/LIFO | FIFO/LIFO | **按优先级** |
| 允许 null | ❌ | ✅ | ❌ |
| 推荐 | **队列/栈首选** | 次选 | 需要优先级时 |

---

## 六、线程安全的队列

以上都是非线程安全的，多线程要用并发队列（在 `java.util.concurrent` 包）：

| 类 | 特点 | 适用 |
|----|------|------|
| **ConcurrentLinkedQueue** | 无界、非阻塞、CAS 实现 | 高并发无阻塞队列 |
| **ArrayBlockingQueue** | 有界、阻塞 | 生产者-消费者、线程池 |
| **LinkedBlockingQueue** | 可选有界、阻塞 | 线程池常用 |
| **PriorityBlockingQueue** | 优先级、阻塞 | 优先级任务调度 |

```java
// 阻塞队列：满了 put 会等，空了 take 会等
BlockingQueue<String> queue = new ArrayBlockingQueue<>(10);
queue.put("任务");      // 队列满时阻塞等待
queue.take();            // 队列空时阻塞等待
```

> 💡 **提示：线程池（ThreadPoolExecutor）内部就是用 BlockingQueue 存任务的。**

---

## 七、常见问题

### Q1：Queue 和 Deque 的区别？

```
Queue：单端队列，只能队尾进、队首出（FIFO）。
Deque：双端队列，两端都能进能出，能当队列也能当栈。
Deque 继承 Queue。
```

### Q2：Java 中怎么实现栈？

```
用 Deque（ArrayDeque）的 push/pop/peek，不要用 Stack 类。
Deque<String> stack = new ArrayDeque<>();
```

### Q3：PriorityQueue 是先进先出吗？

```
不是。它按优先级出队（默认自然顺序，最小的先出），底层是堆。
poll() 取出的是优先级最高（最小）的元素。
```

### Q4：ArrayDeque 和 LinkedList 当队列，哪个好？

```
ArrayDeque 更好。底层循环数组，连续内存缓存友好，比 LinkedList 快且省内存。
LinkedList 优势（允许 null）在队列场景没用。
```

### Q5：offer/add，poll/remove，peek/element 的区别？

```
功能相同，区别在失败行为：
  offer/poll/peek：失败返回 false/null（推荐）
  add/remove/element：失败抛异常
```

---

## 八、快速参考

### Queue 方法

```java
offer(e)    // 入队（返回false）
poll()      // 出队（返回null）
peek()      // 看队首（返回null）
```

### Deque 当栈

```java
push(e)     // 压栈 = addFirst
pop()       // 弹栈 = removeFirst
peek()      // 看栈顶 = peekFirst
```

### 选型

```
队列/栈 → ArrayDeque（首选）
优先级队列 → PriorityQueue
多线程 → ConcurrentLinkedQueue / BlockingQueue
```

### 核心特性

```
Queue：先进先出 FIFO
Deque：双端，可队列可栈
PriorityQueue：按优先级出队（堆）
ArrayDeque：循环数组，最快
并发队列：java.util.concurrent 包
```
