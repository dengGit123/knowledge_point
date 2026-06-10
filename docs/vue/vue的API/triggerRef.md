### triggerRef

> 📖 [官方文档 - triggerRef](https://cn.vuejs.org/api/reactivity-advanced.html#triggerref)

---

### 一、概述

`triggerRef()` 是 Vue 3 响应式系统中的一个低级 API，用于手动触发与 `shallowRef()` 关联的副作用（如视图更新、`watch` 回调等）。当你使用 `shallowRef` 创建响应式引用时，Vue 只追踪 `.value` 本身的变化，而不会深层追踪内部属性的变化。当你直接修改了 `shallowRef` 内部的深层属性后，视图不会自动更新，这时就需要调用 `triggerRef()` 来"通知" Vue："数据已经变了，请重新渲染"。

简单来说，`triggerRef` 就是给 `shallowRef` 准备的"手动刷新按钮"。

---

### 二、核心原理

#### 浅层响应式 vs 深层响应式

要理解 `triggerRef`，首先需要理解 `shallowRef` 的工作机制：

| 特性 | `ref` | `shallowRef` |
|------|-------|-------------|
| 追踪 `.value` 变化 | ✅ 是 | ✅ 是 |
| 追踪深层属性变化 | ✅ 是（递归代理） | ❌ 否（不代理） |
| 性能开销 | 较高（大对象递归代理） | 较低（只代理 .value） |
| 适用数据 | 简单值 / 小对象 | 大型对象 / 性能敏感场景 |

用一个生活中的类比来理解：`shallowRef` 就像一个快递柜，你只监控柜门是否被打开过（`.value` 是否被替换），但柜子里面东西的挪动、增减，监控系统是感知不到的。`triggerRef` 就是你主动按了一下"通知按钮"，告诉系统："柜子里的东西变了，请重新检查一下"。

#### 底层机制

```
shallowRef 数据变化流程：

1. 修改 shallowRef.value.count → Vue 不感知（无响应式代理）
2. 调用 triggerRef(ref)      → Vue 手动触发依赖收集队列中的所有 effect
3. 相关组件重新渲染           → 视图更新
```

`triggerRef` 的核心源码逻辑非常简单——它直接调用 ref 内部的 `triggerRefValue()` 方法，强制触发所有依赖这个 ref 的副作用函数（包括组件的渲染函数、`watchEffect`、`watch` 等）。

---

### 三、详细用法

#### 1. 基本用法

最基本的场景：修改 `shallowRef` 的深层属性后，手动触发更新。

```vue
<template>
  <div>
    <p>计数：{{ state.count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, triggerRef } from 'vue'

interface State {
  count: number
}

const state = shallowRef<State>({ count: 0 })

function increment() {
  // ❌ 直接修改深层属性，视图不会更新
  // state.value.count++
  // console.log(state.value.count) // 数据变了，但页面没更新

  // ✅ 修改后手动触发更新
  state.value.count++
  triggerRef(state) // 此时页面才会刷新显示新的值
}
</script>
```

#### 2. 进阶用法

##### 2.1 配合 watch 使用

```ts
import { shallowRef, triggerRef, watch } from 'vue'

interface UserInfo {
  name: string
  age: number
  hobbies: string[]
}

const userInfo = shallowRef<UserInfo>({
  name: '张三',
  age: 25,
  hobbies: ['阅读', '游泳']
})

// 开启 deep 选项或者 triggerRef 都能触发 watch 回调
watch(
  userInfo,
  (newVal) => {
    console.log('用户信息更新了：', newVal)
  },
  { deep: true } // 如果不开启 deep，仅 triggerRef 无法触发 watch
)

function addHobby(hobby: string) {
  userInfo.value.hobbies.push(hobby)
  triggerRef(userInfo) // 触发视图更新，配合 deep watch 可触发回调
}
```

##### 2.2 批量更新优化

```ts
import { shallowRef, triggerRef } from 'vue'

interface PageData {
  list: Array<{ id: number; name: string; status: number }>
  total: number
  page: number
}

const pageData = shallowRef<PageData>({
  list: [],
  total: 0,
  page: 1
})

function batchUpdate(items: Array<{ id: number; name: string }>) {
  // ✅ 批量修改多个属性，最后只触发一次更新
  pageData.value.list = items.map((item, index) => ({
    id: item.id,
    name: item.name,
    status: 1
  }))
  pageData.value.total = items.length
  pageData.value.page = 1

  // 只触发一次重新渲染，而不是三次
  triggerRef(pageData)
}
```

##### 2.3 在 composable 中封装

```ts
import { shallowRef, triggerRef } from 'vue'

interface TreeNode {
  id: string
  label: string
  children: TreeNode[]
  expanded: boolean
}

export function useTree(initialData: TreeNode[]) {
  const tree = shallowRef<TreeNode[]>(initialData)

  // 内部递归修改节点状态
  function toggleNode(nodeId: string) {
    function toggle(nodes: TreeNode[]): boolean {
      for (const node of nodes) {
        if (node.id === nodeId) {
          node.expanded = !node.expanded
          return true
        }
        if (node.children?.length && toggle(node.children)) {
          return true
        }
      }
      return false
    }

    toggle(tree.value)
    triggerRef(tree) // 统一触发更新
  }

  function appendNode(parentId: string, newNode: TreeNode) {
    function findAndAppend(nodes: TreeNode[]): boolean {
      for (const node of nodes) {
        if (node.id === parentId) {
          node.children.push(newNode)
          return true
        }
        if (node.children?.length && findAndAppend(node.children)) {
          return true
        }
      }
      return false
    }

    findAndAppend(tree.value)
    triggerRef(tree)
  }

  return {
    tree,
    toggleNode,
    appendNode
  }
}
```

##### 2.4 操作第三方库产生的数据

```ts
import { shallowRef, triggerRef, onMounted } from 'vue'
import * as echarts from 'echarts'

interface ChartOption {
  title: { text: string }
  xAxis: { data: string[] }
  yAxis: {}
  series: Array<{ type: string; data: number[] }>
}

export function useECharts(containerId: string) {
  const chartOption = shallowRef<ChartOption>({
    title: { text: '示例图表' },
    xAxis: { data: [] },
    yAxis: {},
    series: [{ type: 'bar', data: [] }]
  })

  let chartInstance: echarts.ECharts | null = null

  onMounted(() => {
    const dom = document.getElementById(containerId)
    if (dom) {
      chartInstance = echarts.init(dom)
    }
  })

  function updateChartData(xAxisData: string[], seriesData: number[]) {
    // 直接修改配置对象的深层属性
    chartOption.value.xAxis.data = xAxisData
    chartOption.value.series[0].data = seriesData

    // 手动触发响应式更新
    triggerRef(chartOption)

    // 同步到 ECharts 实例
    chartInstance?.setOption(chartOption.value)
  }

  return {
    chartOption,
    updateChartData
  }
}
```

#### 3. API 参数说明

##### 函数签名

```ts
function triggerRef(ref: ShallowRef): void
```

##### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `ref` | `ShallowRef` | 是 | 需要触发更新的 `shallowRef` 实例 |

##### 返回值

| 返回值 | 类型 | 说明 |
|--------|------|------|
| 无返回值 | `void` | 该函数没有返回值 |

> 💡 **提示：** `triggerRef` 只接受 `shallowRef` 作为参数。虽然技术上也可以传入普通 `ref`，但没有实际意义，因为普通 `ref` 会自动触发更新。

---

### 四、实现效果

以下是一个完整的可运行示例，展示 `triggerRef` 的实际效果：

```vue
<template>
  <div class="demo-container">
    <h3>triggerRef 效果演示</h3>

    <!-- 展示区 -->
    <div class="card">
      <p>用户名：{{ user.name }}</p>
      <p>年龄：{{ user.age }}</p>
      <p>爱好：{{ user.hobbies.join('、') }}</p>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="changeName">修改名字（不调用 triggerRef）</button>
      <button @click="changeNameWithTrigger">修改名字（调用 triggerRef）</button>
      <button @click="addHobby">添加爱好</button>
      <button @click="replaceUser">整体替换 .value</button>
    </div>

    <!-- 日志区 -->
    <div class="log">
      <p v-for="(log, index) in logs" :key="index">{{ log }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, triggerRef, ref } from 'vue'

interface User {
  name: string
  age: number
  hobbies: string[]
}

const user = shallowRef<User>({
  name: '张三',
  age: 25,
  hobbies: ['阅读', '游泳']
})

const logs = ref<string[]>([])

function addLog(msg: string) {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`)
}

