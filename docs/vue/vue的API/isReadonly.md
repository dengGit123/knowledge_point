# isReadonly

## 作用

`isReadonly()` 检查一个对象是否是由 `readonly()` 或 `shallowReadonly()` 创建的代理。

## 基本用法

```javascript
import { readonly, isReadonly } from 'vue'

console.log(isReadonly(readonly({}))) // true
console.log(isReadonly(reactive({}))) // false
console.log(isReadonly(ref({}))) // false
console.log(isReadonly({})) // false
```

## 使用场景

```javascript
import { readonly, isReadonly } from 'vue'

const props = readonly({ title: 'Hello' })

if (isReadonly(props)) {
  console.log('这是只读对象')
}
```

## 嵌套检查

```javascript
import { readonly, isReadonly } from 'vue'

const state = readonly({
  nested: { foo: 1 }
})

console.log(isReadonly(state)) // true
console.log(isReadonly(state.nested)) // true (嵌套对象也是只读的)
```
