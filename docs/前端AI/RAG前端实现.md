# RAG 前端实现

## 一、概述

**RAG（Retrieval-Augmented Generation，检索增强生成）** 是一种结合检索系统和生成模型的技术，通过从外部知识库检索相关信息来增强 AI 的回答质量。前端在 RAG 系统中负责用户交互、向量检索、结果展示等环节。

## 二、RAG 架构

### 整体流程

```
┌─────────────────────────────────────────────────────────────────┐
│                        RAG 系统架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  用户提问 → [前端] → 向量化 → [检索引擎] → 召回相关文档           │
│                                              ↓                   │
│  AI 回答 ← [前端] ← 生成回答 ← [LLM] ← 组装 Prompt              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  前端职责：                                                       │
│  1. 用户交互界面                                                  │
│  2. 文档上传与管理                                                │
│  3. 向量检索请求                                                  │
│  4. 检索结果展示                                                  │
│  5. 引用来源展示                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 核心组件

| 组件 | 前端/后端 | 职责 |
|-----|----------|------|
| 文档管理 | 前端 + 后端 | 文档上传、分片、索引 |
| 向量数据库 | 后端 | 存储和检索向量 |
| Embedding | 后端/前端 | 文本向量化 |
| 检索引擎 | 后端 | 相似度检索 |
| Prompt 组装 | 后端 | 上下文拼接 |
| 结果展示 | 前端 | 回答 + 引用展示 |

## 三、向量检索基础

### 1. 向量（Embedding）简介

```typescript
// 向量是高维浮点数数组，用于表示文本的语义
const embedding: number[] = [
  0.0234, -0.1567, 0.0891, 0.2341, -0.0987,
  // ... 通常 384、768、1536 维
];

// 文本通过 Embedding 模型转换为向量
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('/api/embedding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  const data = await response.json();
  return data.embedding;
}
```

### 2. 相似度计算

```typescript
// 余弦相似度
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// 欧氏距离
function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));
}

// 点积相似度
function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}
```

### 3. 简单向量检索实现

```typescript
interface VectorDocument {
  id: string;
  text: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

class SimpleVectorStore {
  private documents: VectorDocument[] = [];

  // 添加文档
  addDocument(doc: VectorDocument) {
    this.documents.push(doc);
  }

  // 批量添加文档
  addDocuments(docs: VectorDocument[]) {
    this.documents.push(...docs);
  }

  // 检索相似文档
  search(queryEmbedding: number[], topK: number = 5): VectorDocument[] {
    return this.documents
      .map(doc => ({
        ...doc,
        score: cosineSimilarity(queryEmbedding, doc.embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // 删除文档
  removeDocument(id: string) {
    this.documents = this.documents.filter(doc => doc.id !== id);
  }

  // 清空
  clear() {
    this.documents = [];
  }
}
```

## 四、文档处理

### 1. 文档分片

```typescript
interface TextChunk {
  id: string;
  text: string;
  metadata: {
    source: string;
    startIndex: number;
    endIndex: number;
    chunkIndex: number;
  };
}

// 固定大小分片
function splitByFixedSize(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): TextChunk[] {
  const chunks: TextChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunkText = text.slice(startIndex, endIndex);

    chunks.push({
      id: `chunk_${chunkIndex}`,
      text: chunkText,
      metadata: {
        source: 'document',
        startIndex,
        endIndex,
        chunkIndex
      }
    });

    startIndex += chunkSize - overlap;
    chunkIndex++;
  }

  return chunks;
}

// 按段落分片
function splitByParagraph(text: string, maxChunkSize: number = 1000): TextChunk[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: TextChunk[] = [];
  let currentChunk = '';
  let startIndex = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk) {
      chunks.push({
        id: `chunk_${chunkIndex}`,
        text: currentChunk.trim(),
        metadata: {
          source: 'document',
          startIndex,
          endIndex: startIndex + currentChunk.length,
          chunkIndex
        }
      });
      startIndex += currentChunk.length;
      chunkIndex++;
      currentChunk = '';
    }
    currentChunk += paragraph + '\n\n';
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: `chunk_${chunkIndex}`,
      text: currentChunk.trim(),
      metadata: {
        source: 'document',
        startIndex,
        endIndex: startIndex + currentChunk.length,
        chunkIndex: chunkIndex + 1
      }
    });
  }

