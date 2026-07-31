# AI 辅助开发工具

## 一、概述

AI 辅助开发工具是利用人工智能技术辅助程序员进行软件开发的工具，能够自动补全代码、生成代码片段、解释代码、修复 Bug、生成测试等，大幅提升开发效率。

## 二、主流 AI 编码工具对比

| 工具 | 类型 | 核心特点 | 适用场景 |
|-----|------|---------|---------|
| GitHub Copilot | IDE 插件 | 代码补全、多语言支持 | 日常编码、代码补全 |
| Cursor | 独立 IDE | AI 优先、多模型支持 | 代码编辑、重构 |
| Claude Code | CLI 工具 | 复杂任务、代码审查 | 架构设计、代码审查 |
| Windsurf | 独立 IDE | 流式协作、Agent 模式 | 协作开发、Agent 任务 |
| Tabnine | IDE 插件 | 本地模型、隐私优先 | 企业环境、隐私敏感 |
| Codeium | IDE 插件 | 免费、多 IDE 支持 | 个人开发者、多 IDE |

## 三、GitHub Copilot

### 1. 简介

GitHub Copilot 是由 GitHub 和 OpenAI 联合开发的 AI 编程助手，基于 GPT 模型训练，支持多种编程语言和 IDE。

### 2. 安装与使用

```bash
# VS Code 扩展安装
# 在 VS Code 扩展市场搜索 "GitHub Copilot" 安装
```

### 3. 核心功能

#### 代码补全

```typescript
// 输入注释，Copilot 自动生成代码
// 计算两个日期之间的天数差
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.round(diffMs / oneDay);
}
```

#### 代码生成

```typescript
// 输入函数签名，生成完整实现
interface User {
  id: number;
  name: string;
  email: string;
}

// 根据接口生成 CRUD 操作
async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!response.ok) throw new Error('创建用户失败');
  return response.json();
}
```

#### 测试生成

```typescript
// 为以下函数生成测试
function calculateDiscount(price: number, discountPercent: number): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('折扣百分比必须在 0-100 之间');
  }
  return price * (1 - discountPercent / 100);
}

// Copilot 生成的测试
describe('calculateDiscount', () => {
  it('应该正确计算折扣价格', () => {
    expect(calculateDiscount(100, 20)).toBe(80);
    expect(calculateDiscount(50, 10)).toBe(45);
  });

  it('边界值：0% 折扣', () => {
    expect(calculateDiscount(100, 0)).toBe(100);
  });

  it('边界值：100% 折扣', () => {
    expect(calculateDiscount(100, 100)).toBe(0);
  });

  it('无效折扣应抛出错误', () => {
    expect(() => calculateDiscount(100, -10)).toThrow();
    expect(() => calculateDiscount(100, 110)).toThrow();
  });
});
```

### 4. Copilot Chat

```typescript
// 使用自然语言描述需求，Copilot 生成代码
// "创建一个 Vue 3 组件，实现可编辑的表格，支持添加、删除、编辑行"

// Copilot 生成的组件
import { ref, computed } from 'vue';

interface TableRow {
  id: number;
  name: string;
  age: number;
  editable?: boolean;
}

const rows = ref<TableRow[]>([
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 }
]);

const editingId = ref<number | null>(null);
const editForm = ref<Partial<TableRow>>({});

const startEdit = (row: TableRow) => {
  editingId.value = row.id;
  editForm.value = { ...row };
};

const saveEdit = () => {
  const index = rows.value.findIndex(r => r.id === editingId.value);
  if (index !== -1) {
    rows.value[index] = { ...rows.value[index], ...editForm.value };
  }
  cancelEdit();
};

const cancelEdit = () => {
  editingId.value = null;
  editForm.value = {};
};

const addRow = () => {
  const newId = Math.max(...rows.value.map(r => r.id), 0) + 1;
  rows.value.push({ id: newId, name: '', age: 0, editable: true });
};

const deleteRow = (id: number) => {
  rows.value = rows.value.filter(r => r.id !== id);
};
```

## 四、Cursor

### 1. 简介

Cursor 是一款以 AI 为核心的独立 IDE，基于 VS Code 构建，提供深度集成的 AI 编程体验。

### 2. 核心功能

#### Composer（多文件编辑）

