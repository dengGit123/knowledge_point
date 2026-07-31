# AI 对话界面开发

## 一、概述

AI 对话界面是 AI 应用最常见的交互形式，本文介绍构建高质量 AI 对话界面所需的核心技术，包括流式响应、Markdown 渲染、代码高亮、消息管理等。

## 二、流式响应（Streaming）

### 1. 简介

流式响应是指 AI 生成的内容逐字/逐句地传输和显示给用户，而不是一次性返回完整结果。这种方式大幅提升用户体验。

### 2. 实现流式请求

#### 使用 Fetch API

```typescript
async function streamChat(
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void
) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: true })
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // 处理 SSE (Server-Sent Events) 格式
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content || '';
          onChunk(content);
        } catch (e) {
          console.error('解析 SSE 数据失败:', e);
        }
      }
    }
  }
}

// 使用
await streamChat(
  [{ role: 'user', content: '你好' }],
  (chunk) => {
    document.getElementById('output')!.textContent += chunk;
  }
);
```

#### 使用 ReadableStream

```typescript
async function* streamGenerator(
  response: Response
): AsyncGenerator<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content || '';
          if (content) yield content;
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
}

// 使用
const response = await fetch('/api/chat', { /* ... */ });
for await (const chunk of streamGenerator(response)) {
  updateUI(chunk);
}
```

### 3. 流式响应 UI 组件（Vue 3）

```vue
<script setup lang="ts">
import { ref, nextTick } from 'vue';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const messages = ref<Message[]>([]);
const inputText = ref('');
const isGenerating = ref(false);
const scrollContainer = ref<HTMLElement | null>(null);

// 发送消息
async function sendMessage() {
  if (!inputText.value.trim() || isGenerating.value) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: inputText.value,
    timestamp: Date.now()
  };
  messages.value.push(userMessage);

  const assistantMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: '',
    timestamp: Date.now()
  };
  messages.value.push(assistantMessage);

  const currentInput = inputText.value;
  inputText.value = '';
  isGenerating.value = true;

  await scrollToBottom();

  try {
    await streamChat(messages.value.slice(0, -1), (chunk) => {
      assistantMessage.content += chunk;
      scrollToBottom();
    });
  } finally {
    isGenerating.value = false;
  }
}

// 滚动到底部
async function scrollToBottom() {
  await nextTick();
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
}
</script>

<template>
  <div class="chat-container">
    <div ref="scrollContainer" class="messages">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message', msg.role]"
      >
        <div class="avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</div>
        <div class="content">{{ msg.content }}<span v-if="isGenerating && msg === messages[messages.length - 1]" class="cursor">▊</span></div>
      </div>
    </div>

    <div class="input-area">
      <textarea
        v-model="inputText"
        @keydown.enter.exact.prevent="sendMessage"
        :disabled="isGenerating"
        placeholder="输入消息..."
        rows="1"
      />
      <button @click="sendMessage" :disabled="isGenerating">
        {{ isGenerating ? '生成中...' : '发送' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.cursor {
  animation: blink 1s infinite;
}
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
```

## 三、Markdown 渲染

### 1. 安装 Markdown 渲染库

```bash
npm install marked highlight.js
npm install @types/marked --save-dev
```

### 2. Markdown 渲染组件

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// 配置 marked 支持代码高亮
marked.setOptions({
  highlight: function (code: string, lang: string) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-'
});

const props = defineProps<{
  content: string;
}>();

const renderedHTML = computed(() => {
  return marked.parse(props.content, { async: false }) as string;
});
</script>

<template>
  <div class="markdown-body" v-html="renderedHTML" />
</template>

<style scoped>
.markdown-body :deep(pre) {
  background: #1e1e1e;
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}

.markdown-body :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 14px;
}

.markdown-body :deep(p code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
```

### 3. 流式 Markdown 渲染

```typescript
// 流式渲染时处理不完整的 Markdown
function safeMarkdownParse(content: string): string {
  // 补全未闭合的代码块
  const codeBlockCount = (content.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    content += '\n```'; // 补全未闭合的代码块
  }

  return marked.parse(content, { async: false }) as string;
}
```

## 四、代码高亮与复制

### 1. 带复制按钮的代码块

```vue
<script setup lang="ts">
import { ref } from 'vue';
import hljs from 'highlight.js';

const props = defineProps<{
  code: string;
  language: string;
}>();

const copied = ref(false);

async function copyCode() {
  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <span class="language">{{ language }}</span>
      <button @click="copyCode" class="copy-btn">
        {{ copied ? '✓ 已复制' : '复制' }}
      </button>
    </div>
    <pre><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
  </div>
</template>

<style scoped>
.code-block {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2d2d2d;
  padding: 8px 16px;
  color: #fff;
  font-size: 12px;
}

.copy-btn {
  background: transparent;
  border: 1px solid #666;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.copy-btn:hover {
  background: #444;
}
</style>
```

### 2. 自定义 marked 渲染器

```typescript
import { marked } from 'marked';

const renderer = new marked.Renderer();

// 自定义代码块渲染
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang || 'plaintext';
  const highlighted = hljs.highlight(text, { language }).value;

  return `
    <div class="code-block">
      <div class="code-header">
        <span class="language">${language}</span>
        <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${text.replace(/`/g, '\\`')}\`)">
          复制
        </button>
      </div>
      <pre><code class="hljs language-${language}">${highlighted}</code></pre>
    </div>
  `;
};

