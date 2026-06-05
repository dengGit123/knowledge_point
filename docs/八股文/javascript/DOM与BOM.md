# DOM 与 BOM

> 官方文档：[MDN - DOM](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model)

> 官方文档：[MDN - BOM](https://developer.mozilla.org/zh-CN/docs/Web/API/Window)

---

## 一、DOM 与 BOM 的关系

```
┌─ 浏览器环境 ────────────────────────────────────────┐
│                                                      │
│  BOM（Browser Object Model）                          │
│  ┌──────────────────────────────────────────────┐   │
│  │  window（全局对象）                            │   │
│  │  ├── location   （地址栏信息）                 │   │
│  │  ├── navigator  （浏览器信息）                 │   │
│  │  ├── history    （历史记录）                   │   │
│  │  ├── screen     （屏幕信息）                   │   │
│  │  │                                            │   │
│  │  │   DOM（Document Object Model）              │   │
│  │  │  ┌────────────────────────────────────┐    │   │
│  │  │  │  document（文档对象）                │    │   │
│  │  │  │  ├── html                           │    │   │
│  │  │  │  │   ├── head                       │    │   │
│  │  │  │  │   └── body                       │    │   │
│  │  │  │  │       ├── div                    │    │   │
│  │  │  │  │       └── ...                    │    │   │
│  │  │  └────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 二、DOM 节点类型

| 节点类型 | nodeType | 说明 |
|---------|----------|------|
| 元素节点 | `1` | `Element`，如 `<div>`、`<p>` |
| 文本节点 | `3` | 元素内的文本 |
| 属性节点 | `2` | 元素的属性（已不推荐直接使用） |
| 注释节点 | `8` | `<!-- 注释 -->` |
| 文档节点 | `9` | `document` |
| 文档片段 | `11` | `DocumentFragment` |

---

## 三、DOM 操作

### 获取元素

```javascript
// 现代 API（推荐）
document.getElementById('app')                  // 单个元素
document.querySelector('.item')                  // CSS 选择器，返回第一个
document.querySelectorAll('.item')               // CSS 选择器，返回 NodeList

// 传统 API
document.getElementsByClassName('items')         // HTMLCollection（动态）
document.getElementsByTagName('div')             // HTMLCollection（动态）
document.getElementsByName('email')              // NodeList
```

| 方法 | 返回类型 | 是否动态 | 推荐 |
|------|---------|---------|------|
| `getElementById` | Element | — | ✅ |
| `querySelector` | Element \| null | — | ✅ |
| `querySelectorAll` | NodeList | 静态 | ✅ |
| `getElementsByClassName` | HTMLCollection | **动态** | ⚠️ |
| `getElementsByTagName` | HTMLCollection | **动态** | ⚠️ |

> **动态 vs 静态**：动态集合会随 DOM 变化自动更新；静态集合是快照，不随 DOM 变化。

### 创建和插入

```javascript
// 创建节点
const div = document.createElement('div')
const text = document.createTextNode('Hello')
const fragment = document.createDocumentFragment()

// 设置内容
div.textContent = 'Hello'             // 纯文本（安全，自动转义）
div.innerHTML = '<span>Hi</span>'      // HTML（注意 XSS 风险）

// 插入节点
parent.appendChild(child)              // 追加到末尾
parent.insertBefore(newNode, refNode)  // 在 refNode 之前插入
parent.append(child1, child2, 'text')  // 追加多个（现代 API）

// 插入位置（现代 API）
target.before(element)                 // 在 target 之前插入
target.after(element)                  // 在 target 之后插入
target.prepend(element)                // 在 target 内部开头插入
target.append(element)                 // 在 target 内部末尾插入

// 替换和删除
parent.replaceChild(newChild, oldChild)
parent.removeChild(child)
child.remove()                         // 现代 API
```

### 属性操作

```javascript
const el = document.querySelector('#app')

// 标准 API（推荐用于 HTML 标准属性）
el.id = 'newId'
el.className = 'active'
el.setAttribute('data-id', '123')
el.getAttribute('data-id')          // '123'
el.removeAttribute('data-id')
el.hasAttribute('data-id')          // false

// dataset（自定义 data-* 属性）
el.dataset.userId = '42'            // <div data-user-id="42">
console.log(el.dataset.userId)      // '42'

// classList（推荐）
el.classList.add('active')
el.classList.remove('hidden')
el.classList.toggle('dark-mode')
el.classList.contains('active')     // true
el.classList.replace('old', 'new')

// style（行内样式）
el.style.color = 'red'
el.style.fontSize = '16px'
el.style.display = 'none'

// 获取计算后的样式
getComputedStyle(el).color
getComputedStyle(el).width
```

### DocumentFragment —— 批量操作优化

```javascript
// ❌ 频繁操作 DOM（触发多次重排）
const list = document.getElementById('list')
for (let i = 0; i < 100; i++) {
  const li = document.createElement('li')
  li.textContent = `Item ${i}`
  list.appendChild(li)  // 每次都触发重排
}

// ✅ 使用 DocumentFragment（只触发一次重排）
const fragment = document.createDocumentFragment()
for (let i = 0; i < 100; i++) {
  const li = document.createElement('li')
  li.textContent = `Item ${i}`
  fragment.appendChild(li)  // 在内存中操作，不触发重排
}
list.appendChild(fragment)  // 一次性插入
```

---

## 四、DOM 事件

### 事件流

```
事件传播的三个阶段：

① 捕获阶段（Capture Phase）
   window → document → html → body → ... → 目标父元素

② 目标阶段（Target Phase）
   到达实际触发事件的目标元素

③ 冒泡阶段（Bubbling Phase）
   目标元素 → ... → body → html → document → window

示例：
<div id="outer">
  <button id="inner">点击</button>
</div>

点击 button 时：
  捕获: window → document → html → body → div#outer
  目标: button#inner
  冒泡: div#outer → body → html → document → window
```

### 事件监听

```javascript
const btn = document.querySelector('#btn')

// 添加事件监听（推荐）
btn.addEventListener('click', handler, {
  capture: false,    // 是否在捕获阶段触发（默认 false，即冒泡阶段）
  once: false,       // 是否只触发一次
  passive: false     // 是否永远不会调用 preventDefault（优化滚动性能）
})

// 简写形式
btn.addEventListener('click', handler)

// 移除事件监听
btn.removeEventListener('click', handler)

// 内联事件（不推荐）
// <button onclick="handler()">点击</button>
```

### 事件对象

```javascript
btn.addEventListener('click', (event) => {
  // 事件类型
  event.type                        // 'click'

  // 目标元素
  event.target                      // 触发事件的元素（可能是子元素）
  event.currentTarget               // 绑定事件的元素（即 btn）
  event.delegateTarget              // 事件委托的元素（jQuery）

  // 坐标信息
  event.clientX / event.clientY     // 相对于视口
  event.pageX / event.pageY         // 相对于文档
  event.offsetX / event.offsetY     // 相对于目标元素

  // 控制行为
  event.preventDefault()            // 阻止默认行为（如链接跳转）
  event.stopPropagation()           // 阻止事件继续传播
  event.stopImmediatePropagation()  // 阻止同元素上的其他监听器执行

  // 键盘事件
  event.key                         // 'Enter', 'Escape', 'a' 等
  event.code                        // 'KeyA', 'Enter' 等
  event.ctrlKey / event.shiftKey / event.altKey / event.metaKey

  // 鼠标事件
  event.button                      // 0=左键, 1=中键, 2=右键
})
```

### 事件委托（Event Delegation）

利用事件冒泡，将子元素的事件监听器绑定到**父元素**上。

```javascript
// ❌ 为每个 li 绑定事件（性能差，新增元素无事件）
document.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', handler)
})

