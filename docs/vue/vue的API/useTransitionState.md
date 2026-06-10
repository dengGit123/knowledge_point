# useTransitionState

> 📖 [Vue 3 GitHub 源码 - BaseTransition.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/components/BaseTransition.ts)
>
> ⚠️ **注意：** `useTransitionState` 是 Vue 3 的**内部 API**，主要由 Vue 内部的 `<Transition>` 和 `<TransitionGroup>` 组件使用。它通过 `vue` 包导出，但并未列入官方公开 API 文档。在普通业务开发中通常不需要直接使用它，但如果你正在编写**自定义过渡组件**或**过渡动画库**，了解它的原理和用法非常重要。

### 一、概述

`useTransitionState()` 是 Vue 3 内部提供的一个组合式函数，用于在组件中创建和管理**过渡状态**。它返回一个包含 `isMounted`、`isLeaving`、`isUnmounting` 和 `leavingVNodes` 四个属性的状态对象，帮助过渡组件追踪当前组件的生命周期阶段和正在离开的虚拟节点。

简单来说，它就像一个"过渡状态记录员"——记录组件是否已经挂载、是否正在执行离开动画、是否正在卸载，以及缓存正在离开的节点信息，以便在过渡过程中做出正确的渲染决策。

### 二、核心原理

`useTransitionState()` 的工作原理非常直观，可以通过一个生活中的类比来理解：

**类比：舞台演出的状态管理**

想象一个舞台剧的导演需要追踪每个演员的状态：
- **isMounted**：演员是否已经上台（组件是否挂载完成）
- **isLeaving**：是否有演员正在退场（是否有离开过渡正在进行）
- **isUnmounting**：整场演出是否即将结束（组件是否即将卸载）
- **leavingVNodes**：正在退场的演员名单（正在执行离开动画的虚拟节点缓存）

**底层实现机制：**

```ts
// Vue 3 源码中的实现（简化版）
export interface TransitionState {
  isMounted: boolean        // 组件是否已挂载
  isLeaving: boolean        // 是否有离开过渡正在进行
  isUnmounting: boolean     // 组件是否正在卸载
  leavingVNodes: Map<any, Record<string, VNode>>  // 正在离开的节点缓存
}

export function useTransitionState(): TransitionState {
  const state: TransitionState = {
    isMounted: false,
    isLeaving: false,
    isUnmounting: false,
    leavingVNodes: new Map(),
  }

  // 在组件挂载时，将 isMounted 设为 true
  onMounted(() => {
    state.isMounted = true
  })

  // 在组件即将卸载时，将 isUnmounting 设为 true
  onBeforeUnmount(() => {
    state.isUnmounting = true
  })

  return state
}
```

从源码可以看出，它的核心逻辑只有三步：

1. **初始化状态对象**：创建包含四个属性的状态对象，初始值均为 `false` 或空 `Map`
2. **注册 `onMounted` 钩子**：组件挂载后将 `isMounted` 设为 `true`，用于判断过渡是否需要执行"首次出现"（appear）逻辑
3. **注册 `onBeforeUnmount` 钩子**：组件卸载前将 `isUnmounting` 设为 `true`，用于在卸载过程中跳过不必要的过渡动画

> 💡 **提示：** `isLeaving` 和 `leavingVNodes` 的更新不在 `useTransitionState` 内部完成，而是由 `BaseTransition` 组件的渲染函数在外部通过直接修改 state 对象来控制。这是一种有意的设计——将状态创建和状态变更解耦。

### 三、详细用法

#### 1. 基本用法

```vue
<template>
  <div>
    <p>当前过渡状态：</p>
    <ul>
      <li>isMounted: {{ state.isMounted }}</li>
      <li>isLeaving: {{ state.isLeaving }}</li>
      <li>isUnmounting: {{ state.isUnmounting }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useTransitionState } from 'vue'

// 调用后自动注册 onMounted 和 onBeforeUnmount 钩子
const state = useTransitionState()

// 注意：这些属性是普通属性（非响应式），不会触发视图更新
// 它们主要用于在渲染函数中做逻辑判断
console.log(state.isMounted)    // false（初始值），挂载后变为 true
console.log(state.isLeaving)    // false（初始值），由外部过渡逻辑控制
console.log(state.isUnmounting) // false（初始值），卸载前变为 true
</script>
```

