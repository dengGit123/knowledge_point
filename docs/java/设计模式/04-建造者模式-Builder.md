# 建造者模式（Builder）⭐⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 建造者模式](https://www.runoob.com/design-pattern/builder-pattern.html)
> - [Refactoring.Guru - 建造者模式](https://refactoring.guru/zh/design-patterns/builder)

---

## 一、概述

### 1. 是什么

**建造者模式（Builder）** 将一个**复杂对象的构造**与它的**表示**分离，使得同样的构造过程可以创建不同的表示。常用于「分步构建、参数很多」的对象。

### 2. 解决什么问题

- 对象有多个可选参数，构造方法参数爆炸
- 需要分步骤构建对象
- 需要创建不可变对象

### 3. 通俗类比

点一份「套餐」——你不必一次性报出 10 个参数，而是按步骤选择主食、饮料、甜点。建造者模式就是帮你「一步步组装对象」的流水线。

### 4. 类图简图

```
┌───────────────┐    产品      ┌─────────────┐
│   Director    │─────────────▶│   Product   │
│ (指挥者:按顺序)│              └─────────────┘
└───────┬───────┘                     ▲
        │ 构建                        │
┌───────▼───────┐   逐步设置   ┌──────┴──────┐
│  Builder(抽象)│─────────────▶│ ConcreteBdr │
└───────────────┘              └─────────────┘
```

**核心角色：**
- **Builder（抽象建造者）**：定义构建各部分的接口
- **ConcreteBuilder（具体建造者）**：实现构建逻辑
- **Product（产品）**：被构建的复杂对象
- **Director（指挥者）**：控制构建顺序（可选）

---

## 二、经典建造者模式

### 1. 代码示例

```java
// 产品：电脑
class Computer {
    private String cpu;
    private String ram;
    private String disk;
    // ... 很多字段
    // 构造方法私有，只能通过 Builder 创建
    private Computer(Builder b) {
        this.cpu = b.cpu;
        this.ram = b.ram;
        this.disk = b.disk;
    }
    // getter 省略

    // 静态内部 Builder
    public static class Builder {
        private String cpu;   // 必填
        private String ram;   // 可选
        private String disk;  // 可选

        public Builder(String cpu) { this.cpu = cpu; }  // 必填项
        public Builder ram(String ram) { this.ram = ram; return this; }
        public Builder disk(String disk) { this.disk = disk; return this; }
        public Computer build() { return new Computer(this); }
    }
}

// 使用
Computer pc = new Computer.Builder("Intel i7")
        .ram("16GB")
        .disk("512GB SSD")
        .build();
```

### 2. 带 Director 的完整写法

```java
// 抽象 Builder
interface ComputerBuilder {
    void buildCpu();
    void buildRam();
    void buildDisk();
    Computer getResult();
}
// 具体 Builder：游戏电脑
class GamingComputerBuilder implements ComputerBuilder {
    private Computer pc = new Computer();
    public void buildCpu() { pc.setCpu("Intel i9"); }
    public void buildRam() { pc.setRam("32GB"); }
    public void buildDisk() { pc.setDisk("1TB SSD"); }
    public Computer getResult() { return pc; }
}
// Director：控制构建顺序
class ComputerDirector {
    public Computer construct(ComputerBuilder builder) {
        builder.buildCpu();
        builder.buildRam();
        builder.buildDisk();
        return builder.getResult();
    }
}
// 使用
ComputerDirector director = new ComputerDirector();
Computer gamingPc = director.construct(new GamingComputerBuilder());
```

---

## 三、链式调用（最常见的实战写法）

实际开发中最常用的是**链式调用**写法，省略 Director，直接用内部 Builder：

```java
// 复杂产品：一个 User 对象有很多可选字段
public class User {
    private final String name;       // 必填
    private final int age;           // 可选
    private final String email;      // 可选
    private final String phone;      // 可选

    private User(Builder b) {
        this.name = b.name;
        this.age = b.age;
        this.email = b.email;
        this.phone = b.phone;
    }

    // 静态内部 Builder，返回 this 实现链式调用
    public static class Builder {
        private final String name;
        private int age;
        private String email;
        private String phone;

        public Builder(String name) { this.name = name; }   // 必填项放构造参数
        public Builder age(int age) { this.age = age; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public User build() { return new User(this); }
    }
}

// 使用：链式调用，可读性极佳
User user = new User.Builder("张三")
        .age(28)
        .email("zs@example.com")
        .phone("13800000000")
        .build();
```

> 💡 **提示：** Lombok 的 `@Builder` 注解可以自动生成上面的 Builder 代码，实际开发中非常常用。

---

## 四、适用场景

| 场景 | 例子 |
| --- | --- |
| 参数多（>4 个）且多数可选 | 配置对象、HTTP 请求对象 |
| 需要分步构建 | SQL 拼装、HTML 文档构建 |
| 不可变对象 | `String`、`StringBuilder` |
| 不同构建过程产生不同表示 | 同一份数据生成 JSON / XML / HTML |

---

## 五、与构造方法对比

### ❌ 构造方法 telescoping（重叠构造器）

```java
// 参数多时，构造方法爆炸
class User {
    public User(String name) { ... }
    public User(String name, int age) { ... }
    public User(String name, int age, String email) { ... }
    public User(String name, int age, String email, String phone) { ... }
}
// 使用时不知道每个参数是什么意思
new User("张三", 28, null, "13800000000");  // null 代表什么？
```

### ❌ JavaBeans 模式

```java
User u = new User();
u.setName("张三");
u.setAge(28);
// 对象处于中间状态，线程不安全，不可变
```

### ✅ 建造者模式

```java
User u = new User.Builder("张三").age(28).phone("13800000000").build();
// 可读性好、支持不可变、线程安全
```

---

## 六、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `StringBuilder` / `StringBuffer` —— 链式 append |
| JDK | `Stream.Builder` —— 构建 Stream |
| JDK | `Locale.Builder` —— 构建 Locale 对象 |
| 第三方 | OkHttp `Request.Builder` —— 链式构建 HTTP 请求 |
| 第三方 | Lombok `@Builder` 注解 —— 自动生成 Builder |

---

## 七、注意事项

1. **必填项 vs 可选参数** —— 必填项放 Builder 构造参数，可选参数用链式方法。
2. **build() 可做校验** —— 在 `build()` 方法中统一校验参数合法性。
3. **不可变对象** —— 配合 `final` 字段，创建不可变对象。
4. **不要滥用** —— 参数少于 3 个时，直接构造方法即可。

---

## 八、面试常见问题

### Q：建造者模式和工厂模式有什么区别？

**答：**
- **工厂模式**关注的是**创建什么对象**（哪种产品），强调的是「选择」。
- **建造者模式**关注的是**怎么创建对象**（组装过程），强调的是「步骤」。
- 工厂模式创建的对象通常一步到位；建造者模式分步构建，适合复杂对象。

### Q：什么场景下适合用建造者模式？

**答：** 当一个对象有多个可选参数（通常超过 4 个），或者需要分步骤构建时，建造者模式是最佳选择。典型场景：HTTP 请求对象、配置对象、SQL 构建器、不可变对象的创建。
