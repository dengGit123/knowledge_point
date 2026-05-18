# triggerRef

## 作用

`triggerRef()` 手动触发与 `shallowRef()` 关联的副作用。用于更新后手动执行依赖该 ref 的副作用。

## 基本用法

```javascript
import { shallowRef, triggerRef } from 'vue'

const state = shallowRef({ count: 0 })

// 修改嵌套属性不会触发更新
state.value.count++ // ❌ 不触发更新

// 手动触发更新
triggerRef(state) // ✅ 触发更新
```

## 使用场景

### 1. 大型不可变数据

```javascript
import { shallowRef, triggerRef } from 'vue'

const data = shallowRef({
  items: Array(10000).fill(null).map((_, i) => ({
    id: i,
    name: `Item ${i}`
  }))
})

function updateItem(index, name) {
  // 直接修改数组元素
  data.value.items[index].name = name
  
  // 手动触发更新
  triggerRef(data)
}
```

### 2. 与 watch 配合

```javascript
import { shallowRef, triggerRef, watch } from 'vue'

const state = shallowRef({
  list: []
})

watch(state, (newVal) => {
  console.log('state 更新了', newVal)
})

// 修改后手动触发
state.value.list.push({ id: 1 })
triggerRef(state)
```

### 3. 批量更新

```javascript
import { shallowRef, triggerRef } from 'vue'

const state = shallowRef({
  users: []
})

function addMultipleUsers(newUsers) {
  // 批量添加
  state.value.users.push(...newUsers)
  
  // 统一触发一次更新
  triggerRef(state)
}
```
