# Web Components 微前端方案

## 一、Web Components 与微前端的关系

### 1.1 核心关系图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        微前端架构方案对比                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  运行时集成                    编译时集成              路由分发       │
│  ┌──────────────────┐        ┌──────────────────┐    ┌──────────┐  │
│  │ • qiankun        │        │ • 模块联邦        │    │ • iframe │  │
│  │ • single-spa     │        │                  │    │          │  │
│  │ • Web Components⭐│       │                  │    │          │  │
│  └──────────────────┘        └──────────────────┘    └──────────┘  │
│                                                                      │
│                         封装能力 ◄─────────────────► 灵活性          │
│                         样式隔离 ◄─────────────────► 全局共享        │
│                         浏览器原生 ◄───────────────► 框架依赖         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Web Components 在微前端中的定位

**Web Components** 是浏览器原生支持的组件化标准，通过 Custom Elements、Shadow DOM、HTML Templates 三大核心技术实现真正的组件封装，是微前端架构的重要实现方式之一。

| 特性 | Web Components | qiankun | iframe | 模块联邦 |
|------|----------------|---------|--------|----------|
| **浏览器支持** | 原生支持 | 需要框架 | 原生支持 | 需要构建工具 |
| **样式隔离** | ⭐️⭐️⭐️⭐️⭐️ Shadow DOM | ⭐️⭐️⭐️ 沙箱 | ⭐️⭐️⭐️⭐️⭐️ 完全隔离 | ⭐️⭐️ 作用域隔离 |
| **JS 隔离** | ⭐️⭐️⭐️ 作用域隔离 | ⭐️⭐️⭐️⭐️ 沙箱 | ⭐️⭐️⭐️⭐️⭐️ 完全隔离 | ⭐️⭐️ 作用域隔离 |
| **技术栈限制** | 无 | 需协议统一 | 无 | 无 |
| **组件粒度** | 组件级 | 应用级 | 页面级 | 模块级 |
| **性能开销** | 低 | 中等 | 高 | 低 |
| **适用场景** | 跨框架组件复用 | 完整微前端 | 系统隔离 | 模块共享 |

### 1.3 Web Components 的核心技术体系

```javascript
// Web Components 核心技术体系
┌─────────────────────────────────────────────────────────────────────┐
│                        Web Components 技术栈                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  核心三大技术 (Core Technologies)                            │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  1. Custom Elements（自定义元素）                            │   │
│  │     - 定义自定义 HTML 标签                                   │   │
│  │     - 生命周期回调                                          │   │
│  │     - 例: <user-card></user-card>                           │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  2. Shadow DOM（影子 DOM）                                   │   │
│  │     - 封装 DOM 结构                                          │   │
│  │     - 样式完全隔离                                          │   │
│  │     - 例: this.attachShadow({ mode: 'open' })               │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  3. HTML Templates（模板）                                   │   │
│  │     - 声明式模板定义                                         │   │
│  │     - 懒加载实例化                                          │   │
│  │     - 例: <template><slot></slot></template>                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  补充技术 (Additional Technologies)                          │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  4. CSS Shadow Parts（样式穿透）                             │   │
│  │     - ::part(selector) 允许外部样式穿透 Shadow DOM           │   │
│  │     - 例: custom-card::part(header) { color: red; }         │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  5. Element Internals（内部能力）                            │   │
│  │     - 表单关联、无障碍、焦点管理                              │   │
│  │     - 例: this.attachInternals()                            │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  6. Declarative Shadow DOM（声明式 Shadow DOM）              │   │
│  │     - 服务端渲染支持                                         │   │
│  │     - 例: <template shadowrootmode="open">                  │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  7. Constructable Stylesheets（可构建样式表）                │   │
│  │     - 动态创建和共享样式                                     │   │
│  │     - 例: new CSSStyleSheet()                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.4 Web Components 浏览器兼容性

| 特性 | Chrome | Edge | Firefox | Safari | 说明 |
|------|--------|------|---------|--------|------|
| **Custom Elements** | ✅ 54+ | ✅ 79+ | ✅ 63+ | ✅ 10.1+ | 基础支持完善 |
| **Shadow DOM** | ✅ 53+ | ✅ 79+ | ✅ 63+ | ✅ 10.1+ | v1 版本 |
| **CSS Shadow Parts** | ✅ 73+ | ✅ 79+ | ✅ 72+ | ✅ 13.1+ | 样式穿透 |
| **Element Internals** | ✅ 77+ | ✅ 79+ | ✅ 93+ | ✅ 16.4+ | 表单集成 |
| **Declarative Shadow DOM** | ✅ 90+ | ✅ 90+ | ✅ 115+ | ✅ 16.4+ | SSR 支持 |
| **Constructable Stylesheets** | ✅ 73+ | ✅ 79+ | ✅ 101+ | ✅ 16.4+ | 动态样式表 |

> 💡 **Polyfill 建议**：对于需要兼容旧浏览器的项目，可以使用 [@webcomponents/webcomponentsjs](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs)

### 1.5 Web Components 优缺点

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Web Components 方案                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ✅ 优点                          ❌ 缺点                           │
│  ─────────────────────────────────────────────────────────────────  │
│  • 浏览器原生支持，零依赖            • SEO 相对较差                 │
│  • Shadow DOM 天然样式隔离           • 开发体验不如框架             │
│  • 真正的组件封装                  • 调试工具不完善               │
│  • 跨框架复用（Vue/Svelte/Angular等）• 学习曲线较陡                 │
│  • 组件级微前端                    • 生态系统不成熟               │
│  • 渐进式升级                      • 服务端渲染困难               │
│  • 标准化 API                      • 初期开发成本高               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 二、Web Components 核心技术详解

### 2.1 Custom Elements（自定义元素）

```typescript
/**
 * Custom Elements 允许开发者定义自定义 HTML 标签
 * 必须包含短横线（kebab-case）以区分原生标签
 */

// 1. 定义自定义元素类
class UserCard extends HTMLElement {
  // 生命周期：元素被插入到文档时调用
  connectedCallback() {
    console.log('User card mounted')
    this.render()
  }

  // 生命周期：元素从文档移除时调用
  disconnectedCallback() {
    console.log('User card unmounted')
    this.cleanup()
  }

  // 生命周期：元素被移动到新文档时调用
  adoptedCallback() {
    console.log('User card adopted')
  }

  // 生命周期：元素的属性变化时调用
  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ) {
    console.log(`Attribute ${name} changed from ${oldValue} to ${newValue}`)
    if (oldValue !== newValue) {
      this.render()
    }
  }

  // 声明需要监听的属性
  static get observedAttributes() {
    return ['name', 'avatar', 'email']
  }

  // 渲染方法
  private render() {
    const name = this.getAttribute('name') || 'Unknown'
    const avatar = this.getAttribute('avatar') || ''
    const email = this.getAttribute('email') || ''

    this.innerHTML = `
      <div class="user-card">
        <img class="user-card__avatar" src="${avatar}" alt="${name}" />
        <div class="user-card__info">
          <h3 class="user-card__name">${name}</h3>
          <p class="user-card__email">${email}</p>
        </div>
      </div>
    `
  }

  private cleanup() {
    // 清理资源
  }
}

// 2. 注册自定义元素（名称必须包含短横线）
customElements.define('user-card', UserCard)

// 3. 使用自定义元素
document.body.innerHTML = `
  <user-card
    name="张三"
    avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
    email="zhangsan@example.com"
  ></user-card>
`

// 4. 编程式操作
const userCard = document.querySelector('user-card')!
userCard.setAttribute('name', '李四')
userCard.setAttribute('email', 'lisi@example.com')
```

### 2.2 Shadow DOM（影子 DOM）

```typescript
/**
 * Shadow DOM 提供了完全隔离的 DOM 树和样式作用域
 * 适用于需要样式隔离的组件
 */

class ShadowButton extends HTMLElement {
  private shadow: ShadowRoot

  constructor() {
    super()
    // 创建 Shadow DOM
    // mode: 'open' - 外部可以访问 shadowRoot
    // mode: 'closed' - 外部无法访问 shadowRoot
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    // Shadow DOM 内部的样式完全隔离
    this.shadow.innerHTML = `
      <style>
        /* 这些样式只会影响 Shadow DOM 内部 */
        :host {
          display: inline-block;
        }

        .button {
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .button:active {
          transform: translateY(0);
        }

        /* 使用 :host-context() 根据外部状态应用样式 */
        :host-context(.dark-theme) .button {
          background: linear-gradient(135deg, #434343 0%, #000000 100%);
        }

        /* 使用 CSS 自定义属性与外部通信 */
        .button {
          --button-color: #667eea;
          background: var(--button-color);
        }
      </style>

      <button class="button">
        <slot></slot>
      </button>
    `
  }
}

customElements.define('shadow-button', ShadowButton)

