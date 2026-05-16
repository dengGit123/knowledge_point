# Vue 3 h 函数与 render 函数完全指南

> 本文档全面介绍 Vue 3 中 h 函数和 render 函数的使用，帮助你深入理解 Vue 的渲染机制。

## 目录

- [一、基础概念](#一基础概念)
- [二、h 函数详解](#二h-函数详解)
- [三、render 函数详解](#三render-函数详解)
- [四、VNode 深入理解](#四vnode-深入理解)
- [五、两者关系与对比](#五两者关系与对比)
- [六、使用场景](#六使用场景)
- [七、最佳实践](#七最佳实践)
- [八、常见问题与调试](#八常见问题与调试)
- [九、Vue 2 vs Vue 3 对比](#九vue-2-vs-vue-3-对比)

---

## 一、基础概念

### 1.1 什么是虚拟 DOM（Virtual DOM）

虚拟 DOM（Virtual DOM）是真实 DOM 的 JavaScript 对象表示，它是 Vue 渲染机制的核心。

```
┌─────────────────────────────────────────────────────────────┐
│                         渲染流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   模板 Template                                             │
│   ↓                                                         │
│   编译 Compile                                              │
│   ↓                                                         │
│   渲染函数 Render Function                                   │
│   ↓                                                         │
│   虚拟 DOM VNode                                            │
│   ↓                                                         │
│   Diff 算法比较                                             │
│   ↓                                                         │
│   真实 DOM Real DOM                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**代码对比**：

```javascript
// ========== 真实 DOM ==========
<div class="container">
  <h1>Hello</h1>
  <p>World</p>
</div>

// ========== 虚拟 DOM（VNode 对象） ==========
{
  __v_isVNode: true,
  type: 'div',
  props: {
    class: 'container'
  },
  children: [
    {
      type: 'h1',
      props: {},
      children: 'Hello'
    },
    {
      type: 'p',
      props: {},
      children: 'World'
    }
  ],
  key: null,
  ref: null,
  // ... 更多属性
}
```

**虚拟 DOM 的优势**：

| 优势 | 说明 | 实际效果 |
|------|------|----------|
| **性能优化** | 减少直接操作 DOM | 批量更新，减少重排重绘 |
| **Diff 算法** | 精准找出变化 | 只更新变化的部分 |
| **跨平台** | 不依赖浏览器 API | 可渲染到 Web、Native、SSR |
| **批量更新** | 合并多次操作 | 一次性更新 DOM |
| **可测试性** | 纯 JavaScript 对象 | 易于测试和调试 |

### 1.2 什么是 h 函数

**h** 是 **hyperscript** 的缩写，意思是"能生成 HTML 的 JavaScript"。h 函数是 Vue 提供的工具函数，用于创建虚拟节点（VNode）。

```javascript
// h 函数签名
h(type, props, children)

// 参数说明
// type    → 标签名、组件、异步组件、Fragment 等
// props   → 属性、事件、class、style 等（可选）
// children → 子节点（文本、数组、插槽等）（可选）
```

**命名由来**：

```
HyperScript
    ↓
    能生成 HTML 的脚本
    ↓
    简写为 "h"
```

### 1.3 什么是 render 函数

render 函数是 Vue 组件的一个选项，它返回虚拟 DOM 树。Vue 渲染组件时会优先使用 render 函数，如果没有 render 函数才会将 template 编译后执行。

```javascript
export default {
  render() {
    return h('div', 'Hello World')
  }
}
```

### 1.4 为什么需要学习 h 函数和 render 函数？

```
学习 h 函数和 render 函数的价值：

┌────────────────────────────────────────────────────────┐
│  1. 深入理解 Vue 底层原理                              │
│  2. 编写更灵活的组件（动态组件、高阶组件）              │
│  3. 性能优化（精确控制渲染）                            │
│  4. 理解 JSX 和模板编译过程                            │
│  5. 开发组件库和工具函数                                │
└────────────────────────────────────────────────────────┘
```

---

## 二、h 函数详解

### 2.1 基本语法

```javascript
import { h } from 'vue'

// 完整签名
h(type, props?, children?)

// 参数说明
// type    → string | Component | FunctionalComponent | AsyncComponent
// props   → object | null（可选）
// children → string | array | object | null（可选）
```

### 2.2 type 参数（类型参数）

type 参数决定了创建什么类型的虚拟节点。

```javascript
import { h } from 'vue'
import { Fragment, Teleport, Suspense } from 'vue'

// ========== 1. HTML 标签（字符串） ==========
h('div')
h('span')
h('input')
h('custom-element')  // 自定义元素

// ========== 2. 组件（导入的组件） ==========
import MyComponent from './MyComponent.vue'
h(MyComponent, { someProp: 'value' })

// ========== 3. 组件（字符串，动态组件） ==========
// 需要在 components 中注册或全局注册
h('my-component', { someProp: 'value' })

// ========== 4. 异步组件 ==========
const AsyncComp = defineAsyncComponent(() => import('./MyComp.vue'))
h(AsyncComp)

// ========== 5. 函数式组件 ==========
const FunctionalComp = (props, { slots, emit, attrs }) => {
  return h('div', `Hello ${props.name}`)
}
h(FunctionalComp, { name: 'Vue' })

// ========== 6. Fragment（文档片段） ==========
// Vue 3 支持多个根元素，使用 Fragment 包裹
h(Fragment, [
  h('h1', '标题'),
  h('p', '段落')
])
// 等价于（在 render 中）：
// return [h('h1', '标题'), h('p', '段落')]

// ========== 7. Teleport（传送门） ==========
h(Teleport, { to: 'body' }, [
  h('div', '传送到 body 的内容')
])

// ========== 8. Suspense（异步组件包装） ==========
h(Suspense, {}, {
  default: () => h(AsyncComp),
  fallback: () => h('div', '加载中...')
})

// ========== 9. null（空节点） ==========
h(null)  // 不渲染任何内容
```

### 2.3 props 参数（属性参数）- 完整指南

props 参数是 h 函数的第二个参数，用于设置元素或组件的各种属性。

```
┌─────────────────────────────────────────────────────────────┐
│                      props 对象结构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  {                                                          │
│    // DOM 属性                                               │
│    id: 'my-id',                                             │
│    href: 'https://...',                                     │
│                                                             │
│    // 布尔属性                                               │
│    disabled: true,                                          │
│    checked: false,                                          │
│                                                             │
│    // class 和 style                                        │
│    class: 'active',                                         │
│    style: { color: 'red' },                                 │
│                                                             │
│    // 事件监听（on 前缀）                                    │
│    onClick: () => {},                                       │
│    onKeyupEnter: () => {},                                  │
│                                                             │
│    // 组件 props                                            │
│    title: '标题',                                           │
│                                                             │
│    // 组件事件（on 前缀）                                    │
│    'onUpdate:modelValue': () => {},                         │
│                                                             │
│    // 特殊属性                                               │
│    key: 'unique',                                           │
│    ref: myRef                                               │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2.3.1 Props 参数分类表

| 类别 | 前缀/格式 | 说明 | 示例 |
|------|----------|------|------|
| **DOM 属性** | 无 | 标准 HTML 属性 | `id`, `href`, `src`, `type` |
| **布尔属性** | 无 | 值为 true/false 的属性 | `disabled`, `checked`, `hidden` |
| **class** | 无 | CSS 类名 | `class: 'container'` |
| **style** | 无 | 内联样式 | `style: { color: 'red' }` |
| **事件** | `on` + 事件名 | 事件监听器 | `onClick`, `onInput` |
| **组件 props** | 无 | 传递给组件的数据 | `title`, `count` |
| **特殊属性** | 无 | Vue 特殊属性 | `key`, `ref`, `slot` |

#### 2.3.2 DOM 属性

```javascript
import { h } from 'vue'

// ========== 基本属性 ==========
h('a', {
  id: 'my-link',              // 设置 id
  href: 'https://vuejs.org',  // 设置链接
  target: '_blank',           // 打开方式
  rel: 'noopener'             // 安全属性
}, 'Vue 官网')

// ========== 表单元素属性 ==========
h('input', {
  type: 'text',               // 输入类型
  name: 'username',           // 表单名称
  placeholder: '请输入用户名', // 占位文本
  required: true,             // 必填
  maxlength: 20,              // 最大长度
  minlength: 3,               // 最小长度
  pattern: '[a-z]+',          // 验证正则
  autocomplete: 'off',        // 自动完成
  readonly: false,            // 是否只读
  autofocus: true             // 自动聚焦
})

// ========== 图像属性 ==========
h('img', {
  src: '/logo.png',           // 图片路径
  alt: 'Logo',                // 替代文本
  width: 100,                 // 宽度
  height: 100,                // 高度
  loading: 'lazy',            // 懒加载
  crossorigin: 'anonymous'    // CORS 设置
})

// ========== 数据属性 ==========
h('div', {
  'data-id': 123,             // data-* 属性
  'data-name': 'product',     // 需要引号（带连字符）
  'data-json': JSON.stringify({ key: 'value' })
})

// ========== ARIA 属性（可访问性） ==========
h('button', {
  'aria-label': '关闭对话框',  // 标签
  'aria-expanded': 'false',   // 展开状态
  'aria-controls': 'dialog',  // 控制的元素
  'aria-live': 'polite',      // 动态区域
  role: 'button'              // 角色
})

// ========== 其他常用属性 ==========
h('div', {
  tabindex: 0,                // Tab 键顺序
  contenteditable: true,      // 可编辑
  spellcheck: true,           // 拼写检查
  draggable: true,            // 可拖拽
  hidden: false               // 隐藏元素
})
```

#### 2.3.3 布尔属性

布尔属性的值若为 `false`，该属性会被移除；若为 `true`，属性会被保留。

```javascript
import { h } from 'vue'

// 布尔属性列表
h('button', {
  disabled: false,    // 属性不存在（等价于不设置）
  disabled: true,     // 属性存在（<button disabled>）
  hidden: false,      // 元素可见
  hidden: true,       // 元素隐藏
  readonly: true,     // 只读
  checked: true,      // 选中
  selected: true,     // 选中
  multiple: true,     // 多选
  autoplay: true,     // 自动播放
  controls: true,     // 显示控件
  loop: true,         // 循环播放
  muted: true,        // 静音
  required: true,     // 必填
  allowfullscreen: true  // 允许全屏
})

// 动态布尔属性示例
export default {
  data() {
    return {
      isDisabled: false,
      isChecked: true,
      isRequired: true
    }
  },
  render() {
    return h('div', [
      h('input', {
        type: 'text',
        disabled: this.isDisabled,     // 根据状态动态设置
        required: this.isRequired
      }),
      h('input', {
        type: 'checkbox',
        checked: this.isChecked
      })
    ])
  }
}
```

#### 2.3.4 class 属性

class 属性支持字符串、数组、对象三种形式，以及它们的混合使用。

```javascript
import { h } from 'vue'

// ========== 1. 字符串形式 ==========
h('div', {
  class: 'container main-wrapper active'
})
// 渲染：<div class="container main-wrapper active">

// ========== 2. 数组形式 ==========
h('div', {
  class: ['container', 'main-wrapper', 'active']
})
// 渲染：<div class="container main-wrapper active">

// ========== 3. 对象形式（推荐：条件类名） ==========
h('div', {
  class: {
    container: true,           // 始终存在
    'main-wrapper': true,      // 带连字符需要引号
    active: isActive,          // 条件存在
    disabled: isDisabled       // 动态类名
  }
})

// ========== 4. 混合形式（数组 + 对象） ==========
h('div', {
  class: [
    'container',                      // 静态类名
    'main-wrapper',
    {                                 // 动态类名
      active: this.isActive,
      disabled: this.isDisabled
    },
    anotherClass                      // 变量引用
  ]
})

// ========== 5. 组件 class 合并 ==========
// 父组件传入的 class 会自动合并到子组件根元素
h(MyComponent, {
  class: 'parent-class'  // 会与组件自身的 class 合并
})

// ========== 6. 实际应用：动态按钮类名 ==========
export default {
  data() {
    return {
      size: 'large',           // 'small' | 'medium' | 'large'
      variant: 'primary',      // 'primary' | 'secondary' | 'danger'
      isLoading: false,
      isDisabled: false,
      isBlock: false
    }
  },
  render() {
    return h('button', {
      class: [
        // 基础类
        'btn',
        // 尺寸类
        `btn-${this.size}`,
        // 变体类
        `btn-${this.variant}`,
        // 状态类（条件）
        {
          'btn-loading': this.isLoading,
          'btn-disabled': this.isDisabled,
          'btn-block': this.isBlock
        }
      ],
      disabled: this.isDisabled || this.isLoading
    }, this.isLoading ? '加载中...' : '点击按钮')
  }
}
```

#### 2.3.5 style 属性

style 属性支持对象和数组形式，使用驼峰命名法。

```javascript
import { h } from 'vue'

// ========== 1. 对象形式（推荐） ==========
h('div', {
  style: {
    color: 'red',                // 颜色
    fontSize: '16px',            // 字号（驼峰）
    fontWeight: 'bold',          // 字重
    backgroundColor: '#f0f0f0',  // 背景色
    paddingTop: '10px',          // 内边距
    marginLeft: '20px',          // 左边距
    border: '1px solid #ccc',    // 边框
    borderRadius: '4px'          // 圆角
  }
})

// ========== 2. 数组形式（多个样式对象） ==========
h('div', {
  style: [
    { color: 'red' },
    { fontSize: '16px' },
    { fontWeight: 'bold' }
  ]
  // 合并后：color: 'red'; fontSize: '16px'; fontWeight: 'bold'
})

// ========== 3. 动态样式 ==========
export default {
  data() {
    return {
      color: 'red',
      fontSize: 16,
      opacity: 1,
      scale: 1
    }
  },
  render() {
    return h('div', {
      style: {
        color: this.color,
        fontSize: this.fontSize + 'px',
        opacity: this.isLoading ? 0.5 : 1,
        transform: `scale(${this.scale})`,
        // 计算属性样式
        width: 'calc(100% - 20px)',
        height: '100vh - 50px'
      }
    }, '动态样式')
  }
}

// ========== 4. CSS 变量 ==========
h('div', {
  style: {
    '--primary-color': '#007bff',
    '--secondary-color': '#6c757d',
    '--font-size': '16px',
    '--spacing': '10px'
  }
})

// ========== 5. 自动添加前缀的属性 ==========
h('div', {
  style: {
    display: ['-webkit-box', '-ms-flexbox', 'flex'],
    userSelect: 'none',         // 自动添加 -webkit-、-moz-、-ms-
    transition: 'all 0.3s'
  }
})

// ========== 6. 响应式样式 ==========
export default {
  data() {
    return {
      windowWidth: window.innerWidth
    }
  },
  mounted() {
    window.addEventListener('resize', () => {
      this.windowWidth = window.innerWidth
    })
  },
  render() {
    return h('div', {
      style: {
        fontSize: this.windowWidth < 768 ? '14px' : '16px',
        padding: this.windowWidth < 768 ? '8px' : '16px'
      }
    }, '响应式样式')
  }
}
```

#### 2.3.6 事件属性

事件属性以 `on` 开头，后跟事件名（首字母大写）。

```javascript
import { h } from 'vue'

// ========== 基本事件 ==========
h('button', {
  onClick: (event) => {
    console.log('点击事件', event)
    console.log('目标元素', event.target)
    console.log('当前目标', event.currentTarget)
    console.log('鼠标位置', event.clientX, event.clientY)
  }
}, '点击我')

// ========== 多个事件 ==========
h('input', {
  onFocus: (e) => console.log('获得焦点'),
  onBlur: (e) => console.log('失去焦点'),
  onInput: (e) => console.log('输入值:', e.target.value),
  onChange: (e) => console.log('值改变:', e.target.value),
  onKeydown: (e) => console.log('按键:', e.key),
  onKeyup: (e) => console.log('抬起:', e.key),
  onKeypress: (e) => console.log('按压:', e.key)
})

// ========== 事件修饰符规则 ==========
// 格式：on + 事件名 + 修饰符
// 链式：on + 事件名 + 修饰符1 + 修饰符2 + ...

h('div', {
  // 捕获模式（在捕获阶段触发，而非冒泡阶段）
  onClickCapture: () => console.log('捕获阶段点击'),

  // 只触发一次
  onClickOnce: () => console.log('只触发一次'),

  // 被动模式（提升滚动性能，不能调用 preventDefault）
  onWheelPassive: () => {},
  onTouchstartPassive: () => {},

  // 按键修饰符
  onKeyupEnter: () => console.log('回车键'),
  onKeyupEscape: () => console.log('ESC 键'),
  onKeyupSpace: () => console.log('空格键'),
  onKeyupTab: () => console.log('Tab 键'),
  onKeyupDelete: () => console.log('Delete/Backspace 键'),

  // 组合按键
  onKeyupCtrlEnter: () => console.log('Ctrl + Enter'),
  onKeyupShiftEscape: () => console.log('Shift + ESC'),
  onKeyupAltS: () => console.log('Alt + S'),

  // 鼠标修饰符
  onClickLeft: () => console.log('左键'),
  onClickRight: () => console.log('右键'),
  onClickMiddle: () => console.log('中键'),

  // 精确修饰符（只按下该按键，无其他组合）
  onClickCtrlExact: () => console.log('只按 Ctrl，没按其他键'),
  onKeyupShiftExact: () => console.log('只按 Shift')
})

// ========== 常用事件列表 ==========
const mouseEvents = {
  onClick: '点击',
  onDblclick: '双击',
  onMousemove: '鼠标移动',
  onMouseenter: '鼠标进入',
  onMouseleave: '鼠标离开',
  onMouseover: '鼠标悬停',
  onMouseout: '鼠标移出',
  onMousedown: '鼠标按下',
  onMouseup: '鼠标抬起'
}

const keyboardEvents = {
  onKeydown: '按键按下',
  onKeypress: '按键按压',
  onKeyup: '按键抬起'
}

const formEvents = {
  onFocus: '获得焦点',
  onBlur: '失去焦点',
  onInput: '输入中',
  onChange: '值改变',
  onSubmit: '表单提交',
  onReset: '表单重置'
}

const clipboardEvents = {
  onCopy: '复制',
  onCut: '剪切',
  onPaste: '粘贴'
}

// ========== 实际应用：表单处理 ==========
export default {
  data() {
    return {
      formData: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    handleSubmit(event) {
      event.preventDefault()  // 阻止默认行为
      console.log('提交表单', this.formData)
    }
  },
  render() {
    return h('form', {
      onSubmit: this.handleSubmit
    }, [
      h('input', {
        type: 'text',
        placeholder: '用户名',
        value: this.formData.username,
        onInput: (e) => {
          this.formData.username = e.target.value
        },
        onKeyup: (e) => {
          // 按回车自动聚焦到密码框
          if (e.key === 'Enter') {
            e.target.nextElementSibling?.focus()
          }
        }
      }),
      h('input', {
        type: 'password',
        placeholder: '密码',
        value: this.formData.password,
        onInput: (e) => {
          this.formData.password = e.target.value
        },
        onKeyupEnter: () => {
          this.handleSubmit()
        }
      }),
      h('button', { type: 'submit' }, '登录')
    ])
  }
}
```

#### 2.3.7 组件 Props

传递给组件的属性直接写在 props 对象中。

```javascript
import { h } from 'vue'
import MyButton from './MyButton.vue'

// ========== 基本用法 ==========
h(MyButton, {
  // 字符串
  title: '按钮标题',
  text: '点击我',

  // 数字
  count: 10,
  max: 100,
  size: 20,

  // 布尔
  disabled: false,
  loading: true,
  visible: true,

  // 数组
  items: ['a', 'b', 'c'],

  // 对象
  user: {
    name: 'John',
    age: 25
  },

  // 函数
  onClick: () => console.log('点击'),
  onSubmit: (data) => console.log('提交', data)
})

// ========== 动态传递 Props ==========
export default {
  data() {
    return {
      buttonProps: {
        variant: 'primary',
        size: 'large',
        disabled: false
      },
      additionalProps: {
        icon: 'search',
        loading: false
      }
    }
  },
  render() {
    // 使用展开运算符合并 props
    return h(MyButton, {
      ...this.buttonProps,
      ...this.additionalProps,
      onClick: this.handleClick
    })
  }
}

// ========== Props 验证 ==========
// 子组件定义
export default {
  name: 'MyButton',
  props: {
    type: {
      type: String,
      default: 'default',
      validator: (value) => {
        return ['default', 'primary', 'danger'].includes(value)
      }
    },
    size: {
      type: String,
      default: 'medium'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}

// 父组件使用
h(MyButton, {
  type: 'primary',
  size: 'large',
  disabled: false
})
```

#### 2.3.8 组件事件（emits）

组件事件使用 `on` + 事件名的形式。

```javascript
import { h } from 'vue'
import UserForm from './UserForm.vue'

// ========== 基本事件监听 ==========
h(UserForm, {
  onSubmit: (data) => console.log('表单提交:', data),
  onCancel: () => console.log('取消'),
  onError: (error) => console.error('错误:', error),
  onSuccess: () => console.log('成功')
})

// ========== v-model 事件（Vue 3） ==========
// 单个 v-model
h(SearchInput, {
  modelValue: this.searchText,
  'onUpdate:modelValue': (value) => {
    this.searchText = value
  }
})

// 多个 v-model
h(UserForm, {
  modelValue: this.formData,
  'onUpdate:modelValue': (value) => {
    this.formData = value
  },
  title: '用户表单',
  'onUpdate:title': (value) => {
    this.formTitle = value
  }
})

// ========== 完整示例：自定义输入框 ==========
// 父组件
export default {
  data() {
    return {
      searchText: '',
      formData: {
        name: '',
        email: ''
      }
    }
  },
  render() {
    return [
      // 单个 v-model 绑定
      h(SearchInput, {
        modelValue: this.searchText,
        placeholder: '请输入搜索内容',
        'onUpdate:modelValue': (value) => {
          this.searchText = value
        },
        onSearch: () => {
          console.log('搜索:', this.searchText)
        }
      }),

      // 表单 v-model
      h(UserForm, {
        modelValue: this.formData,
        'onUpdate:modelValue': (value) => {
          this.formData = value
        },
        onSubmit: (data) => {
          console.log('提交:', data)
        }
      })
    ]
  }
}

// 子组件（SearchInput）
export default {
  name: 'SearchInput',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请输入'
    }
  },
  emits: ['update:modelValue', 'search'],
  render() {
    return h('div', { class: 'search-input' }, [
      h('input', {
        type: 'text',
        placeholder: this.placeholder,
        value: this.modelValue,
        onInput: (e) => {
          this.$emit('update:modelValue', e.target.value)
        },
        onKeyupEnter: () => {
          this.$emit('search')
        }
      }),
      h('button', {
        onClick: () => {
          this.$emit('search')
        }
      }, '搜索')
    ])
  }
}
```

#### 2.3.9 特殊属性

Vue 有一些特殊属性，用于控制组件行为。

```javascript
import { h, ref } from 'vue'

export default {
  setup() {
    const inputRef = ref(null)

    return () => h('div', [
      // ========== key ==========
      // 用于 Vue 的 Diff 算法，标识节点的唯一性
      h('li', { key: 1 }, 'Item 1'),
      h('li', { key: 2 }, 'Item 2'),

      // 动态 key
      ...items.map(item =>
        h('li', { key: item.id }, item.name)
      ),

      // ========== ref ==========
      // 获取 DOM 元素或组件实例的引用
      h('input', {
        ref: inputRef
      }),

      // 使用 ref
      h('button', {
        onClick: () => {
          inputRef.value?.focus()
          inputRef.value?.blur()
          console.log(inputRef.value?.value)
        }
      }, '聚焦输入框'),

      // ref_for（配合 v-for 使用）
      ...items.map((item, index) =>
        h('div', {
          ref: (el) => { console.log('元素:', el, '索引:', index) },
          ref_for: true
        })
      ),

      // ========== slot ==========
      // 指定插槽名称
      h(MyComponent, {
        slot: 'header'
      }, '头部内容'),

      // ========== 生命周期钩子 ==========
      h('div', {
        onVnodeBeforeMount: (vnode) => console.log('节点挂载前', vnode),
        onVnodeMounted: (vnode) => console.log('节点挂载', vnode),
        onVnodeBeforeUpdate: (vnode, oldVnode) => console.log('节点更新前', vnode),
        onVnodeUpdated: (vnode, oldVnode) => console.log('节点更新', vnode),
        onVnodeBeforeUnmount: (vnode) => console.log('节点卸载前', vnode),
        onVnodeUnmounted: (vnode) => console.log('节点卸载', vnode)
      })
    ])
  }
}
```

#### 2.3.10 Props 参数速查表

```javascript
import { h } from 'vue'

// ========== 完整的 props 对象示例 ==========
const props = {
  // ========== DOM 属性 ==========
  id: 'my-element',
  href: 'https://example.com',
  src: '/image.png',
  alt: '描述',
  type: 'text',
  placeholder: '请输入',
  required: true,
  disabled: false,
  hidden: false,

  // ========== ARIA 属性 ==========
  'aria-label': '按钮',
  'aria-expanded': 'false',
  'aria-controls': 'menu',
  'aria-live': 'polite',
  role: 'button',

  // ========== 数据属性 ==========
  'data-id': 123,
  'data-name': 'example',

  // ========== class ==========
  class: {
    'container': true,
    'active': isActive,
    'disabled': isDisabled
  },

  // ========== style ==========
  style: {
    color: 'red',
    fontSize: '16px',
    '--primary-color': '#007bff'
  },

  // ========== 事件 ==========
  onClick: handleClick,
  onInput: handleInput,
  onKeyupEnter: handleSubmit,
  onClickOnce: handleOnce,
  onClickCapture: handleCapture,

  // ========== 组件 Props ==========
  title: '标题',
  count: 10,
  items: [],
  user: {},

  // ========== 组件事件 ==========
  onSubmit: handleSubmit,
  'onUpdate:modelValue': handleUpdate,

  // ========== 特殊属性 ==========
  key: 'unique-key',
  ref: elementRef,
  slot: 'header'
}

// 使用
h('div', props, '内容')
```

### 2.4 children 参数（子节点参数）

children 参数是 h 函数的第三个参数，用于定义节点的子内容。

```javascript
import { h } from 'vue'

// ========== 1. 字符串（文本节点） ==========
h('div', 'Hello World')
// 渲染：<div>Hello World</div>

h('p', '这是一段文字')
// 渲染：<p>这是一段文字</p>

// ========== 2. 数组（多个子节点） ==========
h('ul', [
  h('li', 'Item 1'),
  h('li', 'Item 2'),
  h('li', 'Item 3')
])

// ========== 3. VNode（虚拟节点） ==========
const child = h('span', '子节点')
h('div', child)
// 渲染：<div><span>子节点</span></div>

// ========== 4. 混合使用（文本 + 元素） ==========
h('div', [
  '前缀文本',
  h('span', '中间元素'),
  '后缀文本'
])
// 渲染：<div>前缀文本<span>中间元素</span>后缀文本</div>

// ========== 5. null/undefined（不渲染） ==========
h('div', null)        // 渲染：<div></div>
h('div', undefined)   // 渲染：<div></div>

// ========== 6. 数字（自动转换为字符串） ==========
h('div', 123)         // 渲染：<div>123</div>

// ========== 7. 布尔值（不渲染） ==========
h('div', true)        // 渲染：<div></div>
h('div', false)       // 渲染：<div></div>

// ========== 8. 数组中的 null/undefined ==========
h('ul', [
  h('li', 'Item 1'),
  null,                   // 会被忽略
  undefined,              // 会被忽略
  h('li', 'Item 2')
])
// 渲染：<ul><li>Item 1</li><li>Item 2</li></ul>
```

#### 2.4.1 插槽（Slots）

在 render 函数中使用插槽需要通过上下文对象访问。

```javascript
import { h } from 'vue'

// ========== 访问插槽（Options API） ==========
export default {
  render() {
    // 默认插槽
    const defaultSlot = this.$slots.default ? this.$slots.default() : []

    // 具名插槽
    const headerSlot = this.$slots.header ? this.$slots.header() : []
    const footerSlot = this.$slots.footer ? this.$slots.footer() : []

    return h('div', { class: 'container' }, [
      h('header', headerSlot),
      h('main', defaultSlot),
      h('footer', footerSlot)
    ])
  }
}

// ========== 访问插槽（Composition API） ==========
export default {
  setup(props, { slots }) {
    return () => h('div', { class: 'container' }, [
      // 默认插槽
      slots.default ? slots.default() : '',

      // 具名插槽
      slots.header ? slots.header() : '',
      slots.footer ? slots.footer() : ''
    ])
  }
}

// ========== 作用域插槽 ==========
// 父组件
export default {
  render() {
    return h(MyList, {
      items: [1, 2, 3]
    }, {
      // 作用域插槽（接收数据）
      default: (scope) => h('div', `值: ${scope.item}, 索引: ${scope.index}`)
    })
  }
}

// 子组件（MyList）
export default {
  props: {
    items: Array
  },
  setup(props, { slots }) {
    return () => h('ul',
      props.items.map((item, index) =>
        h('li', slots.default ? slots.default({ item, index }) : item)
      )
    )
  }
}
```

#### 2.4.2 children 参数详细用法

```javascript
import { h } from 'vue'

// ========== 单个子节点 ==========
// 字符串
h('div', '单个子节点')

// VNode
h('div', h('span', '嵌套元素'))

// ========== 多个子节点（数组） ==========
h('div', [
  h('p', '段落 1'),
  h('p', '段落 2'),
  h('p', '段落 3')
])

// ========== 条件渲染子节点 ==========
export default {
  data() {
    return {
      isLoggedIn: true,
      user: { name: 'John' }
    }
  },
  render() {
    // 方式 1：三元表达式
    return h('div', [
      this.isLoggedIn
        ? h('h1', `欢迎 ${this.user.name}`)
        : h('button', { onClick: () => this.isLoggedIn = true }, '登录')
    ])

    // 方式 2：if 语句
    // if (this.isLoggedIn) {
    //   return h('h1', `欢迎 ${this.user.name}`)
    // }
    // return h('button', { onClick: () => this.isLoggedIn = true }, '登录')

    // 方式 3：逻辑与（不推荐，会渲染注释节点）
    // return h('div', [
    //   this.isLoggedIn && h('h1', `欢迎 ${this.user.name}`)
    // ])
  }
}

// ========== 列表渲染子节点 ==========
export default {
  data() {
    return {
      items: [
        { id: 1, name: 'Item 1', active: true },
        { id: 2, name: 'Item 2', active: false },
        { id: 3, name: 'Item 3', active: true }
      ]
    }
  },
  render() {
    return h('ul', this.items.map(item =>
      h('li', {
        key: item.id,
        class: { active: item.active }
      }, item.name)
    ))
  }
}

// ========== Fragment 子节点 ==========
import { Fragment } from 'vue'

export default {
  render() {
    // 方式 1：使用 Fragment
    return h(Fragment, [
      h('h1', '标题'),
      h('p', '段落')
    ])

    // 方式 2：直接返回数组（Vue 3 支持）
    return [
      h('h1', '标题'),
      h('p', '段落')
    ]
  }
}
```

### 2.5 h 函数使用示例

#### 示例 1：基本元素创建

```javascript
import { h } from 'vue'

export default {
  render() {
    return h('div', { class: 'app' }, [
      h('h1', 'Hello Vue 3'),
      h('p', 'This is render function')
    ])
  }
}
```

#### 示例 2：创建带属性的元素

```javascript
import { h } from 'vue'

export default {
  data() {
    return {
      message: 'Hello',
      count: 0,
      isActive: true,
      isDisabled: false
    }
  },
  render() {
    return h('button', {
      class: ['btn', 'btn-primary', { active: this.isActive }],
      style: { color: 'blue', fontSize: '16px' },
      onClick: () => this.count++,
      disabled: this.count > 10
    }, `点击了 ${this.count} 次`)
  }
}
```

#### 示例 3：创建复杂表单

```javascript
import { h } from 'vue'

export default {
  data() {
    return {
      username: '',
      password: '',
      remember: false,
      errors: {}
    }
  },
  methods: {
    validate() {
      this.errors = {}
      if (!this.username) {
        this.errors.username = '请输入用户名'
      }
      if (!this.password) {
        this.errors.password = '请输入密码'
      }
      return Object.keys(this.errors).length === 0
    },
    handleSubmit() {
      if (this.validate()) {
        console.log('提交', { username: this.username, password: this.password })
      }
    }
  },
  render() {
    return h('form', {
      class: 'login-form',
      onSubmit: (e) => {
        e.preventDefault()
        this.handleSubmit()
      }
    }, [
      // 用户名输入框
      h('div', { class: 'form-group' }, [
        h('label', { for: 'username' }, '用户名'),
        h('input', {
          id: 'username',
          type: 'text',
          class: { 'error': this.errors.username },
          placeholder: '请输入用户名',
          value: this.username,
          onInput: (e) => {
            this.username = e.target.value
            delete this.errors.username
          }
        }),
        this.errors.username && h('span', { class: 'error-message' }, this.errors.username)
      ]),

      // 密码输入框
      h('div', { class: 'form-group' }, [
        h('label', { for: 'password' }, '密码'),
        h('input', {
          id: 'password',
          type: 'password',
          class: { 'error': this.errors.password },
          placeholder: '请输入密码',
          value: this.password,
          onInput: (e) => {
            this.password = e.target.value
            delete this.errors.password
          }
        }),
        this.errors.password && h('span', { class: 'error-message' }, this.errors.password)
      ]),

      // 记住我复选框
      h('div', { class: 'form-group' }, [
        h('label', [
          h('input', {
            type: 'checkbox',
            checked: this.remember,
            onChange: (e) => this.remember = e.target.checked
          }),
          '记住我'
        ])
      ]),

      // 提交按钮
      h('button', { type: 'submit', class: 'btn-primary' }, '登录')
    ])
  }
}
```

#### 示例 4：使用组件

```javascript
import { h } from 'vue'
import UserCard from './UserCard.vue'

export default {
  data() {
    return {
      users: [
        { id: 1, name: 'John', email: 'john@example.com', avatar: '/john.jpg' },
        { id: 2, name: 'Jane', email: 'jane@example.com', avatar: '/jane.jpg' }
      ],
      loading: false,
      error: null
    }
  },
  methods: {
    handleUserUpdate(newUser) {
      const index = this.users.findIndex(u => u.id === newUser.id)
      if (index !== -1) {
        this.users.splice(index, 1, newUser)
      }
    },
    handleUserDelete(userId) {
      this.users = this.users.filter(u => u.id !== userId)
    }
  },
  render() {
    return h('div', { class: 'user-list' }, [
      h('h2', '用户列表'),

      // 加载状态
      this.loading && h('div', { class: 'loading' }, '加载中...'),

      // 错误状态
      this.error && h('div', { class: 'error' }, this.error),

      // 用户列表
      !this.loading && !this.error && h('div', { class: 'list' },
        this.users.map(user =>
          h(UserCard, {
            key: user.id,
            user: user,
            onUpdate: this.handleUserUpdate,
            onDelete: this.handleUserDelete
          })
        )
      ),

      // 空状态
      !this.loading && !this.error && this.users.length === 0 &&
        h('div', { class: 'empty' }, '暂无用户数据')
    ])
  }
}
```

---

## 三、render 函数详解

### 3.1 render 函数基础

render 函数是 Vue 组件的一个选项，用于返回虚拟 DOM 树。

```javascript
export default {
  render() {
    // 返回 VNode
    return h('div', 'Hello World')
  }
}
```

### 3.2 render 函数签名与参数

#### Vue 2 的 render 函数

```javascript
// Vue 2
export default {
  render(createElement) {
    // createElement 就是 h 函数
    return createElement('div', 'Hello')
  }
}

// Vue 2 render 函数接收上下文参数
export default {
  render(h, context) {
    // h: createElement 函数
    // context: 包含 props, slots, data, parent, root 等信息
    return h('div', context.props.message)
  }
}
```

#### Vue 3 的 render 函数

```javascript
// Vue 3 - Options API
export default {
  render() {
    // 直接使用 h 函数（需要导入）
    return h('div', 'Hello')
  }
}

// Vue 3 - Composition API（setup 返回 render）
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)

    return () => h('button', {
      onClick: () => count.value++
    }, `点击了 ${count.value} 次`)
  }
}
```

### 3.3 Options API 的 render 函数

```javascript
import { h } from 'vue'

export default {
  name: 'MyComponent',
  props: {
    title: String,
    count: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      localCount: 0
    }
  },
  computed: {
    doubled() {
      return this.localCount * 2
    }
  },
  methods: {
    increment() {
      this.localCount++
    }
  },
  render() {
    return h('div', { class: 'counter' }, [
      h('h2', this.title),
      h('p', `计数: ${this.localCount}`),
      h('p', `双倍: ${this.doubled}`),
      h('button', {
        onClick: this.increment
      }, '增加')
    ])
  }
}
```

### 3.4 Composition API 的 render 函数

```javascript
import { h, ref, computed, watch, onMounted } from 'vue'

export default {
  props: {
    initialCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['update', 'change'],
  setup(props, { emit }) {
    const count = ref(props.initialCount)
    const doubled = computed(() => count.value * 2)

    // 监听变化
    watch(count, (newVal, oldVal) => {
      emit('change', { newVal, oldVal })
    })

    // 挂载后执行
    onMounted(() => {
      console.log('组件已挂载')
    })

    // 方法
    function increment() {
      count.value++
      emit('update', count.value)
    }

    function decrement() {
      count.value--
      emit('update', count.value)
    }

    // 返回 render 函数
    return () => h('div', { class: 'counter' }, [
      h('h2', '计数器'),
      h('p', `当前值: ${count.value}`),
      h('p', `双倍值: ${doubled.value}`),
      h('div', { class: 'controls' }, [
        h('button', {
          onClick: decrement,
          disabled: count.value <= 0
        }, '-'),
        h('button', { onClick: increment }, '+')
      ])
    ])
  }
}
```

### 3.5 render 函数完整示例

#### 示例 1：动态列表组件

```javascript
import { h, ref, computed } from 'vue'

export default {
  name: 'DynamicList',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    itemKey: {
      type: String,
      default: 'id'
    },
    selectable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select', 'delete', 'update'],
  setup(props, { emit }) {
    const selectedIndex = ref(-1)
    const hoveredIndex = ref(-1)

    const hasItems = computed(() => props.items.length > 0)

    function handleSelect(item, index) {
      if (props.selectable) {
        selectedIndex.value = selectedIndex.value === index ? -1 : index
        emit('select', item)
      }
    }

    function handleDelete(event, item) {
      event.stopPropagation()
      emit('delete', item)
    }

    return () => {
      if (!hasItems.value) {
        return h('div', { class: 'empty-state' }, '暂无数据')
      }

      return h('ul', { class: 'dynamic-list' },
        props.items.map((item, index) =>
          h('li', {
            key: item[props.itemKey],
            class: {
              'list-item': true,
              'selected': selectedIndex.value === index,
              'hovered': hoveredIndex.value === index
            },
            onClick: () => handleSelect(item, index),
            onMouseenter: () => { hoveredIndex.value = index },
            onMouseleave: () => { hoveredIndex.value = -1 }
          }, [
            // 内容
            h('span', { class: 'item-content' },
              item.name || item.title || JSON.stringify(item)
            ),

            // 删除按钮
            h('button', {
              class: 'delete-btn',
              onClick: (e) => handleDelete(e, item),
              title: '删除'
            }, '×')
          ])
        )
      )
    }
  }
}
```

#### 示例 2：模态框组件

```javascript
import { h, ref, watch, Transition } from 'vue'

export default {
  name: 'Modal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '提示'
    },
    content: String,
    width: {
      type: String,
      default: '500px'
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    showCancel: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'confirm', 'cancel', 'close'],
  setup(props, { emit }) {
    const isVisible = ref(props.modelValue)

    watch(() => props.modelValue, (val) => {
      isVisible.value = val
    })

    function close() {
      isVisible.value = false
      emit('update:modelValue', false)
      emit('close')
    }

    function handleCancel() {
      emit('cancel')
      close()
    }

    function handleConfirm() {
      emit('confirm')
      close()
    }

    function handleOverlayClick(event) {
      if (event.target === event.currentTarget) {
        close()
      }
    }

    return () => isVisible.value
      ? h(Transition, {
        name: 'modal',
        onEnter: (el) => {
          el.style.opacity = '0'
          el.style.transform = 'scale(0.9)'
        },
        onAfterEnter: (el) => {
          el.style.opacity = '1'
          el.style.transform = 'scale(1)'
        },
        onLeave: (el) => {
          el.style.opacity = '0'
          el.style.transform = 'scale(0.9)'
        }
      }, () => [
        h('div', {
          class: 'modal-overlay',
          onClick: handleOverlayClick
        }, [
          h('div', {
            class: 'modal',
            style: { width: props.width },
            onClick: (e) => e.stopPropagation()
          }, [
            // 头部
            h('div', { class: 'modal-header' }, [
              h('h3', { class: 'modal-title' }, props.title),
              h('button', {
                class: 'modal-close',
                onClick: close,
                'aria-label': '关闭'
              }, '×')
            ]),

            // 内容
            h('div', { class: 'modal-body' },
              props.content || h('div', (slots.default ? slots.default() : ''))
            ),

            // 底部
            h('div', { class: 'modal-footer' }, [
              props.showCancel && h('button', {
                class: 'btn btn-cancel',
                onClick: handleCancel
              }, props.cancelText),
              h('button', {
                class: 'btn btn-confirm',
                onClick: handleConfirm
              }, props.confirmText)
            ])
          ])
        ])
      ])
      : null
  }
}
```

#### 示例 3：虚拟滚动列表

```javascript
import { h, ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'VirtualList',
  props: {
    items: {
      type: Array,
      required: true
    },
    itemHeight: {
      type: Number,
      default: 50
    },
    visibleCount: {
      type: Number,
      default: 10
    },
    bufferCount: {
      type: Number,
      default: 3
    }
  },
  setup(props) {
    const scrollTop = ref(0)
    const containerRef = ref(null)

    const totalHeight = computed(() => props.items.length * props.itemHeight)
    const bufferSize = props.itemHeight * props.bufferCount

    const startIndex = computed(() => {
      return Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.bufferCount)
    })

    const endIndex = computed(() => {
      return Math.min(
        props.items.length,
        startIndex.value + props.visibleCount + props.bufferCount * 2
      )
    })

    const visibleItems = computed(() => {
      return props.items.slice(startIndex.value, endIndex.value)
    })

    const offsetY = computed(() => {
      return startIndex.value * props.itemHeight
    })

    function handleScroll(event) {
      scrollTop.value = event.target.scrollTop
    }

    return () => h('div', {
      ref: containerRef,
      class: 'virtual-list',
      onScroll: handleScroll,
      style: {
        height: `${props.visibleCount * props.itemHeight}px`,
        overflow: 'auto'
      }
    }, [
      h('div', {
        style: {
          height: `${totalHeight.value}px`,
          position: 'relative'
        }
      }, [
        h('div', {
          style: {
            transform: `translateY(${offsetY.value}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }
        }, visibleItems.value.map((item, index) =>
          h('div', {
            key: item.id || index,
            style: {
              height: `${props.itemHeight}px`,
              boxSizing: 'border-box'
            },
            class: 'virtual-list-item'
          }, item.name || item.title || JSON.stringify(item))
        ))
      ])
    ])
  }
}
```

---

## 四、VNode 深入理解

### 4.1 VNode 结构

VNode（Virtual Node）是虚拟 DOM 的基本单位。

```javascript
// VNode 对象结构
const vnode = {
  // 类型标识
  __v_isVNode: true,
  __v_skip: true,

  // 节点类型
  type: 'div',        // string | Component | Fragment | Text | Comment 等
  props: { ... },     // 属性、事件、class、style 等
  children: [],       // 子节点
  key: null,          // Diff 算法使用
  ref: null,          // 模板引用
  scopeId: null,      // 作用域 ID（scoped styles）

  // 内部属性
  shapeFlag: 16,      // 形状标志（标识节点类型）
  patchFlag: 0,       // 补丁标志（标识需要更新的属性）
  dynamicProps: null, // 动态属性
  dynamicChildren: null,  // 动态子节点

  // 其他
  anchor: null,       // Fragment 锚点
  target: null,       // Teleport 目标
  targetAnchor: null, // Teleport 锚点
  staticCount: 0,     // 静态节点计数
  suspense: null,     // Suspense 边界
  ssContent: null,    // SSR 内容
  ssFallback: null,   // SSR 后备内容
  dirs: null          // 指令
}
```

### 4.2 VNode 类型

```javascript
import { h, Fragment, Text, Comment, Static } from 'vue'

// ========== 1. 元素 VNode ==========
const elementVNode = h('div', '内容')

// ========== 2. 组件 VNode ==========
const componentVNode = h(MyComponent, { prop: 'value' })

// ========== 3. 文本 VNode ==========
const textVNode = h(Text, '纯文本')

// ========== 4. 注释 VNode ==========
const commentVNode = h(Comment, '这是一个注释')

// ========== 5. Fragment VNode ==========
const fragmentVNode = h(Fragment, [
  h('h1', '标题'),
  h('p', '段落')
])

// ========== 6. 静态 VNode ==========
const staticVNode = h(Static, h('div', '静态内容'))

// ========== 7. Teleport VNode ==========
const teleportVNode = h(Teleport, { to: 'body' }, [
  h('div', '传送的内容')
])
```

### 4.3 VNode 的 ShapeFlag

ShapeFlag 用于标识 VNode 的类型，Vue 内部使用它来优化渲染。

```javascript
// ShapeFlag 枚举
export const ShapeFlags = {
  ELEMENT: 1,        // HTML 元素
  FUNCTIONAL_COMPONENT: 2,   // 函数式组件
  STATEFUL_COMPONENT: 4,     // 有状态组件
  TEXT_CHILDREN: 8,          // 文本子节点
  ARRAY_CHILDREN: 16,        // 数组子节点
  SLOTS_CHILDREN: 32,        // 插槽子节点
  TELEPORT: 64,              // Teleport
  SUSPENSE: 128,             // Suspense
  COMPONENT_SHOULD_KEEP_ALIVE: 256,  // KeepAlive
  COMPONENT_KEPT_ALIVE: 512,          // 已 KeepAlive
  COMPONENT: 6                   // 组件（| 2 | 4）
}

// 示例
const elementVNode = {
  type: 'div',
  shapeFlag: 1 | 16  // ELEMENT | ARRAY_CHILDREN
}

const componentVNode = {
  type: MyComponent,
  shapeFlag: 4 | 32  // STATEFUL_COMPONENT | SLOTS_CHILDREN
}
```

### 4.4 VNode 的 PatchFlag

PatchFlag 用于标识哪些属性是动态的，Vue 使用它来优化更新。

```javascript
// PatchFlag 枚举
export const PatchFlags = {
  TEXT: 1,                 // 动态文本内容
  CLASS: 1 << 1,           // 动态 class
  STYLE: 1 << 2,           // 动态 style
  PROPS: 1 << 3,           // 动态属性（不含 class/style）
  FULL_PROPS: 1 << 4,      // 有动态 key 的属性
  HYDRATE_EVENTS: 1 << 5,   // 有事件监听器
  STABLE_FRAGMENT: 1 << 6,  // 稳定的 Fragment（子节点顺序不变）
  KEYED_FRAGMENT: 1 << 7,   // 带 key 的 Fragment
  UNKEYED_FRAGMENT: 1 << 8, // 不带 key 的 Fragment
  NEED_PATCH: 1 << 9,       // 需要完整的 patch
  DYNAMIC_SLOTS: 1 << 10,   // 动态插槽
  DEV_ROOT_FRAGMENT: 1 << 11,  // 仅开发环境
  HOISTED: -1,              // 静态提升的节点
  BAIL: -2                  // Diff 算法优化
}

// 示例
const dynamicClassVNode = h('div', {
  class: { active: isActive }
})
// patchFlag: 2 (CLASS)

const dynamicTextVNode = h('div', message)
// patchFlag: 1 (TEXT)
```

### 4.5 手动创建 VNode

```javascript
import { createVNode, Text, Fragment } from 'vue'

// 创建元素 VNode
const element = createVNode('div', { class: 'app' }, '内容')

// 创建文本 VNode
const text = createVNode(Text, '文本内容')

// 创建 Fragment VNode
const fragment = createVNode(Fragment, null, [
  createVNode('h1', '标题'),
  createVNode('p', '段落')
])

// 创建注释 VNode
const comment = createVNode('注释内容', null, Comment)

// 合并 VNode
import { mergeProps } from 'vue'
const mergedProps = mergeProps(
  { class: 'a' },
  { class: 'b' },
  { onClick: () => {} }
)
// { class: 'a b', onClick: () => {} }
```

---

## 五、两者关系与对比

### 5.1 本质关系

```
┌─────────────────────────────────────────────────────────────┐
│                      Vue 渲染流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. 开发者编写代码                                          │
│      ├── template 模板                                       │
│      ├── render 函数                                         │
│      └── JSX                                                │
│                                                             │
│   2. 编译阶段（template 专属）                                │
│      ├── 模板解析                                            │
│      ├── 优化标记                                            │
│      └── 生成渲染函数                                        │
│                                                             │
│   3. 运行阶段                                                │
│      ├── 执行 render 函数                                    │
│      ├── 调用 h 函数创建 VNode                               │
│      ├── 生成 VNode 树                                       │
│      └── Diff 算法比较                                       │
│                                                             │
│   4. 渲染阶段                                                │
│      ├── 创建/更新真实 DOM                                   │
│      └── 挂载到页面                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 编译过程对比

```javascript
// ========== 1. 模板写法 ==========
<template>
  <div class="container">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
  </div>
</template>

// ========== 2. 编译后的 render 函数（简化版） ==========
import { h } from 'vue'

export default {
  render() {
    return h('div', { class: 'container' }, [
      h('h1', this.title),
      h('p', this.message)
    ])
  }
}

// ========== 3. 更详细的编译结果 ==========
// 实际编译后会有更多的优化标记
export default {
  render(_ctx, _cache) {
    return h('div', { class: 'container' }, [
      h('h1', null, _ctx.title),       // patchFlag: 1 (TEXT)
      h('p', null, _ctx.message)       // patchFlag: 1 (TEXT)
    ])
  }
}

// ========== 4. 查看编译结果 ==========
// 在浏览器控制台
const component = document.querySelector('#app').__vueParentComponent
console.log(component.$.render)
```

### 5.3 语法对比

| 特性 | template | render + h | JSX |
|------|----------|-----------|-----|
| **语法** | HTML-like | JavaScript | JavaScript 扩展 |
| **可读性** | 高 | 低 | 中 |
| **灵活性** | 低 | 高 | 高 |
| **学习成本** | 低 | 高 | 中 |
| **编译优化** | 是 | 否 | 部分 |
| **类型推导** | 弱 | 强 | 强 |
| **调试难度** | 易 | 难 | 中 |

### 5.4 使用方式对比

```javascript
// ========== template 写法 ==========
<template>
  <div class="counter">
    <h1>计数器</h1>
    <p>当前值: {{ count }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<script>
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>

// ========== render + h 写法 ==========
import { h } from 'vue'

export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  render() {
    return h('div', { class: 'counter' }, [
      h('h1', '计数器'),
      h('p', `当前值: ${this.count}`),
      h('button', {
        onClick: this.increment
      }, '增加')
    ])
  }
}

// ========== setup + render 写法 ==========
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)

    return () => h('div', { class: 'counter' }, [
      h('h1', '计数器'),
      h('p', `当前值: ${count.value}`),
      h('button', {
        onClick: () => count.value++
      }, '增加')
    ])
  }
}

// ========== JSX 写法 ==========
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const count = ref(0)

    return () => (
      <div class="counter">
        <h1>计数器</h1>
        <p>当前值: {count.value}</p>
        <button onClick={() => count.value++}>增加</button>
      </div>
    )
  }
})
```

---

## 六、使用场景

### 6.1 推荐使用 render 函数的场景

#### 场景 1：动态组件生成

根据配置动态生成表单、表格等组件。

```javascript
import { h } from 'vue'

export default {
  props: {
    schema: {
      type: Array,
      default: () => [
        { type: 'input', key: 'username', label: '用户名', required: true },
        { type: 'password', key: 'password', label: '密码', required: true },
        { type: 'email', key: 'email', label: '邮箱' },
        { type: 'checkbox', key: 'agree', label: '同意协议' },
        { type: 'select', key: 'role', label: '角色', options: ['user', 'admin'] }
      ]
    }
  },
  data() {
    return {
      formData: {},
      errors: {}
    }
  },
  render() {
    return h('form', {
      class: 'dynamic-form',
      onSubmit: (e) => {
        e.preventDefault()
        this.$emit('submit', this.formData)
      }
    }, this.schema.map(field => {
      // 根据类型生成不同的表单元素
      const inputEl = this.renderField(field)

      return h('div', { class: 'form-item' }, [
        h('label', { for: field.key }, [
          field.label,
          field.required && h('span', { class: 'required' }, '*')
        ]),
        inputEl,
        this.errors[field.key] && h('span', { class: 'error' }, this.errors[field.key])
      ])
    }))
  },
  methods: {
    renderField(field) {
      const commonProps = {
        id: field.key,
        name: field.key,
        value: this.formData[field.key],
        placeholder: `请输入${field.label}`,
        onInput: (e) => {
          this.formData[field.key] = e.target.value
          delete this.errors[field.key]
        }
      }

      switch (field.type) {
        case 'input':
          return h('input', { ...commonProps, type: 'text' })
        case 'password':
          return h('input', { ...commonProps, type: 'password' })
        case 'email':
          return h('input', { ...commonProps, type: 'email' })
        case 'checkbox':
          return h('input', {
            id: field.key,
            type: 'checkbox',
            checked: this.formData[field.key],
            onChange: (e) => {
              this.formData[field.key] = e.target.checked
            }
          })
        case 'select':
          return h('select', {
            ...commonProps,
            value: this.formData[field.key] || '',
            onChange: (e) => {
              this.formData[field.key] = e.target.value
            }
          }, [
            h('option', { value: '' }, '请选择'),
            ...(field.options || []).map(opt =>
              h('option', { value: opt }, opt)
            )
          ])
        default:
          return h('input', { ...commonProps, type: 'text' })
      }
    }
  }
}
```

#### 场景 2：组件包装/高阶组件

包装现有组件，添加额外功能。

```javascript
import { h } from 'vue'

// Loading 包装器
export default {
  name: 'LoadingWrapper',
  props: {
    isLoading: Boolean,
    loadingComponent: Object,
    error: String,
    empty: Boolean,
    emptyText: {
      type: String,
      default: '暂无数据'
    }
  },
  render() {
    // 加载状态
    if (this.isLoading) {
      return h(this.loadingComponent || 'div', {
        class: 'loading-wrapper'
      }, '加载中...')
    }

    // 错误状态
    if (this.error) {
      return h('div', { class: 'error-wrapper' }, [
        h('p', { class: 'error-message' }, this.error),
        h('button', {
          onClick: () => this.$emit('retry')
        }, '重试')
      ])
    }

    // 空状态
    if (this.empty) {
      return h('div', { class: 'empty-wrapper' }, this.emptyText)
    }

    // 正常渲染默认插槽
    return this.$slots.default ? this.$slots.default() : null
  }
}

// 使用
<loading-wrapper
  :is-loading="loading"
  :error="error"
  :empty="items.length === 0"
  @retry="fetchData"
>
  <data-list :items="items" />
</loading-wrapper>
```

#### 场景 3：函数式组件

无状态、无实例的轻量级组件。

```javascript
import { h } from 'vue'

// 函数式组件
const SmartButton = (props, { slots, emit }) => {
  const { type = 'default', size = 'medium', loading = false, disabled = false } = props

  return h('button', {
    class: [
      'btn',
      `btn-${type}`,
      `btn-${size}`,
      { 'btn-loading': loading, 'btn-disabled': disabled }
    ],
    disabled: disabled || loading,
    onClick: () => emit('click')
  }, loading ? [h('span', { class: 'spinner' }), '加载中...'] : slots.default?.())
}

// 定义 props 和 emits
SmartButton.props = {
  type: {
    type: String,
    validator: (value) => ['default', 'primary', 'danger', 'success'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  loading: Boolean,
  disabled: Boolean
}

SmartButton.emits = ['click']

export default SmartButton
```

#### 场景 4：过渡动画控制

精确控制动画的各个阶段。

```javascript
import { h, Transition } from 'vue'

export default {
  props: {
    show: Boolean,
    name: {
      type: String,
      default: 'fade'
    },
    duration: {
      type: Number,
      default: 300
    }
  },
  render() {
    return h(Transition, {
      name: this.name,
      onBeforeEnter: (el) => {
        el.style.transitionDuration = `${this.duration}ms`
        console.log('before enter', el)
      },
      onEnter: (el, done) => {
        console.log('enter', el)
        // 使用 requestAnimationFrame 确保 DOM 更新
        requestAnimationFrame(() => {
          requestAnimationFrame(done))
        })
      },
      onAfterEnter: (el) => {
        console.log('after enter', el)
        this.$emit('after-enter')
      },
      onBeforeLeave: (el) => {
        console.log('before leave', el)
      },
      onLeave: (el, done) => {
        console.log('leave', el)
        setTimeout(done, this.duration)
      },
      onAfterLeave: (el) => {
        console.log('after leave', el)
        this.$emit('after-leave')
      }
    }, () => this.show ? this.$slots.default?.() : null)
  }
}
```

#### 场景 5：性能优化（虚拟滚动）

```javascript
import { h, ref, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'VirtualScroll',
  props: {
    items: {
      type: Array,
      required: true
    },
    itemHeight: {
      type: Number,
      default: 50
    },
    containerHeight: {
      type: Number,
      default: 400
    }
  },
  setup(props) {
    const scrollTop = ref(0)
    const containerRef = ref(null)

    const visibleCount = computed(() =>
      Math.ceil(props.containerHeight / props.itemHeight) + 2
    )

    const startIndex = computed(() => {
      return Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - 1)
    })

    const endIndex = computed(() =>
      Math.min(props.items.length, startIndex.value + visibleCount.value)
    )

    const visibleItems = computed(() =>
      props.items.slice(startIndex.value, endIndex.value)
    )

    const offsetY = computed(() =>
      startIndex.value * props.itemHeight
    )

    const totalHeight = computed(() =>
      props.items.length * props.itemHeight
    )

    function handleScroll(e) {
      scrollTop.value = e.target.scrollTop
    }

    return () => h('div', {
      ref: containerRef,
      class: 'virtual-scroll',
      style: {
        height: `${props.containerHeight}px`,
        overflow: 'auto',
        position: 'relative'
      },
      onScroll: handleScroll
    }, [
      h('div', {
        style: {
          height: `${totalHeight.value}px`,
          position: 'relative'
        }
      }, [
        h('div', {
          style: {
            transform: `translateY(${offsetY.value}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }
        }, visibleItems.value.map((item, index) =>
          h('div', {
            key: item.id || startIndex.value + index,
            style: {
              height: `${props.itemHeight}px`,
              boxSizing: 'border-box',
              borderBottom: '1px solid #eee'
            }
          }, item.name || item.title || JSON.stringify(item))
        ))
      ])
    ])
  }
}
```

### 6.2 不推荐使用 render 函数的场景

| 场景 | 原因 | 推荐 |
|------|------|------|
| **简单页面结构** | 降低可读性 | template |
| **团队不熟悉** | 维护困难 | template 或 JSX |
| **需要 SEO 优化** | SSR 支持较弱 | template |
| **复杂嵌套结构** | 代码可读性差 | template |
| **需要模板编译优化** | 无法享受编译优化 | template |

---

## 七、最佳实践

### 7.1 性能优化

```javascript
import { h } from 'vue'

