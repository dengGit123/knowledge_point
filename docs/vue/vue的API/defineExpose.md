# defineExpose

> 📖 [官方文档 - defineExpose](https://cn.vuejs.org/api/sfc-script-setup#defineexpose)

### 一、概述

`defineExpose` 是 Vue 3 `<script setup>` 语法糖中提供的编译器宏，用于**显式暴露组件内部的属性和方法**，使父组件能够通过模板引用（`ref`）访问子组件的特定成员。在 `<script setup>` 中，组件默认是**完全封闭**的，外部无法直接访问组件内部的任何数据或方法——`defineExpose` 就是打开这扇门的"钥匙"。

### 二、核心原理

在 Vue 3 的 `<script setup>` 语法中，组件实例的属性默认是**完全私有**的。这与 Options API 的行为截然不同——Options API 中，父组件通过 `ref` 可以访问子组件的所有数据、计算属性和方法。

`defineExpose` 的工作原理可以类比为**银行柜台窗口**：

- 子组件是一家银行，内部有大量的数据和逻辑（金库里的资产）
- 默认情况下，`<script setup>` 把大门锁死，外面什么也看不到
- `defineExpose` 就是在墙上开了一个"窗口"，你只把想让外部访问的东西放到窗口上
- 父组件通过 `ref`（柜台人员）只能拿到窗口上展示的内容

**底层机制**：`defineExpose` 接收一个对象，Vue 会将这个对象的属性挂载到组件实例的 `exposed` 属性上。当父组件通过模板 `ref` 获取子组件实例时，拿到的实际上是 `exposed` 对象的代理，而非完整的组件实例。

```
子组件 defineExpose({ a, b })  →  组件实例.exposed = { a, b }
父组件 childRef.value           →  拿到的是 exposed 代理，不是完整实例
```

### 三、详细用法

#### 1. 基本用法

最简单的用法——暴露一个响应式数据和一个方法：

```vue
<!-- ChildComponent.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}

// 暴露给父组件访问的成员
defineExpose({
  count,
  increment
})
</script>

<template>
  <p>子组件计数：{{ count }}</p>
</template>
```

```vue
<!-- ParentComponent.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)

const accessChild = () => {
  if (childRef.value) {
    console.log(childRef.value.count)   // 访问子组件暴露的数据
    childRef.value.increment()          // 调用子组件暴露的方法
  }
}
</script>

<template>
  <ChildComponent ref="childRef" />
  <button @click="accessChild">访问子组件</button>
</template>
```

#### 2. 进阶用法

##### 2.1 配合 TypeScript 泛型约束暴露类型

```vue
<!-- ChildForm.vue -->
<script setup lang="ts">
import { ref, reactive } from 'vue'

interface ExposedAPI {
  validate: () => Promise<{ valid: boolean; errors: string[] }>
  reset: () => void
  formData: { username: string; email: string }
}

const formData = reactive({
  username: '',
  email: ''
})

const validate = async (): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = []
  if (!formData.username) errors.push('用户名不能为空')
  if (!formData.email.includes('@')) errors.push('邮箱格式不正确')
  return { valid: errors.length === 0, errors }
}

const reset = () => {
  formData.username = ''
  formData.email = ''
}

// 使用泛型参数约束暴露的类型
defineExpose<ExposedAPI>({
  validate,
  reset,
  formData
})
</script>
```

```vue
<!-- ParentComponent.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import ChildForm from './ChildForm.vue'

const formRef = ref<InstanceType<typeof ChildForm> | null>(null)

const handleSubmit = async () => {
  if (!formRef.value) return

  const result = await formRef.value.validate()
  if (result.valid) {
    console.log('提交数据：', formRef.value.formData)
  } else {
    console.log('验证失败：', result.errors)
  }
}
</script>

<template>
  <ChildForm ref="formRef" />
  <button @click="handleSubmit">提交</button>
</template>
```

##### 2.2 暴露计算属性

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const firstName = ref('')
const lastName = ref('')

// ✅ 暴露计算属性，父组件可以读取
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

defineExpose({
  fullName,
  firstName,
  lastName
})
</script>
```

##### 2.3 暴露只读属性（使用 readonly）

```vue
<script setup lang="ts">
import { ref, readonly } from 'vue'

const _internalState = ref({ token: '', userId: '' })

// ✅ 使用 readonly 防止父组件直接修改内部状态
defineExpose({
  state: readonly(_internalState),
  getState: () => _internalState.value
})
</script>
```

```vue
<!-- 父组件中使用 -->
<script setup lang="ts">
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)