// 使用
document.body.innerHTML = `
  <div class="dark-theme">
    <shadow-button>点击我</shadow-button>
  </div>
`
```

### 2.3 HTML Templates（模板）

```typescript
/**
 * HTML Templates 提供了声明式定义可复用 HTML 结构的方式
 */

// 1. 定义模板
const template = document.createElement('template')
template.innerHTML = `
  <style>
    .product-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      font-family: Arial, sans-serif;
    }

    .product-card__image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 4px;
    }

    .product-card__title {
      margin: 12px 0 8px;
      font-size: 18px;
    }

    .product-card__price {
      color: #e53935;
      font-weight: bold;
      font-size: 20px;
    }

    .product-card__description {
      color: #666;
      font-size: 14px;
      margin-top: 8px;
    }
  </style>

  <div class="product-card">
    <img class="product-card__image" src="" alt="" data-bind="image" />
    <h3 class="product-card__title" data-bind="title"></h3>
    <p class="product-card__price" data-bind="price"></p>
    <p class="product-card__description" data-bind="description"></p>

    <!-- Slot 允许外部内容插入 -->
    <div class="product-card__actions">
      <slot name="actions"></slot>
    </div>
  </div>
`

// 2. 使用模板创建组件
class ProductCard extends HTMLElement {
  private shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    // 克隆模板内容
    const content = template.content.cloneNode(true)
    this.shadow.appendChild(content)
    this.render()
  }

  private render() {
    const data = {
      image: this.getAttribute('image') || '',
      title: this.getAttribute('title') || '',
      price: this.getAttribute('price') || '',
      description: this.getAttribute('description') || ''
    }

    // 绑定数据
    Object.entries(data).forEach(([key, value]) => {
      const element = this.shadow.querySelector(`[data-bind="${key}"]`)
      if (element) {
        if (element.tagName === 'IMG') {
          element.setAttribute('src', value)
        } else {
          element.textContent = value
        }
      }
    })
  }

  static get observedAttributes() {
    return ['image', 'title', 'price', 'description']
  }

  attributeChangedCallback() {
    if (this.shadow.children.length > 0) {
      this.render()
    }
  }
}

customElements.define('product-card', ProductCard)

// 3. 使用组件（带 slot）
document.body.innerHTML = `
  <product-card
    image="https://via.placeholder.com/300"
    title="商品名称"
    price="¥99.00"
    description="商品描述信息"
  >
    <button slot="actions" onclick="alert('加入购物车')">加入购物车</button>
  </product-card>
`
```

### 2.4 CSS Shadow Parts（样式穿透）

```typescript
/**
 * CSS Shadow Parts 允许外部样式穿透 Shadow DOM 边界
 * 通过 part 属性标记内部元素，外部可通过 ::part() 选择器设置样式
 */

class PartCard extends HTMLElement {
  private shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }

        .card-header {
          padding: 16px;
          background: #f5f5f5;
        }

        .card-body {
          padding: 16px;
        }

        .card-footer {
          padding: 12px 16px;
          background: #fafafa;
          border-top: 1px solid #eee;
        }
      </style>

      <!-- 使用 part 属性标记可样式化的部分 -->
      <div class="card-header" part="header">
        <slot name="header">默认标题</slot>
      </div>
      <div class="card-body" part="body">
        <slot>默认内容</slot>
      </div>
      <div class="card-footer" part="footer">
        <slot name="footer">默认底部</slot>
      </div>
    `
  }
}

customElements.define('part-card', PartCard)

// 外部使用示例
document.body.innerHTML = `
  <style>
    /* 通过 ::part() 设置 Shadow DOM 内部样式 */
    part-card::part(header) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
    }

    part-card::part(body) {
      font-size: 16px;
      line-height: 1.6;
    }

    /* 针对特定实例 */
    part-card.special::part(header) {
      background: #e53e3e;
    }
  </style>

  <part-card>
    <span slot="header">我的卡片</span>
    <p>这是卡片内容</p>
  </part-card>

  <part-card class="special">
    <span slot="header">特殊卡片</span>
  </part-card>
`
```

### 2.5 Element Internals API（表单集成）

```typescript
/**
 * Element Internals API 提供了更强大的组件能力
 * 特别是表单集成、无障碍支持、焦点管理
 */

class CustomInput extends HTMLElement {
  private _internals: ElementInternals
  private _value = ''
  private input: HTMLInputElement | null = null

  // 定义表单相关属性
  static formAssociated = true

  constructor() {
    super()
    // 获取 ElementInternals 实例
    this._internals = this.attachInternals()

    // 设置无障碍角色
    this._internals.role = 'textbox'
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' })

    shadow.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
        }

        .wrapper {
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 8px 12px;
          background: white;
        }

        .wrapper:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        input {
          border: none;
          outline: none;
          flex: 1;
          font: inherit;
        }

        .prefix {
          color: #666;
          margin-right: 8px;
        }

        .clear {
          cursor: pointer;
          color: #999;
          font-size: 18px;
          line-height: 1;
        }

        .clear:hover {
          color: #333;
        }
      </style>

      <div class="wrapper">
        <span class="prefix">
          <slot name="prefix">$</slot>
        </span>
        <input type="text" />
        <span class="clear" style="display: none;">&times;</span>
      </div>
    `

    this.input = shadow.querySelector('input')

    // 绑定事件
    this.input?.addEventListener('input', () => this.updateValue())
    this.input?.addEventListener('focus', () => this._internals.states.add('focused'))
    this.input?.addEventListener('blur', () => this._internals.states.delete('focused'))

    shadow.querySelector('.clear')?.addEventListener('click', () => {
      this.value = ''
      this.input?.focus()
    })

    // 同步初始值
    if (this.hasAttribute('value')) {
      this.value = this.getAttribute('value')!
    }
  }

  // ========== 表单集成回调 ==========

  /** 表单重置时调用 */
  formResetCallback() {
    this.value = this.getAttribute('value') || ''
  }

  /** 表单禁用状态变化时调用 */
  formDisabledCallback(disabled: boolean) {
    if (this.input) {
      this.input.disabled = disabled
    }
  }

  /** 表单恢复时调用（浏览器表单自动填充） */
  formStateRestoreCallback(state: string) {
    this.value = state
  }

  // ========== 属性访问器 ==========

  get value() {
    return this._value
  }

  set value(newValue: string) {
    this._value = newValue
    if (this.input) {
      this.input.value = newValue
    }

    // 设置表单值
    this._internals.setFormValue(newValue)

    // 更新验证状态
    this.checkValidity()

    // 更新清除按钮显示
    const clearBtn = this.shadowRoot?.querySelector('.clear') as HTMLElement
    if (clearBtn) {
      clearBtn.style.display = newValue ? 'block' : 'none'
    }
  }

  get name() {
    return this.getAttribute('name') || ''
  }

  get validity() {
    return this._internals.validity
  }

  get validationMessage() {
    return this._internals.validationMessage
  }

  get willValidate() {
    return this._internals.willValidate
  }

  // ========== 公共方法 ==========

  checkValidity() {
    const minLength = parseInt(this.getAttribute('minlength') || '0')
    const maxLength = parseInt(this.getAttribute('maxlength') || '1000')

    if (this._value.length < minLength) {
      this._internals.setValidity(
        { customError: true },
        `最少需要 ${minLength} 个字符`
      )
      return false
    }

    this._internals.setValidity({})
    return true
  }

  reportValidity() {
    return this._internals.reportValidity()
  }

  get labels() {
    return this._internals.labels
  }

  private updateValue() {
    this.value = this.input?.value || ''
  }

  static get observedAttributes() {
    return ['value', 'disabled', 'name', 'placeholder']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string | null) {
    if (oldValue === newValue) return

    switch (name) {
      case 'value':
        if (this.input?.value !== newValue) {
          this.value = newValue || ''
        }
        break
      case 'disabled':
        if (this.input) {
          this.input.disabled = newValue !== null
        }
        break
    }
  }
}

customElements.define('custom-input', CustomInput)
```

### 2.6 Declarative Shadow DOM（声明式 Shadow DOM）

```html
<!--
  Declarative Shadow DOM 允许在 HTML 中直接定义 Shadow DOM
  这使得服务端渲染（SSR）成为可能
-->

<!DOCTYPE html>
<html>
<body>
  <!-- 使用 shadowrootmode 属性 -->
  <my-component>
    <template shadowrootmode="open">
      <style>
        :host {
          display: block;
          padding: 20px;
          background: #f0f0f0;
          border-radius: 8px;
        }
      </style>
      <div class="content">
        <slot>默认内容</slot>
      </div>
    </template>
    <p>这是从外部传入的内容</p>
  </my-component>

  <script>
    class MyComponent extends HTMLElement {
      constructor() {
        super()
        // 检查是否已经有 Declarative Shadow DOM
        if (!this.shadowRoot) {
          this.attachShadow({ mode: 'open' })
          this.shadowRoot.innerHTML = `
            <style>
              :host { display: block; padding: 20px; }
            </style>
            <slot></slot>
          `
        }
      }
    }
    customElements.define('my-component', MyComponent)
  </script>
