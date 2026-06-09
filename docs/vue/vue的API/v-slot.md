# v-slot

## 作用

`v-slot` 用于在父组件中为子组件的插槽提供内容。它支持**具名插槽**和**作用域插槽**两种主要用法。

简写形式为 `#`，即 `v-slot:header` 等同于 `#header`。

> [Vue 官方文档 - v-slot](https://cn.vuejs.org/api/built-in-directives#v-slot)

## 基本用法

### 默认插槽

```vue
<!-- 子组件 Child.vue -->
<template>
  <div class="card">
    <slot>默认内容（当父组件没有提供内容时显示）</slot>
  </div>
</template>

<!-- 父组件 -->
<template>
  <Child>
    <template v-slot:default>
      <p>这是传入的内容</p>
    </template>
  </Child>

  <!-- 简写：默认插槽可以直接写在组件标签内 -->
  <Child>
    <p>直接写在组件内的内容</p>
  </Child>
</template>
```

### 具名插槽

```vue
<!-- 子组件 Layout.vue -->
<template>
  <div class="layout">
    <header>
      <slot name="header">默认头部</slot>
    </header>
    <main>
      <slot name="default">默认内容</slot>
    </main>
    <footer>
      <slot name="footer">默认底部</slot>
    </footer>
  </div>
</template>

<!-- 父组件使用 -->
<template>
  <Layout>
    <template #header>
      <h1>页面标题</h1>
      <nav>导航菜单</nav>
    </template>

    <template #default>
      <p>主要内容区域</p>
    </template>

    <template #footer>
      <p>版权信息</p>
    </template>
  </Layout>
</template>
```

### 作用域插槽

```vue
<!-- 子组件 List.vue -->
<template>
  <ul>
    <li v-for="(item, index) in items" :key="item.id">
      <!-- 通过 slot 把数据传给父组件 -->
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
    <!-- 接收子组件传出的数据 -->
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

## 缩写形式

`#` 是 `v-slot:` 的缩写：

```vue
<template>
  <MyComponent>
    <!-- 完整语法 -->
    <template v-slot:header>头部内容</template>

    <!-- 缩写语法 -->
    <template #header>头部内容</template>

    <!-- 默认插槽的缩写 -->
    <template #default>默认内容</template>
  </MyComponent>
</template>
```

> **注意**：缩写 `#default` 在使用作用域插槽时必须显式写出，不能省略。

## 使用场景

### 1. 可复用表格组件

```vue
<!-- 子组件 DataTable.vue -->
<template>
  <table>
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.key">
          {{ col.title }}
        </th>
        <th v-if="$slots.actions">操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in data" :key="row.id">
        <td v-for="col in columns" :key="col.key">
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
    <!-- 自定义名称列 -->
    <template #name="{ row }">
      <strong>{{ row.name }}</strong>
    </template>

    <!-- 自定义状态列 -->
    <template #status="{ row }">
      <span :class="row.active ? 'text-green' : 'text-red'">
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
</script>
```

### 2. 布局组件

```vue
<!-- 子组件 PageLayout.vue -->
<template>
  <div class="page">
    <header class="page-header">
      <slot name="header">
        <h1>{{ title }}</h1>
      </slot>
    </header>

    <div class="page-sidebar">
      <slot name="sidebar" />
    </div>

    <main class="page-content">
      <slot />
    </main>

    <footer class="page-footer">
      <slot name="footer">
        <p>© 2024 版权所有</p>
      </slot>
    </footer>
  </div>
</template>

<script setup>
defineProps({
  title: String
})
</script>

<!-- 父组件 -->
<template>
  <PageLayout title="用户管理">
    <template #header>
      <div class="custom-header">
        <h1>用户管理</h1>
        <button @click="showAddDialog = true">添加用户</button>
      </div>
    </template>

    <template #sidebar>
      <nav>
        <a href="#">用户列表</a>
        <a href="#">角色管理</a>
      </nav>
    </template>

    <!-- 默认插槽：主内容区 -->
    <UserTable :users="users" />

    <template #footer>
      <p>自定义底部信息</p>
    </template>
  </PageLayout>
</template>
```

### 3. 动态插槽名

```vue
<template>
  <BaseComponent>
    <!-- 插槽名可以动态绑定 -->
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

### 4. 卡片组件

```vue
<!-- 子组件 Card.vue -->
<template>
  <div class="card" :class="[`card-${variant}`]">
    <div v-if="$slots.cover" class="card-cover">
      <slot name="cover" />
    </div>

    <div class="card-header">
      <slot name="title">
        <h3>{{ title }}</h3>
      </slot>
      <slot name="extra" />
    </div>

    <div class="card-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  variant: {
    type: String,
    default: 'default'
  }
})
</script>

