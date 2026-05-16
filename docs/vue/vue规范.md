# Vue 开发规范完全指南

> 本文档基于 Vue 官方风格指南，结合业界最佳实践整理而成，涵盖 Vue 2/3 开发的方方面面。

## 目录

- [一、命名规范](#一命名规范)
- [二、组件开发规范](#二组件开发规范)
- [三、模板语法规范](#三模板语法规范)
- [四、响应式数据规范](#四响应式数据规范)
- [五、组件通信规范](#五组件通信规范)
- [六、生命周期规范](#六生命周期规范)
- [七、指令使用规范](#七指令使用规范)
- [八、样式开发规范](#八样式开发规范)
- [九、项目结构规范](#九项目结构规范)
- [十、Composition API 规范](#十composition-api-规范)
- [十一、路由开发规范](#十一路由开发规范)
- [十二、状态管理规范](#十二状态管理规范)
- [十三、性能优化规范](#十三性能优化规范)
- [十四、TypeScript 规范](#十四typescript-规范)
- [十五、测试规范](#十五测试规范)
- [十六、安全规范](#十六安全规范)
- [十七、错误处理规范](#十七错误处理规范)
- [十八、可访问性规范](#十八可访问性规范)

---

## 一、命名规范

### 1.1 文件命名规范

#### 单文件组件（.vue）文件名

**规则**：组件文件名应该始终是多个单词，避免与 HTML 标签冲突。

```bash
# ✅ 推荐：PascalCase（大驼峰）
UserProfile.vue
SettingsPanel.vue
DataTable.vue
ModalDialog.vue

# ❌ 避免：单个单词
Button.vue    # 与 HTML button 元素冲突
Table.vue     # 与 HTML table 元素冲突
Form.vue      # 与 HTML form 元素冲突

# ❌ 避免：其他命名格式
userProfile.vue      # 小驼峰
user_profile.vue     # 蛇形命名
user-profile.vue     # 短横线命名
```

**原因**：
- PascalCase 是组件的标准命名方式
- 多个单词可以避免与原生 HTML 标签冲突
- 提高代码可读性

#### 其他文件命名

```bash
# 工具函数文件：kebab-case
format-date.js
request-helper.js
dom-utils.js

# 组合式函数：use 前缀，小驼峰
useMouse.js
useLocalStorage.js
useDebounce.js

# API 文件：kebab-case
user-api.js
product-service.js

# 常量文件：kebab-case
user-constants.js
api-config.js
```

### 1.2 组件名称规范

#### 组件注册名称

**规则**：组件注册时使用 PascalCase 格式。

```javascript
// ✅ 推荐
export default {
  name: 'UserProfile',
  components: {
    SettingsPanel,
    DataTable,
    ModalDialog
  }
}

// ❌ 避免
export default {
  name: 'user-profile',     // 蛇形命名
  components: {
    'settings-panel': SettingsPanel  // 字符串形式
  }
}
```

#### 模板中使用组件

**规则**：在模板中推荐使用 kebab-case（短横线命名）引用组件。

```vue
<template>
  <!-- ✅ 推荐：kebab-case -->
  <user-profile />
  <settings-panel />
  <data-table />

  <!-- ⚠️ 允许但不推荐：PascalCase -->
  <UserProfile />
  <SettingsPanel />
</template>
```

**选择建议**：
- **JS/JSX 中**：使用 PascalCase（与 JS 类命名一致）
- **模板中**：推荐 kebab-case（符合 HTML 规范）
- **自闭合组件**：使用 `<component />` 而非 `<component></component>`

### 1.3 变量命名规范

```javascript
// ✅ 组件内变量：小驼峰
data() {
  return {
    userName: '',
    isActive: false,
    userId: null
  }
}

// ✅ 常量：全大写，下划线分隔
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3

// ✅ 私有变量（内部使用）：下划线前缀
data() {
  return {
    _internalState: null,
    _cache: new Map()
  }
}

// ✅ 布尔值：is/has/can 前缀
data() {
  return {
    isLoading: false,
    hasError: false,
    canEdit: true,
    isVisible: true
  }
}

// ❌ 避免
data() {
  return {
    loading: false,      // 应该是 isLoading
    error: null,         // 应该是 hasError
    editable: true       // 应该是 canEdit
  }
}
```

### 1.4 事件命名规范

**规则**：事件名使用 kebab-case，且始终以动词开头。

```javascript
// ✅ 推荐：动词开头，kebab-case
this.$emit('update-value')
this.$emit('submit-form')
this.$emit('cancel-edit')
this.$emit('item-click')

// ❌ 避免
this.$emit('updateValue')     // 应该使用 kebab-case
this.$emit('valueUpdated')    // 应该使用主动语态
this.$emit('click')           // 过于通用，容易冲突
```

**常用事件动词**：
| 动词 | 含义 | 示例 |
|------|------|------|
| `update` | 更新数据 | `update:user` |
| `submit` | 提交表单 | `submit:form` |
| `cancel` | 取消操作 | `cancel:edit` |
| `delete` | 删除项目 | `delete:item` |
| `select` | 选择项目 | `select:option` |
| `change` | 状态改变 | `change:status` |
| `close` | 关闭弹窗 | `close:modal` |

### 1.5 CSS 类名规范

**规则**：使用 BEM（Block Element Modifier）命名方法论。

```css
/* ✅ BEM 命名 */
.block { }
.block__element { }
.block--modifier { }

/* 示例：按钮组件 */
.button { }                    /* Block */
.button__icon { }              /* Element */
.button__text { }              /* Element */
.button--primary { }           /* Modifier */
.button--large { }             /* Modifier */
.button--disabled { }          /* Modifier */

/* 实际应用 */
<template>
  <button class="button button--primary button--large">
    <span class="button__icon">🔍</span>
    <span class="button__text">搜索</span>
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
}

.button--primary {
  background-color: #007bff;
  color: white;
}

.button--large {
  padding: 12px 24px;
  font-size: 16px;
}

.button__icon {
  margin-right: 8px;
}

.button__text {
  font-weight: 500;
}
</style>
```

---

## 二、组件开发规范

### 2.1 组件定义规范

#### 组件选项顺序

**规则**：按照特定顺序组织组件选项，提高代码可读性。

```javascript
export default {
  // 1. 组件标识
  name: 'ComponentName',

  // 2. 依赖注入
  inject: [],

  // 3. 组件混入、扩展
  mixins: [],
  extends: '',

  // 4. 组件配置
  components: {},
  provide: {},

  // 5. Props 定义
  props: {},

  // 6. 数据
  data() {
    return {}
  },

  // 7. 计算属性
  computed: {},

  // 8. 侦听器
  watch: {},

  // 9. 生命周期钩子（按执行顺序）
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  deactivated() {},
  beforeUnmount() {},
  unmounted() {},

  // 10. 方法
  methods: {},

  // 11. 模板相关
  template: '',
  render() {}
}
```

### 2.2 Props 定义规范

**规则**：Props 应该详细定义，包括类型、默认值和验证。

#### 基础类型定义

```javascript
export default {
  props: {
    // ✅ 简单类型
    title: {
      type: String,
      required: true
    },

    // ✅ 带默认值
    count: {
      type: Number,
      default: 0
    },

    // ✅ 对象默认值必须使用函数
    user: {
      type: Object,
      default: () => ({
        name: '',
        age: 0
      })
    },

    // ✅ 数组默认值必须使用函数
    items: {
      type: Array,
      default: () => []
    },

    // ✅ 函数类型
    callback: {
      type: Function,
      default: null
    },

    // ✅ 自定义验证
    status: {
      type: String,
      default: 'active',
      validator: (value) => {
        return ['active', 'inactive', 'pending'].includes(value)
      }
    },

    // ✅ 多种类型
    value: {
      type: [String, Number],
      default: ''
    }
  }
}
```

#### Props 命名规范

```javascript
export default {
  props: {
    // ✅ 在 JS 中使用 camelCase
    userName: String,
    isActive: Boolean,
    maxCount: Number,

    // ❌ 避免：使用其他命名方式
    user_name: String,  // 应该是 camelCase
    UserName: String,   // 应该是 camelCase
  }
}
```

```vue
<!-- 在模板中使用（自动转换为 kebab-case） -->
<template>
  <!-- 父组件传递 -->
  <child-component
    :user-name="name"
    :is-active="active"
    :max-count="count"
  />
</template>
```

#### Props 修改原则

**规则**：不要在子组件中直接修改 props。

```javascript
export default {
  props: {
    initialValue: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      // ✅ 正确：使用本地数据
      localValue: this.initialValue
    }
  },
  computed: {
    // ✅ 正确：使用计算属性
    doubledValue() {
      return this.initialValue * 2
    }
  },
  methods: {
    // ❌ 错误：直接修改 prop
    updateValue() {
      this.initialValue = 10  // 不允许！
    },

    // ✅ 正确：通过事件通知父组件
    requestUpdate(newValue) {
      this.$emit('update:initialValue', newValue)
    }
  }
}
```

### 2.3 组件模板规范

#### 根元素规范

**Vue 2**：组件模板必须有唯一的根元素。

```vue
<!-- ✅ Vue 2 正确：单个根元素 -->
<template>
  <div class="wrapper">
    <h1>{{ title }}</h1>
    <p>{{ content }}</p>
  </div>
</template>

<!-- ❌ Vue 2 错误：多个根元素 -->
<template>
  <h1>{{ title }}</h1>
  <p>{{ content }}</p>
</template>
```

**Vue 3**：支持多个根元素（Fragment）。

```vue
<!-- ✅ Vue 3 正确：多个根元素 -->
<template>
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</template>
```

#### 插槽使用规范

```vue
<!-- 父组件 -->
<template>
  <base-layout>
    <!-- 具名插槽 -->
    <template #header>
      <h1>页面标题</h1>
    </template>

    <!-- 默认插槽 -->
    <p>主要内容</p>

    <!-- 作用域插槽 -->
    <template #default="{ item, index }">
      <span>{{ index }}: {{ item.name }}</span>
    </template>

    <template #footer>
      <p>页脚信息</p>
    </template>
  </base-layout>
</template>

<!-- 子组件 -->
<template>
  <div class="layout">
    <header>
      <slot name="header">
        <h1>默认标题</h1>  <!-- 后备内容 -->
      </slot>
    </header>

    <main>
      <slot></slot>
    </main>

    <footer>
      <slot name="footer"></slot>
    </footer>
  </div>
</template>
```

#### 模板表达式

**规则**：保持模板表达式简单，复杂逻辑移到计算属性或方法中。

```vue
<template>
  <!-- ✅ 推荐：简单的表达式 -->
  <div>{{ title }}</div>
  <div>{{ count + 1 }}</div>
  <div>{{ isActive ? '是' : '否' }}</div>

  <!-- ❌ 避免：复杂的表达式 -->
  <div>{{ fullName.split(' ').map(n => n[0].toUpperCase() + n.slice(1)).join(' ') }}</div>

  <!-- ✅ 推荐：使用计算属性 -->
  <div>{{ formattedFullName }}</div>
</template>

<script>
export default {
  computed: {
    formattedFullName() {
      return this.fullName
        .split(' ')
        .map(n => n[0].toUpperCase() + n.slice(1))
        .join(' ')
    }
  }
}
</script>
```

### 2.4 组件复用规范

#### 基础组件 vs 业务组件

```bash
# 目录结构
components/
├── base/              # 基础组件（高复用、与业务无关）
│   ├── BaseButton.vue
│   ├── BaseInput.vue
│   ├── BaseModal.vue
│   └── BaseTable.vue
└── business/          # 业务组件（特定业务场景）
    ├── UserCard.vue
    ├── ProductList.vue
    └── OrderForm.vue
```

**基础组件特征**：
- 高度可复用
- 不包含业务逻辑
- 通过 props 定制行为
- 命名带 Base 前缀

```vue
<!-- components/base/BaseButton.vue -->
<template>
  <button
    :class="[
      'base-button',
      `base-button--${type}`,
      `base-button--${size}`,
      { 'base-button--disabled': disabled }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'danger', 'success'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick(event) {
      if (!this.disabled) {
        this.$emit('click', event)
      }
    }
  }
}
</script>
```

---

## 三、模板语法规范

### 3.1 v-for 规范

#### 必须使用 key

**规则**：v-for 必须配合唯一的 key 使用，且 key 应该使用稳定的标识符。

```vue
<template>
  <!-- ✅ 推荐：使用唯一 ID -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>

  <!-- ✅ 对象遍历：使用唯一键 -->
  <div v-for="(value, key) in object" :key="key">
    {{ key }}: {{ value }}
  </div>

  <!-- ⚠️ 谨慎使用：索引作为 key（仅当列表静态时） -->
  <li v-for="(item, index) in staticList" :key="index">
    {{ item }}
  </li>

  <!-- ❌ 避免：不使用 key -->
  <li v-for="item in items">
    {{ item.name }}
  </li>
</template>
```

**为什么不推荐用 index 作为 key**：
- 当列表顺序变化时，index 会导致不必要的重新渲染
- 可能导致组件状态错乱（如输入框内容）
- 性能优化效果下降

#### v-for 遍历范围

```vue
<template>
  <!-- 遍历数组 -->
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>

  <!-- 遍历数组（带索引） -->
  <li v-for="(item, index) in items" :key="item.id">
    {{ index }} - {{ item.name }}
  </li>

  <!-- 遍历对象 -->
  <div v-for="(value, key) in object" :key="key">
    {{ key }}: {{ value }}
  </div>

  <!-- 遍历对象（带索引） -->
  <div v-for="(value, key, index) in object" :key="key">
    {{ index }}. {{ key }}: {{ value }}
  </div>

  <!-- 遍历数字 -->
  <span v-for="n in 10" :key="n">{{ n }}</span>
</template>
```

### 3.2 v-if 规范

#### v-if vs v-show

| 特性 | v-if | v-show |
|------|------|--------|
| 初始渲染成本 | 较低（条件为假时不渲染） | 较高（始终渲染） |
| 切换成本 | 较高（需要销毁/重建） | 较低（仅切换 display） |
| 生命周期 | 会触发组件生命周期 | 不会触发 |
| 适用场景 | 条件很少改变 | 频繁切换 |

```vue
<template>
  <!-- ✅ v-if：条件很少改变 -->
  <div v-if="isLoggedIn">
    欢迎，{{ userName }}
  </div>

  <!-- ✅ v-show：频繁切换 -->
  <div v-show="isModalVisible">
    弹窗内容
  </div>

  <!-- ✅ v-else-if -->
  <div v-if="status === 'loading'">加载中...</div>
  <div v-else-if="status === 'error'">加载失败</div>
  <div v-else-if="status === 'empty'">暂无数据</div>
  <div v-else>数据内容</div>
</template>
```

#### v-if 与 v-for 优先级

**Vue 2**：v-for 优先级高于 v-if

**Vue 3**：v-if 优先级高于 v-for

**最佳实践**：永远不要在同一元素上同时使用 v-if 和 v-for。

```vue
<template>
  <!-- ❌ 避免：同一元素使用 v-if 和 v-for -->
  <li v-for="user in users" v-if="user.isActive" :key="user.id">
    {{ user.name }}
  </li>

  <!-- ✅ 方案1：使用计算属性过滤 -->
  <template v-for="user in activeUsers" :key="user.id">
    <li>{{ user.name }}</li>
  </template>

  <!-- ✅ 方案2：使用 template 标签 -->
  <template v-for="user in users" :key="user.id">
    <li v-if="user.isActive">{{ user.name }}</li>
  </template>

  <!-- ✅ 方案3：在外层包裹 -->
  <template v-for="user in users" :key="user.id">
    <li v-show="user.isActive">{{ user.name }}</li>
  </template>
</template>

<script>
export default {
  computed: {
    // 推荐：使用计算属性过滤
    activeUsers() {
      return this.users.filter(user => user.isActive)
    }
  }
}
</script>
```

### 3.3 属性绑定规范

#### class 绑定

```vue
<template>
  <!-- 字符串形式 -->
  <div class="static-class">内容</div>

  <!-- 对象形式 -->
  <div :class="{ active: isActive, disabled: isDisabled }">
    内容
  </div>

  <!-- 数组形式 -->
  <div :class="['static-class', dynamicClass]">
    内容
  </div>

  <!-- 混合形式 -->
  <div :class="[
    'static-class',
    { active: isActive },
    dynamicClass
  ]">
    内容
  </div>

  <!-- 计算属性 -->
  <div :class="classObject">内容</div>
</template>

<script>
export default {
  computed: {
    classObject() {
      return {
        active: this.isActive,
        disabled: this.isDisabled,
        'has-error': this.hasError
      }
    }
  }
}
</script>
```

#### style 绑定

```vue
<template>
  <!-- 对象形式 -->
  <div :style="{ color: activeColor, fontSize: fontSize + 'px' }">
    内容
  </div>

  <!-- 绑定样式对象 -->
  <div :style="styleObject">内容</div>

  <!-- 数组形式（多个样式对象） -->
  <div :style="[baseStyles, overridingStyles]">
    内容
  </div>

  <!-- 自动添加前缀 -->
  <div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }">
    内容
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeColor: 'red',
      fontSize: 14,
      styleObject: {
        color: 'red',
        fontSize: '14px'
      },
      baseStyles: {
        color: 'blue',
        fontSize: '16px'
      },
      overridingStyles: {
        fontWeight: 'bold'
      }
    }
  }
}
</script>
```

### 3.4 事件绑定规范

#### 事件修饰符

```vue
<template>
  <!-- 阻止默认行为 -->
  <form @submit.prevent="handleSubmit">
    <button type="submit">提交</button>
  </form>

  <!-- 阻止事件冒泡 -->
  <div @click="handleParentClick">
    <button @click.stop="handleChildClick">子按钮</button>
  </div>

  <!-- 只触发一次 -->
  <button @click.once="handleClick">点击</button>

  <!-- 按键修饰符 -->
  <input @keyup.enter="submit" />
  <input @keyup.ctrl.enter="submit" />

  <!-- 修饰符组合 -->
  <input @keyup.ctrl.enter.prevent="handleSubmit" />

  <!-- 鼠标修饰符 -->
  <div @click.left="handleLeftClick">左键点击</div>
  <div @click.right.prevent="handleRightClick">右键点击</div>

  <!-- 精确修饰符 -->
  <button @click.ctrl.exact="onCtrlClick">精确 Ctrl 点击</button>
</template>
```

#### 按键别名

| 别名 | 对应按键 |
|------|----------|
| `.enter` | Enter |
| `.tab` | Tab |
| `.delete` | Delete / Backspace |
| `.esc` | Esc |
| `.space` | Space |
| `.up` | 上箭头 |
| `.down` | 下箭头 |
| `.left` | 左箭头 |
| `.right` | 右箭头 |

### 3.5 表单输入绑定

#### 基础用法

```vue
<template>
  <!-- 文本输入 -->
  <input v-model="message" placeholder="请输入消息" />

  <!-- 多行文本 -->
  <textarea v-model="message" rows="3" />

  <!-- 复选框 - 单个 -->
  <input type="checkbox" id="checkbox" v-model="checked" />
  <label for="checkbox">{{ checked }}</label>

  <!-- 复选框 - 多个（绑定到数组） -->
  <input type="checkbox" id="jack" value="Jack" v-model="checkedNames" />
  <label for="jack">Jack</label>

  <input type="checkbox" id="john" value="John" v-model="checkedNames" />
  <label for="john">John</label>

  <input type="checkbox" id="mike" value="Mike" v-model="checkedNames" />
  <label for="mike">Mike</label>

  <!-- 单选按钮 -->
  <input type="radio" id="one" value="One" v-model="picked" />
  <label for="one">One</label>

  <input type="radio" id="two" value="Two" v-model="picked" />
  <label for="two">Two</label>

  <!-- 选择框 - 单选 -->
  <select v-model="selected">
    <option disabled value="">请选择</option>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>

  <!-- 选择框 - 多选 -->
  <select v-model="selectedMultiple" multiple>
    <option>A</option>
    <option>B</option>
    <option>C</option>
  </select>
</template>

<script>
export default {
  data() {
    return {
      message: '',
      checked: false,
      checkedNames: [],
      picked: '',
      selected: '',
      selectedMultiple: []
    }
  }
}
</script>
```

#### 修饰符

```vue
<template>
  <!-- .lazy：失去焦点或按回车时更新 -->
  <input v-model.lazy="message" />

  <!-- .number：自动转换为数字 -->
  <input v-model.number="age" type="number" />

  <!-- .trim：自动去除首尾空格 -->
  <input v-model.trim="message" />

  <!-- 组合使用 -->
  <input v-model.trim.lazy="username" />
</template>
```

---

## 四、响应式数据规范

### 4.1 data 函数规范

**规则**：组件的 data 必须是一个函数，返回一个新对象。

```javascript
// ✅ 正确：data 是函数
export default {
  data() {
    return {
      count: 0,
      message: 'Hello',
      user: {
        name: '',
        age: 0
      }
    }
  }
}

// ❌ 错误：data 是对象（会导致多个组件实例共享数据）
export default {
  data: {
    count: 0,
    message: 'Hello'
  }
}
```

**原因**：
- Vue 组件可能被多次实例化
- 使用函数可以确保每个实例有独立的数据副本
- 避免数据污染和状态混乱

### 4.2 响应式限制与解决

#### Vue 2 响应式限制

**问题**：Vue 2 使用 Object.defineProperty，有以下限制：

1. 无法检测对象属性的添加/删除
2. 无法检测数组索引和长度的变化

```javascript
export default {
  data() {
    return {
      user: {
        name: 'John'
      },
      items: ['a', 'b', 'c']
    }
  },
  methods: {
    // ❌ 不是响应式的
    addAge() {
      this.user.age = 25  // 不会触发视图更新
    },
    removeName() {
      delete this.user.name  // 不会触发视图更新
    },
    changeByIndex() {
      this.items[0] = 'x'  // 不会触发视图更新
    },
    changeLength() {
      this.items.length = 0  // 不会触发视图更新
    },

    // ✅ 响应式的解决方案
    addAgeRight() {
      this.$set(this.user, 'age', 25)
      // 或
      Vue.set(this.user, 'age', 25)
    },
    removeNameRight() {
      this.$delete(this.user, 'name')
      // 或
      Vue.delete(this.user, 'name')
    },
    changeByIndexRight() {
      this.$set(this.items, 0, 'x')
      // 或
      this.items.splice(0, 1, 'x')
    },
    changeLengthRight() {
      this.items.splice(0)  // 清空数组
    }
  }
}
```

#### Vue 3 响应式改进

**Vue 3** 使用 Proxy，解决了 Vue 2 的限制：

```javascript
import { reactive } from 'vue'

export default {
  setup() {
    const state = reactive({
      user: { name: 'John' },
      items: ['a', 'b', 'c']
    })

    // ✅ 都是响应式的
    state.user.age = 25           // 添加属性
    delete state.user.name        // 删除属性
    state.items[0] = 'x'          // 修改索引
    state.items.length = 0        // 修改长度

    return { state }
  }
}
```

### 4.3 响应式 API 选择

#### ref vs reactive

| 特性 | ref | reactive |
|------|-----|----------|
| 使用场景 | 基本类型、需要替换整个对象 | 对象、数组 |
| 访问方式 | 需要 `.value` | 直接访问属性 |
| 重新赋值 | 支持 | 不支持 |
| 解构 | 需要 `toRefs()` | 需要 `toRefs()` |

```javascript
import { ref, reactive, toRefs } from 'vue'

export default {
  setup() {
    // ✅ ref：基本类型
    const count = ref(0)
    const message = ref('Hello')
    const isActive = ref(false)

    // 访问和修改
    console.log(count.value)  // 0
    count.value++

    // ✅ ref：需要替换整个对象
    const user = ref({ name: 'John', age: 25 })
    user.value = { name: 'Jane', age: 30 }  // 可以替换整个对象

    // ✅ reactive：对象（不需要替换整个对象）
    const state = reactive({
      count: 0,
      user: { name: 'John' },
      items: ['a', 'b', 'c']
    })

    // 直接访问和修改
    state.count++
    state.user.name = 'Jane'
    state.items.push('d')

    // ❌ 不能替换整个对象
    // state = {}  // 错误！

    // ✅ 使用 toRefs 解构
    const { count, user } = toRefs(state)
    console.log(count.value)   // 0
    console.log(user.value.name)  // 'John'

    return {
      count,
      message,
      isActive,
      user,
      state
    }
  }
}
```

#### 选择建议

```javascript
import { ref, reactive } from 'vue'

// ✅ 使用 ref 的场景
export default {
  setup() {
    // 1. 基本类型
    const count = ref(0)
    const name = ref('')

    // 2. 需要替换整个对象
    const config = ref({
      theme: 'light',
      lang: 'zh-CN'
    })

    // 3. 单一值对象
    const formData = ref({
      username: '',
      password: ''
    })

    return { count, name, config, formData }
  }
}

// ✅ 使用 reactive 的场景
export default {
  setup() {
    // 1. 复杂的状态对象（多个相关属性）
    const state = reactive({
      isLoading: false,
      error: null,
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      }
    })

    // 2. 表单状态（多个字段）
    const form = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    // 3. 列表管理状态
    const listState = reactive({
      items: [],
      selectedItems: new Set(),
      filters: {},
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })

    return { state, form, listState }
  }
}
```

### 4.4 计算属性规范

#### 基础用法

```javascript
export default {
  data() {
    return {
      firstName: 'John',
      lastName: 'Doe',
      items: [
        { id: 1, name: 'Item 1', active: true },
        { id: 2, name: 'Item 2', active: false },
        { id: 3, name: 'Item 3', active: true }
      ]
    }
  },
  computed: {
    // ✅ 只读计算属性（简写形式）
    fullName() {
      return this.firstName + ' ' + this.lastName
    },

    // ✅ 带过滤的计算属性
    activeItems() {
      return this.items.filter(item => item.active)
    },

    // ✅ 可读写计算属性（完整形式）
    fullNameReadWrite: {
      get() {
        return this.firstName + ' ' + this.lastName
      },
      set(newValue) {
        const names = newValue.split(' ')
        this.firstName = names[0]
        this.lastName = names[names.length - 1]
      }
    }
  }
}
```

#### 计算属性 vs 方法

```javascript
export default {
  data() {
    return {
      firstName: 'John',
      lastName: 'Doe',
      count: 0
    }
  },
  computed: {
    // ✅ 计算属性：有缓存，依赖不变不会重新计算
    fullName() {
      console.log('计算 fullName')
      return this.firstName + ' ' + this.lastName
    }
  },
  methods: {
    // ❌ 方法：每次调用都执行，没有缓存
    fullNameMethod() {
      console.log('执行 fullNameMethod')
      return this.firstName + ' ' + this.lastName
    }
  },
  mounted() {
    // 计算属性：只计算一次（有缓存）
    console.log(this.fullName)
    console.log(this.fullName)
    console.log(this.fullName)

    // 方法：每次都执行
    console.log(this.fullNameMethod())
    console.log(this.fullNameMethod())
    console.log(this.fullNameMethod())
  }
}
```

**选择建议**：

| 场景 | 推荐使用 |
|------|----------|
| 派生数据 | 计算属性 |
| 需要缓存 | 计算属性 |
| 需要传参 | 方法 |
| 事件处理 | 方法 |

#### 计算属性最佳实践

```javascript
export default {
  data() {
    return {
      users: [
        { id: 1, name: 'John', age: 25, active: true },
        { id: 2, name: 'Jane', age: 30, active: false },
        { id: 3, name: 'Bob', age: 35, active: true }
      ],
      filterText: '',
      sortBy: 'age',
      sortOrder = 'asc'
    }
  },
  computed: {
    // ✅ 计算属性可以链式调用
    filteredUsers() {
      return this.users.filter(user =>
        user.name.toLowerCase().includes(this.filterText.toLowerCase())
      )
    },

    // ✅ 基于其他计算属性
    sortedUsers() {
      const sorted = [...this.filteredUsers]
      sorted.sort((a, b) => {
        const aVal = a[this.sortBy]
        const bVal = b[this.sortBy]
        const order = this.sortOrder === 'asc' ? 1 : -1
        return (aVal - bVal) * order
      })
      return sorted
    },

    // ✅ 计算属性返回格式化数据
    userSummary() {
      return {
        total: this.users.length,
        active: this.users.filter(u => u.active).length,
        inactive: this.users.filter(u => !u.active).length,
        averageAge: this.users.reduce((sum, u) => sum + u.age, 0) / this.users.length
      }
    }
  }
}
```

### 4.5 侦听器规范

#### 基础用法

```javascript
export default {
  data() {
    return {
      question: '',
      answer: 'Questions usually contain a question mark. ;-)',
      user: {
        name: 'John',
        profile: {
          age: 25
        }
      }
    }
  },
  watch: {
    // ✅ 简单侦听
    question(newValue, oldValue) {
      if (newValue.indexOf('?') > -1) {
        this.getAnswer()
      }
    },

    // ✅ 侦听对象（deep 选项）
    user: {
      handler(newValue, oldValue) {
        console.log('user changed', newValue)
      },
      deep: true  // 深度侦听
    },

    // ✅ 侦听对象单个属性（字符串形式）
    'user.name'(newValue, oldValue) {
      console.log('name changed from', oldValue, 'to', newValue)
    },

    // ✅ 立即执行（immediate 选项）
    answer: {
      handler(newValue) {
        console.log('answer is', newValue)
      },
      immediate: true  // 立即执行一次
    },

    // ✅ 组合使用
    'user.profile.age': {
      handler(newValue, oldValue) {
        console.log('age changed')
      },
      immediate: true
    }
  },
  methods: {
    async getAnswer() {
      this.answer = 'Thinking...'
      try {
        const res = await fetch('https://yesno.wtf/api')
        this.answer = (await res.json()).answer
      } catch (error) {
        this.answer = 'Error! Could not reach the API. ' + error
      }
    }
  }
}
```

#### Vue 3 watch API

```javascript
import { ref, reactive, watch, watchEffect } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const state = reactive({
      name: 'John',
      age: 25
    })

    // ✅ watch ref
    watch(count, (newValue, oldValue) => {
      console.log(`count changed from ${oldValue} to ${newValue}`)
    })

    // ✅ watch reactive 的单个属性（函数形式）
    watch(() => state.name, (newValue, oldValue) => {
      console.log(`name changed from ${oldValue} to ${newValue}`)
    })

    // ✅ watch 多个来源
    watch([count, () => state.name], ([newCount, newName], [oldCount, oldName]) => {
      console.log(`count: ${oldCount} -> ${newCount}, name: ${oldName} -> ${newName}`)
    })

    // ✅ watchEffect（自动追踪依赖）
    watchEffect(() => {
      console.log(`count is ${count.value}, name is ${state.name}`)
    })

    // ✅ watch 选项
    watch(
      () => state.name,
      (newValue, oldValue) => {
        console.log('name changed')
      },
      {
        deep: true,      // 深度侦听
        immediate: true, // 立即执行
        flush: 'post'    // 调整刷新时机（'pre' | 'post' | 'sync'）
      }
    )

    return { count, state }
  }
}
```

---

## 五、组件通信规范

### 5.1 Props down, Events up

**核心原则**：单向数据流，父组件向子组件传递 props，子组件通过事件通知父组件。

#### 父传子（Props）

```vue
<!-- 父组件 Parent.vue -->
<template>
  <div class="parent">
    <h2>父组件</h2>
    <p>计数：{{ parentCount }}</p>

    <!-- 传递数据给子组件 -->
    <child-component
      :initial-count="parentCount"
      :title="parentTitle"
      :config="parentConfig"
      @increment="handleIncrement"
      @reset="handleReset"
    />
  </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  name: 'ParentComponent',
  components: {
    ChildComponent
  },
  data() {
    return {
      parentCount: 0,
      parentTitle: '父组件标题',
      parentConfig: {
        max: 100,
        min: 0,
        step: 1
      }
    }
  },
  methods: {
    handleIncrement(value) {
      this.parentCount = value
    },
    handleReset() {
      this.parentCount = 0
    }
  }
}
</script>

<!-- 子组件 ChildComponent.vue -->
<template>
  <div class="child">
    <h3>子组件</h3>
    <p>接收的计数：{{ initialCount }}</p>
    <p>接收的标题：{{ title }}</p>
    <button @click="increment">增加</button>
    <button @click="reset">重置</button>
  </div>
</template>

<script>
export default {
  name: 'ChildComponent',
  props: {
    initialCount: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      default: '默认标题'
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    increment() {
      // 不直接修改 prop，通过事件通知父组件
      this.$emit('increment', this.initialCount + (this.config.step || 1))
    },
    reset() {
      this.$emit('reset')
    }
  }
}
</script>
```

#### 子传父（Events）

```vue
<!-- 子组件表单 InputForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <input
      v-model="formData.username"
      type="text"
      placeholder="用户名"
    />
    <input
      v-model="formData.email"
      type="email"
      placeholder="邮箱"
    />
    <button type="submit">提交</button>
  </form>
</template>

<script>
export default {
  name: 'InputForm',
  data() {
    return {
      formData: {
        username: '',
        email: ''
      }
    }
  },
  methods: {
    handleSubmit() {
      // 验证数据
      if (!this.formData.username || !this.formData.email) {
        this.$emit('error', '请填写完整信息')
        return
      }

      // 提交数据
      this.$emit('submit', {
        ...this.formData,
        timestamp: Date.now()
      })

      // 清空表单
      this.formData = {
        username: '',
        email: ''
      }
    }
  }
}
</script>

<!-- 父组件使用 -->
<template>
  <div>
    <input-form
      @submit="handleFormSubmit"
      @error="handleFormError"
    />
    <p v-if="lastSubmit">上次提交：{{ lastSubmit }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script>
import InputForm from './InputForm.vue'

export default {
  components: {
    InputForm
  },
  data() {
    return {
      lastSubmit: null,
      errorMessage: ''
    }
  },
  methods: {
    handleFormSubmit(data) {
      this.lastSubmit = JSON.stringify(data)
      this.errorMessage = ''
      console.log('表单提交：', data)
    },
    handleFormError(message) {
      this.errorMessage = message
    }
  }
}
</script>
```

### 5.2 v-model 双向绑定

#### 自定义组件 v-model（Vue 2）

```vue
<!-- 子组件 CustomInput.vue -->
<template>
  <input
    :value="value"
    @input="$emit('input', $event.target.value)"
  />
</template>

<script>
export default {
  name: 'CustomInput',
  props: {
    value: {
      type: String,
      default: ''
    }
  }
}
</script>

<!-- 使用 -->
<template>
  <custom-input v-model="message" />
  <!-- 等价于 -->
  <custom-input
    :value="message"
    @input="message = $event"
  />
</template>
```

#### 自定义组件 v-model（Vue 3）

```vue
<!-- 子组件 CustomInput.vue -->
<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script>
export default {
  name: 'CustomInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue']
}
</script>

<!-- 使用 -->
<template>
  <custom-input v-model="message" />
  <!-- 等价于 -->
  <custom-input
    :model-value="message"
    @update:model-value="message = $event"
  />
</template>
```

#### 多个 v-model 绑定（Vue 3）

```vue
<!-- 子组件 UserForm.vue -->
<template>
  <div>
    <label>
      名字：
      <input
        :value="firstName"
        @input="$emit('update:firstName', $event.target.value)"
      />
    </label>
    <label>
      姓氏：
      <input
        :value="lastName"
        @input="$emit('update:lastName', $event.target.value)"
      />
    </label>
  </div>
</template>

<script>
export default {
  name: 'UserForm',
  props: {
    firstName: String,
    lastName: String
  },
  emits: ['update:firstName', 'update:lastName']
}
</script>

<!-- 使用 -->
<template>
  <user-form
    v-model:first-name="user.firstName"
    v-model:last-name="user.lastName"
  />
</template>
```

### 5.3 provide/inject

**适用场景**：跨层级组件通信，避免 props 逐层传递。

```javascript
// 祖先组件
export default {
  data() {
    return {
      theme: 'dark',
      userInfo: {
        name: 'John',
        role: 'admin'
      }
    }
  },
  provide() {
    return {
      // 提供静态值
      appName: 'My App',

      // 提供响应式数据
      theme: this.theme,

      // 提供响应式对象
      userInfo: this.userInfo,

      // 提供方法
      updateTheme: this.updateTheme
    }
  },
  methods: {
    updateTheme(newTheme) {
      this.theme = newTheme
    }
  }
}

// 后代组件
export default {
  inject: {
    // 注入静态值
    appName: {
      default: 'Unknown App'
    },

    // 注入响应式数据
    theme: {
      default: 'light'
    },

    // 注入对象
    userInfo: {
      default: () => ({})
    },

    // 注入方法
    updateTheme: {
      default: () => {}
    },

    // 使用别名
    userTheme: {
      from: 'theme',
      default: 'light'
    }
  },
  computed: {
    displayTheme() {
      return `当前主题：${this.theme}`
    }
  }
}
```

#### Vue 3 组合式 API

```javascript
import { provide, inject, reactive, readonly } from 'vue'

// 祖先组件
export default {
  setup() {
    const state = reactive({
      user: null,
      isAuthenticated: false
    })

    // 提供只读状态（防止直接修改）
    provide('authState', readonly(state))

    // 提供方法
    provide('login', async (username, password) => {
      const user = await api.login(username, password)
      state.user = user
      state.isAuthenticated = true
    })

    provide('logout', () => {
      state.user = null
      state.isAuthenticated = false
    })
  }
}

// 后代组件
export default {
  setup() {
    const authState = inject('authState')
    const login = inject('login')
    const logout = inject('logout')

    return {
      authState,
      login,
      logout
    }
  }
}
```

### 5.4 ref / $refs

**适用场景**：父组件直接访问子组件实例或 DOM 元素。

```vue
<!-- 父组件 -->
<template>
  <div>
    <!-- 引用子组件 -->
    <child-component ref="childComp" />

    <!-- 引用 DOM 元素 -->
    <input ref="inputEl" />

    <button @click="focusChild">聚焦子组件输入框</button>
    <button @click="callChildMethod">调用子组件方法</button>
  </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue'

export default {
  components: {
    ChildComponent
  },
  mounted() {
    // 访问 DOM 元素
    console.log(this.$refs.inputEl)  // <input>

    // 访问子组件实例
    console.log(this.$refs.childComp)  // 组件实例
  },
  methods: {
    focusChild() {
      this.$refs.inputEl.focus()
    },
    callChildMethod() {
      this.$refs.childComp.doSomething()
    }
  }
}
</script>

<!-- 子组件 ChildComponent.vue -->
<script>
export default {
  methods: {
    doSomething() {
      console.log('子组件方法被调用')
    }
  }
}
</script>
```

#### Vue 3 模板引用

```vue
<script setup>
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childComp = ref(null)
const inputEl = ref(null)

onMounted(() => {
  console.log(inputEl.value)      // DOM 元素
  console.log(childComp.value)    // 组件实例
})

function focusChild() {
  inputEl.value.focus()
}

function callChildMethod() {
  childComp.value.doSomething()
}

// 子组件需要暴露方法
defineExpose({
  doSomething
})
</script>
```

### 5.5 EventBus（Vue 2）/ mitt（Vue 3）

**适用场景**：兄弟组件或跨层级组件通信。

```javascript
// Vue 2：创建 EventBus
// utils/event-bus.js
import Vue from 'vue'
export const EventBus = new Vue()

// 组件 A：发送事件
import { EventBus } from '@/utils/event-bus'

export default {
  methods: {
    sendMessage() {
      EventBus.$emit('message-sent', { text: 'Hello' })
    }
  },
  beforeDestroy() {
    // 组件销毁前取消监听
    EventBus.$off('message-sent')
  }
}

// 组件 B：监听事件
import { EventBus } from '@/utils/event-bus'

export default {
  created() {
    EventBus.$on('message-sent', (data) => {
      console.log('收到消息：', data)
    })
  },
  beforeDestroy() {
    EventBus.$off('message-sent')
  }
}
```

```javascript
// Vue 3：使用 mitt（推荐）
// npm install mitt

// utils/event-bus.js
import mitt from 'mitt'
export const EventBus = mitt()

// 组件 A：发送事件
import { EventBus } from '@/utils/event-bus'

export default {
  methods: {
    sendMessage() {
      EventBus.emit('message-sent', { text: 'Hello' })
    }
  }
}

// 组件 B：监听事件
import { EventBus } from '@/utils/event-bus'

export default {
  mounted() {
    EventBus.on('message-sent', (data) => {
      console.log('收到消息：', data)
    })
  },
  beforeUnmount() {
    EventBus.off('message-sent')
  }
}
```

### 5.6 Vuex / Pinia 状态管理

**适用场景**：大型应用、多个组件共享复杂状态。

详见 [十二、状态管理规范](#十二状态管理规范)

---

## 六、生命周期规范

### 6.1 Vue 2 生命周期

```
创建阶段：
  beforeCreate → created

挂载阶段：
  beforeMount → mounted

更新阶段：
  beforeUpdate → updated

销毁阶段：
  beforeDestroy → destroyed

激活阶段（keep-alive）：
  activated → deactivated
```

### 6.2 Vue 3 生命周期

```
创建阶段：
  beforeCreate → created

挂载阶段：
  beforeMount → mounted

更新阶段：
  beforeUpdate → updated

卸载阶段：
  beforeUnmount → unmounted

激活阶段（keep-alive）：
  activated → deactivated

新增（Composition API）：
  onBeforeMount → onMounted → onBeforeUpdate → onUpdated
  → onBeforeUnmount → onUnmounted
  → onActivated → onDeactivated
  → onErrorCaptured
```

### 6.3 生命周期对比

| Vue 2 | Vue 3 Options API | Vue 3 Composition API | 说明 |
|-------|-------------------|----------------------|------|
| beforeCreate | beforeCreate | setup() | 实例初始化后 |
| created | created | setup() | 实例创建完成 |
| beforeMount | beforeMount | onBeforeMount | DOM 挂载前 |
| mounted | mounted | onMounted | DOM 挂载完成 |
| beforeUpdate | beforeUpdate | onBeforeUpdate | 数据更新前 |
| updated | updated | onUpdated | 数据更新后 |
| beforeDestroy | beforeUnmount | onBeforeUnmount | 实例销毁前 |
| destroyed | unmounted | onUnmounted | 实例销毁后 |
| activated | activated | onActivated | keep-alive 激活 |
| deactivated | deactivated | onDeactivated | keep-alive 停用 |
| errorCaptured | errorCaptured | onErrorCaptured | 错误捕获 |

### 6.4 使用场景与示例

```javascript
export default {
  // ========== 创建阶段 ==========
  beforeCreate() {
    // 实例初始化后，数据观测和事件配置之前
    // 此时无法访问 data、methods、computed 等
    console.log('beforeCreate')
  },

  created() {
    // ✅ 适合：
    // - 调用 API 初始化数据
    // - 初始化非响应式数据
    // - 设置定时器
    this.fetchInitialData()
    this.startTime = Date.now()

    // ❌ 不适合：
    // - DOM 操作（DOM 未挂载）
    // - 访问 $el
  },

  // ========== 挂载阶段 ==========
  beforeMount() {
    // DOM 挂载前，render 函数首次被调用
    // 很少使用，因为 created 已经足够
  },

  mounted() {
    // ✅ 适合：
    // - DOM 操作
    // - 初始化第三方库（图表、地图等）
    // - 访问子组件
    this.initChart()
    this.$refs.map.init()

    // 可以访问 $el
    console.log(this.$el)  // DOM 元素
  },

  // ========== 更新阶段 ==========
  beforeUpdate() {
    // 数据更新，DOM 重新渲染前
    // 可以在此进一步更改状态，不会触发重渲染
  },

  updated() {
    // DOM 重新渲染后
    // ⚠️ 避免在此更改状态，可能导致无限循环
    // ✅ 适合：依赖 DOM 更新后的操作
  },

  // ========== 销毁阶段 ==========
  beforeUnmount() {
    // ✅ 适合：
    // - 清理定时器
    // - 解绑事件监听
    // - 销毁第三方实例
    clearInterval(this.timer)
    window.removeEventListener('resize', this.handleResize)
    this.chart.destroy()
  },

  unmounted() {
    // 实例销毁后
    // 所有绑定解除，事件监听移除
  },

  // ========== keep-alive ==========
  activated() {
    // 组件被 keep-alive 激活时调用
    this.refreshData()
  },

  deactivated() {
    // 组件被 keep-alive 停用时调用
    // 可以在此保存状态
  },

  // ========== 错误捕获 ==========
  errorCaptured(err, vm, info) {
    // 捕获来自后代组件的错误
    console.error('Error:', err)
    console.error('Component:', vm)
    console.error('Info:', info)

    // 返回 false 阻止错误继续传播
    return false
  }
}
```

### 6.5 Composition API 生命周期

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured
} from 'vue'

export default {
  setup() {
    // onBeforeXxx：在对应生命周期前执行
    onBeforeMount(() => {
      console.log('组件即将挂载')
    })

    // onMounted：挂载完成后执行
    onMounted(() => {
      console.log('组件已挂载')
      // 可以访问 DOM
      console.log(document.querySelector('.container'))
    })

    // 可以注册多个生命周期钩子
    onMounted(() => {
      console.log('另一个 mounted 钩子')
    })

    // 更新相关
    onBeforeUpdate(() => {
      console.log('数据即将更新')
    })

    onUpdated(() => {
      console.log('DOM 已更新')
    })

    // 卸载相关
    onBeforeUnmount(() => {
      console.log('组件即将卸载')
      // 清理工作
    })

    onUnmounted(() => {
      console.log('组件已卸载')
    })

    // keep-alive 相关
    onActivated(() => {
      console.log('组件被激活')
    })

    onDeactivated(() => {
      console.log('组件被停用')
    })

    // 错误捕获
    onErrorCaptured((err, instance, info) => {
      console.error('捕获到错误：', err)
      return false  // 阻止错误传播
    })

    return {}
  }
}
```

### 6.6 生命周期最佳实践

```javascript
export default {
  data() {
    return {
      timer: null,
      chart: null,
      resizeHandler: null
    }
  },

  created() {
    // ✅ 数据初始化
    this.fetchData()
    this.initForm()
  },

  mounted() {
    // ✅ 初始化需要 DOM 的东西
    this.initChart()
    this.initMap()
    this.addEventListeners()
  },

  beforeUnmount() {
    // ✅ 清理所有资源
    this.clearTimer()
    this.destroyChart()
    this.removeEventListeners()
  },

  methods: {
    // 数据获取
    async fetchData() {
      try {
        const data = await api.getData()
        this.list = data
      } catch (error) {
        this.handleError(error)
      }
    },

    // 图表初始化
    initChart() {
      import('echarts').then(echarts => {
        this.chart = echarts.init(this.$refs.chartContainer)
        this.chart.setOption(this.chartOptions)
      })
    },

    // 事件监听
    addEventListeners() {
      this.resizeHandler = this.handleResize.bind(this)
      window.addEventListener('resize', this.resizeHandler)
    },

    // 清理定时器
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },

    // 销毁图表
    destroyChart() {
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
    },

    // 移除事件监听
    removeEventListeners() {
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler)
        this.resizeHandler = null
      }
    }
  }
}
```

---

## 七、指令使用规范

### 7.1 条件渲染

#### v-if vs v-show

| 特性 | v-if | v-show |
|------|------|--------|
| 初始渲染 | 条件为假时不渲染 | 始终渲染（CSS display） |
| 切换开销 | 大（销毁/重建 DOM） | 小（仅切换 CSS） |
| 生命周期 | 触发组件生命周期 | 不触发 |
| 适用场景 | 条件很少改变 | 频繁切换显示/隐藏 |

```vue
<template>
  <!-- ✅ v-if：条件很少改变 -->
  <div>
    <user-profile v-if="isLoggedIn" />
    <login-form v-else />
  </div>

  <!-- ✅ v-show：频繁切换 -->
  <div>
    <button @click="showModal = !showModal">切换弹窗</button>
    <modal v-show="showModal" />
  </div>

  <!-- ✅ v-if 和 v-else-if -->
  <div>
    <loading-spinner v-if="status === 'loading'" />
    <error-message v-else-if="status === 'error'" />
    <empty-state v-else-if="status === 'empty'" />
    <data-list v-else />
  </div>

  <!-- ✅ v-else -->
  <div>
    <template v-if="isLoggedIn">
      <h1>欢迎回来，{{ userName }}</h1>
    </template>
    <template v-else>
      <h1>请先登录</h1>
    </template>
  </div>
</template>
```

#### v-if 与 key

```vue
<template>
  <!-- ✅ 使用 key 确保元素被完全替换 -->
  <transition>
    <button v-if="isEditing" key="save" @click="save">
      保存
    </button>
    <button v-else key="edit" @click="edit">
      编辑
    </button>
  </transition>

  <!-- 没有 key 的话，Vue 可能会复用元素，导致状态问题 -->
</template>
```

### 7.2 列表渲染

#### v-for 基础

```vue
<template>
  <!-- 遍历数组 -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>

  <!-- 带索引 -->
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      {{ index + 1 }}. {{ item.name }}
    </li>
  </ul>

  <!-- 遍历对象 -->
  <ul>
    <li v-for="(value, key) in object" :key="key">
      {{ key }}: {{ value }}
    </li>
  </ul>

  <!-- 遍历对象（带索引） -->
  <ul>
    <li v-for="(value, key, index) in object" :key="key">
      {{ index }}. {{ key }}: {{ value }}
    </li>
  </ul>

  <!-- 遍历数字 -->
  <span v-for="n in 10" :key="n">{{ n }} </span>

  <!-- 遍历字符串 -->
  <span v-for="char in 'Hello'" :key="char">{{ char }} </span>
</template>
```

#### v-for 与组件

```vue
<template>
  <!-- v-for 在组件上使用 -->
  <todo-item
    v-for="todo in todos"
    :key="todo.id"
    :todo="todo"
    @toggle="toggleTodo"
    @delete="deleteTodo"
  />
</template>

<script>
import TodoItem from './TodoItem.vue'

export default {
  components: {
    TodoItem
  },
  methods: {
    toggleTodo(id) {
      // 处理切换
    },
    deleteTodo(id) {
      // 处理删除
    }
  }
}
</script>
```

#### v-for 排序与过滤

```vue
<template>
  <!-- ❌ 避免：在模板中直接过滤 -->
  <li v-for="user in users.filter(u => u.isActive)" :key="user.id">
    {{ user.name }}
  </li>

  <!-- ✅ 推荐：使用计算属性 -->
  <li v-for="user in activeUsers" :key="user.id">
    {{ user.name }}
  </li>

  <!-- ✅ 推荐：使用方法（需要传参时） -->
  <li v-for="user in getFilteredUsers('admin')" :key="user.id">
    {{ user.name }}
  </li>
</template>

<script>
export default {
  computed: {
    // 计算属性：自动缓存
    activeUsers() {
      return this.users.filter(user => user.isActive)
    },
    // 排序后的用户
    sortedUsers() {
      return [...this.users].sort((a, b) => a.name.localeCompare(b.name))
    }
  },
  methods: {
    // 方法：需要传参时使用
    getFilteredUsers(role) {
      return this.users.filter(user => user.role === role)
    }
  }
}
</script>
```

### 7.3 事件处理

#### 基础事件

```vue
<template>
  <!-- 基本事件 -->
  <button @click="handleClick">点击</button>

  <!-- 内联处理器 -->
  <button @click="count++">增加</button>

  <!-- 方法调用 -->
  <button @click="sayHello('Hello')">打招呼</button>

  <!-- 访问事件对象 -->
  <button @click="handleClick($event)">点击</button>

  <!-- 多事件 -->
  <button @click="one(), two()">触发多个</button>
</template>

<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    handleClick(event) {
      console.log('点击事件', event)
      console.log('目标元素', event.target)
    },
    sayHello(message) {
      console.log(message)
    },
    one() {
      console.log('one')
    },
    two() {
      console.log('two')
    }
  }
}
</script>
```

#### 事件修饰符

```vue
<template>
  <!-- .stop：阻止事件冒泡 -->
  <div @click="parentClick">
    <button @click.stop="childClick">子按钮</button>
  </div>

  <!-- .prevent：阻止默认行为 -->
  <form @submit.prevent="handleSubmit">
    <button type="submit">提交</button>
  </form>

  <!-- .capture：使用捕获模式 -->
  <div @click.capture="handleClick">
    捕获模式点击
  </div>

  <!-- .self：只当事件从元素本身触发时触发 -->
  <div @click.self="handleClick">
    <span>内容</span>
  </div>

  <!-- .once：只触发一次 -->
  <button @click.once="handleClick">只能点一次</button>

  <!-- .passive：立即执行默认行为（用于提升滚动性能） -->
  <div @scroll.passive="onScroll">...</div>

  <!-- 修饰符组合 -->
  <a @click.stop.prevent="doSomething">链接</a>

  <!-- 按键修饰符 -->
  <input @keyup.enter="submit" />
  <input @keyup.ctrl.enter="submitWithCtrl" />

  <!-- 鼠标修饰符 -->
  <div @click.left="handleLeftClick">左键</div>
  <div @click.right.prevent="handleRightClick">右键</div>
  <div @click.middle="handleMiddleClick">中键</div>

  <!-- 精确修饰符 -->
  <button @click.ctrl.exact="onCtrlClick">只按 Ctrl</button>
  <button @click.ctrl="onCtrlClick">Ctrl + 其他按键也可</button>
</template>
```

### 7.4 表单输入绑定

#### v-model 修饰符

```vue
<template>
  <!-- .lazy：在 change 事件而非 input 事件中同步 -->
  <input v-model.lazy="message" />

  <!-- .number：自动将输入值转换为数字 -->
  <input v-model.number="age" type="number" />

  <!-- .trim：自动过滤首尾空白 -->
  <input v-model.trim="username" />

  <!-- 组合使用 -->
  <input v-model.trim.lazy="searchQuery" />
</template>
```

#### 自定义 v-model

```vue
<!-- 自定义输入组件 -->
<template>
  <input
    type="text"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script>
export default {
  name: 'CustomInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue']
}
</script>
```

### 7.5 自定义指令

#### 基础用法

```javascript
// 全局注册
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 局部注册
export default {
  directives: {
    focus: {
      mounted(el) {
        el.focus()
      }
    }
  }
}
```

#### 完整钩子

```javascript
// 自定义指令完整示例
const myDirective = {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created(el, binding, vnode, prevVnode) {
    console.log('created')
  },

  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode, prevVnode) {
    console.log('beforeMount')
  },

  // 在绑定元素的父组件挂载后调用
  mounted(el, binding, vnode, prevVnode) {
    console.log('mounted')
    // el：指令绑定的元素
    // binding.value：指令传递的值
    // binding.arg：指令参数
    // binding.modifiers：指令修饰符
  },

  // 在绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},

  // 在绑定元素的父组件更新后调用
  updated(el, binding, vnode, prevVnode) {},

  // 在绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode, prevVnode) {},

  // 在绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode, prevVnode) {}
}
```

#### 常用自定义指令示例

```javascript
// 1. 权限指令
app.directive('permission', {
  mounted(el, binding) {
    const { value } = binding
    const permissions = store.getters['user/permissions']

    if (value && !permissions.includes(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
})

// 使用
<button v-permission="'user:delete'">删除</button>

// 2. 防抖指令
app.directive('debounce', {
  mounted(el, binding) {
    let timer
    el.addEventListener('click', () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        binding.value()
      }, binding.arg || 300)
    })
  }
})

// 使用
<button v-debounce:500="handleClick">点击</button>

// 3. 节流指令
app.directive('throttle', {
  mounted(el, binding) {
    let throttled = false
    el.addEventListener('click', () => {
      if (!throttled) {
        throttled = true
        binding.value()
        setTimeout(() => {
          throttled = false
        }, binding.arg || 1000)
      }
    })
  }
})

// 使用
<button v-throttle:1000="handleClick">点击</button>

// 4. 无限滚动指令
app.directive('infinite-scroll', {
  mounted(el, binding) {
    const callback = binding.value
    const options = {
      rootMargin: '100px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback()
        }
      })
    }, options)

    observer.observe(el)

    el._observer = observer
  },
  unmounted(el) {
    el._observer && el._observer.disconnect()
  }
})

// 使用
<div v-infinite-scroll="loadMore">...</div>

// 5. 复制指令
app.directive('copy', {
  mounted(el, binding) {
    el.copyData = binding.value
    el.addEventListener('click', handleClick)
  },
  updated(el, binding) {
    el.copyData = binding.value
  },
  unmounted(el) {
    el.removeEventListener('click', handleClick)
  }
})

function handleClick() {
  const text = this.copyData
  navigator.clipboard.writeText(text).then(() => {
    // 可以显示提示
  })
}

// 使用
<button v-copy="'复制内容'">复制</button>
```

---

## 八、样式开发规范

### 8.1 样式作用域

#### Scoped 样式

```vue
<template>
  <!-- 添加 data-v-xxx 属性 -->
  <div class="container">
    <h1>标题</h1>
    <p class="text">段落</p>
  </div>
</template>

<style scoped>
/* 添加属性选择器 */
.container[data-v-xxx] {
  max-width: 1200px;
}

.text[data-v-xxx] {
  color: #333;
}
</style>
```

#### 深度选择器

```vue
<template>
  <div class="parent">
    <!-- 子组件内容 -->
    <child-component />
  </div>
</template>

<style scoped>
/* Vue 2 */
.parent >>> .child-class {
  /* 样式 */
}

/* Vue 3 */
.parent :deep(.child-class) {
  /* 样式 */
}

/* 通用写法 */
.parent /deep/ .child-class {
  /* 样式 */
}
</style>
```

#### CSS Modules

```vue
<template>
  <!-- 使用 $style 访问 -->
  <div :class="$style.container">
    <h1 :class="$style.title">标题</h1>
  </div>
</template>

<style module>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  color: #333;
}
</style>
```

#### 动态 CSS Modules

```vue
<template>
  <div :class="$style[theme]">
    动态样式
  </div>
</template>

<style module>
.dark {
  background: #333;
  color: #fff;
}

.light {
  background: #fff;
  color: #333;
}
</style>
```

### 8.2 命名规范

#### BEM 方法论

```css
/* Block */
.card {}

/* Element */
.card__header {}
.card__body {}
.card__footer {}

/* Modifier */
.card--primary {}
.card--large {}
.card--disabled {}

/* 组合使用 */
.card--primary .card__header {
  background: #007bff;
  color: white;
}

/* 嵌套规则 */
.card {
  &__header {
    padding: 16px;
  }

  &--large &__header {
    padding: 24px;
  }
}
```

#### 组件类名前缀

```css
/* 使用组件名作为前缀 */
.user-profile__header {}
.user-profile__avatar {}
.user-profile__info {}

.button--primary {}
.button--danger {}
.button--large {}
```

### 8.3 响应式设计

```vue
<style scoped>
/* 移动优先 */
.container {
  padding: 8px;
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    padding: 16px;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* 大屏 */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px;
  }
}
</style>
```

### 8.4 CSS 变量

```vue
<script>
export default {
  data() {
    return {
      theme: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545'
      }
    }
  },
  mounted() {
    // 动态设置 CSS 变量
    document.documentElement.style.setProperty('--primary-color', this.theme.primary)
  }
}
</script>

<style>
:root {
  /* 颜色 */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;

  /* 间距 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 字体 */
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;

  /* 圆角 */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;

  /* 阴影 */
  --box-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --box-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --box-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.button {
  background-color: var(--primary-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  box-shadow: var(--box-shadow-sm);
}
</style>
```

### 8.5 动画与过渡

#### Transition 组件

```vue
<template>
  <!-- 单元素过渡 -->
  <transition name="fade">
    <p v-if="show">Hello</p>
  </transition>

  <!-- 多元素过渡 -->
  <transition name="slide" mode="out-in">
    <button v-if="isEditing" key="save">保存</button>
    <button v-else key="edit">编辑</button>
  </transition>

  <!-- 列表过渡 -->
  <transition-group name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </transition-group>
</template>

<style>
/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑动 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* 列表过渡 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.5s ease;
}
</style>
```

#### JavaScript 钩子

```vue
<template>
  <transition
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @enter-cancelled="enterCancelled"
    @before-leave="beforeLeave"
    @leave="leave"
    @after-leave="afterLeave"
    @leave-cancelled="leaveCancelled"
    :css="false"
  >
    <p v-if="show">Hello</p>
  </transition>
</template>

<script>
import gsap from 'gsap'

export default {
  methods: {
    beforeEnter(el) {
      gsap.set(el, {
        opacity: 0,
        y: -50
      })
    },
    enter(el, done) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        onComplete: done
      })
    },
    afterEnter(el) {},
    enterCancelled(el) {},
    beforeLeave(el) {},
    leave(el, done) {
      gsap.to(el, {
        opacity: 0,
        y: 50,
        duration: 0.3,
        onComplete: done
      })
    },
    afterLeave(el) {},
    leaveCancelled(el) {}
  }
}
</script>
```

---

## 九、项目结构规范

### 9.1 标准项目结构

```
my-vue-app/
├── public/                      # 静态资源（不经过 webpack）
│   ├── favicon.ico
│   └── index.html
│
├── src/                         # 源代码
│   ├── assets/                  # 资源文件
│   │   ├── images/              # 图片
│   │   ├── fonts/               # 字体
│   │   └── styles/              # 全局样式
│   │       ├── index.scss       # 样式入口
│   │       ├── variables.scss   # 变量
│   │       ├── mixins.scss      # 混入
│   │       └── reset.scss       # 重置样式
│   │
│   ├── components/              # 组件
│   │   ├── base/                # 基础组件
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseInput.vue
│   │   │   ├── BaseModal.vue
│   │   │   └── index.js         # 统一导出
│   │   │
│   │   └── business/            # 业务组件
│   │       ├── UserCard.vue
│   │       ├── ProductList.vue
│   │       └── OrderForm.vue
│   │
│   ├── composables/             # 组合式函数
│   │   ├── useAuth.js
│   │   ├── useRequest.js
│   │   └── useLocalStorage.js
│   │
│   ├── directives/              # 自定义指令
│   │   ├── index.js
│   │   ├── permission.js
│   │   └── lazyLoad.js
│   │
│   ├── hooks/                   # Vue 2 Mixins 或自定义钩子
│   │   └── usePagination.js
│   │
│   ├── layouts/                 # 布局组件
│   │   ├── DefaultLayout.vue
│   │   ├── EmptyLayout.vue
│   │   └── AuthLayout.vue
│   │
│   ├── middleware/              # 中间件（路由守卫）
│   │   ├── auth.js
│   │   └── permission.js
│   │
│   ├── router/                  # 路由配置
│   │   ├── index.js
│   │   ├── routes/              # 路由拆分
│   │   │   ├── index.js
│   │   │   ├── auth.js
│   │   │   └── dashboard.js
│   │   └── guards.js            # 路由守卫
│   │
│   ├── stores/                  # 状态管理
│   │   ├── index.js
│   │   ├── modules/
│   │   │   ├── user.js
│   │   │   ├── app.js
│   │   │   └── product.js
│   │   └── types/
│   │
│   ├── utils/                   # 工具函数
│   │   ├── request.js           # 请求封装
│   │   ├── auth.js              # 认证相关
│   │   ├── storage.js           # 存储封装
│   │   ├── validate.js          # 验证函数
│   │   ├── format.js            # 格式化函数
│   │   └── constants.js         # 常量定义
│   │
│   ├── views/                   # 页面组件
│   │   ├── Home/
│   │   │   └── index.vue
│   │   ├── About/
│   │   │   └── index.vue
│   │   └── User/
│   │       ├── index.vue        # 列表页
│   │       ├── Detail.vue       # 详情页
│   │       └── components/      # 页面私有组件
│   │
│   ├── api/                     # API 接口
│   │   ├── index.js
│   │   ├── user.js
│   │   ├── product.js
│   │   └── auth.js
│   │
│   ├── types/                   # TypeScript 类型定义
│   │   ├── index.d.ts
│   │   ├── user.d.ts
│   │   └── api.d.ts
│   │
│   ├── App.vue                  # 根组件
│   └── main.js                  # 入口文件
│
├── tests/                       # 测试文件
│   ├── unit/                    # 单元测试
│   └── e2e/                     # E2E 测试
│
├── .env                         # 环境变量
├── .env.development
├── .env.production
├── .env.staging
│
├── .eslintrc.js                 # ESLint 配置
├── .prettierrc                  # Prettier 配置
├── .gitignore
├── babel.config.js              # Babel 配置
├── package.json
├── vite.config.js               # Vite 配置
├── vue.config.js                # Vue CLI 配置
└── README.md
```

### 9.2 命名规范总结

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 组件文件 | PascalCase | `UserProfile.vue` |
| 组件名 | PascalCase | `name: 'UserProfile'` |
| 工具文件 | kebab-case | `format-date.js` |
| 组合式函数 | camelCase + `use` 前缀 | `useLocalStorage.js` |
| 常量文件 | kebab-case | `api-config.js` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| 类 | PascalCase | `class UserManager {}` |
| 变量/函数 | camelCase | `getUserInfo()` |
| 布尔变量 | is/has/can 前缀 | `isVisible` |
| 私有变量 | 下划线前缀 | `_internalState` |
| CSS 类名 | kebab-case / BEM | `.user-profile__header` |

### 9.3 导入顺序

```javascript
// 1. Vue 相关
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

// 2. 第三方库
import axios from 'axios'
import { debounce } from 'lodash-es'
import dayjs from 'dayjs'

// 3. 组件
import BaseButton from '@/components/base/BaseButton.vue'
import UserCard from '@/components/business/UserCard.vue'

// 4. 工具函数
import { formatDate } from '@/utils/format'
import { validateEmail } from '@/utils/validate'

// 5. API
import { getUserList } from '@/api/user'

// 6. 类型
import type { User } from '@/types/user'

// 7. 样式
import '@/styles/index.scss'
import './index.scss'
```

---

## 十、Composition API 规范

### 10.1 script setup 语法

```vue
<!-- ✅ 推荐：使用 <script setup> -->
<script setup>
import { ref, computed, onMounted } from 'vue'

// 响应式数据
const count = ref(0)

// 计算属性
const doubled = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}

// 生命周期
onMounted(() => {
  console.log('mounted')
})

// 暴露给模板
defineProps({
  title: String
})

defineEmits(['update'])
</script>

<!-- ⚠️ 传统写法（向后兼容） -->
<script>
import { ref, computed, onMounted } from 'vue'

export default {
  props: {
    title: String
  },
  emits: ['update'],
  setup(props, { emit }) {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)

    function increment() {
      count.value++
    }

    onMounted(() => {
      console.log('mounted')
    })

    return {
      count,
      doubled,
      increment
    }
  }
}
</script>
```

### 10.2 响应式数据选择

```javascript
import { ref, reactive, toRefs, readonly } from 'vue'

