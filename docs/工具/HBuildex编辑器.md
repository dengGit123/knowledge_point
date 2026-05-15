# HBuilderX 完全使用指南

## 概述

HBuilderX 是 DCloud（数字天堂）出品的一款前端开发 IDE，专为跨平台应用开发设计。它内置了对 uni-app、5+App、wxml2vue 等框架的支持，是国内移动应用开发的主流工具之一。

```
┌─────────────────────────────────────────────────────────────┐
│                    为什么选择 HBuilderX？                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ 官方 uni-app 开发工具，支持最全面                          │
│  ✅ 内置小程序/APP 真机运行调试                               │
│  ✅ 内置服务器，开发无需额外配置                              │
│  ✅ 免费开源，轻量级启动快                                    │
│  ✅ 内置 Emmet、代码块等高效开发工具                          │
│  ✅ 原生支持 Vue 语法高亮和智能提示                           │
│  ✅ 一键云打包，无需配置原生开发环境                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 一、安装与初始设置

### 1.1 下载安装

| 平台 | 下载地址 |
|------|----------|
| 官网 | [https://www.dcloud.io/hbuilderx.html](https://www.dcloud.io/hbuilderx.html) |
| Windows | [HBuilderX Windows 版](https://download1.dcloud.net.cn/download/HBuilderX.3.8.12.20230817.full.zip) |
| macOS | [HBuilderX macOS 版](https://download1.dcloud.net.cn/download/HBuilderX.3.8.12.20230817.full.dmg) |

<div style="background-color: #d1ecf1; border-left: 4px solid #0dcaf0; padding: 10px; margin: 10px 0;">
<strong>💡 版本选择：</strong>HBuilderX 有两个版本 —— <strong>标准版</strong>（App开发）和 <strong>App开发版</strong>。推荐下载 <strong>标准版</strong>，已包含常用功能。
</div>

### 1.2 首次启动配置

```
启动后推荐设置：

1. 【文件】→【设置】→【常规设置】
   - 字体大小：14
   - 字体：Consolas/Monaco
   - 主题：Monokai / Dark+

2. 【运行】→【运行配置】
   - 浏览器：选择 Chrome
   - 端口号：默认即可

3. 【工具】→【插件安装】
   - scss/sass编译
   - less编译
   - typescript编译
```

---

## 二、界面布局

```
┌─────────────────────────────────────────────────────────────────┐
│  HBuilderX - 项目名称                              ─ □ ✕       │
├──────────┬──────────────────────────────────────┬───────────────┤
│          │              菜单栏                    │               │
│  项目管理  ├──────────────────────────────────────┤               │
│  (快捷键   │                                          编辑器      │
│   Ctrl+D) │           代码编辑区域                 │               │
│          │                                          (可拖拽分屏) │
│  ────────┴──────────────────────────────────────────┴───────────  │
│  底部：控制台 / 输出 / 终端 / 问题                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 各区域功能

| 区域 | 快捷键 | 功能说明 |
|------|--------|----------|
| **项目管理器** | `Ctrl+D` | 显示项目文件结构 |
| **编辑器** | `Ctrl+Tab` | 代码编辑区域，支持多标签 |
| **控制台** | - | 显示运行日志、编译信息 |
| **输出面板** | - | 显示插件编译输出 |
| **状态栏** | - | 显示Git分支、文件编码等信息 |

---

## 三、核心快捷键

### 3.1 通用快捷键

| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 新建文件 | `Ctrl+N` | `Cmd+N` |
| 打开文件 | `Ctrl+O` | `Cmd+O` |
| 保存文件 | `Ctrl+S` | `Cmd+S` |
| 另存为 | `Ctrl+Shift+S` | `Cmd+Shift+S` |
| 关闭文件 | `Ctrl+W` | `Cmd+W` |
| 全部保存 | `Ctrl+K S` | `Cmd+K S` |

### 3.2 编辑操作

| 功能 | 快捷键 |
|------|--------|
| 剪切行 | `Ctrl+X` |
| 复制行 | `Ctrl+C` |
| 移动行上/下 | `Alt+↑` / `Alt+↓` |
| 删除行 | `Ctrl+D` |
| 复制行到下/上 | `Ctrl+Shift+↓` / `Ctrl+Shift+↑` |
| 注释/取消注释 | `Ctrl+/` |
| 格式化代码 | `Ctrl+Shift+F` |