export default {
  render() {
    // ❌ 不推荐：每次渲染创建新对象
    return h('div', {
      style: { color: 'red', fontSize: '16px' }
    }, '内容')

    // ✅ 推荐：缓存静态属性
    const staticStyle = { color: 'red', fontSize: '16px' }
    return h('div', { style: staticStyle }, '内容')
  }
}

// ========== 使用工厂函数 ==========
export default {
  setup() {
    // 预定义样式对象
    const buttonStyles = {
      primary: { class: 'btn btn-primary', style: { color: 'white' } },
      danger: { class: 'btn btn-danger', style: { color: 'white' } },
      default: { class: 'btn', style: { color: '#333' } }
    }

    return (props) => {
      const style = buttonStyles[props.type] || buttonStyles.default
      return h('button', style, props.text)
    }
  }
}
```

### 7.2 可读性优化

```javascript
import { h } from 'vue'

export default {
  render() {
    // ❌ 不推荐：嵌套过深
    return h('div',
      h('div',
        h('ul',
          h('li',
            h('span', '深层嵌套')
          )
        )
      )
    )

    // ✅ 推荐：拆分为变量
    const content = h('span', '内容')
    const item = h('li', content)
    const list = h('ul', item)
    const inner = h('div', list)
    return h('div', inner)

    // ✅ 推荐：拆分为函数
    return h('div', [
      this.renderHeader(),
      this.renderBody(),
      this.renderFooter()
    ])
  },
  methods: {
    renderHeader() {
      return h('header', [
        h('h1', '标题'),
        h('button', {
          onClick: this.close,
          'aria-label': '关闭'
        }, '×')
      ])
    },
    renderBody() {
      return h('main', this.$slots.default?.())
    },
    renderFooter() {
      return h('footer', '版权信息')
    }
  }
}
```

### 7.3 TypeScript 类型安全

```typescript
import { h, VNode, FunctionalComponent, PropType } from 'vue'

