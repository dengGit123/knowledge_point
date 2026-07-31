# AI 状态管理

## 一、概述

AI 应用的状态管理与传统应用有显著不同，需要处理对话历史、流式响应、Token 管理、上下文窗口等特殊需求。本文介绍 AI 应用中的状态管理策略和最佳实践。

## 二、AI 应用的状态特点

### 与传统应用的区别

| 特性 | 传统应用 | AI 应用 |
|-----|---------|--------|
| 数据流向 | 单向/双向 | 流式、增量 |
| 状态大小 | 可控 | 可能很大（对话历史） |
| 实时性 | 一般 | 高（打字机效果） |
| 持久化 | 可选 | 必需（对话历史） |
| 上下文 | 无 | 关键（上下文窗口） |

### AI 应用的核心状态

```
┌─────────────────────────────────────────────────────┐
│                   AI 应用状态结构                     │
├─────────────────────────────────────────────────────┤
│  会话状态    │  当前会话、会话列表、活跃会话            │
├─────────────┼───────────────────────────────────────┤
│  消息状态    │  消息列表、流式消息、消息状态            │
├─────────────┼───────────────────────────────────────┤
│  模型状态    │  当前模型、模型配置、可用模型            │
├─────────────┼───────────────────────────────────────┤
│  上下文状态  │  系统提示、上下文窗口、Token 使用        │
├─────────────┼───────────────────────────────────────┤
│  UI 状态     │  加载状态、错误状态、输入状态            │
└─────────────┴───────────────────────────────────────┘
```

## 三、对话历史管理

### 1. 消息数据结构

```typescript
// types/chat.ts

// 消息角色
type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

// 消息状态
type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

// 消息内容类型
interface TextContent {
  type: 'text';
  text: string;
}

interface ImageContent {
  type: 'image';
  imageUrl: string;
  mimeType?: string;
}

interface ToolCallContent {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

interface ToolResultContent {
  type: 'tool-result';
  toolCallId: string;
  toolName: string;
  result: unknown;
  isError?: boolean;
}

type MessageContent = TextContent | ImageContent | ToolCallContent | ToolResultContent;

// 消息
interface ChatMessage {
  id: string;
  role: MessageRole;
  content: MessageContent[] | string;
  timestamp: number;
  status?: MessageStatus;
  metadata?: {
    model?: string;
    tokenUsage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    duration?: number;
  };
}

// 会话
interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  systemPrompt?: string;
  modelConfig: ModelConfig;
  createdAt: number;
  updatedAt: number;
}

// 模型配置
interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}
```

### 2. 消息管理 Store（Pinia）