  return chunks;
}

// 递归分片（按分隔符优先级）
function recursiveSplit(
  text: string,
  separators: string[] = ['\n\n', '\n', '. ', ' '],
  chunkSize: number = 500
): TextChunk[] {
  if (text.length <= chunkSize) {
    return [{
      id: 'chunk_0',
      text,
      metadata: { source: 'document', startIndex: 0, endIndex: text.length, chunkIndex: 0 }
    }];
  }

  const separator = separators[0];
  const remaining = separators.slice(1);
  const parts = text.split(separator);

  const chunks: TextChunk[] = [];
  let currentChunk = '';
  let position = 0;

  for (const part of parts) {
    if (currentChunk.length + part.length > chunkSize && currentChunk) {
      // 当前块已满，递归处理
      const subChunks = recursiveSplit(currentChunk, remaining, chunkSize);
      chunks.push(...subChunks.map(c => ({
        ...c,
        id: `chunk_${chunks.length}`,
        metadata: { ...c.metadata, startIndex: position - currentChunk.length }
      })));
      currentChunk = '';
    }
    currentChunk += (currentChunk ? separator : '') + part;
  }

  if (currentChunk) {
    chunks.push({
      id: `chunk_${chunks.length}`,
      text: currentChunk,
      metadata: { source: 'document', startIndex: position, endIndex: text.length, chunkIndex: chunks.length }
    });
  }

  return chunks;
}
```

### 2. 文档上传组件

```vue
<script setup lang="ts">
import { ref } from 'vue';

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  chunkCount?: number;
}

const documents = ref<UploadedDocument[]>([]);
const isDragging = ref(false);

// 文件上传
async function handleFileUpload(files: FileList) {
  for (const file of Array.from(files)) {
    const doc: UploadedDocument = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    };
    documents.value.push(doc);

    try {
      // 上传文件
      await uploadDocument(file, (progress) => {
        doc.progress = progress;
      });

      doc.status = 'processing';

      // 处理文件（分片 + 向量化）
      const result = await processDocument(doc.id);
      doc.chunkCount = result.chunkCount;
      doc.status = 'ready';
    } catch (error) {
      doc.status = 'error';
    }
  }
}

// 上传文档
async function uploadDocument(
  file: File,
  onProgress: (progress: number) => void
): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/documents/upload');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress((e.loaded / e.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) resolve();
      else reject(new Error(xhr.statusText));
    };

    xhr.onerror = () => reject(new Error('上传失败'));
    xhr.send(formData);
  });
}

// 处理文档（分片 + 向量化）
async function processDocument(docId: string): Promise<{ chunkCount: number }> {
  const response = await fetch(`/api/documents/${docId}/process`, {
    method: 'POST'
  });
  return response.json();
}

// 删除文档
async function deleteDocument(docId: string) {
  await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
  documents.value = documents.value.filter(d => d.id !== docId);
}

// 拖拽处理
function handleDrop(e: DragEvent) {
  isDragging.value = false;
  if (e.dataTransfer?.files) {
    handleFileUpload(e.dataTransfer.files);
  }
}
</script>

<template>
  <div class="document-manager">
    <!-- 上传区域 -->
    <div
      class="upload-zone"
      :class="{ dragging: isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input
        type="file"
        multiple
        accept=".txt,.pdf,.docx,.md"
        @change="handleFileUpload(($event.target as HTMLInputElement).files!)"
        hidden
        ref="fileInput"
      />
      <button @click="fileInput?.click()">选择文件</button>
      <p>或拖拽文件到此处</p>
    </div>

    <!-- 文档列表 -->
    <div class="document-list">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="document-item"
      >
        <div class="doc-info">
          <span class="doc-name">{{ doc.name }}</span>
          <span class="doc-size">{{ (doc.size / 1024).toFixed(1) }} KB</span>
        </div>
        <div class="doc-status">
          <span v-if="doc.status === 'uploading'">上传中 {{ doc.progress.toFixed(0) }}%</span>
          <span v-else-if="doc.status === 'processing'">处理中...</span>
          <span v-else-if="doc.status === 'ready'">已就绪 ({{ doc.chunkCount }} 片段)</span>
          <span v-else class="error">处理失败</span>
        </div>
        <button @click="deleteDocument(doc.id)">删除</button>
      </div>
    </div>
  </div>
</template>
```

## 五、RAG 对话实现

### 1. RAG 服务

```typescript
// services/ragService.ts

interface RAGRequest {
  query: string;
  topK?: number;
  sessionId?: string;
}

interface RAGResponse {
  answer: string;
  sources: {
    id: string;
    text: string;
    score: number;
    metadata?: Record<string, any>;
  }[];
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
  };
}

