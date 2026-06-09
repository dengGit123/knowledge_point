# v-else-if

## 作用

`v-else-if` 为 `v-if` 添加一个"else if 块"，可以链式调用实现多条件分支判断。

> [Vue 官方文档 - v-if / v-else-if](https://cn.vuejs.org/api/built-in-directives#v-if)

## 基本用法

```vue
<template>
  <div v-if="score >= 90">优秀</div>
  <div v-else-if="score >= 80">良好</div>
  <div v-else-if="score >= 60">及格</div>
  <div v-else>不及格</div>
</template>

<script setup>
import { ref } from 'vue'
const score = ref(85)
</script>
```

## 使用场景

### 1. 多状态页面

```vue
<template>
  <div v-if="status === 'idle'">
    <p>请点击按钮开始</p>
    <button @click="start">开始</button>
  </div>
  <div v-else-if="status === 'loading'">
    <LoadingSpinner />
    <p>正在加载中...</p>
  </div>
  <div v-else-if="status === 'success'">
    <p>操作成功！</p>
    <button @click="reset">返回</button>
  </div>
  <div v-else-if="status === 'error'">
    <p class="error">{{ errorMessage }}</p>
    <button @click="retry">重试</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const status = ref('idle')
const errorMessage = ref('')

function start() {
  status.value = 'loading'
  fetchData()
    .then(() => { status.value = 'success' })
    .catch((err) => {
      status.value = 'error'
      errorMessage.value = err.message
    })
}

function retry() { start() }
function reset() { status.value = 'idle' }
</script>
```

### 2. 用户角色判断

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

<script setup>
import { ref } from 'vue'
import AdminDashboard from './AdminDashboard.vue'
import SystemSettings from './SystemSettings.vue'
import UserManagement from './UserManagement.vue'
import ContentModeration from './ContentModeration.vue'
import VipDashboard from './VipDashboard.vue'
import VipBenefits from './VipBenefits.vue'
import UserDashboard from './UserDashboard.vue'

const role = ref('admin')
</script>
```

### 3. 订单状态展示

```vue
<template>
  <div class="order-status">
    <div v-if="order.status === 'pending'" class="status-pending">
      <span class="icon">⏳</span>
      <span>待付款</span>
      <button @click="pay">去支付</button>
      <button @click="cancel">取消订单</button>
    </div>
    <div v-else-if="order.status === 'paid'" class="status-paid">
      <span class="icon">💰</span>
      <span>已付款，等待发货</span>
    </div>
    <div v-else-if="order.status === 'shipped'" class="status-shipped">
      <span class="icon">🚚</span>
      <span>运输中：{{ order.trackingNo }}</span>
      <button @click="confirmReceive">确认收货</button>
    </div>
    <div v-else-if="order.status === 'completed'" class="status-completed">
      <span class="icon">✅</span>
      <span>已完成</span>
      <button @click="review">去评价</button>
    </div>
    <div v-else-if="order.status === 'cancelled'" class="status-cancelled">
      <span class="icon">❌</span>
      <span>已取消</span>
    </div>
    <div v-else-if="order.status === 'refunding'" class="status-refunding">
      <span class="icon">🔄</span>
      <span>退款中</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const order = ref({
  status: 'paid',
  trackingNo: ''
})
</script>
```

### 4. 配合计算属性简化模板

```vue
<template>
  <!-- ❌ 模板中逻辑过多 -->
  <div v-if="score >= 90">优秀</div>
  <div v-else-if="score >= 80">良好</div>
  <div v-else-if="score >= 60">及格</div>
  <div v-else>不及格</div>

  <!-- ✅ 使用计算属性简化 -->
  <div>{{ gradeLevel }}</div>
</template>

<script setup>
import { ref, computed } from 'vue'

const score = ref(85)

const gradeLevel = computed(() => {
  if (score.value >= 90) return '优秀'
  if (score.value >= 80) return '良好'
  if (score.value >= 60) return '及格'
  return '不及格'
})
</script>
```

### 5. 响应式布局

```vue
<template>
  <div>
    <Sidebar v-if="layout === 'desktop'" mode="full" />
    <Sidebar v-else-if="layout === 'tablet'" mode="compact" />
    <!-- 移动端不显示侧边栏，使用底部导航 -->
    <MobileNav v-else />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import MobileNav from './MobileNav.vue'

const layout = ref('desktop')

function updateLayout() {
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

### 6. 天气图标

```vue
<template>
  <div class="weather">
    <span v-if="weather === 'sunny'">☀️ 晴天</span>
    <span v-else-if="weather === 'cloudy'">☁️ 多云</span>
    <span v-else-if="weather === 'rainy'">🌧️ 下雨</span>
    <span v-else-if="weather === 'snowy'">❄️ 下雪</span>
    <span v-else-if="weather === 'thunderstorm'">⛈️ 雷暴</span>
    <span v-else-if="weather === 'foggy'">🌫️ 大雾</span>
    <span v-else>天气未知</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const weather = ref('sunny')
</script>
```

## 注意事项

### 1. 必须紧跟 v-if 或 v-else-if

```vue
<template>
  <!-- ❌ 错误：中间有其他元素隔开 -->
  <div v-if="type === 'a'">A</div>
  <p>其他内容</p>
  <div v-else-if="type === 'b'">B</div>

  <!-- ✅ 正确：紧跟在 v-if 后面 -->
  <div v-if="type === 'a'">A</div>
  <div v-else-if="type === 'b'">B</div>
  <div v-else>C</div>
</template>
```

### 2. 分支过多时使用策略模式

```vue
<template>
  <!-- ❌ 过多 v-else-if 分支难以维护 -->
  <div v-if="type === 'a'">内容 A</div>
  <div v-else-if="type === 'b'">内容 B</div>
  <div v-else-if="type === 'c'">内容 C</div>
  <div v-else-if="type === 'd'">内容 D</div>
  <div v-else-if="type === 'e'">内容 E</div>
  <div v-else>默认</div>

  <!-- ✅ 使用动态组件替代 -->
  <component :is="currentComponent" v-bind="currentProps" />
</template>

<script setup>
import { computed } from 'vue'
import ContentA from './ContentA.vue'
import ContentB from './ContentB.vue'
import ContentC from './ContentC.vue'

const props = defineProps({ type: String })

const componentMap = {
  a: ContentA,
  b: ContentB,
  c: ContentC
}

const currentComponent = computed(() => {
  return componentMap[props.type] || ContentA
})
</script>
```

### 3. 配合 `<template>` 包裹多元素

```vue
<template>
  <!-- ✅ 使用 template 包裹多个元素 -->
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
</template>
```

## 最佳实践

1. **分支控制在 3-5 个以内**：过多分支应考虑用计算属性、策略模式或动态组件替代
2. **紧跟 v-if**：确保 `v-else-if` 紧跟 `v-if` 或上一个 `v-else-if`，中间不能有其他元素
3. **优先考虑计算属性**：如果只是展示文本，用计算属性比模板中的条件链更清晰
4. **使用 `<template>`**：当分支需要渲染多个元素时，用 `<template>` 包裹
5. **从高概率到低概率排列**：将最可能满足的条件放在前面，提高判断效率