// ========== 定义 Props 类型 ==========
interface ButtonProps {
  type?: 'primary' | 'default' | 'danger' | 'success'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

// ========== 函数式组件类型定义 ==========
const MyButton: FunctionalComponent<ButtonProps> = (
  props,
  { slots, emit }
) => {
  return h('button', {
    class: [
      'btn',
      `btn-${props.type || 'default'}`,
      `btn-${props.size || 'medium'}`,
      { 'btn-loading': props.loading, 'btn-disabled': props.disabled }
    ],
    onClick: props.onClick,
    disabled: props.disabled || props.loading
  }, props.loading ? '加载中...' : slots.default?.())
}

// 定义 props
MyButton.props = {
  type: String,
  size: String,
  disabled: Boolean,
  loading: Boolean,
  onClick: Function
}

// 定义 emits
MyButton.emits = ['click']

export default MyButton

// ========== 带类型推断的 render 函数 ==========
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'TypedComponent',
  props: {
    items: {
      type: Array as PropType<{ id: number; name: string }[]>,
      required: true
    },
    onSelect: {
      type: Function as PropType<(item: { id: number; name: string }) => void>,
      required: true
    }
  },
  setup(props) {
    return () => h('ul',
      props.items.map(item =>
        h('li', {
          key: item.id,
          onClick: () => props.onSelect(item)
        }, item.name)
      )
    )
  }
})
```

### 7.4 辅助函数封装

```javascript
import { h } from 'vue'

