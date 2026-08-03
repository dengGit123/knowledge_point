# 中介者模式（Mediator）⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 中介者模式](https://www.runoob.com/design-pattern/mediator-pattern.html)
> - [Refactoring.Guru - 中介者模式](https://refactoring.guru/zh/design-patterns/mediator)

---

## 一、概述

### 1. 是什么

**中介者模式（Mediator）** 用一个**中介对象**来封装一系列的对象交互。中介者使各对象不需要显式地相互引用，从而使其耦合松散，而且可以独立地改变它们之间的交互。

### 2. 解决什么问题

- 多个对象之间存在网状交互（M×N 条关系）
- 对象之间互相引用，耦合严重
- 想集中管理对象间的通信

### 3. 通俗类比

「机场调度塔」——飞机之间不直接通信，都通过调度塔协调起降。调度塔就是中介者，把飞机之间的网状通信变成星形通信。

### 4. 类图简图

```
        ┌────────────────┐
        │   Mediator     │
        │ (中介者接口)    │
        │ + send(msg, colleague) │
        └───────┬────────┘
                △
        ┌───────┴────────┐
        │ ConcreteMediator│
        │ - colleagues    │
        └────────────────┘
                ▲
                │ 通信
    ┌───────────┼───────────┐
    │           │           │
┌───┴───┐  ┌───┴───┐  ┌───┴───┐
│CollegA│  │CollegB│  │CollegC│   ← 同事对象
└───────┘  └───────┘  └───────┘
```

**核心角色：**
- **Mediator（中介者接口）**：定义通信接口
- **ConcreteMediator（具体中介者）**：协调各同事对象
- **Colleague（同事类）**：通过中介者与其他同事通信

---

## 二、代码示例：聊天室

```java
// 中介者接口
interface ChatMediator {
    void sendMessage(String msg, User user);
    void addUser(User user);
}

// 具体中介者：聊天室
class ChatRoom implements ChatMediator {
    private List<User> users = new ArrayList<>();

    public void addUser(User user) {
        users.add(user);
    }

    public void sendMessage(String msg, User sender) {
        // 给除发送者外的所有人发消息
        for (User u : users) {
            if (u != sender) {
                u.receive(msg);
            }
        }
    }
}

// 同事类：用户
class User {
    private String name;
    private ChatMediator mediator;

    public User(String name, ChatMediator mediator) {
        this.name = name;
        this.mediator = mediator;
        mediator.addUser(this);
    }

    public void send(String msg) {
        System.out.println(name + " 发送：" + msg);
        mediator.sendMessage(msg, this);  // 通过中介者转发
    }

    public void receive(String msg) {
        System.out.println(name + " 收到：" + msg);
    }
}

// 使用
ChatMediator chatRoom = new ChatRoom();
User alice = new User("Alice", chatRoom);
User bob = new User("Bob", chatRoom);
User charlie = new User("Charlie", chatRoom);

alice.send("大家好！");
// Alice 发送：大家好！
// Bob 收到：大家好！
// Charlie 收到：大家好！
```

---

## 三、对比直接通信

### ❌ 直接通信（网状耦合）

```java
class User {
    private List<User> friends = new ArrayList<>();
    void send(String msg) {
        for (User friend : friends) {
            friend.receive(msg);  // 直接调用
        }
    }
}
// 问题：每加一个好友关系都要互相引用，M×N 条关系
```

### ✅ 中介者模式（星形解耦）

```java
class User {
    private ChatMediator mediator;
    void send(String msg) {
        mediator.sendMessage(msg, this);  // 通过中介者
    }
}
// 优点：用户之间互不认知，关系变成 M+N 条
```

---

## 四、适用场景

| 场景 | 例子 |
| --- | --- |
| 多对象网状交互 | 聊天室、机场调度 |
| 集中控制逻辑 | MVC 的 Controller |
| 解耦同事对象 | 表单组件联动（省市区三级联动） |
| 微服务 | API 网关（中介所有服务调用） |

---

## 五、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| Spring MVC | `DispatcherServlet` —— 中介所有组件（HandlerMapping、HandlerAdapter、ViewResolver） |
| JDK | `java.util.Timer` —— 中介调度多个 `TimerTask` |
| JDK | `java.util.concurrent.Executor` —— 中介任务提交和执行 |
| 微服务 | API 网关 —— 中介所有服务调用 |

---

## 六、注意事项

1. **中介者可能变成「上帝类」** —— 不要把太多逻辑塞进中介者，否则违反 SRP。
2. **中介者模式 vs 外观模式** —— 外观是单向的（高层 → 低层），中介者是多向的（同事之间互相通信）。
3. **中介者模式 vs 观察者模式** —— 观察者是一对多广播，中介者是点对点协调。

---

## 七、面试常见问题

### Q：中介者模式和外观模式的区别？

**答：**
- **外观模式**：简化客户端对子系统的调用，是**单向**的（高层 → 低层），子系统之间不一定互相通信。
- **中介者模式**：解耦多个同事对象之间的**网状交互**，是**多向**的，同事对象通过中介者互相通信。
- 一句话：外观是「统一入口」，中介者是「中枢调度」。

### Q：Spring MVC 中的中介者模式？

**答：** Spring MVC 的 `DispatcherServlet` 是中介者：
- `HandlerMapping` 找处理器
- `HandlerAdapter` 执行处理器
- `ViewResolver` 解析视图
- 这些组件之间不直接通信，都通过 `DispatcherServlet` 协调
