---
name: avoid-react-in-docs
description: 文档中禁止使用 React 技术栈示例
metadata:
  type: feedback
---

## 规则

**生成文档时禁止使用 React 技术栈示例**

## Why

用户项目技术栈明确只包含 JavaScript、TypeScript、Vue、Vite、Webpack，不包含 React。生成 React 示例会造成困惑和不一致。

## How to apply

在编写任何代码示例或文档时：

1. **主应用优先使用 Vue3 + Vite**
2. **子应用使用 Vue2/Vue3**，展示版本兼容性
3. **如需展示多框架集成**，仅做理论说明，不提供完整 React 代码
4. **所有路由示例使用 Vue Router**
5. **所有构建配置使用 vite.config.ts 或 vue.config.js**

**替代方案：** 需要展示多技术栈时，使用 Vue2 + Vue3 的组合替代 "Vue + React"