#### 2. 进阶用法

**（1）在自定义过渡组件中使用**

`useTransitionState` 最核心的使用场景是构建自定义过渡组件。Vue 内置的 `<Transition>` 组件就是基于 `BaseTransition` + `useTransitionState` 实现的：

```vue
<!-- MyTransition.vue -->
<template>
  <div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import {
  useTransitionState,
  getCurrentInstance,
  type ComponentInternalInstance,
  type VNode,
  onUpdated,
} from 'vue'

const props = defineProps<{
  name?: string
  appear?: boolean
  mode?: 'in-out' | 'out-in' | 'default'
}>()

// 获取过渡状态
const state = useTransitionState()

const instance = getCurrentInstance()!

// 在渲染函数中根据状态决定过渡行为
onUpdated(() => {
  // 如果组件正在执行离开过渡，可以在这里做额外处理
  if (state.isLeaving) {
    console.log('过渡正在进行中...')
  }
})
</script>
```

**（2）配合 `leavingVNodes` 管理多节点过渡**

`leavingVNodes` 是一个 `Map<any, Record<string, VNode>>`，用于缓存正在执行离开过渡的虚拟节点。这在处理相同 key 节点切换时非常关键：

```ts
import { useTransitionState, type VNode } from 'vue'

const state = useTransitionState()

// 获取指定类型的正在离开的节点缓存
function getLeavingNodesForType(vnode: VNode): Record<string, VNode> {
  const { leavingVNodes } = state
  let cache = leavingVNodes.get(vnode.type)!

  if (!cache) {
    cache = Object.create(null)
    leavingVNodes.set(vnode.type, cache)
  }

  return cache
}

// 在进入过渡前，检查是否有相同 key 的节点正在离开
function handleBeforeEnter(vnode: VNode) {
  const key = String(vnode.key)
  const cache = getLeavingNodesForType(vnode)
  const leavingVNode = cache[key]

  if (leavingVNode) {
    // ✅ 如果有相同 key 的节点正在离开，强制其提前完成离开过渡
    // 这样进入的节点才能正确渲染
    console.log('检测到相同 key 的节点正在离开，强制完成其过渡')
  }
}
```

**（3）模拟 `<Transition>` 的 `mode` 行为**

利用 `isLeaving` 和 `isMounted` 状态，可以实现类似 `<Transition>` 的 `mode` 过渡模式控制：

```vue
<template>
  <component :is="currentView" />
</template>

<script setup lang="ts">
import { useTransitionState, ref, watch, type Component } from 'vue'

const currentView = ref<Component | null>(null)
const state = useTransitionState()

// 模拟 out-in 模式：先让旧组件离开，再让新组件进入
watch(currentView, (newVal, oldVal) => {
  if (oldVal && newVal) {
    // ✅ 标记正在离开
    state.isLeaving = true

    // 等待离开过渡完成后...
    setTimeout(() => {
      state.isLeaving = false
      // 此处触发新组件的进入过渡
    }, 300)
  }
})
</script>
```

#### 3. API 参数说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| *(无参数)* | — | — | `useTransitionState()` 不接受任何参数 |

**返回值：`TransitionState` 对象**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `isMounted` | `boolean` | `false` | 组件是否已完成挂载。在 `onMounted` 钩子触发时自动设为 `true`，用于判断是否需要执行 `appear` 过渡 |
| `isLeaving` | `boolean` | `false` | 是否有子节点正在执行离开过渡。在 `out-in` 模式下由外部过渡逻辑控制设为 `true`，离开完成后重置为 `false` |
| `isUnmounting` | `boolean` | `false` | 组件是否正在卸载。在 `onBeforeUnmount` 钩子触发时自动设为 `true`，用于在卸载过程中跳过不必要的过渡 |
| `leavingVNodes` | `Map<any, Record<string, VNode>>` | `new Map()` | 缓存正在离开的虚拟节点。以 `vnode.type` 为 key，值为以 `vnode.key` 为键的节点记录对象。用于在相同 key 的节点切换时管理过渡 |