### 3.3 光标移动

| 功能 | 快捷键 |
|------|--------|
| 移动到行首/尾 | `Home` / `End` |
| 移动到文件首/尾 | `Ctrl+Home` / `Ctrl+End` |
| 选中当前行 | `Ctrl+L` |
| 选中下一个相同的词 | `Ctrl+D` |
| 多光标选择 | `Alt+点击` |

### 3.4 视图操作

| 功能 | 快捷键 |
|------|--------|
| 显示/隐藏项目管理器 | `Ctrl+D` |
| 显示/隐藏控制台 | `Ctrl+Shift+C` |
| 全屏模式 | `F11` |
| 放大/缩小 | `Ctrl++` / `Ctrl+-` |

### 3.5 HBuilderX 特色快捷键

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| 运行到浏览器 | `Ctrl+R` | 内置服务器运行 |
| 运行到小程序 | `Ctrl+Shift+R` | 微信开发者工具 |
| 新建页面 | `Ctrl+N` | 选择页面模板 |
| 代码块 | `Ctrl+Alt+J` | 插入Vue/uni-app代码块 |
| 跳转到定义 | `Alt+Click` |
| 查找引用 | `Alt+Shift+Click` |

---

## 四、项目管理

### 4.1 创建项目

```
创建 uni-app 项目流程：

1. 【文件】→【新建】→【项目】
2. 选择项目类型：
   ┌─────────────────────────────────────┐
   │  uni-app                            │
   │  - 默认模板                          │
   │  - Vue3/Vue2 版本                   │
   │  - TypeScript 版本                  │
   │  - UI 模板 (uView/uvue)             │
   │                                     │
   │  Wap2App                            │
   │  5+App                              │
   │  HTML+                              │
   └─────────────────────────────────────┘

3. 填写项目名称和路径
4. 选择 Vue 版本和模板
5. 点击【创建】
```

### 4.2 项目结构

```
uni-app 项目结构：
├── pages/                  # 页面文件夹
│   ├── index/             # 首页
│   │   └── vue            # 页面文件
│   └── ...
├── static/                # 静态资源
│   ├── images/
│   └── ...
├── uni_modules/           # uni-app 插件
├── components/            # 组件
├── App.vue                # 应用配置
├── main.js                # 入口文件
├── manifest.json          # 应用配置
├── pages.json             # 页面路由配置
└── package.json           # 依赖配置
```

### 4.3 项目导入

```
导入现有项目：

1. 【文件】→【导入】→【从本地目录导入】
2. 选择项目文件夹
3. 选择项目类型（自动识别）

或直接拖拽文件夹到 HBuilderX
```

---

## 五、代码编辑

### 5.1 代码块（Snippets）

HBuilderX 内置了大量代码块，提高开发效率：

```javascript
// 输入 u 然后 Tab/Enter

uToast               → uni.showToast({...})
uRequest             → uni.request({...})
uShowLoading         → uni.showLoading({...})
uHideLoading         → uni.hideLoading()
uNavigateTo          → uni.navigateTo({...})
uRedirectTo          → uni.redirectTo({...})
uSwitchTab           → uni.switchTab({...})

// Vue 代码块
vdata                → data() { return {} }
vmethods             → methods: {}
vonLoad              → onLoad(options) {}
vmounted             → mounted() {}
vcomputed            → computed: {}

// HTML 标签代码块
div                  → <div></div>
view                 → <view></view>
button               → <button></button>
input                → <input />
```

### 5.2 Emmet 语法

```html
<!-- 输入以下 Emmet，按 Tab 展开 -->

div#app              → <div id="app"></div>
div.container        → <div class="container"></div>
ul>li*3              → <ul><li></li><li></li><li></li></ul>
div>p+span           → <div><p></p><span></span></div>
a[href=#]            → <a href="#"></a>

<!-- Vue 列表渲染 -->
view*3               → 生成3个 view 标签
view>text            → <view><text></text></view>
```

### 5.3 智能提示

```javascript
// uni-app API 智能提示
uni.                 // 自动提示所有 API

// Vue 组件智能提示
this.                // 提示 data、methods、computed
{{    }}             // 自动闭合

// CSS 智能提示
width:               // 提示所有 CSS 属性
```

