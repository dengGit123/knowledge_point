# Vue 的 API 索引

本目录收录 Vue 常用 API 的学习笔记，共 96 篇，按官方文档的分区方式归类。

> 📖 **官方文档**
> - [Vue 3 API 总览](https://cn.vuejs.org/api/)
> - [Vue 2 API 总览](https://v2.cn.vuejs.org/v2/api/)（`set` / `del` 等 Vue 2 全局 API）

## 一、响应式核心 API

> 📖 [官方文档 · 响应式核心](https://cn.vuejs.org/api/reactivity-core)

| API | 说明 |
| :--: | :--: |
| [ref](./ref.md) | 接受任意值，返回带 `.value` 的响应式 ref 对象 |
| [reactive](./reactive.md) | 返回对象/数组的深层响应式代理 |
| [computed](./computed.md) | 计算属性，基于依赖缓存求值 |
| [readonly](./readonly.md) | 返回只读代理，深层的 |
| [shallowRef](./shallowRef.md) | 浅层 ref，只有 `.value` 本身的替换是响应式的 |
| [shallowReactive](./shallowReactive.md) | 浅层响应式代理，只代理第一层属性 |
| [shallowReadonly](./shallowReadonly.md) | 浅层只读代理，只阻止第一层修改 |
| [customRef](./customRef.md) | 创建自定义依赖收集/触发时机的 ref |
| [toRef](./toRef.md) | 将响应式对象的单个属性转为 ref，保持与源关联 |
| [toRefs](./toRefs.md) | 将响应式对象的全部属性批量转为 ref |
| [toRaw](./toRaw.md) | 获取代理对象的原始对象 |
| [toValue](./toValue.md) | 取值工具：ref 取 `.value`，函数取返回值，普通值原样返回 |
| [triggerRef](./triggerRef.md) | 手动触发 shallowRef 关联的副作用 |
| [markRaw](./markRaw.md) | 标记对象使其永远不会被转为代理 |
| [isRef](./isRef.md) | 判断是否为 ref 对象 |
| [isReactive](./isReactive.md) | 判断是否为 reactive 代理 |
| [isReadonly](./isReadonly.md) | 判断是否为 readonly 代理 |
| [isProxy](./isProxy.md) | 判断是否为 reactive 或 readonly 代理 |
| [watch](./watch.md) | 侦听器：声明式地监听数据变化并执行回调 |
| [watchEffect](./watchEffect.md) | 立即执行并自动追踪依赖的副作用函数 |
| [watchPostEffect](./watchPostEffect.md) | watchEffect 的变体，回调在组件更新**之后**执行 |
| [watchSyncEffect](./watchSyncEffect.md) | watchEffect 的变体，依赖变化时**同步**触发 |

## 二、副作用与作用域（effect 体系）

> 📖 [官方文档 · 响应式进阶](https://cn.vuejs.org/api/reactivity-advanced)

| API | 说明 |
| :--: | :--: |
| [effect](./effect.md) | 响应式系统的底层副作用函数，`watchEffect` 的基石 |
| [effectScope](./effectScope.md) | 创建副作用作用域，统一收集与销毁 effect |
| [setCurrentScope](./setCurrentScope.md) | 设置当前活跃作用域（底层 API，慎用） |
| [onScopeDispose](./onScopeDispose.md) | 在当前作用域销毁时注册清理回调 |

## 三、生命周期钩子

> 📖 [官方文档 · 生命周期钩子](https://cn.vuejs.org/api/composition-api-lifecycle)

| API | 说明 |
| :--: | :--: |
| [onBeforeMount](./onBeforeMount.md) | 组件挂载前 |
| [onMounted](./onMounted.md) | 组件挂载完成，可访问 DOM |
| [onBeforeUpdate](./onBeforeUpdate.md) | 响应式数据变化后、DOM 更新前 |
| [onUpdated](./onUpdated.md) | DOM 更新完成 |
| [onBeforeUnmount](./onBeforeUnmount.md) | 组件卸载前 |
| [onUnmounted](./onUnmounted.md) | 组件卸载完成 |
| [onActivated](./onActivated.md) | 被 KeepAlive 缓存的组件激活时 |
| [onDeactivated](./onDeactivated.md) | 被 KeepAlive 缓存的组件失活时 |
| [onErrorCaptured](./onErrorCaptured.md) | 捕获后代组件的错误 |
| [onRenderTracked](./onRenderTracked.md) | 调试钩子：渲染中被追踪的依赖 |
| [onRenderTriggered](./onRenderTriggered.md) | 调试钩子：触发重渲染的依赖 |
| [onServerPrefetch](./onServerPrefetch.md) | SSR 服务端渲染前异步预取数据 |

## 四、依赖注入

> 📖 [官方文档 · 依赖注入](https://cn.vuejs.org/api/composition-api-dependency-injection)

| API | 说明 |
| :--: | :--: |
| [provide](./provide.md) | 向后代组件提供数据/方法 |
| [inject](./inject.md) | 注入祖先组件提供的数据/方法 |

## 五、组合式工具函数

> 📖 [官方文档 · 组合式函数](https://cn.vuejs.org/api/composition-api-helpers)

| API | 说明 |
| :--: | :--: |
| [useAttrs](./useAttrs.md) | 访问组件的透传 attributes |
| [useSlots](./useSlots.md) | 访问组件的插槽内容 |
| [useId](./useId.md) | 生成应用内唯一的 id，用于表单与无障碍属性 |
| [useModel](./useModel.md) | 自定义 `defineModel` 底层实现的双向绑定 |
| [useTemplateRef](./useTemplateRef.md) | 通过 ref 名获取模板 ref 的 DOM/组件实例 |
| [useCssModule](./useCssModule.md) | 在 setup 中访问 CSS Modules 样式类 |
| [useCssVars](./useCssVars.md) | 将状态绑定到组件根元素的 CSS 变量 |
| [useTransitionState](./useTransitionState.md) | 获取 Transition 的当前过渡状态 |

## 六、Vue Router 相关

> ⚠️ 这两个 API 来自 **Vue Router** 而非 Vue 本体，详见 [../VueRouter/index.md](../VueRouter/index.md)。
>
> 📖 [官方文档 · Vue Router 组合式 API](https://router.vuejs.org/zh/api/#composables)

| API | 说明 |
| :--: | :--: |
| [useRoute](./useRoute.md) | 获取当前路由对象（params / query / meta 等） |
| [useLink](./useLink.md) | 定制 RouterLink 的导航行为（href、导航函数、激活状态） |

## 七、内置指令

> 📖 [官方文档 · 内置指令](https://cn.vuejs.org/api/built-in-directives)

| 指令 | 说明 |
| :--: | :--: |
| [v-bind](./v-bind.md) | 动态绑定 attribute / prop（缩写 `:`） |
| [v-on](./v-on.md) | 绑定事件监听器（缩写 `@`） |
| [v-model](./v-model.md) | 表单输入与组件的双向绑定 |
| [v-if](./v-if.md) | 条件渲染，为假时不渲染 DOM |
| [v-else](./v-else.md) | v-if 的否分支 |
| [v-else-if](./v-else-if.md) | v-if 的续条件分支 |
| [v-show](./v-show.md) | 条件显示，始终渲染，靠 `display` 切换 |
| [v-for](./v-for.md) | 列表渲染 |
| [v-text](./v-text.md) | 设置元素文本内容 |
| [v-html](./v-html.md) | 设置元素 innerHTML（注意 XSS 风险） |
| [v-slot](./v-slot.md) | 声明具名/作用域插槽（缩写 `#`） |
| [v-pre](./v-pre.md) | 跳过该元素及子元素的编译 |
| [v-cloak](./v-cloak.md) | 配合 CSS 隐藏未编译的模板（经典用于 Vue 2 防闪烁） |
| [v-once](./v-once.md) | 只渲染一次，后续更新跳过 |
| [v-memo](./v-memo.md) | 依赖不变时跳过子树更新，优化大列表 |

## 八、内置组件

> 📖 [官方文档 · 内置组件](https://cn.vuejs.org/api/built-in-components)

| 组件 | 说明 |
| :--: | :--: |
| [KeepAlive](./KeepAlive.md) | 缓存组件实例，避免重复渲染、保留状态 |
| [Teleport](./Teleport.md) | 将组件渲染到 DOM 树的其他位置（如弹窗挂 body） |
| [Suspense](./Suspense.md) | 协调异步组件的加载中/加载完成两套内容 |
| [Transition](./Transition.md) | 单元素/组件的进入与离开过渡 |
| [TransitionGroup](./TransitionGroup.md) | 列表过渡，支持移动过渡动画 |

## 九、编译宏（`<script setup>` 专用）

> 📖 [官方文档 · script setup 与编译宏](https://cn.vuejs.org/api/sfc-script-setup)

| API | 说明 |
| :--: | :--: |
| [defineProps](./defineProps.md) | 声明组件的 props |
| [defineEmits](./defineEmits.md) | 声明组件可触发的事件 |
| [defineExpose](./defineExpose.md) | 显式暴露属性给父组件通过模板 ref 访问 |
| [defineModel](./defineModel.md) | 简化组件双向绑定的声明 |
| [defineOptions](./defineOptions.md) | 在 script setup 中声明无法用宏表达的选项（如 name） |
| [defineSlots](./defineSlots.md) | 为插槽声明类型 |
| [withDefaults](./withDefaults.md) | 为基于类型的 defineProps 声明默认值 |
| [mergeModels](./mergeModels.md) | 合并多个 v-model 的 props/emits 声明 |

## 十、应用与渲染

> 📖 [官方文档 · 应用实例](https://cn.vuejs.org/api/application) · [渲染函数](https://cn.vuejs.org/api/render-function)

| API | 说明 |
| :--: | :--: |
| [createApp](./createApp.md) | 创建应用实例 |
| [h](./h.md) | 创建虚拟 DOM 节点（VNode）的渲染函数，详见 [../渲染函数/](../渲染函数/) 专题 |
| [defineComponent](./defineComponent.md) | 定义组件并获得类型推导 |
| [defineAsyncComponent](./defineAsyncComponent.md) | 定义异步组件（代码分割、加载态） |
| [defineCustomElement](./defineCustomElement.md) | 将 Vue 组件编译为原生自定义元素（Web Component） |
| [createRenderer](./createRenderer.md) | 创建自定义渲染器（面向 Canvas / Node 等非 DOM 环境） |
| [createStaticVNode](./createStaticVNode.md) | 创建静态 VNode 序列，跳过 diff |
| [cloneVNode](./cloneVNode.md) | 克隆 VNode 并可合并新 props |
| [isVNode](./isVNode.md) | 判断一个值是否为 VNode |
| [mergeProps](./mergeProps.md) | 合并多个 props 对象（事件合并、class/style 拼接） |
| [nextTick](./nextTick.md) | 等 DOM 更新循环完成后再执行回调 |
| [flushSync](./flushSync.md) | 强制同步刷新挂起的 DOM 更新 |
| [resolveComponent](./resolveComponent.md) | 在渲染函数中按名称解析组件 |
| [resolveDirective](./resolveDirective.md) | 按名称解析指令 |
| [withDirectives](./withDirectives.md) | 在渲染函数中为 VNode 挂载指令 |
| [version](./version.md) | 当前 Vue 版本号 |

## 十一、Vue 2 全局 API

> ⚠️ 属于 **Vue 2** 的全局 API，Vue 3 中已移除（`reactive` 代理天然支持新增/删除属性）。
>
> 📖 [官方文档 · Vue 2 响应式原理注意事项](https://v2.cn.vuejs.org/v2/guide/reactivity.html)

| API | 说明 |
| :--: | :--: |
| [set](./set.md) | 向响应式对象添加属性并确保视图更新（解决 `Object.defineProperty` 无法侦测新增属性） |
| [del](./del.md) | 删除响应式对象的属性并确保视图更新 |

---

## 版本说明

- 除「十一、Vue 2 全局 API」外，其余 API 均为 **Vue 3**（组合式 API / `<script setup>`）。
- 学习渲染函数体系可进一步阅读 [渲染函数专题](../渲染函数/)，理解响应式与更新机制可阅读 [核心原理专题](../核心原理/)。