> 💡 **提示：** `TransitionState` 中的属性是**普通属性（非响应式）**。这是因为过渡状态只在渲染函数内部同步读取，不需要触发响应式更新。Vue 内部的 `BaseTransition` 正是利用这一点来获得更好的渲染性能。

### 四、实现效果

**示例：构建一个自定义过渡组件并观察状态变化**

```vue
<!-- CustomTransition.vue -->
<template>
  <div class="custom-transition-wrapper">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useTransitionState, onMounted, onBeforeUnmount, watch } from 'vue'

const state = useTransitionState()

onMounted(() => {
  // ✅ 此时 state.isMounted 已被 useTransitionState 内部的 onMounted 设为 true
  console.log('[CustomTransition] 已挂载')
  console.log('  isMounted:', state.isMounted)       // true
  console.log('  isUnmounting:', state.isUnmounting) // false
})

onBeforeUnmount(() => {
  // ✅ 此时 state.isUnmounting 已被 useTransitionState 内部的 onBeforeUnmount 设为 true
  console.log('[CustomTransition] 即将卸载')
  console.log('  isMounted:', state.isMounted)       // true
  console.log('  isUnmounting:', state.isUnmounting) // true
})
</script>
```

在父组件中使用：

```vue
<template>
  <button @click="show = !show">切换显示</button>
  <CustomTransition v-if="show">
    <div class="content">过渡内容</div>
  </CustomTransition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomTransition from './CustomTransition.vue'

const show = ref(true)
</script>
```

**运行效果说明：**

1. 页面加载时，`CustomTransition` 挂载，控制台输出 `isMounted: true`
2. 点击"切换显示"按钮，`show` 变为 `false`，组件卸载前输出 `isUnmounting: true`
3. 再次点击按钮，组件重新挂载，`isMounted` 重新变为 `true`
4. 整个过程中 `isLeaving` 和 `leavingVNodes` 保持默认值，因为此例中没有实际的过渡动画逻辑

### 五、使用场景

#### 1. 编写自定义过渡组件

这是 `useTransitionState` 最核心的使用场景。当 Vue 内置的 `<Transition>` 无法满足需求时（如需要完全自定义的过渡逻辑），可以使用它来构建专属过渡组件：

```vue
<!-- FadeTransition.vue -->
<template>
  <Transition
    :name="name"
    :appear="appear"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <slot />
  </Transition>
</template>

<script setup lang="ts">
import { useTransitionState } from 'vue'

defineProps<{
  name?: string
  appear?: boolean
}>()

const state = useTransitionState()

const onBeforeEnter = (el: Element) => {
  // ✅ 利用 isMounted 判断是否是首次出现的过渡
  if (!state.isMounted) {
    console.log('首次出现过渡 (appear)')
  }
  ;(el as HTMLElement).style.opacity = '0'
}

const onEnter = (el: Element, done: () => void) => {
  requestAnimationFrame(() => {
    ;(el as HTMLElement).style.transition = 'opacity 0.3s ease'
    ;(el as HTMLElement).style.opacity = '1'
  })
  setTimeout(done, 300)
}

const onAfterEnter = () => {
  console.log('进入过渡完成')
}

const onBeforeLeave = (el: Element) => {
  // ✅ 利用 isUnmounting 判断组件是否正在卸载
  if (state.isUnmounting) {
    console.log('组件卸载中的离开过渡，可跳过动画')
  }
  ;(el as HTMLElement).style.opacity = '1'
}

const onLeave = (el: Element, done: () => void) => {
  // 如果正在卸载，直接完成
  if (state.isUnmounting) {
    done()
    return
  }
  ;(el as HTMLElement).style.transition = 'opacity 0.3s ease'
  ;(el as HTMLElement).style.opacity = '0'
  setTimeout(done, 300)
}

const onAfterLeave = () => {
  console.log('离开过渡完成')
  state.isLeaving = false
}
</script>
```

#### 2. 构建 `<TransitionGroup>` 替代方案

当需要为列表中的每个元素实现独立的过渡管理时：

