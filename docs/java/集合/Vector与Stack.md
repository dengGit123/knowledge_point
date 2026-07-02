# Vector 与 Stack（遗留的同步集合）

> 📖 官方文档：[Vector (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Vector.html)、[Stack (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Stack.html)

## 一、概述

**Vector 和 Stack 是 Java 早期的集合类**（JDK 1.0），现在已基本**被淘汰**，了解原理即可，**实际开发不要用**。

| 类 | 说明 | 现状 |
|----|------|------|
| **Vector** | 线程安全的"动态数组" | 已淘汰，用 ArrayList / CopyOnWriteArrayList |
| **Stack** | 线程安全的栈（继承 Vector） | 已淘汰，用 ArrayDeque |

> 💡 **为什么还要学？** 因为面试常问"Vector 和 ArrayList 区别""为什么不用 Stack"，而且老代码里还会看到它们。

---

## 二、Vector：线程安全的 ArrayList

### 2.1 Vector 和 ArrayList 几乎一样

Vector 的底层、用法和 ArrayList 基本相同（都是动态数组），**唯一关键区别是线程安全**：

| 对比 | ArrayList | Vector |
|-----|-----------|--------|
| 线程安全 | ❌ 不安全 | ✅ 安全（方法都 synchronized） |
| 性能 | 快 | **慢**（每次操作都加锁） |
| 扩容 | 1.5 倍 | **2 倍** |
| 出现版本 | JDK 1.2 | JDK 1.0（更老） |
| 推荐使用 | ✅ 是 | ❌ 否 |

```java
// Vector 的每个方法都加了 synchronized 锁
public synchronized boolean add(E e) { ... }
public synchronized E get(int index) { ... }
public synchronized void addElement(E obj) { ... }   // 老方法名
```

### 2.2 为什么 Vector 慢？

```
Vector 给【每个方法】都加了 synchronized 锁，意味着：
  - 即使只是读，也要获取锁
  - 多个线程读时也要排队（读读也互斥）
  - 锁的粒度太粗，并发性能差

而现代的 CopyOnWriteArrayList：
  - 读完全不加锁（读读、读写都不阻塞）
  - 写时复制，适合读多写少
```

### 2.3 Vector 的扩容

```java
// Vector 扩容源码
int newCapacity = oldCapacity + ((capacityIncrement > 0) ?
                                 capacityIncrement : oldCapacity);
// 默认 capacityIncrement = 0 → 新容量 = 旧容量 × 2

// 对比 ArrayList 是 ×1.5
```

---

## 三、Stack：线程安全的栈

**Stack 继承自 Vector**，提供了栈的操作（后进先出 LIFO）：

```java
Stack<String> stack = new Stack<>();

stack.push("张三");    // 压栈
stack.push("李四");
stack.push("王五");

stack.peek();          // 看栈顶（不删除）→ "王五"
stack.pop();           // 弹栈（删除并返回）→ "王五"
stack.empty();         // 是否为空
stack.search("张三");  // 查找元素位置（从栈顶 1 开始数）
```

### 3.1 Stack 的问题

```
Stack 的设计被广泛批评：
  1. 继承 Vector → 它是一个【完整的 Vector】，暴露了 Vector 所有方法
     你可以 stack.get(1)、stack.remove(0)，破坏了栈"只能操作顶部"的特性
  2. 继承而非组合 → 违反面向对象设计原则
  3. 每个方法都 synchronized → 性能差

官方文档原话（JavaDoc）：
  "A more complete and consistent set of LIFO stack operations is
   provided by the Deque interface... prefer Deque (ArrayDeque)."
  即：推荐用 Deque（ArrayDeque）代替 Stack。
```

### 3.2 用 ArrayDeque 代替 Stack

```java
// ✅ 推荐：用 ArrayDeque 当栈
Deque<String> stack = new ArrayDeque<>();

stack.push("张三");
stack.push("李四");
stack.peek();    // 看栈顶
stack.pop();     // 弹栈
// ArrayDeque 只暴露 Deque 接口，没有 Vector 的那些无关方法，更干净
// 而且 ArrayDeque 比 Stack 更快
```

> 💡 **提示：** 凡是看到老代码用 Stack 的，知道它是个栈就行，**自己写代码用 ArrayDeque**。

---

## 四、替代方案总结

```
需要线程安全的 List：
  ❌ Vector
  ✅ CopyOnWriteArrayList（读多写少）
  ✅ Collections.synchronizedList(new ArrayList<>())

需要线程安全的栈/队列：
  ❌ Stack
  ✅ ArrayDeque（单线程）
  ✅ ConcurrentLinkedDeque（多线程）
  ✅ ArrayBlockingQueue（阻塞队列）
```

---

## 五、常见问题

### Q1：Vector 和 ArrayList 的区别？

```
1. 线程安全：Vector 安全（synchronized），ArrayList 不安全
2. 性能：Vector 慢，ArrayList 快
3. 扩容：Vector ×2，ArrayList ×1.5
4. 版本：Vector 是 JDK1.0 老类，ArrayList 是 JDK1.2
```

### Q2：为什么不推荐用 Vector？

```
Vector 用 synchronized 给每个方法加锁，锁粒度太粗，并发性能差。
需要线程安全时，用 CopyOnWriteArrayList 或加锁控制，更灵活高效。
```

### Q3：为什么不推荐用 Stack？用什么代替？

```
Stack 继承 Vector，设计糟糕：暴露了 Vector 的所有方法，破坏栈特性，且性能差。
官方推荐用 Deque 接口的实现 ArrayDeque 代替 Stack。
```

### Q4：面试怎么答"Vector 怎么实现线程安全"？

```
Vector 的方法都用 synchronized 修饰，是对【对象】加锁（this 锁），
所以同一时刻只有一个线程能操作 Vector，保证了线程安全，但牺牲了并发性能。
```

---

## 六、快速参考

### 一句话总结

```
Vector = 线程安全但慢的 ArrayList（已淘汰）
Stack  = 继承 Vector 的栈，设计糟糕（已淘汰）

替代：
  线程安全 List → CopyOnWriteArrayList
  栈/队列      → ArrayDeque
```

### 对比速记

| | ArrayList | Vector | Stack |
|---|---|---|---|
| 线程安全 | ❌ | ✅（synchronized） | ✅ |
| 性能 | 快 | 慢 | 慢 |
| 扩容 | ×1.5 | ×2 | 继承 Vector |
| 是否推荐 | ✅ | ❌ | ❌ |

### 牢记

```
看到 Vector / Stack → 知道是什么，但别用，用现代替代品。
```