class RAGService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/rag') {
    this.baseUrl = baseUrl;
  }

  // 非流式 RAG 问答
  async query(request: RAGRequest): Promise<RAGResponse> {
    const response = await fetch(`${this.baseUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`RAG 请求失败: ${response.statusText}`);
    }

    return response.json();
  }

  // 流式 RAG 问答
  async *streamQuery(
    request: RAGRequest,
    signal?: AbortSignal
  ): AsyncGenerator<{ type: 'source' | 'token' | 'done'; data: any }> {
    const response = await fetch(`${this.baseUrl}/stream-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal
    });

    if (!response.ok) {
      throw new Error(`RAG 请求失败: ${response.statusText}`);
    }

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
          if (data === '[DONE]') {
            yield { type: 'done', data: null };
            return;
          }

          try {
            const parsed = JSON.parse(data);
            yield parsed;
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  }
}

export const ragService = new RAGService();
```

### 2. RAG 对话组件

```vue
<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { ragService } from '@/services/ragService';

interface Source {
  id: string;
  text: string;
  score: number;
  metadata?: Record<string, any>;
}

interface RAGMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: number;
}

const messages = ref<RAGMessage[]>([]);
const inputText = ref('');
const isGenerating = ref(false);
const showSources = ref<Record<string, boolean>>({});
let abortController: AbortController | null = null;

async function sendMessage() {
  if (!inputText.value.trim() || isGenerating.value) return;

  const userMessage: RAGMessage = {
    id: crypto.randomUUID(),
    role: 'user',
    content: inputText.value,
    timestamp: Date.now()
  };
  messages.value.push(userMessage);

  const assistantMessage: RAGMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: '',
    sources: [],
    timestamp: Date.now()
  };
  messages.value.push(assistantMessage);

  const query = inputText.value;
  inputText.value = '';
  isGenerating.value = true;
  abortController = new AbortController();

  try {
    for await (const event of ragService.streamQuery(
      { query, topK: 5 },
      abortController.signal
    )) {
      if (event.type === 'token') {
        assistantMessage.content += event.data;
      } else if (event.type === 'source') {
        assistantMessage.sources = event.data;
      }
      await scrollToBottom();
    }
  } catch (e) {
    if ((e as Error).name !== 'AbortError') {
      assistantMessage.content = '抱歉，发生了错误，请重试。';
    }
  } finally {
    isGenerating.value = false;
    abortController = null;
  }
}

function stopGeneration() {
  abortController?.abort();
}

function toggleSources(messageId: string) {
  showSources.value[messageId] = !showSources.value[messageId];
}

async function scrollToBottom() {
  await nextTick();
  const container = document.querySelector('.messages');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}
</script>