```vue
<template>
  <div class="list-container">
    <div
      v-for="item in items"
      :key="item.id"
      class="list-item"
      :class="{ 'is-leaving': isItemLeaving(item.id) }"
    >
      {{ item.text }}
      <button @click="removeItem(item.id)">移除</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTransitionState, ref, reactive } from 'vue'

interface ListItem {
  id: string
  text: string
}

const items = ref<ListItem[]>([
  { id: '1', text: '项目 A' },
  { id: '2', text: '项目 B' },
  { id: '3', text: '项目 C' },
])

const state = useTransitionState()
const leavingIds = reactive(new Set<string>())

function isItemLeaving(id: string): boolean {
  return leavingIds.has(id)
}

function removeItem(id: string) {
  // ✅ 标记正在离开
  leavingIds.add(id)
  state.isLeaving = true

  // 模拟过渡完成后移除
  setTimeout(() => {
    items.value = items.value.filter(item => item.id !== id)
    leavingIds.delete(id)
    state.isLeaving = leavingIds.size > 0
  }, 300)
}
</script>

<style scoped>
.list-item {
  transition: all 0.3s ease;
}
.list-item.is-leaving {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
```

#### 3. 构建动画库的基础设施

开发 Vue 3 动画库（如 `@vueuse/motion` 的底层）时，需要精确控制过渡状态：

```ts
// animation-engine.ts
import {
  useTransitionState,
  type TransitionState,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
} from 'vue'

export interface AnimationEngine {
  state: TransitionState
  enter: (el: Element, done: () => void) => void
  leave: (el: Element, done: () => void) => void
}

export function useAnimationEngine(): AnimationEngine {
  const state = useTransitionState()

  const enter = (el: Element, done: () => void) => {
    // ✅ 利用 isMounted 判断是否是 appear 动画
    const isAppear = !state.isMounted

    if (isAppear) {
      console.log('执行首次出现动画')
    }

    // 自定义动画逻辑
    const htmlEl = el as HTMLElement
    htmlEl.style.transform = 'translateY(20px)'
    htmlEl.style.opacity = '0'

    requestAnimationFrame(() => {
      htmlEl.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      htmlEl.style.transform = 'translateY(0)'
      htmlEl.style.opacity = '1'
    })

    setTimeout(done, 400)
  }

  const leave = (el: Element, done: () => void) => {
    // ✅ 卸载过程中可选择跳过动画
    if (state.isUnmounting) {
      done()
      return
    }

    state.isLeaving = true

    const htmlEl = el as HTMLElement
    htmlEl.style.transition = 'all 0.3s ease'
    htmlEl.style.transform = 'translateY(-20px)'
    htmlEl.style.opacity = '0'

    setTimeout(() => {
      state.isLeaving = false
      done()
    }, 300)
  }

  return { state, enter, leave }
}
```

#### 4. 控制 `appear` 过渡行为

利用 `isMounted` 判断组件是否首次挂载，从而精确控制 `appear` 过渡：

```vue
<template>
  <div
    :class="{
      'fade-enter': shouldAnimate && !hasEntered,
      'fade-active': shouldAnimate,
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useTransitionState, ref, onMounted } from 'vue'

const props = defineProps<{
  shouldAnimate?: boolean
}>()

const state = useTransitionState()
const hasEntered = ref(false)

onMounted(() => {
  // ✅ isMounted 为 true 表示组件已挂载
  // 此时可以安全地触发 appear 过渡
  if (state.isMounted && props.shouldAnimate) {
    setTimeout(() => {
      hasEntered.value = true
    }, 50)
  }
})
</script>

<style scoped>
.fade-enter {
  opacity: 0;
  transform: translateY(10px);
}
.fade-active {
  transition: all 0.5s ease;
}
</style>
```

#### 5. 实现条件渲染的过渡控制

在复杂的条件渲染场景中，利用过渡状态避免多个过渡同时执行造成冲突：