</body>
</html>
```

---

## 三、基础实现方案

### 3.1 项目结构

```
web-components-micro-frontend/
├── main-app/                      # 主应用（Vue）
│   ├── src/
│   │   ├── components/
│   │   │   ├── micro-app-wrapper.ts   # 微应用包装器
│   │   │   └── app-loader.ts          # 应用加载器
│   │   ├── utils/
│   │   │   └── component-loader.ts    # 组件加载器
│   │   ├── App.vue
│   │   └── main.ts
│   └── package.json
│
├── micro-components/              # 共享 Web Components 库
│   ├── src/
│   │   ├── user-card/
│   │   │   ├── user-card.ts
│   │   │   └── user-card.css
│   │   ├── data-table/
│   │   │   ├── data-table.ts
│   │   │   └── data-table.css
│   │   └── index.ts
│   └── package.json
│
├── sub-app-todo/                  # 待办事项子应用（Vue → WC）
│   ├── src/
│   │   ├── components/
│   │   │   ├── TodoApp.vue
│   │   │   └── UserCard.vue
│   │   └── main.ts
│   └── package.json
│
└── sub-app-dashboard/             # 仪表盘子应用（Vue → WC）
    ├── src/
    │   ├── components/
    │   │   └── Dashboard.vue
    │   └── main.ts
    └── package.json
```

### 3.2 组件加载器实现

```typescript
// main-app/src/utils/component-loader.ts
/**
 * Web Components 动态加载器
 * 支持懒加载、版本管理、错误处理
 */

interface ComponentConfig {
  name: string
  url: string
  version?: string
  timeout?: number
}

interface LoadedComponent {
  name: string
  element: HTMLElement
  loadTime: number
}

class ComponentLoader {
  private loadedComponents = new Map<string, LoadedComponent>()
  private loadingPromises = new Map<string, Promise<void>>()

  /**
   * 动态加载 Web Component
   */
  async load(config: ComponentConfig): Promise<void> {
    const { name, url, timeout = 10000 } = config

    // 如果已加载，直接返回
    if (customElements.get(name)) {
      return Promise.resolve()
    }

    // 如果正在加载，返回现有的 Promise
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!
    }

    // 创建加载 Promise
    const loadPromise = this.loadComponent(config)
    this.loadingPromises.set(name, loadPromise)

    try {
      await loadPromise
      this.loadingPromises.delete(name)
    } catch (error) {
      this.loadingPromises.delete(name)
      throw error
    }

    return loadPromise
  }

  private async loadComponent(config: ComponentConfig): Promise<void> {
    const { name, url, timeout } = config

    const startTime = performance.now()

    // 超时控制
    const timer = setTimeout(() => {
      throw new Error(`Component ${name} load timeout`)
    }, timeout)

    try {
      // 加载 JavaScript 文件
      await this.loadScript(url)

      // 等待自定义元素注册
      await this.waitForCustomElement(name)

      const loadTime = performance.now() - startTime

      this.loadedComponents.set(name, {
        name,
        element: document.createElement(name),
        loadTime
      })

      console.log(`Component ${name} loaded in ${loadTime.toFixed(2)}ms`)

      clearTimeout(timer)
    } catch (error) {
      clearTimeout(timer)
      console.error(`Failed to load component ${name}:`, error)
      throw error
    }
  }

  /**
   * 动态加载脚本
   */
  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查是否已加载
      if (document.querySelector(`script[src="${url}"]`)) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = url
      script.type = 'module'

      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`))

      document.head.appendChild(script)
    })
  }

  /**
   * 等待自定义元素注册
   */
  private waitForCustomElement(name: string, maxWait = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()

      const checkInterval = setInterval(() => {
        if (customElements.get(name)) {
          clearInterval(checkInterval)
          resolve()
        } else if (Date.now() - startTime > maxWait) {
          clearInterval(checkInterval)
          reject(new Error(`Custom element ${name} not registered after ${maxWait}ms`))
        }
      }, 50)
    })
  }

  /**
   * 批量加载组件
   */
  async loadBatch(configs: ComponentConfig[]): Promise<void[]> {
    const promises = configs.map(config => this.load(config))
    return Promise.all(promises)
  }

  /**
   * 预加载组件
   */
  async preload(configs: ComponentConfig[]): Promise<void> {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(async () => {
        await this.loadBatch(configs)
      })
    } else {
      setTimeout(() => this.loadBatch(configs), 0)
    }
  }

  /**
   * 获取已加载的组件列表
   */
  getLoadedComponents(): LoadedComponent[] {
    return Array.from(this.loadedComponents.values())
  }

  /**
   * 卸载组件
   */
  unload(name: string): boolean {
    if (!this.loadedComponents.has(name)) {
      return false
    }

    this.loadedComponents.delete(name)

    // 移除所有该组件的实例
    document.querySelectorAll(name).forEach(el => el.remove())

    // 注意：customElements.define() 无法撤销
    // 这里只是从管理列表中移除

    return true
  }
}

export const componentLoader = new ComponentLoader()
```

### 3.3 微应用包装器

```typescript
// main-app/src/components/micro-app-wrapper.ts
/**
 * 微应用 Web Component 包装器
 * 将整个子应用封装为 Web Component
 */

interface MicroAppConfig {
  name: string
  url: string
  shadow?: boolean
  styles?: string[]
}

class MicroAppWrapper extends HTMLElement {
  private shadowRoot: ShadowRoot | null = null
  private iframe: HTMLIFrameElement | null = null
  private container: HTMLElement | null = null

  static get observedAttributes() {
    return ['src', 'title']
  }

  connectedCallback() {
    const useShadow = this.getAttribute('shadow') !== 'false'
    const src = this.getAttribute('src')

    if (useShadow) {
      this.attachShadow()
    } else {
      this.attachRegular()
    }

    if (src) {
      this.loadApp(src)
    }
  }

  /**
   * 使用 Shadow DOM 挂载（样式隔离）
   */
  private attachShadow() {
    this.shadowRoot = this.attachShadow({ mode: 'open' })

    // 添加重置样式
    const resetStyle = document.createElement('style')
    resetStyle.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
      ::slotted(*) {
        all: initial;
      }
    `
    this.shadowRoot.appendChild(resetStyle)

    // 创建容器
    this.container = document.createElement('div')
    this.container.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
    `
    this.shadowRoot.appendChild(this.container)
  }

  /**
   * 常规挂载（共享样式）
   */
  private attachRegular() {
    this.container = document.createElement('div')
    this.container.className = 'micro-app-container'
    this.container.style.cssText = `
      width: 100%;
      height: 100%;
      position: relative;
    `
    this.appendChild(this.container)
  }

  /**
   * 加载微应用
   */
  private async loadApp(url: string) {
    if (!this.container) return

    // 显示加载状态
    this.showLoading()

    try {
      // 方案一：使用 iframe 加载（完全隔离）
      this.loadViaIframe(url)

      // 方案二：使用 fetch 加载 HTML（需要同源或 CORS）
      // await this.loadViaFetch(url)

      // 方案三：使用 Web Components 加载
      // await this.loadViaWebComponent(url)
    } catch (error) {
      this.showError(error instanceof Error ? error.message : '加载失败')
    }
  }

  /**
   * 使用 iframe 加载微应用
   */
  private loadViaIframe(url: string) {
    if (!this.container) return

    this.iframe = document.createElement('iframe')
    this.iframe.src = url
    this.iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `

    this.iframe.onload = () => {
      this.hideLoading()
      this.dispatchEvent(new CustomEvent('app-loaded', {
        detail: { url },
        bubbles: true
      }))
    }

    this.iframe.onerror = () => {
      this.showError('应用加载失败')
    }

    this.container.innerHTML = ''
    this.container.appendChild(this.iframe)
  }

  /**
   * 使用 fetch 加载 HTML
   */
  private async loadViaFetch(url: string) {
    if (!this.container) return

    const response = await fetch(url, {
      headers: {
        'Accept': 'text/html'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()

    // 创建临时容器解析 HTML
    const temp = document.createElement('div')
    temp.innerHTML = html

    // 提取并执行脚本
    const scripts = temp.querySelectorAll('script')
    scripts.forEach(script => {
      const newScript = document.createElement('script')
      if (script.src) {
        newScript.src = script.src
      } else {
        newScript.textContent = script.textContent
      }
      document.head.appendChild(newScript)
    })

    // 提取样式
    const styles = temp.querySelectorAll('style, link[rel="stylesheet"]')
    styles.forEach(style => {
      if (this.shadowRoot) {
        this.shadowRoot.appendChild(style.cloneNode(true))
      } else {
        document.head.appendChild(style.cloneNode(true))
      }
    })

    // 插入内容
    this.container.innerHTML = html
    this.hideLoading()
  }

  /**
   * 显示加载状态
   */
  private showLoading() {
    if (!this.container) return

    this.container.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: #f5f5f5;
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 4px solid #e0e0e0;
          border-top-color: #42b883;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        "></div>
        <style>
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </div>
    `
  }

  /**
   * 隐藏加载状态
   */
  private hideLoading() {
    const loader = this.container?.querySelector('[style*="spin"]')
    if (loader) {
      loader.parentElement?.remove()
    }
  }

  /**
   * 显示错误
   */
  private showError(message: string) {
    if (!this.container) return

    this.container.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        background: #fff5f5;
        color: #c53030;
        gap: 12px;
      ">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="2"/>
          <line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/>
          <line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/>
        </svg>
        <p>${message}</p>
        <button onclick="window.location.reload()" style="
          padding: 8px 16px;
          background: #c53030;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">重新加载</button>
      </div>
    `
  }

  disconnectedCallback() {
    // 清理资源
    if (this.iframe) {
      this.iframe.src = 'about:blank'
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'src' && oldValue !== newValue && newValue) {
      this.loadApp(newValue)
    }
  }
}

// 注册自定义元素
if (!customElements.get('micro-app-wrapper')) {
  customElements.define('micro-app-wrapper', MicroAppWrapper)
}

export { MicroAppWrapper }
```

### 3.4 应用加载器

```typescript
// main-app/src/components/app-loader.ts
/**
 * 应用加载器 - 管理多个微应用
 */

interface AppConfig {
  id: string
  name: string
  url: string
  preload?: boolean
  shadow?: boolean
}

class AppLoader {
  private apps = new Map<string, AppConfig>()
  private loadedApps = new Set<string>()
  private eventBus = new EventTarget()

  /**
   * 注册应用
   */
  register(config: AppConfig) {
    this.apps.set(config.id, config)

    // 预加载
    if (config.preload) {
      this.preload(config.id)
    }
  }

  /**
   * 加载应用
   */
  async load(appId: string, container?: HTMLElement): Promise<MicroAppWrapper> {
    const config = this.apps.get(appId)
    if (!config) {
      throw new Error(`App ${appId} not found`)
    }

    // 创建微应用元素
    const appElement = document.createElement('micro-app-wrapper') as MicroAppWrapper
    appElement.setAttribute('src', config.url)
    appElement.setAttribute('title', config.name)
    if (config.shadow) {
      appElement.setAttribute('shadow', 'true')
    }

    // 监听加载完成
    appElement.addEventListener('app-loaded', () => {
      this.loadedApps.add(appId)
      this.eventBus.dispatchEvent(new CustomEvent('app-loaded', {
        detail: { appId }
      }))
    })

    // 添加到容器
    if (container) {
      container.innerHTML = ''
      container.appendChild(appElement)
    }

    return appElement
  }

  /**
   * 预加载应用
   */
  private preload(appId: string) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = this.apps.get(appId)!.url
        document.head.appendChild(link)
      })
    }
  }

  /**
   * 卸载应用
   */
  unload(appId: string) {
    this.loadedApps.delete(appId)
    this.eventBus.dispatchEvent(new CustomEvent('app-unloaded', {
      detail: { appId }
    }))
  }

  /**
   * 监听事件
   */
  on(event: string, callback: (detail: any) => void) {
    this.eventBus.addEventListener(event, (e: Event) => {
      const customEvent = e as CustomEvent
      callback(customEvent.detail)
    })
  }

  /**
   * 获取所有已注册的应用
   */
  getApps(): AppConfig[] {
    return Array.from(this.apps.values())
  }

  /**
   * 获取已加载的应用
   */
  getLoadedApps(): string[] {
    return Array.from(this.loadedApps)
  }
}