export default {
  setup() {
    // ========== ref ==========
    // 基本类型
    const count = ref(0)
    const message = ref('Hello')
    const isActive = ref(false)

    // 单一对象（需要替换整个对象时）
    const user = ref({
      name: 'John',
      age: 25
    })

    // 替换整个对象
    user.value = { name: 'Jane', age: 30 }

    // ========== reactive ==========
    // 复杂对象（多个相关属性）
    const state = reactive({
      count: 0,
      message: 'Hello',
      isActive: false,
      user: {
        name: 'John',
        age: 25
      }
    })

    // 直接修改属性
    state.count++
    state.user.name = 'Jane'

    // 数组
    const items = reactive([1, 2, 3])
    items.push(4)
    items[0] = 10

    // ========== readonly ==========
    const original = reactive({ count: 0 })
    const copy = readonly(original)

    // copy.count++  // 警告：不能修改

    // ========== toRefs ==========
    // 解构时保持响应性
    const { count, message, isActive } = toRefs(state)

    return {
      count,    // Ref<number>
      message,  // Ref<string>
      isActive, // Ref<boolean>
      user,     // Ref<User>
      state,    // Reactive object
      items     // Reactive array
    }
  }
}
```

### 10.3 Composables 最佳实践

```javascript
// composables/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 鼠标位置追踪
 * @returns {Object} { x, y }
 */