```vue
<template>
  <div class="conditional-container">
    <button @click="toggleView">切换视图</button>
    <div v-if="currentView === 'A'" class="view view-a" :style="viewAStyle">
      视图 A
    </div>
    <div v-else class="view view-b" :style="viewBStyle">
      视图 B
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTransitionState, ref, computed, watch, nextTick } from 'vue'

type ViewType = 'A' | 'B'

const currentView = ref<ViewType>('A')
const state = useTransitionState()

const viewAStyle = computed(() => ({
  transition: 'opacity 0.3s ease',
}))

const viewBStyle = computed(() => ({
  transition: 'opacity 0.3s ease',
}))

async function toggleView() {
  // ✅ 如果有过渡正在进行，等待其完成
  if (state.isLeaving) {
    console.log('过渡进行中，请等待...')
    return
  }

  state.isLeaving = true
  currentView.value = currentView.value === 'A' ? 'B' : 'A'

  await nextTick()
  setTimeout(() => {
    state.isLeaving = false
  }, 300)
}
</script>
```

#### 6. 配合 `v-show` 实现持久化过渡

`v-show` 不会销毁组件，但需要过渡效果。利用 `isUnmounting` 可以区分 `v-show`（持久化）和 `v-if`（销毁）的不同行为：

```vue
<template>
  <div>
    <button @click="visible = !visible">切换显示</button>
    <div
      v-show="visible"
      ref="contentRef"
      class="animated-content"
    >
      持久化内容（v-show 切换）
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTransitionState, ref, watch } from 'vue'

const visible = ref(true)
const contentRef = ref<HTMLElement | null>(null)
const state = useTransitionState()

watch(visible, (newVal) => {
  if (!contentRef.value) return

  // ✅ isUnmounting 为 false 说明组件并未被卸载（v-show 场景）
  // 可以安全地执行过渡动画
  if (!state.isUnmounting) {
    if (newVal) {
      contentRef.value.style.opacity = '0'
      requestAnimationFrame(() => {
        if (contentRef.value) {
          contentRef.value.style.transition = 'opacity 0.3s ease'
          contentRef.value.style.opacity = '1'
        }
      })
    } else {
      contentRef.value.style.transition = 'opacity 0.3s ease'
      contentRef.value.style.opacity = '0'
    }
  }
})
</script>
```

#### 7. 实现页面路由过渡动画

在路由切换时，利用过渡状态控制页面切换动画的执行：

```vue
<!-- App.vue -->
<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="transitionName"
      mode="out-in"
      @before-leave="onBeforeLeave"
      @after-leave="onAfterLeave"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { useTransitionState, ref } from 'vue'

const transitionName = ref('fade')
const state = useTransitionState()

function onBeforeLeave() {
  // ✅ 标记离开过渡开始
  state.isLeaving = true
  console.log('路由离开过渡开始')
}

function onAfterLeave() {
  // ✅ 标记离开过渡结束
  state.isLeaving = false
  console.log('路由离开过渡结束，准备进入新页面')
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

#### 8. 开发调试工具：追踪过渡状态

在开发阶段，可以利用 `useTransitionState` 构建一个调试工具来观察过渡的各个阶段：

```vue
<!-- TransitionDebugger.vue -->
<template>
  <div class="debug-panel" v-if="debug">
    <h4>过渡状态调试面板</h4>
    <table>
      <tr>
        <td>isMounted</td>
        <td :class="state.isMounted ? 'active' : ''">
          {{ state.isMounted }}
        </td>
      </tr>
      <tr>
        <td>isLeaving</td>
        <td :class="state.isLeaving ? 'active' : ''">
          {{ state.isLeaving }}
        </td>
      </tr>
      <tr>
        <td>isUnmounting</td>
        <td :class="state.isUnmounting ? 'active' : ''">
          {{ state.isUnmounting }}
        </td>
      </tr>
      <tr>
        <td>leavingVNodes 大小</td>
        <td>{{ state.leavingVNodes.size }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useTransitionState } from 'vue'

defineProps<{
  debug?: boolean
}>()

const state = useTransitionState()
</script>

