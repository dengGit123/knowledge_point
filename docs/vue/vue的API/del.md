# del

> ⚠️ **更正：Vue 3 中没有 `del` 这个 API。** `import { del } from 'vue'` 会报错（`del` 不是 Vue 3 的导出）。Vue 2 中的对应 API 是全局方法 **`Vue.delete()`** 和组件内的实例方法 **`this.$delete()`**；Vue 3 基于 `Proxy` 实现响应式，删除属性直接用 `delete` 操作符即可，该 API 已随 `Vue.set` 一起移除。

📖 [Vue 2 官方文档 - Vue.delete](https://v2.cn.vuejs.org/v2/api/#Vue-delete)

📖 [Vue 3 迁移指南 - 移除的 API](https://v3-migration.vuejs.org/breaking-changes/#removed-apis)

## Vue 2：Vue.delete / this.$delete

### 语法

```js
// 全局方法
import Vue from 'vue'

Vue.delete(target, propertyNameOrIndex)

// 组件内的实例方法（全局方法的别名）
this.$delete(target, propertyNameOrIndex)
```

### 参数

- `target`: `Object | Array`，目标响应式对象或数组（**不能是 Vue 实例或实例的根数据对象 `$data`**）
- `propertyNameOrIndex`: `string | number`，要删除的属性名或数组索引（数组 + 索引用法需要 **2.2.0+**）

### 返回值

无

### 基础用法

```js
// Vue 2 组件
export default {
  data() {
    return {
      user: { name: 'Alice', temp: 'value' }
    }
  },
  methods: {
    // ❌ delete 操作符：Vue 2 检测不到属性删除，视图不更新
    removeWrong() {
      delete this.user.temp
    },

    // ✅ 使用 $delete：删除并触发视图更新
    removeCorrect() {
      this.$delete(this.user, 'temp')
    }
  }
}
```

### 删除数组元素（2.2.0+）

```js
export default {
  data() {
    return {
      list: ['a', 'b', 'c']
    }
  },
  methods: {
    // ✅ Vue.delete 支持数组 + 索引（2.2.0+）
    removeFirst() {
      this.$delete(this.list, 0) // ['b', 'c']
    },

    // ✅ 更常用：splice（被 Vue 包装过的变异方法，同样触发更新）
    removeBySplice() {
      this.list.splice(0, 1)
    }
  }
}
```

## Vue 3 为什么移除了它

Vue 2 用 `Object.defineProperty` 只能拦截「已有属性的读取和写入」，检测不到属性的新增与删除，所以需要 `Vue.set` / `Vue.delete` 显式通知。

Vue 3 改用 ES6 `Proxy`，在**整个对象层面**拦截操作，`delete`（`deleteProperty` trap）天然可被检测，因此这对 API 失去了存在的意义，在 Vue 3 中被移除。

```js
// Vue 3：直接用 delete，响应式更新照常触发
import { reactive } from 'vue'

const user = reactive({ name: 'Alice', temp: 'value' })

delete user.temp // ✅ Proxy 自动检测，视图同步更新
console.log('temp' in user) // false
```

## 迁移对照

| Vue 2 写法 | Vue 3 写法 |
|-----------|-----------|
| `Vue.delete(obj, key)` / `this.$delete(obj, key)` | `delete obj.key` |
| `Vue.delete(arr, index)` / `this.$delete(arr, index)` | `arr.splice(index, 1)` 或直接赋值方案 |
| `Vue.set(obj, key, value)`（新增属性用的姊妹 API） | `obj.key = value` |

> 💡 **提示：** 配合组合式 API 时，「删除可选取属性」也可以用整体替换的思路：`Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key))`，或者干脆用 `ref` 保存整份对象后替换 `value`。

## 注意事项

1. **不要在 Vue 3 项目中写 `import { del } from 'vue'`**：这不是合法导入，运行时会得到 `undefined` 并报 `del is not a function`

2. **数组仍推荐 `splice`**：`delete arr[i]`（操作符）会在数组中留下空位（`empty`），`length` 也不变；删除数组元素应使用 `splice`

3. **Vue 2 中 `$delete` 同样有目标限制**：目标不能是 Vue 实例或 `$data` 根数据对象，且对非响应式对象调用没有意义（只是普通的 `delete`）

4. **官方态度**：Vue 2 文档就明确「你应该很少会使用它」——优先在初始化时把属性声明为可选（置为 `null` / `undefined`），而不是动态增删属性