// ✅ 事件委托（绑定在父元素上）
document.querySelector('ul').addEventListener('click', (e) => {
  // 检查点击的是否是 li 元素
  if (e.target.tagName === 'LI') {
    console.log('点击了:', e.target.textContent)
  }

  // 使用 matches 进行更精确的匹配
  const item = e.target.closest('li.item')
  if (item) {
    console.log('点击了:', item.dataset.id)
  }
})
```

**优势**：
- 减少事件监听器数量，节省内存
- 动态添加的子元素自动拥有事件处理
- 代码更简洁

### 常用事件

| 类别 | 事件 |
|------|------|
| 鼠标 | `click`、`dblclick`、`mousedown`、`mouseup`、`mousemove`、`mouseenter`、`mouseleave` |
| 键盘 | `keydown`、`keyup`、`keypress`（已废弃） |
| 表单 | `submit`、`change`、`input`、`focus`、`blur` |
| 滚动 | `scroll`、`wheel` |
| 触摸 | `touchstart`、`touchmove`、`touchend` |
| 拖拽 | `dragstart`、`drag`、`dragend`、`dragover`、`drop` |
| 资源 | `load`、`error`、`abort` |
| DOM 变化 | `DOMContentLoaded`、`resize` |

### mouseenter vs mouseover

| 维度 | `mouseenter` / `mouseleave` | `mouseover` / `mouseout` |
|------|---------------------------|-------------------------|
| 冒泡 | ❌ 不冒泡 | ✅ 冒泡 |
| 子元素触发 | 不触发（离开父元素才触发） | 触发（进入/离开子元素也会触发） |
| 使用场景 | 只关心进出元素本身 | 需要知道进出子元素 |

---

## 五、BOM 常用 API

### window 对象

```javascript
// 窗口信息
window.innerWidth           // 视口宽度
window.innerHeight          // 视口高度
window.outerWidth           // 浏览器窗口宽度
window.outerHeight          // 浏览器窗口高度
window.screenX              // 窗口距屏幕左侧距离
window.screenY              // 窗口距屏幕顶部距离

