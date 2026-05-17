# WMS/MES 前端架构实现文档

## 文档说明

本文档详细描述基于「基座私有底座 + 插件化业务模块 + AI 编码流水线 + 低代码运行引擎」架构的前端实现方案。

---

## 目录

- [一、整体架构设计](#一整体架构设计)
- [二、技术选型](#二技术选型)
- [三、项目目录结构](#三项目目录结构)
- [四、基座层实现](#四基座层实现)
- [五、业务插件实现](#五业务插件实现)
- [六、低代码引擎实现](#六低代码引擎实现)
- [七、AI 代码生成规范](#七ai-代码生成规范)
- [八、定制插件开发流程](#八定制插件开发流程)
- [九、独立开发与调试](#九独立开发与调试)
- [十、打包与部署](#十打包与部署)
- [十一、源码权限管控](#十一源码权限管控)
- [十二、最佳实践](#十二最佳实践)

---

## 一、整体架构设计

### 1.1 架构分层图

```
┌─────────────────────────────────────────────────────────────────────┐
│                              用户浏览器                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          主应用（基座层）                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                        微前端调度中心                          │  │
│  │  • qiankun 微前端框架                                         │  │
│  │  • 应用注册与生命周期管理                                      │  │
│  │  • 路由拦截与分发                                              │  │
│  │  • 应用间通信桥梁                                              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                        低代码渲染引擎                          │  │
│  │  • 动态表单引擎（FormEngine）                                  │  │
│  │  • 动态字段渲染器（FieldRenderer）                             │  │
│  │  • 流程编排引擎（WorkflowEngine）                              │  │
│  │  • 自定义报表引擎（ReportEngine）                              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                        共享能力层                              │  │
│  │  • 全局状态管理（Pinia Store）                                 │  │
│  │  • 事件总线（EventBus）                                        │  │
│  │  • 请求封装（Axios + 拦截器）                                   │  │
│  │  • 权限控制（Permission）                                      │  │
│  │  • 国际化（i18n）                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│      标准业务插件层            │   │      定制业务插件层          │
│  ┌───────────────────────────┐ │   │  ┌───────────────────────────┐ │
│  │ wms-receipt (入库管理)    │ │   │  │ client-a-receipt         │ │
│  │ • 列表页面                 │ │   │  │ • 定制化入库页面         │ │
│  │ • 新增/编辑表单            │ │   │  │ • 扩展字段               │ │
│  │ • 详情查看                 │ │   │  │ • 自定义业务规则         │ │
│  └───────────────────────────┘ │   │  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │   │  ┌───────────────────────────┐ │
│  │ wms-delivery (出库管理)   │ │   │  │ client-b-stock           │ │
│  └───────────────────────────┘ │   │  │ • 定制化库存页面         │ │
│  ┌───────────────────────────┐ │   │  └───────────────────────────┘ │
│  │ wms-stock (库存管理)      │ │   └───────────────────────────────┘
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ wms-check (盘点管理)      │ │
│  └───────────────────────────┘ │
│  ┌───────────────────────────┐ │
│  │ wms-qc (质检管理)         │ │
│  └───────────────────────────┘ │
└───────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        私有 NPM 包层（编译后）                        │
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │
│  │ @wms/ui-kit       │  │ @wms/components   │  │ @wms/utils      │  │
│  │ • 基础组件         │  │ • 业务组件         │  │ • 工具函数       │  │
│  │ • 布局组件         │  │ • 表格组件         │  │ • 格式化       │  │
│  │ • 表单组件         │  │ • 表单组件         │  │ • 校验函数     │  │
│  └───────────────────┘  └───────────────────┘  └─────────────────┘  │
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │
│  │ @wms/form-engine  │  │ @wms/request      │  │ @wms/types      │  │
│  │ • 表单引擎         │  │ • 请求封装         │  │ • 类型定义       │  │
│  │ • 字段渲染器       │  │ • 错误处理         │  │ • 接口类型     │  │
│  │ • 校验器           │  │ • 权限处理         │  │ • 实体类型     │  │
│  └───────────────────┘  └───────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        AI 知识库                                    │
│  • 编码规范                  • 代码模板                              │
│  • 组件规范                  • 业务规则                              │
│  • 接口规范                  • 低代码配置规范                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 架构核心原则

```
┌─────────────────────────────────────────────────────────────────────┐
│  核心设计原则                                                       │
├─────────────────────────────────────────────────────────────────────┤
│  1. 插件独立原则                                                   │
│     • 每个业务插件独立开发、独立打包、独立部署                       │
│     • 插件之间零直接依赖，通信通过事件总线                          │
│                                                                     │
│  2. 基座私有原则                                                   │
│     • 基座代码编译为私有 NPM 包，无源码流出                         │
│     • 基座提供统一能力，所有插件依赖基座                            │
│                                                                     │
│  3. AI 友好原则                                                    │
│     • 代码结构规范化，便于 AI 理解和生成                            │
│     • 提供完整的代码模板和开发规范                                  │
│                                                                     │
│  4. 低代码融合原则                                                 │
│     • AI 生成的代码预留低代码扩展点                                 │
│     • 低代码配置运行时动态渲染                                      │
│                                                                     │
│  5. 权限管控原则                                                   │
│     • 开发人员只能访问负责模块的代码                                │
│     • 定制插件代码隔离，防止源码泄露                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 二、技术选型

### 2.1 技术栈选型表

| 分类 | 技术方案 | 版本 | 说明 |
|------|----------|------|------|
| **微前端框架** | qiankun | ^2.10.0 | 阿里开源，成熟稳定 |
| **前端框架** | Vue | 3.3+ | 组合式 API |
| **开发语言** | TypeScript | 5.0+ | 类型安全 |
| **构建工具** | Vite | 5.0+ | 快速构建 |
| **状态管理** | Pinia | 2.1+ | Vue 官方推荐 |
| **路由管理** | Vue Router | 4.2+ | 路由管理 |
| **UI 组件库** | Element Plus | 2.4+ | 企业级组件库 |
| **HTTP 客户端** | Axios | 1.6+ | 请求封装 |
| **表单引擎** | 自研 | 1.0.0 | 动态表单渲染 |
| **代码规范** | ESLint + Prettier | latest | 代码风格统一 |
| **包管理器** | pnpm | 8.0+ | 节省磁盘空间 |

### 2.2 为什么选择 qiankun

```
┌─────────────────────────────────────────────────────────────────────┐
│  qiankun 优势                                                       │
├─────────────────────────────────────────────────────────────────────┤
│  ✅ 基于 single-spa 封装，API 更友好                                │
│  ✅ HTML Entry 接入方式，接入成本最低                               │
│  ✅ JS 沙箱隔离，避免全局变量污染                                   │
│  ✅ 样式隔离，避免样式冲突                                         │
│  ✅ 完善的生命周期管理                                              │
│  ✅ 预加载支持，提升用户体验                                        │
│  ✅ 社区活跃，生产验证充分                                          │
│  ✅ 与 Vue3 完美兼容                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 三、项目目录结构

### 3.1 完整目录结构

```
wms-mes-frontend/
├── packages/                          # 私有 NPM 包（编译后）
│   ├── ui-kit/                        # UI 组件库
│   ├── form-engine/                   # 表单引擎
│   ├── request/                       # 请求工具
│   └── types/                         # 类型定义
│
├── main/                              # 主应用基座
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.ts
│   │   │
│   │   ├── core/                      # 核心调度中心
│   │   │   ├── micro-app/
│   │   │   │   ├── index.ts           # 微前端配置
│   │   │   │   ├── lifecycles.ts      # 生命周期钩子
│   │   │   │   └── guards.ts          # 路由守卫
│   │   │   └── router/
│   │   │       ├── index.ts
│   │   │       └── routes.ts
│   │   │
│   │   ├── low-code/                 # 低代码引擎
│   │   │   ├── form-engine/
│   │   │   │   ├── FormEngine.vue     # 表单引擎组件
│   │   │   │   ├── FieldRenderer.vue  # 字段渲染器
│   │   │   │   └── validators.ts      # 校验器
│   │   │   ├── workflow/
│   │   │   │   └── WorkflowEngine.vue
│   │   │   └── report/
│   │   │       └── ReportEngine.vue
│   │   │
│   │   ├── shared/                   # 共享能力
│   │   │   ├── bus/
│   │   │   │   └── index.ts          # 事件总线
│   │   │   ├── store/
│   │   │   │   ├── index.ts          # Pinia 配置
│   │   │   │   ├── modules/
│   │   │   │   │   ├── user.ts
│   │   │   │   │   ├── app.ts
│   │   │   │   │   └── permission.ts
│   │   │   │   └── plugins/
│   │   │   │       └── persistence.ts
│   │   │   └── bridge/
│   │   │       └── index.ts          # 通信桥梁
│   │   │
│   │   ├── layouts/                  # 布局组件
│   │   │   ├── BasicLayout.vue
│   │   │   ├── components/
│   │   │   │   ├── AppHeader.vue
│   │   │   │   ├── AppSidebar.vue
│   │   │   │   ├── AppTab.vue
│   │   │   │   └── AppBreadcrumb.vue
│   │   │   └── styles/
│   │   │       └── index.scss
│   │   │
│   │   ├── views/                    # 主应用页面
│   │   │   ├── home/
│   │   │   │   └── index.vue
│   │   │   ├── redirect/
│   │   │   └── error/
│   │   │
│   │   ├── composables/              # 组合式函数
│   │   │   ├── useAuth.ts
│   │   │   ├── usePermission.ts
│   │   │   └── useTable.ts
│   │   │
│   │   ├── utils/                    # 工具函数
│   │   │   ├── request.ts
│   │   │   ├── format.ts
│   │   │   └── validate.ts
│   │   │
│   │   ├── directives/               # 自定义指令
│   │   │   └── permission.ts
│   │   │
│   │   ├── styles/                   # 全局样式
│   │   │   ├── index.scss
│   │   │   ├── variables.scss
│   │   │   └── mixins.scss
│   │   │
│   │   └── assets/                   # 静态资源
│   │       ├── images/
│   │       ├── icons/
│   │       └── fonts/
│   │
│   ├── .env.development
│   ├── .env.production
│   ├── .eslintrc.cjs
│   ├── .prettierrc.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── index.html
│   └── package.json
│
├── plugins/                           # 业务插件目录
│   ├── receipt/                       # 入库管理插件
│   │   ├── src/
│   │   │   ├── main.ts                # 插件入口
│   │   │   ├── App.vue
│   │   │   ├── config.ts              # 插件配置
│   │   │   │
│   │   │   ├── pages/                 # 页面组件
│   │   │   │   ├── List.vue           # 列表页
│   │   │   │   ├── Create.vue         # 新建页
│   │   │   │   ├── Edit.vue           # 编辑页
│   │   │   │   └── Detail.vue         # 详情页
│   │   │   │
│   │   │   ├── components/            # 业务组件
│   │   │   │   ├── ReceiptForm.vue
│   │   │   │   ├── ReceiptTable.vue
│   │   │   │   └── ReceiptStatus.vue
│   │   │   │
│   │   │   ├── api/                   # API 接口
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── types/                 # 类型定义
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── composables/           # 组合式函数
│   │   │   │   ├── useReceipt.ts
│   │   │   │   └── useReceiptForm.ts
│   │   │   │
│   │   │   └── constants/             # 常量定义
│   │   │       └── index.ts
│   │   │
│   │   ├── public/
│   │   ├── .env.development
│   │   ├── .env.production
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── delivery/                      # 出库管理插件
│   │   └── (结构同 receipt)
│   │
│   ├── stock/                         # 库存管理插件
│   │   └── (结构同 receipt)
│   │
│   ├── check/                         # 盘点管理插件
│   │   └── (结构同 receipt)
│   │
│   └── custom/                        # 定制插件
│       ├── client-a/                  # 客户 A 定制
│       │   ├── receipt/               # 定制入库
│       │   │   ├── src/
│       │   │   │   ├── main.ts
│       │   │   │   ├── config.ts
│       │   │   │   └── pages/
│       │   │   │       └── CustomCreate.vue
│       │   │   └── package.json
│       │   │
│       │   └── stock/                 # 定制库存
│       │
│       └── client-b/                  # 客户 B 定制
│           └── ...
│
├── ai-knowledge-base/                 # AI 知识库
│   ├── conventions/                   # 编码规范
│   │   ├── vue-component-spec.md
│   │   ├── typescript-spec.md
│   │   └── api-spec.md
│   │
│   ├── templates/                     # 代码模板
│   │   ├── plugin-template/
│   │   │   ├── main.ts.template
│   │   │   ├── config.ts.template
│   │   │   └── page-template.vue
│   │   │
│   │   └── component-template/
│   │       └── form-template.vue
│   │
│   └── prompts/                       # AI 提示词模板
│       ├── create-plugin.md
│       ├── create-page.md
│       └── optimize-code.md
│
├── scripts/                           # 脚本工具
│   ├── build.js                       # 构建脚本
│   ├── dev.js                         # 开发脚本
│   └── sync-plugins.js                # 插件同步脚本
│
├── .npmrc
├── .gitignore
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.json
└── README.md
```

### 3.2 pnpm 工作空间配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'main'
  - 'plugins/*'
  - 'packages/*'
```

---

## 四、基座层实现

### 4.1 主应用入口

```typescript
// main/src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './styles/index.scss';

import App from './App.vue';
import router from './core/router';
import { registerMicroApps } from './core/micro-app';

// 创建应用实例
const app = createApp(App);

// 注册 Pinia
const pinia = createPinia();
app.use(pinia);

// 注册路由
app.use(router);

// 注册 Element Plus
app.use(ElementPlus);

// 注册微前端应用
registerMicroApps(app);

// 挂载应用
app.mount('#app');
```

### 4.2 微前端配置

```typescript
// main/src/core/micro-app/index.ts
import { registerMicroApps, start, initGlobalState } from 'qiankun';
import type { MicroApp } from './types';
import { eventBus } from '@/shared/bus';
import { useUserStore } from '@/shared/store/modules/user';

// 微应用配置（可从后端动态获取）
export const microApps: MicroApp[] = [
  {
    name: 'wms-receipt',
    entry: '/plugins/receipt/',
    container: '#subapp-container',
    activeRule: '/wms/receipt',
    props: {
      baseRoute: '/wms/receipt',
      apiKey: 'receipt-api'
    }
  },
  {
    name: 'wms-delivery',
    entry: '/plugins/delivery/',
    container: '#subapp-container',
    activeRule: '/wms/delivery',
    props: {
      baseRoute: '/wms/delivery',
      apiKey: 'delivery-api'
    }
  },
  {
    name: 'wms-stock',
    entry: '/plugins/stock/',
    container: '#subapp-container',
    activeRule: '/wms/stock',
    props: {
      baseRoute: '/wms/stock',
      apiKey: 'stock-api'
    }
  },
  {
    name: 'wms-check',
    entry: '/plugins/check/',
    container: '#subapp-container',
    activeRule: '/wms/check',
    props: {
      baseRoute: '/wms/check',
      apiKey: 'check-api'
    }
  }
];

// 初始化全局状态
const globalState = initGlobalState({
  token: '',
  userInfo: null,
  currentWarehouse: null,
  permissions: [],
  // 低代码动态配置
  dynamicSchemas: {}
});

// 监听全局状态变化
globalState.onGlobalStateChange((state, prev) => {
  console.log('[主应用] 全局状态变化', state, prev);

  // 同步到 Pinia
  const userStore = useUserStore();
  if (state.token !== prev.token) {
    userStore.setToken(state.token);
  }
  if (state.userInfo !== prev.userInfo) {
    userStore.setUserInfo(state.userInfo);
  }

  // 触发事件总线
  eventBus.emit('global-state:change', state);
}, true);

// 注册微应用
export function registerMicroApps(app: any) {
  registerMicroApps(
    microApps.map(appConfig => ({
      ...appConfig,
      props: {
        ...appConfig.props,
        // 注入主应用能力
        getGlobalState: globalState.getGlobalState,
        setGlobalState: globalState.setGlobalState,
        eventBus,
        router: app.config.globalProperties.$router
      }
    })),
    {
      // 生命周期钩子
      beforeLoad: [
        app => {
          console.log('[主应用] 加载插件:', app.name);
          eventBus.emit('plugin:loading', app.name);

          // 加载插件对应的低代码配置
          loadPluginLowCodeConfig(app.name);
        }
      ],
      beforeMount: [
        app => {
          console.log('[主应用] 挂载插件:', app.name);
          eventBus.emit('plugin:mounting', app.name);
        }
      ],
      afterMount: [
        app => {
          console.log('[主应用] 插件已挂载:', app.name);
          eventBus.emit('plugin:mounted', app.name);
        }
      ],
      beforeUnmount: [
        app => {
          console.log('[主应用] 卸载插件:', app.name);
          eventBus.emit('plugin:unmounting', app.name);
        }
      ],
      afterUnmount: [
        app => {
          console.log('[主应用] 插件已卸载:', app.name);
          eventBus.emit('plugin:unmounted', app.name);
        }
      ]
    }
  );

  // 启动 qiankun
  start({
    sandbox: {
      strictStyleIsolation: false,
      experimentalStyleIsolation: true
    },
    prefetch: 'all',
    singular: false
  });
}

// 加载插件低代码配置
async function loadPluginLowCodeConfig(pluginName: string) {
  try {
    // 从后端获取该插件对应的低代码配置
    const response = await fetch(`/api/low-code/schema/${pluginName}`);
    const schemas = await response.json();

    // 更新全局状态
    globalState.setGlobalState({
      dynamicSchemas: {
        [pluginName]: schemas
      }
    });
  } catch (error) {
    console.error(`加载插件 ${pluginName} 的低代码配置失败:`, error);
  }
}

// 导出全局状态管理
export { globalState };
```

### 4.3 事件总线实现

```typescript
// main/src/shared/bus/index.ts
type EventHandler = (...args: any[]) => void;
type EventMap = Record<string, EventHandler[]>;

/**
 * 事件总线
 * 用于插件间通信和主应用与插件间通信
 */
class EventBus {
  private events: EventMap = {};

  /**
   * 订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   */
  on(event: string, handler: EventHandler): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  /**
   * 取消订阅
   * @param event 事件名称
   * @param handler 事件处理函数
   */
  off(event: string, handler: EventHandler): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  /**
   * 发布事件
   * @param event 事件名称
   * @param args 事件参数
   */
  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`事件处理错误 [${event}]:`, error);
      }
    });
  }

  /**
   * 一次性订阅
   * @param event 事件名称
   * @param handler 事件处理函数
   */
  once(event: string, handler: EventHandler): void {
    const onceHandler = (...args: any[]) => {
      handler(...args);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  /**
   * 清空所有事件
   */
  clear(): void {
    this.events = {};
  }

  /**
   * 清空指定事件的所有处理器
   * @param event 事件名称
   */
  clearEvent(event: string): void {
    delete this.events[event];
  }
}

// 创建全局事件总线实例
export const eventBus = new EventBus();

/**
 * 业务事件定义
 */
export const BusinessEvents = {
  // 入库单事件
  RECEIPT_CREATED: 'receipt:created',
  RECEIPT_UPDATED: 'receipt:updated',
  RECEIPT_DELETED: 'receipt:deleted',
  RECEIPT_APPROVED: 'receipt:approved',
  RECEIPT_REJECTED: 'receipt:rejected',

  // 出库单事件
  DELIVERY_CREATED: 'delivery:created',
  DELIVERY_UPDATED: 'delivery:updated',
  DELIVERY_DELETED: 'delivery:deleted',
  DELIVERY_APPROVED: 'delivery:approved',
  DELIVERY_SHIPPED: 'delivery:shipped',

  // 库存事件
  STOCK_CHANGED: 'stock:changed',
  STOCK_ALERT: 'stock:alert',
  STOCK_LOCKED: 'stock:locked',
  STOCK_UNLOCKED: 'stock:unlocked',

  // 盘点事件
  CHECK_CREATED: 'check:created',
  CHECK_COMPLETED: 'check:completed',
  CHECK_APPROVED: 'check:approved',

  // 自定义字段事件
  CUSTOM_FIELD_CHANGED: 'custom-field:changed',
  CUSTOM_FIELD_ADDED: 'custom-field:added',
  CUSTOM_FIELD_REMOVED: 'custom-field:removed',

  // 插件生命周期事件
  PLUGIN_LOADING: 'plugin:loading',
  PLUGIN_MOUNTING: 'plugin:mounting',
  PLUGIN_MOUNTED: 'plugin:mounted',
  PLUGIN_UNMOUNTING: 'plugin:unmounting',
  PLUGIN_UNMOUNTED: 'plugin:unmounted',

  // 全局状态事件
  GLOBAL_STATE_CHANGE: 'global-state:change',
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout'
} as const;

export type BusinessEvent = typeof BusinessEvents[keyof typeof BusinessEvents];
```

### 4.4 主应用路由配置

```typescript
// main/src/core/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/home',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页',
          icon: 'Home',
          keepAlive: true
        }
      },
      // 微应用路由占位
      {
        path: '/wms/:plugin/:pathMatch(.*)*',
        name: 'MicroApp',
        component: () => import('@/views/micro-app/index.vue'),
        meta: {
          title: '业务应用',
          keepAlive: false
        }
      }
    ]
  },
  {
    path: '/redirect',
    component: () => import('@/views/redirect/index.vue'),
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth !== false && !token) {
    // 需要认证但未登录，跳转登录页
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  } else if (to.path === '/login' && token) {
    // 已登录访问登录页，跳转首页
    next({ path: '/home' });
  } else {
    next();
  }
});

router.afterEach((to) => {
  // 设置页面标题
  document.title = `${to.meta.title || 'WMS/MES 系统'} - 管理平台`;
});

export default router;
```

### 4.5 主应用布局组件

```vue
<!-- main/src/layouts/BasicLayout.vue -->
<template>
  <div class="basic-layout">
    <!-- 侧边栏 -->
    <app-sidebar
      v-model:collapsed="sidebarCollapsed"
      :menus="menus"
    />

    <!-- 主体内容 -->
    <div class="layout-main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- 顶部导航 -->
      <app-header
        :collapsed="sidebarCollapsed"
        @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
      />

      <!-- 标签页 -->
      <app-tab v-model:active-tab="activeTab" :tabs="tabs" />

      <!-- 内容区域 -->
      <div class="layout-content">
        <router-view v-slot="{ Component }">
          <keep-alive :include="keepAliveComponents">
            <component :is="Component" :key="$route.fullPath" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppSidebar from './components/AppSidebar.vue';
import AppHeader from './components/AppHeader.vue';
import AppTab from './components/AppTab.vue';

interface Menu {
  path: string;
  name: string;
  title: string;
  icon?: string;
  children?: Menu[];
}

const route = useRoute();

// 侧边栏折叠状态
const sidebarCollapsed = ref(false);

// 当前激活的标签页
const activeTab = ref(route.fullPath);

// 标签页列表
const tabs = ref<Array<{ path: string; title: string; name: string }>>([]);

// 菜单配置（可从后端动态获取）
const menus = ref<Menu[]>([
  {
    path: '/home',
    name: 'Home',
    title: '首页',
    icon: 'Home'
  },
  {
    path: '/wms',
    name: 'WMS',
    title: '仓储管理',
    icon: 'Warehouse',
    children: [
      {
        path: '/wms/receipt',
        name: 'Receipt',
        title: '入库管理',
        icon: 'Receipt'
      },
      {
        path: '/wms/delivery',
        name: 'Delivery',
        title: '出库管理',
        icon: 'Delivery'
      },
      {
        path: '/wms/stock',
        name: 'Stock',
        title: '库存管理',
        icon: 'Stock'
      },
      {
        path: '/wms/check',
        name: 'Check',
        title: '盘点管理',
        icon: 'Check'
      }
    ]
  }
]);

// 需要缓存的组件
const keepAliveComponents = computed(() => {
  return tabs.value
    .filter(tab => {
      const route = router.resolve(tab.path);
      return route.meta.keepAlive;
    })
    .map(tab => tab.name);
});

// 监听路由变化，更新标签页
watch(
  () => route.fullPath,
  (fullPath) => {
    activeTab.value = fullPath;

    if (route.meta.hidden || route.name === 'Redirect') {
      return;
    }

    const existTab = tabs.value.find(tab => tab.path === fullPath);
    if (!existTab) {
      tabs.value.push({
        path: fullPath,
        title: (route.meta.title as string) || '未知页面',
        name: route.name as string
      });
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.basic-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;

  .layout-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: margin-left 0.3s;

    .layout-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background-color: #f5f7fa;
    }
  }
}
</style>
```

---

## 五、业务插件实现

### 5.1 插件入口配置

```typescript
// plugins/receipt/src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import App from './App.vue';
import { pluginConfig } from './config';
import { setupRouter } from './router';
import { setupApi } from './api';
import type { MicroAppProps } from './types';

let app: any;
let router: any;
let pinia: any;

// qiankun 生命周期钩子
export async function bootstrap() {
  console.log(`[${pluginConfig.name}] 插件启动`);
}

export async function mount(props: MicroAppProps) {
  console.log(`[${pluginConfig.name}] 插件挂载`, props);

  // 创建 Vue 应用实例
  app = createApp(App);

  // 创建 Pinia 实例
  pinia = createPinia();
  app.use(pinia);

  // 注册 Element Plus
  app.use(ElementPlus);

  // 设置路由
  router = setupRouter(props.baseRoute);
  app.use(router);

  // 设置 API
  setupApi(props.apiKey);

  // 注入主应用能力
  app.provide('microProps', props);
  app.provide('globalState', {
    get: props.getGlobalState,
    set: props.setGlobalState
  });
  app.provide('eventBus', props.eventBus);

  // 注册到主应用路由
  props.registerRoutes?.(pluginConfig.routes);

  // 挂载应用
  app.mount(`#${props.container || 'subapp-receipt'}`);
}

export async function unmount() {
  console.log(`[${pluginConfig.name}] 插件卸载`);

  app?.unmount();
  router = null;
  pinia = null;
}

// 独立运行时（开发模式）
if (!window.__POWERED_BY_QIANKUN__) {
  mount({
    container: 'subapp-receipt',
    baseRoute: '/wms/receipt',
    apiKey: 'receipt-api',
    getGlobalState: () => ({}),
    setGlobalState: () => {},
    eventBus: {
      on: () => {},
      off: () => {},
      emit: () => {}
    }
  });
}
```

### 5.2 插件配置文件

```typescript
// plugins/receipt/src/config.ts
import type { PluginConfig, RouteConfig } from './types';

export const pluginConfig: PluginConfig = {
  // 插件基本信息
  name: 'wms-receipt',
  version: '1.0.0',
  displayName: '入库管理',
  description: '入库单管理、入库单审核、入库单查询',

  // 插件路由配置
  routes: [
    {
      path: '/',
      name: 'ReceiptList',
      component: () => import('./pages/List.vue'),
      meta: {
        title: '入库单列表',
        keepAlive: true,
        permission: 'wms:receipt:list'
      }
    },
    {
      path: '/create',
      name: 'ReceiptCreate',
      component: () => import('./pages/Create.vue'),
      meta: {
        title: '新建入库单',
        permission: 'wms:receipt:create'
      }
    },
    {
      path: '/edit/:id',
      name: 'ReceiptEdit',
      component: () => import('./pages/Create.vue'),
      meta: {
        title: '编辑入库单',
        permission: 'wms:receipt:edit'
      }
    },
    {
      path: '/detail/:id',
      name: 'ReceiptDetail',
      component: () => import('./pages/Detail.vue'),
      meta: {
        title: '入库单详情',
        permission: 'wms:receipt:detail'
      }
    }
  ] as RouteConfig[],

  // 依赖的基座包
  dependencies: [
    '@wms/ui-kit',
    '@wms/components',
    '@wms/form-engine',
    '@wms/request',
    '@wms/types'
  ],

  // 低代码扩展点配置
  extensionPoints: {
    // 表单字段扩展点
    receiptFormFields: {
      // 允许用户添加自定义字段
      allowCustomFields: true,
      // 自定义字段存储表
      customFieldsTable: 'receipt_custom_fields',
      // 字段渲染插槽名称
      renderSlot: 'form-items-after',
      // 固定字段（不可修改）
      fixedFields: [
        'receiptNo',
        'warehouseId',
        'supplierId',
        'receiptDate',
        'remark'
      ]
    },

    // 列表列扩展点
    receiptListColumns: {
      // 允许添加自定义列
      allowCustomColumns: true,
      // 固定列（不可修改）
      fixedColumns: [
        'receiptNo',
        'warehouseName',
        'supplierName',
        'receiptDate',
        'status',
        'totalAmount',
        'createdBy'
      ]
    },

    // 列表搜索扩展点
    receiptSearchFields: {
      // 允许添加自定义搜索字段
      allowCustomFields: true,
      // 固定搜索字段
      fixedFields: [
        'receiptNo',
        'warehouseId',
        'supplierId',
        'status',
        'receiptDateRange'
      ]
    }
  },

  // 业务事件配置
  events: {
    // 入库单创建后触发
    created: 'receipt:created',
    // 入库单更新后触发
    updated: 'receipt:updated',
    // 入库单删除后触发
    deleted: 'receipt:deleted',
    // 入库单审核后触发
    approved: 'receipt:approved',
    // 入库单驳回后触发
    rejected: 'receipt:rejected'
  }
};

export default pluginConfig;
```

### 5.3 插件列表页面

```vue
<!-- plugins/receipt/src/pages/List.vue -->
<template>
  <div class="receipt-list-page">
    <!-- 页面工具栏 -->
    <page-toolbar>
      <el-button
        v-permission="'wms:receipt:create'"
        type="primary"
        :icon="Plus"
        @click="handleCreate"
      >
        新建入库单
      </el-button>
      <el-button
        v-permission="'wms:receipt:export'"
        :icon="Download"
        @click="handleExport"
      >
        导出
      </el-button>
    </page-toolbar>

    <!-- 搜索表单 -->
    <search-card
      v-model="searchParams"
      :fields="searchFields"
      :custom-fields="dynamicSearchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <data-table
      v-loading="loading"
      :data="tableData"
      :columns="tableColumns"
      :custom-columns="dynamicColumns"
      :pagination="pagination"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @page-change="handlePageChange"
    >
      <!-- 状态列 -->
      <template #status="{ row }">
        <receipt-status :status="row.status" />
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <el-button
          v-permission="'wms:receipt:detail'"
          link
          type="primary"
          @click="handleView(row)"
        >
          查看
        </el-button>
        <el-button
          v-if="row.status === 'DRAFT'"
          v-permission="'wms:receipt:edit'"
          link
          type="primary"
          @click="handleEdit(row)"
        >
          编辑
        </el-button>
        <el-button
          v-if="row.status === 'DRAFT'"
          v-permission="'wms:receipt:approve'"
          link
          type="success"
          @click="handleApprove(row)"
        >
          审核
        </el-button>
        <el-button
          v-if="row.status === 'DRAFT'"
          v-permission="'wms:receipt:delete'"
          link
          type="danger"
          @click="handleDelete(row)"
        >
          删除
        </el-button>
      </template>
    </data-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Download } from '@element-plus/icons-vue';
import { useReceiptList } from '../composables/useReceiptList';
import { useDynamicFields } from '@/low-code/form-engine/composables/useDynamicFields';
import type { ReceiptItem, SearchParams } from '../types';
import type { ReceiptStatus } from '@wms/types';

// 路由
const router = useRouter();

// 注入主应用能力
const eventBus = inject('eventBus');
const globalState = inject('globalState');

// 列表数据逻辑
const {
  loading,
  tableData,
  pagination,
  searchParams,
  fetchList,
  handleApprove,
  handleDelete
} = useReceiptList();

// 动态字段
const { dynamicSearchFields, dynamicColumns } = useDynamicFields('wms-receipt');

// 搜索字段配置
const searchFields = computed(() => [
  {
    prop: 'receiptNo',
    label: '入库单号',
    type: 'input',
    placeholder: '请输入入库单号'
  },
  {
    prop: 'warehouseId',
    label: '仓库',
    type: 'select',
    options: 'warehouse', // 从字典获取
    placeholder: '请选择仓库'
  },
  {
    prop: 'supplierId',
    label: '供应商',
    type: 'select',
    options: 'supplier',
    placeholder: '请选择供应商'
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '草稿', value: 'DRAFT' },
      { label: '待审核', value: 'PENDING' },
      { label: '已审核', value: 'APPROVED' },
      { label: '已驳回', value: 'REJECTED' }
    ],
    placeholder: '请选择状态'
  },
  {
    prop: 'receiptDateRange',
    label: '入库日期',
    type: 'daterange',
    placeholder: '请选择日期范围'
  }
]);

// 表格列配置
const tableColumns = computed(() => [
  { type: 'selection', width: 55 },
  { prop: 'receiptNo', label: '入库单号', width: 180, sortable: true },
  { prop: 'warehouseName', label: '仓库', width: 120 },
  { prop: 'supplierName', label: '供应商', width: 150 },
  { prop: 'receiptDate', label: '入库日期', width: 120 },
  { prop: 'status', label: '状态', width: 100, slot: true },
  { prop: 'totalAmount', label: '总金额', width: 120, align: 'right' },
  { prop: 'createdBy', label: '创建人', width: 100 },
  { prop: 'createdAt', label: '创建时间', width: 160 },
  { prop: 'action', label: '操作', width: 200, slot: true, fixed: 'right' }
]);

// 选中的行
const selectedRows = ref<ReceiptItem[]>([]);

// 新建入库单
function handleCreate() {
  router.push('/wms/receipt/create');
}

// 编辑入库单
function handleEdit(row: ReceiptItem) {
  router.push(`/wms/receipt/edit/${row.id}`);
}

// 查看详情
function handleView(row: ReceiptItem) {
  router.push(`/wms/receipt/detail/${row.id}`);
}

// 导出
function handleExport() {
  // 导出逻辑
}

// 搜索
function handleSearch(params: SearchParams) {
  Object.assign(searchParams, params);
  pagination.page = 1;
  fetchList();
}

// 重置
function handleReset() {
  searchParams.value = {};
  pagination.page = 1;
  fetchList();
}

// 选择变化
function handleSelectionChange(selection: ReceiptItem[]) {
  selectedRows.value = selection;
}

// 排序变化
function handleSortChange({ prop, order }: { prop: string; order: string }) {
  searchParams.sortField = prop;
  searchParams.sortOrder = order;
  fetchList();
}

// 分页变化
function handlePageChange(page: number, pageSize: number) {
  pagination.page = page;
  pagination.pageSize = pageSize;
  fetchList();
}

// 监听业务事件
onMounted(() => {
  // 监听入库单创建事件
  eventBus?.on('receipt:created', () => {
    fetchList();
  });

  // 监听自定义字段变化事件
  eventBus?.on('custom-field:changed', () => {
    // 重新加载动态字段配置
    fetchList();
  });
});

onUnmounted(() => {
  eventBus?.off('receipt:created');
  eventBus?.off('custom-field:changed');
});

// 初始化加载数据
fetchList();
</script>

<style scoped lang="scss">
.receipt-list-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
```

### 5.4 插件表单页面

```vue
<!-- plugins/receipt/src/pages/Create.vue -->
<template>
  <div class="receipt-create-page">
    <page-card>
      <template #header>
        <div class="page-header">
          <el-page-header @back="handleBack">
            <template #content>
              {{ isEdit ? '编辑入库单' : '新建入库单' }}
            </template>
          </el-page-header>
          <div class="header-actions">
            <el-button @click="handleBack">取消</el-button>
            <el-button
              v-if="!isEdit || formData.status === 'DRAFT'"
              type="primary"
              :loading="submitting"
              @click="handleSubmit"
            >
              保存
            </el-button>
            <el-button
              v-if="!isEdit || formData.status === 'DRAFT'"
              type="success"
              :loading="submitting"
              @click="handleSubmitAndApprove"
            >
              保存并提交审核
            </el-button>
          </div>
        </div>
      </template>

      <!-- 入库单表单 -->
      <receipt-form
        ref="formRef"
        v-model="formData"
        :mode="isEdit ? 'edit' : 'create'"
        :custom-fields="dynamicFormFields"
        @validate="handleFormValidate"
      />

      <!-- 明细表格 -->
      <receipt-detail
        v-model="formData.details"
        :read-only="isEdit && formData.status !== 'DRAFT'"
      />
    </page-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useReceiptForm } from '../composables/useReceiptForm';
import { useDynamicFields } from '@/low-code/form-engine/composables/useDynamicFields';
import type { ReceiptForm, ReceiptDetail } from '../types';

const route = useRoute();
const router = useRouter();

// 注入主应用能力
const eventBus = inject('eventBus');
const globalState = inject('globalState');

// 是否编辑模式
const isEdit = computed(() => !!route.params.id);

// 表单引用
const formRef = ref();

// 表单数据
const formData = reactive<ReceiptForm>({
  receiptNo: '',
  warehouseId: '',
  supplierId: '',
  receiptDate: new Date(),
  status: 'DRAFT',
  remark: '',
  details: [],
  // 自定义字段数据
  customFields: {}
});

// 动态表单字段
const { dynamicFormFields } = useDynamicFields('wms-receipt', 'receiptFormFields');

// 提交中
const submitting = ref(false);

// 表单逻辑
const { validate, submit, getDetail } = useReceiptForm();

// 表单校验
function handleFormValidate(valid: boolean) {
  // 处理校验结果
}

// 返回
function handleBack() {
  router.back();
}

// 提交表单
async function handleSubmit() {
  const valid = await formRef.value?.validate();
  if (!valid) {
    ElMessage.warning('请检查表单填写是否正确');
    return;
  }

  submitting.value = true;
  try {
    await submit(formData);
    ElMessage.success(isEdit.value ? '修改成功' : '创建成功');

    // 触发业务事件
    eventBus?.emit(isEdit.value ? 'receipt:updated' : 'receipt:created', formData);

    handleBack();
  } catch (error) {
    ElMessage.error(error.message || '操作失败');
  } finally {
    submitting.value = false;
  }
}

// 提交并审核
async function handleSubmitAndApprove() {
  await handleSubmit();
  // 调用审核接口
}

// 加载详情
onMounted(async () => {
  if (isEdit.value) {
    const detail = await getDetail(route.params.id as string);
    Object.assign(formData, detail);
  }
});
</script>

<style scoped lang="scss">
.receipt-create-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
```

### 5.5 插件 API 配置

```typescript
// plugins/receipt/src/api/index.ts
import { request } from '@wms/request';
import type {
  ReceiptItem,
  ReceiptDetail,
  ReceiptQueryParams,
  ReceiptForm,
  PageResult
} from '../types';

/**
 * 入库单 API
 */
export const receiptApi = {
  /**
   * 查询入库单列表
   */
  list(params: ReceiptQueryParams): Promise<PageResult<ReceiptItem>> {
    return request.get('/api/wms/receipt/list', { params });
  },

  /**
   * 获取入库单详情
   */
  detail(id: string): Promise<ReceiptDetail> {
    return request.get(`/api/wms/receipt/${id}`);
  },

  /**
   * 创建入库单
   */
  create(data: ReceiptForm): Promise<ReceiptItem> {
    return request.post('/api/wms/receipt', data);
  },

  /**
   * 更新入库单
   */
  update(id: string, data: ReceiptForm): Promise<ReceiptItem> {
    return request.put(`/api/wms/receipt/${id}`, data);
  },

  /**
   * 删除入库单
   */
  delete(id: string): Promise<void> {
    return request.delete(`/api/wms/receipt/${id}`);
  },

  /**
   * 提交审核
   */
  approve(id: string): Promise<void> {
    return request.post(`/api/wms/receipt/${id}/approve`);
  },

  /**
   * 驳回
   */
  reject(id: string, reason: string): Promise<void> {
    return request.post(`/api/wms/receipt/${id}/reject`, { reason });
  },

  /**
   * 获取入库单号
   */
  getReceiptNo(): Promise<string> {
    return request.get('/api/wms/receipt/receipt-no');
  },

  /**
   * 导出入库单
   */
  export(params: ReceiptQueryParams): Promise<Blob> {
    return request.get('/api/wms/receipt/export', {
      params,
      responseType: 'blob'
    });
  }
};

/**
 * 设置 API 基础配置
 */
export function setupApi(apiKey: string) {
  // 可以在这里设置 API 特定配置
  request.defaults.headers['X-API-Key'] = apiKey;
}

export default receiptApi;
```

### 5.6 插件 Vite 配置

```typescript
// plugins/receipt/vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { qiankun } from 'vite-plugin-qiankun';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    qiankun('wms-receipt', {
      useDevMode: true
    })
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@wms': resolve(__dirname, '../../../packages')
    }
  },

  build: {
    lib: {
      entry: './src/main.ts',
      name: 'WmsReceipt',
      formats: ['umd'],
      fileName: 'wms-receipt'
    },

    rollupOptions: {
      output: {
        // 资源文件命名
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        // 代码分割
        manualChunks(id) {
          // node_modules 打包成 vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // 页面组件打包成 pages
          if (id.includes('/pages/')) {
            return 'pages';
          }
          // 组件打包成 components
          if (id.includes('/components/')) {
            return 'components';
          }
        }
      }
    }
  },

  server: {
    port: 5174,
    strictPort: true,
    cors: true,
    origin: 'http://localhost:5174'
  }
});
```

---

## 六、低代码引擎实现

### 6.1 动态表单引擎

```vue
<!-- main/src/low-code/form-engine/FormEngine.vue -->
<template>
  <div class="form-engine">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :disabled="disabled"
    >
      <!-- 固定字段区域 -->
      <template v-for="field in fixedFields" :key="field.prop">
        <form-item
          :field="field"
          :value="formData[field.prop]"
          @update:value="val => formData[field.prop] = val"
        />
      </template>

      <!-- 动态字段插槽 -->
      <template v-if="dynamicFields.length > 0">
        <el-divider>{{ customFieldTitle }}</el-divider>
        <template v-for="field in dynamicFields" :key="field.id">
          <dynamic-field-renderer
            :field="field"
            :value="formData.customFields?.[field.fieldCode]"
            @update:value="val => updateCustomField(field.fieldCode, val)"
          />
        </template>
      </template>

      <!-- 扩展插槽 -->
      <slot name="extension" />
    </el-form>

    <!-- 表单操作 -->
    <slot name="actions" :validate="validate" :reset-form="resetForm" />
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>>()
import { ref, reactive, computed, watch, provide } from 'vue';
import { FormInstance, FormRules } from 'element-plus';
import { useDynamicFields } from './composables/useDynamicFields';
import { useFieldValidation } from './composables/useFieldValidation';
import type { FormField, CustomField } from './types';

interface Props {
  // 固定字段配置
  fixedFields: FormField[];
  // 表单数据
  modelValue: T;
  // 表单校验规则
  rules?: FormRules;
  // 低代码 schema ID
  schemaId?: string;
  // 自定义字段存储 key
  customFieldKey?: string;
  // 标签宽度
  labelWidth?: string | number;
  // 标签位置
  labelPosition?: 'left' | 'right' | 'top';
  // 是否禁用
  disabled?: boolean;
  // 自定义字段标题
  customFieldTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  fixedFields: () => [],
  modelValue: () => ({}) as T,
  rules: () => ({}),
  customFieldKey: 'customFields',
  labelWidth: '120px',
  labelPosition: 'right',
  disabled: false,
  customFieldTitle: '自定义字段'
});