export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return { x, y }
}

// composables/useLocalStorage.js
import { ref, watch } from 'vue'

/**
 * 本地存储响应式
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 默认值
 */
export function useLocalStorage(key, defaultValue) {
  const storedValue = localStorage.getItem(key)
  const value = ref(storedValue ? JSON.parse(storedValue) : defaultValue)

  watch(value, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })

  return value
}

// composables/useFetch.js
import { ref } from 'vue'

/**
 * 异步请求
 * @param {string} url - 请求地址
 */
export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(url)
      data.value = await response.json()
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  fetch()

  return { data, error, loading, fetch }
}

// composables/useDebounce.js
import { ref, watch } from 'vue'

/**
 * 防抖
 * @param {any} value - 响应式值
 * @param {number} delay - 延迟时间
 */
export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value)
  let timeout = null

  watch(value, (newValue) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}

// 使用示例
<script setup>
import { useMouse } from '@/composables/useMouse'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useFetch } from '@/composables/useFetch'

// 鼠标位置
const { x, y } = useMouse()

// 本地存储
const theme = useLocalStorage('theme', 'light')

// 数据请求
const { data, error, loading } = useFetch('/api/user')
</script>
```

### 10.4 依赖注入

```javascript
// 父组件
<script setup>
import { provide, ref, readonly } from 'vue'
import ChildComponent from './ChildComponent.vue'

