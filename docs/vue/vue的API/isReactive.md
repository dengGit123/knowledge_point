# isReactive

## 作用

`isReactive()` 检查一个对象是否是由 `reactive()` 或 `shallowReactive()` 创建的代理。

## 基本用法

```javascript
import { reactive, isReactive } from 'vue'

console.log(isReactive(reactive({}))) // true
console.log(isReactive(readonly({}))) // false
console.log(isReactive(ref({}))) // false
console.log(isReactive({})) // false
```

## 嵌套对象

```javascript
import { reactive, isReactive } from 'vue'

const state = reactive({
  nested: { foo: 1 }
})

console.log(isReactive(state)) // true
console.log(isReactive(state.nested)) // true (嵌套对象也是响应式的)
```

## 与 readonly 的区别

```javascript
import { reactive, readonly, isReactive, isReadonly } from 'vue'

const r = reactive({ count: 0 })
const rOnly = readonly({ count: 0 })

console.log(isReactive(r)) // true
console.log(isReactive(rOnly)) // false
console.log(isReadonly(rOnly)) // true
```