// 窗口操作
window.open('https://example.com')
window.close()
window.scrollTo(0, 0)       // 滚动到指定位置
window.scrollBy(0, 100)     // 相对滚动

// 定时器
const timer1 = setTimeout(() => {}, 1000)
clearTimeout(timer1)
const timer2 = setInterval(() => {}, 1000)
clearInterval(timer2)

// requestAnimationFrame（推荐用于动画）
const raf = requestAnimationFrame(() => {})
cancelAnimationFrame(raf)
```

### location 对象

```javascript
// 完整 URL: https://example.com:8080/path/page?name=Tom#section
location.href          // 完整 URL
location.protocol      // 'https:'
location.hostname      // 'example.com'
location.port          // '8080'
location.pathname      // '/path/page'
location.search        // '?name=Tom'
location.hash          // '#section'
location.origin        // 'https://example.com:8080'

// URL 参数解析
const params = new URLSearchParams(location.search)
params.get('name')     // 'Tom'
params.has('name')     // true

// 页面跳转
location.assign('https://example.com')  // 加载新页面（可后退）
location.replace('https://example.com') // 替换当前页面（不可后退）
location.reload()                        // 刷新页面
location.reload(true)                    // 强制刷新（清除缓存）
```

### navigator 对象

```javascript
navigator.userAgent      // 浏览器标识字符串
navigator.language       // 浏览器语言 'zh-CN'
navigator.platform       // 操作系统平台
navigator.onLine         // 是否联网
navigator.cookieEnabled  // 是否启用 Cookie
navigator.clipboard      // 剪贴板 API
navigator.geolocation    // 地理位置 API

// 检测特性（推荐）
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(pos => {
    console.log(pos.coords.latitude, pos.coords.longitude)
  })
}
```

### history 对象

```javascript
history.length           // 历史记录数量
history.back()           // 后退
history.forward()        // 前进
history.go(-1)           // 后退一步
history.go(1)            // 前进一步

// History API（SPA 路由基础）
history.pushState(state, title, url)    // 添加历史记录
history.replaceState(state, title, url) // 替换当前记录

