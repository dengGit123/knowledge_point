### Vue Router 4

Vue Router 是 Vue 3 的**官方路由管理器**，用于实现单页应用（SPA）中的页面导航。它通过管理 URL 与组件之间的映射关系，让用户在不刷新页面的情况下切换"页面"。

> 📖 [Vue Router 官方文档](https://router.vuejs.org/zh/)

### 核心概念

| 概念 | 说明 |
| :--: | :--: |
| **Router（路由器）** | 管理所有路径和组件的映射关系 |
| **Route（路由）** | 一条路径与组件的映射规则 |
| **RouterView** | 路由组件的"占位符"，匹配到的组件渲染在这里 |
| **RouterLink** | 声明式导航标签，替代 `<a>` 标签实现无刷新跳转 |
| **导航守卫** | 路由跳转的拦截器，控制能否跳转 |

### 文档目录

| 文档 | 说明 |
| :--: | :--: |
| [路由配置](./路由配置.md) | 安装、基本配置、路由记录结构 |
| [路由模式](./路由模式.md) | History / Hash / Memory 三种模式 |
| [声明式导航](./声明式导航.md) | RouterLink 用法、active-class、custom 插槽 |
| [编程式导航](./编程式导航.md) | push / replace / go / back、useRouter |
| [获取路由信息](./获取路由信息.md) | useRoute、params / query / meta 等 |
| [动态路由匹配](./动态路由匹配.md) | :param、正则校验、可重复参数、404 匹配 |
| [嵌套路由](./嵌套路由.md) | children、多层嵌套、RouterView 嵌套 |
| [路由传参](./路由传参.md) | params / query / hash、props 传参 |
| [命名路由与命名视图](./命名路由与命名视图.md) | name 命名、components 多视图 |
| [重定向与别名](./重定向与别名.md) | redirect 重定向、alias 别名 |
| [路由懒加载](./路由懒加载.md) | 动态 import、分组打包 |
| [路由元信息](./路由元信息.md) | meta 字段、权限标记、自定义数据 |
| [导航守卫](./导航守卫.md) | 全局 / 路由独享 / 组件内守卫 |
| [动态添加路由](./动态添加路由.md) | addRoute / removeRoute、权限路由 |
| [滚动行为](./滚动行为.md) | scrollBehavior、锚点定位、历史恢复 |