const tryModify = () => {
  if (!childRef.value) return
  // ❌ readonly 的属性无法被外部修改（会有警告）
  // childRef.value.state.token = 'new-token'

  // ✅ 通过暴露的方法获取数据
  const state = childRef.value.getState()
  console.log(state)
}
</script>
```

##### 2.4 搭配 useTemplateRef（Vue 3.5+）

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import ChildComponent from './ChildComponent.vue'

// Vue 3.5+ 推荐使用 useTemplateRef
const childRef = useTemplateRef<InstanceType<typeof ChildComponent>>('child')

const callChildMethod = () => {
  childRef.value?.someMethod()
}
</script>

<template>
  <ChildComponent ref="child" />
  <button @click="callChildMethod">调用子组件方法</button>
</template>
```

#### 3. API 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `defineExpose(exposed)` | `exposed: Record<string, any>` | 要暴露的属性和方法对象 |
| 泛型参数 `defineExpose<T>()` | `T` 为暴露对象的类型接口 | TypeScript 类型约束，确保暴露的内容符合类型定义 |
| 编译时机 | 编译时宏 | 无需导入，在 `<script setup>` 中直接使用 |
| 返回值 | `void` | 没有返回值 |

### 四、实现效果

以下示例展示了 `defineExpose` 使用前后父组件访问子组件的差异：

```vue
<!-- WithoutExpose.vue - 不使用 defineExpose -->
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++

// ❌ 没有调用 defineExpose，父组件通过 ref 无法访问任何成员
</script>
```

```vue
<!-- WithExpose.vue - 使用 defineExpose -->
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const secret = ref('内部机密') // 不暴露的私有数据
const increment = () => count.value++

// ✅ 只暴露 count 和 increment，secret 保持私有
defineExpose({
  count,
  increment
})
</script>
```

```vue
<!-- ParentComponent.vue - 父组件测试 -->
<script setup lang="ts">
import { ref } from 'vue'
import WithExpose from './WithExpose.vue'

const childRef = ref<InstanceType<typeof WithExpose> | null>(null)

const test = () => {
  if (!childRef.value) return

  // ✅ 可以访问暴露的 count
  console.log(childRef.value.count)     // 输出: 0

  // ✅ 可以调用暴露的 increment
  childRef.value.increment()
  console.log(childRef.value.count)     // 输出: 1

  // ❌ 无法访问未暴露的 secret
  console.log((childRef.value as any).secret) // 输出: undefined
}
</script>

<template>
  <WithExpose ref="childRef" />
  <button @click="test">测试访问</button>
</template>
```

### 五、使用场景

#### 1. 表单组件的验证与重置

```vue
<!-- FormComponent.vue -->
<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  username: '',
  email: '',
  phone: ''
})

const validate = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  if (!form.username) errors.push('用户名不能为空')
  if (!form.email.includes('@')) errors.push('邮箱格式不正确')
  if (!/^1\d{10}$/.test(form.phone)) errors.push('手机号格式不正确')
  return { valid: errors.length === 0, errors }
}

const reset = () => {
  Object.assign(form, { username: '', email: '', phone: '' })
}

defineExpose({ validate, reset, form })
</script>

<template>
  <form>
    <input v-model="form.username" placeholder="用户名" />
    <input v-model="form.email" placeholder="邮箱" />
    <input v-model="form.phone" placeholder="手机号" />
  </form>
</template>
```

