# css 配置

> 📖 [官方文档：Shared Options](https://cn.vitejs.dev/config/shared-options.html)

## 定义

`css` 配置 CSS 相关行为，包括 CSS Modules、预处理器（SCSS/Less/Stylus）、PostCSS 和 Lightning CSS。

**类型**：

```typescript
{
  modules?: Record<string, any> | false      // CSS Modules（选项传递给 postcss-modules）
  preprocessorOptions?: Record<string, any>  // 预处理器选项：scss / sass / less / styl
  preprocessorMaxWorkers?: number | true     // 预处理器是否在 worker 中运行
  devSourcemap?: boolean                     // 开发环境是否生成 CSS sourcemap
  postcss?: string | PostcssConfigOptions    // PostCSS 配置（文件路径或内联配置）
  transformer?: 'postcss' | 'lightningcss'   // CSS 转换器，lightningcss 为实验性
  lightningcss?: LightningCSSOptions         // Lightning CSS 选项
}
```

**默认值**：

```javascript
{
  transformer: 'postcss',
  modules: {
    scopeBehaviour: 'local',                                 // 类名默认作用域化
    globalModulePaths: [],                                   // 无全局模块路径
    generateScopedName: '[name]__[local]___[hash:base64:5]', // postcss-modules 默认命名规则
    hashPrefix: '',                                          // 哈希前缀
    localsConvention: null                                   // 不转换命名风格
  },
  preprocessorOptions: {},
  preprocessorMaxWorkers: undefined,   // 不启用 worker
  devSourcemap: false,
  postcss: undefined,                  // 自动从项目根查找 postcss.config.js 等配置文件
  lightningcss: undefined
}
```

> 💡 **提示：** CSS Modules 只对 `.module.css`、`.module.scss` 这类带 `.module.` 的文件自动生效。`css.modules` 的子选项最终传递给 [postcss-modules](https://github.com/css-modules/postcss-modules)，子项默认值以 postcss-modules 为准。更多 CSS 能力见官方文档 [CSS Features](https://cn.vitejs.dev/guide/features.html#css-features)。

## 子属性详解

### modules

**类型**：`Record<string, any> | false`

**默认行为**：对 `.module.css`、`.module.scss` 等文件自动启用 CSS Modules

CSS Modules 配置，设为 `false` 可整体禁用。完整配置示例：

```javascript
// vite.config.js
export default {
  css: {
    modules: {
      // 作用域行为：'local'（默认，类名作用域化）或 'global'
      scopeBehaviour: 'local',

      // 命中的文件不做作用域化（只接受正则数组）
      globalModulePaths: [/node_modules[\\/]bootstrap/],

      // 生成类名的模式，默认 '[name]__[local]___[hash:base64:5]'
      generateScopedName: '[name]__[local]___[hash:base64:5]',

      // 哈希前缀，可让同样的内容生成不同的哈希
      hashPrefix: '',

      // 命名风格转换，默认不转换
      localsConvention: 'camelCaseOnly'
    }
  }
}
```

**generateScopedName 占位符**：

| 占位符 | 含义 |
|----|------|
| `[name]` | 文件名（不含扩展名） |
| `[local]` | 原始类名 |
| `[hash:base64:5]` | 5 位 base64 哈希（长度可调） |

也可以用函数自定义（参数为原始类名、文件路径、原始 CSS）：

```javascript
// vite.config.js
export default {
  css: {
    modules: {
      generateScopedName: (name, filename, css) => {
        const file = path.basename(filename, '.module.css')
        return `${file}_${name}__[hash:base64:5]`   // 例如 Button_button__a1B2c
      }
    }
  }
}
```

**scopeBehaviour 值**：

| 值 | 说明 |
|----|------|
| `'local'`（默认） | 类名作用域化，编译时附加哈希 |
| `'global'` | 全局模式，类名保持原样 |

**localsConvention 值**（默认不转换，含短横线的类名需用 `styles['foo-bar']` 访问）：

| 值 | 说明 |
|----|------|
| `'camelCase'` | 按 camelcase 规则转驼峰 |
| `'camelCaseOnly'` | 仅提供驼峰形式 |
| `'dashes'` | 仅按短横线转驼峰 |
| `'dashesOnly'` | 仅提供短横线转驼峰后的形式 |
| 函数 | `(className) => string` 自定义转换 |

> 💡 **提示：** Vite 6 起推荐使用 `*Only` 变体，`camelCase`、`dashes` 的"双形式同时导出"行为已与 `camelCaseOnly`、`dashesOnly` 对齐。

### preprocessorOptions

**类型**：`Record<string, any>`

**默认值**：`{}`

预处理器选项，按预处理器的键分别配置：`scss`、`sass`（缩进语法）、`less`、`styl`。

#### SCSS/SASS 选项

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      scss: {
        // Sass API 版本，见下表
        api: ['modern-compiler', 'modern'],

        // 注入全局变量/样式（每个样式文件编译前都会拼接这段内容）
        additionalData: `@use "@/styles/variables" as *;`,

        // 静默指定类型的废弃警告
        silenceDeprecations: ['import', 'global-builtin'],

        // 依赖文件不产生警告
        quietDeps: true,

        // 输出样式：'expanded' | 'compressed'
        outputStyle: 'expanded',

        // 其余 Sass 原生选项也可以直接透传
        verbose: false
      }
    }
  }
}
```

`additionalData` 的函数形式——Vite 的签名是 `(source, filename)`，没有 webpack 的 loaderContext：

```javascript
additionalData: (source, filename) => {
  // node_modules 内的文件不注入，避免编译变慢
  if (filename.includes('node_modules')) return source
  return `@use "@/styles/variables" as *;` + source
}
```

**api 选项**：

| 值 | 说明 |
|----|------|
| `'modern-compiler'` | 使用 sass-embedded 的编译器 API，性能最好 |
| `'modern'` | 使用 sass 包的现代 JS API |
| `'legacy'` | 旧版 JS API，已废弃（Vite 7 移除） |
| 数组形式 | 按顺序回退，如 `['modern-compiler', 'modern']` |

> 💡 **提示：** Vite 6 默认 `['modern-compiler', 'modern']`（装了 sass-embedded 用编译器 API，否则回退现代 JS API）；Vite 7 默认 `'modern-compiler'` 并移除了 `legacy`。老项目在 Vite 5/6 上如需旧 API 可显式设 `api: 'legacy'`。

#### Less 选项

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      less: {
        // 覆盖 Less 全局变量（主题定制常用）
        modifyVars: {
          'primary-color': '#1890ff',
          'border-radius': '4px'
        },

        // 内联全局变量
        globalVars: {},

        // 允许 Less 中使用内联 JavaScript
        javascriptEnabled: true,

        // Math 严格程度：'always' | 'parens-division' | 'strict'
        math: 'parens-division',

        // 相对路径解析
        relativeUrls: true
      }
    }
  }
}
```

