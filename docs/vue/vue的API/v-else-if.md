### v-else-if

> 📖 [Vue 官方文档 - v-else-if](https://cn.vuejs.org/api/built-in-directives#v-else-if)

---

### 一、概述

`v-else-if` 是 Vue 3 提供的一个条件渲染指令，用于为 `v-if` 添加"else if"条件分支。它的工作方式与 JavaScript 中的 `else if` 语句完全一致，允许你在模板中实现**多条件分支判断**。

简单来说，当 `v-if` 的条件不满足时，Vue 会继续检查后续的 `v-else-if` 条件，直到找到第一个为 `true` 的分支并渲染对应的 DOM；如果所有条件都不满足，则渲染 `v-else` 分支的内容。

**为什么需要它？**

- 当页面需要根据不同条件展示不同内容时，单纯用 `v-if` + `v-else` 只能处理两种情况，而 `v-else-if` 可以在两者之间插入任意数量的中间条件
- 相比写多个独立的 `v-if`，`v-else-if` 保证了条件之间的**互斥性**——只有一个分支会被渲染，避免逻辑冲突
- 与 `v-show` 不同，`v-else-if` 是真正的条件渲染，不满足条件的分支完全不会出现在 DOM 中，节省渲染开销

---

### 二、核心原理

`v-else-if` 的底层工作机制涉及以下几个关键点：

1. **编译时关联**：Vue 的模板编译器会将 `v-if`、`v-else-if`、`v-else` 视为一个**条件组**，它们必须紧密相邻，编译器才能将它们关联在一起

2. **惰性渲染**：只有条件为 `true` 的分支才会被渲染到 DOM 中，其他分支的虚拟 DOM 节点不会被创建

3. **高效复用**：当条件切换时，Vue 会尽可能复用已有的 DOM 元素，而不是销毁再重建。如果不需要复用，可以添加 `key` 属性强制替换

4. **条件短路**：一旦某个分支的条件为 `true`，后续的 `v-else-if` 和 `v-else` 分支都会被跳过，不会进行求值

```
v-if 条件 1  ── true ──→ 渲染分支 1，跳过后续所有分支
            │
          false
            │
v-else-if 条件 2 ── true ──→ 渲染分支 2，跳过后续所有分支
                 │
               false
                 │
v-else-if 条件 3 ── true ──→ 渲染分支 3
                 │
               false
                 │
v-else ──→ 渲染默认分支（兜底）
```

---

### 三、详细用法

#### 1. 基本用法

`v-else-if` 必须紧跟在 `v-if` 或另一个 `v-else-if` 后面，中间不能有任何其他元素。它可以链式调用，最后以 `v-else` 作为兜底。

```vue
<template>
  <div class="score-result">
    <div v-if="score >= 90">优秀</div>
    <div v-else-if="score >= 80">良好</div>
    <div v-else-if="score >= 60">及格</div>
    <div v-else>不及格</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const score = ref<number>(85)
</script>
```

配合 `<template>` 标签包裹多个元素：

```vue
<template>
  <div class="status-panel">
    <!-- 使用 template 包裹多个元素，不会产生额外 DOM 节点 -->
    <template v-if="status === 'loading'">
      <LoadingSpinner />
      <p>加载中...</p>
    </template>
    <template v-else-if="status === 'error'">
      <ErrorIcon />
      <p>{{ errorMsg }}</p>
      <button @click="retry">重试</button>
    </template>
    <template v-else>
      <SuccessIcon />
      <p>操作成功</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ErrorIcon from './ErrorIcon.vue'
import SuccessIcon from './SuccessIcon.vue'

const status = ref<'loading' | 'error' | 'success'>('loading')
const errorMsg = ref('')

function retry(): void {
  status.value = 'loading'
}
</script>
```

#### 2. 进阶用法

**（1）结合计算属性简化复杂条件判断**

```vue
<template>
  <div class="user-panel">
    <!-- ❌ 模板中逻辑过多，难以维护 -->
    <div v-if="user.score >= 90 && user.attendance > 0.9">等级 A</div>
    <div v-else-if="user.score >= 80 && user.attendance > 0.8">等级 B</div>
    <div v-else-if="user.score >= 60">等级 C</div>
    <div v-else>等级 D</div>

    <!-- ✅ 使用计算属性简化模板 -->
    <div>{{ userLevel }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface UserInfo {
  score: number
  attendance: number
}

const user = ref<UserInfo>({
  score: 85,
  attendance: 0.95
})

const userLevel = computed<string>(() => {
  const { score, attendance } = user.value
  if (score >= 90 && attendance > 0.9) return '等级 A'
  if (score >= 80 && attendance > 0.8) return '等级 B'
  if (score >= 60) return '等级 C'
  return '等级 D'
})
</script>
```

**（2）分支过多时使用动态组件替代**

```vue
<template>
  <div class="content-area">
    <!-- ❌ 分支过多，模板臃肿 -->
    <ContentA v-if="type === 'a'" />
    <ContentB v-else-if="type === 'b'" />
    <ContentC v-else-if="type === 'c'" />
    <ContentD v-else-if="type === 'd'" />
    <ContentE v-else-if="type === 'e'" />
    <ContentDefault v-else />

    <!-- ✅ 使用动态组件 + 策略模式替代 -->
    <component :is="currentComponent" v-bind="componentProps" />
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import ContentA from './ContentA.vue'
import ContentB from './ContentB.vue'
import ContentC from './ContentC.vue'
import ContentDefault from './ContentDefault.vue'

type ContentType = 'a' | 'b' | 'c' | 'd' | 'e'

const props = defineProps<{
  type: ContentType
}>()

const componentMap: Record<ContentType, Component> = {
  a: ContentA,
  b: ContentB,
  c: ContentC,
  d: ContentA, // d 复用 A 的逻辑
  e: ContentB  // e 复用 B 的逻辑
}

const currentComponent = computed<Component>(() => {
  return componentMap[props.type] || ContentDefault
})

const componentProps = computed(() => ({
  type: props.type
}))
</script>
```

**（3）使用 `key` 强制替换元素**

```vue
<template>
  <div>
    <!-- 不同类型的表单需要完全独立的 DOM，避免 Vue 复用导致残留数据 -->
    <LoginForm v-if="authType === 'login'" key="login" />
    <RegisterForm v-else-if="authType === 'register'" key="register" />
    <ResetPasswordForm v-else-if="authType === 'reset'" key="reset" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import ResetPasswordForm from './ResetPasswordForm.vue'

type AuthType = 'login' | 'register' | 'reset'
const authType = ref<AuthType>('login')
</script>
```

#### 3. API 参数说明

| 属性 | 说明 | 类型 | 是否必须 |
| --- | --- | --- | --- |
| `v-else-if="expression"` | 条件表达式，当为**真值**时渲染该分支 | `any`（会被隐式转换为布尔值） | 是 |
| 位置要求 | 必须紧跟在 `v-if` 或另一个 `v-else-if` 之后 | — | 是 |
| 与 `v-else` 配合 | 可选，作为条件组的最后一个分支 | — | 否 |
| 与 `<template>` 配合 | 可用在 `<template>` 上包裹多个元素 | — | 否 |

> 💡 **提示：** `v-else-if` 指令的值可以是任何 JavaScript 表达式，包括函数调用、计算属性、逻辑运算等。

---

### 四、实现效果

以下是一个完整的条件渲染示例，展示 `v-else-if` 在不同条件下的渲染行为：

```vue
<template>
  <div class="traffic-light">
    <!-- 根据 trafficLight 的值，同一时刻只有一个 div 被渲染到 DOM 中 -->
    <div v-if="trafficLight === 'red'" class="light red">
      红灯：停止
    </div>
    <div v-else-if="trafficLight === 'yellow'" class="light yellow">
      黄灯：注意
    </div>
    <div v-else-if="trafficLight === 'green'" class="light green">
      绿灯：通行
    </div>
    <div v-else class="light unknown">
      信号灯故障
    </div>

    <!-- 控制按钮 -->
    <button @click="changeLight">切换信号灯</button>
    <p>当前状态：{{ trafficLight }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type LightColor = 'red' | 'yellow' | 'green' | 'unknown'

const trafficLight = ref<LightColor>('red')

// 循环切换：red → green → yellow → red
function changeLight(): void {
  const sequence: LightColor[] = ['red', 'green', 'yellow']
  const currentIndex = sequence.indexOf(trafficLight.value)
  trafficLight.value = sequence[(currentIndex + 1) % sequence.length]
}
</script>

<style scoped>
.light {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.red { background-color: #ff4d4f; color: white; }
.yellow { background-color: #fadb14; color: #333; }
.green { background-color: #52c41a; color: white; }
.unknown { background-color: #999; color: white; }
</style>
```

**渲染行为说明：**

- 当 `trafficLight === 'red'` 时，只有第一个 `<div>` 会被渲染，其余三个分支不会出现在 DOM 中
- 切换到 `'green'` 时，Vue 会高效地切换渲染的分支，而不是同时渲染所有分支
- 如果 `trafficLight` 的值不在预期范围内，`v-else` 兜底分支会被渲染

---

### 五、使用场景

#### 1. 多状态页面（加载/成功/错误）

```vue
<template>
  <div class="data-fetcher">
    <div v-if="requestStatus === 'idle'">
      <p>请点击按钮获取数据</p>
      <button @click="fetchData">获取数据</button>
    </div>
    <div v-else-if="requestStatus === 'loading'">
      <LoadingSpinner />
      <p>正在加载中...</p>
    </div>
    <div v-else-if="requestStatus === 'success'">
      <p>操作成功！获取到 {{ dataList.length }} 条数据</p>
      <ul>
        <li v-for="item in dataList" :key="item.id">{{ item.name }}</li>
      </ul>
      <button @click="reset">返回</button>
    </div>
    <div v-else-if="requestStatus === 'error'">
      <p class="error">{{ errorMessage }}</p>
      <button @click="fetchData">重试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

interface DataItem {
  id: number
  name: string
}

type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

const requestStatus = ref<RequestStatus>('idle')
const dataList = ref<DataItem[]>([])
const errorMessage = ref('')

async function fetchData(): Promise<void> {
  requestStatus.value = 'loading'
  errorMessage.value = ''
  try {
    const response = await fetch('/api/data')
    dataList.value = await response.json()
    requestStatus.value = 'success'
  } catch (err: any) {
    requestStatus.value = 'error'
    errorMessage.value = err.message || '请求失败'
  }
}

function reset(): void {
  requestStatus.value = 'idle'
  dataList.value = []
}
</script>
```

#### 2. 用户角色权限控制

```vue
<template>
  <div class="user-panel">
    <template v-if="role === 'superadmin'">
      <AdminDashboard />
      <SystemSettings />
      <UserManagement />
    </template>
    <template v-else-if="role === 'admin'">
      <AdminDashboard />
      <UserManagement />
    </template>
    <template v-else-if="role === 'moderator'">
      <ContentModeration />
    </template>
    <template v-else-if="role === 'vip'">
      <VipDashboard />
      <VipBenefits />
    </template>
    <template v-else>
      <UserDashboard />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminDashboard from './AdminDashboard.vue'
import SystemSettings from './SystemSettings.vue'
import UserManagement from './UserManagement.vue'
import ContentModeration from './ContentModeration.vue'
import VipDashboard from './VipDashboard.vue'
import VipBenefits from './VipBenefits.vue'
import UserDashboard from './UserDashboard.vue'

type UserRole = 'superadmin' | 'admin' | 'moderator' | 'vip' | 'user'
const role = ref<UserRole>('admin')
</script>
```

#### 3. 订单状态流转展示

```vue
<template>
  <div class="order-status">
    <div v-if="order.status === 'pending'" class="status-pending">
      <span>待付款</span>
      <button @click="pay">去支付</button>
      <button @click="cancelOrder">取消订单</button>
    </div>
    <div v-else-if="order.status === 'paid'" class="status-paid">
      <span>已付款，等待发货</span>
    </div>
    <div v-else-if="order.status === 'shipped'" class="status-shipped">
      <span>运输中，快递单号：{{ order.trackingNo }}</span>
      <button @click="confirmReceive">确认收货</button>
    </div>
    <div v-else-if="order.status === 'completed'" class="status-completed">
      <span>已完成</span>
      <button @click="goReview">去评价</button>
    </div>
    <div v-else-if="order.status === 'cancelled'" class="status-cancelled">
      <span>已取消</span>
    </div>
    <div v-else-if="order.status === 'refunding'" class="status-refunding">
      <span>退款中</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunding'

interface OrderInfo {
  status: OrderStatus
  trackingNo: string
}

const order = ref<OrderInfo>({
  status: 'pending',
  trackingNo: ''
})

function pay(): void { /* 跳转支付 */ }
function cancelOrder(): void { order.value.status = 'cancelled' }
function confirmReceive(): void { order.value.status = 'completed' }
function goReview(): void { /* 跳转评价页 */ }
</script>
```

#### 4. 响应式布局切换

```vue
<template>
  <div class="layout-container">
    <Sidebar v-if="layout === 'desktop'" mode="full" />
    <Sidebar v-else-if="layout === 'tablet'" mode="compact" />
    <MobileNav v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import MobileNav from './MobileNav.vue'

type LayoutMode = 'desktop' | 'tablet' | 'mobile'

const layout = ref<LayoutMode>('desktop')

function updateLayout(): void {
  const width = window.innerWidth
  if (width >= 1024) layout.value = 'desktop'
  else if (width >= 768) layout.value = 'tablet'
  else layout.value = 'mobile'
}

onMounted(() => {
  updateLayout()
  window.addEventListener('resize', updateLayout)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateLayout)
})
</script>
```

#### 5. 表单步骤向导

```vue
<template>
  <div class="form-wizard">
    <!-- 步骤 1：基本信息 -->
    <div v-if="currentStep === 1">
      <h3>基本信息</h3>
      <input v-model="formData.name" placeholder="姓名" />
      <input v-model="formData.email" placeholder="邮箱" />
      <button @click="nextStep">下一步</button>
    </div>

    <!-- 步骤 2：详细配置 -->
    <div v-else-if="currentStep === 2">
      <h3>详细配置</h3>
      <select v-model="formData.plan">
        <option value="free">免费版</option>
        <option value="pro">专业版</option>
        <option value="enterprise">企业版</option>
      </select>
      <button @click="prevStep">上一步</button>
      <button @click="nextStep">下一步</button>
    </div>

    <!-- 步骤 3：确认提交 -->
    <div v-else-if="currentStep === 3">
      <h3>确认信息</h3>
      <p>姓名：{{ formData.name }}</p>
      <p>邮箱：{{ formData.email }}</p>
      <p>套餐：{{ formData.plan }}</p>
      <button @click="prevStep">上一步</button>
      <button @click="submit">提交</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface FormDataType {
  name: string
  email: string
  plan: string
}

const currentStep = ref<number>(1)
const formData = ref<FormDataType>({
  name: '',
  email: '',
  plan: 'free'
})

function nextStep(): void {
  currentStep.value = Math.min(currentStep.value + 1, 3)
}

function prevStep(): void {
  currentStep.value = Math.max(currentStep.value - 1, 1)
}

function submit(): void {
  console.log('提交数据：', formData.value)
}
</script>
```

#### 6. 支付方式选择

```vue
<template>
  <div class="payment-section">
    <div class="payment-options">
      <button @click="paymentMethod = 'alipay'" :class="{ active: paymentMethod === 'alipay' }">支付宝</button>
      <button @click="paymentMethod = 'wechat'" :class="{ active: paymentMethod === 'wechat' }">微信支付</button>
      <button @click="paymentMethod = 'card'" :class="{ active: paymentMethod === 'card' }">银行卡</button>
    </div>

    <div class="payment-form">
      <AlipayForm v-if="paymentMethod === 'alipay'" />
      <WechatForm v-else-if="paymentMethod === 'wechat'" />
      <CardForm v-else-if="paymentMethod === 'card'" />
      <div v-else>请选择支付方式</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AlipayForm from './AlipayForm.vue'
import WechatForm from './WechatForm.vue'
import CardForm from './CardForm.vue'

type PaymentMethod = 'alipay' | 'wechat' | 'card' | ''
const paymentMethod = ref<PaymentMethod>('')
</script>
```

#### 7. 国际化语言展示

```vue
<template>
  <div class="greeting-card">
    <template v-if="locale === 'zh-CN'">
      <h3>欢迎</h3>
      <p>你好，{{ userName }}！今天是个好日子。</p>
    </template>
    <template v-else-if="locale === 'en-US'">
      <h3>Welcome</h3>
      <p>Hello, {{ userName }}! Have a nice day.</p>
    </template>
    <template v-else-if="locale === 'ja-JP'">
      <h3>ようこそ</h3>
      <p>こんにちは、{{ userName }}さん。良い一日を。</p>
    </template>
    <template v-else-if="locale === 'ko-KR'">
      <h3>환영합니다</h3>
      <p>안녕하세요, {{ userName }}님! 좋은 하루 되세요.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type Locale = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR'

const locale = ref<Locale>('zh-CN')
const userName = ref<string>('张三')
</script>
```

#### 8. 数据可视化类型切换

```vue
<template>
  <div class="chart-container">
    <div class="chart-toolbar">
      <button
        v-for="chartType in chartTypes"
        :key="chartType"
        @click="currentChart = chartType"
        :class="{ active: currentChart === chartType }"
      >
        {{ chartType }}
      </button>
    </div>

    <div class="chart-area">
      <BarChart v-if="currentChart === 'bar'" :data="chartData" />
      <LineChart v-else-if="currentChart === 'line'" :data="chartData" />
      <PieChart v-else-if="currentChart === 'pie'" :data="chartData" />
      <ScatterChart v-else-if="currentChart === 'scatter'" :data="chartData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BarChart from './BarChart.vue'
import LineChart from './LineChart.vue'
import PieChart from './PieChart.vue'
import ScatterChart from './ScatterChart.vue'

type ChartType = 'bar' | 'line' | 'pie' | 'scatter'

const chartTypes: ChartType[] = ['bar', 'line', 'pie', 'scatter']
const currentChart = ref<ChartType>('bar')
const chartData = ref<number[]>([30, 50, 80, 60, 90, 45])
</script>
```

#### 9. 通知消息类型展示

```vue
<template>
  <div class="notification-stack">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification-item"
    >
      <div v-if="notification.type === 'success'" class="notification success">
        <SuccessIcon />
        <span>{{ notification.message }}</span>
      </div>
      <div v-else-if="notification.type === 'warning'" class="notification warning">
        <WarningIcon />
        <span>{{ notification.message }}</span>
      </div>
      <div v-else-if="notification.type === 'error'" class="notification error">
        <ErrorIcon />
        <span>{{ notification.message }}</span>
      </div>
      <div v-else-if="notification.type === 'info'" class="notification info">
        <InfoIcon />
        <span>{{ notification.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SuccessIcon from './SuccessIcon.vue'
import WarningIcon from './WarningIcon.vue'
import ErrorIcon from './ErrorIcon.vue'
import InfoIcon from './InfoIcon.vue'

type NotificationType = 'success' | 'warning' | 'error' | 'info'

interface Notification {
  id: number
  type: NotificationType
  message: string
}

const notifications = ref<Notification[]>([
  { id: 1, type: 'success', message: '数据保存成功' },
  { id: 2, type: 'warning', message: '存储空间即将用完' },
  { id: 3, type: 'info', message: '系统将在今晚维护' }
])
</script>

<style scoped>
.notification {
  padding: 12px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.success { background: #f6ffed; border: 1px solid #b7eb8f; color: #52c41a; }
.warning { background: #fffbe6; border: 1px solid #ffe58f; color: #faad14; }
.error { background: #fff2f0; border: 1px solid #ffccc7; color: #ff4d4f; }
.info { background: #e6f7ff; border: 1px solid #91d5ff; color: #1890ff; }
</style>
```

#### 10. 表格列类型渲染

```vue
<template>
  <table class="data-table">
    <tbody>
      <tr v-for="row in tableData" :key="row.id">
        <td v-for="col in columns" :key="col.key">
          <!-- 文本列 -->
          <span v-if="col.type === 'text'">{{ row[col.key] }}</span>

          <!-- 标签列 -->
          <span v-else-if="col.type === 'tag'" class="tag" :style="{ color: getTagColor(row[col.key]) }">
            {{ row[col.key] }}
          </span>

          <!-- 操作列 -->
          <span v-else-if="col.type === 'action'">
            <button @click="handleEdit(row)">编辑</button>
            <button @click="handleDelete(row)">删除</button>
          </span>

          <!-- 图片列 -->
          <img v-else-if="col.type === 'image'" :src="row[col.key]" alt="" style="width: 40px; height: 40px" />

          <!-- 进度条列 -->
          <div v-else-if="col.type === 'progress'" class="progress-bar">
            <div class="progress-fill" :style="{ width: row[col.key] + '%' }"></div>
            <span>{{ row[col.key] }}%</span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Column {
  key: string
  label: string
  type: 'text' | 'tag' | 'action' | 'image' | 'progress'
}

interface TableRow {
  id: number
  [key: string]: any
}

const columns = ref<Column[]>([
  { key: 'name', label: '名称', type: 'text' },
  { key: 'status', label: '状态', type: 'tag' },
  { key: 'avatar', label: '头像', type: 'image' },
  { key: 'progress', label: '进度', type: 'progress' },
  { key: 'actions', label: '操作', type: 'action' }
])

const tableData = ref<TableRow[]>([
  { id: 1, name: '项目 A', status: '进行中', avatar: '/img/a.png', progress: 65 },
  { id: 2, name: '项目 B', status: '已完成', avatar: '/img/b.png', progress: 100 }
])

function getTagColor(status: string): string {
  const colorMap: Record<string, string> = {
    '进行中': '#1890ff',
    '已完成': '#52c41a',
    '已暂停': '#faad14'
  }
  return colorMap[status] || '#999'
}

function handleEdit(row: TableRow): void { console.log('编辑', row) }
function handleDelete(row: TableRow): void { console.log('删除', row) }
</script>
```

---

### 六、注意事项

#### 1. 必须紧跟 `v-if` 或 `v-else-if`

`v-else-if` 必须紧跟在 `v-if` 或另一个 `v-else-if` 后面，中间不能有任何其他元素或文本节点，否则 Vue 无法将其识别为条件组的一部分。

```vue
<template>
  <!-- ❌ 错误：中间有其他元素隔开，v-else-if 将无法正常工作 -->
  <div v-if="type === 'a'">A</div>
  <p>其他内容</p>
  <div v-else-if="type === 'b'">B</div>

  <!-- ✅ 正确：紧跟在 v-if 后面 -->
  <div v-if="type === 'a'">A</div>
  <div v-else-if="type === 'b'">B</div>
  <div v-else>C</div>
</template>
```

#### 2. 分支过多时应考虑替代方案

当 `v-else-if` 分支超过 5 个时，模板会变得难以维护，应考虑使用动态组件或策略模式替代。

```vue
<template>
  <!-- ❌ 分支过多，维护困难 -->
  <ContentA v-if="type === 'a'" />
  <ContentB v-else-if="type === 'b'" />
  <ContentC v-else-if="type === 'c'" />
  <ContentD v-else-if="type === 'd'" />
  <ContentE v-else-if="type === 'e'" />
  <ContentF v-else-if="type === 'f'" />
  <ContentDefault v-else />

  <!-- ✅ 使用动态组件 + 映射表 -->
  <component :is="componentMap[type] ?? ContentDefault" />
</template>
```

#### 3. 注意 Vue 的元素复用策略

Vue 在切换条件分支时会尽可能复用已有的 DOM 元素，这可能导致表单输入框残留上一个分支的数据。使用 `key` 属性可以强制替换元素。

```vue
<template>
  <!-- ❌ 切换分支时，input 中的内容可能残留 -->
  <input v-if="mode === 'email'" type="email" placeholder="邮箱" />
  <input v-else-if="mode === 'phone'" type="tel" placeholder="手机号" />

  <!-- ✅ 添加 key 强制替换，确保每次切换都是全新的 DOM -->
  <input v-if="mode === 'email'" key="email" type="email" placeholder="邮箱" />
  <input v-else-if="mode === 'phone'" key="phone" type="tel" placeholder="手机号" />
</template>
```

#### 4. 不支持在同一个元素上与 `v-for` 混用

`v-else-if` 不能与 `v-for` 在同一个元素上使用。当两者同时存在时，`v-for` 的优先级更高，可能导致条件判断不符合预期。应该用 `<template>` 将循环和条件分开。

```vue
<template>
  <!-- ❌ 不推荐：v-for 和 v-else-if 混用在同一元素 -->
  <div v-for="item in list" v-if="item.type === 'a'">A</div>
  <div v-for="item in list" v-else-if="item.type === 'b'">B</div>

  <!-- ✅ 正确：使用计算属性过滤 + 条件渲染 -->
  <template v-for="item in filteredList" :key="item.id">
    <div v-if="item.type === 'a'">A: {{ item.name }}</div>
    <div v-else-if="item.type === 'b'">B: {{ item.name }}</div>
    <div v-else>其他: {{ item.name }}</div>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const filteredList = computed(() => list.value.filter(item => item.active))
</script>
```

#### 5. 条件表达式应避免副作用

`v-else-if` 的条件表达式应该是纯函数，不要在其中调用有副作用的函数。

```vue
<template>
  <!-- ❌ 错误：条件判断中包含副作用 -->
  <div v-if="saveData()">保存中</div>
  <div v-else-if="updateCounter()">更新中</div>

  <!-- ✅ 正确：条件使用纯数据判断 -->
  <div v-if="status === 'saving'">保存中</div>
  <div v-else-if="status === 'updating'">更新中</div>
</template>
```

#### 6. 条件分支顺序影响性能

应将**最可能满足的条件**放在前面，因为条件判断是**从上到下短路执行**的。如果高频条件排在后面，每次渲染都会多执行前面的条件判断。

```vue
<template>
  <!-- ❌ 高频场景排在后面 -->
  <div v-if="type === 'rare'">罕见情况</div>
  <div v-else-if="type === 'common'">常见情况</div>

  <!-- ✅ 高频场景排在前面，减少不必要的条件判断 -->
  <div v-if="type === 'common'">常见情况</div>
  <div v-else-if="type === 'rare'">罕见情况</div>
</template>
```

#### 7. 配合 `<template>` 避免多余的 DOM 节点

当每个分支需要渲染多个同级元素时，使用 `<template>` + `v-else-if` 包裹，避免引入多余的 DOM 包裹层。

```vue
<template>
  <!-- ❌ 多余的 div 包裹 -->
  <div v-if="status === 'loading'">
    <Spinner />
    <p>加载中...</p>
  </div>
  <div v-else-if="status === 'error'">
    <ErrorIcon />
    <p>出错了</p>
  </div>

  <!-- ✅ 使用 template 不产生多余 DOM -->
  <template v-if="status === 'loading'">
    <Spinner />
    <p>加载中...</p>
  </template>
  <template v-else-if="status === 'error'">
    <ErrorIcon />
    <p>出错了</p>
  </template>
</template>
```

#### 8. 与 `v-show` 的本质区别

`v-else-if` 是**真正的条件渲染**，不满足条件的分支不会出现在 DOM 中；而 `v-show` 只是通过 CSS `display` 属性控制显隐。频繁切换的场景用 `v-show` 性能更好，条件很少变化的场景用 `v-if` / `v-else-if` 更节省初始渲染开销。

```vue
<template>
  <!-- v-else-if：条件变化少时使用，不渲染不需要的 DOM -->
  <div v-if="role === 'admin'">管理员面板</div>
  <div v-else-if="role === 'user'">用户面板</div>

  <!-- v-show：频繁切换时使用，DOM 始终存在 -->
  <Modal v-show="isModalVisible" />
</template>
```

#### 9. 使用计算属性简化复杂的条件表达式

当 `v-else-if` 中的条件表达式过于复杂时，将其提取为计算属性，可以让模板更清晰、更易于测试。

```vue
<template>
  <!-- ❌ 模板中条件过于复杂 -->
  <div v-if="user.age > 18 && user.verified && user.score > 80">高级用户</div>
  <div v-else-if="user.age > 18 && user.verified">普通用户</div>
  <div v-else-if="user.age > 18">未认证用户</div>
  <div v-else>未成年用户</div>

  <!-- ✅ 使用计算属性 -->
  <div>{{ userLevel }}</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const user = ref({ age: 25, verified: true, score: 90 })

const userLevel = computed(() => {
  const { age, verified, score } = user.value
  if (age <= 18) return '未成年用户'
  if (!verified) return '未认证用户'
  if (score <= 80) return '普通用户'
  return '高级用户'
})
</script>
```

#### 10. 在 `<template>` 上使用时不能添加 `key`

`v-else-if` 可以用在 `<template>` 标签上，但 `<template>` 是一个不可见的包裹元素，不会渲染为实际的 DOM 节点，因此**不能在 `<template>` 上添加 `key` 属性**。如果需要 `key` 来强制替换，必须在内部的实际元素上添加。

```vue
<template>
  <!-- ❌ template 上不能添加 key -->
  <template v-if="type === 'a'" key="a">
    <input placeholder="A" />
  </template>
  <template v-else-if="type === 'b'" key="b">
    <input placeholder="B" />
  </template>

  <!-- ✅ key 放在实际的 DOM 元素上 -->
  <template v-if="type === 'a'">
    <input key="input-a" placeholder="A" />
  </template>
  <template v-else-if="type === 'b'">
    <input key="input-b" placeholder="B" />
  </template>
</template>
```

---

### 七、相关 API 对比

| 特性 | `v-if` | `v-else-if` | `v-else` | `v-show` |
| --- | --- | --- | --- | --- |
| **作用** | 条件渲染（首个条件） | 条件渲染（中间条件） | 条件渲染（兜底分支） | CSS 显隐控制 |
| **DOM 行为** | 条件为 false 时不渲染 | 条件为 false 时不渲染 | 以上条件均不满足时渲染 | 始终渲染，通过 `display` 控制显隐 |
| **切换开销** | 较高（需要销毁/重建 DOM） | 较高 | 较高 | 较低（仅切换 CSS） |
| **初始渲染开销** | 较低（条件为 false 时不渲染） | 较低 | 较低 | 较高（始终渲染） |
| **位置要求** | 无 | 必须紧跟 `v-if` 或 `v-else-if` | 必须紧跟 `v-if` 或 `v-else-if` | 无 |
| **适用场景** | 条件很少变化 | 多条件分支的中间条件 | 条件组的兜底 | 频繁切换显隐 |
| **支持 `<template>`** | 支持 | 支持 | 支持 | 不支持 |

**选择建议：**

- 需要多条件互斥判断时：`v-if` + `v-else-if` + `v-else`
- 频繁切换显隐时：`v-show`
- 条件分支超过 5 个时：考虑动态组件 `<component :is>` + 映射表

---

### 八、总结

`v-else-if` 是 Vue 3 中实现**多条件分支渲染**的核心指令，它与 `v-if` 和 `v-else` 配合使用，构成了完整的条件渲染体系。掌握它的关键点包括：

1. **必须紧跟** `v-if` 或上一个 `v-else-if`，中间不能有其他元素
2. **互斥渲染**：条件组中只有一个分支会被渲染到 DOM 中
3. **短路执行**：一旦匹配到为 `true` 的条件，后续分支自动跳过
4. **合理控制分支数量**：超过 5 个分支时，优先考虑动态组件或计算属性
5. **善用 `<template>`**：避免不必要的 DOM 嵌套
6. **注意元素复用**：需要时使用 `key` 强制替换
7. **与 `v-show` 区分使用**：根据切换频率和初始渲染需求选择合适的指令
