# 解释器模式（Interpreter）⭐

> 参考资源：
> - [菜鸟教程 - 解释器模式](https://www.runoob.com/design-pattern/interpret-pattern.html)
> - [Refactoring.Guru - 解释器模式](https://refactoring.guru/zh/design-patterns/interpreter)

---

## 一、概述

### 1. 是什么

**解释器模式（Interpreter）** 给定一个语言，定义它的文法的一种表示，并定义一个解释器，这个解释器使用该表示来解释语言中的句子。

### 2. 解决什么问题
- 需要解释执行一种自定义语言/规则
- 语法简单，可以用树形结构表示
- 需要频繁解析和执行表达式

### 3. 通俗类比

「翻译官」——你给翻译官一句中文（输入），他按照语法规则理解后翻译成英文（输出）。解释器模式就是程序中的「翻译官」。

### 4. 类图简图

```
┌────────────────┐
│  AbstractExpr  │
│ + interpret()  │
└───────┬────────┘
        △
        │
   ┌────┴────┐
   │         │
┌──┴──┐   ┌──┴──────┐
│Term │   │NonTerm  │───▶ 包含子表达式
│inal │   │(组合)    │
└─────┘   └─────────┘
```

**核心角色：**
- **AbstractExpression（抽象表达式）**：定义解释接口
- **TerminalExpression（终结符表达式）**：叶子节点，不可再分
- **NonTerminalExpression（非终结符表达式）**：组合节点，包含子表达式
- **Context（上下文）**：包含解释器之外的全局信息

---

## 二、代码示例：布尔表达式解释器

```java
// 抽象表达式
interface Expression {
    boolean interpret(Context ctx);
}

// 上下文：存储变量值
class Context {
    private java.util.Map<String, Boolean> vars = new java.util.HashMap<>();
    public void set(String name, boolean value) { vars.put(name, value); }
    public boolean get(String name) { return vars.getOrDefault(name, false); }
}

// 终结符表达式：变量
class VariableExpression implements Expression {
    private String name;
    public VariableExpression(String name) { this.name = name; }
    public boolean interpret(Context ctx) {
        return ctx.get(name);
    }
}

// 非终结符表达式：AND
class AndExpression implements Expression {
    private Expression left, right;
    public AndExpression(Expression left, Expression right) {
        this.left = left; this.right = right;
    }
    public boolean interpret(Context ctx) {
        return left.interpret(ctx) && right.interpret(ctx);
    }
}

// 非终结符表达式：OR
class OrExpression implements Expression {
    private Expression left, right;
    public OrExpression(Expression left, Expression right) {
        this.left = left; this.right = right;
    }
    public boolean interpret(Context ctx) {
        return left.interpret(ctx) || right.interpret(ctx);
    }
}

// 非终结符表达式：NOT
class NotExpression implements Expression {
    private Expression expr;
    public NotExpression(Expression expr) { this.expr = expr; }
    public boolean interpret(Context ctx) {
        return !expr.interpret(ctx);
    }
}

// 使用：解析表达式 (A AND B) OR (NOT C)
Context ctx = new Context();
ctx.set("A", true);
ctx.set("B", false);
ctx.set("C", false);

// 构建表达式树
Expression expr = new OrExpression(
    new AndExpression(new VariableExpression("A"), new VariableExpression("B")),
    new NotExpression(new VariableExpression("C"))
);

System.out.println(expr.interpret(ctx));  // true（因为 NOT C = true）
```

---

## 三、适用场景

| 场景 | 例子 |
| --- | --- |
| 简单语法解析 | 正则表达式、SQL 解析 |
| 规则引擎 | 业务规则表达式求值 |
| 配置文件解析 | 自定义 DSL（领域特定语言） |
| 数学表达式 | 计算器、公式引擎 |

---

## 四、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `java.util.regex.Pattern` —— 正则表达式解释器 |
| JDK | `javax.el.ELExpression` —— EL 表达式解析 |
| SpEL | Spring Expression Language —— Spring 表达式语言 |
| OGNL | Struts2 的 OGNL 表达式 |

---

## 五、优缺点

### 优点
- **易扩展**：新增表达式只需新增类，符合开闭原则
- **实现简单**：每个语法规则对应一个类

### 缺点
- **类爆炸**：每条规则都要一个类，复杂语法会导致大量类
- **性能差**：递归解释执行效率低
- **适用场景窄**：只适合简单的语法

---

## 六、注意事项

1. **只适合简单语法** —— 复杂语法建议用 ANTLR、JavaCC 等解析器生成器。
2. **递归调用** —— 解释器模式通常涉及递归调用，注意栈溢出。
3. **实际使用较少** —— 大多数场景用现成的解析库（正则、SpEL、OGNL）即可。

---

## 七、面试常见问题

### Q：解释器模式的使用场景？

**答：** 解释器模式适合「简单语法解析」的场景，如：
- 正则表达式（`java.util.regex.Pattern`）
- EL 表达式（JSP/Spring EL）
- 自定义规则引擎
- 简单数学表达式求值

实际开发中很少手写解释器，多数用现成的解析库。面试中了解思想即可，重点掌握其他高频模式。
