# WebLLM 与本地推理

## 一、概述

**WebLLM** 是一个高性能的浏览器内 LLM 推理引擎，利用 WebGPU 技术直接在浏览器中运行大语言模型，无需服务器支持。它让完全本地化的 AI 应用成为可能。

### 核心优势

| 优势 | 说明 |
|-----|------|
| 隐私保护 | 数据不离开用户设备 |
| 零成本 | 无需 API 费用 |
| 离线可用 | 无需网络连接 |
| 低延迟 | 无网络传输延迟 |
| 完全控制 | 不受服务可用性影响 |

## 二、技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      WebLLM 架构                         │
├─────────────────────────────────────────────────────────┤
│  应用层    │  聊天界面 / Agent / RAG                     │
├───────────┼─────────────────────────────────────────────┤
│  LLM 引擎  │  llama.cpp / MLC-LLM (编译为 WebGPU/WebASM) │
├───────────┼─────────────────────────────────────────────┤
│  硬件加速  │  WebGPU / WebAssembly / SIMD                 │
├───────────┼─────────────────────────────────────────────┤
│  浏览器    │  Chrome / Edge (WebGPU 支持)                 │
└─────────────────────────────────────────────────────────┘
```

## 三、WebLLM 使用

### 1. 安装

```bash
npm install @mlc-ai/web-llm
```

### 2. 基本使用

```typescript
import * as webllm from '@mlc-ai/web-llm';

// 创建引擎实例
const engine = new webllm.MLCEngine();

// 加载模型（首次需要下载，之后从缓存加载）
await engine.reload('Llama-3-8B-Instruct-q4f16_1-MLC', {
  temperature: 0.7,
  top_p: 0.9
});

// 单轮对话
const response = await engine.chat.completions.create({
  messages: [
    { role: 'user', content: '用一句话介绍 TypeScript' }
  ]
});

console.log(response.choices[0].message.content);
```

### 3. 流式响应

```typescript
import * as webllm from '@mlc-ai/web-llm';

const engine = new webllm.MLCEngine();
await engine.reload('Llama-3-8B-Instruct-q4f16_1-MLC');

// 流式生成
const stream = await engine.chat.completions.create({
  messages: [
    { role: 'user', content: '写一首关于前端开发的诗' }
  ],
  stream: true
});

// 逐 token 接收
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  process.stdout.write(content);
}
```

### 4. 多轮对话

```typescript
const messages: webllm.ChatCompletionMessageParam[] = [
  { role: 'system', content: '你是一个专业的前端开发助手' }
];

async function chat(userMessage: string) {
  messages.push({ role: 'user', content: userMessage });

  const response = await engine.chat.completions.create({
    messages,
    stream: true
  });

  let assistantMessage = '';
  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content || '';
    assistantMessage += content;
    // 更新 UI
    updateChatUI(content);
  }

  messages.push({ role: 'assistant', content: assistantMessage });
}
```

### 5. Vue 3 集成

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as webllm from '@mlc-ai/web-llm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const engine = ref<webllm.MLCEngine | null>(null);
const loading = ref(false);
const downloading = ref(false);
const downloadProgress = ref(0);
const messages = ref<Message[]>([]);
const inputText = ref('');

// 初始化引擎
onMounted(async () => {
  engine.value = new webllm.MLCEngine({
    initProgressCallback: (report) => {
      downloadProgress.value = report.progress * 100;
      downloading.value = !report.progress || report.progress < 1;
    }
  });

  await engine.value.reload('Llama-3-8B-Instruct-q4f16_1-MLC', {
    temperature: 0.7
  });
});

// 发送消息
async function sendMessage() {
  if (!inputText.value.trim() || !engine.value) return;

  const userMessage = inputText.value;
  messages.value.push({ role: 'user', content: userMessage });
  inputText.value = '';
  loading.value = true;

  messages.value.push({ role: 'assistant', content: '' });

  const stream = await engine.value.chat.completions.create({
    messages: messages.value.map(m => ({
      role: m.role,
      content: m.content
    })),
    stream: true
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    messages.value[messages.value.length - 1].content += content;
  }

  loading.value = false;
}
</script>

<template>
  <div class="chat-container">
    <!-- 模型加载进度 -->
    <div v-if="downloading" class="progress-bar">
      <div :style="{ width: downloadProgress + '%' }"></div>
      <span>模型加载中... {{ downloadProgress.toFixed(1) }}%</span>
    </div>

    <!-- 消息列表 -->
    <div class="messages">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.role]"
      >
        {{ msg.content }}
        <span v-if="loading && index === messages.length - 1" class="cursor">▊</span>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="input-area">
      <input
        v-model="inputText"
        @keyup.enter="sendMessage"
        :disabled="loading || downloading"
        placeholder="输入消息..."
      />
      <button @click="sendMessage" :disabled="loading || downloading">
        发送
      </button>
    </div>
  </div>
</template>
```