```vue
<!-- ParentComponent.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import FormComponent from './FormComponent.vue'

const formRef = ref<InstanceType<typeof FormComponent> | null>(null)

const handleSubmit = () => {
  const result = formRef.value?.validate()
  if (result?.valid) {
    console.log('提交成功：', formRef.value?.form)
  } else {
    console.log('验证失败：', result?.errors)
  }
}

const handleReset = () => {
  formRef.value?.reset()
}
</script>

<template>
  <FormComponent ref="formRef" />
  <button @click="handleSubmit">提交</button>
  <button @click="handleReset">重置</button>
</template>
```

#### 2. 对话框 / 模态框的打开与关闭

```vue
<!-- DialogComponent.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'

interface DialogProps {
  title?: string
}

const props = withDefaults(defineProps<DialogProps>(), {
  title: '提示'
})

const visible = ref(false)

const open = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
}

const confirm = () => {
  close()
}

defineExpose({ open, close, visible })
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="close">
      <div class="dialog-content">
        <h3>{{ title }}</h3>
        <slot />
        <div class="dialog-footer">
          <button @click="close">取消</button>
          <button @click="confirm">确认</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
```

```vue
<!-- 父组件 -->
<script setup lang="ts">
import { ref } from 'vue'
import DialogComponent from './DialogComponent.vue'

const dialogRef = ref<InstanceType<typeof DialogComponent> | null>(null)

const showConfirm = () => {
  dialogRef.value?.open()
}
</script>

<template>
  <DialogComponent ref="dialogRef" title="确认删除">
    <p>确定要删除这条记录吗？</p>
  </DialogComponent>
  <button @click="showConfirm">删除</button>
</template>
```

#### 3. 表格组件的数据刷新

```vue
<!-- TableComponent.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface TableRow {
  id: number
  name: string
  age: number
}

const data = ref<TableRow[]>([])
const loading = ref(false)
const currentPage = ref(1)

const fetchData = async (page: number = 1) => {
  loading.value = true
  currentPage.value = page
  // 模拟 API 请求
  const res = await fetch(`/api/users?page=${page}`)
  data.value = await res.json()
  loading.value = false
}

const refresh = () => {
  fetchData(currentPage.value)
}

const goToPage = (page: number) => {
  fetchData(page)
}

onMounted(() => {
  fetchData()
})

defineExpose({ refresh, goToPage, data, loading })
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <table v-else>
      <tr v-for="row in data" :key="row.id">
        <td>{{ row.name }}</td>
        <td>{{ row.age }}</td>
      </tr>
    </table>
  </div>
</template>
```

```vue
<!-- 父组件 -->
<script setup lang="ts">
import { ref } from 'vue'
import TableComponent from './TableComponent.vue'

const tableRef = ref<InstanceType<typeof TableComponent> | null>(null)

// 在增删改操作后刷新表格数据
const afterDataChange = () => {
  tableRef.value?.refresh()
}
</script>

<template>
  <TableComponent ref="tableRef" />
  <button @click="afterDataChange">刷新数据</button>
</template>
```

#### 4. 抽屉组件控制

```vue
<!-- DrawerComponent.vue -->
<script setup lang="ts">
import { ref } from 'vue'

type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

const visible = ref(false)
const placement = ref<DrawerPlacement>('right')

const open = (position?: DrawerPlacement) => {
  if (position) placement.value = position
  visible.value = true
}

const close = () => {
  visible.value = false
}

defineExpose({ open, close, visible })
</script>

<template>
  <Transition name="drawer">
    <div v-if="visible" :class="['drawer', `drawer-${placement}`]">
      <div class="drawer-header">
        <slot name="header" />
        <button @click="close">&times;</button>
      </div>
      <div class="drawer-body">
        <slot />
      </div>
    </div>
  </Transition>
</template>
```

#### 5. 视频/音频播放器控制

```vue
<!-- VideoPlayer.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const videoRef = ref<HTMLVideoElement | null>(null)

const play = () => videoRef.value?.play()
const pause = () => videoRef.value?.pause()
const seek = (time: number) => {
  if (videoRef.value) videoRef.value.currentTime = time
}
const setVolume = (volume: number) => {
  if (videoRef.value) videoRef.value.volume = Math.max(0, Math.min(1, volume))
}
const getCurrentTime = () => videoRef.value?.currentTime ?? 0

defineExpose({ play, pause, seek, setVolume, getCurrentTime })
</script>

<template>
  <video ref="videoRef" src="/video.mp4" />
</template>
```

