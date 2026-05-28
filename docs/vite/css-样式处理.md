# css 配置

## 定义

`css` 配置 CSS 相关行为，包括 CSS Modules、预处理器、PostCSS 和 Lightning CSS。

**类型**：

```typescript
{
  modules?: CssModuleOptions
  preprocessorOptions?: { scss?: SassOptions; less?: LessOptions; styl?: StylusOptions }
  devSourcemap?: boolean
  postcss?: string | PostcssConfigOptions
  lightningcss?: false | LightningCssOptions
}
```

**默认值**：

```javascript
{
  modules: {
    scopeBehaviour: 'local',
    globalModulePaths: [],
    generateScopedName: undefined,
    hashPrefix: '',
    localsConvention: undefined
  },
  preprocessorOptions: {},
  devSourcemap: false,
  postcss: undefined,
  lightningcss: false
}
```

## 子属性详解

### modules

**类型**：`false | CssModuleOptions`

**默认值**：对 `.module.css` / `.module.scss` 等文件自动生效

CSS Modules 配置。

```javascript
// 禁用 CSS Modules
modules: false

// 启用（默认对 .module.css 文件生效）
modules: {}

// 对象形式 - 完整配置
modules: {
  // 作用域行为
  scopeBehaviour: 'local',      // 'local' 或 'global'
  scopeBehaviour: 'global',     // 全局模式

  // 全局模块路径（这些文件中的类名不生成哈希）
  globalModulePaths: [],
  globalModulePaths: [/node_modules/],
  globalModulePaths: [
    /node_modules\/bootstrap/,
    path.resolve(__dirname, 'src/styles/global.css')
  ],

  // 生成类名的模式
  generateScopedName: 'abc_[hash:base64:5]',

  // 使用函数生成类名
  generateScopedName: (name, filename, css) => {
    return `${name}__[hash:base64:5]`
  },

  // 更复杂的类名生成
  generateScopedName: (name, filename, css) => {
    const file = path.basename(filename, '.css')
    return `${file}_${name}__[hash:base64:5]`
  },

  // 哈希前缀
  hashPrefix: 'prefix',

  // localsConvention - 转换类名命名风格
  localsConvention: 'camelCase',       // 驼峰命名
  localsConvention: 'camelCaseOnly',   // 仅驼峰
  localsConvention: 'dashes',          // 短横线
  localsConvention: 'dashesOnly',      // 仅短横线

  // 使用函数自定义转换
  localsConvention: (originalClassName) => {
    return originalClassName.replace(/-/g, '_')
  }
}
```

**scopeBehaviour 值**：

| 值 | 说明 |
|----|------|
| `'local'` | 默认启用作用域，类名生成哈希 |
| `'global'` | 全局模式，类名不生成哈希 |

**localsConvention 值**：

| 值 | 说明 |
|----|------|
| `'camelCase'` | 转换为驼峰，保留原始短横线形式 |
| `'camelCaseOnly'` | 仅驼峰形式 |
| `'dashes'` | 保留短横线，同时生成驼峰 |
| `'dashesOnly'` | 仅短横线形式 |

### preprocessorOptions

**类型**：`{ scss?: SassOptions; less?: LessOptions; styl?: StylusOptions }`

**默认值**：`{}`

预处理器选项。

#### SCSS/SASS 选项

```javascript
preprocessorOptions: {
  scss: {
    // API 版本
    api: 'modern-compiler',    // 推荐：使用现代编译器 API
    api: 'legacy',             // 旧版 API
    api: ['modern-compiler', 'legacy'], // 降级到旧版

    // 注入全局变量/样式
    additionalData: `@import "@/styles/variables.scss";`,

    // 使用函数注入
    additionalData: (content, loaderContext) => {
      const { resourcePath } = loaderContext
      if (resourcePath.includes('node_modules')) {
        return content
      }
      return `@import "@/styles/variables.scss";` + content
    },

    // 静默警告
    silenceDeprecations: ['import', 'global-builtin'],
    quietDeps: true,
    verbose: false,

    // 输出样式
    outputStyle: 'expanded',
    outputStyle: 'compressed',

    // 源码嵌入
    sourceMap: true,
    sourceMapEmbed: true,

    // 其他
    includePaths: [path.resolve(__dirname, 'src/styles')],
    importer: [customImporter()]
  },

  sass: {
    // 与 scss 相同的选项
    api: 'modern-compiler',
    indentedSyntax: true  // 启用缩进语法（.sass 文件）
  }
}
```

