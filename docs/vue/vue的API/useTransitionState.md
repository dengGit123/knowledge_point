# useTransitionState

## 作用

用于获取过渡内部状态的内部 API，主要用于库作者。

> 参考：[Vue 官方文档 - useTransitionState](https://cn.vuejs.org/api/)
<!-- 该 API 为内部 API，暂无独立官方文档页 -->

## 语法

```javascript
import { useTransitionState } from 'vue'

const state = useTransitionState()
```

## 参数

无

## 返回值

返回一个包含过渡状态的对象

## 返回的对象属性

```javascript
{
  isMounted: Ref<boolean>,     // 组件是否已挂载
  isLoading: Ref<boolean>,     // 是否在加载中
  isResolved: Ref<boolean>,    // 是否已解析
  isUnresolved: Ref<boolean>,  // 是否未解析
}
```

## 基础用法

```javascript
import { useTransitionState } from 'vue'

const transitionState = useTransitionState()

console.log(transitionState.isMounted.value)    // 是否已挂载
console.log(transitionState.isLoading.value)    // 是否加载中
console.log(transitionState.isResolved.value)   // 是否已解析
```

## 在自定义过渡组件中使用

```vue
<template>
  <div :class="transitionClasses">
    <slot v-if="!isHidden"></slot>
  </div>
</template>

<script setup>
import { useTransitionState, computed } from 'vue'

const props = defineProps({
  appear: Boolean
})

const state = useTransitionState()

const transitionClasses = computed(() => {
  return {
    'transition-enter': state.isUnresolved.value,
    'transition-enter-active': state.isLoading.value,
    'transition-enter-to': state.isResolved.value
  }
})

const isHidden = computed(() => {
  return !state.isMounted.value && !props.appear
})
</script>
```

## 检测异步组件状态

```vue
<template>
  <div>
    <div v-if="state.isLoading">加载中...</div>
    <div v-else-if="state.isUnresolved">等待解析...</div>
    <div v-else>内容已加载</div>
  </div>
</template>

<script setup>
import { useTransitionState } from 'vue'

const state = useTransitionState()
</script>
```

## 配合 Suspense 使用

```vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div v-if="state.isLoading">
        <LoadingSpinner />
      </div>
    </template>
  </Suspense>
</template>

<script setup>
import { useTransitionState } from 'vue'

const state = useTransitionState()
</script>
```

## 创建自定义加载状态组件

```vue
<template>
  <div class="async-wrapper">
    <div v-if="state.isLoading.value" class="loading">
      <slot name="loading">
        <span>加载中...</span>
      </slot>
    </div>
    <div v-else class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { useTransitionState } from 'vue'

const state = useTransitionState()
</script>
```

## 注意事项

1. **内部 API**：这是内部 API，主要用于 Vue 内部和库作者

2. **稳定性**：未来版本可能会有变化，不推荐在生产环境中使用

3. **替代方案**：大多数情况下有更好的替代方案：
   - 使用 `Suspense` 组件处理异步状态
   - 使用 `onMounted`、`watch` 等生命周期钩子
   - 使用自定义 ref 控制加载状态
