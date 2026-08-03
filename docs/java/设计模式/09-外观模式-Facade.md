# 外观模式（Facade）⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 外观模式](https://www.runoob.com/design-pattern/facade-pattern.html)
> - [Refactoring.Guru - 外观模式](https://refactoring.guru/zh/design-patterns/facade)

---

## 一、概述

### 1. 是什么

**外观模式（Facade）** 为子系统中的一组接口提供一个**一致的界面（统一入口）**，屏蔽子系统内部复杂性。

### 2. 解决什么问题

- 子系统接口复杂，客户端调用困难
- 客户端与子系统耦合太深
- 需要简化接口，提供更高层的抽象

### 3. 通俗类比

电脑的「一键开机」按钮——你按一下，背后其实依次启动 CPU、内存、硬盘、显卡，但外观模式把这些都藏起来了。

### 4. 类图简图

```
┌────────────────┐         ┌────────────────┐
│    Client      │────────▶│    Facade      │
│                │  simple  │ (统一入口)      │
└────────────────┘         └───────┬────────┘
                                   │ 调用
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌──────────────┐ ┌──────────┐ ┌──────────────┐
            │  SubSystemA  │ │ SubSysB  │ │  SubSystemC  │
            └──────────────┘ └──────────┘ └──────────────┘
```

**核心思想：** 客户端只和外观类交互，外观类负责协调子系统的各个组件。

---

## 二、代码示例

### 1. 电脑开机

```java
// 子系统：各自独立
class CPU { void start() { System.out.println("CPU 启动"); } }
class Memory { void start() { System.out.println("内存启动"); } }
class Disk { void start() { System.out.println("硬盘启动"); } }
class GPU { void start() { System.out.println("显卡启动"); } }

// 外观：提供统一简化接口
class ComputerFacade {
    private CPU cpu = new CPU();
    private Memory memory = new Memory();
    private Disk disk = new Disk();
    private GPU gpu = new GPU();

    public void startup() {          // 一键开机
        System.out.println("=== 电脑开机 ===");
        cpu.start();
        memory.start();
        disk.start();
        gpu.start();
        System.out.println("=== 开机完成 ===");
    }

    public void shutdown() {         // 一键关机
        System.out.println("=== 电脑关机 ===");
        gpu.start();
        disk.start();
        memory.start();
        cpu.start();
        System.out.println("=== 关机完成 ===");
    }
}
// 客户端：只需调用外观
new ComputerFacade().startup();
```

### 2. 业务场景：下单流程

```java
// 子系统
class InventoryService {
    boolean checkStock(String productId) { return true; }
    void reduceStock(String productId) { System.out.println("扣减库存"); }
}
class PaymentService {
    boolean pay(String orderId, double amount) { return true; }
}
class ShippingService {
    void ship(String orderId) { System.out.println("发货"); }
}
class NotificationService {
    void send(String userId, String msg) { System.out.println("通知用户：" + msg); }
}

// 外观：下单流程统一入口
class OrderFacade {
    private InventoryService inventory = new InventoryService();
    private PaymentService payment = new PaymentService();
    private ShippingService shipping = new ShippingService();
    private NotificationService notification = new NotificationService();

    public void placeOrder(String userId, String productId, double amount) {
        // 1. 检查库存
        if (!inventory.checkStock(productId)) {
            System.out.println("库存不足");
            return;
        }
        // 2. 扣减库存
        inventory.reduceStock(productId);
        // 3. 支付
        String orderId = "ORDER_" + System.currentTimeMillis();
        if (!payment.pay(orderId, amount)) {
            System.out.println("支付失败");
            return;
        }
        // 4. 发货
        shipping.ship(orderId);
        // 5. 通知用户
        notification.send(userId, "订单 " + orderId + " 已下单成功");
    }
}
// 客户端：一行代码完成下单
new OrderFacade().placeOrder("USER_001", "PROD_001", 99.0);
```

---

## 三、适用场景

| 场景 | 例子 |
| --- | --- |
| 简化复杂子系统 | 一键开机、一键下单 |
| 统一多个接口 | 多个 SDK 统一封装 |
| 分层架构 | 服务层封装数据访问层多个 DAO |
| 老系统封装 | 统一封装老系统接口供新系统调用 |

---

## 四、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| SLF4J | `Logger` —— 统一日志接口，屏蔽底层实现（Log4j、Logback） |
| Spring | `JdbcTemplate` —— 封装 JDBC 复杂操作（连接、Statement、ResultSet） |
| Spring | `RestTemplate` —— 封装 HTTP 请求的复杂细节 |
| Spring MVC | `DispatcherServlet` —— 统一处理请求分发（兼具外观+中介者） |

---

## 五、注意事项

1. **外观不是消灭子系统** —— 客户端仍可直接调用子系统，外观只是提供简化接口。
2. **外观可以多个** —— 不同场景可以有不同的外观类。
3. **外观可能变成「上帝类」** —— 不要把太多职责塞进外观类，否则违反 SRP。
4. **与中介者模式的区别** —— 外观是单向的（客户端 → 子系统），中介者是多向的（同事对象之间互相通信）。

---

## 六、面试常见问题

### Q：外观模式和中介者模式的区别？

**答：**
- **外观模式**：简化客户端对子系统的调用，是**单向**的（高层 → 低层），子系统之间不一定互相通信。
- **中介者模式**：解耦多个同事对象之间的**网状交互**，是**多向**的，同事对象通过中介者互相通信。
- 一句话：外观是「统一入口」，中介者是中枢调度。
