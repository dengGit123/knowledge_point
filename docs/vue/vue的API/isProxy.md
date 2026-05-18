# isProxy

## 作用

`isProxy()` 检查一个对象是否是由 `reactive()`、`readonly()`、`shallowReactive()` 或 `shallowReadonly()` 创建的代理。

## 基本用法

```javascript
import { reactive, isProxy } from 'vue'

const obj = { foo: 1 }
const proxy = reactive(obj)

console.log(isProxy(obj)) // false
console.log(isProxy(proxy)) // true
```

## 区分不同类型

```javascript
import { 
  reactive, 
  readonly, 
  ref, 
  isProxy, 
  isReactive, 
  isReadonly,
  isRef 
} from 'vue'

const reactiveObj = reactive({ count: 0 })
const readonlyObj = readonly({ count: 0 })
const refValue = ref(0)
const plainObj = { count: 0 }

console.log(isProxy(reactiveObj)) // true
console.log(isProxy(readonlyObj)) // true
console.log(isProxy(refValue)) // false
console.log(isProxy(plainObj)) // false

console.log(isReactive(reactiveObj)) // true
console.log(isReadonly(readonlyObj)) // true
console.log(isRef(refValue)) // true
```

## 使用场景

```javascript
import { reactive, isProxy } from 'vue'

function processData(data) {
  if (isProxy(data)) {
    // 获取原始对象进行处理
    data = toRaw(data)
  }
  return data
}

const state = reactive({ items: [] })
processData(state.items)
```