### 5.4 多光标编辑

```javascript
// 场景1：选中相同单词
// 操作：Ctrl + D

name: 'Tom',
age: 20,
city: 'Beijing'

// 操作：选中 name，按 Ctrl+D 两次选中 age、city
// 可以同时编辑多个相同的变量名

// 场景2：多行同时编辑
// 操作：Alt + Click 多个位置

// 场景3：列选择模式
// 操作：Shift + Alt + 拖动鼠标
```

---

## 六、运行与调试

### 6.1 运行到浏览器

```
运行步骤：

1. 点击工具栏【运行】→【运行到浏览器】→【Chrome】

2. 或使用快捷键：Ctrl + R

3. HBuilderX 会启动内置服务器
   http://localhost:8080/

4. 自动打开浏览器预览

⚠️ 注意：只能运行到 Chrome，其他浏览器不支持
```

### 6.2 运行到小程序

```
运行到微信小程序：

1. 确保已安装【微信开发者工具】

2. 【运行】→【运行到小程序模拟器】→【微信开发者工具】

3. 首次运行需要配置微信开发者工具路径：
   - 工具 → 设置 → 运行配置 → 微信开发者工具路径

4. 自动打开微信开发者工具预览

其他小程序：
- 支付宝小程序
- 百度小程序
- 头条小程序
- QQ小程序
```

### 6.3 运行到 APP

```
运行到手机/模拟器：

Android：
1. 连接手机（开启开发者模式、USB调试）
2. 【运行】→【运行到手机或模拟器】→【运行到Android App基座】
3. 选择设备

iOS：
1. 安装 iOS 模拟器（Xcode）
2. 【运行】→【运行到手机或模拟器】→【运行到iOS App基座】
3. 选择模拟器

真机调试：
- Android：直接 USB 连接
- iOS：需要苹果开发者证书
```

### 6.4 发行打包

```
云打包流程（推荐）：

1. 【发行】→【原生App-云打包】

2. 配置打包参数：
   ┌─────────────────────────────────────┐
   │  Android：                          │
   │  - 包名：com.company.app           │
   │  - 版本号：1.0.0                    │
   │  - 证书：使用DCloud公用证书         │
   │  - 广告：勾选uni-ad                 │
   │                                     │
   │  iOS：                              │
   │  - Bundle ID：com.company.app      │
   │  - 版本号：1.0.0                    │
   │  - 证书：需要个人/企业证书          │
   └─────────────────────────────────────┘

3. 点击【打包】

4. 等待云端构建完成

5. 下载 APK / IPA 文件

本地打包：
需要配置 Android Studio / Xcode 环境
```

---

## 七、插件生态

### 7.1 内置插件

```
【工具】→【插件安装】

前端常用插件：
✅ scss/sass编译    - SCSS 语法支持
✅ less编译         - LESS 语法支持
✅ typescript编译   - TS 语法支持
✅ js压缩           - 代码压缩混淆
✅ css压缩          - CSS 代码压缩
✅ json编辑         - JSON 格式化
✅ 正则表达式工具   - 正则测试
```

### 7.2 uni-app 插件市场

```
访问插件市场：
https://ext.dcloud.net.cn/

插件类型：
┌─────────────────────────────────────┐
│  前端组件                           │
│  - UI 组件 (uView/uCharts)          │
│  - 表单组件                          │
│  - 弹窗组件                          │
│                                     │
│  JS SDK                             │
│  - 支付接口                          │
│  - 地图服务                          │
│  - 即时通讯                          │
│                                     │
│  模板                                │
│  - 项目模板                          │
│  - 页面模板                          │
│                                     │
│  硬件加速                            │
│  - 人脸识别                          │
│  - 指纹识别                          │
└─────────────────────────────────────┘

导入插件：
1. 【工具】→【插件安装】→【uni-app插件安装】
2. 搜索插件
3. 点击【导入】
4. 选择项目导入
```

### 7.3 自定义代码块

