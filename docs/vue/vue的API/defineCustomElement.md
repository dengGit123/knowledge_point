# defineCustomElement

使用 Vue 组件语法定义自定义元素（Web Components）。

## 作用

将 Vue 组件编译为标准的 Web Components（自定义元素），可以在任何框架或纯 HTML 项目中使用。

📖 [defineCustomElement](https://cn.vuejs.org/api/custom-elements.html#definecustomelement)

## 语法

```javascript
import { defineCustomElement } from 'vue'

customElements.define('my-element', defineCustomElement({
  // 组件选项
}))
```

## 参数

与 Vue 组件选项相同，另支持几个自定义元素专属选项：

- `styles`：`string[]`，要注入到 Shadow Root 的内联 CSS 字符串数组
- `configureApp`：`3.5+`，用于配置元素内部 Vue 应用实例的函数
- `shadowRoot`：`3.5+`，`boolean`，默认 `true`；设为 `false` 时不使用 Shadow Root 渲染
- `nonce`：`3.5+`，注入到 Shadow Root 的 `<style>` 上的 nonce 属性

## 返回值

返回一个继承自 `HTMLElement` 的自定义元素类构造器

## 基础用法

```javascript
import { defineCustomElement } from 'vue'

const MyElement = defineCustomElement({
  props: {
    message: String
  },
  template: `
    <div>{{ message }}</div>
  `,
  // 注意是字符串数组
  styles: [
    `div { color: red; }`
  ]
})

customElements.define('my-element', MyElement)
```

## 在 SFC 中使用

以 `.ce.vue` 结尾的 SFC 会被以「自定义元素模式」加载：`<style>` 会被内联为 CSS 字符串并挂到组件的 `styles` 选项上，由 `defineCustomElement` 注入 Shadow Root（也可以通过 `@vitejs/plugin-vue` 的 `customElement` 选项自定义匹配规则）。

```vue
<!-- MyElement.vue -->
<template>
  <div class="my-element">
    <p>{{ message }}</p>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Hello'
  }
})
</script>

<style scoped>
.my-element {
  border: 1px solid #ccc;
  padding: 10px;
}
</style>
```

```javascript
// main.js
import { defineCustomElement } from 'vue'
import MyElement from './MyElement.ce.vue'

const MyCustomElement = defineCustomElement(MyElement)
customElements.define('my-element', MyCustomElement)
```

## 使用自定义元素

```html
<!-- 在任何 HTML 中使用 -->
<my-element message="Hello World">
  <p>插槽内容</p>
</my-element>
```

## Props 作为属性

```javascript
const MyElement = defineCustomElement({
  props: {
    title: String,
    count: Number,
    active: Boolean
  },
  template: `
    <div>
      <h2>{{ title }}</h2>
      <p>Count: {{ count }}</p>
      <p>Active: {{ active }}</p>
    </div>
  `
})

customElements.define('my-element', MyElement)
```

```html
<!-- 使用 -->
<my-element
  title="My Title"
  count="42"
  active
></my-element>
```

## 事件发射

```javascript
const MyElement = defineCustomElement({
  emits: ['update', 'change'],
  setup(props, { emit }) {
    function handleClick() {
      emit('update', { value: 123 })
      emit('change', 456)
    }

    return { handleClick }
  },
  template: `
    <button @click="handleClick">
      点击触发事件
    </button>
  `
})

customElements.define('my-element', MyElement)
```

```html
<my-element @update="handleUpdate" @change="handleChange"></my-element>

<script>
document.querySelector('my-element').addEventListener('update', (e) => {
  // payload 以数组形式存放在 detail 中，取第一个参数
  console.log(e.detail[0]) // { value: 123 }
})
</script>
```

## 插槽支持

> ⚠️ **注意：** 自定义元素的插槽基于原生 `slot` 行为解析：**不支持作用域插槽**；具名插槽消费时用 `slot` attribute 而不是 `v-slot` 指令。

```javascript
const MyElement = defineCustomElement({
  template: `
    <div>
      <header>
        <slot name="header">默认标题</slot>
      </header>
      <main>
        <slot>默认内容</slot>
      </main>
      <footer>
        <slot name="footer">默认页脚</slot>
      </footer>
    </div>
  `
})
```

```html
<my-element>
  <h2 slot="header">自定义标题</h2>
  <p>自定义内容</p>
  <span slot="footer">自定义页脚</span>
</my-element>
```

## 生命周期

```javascript
import { onMounted, onUnmounted } from 'vue'

const MyElement = defineCustomElement({
  setup() {
    onMounted(() => {
      console.log('自定义元素已挂载')
    })

    onUnmounted(() => {
      console.log('自定义元素已卸载')
    })
  },
  template: `<div>Content</div>`
})
```

## 提供方法

```javascript
import { ref, defineExpose } from 'vue'

const MyElement = defineCustomElement({
  setup() {
    const count = ref(0)

    function increment() {
      count.value++
    }

    function getCount() {
      return count.value
    }

    // 暴露给外部
    defineExpose({
      increment,
      getCount
    })

    return { count }
  },
  template: `
    <div>
      <p>{{ count }}</p>
      <button @click="increment">增加</button>
    </div>
  `
})
```

```html
<my-element id="my-el"></my-element>

<script>
const el = document.getElementById('my-el')
el.increment()
console.log(el.getCount()) // 1
</script>
```

## Shadow DOM 样式隔离

```javascript
const MyElement = defineCustomElement({
  template: `
    <div class="container">
      <p class="text">样式隔离</p>
    </div>
  `,
  // 注意 styles 必须是字符串数组
  styles: [
    `
    .container {
      border: 2px solid blue;
      padding: 10px;
    }
    .text {
      color: red;
    }
  `
  ]
})
```

## 响应式属性

```javascript
import { watch } from 'vue'

const MyElement = defineCustomElement({
  props: {
    data: Object
  },
  setup(props) {
    watch(() => props.data, (newData) => {
      console.log('数据变化:', newData)
    }, { deep: true })
  },
  template: `
    <div>{{ JSON.stringify(data) }}</div>
  `
})
```

## 与 TypeScript 结合

```typescript
import { defineCustomElement, type PropType } from 'vue'

interface MyProps {
  title: string
  count?: number
}

const MyElement = defineCustomElement({
  props: {
    title: { type: String, required: true },
    count: Number as PropType<number>
  },
  setup(props) {
    console.log(props.title) // 类型安全
  },
  template: `<div>{{ title }}: {{ count }}</div>`
})

customElements.define('my-element', MyElement)
```

## 构建生产版本

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    })
  ],
  build: {
    lib: {
      entry: './src/my-element.js',
      name: 'MyElement',
      fileName: 'my-element'
    }
  }
})
```

## 注意事项

1. **浏览器支持**：需要支持 Web Components 的浏览器

2. **命名规则**：自定义元素名称必须包含连字符

3. **Props 行为**：
   - `props` 选项声明的属性会定义为元素上的 property，attribute 与 property 会自动双向映射
   - 基本类型值（`string` / `boolean` / `number`）会反射为 attribute；设置 attribute 时，声明为 `Boolean` / `Number` 的 prop 会自动做类型转换
   - 对象、数组等复杂类型只能通过 JS 设置 property 传入（attribute 只支持字符串）

4. **样式隔离**：默认使用 Shadow DOM 进行样式隔离（3.5+ 可用 `shadowRoot: false` 关闭）

5. **功能限制**：
   - 不支持作用域插槽
   - provide / inject 只在 Vue 定义的自定义元素之间生效，无法注入普通 Vue 组件提供的值

6. **事件差异**：
   - 事件通过原生 `CustomEvent` 派发
   - 额外参数（payload）以数组形式放在 `detail` 属性中

7. **生命周期**：元素首次连接到文档时挂载内部 Vue 实例；断开连接后经过一个微任务检查，确认已脱离文档才卸载

8. **最佳实践**：
   - 用于跨框架组件
   - 用于独立组件分发
   - 不需要在 Vue 应用中使用
