# Vue

Vue 学习笔记索引，覆盖 Vue 2 / Vue 3、路由、状态管理与底层原理。

> 📖 **官方文档**
> - [Vue 3 官方文档](https://cn.vuejs.org/) · [API 索引](https://cn.vuejs.org/api/)
> - [Vue 2 官方文档](https://v2.cn.vuejs.org/)（已于 2023 年底终止支持）

## 📚 专题目录

### [VueRouter](./VueRouter/index.md)

Vue 3 官方路由管理器（Vue Router 4）：路由配置、路由模式、动态路由、嵌套路由、导航守卫、路由传参、懒加载、滚动行为等 15 篇。

### [Pinia](./Pinia/index.md)

Vue 3 官方状态管理库：State / Getter / Action 三大核心概念的详细用法。

### [vue的API](./vue的API/index.md)

96 个 Vue API 的用法笔记，按官方分区归类：响应式核心、effect 体系、生命周期、依赖注入、组合式函数、内置指令、内置组件、编译宏、应用与渲染、Vue 2 全局 API。

### [渲染函数](./渲染函数/)

模板背后的渲染机制：`h` 函数与 `render` 函数在 Vue 2 / Vue 3 中的用法与差异。

| 文档 | 说明 |
| :--: | :--: |
| [h函数(vue2)](./渲染函数/h函数%28vue2%29.md) | Vue 2 的 `createElement`（`h`）：三参数签名与 data 对象详解 |
| [h函数(vue3)](./渲染函数/h函数%28vue3%29.md) | Vue 3 的 `h()`：参数、插槽、组件与 DOM 元素 |
| [render函数(vue2)](./渲染函数/render函数%28vue2%29.md) | Vue 2 的 render 函数与渲染机制（响应式 + Watcher + 双端 Diff） |
| [render函数(vue3)](./渲染函数/render函数%28vue3%29.md) | Vue 3 的 render 函数与组合式 API 下的用法 |
| [h函数与render函数(vue3)](./渲染函数/h函数与render函数%28vue3%29.md) | Vue 3 综合篇：h 与 render 的关系、VNode 深入、二者对比 |

### [核心原理](./核心原理/)

Diff、响应式与组件更新机制。

| 文档 | 说明 |
| :--: | :--: |
| [key的作用(vue2)](./核心原理/key的作用%28vue2%29.md) | key 与 Vue 2 双端 Diff、就地复用、为什么不能用 index 做 key |
| [key的作用(vue3)](./核心原理/key的作用%28vue3%29.md) | key 与 Vue 3 最长递增子序列 Diff 算法 |
| [vue3的响应式原理](./核心原理/vue3的响应式原理.md) | `Proxy` + `Reflect`、track / trigger、副作用与调度 |
| [vue3父子组件更新](./核心原理/vue3父子组件更新.md) | 父组件更新时子组件的更新流程与性能优化 |

## 📄 其他文档

| 文档 | 说明 |
| :--: | :--: |
| [vue规范](./vue规范.md) | Vue 项目编码规范 |