export const appLoader = new AppLoader()
```

---

## 四、框架集成方案

### 4.1 Vue 集成 Web Components

```vue
<!-- sub-app-vue/src/components/TodoApp.vue -->
<template>
  <div class="todo-app">
    <h2>{{ title }}</h2>

    <form @submit.prevent="addTodo">
      <input v-model="newTodoText" placeholder="添加新任务" />
      <button type="submit">添加</button>
    </form>

    <ul class="todo-list">
      <li v-for="todo in todos" :key="todo.id" :class="{ completed: todo.completed }">
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="toggleTodo(todo.id)"
        />
        <span>{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">删除</button>
      </li>
    </ul>

    <p class="todo-count">
      剩余 {{ todos.filter(t => !t.completed).length }} 个任务
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, defineExpose } from 'vue'

interface Todo {
  id: number
  text: string
  completed: boolean
}

const props = defineProps<{
  title?: string
}>()

const newTodoText = ref('')
const todos = ref<Todo[]>([
  { id: 1, text: '学习 Web Components', completed: false },
  { id: 2, text: '创建微应用', completed: false }
])

const addTodo = () => {
  if (newTodoText.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: newTodoText.value,
      completed: false
    })
    newTodoText.value = ''
  }
}

const toggleTodo = (id: number) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.completed = !todo.completed
  }
}

const removeTodo = (id: number) => {
  todos.value = todos.value.filter(t => t.id !== id)
}

// 暴露方法供外部调用
defineExpose({
  addTodo,
  clearCompleted: () => {
    todos.value = todos.value.filter(t => !t.completed)
  },
  getTodos: () => todos.value
})
</script>

<style scoped>
.todo-app {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.todo-app h2 {
  margin-top: 0;
  color: #333;
}

.todo-app form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.todo-app input[type="text"] {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.todo-app button {
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.todo-app button:hover {
  background: #36a870;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #999;
}

.todo-count {
  margin-top: 16px;
  color: #666;
  font-size: 14px;
}
</style>
```

```typescript
// sub-app-vue/src/main.ts
import { createApp, defineCustomElement } from 'vue'
import TodoApp from './components/TodoApp.vue'

// 将 Vue 组件转换为 Web Component
const TodoAppElement = defineCustomElement(TodoApp)

// 注册自定义元素
customElements.define('todo-app', TodoAppElement)

// 开发环境：同时支持独立运行
if (import.meta.env.DEV) {
  const app = createApp(TodoApp)
  app.mount('#app')
}
```

```html
<!-- sub-app-vue/index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Todo App</title>
</head>
<body>
  <!-- 开发环境入口 -->
  <div id="app"></div>

  <!-- 或作为 Web Component 使用 -->
  <!-- <todo-app title="我的任务"></todo-app> -->

  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### 4.2 Vue 用户卡片组件

```vue
<!-- sub-app-vue/src/components/UserCard.vue -->
<template>
  <div class="user-card">
    <div class="user-card__header">
      <img
        class="user-card__avatar"
        :src="avatarUrl"
        :alt="username"
      />
      <div class="user-card__info">
        <template v-if="isEditing">
          <input
            v-model="editForm.username"
            class="user-card__input"
            placeholder="用户名"
          />
        </template>
        <template v-else>
          <h3 class="user-card__name">{{ username }}</h3>
          <p class="user-card__role">{{ role }}</p>
        </template>
      </div>
    </div>

    <div class="user-card__body">
      <div class="user-card__stats">
        <div class="stat-item">
          <span class="stat-value">{{ stats.posts }}</span>
          <span class="stat-label">动态</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.followers }}</span>
          <span class="stat-label">粉丝</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.following }}</span>
          <span class="stat-label">关注</span>
        </div>
      </div>

      <template v-if="isEditing">
        <textarea
          v-model="editForm.bio"
          class="user-card__textarea"
          placeholder="个人简介"
          rows="3"
        ></textarea>
      </template>
      <p v-else class="user-card__bio">{{ bio }}</p>
    </div>

    <div class="user-card__footer">
      <template v-if="isEditing">
        <button @click="handleSave" class="btn btn-primary">保存</button>
        <button @click="handleCancel" class="btn">取消</button>
      </template>
      <template v-else>
        <button @click="handleEdit" class="btn btn-primary">编辑资料</button>
        <button @click="handleFollow" :class="['btn', isFollowing ? 'btn-outline' : 'btn-primary']">
          {{ isFollowing ? '已关注' : '关注' }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

interface Props {
  username?: string
  avatar?: string
  role?: string
  bio?: string
  stats?: {
    posts: number
    followers: number
    following: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  username: '未知用户',
  avatar: '',
  role: '开发者',
  bio: '这个人很懒，什么都没写',
  stats: () => ({ posts: 0, followers: 0, following: 0 })
})

const emit = defineEmits<{
  (e: 'update', data: Partial<Props>): void
  (e: 'follow', isFollowing: boolean): void
}>()

const isEditing = ref(false)
const isFollowing = ref(false)

const editForm = reactive({
  username: props.username,
  bio: props.bio
})

const avatarUrl = computed(() => {
  return props.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${props.username}`
})

const handleEdit = () => {
  editForm.username = props.username
  editForm.bio = props.bio
  isEditing.value = true
}

const handleSave = () => {
  emit('update', {
    username: editForm.username,
    bio: editForm.bio
  })
  isEditing.value = false
}

const handleCancel = () => {
  editForm.username = props.username
  editForm.bio = props.bio
  isEditing.value = false
}

const handleFollow = () => {
  isFollowing.value = !isFollowing.value
  emit('follow', isFollowing.value)
}

// 暴露方法供外部调用
defineExpose({
  edit: handleEdit,
  save: handleSave,
  cancel: handleCancel,
  follow: () => {
    isFollowing.value = true
    emit('follow', true)
  },
  unfollow: () => {
    isFollowing.value = false
    emit('follow', false)
  }
})
</script>

<style scoped>
.user-card {
  max-width: 400px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  font-family: system-ui, -apple-system, sans-serif;
}

.user-card__header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.user-card__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
}

