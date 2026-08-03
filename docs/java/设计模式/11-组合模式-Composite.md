# 组合模式（Composite）⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 组合模式](https://www.runoob.com/design-pattern/composite-pattern.html)
> - [Refactoring.Guru - 组合模式](https://refactoring.guru/zh/design-patterns/composite)

---

## 一、概述

### 1. 是什么

**组合模式（Composite）** 将对象组合成**树形结构**以表示「部分-整体」的层次结构，使得客户端对**单个对象和组合对象的使用具有一致性**。

### 2. 解决什么问题

- 需要表示树形结构（如文件系统、菜单树、组织架构）
- 希望客户端统一处理单个对象和组合对象，无需区分

### 3. 通俗类比

文件系统——文件夹里可以包含文件，也可以包含子文件夹。不管是对一个文件还是对一个文件夹执行「删除」操作，接口都是一样的。

### 4. 类图简图

```
┌────────────────┐
│   Component    │
│ + operation()  │
│ + add(c)       │
│ + remove(c)    │
│ + getChild(i)  │
└───────┬────────┘
        △
        │
   ┌────┴────┐
   │         │
┌──┴──┐   ┌──┴─────┐
│Leaf │   │Composite│───▶ children: List<Component>
│叶子  │   │组合节点  │
└─────┘   └────────┘
```

**核心角色：**
- **Component（抽象组件）**：定义叶子和组合节点的共同接口
- **Leaf（叶子节点）**：没有子节点，实现具体操作
- **Composite（组合节点）**：有子节点，可以添加/删除子节点

---

## 二、代码示例：文件系统

```java
import java.util.*;

// 抽象组件
abstract class FileSystemComponent {
    protected String name;
    public FileSystemComponent(String name) { this.name = name; }
    public abstract void print(int depth);  // 打印结构
    // 默认实现（叶子节点不需要重写）
    public void add(FileSystemComponent c) {
        throw new UnsupportedOperationException();
    }
    public void remove(FileSystemComponent c) {
        throw new UnsupportedOperationException();
    }
}

// 叶子节点：文件
class File extends FileSystemComponent {
    public File(String name) { super(name); }
    public void print(int depth) {
        System.out.println("  ".repeat(depth) + "📄 " + name);
    }
}

// 组合节点：文件夹
class Folder extends FileSystemComponent {
    private List<FileSystemComponent> children = new ArrayList<>();
    public Folder(String name) { super(name); }
    public void add(FileSystemComponent c) { children.add(c); }
    public void remove(FileSystemComponent c) { children.remove(c); }
    public void print(int depth) {
        System.out.println("  ".repeat(depth) + "📁 " + name);
        for (FileSystemComponent child : children) {
            child.print(depth + 1);  // 递归打印子节点
        }
    }
}

// 使用：构建树形结构
Folder root = new Folder("root");
Folder docs = new Folder("documents");
Folder pics = new Folder("pictures");

docs.add(new File("resume.pdf"));
docs.add(new File("report.docx"));
pics.add(new File("photo.jpg"));
pics.add(new File("avatar.png"));
root.add(docs);
root.add(pics);
root.add(new File("readme.txt"));

// 统一调用：不管叶子还是组合，都用同一个接口
root.print(0);
```

**输出：**
```
📁 root
  📁 documents
    📄 resume.pdf
    📄 report.docx
  📁 pictures
    📄 photo.jpg
    📄 avatar.png
  📄 readme.txt
```

---

## 三、透明组合 vs 安全组合

### 1. 透明组合（上面示例）

- Component 中声明了 `add()`、`remove()` 等管理方法
- 叶子节点调用这些方法会抛出异常
- **优点**：叶子和组合节点接口完全一致，客户端无需区分
- **缺点**：叶子节点有它不需要的方法，类型不安全

### 2. 安全组合

- Component 中只声明共同操作（如 `print()`）
- 管理方法只在 Composite 中声明
- **优点**：类型安全，叶子节点没有多余方法
- **缺点**：客户端需要区分叶子和组合节点

```java
// 安全组合：Component 只有共同操作
abstract class Component {
    public abstract void print(int depth);
}
// Composite 单独声明管理方法
class Composite extends Component {
    private List<Component> children = new ArrayList<>();
    public void add(Component c) { children.add(c); }
    public void remove(Component c) { children.remove(c); }
    public void print(int depth) { /* ... */ }
}
```

---

## 四、适用场景

| 场景 | 例子 |
| --- | --- |
| 树形结构 | 文件系统、菜单树、组织架构 |
| 部分-整体层次 | 购物车（商品 + 商品组合包） |
| 统一处理单个和组合 | 图形编辑器（单个图形 + 组合图形） |

---

## 五、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `java.awt.Container` —— Swing/AWT 组件树（窗口包含面板，面板包含按钮） |
| JDK | `JPanel`、`JFrame` —— 容器可以包含其他组件 |
| Spring | `CompositeConfiguration` —— 组合多个配置源 |

---

## 六、注意事项

1. **适合树形结构** —— 组合模式的前提是存在「部分-整体」的层次关系。
2. **递归风险** —— 树太深可能导致栈溢出。
3. **简化 Component 接口** —— 如果叶子和组合节点差异很大，不要强行统一接口。

---

## 七、面试常见问题

### Q：组合模式的透明组合和安全组合有什么区别？

**答：**
- **透明组合**：Component 声明所有方法（包括 `add`、`remove`），叶子和组合接口一致，但叶子调用管理方法会抛异常。
- **安全组合**：Component 只声明共同操作，管理方法只在 Composite 中，类型安全但客户端需要区分类型。
- 实际开发中根据需求选择，通常优先安全组合。