const emit = defineEmits<{
  'update:modelValue': [value: T];
  'validate': [valid: boolean];
}>();

// 表单引用
const formRef = ref<FormInstance>();

// 表单数据
const formData = computed<T>({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 动态字段
const { dynamicFields, loadSchema } = useDynamicFields();

// 字段校验
const { buildRules } = useFieldValidation();

// 表单校验规则
const formRules = computed(() => {
  const rules = { ...props.rules };

  // 为固定字段构建校验规则
  props.fixedFields.forEach(field => {
    if (field.rules) {
      rules[field.prop] = buildRules(field);
    }
  });

  // 为动态字段构建校验规则
  dynamicFields.value.forEach(field => {
    if (field.required) {
      const customFieldKey = `${props.customFieldKey}.${field.fieldCode}`;
      rules[customFieldKey] = buildRules({
        prop: customFieldKey,
        label: field.fieldName,
        required: true,
        rules: field.rules
      });
    }
  });

  return rules;
});

// 加载低代码配置
watch(
  () => props.schemaId,
  (schemaId) => {
    if (schemaId) {
      loadSchema(schemaId);
    }
  },
  { immediate: true }
);

// 更新自定义字段
function updateCustomField(fieldCode: string, value: any) {
  if (!formData.value[props.customFieldKey]) {
    formData.value[props.customFieldKey] = {} as any;
  }
  (formData.value[props.customFieldKey] as any)[fieldCode] = value;
}

// 表单校验
async function validate(): Promise<boolean> {
  try {
    return await formRef.value?.validate();
  } catch {
    return false;
  }
}

// 重置表单
function resetForm() {
  formRef.value?.resetFields();
}

// 清空校验
function clearValidate() {
  formRef.value?.clearValidate();
}

// 向子组件提供表单实例
provide('formEngine', {
  formRef,
  formData,
  validate,
  resetForm,
  clearValidate
});

// 暴露方法
defineExpose({
  validate,
  resetForm,
  clearValidate
});
</script>

<style scoped lang="scss">
.form-engine {
  :deep(.el-divider) {
    margin: 24px 0;
  }
}
</style>
```

### 6.2 动态字段渲染器

```vue
<!-- main/src/low-code/form-engine/FieldRenderer.vue -->
<template>
  <el-form-item
    :label="field.label"
    :prop="field.prop"
    :required="field.required"
    :rules="field.rules"
  >
    <!-- 输入框 -->
    <el-input
      v-if="field.type === 'input'"
      v-model="fieldValue"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      :clearable="true"
      @change="handleChange"
    />

    <!-- 文本域 -->
    <el-input
      v-else-if="field.type === 'textarea'"
      v-model="fieldValue"
      type="textarea"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      :rows="field.rows || 4"
      @change="handleChange"
    />

    <!-- 数字输入框 -->
    <el-input-number
      v-else-if="field.type === 'number'"
      v-model="fieldValue"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      :min="field.min"
      :max="field.max"
      :step="field.step || 1"
      :precision="field.precision"
      @change="handleChange"
    />

    <!-- 选择器 -->
    <el-select
      v-else-if="field.type === 'select'"
      v-model="fieldValue"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      :clearable="true"
      :filterable="field.filterable"
      :multiple="field.multiple"
      @change="handleChange"
    >
      <el-option
        v-for="option in fieldOptions"
        :key="option.value"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </el-select>

    <!-- 远程搜索选择器 -->
    <el-select
      v-else-if="field.type === 'remote-select'"
      v-model="fieldValue"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      :clearable="true"
      :filterable="true"
      :remote="true"
      :remote-method="handleRemoteSearch"
      :loading="remoteLoading"
      @change="handleChange"
    >
      <el-option
        v-for="option in remoteOptions"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>

    <!-- 日期选择器 -->
    <el-date-picker
      v-else-if="field.type === 'date'"
      v-model="fieldValue"
      type="date"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      :clearable="true"
      :value-format="field.valueFormat || 'YYYY-MM-DD'"
      @change="handleChange"
    />

    <!-- 日期范围选择器 -->
    <el-date-picker
      v-else-if="field.type === 'daterange'"
      v-model="fieldValue"
      type="daterange"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      :clearable="true"
      :value-format="field.valueFormat || 'YYYY-MM-DD'"
      @change="handleChange"
    />

    <!-- 时间选择器 -->
    <el-time-picker
      v-else-if="field.type === 'time'"
      v-model="fieldValue"
      :placeholder="field.placeholder"
      :disabled="field.disabled"
      :clearable="true"
      :value-format="field.valueFormat || 'HH:mm:ss'"
      @change="handleChange"
    />

    <!-- 单选框组 -->
    <el-radio-group
      v-else-if="field.type === 'radio'"
      v-model="fieldValue"
      :disabled="field.disabled"
      @change="handleChange"
    >
      <el-radio
        v-for="option in fieldOptions"
        :key="option.value"
        :label="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </el-radio>
    </el-radio-group>

    <!-- 复选框组 -->
    <el-checkbox-group
      v-else-if="field.type === 'checkbox'"
      v-model="fieldValue"
      :disabled="field.disabled"
      @change="handleChange"
    >
      <el-checkbox
        v-for="option in fieldOptions"
        :key="option.value"
        :label="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </el-checkbox>
    </el-checkbox-group>

    <!-- 开关 -->
    <el-switch
      v-else-if="field.type === 'switch'"
      v-model="fieldValue"
      :disabled="field.disabled"
      @change="handleChange"
    />

    <!-- 滑块 -->
    <el-slider
      v-else-if="field.type === 'slider'"
      v-model="fieldValue"
      :disabled="field.disabled"
      :min="field.min"
      :max="field.max"
      :step="field.step || 1"
      @change="handleChange"
    />

    <!-- 评分 -->
    <el-rate
      v-else-if="field.type === 'rate'"
      v-model="fieldValue"
      :disabled="field.disabled"
      :max="field.max || 5"
      @change="handleChange"
    />

    <!-- 颜色选择器 -->
    <el-color-picker
      v-else-if="field.type === 'color'"
      v-model="fieldValue"
      :disabled="field.disabled"
      @change="handleChange"
    />

    <!-- 上传 -->
    <el-upload
      v-else-if="field.type === 'upload'"
      :action="field.action"
      :headers="field.headers"
      :disabled="field.disabled"
      :limit="field.limit"
      :file-list="fileList"
      :on-success="handleUploadSuccess"
      :on-remove="handleUploadRemove"
      :on-preview="handlePreview"
    >
      <el-button type="primary">
        <el-icon><Upload /></el-icon>
        点击上传
      </el-button>
    </el-upload>

    <!-- 富文本编辑器 -->
    <editor
      v-else-if="field.type === 'editor'"
      v-model="fieldValue"
      :disabled="field.disabled"
      :placeholder="field.placeholder"
      @change="handleChange"
    />

    <!-- 自定义插槽 -->
    <slot
      v-else-if="field.type === 'slot'"
      :name="field.slotName"
      :field="field"
      :value="fieldValue"
    />

    <!-- 字段提示 -->
    <template v-if="field.tips" #tip>
      <div class="field-tips">{{ field.tips }}</div>
    </template>
  </el-form-item>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Upload } from '@element-plus/icons-vue';
import { useFieldOptions } from './composables/useFieldOptions';
import type { FormField, FieldOption } from './types';

interface Props {
  field: FormField;
  modelValue: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: any];
  'change': [value: any];
}>();

