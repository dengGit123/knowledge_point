# 命令模式（Command）⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 命令模式](https://www.runoob.com/design-pattern/command-pattern.html)
> - [Refactoring.Guru - 命令模式](https://refactoring.guru/zh/design-patterns/command)

---

## 一、概述

### 1. 是什么

**命令模式（Command）** 将一个**请求封装成对象**，从而使你可以用不同的请求对客户进行参数化，对请求排队或记录日志，以及支持可撤销的操作。

### 2. 解决什么问题

- 需要将「请求」与「执行」解耦
- 需要支持撤销/重做
- 需要请求排队、记录日志
- 需要宏命令（批量执行）

### 3. 通俗类比

餐厅点餐——你把想吃的菜写在订单（命令对象）上，交给服务员（调用者），服务员交给厨师（执行者）去做。订单本身就是命令对象，记录了要做什么、怎么做。

### 4. 类图简图

```
┌────────────────┐        ┌────────────────┐
│   Client       │───────▶│   Invoker      │
│                │ 创建    │ (调用者)        │
└────────────────┘        │ + invoke()     │
                          └───────┬────────┘
                                  │ 持有
                          ┌───────▼────────┐
                          │   Command      │
                          │ (抽象命令)      │
                          │ + execute()    │
                          │ + undo()       │
                          └───────┬────────┘
                                  △
                          ┌───────┴────────┐
                          │ ConcreteCommand│───▶ Receiver
                          │ (具体命令)      │      (执行者)
                          └────────────────┘
```

**核心角色：**
- **Command（抽象命令）**：定义执行接口
- **ConcreteCommand（具体命令）**：持有接收者引用，调用接收者操作
- **Receiver（接收者）**：真正执行操作的对象
- **Invoker（调用者）**：持有命令对象，触发执行

---

## 二、代码示例：遥控器控制电器

```java
// 接收者：电灯
class Light {
    void on() { System.out.println("电灯打开"); }
    void off() { System.out.println("电灯关闭"); }
}
// 接收者：空调
class AirConditioner {
    void on() { System.out.println("空调打开"); }
    void off() { System.out.println("空调关闭"); }
}

// 抽象命令
interface Command {
    void execute();
    void undo();
}
// 具体命令：开灯
class LightOnCommand implements Command {
    private Light light;
    public LightOnCommand(Light light) { this.light = light; }
    public void execute() { light.on(); }
    public void undo() { light.off(); }
}
// 具体命令：关灯
class LightOffCommand implements Command {
    private Light light;
    public LightOffCommand(Light light) { this.light = light; }
    public void execute() { light.off(); }
    public void undo() { light.on(); }
}
// 具体命令：开空调
class AirOnCommand implements Command {
    private AirConditioner ac;
    public AirOnCommand(AirConditioner ac) { this.ac = ac; }
    public void execute() { ac.on(); }
    public void undo() { ac.off(); }
}

// 调用者：遥控器
class RemoteControl {
    private Command[] buttons = new Command[5];
    private final Stack<Command> history = new Stack<>();  // 撤销历史

    public void setCommand(int slot, Command cmd) { buttons[slot] = cmd; }
    public void pressButton(int slot) {
        Command cmd = buttons[slot];
        cmd.execute();
        history.push(cmd);  // 记录历史
    }
    public void undo() {
        if (!history.isEmpty()) {
            Command cmd = history.pop();
            cmd.undo();
        }
    }
}

// 使用
Light light = new Light();
RemoteControl remote = new RemoteControl();
remote.setCommand(0, new LightOnCommand(light));
remote.setCommand(1, new LightOffCommand(light));
remote.pressButton(0);  // 电灯打开
remote.pressButton(1);  // 电灯关闭
remote.undo();          // 撤销：电灯打开
```

---

## 三、宏命令（批量执行）

```java
// 宏命令：一次执行多个命令
class MacroCommand implements Command {
    private List<Command> commands = new ArrayList<>();
    public void add(Command cmd) { commands.add(cmd); }
    public void execute() {
        for (Command cmd : commands) cmd.execute();
    }
    public void undo() {
        // 逆序撤销
        for (int i = commands.size() - 1; i >= 0; i--) {
            commands.get(i).undo();
        }
    }
}

// 使用：一键开启派对模式
MacroCommand partyMode = new MacroCommand();
partyMode.add(new LightOnCommand(light));
partyMode.add(new AirOnCommand(ac));
partyMode.execute();   // 同时开灯+开空调
```

---

## 四、适用场景

| 场景 | 例子 |
| --- | --- |
| 撤销/重做 | 编辑器 Ctrl+Z / Ctrl+Y |
| 任务队列 | 线程池任务排队执行 |
| 日志记录 | 记录操作历史以便恢复 |
| 宏命令 | 批量执行多个操作 |
| 事务操作 | 数据库事务回滚 |

---

## 五、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `Runnable` —— 命令接口，`run()` 是执行方法 |
| JDK | `Callable` —— 带返回值的命令 |
| JDK | `Swing.Action` —— GUI 命令（支持图标、快捷键、启用/禁用） |
| Spring | `MethodInvocation` —— AOP 中方法的调用封装为命令 |

---

## 六、注意事项

1. **可能导致类爆炸** —— 每个操作都要一个具体命令类。
2. **可以用 Lambda 简化** —— 如果命令接口是函数式接口，可以用 Lambda 替代具体命令类。
3. **撤销需要保存状态** —— 实现 undo 需要命令对象保存执行前的状态。

```java
// Lambda 简化版
class RemoteControl {
    private Runnable[] actions = new Runnable[5];
    public void setAction(int slot, Runnable action) { actions[slot] = action; }
    public void press(int slot) { actions[slot].run(); }
}
// 使用：无需创建具体命令类
remote.setAction(0, () -> light.on());
remote.setAction(1, () -> light.off());
```

---

## 七、面试常见问题

### Q：命令模式的典型应用？

**答：**
- **JDK**：`Runnable`、`Callable` —— 把任务封装成对象
- **Swing**：`Action` —— GUI 按钮/菜单的命令封装
- **编辑器**：撤销/重做功能 —— 命令历史栈
- **线程池**：任务排队执行 —— 命令对象作为任务提交
