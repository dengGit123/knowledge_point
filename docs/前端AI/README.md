# 前端 AI 技术点

## 一、概述

前端 AI 是指将人工智能能力集成到前端应用中的技术集合，涵盖 AI 辅助开发、浏览器端 AI 推理、AI 应用开发等方向。随着大语言模型（LLM）的快速发展，前端工程师需要掌握的 AI 相关技能也日益丰富。

## 二、文档分类导航

### 基础篇：AI 辅助开发工具
- [AI 辅助开发工具](./AI辅助开发工具.md) — GitHub Copilot、Cursor、Claude Code 等 AI 编码助手的使用与原理

### 核心篇：浏览器端 AI 推理
- [浏览器端 AI 模型](./浏览器端AI模型.md) — TensorFlow.js、ONNX Runtime Web、WebGPU/WebNN 等浏览器内运行 AI 模型的技术
- [WebLLM 与本地推理](./WebLLM与本地推理.md) — 在浏览器中直接运行大语言模型

### 应用篇：AI 应用开发
- [AI 对话界面开发](./AI对话界面开发.md) — 流式响应、Markdown 渲染、代码高亮等对话 UI 实现
- [Vercel AI SDK](./VercelAI-SDK.md) — 使用 Vercel AI SDK 构建 AI 应用
- [AI 状态管理](./AI状态管理.md) — 对话历史、上下文、Token 管理等

### 进阶篇：AI 工程化
- [RAG 前端实现](./RAG前端实现.md) — 检索增强生成的前端实践
- [AI 应用性能优化](./AI应用性能优化.md) — 流式传输、缓存策略、Token 优化
- [AI 安全与防护](./AI安全与防护.md) — Prompt 注入防护、内容安全、敏感信息过滤

## 三、技术栈概览

```
┌─────────────────────────────────────────────────────┐
│                   前端 AI 技术栈                      │
├─────────────────┬───────────────────────────────────┤
│  AI 辅助开发     │ Copilot / Cursor / Claude Code    │
├─────────────────┼───────────────────────────────────┤
│  浏览器 AI 推理  │ TensorFlow.js / ONNX / WebGPU     │
├─────────────────┼───────────────────────────────────┤
│  AI 应用开发     │ Vercel AI SDK / LangChain.js      │
├─────────────────┼───────────────────────────────────┤
│  AI UI 组件     │ 流式渲染 / Markdown / 代码高亮     │
├─────────────────┼───────────────────────────────────┤
│  AI 工程化      │ RAG / 向量数据库 / 性能优化        │
└─────────────────┴───────────────────────────────────┘
```

## 四、学习路径

### 入门路径
1. 先掌握 **AI 辅助开发工具** 提升日常开发效率
2. 学习 **AI 对话界面开发** 了解 AI 应用的基本形态
3. 使用 **Vercel AI SDK** 快速构建 AI 应用

### 进阶路径
1. 深入了解 **浏览器端 AI 推理** 实现端侧智能
2. 掌握 **RAG 前端实现** 构建知识库应用
3. 学习 **AI 应用性能优化** 提升用户体验

### 高级路径
1. 研究 **WebLLM 与本地推理** 实现完全本地的 AI 体验
2. 深入 **AI 安全与防护** 构建可信赖的 AI 应用

## 五、参考资源

- [Vercel AI SDK 官方文档](https://sdk.vercel.ai/docs)
- [TensorFlow.js 官方文档](https://www.tensorflow.org/js)
- [Transformers.js](https://huggingface.co/docs/transformers.js)
- [WebLLM](https://webllm.mlc.ai/)
- [LangChain.js](https://js.langchain.com/)