```typescript
// stores/chat.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ChatMessage, ChatSession, ModelConfig } from '@/types/chat';

export const useChatStore = defineStore('chat', () => {
  // ==================== 状态 ====================
  const sessions = ref<ChatSession[]>([]);
  const currentSessionId = ref<string | null>(null);
  const isGenerating = ref(false);
  const abortController = ref<AbortController | null>(null);

  // ==================== 计算属性 ====================
  const currentSession = computed(() =>
    sessions.value.find(s => s.id === currentSessionId.value)
  );

  const currentMessages = computed(() => currentSession.value?.messages || []);

  const currentModelConfig = computed(
    () => currentSession.value?.modelConfig ?? getDefaultModelConfig()
  );

  const totalTokens = computed(() =>
    currentMessages.value.reduce(
      (sum, msg) => sum + (msg.metadata?.tokenUsage?.totalTokens ?? 0),
      0
    )
  );

  // ==================== 会话操作 ====================
  function createSession(title?: string): ChatSession {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title: title || '新对话',
      messages: [],
      modelConfig: getDefaultModelConfig(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    sessions.value.unshift(session);
    currentSessionId.value = session.id;
    return session;
  }

  function switchSession(sessionId: string) {
    currentSessionId.value = sessionId;
  }

  function deleteSession(sessionId: string) {
    sessions.value = sessions.value.filter(s => s.id !== sessionId);
    if (currentSessionId.value === sessionId) {
      currentSessionId.value = sessions.value[0]?.id || null;
    }
  }

  function updateSessionTitle(sessionId: string, title: string) {
    const session = sessions.value.find(s => s.id === sessionId);
    if (session) {
      session.title = title;
      session.updatedAt = Date.now();
    }
  }

  // ==================== 消息操作 ====================
  function addMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const session = currentSession.value;
    if (!session) return;

    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    session.messages.push(newMessage);
    session.updatedAt = Date.now();

    // 自动更新会话标题（第一条用户消息）
    if (session.messages.length === 1 && message.role === 'user') {
      const content = typeof message.content === 'string'
        ? message.content
        : message.content[0]?.type === 'text'
          ? (message.content[0] as any).text
          : '';
      session.title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
    }

    return newMessage;
  }

  function updateMessage(messageId: string, updates: Partial<ChatMessage>) {
    const session = currentSession.value;
    if (!session) return;

    const message = session.messages.find(m => m.id === messageId);
    if (message) {
      Object.assign(message, updates);
      session.updatedAt = Date.now();
    }
  }

  function appendToMessage(messageId: string, content: string) {
    const session = currentSession.value;
    if (!session) return;

    const message = session.messages.find(m => m.id === messageId);
    if (message) {
      if (typeof message.content === 'string') {
        message.content += content;
      } else {
        const lastContent = message.content[message.content.length - 1];
        if (lastContent?.type === 'text') {
          lastContent.text += content;
        } else {
          message.content.push({ type: 'text', text: content });
        }
      }
    }
  }

  function deleteMessage(messageId: string) {
    const session = currentSession.value;
    if (!session) return;
    session.messages = session.messages.filter(m => m.id !== messageId);
    session.updatedAt = Date.now();
  }

  function clearMessages() {
    const session = currentSession.value;
    if (!session) return;
    session.messages = [];
    session.updatedAt = Date.now();
  }

  // ==================== 生成控制 ====================
  function startGeneration() {
    isGenerating.value = true;
    abortController.value = new AbortController();
  }

  function stopGeneration() {
    abortController.value?.abort();
    isGenerating.value = false;
  }

  function endGeneration() {
    isGenerating.value = false;
    abortController.value = null;
  }

  // ==================== 模型配置 ====================
  function updateModelConfig(config: Partial<ModelConfig>) {
    const session = currentSession.value;
    if (!session) return;
    session.modelConfig = { ...session.modelConfig, ...config };
  }

  // ==================== 工具函数 ====================
  function getDefaultModelConfig(): ModelConfig {
    return {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    };
  }

  return {
    // 状态
    sessions,
    currentSessionId,
    isGenerating,
    abortController,
    // 计算属性
    currentSession,
    currentMessages,
    currentModelConfig,
    totalTokens,
    // 会话操作
    createSession,
    switchSession,
    deleteSession,
    updateSessionTitle,
    // 消息操作
    addMessage,
    updateMessage,
    appendToMessage,
    deleteMessage,
    clearMessages,
    // 生成控制
    startGeneration,
    stopGeneration,
    endGeneration,
    // 模型配置
    updateModelConfig
  };
});
```

## 四、上下文窗口管理

### 1. Token 计算

```typescript
// utils/tokenCounter.ts

// 简化的 Token 估算（实际应使用 tiktoken 等库）
export function estimateTokens(text: string): number {
  // 英文约 4 字符/token，中文约 1.5 字符/token
  const englishChars = (text.match(/[a-zA-Z]+/g) || []).join('').length;
  const chineseChars = (text.match(/[一-龥]/g) || []).length;
  const otherChars = text.length - englishChars - chineseChars;

  return Math.ceil(
    englishChars / 4 + chineseChars / 1.5 + otherChars / 3
  );
}

// 计算消息列表的总 Token 数
export function estimateMessagesTokens(messages: ChatMessage[]): number {
  return messages.reduce((sum, msg) => {
    const content = typeof msg.content === 'string'
      ? msg.content
      : JSON.stringify(msg.content);
    return sum + estimateTokens(content);
  }, 0);
}

// 检查是否超出上下文窗口
export function isWithinContextWindow(
  messages: ChatMessage[],
  maxTokens: number = 128000
): boolean {
  return estimateMessagesTokens(messages) <= maxTokens;
}
```

### 2. 上下文窗口策略

