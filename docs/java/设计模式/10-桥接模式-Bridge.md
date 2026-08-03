# 桥接模式（Bridge）⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 桥接模式](https://www.runoob.com/design-pattern/bridge-pattern.html)
> - [Refactoring.Guru - 桥接模式](https://refactoring.guru/zh/design-patterns/bridge)

---

## 一、概述

### 1. 是什么

**桥接模式（Bridge）** 将**抽象部分**与**实现部分**分离，使它们可以**独立变化**。通过组合替代继承，避免类爆炸。

### 2. 解决什么问题

- 一个类有多个维度的变化，如果用继承会导致类爆炸（M×N 个子类）
- 需要在运行时切换实现
- 抽象和实现应该独立扩展

### 3. 通俗类比

「不同品牌 × 不同颜色」的汽车——如果用继承，需要创建 `红色宝马`、`蓝色宝马`、`红色奔驰`、`蓝色奔驰`... 桥接模式把品牌和颜色分开，通过组合实现任意搭配。

### 4. 类图简图

```
┌────────────────────┐          ┌────────────────────┐
│   Abstraction      │◇────────▶│ Implementor        │
│ (抽象)             │  组合    │ (实现接口)          │
│ - implementor      │          │ + operationImpl()  │
└────────┬───────────┘          └────────┬───────────┘
         △                               △
         │ 扩展                           │ 扩展
┌────────┴───────────┐          ┌────────┴───────────┐
│ RefinedAbstraction │          │ ConcreteImplementor│
└────────────────────┘          └────────────────────┘
```

---

## 二、代码示例：消息发送

```java
// 实现接口：发送渠道
interface MessageSender {
    void send(String message, String to);
}
// 具体实现：短信
class SmsSender implements MessageSender {
    public void send(String msg, String to) {
        System.out.println("短信发送给 " + to + "：" + msg);
    }
}
// 具体实现：邮件
class EmailSender implements MessageSender {
    public void send(String msg, String to) {
        System.out.println("邮件发送给 " + to + "：" + msg);
    }
}
// 具体实现：微信
class WechatSender implements MessageSender {
    public void send(String msg, String to) {
        System.out.println("微信发送给 " + to + "：" + msg);
    }
}

// 抽象：消息类型
abstract class Message {
    protected MessageSender sender;   // 桥接：持有实现接口
    public Message(MessageSender sender) { this.sender = sender; }
    public abstract void sendMessage(String content, String to);
}
// 具体抽象：普通消息
class NormalMessage extends Message {
    public NormalMessage(MessageSender sender) { super(sender); }
    public void sendMessage(String content, String to) {
        sender.send("[普通] " + content, to);
    }
}
// 具体抽象：紧急消息
class UrgentMessage extends Message {
    public UrgentMessage(MessageSender sender) { super(sender); }
    public void sendMessage(String content, String to) {
        sender.send("[紧急] " + content, to);
    }
}

// 使用：任意组合
Message msg1 = new NormalMessage(new SmsSender());
msg1.sendMessage("你好", "13800000000");       // 短信发普通消息

Message msg2 = new UrgentMessage(new EmailSender());
msg2.sendMessage("系统告警", "admin@test.com"); // 邮件发紧急消息

// 运行时切换实现
Message msg3 = new NormalMessage(new WechatSender());
msg3.sendMessage("通知", "user001");          // 微信发普通消息
```

---

## 三、对比继承方案

### ❌ 继承方案（类爆炸）

```java
// 3 种消息类型 × 3 种发送渠道 = 9 个类
class NormalSmsMessage { }
class NormalEmailMessage { }
class NormalWechatMessage { }
class UrgentSmsMessage { }
class UrgentEmailMessage { }
class UrgentWechatMessage { }
// ... 每加一种渠道就要加 3 个类
```

### ✅ 桥接方案（组合）

```java
// 3 种消息类型 + 3 种发送渠道 = 6 个类
// 新增渠道只需新增 1 个实现类，新增消息类型只需新增 1 个抽象类
```

---

## 四、适用场景

| 场景 | 例子 |
| --- | --- |
| 多维度变化 | 消息类型 × 发送渠道 |
| 运行时切换实现 | 不同数据库驱动 |
| 避免类爆炸 | 不同形状 × 不同颜色 × 不同绘制方式 |
| 独立扩展抽象和实现 | JDBC 的 Driver 接口与具体数据库实现 |

---

## 五、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDBC | `DriverManager` 与 `Driver` 接口 —— 抽象（DriverManager）与实现（MySQL/Oracle Driver）分离 |
| SLF4J | 日志门面与具体日志实现（Log4j、Logback）的桥接 |
| AWT | 图形组件与本地平台实现的桥接 |

---

## 六、注意事项

1. **识别两个独立变化的维度** —— 桥接模式的关键是找到抽象和实现两个维度。
2. **优先用组合** —— 桥接模式的本质就是「组合优于继承」。
3. **与策略模式的区别** —— 策略模式关注算法的替换，桥接模式关注抽象与实现的分离。

---

## 七、面试常见问题

### Q：桥接模式和策略模式的区别？

**答：**
- **策略模式**：关注**算法的替换**，客户端主动选择策略，策略之间是平等的替代关系。
- **桥接模式**：关注**抽象与实现的分离**，两个维度独立变化，通过组合连接。
- 结构上很像（都是组合），但**意图不同**：策略是「换算法」，桥接是「解耦两个维度」。