// 字段值
const fieldValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 字段选项
const { fieldOptions, remoteOptions, remoteLoading, loadRemoteOptions } = useFieldOptions(props.field);

// 文件列表
const fileList = ref<any[]>([]);

// 监听字段值变化
function handleChange(value: any) {
  emit('change', value);
}

// 远程搜索
async function handleRemoteSearch(query: string) {
  if (props.field.remoteUrl) {
    await loadRemoteOptions(props.field.remoteUrl, { keyword: query });
  }
}

// 上传成功
function handleUploadSuccess(response: any, file: any) {
  fileList.value.push(file);
  handleChange(response.url || response.fileId);
}

// 移除文件
function handleUploadRemove(file: any) {
  const index = fileList.value.findIndex(f => f.uid === file.uid);
  if (index > -1) {
    fileList.value.splice(index, 1);
  }
}

// 预览文件
function handlePreview(file: any) {
  window.open(file.url);
}

// 监听字段配置变化
watch(
  () => props.field.options,
  (options) => {
    if (Array.isArray(options)) {
      fieldOptions.value = options;
    } else if (typeof options === 'string') {
      // 从字典加载选项
      loadRemoteOptions(`/api/dict/${options}`);
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.field-tips {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
}
</style>
```

### 6.3 动态字段 Hook

```typescript
// main/src/low-code/form-engine/composables/useDynamicFields.ts
import { ref } from 'vue';
import { getSchema, getCustomFieldData, saveCustomFieldData } from '@/api/low-code';
import type { CustomField } from '../types';

/**
 * 动态字段 Hook
 * 用于加载和管理低代码配置的自定义字段
 */
export function useDynamicFields() {
  const dynamicFields = ref<CustomField[]>([]);
  const loading = ref(false);

  /**
   * 加载低代码 schema
   * @param schemaId Schema ID 或插件名称
   */
  async function loadSchema(schemaId: string): Promise<void> {
    loading.value = true;
    try {
      const response = await getSchema(schemaId);
      dynamicFields.value = response.fields || [];
    } catch (error) {
      console.error('加载低代码配置失败:', error);
      dynamicFields.value = [];
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取自定义字段数据
   * @param mainId 主数据 ID
   * @param schemaId Schema ID
   */
  async function getCustomData(mainId: string, schemaId: string): Promise<Record<string, any>> {
    try {
      const response = await getCustomFieldData(mainId, schemaId);
      return response.data || {};
    } catch (error) {
      console.error('获取自定义字段数据失败:', error);
      return {};
    }
  }

  /**
   * 保存自定义字段数据
   * @param mainId 主数据 ID
   * @param schemaId Schema ID
   * @param data 自定义字段数据
   */
  async function saveCustomData(
    mainId: string,
    schemaId: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      await saveCustomFieldData({
        mainId,
        schemaId,
        fieldData: data
      });
    } catch (error) {
      console.error('保存自定义字段数据失败:', error);
      throw error;
    }
  }

  return {
    dynamicFields,
    loading,
    loadSchema,
    getCustomData,
    saveCustomData
  };
}
```

---

## 七、AI 代码生成规范

### 7.1 插件代码模板

```typescript
// ai-knowledge-base/templates/plugin-template/main.ts
/**
 * WMS/MES 业务插件模板
 *
 * @template
 * @description
 * 所有业务插件必须遵循此模板结构，以便 AI 能够准确理解和生成代码。
 *
 * @规范要求
 * 1. 必须导出 qiankun 生命周期钩子：bootstrap、mount、unmount
 * 2. 必须导出 pluginConfig 配置对象
 * 3. 页面组件放在 pages/ 目录
 * 4. 业务组件放在 components/ 目录
 * 5. API 接口放在 api/ 目录
 * 6. 类型定义放在 types/ 目录
 * 7. 组合式函数放在 composables/ 目录
 * 8. 常量定义放在 constants/ 目录
 *
 * @AI 指令模板
 * 当要求 AI 创建新插件时，请使用以下指令：
 * "请创建一个 [插件名称] 插件，包含以下功能：
 *  - 列表页面（包含搜索、表格、分页）
 *  - 新建/编辑表单页面
 *  - 详情查看页面
 *  - API 接口定义
 *  - 类型定义
 *  请遵循 wms-frontend 项目的插件开发规范。"
 */

import { createApp } from 'vue';
import type { MicroAppProps } from './types';

let app: any;

/**
 * 插件启动
 * qiankun 在首次加载应用时调用
 */
export async function bootstrap() {
  console.log(`[{{PLUGIN_NAME}}] 插件启动`);
}

/**
 * 插件挂载
 * qiankun 在每次激活应用时调用
 * @param props 主应用传递的属性
 */
export async function mount(props: MicroAppProps) {
  console.log(`[{{PLUGIN_NAME}}] 插件挂载`, props);

  // 创建 Vue 应用
  app = createApp({});

  // 注册插件
  // app.use(router);
  // app.use(pinia);

  // 注入主应用能力
  app.provide('microProps', props);
  app.provide('globalState', {
    get: props.getGlobalState,
    set: props.setGlobalState
  });
  app.provide('eventBus', props.eventBus);

  // 挂载应用
  app.mount(`#${props.container || '{{CONTAINER_ID}}'}`);
}

/**
 * 插件卸载
 * qiankun 在应用失活时调用
 */
export async function unmount() {
  console.log(`[{{PLUGIN_NAME}}] 插件卸载`);
  app?.unmount();
}
```

### 7.2 页面组件模板

```vue
<!-- ai-knowledge-base/templates/page-template.vue -->
<template>
  <div class="{{PAGE_CLASS}}-page">
    <!-- 页面工具栏 -->
    <page-toolbar>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        新建{{RESOURCE_NAME}}
      </el-button>
    </page-toolbar>

    <!-- 搜索表单 -->
    <search-card
      v-model="searchParams"
      :fields="searchFields"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 数据表格 -->
    <data-table
      v-loading="loading"
      :data="tableData"
      :columns="tableColumns"
      :pagination="pagination"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
    >
      <!-- 状态列插槽 -->
      <template #status="{ row }">
        <{{RESOURCE_NAME}}-status :status="row.status" />
      </template>

      <!-- 操作列插槽 -->
      <template #action="{ row }">
        <el-button link type="primary" @click="handleView(row)">
          查看
        </el-button>
        <el-button link type="primary" @click="handleEdit(row)">
          编辑
        </el-button>
        <el-button link type="danger" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </data-table>
  </div>
</template>

<script setup lang="ts">
/**
 * {{RESOURCE_NAME}} 列表页面
 *
 * @AI 生成规范
 * 1. 使用 composition API
 * 2. 使用 use{{RESOURCE_NAME}}List 组合式函数管理数据
 * 3. 使用 useDynamicFields 处理低代码扩展字段
 * 4. 使用 v-permission 指令控制权限
 * 5. 监听业务事件实现数据联动
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus } from '@element-plus/icons-vue';
import { use{{RESOURCE_NAME}}List } from '../composables/use{{RESOURCE_NAME}}List';
import { useDynamicFields } from '@/low-code/form-engine/composables/useDynamicFields';

const router = useRouter();
const eventBus = inject('eventBus');

// 列表数据逻辑
const {
  loading,
  tableData,
  pagination,
  searchParams,
  fetchList,
  handleDelete
} = use{{RESOURCE_NAME}}List();

// 动态字段
const { dynamicColumns } = useDynamicFields('{{PLUGIN_NAME}}');

// 搜索字段配置
const searchFields = computed(() => [
  // AI 根据业务需求生成搜索字段
]);

// 表格列配置
const tableColumns = computed(() => [
  // AI 根据业务需求生成表格列
]);

// 新建
function handleCreate() {
  router.push('/{{ROUTE_PATH}}/create');
}

// 编辑
function handleEdit(row: any) {
  router.push(`/{{ROUTE_PATH}}/edit/${row.id}`);
}

// 查看
function handleView(row: any) {
  router.push(`/{{ROUTE_PATH}}/detail/${row.id}`);
}

// 搜索
function handleSearch(params: any) {
  Object.assign(searchParams.value, params);
  pagination.page = 1;
  fetchList();
}

// 重置
function handleReset() {
  searchParams.value = {};
  pagination.page = 1;
  fetchList();
}

// 选择变化
function handleSelectionChange(selection: any[]) {
  // 处理选择逻辑
}

// 分页变化
function handlePageChange(page: number, pageSize: number) {
  pagination.page = page;
  pagination.pageSize = pageSize;
  fetchList();
}

// 监听业务事件
onMounted(() => {
  eventBus?.on('{{EVENT_PREFIX}}:created', fetchList);
  eventBus?.on('{{EVENT_PREFIX}}:updated', fetchList);
});

onUnmounted(() => {
  eventBus?.off('{{EVENT_PREFIX}}:created');
  eventBus?.off('{{EVENT_PREFIX}}:updated');
});

// 初始化加载
onMounted(() => {
  fetchList();
});
</script>
```

### 7.3 AI 提示词模板

```markdown
# AI 提示词模板

## 1. 创建新插件

```
请为 WMS/MES 系统创建一个 [功能名称] 插件，要求如下：

## 基本信息
- 插件名称：wms-[plugin-name]
- 版本：1.0.0
- 中文显示名：[中文显示名]

## 功能需求
1. 列表页面：
   - 搜索条件：[列出搜索字段]
   - 表格列：[列出表格列]
   - 操作按钮：查看、编辑、删除、[其他操作]

2. 表单页面：
   - 表单字段：[列出表单字段]
   - 字段校验：[列出校验规则]
   - 必填字段：[列出必填字段]

3. 详情页面：
   - 展示内容：[列出展示内容]

## API 接口
- 列表接口：GET /api/wms/[resource]/list
- 详情接口：GET /api/wms/[resource]/{id}
- 创建接口：POST /api/wms/[resource]
- 更新接口：PUT /api/wms/[resource]/{id}
- 删除接口：DELETE /api/wms/[resource]/{id}

## 低代码扩展点
- 表单字段扩展：[字段列表]
- 列表列扩展：[列名列表]

## 业务事件
- 创建后事件：[resource]:created
- 更新后事件：[resource]:updated
- 删除后事件：[resource]:deleted

请遵循 wms-frontend 项目的插件开发规范，生成完整代码。
```

## 2. 定制插件开发

```
请基于 [原插件名称] 插件创建客户定制版本，要求如下：

## 定制需求
- 客户：[客户名称]
- 原插件：wms-[original-plugin]

## 修改内容
1. 新增字段：
   - 字段名：[字段名]
   - 类型：[类型]
   - 是否必填：[是/否]
   - 默认值：[默认值]

2. 修改字段：
   - 字段名：[字段名]
   - 修改内容：[修改内容]

3. 新增功能：
   - 功能描述：[功能描述]
   - 实现逻辑：[实现逻辑]

4. 修改功能：
   - 原功能：[原功能描述]
   - 修改为：[新功能描述]

## 输出要求
- 继承原插件的所有功能
- 只输出修改部分的代码
- 标注修改点
- 保持代码风格一致
```

## 3. 代码优化

```
请优化以下代码，要求：

## 优化目标
- 性能优化：[具体优化点]
- 代码质量：[具体问题]
- 类型安全：[类型问题]

## 代码
\`\`\`typescript
[待优化代码]
\`\`\`

## 优化要求
- 保持功能不变
- 遵循项目编码规范
- 添加必要的注释
- 确保类型安全
```
```

---

## 八、定制插件开发流程

### 8.1 定制插件创建流程

```
┌─────────────────────────────────────────────────────────────┐
│                    定制插件开发流程                          │
└─────────────────────────────────────────────────────────────┘

客户A需要修改入库单功能：
1. 新增"供应商编码"字段
2. 增加"自动审核"规则
3. 修改列表展示列

┌─────────────────────────────────────────────────────────────┐
│  步骤 1：收集需求                                            │
│  • 整理客户定制需求文档                                      │
│  • 录入 AI 知识库                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 2：AI 分析与生成                                       │
│  • 分析原插件代码（wms-receipt）                              │
│  • 结合定制需求生成定制插件代码                              │
│  • 产出插件：plugins/custom/client-a/receipt/                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 3：代码审核                                            │
│  • 审核 AI 产出代码质量                                      │
│  • 确认符合架构规范                                          │
│  • 验证功能完整性                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 4：集成测试                                            │
│  • 与标品插件联调测试                                        │
│  • 验证定制功能                                              │
│  • 确认不影响其他功能                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  步骤 5：打包部署                                            │
│  • 独立打包定制插件                                          │
│  • 部署到客户环境                                            │
│  • 替换原插件或并行运行                                      │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 定制插件配置

```typescript
// plugins/custom/client-a/receipt/src/config.ts
import type { CustomPluginConfig } from './types';

export const customPluginConfig: CustomPluginConfig = {
  // 继承的基础插件
  basePlugin: 'wms-receipt',
  baseVersion: '^1.0.0',

  // 定制插件信息
  name: 'client-a-receipt',
  version: '1.0.0',
  displayName: '客户A-入库管理',
  description: '客户A定制化入库管理',
  client: 'client-a',

  // 定制路由
  routes: [
    {
      path: '/create',
      name: 'CustomReceiptCreate',
      component: () => import('./pages/CustomCreate.vue'),
      meta: {
        title: '新建入库单（定制）'
      }
    }
  ],

  // 字段扩展配置
  fieldExtensions: {
    // 新增字段
    addedFields: [
      {
        prop: 'supplierCode',
        label: '供应商编码',
        type: 'input',
        required: true,
        rules: [
          { pattern: /^[A-Z0-9]{6,20}$/, message: '请输入6-20位大写字母或数字' }
        ]
      }
    ],

    // 修改字段
    modifiedFields: [
      {
        prop: 'receiptNo',
        label: '入库单号',
        type: 'input',
        readonly: true,
        customGenerator: 'auto-supplier-no' // 自定义单号生成规则
      }
    ],

    // 删除字段
    removedFields: []
  },

  // 业务规则扩展
  businessRules: {
    // 自动审核规则
    autoApprove: {
      enabled: true,
      condition: (data) => {
        // 金额小于 10000 自动审核
        return data.totalAmount < 10000;
      }
    }
  },

  // 覆盖的组件
  overrideComponents: {
    ReceiptList: () => import('./components/CustomReceiptList.vue'),
    ReceiptForm: () => import('./components/CustomReceiptForm.vue')
  }
};

export default customPluginConfig;
```

### 8.3 定制页面实现

```vue
<!-- plugins/custom/client-a/receipt/src/pages/CustomCreate.vue -->
<template>
  <div class="custom-receipt-create">
    <!-- 继承原插件页面结构 -->
    <receipt-create-base
      ref="baseFormRef"
      v-model="formData"
      @validate="handleBaseValidate"
    >
      <!-- 自定义字段插槽 -->
      <template #extension-fields>
        <el-form-item
          label="供应商编码"
          prop="supplierCode"
          :rules="[
            { required: true, message: '请输入供应商编码' },
            { pattern: /^[A-Z0-9]{6,20}$/, message: '请输入6-20位大写字母或数字' }
          ]"
        >
          <el-input
            v-model="formData.supplierCode"
            placeholder="请输入供应商编码"
            maxlength="20"
          >
            <template #append>
              <el-button @click="handleSelectSupplier">选择</el-button>
            </template>
          </el-input>
        </el-form-item>

        <!-- 客户A特有字段 -->
        <el-form-item
          v-if="formData.supplierCode === 'VIP001'"
          label="VIP优先级"
          prop="vipLevel"
        >
          <el-select v-model="formData.vipLevel" placeholder="请选择优先级">
            <el-option label="P0" value="P0" />
            <el-option label="P1" value="P1" />
            <el-option label="P2" value="P2" />
          </el-select>
        </el-form-item>
      </template>

      <!-- 自定义操作按钮 -->
      <template #extension-actions>
        <el-button
          v-if="formData.totalAmount < 10000"
          type="success"
          @click="handleQuickApprove"
        >
          快速审核（<10000）
        </el-button>
      </template>
    </receipt-create-base>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import ReceiptCreateBase from 'wms-receipt/pages/Create.vue';
import { useCustomReceipt } from '../composables/useCustomReceipt';

const baseFormRef = ref();

// 表单数据
const formData = reactive({
  // 继承原字段
  receiptNo: '',
  warehouseId: '',
  supplierId: '',
  receiptDate: new Date(),
  status: 'DRAFT',
  remark: '',
  details: [],

  // 新增字段
  supplierCode: '',
  vipLevel: ''
});

// 定制业务逻辑
const { handleQuickApprove, handleSelectSupplier } = useCustomReceipt(formData);

// 基础表单校验
function handleBaseValidate(valid: boolean) {
  // 处理校验结果
}
</script>
```

---

## 九、独立开发与调试

### 9.1 本地开发环境配置

```bash
# 1. 克隆项目
git clone <repository-url>
cd wms-mes-frontend

# 2. 安装依赖
pnpm install

# 3. 启动主应用（基座）
cd main
pnpm dev

# 4. 新开终端，启动指定插件
# 例如只开发入库插件
cd plugins/receipt
pnpm dev

# 5. 访问应用
# 主应用: http://localhost:5173
# 入库插件: http://localhost:5174
# 出库插件: http://localhost:5175
```

### 9.2 开发者权限配置

```json
// .vscode/settings.json
{
  // 插件开发权限配置
  "wms.developer": {
    "id": "developer-001",
    "name": "张三",
    "plugins": ["wms-receipt", "wms-delivery"],
    "permissions": {
      "wms-receipt": ["read", "write"],
      "wms-delivery": ["read"]
    }
  }
}
```

### 9.3 独立调试配置

```typescript
// plugins/receipt/src/main.ts
// 独立运行时（开发模式）
if (!window.__POWERED_BY_QIANKUN__) {
  // 开发模式配置
  const devProps = {
    container: 'subapp-receipt',
    baseRoute: '/wms/receipt',
    apiKey: 'receipt-api',
    getGlobalState: () => ({
      token: localStorage.getItem('token') || '',
      userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')
    }),
    setGlobalState: (state: any) => {
      Object.keys(state).forEach(key => {
        if (key === 'token') {
          localStorage.setItem('token', state[key]);
        } else if (key === 'userInfo') {
          localStorage.setItem('userInfo', JSON.stringify(state[key]));
        }
      });
    },
    eventBus: createMockEventBus(),
    registerRoutes: (routes: any[]) => {
      // 开发模式路由注册
      console.log('注册路由:', routes);
    }
  };

  mount(devProps);
}

// 创建模拟事件总线（开发用）
function createMockEventBus() {
  return {
    on: (event: string, handler: Function) => {
      console.log(`[Mock] 监听事件: ${event}`);
    },
    off: (event: string, handler: Function) => {
      console.log(`[Mock] 取消监听: ${event}`);
    },
    emit: (event: string, ...args: any[]) => {
      console.log(`[Mock] 触发事件: ${event}`, args);
    }
  };
}
```

---

## 十、打包与部署

### 10.1 构建脚本

```javascript
// scripts/build.js
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// 构建配置
const buildConfig = {
  main: {
    dir: 'main',
    output: 'dist/main'
  },
  plugins: [
    { name: 'receipt', dir: 'plugins/receipt', output: 'dist/plugins/receipt' },
    { name: 'delivery', dir: 'plugins/delivery', output: 'dist/plugins/delivery' },
    { name: 'stock', dir: 'plugins/stock', output: 'dist/plugins/stock' },
    { name: 'check', dir: 'plugins/check', output: 'dist/plugins/check' }
  ],
  custom: [
    { name: 'client-a-receipt', dir: 'plugins/custom/client-a/receipt', output: 'dist/custom/client-a/receipt' }
  ]
};

// 构建单个项目
async function buildProject(project) {
  console.log(`\n正在构建: ${project.name || '主应用'}`);
  console.log(`源码目录: ${project.dir}`);
  console.log(`输出目录: ${project.output}`);

  try {
    // 确保输出目录存在
    await fs.mkdir(path.dirname(project.output), { recursive: true });

    // 执行构建
    const { stdout, stderr } = await execAsync('pnpm build', {
      cwd: project.dir
    });

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    // 移动构建产物
    const sourceDir = path.join(project.dir, 'dist');
    await fs.rename(sourceDir, project.output);

    console.log(`✓ ${project.name || '主应用'} 构建完成`);
  } catch (error) {
    console.error(`✗ ${project.name || '主应用'} 构建失败:`, error);
    throw error;
  }
}

// 主构建函数
async function build(options = {}) {
  const { main = true, plugins = true, custom = true } = options;

  console.log('========================================');
  console.log('WMS/MES 前端构建');
  console.log('========================================');

  try {
    // 构建主应用
    if (main) {
      await buildProject(buildConfig.main);
    }

    // 构建标准插件
    if (plugins) {
      for (const plugin of buildConfig.plugins) {
        await buildProject(plugin);
      }
    }

    // 构建定制插件
    if (custom) {
      for (const plugin of buildConfig.custom) {
        await buildProject(plugin);
      }
    }

    console.log('\n========================================');
    console.log('所有构建完成！');
    console.log('========================================');
  } catch (error) {
    console.error('\n构建失败:', error);
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);
const options = {
  main: !args.includes('--no-main'),
  plugins: !args.includes('--no-plugins'),
  custom: !args.includes('--no-custom')
};

build(options);
```

### 10.2 部署目录结构

```
# 服务器部署目录结构
/var/www/wms-mes/
├── index.html              # 主应用入口
├── assets/                 # 主应用资源
│   ├── index.js
│   ├── index.css
│   └── ...
├── plugins/                # 插件资源
│   ├── receipt/
│   │   ├── assets/
│   │   │   └── wms-receipt.js
│   │   └── manifest.json
│   ├── delivery/
│   │   └── ...
│   └── stock/
│       └── ...
└── custom/                 # 定制插件
    ├── client-a/
    │   └── receipt/
    │       └── assets/
    │           └── wms-receipt.js
    └── client-b/
        └── ...
```

### 10.3 Nginx 配置

```nginx
# /etc/nginx/conf.d/wms-mes.conf
server {
    listen 80;
    server_name wms.example.com;
    root /var/www/wms-mes;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;

    # 主应用资源
    location /assets/ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # 插件资源
    location /plugins/ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # 定制插件资源
    location /custom/ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # 低代码配置
    location /api/low-code/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 禁止访问源码映射
    location ~* \.map$ {
        deny all;
    }
}
```

---

## 十一、源码权限管控

### 11.1 权限配置文件

```json
// .wms-permissions.json
{
  "version": "1.0.0",
  "permissions": {
    "developers": {
      "dev-001": {
        "name": "张三",
        "role": "senior",
        "access": {
          "main": "read",
          "plugins": ["wms-receipt:write", "wms-delivery:read"],
          "packages": []
        }
      },
      "dev-002": {
        "name": "李四",
        "role": "middle",
        "access": {
          "main": "none",
          "plugins": ["wms-stock:write"],
          "packages": []
        }
      }
    },
    "clients": {
      "client-a": {
        "name": "客户A",
        "plugins": ["custom/client-a/*"],
        "permissions": ["read"]
      }
    }
  }
}
```

### 11.2 Git 仓库隔离策略

```bash
# 仓库结构
wms-mes-frontend/              # 主仓库（所有人只读）
├── main/                      # 基座（子模块，仅负责人）
├── packages/                  # 私有包（子模块，仅负责人）
├── plugins/                   # 插件目录
│   ├── receipt/               # 入库插件（独立仓库）
│   ├── delivery/              # 出库插件（独立仓库）
│   └── custom/                # 定制插件（按客户独立仓库）
│       ├── client-a/          # 客户A定制
│       └── client-b/          # 客户B定制
└── .gitmodules                # 子模块配置

# 开发者只克隆负责的插件
git clone --recursive git@github.com:company/wms-plugin-receipt.git
```

---

## 十二、最佳实践

### 12.1 开发规范

```
┌─────────────────────────────────────────────────────────────┐
│  命名规范                                                   │
├─────────────────────────────────────────────────────────────┤
│  • 插件名称：wms-[功能名]，如 wms-receipt                   │
│  • 组件名称：PascalCase，如 ReceiptForm.vue                 │
│  • 组合式函数：use + PascalCase，如 useReceiptList           │
│  • API 函数：camelCase，如 getReceiptList                   │
│  • 常量：UPPER_SNAKE_CASE，如 MAX_QUANTITY                   │
│  • 事件名：resource:action，如 receipt:created              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  目录结构规范                                               │
├─────────────────────────────────────────────────────────────┤
│  每个插件必须包含：                                         │
│  • src/main.ts - 插件入口                                  │
│  • src/config.ts - 插件配置                                │
│  • src/types/ - 类型定义                                   │
│  • src/api/ - API 接口                                     │
│  • src/pages/ - 页面组件                                   │
│  • src/components/ - 业务组件                              │
│  • src/composables/ - 组合式函数                           │
│  • src/constants/ - 常量定义                               │
│  • vite.config.ts - 构建配置                               │
│  • package.json - 依赖配置                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  注释规范                                                   │
├─────────────────────────────────────────────────────────────┤
│  /**                                                        │
│   * [功能简述]                                              │
│   *                                                        │
│   * @param [参数名] [参数说明]                              │
│   * @returns [返回值说明]                                   │
│   * @example                                                │
│   * [使用示例]                                              │
│   */                                                       │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 性能优化

```
┌─────────────────────────────────────────────────────────────┐
│  性能优化建议                                               │
├─────────────────────────────────────────────────────────────┤
│  1. 按需加载                                                │
│     • 路由懒加载                                            │
│     • 组件异步加载                                          │
│     • 插件按需加载                                          │
│                                                             │
│  2. 代码分割                                                │
│     • vendor 单独打包                                       │
│     • 页面组件单独打包                                      │
│     • 第三方库单独打包                                      │
│                                                             │
│  3. 缓存策略                                                │
│     • 启用 qiankun 预加载                                   │
│     • 浏览器缓存控制                                        │
│     • CDN 加载                                              │
│                                                             │
│  4. 资源优化                                                │
│     • Gzip/Brotli 压缩                                     │
│     • 图片压缩                                              │
│     • Tree Shaking                                          │
│     • 移除未使用代码                                        │
└─────────────────────────────────────────────────────────────┘
```

### 12.3 错误处理

```typescript
// main/src/shared/error-handler/index.ts
/**
 * 全局错误处理
 */
class ErrorHandler {
  /**
   * 处理 API 错误
   */
  handleApiError(error: any) {
    const { response, message } = error;

    if (response) {
      switch (response.status) {
        case 401:
          // 未授权，跳转登录
          window.location.href = '/login';
          break;
        case 403:
          // 无权限
          ElMessage.error('您没有权限执行此操作');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器错误，请稍后重试');
          break;
        default:
          ElMessage.error(response.data?.message || '请求失败');
      }
    } else {
      ElMessage.error(message || '网络错误，请检查网络连接');
    }

    // 错误上报
    this.reportError(error);
  }

  /**
   * 处理 JS 错误
   */
  handleJsError(error: Error) {
    console.error('JavaScript 错误:', error);
    this.reportError(error);
  }

  /**
   * 错误上报
   */
  reportError(error: any) {
    // 上报到错误监控系统
    if (import.meta.env.PROD) {
      // 例如：Sentry
      // Sentry.captureException(error);
    }
  }
}

export const errorHandler = new ErrorHandler();

// 全局错误监听
window.addEventListener('error', (event) => {
  errorHandler.handleJsError(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleJsError(event.reason);
});
```

---

## 总结

本文档详细描述了 WMS/MES 系统的前端架构实现方案，核心特点：

| 特性 | 实现方式 |
|------|----------|
| **微前端架构** | qiankun 框架，支持独立开发、部署 |
| **插件化设计** | 按功能拆分插件，低耦合高内聚 |
| **低代码引擎** | 动态表单、字段渲染、运行时配置 |
| **AI 友好** | 规范化结构、完整模板、提示词体系 |
| **权限管控** | 源码隔离、按权限分配、定制插件隔离 |
| **定制扩展** | 插件继承、覆盖机制、独立部署 |

需要进一步了解某个具体部分的实现吗？