<style scoped>
.debug-panel {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 9999;
}
.debug-panel td {
  padding: 2px 8px;
}
.debug-panel .active {
  color: #4caf50;
  font-weight: bold;
}
</style>
```

> ⚠️ **注意：** 由于 `TransitionState` 的属性不是响应式的，上述调试面板中的显示值不会自动更新。如果需要响应式追踪，建议在过渡钩子中手动维护一个响应式的状态副本。

### 六、注意事项

1. **内部 API，谨慎使用**

   `useTransitionState` 是 Vue 3 的内部 API，未在官方公开 API 文档中列出。它的行为和签名可能在未来的 Vue 版本中发生变化，不建议在普通业务代码中直接依赖它。

   ```ts
   // ❌ 在普通业务组件中直接使用内部 API
   import { useTransitionState } from 'vue'
   const state = useTransitionState()

   // ✅ 在普通业务中，使用标准的 <Transition> 组件即可
   // <Transition name="fade" mode="out-in">...</Transition>
   ```

2. **返回值非响应式**

   `useTransitionState()` 返回的状态对象中的属性是**普通属性**，不是 `ref` 或 `reactive`。修改它们不会触发视图更新，这是 Vue 内部出于性能考虑的有意设计。

   ```ts
   const state = useTransitionState()

   // ❌ 在模板中直接绑定不会自动更新
   // <div>{{ state.isLeaving }}</div>  // 可能不会反映最新值

   // ✅ 如需响应式，手动维护响应式副本
   import { ref, watch } from 'vue'
   const isLeaving = ref(false)
   // 在过渡钩子中手动更新
   ```

3. **必须在 `setup()` 中调用**

   由于内部使用了 `onMounted` 和 `onBeforeUnmount` 生命周期钩子，`useTransitionState()` 必须在组件的 `setup()` 函数（或 `<script setup>`）中同步调用。

   ```ts
   // ❌ 在异步回调中调用
   onMounted(async () => {
     const state = useTransitionState() // 错误！无法注册生命周期钩子
   })

   // ✅ 在 setup 顶层同步调用
   const state = useTransitionState() // 正确
   ```

4. **`isLeaving` 不会自动管理**

   与 `isMounted` 和 `isUnmounting` 不同，`isLeaving` 不会由 `useTransitionState` 内部自动管理。它需要由使用方在过渡逻辑中手动设置和重置。

   ```ts
   const state = useTransitionState()

   // ✅ 需要在外部手动管理 isLeaving
   function startLeave() {
     state.isLeaving = true
   }
   function finishLeave() {
     state.isLeaving = false
   }
   ```

5. **`leavingVNodes` 的 key 设计**

   `leavingVNodes` 使用 `Map<any, Record<string, VNode>>` 结构，外层 key 是虚拟节点的 `type`，内层 key 是虚拟节点的 `key`（字符串形式）。这确保了相同类型不同 key 的节点可以同时存在于缓存中。

   ```ts
   // ✅ 正确理解 leavingVNodes 结构
   // leavingVNodes: Map<ComponentType, { [key: string]: VNode }>
   // 例如：Map(MyComponent, { "item-1": vnode1, "item-2": vnode2 })
   ```

6. **多实例独立**

   每次 `setup()` 中调用 `useTransitionState()` 都会创建一个全新的、独立的状态对象。不同组件实例之间的过渡状态互不影响。

   ```ts
   // 组件 A 的 setup
   const stateA = useTransitionState() // 独立的状态实例

   // 组件 B 的 setup
   const stateB = useTransitionState() // 另一个独立的状态实例
   ```

7. **卸载时自动标记 `isUnmounting`**

   当组件即将卸载时，`isUnmounting` 会被自动设为 `true`。Vue 内部的 `BaseTransition` 会利用这个标记来决定是否跳过离开过渡——在组件卸载过程中，没有必要播放完整的离开动画。

   ```ts
   // Vue 内部 BaseTransition 的 leave 钩子中
   leave(el, remove) {
     // ✅ 如果组件正在卸载，直接移除元素，不执行动画
     if (state.isUnmounting) {
       return remove()
     }
     // 否则执行正常的离开过渡...
   }
   ```

8. **不建议与 `Suspense` 组合使用**

   `useTransitionState` 本身与 `<Suspense>` 没有直接的集成关系。如果需要在异步组件加载场景中管理加载状态，应该使用 `<Suspense>` 自身的 `#default` 和 `#fallback` 插槽机制。

   ```vue
   <!-- ❌ 混淆了 useTransitionState 与 Suspense 的职责 -->
   <script setup>
   import { useTransitionState } from 'vue'
   const state = useTransitionState()
   // state 不包含异步加载状态
   </script>

   <!-- ✅ 使用 Suspense 的标准方式处理异步组件 -->
   <Suspense>
     <template #default>
       <AsyncComponent />
     </template>
     <template #fallback>
       <LoadingSpinner />
     </template>
   </Suspense>
   ```