```vue
<!-- 父组件 -->
<script setup lang="ts">
import { ref } from 'vue'
import VideoPlayer from './VideoPlayer.vue'

const playerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)

const handlePlay = () => playerRef.value?.play()
const handlePause = () => playerRef.value?.pause()
const handleSeek = () => playerRef.value?.seek(30) // 跳到 30 秒
</script>

<template>
  <VideoPlayer ref="playerRef" />
  <button @click="handlePlay">播放</button>
  <button @click="handlePause">暂停</button>
  <button @click="handleSeek">跳转 30s</button>
</template>
```

#### 6. 地图组件的交互控制

```vue
<!-- MapComponent.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface LatLng {
  lat: number
  lng: number
}

let mapInstance: any = null

const center = ref<LatLng>({ lat: 39.9042, lng: 116.4074 })

const moveTo = (position: LatLng) => {
  center.value = position
  // 调用地图 SDK 移动视角
  mapInstance?.setCenter([position.lng, position.lat])
}

const getCenter = (): LatLng => center.value

const zoomIn = () => mapInstance?.zoomIn()
const zoomOut = () => mapInstance?.zoomOut()

onMounted(() => {
  // 初始化地图实例
})

defineExpose({ moveTo, getCenter, zoomIn, zoomOut })
</script>

<template>
  <div id="map-container" />
</template>
```

#### 7. 富文本编辑器封装

```vue
<!-- RichEditor.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const content = ref('')

const getContent = (): string => content.value

const setContent = (html: string) => {
  content.value = html
}

const clear = () => {
  content.value = ''
}

const insertText = (text: string) => {
  content.value += text
}

defineExpose({ getContent, setContent, clear, insertText })
</script>

<template>
  <textarea v-model="content" />
</template>
```

```vue
<!-- 父组件 -->
<script setup lang="ts">
import { ref } from 'vue'
import RichEditor from './RichEditor.vue'

const editorRef = ref<InstanceType<typeof RichEditor> | null>(null)

const saveContent = () => {
  const html = editorRef.value?.getContent()
  console.log('保存内容：', html)
}

const loadContent = () => {
  editorRef.value?.setContent('<p>预设内容</p>')
}
</script>

<template>
  <RichEditor ref="editorRef" />
  <button @click="saveContent">保存</button>
  <button @click="loadContent">加载预设</button>
</template>
```

#### 8. 分步向导组件

```vue
<!-- StepperComponent.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const currentStep = ref(0)
const totalSteps = ref(3)

const isFinished = computed(() => currentStep.value >= totalSteps.value - 1)

const next = () => {
  if (currentStep.value < totalSteps.value - 1) {
    currentStep.value++
  }
}

const prev = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const goToStep = (step: number) => {
  if (step >= 0 && step < totalSteps.value) {
    currentStep.value = step
  }
}

const reset = () => {
  currentStep.value = 0
}

defineExpose({ next, prev, goToStep, reset, currentStep, isFinished })
</script>

<template>
  <div class="stepper">
    <div class="step-indicator">
      步骤 {{ currentStep + 1 }} / {{ totalSteps }}
    </div>
    <slot :step="currentStep" />
  </div>
</template>
```

#### 9. 文件上传组件

```vue
<!-- FileUpload.vue -->
<script setup lang="ts">
import { ref } from 'vue'

interface FileItem {
  id: string
  name: string
  url: string
  status: 'uploading' | 'done' | 'error'
}

const fileList = ref<FileItem[]>([])

const clearFiles = () => {
  fileList.value = []
}

const getFiles = (): FileItem[] => fileList.value

const triggerUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.onchange = (e: Event) => {
    const files = (e.target as HTMLInputElement).files
    if (!files) return
    // 处理文件上传逻辑
    Array.from(files).forEach((file) => {
      fileList.value.push({
        id: Math.random().toString(36).slice(2),
        name: file.name,
        url: '',
        status: 'uploading'
      })
    })
  }
  input.click()
}

defineExpose({ clearFiles, getFiles, triggerUpload, fileList })
</script>

<template>
  <div>
    <div v-for="file in fileList" :key="file.id">
      {{ file.name }} - {{ file.status }}
    </div>
  </div>
</template>
```

