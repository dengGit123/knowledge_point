# AI 应用性能优化

## 一、概述

AI 应用的性能优化涉及多个层面：网络传输（流式响应）、渲染性能（大量消息）、计算性能（向量检索）、资源管理（模型加载）等。本文介绍 AI 应用中常见的性能问题和优化策略。

## 二、流式响应优化

### 1. 减少首字节时间（TTFB）

```typescript
// 服务端：尽早开始流式传输
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4'),
    messages,
    // 尽早返回响应头
    onFinish: () => {
      // 记录完成时间
    }
  });

  return result.toDataStreamResponse({
    // 设置响应头，启用流式传输
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

### 2. 客户端流式处理优化

```typescript
// 使用 ReadableStream 处理流式数据
async function* parseSSEStream(
  response: Response
): AsyncGenerator<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // 批量处理完整的 SSE 事件
    let separatorIndex;
    while ((separatorIndex = buffer.indexOf('\n\n')) !== -1) {
      const event = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);

      for (const line of event.split('\n')) {
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
}
```

### 3. 防抖渲染

```typescript
// composables/useThrottledText.ts
import { ref, watch } from 'vue';

export function useThrottledText(
  source: { value: string },
  interval: number = 50
) {
  const throttledText = ref('');
  let timer: ReturnType<typeof setInterval> | null = null;
  let lastIndex = 0;

  watch(
    () => source.value,
    (newValue) => {
      if (timer) clearInterval(timer);

      timer = setInterval(() => {
        if (lastIndex < newValue.length) {
          // 每次更新多个字符，减少渲染次数
          const chunkSize = Math.max(1, Math.floor((newValue.length - lastIndex) / 10));
          const endIndex = Math.min(lastIndex + chunkSize, newValue.length);
          throttledText.value = newValue.slice(0, endIndex);
          lastIndex = endIndex;
        } else {
          if (timer) clearInterval(timer);
          timer = null;
        }
      }, interval);
    }
  );

  return { throttledText };
}
```

## 三、消息列表渲染优化

### 1. 虚拟滚动

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const props = defineProps<{
  messages: Message[];
}>();

const containerRef = ref<HTMLElement | null>(null);
const scrollTop = ref(0);
const containerHeight = ref(600);
const itemHeight = 80; // 预估每项高度

// 可见范围计算
const visibleCount = computed(() => Math.ceil(containerHeight.value / itemHeight) + 2);
const startIndex = computed(() => Math.max(0, Math.floor(scrollTop.value / itemHeight) - 1));
const endIndex = computed(() =>
  Math.min(props.messages.length, startIndex.value + visibleCount.value)
);

// 可见消息
const visibleMessages = computed(() =>
  props.messages.slice(startIndex.value, endIndex.value).map((msg, i) => ({
    ...msg,
    index: startIndex.value + i
  }))
);

// 总高度
const totalHeight = computed(() => props.messages.length * itemHeight);

// 偏移量
const offsetY = computed(() => startIndex.value * itemHeight);

function handleScroll(e: Event) {
  scrollTop.value = (e.target as HTMLElement).scrollTop;
}
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-list"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <div class="virtual-list-phantom" :style="{ height: totalHeight + 'px' }">
      <div
        class="virtual-list-content"
        :style="{ transform: `translateY(${offsetY}px)` }"
      >
        <div
          v-for="msg in visibleMessages"
          :key="msg.id"
          class="message-item"
          :style="{ height: itemHeight + 'px' }"
        >
          <div :class="['message', msg.role]">
            {{ msg.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.virtual-list {
  overflow-y: auto;
  position: relative;
}
.virtual-list-phantom {
  position: absolute;
  width: 100%;
}
.virtual-list-content {
  position: absolute;
  width: 100%;
}
</style>
```

### 2. 使用 vue-virtual-scroller

```bash
npm install vue-virtual-scroller
```

```vue
<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const messages = ref<Message[]>([]);
</script>

<template>
  <RecycleScroller
    class="messages"
    :items="messages"
    :item-size="80"
    key-field="id"
    v-slot="{ item }"
  >
    <div :class="['message', item.role]">
      {{ item.content }}
    </div>
  </RecycleScroller>
</template>
```

### 3. 消息组件懒渲染

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

// 异步加载 Markdown 渲染组件
const MarkdownRenderer = defineAsyncComponent(() =>
  import('./MarkdownRenderer.vue')
);

const props = defineProps<{
  content: string;
  role: 'user' | 'assistant';
}>();