9. **适用于自定义过渡库的开发**

   如果你在开发一个 Vue 3 过渡动画库（如封装 `gsap`、`framer-motion` 等动画引擎），`useTransitionState` 可以作为底层基础设施，帮助你正确管理过渡生命周期。

   ```ts
   // ✅ 在动画库中合理使用
   export function createTransitionLibrary() {
     const state = useTransitionState()

     return {
       isReady: () => state.isMounted,
       isTransitioning: () => state.isLeaving,
       isDestroying: () => state.isUnmounting,
     }
   }
   ```

10. **普通业务开发推荐使用标准 `<Transition>` 组件**

    对于 90% 以上的过渡需求，Vue 内置的 `<Transition>` 和 `<TransitionGroup>` 组件已经足够。只有在需要完全自定义过渡行为时，才需要深入到 `useTransitionState` 层面。

    ```vue
    <!-- ✅ 标准用法，简单高效 -->
    <Transition name="fade" mode="out-in" appear>
      <component :is="currentComponent" :key="componentKey" />
    </Transition>
    ```

### 七、相关 API 对比

| API | 适用场景 | 响应式 | 公开程度 |
|-----|---------|--------|---------|
| `useTransitionState()` | 自定义过渡组件的内部状态管理 | 非响应式（普通对象） | 内部 API |
| `<Transition>` | 单个元素/组件的进入和离开过渡 | — | 公开 API |
| `<TransitionGroup>` | 列表元素的过渡动画 | — | 公开 API |
| `<Suspense>` | 异步组件加载状态管理 | — | 公开 API |
| `onMounted()` | 组件挂载完成的生命周期钩子 | — | 公开 API |
| `onBeforeUnmount()` | 组件卸载前的生命周期钩子 | — | 公开 API |
| `useId()` | 生成唯一 ID（SSR 安全） | 非响应式 | 公开 API（3.5+） |

**与 `<Transition>` 组件的关系：**

`<Transition>` 组件是 `useTransitionState` 的"上层封装"。`<Transition>` 内部通过 `BaseTransition` 调用 `useTransitionState()` 来创建过渡状态，然后在渲染过程中利用这个状态来控制 CSS 类名的添加/移除和 JavaScript 钩子的调用时机。

```
<Transition>（用户层）
    ↓ 基于
BaseTransition（核心层）
    ↓ 调用
useTransitionState()（状态层）
```

### 八、总结

`useTransitionState()` 是 Vue 3 过渡系统中的关键内部基础设施，它通过一个简洁的状态对象管理过渡生命周期的核心状态：

- **`isMounted`**：自动管理，标识组件是否已挂载（决定 appear 行为）
- **`isLeaving`**：外部管理，标识是否有离开过渡在进行中（决定 mode 行为）
- **`isUnmounting`**：自动管理，标识组件是否正在卸载（决定是否跳过动画）
- **`leavingVNodes`**：外部管理，缓存正在离开的节点（处理相同 key 切换）

**核心要点回顾：**

1. 它是**内部 API**，主要用于库作者和自定义过渡组件开发
2. 返回的状态是**普通对象**（非响应式），专为渲染函数内部同步读取优化
3. `isMounted` 和 `isUnmounting` 自动管理，`isLeaving` 和 `leavingVNodes` 需外部控制
4. 必须在 `setup()` 中同步调用
5. 普通业务开发推荐使用标准的 `<Transition>` / `<TransitionGroup>` 组件

> 💡 **提示：** 如果你在业务开发中只需要实现进入/离开过渡动画，请优先使用 Vue 内置的 `<Transition>` 组件。只有当你需要构建**完全自定义的过渡行为**或开发**过渡动画库**时，才需要深入了解和使用 `useTransitionState`。