.user-card__info {
  flex: 1;
}

.user-card__name {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.user-card__role {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.user-card__input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  transition: border-color 0.2s;
}

.user-card__input:focus {
  outline: none;
  border-color: #42b883;
}

.user-card__stats {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
  margin-bottom: 16px;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.user-card__bio {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.user-card__textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  transition: border-color 0.2s;
}

.user-card__textarea:focus {
  outline: none;
  border-color: #42b883;
}

.user-card__footer {
  display: flex;
  gap: 8px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover {
  background: #36a870;
}

.btn-outline {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  background: #f5f5f5;
}
</style>
```

```typescript
// sub-app-vue/src/main.ts
import { createApp, defineCustomElement } from 'vue'
import TodoApp from './components/TodoApp.vue'
import UserCard from './components/UserCard.vue'

// 将 Vue 组件转换为 Web Component
const TodoAppElement = defineCustomElement(TodoApp)
const UserCardElement = defineCustomElement(UserCard)

// 注册自定义元素
customElements.define('todo-app', TodoAppElement)
customElements.define('user-card', UserCardElement)

// 开发环境：同时支持独立运行
if (import.meta.env.DEV) {
  const app = createApp(TodoApp)
  app.mount('#app')
}

// 导出类型（供 TypeScript 使用）
declare global {
  interface HTMLElementTagNameMap {
    'todo-app': TodoApp & HTMLElement
    'user-card': UserCard & HTMLElement
  }
}
```

### 4.3 主应用中使用

```vue
<!-- main-app/src/App.vue -->
<template>
  <div id="app">
    <header class="app-header">
      <h1>Web Components 微前端</h1>
      <p class="subtitle">基于 Vue + Web Components 的微前端架构</p>
    </header>

    <main class="app-main">
      <section class="app-section">
        <h2>📝 待办事项组件</h2>
        <todo-app title="我的任务"></todo-app>
      </section>

      <section class="app-section">
        <h2>👤 用户卡片组件</h2>
        <user-card
          username="张三"
          role="前端工程师"
          bio="热爱技术，专注于 Vue 和 Web Components"
          :stats="{ posts: 42, followers: 128, following: 56 }"
          @update="handleUserUpdate"
          @follow="handleFollow"
        ></user-card>
      </section>

      <section class="app-section">
        <h2>🔗 微应用嵌入</h2>
        <micro-app-wrapper
          src="http://localhost:5174"
          shadow
        ></micro-app-wrapper>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { componentLoader } from './utils/component-loader'

// 加载 Web Components
onMounted(async () => {
  // 加载 Vue 组件
  await componentLoader.load({
    name: 'todo-app',
    url: 'http://localhost:5173/assets/todo-app.js'
  })

  // 加载用户卡片组件
  await componentLoader.load({
    name: 'user-card',
    url: 'http://localhost:5173/assets/user-card.js'
  })
})

// 用户卡片事件处理
const handleUserUpdate = (data: any) => {
  console.log('用户信息更新:', data)
}

const handleFollow = (isFollowing: boolean) => {
  console.log('关注状态:', isFollowing)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.app-header {
  background: linear-gradient(135deg, #42b883 0%, #35a872 100%);
  color: white;
  padding: 32px 20px;
  text-align: center;
}

.app-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.subtitle {
  margin: 8px 0 0;
  opacity: 0.9;
  font-size: 14px;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
}

.app-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.app-section h2 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}
</style>
```

---

## 五、高级特性

### 5.1 组件通信

```typescript
/**
 * Web Components 通信方案
 * 1. Custom Events（自定义事件）
 * 2. Properties（属性）
 * 3. Methods（方法调用）
 * 4. Shared State（共享状态）
 */

// ========== 方案一：Custom Events ==========

class Counter extends HTMLElement {
  private count = 0

  connectedCallback() {
    this.render()

    this.querySelector('button')?.addEventListener('click', () => {
      this.count++
      this.render()
      this.dispatchCountChanged()
    })
  }

  private dispatchCountChanged() {
    // 派发自定义事件
    this.dispatchEvent(new CustomEvent('count-changed', {
      detail: { count: this.count },
      bubbles: true,  // 事件冒泡
      composed: true  // 穿过 Shadow DOM 边界
    }))
  }

  private render() {
    this.innerHTML = `
      <div>
        <span>Count: ${this.count}</span>
        <button>Increment</button>
      </div>
    `
  }
}

customElements.define('my-counter', Counter)

// 监听事件
document.addEventListener('count-changed', (e: CustomEvent) => {
  console.log('Count changed to:', e.detail.count)
})


// ========== 方案二：属性 + 反应式更新 ==========

class DataCard extends HTMLElement {
  private _data: any = null

  static get observedAttributes() {
    return ['data']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data' && oldValue !== newValue) {
      try {
        this._data = JSON.parse(newValue)
        this.render()
      } catch (e) {
        console.error('Invalid JSON data')
      }
    }
  }

  set data(value: any) {
    this._data = value
    this.setAttribute('data', JSON.stringify(value))
  }

  get data() {
    return this._data
  }

  private render() {
    if (!this._data) {
      this.innerHTML = '<p>No data</p>'
      return
    }

    this.innerHTML = `
      <div class="data-card">
        <h3>${this._data.title}</h3>
        <p>${this._data.description}</p>
      </div>
    `
  }
}

customElements.define('data-card', DataCard)

// 使用
const card = document.createElement('data-card')
card.data = { title: '标题', description: '描述' }
document.body.appendChild(card)


// ========== 方案三：方法调用 ==========

class FormBuilder extends HTMLElement {
  private shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
  }

  // 公共方法
  public getFormData() {
    const inputs = this.shadow.querySelectorAll('input, textarea, select')
    const data: Record<string, string> = {}

    inputs.forEach(input => {
      const name = input.getAttribute('name')
      if (name) {
        data[name] = (input as HTMLInputElement).value
      }
    })

    return data
  }

  public setFormData(data: Record<string, string>) {
    Object.entries(data).forEach(([name, value]) => {
      const input = this.shadow.querySelector(`[name="${name}"]`) as HTMLInputElement
      if (input) {
        input.value = value
      }
    })
  }

  public reset() {
    this.shadow.querySelectorAll('input, textarea').forEach(input => {
      (input as HTMLInputElement).value = ''
    })
  }

  public validate(): boolean {
    const inputs = this.shadow.querySelectorAll('[required]')
    let isValid = true

    inputs.forEach(input => {
      if (!(input as HTMLInputElement).value) {
        isValid = false
        input.classList.add('invalid')
      }
    })

    return isValid
  }

  private render() {
    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: sans-serif;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        input, textarea {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        input.invalid, textarea.invalid {
          border-color: red;
        }

        button {
          padding: 10px 16px;
          background: #42b883;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>

      <form @submit="return false;">
        <input type="text" name="username" placeholder="用户名" required />
        <input type="email" name="email" placeholder="邮箱" required />
        <textarea name="message" placeholder="消息" rows="4"></textarea>
        <button type="submit">提交</button>
      </form>
    `
  }
}

customElements.define('form-builder', FormBuilder)

// 使用方法
const form = document.querySelector('form-builder') as FormBuilder
form?.setFormData({ username: 'John', email: 'john@example.com' })
const isValid = form?.validate()
const data = form?.getFormData()


// ========== 方案四：共享状态（Event Bus） ==========

class EventBus {
  private events = new Map<string, Set<Function>>()

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(callback)
  }

  off(event: string, callback: Function) {
    this.events.get(event)?.delete(callback)
  }

  emit(event: string, data?: any) {
    this.events.get(event)?.forEach(callback => callback(data))
  }
}

const globalEventBus = new EventBus()

// 在组件中使用
class ComponentA extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<button>Send Message</button>'
    this.querySelector('button')?.addEventListener('click', () => {
      globalEventBus.emit('message', { from: 'ComponentA', text: 'Hello!' })
    })
  }
}

class ComponentB extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<div>Messages will appear here</div>'

    globalEventBus.on('message', (data) => {
      this.innerHTML += `<p>${JSON.stringify(data)}</p>`
    })
  }

  disconnectedCallback() {
    // 清理监听
    globalEventBus.off('message', () => {})
  }
}
```

### 5.2 状态管理

```typescript
// main-app/src/utils/store.ts
/**
 * 简单的状态管理实现
 */

type Listener = (state: any) => void

class Store {
  private state: Record<string, any> = {}
  private listeners = new Map<string, Set<Listener>>()

  /**
   * 获取状态
   */
  getState(key?: string): any {
    return key ? this.state[key] : this.state
  }

  /**
   * 设置状态
   */
  setState(partialState: Record<string, any>) {
    const prevState = { ...this.state }
    this.state = { ...this.state, ...partialState }

    // 通知所有监听者
    Object.keys(partialState).forEach(key => {
      this.listeners.get(key)?.forEach(listener => {
        listener({ [key]: partialState[key] })
      })
    })

    // 通知全局监听者
    this.listeners.get('*')?.forEach(listener => {
      listener(this.state)
    })
  }

  /**
   * 订阅状态变化
   */
  subscribe(key: string | '*', listener: Listener): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set())
    }
    this.listeners.get(key)!.add(listener)

    // 返回取消订阅函数
    return () => this.unsubscribe(key, listener)
  }

  /**
   * 取消订阅
   */
  unsubscribe(key: string, listener: Listener) {
    this.listeners.get(key)?.delete(listener)
  }
}

// 创建全局 store
export const store = new Store()

// 初始化状态
store.setState({
  user: null,
  theme: 'light',
  language: 'zh-CN'
})

// 在 Web Component 中使用
class ThemedComponent extends HTMLElement {
  private unsubscribe?: () => void

  connectedCallback() {
    this.applyTheme(store.getState('theme'))

    this.unsubscribe = store.subscribe('theme', ({ theme }) => {
      this.applyTheme(theme)
    })
  }

  disconnectedCallback() {
    this.unsubscribe?.()
  }

  private applyTheme(theme: string) {
    this.style.setProperty('--background', theme === 'dark' ? '#333' : '#fff')
    this.style.setProperty('--color', theme === 'dark' ? '#fff' : '#333')
  }
}
```

### 5.3 路由集成

```typescript
// main-app/src/utils/router.ts
/**
 * 简单的路由实现
 */

interface Route {
  path: string
  component: string
  props?: Record<string, any>
}

class MicroRouter {
  private routes: Route[] = []
  private currentRoute: Route | null = null
  private fallbackComponent?: string

  /**
   * 注册路由
   */
  addRoutes(routes: Route[]) {
    this.routes.push(...routes)
  }

  /**
   * 设置 404 组件
   */
  setFallback(component: string) {
    this.fallbackComponent = component
  }

  /**
   * 导航到指定路径
   */
  navigate(path: string) {
    window.history.pushState({}, '', path)
    this.matchRoute()
  }

  /**
   * 匹配当前路由
   */
  private matchRoute() {
    const path = window.location.pathname

    // 精确匹配
    let route = this.routes.find(r => r.path === path)

    // 前缀匹配
    if (!route) {
      route = this.routes.find(r => path.startsWith(r.path))
    }

    if (route) {
      this.renderRoute(route)
    } else if (this.fallbackComponent) {
      this.renderRoute({ path: '', component: this.fallbackComponent })
    }
  }

  /**
   * 渲染路由组件
   */
  private renderRoute(route: Route) {
    if (this.currentRoute?.component === route.component) {
      return
    }

    this.currentRoute = route

    const container = document.querySelector('router-outlet')
    if (!container) return

    // 清空容器
    container.innerHTML = ''

    // 创建组件元素
    const element = document.createElement(route.component)

    // 设置属性
    if (route.props) {
      Object.entries(route.props).forEach(([key, value]) => {
        if (typeof value === 'object') {
          element.setAttribute(key, JSON.stringify(value))
        } else {
          element.setAttribute(key, String(value))
        }
      })
    }

    container.appendChild(element)
  }

  /**
   * 初始化路由
   */
  init() {
    // 监听 popstate 事件
    window.addEventListener('popstate', () => {
      this.matchRoute()
    })

    // 拦截所有链接点击
    document.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement).closest('a')
      if (link && link.getAttribute('href')?.startsWith('/')) {
        e.preventDefault()
        this.navigate(link.getAttribute('href')!)
      }
    })

    // 初始匹配
    this.matchRoute()
  }
}

export const router = new MicroRouter()

// 定义路由
router.addRoutes([
  { path: '/', component: 'home-page' },
  { path: '/about', component: 'about-page' },
  { path: '/users/:id', component: 'user-profile-page' }
])

// 使用
<router-outlet></router-outlet>

<script>
  router.init()
</script>
```

---

## 六、生产环境部署

### 6.1 组件库构建配置

```typescript
// micro-components/vite.config.ts
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MicroComponents',
      formats: ['es', 'umd'],
      fileName: (format) => `micro-components.${format}.js`
    },
    rollupOptions: {
      // 外部化依赖，避免打包
      external: [],
      output: {
        globals: {}
      }
    }
  }
})
```

### 6.2 CDN 部署

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>微前端应用</title>

  <!-- 加载 Web Components -->
  <script type="module" src="https://cdn.example.com/micro-components.es.js"></script>

  <!-- 可选：预加载关键组件 -->
  <link rel="modulepreload" href="https://cdn.example.com/todo-app.js">
  <link rel="modulepreload" href="https://cdn.example.com/user-profile.js">
</head>
<body>
  <todo-app title="我的任务"></todo-app>
  <user-profile username="张三"></user-profile>
</body>
</html>
```

### 6.3 版本管理

```typescript
// 组件版本管理
interface ComponentVersion {
  version: string
  url: string
  checksum: string
}

class ComponentRegistry {
  private versions = new Map<string, ComponentVersion[]>()

  register(name: string, version: ComponentVersion) {
    if (!this.versions.has(name)) {
      this.versions.set(name, [])
    }
    this.versions.get(name)!.push(version)
  }

  getLatest(name: string): ComponentVersion | null {
    const versions = this.versions.get(name)
    if (!versions || versions.length === 0) return null

    return versions[versions.length - 1]
  }

  getVersion(name: string, version: string): ComponentVersion | null {
    const versions = this.versions.get(name)
    return versions?.find(v => v.version === version) || null
  }
}

// 使用
const registry = new ComponentRegistry()

registry.register('todo-app', {
  version: '1.0.0',
  url: 'https://cdn.example.com/todo-app@1.0.0.js',
  checksum: 'abc123'
})

registry.register('todo-app', {
  version: '1.1.0',
  url: 'https://cdn.example.com/todo-app@1.1.0.js',
  checksum: 'def456'
})

// 获取最新版本
const latest = registry.getLatest('todo-app')
```

---

## 七、最佳实践

### 7.1 性能优化

```typescript
// 1. 懒加载
class LazyComponent extends HTMLElement {
  private observer: IntersectionObserver | null = null

  connectedCallback() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.load()
          this.observer?.disconnect()
        }
      })
    })

    this.observer.observe(this)
  }

  private async load() {
    const src = this.getAttribute('src')
    if (!src) return

    // 动态导入组件
    const module = await import(src)
    customElements.define(this.localName, module.default)

    // 重新渲染
    const newElement = document.createElement(this.localName)
    this.replaceWith(newElement)
  }
}

