### 一、概述

> 📖 [Spring Web MVC](https://docs.spring.io/spring-framework/reference/web/webmvc.html)

**Spring MVC** 是 Spring 的 Web 框架，负责处理 HTTP 请求、构建接口。在前后端分离时代，它主要承担 **Controller 层**——接收前端的请求，调用业务逻辑，返回 JSON 数据。

大白话：Spring MVC 像餐厅的「**前台调度系统**」——客人（请求）进门，前台（DispatcherServlet）负责分流：先查菜单表（HandlerMapping）找到对应的服务员（Controller），再安排服务员去服务（HandlerAdapter 执行），最后把菜（响应）端给客人。整个流程全自动，你只管写「服务员」。

| 你将学到 | 说明 |
| --- | --- |
| MVC 思想 | Model/View/Controller 分离 |
| 核心组件 | DispatcherServlet 等 |
| 请求处理流程 | 一个请求从头到尾经历了什么 |
| `@Controller` vs `@RestController` | 两者的区别 |

> 📌 本文是 SpringMVC 子目录的入口，后续 [[请求与响应处理]]、[[拦截器]]、[[全局异常处理]] 都建立在这套流程上。

---

### 二、MVC 思想

MVC 把应用分成三部分，各司其职：

| 组成 | 职责 | 在前后端分离里 |
| --- | --- | --- |
| **Model（模型）** | 业务数据和逻辑 | Service + 实体类 |
| **View（视图）** | 展示数据 | 前端页面（Vue/React），后端基本不碰 |
| **Controller（控制器）** | 接收请求、调度 | `@RestController` 接口层 |

> 💡 **提示：** 传统的 MVC 后端要渲染页面（JSP/Thymeleaf），View 很重要。现在前后端分离，后端只返回 JSON，View 的职责转移到前端，Spring MVC 主要就是 **Controller**。

---

### 三、核心组件

Spring MVC 的核心是 **DispatcherServlet**（前端控制器），所有请求都先经过它，再由它分发。围绕它有几个关键组件：

| 组件 | 作用 | 通俗类比 |
| --- | --- | --- |
| **DispatcherServlet** | 前端控制器，请求总入口 | 餐厅前台总调度 |
| **HandlerMapping** | 根据 URL 找到对应的 Controller 方法 | 查「菜单→服务员」对照表 |
| **HandlerAdapter** | 真正执行 Controller 方法 | 指挥服务员去干活 |
| **HandlerInterceptor** | 拦截器，在方法前后插入逻辑 | 服务前的迎宾、服务后的送客 |
| **ViewResolver** | 视图解析器（前后端分离时弱化） | 决定用哪张菜单纸（返回 JSON 时用不到） |
| **HandlerExceptionResolver** | 异常处理 | 出问题时的客服 |

```
            请求
             │
             ▼
   ┌──────────────────┐
   │ DispatcherServlet │  ◄── 总入口
   └────────┬─────────┘
            │ ① 找处理器
            ▼
   ┌──────────────────┐
   │  HandlerMapping   │  ◄── URL → Controller方法
   └────────┬─────────┘
            │ ② 执行处理器
            ▼
   ┌──────────────────┐
   │  HandlerAdapter   │  ◄── 调用 Controller 方法
   └────────┬─────────┘
            │ ③ 返回结果
            ▼
        JSON / 视图
```

---

### 四、一个请求的完整流程

这是 Spring MVC 最核心的知识——一个 HTTP 请求从到达到响应，经历的步骤：

```
① 用户发起 HTTP 请求
        │
        ▼
② DispatcherServlet 接收请求
        │
        ▼
③ DispatcherServlet 调用 HandlerMapping
   根据 URL 找到匹配的 Controller 方法（Handler）+ 拦截器链
        │
        ▼
④ DispatcherServlet 调用 HandlerAdapter 执行 Handler
        │
        ▼
⑤ 拦截器 preHandle() ── 返回 false 则中断，直接返回
        │
        ▼
⑥ HandlerAdapter 真正执行 Controller 方法（你的业务逻辑）
        │
        ▼
⑦ Controller 返回结果（对象/视图名）
        │
        ▼
⑧ 拦截器 postHandle()
        │
        ▼
⑨ 处理结果：
   • 前后端分离：@ResponseBody 让结果转 JSON 直接写入响应
   • 传统 MVC：ViewResolver 解析视图并渲染
        │
        ▼
⑩ 拦截器 afterCompletion() ── 请求结束（含异常情况）
        │
        ▼
      响应返回用户
```

> 💡 **记忆要点：** 核心是「**DispatcherServlet 总调度 → HandlerMapping 找方法 → HandlerAdapter 执行方法**」三步。拦截器在方法前后有 `preHandle`/`postHandle`/`afterCompletion` 三个时机（详见 [[拦截器]]）。

---

### 五、`@Controller` 与 `@RestController`

```java
@Controller                   // 返回视图名（传统 MVC）
public class PageController {
    @GetMapping("/home")
    public String home() {
        return "index";       // 解析为视图 index.html
    }
}

@RestController               // = @Controller + @ResponseBody，返回数据（前后端分离）
public class ApiController {
    @GetMapping("/user")
    public User user() {
        return new User();    // 直接序列化成 JSON 返回
    }
}
```

| 对比 | `@Controller` | `@RestController` |
| --- | --- | --- |
| 默认返回 | 视图名 | **数据（JSON）** |
| 组成 | 单独 | `@Controller` + `@ResponseBody` |
| 适用 | 服务端渲染（Thymeleaf） | **前后端分离 API** |

> 💡 **提示：** 现在绝大多数项目用 `@RestController`，每个方法默认返回 JSON。配合 `@RequestMapping` 系列注解映射请求。

请求映射注解（都在 `@RestController` 类的方法上）：

| 注解 | HTTP 方法 | 示例 |
| --- | --- | --- |
| `@GetMapping` | GET（查询） | `@GetMapping("/users/{id}")` |
| `@PostMapping` | POST（新增） | `@PostMapping("/users")` |
| `@PutMapping` | PUT（修改） | `@PutMapping("/users/{id}")` |
| `@DeleteMapping` | DELETE（删除） | `@DeleteMapping("/users/{id}")` |

---

### 六、实际应用场景

1. **前后端分离 API**：`@RestController` 提供 JSON 接口，最常见。
2. **服务端渲染**：`@Controller` + Thymeleaf，返回 HTML 页面。
3. **文件上传下载**：MultipartFile 处理。
4. **统一异常处理**：配合 [[全局异常处理]] 的 `@RestControllerAdvice`。

---

### 七、常见问题与注意事项

> ⚠️ **注意：**
> - **404 找不到接口**：检查 `@RequestMapping` 路径、Controller 是否被扫描（启动类位置）。
> - **前后端分离用 `@RestController`**，不要用 `@Controller`（否则会把返回值当视图名，报 404）。
> - 静态资源默认放 `resources/static/`，默认不拦截（可通过配置调整）。

> 💡 **提示：** 理解了 DispatcherServlet 的调度流程，后续排查任何「请求怎么没到 Controller」「为什么返回 406/415」等问题，都能顺藤摸瓜。

---

### 八、总结

- **Spring MVC 的核心是 DispatcherServlet**，所有请求先到它，再分发。
- **三步调度**：HandlerMapping 找方法 → HandlerAdapter 执行方法 → 返回结果。
- **拦截器**在方法前后有 `preHandle`/`postHandle`/`afterCompletion` 三个切点。
- 前后端分离用 `@RestController`（返回 JSON），传统渲染用 `@Controller`。
- 请求映射用 `@GetMapping`/`@PostMapping` 等语义化注解。

下一篇，怎么接收参数、返回数据：[[请求与响应处理]]。