// ❌ 点击后数据变了，但页面不会更新
function changeName() {
  user.value.name = '李四'
  addLog(`修改名字为"李四"（未调用 triggerRef） → 页面不会更新`)
}

// ✅ 点击后页面正常更新
function changeNameWithTrigger() {
  user.value.name = '王五'
  triggerRef(user)
  addLog(`修改名字为"王五"（调用了 triggerRef） → 页面已更新`)
}

// ✅ 修改数组后触发更新
function addHobby() {
  user.value.hobbies.push('编程')
  triggerRef(user)
  addLog(`添加了"编程"爱好 → 页面已更新`)
}

// ✅ 直接替换 .value，不需要 triggerRef（shallowRef 自动追踪 .value 的替换）
function replaceUser() {
  user.value = {
    name: '赵六',
    age: 30,
    hobbies: ['音乐', '旅行']
  }
  addLog(`整体替换用户数据 → 页面已更新（无需 triggerRef）`)
}
</script>

<style scoped>
.demo-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.card {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.actions button {
  padding: 8px 16px;
  border: 1px solid #409eff;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  cursor: pointer;
}

.actions button:hover {
  background: #66b1ff;
}

.log {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
}
</style>
```

**运行效果说明：**

1. 点击"修改名字（不调用 triggerRef）"按钮 → 控制台日志显示修改了，但页面显示的还是"张三"
2. 点击"修改名字（调用 triggerRef）"按钮 → 页面立即更新显示"王五"
3. 点击"添加爱好"按钮 → 页面立即更新，爱好列表多了一项"编程"
4. 点击"整体替换 .value"按钮 → 页面立即更新为"赵六"的全部信息，且无需 `triggerRef`

---

### 五、使用场景

#### 1. 大型不可变数据的性能优化

当处理大量数据（如数千条表格数据）时，使用 `shallowRef` + `triggerRef` 可以避免深层代理的性能开销。

```ts
import { shallowRef, triggerRef } from 'vue'

interface TableRow {
  id: number
  name: string
  score: number
  passed: boolean
}

const tableData = shallowRef<TableRow[]>(
  Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `学生${i + 1}`,
    score: Math.floor(Math.random() * 100),
    passed: false
  }))
)