// 2. 防抖更新
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

class SearchInput extends HTMLElement {
  private input: HTMLInputElement | null = null

  connectedCallback() {
    this.innerHTML = '<input type="search" placeholder="搜索...">'
    this.input = this.querySelector('input')

    const debouncedSearch = debounce((value: string) => {
      this.dispatchEvent(new CustomEvent('search', {
        detail: { query: value },
        bubbles: true
      }))
    }, 300)

    this.input?.addEventListener('input', (e) => {
      debouncedSearch((e.target as HTMLInputElement).value)
    })
  }
}

// 3. 虚拟滚动（简化版）
class VirtualList extends HTMLElement {
  private itemHeight = 50
  private visibleItems: HTMLElement[] = []

  connectedCallback() {
    const data = JSON.parse(this.getAttribute('data') || '[]')
    const containerHeight = parseInt(this.getAttribute('height') || '400')

    this.style.height = `${containerHeight}px`
    this.style.overflow = 'auto'

    this.renderVirtualList(data, containerHeight)
  }

  private renderVirtualList(data: any[], containerHeight: number) {
    const totalHeight = data.length * this.itemHeight
    const visibleCount = Math.ceil(containerHeight / this.itemHeight) + 2

    this.innerHTML = `
      <div style="height: ${totalHeight}px; position: relative;">
        <div class="viewport" style="position: absolute; top: 0; left: 0; right: 0;">
        </div>
      </div>
    `

    const viewport = this.querySelector('.viewport')!

    this.addEventListener('scroll', () => {
      const scrollTop = this.scrollTop
      const startIndex = Math.floor(scrollTop / this.itemHeight)
      const endIndex = Math.min(startIndex + visibleCount, data.length)

      viewport.style.transform = `translateY(${startIndex * this.itemHeight}px)`

      viewport.innerHTML = data
        .slice(startIndex, endIndex)
        .map((item, index) => `<div style="height: ${this.itemHeight}px;">${item.name}</div>`)
        .join('')
    })

    // 初始渲染
    this.dispatchEvent(new Event('scroll'))
  }
}
```

### 7.2 可访问性

```typescript
// ARIA 属性支持
class AccessibleButton extends HTMLElement {
  connectedCallback() {
    const label = this.getAttribute('aria-label') || '按钮'
    const disabled = this.hasAttribute('disabled')

    this.innerHTML = `
      <button
        aria-label="${label}"
        ${disabled ? 'disabled' : ''}
        role="button"
        tabindex="${disabled ? '-1' : '0'}"
      >
        <slot></slot>
      </button>
    `

    // 键盘支持
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        this.dispatchEvent(new Event('click'))
      }
    })
  }
}