// 提供响应式数据
const theme = ref('light')
const user = ref({
  name: 'John',
  role: 'admin'
})

// 提供只读状态（防止子组件直接修改）
provide('theme', readonly(theme))
provide('user', readonly(user))

// 提供方法
provide('setTheme', (newTheme) => {
  theme.value = newTheme
})
</script>

// 子组件
<script setup>
import { inject } from 'vue'

// 注入数据
const theme = inject('theme', 'light')
const user = inject('user', null)
const setTheme = inject('setTheme')

// 使用
function toggleTheme() {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}
</script>
```

---

## 十一、路由开发规范

### 11.1 路由配置

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // ========== 公开路由 ==========
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
    meta: {
      title: '首页',
      keepAlive: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Auth/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },

  // ========== 认证路由 ==========
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/User/Profile.vue'),
    meta: {
      title: '个人中心',
      requiresAuth: true
    }
  },

  // ========== 嵌套路由 ==========
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      {
        path: '',
        redirect: 'list'
      },
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/User/List.vue'),
        meta: {
          title: '用户列表',
          requiresAuth: true,
          permission: 'user:read'
        }
      },
      {
        path: ':id',
        name: 'UserDetail',
        component: () => import('@/views/User/Detail.vue'),
        meta: {
          title: '用户详情',
          requiresAuth: true
        }
      }
    ]
  },

  // ========== 404 页面 ==========
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/Error/404.vue'),
    meta: {
      title: '页面不存在'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0 }
  }
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - MyApp` : 'MyApp'

  // 检查认证状态
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 保存目标路由
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 检查权限
  if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    next({ name: 'Forbidden' })
    return
  }

  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 页面访问统计等
  console.log(`Navigated to ${to.path}`)
})