// 更新某一行数据
function updateRowScore(rowId: number, newScore: number) {
  const row = tableData.value.find((item) => item.id === rowId)
  if (row) {
    row.score = newScore
    row.passed = newScore >= 60
    triggerRef(tableData)
  }
}

// 批量标记及格
function markAllPassed() {
  for (const row of tableData.value) {
    if (row.score >= 60) {
      row.passed = true
    }
  }
  triggerRef(tableData) // 万条数据只触发一次渲染
}
```

#### 2. 树形结构数据操作

树形数据嵌套深，使用 `shallowRef` 避免递归代理，操作节点后用 `triggerRef` 更新。

```ts
import { shallowRef, triggerRef } from 'vue'

interface TreeNode {
  id: string
  label: string
  expanded: boolean
  children: TreeNode[]
}

const treeData = shallowRef<TreeNode[]>([
  {
    id: '1',
    label: '根节点',
    expanded: false,
    children: [
      { id: '1-1', label: '子节点 1', expanded: false, children: [] },
      { id: '1-2', label: '子节点 2', expanded: false, children: [] }
    ]
  }
])

function toggleExpand(nodeId: string) {
  function toggle(nodes: TreeNode[]): void {
    for (const node of nodes) {
      if (node.id === nodeId) {
        node.expanded = !node.expanded
        return
      }
      if (node.children.length) {
        toggle(node.children)
      }
    }
  }

  toggle(treeData.value)
  triggerRef(treeData)
}

function removeNode(nodeId: string) {
  function remove(nodes: TreeNode[]): boolean {
    const index = nodes.findIndex((n) => n.id === nodeId)
    if (index !== -1) {
      nodes.splice(index, 1)
      return true
    }
    for (const node of nodes) {
      if (node.children.length && remove(node.children)) {
        return true
      }
    }
    return false
  }

  remove(treeData.value)
  triggerRef(treeData)
}
```

#### 3. Canvas / WebGL 渲染数据同步

图形渲染数据量大且频繁变化，使用 `shallowRef` 管理渲染状态。

```ts
import { shallowRef, triggerRef, onMounted, onUnmounted } from 'vue'