#### Stylus 选项

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      styl: {
        // 定义变量（值为表达式或函数均可）
        define: {
          $version: '1.0.0',
          $env: process.env.NODE_ENV
        },

        // 额外导入，例如 import: ['nib']
        import: [],

        // Stylus 插件，例如 use: [nib()]（需自行安装并导入 nib）
        use: [],

        // 资源查找路径
        paths: []
      }
    }
  }
}
```

### devSourcemap

**类型**：`boolean`

**默认值**：`false`

开发环境是否为 CSS 生成 sourcemap，方便在 DevTools 中定位样式源文件；生产环境由 `build.sourcemap` 控制。

```javascript
// vite.config.js
export default {
  css: {
    devSourcemap: true   // 开发时可在 DevTools 中定位到源文件
  }
}
```

### postcss

**类型**：`string | PostcssConfigOptions`

**默认值**：`undefined`（自动从项目根查找 postcss.config.js 等配置文件）

PostCSS 配置。

```javascript
// vite.config.js
import autoprefixer from 'autoprefixer'

export default {
  css: {
    // 对象形式：内联配置，格式与 postcss.config.js 一致
    postcss: {
      plugins: [autoprefixer({ grid: true })]
    }
  }
}
```

```javascript
// 字符串形式：指定配置文件路径
postcss: './config/postcss.config.js'
```

> ⚠️ **注意：** 提供内联配置后，Vite 不再查找 postcss.config.js 等配置文件（内联配置优先）。插件"不生效"时，先确认改的是生效的那一份。

### lightningcss

**类型**：`LightningCSSOptions`

**默认值**：`undefined`

Lightning CSS 选项，仅在 `css.transformer: 'lightningcss'` 时生效，完整用法见下文「完整示例」。

> ⚠️ **注意：**
>
> - `lightningcss` 需要**显式安装**为依赖：`npm add -D lightningcss`
> - `css.transformer: 'lightningcss'` 是**实验性**功能，且与 CSS 预处理器（SCSS/Less/Stylus）不兼容
> - 启用后 PostCSS 插件不再执行；CSS 压缩需另外把 `build.cssMinify` 设为 `'lightningcss'`

## 可选值与使用方式

### 默认配置

```javascript
// vite.config.js — 不配置 css 时等价于以下内容
export default {
  css: {
    transformer: 'postcss',
    devSourcemap: false,
    preprocessorOptions: {},
    postcss: undefined   // 使用项目根的 postcss.config.js（若存在）
  }
}
```

### CSS Modules 自定义命名

```javascript
export default {
  css: {
    modules: {
      generateScopedName: (name, filename) => {
        const file = path.basename(filename, '.module.css')
        return `${file}_${name}__[hash:base64:5]`
      },
      localsConvention: 'camelCaseOnly'
    }
  }
}
```

### PostCSS 组合多个插件

```javascript
// vite.config.js
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