**api 选项**：

| 值 | 说明 |
|----|------|
| `'modern-compiler'` | 使用现代编译器 API（推荐，性能更好） |
| `'legacy'` | 使用旧版 JS API |
| `['modern-compiler', 'legacy']` | 优先现代，失败降级到旧版 |

#### Less 选项

```javascript
preprocessorOptions: {
  less: {
    // 修改全局变量
    modifyVars: {
      'primary-color': '#1890ff',
      'border-radius': '4px',
      'font-size-base': '14px'
    },

    // 使用函数动态修改
    modifyVars: (theme) => {
      return {
        ...theme,
        'primary-color': '#1890ff'
      }
    },

    // 全局变量文件
    globalVars: {
      'hack': `true; @import "your-less-file.less";`
    },

    // JavaScript 支持
    javascriptEnabled: true,

    // Math 模式
    math: 'always',            // 总是使用 Math
    math: 'parens-division',   // 除法需要括号
    math: 'strict',            // 严格模式

    // 相对路径
    relativeUrls: true,
    rootpath: 'path/to/root',

    // 其他
    strictUnits: false,
    ieCompat: true
  }
}
```

#### Stylus 选项

```javascript
preprocessorOptions: {
  styl: {
    // 定义变量
    define: {
      $version: '1.0.0',
      $env: process.env.NODE_ENV
    },

    // 使用函数定义
    define: {
      'custom-fn': () => {
        return new stylus.nodes.Unit(10, 'px')
      }
    },

    // 导入路径
    import: ['nib'],
    import: [path.resolve(__dirname, 'src/styles/mixins')],

    // 其他选项
    paths: [path.resolve(__dirname, 'src/styles')],
    use: [nib()],

    // 其他
    'include css': true,
    hoistAtRules: true
  }
}
```

### devSourcemap

**类型**：`boolean`

**默认值**：`false`

开发环境是否启用 CSS sourcemap。

```javascript
devSourcemap: false  // 不生成（默认）
devSourcemap: true   // 生成 sourcemap

// 结合环境变量
devSourcemap: process.env.NODE_ENV === 'development'
```

### postcss

**类型**：`string | PostcssConfigOptions`

**默认值**：`undefined`（自动查找 postcss.config.js）

PostCSS 配置。

```javascript
// 字符串形式 - 指定配置文件路径
postcss: './postcss.config.js'
postcss: 'postcss.config.js'
postcss: path.resolve(__dirname, 'config/postcss.js')

// 对象形式 - 直接配置
postcss: {
  // 插件
  plugins: [
    require('autoprefixer'),
    require('tailwindcss')
  ],

  // 或使用数组形式（带选项）
  plugins: [
    require('tailwindcss'),
    require('autoprefixer')({
      overrideBrowserslist: ['> 1%', 'last 2 versions']
    })
  ]
}

// 完整配置
postcss: {
  plugins: [
    // Tailwind CSS
    require('tailwindcss')('./tailwind.config.js'),

    // Autoprefixer
    require('autoprefixer')({
      grid: true,
      flexbox: 'no-2009'
    }),

    // PostCSS Preset Env
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'nesting-rules': true
      }
    }),

    // 其他插件
    require('postcss-flexbugs-fixes'),
    require('postcss-normalize')()
  ]
}

// 条件插件
postcss: {
  plugins: [
    process.env.NODE_ENV === 'production'
      ? require('cssnano')
      : null
  ].filter(Boolean)
}
```

### lightningcss

**类型**：`false | LightningCssOptions`

**默认值**：`false`

使用 Lightning CSS 处理（替代某些 PostCSS 功能）。

```javascript
// 禁用（默认）
lightningcss: false

// 启用基本配置
lightningcss: true

// 对象形式 - 完整配置
lightningcss: {
  // 目标浏览器
  targets: {
    safari: (15, 2),
    ios_saf: (15, 2),
    chrome: 100,
    firefox: 90
  },

  // 或使用 browserslist 格式
  targets: {
    browsers: ['>= 0.25%', 'not dead']
  },

  // 或使用字符串
  targets: '>= 0.25%, not dead',

  // 缩小/压缩
  minify: true,
  minify: false,

  // 其他选项
  drafts: {
    customMediaQueries: true
  },

  // CSS 模块
  cssModules: true,

  // 其他
  analyzeDependencies: false
}
```

