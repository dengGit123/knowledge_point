# css 配置

## 定义

`css` 配置 CSS 相关行为。

## 属性层级结构

```
css
├── modules
│   ├── scopeBehaviour
│   ├── globalModulePaths
│   ├── generateScopedName
│   ├── hashPrefix
│   └── localsConvention
├── preprocessorOptions
│   ├── scss / sass
│   │   ├── api
│   │   ├── additionalData
│   │   ├── silenceDeprecations
│   │   ├── includePaths
│   │   └── importer
│   ├── less
│   │   ├── modifyVars
│   │   ├── globalVars
│   │   ├── math
│   │   └── javascriptEnabled
│   └── styl
│       ├── define
│       ├── import
│       ├── paths
│       └── use
├── devSourcemap
├── postcss
│   └── plugins
└── lightningcss
    ├── targets
    ├── minify
    └── drafts
```

## 用法

```javascript
// vite.config.js
export default {
  css: {
    modules: {},
    preprocessorOptions: {},
    devSourcemap: false,
    postcss: '',
    lightningcss: {}
  }
}
```

## 子属性详解

### modules

**类型**：`false | CssModuleOptions`

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

### preprocessorOptions

**类型**：`{ scss?: SassOptions; less?: LessOptions; styl?: StylusOptions }`

预处理器选项。

#### SCSS/SASS 选项

```javascript
preprocessorOptions: {
  scss: {
    // API 版本
    api: 'modern-compiler',    // 推荐：使用现代编译器 API
    api: 'legacy',             // 旧版 API
    api: 'modern-compiler', 'legacy', // 降级到旧版

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

    // 其他 sass 选项
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

    // 其他选项
    math: 'always',     // 总是使用 Math
    math: 'parens-division',  // 除法需要括号
    math: 'strict',     // 严格模式

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

## 作用

- 配置 CSS Modules
- 配置 CSS 预处理器
- 配置 PostCSS
- 启用 CSS sourcemap

## 使用场景

1. **全局变量**：在 SASS/Less 中注入全局变量
2. **CSS Modules**：自定义类名生成规则
3. **PostCSS**：集成 Tailwind、Autoprefixer 等
4. **调试**：启用 sourcemap 定位样式源文件

## 注意事项

- `preprocessorOptions.scss.api` 推荐使用 `'modern-compiler'`，性能更好
- `additionalData` 会注入到每个样式文件，注意性能影响
- CSS Modules 默认对 `.module.css` / `.module.scss` 等文件生效
- `lightningcss` 与某些 PostCSS 插件可能不兼容

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.cssCodeSplit` | CSS 代码分割配置 |
| `build.cssMinify` | CSS 压缩配置 |
| `build.sourcemap` | 生产环境 sourcemap（优先级高于 `css.devSourcemap`） |
| `build.cssTarget` | CSS 浏览器目标（影响 PostCSS 转换） |

## 示例

```javascript
// CSS Modules 配置
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

// SASS 全局变量注入
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

// 根据文件注入不同变量
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

// Less 主题变量
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

// PostCSS 完整配置
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

// Lightning CSS 配置
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

// 综合配置
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
