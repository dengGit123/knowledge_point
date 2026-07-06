### 一、概述

> 📖 [REST 论文（Fielding）](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) ｜ [Microsoft REST API 指南](https://github.com/microsoft/api-guidelines)

**REST（Representational State Transfer，表现层状态转化）** 是一种 **API 设计风格**。RESTful 接口用一句话概括：**用 URL 表示资源，用 HTTP 方法表示对资源的操作。**

大白话：传统接口像「**动作 + 对象**」（`/getUserById?id=1`、`/deleteUser?id=1`），URL 里塞满了动词；RESTful 接口像「**对象 + 动词**」——URL 只有资源（`/users/1`），用 HTTP 方法（GET/POST/PUT/DELETE）表达动作。资源是名词，操作靠方法。

| 你将学到 | 说明 |
| --- | --- |
| REST 核心理念 | 资源、HTTP 方法、无状态 |
| HTTP 方法语义 | GET/POST/PUT/DELETE 干什么 |
| URL 设计规范 | 怎么命名、怎么分层 |
| 状态码 | 返回什么状态码合适 |

> 📌 配合 [[请求与响应处理]]、[[SpringMVC工作原理]] 阅读。

---

### 二、REST 的核心理念

| 理念 | 含义 |
| --- | --- |
| **资源（Resource）** | 一切皆资源，用 URL 唯一标识（如 `/users`、`/orders`） |
| **统一接口** | 用标准 HTTP 方法（GET/POST/PUT/DELETE）操作资源 |
| **无状态** | 每个请求自包含所有信息，服务器不保存客户端状态 |
| **表现层** | 资源可以用 JSON/XML 等多种格式表现（现在统一用 JSON） |

> 💡 **关键认知：** REST 不是协议、不是标准，而是**设计风格**。它让接口「**看 URL 就知道操作什么，看方法就知道做什么**」，可读性和规范性都更好。

---

### 三、HTTP 方法的语义

REST 用不同的 HTTP 方法表示不同的操作，并且方法有**幂等性**和**安全性**之分：

| 方法 | 操作 | 安全（不改变资源） | 幂等（多次执行结果相同） |
| --- | --- | --- | --- |
| **GET** | 查询 | ✅ 是 | ✅ 是 |
| **POST** | 新增 | ❌ 否 | ❌ 否 |
| **PUT** | 整体更新 | ❌ 否 | ✅ 是 |
| **PATCH** | 局部更新 | ❌ 否 | ✅ 是 |
| **DELETE** | 删除 | ❌ 否 | ✅ 是 |

> 💡 **提示：**
> - **安全**：GET 只是查询，不该有副作用（别在 GET 里删数据！）。
> - **幂等**：PUT/DELETE 多次调用和一次效果一样（重复提交订单用 PUT 不会重复创建）。

---

### 四、URL 设计规范

#### 1. 用名词，复数，不用动词

```
✅ /users              （资源：用户集合）
✅ /users/123          （资源：id=123 的用户）
❌ /getUsers           （不要动词）
❌ /user               （用复数）
```

#### 2. 用层级表达资源关系

```
✅ /users/123/orders          （用户 123 的订单集合）
✅ /users/123/orders/456      （用户 123 的订单 456）
```

#### 3. 查询用查询参数，不要塞进路径

```
✅ /users?role=admin&page=1   （筛选条件用查询参数）
❌ /users/admin/page/1
```

#### 4. 版本控制

```
✅ /api/v1/users              （URI 里带版本，便于升级）
✅ /api/v2/users
```

---

### 五、HTTP 状态码

状态码是接口的「**自我介绍**」，告诉调用方结果如何：

| 状态码 | 含义 | RESTful 场景 |
| --- | --- | --- |
| `200 OK` | 成功 | GET/PUT/PATCH 成功 |
| `201 Created` | 已创建 | POST 新增成功 |
| `204 No Content` | 成功但无内容 | DELETE 成功 |
| `400 Bad Request` | 请求错误 | 参数校验失败 |
| `401 Unauthorized` | 未认证 | 没登录 / token 失效 |
| `403 Forbidden` | 无权限 | 登录了但没权限 |
| `404 Not Found` | 资源不存在 | id 找不到 |
| `409 Conflict` | 冲突 | 唯一约束冲突 |
| `500 Internal Server Error` | 服务器错误 | 代码异常 |

> 💡 **提示：** 不少团队为了前端处理方便，**HTTP 状态码一律返回 200，错误信息放在 body 的 `code` 字段里**。这违背了纯 REST 理念，但在实际工程里很常见。两种方式都行，**团队内统一**最重要。

---

### 六、完整 RESTful 接口示例

一套标准的用户资源接口：

```java
@RestController
@RequestMapping("/users")        // 资源：users
public class UserController {

    @GetMapping                  // GET    /users           → 查询列表
    public List<User> list() { ... }

    @GetMapping("/{id}")         // GET    /users/{id}      → 查询单个
    public User get(@PathVariable Long id) { ... }

    @PostMapping                 // POST   /users           → 新增
    public User create(@RequestBody User user) { ... }

    @PutMapping("/{id}")         // PUT    /users/{id}      → 整体更新
    public User update(@PathVariable Long id, @RequestBody User user) { ... }

    @DeleteMapping("/{id}")      // DELETE /users/{id}      → 删除
    public void delete(@PathVariable Long id) { ... }
}
```

资源关系示例：

```java
// 查某个用户的所有订单（嵌套资源）
@GetMapping("/users/{userId}/orders")
public List<Order> orders(@PathVariable Long userId) { ... }
```

---

### 七、RESTful vs 传统 RPC 风格

| 操作 | 传统 RPC 风格 | RESTful 风格 |
| --- | --- | --- |
| 查询用户 | `GET /getUserById?id=1` | `GET /users/1` |
| 用户列表 | `GET /listUsers` | `GET /users` |
| 新增用户 | `POST /addUser` | `POST /users` |
| 修改用户 | `POST /updateUser` | `PUT /users/1` |
| 删除用户 | `POST /deleteUser?id=1` | `DELETE /users/1` |

| 对比 | 传统 RPC | RESTful |
| --- | --- | --- |
| URL | 含动词，每个操作一个 URL | 纯名词，一个资源共用一组 URL |
| 方法 | 基本都用 GET/POST | GET/POST/PUT/DELETE 各司其职 |
| 可读性 | 一般 | **好** |
| 规范性 | 不统一 | **业界通用** |

> ⚠️ **注意：** 传统风格里全用 POST（包括查询、删除）很常见，但**违背了 HTTP 语义**（GET 该是安全的）。新项目建议遵循 RESTful。

---

### 八、实际应用场景

1. **前后端分离 API**：前端（Vue/小程序/APP）调用的后端接口，RESTful 是事实标准。
2. **开放平台 API**：第三方对接的开放接口，RESTful 让对接方易于理解。
3. **微服务间 HTTP 调用**：如 OpenFeign 调用，接口规范统一（见 [[../SpringCloud微服务/服务间调用OpenFeign]]）。

---

### 九、常见问题与注意事项

> ⚠️ **注意：**
> - **GET 不要做修改/删除操作**——GET 可能被浏览器、CDN、网关缓存，产生意外副作用。
> - **批量操作 RESTful 较难表达**（如批量删除），常见做法：`DELETE /users` + body 传 id 列表，或自定义 `POST /users/batch-delete`，工程上可接受。
> - **PUT vs PATCH**：PUT 是「整体替换」，PATCH 是「局部更新」。用 PATCH 改一个字段更省带宽，但有的框架/客户端对 PATCH 支持不完善，实际常用 PUT 代替。

> 💡 **提示：** RESTful 是「**指导原则**」而非「**铁律**」。在可读性和纯粹性之间权衡，**团队统一、接口清晰**才是目标。

---

### 十、总结

- **RESTful = 资源（URL 名词）+ 操作（HTTP 方法）**。
- **方法语义**：GET 查、POST 增、PUT 整改、PATCH 局改、DELETE 删。
- **URL**：名词复数、层级表达关系、查询用参数、带版本号。
- **状态码**：用对状态码，让接口「自解释」。
- **本质是规范**，团队统一最重要，不必死磕教条。

下一篇，拦截器：[[拦截器]]。
