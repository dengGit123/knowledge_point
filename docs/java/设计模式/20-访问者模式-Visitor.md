# 访问者模式（Visitor）⭐⭐

> 参考资源：
> - [菜鸟教程 - 访问者模式](https://www.runoob.com/design-pattern/visitor-pattern.html)
> - [Refactoring.Guru - 访问者模式](https://refactoring.guru/zh/design-patterns/visitor)

---

## 一、概述

### 1. 是什么

**访问者模式（Visitor）** 将**操作**与**对象结构**分离，使得可以在不修改对象结构的前提下，定义作用于这些对象的新操作。

### 2. 解决什么问题

- 同一对象结构需要多种不同的操作
- 不想把操作逻辑散落在各个对象类中
- 需要频繁新增操作，但对象结构稳定

### 3. 通俗类比

「体检报告」——你的身体（对象结构）不变，但可以有不同的检查项目（访问者）：血常规、尿常规、B 超。每个访问者对身体各部位做不同的检查。

### 4. 类图简图

```
┌────────────────┐        ┌────────────────┐
│  Visitor       │        │  Element       │
│ (访问者接口)    │        │ (元素接口)      │
│ + visit(A)     │◀───────│ + accept(visitor)│
│ + visit(B)     │        └───────┬────────┘
└───────┬────────┘                △
        △                         │
        │ 实现            ┌───────┴────────┐
┌───────┴────────┐        │ ConcreteElement│
│ConcreteVisitor │        │ + accept()     │
└────────────────┘        └────────────────┘
```

**核心角色：**
- **Visitor（访问者接口）**：为每个具体元素定义访问方法
- **ConcreteVisitor（具体访问者）**：实现具体操作
- **Element（元素接口）**：定义 `accept(visitor)` 方法
- **ConcreteElement（具体元素）**：实现 `accept`，调用 `visitor.visit(this)`

---

## 二、代码示例：报表生成

```java
// 访问者接口
interface ReportVisitor {
    void visit(Engineer engineer);
    void visit(Manager manager);
    void visit(Sales sales);
}

// 元素接口
interface Employee {
    void accept(ReportVisitor visitor);
}

// 具体元素：工程师
class Engineer implements Employee {
    private String name;
    private int codeLines;
    public Engineer(String name, int codeLines) {
        this.name = name; this.codeLines = codeLines;
    }
    public String getName() { return name; }
    public int getCodeLines() { return codeLines; }
    public void accept(ReportVisitor visitor) { visitor.visit(this); }
}

// 具体元素：经理
class Manager implements Employee {
    private String name;
    private int projects;
    public Manager(String name, int projects) {
        this.name = name; this.projects = projects;
    }
    public String getName() { return name; }
    public int getProjects() { return projects; }
    public void accept(ReportVisitor visitor) { visitor.visit(this); }
}

// 具体元素：销售
class Sales implements Employee {
    private String name;
    private double revenue;
    public Sales(String name, double revenue) {
        this.name = name; this.revenue = revenue;
    }
    public String getName() { return name; }
    public double getRevenue() { return revenue; }
    public void accept(ReportVisitor visitor) { visitor.visit(this); }
}

// 具体访问者：薪资报表
class SalaryReport implements ReportVisitor {
    public void visit(Engineer e) {
        System.out.printf("工程师 %s：代码行数 %d，薪资 %d%n",
            e.getName(), e.getCodeLines(), e.getCodeLines() * 10);
    }
    public void visit(Manager m) {
        System.out.printf("经理 %s：项目数 %d，薪资 %d%n",
            m.getName(), m.getProjects(), m.getProjects() * 5000);
    }
    public void visit(Sales s) {
        System.out.printf("销售 %s：业绩 %.0f，薪资 %.0f%n",
            s.getName(), s.getRevenue(), s.getRevenue() * 0.1);
    }
}

// 具体访问者：绩效报告
class PerformanceReport implements ReportVisitor {
    public void visit(Engineer e) {
        System.out.printf("工程师 %s：代码行数 %d，绩效评级 %s%n",
            e.getName(), e.getCodeLines(),
            e.getCodeLines() > 5000 ? "A" : "B");
    }
    public void visit(Manager m) {
        System.out.printf("经理 %s：项目数 %d，绩效评级 %s%n",
            m.getName(), m.getProjects(),
            m.getProjects() > 5 ? "A" : "B");
    }
    public void visit(Sales s) {
        System.out.printf("销售 %s：业绩 %.0f，绩效评级 %s%n",
            s.getName(), s.getRevenue(),
            s.getRevenue() > 100000 ? "A" : "B");
    }
}

// 使用
List<Employee> employees = Arrays.asList(
    new Engineer("张三", 8000),
    new Manager("李四", 6),
    new Sales("王五", 150000)
);

// 生成薪资报表
ReportVisitor salaryReport = new SalaryReport();
for (Employee e : employees) e.accept(salaryReport);

// 生成绩效报告
ReportVisitor perfReport = new PerformanceReport();
for (Employee e : employees) e.accept(perfReport);
```

---

## 三、适用场景

| 场景 | 例子 |
| --- | --- |
| 对象结构稳定，操作频繁变化 | 编译器 AST 处理 |
| 需要对不同元素做不同操作 | 报表生成、数据导出 |
| 操作逻辑复杂且多样 | 文档格式转换（HTML/PDF/Word） |
| 不想污染元素类 | 把业务逻辑从领域对象中分离 |

---

## 四、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `FileVisitor` —— 文件树遍历 |
| JDK | `SimpleFileVisitor` —— 文件访问者基类 |
| Spring | `BeanDefinitionVisitor` —— Bean 定义访问者 |
| 编译器 | AST（抽象语法树）的多种处理（语义分析、代码生成、优化） |

---

## 五、优缺点

### 优点
- **开闭原则**：新增操作只需新增访问者，不改元素类
- **单一职责**：把相关操作集中到一个访问者中
- **扩展性好**：可以定义多种不同的访问者

### 缺点
- **违反依赖倒置**：访问者依赖具体元素类，新增元素类需要修改所有访问者
- **破坏封装**：元素可能需要暴露内部状态给访问者
- **理解复杂**：双重分发机制较难理解

---

## 六、双重分发机制

访问者模式的核心是**双重分发**：

```java
// 第一次分发：元素选择 accept 方法
element.accept(visitor);

// 第二次分发：visitor 根据元素类型选择 visit 方法
visitor.visit(this);  // this 是具体元素类型
```

> 💡 **提示：** 访问者模式是「双重分发」的经典应用。第一次分发选择 `accept`，第二次分发选择 `visit`。

---

## 七、注意事项

1. **适合对象结构稳定的场景** —— 如果经常新增元素类，访问者模式不适用。
2. **与策略模式的区别** —— 策略是「一个对象一个策略」，访问者是「一个对象多个操作」。
3. **实际使用较少** —— 因为新增元素类需要修改所有访问者，违反开闭原则。

---

## 八、面试常见问题

### Q：访问者模式的使用场景？

**答：** 访问者模式适合「对象结构稳定，但需要频繁新增操作」的场景。典型应用：
- 编译器 AST 处理（语义分析、代码生成、优化）
- 报表系统（同一数据生成不同报表）
- 文件树遍历（`FileVisitor`）

实际开发中使用较少，因为新增元素类需要修改所有访问者，违反开闭原则。