```json
// 【工具】→【设置】→【代码块设置】→【vue代码块】

{
  "请求封装": {
    "prefix": "request",
    "body": [
      "uni.request({",
      "\turl: '$1',",
      "\tmethod: 'GET',",
      "\tsuccess: (res) => {",
      "\t\tconsole.log(res.data);",
      "\t},",
      "\tfail: (err) => {",
      "\t\tconsole.error(err);",
      "\t}",
      "});"
    ],
    "description": "uni.request 请求封装"
  },

  "页面生命周期": {
    "prefix": "pagecycle",
    "body": [
      "onLoad(options) {",
      "\t$1",
      "},",
      "onReady() {",
      "\t$2",
      "},",
      "onShow() {",
      "\t$3",
      "},",
      "onHide() {",
      "\t$4",
      "},",
      "onUnload() {",
      "\t$5",
      "}"
    ]
  }
}
```

---

## 八、配置详解

### 8.1 常用配置

```json
// 【工具】→【设置】→【设置.json】

{
  // ========== 编辑器外观 ==========
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.formatOnSave": true,
  "editor.lineHeight": "1.5",
  "editor.fontFamily": "Consolas, 'Courier New', monospace",

  // ========== 主题 ==========
  "editor.colorTheme": "Monokai",
  "editor.showFoldingControls": "always",

  // ========== 文件 ==========
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true,
    "**/unpackage": true
  },

  // ========== 搜索 ==========
  "search.exclude": {
    "**/node_modules": true,
    "**/unpackage": true,
    "**/.git": true
  },

  // ========== 运行配置 ==========
  "emmet.enabled": true,
  "emmet.triggerExpansionOnTab": true
}
```

### 8.2 manifest.json 配置

```json
// uni-app 项目配置文件
{
  "name": "应用名称",
  "appid": "__UNI__XXXXXX",
  "description": "应用描述",
  "versionName": "1.0.0",
  "versionCode": "100",

  // ========== 应用配置 ==========
  "app-plus": {
    "usingComponents": true,
    "nvueStyleCompiler": "uni-app",
    "compilerVersion": 3,
    "splashscreen": {
      "alwaysShowBeforeRender": true,
      "waiting": true,
      "autoclose": true,
      "delay": 0
    },
    "modules": {},
    "distribute": {
      "android": {
        "permissions": []
      },
      "ios": {},
      "sdkConfigs": {}
    }
  },

  // ========== 快捷方式 ==========
  "quickapp": {},
  "mp-weixin": {
    "appid": "微信小程序appid",
    "setting": {
      "urlCheck": false
    }
  }
}
```

### 8.3 pages.json 配置

```json
// 页面路由配置
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "navigationBarBackgroundColor": "#FFFFFF",
        "navigationBarTextStyle": "black"
      }
    },
    {
      "path": "pages/user/user",
      "style": {
        "navigationBarTitleText": "我的"
      }
    }
  ],

  // ========== 全局样式 ==========
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "uni-app",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  },

  // ========== TabBar ==========
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#3cc51f",
    "borderStyle": "black",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "static/home.png",
        "selectedIconPath": "static/home-active.png",
        "text": "首页"
      },
      {
        "pagePath": "pages/user/user",
        "iconPath": "static/user.png",
        "selectedIconPath": "static/user-active.png",
        "text": "我的"
      }
    ]
  }
}
```

---

## 九、常用技巧

### 9.1 快速开发

```javascript
// 1. 代码块快速生成页面
// 输入：vue + Tab
// 生成：Vue 页面模板

// 2. 快速创建页面
// Ctrl+N → 选择 vue 文件类型

// 3. 格式化代码
// Ctrl+Shift+F

// 4. 查找文件
// Ctrl+P（HBuilderX 支持较弱，推荐用项目管理器）

// 5. 全局搜索
// Ctrl+Shift+F

// 6. 文件跳转
// 按住 Ctrl + 点击文件名
```

### 9.2 Git 集成

```
HBuilderX 内置 Git 支持：

常用操作：
┌─────────────────────────────────────┐
│  项目右键 → Git                    │
│  - 提交                             │
│  - 拉取                             │
│  - 推送                             │
│  - 分支管理                         │
│  - 查看历史                         │
│  - 对比差异                         │
└─────────────────────────────────────┘

注意：HBuilderX 的 Git 功能较基础
复杂操作建议使用 Git 命令行或 SourceTree
```

### 9.3 终端使用

