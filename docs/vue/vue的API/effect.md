# effect

## 作用

`effect()` 用于创建一个响应式副作用函数，立即执行并自动追踪其依赖。这是 Vue 3 响应式系统的核心 API。

## 基本用法

```javascript
import { effect } from '@vue/reactivity'

effect(() => {
  console.log('副作用函数执行')
})

// 立即执行一次，输出: 副作用函数执行
```

## 响应式追踪

```javascript
import { reactive, effect } from 'vue'

const state = reactive({ count: 0 })

effect(() => {
  console.log('count 变化了:', state.count)
})

state.count++ // 触发 effect 重新执行
```

## 停止副作用

```javascript
import { effect, ref } from 'vue'

const count = ref(0)

const runner = effect(() => {
  console.log('count:', count.value)
})

count.value++ // 触发执行

// 停止追踪
runner.effect.stop()

count.value++ // 不再触发执行
```

## 副作用刷新

```javascript
import { effect, ref } from 'vue'

const count = ref(0)

effect(() => {
  console.log('执行')
}, {
  flush: 'pre' // 默认值，在组件更新前调用
})

effect(() => {
  console.log('执行')
}, {
  flush: 'post' // 在组件更新后调用
})

effect(() => {
  console.log('执行')
}, {
  flush: 'sync' // 同步执行
})
```

## 调度器

```javascript
import { effect, ref } from 'vue'

const count = ref(0)

effect(() => {
  console.log(count.value)
}, {
  scheduler(effect) {
    // 自定义调度逻辑
    setTimeout(() => {
      effect()
    }, 100)
  }
})

count.value++ // 不会立即执行，而是延迟执行
```

## onStop 回调

```javascript
import { effect, ref } from 'vue'

const count = ref(0)

effect(() => {
  console.log(count.value)
}, {
  onStop() {
    console.log('副作用已停止')
    // 清理工作
  }
})

const runner = effect(() => {})
runner.effect.stop() // 触发 onStop
```

## 计算属性原理

```javascript
import { reactive, effect } from 'vue'

const obj = reactive({ foo: 1 })
const double = effect(() => obj.foo * 2, {
  lazy: true // 不立即执行
})

console.log(double.effect.value) // 手动获取值
```