## 四、支持的模型

### 1. 模型列表

| 模型 | 参数量 | 量化方式 | 显存需求 | 推荐场景 |
|-----|-------|---------|---------|---------|
| Llama-3-8B | 8B | q4f16 | ~5GB | 通用对话 |
| Llama-3-70B | 70B | q4f16 | ~40GB | 高质量生成 |
| Phi-3-mini | 3.8B | q4f16 | ~3GB | 轻量级任务 |
| Gemma-2B | 2B | q4f16 | ~2GB | 入门体验 |
| Mistral-7B | 7B | q4f16 | ~5GB | 代码生成 |
| Qwen2-7B | 7B | q4f16 | ~5GB | 中文任务 |

### 2. 选择建议

```typescript
// 根据设备能力选择模型
async function selectModel() {
  const gpu = await navigator.gpu?.requestAdapter();

  if (!gpu) {
    console.log('WebGPU 不支持，无法运行本地 LLM');
    return null;
  }

  // 检测显存大小
  const adapterInfo = await gpu.requestAdapterInfo();
  console.log('GPU:', adapterInfo.description);

  // 根据显存选择模型
  // 这里简化处理，实际需要更精确的检测
  return 'Llama-3-8B-Instruct-q4f16_1-MLC';
}
```

## 五、高级功能

### 1. 函数调用（Function Calling）

```typescript
import * as webllm from '@mlc-ai/web-llm';

const engine = new webllm.MLCEngine();
await engine.reload('Llama-3-8B-Instruct-q4f16_1-MLC');

// 定义可用函数
const tools: webllm.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: '获取指定城市的天气信息',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '城市名称'
          }
        },
        required: ['city']
      }
    }
  }
];

// 发起带函数的请求
const response = await engine.chat.completions.create({
  messages: [
    { role: 'user', content: '北京今天天气怎么样？' }
  ],
  tools,
  tool_choice: 'auto'
});

// 处理函数调用
const toolCalls = response.choices[0].message.tool_calls;
if (toolCalls) {
  for (const call of toolCalls) {
    if (call.function.name === 'get_weather') {
      const args = JSON.parse(call.function.arguments);
      const weather = await getWeather(args.city);
      // 将结果返回给模型继续生成
    }
  }
}
```

### 2. RAG 集成

```typescript
import * as webllm from '@mlc-ai/web-llm';

class LocalRAGChat {
  private engine: webllm.MLCEngine;
  private knowledgeBase: string[] = [];

  constructor() {
    this.engine = new webllm.MLCEngine();
  }

  async init(modelId: string) {
    await this.engine.reload(modelId);
  }

  // 添加知识库
  addKnowledge(documents: string[]) {
    this.knowledgeBase.push(...documents);
  }

  // 简单检索
  private search(query: string, topK: number = 3): string[] {
    // 简单的关键词匹配（实际应使用向量检索）
    return this.knowledgeBase
      .map(doc => ({
        doc,
        score: this.calculateRelevance(query, doc)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.doc);
  }

  private calculateRelevance(query: string, doc: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const docWords = doc.toLowerCase().split(/\s+/);
    const matches = queryWords.filter(word => docWords.includes(word));
    return matches.length / queryWords.length;
  }

  // RAG 对话
  async chat(userMessage: string) {
    // 检索相关文档
    const relevantDocs = this.search(userMessage);

    // 构建带上下文的 prompt
    const context = relevantDocs.length > 0
      ? `参考以下信息回答问题：\n${relevantDocs.join('\n---\n')}\n\n`
      : '';

    const response = await this.engine.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: '你是一个知识库助手。' + context
        },
        { role: 'user', content: userMessage }
      ],
      stream: true
    });

    return response;
  }
}
```