```
HBuilderX 内置终端：

打开方式：
1. 【视图】→【显示终端】
2. 快捷键：Ctrl + Shift + C

使用场景：
- npm install
- npm run dev
- git 操作
- 其他命令行操作
```

### 9.4 多设备预览

```
同时预览多个平台：

1. 运行到浏览器（Ctrl+R）
2. 运行到微信开发者工具（Ctrl+Shift+R）
3. 运行到手机模拟器

三个窗口可以同时打开，实时同步预览
```

---

## 十、常见问题

### 10.1 运行问题

| 问题 | 解决方案 |
|------|----------|
| 浏览器运行失败 | 检查端口是否被占用，修改端口号 |
| 微信开发者工具无法打开 | 检查微信开发者工具路径配置 |
| APP 真机运行失败 | 检查 USB 调试是否开启，安装 HBuilder 调试基座 |
| 云打包失败 | 检查 appid、证书配置是否正确 |

### 10.2 编译问题

| 问题 | 解决方案 |
|------|----------|
| scss 编译失败 | 安装 scss/sass 编译插件 |
| vue 文件报错 | 检查语法是否正确，重启 HBuilderX |
| 页面不显示 | 检查 pages.json 是否正确配置页面路径 |

### 10.3 性能优化

```
优化建议：

1. 关闭不需要的文件标签
2. 排除不必要的文件夹（node_modules、unpackage）
3. 定期清理 unpackage 缓存
4. 禁用自动保存（或设置较长延迟）
5. 使用云打包而非本地打包
```

---

## 十一、HBuilderX vs VSCode

| 特性 | HBuilderX | VSCode |
|------|-----------|--------|
| **uni-app 开发** | ⭐⭐⭐⭐⭐ 官方工具 | ⭐⭐⭐ 需要配置 |
| **APP 真机调试** | ⭐⭐⭐⭐⭐ 内置支持 | ⭐ 不支持 |
| **云打包** | ⭐⭐⭐⭐⭐ 一键打包 | ⭐ 不支持 |
| **代码提示** | ⭐⭐⭐⭐ uni-app 优化 | ⭐⭐⭐⭐⭐ 通用更强 |
| **插件生态** | ⭐⭐⭐ uni-app 插件 | ⭐⭐⭐⭐⭐ 海量插件 |
| **通用开发** | ⭐⭐⭐ 前端为主 | ⭐⭐⭐⭐⭐ 全栈支持 |
| **启动速度** | ⭐⭐⭐⭐⭐ 较快 | ⭐⭐⭐⭐ 较快 |
| **学习成本** | ⭐⭐⭐⭐⭐ 简单 | ⭐⭐⭐ 需要配置 |

<div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 10px 0;">
<strong>⚠️ 建议：</strong>如果你主要开发 uni-app 项目，推荐使用 HBuilderX。如果开发其他类型项目（Vue3、React、Node.js 等），VSCode 是更好的选择。
</div>

---

## 十二、快捷键速查表

```
┌───────────────────────────────────────────────────────────────┐
│                    HBuilderX 快捷键速查                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  【文件操作】                                                  │
│  Ctrl+N          新建文件（可选择模板）                         │
│  Ctrl+O          打开文件                                      │
│  Ctrl+S          保存文件                                      │
│  Ctrl+Shift+S    另存为                                        │
│  Ctrl+W          关闭文件                                      │
│                                                               │
│  【编辑操作】                                                  │
│  Ctrl+C/X        复制/剪切行（未选中时）                        │
│  Ctrl+D          删除行 / 选中下一个相同词                      │
│  Ctrl+L          选中当前行                                    │
│  Alt+↑/↓         移动行                                        │
│  Ctrl+/          注释/取消注释                                 │
│  Ctrl+Shift+F    格式化代码                                    │
│                                                               │
│  【视图操作】                                                  │
│  Ctrl+D          显示/隐藏项目管理器                            │
│  Ctrl+Shift+C    显示/隐藏控制台                               │
│  F11             全屏模式                                      │
│                                                               │
│  【运行操作】                                                  │
│  Ctrl+R          运行到浏览器                                  │
│  Ctrl+Shift+R    运行到小程序                                  │
│                                                               │
│  【代码块】                                                    │
│  Ctrl+Alt+J      插入代码块                                    │
│  Tab/Enter       展开代码块                                    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```