export default router
```

### 11.2 路由跳转

```vue
<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 声明式导航
function navigate() {
  // 路径跳转
  router.push('/users')

  // 命名路由
  router.push({ name: 'UserDetail', params: { id: 123 } })

  // 带查询参数
  router.push({ path: '/users', query: { page: 1, size: 10 } })

  // 替换当前路由
  router.replace('/home')

  // 前进/后退
  router.go(1)
  router.go(-1)
  router.back()
  router.forward()
}

// 获取路由信息
console.log(route.path)        // 当前路径
console.log(route.params)      // 路由参数
console.log(route.query)       // 查询参数
console.log(route.meta)        // 元信息
console.log(route.name)        // 路由名称
</script>
```

### 11.3 懒加载

```javascript
// ✅ 推荐：路由级懒加载
const routes = [
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
]

// ✅ 分组懒加载（相同 chunk）
const routes = [
  {
    path: '/user',
    component: () => import(/* webpackChunkName: "user" */ '@/views/User.vue')
  },
  {
    path: '/profile',
    component: () => import(/* webpackChunkName: "user" */ '@/views/Profile.vue')
  }
]
```

---

## 十二、状态管理规范

### 12.1 Pinia（Vue 3 推荐）

```javascript
// stores/user.js
import { defineStore } from 'pinia'
import { login, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', {
  // ========== state ==========
  state: () => ({
    token: '',
    userInfo: null,
    permissions: []
  }),

  // ========== getters ==========
  getters: {
    // 是否已登录
    isAuthenticated: (state) => !!state.token,

    // 用户名
    username: (state) => state.userInfo?.name || '',

    // 是否有权限
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    },

    // 用户角色
    roles: (state) => state.userInfo?.roles || []
  },

  // ========== actions ==========
  actions: {
    // 登录
    async login(credentials) {
      try {
        const { token } = await login(credentials)
        this.token = token
        await this.fetchUserInfo()
      } catch (error) {
        throw error
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const userInfo = await getUserInfo()
        this.userInfo = userInfo
        this.permissions = userInfo.permissions
      } catch (error) {
        this.logout()
        throw error
      }
    },

    // 登出
    logout() {
      this.token = ''
      this.userInfo = null
      this.permissions = []
    },

    // 更新用户信息
    updateUserInfo(data) {
      this.userInfo = { ...this.userInfo, ...data }
    }
  },

  // ========== 持久化配置 ==========
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token']  // 只持久化 token
  }
})
```

#### 组件中使用

```vue
<script setup>
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