const isProd = process.env.NODE_ENV === 'production'

export default {
  css: {
    postcss: {
      plugins: [
        autoprefixer(),
        // 仅生产环境压缩
        ...(isProd ? [cssnano({ preset: 'default' })] : [])
      ]
    }
  }
}
```

其余典型组合（SCSS 全局变量注入、Less 主题变量、Lightning CSS）见上文各子属性小节与下文「完整示例」，不再重复。

## 生效后的结果示例

### CSS Modules 生效

```css
/* src/components/Button.module.css */
.button {
  background: blue;
  color: white;
}
```

```javascript
// 默认规则（generateScopedName 默认 '[name]__[local]___[hash:base64:5]'）
import styles from './Button.module.css'
// styles.button ≈ 'Button_button__xJ8f2'（文件名__类名___哈希）

// 若配置 generateScopedName: '[name]-[local]-[hash:base64:5]'
// styles.button ≈ 'Button-button-xJ8f2'
```

### SCSS 注入生效

```scss
// src/styles/variables.scss
$primary-color: #1890ff;
```

```scss
/* src/components/Button.scss — 无需手动 @use，已由 additionalData 自动注入 */
.button {
  background: $primary-color;
}
```

### Less modifyVars 生效

```less
// 配置 modifyVars: { 'primary-color': '#52c41a' } 后，
// 编译时 @primary-color 被替换为 #52c41a
.button {
  background: @primary-color;
}
```

### PostCSS 生效（Autoprefixer）

```css
/* 源代码 */
.button {
  display: flex;
  gap: 10px;
}
```

```css
/* Autoprefixer 按浏览器目标补全前缀后 */
.button {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  gap: 10px;
}
```

## 使用场景

### 1. 全局变量注入

**场景**：多个样式文件使用同一批变量/混入，避免每个文件手动 `@use`。

配置方式见上文 `preprocessorOptions.scss.additionalData`。

### 2. 开发调试定位样式

**场景**：DevTools 中的样式无法定位到源文件。

```javascript
// vite.config.js
export default {
  css: {
    devSourcemap: true
  }
}
```

### 3. Less 主题定制

**场景**：覆盖组件库的 Less 主题变量。

配置方式见上文 Less 选项的 `modifyVars`。

### 4. Lightning CSS 替代 PostCSS

**场景**：追求更快的 CSS 转换与压缩，且不使用 SCSS/Less。

完整配置见下文「完整示例」的 Lightning CSS 部分。

## 注意事项

### 1. additionalData 会注入每个文件

```javascript
// ✅ 正确：只注入变量声明
additionalData: `@use "@/styles/variables" as *;`