#### 10. 通知/消息组件

```vue
<!-- NotificationComponent.vue -->
<script setup lang="ts">
import { ref } from 'vue'

interface Notification {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

const notifications = ref<Notification[]>([])
let idCounter = 0

const show = (message: string, type: Notification['type'] = 'info', duration = 3000) => {
  const id = ++idCounter
  notifications.value.push({ id, message, type })
  setTimeout(() => {
    dismiss(id)
  }, duration)
}

const dismiss = (id: number) => {
  notifications.value = notifications.value.filter((n) => n.id !== id)
}

const clearAll = () => {
  notifications.value = []
}

defineExpose({ show, dismiss, clearAll })
</script>

<template>
  <div class="notification-container">
    <div
      v-for="item in notifications"
      :key="item.id"
      :class="['notification', `notification-${item.type}`]"
      @click="dismiss(item.id)"
    >
      {{ item.message }}
    </div>
  </div>
</template>
```

### 六、注意事项

#### 1. `<script setup>` 默认封闭，必须显式暴露

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++

// ❌ 不调用 defineExpose，父组件通过 ref 访问子组件拿到的是空对象
// 父组件中: childRef.value.count  → undefined
</script>
```

> ⚠️ **注意：** 在 `<script setup>` 中如果不调用 `defineExpose`，父组件通过模板 `ref` 访问子组件实例时将无法获取任何内部成员。

#### 2. `defineExpose` 只能在 `<script setup>` 中使用

```vue
<!-- ❌ 错误：不能在普通的 <script> 中使用 -->
<script lang="ts">
import { defineExpose } from 'vue' // 错误！defineExpose 不是导出的函数

defineExpose({}) // 运行时报错
</script>

<!-- ✅ 正确：在 <script setup> 中直接使用 -->
<script setup lang="ts">
defineExpose({})
</script>
```

#### 3. 无需导入，是编译器宏

```vue
<script setup lang="ts">
// ❌ 不需要导入 defineExpose
// import { defineExpose } from 'vue'

// ✅ 直接使用，编译器会自动处理
defineExpose({
  method: () => {}
})
</script>
```

#### 4. 暴露 ref 时暴露的是引用而非值

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

defineExpose({
  count // ✅ 暴露的是 ref 对象，父组件可以读取 .value 并保持响应式
})
</script>
```

> 💡 **提示：** 父组件访问 `childRef.value.count` 时拿到的是 ref 对象本身（Proxy），而非 `.value` 的值。这意味着父组件可以读取和修改它，且保持响应式。

#### 5. `defineExpose` 与 `defineOptions` 的 `expose` 选项不冲突

```vue
<!-- Options API 的 expose -->
<script lang="ts">
export default {
  expose: ['count', 'increment'] // Options API 方式
}
</script>

<!-- ✅ <script setup> 中使用 defineExpose -->
<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
const increment = () => count.value++

defineExpose({ count, increment })
</script>
```

#### 6. 不要暴露过多内部实现细节

```vue
<script setup lang="ts">
import { ref } from 'vue'

// 内部私有状态和方法
const _loading = ref(false)
const _error = ref('')
const _fetchInternal = async () => { /* ... */ }

// 对外公共接口
const refresh = async () => {
  await _fetchInternal()
}
const getData = () => { /* ... */ }

// ❌ 暴露了过多内部实现
// defineExpose({ _loading, _error, _fetchInternal, refresh, getData })

// ✅ 只暴露必要的公共接口
defineExpose({ refresh, getData })
</script>
```

> 💡 **提示：** 遵循**最小暴露原则**，只暴露父组件真正需要的 API，将内部实现细节保持私有，降低组件间的耦合度。

#### 7. 通过 `ref` 访问子组件时需要判空

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)