// 解构保持响应性
const { userInfo, isAuthenticated, username } = storeToRefs(userStore)

// 方法不需要解构
function handleLogin() {
  userStore.login({ username: 'admin', password: '123456' })
}

function handleLogout() {
  userStore.logout()
}

// 检查权限
function canEdit() {
  return userStore.hasPermission('user:edit')
}
</script>

<template>
  <div v-if="isAuthenticated">
    <p>欢迎，{{ username }}</p>
    <button @click="handleLogout">登出</button>
  </div>
  <div v-else>
    <button @click="handleLogin">登录</button>
  </div>
</template>
```

### 12.2 Vuex（Vue 2）

```javascript
// store/modules/user.js
const state = {
  token: '',
  userInfo: null,
  permissions: []
}

const getters = {
  isAuthenticated: (state) => !!state.token,
  username: (state) => state.userInfo?.name || '',
  hasPermission: (state) => (permission) => {
    return state.permissions.includes(permission)
  }
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
  },
  SET_PERMISSIONS(state, permissions) {
    state.permissions = permissions
  },
  CLEAR_USER(state) {
    state.token = ''
    state.userInfo = null
    state.permissions = []
  }
}

const actions = {
  async login({ commit }, credentials) {
    const { token } = await api.login(credentials)
    commit('SET_TOKEN', token)
  },
  async fetchUserInfo({ commit }) {
    const userInfo = await api.getUserInfo()
    commit('SET_USER_INFO', userInfo)
    commit('SET_PERMISSIONS', userInfo.permissions)
  },
  logout({ commit }) {
    commit('CLEAR_USER')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
```

---

## 十三、性能优化规范

### 13.1 代码分割

```javascript
// 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue')
  }
]