interface Point {
  x: number
  y: number
}

interface DrawState {
  points: Point[]
  color: string
  lineWidth: number
}

const drawState = shallowRef<DrawState>({
  points: [],
  color: '#ff0000',
  lineWidth: 2
})

let ctx: CanvasRenderingContext2D | null = null
let animFrameId: number | null = null

function render() {
  if (!ctx) return
  const { points, color, lineWidth } = drawState.value

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.beginPath()

  points.forEach((point, index) => {
    if (index === 0) {
      ctx!.moveTo(point.x, point.y)
    } else {
      ctx!.lineTo(point.x, point.y)
    }
  })

  ctx.stroke()
}

function addPoint(x: number, y: number) {
  drawState.value.points.push({ x, y })
  // 不需要每次都触发 Vue 更新，只在需要 UI 同步时触发
  triggerRef(drawState)
  render()
}

function changeColor(newColor: string) {
  drawState.value.color = newColor
  triggerRef(drawState)
  render()
}
```

#### 4. 与第三方状态管理库集成

当第三方库管理状态，Vue 只需要感知最终变化时。

```ts
import { shallowRef, triggerRef } from 'vue'
import { Map } from 'immutable'

// 使用 Immutable.js 管理复杂状态
const immutableState = shallowRef<Map<string, any>>(Map())

function updateImmutableState(key: string, value: unknown) {
  // Immutable.js 的 set 返回新 Map，但我们在 shallowRef 中手动管理
  const newState = immutableState.value.set(key, value)
  immutableState.value = newState
  triggerRef(immutableState)
}

// 或者与 Redux-like store 集成
interface StoreState {
  user: { name: string; token: string } | null
  loading: boolean
}

function useExternalStore<T>(getStore: () => T, subscribe: (cb: () => void) => () => void) {
  const state = shallowRef<T>(getStore())

  subscribe(() => {
    state.value = getStore()
    triggerRef(state)
  })

  return state
}
```

#### 5. WebSocket 实时数据流

处理实时推送的大量数据，避免频繁的深层响应式追踪开销。

```ts
import { shallowRef, triggerRef, onMounted, onUnmounted } from 'vue'

interface RealtimeMessage {
  id: string
  content: string
  timestamp: number
  sender: string
}

const messages = shallowRef<RealtimeMessage[]>([])
let ws: WebSocket | null = null

onMounted(() => {
  ws = new WebSocket('wss://example.com/realtime')

  ws.onmessage = (event) => {
    const data: RealtimeMessage = JSON.parse(event.data)

    // 新消息推入数组
    messages.value.push(data)

    // 限制消息数量，移除旧消息
    if (messages.value.length > 100) {
      messages.value = messages.value.slice(-50)
    }

    // 统一触发一次更新
    triggerRef(messages)
  }
})

onUnmounted(() => {
  ws?.close()
})
```

#### 6. 拖拽排序场景

拖拽操作频繁修改数组顺序，使用 `shallowRef` 减少性能消耗。

```ts
import { shallowRef, triggerRef } from 'vue'

interface DragItem {
  id: string
  title: string
  order: number
}

const dragList = shallowRef<DragItem[]>([
  { id: '1', title: '任务 A', order: 1 },
  { id: '2', title: '任务 B', order: 2 },
  { id: '3', title: '任务 C', order: 3 }
])

let dragStartIndex = -1

function onDragStart(index: number) {
  dragStartIndex = index
}

function onDrop(dropIndex: number) {
  if (dragStartIndex === -1 || dragStartIndex === dropIndex) return

  // 原地交换数组元素
  const list = dragList.value
  const [movedItem] = list.splice(dragStartIndex, 1)
  list.splice(dropIndex, 0, movedItem)

  // 更新排序号
  list.forEach((item, index) => {
    item.order = index + 1
  })

  triggerRef(dragList)
  dragStartIndex = -1
}
```

#### 7. 虚拟列表数据管理

虚拟滚动场景中，数据量大且只渲染可视区域，配合 `shallowRef` 管理全量数据。

```ts
import { shallowRef, triggerRef, computed } from 'vue'