const callChild = () => {
  // ❌ 不判空可能在组件未挂载时报错
  // childRef.value.someMethod()

  // ✅ 先判空
  childRef.value?.someMethod()
}
</script>
```

#### 8. 暴露的方法不会自动绑定 `this`

```vue
<script setup lang="ts">
// <script setup> 中没有 this，所以不存在 this 绑定问题
// 所有变量和函数都在 setup 作用域内，天然是词法绑定的

const count = 0

const method = () => {
  console.log(count) // ✅ 闭包引用，不存在 this 问题
}

defineExpose({ method })
</script>
```

#### 9. `exposed` 属性的访问限制

```vue
<script setup lang="ts">
import { ref } from 'vue'

const publicData = ref('对外公开')
const privateData = ref('内部私有')

defineExpose({ publicData })
</script>
```

```vue
<!-- 父组件 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)

onMounted(() => {
  // ✅ 可以访问暴露的属性
  console.log(childRef.value?.publicData)

  // ❌ 无法访问未暴露的属性
  console.log((childRef.value as any).privateData) // undefined

  // ❌ 也无法访问 $data、$el 等内部属性（严格模式下）
})
</script>
```

#### 10. 与 `defineEmits` 和 `defineProps` 的协同使用

```vue
<script setup lang="ts">
// defineProps 声明接收的属性
const props = defineProps<{
  modelValue: string
}>()

// defineEmits 声明发出的事件
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit'): void
}>()

// defineExpose 暴露给父组件的方法
// 三者职责不同，互不干扰
defineExpose({
  focus: () => { /* ... */ },
  validate: () => { /* ... */ }
})
</script>
```

> 💡 **提示：** `defineProps` 是组件的输入（父传子），`defineEmits` 是组件的输出（子传父事件），`defineExpose` 是组件的命令式 API（父主动调用子的方法）。三者各司其职，通常搭配使用。

### 七、相关 API 对比

| 特性 | `defineExpose` | Options API `expose` 选项 | 无 expose / `<script setup>` 无 defineExpose |
|------|---------------|--------------------------|----------------------------------------------|
| 使用位置 | `<script setup>` 内部 | `export default { expose: [...] }` | — |
| 行为 | 显式暴露指定成员 | 显式暴露指定成员 | `<script setup>` 完全封闭；Options API 全部暴露 |
| 类型安全 | 支持泛型约束 | 无类型约束 | — |
| 是否需要导入 | 否（编译器宏） | 否（选项式配置） | — |
| 封装性 | 强（默认封闭） | 强（需显式列出） | `<script setup>` 最强；Options API 最弱 |

**与 `ref` 模板引用的关系：**

```vue
<!-- 父组件中 -->
<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'

// ref 用于获取组件实例
const childRef = ref<InstanceType<typeof Child> | null>(null)

// childRef.value 拿到的就是子组件 defineExpose 暴露的内容
// 如果子组件没有 defineExpose，childRef.value 为 null 或空对象
</script>

<template>
  <Child ref="childRef" />
</template>
```

### 八、总结

`defineExpose` 是 Vue 3 `<script setup>` 中实现组件命令式 API 的核心工具。它遵循了良好的封装原则——默认封闭、按需暴露，让组件设计者可以精确控制哪些成员对外可见。

**核心要点回顾：**

- **默认封闭**：`<script setup>` 组件默认不暴露任何成员，`defineExpose` 是唯一的"出口"
- **编译器宏**：无需导入，只能在 `<script setup>` 中使用
- **最小暴露**：只暴露父组件真正需要的 API，保持内部实现的私有性
- **命令式 API**：适合需要父组件主动调用子组件方法的场景（表单验证、对话框控制等）
- **类型安全**：支持泛型参数约束暴露的类型，配合 TypeScript 使用体验更佳

> 💡 **提示：** 在实际项目中，优先使用 `props` + `emits` 的声明式数据流，只在确实需要命令式操作（如调用 `focus()`、`validate()`、`open()` 等方法）时才使用 `defineExpose`。这样可以保持组件间清晰的数据流向，降低维护成本。
