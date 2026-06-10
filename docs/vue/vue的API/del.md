# del

> 📖 [Vue 官方文档 - del（已废弃）](https://v3-migration.vuejs.org/breaking-changes/#removed-api)

删除对象属性的响应式 API，用于确保删除操作能被 Vue 的响应式系统追踪。

## 语法

```javascript
import { del } from 'vue'

del(obj, key)
```

## 参数

- `obj`: 目标对象
- `key`: 要删除的属性名

## 返回值

无

## 基础用法

```javascript
import { del, reactive } from 'vue'

const state = reactive({
  name: 'Vue',
  version: '3.0',
  isAwesome: true
})

// 删除属性
del(state, 'version')

console.log(state.version) // undefined
console.log('version' in state) // false
```

## 删除嵌套属性

```javascript
import { del, reactive } from 'vue'

const user = reactive({
  name: 'Alice',
  address: {
    city: 'Beijing',
    country: 'China'
  }
})

// 删除嵌套属性
del(user.address, 'city')

console.log(user.address.city) // undefined
```

## 条件删除

```javascript
import { del, reactive } from 'vue'

const items = reactive({
  a: { value: 1 },
  b: { value: 2 },
  c: { value: 3 }
})

// 条件删除
Object.keys(items).forEach(key => {
  if (items[key].value < 2) {
    del(items, key)
  }
})
```

## 与 delete 的区别

```javascript
import { del, reactive } from 'vue'

const state = reactive({
  name: 'Vue',
  version: '3.0'
})

// Vue 2 风格：使用 del 确保响应式
del(state, 'name')

// Vue 3 中：可以直接使用 delete
delete state.version

// 但为了代码兼容性和明确性，使用 del 更好
```

## 动态删除

```javascript
import { del, reactive } from 'vue'

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: ''
})

function removeField(field) {
  del(form, field)
}

removeField('confirmPassword')
```

## 与 TypeScript 结合

```typescript
import { del, reactive } from 'vue'

interface User {
  name: string
  age: number
  email?: string
}

const user: User = reactive({
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
})

// 删除可选属性
if (user.email) {
  del(user, 'email')
}
```

## 删除数组元素

```javascript
import { del, reactive } from 'vue'

const list = reactive({
  items: ['a', 'b', 'c', 'd']
})

// 不推荐：直接删除索引
// delete list.items[1] // 会留下空位

// 推荐：使用 splice
list.items.splice(1, 1)

// 或使用 del（用于对象属性）
del(list, 'items')
```

## 表单字段管理

```javascript
import { del, reactive } from 'vue'

export function useForm(initialFields) {
  const form = reactive({ ...initialFields })

  function removeField(fieldName) {
    del(form, fieldName)
  }

  function clearForm() {
    Object.keys(form).forEach(key => {
      del(form, key)
    })
  }

  return {
    form,
    removeField,
    clearForm
  }
}
```

## 动态对象清理

```javascript
import { del, reactive, watch } from 'vue'

const cache = reactive({
  temp1: 'data1',
  temp2: 'data2',
  persistent: 'important'
})

// 监听并清理临时数据
setInterval(() => {
  Object.keys(cache).forEach(key => {
    if (key.startsWith('temp')) {
      del(cache, key)
    }
  })
}, 5000)
```

## 权限管理

```javascript
import { del, reactive } from 'vue'

const permissions = reactive({
  read: true,
  write: true,
  delete: true,
  admin: true
})

function revokePermission(permission) {
  del(permissions, permission)
}

revokePermission('admin')
```

## 注意事项

1. **Vue 3 变化**：Vue 3 中使用 Proxy，普通的 `delete` 操作也能触发响应式更新

2. **向后兼容**：`del` 主要用于 Vue 2 代码迁移

3. **推荐用法**：Vue 3 中可以直接使用 `delete`

4. **响应式对象**：只对响应式对象有意义

5. **数组删除**：数组元素应该使用 `splice` 而不是 `del` 或 `delete`

6. **性能考虑**：删除属性操作有性能开销，避免频繁操作

7. **替代方案**：
   ```javascript
   // Vue 3 推荐写法
   const state = reactive({ name: 'Vue' })
   delete state.name // 正常工作

   // 或使用解构
   const { name, ...rest } = state
   ```