marked.use({ renderer });
```

## 五、消息管理

### 1. 消息状态管理（Pinia）

```typescript
// stores/chat.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export const useChatStore = defineStore('chat', () => {
  // 状态
  const sessions = ref<ChatSession[]>([]);
  const currentSessionId = ref<string | null>(null);
  const isGenerating = ref(false);

  // 计算属性
  const currentSession = computed(() =>
    sessions.value.find(s => s.id === currentSessionId.value)
  );

  const currentMessages = computed(() =>
    currentSession.value?.messages || []
  );

  // 操作
  function createSession(title: string = '新对话'): ChatSession {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    sessions.value.unshift(session);
    currentSessionId.value = session.id;
    return session;
  }

  function addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const session = currentSession.value;
    if (!session) return;

    session.messages.push({
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });
    session.updatedAt = Date.now();
  }

  function updateMessage(id: string, updates: Partial<ChatMessage>) {
    const session = currentSession.value;
    if (!session) return;

    const message = session.messages.find(m => m.id === id);
    if (message) {
      Object.assign(message, updates);
    }
  }

  function deleteMessage(id: string) {
    const session = currentSession.value;
    if (!session) return;

    session.messages = session.messages.filter(m => m.id !== id);
  }

  function clearSession() {
    const session = currentSession.value;
    if (!session) return;
    session.messages = [];
  }

  function deleteSession(id: string) {
    sessions.value = sessions.value.filter(s => s.id !== id);
    if (currentSessionId.value === id) {
      currentSessionId.value = sessions.value[0]?.id || null;
    }
  }

  return {
    sessions,
    currentSessionId,
    isGenerating,
    currentSession,
    currentMessages,
    createSession,
    addMessage,
    updateMessage,
    deleteMessage,
    clearSession,
    deleteSession
  };
});
```

### 2. 消息持久化

```typescript
// composables/useChatPersistence.ts
import { watch } from 'vue';
import { useChatStore } from '@/stores/chat';

const STORAGE_KEY = 'chat_sessions';

export function useChatPersistence() {
  const chatStore = useChatStore();

  // 从 localStorage 加载
  function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        chatStore.sessions = parsed.sessions || [];
        chatStore.currentSessionId = parsed.currentSessionId || null;
      } catch (e) {
        console.error('加载会话失败:', e);
      }
    }
  }

  // 保存到 localStorage
  function saveToStorage() {
    const data = {
      sessions: chatStore.sessions,
      currentSessionId: chatStore.currentSessionId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // 监听变化自动保存
  watch(
    () => [chatStore.sessions, chatStore.currentSessionId],
    saveToStorage,
    { deep: true }
  );

  // 初始化时加载
  loadFromStorage();
}
```

## 六、输入区域增强

### 1. 自适应高度文本框

```vue
<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  send: [];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

// 自动调整高度
watch(
  () => props.modelValue,
  () => {
    const textarea = textareaRef.value;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }
);

// 处理键盘事件
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (props.modelValue.trim() && !props.disabled) {
      emit('send');
    }
  }
}
</script>

<template>
  <textarea
    ref="textareaRef"
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    @keydown="handleKeydown"
    :disabled="disabled"
    placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
    rows="1"
  />
</template>
```

### 2. 附件上传

```vue
<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  send: [];
  'file-upload': [files: File[]];
}>();

const attachments = ref<File[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);

function triggerFileUpload() {
  fileInputRef.value?.click();
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    attachments.value = [...attachments.value, ...Array.from(input.files)];
    emit('file-upload', Array.from(input.files));
  }
}

function removeAttachment(index: number) {
  attachments.value.splice(index, 1);
}
</script>

<template>
  <div class="input-wrapper">
    <!-- 附件预览 -->
    <div v-if="attachments.length" class="attachments">
      <div v-for="(file, index) in attachments" :key="index" class="attachment">
        <span>{{ file.name }}</span>
        <button @click="removeAttachment(index)">×</button>
      </div>
    </div>

    <div class="input-row">
      <button @click="triggerFileUpload" class="attach-btn">📎</button>
      <input
        ref="fileInputRef"
        type="file"
        multiple
        hidden
        @change="handleFileChange"
      />
      <textarea
        :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        placeholder="输入消息..."
      />
      <button @click="emit('send')">发送</button>
    </div>
  </div>
</template>
```

## 七、Typing 效果（打字机效果）

### 1. 逐字显示动画

```typescript
// composables/useTypingEffect.ts
import { ref, watch } from 'vue';

export function useTypingEffect(
  source: { value: string },
  options?: { speed?: number; enabled?: boolean }
) {
  const displayText = ref('');
  const isTyping = ref(false);
  let currentIndex = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  function startTyping() {
    if (timer) clearInterval(timer);
    isTyping.value = true;
    currentIndex = 0;
    displayText.value = '';

    const speed = options?.speed || 30;

    timer = setInterval(() => {
      if (currentIndex < source.value.length) {
        displayText.value += source.value[currentIndex];
        currentIndex++;
      } else {
        stopTyping();
      }
    }, speed);
  }

  function stopTyping() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    isTyping.value = false;
    displayText.value = source.value;
  }

  watch(() => source.value, () => {
    if (options?.enabled !== false) {
      startTyping();
    } else {
      displayText.value = source.value;
    }
  });

  return { displayText, isTyping, startTyping, stopTyping };
}
```

### 2. 使用示例

```vue
<script setup lang="ts">
import { useTypingEffect } from '@/composables/useTypingEffect';

const props = defineProps<{
  content: string;
  isStreaming: boolean;
}>();

const { displayText, isTyping } = useTypingEffect(
  computed(() => props.content),
  { speed: 20 }
);
</script>

<template>
  <div class="message-content">
    {{ displayText }}
    <span v-if="isTyping" class="cursor">▊</span>
  </div>
</template>
```

## 八、参考链接

- [Marked - Markdown Parser](https://marked.js.org/)
- [Highlight.js](https://highlightjs.org/)
- [Shiki - 代码高亮](https://shiki.style/)
- [remark](https://remark.js.org/) - Markdown 处理工具