## 可选值与使用方式

### 默认配置

```javascript
// vite.config.js
export default {
  css: {
    modules: {},
    preprocessorOptions: {},
    devSourcemap: false,
    postcss: undefined,
    lightningcss: false
  }
}
```

### CSS Modules 配置

```javascript
export default {
  css: {
    modules: {
      generateScopedName: (name, filename) => {
        const file = path.basename(filename, '.module.css')
        return `${file}_${name}__[hash:base64:5]`
      },
      localsConvention: 'camelCaseOnly',
      hashPrefix: 'my-app'
    }
  }
}
```

### SCSS 全局变量注入

```javascript
export default {
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@/styles/variables" as *;`
      }
    }
  }
}
```

### 根据文件注入不同变量

```javascript
export default {
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: (content, loaderContext) => {
          const { resourcePath } = loaderContext
          if (resourcePath.includes('node_modules')) {
            return content
          }
          return `@use "@/styles/variables" as *;` + content
        }
      }
    }
  }
}
```

### Less 主题变量

```javascript
export default {
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#1890ff',
          'link-color': '#1890ff',
          'border-radius': '4px'
        },
        javascriptEnabled: true
      }
    }
  }
}
```

### PostCSS 完整配置

```javascript
export default {
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')({
          grid: true
        }),
        process.env.NODE_ENV === 'production'
          ? require('cssnano')({
              preset: 'default'
            })
          : null
      ].filter(Boolean)
    }
  }
}
```

### Lightning CSS 配置

```javascript
export default {
  css: {
    lightningcss: {
      targets: '>= 0.25%, not dead',
      minify: true,
      drafts: {
        customMediaQueries: true
      }
    }
  }
}
```

### 综合配置

```javascript
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    },
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@/styles/variables" as *;`
      }
    },
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    },
    devSourcemap: true
  }
})
```

## 生效后的结果示例

### CSS Modules 生效

```css
/* src/styles/Button.module.css */
.button {
  background: blue;
  color: white;
}
```

```javascript
// 配置前
import styles from './Button.module.css'
// styles.button = "button"

// 配置后（generateScopedName）
import styles from './Button.module.css'
// styles.button = "Button_button__abc123"
```

### SCSS 注入生效

```scss
// src/styles/variables.scss
$primary-color: #1890ff;
```

```scss
/* src/components/Button.scss */
// 不需要手动导入，自动注入
.button {
  background: $primary-color;  // 可以直接使用
}
```

### Less modifyVars 生效

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#52c41a'  // 绿色
        }
      }
    }
  }
}
```

```less
/* Ant Design 变量被覆盖 */
.button {
  background: @primary-color;  // 变成绿色
}
```

### PostCSS 生效

```css
/* 源代码 */
.button {
  display: flex;
  gap: 10px;
}
```

```css
/* Autoprefixer 处理后 */
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

**场景**：多个样式文件需要使用相同的变量

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@/styles/variables" as *;`
      }
    }
  }
}
```

### 2. CSS Modules 自定义命名

**场景**：需要自定义类名格式便于调试

```javascript
// vite.config.js
export default {
  css: {
    modules: {
      generateScopedName: (name, filename) => {
        const file = path.basename(filename, '.module.css')
        return `${file}_${name}__[hash:base64:5]`
      }
    }
  }
}
```

### 3. PostCSS 集成

**场景**：集成 Tailwind CSS 和 Autoprefixer

```javascript
// vite.config.js
export default {
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    }
  }
}
```

### 4. 开发调试

**场景**：开发时需要定位样式源文件

```javascript
// vite.config.js
export default {
  css: {
    devSourcemap: true
  }
}
```

### 5. Less 主题定制

**场景**：定制 UI 库主题变量

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#722ed1',
          'border-radius': '8px'
        },
        javascriptEnabled: true
      }
    }
  }
}
```

### 6. Lightning CSS

**场景**：使用 Lightning CSS 替代 PostCSS

```javascript
// vite.config.js
export default {
  css: {
    lightningcss: {
      targets: '>= 0.25%, not dead',
      minify: true
    }
  }
}
```

## 注意事项

### 1. additionalData 性能影响

```javascript
// ⚠️ 注意：additionalData 会注入到每个样式文件
// 避免注入大量内容

// ✅ 正确：仅导入变量
additionalData: `@use "@/styles/variables" as *;`

// ❌ 错误：注入大量样式
additionalData: `@import "@/styles/mixins"; @import "@/styles/functions"; ...`
```