interface VirtualListItem {
  id: number
  content: string
  height: number
}

const allItems = shallowRef<VirtualListItem[]>(
  Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    content: `列表项 ${i}`,
    height: 40
  }))
)

const scrollTop = shallowRef<number>(0)
const visibleCount = 20

const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / 40)
  return allItems.value.slice(start, start + visibleCount)
})

function onScroll(newScrollTop: number) {
  scrollTop.value = newScrollTop
  triggerRef(scrollTop)
}

function updateItemContent(id: number, newContent: string) {
  const item = allItems.value.find((item) => item.id === id)
  if (item) {
    item.content = newContent
    triggerRef(allItems)
  }
}
```

#### 8. 地图标注数据同步

地图场景中，标注数据量大，修改后需要同步到视图。

```ts
import { shallowRef, triggerRef } from 'vue'

interface Marker {
  id: string
  lng: number
  lat: number
  title: string
  visible: boolean
}

const markers = shallowRef<Marker[]>([])

// 添加标注
function addMarker(marker: Marker) {
  markers.value.push(marker)
  triggerRef(markers)
}

// 批量切换标注可见性
function toggleMarkersVisibility(ids: string[]) {
  const idSet = new Set(ids)
  for (const marker of markers.value) {
    if (idSet.has(marker.id)) {
      marker.visible = !marker.visible
    }
  }
  triggerRef(markers)
}

// 更新标注位置
function updateMarkerPosition(id: string, lng: number, lat: number) {
  const marker = markers.value.find((m) => m.id === id)
  if (marker) {
    marker.lng = lng
    marker.lat = lat
    triggerRef(markers)
  }
}

// 清除所有标注
function clearMarkers() {
  markers.value.length = 0
  triggerRef(markers)
}
```

#### 9. 富文本编辑器状态管理

编辑器内部状态频繁变化，外部只需要感知最终状态。

```ts
import { shallowRef, triggerRef, onMounted, onUnmounted } from 'vue'

interface EditorState {
  html: string
  text: string
  wordCount: number
  isDirty: boolean
}

const editorState = shallowRef<EditorState>({
  html: '',
  text: '',
  wordCount: 0,
  isDirty: false
})

let editorInstance: any = null

onMounted(() => {
  // 假设使用某种编辑器库
  editorInstance = createEditor({
    onChange: (content: { html: string; text: string }) => {
      // 编辑器内部频繁触发 onChange，我们直接修改数据
      editorState.value.html = content.html
      editorState.value.text = content.text
      editorState.value.wordCount = content.text.length
      editorState.value.isDirty = true

      // 只在需要时触发一次 Vue 更新（比如使用防抖）
      triggerRef(editorState)
    }
  })
})

function resetEditor() {
  editorState.value = {
    html: '',
    text: '',
    wordCount: 0,
    isDirty: false
  }
}

onUnmounted(() => {
  editorInstance?.destroy()
})
```

#### 10. 游戏状态管理

游戏循环中帧率更新频繁，使用 `shallowRef` 避免每帧都触发深度代理。

```ts
import { shallowRef, triggerRef, onUnmounted } from 'vue'

interface GameState {
  score: number
  level: number
  lives: number
  playerX: number
  playerY: number
  isRunning: boolean
}

const gameState = shallowRef<GameState>({
  score: 0,
  level: 1,
  lives: 3,
  playerX: 0,
  playerY: 0,
  isRunning: false
})

let frameId: number | null = null

function gameLoop() {
  if (!gameState.value.isRunning) return

  // 每帧更新玩家位置（高频操作，不触发响应式）
  gameState.value.playerX += 1
  gameState.value.playerY += 0.5

  // 只在需要更新 UI 时触发（比如每 10 帧）
  triggerRef(gameState)

  frameId = requestAnimationFrame(gameLoop)
}

function startGame() {
  gameState.value.isRunning = true
  triggerRef(gameState)
  gameLoop()
}

function addScore(points: number) {
  gameState.value.score += points
  if (gameState.value.score >= gameState.value.level * 100) {
    gameState.value.level++
  }
  triggerRef(gameState)
}