// 判断是否需要 Markdown 渲染
const needsMarkdown = computed(() => {
  return props.content.includes('```') ||
         props.content.includes('**') ||
         props.content.includes('[');
});
</script>

<template>
  <div class="message-content">
    <!-- 简单文本直接渲染 -->
    <span v-if="!needsMarkdown">{{ content }}</span>
    <!-- 复杂内容使用异步组件 -->
    <MarkdownRenderer v-else :content="content" />
  </div>
</template>
```

## 四、Token 优化

### 1. Token 计数与限制

```typescript
// utils/tokenOptimizer.ts

// 简化的 Token 估算
export function estimateTokens(text: string): number {
  // 更精确的估算
  const chineseChars = (text.match(/[一-龥]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const numbers = (text.match(/\d+/g) || []).length;
  const punctuation = (text.match(/[^\w\s一-龥]/g) || []).length;

  return Math.ceil(
    chineseChars * 1.5 +
    englishWords * 1.3 +
    numbers * 0.5 +
    punctuation * 0.3
  );
}

// 截断文本到指定 Token 限制
export function truncateToTokenLimit(
  text: string,
  maxTokens: number
): string {
  if (estimateTokens(text) <= maxTokens) return text;

  // 二分查找合适的截断位置
  let left = 0;
  let right = text.length;

  while (left < right) {
    const mid = Math.ceil((left + right) / 2);
    const truncated = text.slice(0, mid);

    if (estimateTokens(truncated) <= maxTokens) {
      left = mid;
    } else {
      right = mid - 1;
    }
  }

  return text.slice(0, left);
}

// 智能截断（尽量在句子边界截断）
export function smartTruncate(text: string, maxTokens: number): string {
  const truncated = truncateToTokenLimit(text, maxTokens);

  // 尝试在句子边界截断
  const sentenceEndings = ['。', '！', '？', '. ', '! ', '? ', '\n'];
  let bestEnd = truncated.length;

  for (const ending of sentenceEndings) {
    const lastIndex = truncated.lastIndexOf(ending);
    if (lastIndex > bestEnd * 0.8) {
      bestEnd = lastIndex + ending.length;
      break;
    }
  }

  return truncated.slice(0, bestEnd);
}
```

### 2. 上下文窗口管理

```typescript
// utils/contextOptimizer.ts
import type { ChatMessage } from '@/types/chat';
import { estimateTokens } from './tokenOptimizer';

export class ContextOptimizer {
  private maxTokens: number;
  private reservedTokens: number;

  constructor(maxTokens: number = 128000, reservedTokens: number = 4096) {
    this.maxTokens = maxTokens;
    this.reservedTokens = reservedTokens;
  }

  // 优化消息列表以适应上下文窗口
  optimize(messages: ChatMessage[]): ChatMessage[] {
    const systemMessages = messages.filter(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const systemTokens = this.estimateMessagesTokens(systemMessages);
    const availableTokens = this.maxTokens - this.reservedTokens - systemTokens;

    // 保留最近的消息，丢弃旧消息
    const optimizedConversation = this.fitMessages(
      conversationMessages,
      availableTokens
    );

    return [...systemMessages, ...optimizedConversation];
  }

  // 在 Token 限制内保留尽可能多的消息
  private fitMessages(
    messages: ChatMessage[],
    availableTokens: number
  ): ChatMessage[] {
    let totalTokens = 0;
    const result: ChatMessage[] = [];

    // 从最新消息开始往前遍历
    for (let i = messages.length - 1; i >= 0; i--) {
      const tokens = this.estimateMessageTokens(messages[i]);
      if (totalTokens + tokens > availableTokens) break;
      totalTokens += tokens;
      result.unshift(messages[i]);
    }

    return result;
  }

  // 压缩旧消息
  compress(messages: ChatMessage[], targetTokens: number): ChatMessage[] {
    const totalTokens = this.estimateMessagesTokens(messages);
    if (totalTokens <= targetTokens) return messages;

    // 保留系统消息和最近的消息
    const systemMessages = messages.filter(m => m.role === 'system');
    const recentMessages = messages.filter(m => m.role !== 'system').slice(-10);
    const oldMessages = messages.filter(m => m.role !== 'system').slice(0, -10);

    const recentTokens = this.estimateMessagesTokens(recentMessages);
    const remainingTokens = targetTokens - recentTokens;

    // 为旧消息生成摘要
    if (oldMessages.length > 0 && remainingTokens > 0) {
      const summary = this.generateSummary(oldMessages, remainingTokens);
      return [
        ...systemMessages,
        {
          id: 'summary',
          role: 'system',
          content: `之前的对话摘要：\n${summary}`,
          timestamp: oldMessages[oldMessages.length - 1].timestamp
        },
        ...recentMessages
      ];
    }

    return [...systemMessages, ...recentMessages];
  }

  private estimateMessageTokens(message: ChatMessage): number {
    const content = typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content);
    return estimateTokens(content);
  }

  private estimateMessagesTokens(messages: ChatMessage[]): number {
    return messages.reduce((sum, msg) => sum + this.estimateMessageTokens(msg), 0);
  }

  private generateSummary(messages: ChatMessage[], maxTokens: number): string {
    // 简化实现：实际应调用 LLM 生成摘要
    const content = messages
      .map(m => `${m.role}: ${typeof m.content === 'string' ? m.content.slice(0, 100) : ''}`)
      .join('\n');
    return smartTruncate(content, maxTokens);
  }
}
```

## 五、请求优化

### 1. 请求去重

```typescript
// utils/requestDedup.ts
class RequestDedup {
  private pendingRequests = new Map<string, Promise<any>>();

  async dedup<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // 如果有相同请求正在进行，直接返回
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // 创建新请求
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

// 使用
const dedup = new RequestDedup();

// 相同 key 的请求只会发送一次
const result1 = await dedup('user-profile', () => fetch('/api/user/profile'));
const result2 = await dedup('user-profile', () => fetch('/api/user/profile'));
// result1 === result2
```

### 2. 请求缓存

```typescript
// utils/requestCache.ts
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 60000) {
    this.defaultTTL = defaultTTL;
  }

  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.cache.get(key);

    if (cached && Date.now() < cached.expiresAt) {
      return cached.data as T;
    }

    const data = await fetchFn();
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttl ?? this.defaultTTL)
    });

    return data;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: RegExp) {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

// 使用
const cache = new RequestCache(300000); // 5 分钟缓存

const models = await cache.getOrFetch(
  'available-models',
  () => fetch('/api/models').then(r => r.json())
);
```

### 3. 预加载与预连接

```html
<!-- index.html -->
<head>
  <!-- DNS 预解析 -->
  <link rel="dns-prefetch" href="https://api.openai.com" />
  <link rel="dns-prefetch" href="https://api.anthropic.com" />

  <!-- 预连接 -->
  <link rel="preconnect" href="https://api.openai.com" crossorigin />

  <!-- 预加载关键资源 -->
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
</head>
```

```typescript
// 预加载模型
function preloadModel(modelId: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = `/api/models/${modelId}/config`;
  document.head.appendChild(link);
}

// 用户可能使用的模型
onMounted(() => {
  preloadModel('gpt-4');
  preloadModel('claude-3');
});
```

## 六、资源管理

### 1. 模型懒加载

```typescript
// composables/useLazyModel.ts
import { ref } from 'vue';

export function useLazyModel() {
  const modelLoaded = ref(false);
  const modelLoading = ref(false);
  const model = ref<any>(null);

  async function loadModel(modelId: string) {
    if (modelLoaded.value || modelLoading.value) return;

    modelLoading.value = true;
    try {
      // 动态导入模型
      const module = await import(`@/models/${modelId}`);
      model.value = module.default;
      modelLoaded.value = true;
    } finally {
      modelLoading.value = false;
    }
  }

  return { model, modelLoaded, modelLoading, loadModel };
}
```

### 2. Web Worker 卸载计算

```typescript
// workers/embedding.worker.ts
import { pipeline } from '@xenova/transformers';

let extractor: any = null;

self.onmessage = async (e) => {
  const { id, type, payload } = e.data;

  if (type === 'init') {
    extractor = await pipeline('feature-extraction', payload.modelId);
    self.postMessage({ id, type: 'init-complete' });
  }

  if (type === 'embed') {
    const embedding = await extractor(payload.text, {
      pooling: 'mean',
      normalize: true
    });
    self.postMessage({ id, type: 'embed-result', payload: Array.from(embedding.data) });
  }
};

// composables/useEmbeddingWorker.ts
export function useEmbeddingWorker() {
  const worker = new Worker(new URL('../workers/embedding.worker.ts', import.meta.url), {
    type: 'module'
  });

  const pending = new Map<string, Function>();

  worker.onmessage = (e) => {
    const { id, type, payload } = e.data;
    const resolve = pending.get(id);
    if (resolve) {
      resolve(payload);
      pending.delete(id);
    }
  };

  async function init(modelId: string) {
    return new Promise<void>((resolve) => {
      const id = crypto.randomUUID();
      pending.set(id, resolve);
      worker.postMessage({ id, type: 'init', payload: { modelId } });
    });
  }

  async function embed(text: string): Promise<number[]> {
    return new Promise((resolve) => {
      const id = crypto.randomUUID();
      pending.set(id, resolve);
      worker.postMessage({ id, type: 'embed', payload: { text } });
    });
  }

  return { init, embed };
}
```

### 3. 内存管理

```typescript
// 及时清理大对象
class ChatSession {
  private messages: ChatMessage[] = [];
  private maxMessages = 100;

  addMessage(message: ChatMessage) {
    this.messages.push(message);

    // 限制消息数量
    if (this.messages.length > this.maxMessages) {
      // 保留系统消息和最近的消息
      const systemMessages = this.messages.filter(m => m.role === 'system');
      const recentMessages = this.messages.filter(m => m.role !== 'system').slice(-50);
      this.messages = [...systemMessages, ...recentMessages];
    }
  }

  // 清理资源
  dispose() {
    this.messages = [];
    // 清理其他资源
  }
}
```

## 七、渲染性能优化

### 1. 使用 v-memo 减少重渲染

```vue
<template>
  <div
    v-for="message in messages"
    :key="message.id"
    v-memo="[message.content, message.status]"
  >
    <MessageItem :message="message" />
  </div>
</template>
```

### 2. 计算属性缓存

```typescript
// 使用 computed 缓存计算结果
const renderedMessages = computed(() =>
  messages.value.map(msg => ({
    ...msg,
    renderedContent: renderMarkdown(msg.content)
  }))
);
```

### 3. 避免不必要的响应式

```typescript
// 对于不需要响应式的数据，使用 markRaw
import { markRaw } from 'vue';

const staticConfig = markRaw({
  models: ['gpt-4', 'claude-3', 'gemini-pro'],
  defaultModel: 'gpt-4'
});

// 或使用 shallowRef
import { shallowRef } from 'vue';

const largeList = shallowRef(generateLargeList());
```

## 八、网络优化

### 1. HTTP/2 与压缩

```typescript
// nginx 配置示例
// nginx.conf
/*
server {
    listen 443 http2;
    
    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;
    
    # SSE 配置
    location /api/chat {
        proxy_pass http://backend;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_cache off;
    }
}
*/
```

### 2. 使用 Service Worker 缓存

```typescript
// sw.ts
const CACHE_NAME = 'ai-app-cache-v1';

self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  // API 请求使用网络优先策略
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // 静态资源使用缓存优先策略
  event.respondWith(cacheFirst(event.request));
});

