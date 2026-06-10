### v-slot

> 📖 [Vue 官方文档 - v-slot](https://cn.vuejs.org/api/built-in-directives#v-slot)

### 一、概述

`v-slot` 是 Vue 3 中用于在父组件中为子组件的**插槽（Slot）提供内容**的指令。它支持**默认插槽**、**具名插槽**和**作用域插槽**三种主要用法。简写形式为 `#`，即 `v-slot:header` 等同于 `#header`。

简单来说：插槽就像是组件内部预留的"占位符"，父组件可以通过 `v-slot` 向这些占位符中填充自定义内容，从而实现组件的高度复用和灵活定制。

### 二、核心原理

#### 1. 编译作用域

插槽内容是在**父组件的作用域**中编译的，而不是在子组件中。这意味着：
- 插槽内容可以访问父组件的数据和方法
- 不能直接访问子组件的数据
- 如果需要子组件的数据，必须通过**作用域插槽**传递

#### 2. 插槽类型

| 类型 | 语法 | 说明 |
|------|------|------|
| 默认插槽 | `v-slot` 或 `v-slot:default` | 无名插槽，组件的默认内容出口 |
| 具名插槽 | `v-slot:name` 或 `#name` | 有名字的插槽，可以有多个 |
| 作用域插槽 | `v-slot:name="props"` | 子组件向插槽传递数据的插槽 |

#### 3. 渲染机制

`<slot>` 是一个虚拟出口，在渲染时会被替换为父组件传入的实际内容。如果没有传入内容，则显示 `<slot>` 标签内的默认内容。

### 三、详细用法

#### 1. 基本用法 — 默认插槽

最简单的插槽用法，父组件向子组件传递内容：

```vue
<!-- 子组件 Card.vue -->
<template>
  <div class="card">
    <!-- slot 是内容出口，可设置默认内容 -->
    <slot>这是默认内容（父组件没传内容时显示）</slot>
  </div>
</template>

<!-- 父组件 -->
<template>
  <!-- 方式一：通过 template + v-slot -->
  <Card>
    <template v-slot:default>
      <p>这是传入的内容</p>
    </template>
  </Card>

  <!-- 方式二：默认插槽可以直接写在组件标签内（简写） -->
  <Card>
    <p>直接写在组件内的内容</p>
  </Card>

  <!-- 方式三：不传内容，显示默认内容 -->
  <Card />
  <!-- 渲染结果：<div class="card">这是默认内容（父组件没传内容时显示）</div> -->
</template>
```

**实现效果：**
- 父组件传入的内容会替换子组件中 `<slot>` 的位置
- 如果父组件不传内容，显示 `<slot>` 标签内的默认文本

#### 2. 具名插槽

当组件需要多个插槽时，通过 `name` 属性区分不同的插槽：

```vue
<!-- 子组件 Layout.vue -->
<template>
  <div class="layout">
    <header>
      <slot name="header">默认头部</slot>
    </header>
    <main>
      <slot>默认主体内容</slot>  <!-- 等同于 <slot name="default"> -->
    </main>
    <footer>
      <slot name="footer">默认底部</slot>
    </footer>
  </div>
</template>

<!-- 父组件使用 -->
<template>
  <Layout>
    <!-- ✅ 使用 # 缩写 -->
    <template #header>
      <h1>页面标题</h1>
      <nav>导航菜单</nav>
    </template>

    <!-- 默认插槽 -->
    <template #default>
      <p>主要内容区域</p>
    </template>

    <template #footer>
      <p>© 2024 版权所有</p>
    </template>
  </Layout>
</template>
```

**实现效果：**
- `#header` 的内容渲染到 `<slot name="header">` 的位置
- `#default` 的内容渲染到 `<slot>` 的位置
- `#footer` 的内容渲染到 `<slot name="footer">` 的位置

#### 3. 作用域插槽

子组件可以通过 `v-bind` 向插槽传递数据，父组件通过 `v-slot` 接收：

```vue
<!-- 子组件 List.vue -->
<template>
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      <!-- ✅ 通过 v-bind（简写 :attr）向插槽传递数据 -->
      <slot :item="item" :index="index">
        {{ item.name }}
      </slot>
    </li>
  </ul>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  }
})
</script>

<!-- 父组件使用 -->
<template>
  <List :items="users">
    <!-- ✅ 接收子组件传出的数据（解构写法） -->
    <template #default="{ item, index }">
      <span>{{ index + 1 }}. {{ item.name }} - {{ item.email }}</span>
    </template>
  </List>
</template>

<script setup>
import { ref } from 'vue'

const users = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' }
])
</script>
```

**实现效果：**
- 子组件将每条数据的 `item` 和 `index` 传给父组件
- 父组件可以自定义每条数据的渲染方式，而非使用子组件的默认渲染

#### 4. 缩写形式

`#` 是 `v-slot:` 的缩写，在日常开发中优先使用：

```vue
<template>
  <MyComponent>
    <!-- 完整语法 -->
    <template v-slot:header>头部内容</template>

    <!-- ✅ 缩写语法（推荐） -->
    <template #header>头部内容</template>

    <!-- 默认插槽的缩写 -->
    <template #default>默认内容</template>

    <!-- 默认插槽可省略 template（只有默认插槽时） -->
    <MyComponent v-slot="{ item }">
      {{ item.name }}
    </MyComponent>
  </MyComponent>
</template>
```

#### 5. 高级解构

作用域插槽的 props 支持解构、重命名和默认值：

```vue
<template>
  <UserList :users="users">
    <!-- ✅ 解构 + 重命名 + 默认值 -->
    <template #default="{ item: user, index: i = 0, active = true }">
      <div>
        <span>#{{ i + 1 }}</span>
        <span>{{ user.name }}</span>
        <span :class="{ active }">{{ user.role }}</span>
      </div>
    </template>
  </UserList>
</template>
```

#### 6. 动态插槽名

插槽名可以是动态的，通过方括号语法绑定变量：

```vue
<template>
  <BaseComponent>
    <!-- ✅ 动态插槽名 -->
    <template v-slot:[dynamicSlotName]>
      动态插槽内容
    </template>

    <!-- 缩写形式 -->
    <template #[dynamicSlotName]>
      动态插槽内容
    </template>
  </BaseComponent>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentLang = ref('zh')
const dynamicSlotName = computed(() => `content-${currentLang.value}`)
</script>
```

#### 7. render 函数中使用插槽

在渲染函数中通过 `slots` 对象访问插槽：

```javascript
// 子组件
import { h } from 'vue'

export default {
  setup(props, { slots }) {
    return () => h('div', [
      // ✅ 具名插槽
      slots.header ? slots.header() : h('h2', '默认标题'),

      // ✅ 作用域插槽：向插槽传递数据
      slots.default
        ? slots.default({ item: { name: 'test' }, index: 0 })
        : h('p', '默认内容'),

      // ✅ 可选链防止插槽未定义时报错
      slots.footer?.()
    ])
  }
}
```

#### 8. API 语法参考

| 语法 | 说明 | 示例 |
|------|------|------|
| `v-slot` | 默认插槽 | `<template v-slot>内容</template>` |
| `v-slot:name` | 具名插槽 | `<template v-slot:header>头部</template>` |
| `#name` | 具名插槽缩写 | `<template #header>头部</template>` |
| `v-slot="props"` | 作用域插槽（默认） | `<template v-slot="{ item }">{{ item }}</template>` |
| `v-slot:name="props"` | 具名作用域插槽 | `<template #header="{ data }">{{ data }}</template>` |
| `v-slot:[name]` | 动态插槽名 | `<template v-slot:[slotName]>内容</template>` |

### 四、实现效果

#### 效果一：可复用的数据表格

```vue
<!-- 子组件 DataTable.vue -->
<template>
  <table class="data-table">
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">{{ col.title }}</th>
        <th v-if="$slots.actions">操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in data" :key="row.id">
        <td v-for="col in columns" :key="col.key">
          <!-- ✅ 每列都可通过插槽自定义，并传递行数据 -->
          <slot :name="col.key" :row="row" :index="index">
            {{ row[col.key] }}
          </slot>
        </td>
        <td v-if="$slots.actions">
          <slot name="actions" :row="row" :index="index" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, required: true }
})
</script>

<!-- 父组件 -->
<template>
  <DataTable :columns="columns" :data="users">
    <!-- 自定义姓名列：加粗显示 -->
    <template #name="{ row }">
      <strong>{{ row.name }}</strong>
    </template>

    <!-- 自定义状态列：带颜色标签 -->
    <template #status="{ row }">
      <span :class="row.active ? 'badge-success' : 'badge-danger'">
        {{ row.active ? '启用' : '禁用' }}
      </span>
    </template>

    <!-- 操作列 -->
    <template #actions="{ row }">
      <button @click="handleEdit(row)">编辑</button>
      <button @click="handleDelete(row)">删除</button>
    </template>
  </DataTable>
</template>

<script setup>
import { ref } from 'vue'

const columns = [
  { key: 'name', title: '姓名' },
  { key: 'email', title: '邮箱' },
  { key: 'status', title: '状态' }
]

const users = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com', active: true },
  { id: 2, name: '李四', email: 'lisi@example.com', active: false }
])

const handleEdit = (row) => console.log('编辑', row)
const handleDelete = (row) => console.log('删除', row)
</script>
```

**实现效果：**
- 表格组件完全复用，不同列的渲染方式由父组件通过插槽自定义
- `name` 列显示为加粗文字
- `status` 列显示为彩色标签（绿色/红色）
- `actions` 列显示编辑和删除按钮

#### 效果二：页面布局组件

```vue
<!-- 子组件 PageLayout.vue -->
<template>
  <div class="page">
    <header class="page-header">
      <slot name="header">
        <h1>{{ title }}</h1>
      </slot>
    </header>

    <div class="page-body">
      <aside v-if="$slots.sidebar" class="page-sidebar">
        <slot name="sidebar" />
      </aside>

      <main class="page-content">
        <slot />
      </main>
    </div>

    <footer class="page-footer">
      <slot name="footer">
        <p>© 2024 版权所有</p>
      </slot>
    </footer>
  </div>
</template>

<script setup>
defineProps({ title: String })
</script>
```

### 五、使用场景

#### 1. 可复用 UI 组件

```vue
<!-- 通用卡片组件，通过插槽自定义不同区域 -->
<template>
  <Card title="商品信息" variant="bordered">
    <template #cover>
      <img src="product.jpg" alt="商品图片" />
    </template>

    <template #extra>
      <span class="price">¥99.00</span>
    </template>

    <!-- 默认插槽：卡片内容 -->
    <p>这是一个非常好的商品...</p>

    <template #footer>
      <button @click="addToCart">加入购物车</button>
    </template>
  </Card>
</template>
```

#### 2. 表单组件

```vue
<!-- FormItem 组件：统一的表单项布局 -->
<template>
  <FormItem label="用户名" :error="errors.username">
    <template #label-extra>
      <span class="required">*</span>
    </template>
    <!-- 默认插槽放置表单控件 -->
    <input v-model="form.username" placeholder="请输入用户名" />
  </FormItem>
</template>
```

#### 3. 列表渲染自定义

```vue
<!-- 通用列表组件，每项的渲染方式由父组件决定 -->
<template>
  <GenericList :items="products">
    <template #item="{ item, index }">
      <div class="product-card">
        <img :src="item.image" />
        <h4>{{ item.name }}</h4>
        <p>¥{{ item.price }}</p>
        <button @click="addToCart(item)">加入购物车</button>
      </div>
    </template>
  </GenericList>
</template>
```

#### 4. 递归树形组件

```vue
<!-- TreeNode.vue — 递归组件中的作用域插槽 -->
<template>
  <div class="tree-node">
    <div class="node-content">
      <!-- 将节点数据传给父组件 -->
      <slot :node="node" :depth="depth">
        <span>{{ node.label }}</span>
      </slot>
    </div>

    <div v-if="node.children?.length" class="node-children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
      >
        <!-- ✅ 透传作用域插槽给递归子节点 -->
        <template #default="slotProps">
          <slot v-bind="slotProps" />
        </template>
      </TreeNode>
    </div>
  </div>
</template>

<script setup>
defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 }
})
</script>
```

#### 5. 条件渲染插槽

```vue
<template>
  <div>
    <!-- ✅ 子组件中检测插槽是否有内容，条件渲染包裹元素 -->
    <div v-if="$slots.header" class="header-wrapper">
      <slot name="header" />
    </div>

    <!-- 使用 useSlots() 组合式 API -->
    <slot name="footer" v-if="slots.footer" />
  </div>
</template>

<script setup>
import { useSlots } from 'vue'
const slots = useSlots()
</script>
```

#### 6. 多语言内容切换

```vue
<template>
  <I18nWrapper>
    <!-- 通过动态插槽名切换不同语言的内容 -->
    <template #[`content-${locale}`]>
      <p>{{ currentContent }}</p>
    </template>
  </I18nWrapper>
</template>

<script setup>
import { ref, computed } from 'vue'
const locale = ref('zh')
</script>
```

#### 7. 弹窗/对话框组件

```vue
<template>
  <Dialog v-model:visible="showDialog" title="确认操作">
    <!-- 自定义弹窗内容 -->
    <p>确定要删除这条记录吗？此操作不可撤销。</p>

    <!-- 自定义底部按钮 -->
    <template #footer>
      <button @click="showDialog = false">取消</button>
      <button @click="handleConfirm" class="btn-danger">确认删除</button>
    </template>
  </Dialog>
</template>
```

#### 8. 高阶组件（HOC）模式

```vue
<template>
  <!-- WithLoading 组件：统一加载状态处理 -->
  <WithLoading :loading="loading" :error="error">
    <!-- 成功时显示的内容 -->
    <template #default>
      <DataView :data="data" />
    </template>

    <!-- 自定义加载中状态 -->
    <template #loading>
      <Skeleton :rows="5" />
    </template>

    <!-- 自定义错误状态 -->
    <template #error="{ error: err }">
      <ErrorMessage :message="err.message" @retry="fetchData" />
    </template>
  </WithLoading>
</template>
```

### 六、注意事项

1. **只能用在组件或 `<template>` 上**：`v-slot` 不能用在普通 HTML 元素上。
   ```vue
   <!-- ❌ 错误：不能用在普通 HTML 元素上 -->
   <div v-slot:header>内容</div>

   <!-- ✅ 正确：用在 template 上 -->
   <template v-slot:header>
     <div>内容</div>
   </template>

   <!-- ✅ 正确：直接用在组件上（只能是默认插槽） -->
   <MyComponent v-slot="{ item }">
     {{ item.name }}
   </MyComponent>
   ```

2. **组件上使用 `v-slot` 只能用于默认插槽**：如果组件同时有多个插槽，必须用 `<template>` 包裹。
   ```vue
   <!-- ❌ 错误：组件上不能使用具名插槽 -->
   <MyComponent v-slot:header="slotProps">...</MyComponent>

   <!-- ✅ 正确：具名插槽必须用 template -->
   <MyComponent>
     <template #header="slotProps">...</template>
   </MyComponent>
   ```

3. **插槽内容的编译作用域**：插槽内容在父组件作用域编译，不能直接访问子组件数据。
   ```vue
   <ChildComponent>
     <template #default>
       <p>{{ parentMessage }}</p>   <!-- ✅ 可以访问 -->
       <p>{{ childMessage }}</p>    <!-- ❌ 不能访问 -->
     </template>
   </ChildComponent>
   ```

4. **缩写 `#default` 不能省略**：在使用作用域插槽时，如果同时有其他具名插槽，默认插槽必须显式写出 `#default`。

5. **`key` 属性问题**：`<template v-slot>` 上不能使用 `key` 属性，Vue 内部通过插槽名来管理。

6. **插槽存在性检测**：子组件可以通过 `$slots.name` 或 `useSlots()` 检测某个插槽是否有内容，用于条件渲染包裹元素。

7. **默认内容只在无传入时显示**：如果父组件传入了空内容（如空 `<template #header></template>`），默认内容也不会显示，因为 Vue 认为插槽已被使用。

8. **作用域插槽的性能**：作用域插槽会在每次父组件重新渲染时重新计算。对于大型列表，注意性能影响。

9. **与 `v-for` 一起使用**：`v-slot` 和 `v-for` 不能同时用在同一个元素上。需要嵌套使用：
   ```vue
   <!-- ❌ 错误 -->
   <template v-for="item in list" v-slot:item="props">...</template>

   <!-- ✅ 正确 -->
   <template v-for="item in list" :key="item.id">
     <template #item="props">...</template>
   </template>
   ```

10. **SSR 注意**：在 SSR 场景中，插槽内容会在服务端和客户端各渲染一次，确保插槽内容没有浏览器专属 API 调用。

### 七、相关 API 对比

| 特性 | `v-slot` | `props` | `provide/inject` |
|------|----------|---------|-------------------|
| 数据流向 | 子→父（作用域插槽） | 父→子 | 祖先→后代 |
| 用途 | 自定义组件内容区域 | 传递数据给子组件 | 跨层级传递数据 |
| 灵活性 | 最高（可传模板） | 中等（传值） | 中等（传值） |
| 使用场景 | 组件布局定制 | 组件参数配置 | 主题、配置、状态 |
| 编译作用域 | 父组件 | 子组件 | 注入方 |

### 八、总结

- `v-slot` 是 Vue 插槽机制的核心指令，用于在父组件中为子组件提供自定义内容
- 三种插槽类型：**默认插槽**（无名）、**具名插槽**（`#name`）、**作用域插槽**（子→父传数据）
- 缩写 `#` 等同于 `v-slot:`，日常开发优先使用缩写
- 只能用在 `<template>` 或组件标签上（组件上仅限默认插槽）
- 插槽内容在**父组件作用域**中编译，需要子组件数据时使用作用域插槽
- 适用于：UI 组件复用、布局系统、列表自定义渲染、表单组件、递归组件等场景
