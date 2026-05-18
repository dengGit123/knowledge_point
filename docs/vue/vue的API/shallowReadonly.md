# shallowReadonly

## 作用

`shallowReadonly()` 创建一个只读代理，只有根层级的属性是只读的，嵌套对象仍然可以被修改。

## 基本用法

```javascript
import { shallowReadonly } from 'vue'

const state = shallowReadonly({
  foo: 1,
  nested: { bar: 2 }
})

// 根级属性不可修改
state.foo = 2 // ❌ 警告：不能修改只读属性

// 嵌套对象可以修改
state.nested.bar = 3 // ✅ 可以修改
```

## 与 readonly 的区别

```javascript
import { readonly, shallowReadonly } from 'vue'

// readonly: 深层只读
const deep = readonly({
  nested: { count: 0 }
})
deep.nested.count++ // ❌ 警告

// shallowReadonly: 浅层只读
const shallow = shallowReadonly({
  nested: { count: 0 }
})
shallow.nested.count++ // ✅ 可以修改
```

## 使用场景

### 1. 只读配置，可变状态

```javascript
import { shallowReadonly } from 'vue'

const config = shallowReadonly({
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  settings: { // 这个对象是可变的
    theme: 'light'
  }
})

// config.settings.theme = 'dark' // ✅ 可以
// config.apiUrl = '...' // ❌ 不可以
```

### 2. 保护根级属性

```javascript
import { shallowReadonly } from 'vue'

function createComponent(props) {
  const state = shallowReadonly({
    id: props.id,
    type: props.type,
    data: props.data // data 可以修改
  })
  
  return state
}
```