async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (e) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}
```

## 九、性能监控

### 1. 性能指标采集

```typescript
// utils/performanceMonitor.ts

interface PerformanceMetrics {
  ttfb: number;        // 首字节时间
  ttfm: number;        // 首个消息时间
  totalDuration: number;
  tokenCount: number;
  tokensPerSecond: number;
}

class PerformanceMonitor {
  private metrics: Map<string, { startTime: number; events: Map<string, number> }> = new new Map();

  start(requestId: string) {
    this.metrics.set(requestId, {
      startTime: performance.now(),
      events: new Map()
    });
  }

  mark(requestId: string, event: string) {
    const metric = this.metrics.get(requestId);
    if (metric) {
      metric.events.set(event, performance.now());
    }
  }

  end(requestId: string): PerformanceMetrics | null {
    const metric = this.metrics.get(requestId);
    if (!metric) return null;

    const ttfb = metric.events.get('firstByte')! - metric.startTime;
    const ttfm = metric.events.get('firstMessage')! - metric.startTime;
    const totalDuration = performance.now() - metric.startTime;
    const tokenCount = metric.events.get('tokenCount') ?? 0;

    const result: PerformanceMetrics = {
      ttfb,
      ttfm,
      totalDuration,
      tokenCount,
      tokensPerSecond: (tokenCount / totalDuration) * 1000
    };

    this.metrics.delete(requestId);
    return result;
  }
}

export const perfMonitor = new PerformanceMonitor();
```

### 2. 使用 Web Vitals

```typescript
// 监控核心 Web 指标
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

onCLS(console.log);  // 累积布局偏移
onFID(console.log);  // 首次输入延迟
onLCP(console.log);  // 最大内容绘制
onFCP(console.log);  // 首次内容绘制
onTTFB(console.log); // 首字节时间
```

## 十、参考链接

- [Web Vitals](https://web.dev/vitals/)
- [vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller)
- [Workbox - Service Worker](https://developer.chrome.com/docs/workbox/)
- [ReadableStream API](https://developer.mozilla.org/zh-CN/docs/Web/API/ReadableStream)