window.addEventListener('popstate', (e) => {
  console.log(e.state)   // 获取 pushState 传入的 state
})
```

### screen 对象

```javascript
screen.width             // 屏幕宽度
screen.height            // 屏幕高度
screen.availWidth        // 可用宽度（排除任务栏）
screen.availHeight       // 可用高度
screen.devicePixelRatio  // 设备像素比（高清屏 > 1）
```

---

## 六、性能优化

### 重排（Reflow）与重绘（Repaint）

```
重排（Reflow）：元素的位置、大小、布局发生变化 → 重新计算布局
重绘（Repaint）：元素的外观（颜色、背景等）变化 → 重新绘制外观

性能影响：重排 > 重绘
```

| 操作 | 触发 |
|------|------|
| 添加/删除可见 DOM 元素 | 重排 |
| 改变 `width`、`height`、`margin`、`padding` | 重排 |
| 改变 `display: none` | 重排 |
| 改变 `color`、`background` | 重绘 |
| 改变 `visibility: hidden` | 重绘 |
| 改变 `opacity` | 重绘（部分情况） |

### 优化策略

```javascript
// 1. 批量修改样式（减少重排次数）
// ❌
el.style.width = '100px'
el.style.height = '200px'
el.style.margin = '10px'

// ✅ 使用 class 替代
el.className = 'new-style'
// 或使用 cssText
el.style.cssText = 'width:100px;height:200px;margin:10px'

// 2. 使用 transform 替代定位属性
// ❌ 触发重排
el.style.left = '100px'
el.style.top = '100px'
// ✅ 只触发合成（Composite）
el.style.transform = 'translate(100px, 100px)'

// 3. 读写分离
// ❌ 强制重排（交替读写）
const h = el.offsetHeight  // 读 → 触发重排
el.style.height = h + 10 + 'px'  // 写
const w = el.offsetWidth   // 读 → 再次触发重排
el.style.width = w + 10 + 'px'   // 写

// ✅ 先读后写
const h = el.offsetHeight
const w = el.offsetWidth
el.style.height = h + 10 + 'px'
el.style.width = w + 10 + 'px'

// 4. 离线 DOM 操作
// ✅ 使用 DocumentFragment
// ✅ 先 display:none，修改完再 display:block
// ✅ 克隆节点 → 修改 → 替换

// 5. 使用 requestAnimationFrame
function animate() {
  // DOM 操作放在 rAF 中，与浏览器渲染帧同步
  requestAnimationFrame(() => {
    el.style.transform = `translateX(${x}px)`
  })
}
```

---

## 七、面试常见问题

### Q1：事件委托是什么？有什么好处？

事件委托利用**事件冒泡**机制，将子元素的事件监听器统一绑定到父元素上。通过 `event.target` 判断实际触发的子元素。

**好处**：
1. **减少内存**：只需一个监听器而非 N 个
2. **动态元素**：新增子元素自动拥有事件处理
3. **代码简洁**：集中管理逻辑

### Q2：target 和 currentTarget 的区别？

- `event.target`：**实际触发**事件的元素（可能是子元素）
- `event.currentTarget`：**绑定**事件监听器的元素（即 `addEventListener` 的调用者）

```javascript
ul.addEventListener('click', (e) => {
  e.target         // li（实际点击的元素）
  e.currentTarget  // ul（绑定监听器的元素）
})
```

### Q3：如何阻止事件冒泡和默认行为？

```javascript
// 阻止冒泡
event.stopPropagation()

// 阻止默认行为
event.preventDefault()

// 两者都阻止
event.stopPropagation()
event.preventDefault()

// 阻止同元素上其他监听器
event.stopImmediatePropagation()
```

### Q4：什么是重排和重绘？如何减少？

- **重排**：元素几何属性变化导致重新计算布局（性能消耗大）
- **重绘**：元素外观变化导致重新绘制（性能消耗较小）

减少方法：
1. 使用 `class` 替代逐条修改 style
2. 使用 `transform`/`opacity` 替代定位属性（只触发合成层）
3. 批量 DOM 操作使用 `DocumentFragment`
4. 避免频繁读取布局属性（`offsetHeight` 等会强制重排）
5. 对复杂动画使用 `position: absolute/fixed` 脱离文档流