### 3. Embedding 支持

```typescript
import * as webllm from '@mlc-ai/web-llm';

const engine = new webllm.MLCEngine();
await engine.reload('e5-mistral-7b-instruct-q0f16-MLC');

// 获取文本嵌入向量
async function getEmbedding(text: string): Promise<number[]> {
  const response = await engine.embeddings.create({
    model: 'e5-mistral-7b-instruct-q0f16-MLC',
    input: text
  });

  return response.data[0].embedding;
}

// 计算余弦相似度
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// 使用示例
const embedding1 = await getEmbedding('前端开发');
const embedding2 = await getEmbedding('Web 开发');
const embedding3 = await getEmbedding('机器学习');

console.log('前端 vs Web:', cosineSimilarity(embedding1, embedding2)); // 高相似度
console.log('前端 vs ML:', cosineSimilarity(embedding1, embedding3)); // 低相似度
```

## 六、性能优化

### 1. 模型缓存

```typescript
// WebLLM 自动使用 IndexedDB 缓存模型
// 首次加载后，后续访问直接从缓存读取

const engine = new webllm.MLCEngine({
  initProgressCallback: (report) => {
    if (report.progress === 1) {
      console.log('模型加载完成（已缓存）');
    } else {
      console.log(`加载进度: ${(report.progress! * 100).toFixed(1)}%`);
    }
  }
});
```

### 2. KV Cache 优化

```typescript
// WebLLM 自动管理 KV Cache
// 多轮对话时复用之前的计算结果
const messages = [
  { role: 'user', content: '你好' },
  { role: 'assistant', content: '你好！有什么可以帮助你的吗？' },
  { role: 'user', content: '请介绍一下自己' } // 这里会复用前面对话的 KV Cache
];
```

### 3. 采样参数调优

```typescript
const response = await engine.chat.completions.create({
  messages: [{ role: 'user', content: '写一段代码' }],
  temperature: 0.7,    // 控制随机性，0-2，越低越确定
  top_p: 0.9,          // nucleus sampling，0-1
  max_tokens: 1000,    // 最大生成 token 数
  frequency_penalty: 0, // 频率惩罚，减少重复
  presence_penalty: 0   // 存在惩罚，鼓励新话题
});
```

## 七、限制与注意事项

### 1. 硬件要求

- **WebGPU 支持**：需要 Chrome 113+ 或 Edge 113+
- **显存需求**：至少 4GB GPU 显存（8B 模型）
- **内存需求**：至少 8GB 系统内存

### 2. 性能限制

| 设备类型 | 8B 模型速度 | 13B 模型速度 |
|---------|-----------|-------------|
| 高端 GPU (RTX 4090) | ~50 tok/s | ~25 tok/s |
| 中端 GPU (RTX 3060) | ~25 tok/s | ~12 tok/s |
| 集成显卡 | ~8 tok/s | 不推荐 |

### 3. 模型大小

```typescript
// 模型下载大小参考
const modelSizes: Record<string, string> = {
  'Llama-3-8B-q4f16': '~4.5 GB',
  'Llama-3-70B-q4f16': '~38 GB',
  'Phi-3-mini-q4f16': '~2.3 GB',
  'Qwen2-7B-q4f16': '~4.2 GB'
};
```

## 八、参考链接

- [WebLLM 官方文档](https://webllm.mlc.ai/)
- [MLC-LLM](https://llm.mlc.ai/)
- [WebLLM GitHub](https://github.com/mlc-ai/web-llm)
