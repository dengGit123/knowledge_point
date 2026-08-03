# 迭代器模式（Iterator）⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 迭代器模式](https://www.runoob.com/design-pattern/iterator-pattern.html)
> - [Refactoring.Guru - 迭代器模式](https://refactoring.guru/zh/design-patterns/iterator)

---

## 一、概述

### 1. 是什么

**迭代器模式（Iterator）** 提供一种方法**顺序访问**一个聚合对象中的各个元素，而又**不暴露**该对象的内部表示。

### 2. 解决什么问题

- 需要遍历集合，但不想暴露内部数据结构
- 不同集合（数组、链表、树）需要统一的遍历方式
- 支持多种遍历方式（正序、倒序、过滤）

### 3. 通俗类比

「书架上的书」——你一本一本翻看（迭代），不需要知道书是怎么摆放的（内部结构）。迭代器就是帮你一本本翻的「手指」。

### 4. 类图简图

```
┌────────────────┐        ┌────────────────┐
│  Aggregate     │───────▶│  Iterator      │
│ (聚合接口)      │ 创建   │ (迭代器接口)    │
│ + iterator()   │        │ + hasNext()    │
└───────┬────────┘        │ + next()       │
        △                 └───────┬────────┘
        │                         △
┌───────┴────────┐        ┌───────┴────────┐
│ConcreteAggregate│        │ConcreteIterator│
│ + iterator()   │        │ + hasNext()    │
└────────────────┘        │ + next()       │
                          └────────────────┘
```

**核心角色：**
- **Iterator（迭代器接口）**：定义遍历方法
- **ConcreteIterator（具体迭代器）**：实现遍历逻辑
- **Aggregate（聚合接口）**：定义创建迭代器的方法
- **ConcreteAggregate（具体聚合）**：实现创建迭代器

---

## 二、JDK 迭代器接口

```java
// JDK 提供的迭代器接口
public interface Iterator<E> {
    boolean hasNext();   // 是否有下一个元素
    E next();            // 返回下一个元素
    default void remove() {  // 删除当前元素（可选）
        throw new UnsupportedOperationException();
    }
}

// 聚合接口
public interface Iterable<T> {
    Iterator<T> iterator();  // 返回迭代器
    // Java 8+ 新增
    default void forEach(Consumer<? super T> action) { ... }
    default Spliterator<T> spliterator() { ... }
}
```

---

## 三、代码示例：自定义集合

```java
import java.util.Iterator;
import java.util.NoSuchElementException;

// 自定义书架（聚合对象）
class BookShelf implements Iterable<String> {
    private String[] books;
    private int size = 0;

    public BookShelf(int capacity) { books = new String[capacity]; }
    public void addBook(String book) { books[size++] = book; }

    // 返回迭代器
    @Override
    public Iterator<String> iterator() {
        return new BookIterator();
    }

    // 私有内部类：具体迭代器
    private class BookIterator implements Iterator<String> {
        private int cursor = 0;  // 当前位置

        @Override
        public boolean hasNext() {
            return cursor < size;
        }

        @Override
        public String next() {
            if (!hasNext()) throw new NoSuchElementException();
            return books[cursor++];
        }
    }
}

// 使用
BookShelf shelf = new BookShelf(10);
shelf.addBook("Java 编程思想");
shelf.addBook("Effective Java");
shelf.addBook("深入理解 JVM");

// 增强 for 循环底层就是迭代器
for (String book : shelf) {
    System.out.println(book);
}
```

---

## 四、增强 for 循环原理

```java
// 编译器会把增强 for 循环转换为迭代器调用
// for (String book : shelf) { ... }
// 等价于：
Iterator<String> it = shelf.iterator();
while (it.hasNext()) {
    String book = it.next();
    // ...
}
```

> 💡 **提示：** 任何实现了 `Iterable` 接口的类都可以使用增强 for 循环。

---

## 五、适用场景

| 场景 | 例子 |
| --- | --- |
| 遍历集合 | List、Set、Map 的遍历 |
| 隐藏内部结构 | 不同数据结构（数组、链表）统一遍历 |
| 多种遍历方式 | 正序、倒序、过滤迭代器 |
| 并行遍历 | 多个迭代器同时遍历同一集合 |

---

## 六、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `java.util.Iterator` —— 迭代器接口 |
| JDK | `java.util.ListIterator` —— 双向迭代器 |
| JDK | `ArrayList`、`HashSet`、`HashMap` 内部都实现了迭代器 |
| JDK | `Stream` API —— 内部迭代器（函数式风格） |

---

## 七、注意事项

1. **迭代过程中修改集合** —— 多数集合在迭代时修改会抛出 `ConcurrentModificationException`。
2. **fail-fast 机制** —— 检测到结构性修改立即抛出异常，而不是等到下次迭代。
3. **内部迭代器 vs 外部迭代器** —— 外部迭代器（`Iterator`）由客户端控制遍历；内部迭代器（`forEach`、`Stream`）由集合控制遍历。

---

## 八、面试常见问题

### Q：迭代器模式为什么很少手写？

**答：** 因为 JDK 已经提供了非常完善的迭代器框架（`Iterator` + `Iterable`），开发中直接使用即可。手写迭代器通常只在自定义集合类时才需要。重点理解「为什么增强 for 循环可以遍历集合」——因为集合实现了 `Iterable` 接口。

### Q：迭代过程中修改集合会怎样？

**答：** 多数集合（如 `ArrayList`、`HashMap`）会抛出 `ConcurrentModificationException`。这是 fail-fast 机制，防止不确定行为。如果需要并发修改，用 `ConcurrentHashMap`、`CopyOnWriteArrayList` 等并发集合，或在迭代器上调用 `remove()`。
