# markRaw

## 作用

`markRaw()` 标记一个对象，使其永远不会被转换为响应式对象。返回对象本身。

## 基本用法

```javascript
import { reactive, markRaw } from 'vue'

const foo = markRaw({
  nested: {}
})

const bar = reactive({
  foo // foo 不会被转换为响应式
})

console.log(foo === bar.foo) // true
```

## 使用场景

### 1. 第三方库实例

```javascript
import { reactive, markRaw } from 'vue'

export default {
  setup() {
    // 不需要响应式的第三方库实例
    const chart = markRaw(new Chart(ctx, {
      type: 'bar',
      data: chartData
    }))
    
    const state = reactive({
      chart
    })
    
    return { state }
  }
}
```

### 2. 复杂的不变数据

```javascript
import { reactive, markRaw } from 'vue'

const hugeData = markRaw({
  // 大量的静态配置数据
  config: { /* ... */ }
})

const state = reactive({
  data: hugeData // 不会被代理
})
```

### 3. 渲染函数

```javascript
import { h, markRaw } from 'vue'

const Comp = markRaw({
  render() {
    return h('div', 'static content')
  }
})

export default {
  setup() {
    return () => h(Comp)
  }
}
```

## 性能优化

```javascript
import { reactive, markRaw } from 'vue'

// 对于大型不可变数据
const staticData = markRaw({
  items: Array(10000).fill(null).map((_, i) => ({
    id: i,
    name: `Item ${i}`
  }))
})

const state = reactive({
  staticData, // 不会被代理，提升性能
  dynamicValue: 0
})
```

## 注意事项

```javascript
import { reactive, markRaw, isReadonly } from 'vue'

const obj = markRaw({ text: 'hello' })

// 标记后无法再转为响应式
const state = reactive({
  obj
})

// obj 仍然是原始对象
console.log(state.obj === obj) // true
```