function loseLife() {
  gameState.value.lives--
  if (gameState.value.lives <= 0) {
    gameState.value.isRunning = false
  }
  triggerRef(gameState)
}

onUnmounted(() => {
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
  }
})
```

---

### 六、注意事项

#### 1. 仅对 shallowRef 有意义

`triggerRef` 设计上是为 `shallowRef` 服务的。对普通 `ref` 使用没有实际意义，因为普通 `ref` 已经自动追踪深层变化。

```ts
import { ref, shallowRef, triggerRef } from 'vue'

// ❌ 没有必要，普通 ref 会自动触发更新
const normalRef = ref({ count: 0 })
normalRef.value.count++
triggerRef(normalRef) // 多此一举

// ✅ 正确用法，配合 shallowRef
const shallow = shallowRef({ count: 0 })
shallow.value.count++
triggerRef(shallow) // 必须手动触发
```

> ⚠️ **注意：** 虽然技术上可以把 `triggerRef` 用在普通 `ref` 上，但它会导致额外的重复触发，可能引发不必要的性能问题。

#### 2. 直接替换 .value 不需要 triggerRef

当整体替换 `.value` 时，`shallowRef` 本身就能感知变化，不需要 `triggerRef`。

```ts
const state = shallowRef({ count: 0 })

// ✅ 替换整个 .value，自动触发更新
state.value = { count: 1 } // 无需 triggerRef

// ❌ 修改内部属性，不会自动触发
state.value.count = 2 // 需要 triggerRef
```

#### 3. triggerRef 与 watch 的配合

默认情况下，`triggerRef` 触发的更新不会被普通 `watch`（非 deep 模式）捕获，因为 `watch` 比较的是新旧引用。

```ts
const state = shallowRef({ count: 0 })

// ❌ 不会触发——因为 .value 引用没变，watch 认为没有变化
watch(state, (newVal) => {
  console.log('更新了', newVal)
})

// ✅ 开启 deep 选项才能捕获 triggerRef 引起的深层变化
watch(state, (newVal) => {
  console.log('更新了', newVal)
}, { deep: true })
```

#### 4. 避免过度使用

不要在每次修改后都调用 `triggerRef`，应该批量操作完成后统一触发一次。

```ts
const data = shallowRef({ a: 1, b: 2, c: 3 })

// ❌ 每次修改都触发，导致多次渲染
data.value.a = 10
triggerRef(data)
data.value.b = 20
triggerRef(data)
data.value.c = 30
triggerRef(data)

// ✅ 批量修改后统一触发一次
data.value.a = 10
data.value.b = 20
data.value.c = 30
triggerRef(data) // 只触发一次渲染
```

#### 5. 与 reactive 不兼容

`triggerRef` 只能用于 `ref` 系列（`ref`、`shallowRef`、`computed` 等），不能用于 `reactive` 创建的对象。

```ts
import { reactive, triggerRef } from 'vue'

// ❌ 错误用法，reactive 不返回 ref
const state = reactive({ count: 0 })
state.count++
// triggerRef(state) // 类型错误，triggerRef 不接受 reactive 对象

// ✅ 使用 shallowRef 替代
import { shallowRef } from 'vue'
const state2 = shallowRef({ count: 0 })
state2.value.count++
triggerRef(state2)
```

#### 6. 注意组件更新粒度

`triggerRef` 会触发所有依赖该 ref 的组件重新渲染，无法做到只更新某个组件。

```ts
// 如果多个组件共享同一个 shallowRef
const sharedState = shallowRef({ data: [] })

// ComponentA 和 ComponentB 都使用了 sharedState
// 调用 triggerRef(sharedState) 会导致两个组件都重新渲染
// 如果只想更新其中一个组件，考虑更细粒度的拆分
```

#### 7. 异步更新场景注意时序

在异步操作中，确保 `triggerRef` 在数据修改完成后调用。

```ts
const data = shallowRef<number[]>([])

async function fetchData() {
  const response = await fetch('/api/data')
  const result = await response.json()

  data.value.push(...result)

  // ✅ 确保数据完全写入后再触发
  triggerRef(data)
}
```

#### 8. 调试时注意数据与视图不一致

使用 `shallowRef` 修改深层属性后，数据已经改变但视图未更新，这在调试时可能造成困惑。

```ts
const state = shallowRef({ list: [1, 2, 3] })

