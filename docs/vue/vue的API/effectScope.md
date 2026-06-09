# effectScope

## 作用

`effectScope()` 创建一个作用域对象，用于捕获其中创建的响应式副作用（如 `effect`、`computed`、`watch`），可以统一 disposal。

> [官方文档：effectScope](https://cn.vuejs.org/api/reactivity-advanced#effectscope)

## 基本用法

```javascript
import { effectScope } from 'vue'

const scope = effectScope()

scope.run(() => {
  const doubled = computed(() => count.value * 2)
  
  watch(() => {
    // ...
  })
})

// 停止作用域内的所有副作用
scope.stop()
```

## 嵌套作用域

```javascript
import { effectScope } from 'vue'

const parentScope = effectScope()

parentScope.run(() => {
  const childScope = effectScope(true)
  
  childScope.run(() => {
    // 这里的副作用会被 childScope 捕获
  })
  
  // 停止 parentScope 会自动停止所有子作用域
})
```

## 在组件中使用

```javascript
import { effectScope, onScopeDispose } from 'vue'

import { getCurrentInstance, onUnmounted } from 'vue'

export default {
  setup() {
    const instance = getCurrentInstance()
    
    // 获取组件的作用域
    const scope = instance.scope
    
    scope.run(() => {
      // 创建的副作用会随组件卸载而停止
    })
  }
}
```

## 手动管理

```javascript
import { effectScope, ref, watch } from 'vue'

const scope = effectScope()

scope.run(() => {
  const count = ref(0)
  
  watch(count, (val) => {
    console.log('count:', val)
  })
})

// 一次性停止所有副作用
scope.stop()
```

## detach

```javascript
import { effectScope } from 'vue'

const parentScope = effectScope()
const childScope = effectScope(true)

parentScope.run(() => {
  childScope.run(() => {
    // 从父作用域分离
  })
  
  // 停止 parentScope 不会影响已分离的 childScope
  childScope.detach()
})
```