// 焦点管理
class ModalDialog extends HTMLElement {
  private focusableElements: HTMLElement[] = []
  private previousActiveElement: HTMLElement | null = null

  connectedCallback() {
    this.setAttribute('role', 'dialog')
    this.setAttribute('aria-modal', 'true')

    const closeBtn = this.querySelector('[data-close]')
    closeBtn?.addEventListener('click', () => this.close())

    this.open()
  }

  private open() {
    // 保存当前焦点元素
    this.previousActiveElement = document.activeElement as HTMLElement

    // 获取所有可聚焦元素
    this.focusableElements = Array.from(
      this.querySelectorAll<
        HTMLElement
      >('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    )

    // 聚焦到第一个元素
    this.focusableElements[0]?.focus()

    // 监听 Tab 键，实现焦点循环
    this.addEventListener('keydown', this.trapFocus)

    // 监听 Esc 键
    this.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close()
      }
    })
  }

  private trapFocus = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    const firstElement = this.focusableElements[0]
    const lastElement = this.focusableElements[this.focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  private close() {
    this.removeEventListener('keydown', this.trapFocus)
    this.remove()

    // 恢复之前的焦点
    this.previousActiveElement?.focus()
  }
}
```

### 7.3 错误处理

```typescript
// 错误边界组件
class ErrorBoundary extends HTMLElement {
  private childContent: string = ''

  connectedCallback() {
    this.childContent = this.innerHTML
    this.innerHTML = ''

    try {
      this.renderChild()
    } catch (error) {
      this.renderError(error instanceof Error ? error : new Error('Unknown error'))
    }
  }

  private renderChild() {
    const shadow = this.attachShadow({ mode: 'open' })

    // 监听子组件错误
    window.addEventListener('error', (e) => {
      if (e.target && this.contains(e.target as Node)) {
        this.renderError(new Error(e.message))
      }
    }, true)

    window.addEventListener('unhandledrejection', (e) => {
      this.renderError(new Error(e.reason))
    })

    shadow.innerHTML = this.childContent
  }

  private renderError(error: Error) {
    this.innerHTML = `
      <div style="
        padding: 20px;
        background: #fff5f5;
        border: 1px solid #feb2b2;
        border-radius: 8px;
        color: #c53030;
      ">
        <h3>出错了</h3>
        <p>${error.message}</p>
        <button onclick="this.parentElement.parentElement.replaceChildren(
          this.parentElement.parentElement.originalContent
        )">重试</button>
      </div>
    `

    // 上报错误
    console.error('Component error:', error)

    // 发送到监控平台
    // sendErrorToMonitoring(error)
  }
}

customElements.define('error-boundary', ErrorBoundary)

// 使用
<error-boundary>
  <risky-component></risky-component>
</error-boundary>
```

---

## 八、常见问题与解决方案

### 8.1 样式穿透

**问题：** 需要从外部设置 Shadow DOM 内部样式

**解决方案：**

```typescript
// 方案一：CSS 自定义属性
class ThemedCard extends HTMLElement {
  private shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.shadow.innerHTML = `
      <style>
        :host {
          --card-bg: #fff;
          --card-color: #333;
          --card-padding: 16px;
          --card-radius: 8px;

          display: block;
        }

        .card {
          background: var(--card-bg);
          color: var(--card-color);
          padding: var(--card-padding);
          border-radius: var(--card-radius);
        }
      </style>

      <div class="card">
        <slot></slot>
      </div>
    `
  }
}

// 外部设置样式
const card = document.createElement('themed-card')
card.style.setProperty('--card-bg', '#f0f0f0')
card.style.setProperty('--card-color', '#000')

// 方案二：使用 @layer 和 :export
// 或者使用 Parts API（实验性）
```

### 8.2 表单元素集成

**问题：** Shadow DOM 内的表单元素不参与表单提交

**解决方案：**

```typescript
class FormField extends HTMLElement {
  private shadow: ShadowRoot
  private input: HTMLInputElement | null = null

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    const name = this.getAttribute('name') || ''
    const value = this.getAttribute('value') || ''

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .wrapper {
          position: relative;
        }

        .wrapper input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      </style>