```typescript
// utils/contextManager.ts
import type { ChatMessage } from '@/types/chat';
import { estimateMessagesTokens } from './tokenCounter';

export type ContextStrategy = 'sliding-window' | 'summarize' | 'drop-oldest';

export class ContextManager {
  private maxTokens: number;
  private reservedTokens: number; // 为回复预留的 Token 数
  private strategy: ContextStrategy;

  constructor(options: {
    maxTokens: number;
    reservedTokens?: number;
    strategy?: ContextStrategy;
  }) {
    this.maxTokens = options.maxTokens;
    this.reservedTokens = options.reservedTokens ?? 4096;
    this.strategy = options.strategy ?? 'sliding-window';
  }

  // 获取可用的上下文消息
  getContextMessages(messages: ChatMessage[]): ChatMessage[] {
    const systemMessages = messages.filter(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const systemTokens = estimateMessagesTokens(systemMessages);
    const availableTokens = this.maxTokens - this.reservedTokens - systemTokens;

    switch (this.strategy) {
      case 'sliding-window':
        return this.slidingWindow(conversationMessages, availableTokens);
      case 'summarize':
        return this.summarizeOldMessages(conversationMessages, availableTokens);
      case 'drop-oldest':
        return this.dropOldest(conversationMessages, availableTokens);
      default:
        return messages;
    }
  }

  // 滑动窗口：保留最近的 N 条消息
  private slidingWindow(
    messages: ChatMessage[],
    availableTokens: number
  ): ChatMessage[] {
    let totalTokens = 0;
    const result: ChatMessage[] = [];

    // 从最新消息开始往前遍历
    for (let i = messages.length - 1; i >= 0; i--) {
      const tokens = estimateMessagesTokens([messages[i]]);
      if (totalTokens + tokens > availableTokens) break;
      totalTokens += tokens;
      result.unshift(messages[i]);
    }

    return result;
  }

  // 总结旧消息
  private summarizeOldMessages(
    messages: ChatMessage[],
    availableTokens: number
  ): ChatMessage[] {
    // 保留最近 10 条消息
    const recentCount = 10;
    const recentMessages = messages.slice(-recentCount);
    const oldMessages = messages.slice(0, -recentCount);

    const recentTokens = estimateMessagesTokens(recentMessages);
    const remainingTokens = availableTokens - recentTokens;

    if (remainingTokens <= 0 || oldMessages.length === 0) {
      return recentMessages;
    }

    // 生成旧消息的摘要（这里简化处理）
    const summary = this.generateSummary(oldMessages, remainingTokens);

    return [
      {
        id: 'summary',
        role: 'system',
        content: `之前的对话摘要：\n${summary}`,
        timestamp: oldMessages[oldMessages.length - 1].timestamp
      },
      ...recentMessages
    ];
  }

  // 丢弃最旧的消息
  private dropOldest(
    messages: ChatMessage[],
    availableTokens: number
  ): ChatMessage[] {
    let totalTokens = estimateMessagesTokens(messages);
    let result = [...messages];

    while (totalTokens > availableTokens && result.length > 1) {
      const removed = result.shift()!;
      totalTokens -= estimateMessagesTokens([removed]);
    }

    return result;
  }

  // 生成摘要（实际应调用 LLM）
  private generateSummary(messages: ChatMessage[], maxTokens: number): string {
    const content = messages
      .map(m => `${m.role}: ${typeof m.content === 'string' ? m.content : ''}`)
      .join('\n');

    return content.slice(0, maxTokens * 3); // 简化处理
  }
}
```

### 3. 使用上下文管理器

```typescript
// composables/useAIChat.ts
import { ref } from 'vue';
import { useChatStore } from '@/stores/chat';
import { ContextManager } from '@/utils/contextManager';

export function useAIChat() {
  const chatStore = useChatStore();
  const error = ref<string | null>(null);

  const contextManager = new ContextManager({
    maxTokens: 128000, // GPT-4 上下文窗口
    reservedTokens: 4096,
    strategy: 'sliding-window'
  });

  async function sendMessage(content: string) {
    // 添加用户消息
    chatStore.addMessage({
      role: 'user',
      content,
      status: 'complete'
    });

    // 创建助手消息占位
    const assistantMessage = chatStore.addMessage({
      role: 'assistant',
      content: '',
      status: 'streaming'
    });

    if (!assistantMessage) return;

    chatStore.startGeneration();
    error.value = null;

    try {
      // 获取上下文消息
      const contextMessages = contextManager.getContextMessages(
        chatStore.currentMessages.slice(0, -1)
      );

      // 发送请求
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...contextMessages,
            { role: 'user', content }
          ],
          model: chatStore.currentModelConfig.model,
          temperature: chatStore.currentModelConfig.temperature,
          max_tokens: chatStore.currentModelConfig.maxTokens
        }),
        signal: chatStore.abortController?.signal
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices[0]?.delta?.content || '';
              chatStore.appendToMessage(assistantMessage.id, delta);
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      chatStore.updateMessage(assistantMessage.id, { status: 'complete' });
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        chatStore.updateMessage(assistantMessage.id, { status: 'complete' });
      } else {
        error.value = (e as Error).message;
        chatStore.updateMessage(assistantMessage.id, { status: 'error' });
      }
    } finally {
      chatStore.endGeneration();
    }
  }

  return { sendMessage, error };
}
```

## 五、持久化策略

### 1. LocalStorage 持久化