<template>
  <div class="rag-chat">
    <div class="messages">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message', msg.role]"
      >
        <div class="content">{{ msg.content }}<span v-if="isGenerating && msg === messages[messages.length - 1]" class="cursor">▊</span></div>

        <!-- 引用来源 -->
        <div v-if="msg.sources?.length" class="sources">
          <button @click="toggleSources(msg.id)" class="sources-toggle">
            📎 {{ msg.sources.length }} 个参考来源
          </button>
          <div v-if="showSources[msg.id]" class="sources-list">
            <div
              v-for="source in msg.sources"
              :key="source.id"
              class="source-item"
            >
              <div class="source-score">相关度: {{ (source.score * 100).toFixed(0) }}%</div>
              <div class="source-text">{{ source.text }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <textarea
        v-model="inputText"
        @keydown.enter.exact.prevent="sendMessage"
        :disabled="isGenerating"
        placeholder="基于知识库提问..."
      />
      <button v-if="isGenerating" @click="stopGeneration">停止</button>
      <button v-else @click="sendMessage">发送</button>
    </div>
  </div>
</template>
```

## 六、向量数据库集成

### 1. 浏览器端向量数据库

```typescript
// 使用 IndexedDB 存储向量数据
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface VectorDB extends DBSchema {
  documents: {
    key: string;
    value: {
      id: string;
      text: string;
      embedding: number[];
      metadata: Record<string, any>;
    };
    indexes: { 'by-source': string };
  };
}

class BrowserVectorStore {
  private db: IDBPDatabase<VectorDB> | null = null;
  private cache: Map<string, VectorDB['documents']['value']> = new Map();

  async init() {
    this.db = await openDB<VectorDB>('rag-vector-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('documents', { keyPath: 'id' });
        store.createIndex('by-source', 'metadata.source');
      }
    });
  }

  async add(doc: VectorDB['documents']['value']) {
    await this.db!.put('documents', doc);
    this.cache.set(doc.id, doc);
  }

  async addBatch(docs: VectorDB['documents']['value'][]) {
    const tx = this.db!.transaction('documents', 'readwrite');
    await Promise.all([
      ...docs.map(doc => tx.store.put(doc)),
      tx.done
    ]);
    docs.forEach(doc => this.cache.set(doc.id, doc));
  }

  async search(queryEmbedding: number[], topK: number = 5) {
    // 从缓存或数据库获取所有文档
    const allDocs = this.cache.size > 0
      ? Array.from(this.cache.values())
      : await this.db!.getAll('documents');

    return allDocs
      .map(doc => ({
        ...doc,
        score: cosineSimilarity(queryEmbedding, doc.embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async delete(id: string) {
    await this.db!.delete('documents', id);
    this.cache.delete(id);
  }

  async clear() {
    await this.db!.clear('documents');
    this.cache.clear();
  }
}
```

### 2. 使用 Transformers.js 在浏览器端生成 Embedding

```typescript
import { pipeline } from '@xenova/transformers';

class BrowserEmbedding {
  private extractor: any = null;

  async init() {
    this.extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }

  async embed(text: string): Promise<number[]> {
    const output = await this.extractor(text, {
      pooling: 'mean',
      normalize: true
    });
    return Array.from(output.data);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(text => this.embed(text)));
  }
}

// 使用
const embedder = new BrowserEmbedding();
await embedder.init();

const embedding = await embedder.embed('前端 AI 技术');
console.log(embedding.length); // 384
```

## 七、混合检索策略

### 1. 向量检索 + 关键词检索

```typescript
interface SearchResult {
  id: string;
  text: string;
  vectorScore: number;
  keywordScore: number;
  combinedScore: number;
}

class HybridSearch {
  // BM25 关键词检索
  private bm25Search(query: string, documents: any[], topK: number) {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const k1 = 1.5;
    const b = 0.75;

    return documents
      .map(doc => {
        const terms = doc.text.toLowerCase().split(/\s+/);
        const docLength = terms.length;
        const avgDocLength = documents.reduce((sum, d) => sum + d.text.split(/\s+/).length, 0) / documents.length;

        let score = 0;
        for (const term of queryTerms) {
          const tf = terms.filter(t => t === term).length;
          const idf = Math.log(
            (documents.length - documents.filter(d => d.text.toLowerCase().includes(term)).length + 0.5) /
            (documents.filter(d => d.text.toLowerCase().includes(term)).length + 0.5) + 1
          );
          score += idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * docLength / avgDocLength));
        }

        return { ...doc, keywordScore: score };
      })
      .sort((a, b) => b.keywordScore - a.keywordScore)
      .slice(0, topK);
  }

  // 混合检索
  async search(
    query: string,
    queryEmbedding: number[],
    documents: any[],
    topK: number = 5,
    vectorWeight: number = 0.7
  ): Promise<SearchResult[]> {
    // 向量检索
    const vectorResults = documents
      .map(doc => ({
        ...doc,
        vectorScore: cosineSimilarity(queryEmbedding, doc.embedding)
      }))
      .sort((a, b) => b.vectorScore - a.vectorScore)
      .slice(0, topK * 2);

    // 关键词检索
    const keywordResults = this.bm25Search(query, documents, topK * 2);

    // 合并结果
    const resultMap = new Map<string, SearchResult>();

    for (const doc of vectorResults) {
      resultMap.set(doc.id, {
        id: doc.id,
        text: doc.text,
        vectorScore: doc.vectorScore,
        keywordScore: 0,
        combinedScore: doc.vectorScore * vectorWeight
      });
    }

    for (const doc of keywordResults) {
      const existing = resultMap.get(doc.id);
      if (existing) {
        existing.keywordScore = doc.keywordScore;
        existing.combinedScore =
          existing.vectorScore * vectorWeight +
          doc.keywordScore * (1 - vectorWeight);
      } else {
        resultMap.set(doc.id, {
          id: doc.id,
          text: doc.text,
          vectorScore: 0,
          keywordScore: doc.keywordScore,
          combinedScore: doc.keywordScore * (1 - vectorWeight)
        });
      }
    }

    return Array.from(resultMap.values())
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, topK);
  }
}
```

## 八、参考链接

- [LangChain.js - RAG](https://js.langchain.com/docs/tutorials/rag/)
- [LlamaIndex](https://www.llamaindex.ai/)
- [FAISS - 向量检索](https://github.com/facebookresearch/faiss)
- [Chroma - 向量数据库](https://www.trychroma.com/)