state.value.list.push(4)
// 此时 state.value.list 是 [1, 2, 3, 4]
// 但页面显示还是 [1, 2, 3]
console.log(state.value.list) // [1, 2, 3, 4] —— 数据已变
// 页面没有更新！

// ✅ 必须手动触发
triggerRef(state)
// 现在页面才会显示 [1, 2, 3, 4]
```

> 💡 **提示：** 如果调试时发现"数据变了但页面没更新"，首先检查是否在使用 `shallowRef` 而忘记调用 `triggerRef`。

#### 9. computed 中不建议使用

不要在 `computed` 的 getter 中调用 `triggerRef`，这会造成无限循环。

```ts
const source = shallowRef({ count: 0 })

// ❌ 会导致无限循环
const doubled = computed(() => {
  triggerRef(source) // computed 求值时触发 source → source 变化 → computed 重新求值 → 死循环
  return source.value.count * 2
})
```

#### 10. 服务端渲染（SSR）中的使用

在 SSR 场景中，`triggerRef` 可以正常使用，但要注意不要在服务端渲染阶段产生不必要的副作用。

```ts
// ✅ 在 onMounted 中使用更安全
import { shallowRef, triggerRef, onMounted } from 'vue'

const clientOnlyData = shallowRef<string[]>([])

onMounted(() => {
  // 只在客户端执行
  clientOnlyData.value.push('client-side-data')
  triggerRef(clientOnlyData)
})
```

---

### 七、相关 API 对比

#### triggerRef vs ref vs shallowRef

| 特性 | `ref` | `shallowRef` | `triggerRef` |
|------|-------|-------------|-------------|
| 用途 | 创建深层响应式引用 | 创建浅层响应式引用 | 手动触发 shallowRef 更新 |
| 深层追踪 | ✅ 自动 | ❌ 不追踪 | — |
| 自动触发更新 | ✅ 任何层级变化 | 仅 `.value` 替换 | 手动调用 |
| 性能 | 较低（大对象） | 较高 | 无额外开销 |
| 适用场景 | 通用 | 大数据 / 性能敏感 | 配合 shallowRef |

#### triggerRef vs forceUpdate

| 特性 | `triggerRef` | `forceUpdate`（Vue 2） |
|------|-------------|----------------------|
| 所属版本 | Vue 3 | Vue 2 |
| 粒度 | 精确到某个 ref | 整个组件 |
| 使用方式 | `triggerRef(ref)` | `this.$forceUpdate()` |
| 推荐程度 | ✅ Vue 3 推荐 | Vue 3 已移除 |

#### 何时选择 ref 还是 shallowRef + triggerRef

```ts
// ✅ 使用 ref 的场景：数据量小、嵌套层级浅、需要自动追踪
const form = ref({
  username: '',
  password: '',
  remember: false
})

// ✅ 使用 shallowRef + triggerRef 的场景：数据量大、频繁修改内部属性、性能敏感
const bigData = shallowRef({
  items: new Array(10000).fill(null).map((_, i) => ({ id: i, value: i })),
  filter: '',
  sortBy: 'id'
})

function updateItem(id: number, newValue: number) {
  const item = bigData.value.items.find((item) => item.id === id)
  if (item) {
    item.value = newValue
    triggerRef(bigData)
  }
}
```

---

### 八、总结

`triggerRef` 是 Vue 3 响应式系统中的一个低级工具函数，它解决的核心问题是：**当使用 `shallowRef` 时，深层属性的修改无法自动触发视图更新，需要通过 `triggerRef` 手动通知 Vue 进行更新**。

**核心记忆点：**

- `triggerRef` 是 `shallowRef` 的"手动刷新按钮"
- 只有修改 `shallowRef` 内部深层属性时才需要使用
- 替换整个 `.value` 时不需要 `triggerRef`
- 批量操作后只调用一次 `triggerRef`，避免多次渲染
- 配合 `watch` 使用时需要开启 `deep` 选项
- 适用于大数据、树形结构、Canvas、WebSocket 等性能敏感场景

> 💡 **提示：** 在大多数日常开发中，直接使用 `ref` 就足够了。只有当你遇到明确的性能瓶颈时，才需要考虑 `shallowRef` + `triggerRef` 的组合方案。
