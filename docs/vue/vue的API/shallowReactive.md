# shallowReactive

## 作用

`shallowReactive()` 创建一个响应式代理，只追踪对象本身属性的变化，不追踪嵌套对象的变化。

## 基本用法

```javascript
import { shallowReactive, isReactive } from 'vue'

const state = shallowReactive({
  foo: 1,
  nested: { bar: 2 }
})

// 改变根级属性是响应式的
state.foo = 2 // ✅ 触发更新

// 改变嵌套对象不是响应式的
state.nested.bar = 3 // ❌ 不触发更新
```

## 与 reactive 的区别

```javascript
import { reactive, shallowReactive } from 'vue'

// reactive: 深层响应式
const deep = reactive({
  nested: { count: 0 }
})
deep.nested.count++ // ✅ 触发更新

// shallowReactive: 浅层响应式
const shallow = shallowReactive({
  nested: { count: 0 }
})
shallow.nested.count++ // ❌ 不触发更新
```

## 使用场景

### 1. 大型数据结构

```javascript
import { shallowReactive } from 'vue'

const state = shallowReactive({
  // 大型嵌套数据
  users: Array(10000).fill(null).map((_, i) => ({
    id: i,
    profile: { /* ... */ }
  }))
})

// 替换整个数组是响应式的
state.users = [] // ✅ 触发更新

// 修改嵌套属性需要手动触发
state.users[0].profile.name = 'New' // ❌ 不触发
state.users = [...state.users] // ✅ 触发
```

### 2. 性能优化

```javascript
import { shallowReactive, triggerRef } from 'vue'

const state = shallowReactive({
  items: [
    { id: 1, name: 'Item 1' }
  ]
})

// 修改嵌套属性后手动触发
state.items[0].name = 'Updated'
triggerRef(state)
```

## 与 ref 配合

```javascript
import { shallowReactive, ref } from 'vue'

const state = shallowReactive({
  list: ref([])
})

// list 是 ref，修改其内容会触发更新
state.list.value.push({ name: 'New' }) // ✅ 触发更新
```