```typescript
// 使用 Composer 同时编辑多个文件
// 指令："创建一个用户认证系统，包含登录、注册、token 管理"

// ===== auth/types.ts =====
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

// ===== auth/storage.ts =====
import { AuthTokens } from './types';

const TOKEN_KEY = 'auth_tokens';

export const tokenStorage = {
  get(): AuthTokens | null {
    const data = localStorage.getItem(TOKEN_KEY);
    return data ? JSON.parse(data) : null;
  },

  set(tokens: AuthTokens): void {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  },

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  isExpired(): boolean {
    const tokens = this.get();
    if (!tokens) return true;
    return Date.now() > tokens.expiresAt;
  }
};

// ===== auth/api.ts =====
import { AuthTokens, LoginCredentials, RegisterData, AuthUser } from './types';

const API_BASE = '/api/auth';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('登录失败');
    return response.json();
  },

  async register(data: RegisterData): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('注册失败');
    return response.json();
  },

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    if (!response.ok) throw new Error('刷新 token 失败');
    return response.json();
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/logout`, { method: 'POST' });
  }
};

// ===== auth/useAuth.ts ===== (Vue Composable)
import { ref, computed } from 'vue';
import { AuthUser } from './types';
import { authApi } from './api';
import { tokenStorage } from './storage';

const currentUser = ref<AuthUser | null>(null);

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const login = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const { user, tokens } = await authApi.login({ email, password });
      tokenStorage.set(tokens);
      currentUser.value = user;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const { user, tokens } = await authApi.register({ name, email, password });
      tokenStorage.set(tokens);
      currentUser.value = user;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    await authApi.logout();
    tokenStorage.clear();
    currentUser.value = null;
  };

  return { currentUser, isAuthenticated, isLoading, error, login, register, logout };
}
```

#### Agent 模式

Cursor 的 Agent 模式可以自主执行多步骤任务：

```
指令："帮我重构这个组件，将 Options API 改为 Composition API，
     添加 TypeScript 类型，并优化性能"
```

## 五、Claude Code

### 1. 简介

Claude Code 是 Anthropic 推出的命令行 AI 编程工具，擅长处理复杂的编程任务和代码审查。

### 2. 使用方式

```bash
# 安装
npm install -g @anthropic-ai/claude-code

# 使用
claude
```

### 3. 核心能力

- **代码理解**：深度理解大型代码库
- **重构**：智能重构建议与执行
- **调试**：分析错误并提供修复方案
- **文档**：自动生成技术文档
- **测试**：生成单元测试和集成测试

## 六、AI 编程最佳实践

### 1. 写好 Prompt

```typescript
// ❌ 模糊的 Prompt
// "写一个排序函数"

// ✅ 清晰的 Prompt
// "实现一个泛型排序函数，支持：
//  1. 升序/降序排列
//  2. 自定义比较器
//  3. 支持对象数组按指定属性排序
//  4. 使用 TypeScript 泛型确保类型安全
//  5. 时间复杂度 O(n log n)"
```

### 2. 渐进式使用

```typescript
// 第一步：让 AI 生成基础结构
// "创建一个 Vue 3 的用户管理页面组件"

// 第二步：逐步添加功能
// "添加搜索功能，支持按姓名和邮箱搜索"

// 第三步：优化
// "优化性能，添加虚拟滚动支持大数据量"

// 第四步：添加错误处理
// "添加错误处理和加载状态"
```

### 3. 代码审查

```typescript
// 使用 AI 审查代码时，提供上下文
// "审查以下代码，关注：
//  1. 性能问题
//  2. 安全隐患
//  3. 边界情况处理
//  4. TypeScript 类型安全"
```

### 4. 注意事项

1. **不要盲目信任**：AI 生成的代码需要审查和测试
2. **理解代码**：确保理解 AI 生成的每一行代码
3. **安全审查**：注意 AI 可能生成的安全漏洞
4. **版权问题**：了解 AI 生成代码的版权风险
5. **隐私保护**：不要将敏感代码上传到云端 AI 服务

## 七、参考链接

- [GitHub Copilot 官方文档](https://docs.github.com/en/copilot)
- [Cursor 官方文档](https://docs.cursor.com/)
- [Claude Code 文档](https://docs.anthropic.com/en/docs/claude-code)