      <div class="wrapper">
        <slot name="label"></slot>
        <input
          type="text"
          name="${name}"
          value="${value}"
        />
      </div>
    `

    this.input = this.shadow.querySelector('input')

    // 隐藏的原生 input，用于表单提交
    const hiddenInput = document.createElement('input')
    hiddenInput.type = 'hidden'
    hiddenInput.name = name
    hiddenInput.value = value
    this.appendChild(hiddenInput)

    // 同步值
    this.input?.addEventListener('input', () => {
      hiddenInput.value = this.input!.value
    })
  }
}

customElements.define('form-field', FormField)

// 使用
<form>
  <form-field name="username" value="John">
    <label slot="label">用户名</label>
  </form-field>
  <button type="submit">提交</button>
</form>
```

### 8.3 TypeScript 支持

**解决方案：**

```typescript
// 定义 Web Component 类型
declare global {
  interface HTMLElementTagNameMap {
    'todo-app': TodoApp & HTMLElement
    'user-profile': UserProfile & HTMLElement
  }

  interface HTMLElementEventMap {
    'count-changed': CustomEvent<{ count: number }>
    'profile-updated': CustomEvent<any>
  }
}

// 组件定义
class TodoApp extends HTMLElement {
  // 类型安全的属性
  get title(): string {
    return this.getAttribute('title') || ''
  }

  set title(value: string) {
    this.setAttribute('title', value)
  }

  // 类型安全的方法
  public addTodo(text: string): void {
    // ...
  }

  public getTodos(): Todo[] {
    return []
  }
}

// 使用时的类型推断
const todoApp = document.querySelector('todo-app')!
todoApp.title = '我的任务'
todoApp.addTodo('新任务')
const todos = todoApp.getTodos()

todoApp.addEventListener('count-changed', (e) => {
  console.log(e.detail.count) // 类型安全
})
```

### 8.4 测试

```typescript
// 使用 Web Test Runner 测试 Web Components
import { expect, fixture } from '@open-wc/testing'
import '../src/my-component.js'

describe('MyComponent', () => {
  it('renders with default props', async () => {
    const el = await fixture('<my-component></my-component>')

    expect(el.shadowRoot).to.exist
    expect(el.shadowRoot?.textContent).to.include('Hello')
  })

  it('updates when props change', async () => {
    const el = await fixture('<my-component name="World"></my-component>')

    el.setAttribute('name', 'Alice')

    await el.updateComplete

    expect(el.shadowRoot?.textContent).to.include('Alice')
  })

  it('dispatches custom event', async () => {
    const el = await fixture('<my-component></my-component>')
    const eventSpy = sinon.spy()

    el.addEventListener('my-event', eventSpy)

    el.shadowRoot?.querySelector('button')?.click()

    expect(eventSpy).to.have.been.calledOnce
  })
})
```

---

## 九、工具与库推荐

### 9.1 核心框架与库

| 库/框架 | 描述 | 特点 | 推荐场景 |
|---------|------|------|----------|
| **[Lit](https://lit.dev/)** | Google 开发的轻量级库 | 响应式、高性能、TypeScript 友好 | 生产环境首选 |
| **[Fast](https://www.fast.design/)** | 微软开发的 Web Components UI 库 | Fluent Design、丰富的组件库 | 企业级应用 |
| **[Stencil](https://stenciljs.com/)** | Ionic 开发的编译器 | 编译为原生 Web Components | 需要编译优化 |
| **[Slim.js](https://slim.js.org/)** | 极轻量级库 | 3KB、无依赖 | 简单组件 |
| **[GucciJS](https://guccijs.com/)** | 适配器框架 | 支持多种框架语法迁移 | 迁移现有组件 |

### 9.2 开发工具

```bash
# 初始化 Web Components 项目
npm init @open-wc

# 代码生成工具
npm install -g @web/dev-server

# 测试工具
npm install --save-dev @web/test-runner
```

```typescript
// vite.config.ts - Vite 构建 Web Components
import { defineConfig } from 'vite'
import { cesiumPlugin } from 'vite-plugin-cesium'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'umd'],
      fileName: (format) => `my-components.${format}.js`
    },
    rollupOptions: {
      external: ['lit'],
      output: {
        globals: { lit: 'Lit' }
      }
    }
  },
  plugins: [
    // 处理 Web Components
    {
      name: 'web-components',
      transform(code, id) {
        if (id.endsWith('.ts')) {
          // 自定义转换逻辑
        }
      }
    }
  ]
})
```

### 9.3 Lit 实战示例

```typescript
// 使用 Lit 开发 Web Components
import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { when } from 'lit/directives/when.js'

@customElement('todo-list-lit')
export class TodoListLit extends LitElement {
  // 样式
  static styles = css`
    :host {
      display: block;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      font-family: system-ui, sans-serif;
    }

    .input-group {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    input {
      flex: 1;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
    }

    button {
      padding: 12px 24px;
      background: #42b883;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    button:hover {
      background: #36a870;
    }

    .todo-list {
      list-style: none;
      padding: 0;
    }

    .todo-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      margin-bottom: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .todo-item.completed span {
      text-decoration: line-through;
      color: #999;
    }

    .delete-btn {
      margin-left: auto;
      padding: 4px 8px;
      background: #ef4444;
      font-size: 12px;
    }

    .empty {
      text-align: center;
      color: #999;
      padding: 40px;
    }

    .filters {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .filter-btn {
      padding: 6px 12px;
      background: #f3f4f6;
      color: #666;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .filter-btn.active {
      background: #42b883;
      color: white;
    }
  `

  // 响应式属性（触发重新渲染）
  @property()
  title: string = '待办事项'

  // 内部状态（私有，不对外暴露）
  @state()
  private _todos: Todo[] = []

  @state()
  private _filter: 'all' | 'active' | 'completed' = 'all'

  // 生命周期
  connectedCallback() {
    super.connectedCallback()
    this.loadTodos()
  }

  // 方法
  private loadTodos() {
    const stored = localStorage.getItem('todos')
    if (stored) {
      this._todos = JSON.parse(stored)
    }
  }

  private saveTodos() {
    localStorage.setItem('todos', JSON.stringify(this._todos))
  }

  private addTodo() {
    const input = this.shadowRoot?.querySelector('input') as HTMLInputElement
    const text = input?.value.trim()

    if (text) {
      this._todos = [
        ...this._todos,
        { id: Date.now(), text, completed: false }
      ]
      this.saveTodos()
      input.value = ''
    }
  }

  private toggleTodo(id: number) {
    this._todos = this._todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    )
    this.saveTodos()
  }

  private deleteTodo(id: number) {
    this._todos = this._todos.filter(todo => todo.id !== id)
    this.saveTodos()
  }

  private setFilter(filter: typeof this._filter) {
    this._filter = filter
  }

  private get filteredTodos() {
    switch (this._filter) {
      case 'active':
        return this._todos.filter(t => !t.completed)
      case 'completed':
        return this._todos.filter(t => t.completed)
      default:
        return this._todos
    }
  }

  // 渲染模板
  render() {
    return html`
      <h2>${this.title}</h2>

      <div class="input-group">
        <input
          type="text"
          placeholder="添加新任务..."
          @keypress=${(e: KeyboardEvent) => {
            if (e.key === 'Enter') this.addTodo()
          }}
        />
        <button @click=${this.addTodo}>添加</button>
      </div>

      <div class="filters">
        <button
          class="filter-btn ${this._filter === 'all' ? 'active' : ''}"
          @click=${() => this.setFilter('all')}
        >全部</button>
        <button
          class="filter-btn ${this._filter === 'active' ? 'active' : ''}"
          @click=${() => this.setFilter('active')}
        >进行中</button>
        <button
          class="filter-btn ${this._filter === 'completed' ? 'active' : ''}"
          @click=${() => this.setFilter('completed')}
        >已完成</button>
      </div>

      ${when(
        this.filteredTodos.length === 0,
        () => html`<div class="empty">暂无待办事项</div>`,
        () => html`
          <ul class="todo-list">
            ${repeat(
              this.filteredTodos,
              (todo) => todo.id,
              (todo) => html`
                <li class="todo-item ${todo.completed ? 'completed' : ''}">
                  <input
                    type="checkbox"
                    .checked=${todo.completed}
                    @change=${() => this.toggleTodo(todo.id)}
                  />
                  <span>${todo.text}</span>
                  <button
                    class="delete-btn"
                    @click=${() => this.deleteTodo(todo.id)}
                  >删除</button>
                </li>
              `
            )}
          </ul>
        `
      )}

      <div style="margin-top: 16px; color: #666;">
        共 ${this._todos.length} 个任务，
        完成 ${this._todos.filter(t => t.completed).length} 个
      </div>
    `
  }
}

interface Todo {
  id: number
  text: string
  completed: boolean
}
```

### 9.4 性能优化建议

```typescript
// ========== 1. 使用 Constructable Stylesheets 共享样式 ==========

const sharedStyles = new CSSStyleSheet()
sharedStyles.replace(`
  :host {
    font-family: system-ui, sans-serif;
  }
  .button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
`)

class OptimizedComponent extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    // 复用共享样式表
    shadow.adoptedStyleSheets = [sharedStyles]
  }
}

// ========== 2. 使用 requestAnimationFrame 批量更新 ==========

class BatchUpdateComponent extends HTMLElement {
  private pendingUpdate = false
  private data: any[] = []

  updateData(newData: any) {
    this.data.push(newData)

    if (!this.pendingUpdate) {
      this.pendingUpdate = true
      requestAnimationFrame(() => {
        this.render()
        this.pendingUpdate = false
      })
    }
  }

  private render() {
    this.innerHTML = this.data.map(d => `<div>${d}</div>`).join('')
  }
}

// ========== 3. 虚拟滚动优化 ==========

class VirtualScrollList extends HTMLElement {
  private itemHeight = 50
  private visibleCount = 20
  private scrollTop = 0

  connectedCallback() {
    const data = JSON.parse(this.getAttribute('data') || '[]')
    const totalHeight = data.length * this.itemHeight

    this.innerHTML = `
      <div style="height: ${totalHeight}px; position: relative;">
        <div class="viewport" style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          transform: translateY(0px);
        "></div>
      </div>
    `

    this.addEventListener('scroll', this.onScroll)
  }

  private onScroll = () => {
    this.scrollTop = this.scrollTop
    this.updateViewport()
  }

  private updateViewport() {
    const viewport = this.querySelector('.viewport')!
    const startIndex = Math.floor(this.scrollTop / this.itemHeight)
    const offset = startIndex * this.itemHeight

    viewport.style.transform = `translateY(${offset}px)`
    // 只渲染可见项
    viewport.innerHTML = this.renderVisibleItems(startIndex)
  }
}

// ========== 4. 懒加载 IntersectionObserver ==========

class LazyComponent extends HTMLElement {
  private observer: IntersectionObserver | null = null

  connectedCallback() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.load()
            this.observer?.disconnect()
          }
        })
      },
      { rootMargin: '50px' }
    )
    this.observer.observe(this)
  }

  private async load() {
    const src = this.getAttribute('src')
    if (src) {
      const module = await import(src)
      // 渲染组件
    }
  }

  disconnectedCallback() {
    this.observer?.disconnect()
  }
}
```

---

## 十、参考资源

### 官方文档
- [Web Components MDN 文档](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
- [WebComponents.org](https://www.webcomponents.org/)
- [W3C Web Components 规范](https://www.w3.org/TR/components/)

### 开发框架
- [Lit - 轻量级 Web Components 库](https://lit.dev/)
- [Lit 中文文档](https://lit.dev/docs/)
- [Fast - Web Components 工具集](https://www.fast.design/)
- [Open Web Components](https://open-wc.org/)
- [Stencil - Web Components 编译器](https://stenciljs.com/)

### 学习资源
- [Web Components 最佳实践](https://www.webcomponents.org/community/articles)
- [Building Web Components with TypeScript](https://dev.to/bennypowers/lets-build-web-components-part-1-3d3)
- [Shadow DOM CSS 详解](https://css-tricks.com/slotted-styling-content-shadow-dom/)

### 工具
- [@web/components-cli](https://github.com/wc-dev/components-cli) - 组件开发脚手架
- [web-test-runner](https://modern-web.dev/docs/test-runner/overview/) - Web Components 测试工具
- [custom-elements-manifest](https://github.com/webcomponents/custom-elements-manifest) - 组件元数据规范

### 示例项目
- [webcomponents.org 示例](https://www.webcomponents.org/community)
- [Lit 示例集合](https://lit.dev/docs/examples/)
- [Fast 元素库](https://fast.design/docs/components/)
