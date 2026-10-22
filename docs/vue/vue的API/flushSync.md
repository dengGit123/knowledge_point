# flushSync

> ⚠️ **Vue 中没有 `flushSync` 这个 API。** 经核验（vue@3.5.35 的 `.d.ts` 类型声明与运行时源码），Vue 3.x 从未导出过 `flushSync`：`import { flushSync } from 'vue'` 得到的是 `undefined`，调用会直接报错。它容易与 Vue 混淆，是因为它是 **React** 的 API（`ReactDOM.flushSync()`，用于绕过 React 的自动批处理、强制同步刷新 DOM）：https://react.dev/reference/react-dom/flushSync

本文说明 Vue 中与「强制同步更新 DOM」这个需求对应的真实方案。

## 为什么 Vue 不需要 flushSync

React 与 Vue 都会把多次状态修改**异步批量处理**，但两者的「逃生舱口」不同：

| | React | Vue |
|---|---|---|
| 默认更新时机 | 批处理后异步更新 DOM | 异步批量更新 DOM（缓冲到「下一个 tick」） |
| 等待更新完成 | `flushSync(fn)`（同步） / `useEffect` | `nextTick()`（异步 Promise） |
| 同步触发副作用 | `flushSync` 包裹 | `watch` / `watchEffect` 的 `flush: 'sync'` 选项 |

Vue 的设计里，「同步刷新」的需求被拆成了两个更细粒度的能力：**等待 DOM 更新**用 `nextTick()`，**控制副作用的触发时机**用 `flush` 选项。

📖 [Vue 官方文档 - nextTick](https://cn.vuejs.org/api/general.html#nexttick)

📖 [Vue 官方文档 - watch / watchEffect 的 flush 选项](https://cn.vuejs.org/api/reactivity-core.html#watcheffect)

📖 [Vue 官方文档 - 响应式原理：调度器与更新时机](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html)

## 等价方案 1：nextTick() 等待 DOM 更新

React 中用 `flushSync` 包裹修改、然后立即读 DOM 的写法，在 Vue 中是「修改之后 `await nextTick()` 再读」：

```vue
<script setup>
import { ref, nextTick } from 'vue'

const count = ref(0)
const container = ref(null)

async function update() {
  count.value = 1

  // DOM 还没更新（异步批量处理）
  console.log(container.value.textContent) // "0"

  await nextTick()

  // DOM 已更新
  console.log(container.value.textContent) // "1"
}
</script>

<template>
  <div ref="container">{{ count }}</div>
  <button @click="update">更新</button>
</template>
```

区别在于：React 的 `flushSync` 是**同步阻塞**地刷完再继续；Vue 的 `nextTick()` 是**异步等待**刷完再继续。绝大多数「改完就想读 DOM」的场景用 `nextTick()` 即可。

## 等价方案 2：watch / watchEffect 的 flush 选项

如果需求是「状态一变，立即执行某段逻辑（不等批量更新）」，对应的是 `flush: 'sync'`：

| flush 值 | 触发时机 | 说明 |
|---------|---------|------|
| `'pre'`（默认） | 组件更新**前** | 先执行回调，再更新 DOM |
| `'post'` | 组件更新**后** | 此时可以访问更新后的 DOM |
| `'sync'` | **同步**，状态变化时立即执行 | 不批量、不等待，每次修改都触发 |

```vue
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)

// 每次 count 变化都同步执行，不等批量更新
watch(count, (newVal) => {
  console.log('同步回调:', newVal)
}, { flush: 'sync' })

// DOM 更新之后执行，可安全访问最新 DOM
watch(count, () => {
  console.log('更新后:', document.querySelector('.count')?.textContent)
}, { flush: 'post' })

count.value = 1
count.value = 2
// sync 回调输出: 同步回调: 1 → 同步回调: 2（一次不落）
// post 回调在 DOM 更新后触发，且 Vue 会自动去重
</script>

<template>
  <div class="count">{{ count }}</div>
</template>
```

## 场景对照

| 原 flushSync 示例场景 | Vue 中的正确写法 |
|----------------------|-----------------|
| 修改后立即读取 DOM | `await nextTick()` 后读取 |
| 动画前确保类名 / 尺寸已生效 | `await nextTick()` 后再测量、启动动画 |
| 表单提交前同步整理值 | 直接操作（`.trim()` 本身就是同步的，无需刷新 DOM） |
| 测试中断言 DOM | `await nextTick()` 后断言（`@vue/test-utils` 的 `nextTick()`） |
| 状态一变立即执行逻辑 | `watch(source, cb, { flush: 'sync' })` |

测试中的等价写法：

```javascript
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'

test('异步更新后断言', async () => {
  const wrapper = mount(Component)

  wrapper.vm.count++

  await nextTick() // 等待 DOM 更新

  expect(wrapper.find('.count').text()).toBe('1')
})
```

## 注意事项

1. **不要照抄 React 写法**：`flushSync(() => { ... })` 在 Vue 中不可用，看到这类示例代码（包括本文档之前的历史版本）要警惕

2. **避免 `flush: 'sync'` 滥用**：它放弃了批量更新，每次状态修改都会立即执行回调，频繁修改状态时会带来明显性能开销

3. **默认相信批量更新**：Vue 的异步批量更新是性能特性的来源（多次修改只渲染一次），大多数场景不应该绕过它

4. **真正需要同步读 DOM 时**：优先 `await nextTick()`；需要在更新后执行 DOM 操作时用 `watch(..., { flush: 'post' })` 或 `onMounted` 类钩子