// 组件懒加载
export default {
  components: {
    HeavyComponent: () => import('./HeavyComponent.vue')
  }
}

// 条件加载
export default {
  components: {
    Editor: () => import('./Editor.vue')
  },
  data() {
    return { showEditor: false }
  }
}
```

### 13.2 列表优化

```vue
<template>
  <!-- 虚拟滚动（大型列表） -->
  <RecycleScroller
    :items="items"
    :item-size="50"
    key-field="id"
    v-slot="{ item }"
  >
    <div>{{ item.name }}</div>
  </RecycleScroller>

  <!-- 分页加载 -->
  <div v-infinite-scroll="loadMore" :infinite-scroll-disabled="loading">
    <div v-for="item in items" :key="item.id">
      {{ item.name }}
    </div>
    <div v-if="loading">加载中...</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      page: 1,
      loading: false,
      hasMore: true
    }
  },
  methods: {
    async loadMore() {
      if (this.loading || !this.hasMore) return

      this.loading = true
      const newItems = await api.getItems(this.page)
      this.items.push(...newItems)
      this.page++
      this.loading = false
      this.hasMore = newItems.length > 0
    }
  }
}
</script>
```

### 13.3 计算属性缓存

```javascript
export default {
  data() {
    return {
      items: [],
      filter: '',
      sortBy: 'name'
    }
  },
  computed: {
    // 链式计算属性，每一步都有缓存
    filteredItems() {
      return this.items.filter(item =>
        item.name.includes(this.filter)
      )
    },
    sortedItems() {
      return [...this.filteredItems].sort((a, b) =>
        a[this.sortBy].localeCompare(b[this.sortBy])
      )
    }
  }
}
```

### 13.4 v-once 和 v-memo

```vue
<template>
  <!-- 静态内容使用 v-once -->
  <div v-once>
    <h1>{{ staticTitle }}</h1>
    <p>{{ staticDescription }}</p>
  </div>

  <!-- 条件渲染优化（Vue 3.2+） -->
  <div
    v-for="item in items"
    :key="item.id"
    v-memo="[item.id, item.selected]"
  >
    {{ item.name }}
  </div>
