### 一、概述

`Vue.set()` 是 Vue 2 时代用于**向响应式对象上添加新属性**的全局 API。在 Vue 2 中，由于响应式系统基于 `Object.defineProperty` 实现，它无法检测到对象属性的新增和删除，因此必须借助 `Vue.set()`（或组件内的 `this.$set()`）来确保新添加的属性也是响应式的。

> 📖 [Vue 2 官方文档 - Vue.set](https://v2.cn.vuejs.org/v2/api/#Vue-set)

> ⚠️ **注意：** 在 Vue 3 中，`set` 函数**已不再是公开导出的 API**。Vue 3 基于 ES6 `Proxy` 实现响应式系统，可以直接检测到属性的动态添加和删除，因此不再需要 `Vue.set()`。本文将详细讲解 `set` 在 Vue 2 中的原理与用法，以及在 Vue 3 中的替代方案。

### 二、核心原理

#### 为什么 Vue 2 需要 `set`？

Vue 2 的响应式系统通过 `Object.defineProperty()` 将对象已有的属性转换为 `getter/setter`。这个机制有一个**关键限制**：它只能在对象初始化时对**已存在的属性**进行拦截，无法感知后续动态添加的新属性。

```js
// Vue 2 中的响应式陷阱
export default {
  data() {
    return {
      user: {
        name: 'Alice'
        // age 属性在初始化时不存在
      }
    }
  },
  mounted() {
    // ❌ 直接添加新属性 —— 不会触发视图更新
    this.user.age = 25

    // ✅ 使用 $set —— 会触发视图更新
    this.$set(this.user, 'age', 25)
  }
}
```

用一个生活类比来理解：想象你的房子（响应式对象）里安装了传感器（`getter/setter`）。传感器只在**装修时（对象初始化时）**安装在已有的门窗上。如果你后来新增了一扇门，但没有给它装传感器，那这扇门的开闭就没人能感知到。`Vue.set()` 就相当于**给新门安装传感器**的操作。

#### Vue 3 为什么不再需要 `set`？

Vue 3 使用 ES6 `Proxy` 重写了响应式系统。`Proxy` 可以在**整个对象层面**进行拦截，无论是读取、修改、新增还是删除属性，都能被自动检测到。

```ts
// Vue 3 中直接赋值即可，无需 set
import { reactive, watchEffect } from 'vue'

const user = reactive({
  name: 'Alice'
})

watchEffect(() => {
  console.log(`用户年龄：${user.age}`) // 当 age 变化时会自动触发
})

// ✅ 直接添加新属性，视图会自动更新
user.age = 25 // 控制台输出：用户年龄：25
```

### 三、详细用法

#### 1. 基本用法（Vue 2）

```js
// Vue 2 全局调用
import Vue from 'vue'

Vue.set(target, propertyNameOrIndex, value)
```

```js
// Vue 2 组件内调用
this.$set(target, propertyNameOrIndex, value)
```

**基本示例：**

```js
// Vue 2 组件
export default {
  data() {
    return {
      user: {
        name: 'Alice'
      }
    }
  },
  methods: {
    addAge() {
      // ✅ 使用 $set 添加新的响应式属性
      this.$set(this.user, 'age', 25)
    }
  }
}
```

#### 2. 进阶用法

##### 2.1 动态添加嵌套属性

```js
// Vue 2 —— 嵌套对象的属性添加
export default {
  data() {
    return {
      config: {
        api: {
          baseUrl: 'https://api.example.com'
        }
      }
    }
  },
  methods: {
    updateConfig() {
      // ✅ 给嵌套对象添加新属性
      this.$set(this.config.api, 'timeout', 5000)
      this.$set(this.config.api, 'headers', {
        'Content-Type': 'application/json'
      })
    }
  }
}
```

##### 2.2 修改数组元素

在 Vue 2 中，直接通过索引修改数组元素同样是**非响应式**的，需要使用 `set`。

```js
// Vue 2 —— 数组操作
export default {
  data() {
    return {
      list: ['苹果', '香蕉', '橙子']
    }
  },
  methods: {
    updateItem() {
      // ❌ 直接通过索引修改 —— 不会触发视图更新
      this.list[1] = '西瓜'

      // ✅ 使用 $set 修改数组元素
      this.$set(this.list, 1, '西瓜')

      // ✅ 或者使用 splice 方法（Vue 2 对数组变更方法进行了包装）
      this.list.splice(1, 1, '西瓜')
    },
    addItem() {
      // ✅ 设置超出当前长度的索引，相当于添加元素
      this.$set(this.list, this.list.length, '芒果')
    }
  }
}
```

##### 2.3 条件性添加属性

```js
// Vue 2 —— 安全地添加属性（避免覆盖已有值）
export default {
  data() {
    return {
      options: {
        theme: 'dark'
      }
    }
  },
  methods: {
    ensureDefault(key, defaultValue) {
      // 仅在属性不存在时添加
      if (!(key in this.options)) {
        this.$set(this.options, key, defaultValue)
      }
    }
  }
}
```

##### 2.4 批量添加属性

```js
// Vue 2 —— 批量添加多个属性
export default {
  data() {
    return {
      form: {
        username: ''
      }
    }
  },
  methods: {
    addFields() {
      const newFields = {
        email: '',
        phone: '',
        address: ''
      }
      // 逐个使用 $set 添加
      Object.keys(newFields).forEach(key => {
        this.$set(this.form, key, newFields[key])
      })
    }
  }
}
```

##### 2.5 动态表单字段管理

```js
// Vue 2 —— 动态表单
export default {
  data() {
    return {
      form: {},
      fieldConfigs: []
    }
  },
  methods: {
    // 根据后端返回的配置动态生成表单字段
    initForm(configs) {
      this.fieldConfigs = configs
      configs.forEach(config => {
        this.$set(this.form, config.fieldName, config.defaultValue ?? '')
      })
    },
    // 动态添加新字段
    addField(name, defaultValue = '') {
      this.$set(this.form, name, defaultValue)
      this.fieldConfigs.push({ fieldName: name, label: name })
    },
    // 动态移除字段
    removeField(name) {
      // Vue 2 中删除属性也需要 $delete
      this.$delete(this.form, name)
      this.fieldConfigs = this.fieldConfigs.filter(c => c.fieldName !== name)
    }
  }
}
```

#### 3. API 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `target` | `Array \| Object` | 目标响应式对象或数组（必须是 Vue 响应式数据源中的对象） |
| `propertyNameOrIndex` | `string \| number` | 要添加/修改的属性名或数组索引 |
| `value` | `any` | 要设置的属性值。如果值是对象或数组，会自动递归转换为响应式 |

**返回值：** `any` —— 返回设置的值本身。

| 调用方式 | 适用版本 | 说明 |
|----------|----------|------|
| `Vue.set(target, key, value)` | Vue 2 全局 | 全局 API 调用 |
| `this.$set(target, key, value)` | Vue 2 组件内 | 组件实例方法，功能完全一致 |
| `import { set } from '@vue/composition-api'` | Vue 2 + Composition API 插件 | Composition API 中的等价方法 |
| `import { set } from 'vue-demi'` | Vue 2/3 通用库 | 跨版本兼容库中的适配方法 |
| 直接赋值 `obj.key = value` | Vue 3 | Vue 3 推荐方式，无需 `set` |

### 四、实现效果

#### Vue 2 中使用 `set` 的效果

```js
// Vue 2 —— 对比有无 set 的行为差异
export default {
  data() {
    return {
      user: { name: 'Alice' }
    }
  },
  mounted() {
    // ❌ 直接赋值 —— 控制台能看到值变了，但视图不会更新
    this.user.age = 25
    console.log(this.user.age) // 25（数据变了）
    // 页面上 {{ user.age }} 不会显示 25

    // ✅ 使用 $set —— 数据变化且视图同步更新
    this.$set(this.user, 'age', 25)
    // 页面上 {{ user.age }} 立即显示 25
  }
}
```

#### Vue 3 中的等价效果

```vue
<!-- Vue 3 —— 直接赋值即可 -->
<script setup lang="ts">
import { reactive, watchEffect } from 'vue'

interface User {
  name: string
  age?: number
  email?: string
}

const user = reactive<User>({
  name: 'Alice'
})

// watchEffect 自动追踪依赖，包括后续新增的属性
watchEffect(() => {
  console.log('用户信息变化：', { ...user })
})

// ✅ 直接赋值，完全响应式
function addAge() {
  user.age = 25
  // watchEffect 自动触发，控制台输出新的用户信息
}

// ✅ 动态添加属性，也是响应式的
function addEmail() {
  user.email = 'alice@example.com'
}
</script>

<template>
  <div>
    <p>姓名：{{ user.name }}</p>
    <p>年龄：{{ user.age ?? '未设置' }}</p>
    <p>邮箱：{{ user.email ?? '未设置' }}</p>
    <button @click="addAge">设置年龄</button>
    <button @click="addEmail">设置邮箱</button>
  </div>
</template>
```

### 五、使用场景

#### 场景 1：动态表单字段管理

在 Vue 2 项目中，根据用户选择动态添加或移除表单字段。

```js
// Vue 2 —— 动态表单
export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      extraFields: {}
    }
  },
  methods: {
    // 根据用户选择的角色显示不同字段
    onRoleChange(role) {
      // 清除之前的额外字段
      Object.keys(this.extraFields).forEach(key => {
        this.$delete(this.form, key)
      })
      this.extraFields = {}

      // 根据角色添加新字段
      const roleFields = {
        developer: { skills: '', level: '' },
        designer: { portfolio: '', tools: '' },
        manager: { department: '', team_size: '' }
      }

      if (roleFields[role]) {
        Object.entries(roleFields[role]).forEach(([key, defaultVal]) => {
          this.$set(this.form, key, defaultVal)
          this.$set(this.extraFields, key, true)
        })
      }
    }
  }
}
```

#### 场景 2：动态配置管理

在 Vue 2 项目中，根据后端接口返回的配置数据动态初始化应用配置。

```js
// Vue 2 —— 动态配置管理
export default {
  data() {
    return {
      appConfig: {
        baseUrl: 'https://api.example.com'
      }
    }
  },
  async created() {
    // 从后端获取动态配置
    const remoteConfig = await this.$http.get('/api/config')

    // 逐个添加为响应式属性
    Object.entries(remoteConfig).forEach(([key, value]) => {
      this.$set(this.appConfig, key, value)
    })

    // 或者批量覆盖（使用 Object.assign）
    // 注意：Object.assign 在 Vue 2 中对新属性也不触发响应式
    // 所以如果属性不存在，仍需用 $set
  }
}
```

#### 场景 3：列表数据的增删改

在 Vue 2 项目中，对数组进行精确的索引操作。

```js
// Vue 2 —— 列表数据操作
export default {
  data() {
    return {
      columns: ['姓名', '年龄'],
      tableData: [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 }
      ]
    }
  },
  methods: {
    // 替换某一行数据
    updateRow(index, newRow) {
      // ✅ 使用 $set 替换数组中的元素
      this.$set(this.tableData, index, newRow)
    },

    // 给某行数据添加新字段
    addRowField(index, key, value) {
      // ✅ 嵌套对象的新属性也需要 $set
      this.$set(this.tableData[index], key, value)
    },

    // 动态添加列
    addColumn(name) {
      if (!this.columns.includes(name)) {
        this.columns.push(name)
        // 给每一行数据添加对应的字段
        this.tableData.forEach((row, index) => {
          this.$set(this.tableData[index], name, '')
        })
      }
    }
  }
}
```

#### 场景 4：Vue 3 中动态状态管理

在 Vue 3 项目中，使用 `reactive` 或 `ref` 直接管理动态属性。

```vue
<!-- Vue 3 —— 动态状态管理 -->
<script setup lang="ts">
import { reactive, ref, watchEffect } from 'vue'

// 方式 1：reactive + 直接赋值
interface PageState {
  loading: boolean
  data: Record<string, any>
  error: string | null
  [key: string]: any
}

const pageState = reactive<PageState>({
  loading: false,
  data: {},
  error: null
})

// ✅ 动态添加属性，自动响应式
function addModuleState(moduleName: string, initialState: Record<string, any>) {
  pageState[moduleName] = {
    loading: false,
    ...initialState
  }
}

addModuleState('users', { list: [], total: 0 })
addModuleState('orders', { list: [], total: 0 })

// 方式 2：使用 Map 配合 reactive
const moduleStates = reactive(new Map<string, Record<string, any>>())

function registerModule(name: string, state: Record<string, any>) {
  moduleStates.set(name, state)
}

registerModule('products', { list: [], filters: {} })
</script>
```

#### 场景 5：缓存对象的动态属性

在 Vue 2 项目中，维护一个缓存对象，动态存储请求结果。

```js
// Vue 2 —— API 数据缓存
export default {
  data() {
    return {
      cache: {},
      loading: {}
    }
  },
  methods: {
    async fetchWithCache(apiKey, apiFn) {
      // 如果已缓存，直接返回
      if (this.cache[apiKey]) {
        return this.cache[apiKey]
      }

      // 标记加载状态
      this.$set(this.loading, apiKey, true)

      try {
        const data = await apiFn()
        // ✅ 缓存结果
        this.$set(this.cache, apiKey, data)
        return data
      } finally {
        this.$set(this.loading, apiKey, false)
      }
    }
  }
}
```

#### 场景 6：动态组件配置

在 Vue 3 项目中，根据配置动态构建组件的 props。

```vue
<!-- Vue 3 —— 动态组件配置 -->
<script setup lang="ts">
import { reactive, markRaw, type Component } from 'vue'
import UserForm from './UserForm.vue'
import RoleForm from './RoleForm.vue'
import PermissionForm from './PermissionForm.vue'

interface FormConfig {
  component: Component
  props: Record<string, any>
}

const forms = reactive<Record<string, FormConfig>>({
  user: {
    component: markRaw(UserForm),
    props: { mode: 'edit' }
  }
})

// ✅ 动态注册新的表单配置
function registerForm(name: string, component: Component, defaultProps: Record<string, any> = {}) {
  forms[name] = {
    component: markRaw(component),
    props: defaultProps
  }
}

registerForm('role', RoleForm, { mode: 'create' })
registerForm('permission', PermissionForm, { mode: 'view' })

// ✅ 动态更新某个表单的 props
function updateFormProps(formName: string, key: string, value: any) {
  if (forms[formName]) {
    forms[formName].props[key] = value
  }
}
</script>

<template>
  <component
    :is="forms.user.component"
    v-bind="forms.user.props"
  />
</template>
```

#### 场景 7：国际化的动态 key 管理

在 Vue 2 项目中，从后端加载国际化文本。

```js
// Vue 2 —— 动态加载国际化文本
export default {
  data() {
    return {
      i18n: {
        'common.confirm': '确认',
        'common.cancel': '取消'
      }
    }
  },
  async created() {
    // 从后端加载当前语言的翻译
    const translations = await this.$http.get('/api/i18n/zh-CN')

    // ✅ 逐个添加为响应式属性，视图中使用 {{ i18n['key'] }} 即可响应式更新
    Object.entries(translations).forEach(([key, value]) => {
      this.$set(this.i18n, key, value)
    })
  },
  methods: {
    t(key) {
      return this.i18n[key] || key
    }
  }
}
```

#### 场景 8：权限系统的动态菜单

在 Vue 2 项目中，根据用户权限动态生成菜单配置。

```js
// Vue 2 —— 动态权限菜单
export default {
  data() {
    return {
      menuConfig: {
        home: { title: '首页', visible: true }
      },
      permissions: []
    }
  },
  async created() {
    // 获取用户权限
    this.permissions = await this.$http.get('/api/permissions')

    // 根据权限动态添加菜单项
    const menuMap = {
      'user:manage': { title: '用户管理', visible: true, icon: 'user' },
      'order:manage': { title: '订单管理', visible: true, icon: 'order' },
      'system:config': { title: '系统配置', visible: true, icon: 'setting' },
      'log:view': { title: '日志查看', visible: true, icon: 'log' }
    }

    this.permissions.forEach(perm => {
      if (menuMap[perm]) {
        // ✅ 动态添加菜单项
        this.$set(this.menuConfig, perm, menuMap[perm])
      }
    })
  }
}
```

#### 场景 9：跨版本兼容库开发（vue-demi）

在编写需要同时支持 Vue 2 和 Vue 3 的库时，使用 `vue-demi` 的 `set`。

```ts
// 跨版本兼容库 —— 使用 vue-demi
import { set, reactive, isVue3 } from 'vue-demi'

/**
 * vue-demi 会根据当前安装的 Vue 版本自动适配：
 * - Vue 3 环境：set 是直接赋值的 polyfill
 * - Vue 2 环境：set 等价于 Vue.set
 */
export function createDynamicStore<T extends Record<string, any>>(
  initialState: T
) {
  const state = reactive({ ...initialState })

  function setField<K extends string>(key: K, value: any) {
    // 在 Vue 2 和 Vue 3 中都能正确工作
    set(state, key, value)
  }

  function setFields(fields: Record<string, any>) {
    Object.entries(fields).forEach(([key, value]) => {
      set(state, key, value)
    })
  }

  return { state, setField, setFields }
}
```

#### 场景 10：图表/可视化数据的动态系列

在 Vue 3 项目中，动态管理 ECharts 或类似图表的数据系列。

```vue
<!-- Vue 3 —— 图表动态数据系列 -->
<script setup lang="ts">
import { reactive, watch } from 'vue'
import * as echarts from 'echarts'

interface SeriesItem {
  name: string
  type: string
  data: number[]
}

const chartOptions = reactive<{
  series: SeriesItem[]
}>({
  series: []
})

// ✅ 动态添加数据系列
function addSeries(name: string, data: number[], type: string = 'line') {
  chartOptions.series.push({ name, type, data })
}

// ✅ 动态更新某个系列的数据
function updateSeriesData(index: number, newData: number[]) {
  if (chartOptions.series[index]) {
    chartOptions.series[index].data = newData
  }
}

// ✅ 动态添加属性到图表配置
function addOption<K extends string>(key: K, value: any) {
  // Vue 3 中直接赋值即可
  ;(chartOptions as any)[key] = value
}

// 初始化两个系列
addSeries('销售额', [120, 200, 150, 80, 70, 110, 130])
addSeries('利润', [60, 100, 80, 40, 35, 55, 65])

// 动态添加其他配置
addOption('title', { text: '销售数据统计' })
addOption('xAxis', { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] })
</script>
```

### 六、注意事项

#### 1. Vue 3 中 `set` 不再是公开 API

```ts
// ❌ Vue 3 中 set 不是公开导出的 API
import { set } from 'vue' // 运行时报错：set is not exported

// ✅ Vue 3 中直接赋值即可
import { reactive } from 'vue'
const state = reactive({ name: 'Vue' })
state.version = '3.0' // 完全响应式
```

> ⚠️ **注意：** 如果你在 Vue 3 代码中看到 `import { set } from 'vue'`，这是一个错误。Vue 3 不需要也不导出 `set`。

#### 2. Vue 2 中 `set` 只对响应式对象有效

```js
// ❌ 对普通对象使用 $set，不会触发任何视图更新
const plainObject = { name: 'test' }
this.$set(plainObject, 'age', 25) // 属性被添加了，但不会触发视图更新

// ✅ 只对 data 中定义的响应式对象有效
export default {
  data() {
    return {
      user: { name: 'test' } // 这个 user 是响应式的
    }
  },
  methods: {
    addAge() {
      this.$set(this.user, 'age', 25) // ✅ 会触发视图更新
    }
  }
}
```

#### 3. 数组直接索引赋值的陷阱（Vue 2）

```js
// Vue 2 中
export default {
  data() {
    return {
      items: ['a', 'b', 'c'],
      objArr: [{ id: 1, name: 'foo' }]
    }
  },
  methods: {
    // ❌ 直接通过索引修改数组元素
    updateList() {
      this.items[0] = 'A' // 不触发更新
      this.items.length = 2 // 不触发更新
    },

    // ✅ 正确的方式
    updateListCorrect() {
      this.$set(this.items, 0, 'A') // 触发更新
      this.items.splice(2) // 触发更新（splice 是被 Vue 包装的变异方法）
    },

    // ❌ 嵌套对象的新属性
    addField() {
      this.objArr[0].newField = 'value' // 不触发更新
    },

    // ✅ 嵌套对象新属性的正确写法
    addFieldCorrect() {
      this.$set(this.objArr[0], 'newField', 'value') // 触发更新
    }
  }
}
```

#### 4. Vue 2 中对象的批量赋值

```js
// Vue 2 中
export default {
  data() {
    return {
      user: { name: 'Alice' }
    }
  },
  methods: {
    // ❌ Object.assign 添加的新属性不是响应式的
    assignWrong() {
      Object.assign(this.user, { age: 25, email: 'alice@test.com' })
      // age 和 email 不触发视图更新
    },

    // ✅ 逐个使用 $set
    assignCorrect() {
      this.$set(this.user, 'age', 25)
      this.$set(this.user, 'email', 'alice@test.com')
    },

    // ✅ 或者替换整个对象
    replaceCorrect() {
      this.user = { name: 'Alice', age: 25, email: 'alice@test.com' }
    }
  }
}
```

#### 5. Vue 3 中 `reactive` 的替换陷阱

```ts
// Vue 3 中 reactive 对象不能直接被替换
import { reactive, watchEffect } from 'vue'

const state = reactive({ name: 'Alice', age: 25 })

watchEffect(() => {
  console.log(state.name, state.age)
})

// ❌ 直接替换整个对象会丢失响应式引用
// state = reactive({ name: 'Bob', age: 30 }) // TypeScript 报错，运行时也会出问题

// ✅ 方式 1：使用 Object.assign
Object.assign(state, { name: 'Bob', age: 30 })

// ✅ 方式 2：使用 ref 包裹对象
import { ref } from 'vue'
const stateRef = ref({ name: 'Alice', age: 25 })
stateRef.value = { name: 'Bob', age: 30 } // 完全替换，响应式正常
```

#### 6. 提前声明所有属性是最佳实践

```ts
// ✅ 在创建时就声明所有可能用到的属性（即使是空值）
import { reactive } from 'vue'

interface UserState {
  name: string
  age: number | null
  email: string | null
  avatar: string | null
}

const user = reactive<UserState>({
  name: '',
  age: null,     // 提前声明
  email: null,   // 提前声明
  avatar: null   // 提前声明
})

// 后续赋值不会有任何问题
user.age = 25
user.email = 'alice@example.com'
```

> 💡 **提示：** 无论是 Vue 2 还是 Vue 3，提前声明所有属性都是最佳实践。这样代码可读性更好，TypeScript 类型推导也更准确。

#### 7. `set` 与 `$delete` 成对出现

```js
// Vue 2 中，与 $set 对应的是 $delete（删除响应式属性）
export default {
  data() {
    return {
      user: { name: 'Alice', temp: 'value' }
    }
  },
  methods: {
    // ❌ delete 操作符不会触发视图更新
    deleteWrong() {
      delete this.user.temp // 数据删除了，视图不更新
    },

    // ✅ 使用 $delete
    deleteCorrect() {
      this.$delete(this.user, 'temp') // 数据删除，视图同步更新
    }
  }
}
```

#### 8. Vue 3 中删除属性的正确方式

```ts
// Vue 3 中删除属性也有正确的方式
import { reactive, watchEffect } from 'vue'

const user = reactive<Record<string, any>>({
  name: 'Alice',
  age: 25,
  temp: 'value'
})

watchEffect(() => {
  console.log('name:', user.name)
})

// ✅ Vue 3 中可以直接用 delete，Proxy 会自动检测
delete user.temp // 视图会自动更新

// ✅ 使用解构 + 展开运算符创建新对象（适用于 reactive）
// 注意：这会创建一个新对象，不是修改原对象
```

#### 9. 使用 `ref` 避免 `reactive` 的限制

```ts
// 当你需要频繁替换整个对象时，优先使用 ref 而非 reactive
import { ref, watchEffect } from 'vue'

// ✅ 使用 ref —— 可以随时替换整个值
const userList = ref<Array<{ id: number; name: string }>>([])

async function fetchUsers() {
  const data = await api.getUsers()
  userList.value = data // 直接替换，响应式正常
}

// 对比 reactive 的写法
import { reactive } from 'vue'

const state = reactive<{ list: Array<{ id: number; name: string }> }>({
  list: []
})

async function fetchUsersReactive() {
  const data = await api.getUsers()
  // ✅ 替换 reactive 中的属性
  state.list = data
  // ❌ 不能这样：state = { list: data }
}
```

#### 10. `vue-demi` 中 `set` 的兼容行为

```ts
// vue-demi 为跨版本库提供了统一的 set 导出
import { set, reactive, isVue3 } from 'vue-demi'

const state = reactive({ name: 'Vue' })

// vue-demi 的 set 在不同版本中的行为：
// Vue 2：等价于 Vue.set()，触发响应式更新
// Vue 3：直接赋值（因为 Proxy 自动检测），内部可能是 state[key] = value
set(state, 'version', '3.0')

// 如果你的库需要同时支持 Vue 2 和 Vue 3，推荐使用 vue-demi
// 而不是自己写条件判断
```

> 💡 **提示：** 只有在编写需要同时兼容 Vue 2 和 Vue 3 的第三方库时，才需要关注 `vue-demi` 的 `set`。普通的 Vue 3 项目完全不需要。

### 七、相关 API 对比

#### `set` vs 直接赋值 vs `Object.assign` vs `ref`

| 特性 | Vue 2 `Vue.set()` | Vue 2 直接赋值 | Vue 3 直接赋值 | Vue 3 `Object.assign` |
|------|--------------------|----------------|----------------|----------------------|
| 新增属性是否响应式 | ✅ 是 | ❌ 否 | ✅ 是 | ✅ 是 |
| 修改已有属性是否响应式 | ✅ 是 | ✅ 是 | ✅ 是 | ✅ 是 |
| 数组索引修改是否响应式 | ✅ 是 | ❌ 否 | ✅ 是 | ✅ 是 |
| 替换整个对象 | ❌ 不适用 | ❌ 不适用 | ⚠️ `reactive` 不行 | ✅ 适用于属性合并 |

#### Vue 2 vs Vue 3 响应式差异总览

| 场景 | Vue 2 行为 | Vue 3 行为 |
|------|-----------|-----------|
| 新增对象属性 | 需要 `Vue.set()` | 直接赋值，自动响应式 |
| 删除对象属性 | 需要 `Vue.delete()` | `delete` 操作符，自动响应式 |
| 数组索引赋值 | 需要 `Vue.set()` | 直接赋值，自动响应式 |
| 修改 `length` | 需要 `Vue.set()` | 直接赋值，自动响应式 |
| 对象整体替换 | 直接赋值 `this.obj = newObj` | `reactive` 不能替换，`ref` 可以 |
| 批量添加属性 | 逐个 `Vue.set()` | 直接 `Object.assign()` |

### 八、总结

- **Vue 2 中**，`Vue.set()` / `this.$set()` 是解决响应式系统无法检测属性新增/删除的关键 API，必须使用它来确保动态添加的属性具有响应性。
- **Vue 3 中**，基于 `Proxy` 的响应式系统已经可以自动检测所有属性的增删改操作，`set` 已被移除，不再需要。
- **最佳实践**：无论是哪个版本，都应尽量在对象初始化时声明所有需要的属性，这样代码可读性更好，类型推导也更准确。
- **跨版本兼容**：如果你在编写需要同时支持 Vue 2 和 Vue 3 的库，使用 `vue-demi` 提供的 `set` 来保证兼容性。
- **Vue 3 替代方案**：对于需要整体替换的场景，使用 `ref()` 代替 `reactive()`；对于属性级别的操作，直接赋值即可。

```ts
// Vue 3 中处理动态属性的核心原则
import { reactive, ref } from 'vue'

// 1. 能提前声明的，就提前声明
const state = reactive({
  name: '',
  age: 0,
  email: ''  // 提前声明，即使为空
})

// 2. 需要动态添加的，直接赋值（Vue 3 完全支持）
state.newProp = 'value'

// 3. 需要整体替换的，用 ref
const data = ref({ name: 'Alice' })
data.value = { name: 'Bob' } // 完全替换，响应式正常
```