// ========== 创建带 class 的元素 ==========
function cls(tag, className, children) {
  return h(tag, { class: className }, children)
}

// ========== 创建带 style 的元素 ==========
function styled(tag, style, children) {
  return h(tag, { style }, children)
}

// ========== 创建条件元素 ==========
function ifElse(condition, trueNode, falseNode = null) {
  return condition ? trueNode : falseNode
}

// ========== 创建循环元素 ==========
function each(items, renderItem, keyFn = (item, i) => i) {
  return items.map((item, index) =>
    renderItem(item, index, keyFn(item, index))
  )
}

// ========== 创建事件处理函数 ==========
function on(events) {
  const props = {}
  for (const [event, handler] of Object.entries(events)) {
    props[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = handler
  }
  return props
}

// ========== 使用示例 ==========
export default {
  render() {
    return h('div', [
      // 使用 cls
      cls('h1', 'title', '标题'),

      // 使用 styled
      styled('p', { color: 'red' }, '红色文字'),

      // 使用 ifElse
      ifElse(
        this.isLoggedIn,
        h('span', '已登录'),
        h('button', '登录')
      ),

      // 使用 each
      ...each(this.items,
        (item, index, key) => h('li', { key }, item.name),
        item => item.id
      ),

      // 使用 on
      h('button', on({
        click: this.handleClick,
        mouseenter: this.handleEnter
      }), '按钮')
    ])
  }
}
```

---

## 八、常见问题与调试

### 8.1 常见错误

#### 错误 1：事件名称格式错误

```javascript
// ❌ 错误：忘记 on 前缀
h('button', {
  click: () => {}  // 错误！
})

// ✅ 正确：使用 onClick
h('button', {
  onClick: () => {}
})
```

#### 错误 2：class 和 style 格式错误

```javascript
// ❌ 错误：class 不能是字符串数组
h('div', {
  class: ['active', 'disabled']  // 错误！这是 template 写法
})

// ✅ 正确：直接传递数组
h('div', {
  class: ['active', 'disabled']
})

// ❌ 错误：style 不能是字符串
h('div', {
  style: 'color: red;'  // 错误！
})

// ✅ 正确：使用对象
h('div', {
  style: { color: 'red' }
})
```

#### 错误 3：v-model 实现错误

```javascript
// ❌ 错误：忘记传递更新事件
h(MyInput, {
  modelValue: this.value
})

// ✅ 正确：传递更新事件
h(MyInput, {
  modelValue: this.value,
  'onUpdate:modelValue': (newValue) => {
    this.value = newValue
  }
})
```

#### 错误 4：忘记 key

```javascript
// ❌ 错误：列表渲染没有 key
h('ul', items.map(item =>
  h('li', item.name)
))

// ✅ 正确：添加唯一的 key
h('ul', items.map(item =>
  h('li', { key: item.id }, item.name)
))
```

### 8.2 调试技巧

#### 查看 VNode

```javascript
// 在 render 函数中
export default {
  render() {
    const vnode = h('div', '内容')
    console.log('VNode:', vnode)
    console.log('VNode 类型:', vnode.type)
    console.log('VNode props:', vnode.props)
    console.log('VNode children:', vnode.children)
    console.log('VNode shapeFlag:', vnode.shapeFlag)
    console.log('VNode patchFlag:', vnode.patchFlag)
    return vnode
  }
}
```

#### 使用 Vue DevTools

```javascript
// 在组件中导出 render 函数用于调试
export default {
  render() {
    const vnode = h('div', { class: 'debug' }, '内容')

    // 添加调试标记
    vnode.__DEBUG__ = true
    vnode.__DEBUG_SOURCE__ = 'MyComponent.render'

    return vnode
  }
}

// 在浏览器控制台
const vm = document.querySelector('#app').__vueParentComponent
console.log(vm.$.render.toString())
```

#### 性能分析

```javascript
import { h, onMounted, onUpdated } from 'vue'

export default {
  setup() {
    let renderCount = 0
    let renderTimes = []

    onMounted(() => {
      console.log('首次渲染完成')
    })

    onUpdated(() => {
      renderCount++
      console.log(`组件已更新 ${renderCount} 次`)
    })

    return () => {
      const start = performance.now()
      const vnode = h('div', '内容')
      const end = performance.now()

      renderTimes.push(end - start)
      if (renderTimes.length > 100) {
        console.log('平均渲染时间:', renderTimes.reduce((a, b) => a + b) / renderTimes.length)
        renderTimes = []
      }

      return vnode
    }
  }
}
```

### 8.3 问题排查清单

```markdown
## render 函数问题排查清单

- [ ] h 函数是否正确导入
- [ ] 事件名是否以 on 开头且首字母大写
- [ ] class/style 格式是否正确
- [ ] 列表渲染是否添加了唯一的 key
- [ ] v-model 是否正确传递了更新事件
- [ ] 插槽访问方式是否正确（$slots / slots）
- [ ] ref 使用是否正确（需要在 setup 中定义）
- [ ] 是否正确处理了 null/undefined
- [ ] 组件 props 是否正确定义
- [ ] 组件 emits 是否正确定义
```

---

## 九、Vue 2 vs Vue 3 对比

### 9.1 render 函数对比

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| **参数** | `render(h)` 或 `render(h, context)` | `render()` 或 `setup()` 返回 render |
| **h 函数** | 作为参数传入 | 需要手动导入 |
| **context** | 有独立的 context 对象 | 通过 setup 第二个参数获取 |
| **VNode** | 扁平结构 | 扁平结构 + 优化标记 |
| **函数式组件** | `functional: true` | 普通函数即可 |

### 9.2 代码对比

```javascript
// ========== Vue 2 ==========
export default {
  render(h) {
    return h('div', { class: 'container' }, [
      h('h1', this.title),
      h('p', this.message)
    ])
  }
}

// 函数式组件
export default {
  functional: true,
  props: ['title'],
  render(h, { props, children }) {
    return h('div', { class: 'functional' }, [
      h('h1', props.title),
      children
    ])
  }
}

// ========== Vue 3 ==========
import { h } from 'vue'

export default {
  render() {
    return h('div', { class: 'container' }, [
      h('h1', this.title),
      h('p', this.message)
    ])
  }
}

// 函数式组件
const FunctionalComp = (props, { slots }) => {
  return h('div', { class: 'functional' }, [
    h('h1', props.title),
    slots.default?.()
  ])
}
FunctionalComp.props = ['title']

export default FunctionalComp

// Composition API
import { h, ref } from 'vue'

export default {
  setup() {
    const title = ref('标题')
    return () => h('div', { class: 'container' }, [
      h('h1', title.value),
      h('p', '消息')
    ])
  }
}
```

---

## 总结

### h 函数与 render 函数对比

| 特性 | h 函数 | render 函数 |
|------|--------|-------------|
| **作用** | 创建虚拟节点 | 返回虚拟 DOM 树 |
| **使用方式** | 独立调用 | 组件选项或 setup 返回值 |
| **参数** | type, props, children | 无参数或上下文对象 |
| **返回值** | VNode | VNode |

### 选择建议

**使用 template 的场景**：
- 大多数业务开发
- 团队成员不熟悉 render 函数
- 需要 SSR 优化
- 结构相对简单
- 需要编译时优化

**使用 render + h 的场景**：
- 需要完全编程式控制输出
- 动态组件生成
- 性能敏感场景
- 创建高阶组件/组件包装器
- 函数式组件

**使用 JSX 的场景**：
- 介于两者之间
- 保持 template 的可读性
- 需要 render 函数的灵活性
- 更好的 TypeScript 支持

### 关键要点

1. **template 本质**会被编译成 render 函数
2. **h 函数**是创建虚拟 DOM 的工具函数
3. **render 函数**比 template 更灵活但可读性较差
4. **JSX**是两者的折中方案
5. **性能**：render ≈ JSX > template（编译优化后差异不大）
6. **学习路径**：template → render + h → JSX

### 参考资源

- [Vue 3 渲染函数 API](https://cn.vuejs.org/guide/extras/rendering-function.html)
- [Vue 3 渲染机制](https://cn.vuejs.org/guide/extras/rendering-mechanism.html)
- [Vue 2 渲染函数](https://v2.cn.vuejs.org/v2/guide/render-function.html)
