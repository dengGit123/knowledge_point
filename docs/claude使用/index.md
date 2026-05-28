# Claude Code 使用指南

> Claude Code 是 Anthropic 官方的 Claude CLI 工具，让开发者能在终端中直接与 Claude 协作完成编程任务。

## 快速开始

### 安装

```bash
npm install -g @anthropic-ai/claude-code
```

### 首次运行

```bash
claude
```

首次运行会引导你完成：
1. API 密钥配置
2. 基础设置
3. 编辑器选择

### 第一个命令

```
帮我创建一个简单的 HTML 文件
```

## 目录

- [基础命令](#基础命令)
- [核心功能](#核心功能)
- [配置系统](#配置系统)
- [最佳实践](#最佳实践)

## 基础命令

### 常用内置命令

| 命令 | 说明 |
|------|------|
| `/help` | 显示所有可用命令 |
| `/fast` | 切换快速模式（使用 Sonnet 模型） |
| `/config` | 打开配置界面 |
| `/clear` | 清除对话历史 |
| `/exit` | 退出程序 |

### 交互技巧

- **直接描述任务**：用自然语言说明你想做什么
- **指定文件**：直接提到文件名，Claude 会自动定位
- **确认操作**：重要操作会先请求确认

## 核心功能

### 1. 文件操作

```bash
# 读取文件
查看 package.json 的内容

# 编辑文件
把所有 console.log 改成 logger.info

# 创建文件
创建一个 utils/helper.js 文件

# 批量操作
将所有 .js 文件的 console.log 删除
```

### 2. Git 集成

```bash
# 查看状态
显示 git 状态

# 提交更改
提交当前的更改，消息是 "feat: 添加用户认证"

# 创建 PR
为当前分支创建 PR

# 查看 diff
显示 src 目录的修改
```

### 3. 代码分析

```bash
# 解释代码
解释 src/auth.js 中的登录逻辑

# 查找问题
检查是否有内存泄漏

# 重构建议
这段代码如何优化？

# 性能分析
分析为什么页面加载很慢
```

### 4. 测试与调试

```bash
# 运行测试
运行所有测试并修复失败

# 调试问题
这个函数为什么会返回 undefined

# 错误追踪
根据错误日志找出问题原因
```

## 配置系统

Claude Code 使用多层级配置系统，让你可以在不同范围设置规则：

### 配置文件结构

```
全局配置 (~/.claude/)
├── settings.json          # 全局默认设置
├── keybindings.json       # 快捷键配置
├── themes/               # 主题文件
└── agents/               # 全局子代理

项目配置 (项目/.claude/)
├── CLAUDE.md             # 项目级规则
├── settings.json         # 项目设置
├── settings.local.json   # 个人本地设置
├── .mcp.json             # 团队 MCP 服务器
├── commands/             # 自定义命令
├── skills/               # 可重用技能
├── rules/                # 路径相关规则
├── memory/               # 记忆存储
└── output-styles/        # 输出风格
```

### 配置优先级

```
settings.local.json (最高)
        ↓
  settings.json
        ↓
~/.claude.json (settings)
        ↓
全局 settings.json (最低)
```

## 配置文件说明

### 项目级配置

| 文件/目录 | 作用 | 是否提交 |
|-----------|------|----------|
| [CLAUDE.md](./CLAUDE文件使用说明.md) | 项目规则和约定 | ✅ 应提交 |
| [settings.json](./settings配置使用说明.md) | 项目权限和设置 | ✅ 应提交 |
| settings.local.json | 个人配置覆盖 | ❌ 不提交 |
| [.mcp.json](./mcp配置使用说明.md) | 团队 MCP 服务器 | ✅ 应提交 |

### 全局配置

| 文件/目录 | 作用 | 是否提交 |
|-----------|------|----------|
| [~/.claude.json](./claude配置使用说明.md) | 个人 API 密钥和偏好 | ❌ 不提交 |
| [keybindings.json](./keybindings配置使用说明.md) | 快捷键配置 | ❌ 不提交 |
| [themes/](./主题使用说明.md) | 自定义主题 | ❌ 不提交 |

### 功能目录

| 目录 | 作用 | 说明 |
|------|------|------|
| [commands/](./commands目录使用说明.md) | 自定义命令 | 简单快捷指令 |
| [skills/](./skills目录使用说明.md) | 可重用技能 | 复杂工作流程 |
| [agents/](./agents目录使用说明.md) | 子代理 | 专业化任务处理 |
| [rules/](./rules目录使用说明.md) | 路径规则 | 特定文件的编码规范 |
| [memory/](./memory目录使用说明.md) | 记忆系统 | 跨会话信息存储 |
| [output-styles/](./output-styles目录使用说明.md) | 输出风格 | 控制响应格式 |

## 进阶功能

### Agent 体系

Claude Code 可以调用专门的子代理处理特定任务：

```
# 代码审查
帮我审查 src/auth.ts 的代码

# 性能分析
分析这段代码的性能问题

# 安全审计
检查代码中的安全漏洞
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
- **IDE 选区**：在编辑器中选中代码可直接传递上下文

## 常见工作流

### Bug 修复流程

```
1. 定位问题
   在 auth 模块查找登录失败的原因

2. 分析代码
   查看 login 函数的实现

3. 修复问题
   添加错误处理

4. 测试验证
   运行相关测试

5. 提交更改
   创建修复提交
```

### 新功能开发

```
1. 需求分析
   实现用户头像上传功能

2. 设计方案
   设计 API 接口和组件结构

3. 编写代码
   创建上传组件和 API 路由

4. 测试
   手动测试和单元测试

5. 文档
   更新 README
```

### 代码重构

```
1. 分析现状
   分析当前代码结构

2. 制定计划
   规划重构步骤

3. 执行重构
   逐步重构代码

4. 验证
   确保测试通过

5. 提交
   创建重构 PR
```

## 最佳实践

### 1. 明确描述

清晰说明你的需求和约束条件：

```
# ✅ 好的描述
创建一个用户登录组件，使用 TypeScript，包含邮箱和密码字段，提交时验证格式

# ❌ 不好的描述
做一个登录
```

### 2. 小步迭代

复杂任务拆分成多个小步骤：

```
# 第一步：创建基础组件
创建一个 Login 组件，包含邮箱和密码输入框

# 第二步：添加验证
添加表单验证，邮箱格式检查，密码最少 8 位

# 第三步：连接 API
实现登录 API 调用
```

### 3. 验证结果

让 Claude 运行测试验证更改：

```
修改完代码后，运行测试确保没有破坏现有功能
```

### 4. 阅读代码

重要更改要 review Claude 修改的代码：

```
先告诉我你要做哪些修改，然后再执行
```

### 5. 使用配置

善用配置文件提高效率：

```
# 在 CLAUDE.md 中定义项目规则
# 使用 commands/ 定义常用命令
# 使用 skills/ 定义复杂流程
```

## 相关资源

- [GitHub 仓库](https://github.com/anthropics/claude-code)
- [问题反馈](https://github.com/anthropics/claude-code/issues)
- [官方文档](https://claude.ai/code)

## 配置文件索引

详细配置说明请参考各文件：

1. [CLAUDE.md 使用说明](./CLAUDE文件使用说明.md) - 项目级规则
2. [MEMORY.md 使用说明](./MEMORY文件使用说明.md) - 记忆索引
3. [agents/ 目录说明](./agents目录使用说明.md) - 子代理配置
4. [claude 配置说明](./claude配置使用说明.md) - 全局配置
5. [commands/ 目录说明](./commands目录使用说明.md) - 自定义命令
6. [keybindings 配置说明](./keybindings配置使用说明.md) - 快捷键
7. [mcp 配置说明](./mcp配置使用说明.md) - MCP 服务器
8. [memory/ 目录说明](./memory目录使用说明.md) - 记忆系统
9. [output-styles/ 目录说明](./output-styles目录使用说明.md) - 输出风格
10. [rules/ 目录说明](./rules目录使用说明.md) - 路径规则
11. [settings 配置说明](./settings配置使用说明.md) - 项目设置
12. [skills/ 目录说明](./skills目录使用说明.md) - 可重用技能
13. [worktree 配置说明](./worktree配置使用说明.md) - Git worktree
14. [主题使用说明](./主题使用说明.md) - 自定义主题