// ❌ 错误：注入大段样式/混入实现，每个文件都会重复编译这些内容
additionalData: `@use "@/styles/everything" as *;`
```

> ⚠️ **注意：** Sass 的 `@import` 已废弃，优先使用 `@use`；注入内容越少越好。

### 2. CSS Modules 只对 `.module.*` 文件生效

```javascript
// Button.module.css → 启用 CSS Modules
// Button.css        → 普通样式，不启用
```

> ⚠️ **注意：** `scopeBehaviour: 'local'` 本就是默认值，写上它**并不能**让普通 `.css` 文件启用 CSS Modules；想让某个文件走 CSS Modules，直接命名为 `xxx.module.css` 即可。

### 3. Sass API 版本选择

优先 `modern-compiler` 或 `modern`；`legacy` 已废弃且在 Vite 7 中移除，老项目迁移时应一并升级 Sass 写法。

### 4. PostCSS 配置只保留一份

内联的 `css.postcss` 优先于 postcss.config.js；两份配置并存时改动容易落空，团队应约定只用一种方式。

### 5. Lightning CSS 的限制

- 需显式安装 `lightningcss` 依赖
- 实验性，且不能与 SCSS/Less/Stylus 同时使用
- 启用后 PostCSS 插件不会被执行

### 6. 第三方库样式避免作用域化

```javascript
// vite.config.js
export default {
  css: {
    modules: {
      // node_modules 里的文件不做作用域化
      globalModulePaths: [/node_modules/]
    }
  }
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.cssCodeSplit` | 是否按 chunk 拆分 CSS |
| `build.cssMinify` | CSS 压缩方式；用 Lightning CSS 时设为 `'lightningcss'` |
| `build.cssTarget` | CSS 转换的浏览器目标 |
| `build.sourcemap` | 生产环境 sourcemap；与 `css.devSourcemap`（仅开发环境）分工不同，并非覆盖关系 |

## 完整示例

### Vue + SCSS + Tailwind

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  css: {
    // CSS Modules
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },

    // SCSS：自动注入全局变量
    preprocessorOptions: {
      scss: {
        additionalData: (source, filename) => {
          // 跳过依赖内的样式
          if (filename.includes('node_modules')) return source
          return `@use "@/styles/variables" as *;` + source
        }
      }
    },

    // PostCSS：Tailwind + Autoprefixer
    postcss: {
      plugins: [tailwindcss(), autoprefixer({ grid: true })]
    },

    // 开发环境 sourcemap
    devSourcemap: true
  }
})
```

### Vue + Less 主题变量

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  css: {
    preprocessorOptions: {
      less: {
        // 覆盖组件库的 Less 主题变量
        modifyVars: {
          'primary-color': '#1890ff',
          'link-color': '#1890ff',
          'border-radius': '4px',
          'font-size-base': '14px'
        },
        javascriptEnabled: true
      }
    }
  }
})
```

### Lightning CSS

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import browserslist from 'browserslist'
import { browserslistToTargets } from 'lightningcss'

export default defineConfig({
  css: {
    // 1. 切换转换器（实验性）
    transformer: 'lightningcss',
    // 2. Lightning CSS 选项
    lightningcss: {
      targets: browserslistToTargets(browserslist('>= 0.25%, not dead')),
      drafts: {
        customMedia: true,
        nesting: true
      }
    }
  },
  build: {
    // 3. 压缩也切换为 lightningcss
    cssMinify: 'lightningcss'
  }
})
```

### 多环境配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    css: {
      modules: {
        // 开发环境类名可读，生产环境用短哈希
        generateScopedName: isDev
          ? '[name]__[local]___[hash:base64:5]'
          : '[hash:base64:8]'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables" as *;`
        }
      },
      // 仅开发环境生成 CSS sourcemap
      devSourcemap: isDev,
      postcss: {
        plugins: [
          autoprefixer(),
          // 仅生产环境压缩
          ...(isDev ? [] : [cssnano({ preset: 'default' })])
        ]
      }
    }
  }
})
```

## 常见问题

### 问题 1：SCSS 变量未定义

**原因**：变量所在的文件没有被引入。

```javascript
// ✅ 解决：additionalData 全局注入
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `@use "@/styles/variables" as *;`
    }
  }
}
```

### 问题 2：CSS Modules 类名冲突

**原因**：自定义 generateScopedName 时缺少文件信息或哈希位不足。

```javascript
// ✅ 解决：保留 [local] 与哈希，保证唯一性
modules: {
  generateScopedName: (name, filename) => {
    const file = path.basename(filename, '.module.css')
    return `${file}_${name}__[hash:base64:5]`
  }
}
```

### 问题 3：PostCSS 插件不生效

**原因**：项目里同时存在内联配置与 postcss.config.js，被忽略的那份改动自然无效。

**解决**：只保留一份配置；确需指向其他文件时用 `css.postcss: './config/postcss.config.js'`。

### 问题 4：Less 变量覆盖无效

**原因**：组件库 Less 中使用了内联 JavaScript，而 `javascriptEnabled` 未开启。

```javascript
// ✅ 解决
css: {
  preprocessorOptions: {
    less: {
      javascriptEnabled: true,
      modifyVars: {
        'primary-color': '#1890ff'
      }
    }
  }
}
```