```typescript
// composables/useChatPersistence.ts
import { watch } from 'vue';
import { useChatStore } from '@/stores/chat';

const STORAGE_KEY = 'ai_chat_sessions';
const MAX_STORED_MESSAGES = 100; // 每个会话最多存储的消息数

export function useChatPersistence() {
  const chatStore = useChatStore();

  // 加载会话
  function loadSessions() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        chatStore.sessions = parsed.sessions || [];
        chatStore.currentSessionId = parsed.currentSessionId;

        // 限制每个会话的消息数量
        chatStore.sessions.forEach(session => {
          if (session.messages.length > MAX_STORED_MESSAGES) {
            session.messages = session.messages.slice(-MAX_STORED_MESSAGES);
          }
        });
      }
    } catch (e) {
      console.error('加载会话失败:', e);
    }
  }

  // 保存会话
  function saveSessions() {
    try {
      const data = {
        sessions: chatStore.sessions.map(session => ({
          ...session,
          // 不保存流式消息的完整内容（太大）
          messages: session.messages.map(msg => ({
            ...msg,
            content: msg.status === 'streaming' ? '' : msg.content
          }))
        })),
        currentSessionId: chatStore.currentSessionId
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('保存会话失败:', e);
      // 可能是存储空间不足，尝试清理旧会话
      cleanupOldSessions();
    }
  }

  // 清理旧会话
  function cleanupOldSessions() {
    if (chatStore.sessions.length > 10) {
      chatStore.sessions = chatStore.sessions.slice(0, 10);
      saveSessions();
    }
  }

  // 监听变化自动保存
  watch(
    () => [chatStore.sessions, chatStore.currentSessionId],
    () => {
      // 防抖保存
      debounce(saveSessions, 1000)();
    },
    { deep: true }
  );

  // 初始化
  loadSessions();

  return { loadSessions, saveSessions };
}

// 防抖函数
function debounce(fn: Function, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

### 2. IndexedDB 持久化（大数据量）

```typescript
// utils/chatDB.ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { ChatSession } from '@/types/chat';

interface ChatDB extends DBSchema {
  sessions: {
    key: string;
    value: ChatSession;
    indexes: { 'by-updated': number };
  };
}

let db: IDBPDatabase<ChatDB> | null = null;

async function getDB() {
  if (!db) {
    db = await openDB<ChatDB>('ai-chat-db', 1, {
      upgrade(database) {
        const store = database.createObjectStore('sessions', { keyPath: 'id' });
        store.createIndex('by-updated', 'updatedAt');
      }
    });
  }
  return db;
}

export async function saveSession(session: ChatSession) {
  const database = await getDB();
  await database.put('sessions', session);
}

export async function loadSessions(): Promise<ChatSession[]> {
  const database = await getDB();
  return database.getAllFromIndex('sessions', 'by-updated');
}

export async function deleteSession(sessionId: string) {
  const database = await getDB();
  await database.delete('sessions', sessionId);
}

export async function clearAllSessions() {
  const database = await getDB();
  await database.clear('sessions');
}
```

## 六、多模型管理

### 1. 模型配置 Store

```typescript
// stores/model.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface ModelInfo {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  maxTokens: number;
  supportsVision: boolean;
  supportsTools: boolean;
  costPer1kTokens: {
    input: number;
    output: number;
  };
}

export const useModelStore = defineStore('model', () => {
  const models = ref<ModelInfo[]>([
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      maxTokens: 128000,
      supportsVision: true,
      supportsTools: true,
      costPer1kTokens: { input: 0.03, output: 0.06 }
    },
    {
      id: 'claude-sonnet-4-20250514',
      name: 'Claude Sonnet 4',
      provider: 'anthropic',
      maxTokens: 200000,
      supportsVision: true,
      supportsTools: true,
      costPer1kTokens: { input: 0.015, output: 0.075 }
    }
  ]);

  const selectedModelId = ref('gpt-4');

  const selectedModel = computed(
    () => models.value.find(m => m.id === selectedModelId.value)
  );

  const availableProviders = computed(() => {
    const providers = new Set(models.value.map(m => m.provider));
    return Array.from(providers);
  });

  function selectModel(modelId: string) {
    selectedModelId.value = modelId;
  }

  function getModelsByProvider(provider: string) {
    return models.value.filter(m => m.provider === provider);
  }

  return {
    models,
    selectedModelId,
    selectedModel,
    availableProviders,
    selectModel,
    getModelsByProvider
  };
});
```

## 七、参考链接

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [IndexedDB API](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)
- [tiktoken - Token 计数](https://github.com/openai/tiktoken)
