# Iterator 迭代器详解

> 📖 官方文档：[Iterator (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Iterator.html)、[ListIterator (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/ListIterator.html)

## 一、概述

**Iterator（迭代器）是遍历集合的工具**，它提供一种统一的方式来访问集合里的每个元素，而不用关心集合的底层结构（数组、链表还是树）。

```
集合              迭代器
[A, B, C]  →   hasNext? → next() → A
              hasNext? → next() → B
              hasNext? → next() → C
              hasNext? → 结束
```

> 💡 **类比：** 迭代器像"**电视遥控器的下一台键**"——你不用知道频道怎么存储的，只管按"下一个"逐个看。

---

## 二、Iterable 与 Iterator 的关系

```
Iterable（可迭代接口）         Iterator（迭代器接口）
  │                              │
  │ iterator() 方法返回 Iterator │  hasNext() / next() / remove()
  ▼                              ▼
Collection 继承 Iterable        每个集合内部有 Iterator 实现

所有 Collection 都可以：
  - 用 iterator() 获取迭代器
  - 支持 for-each（因为实现了 Iterable）
```

> 💡 **提示：** 集合能用 `for-each` 循环，就是因为实现了 `Iterable` 接口。for-each 底层就是用迭代器实现的。

---

## 三、Iterator 的三个方法

```java
Iterator<String> it = list.iterator();

while (it.hasNext()) {      // 是否还有下一个
    String s = it.next();   // 取出下一个
    System.out.println(s);
}

it.remove();                // 删除刚 next() 返回的元素（可选操作）
```

| 方法 | 作用 |
|-----|------|
| `hasNext()` | 是否还有下一个元素 |
| `next()` | 返回下一个元素，指针后移 |
| `remove()` | 删除上次 next() 返回的元素（可选，不是所有集合都支持） |

---

## 四、为什么遍历时删除要用迭代器（fail-fast）

### 4.1 错误：for-each 中直接 remove

```java
List<String> list = new ArrayList<>(List.of("a", "b", "c"));

// ❌ for-each 中直接删除 → 抛 ConcurrentModificationException
for (String s : list) {
    if (s.equals("b")) {
        list.remove(s);   // ❌ 并发修改异常
    }
}
```

### 4.2 fail-fast 机制

```
集合内部有个 modCount（修改次数）计数器：
  - 每次 add/remove，modCount++
  - 迭代器创建时记录 expectedModCount = modCount
  - 每次 next() 检查 modCount == expectedModCount
  - 不相等 → 说明遍历期间集合被修改了 → 抛 ConcurrentModificationException

这就是 fail-fast（快速失败）：发现并发修改，立即报错，避免数据错乱。
```

### 4.3 正确：用迭代器的 remove

```java
// ✅ 用迭代器的 remove，它会同步更新 expectedModCount，不触发 fail-fast
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals("b")) {
        it.remove();   // ✅ 安全删除
    }
}

// ✅ Java 8+ 最简洁：removeIf（内部也是迭代器）
list.removeIf(s -> s.equals("b"));
```

> 💡 **提示：要边遍历边删除，永远用迭代器的 `it.remove()` 或 `removeIf`**，不要在 for-each 中直接删。

---

## 五、ListIterator（List 专属）

`ListIterator` 是 Iterator 的增强版，**只有 List 才有**（`list.listIterator()`），支持**双向遍历**和**增改**：

```java
List<String> list = new ArrayList<>(List.of("a", "b", "c"));
ListIterator<String> it = list.listIterator();

// 正向遍历
while (it.hasNext()) {
    System.out.println(it.next());   // a, b, c
}

// 反向遍历
while (it.hasPrevious()) {
    System.out.println(it.previous()); // c, b, a
}

it.add("d");       // 在当前位置插入
it.set("x");       // 替换最后一次 next/previous 的元素
it.nextIndex();    // 下一个元素的索引
it.previousIndex();// 上一个元素的索引
```

| Iterator | ListIterator |
|----------|-------------|
| 只能正向 | **双向**（hasPrevious/previous） |
| 只能删 | 能**增改**（add/set） |
| 无索引 | 有索引（nextIndex/previousIndex） |
| 所有集合 | 仅 List |

---

## 六、四种遍历方式对比

```java
List<String> list = new ArrayList<>(List.of("a", "b", "c"));

// 1. for-each（最常用，底层是迭代器）
for (String s : list) { System.out.println(s); }

// 2. 迭代器（能边遍历边删）
Iterator<String> it = list.iterator();
while (it.hasNext()) { System.out.println(it.next()); }

// 3. forEach + Lambda（Java 8+，最简洁）
list.forEach(System.out::println);

// 4. 普通 for（只有 List 有索引，LinkedList 性能差）
for (int i = 0; i < list.size(); i++) { System.out.println(list.get(i)); }
```

| 方式 | 适用 | 能否边遍历边删 |
|-----|------|:----------:|
| for-each | 所有集合 | ❌ |
| 迭代器 | 所有集合 | ✅ |
| forEach + Lambda | 所有集合 | ❌ |
| 普通 for | 仅 List | ✅（倒序或调整索引） |

---

## 七、常见问题

### Q1：Iterator 和 Iterable 的区别？

```
Iterable：可迭代接口，有 iterator() 方法，集合实现它（支持 for-each）。
Iterator：迭代器接口，有 hasNext()/next()/remove()，是实际遍历的工具。
Iterable 提供获取 Iterator 的能力。
```

### Q2：什么是 fail-fast？

```
集合遍历时若被结构修改（增删），迭代器会立即抛 ConcurrentModificationException。
目的是快速暴露并发修改问题，避免继续用脏数据。
解决：用迭代器的 remove()，或多线程用并发集合（CopyOnWriteArrayList）。
```

### Q3：fail-fast 和 fail-safe 的区别？

```
fail-fast（快）：遍历时修改就报错（ArrayList、HashMap 的迭代器）。
fail-safe（安）：遍历的是副本，修改不影响遍历，不报错
  （CopyOnWriteArrayList、ConcurrentHashMap 的弱一致性迭代器）。
代价：fail-safe 占内存（副本），且遍历的可能不是最新数据。
```

### Q4：为什么 for-each 不能删除元素？

```
for-each 底层是迭代器，但你调用的是集合的 remove()，不是迭代器的。
这会导致 modCount 变化但 expectedModCount 没更新 → fail-fast。
要用迭代器的 remove() 或 removeIf。
```

### Q5：ListIterator 和 Iterator 的区别？

```
ListIterator：双向遍历、能 add/set、有索引、仅 List。
Iterator：单向、只能 remove、所有集合。
```

---

## 八、快速参考

### Iterator 用法

```java
Iterator<T> it = collection.iterator();
while (it.hasNext()) {
    T e = it.next();
    if (条件) it.remove();   // 安全删除
}
```

### 核心概念

```
Iterator：遍历工具（hasNext/next/remove）
Iterable：可迭代，集合实现它，支持 for-each
ListIterator：List 专属，双向 + 增改
fail-fast：遍历时修改集合 → ConcurrentModificationException
fail-safe：遍历副本，不报错（并发集合）
```

### 遍历删除的正确方式

```java
// ✅ 迭代器删除
while (it.hasNext()) { if (条件) it.remove(); }

// ✅ removeIf（最简洁）
list.removeIf(条件);
```
