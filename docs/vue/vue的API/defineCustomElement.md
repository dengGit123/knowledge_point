# defineCustomElement

使用 Vue 组件语法定义自定义元素（Web Components）。

## 作用

将 Vue 组件编译为标准的 Web Components（自定义元素），可以在任何框架或纯 HTML 项目中使用。

> 官方文档：[defineCustomElement](https://cn.vuejs.org/api/general#definecustomelement)

## 语法

```javascript
import { defineCustomElement } from 'vue'

customElements.define('my-element', defineCustomElement({
  // 组件选项
}))
```

## 参数

与 Vue 组件选项相同，但有一些特殊规则

## 返回值

返回一个自定义元素类

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
  styles: `
    div { color: red; }
  `
})

customElements.define('my-element', MyElement)
```

## 在 SFC 中使用

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
import MyElement from './MyElement.vue'

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
  console.log(e.detail) // { value: 123 }
})
</script>
```

## 插槽支持

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
  styles: `
    .container {
      border: 2px solid blue;
      padding: 10px;
    }
    .text {
      color: red;
    }
  `
})
```

## 响应式属性

```javascript
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
import { defineCustomElement } from 'vue'

interface MyProps {
  title: string
  count?: number
}

const MyElement = defineCustomElement<MyProps>({
  props: {
    title: String,
    count: Number
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

3. **Props 限制**：
   - 只支持 `String`、`Number`、`Boolean` 类型
   - 复杂类型需要作为 JSON 字符串传递

4. **样式隔离**：默认使用 Shadow DOM 进行样式隔离

5. **不支持的功能**：
   - 不支持 `app.context`
   - 不支持 `inheritAttrs`
   - 不支持 `Transition` 组件

6. **事件差异**：
   - 事件通过 `CustomEvent` 发射
   - 数据在 `detail` 属性中

7. **最佳实践**：
   - 用于跨框架组件
   - 用于独立组件分发
   - 不需要在 Vue 应用中使用
