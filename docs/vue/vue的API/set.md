# set

向响应式对象添加属性的 API，用于确保新添加的属性也是响应式的。

## 语法

```javascript
import { set } from 'vue'

set(obj, key, value)
```

## 参数

- `obj`: 目标对象
- `key`: 属性名
- `value`: 属性值

## 返回值

无

## 基础用法

```javascript
import { set, reactive } from 'vue'

const state = reactive({
  name: 'Vue'
})

// 添加新属性
set(state, 'version', '3.0')

console.log(state.version) // "3.0"
// version 是响应式的
```

## 动态添加属性

```javascript
import { set, reactive } from 'vue'

const user = reactive({
  name: 'Alice'
})

// 根据条件动态添加属性
function addEmail() {
  set(user, 'email', 'alice@example.com')
}

addEmail()
console.log(user.email) // "alice@example.com"
```

## 添加嵌套属性

```javascript
import { set, reactive } from 'vue'

const state = reactive({
  user: {}
})

// 添加嵌套属性
set(state.user, 'name', 'Bob')
set(state.user, 'age', 30)

console.log(state.user.name) // "Bob"
console.log(state.user.age) // 30
```

## 与 Vue 2 的区别

```javascript
import { set, reactive } from 'vue'

const state = reactive({
  name: 'Vue'
})

// Vue 2 需要使用 set 确保响应式
set(state, 'version', '3.0')

// Vue 3 可以直接赋值（使用 Proxy）
state.newProp = '直接赋值也能工作'

// 但使用 set 更明确和兼容
```

## 动态表单字段

```javascript
import { set, reactive } from 'vue'

export function useDynamicForm() {
  const form = reactive({
    username: '',
    password: ''
  })

  function addField(name, defaultValue = '') {
    set(form, name, defaultValue)
  }

  function updateField(name, value) {
    set(form, name, value)
  }

  return {
    form,
    addField,
    updateField
  }
}

// 使用
const { form, addField } = useDynamicForm()
addField('email', '')
addField('phone', '')
```

## 动态配置

```javascript
import { set, reactive } from 'vue'

const config = reactive({
  apiUrl: '/api'
})

function updateConfig(key, value) {
  set(config, key, value)
}

updateConfig('timeout', 5000)
updateConfig('retries', 3)
```

## 数组元素设置

```javascript
import { set, reactive } from 'vue'

const list = reactive(['a', 'b', 'c'])

// 通过索引设置元素
set(list, 1, 'B')

console.log(list) // ['a', 'B', 'c']
```

## 与 TypeScript 结合

```typescript
import { set, reactive } from 'vue'

interface User {
  name: string
  [key: string]: any
}

const user: User = reactive({
  name: 'Alice'
})

// 动态添加属性
set(user, 'age', 25)
set(user, 'email', 'alice@example.com')
```

## 条件添加属性

```javascript
import { set, reactive } from 'vue'

const state = reactive({
  name: 'Vue'
})

function ensureProperty(key, defaultValue) {
  if (!(key in state)) {
    set(state, key, defaultValue)
  }
}

ensureProperty('version', '3.0')
ensureProperty('version', '4.0') // 不会覆盖已存在的值
```

## 批量添加属性

```javascript
import { set, reactive } from 'vue'

const state = reactive({})

const newProps = {
  name: 'Vue',
  version: '3.0',
  license: 'MIT'
}

Object.entries(newProps).forEach(([key, value]) => {
  set(state, key, value)
})
```

## 深层响应式属性

```javascript
import { set, reactive } from 'vue'

const state = reactive({
  data: {}
})

// 添加深层对象
set(state, 'data', {
  user: {
    name: 'Alice',
    profile: {
      age: 25
    }
  }
})

// 所有层级都是响应式的
```

## 注意事项

1. **Vue 3 变化**：Vue 3 使用 Proxy，直接赋值也能保持响应式

2. **向后兼容**：`set` 主要用于 Vue 2 代码兼容

3. **推荐用法**：Vue 3 中可以直接赋值，但 `set` 更明确

4. **响应式对象**：只对响应式对象有效

5. **数组索引**：可以用 `set` 设置数组元素

6. **性能考虑**：添加新属性有性能开销，避免频繁添加

7. **替代方案**：
   ```javascript
   // Vue 3 推荐写法
   const state = reactive({ name: 'Vue' })
   state.version = '3.0' // 正常工作

   // 或使用 Object.assign
   Object.assign(state, { newProp: 'value' })
   ```

8. **与 reactive 的配合**：
   ```javascript
   // 创建时直接包含所有属性更高效
   const state = reactive({
     name: 'Vue',
     version: '3.0', // 而不是后续添加
     license: 'MIT'
   })
   ```
