# 备忘录模式（Memento）⭐⭐

> 参考资源：
> - [菜鸟教程 - 备忘录模式](https://www.runoob.com/design-pattern/memento-pattern.html)
> - [Refactoring.Guru - 备忘录模式](https://refactoring.guru/zh/design-patterns/memento)

---

## 一、概述

### 1. 是什么

**备忘录模式（Memento）** 在不破坏封装性的前提下，**捕获**一个对象的内部状态，并在该对象之外保存这个状态。这样以后就可以将该对象恢复到原先保存的状态。

### 2. 解决什么问题

- 需要保存对象的历史状态以支持撤销/回滚
- 不想暴露对象的内部状态
- 需要实现「存档」功能

### 3. 通俗类比

「游戏存档」——你在某个关卡保存游戏进度（备忘录），之后可以从这个进度重新开始游戏。存档里记录了当时的所有状态（位置、血量、装备）。

### 4. 类图简图

```
┌────────────────┐        ┌────────────────┐        ┌────────────────┐
│   Originator   │───────▶│   Memento      │◀───────│   Caretaker    │
│ (原发器)        │ 创建   │ (备忘录)        │ 保管   │ (管理者)        │
│ + save()       │        │ - state        │        │ - history      │
│ + restore(m)   │        │ + getState()   │        │ + undo()       │
└────────────────┘        └────────────────┘        └────────────────┘
```

**核心角色：**
- **Originator（原发器）**：需要保存状态的对象
- **Memento（备忘录）**：存储原发器的内部状态
- **Caretaker（管理者）**：管理备忘录，但不能操作备忘录内容

---

## 二、代码示例：文本编辑器撤销

```java
import java.util.*;

// 备忘录：存储编辑器状态
class EditorMemento {
    private final String content;
    private final int cursorPosition;

    public EditorMemento(String content, int cursorPosition) {
        this.content = content;
        this.cursorPosition = cursorPosition;
    }

    public String getContent() { return content; }
    public int getCursorPosition() { return cursorPosition; }
}

// 原发器：文本编辑器
class Editor {
    private String content = "";
    private int cursorPosition = 0;

    public void type(String word) {
        content += word;
        cursorPosition += word.length();
    }

    // 保存当前状态到备忘录
    public EditorMemento save() {
        return new EditorMemento(content, cursorPosition);
    }

    // 从备忘录恢复状态
    public void restore(EditorMemento memento) {
        this.content = memento.getContent();
        this.cursorPosition = memento.getCursorPosition();
    }

    public void print() {
        System.out.println("内容：" + content + " | 光标：" + cursorPosition);
    }
}

// 管理者：历史记录
class History {
    private final Stack<EditorMemento> stack = new Stack<>();

    public void push(EditorMemento memento) { stack.push(memento); }

    public EditorMemento pop() {
        if (stack.isEmpty()) return null;
        return stack.pop();
    }
}

// 使用：编辑 → 保存 → 再编辑 → 撤销
Editor editor = new Editor();
History history = new History();

editor.type("Hello");
history.push(editor.save());    // 保存状态 1
editor.print();                 // 内容：Hello | 光标：5

editor.type(" World");
history.push(editor.save());    // 保存状态 2
editor.print();                 // 内容：Hello World | 光标：11

editor.type("!!!");
editor.print();                 // 内容：Hello World!!! | 光标：14

// 撤销
editor.restore(history.pop());
editor.print();                 // 内容：Hello World | 光标：11

editor.restore(history.pop());
editor.print();                 // 内容：Hello | 光标：5
```

---

## 三、宽接口 vs 窄接口

### 1. 宽接口（Java 默认）

备忘录对所有类可见，Caretaker 可以访问备忘录内部状态。

### 2. 窄接口（推荐）

```java
// 窄接口：对外只读
public interface Memento {
    // 空接口，不暴露任何方法
}

// 宽接口：只对 Originator 可见
class EditorMemento implements Memento {
    private String content;
    // package-private 方法，只有同包的 Originator 能访问
    String getContent() { return content; }
}
```

> 💡 **提示：** Java 中通常用内部类实现窄接口，让备忘录的字段只对 Originator 可见。

---

## 四、适用场景

| 场景 | 例子 |
| --- | --- |
| 撤销/重做 | 编辑器 Ctrl+Z / Ctrl+Y |
| 游戏存档 | 保存/加载游戏进度 |
| 事务回滚 | 数据库事务回滚到保存点 |
| 状态快照 | 虚拟机快照、系统还原 |

---

## 五、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `java.io.Serializable` —— 序列化本质上是备忘录（保存/恢复对象状态） |
| Spring | `TransactionStatus` —— 事务保存点（Savepoint） |
| 数据库 | 事务保存点 —— `Connection.setSavepoint()` |

---

## 六、注意事项

1. **内存消耗** —— 如果保存的状态很大，备忘录会占用大量内存。
2. **生命周期管理** —— Caretaker 需要管理备忘录的生命周期，及时清理过期快照。
3. **封装性** —— Caretaker 不应该修改备忘录内容，只能通过 Originator 恢复。
4. **与原型模式的区别** —— 原型模式是「克隆对象」，备忘录是「保存/恢复状态」。

---

## 七、面试常见问题

### Q：备忘录模式和原型模式的区别？

**答：**
- **原型模式**：通过克隆创建新对象，关注的是「创建」。
- **备忘录模式**：保存对象的内部状态以便恢复，关注的是「状态管理」。
- 原型模式可以用来实现备忘录（克隆一个对象作为快照），但备忘录模式更明确地表达了「存档/读档」的意图。
