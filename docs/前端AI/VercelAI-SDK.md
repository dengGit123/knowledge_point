# Vercel AI SDK

## 一、概述

**Vercel AI SDK** 是一个开源的 TypeScript 库，用于构建 AI 驱动的应用。它提供了统一的 API 来接入多个 AI 模型提供商（OpenAI、Anthropic、Google 等），并支持 React、Vue、Svelte 等前端框架。

### 核心特点

- **统一 API**：一套代码支持多个 AI 提供商
- **框架支持**：React、Vue、Svelte、Solid
- **流式响应**：内置支持流式传输
- **类型安全**：完整的 TypeScript 类型定义
- **工具调用**：支持 Function Calling
- **图像生成**：支持 DALL·E 等图像生成模型

## 二、安装

```bash
# 核心库
npm install ai

# React 支持
npm install @ai-sdk/react

# Vue 支持
npm install @ai-sdk/vue

# 模型提供商
npm install @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google
```

## 三、核心概念

### 1. 模型配置

```typescript
import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

// 使用 OpenAI
const result1 = await generateText({
  model: openai('gpt-4'),
  prompt: '你好'
});

// 使用 Anthropic
const result2 = await generateText({
  model: anthropic('claude-sonnet-4-20250514'),
  prompt: '你好'
});
```

### 2. 消息类型

```typescript
import { Message } from 'ai';

// 用户消息
const userMessage: Message = {
  id: '1',
  role: 'user',
  content: '你好'
};

// 助手消息
const assistantMessage: Message = {
  id: '2',
  role: 'assistant',
  content: '你好！有什么可以帮助你的吗？'
};

// 系统消息
const systemMessage: Message = {
  id: '0',
  role: 'system',
  content: '你是一个专业的前端开发助手'
};
```

## 四、文本生成

### 1. 简单文本生成

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

async function chat() {
  const { text } = await generateText({
    model: openai('gpt-4'),
    system: '你是一个专业的前端开发助手',
    prompt: '用一句话介绍 TypeScript'
  });

  console.log(text);
}
```

### 2. 多轮对话

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

async function multiTurnChat() {
  const { text } = await generateText({
    model: openai('gpt-4'),
    system: '你是一个专业的前端开发助手',
    messages: [
      { role: 'user', content: '什么是 Vue 3？' },
      { role: 'assistant', content: 'Vue 3 是 Vue.js 的最新版本...' },
      { role: 'user', content: 'Composition API 是什么？' }
    ]
  });

  console.log(text);
}
```

### 3. 流式文本生成

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

async function streamChat() {
  const result = streamText({
    model: openai('gpt-4'),
    system: '你是一个专业的前端开发助手',
    prompt: '写一首关于前端开发的诗'
  });

  // 逐 chunk 读取
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
}
```

### 4. 流式响应（Web API）

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4'),
    system: '你是一个专业的前端开发助手',
    messages
  });

  return result.toDataStreamResponse();
}
```

## 五、结构化输出

### 1. 生成结构化数据

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

async function generateStructure() {
  const { object } = await generateObject({
    model: openai('gpt-4'),
    system: '你是一个产品信息生成器',
    prompt: '生成一款智能手机的产品信息',
    schema: z.object({
      name: z.string().describe('产品名称'),
      brand: z.string().describe('品牌'),
      price: z.number().describe('价格（元）'),
      specs: z.object({
        cpu: z.string(),
        ram: z.string(),
        storage: z.string(),
        screen: z.string()
      }),
      features: z.array(z.string()).describe('主要特性')
    })
  });

  console.log(object);
  // {
  //   name: 'SuperPhone Pro',
  //   brand: 'TechBrand',
  //   price: 5999,
  //   specs: { cpu: 'Snapdragon 8 Gen 3', ... },
  //   features: ['120Hz 屏幕', '5000mAh 电池']
  // }
}
```

### 2. 流式结构化输出

```typescript
import { streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

async function streamStructure() {
  const result = streamObject({
    model: openai('gpt-4'),
    system: '你是一个旅行规划助手',
    prompt: '生成一份 3 天的北京旅行计划',
    schema: z.object({
      days: z.array(z.object({
        day: z.number(),
        activities: z.array(z.object({
          time: z.string(),
          activity: z.string(),
          location: z.string()
        }))
      }))
    })
  });

  // 流式获取部分结果
  for await (const partialObject of result.partialObjectStream) {
    console.log('部分结果:', partialObject);
  }
}
```

## 六、工具调用（Function Calling）

### 1. 定义工具

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

async function useTools() {
  const { text, toolResults } = await generateText({
    model: openai('gpt-4'),
    system: '你是一个天气查询助手',
    prompt: '北京今天天气怎么样？',
    tools: {
      getWeather: {
        description: '获取指定城市的天气信息',
        parameters: z.object({
          city: z.string().describe('城市名称')
        }),
        execute: async ({ city }) => {
          // 调用天气 API
          const response = await fetch(`https://api.weather.com/${city}`);
          const data = await response.json();
          return {
            temperature: data.temperature,
            description: data.description,
            humidity: data.humidity
          };
        }
      }
    },
    maxSteps: 5 // 最多执行 5 步工具调用
  });

  console.log(text);
}
```

### 2. 多工具协作

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

async function multiToolChat() {
  const { text } = await generateText({
    model: openai('gpt-4'),
    system: '你是一个智能助手，可以查询天气和设置提醒',
    prompt: '查询北京天气，如果下雨就提醒我带伞',
    tools: {
      getWeather: {
        description: '获取天气信息',
        parameters: z.object({ city: z.string() }),
        execute: async ({ city }) => {
          return { weather: 'rainy', temperature: 18 };
        }
      },
      setReminder: {
        description: '设置提醒',
        parameters: z.object({
          content: z.string(),
          time: z.string()
        }),
        execute: async ({ content, time }) => {
          return { success: true, message: `已设置提醒: ${content}` };
        }
      }
    },
    maxSteps: 5
  });
}
```