### 2. CSS Modules 默认行为

```javascript
// CSS Modules 默认对 .module.* 文件生效
// Button.module.css → 启用 CSS Modules
// Button.css → 不启用 CSS Modules

// 对所有 .css 文件启用需要配置
modules: {
  scopeBehaviour: 'local'  // 所有文件都启用
}
```

### 3. SCSS API 版本

```javascript
// ✅ 推荐使用现代编译器 API
api: 'modern-compiler'

// ⚠️ 旧版 API 性能较差
api: 'legacy'

// ✅ 降级配置
api: ['modern-compiler', 'legacy']
```

### 4. PostCSS 配置文件

```javascript
// 默认会自动查找以下配置文件
// postcss.config.js
// .postcssrc.js
// postcss.config.ts

// 如果找到配置文件，vite.config.js 中的 postcss 配置会被忽略
// 除非明确指定 postcss: '...'
```

### 5. Lightning CSS 兼容性

```javascript
// Lightning CSS 与某些 PostCSS 插件可能不兼容
// 启用后，PostCSS 插件不会执行

lightningcss: true  // PostCSS 插件不会生效
```

### 6. 全局模块路径

```javascript
// 确保第三方库的样式不被 CSS Modules 处理
modules: {
  globalModulePaths: [/node_modules/]
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.cssCodeSplit` | CSS 代码分割配置 |
| `build.cssMinify` | CSS 压缩配置（优先级高于 lightningcss.minify） |
| `build.sourcemap` | 生产环境 sourcemap（优先级高于 `css.devSourcemap`） |
| `build.cssTarget` | CSS 浏览器目标（影响 PostCSS 转换） |
| `resolve.extensions` | 影响样式文件的扩展名解析 |

## 完整示例

### Vue + SCSS + Tailwind

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@styles': path.resolve(__dirname, './src/styles')
    }
  },

  css: {
    // CSS Modules 配置
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]_[local]_[hash:base64:5]'
    },

    // SCSS 配置
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: (content, loaderContext) => {
          // 跳过 node_modules
          if (loaderContext.includes('node_modules')) {
            return content
          }
          return `@use "@styles/variables" as *;` + content
        }
      }
    },

    // PostCSS 配置
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')({
          grid: true,
          flexbox: 'no-2009'
        })
      ]
    },

    // 开发环境 sourcemap
    devSourcemap: true
  }
})
```

### React + Less + Ant Design

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  css: {
    preprocessorOptions: {
      less: {
        // 修改 Ant Design 主题
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

### Lightning CSS 配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    // 使用 Lightning CSS 替代 PostCSS
    lightningcss: {
      targets: '>= 0.25%, not dead',
      minify: true,
      drafts: {
        customMediaQueries: true,
        nesting: true
      }
    },

    // 如果使用 Lightning CSS，禁用 PostCSS
    postcss: undefined
  }
})
```

### 多环境配置

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'

  return {
    css: {
      modules: {
        generateScopedName: isDev
          ? '[name]_[local]_[hash:base64:5]'
          : '[hash:base64:8]'
      },

      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@/styles/variables" as *;`
        }
      },

      // 仅开发环境生成 sourcemap
      devSourcemap: isDev,

      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
          // 仅生产环境压缩
          isDev ? null : require('cssnano')
        ].filter(Boolean)
      }
    }
  }
})
```

## 常见问题

### 问题 1：SCSS 变量未定义

**原因**：未配置 additionalData

```javascript
// ✅ 解决
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `@use "@/styles/variables" as *;`
    }
  }
}
```

### 问题 2：CSS Modules 类名冲突

**原因**：generateScopedName 配置不当

```javascript
// ✅ 解决：确保唯一性
modules: {
  generateScopedName: (name, filename) => {
    const file = path.basename(filename, '.module.css')
    return `${file}_${name}__[hash:base64:5]`
  }
}
```

### 问题 3：PostCSS 插件不生效

**原因**：存在 postcss.config.js 配置文件

```javascript
// ✅ 解决：删除配置文件或在 vite.config.js 中明确指定
css: {
  postcss: './postcss.config.js'
}
```

### 问题 4：Less 变量修改无效

**原因**：未启用 JavaScript

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

## 官方文档

[Shared Options: css - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#css-options)

[CSS Features - Vite 官方文档](https://cn.vitejs.dev/guide/features.html#css-features)