</template>
```

---

## 十四、TypeScript 规范

### 14.1 组件类型定义

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  user: User
  items: string[]
}

interface User {
  id: number
  name: string
  email: string
}

interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}

// Props
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// Emits
const emit = defineEmits<Emits>()

// Refs
const count = ref<number>(0)
const user = ref<User | null>(null)

// 计算属性
const doubleCount = computed<number>(() => count.value * 2)
</script>
```

### 14.2 工具类型

```typescript
// types/common.ts
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type MaybeRef<T> = T | Ref<T>
export type MaybePromise<T> = T | Promise<T>

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 分页参数
export interface PaginationParams {
  page?: number
  pageSize?: number
  keyword?: string
}
```

---

## 十五、测试规范

### 15.1 单元测试

```javascript
// tests/unit/HelloWorld.spec.js
import { mount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = mount(HelloWorld, {
      props: { msg }
    })

    expect(wrapper.text()).toMatch(msg)
  })

  it('emits click event when button is clicked', async () => {
    const wrapper = mount(HelloWorld)

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

### 15.2 组件测试

```javascript
// tests/unit/UserCard.spec.js
import { mount } from '@vue/test-utils'
import UserCard from '@/components/UserCard.vue'

describe('UserCard.vue', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  }

  it('displays user information', () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser }
    })

    expect(wrapper.find('.name').text()).toBe('John Doe')
    expect(wrapper.find('.email').text()).toBe('john@example.com')
  })

  it('emits delete event when delete button is clicked', async () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser }
    })

    await wrapper.find('.delete-btn').trigger('click')

    expect(wrapper.emitted('delete')[0]).toEqual([1])
  })
})
```

---

## 十六、安全规范

### 16.1 XSS 防护

```vue
<template>
  <!-- ❌ 危险：直接渲染用户输入 -->
  <div v-html="userInput"></div>

  <!-- ✅ 安全：使用 DOMPurify 清理 -->
  <div v-html="sanitizedHtml"></div>
</template>

<script>
import DOMPurify from 'dompurify'

export default {
  data() {
    return {
      userInput: ''
    }
  },
  computed: {
    sanitizedHtml() {
      return DOMPurify.sanitize(this.userInput)
    }
  }
}
</script>
```

### 16.2 URL 验证

```javascript
export default {
  methods: {
    openUrl(url) {
      // 验证 URL 格式
      const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']

      try {
        const parsed = new URL(url)

        if (!allowedProtocols.includes(parsed.protocol)) {
          console.error('不允许的协议:', parsed.protocol)
          return
        }
      } catch (e) {
        console.error('无效的 URL:', url)
        return
      }

      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }
}
```

---

## 十七、错误处理规范

### 17.1 全局错误处理

```javascript
// main.js
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('组件:', instance)
  console.error('错误信息:', info)

  // 发送到错误监控服务
  sendToErrorTracking(err, {
    componentName: instance?.$options?.name,
    lifecycle: info
  })
}
```

### 17.2 组件错误处理

```vue
<script>
export default {
  data() {
    return {
      error: null
    }
  },
  methods: {
    async fetchData() {
      try {
        this.error = null
        const data = await api.getData()
        this.items = data
      } catch (err) {
        this.error = '加载数据失败'
        console.error('获取数据失败:', err)

        // 可选：显示全局错误提示
        this.$toast.error(this.error)
      }
    }
  }
}
</script>
```

---

## 十八、可访问性规范

### 18.1 语义化 HTML

```vue
<template>
  <!-- ✅ 语义化标签 -->
  <header>
    <nav>
      <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <h1>文章标题</h1>
      <p>文章内容...</p>
    </article>

    <aside>
      <h2>相关推荐</h2>
      <ul>
        <li>推荐 1</li>
        <li>推荐 2</li>
      </ul>
    </aside>
  </main>

  <footer>
    <p>&copy; 2024 My App</p>
  </footer>
</template>
```

### 18.2 ARIA 属性

```vue
<template>
  <!-- 按钮 -->
  <button
    aria-label="关闭对话框"
    @click="closeModal"
  >
    ✕
  </button>

  <!-- 表单 -->
  <label for="email">邮箱</label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-invalid="!!emailError"
    :aria-describedby="emailError ? 'email-error' : null"
  />
  <span
    v-if="emailError"
    id="email-error"
    role="alert"
    aria-live="polite"
  >
    {{ emailError }}
  </span>

  <!-- 加载状态 -->
  <div
    role="status"
    aria-live="polite"
    aria-busy="isLoading"
  >
    {{ isLoading ? '加载中...' : '加载完成' }}
  </div>

  <!-- 对话框 -->
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <h2 id="dialog-title">确认操作</h2>
    <p id="dialog-description">确定要删除吗？</p>
  </div>
</template>
```

### 18.3 键盘导航

```vue
<template>
  <!-- 自定义下拉框支持键盘 -->
  <div
    @keydown="handleKeydown"
    tabindex="0"
    role="listbox"
    :aria-expanded="isOpen"
  >
    <div>{{ selectedLabel }}</div>
    <ul v-show="isOpen" role="presentation">
      <li
        v-for="(option, index) in options"
        :key="option.value"
        role="option"
        :aria-selected="value === option.value"
        @click="select(option)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  methods: {
    handleKeydown(event) {
      switch (event.key) {
        case 'Enter':
        case ' ':
          this.toggle()
          break
        case 'Escape':
          this.close()
          break
        case 'ArrowDown':
          this.selectNext()
          break
        case 'ArrowUp':
          this.selectPrevious()
          break
      }
    }
  }
}
</script>
```

---

## 参考资源

- [Vue 官方风格指南](https://cn.vuejs.org/style-guide/)
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue Router 官方文档](https://router.vuejs.org/zh/)
- [Pinia 官方文档](https://pinia.vuejs.org/zh/)
- [VueUse 组合式函数集合](https://vueuse.org/)
- [Vue Test Utils 测试指南](https://test-utils.vuejs.org/)