<!-- 父组件 -->
<template>
  <Card title="商品信息" variant="bordered">
    <template #cover>
      <img src="product.jpg" alt="商品图片" />
    </template>

    <template #extra>
      <span class="price">¥99.00</span>
    </template>

    <p>这是一个非常好的商品...</p>

    <template #footer>
      <button @click="addToCart">加入购物车</button>
    </template>
  </Card>
</template>
```

### 5. 递归组件中的作用域插槽

```vue
<!-- 子组件 TreeNode.vue -->
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
        <!-- 透传作用域插槽 -->
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

<!-- 父组件 -->
<template>
  <TreeNode :node="treeData">
    <template #default="{ node, depth }">
      <span :style="{ paddingLeft: depth * 16 + 'px' }">
        {{ node.label }}
      </span>
    </template>
  </TreeNode>
</template>
```

### 6. 高级解构

```vue
<template>
  <UserList :users="users">
    <!-- 解构作用域插槽的 props，支持重命名和默认值 -->
    <template #default="{ item: user, index: i = 0 }">
      <div>
        <span>#{{ i + 1 }}</span>
        <span>{{ user.name }}</span>
        <span>{{ user.role }}</span>
      </div>
    </template>
  </UserList>
</template>
```

## 使用 render 函数中的插槽

```javascript
// 子组件
import { h } from 'vue'

export default {
  setup(props, { slots }) {
    return () => h('div', [
      // 具名插槽
      slots.header ? slots.header() : h('h2', '默认标题'),

      // 作用域插槽：向插槽传递数据
      slots.default
        ? slots.default({ item: { name: 'test' }, index: 0 })
        : h('p', '默认内容'),

      slots.footer?.()
    ])
  }
}
```

## 注意事项

### 1. v-slot 只能用在组件或 template 上

```vue
<template>
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
</template>
```

### 2. 组件上使用 v-slot 只能用于默认插槽

```vue
<template>
  <!-- ✅ 正确：组件上使用默认插槽 -->
  <MyComponent v-slot="slotProps">
    {{ slotProps.item }}
  </MyComponent>

  <!-- ❌ 错误：组件上不能使用具名插槽 -->
  <MyComponent v-slot:header="slotProps">
    {{ slotProps.item }}
  </MyComponent>

  <!-- ✅ 正确：具名插槽必须用 template -->
  <MyComponent>
    <template #header="slotProps">
      {{ slotProps.item }}
    </template>
  </MyComponent>
</template>
```

### 3. 插槽内容的编译作用域

```vue
<template>
  <!-- ⚠️ 插槽内容可以访问父组件的数据，不能访问子组件的数据 -->
  <ChildComponent>
    <template #default>
      <!-- ✅ 可以访问父组件的变量 -->
      <p>{{ parentMessage }}</p>

      <!-- ❌ 不能访问子组件的变量 -->
      <p>{{ childMessage }}</p>
    </template>
  </ChildComponent>
</template>
```

### 4. 插槽存在性检测

```vue
<template>
  <div>
    <!-- 子组件中检测插槽是否有内容 -->
    <div v-if="$slots.header" class="header">
      <slot name="header" />
    </div>

    <!-- 或者使用 useSlots -->
    <slot name="footer" v-if="slots.footer" />
  </div>
</template>

<script setup>
import { useSlots } from 'vue'
const slots = useSlots()
</script>
```

## 最佳实践

1. **优先使用缩写 `#`**：在模板中使用 `#header` 代替 `v-slot:header`，更简洁
2. **提供默认内容**：为插槽提供合理的默认内容，提升组件可用性
3. **检测插槽是否存在**：使用 `$slots.name` 或 `useSlots()` 检测插槽内容，条件渲染包裹元素
4. **作用域插槽命名**：解构时使用有意义的变量名，如 `{ item: user }` 增强可读性
5. **合理使用默认插槽的简写**：只有默认插槽时可以使用 `v-slot="props"` 的简写形式