## 七、Vue 3 集成

### 1. useChat Composable

```vue
<script setup lang="ts">
import { useChat } from '@ai-sdk/vue';

const {
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  error,
  stop,
  reload
} = useChat({
  api: '/api/chat',
  initialMessages: [
    { id: '1', role: 'system', content: '你是一个前端开发助手' }
  ],
  onFinish: (message) => {
    console.log('回复完成:', message);
  },
  onError: (error) => {
    console.error('发生错误:', error);
  }
});
</script>

<template>
  <div class="chat">
    <div class="messages">
      <div v-for="m in messages" :key="m.id" :class="['message', m.role]">
        {{ m.content }}
      </div>
    </div>

    <form @submit="handleSubmit">
      <input
        :value="input"
        @change="handleInputChange"
        placeholder="输入消息..."
        :disabled="isLoading"
      />
      <button type="submit" :disabled="isLoading">
        {{ is加载中 ? '生成中...' : '发送' }}
      </button>
      <button v-if="isLoading" @click="stop" type="button">
        停止
      </button>
    </form>
  </div>
</template>
```

### 2. useCompletion Composable

```vue
<script setup lang="ts">
import { useCompletion } from '@ai-sdk/vue';

const {
  completion,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop
} = useCompletion({
  api: '/api/complete',
  onFinish: (prompt, completion) => {
    console.log('完成:', { prompt, completion });
  }
});
</script>

<template>
  <div class="completion">
    <form @submit="handleSubmit">
      <textarea
        :value="input"
        @change="handleInputChange"
        placeholder="输入提示..."
      />
      <button type="submit" :disabled="isLoading">生成</button>
    </form>
    <div class="result">{{ completion }}</div>
  </div>
</template>
```

### 3. useObject（流式结构化输出）

```vue
<script setup lang="ts">
import { useObject } from '@ai-sdk/vue';
import { z } from 'zod';

const { object, submit, isLoading, stop } = useObject({
  api: '/api/generate-product',
  schema: z.object({
    name: z.string(),
    price: z.number(),
    description: z.string()
  })
};

function generateProduct() {
  submit('生成一款智能手机的产品信息');
}
</script>

<template>
  <div>
    <button @click="generateProduct" :disabled="isLoading">
      生成产品信息
    </button>
    <pre v-if="object">{{ JSON.stringify(object, null, 2) }}</pre>
  </div>
</template>
```

## 八、React 集成

### 1. useChat Hook

```tsx
import { useChat } from '@ai-sdk/react';

function ChatComponent() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop
  } = useChat({
    api: '/api/chat'
  });

  return (
    <div>
      {messages.map(m => (
        <div key={m.id} className={`message ${m.role}`}>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>发送</button>
        {isLoading && <button onClick={stop}>停止</button>}
      </form>
    </div>
  );
}
```

### 2. useCompletion Hook

```tsx
import { useCompletion } from '@ai-sdk/react';

function CompletionComponent() {
  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion({ api: '/api/complete' });

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea value={input} onChange={handleInputChange} />
        <button type="submit" disabled={isLoading}>生成</button>
      </form>
      <div>{completion}</div>
    </div>
  );
}
```

## 九、中间件与自定义

### 1. 自定义获取函数

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const result = await generateText({
  model: openai('gpt-4'),
  prompt: '你好',
  fetch: async (url, options) => {
    // 自定义 fetch，添加认证等
    return fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'Authorization': `Bearer ${getToken()}`
      }
    });
  }
});
```

### 2. 错误处理

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

try {
  const { text } = await generateText({
    model: openai('gpt-4'),
    prompt: '你好'
  });
} catch (error) {
  if (error instanceof APICallError) {
    console.error('API 调用失败:', error.statusCode, error.message);
  } else if (error instanceof TypeValidationError) {
    console.error('类型验证失败:', error);
  } else {
    console.error('未知错误:', error);
  }
}
```

## 十、支持的模型提供商

| 提供商 | 包名 | 主要模型 |
|-------|------|---------|
| OpenAI | `@ai-sdk/openai` | GPT-4, GPT-3.5, DALL·E |
| Anthropic | `@ai-sdk/anthropic` | Claude 3.5, Claude 3 |
| Google | `@ai-sdk/google` | Gemini Pro |
| Azure | `@ai-sdk/azure` | OpenAI 模型（Azure 托管） |
| Cohere | `@ai-sdk/cohere` | Command, Raptor |
| Mistral | `@ai-sdk/mistral` | Mistral 7B, Mixtral |
| Perplexity | `@ai-sdk/perplexity` | pplx-70b, pplx-8x7b |
| Groq | `@ai-sdk/groq` | LLaMA, Mixtral |
| Together | `@ai-sdk/togetherai` | 多种开源模型 |
| Fireworks | `@ai-sdk/fireworks` | 多种开源模型 |

## 十一、参考链接

- [Vercel AI SDK 官方文档](https://sdk.vercel.ai/docs)
- [Vercel AI SDK GitHub](https://github.com/vercel/ai)
- [AI SDK Reference](https://sdk.vercel.ai/docs/reference)
