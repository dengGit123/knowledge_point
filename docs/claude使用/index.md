# Claude Code 使用指南

> Claude Code 是 Anthropic 官方的 Claude CLI 工具，让开发者能在终端中直接与 Claude 协作完成编程任务。

## 目录

- [快速开始](#快速开始)
- [基础命令](#基础命令)
- [核心功能](#核心功能)
- [进阶技巧](#进阶技巧)
- [配置与优化](#配置与优化)
- [常见工作流](#常见工作流)

---

## 快速开始

### 安装

```bash
npm install -g @anthropic-ai/claude-code
```

### 首次运行

```bash
claude
```

首次运行会引导你完成 API 密钥配置和基础设置。

### 第一个命令

```
帮我创建一个简单的 HTML 文件
```

---

## 基础命令

### 常用命令

| 命令 | 说明 |
|------|------|
| `/help` | 显示所有可用命令 |
| `/fast` | 切换快速模式（Sonnet 4.6） |
| `/config` | 打开配置界面 |
| `/clear` | 清除对话历史 |
| `/loop` | 设置循环任务 |

### 交互技巧

- **直接描述任务**：用自然语言说明你想做什么
- **指定文件**：可以直接提到文件名，Claude 会自动定位
- **确认操作**：重要操作会先请求确认

---

## 核心功能

### 1. 文件操作

```bash
# 读取文件
查看 package.json 的内容

# 编辑文件
把所有 console.log 改成 logger.info

# 创建文件
创建一个 utils/helper.js 文件
```

### 2. Git 集成

```bash
# 查看状态
显示 git 状态

# 提交更改
提交当前的更改，消息是 "feat: 添加用户认证"

# 创建 PR
为当前分支创建 PR
```

### 3. 代码分析

```bash
# 解释代码
解释 src/auth.js 中的登录逻辑

# 查找问题
检查是否有内存泄漏

# 重构建议
这段代码如何优化？
```

---

## 进阶技巧

### Agent 体系

Claude Code 可以调用专门的子代理处理特定任务：

- **Explore Agent**：快速搜索代码库
- **Plan Agent**：设计实现方案
- **General Agent**：处理复杂多步骤任务

```bash
# 使用 Agent
搜索所有使用 API 的文件
```

### 并行执行

Claude 会自动识别可并行执行的任务：

```bash
# 这会并行执行
检查所有 TypeScript 文件的类型错误
运行测试并检查代码覆盖率
```

### 上下文管理

- **@ 文件引用**：`@src/app.ts` 引用特定文件
- **# 符号引用**：`#AuthService` 引用符号定义
- **IDE 选区**：在 VSCode 中选中代码可直接传递上下文

---

## 配置与优化

### settings.json

```json
{
  "permissions": {
    "allowed": ["npm install", "npm test"]
  },
  "hooks": {
    "preTool": {
      "Bash": "echo 'Running: %cmd%'"
    }
  }
}
```

### CLAUDE.md

项目级配置文件，定义项目特定的指令：

```markdown
# 项目约定

- 使用 TypeScript 严格模式
- 组件放在 src/components/
- 测试文件使用 .test.ts 后缀
```

### 键位绑定

```json
{
  "submit": "ctrl+enter",
  "cancel": "escape"
}
```

---

## 常见工作流

### 1. Bug 修复流程

```
1. 定位问题：在 auth 模块查找登录失败的原因
2. 分析代码：查看 login 函数的实现
3. 修复问题：添加错误处理
4. 测试验证：运行相关测试
5. 提交更改：创建修复提交
```

### 2. 新功能开发

```
1. 需求分析：实现用户头像上传功能
2. 设计方案：设计 API 接口和组件结构
3. 编写代码：创建上传组件和 API 路由
4. 测试：手动测试和单元测试
5. 文档：更新 README
```

### 3. 代码重构

```
1. 分析现状：分析当前代码结构
2. 制定计划：规划重构步骤
3. 执行重构：逐步重构代码
4. 验证：确保测试通过
5. 提交：创建重构 PR
```

---

## 最佳实践

1. **明确描述**：清晰说明你的需求和约束条件
2. **小步迭代**：复杂任务拆分成多个小步骤
3. **验证结果**：让 Claude 运行测试验证更改
4. **阅读代码**：重要更改要 review Claude 修改的代码
5. **使用 Plan**：复杂任务先用 Plan 模式设计方案

---

## 相关资源

- [GitHub 仓库](https://github.com/anthropics/claude-code)
- [问题反馈](https://github.com/anthropics/claude-code/issues)
- [官方文档](https://claude.ai/code)
