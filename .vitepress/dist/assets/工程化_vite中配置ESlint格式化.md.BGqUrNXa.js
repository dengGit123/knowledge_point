import{_ as a,c as n,o as i,ae as p}from"./chunks/framework.CkyPvWOg.js";const d=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"工程化/vite中配置ESlint格式化.md","filePath":"工程化/vite中配置ESlint格式化.md","lastUpdated":1773308029000}'),l={name:"工程化/vite中配置ESlint格式化.md"};function e(t,s,h,r,k,o){return i(),n("div",null,[...s[0]||(s[0]=[p(`<h3 id="_1-在vite中使用eslint-prettier" tabindex="-1">1. 在vite中使用<code>eslint</code> + <code>Prettier</code> <a class="header-anchor" href="#_1-在vite中使用eslint-prettier" aria-label="Permalink to &quot;1. 在vite中使用\`eslint\` + \`Prettier\`&quot;">​</a></h3><ul><li><ol><li>安装依赖<code>eslint</code>:</li></ol></li></ul><ul><li>npm install <code>eslint</code> <code>vite-plugin-eslint</code> --save-dev</li></ul><ul><li><ol start="2"><li>安装依赖<code>prettier</code>:</li></ol></li></ul><ul><li>npm install <code>prettier</code> <code>eslint-config-prettier</code> <code>eslint-plugin-prettier</code> --save-dev</li></ul><h3 id="_2-eslintrt-js" tabindex="-1">2 .eslintrt.js <a class="header-anchor" href="#_2-eslintrt-js" aria-label="Permalink to &quot;2 .eslintrt.js&quot;">​</a></h3><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">module</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">exports</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  extends: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;eslint:recommended&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;plugin:@typescript-eslint/recommended&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//TypeScript项目</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;plugin:vue/vue3-recommended&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//vue3项目</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // &#39;plugin:prettier/recommended&#39; 实际上做了三件事</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    //3.启用eslint-plugin-prettier</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    //2.设置prettier/prettier规则为&quot;error&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3.扩展eslint-config-prettier（关闭与Prettier冲突的规则）</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;plugin:prettier/recommended&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 必须放在最后;确保将Prettier配置放在extends数组的最后，这样Prettier的规则可以覆盖ESLint中冲突的规则</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  plugins: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;prettier&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  rules: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &#39;prettier/prettier&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;error&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_3-prettierrc-js" tabindex="-1">3. .prettierrc.js <a class="header-anchor" href="#_3-prettierrc-js" aria-label="Permalink to &quot;3. .prettierrc.js&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// .prettierrc.js</span></span>
<span class="line"><span>module.exports = {</span></span>
<span class="line"><span>  // 一行最多 80 字符</span></span>
<span class="line"><span>  printWidth: 80,</span></span>
<span class="line"><span>  // 使用 2 个空格缩进</span></span>
<span class="line"><span>  tabWidth: 2,</span></span>
<span class="line"><span>  // 不使用 tab 缩进，而使用空格</span></span>
<span class="line"><span>  useTabs: false,</span></span>
<span class="line"><span>  // 行尾需要有分号</span></span>
<span class="line"><span>  semi: true,</span></span>
<span class="line"><span>  // 使用单引号代替双引号</span></span>
<span class="line"><span>  singleQuote: true,</span></span>
<span class="line"><span>  // 对象的 key 仅在必要时用引号</span></span>
<span class="line"><span>  quoteProps: &#39;as-needed&#39;,</span></span>
<span class="line"><span>  // jsx 不使用单引号，而使用双引号</span></span>
<span class="line"><span>  jsxSingleQuote: false,</span></span>
<span class="line"><span>  // 尾随逗号</span></span>
<span class="line"><span>  trailingComma: &#39;es5&#39;,</span></span>
<span class="line"><span>  // 大括号内的首尾需要空格</span></span>
<span class="line"><span>  bracketSpacing: true,</span></span>
<span class="line"><span>  // jsx 标签的反尖括号需要换行</span></span>
<span class="line"><span>  jsxBracketSameLine: false,</span></span>
<span class="line"><span>  // 箭头函数，只有一个参数的时候，也需要括号</span></span>
<span class="line"><span>  arrowParens: &#39;always&#39;,</span></span>
<span class="line"><span>  // 每个文件格式化的范围是文件的全部内容</span></span>
<span class="line"><span>  rangeStart: 0,</span></span>
<span class="line"><span>  rangeEnd: Infinity,</span></span>
<span class="line"><span>  // 不需要写文件开头的 @prettier</span></span>
<span class="line"><span>  requirePragma: false,</span></span>
<span class="line"><span>  // 不需要自动在文件开头插入 @prettier</span></span>
<span class="line"><span>  insertPragma: false,</span></span>
<span class="line"><span>  // 使用默认的折行标准</span></span>
<span class="line"><span>  proseWrap: &#39;preserve&#39;,</span></span>
<span class="line"><span>  // 根据显示样式决定 html 要不要折行</span></span>
<span class="line"><span>  htmlWhitespaceSensitivity: &#39;css&#39;,</span></span>
<span class="line"><span>  // 换行符使用 lf</span></span>
<span class="line"><span>  endOfLine: &#39;lf&#39;</span></span>
<span class="line"><span>};</span></span></code></pre></div><h3 id="_4-添加忽略文件" tabindex="-1">4. 添加忽略文件 <a class="header-anchor" href="#_4-添加忽略文件" aria-label="Permalink to &quot;4. 添加忽略文件&quot;">​</a></h3><ul><li><h4 id="_1-eslintignore" tabindex="-1">1. .eslintignore <a class="header-anchor" href="#_1-eslintignore" aria-label="Permalink to &quot;1. .eslintignore&quot;">​</a></h4></li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>node_modules/</span></span>
<span class="line"><span>dist/</span></span>
<span class="line"><span>*.min.js</span></span>
<span class="line"><span>coverage/</span></span>
<span class="line"><span>*.config.js</span></span></code></pre></div><ul><li><h4 id="_2-prettierignore" tabindex="-1">2. .prettierignore <a class="header-anchor" href="#_2-prettierignore" aria-label="Permalink to &quot;2. .prettierignore&quot;">​</a></h4></li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// .prettierignore</span></span>
<span class="line"><span># 忽略目录</span></span>
<span class="line"><span>node_modules/</span></span>
<span class="line"><span>dist/</span></span>
<span class="line"><span>build/</span></span>
<span class="line"><span>coverage/</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 忽略文件</span></span>
<span class="line"><span>*.log</span></span>
<span class="line"><span>*.min.js</span></span>
<span class="line"><span>*.min.css</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 忽略特定文件</span></span>
<span class="line"><span>package-lock.json</span></span>
<span class="line"><span>yarn.lock</span></span>
<span class="line"><span>pnpm-lock.yaml</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 忽略配置文件</span></span>
<span class="line"><span>*.config.js</span></span>
<span class="line"><span>*.config.ts</span></span>
<span class="line"><span>vite.config.*</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 忽略文档文件</span></span>
<span class="line"><span>*.md</span></span>
<span class="line"><span>*.txt</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 忽略图片资源</span></span>
<span class="line"><span>*.png</span></span>
<span class="line"><span>*.jpg</span></span>
<span class="line"><span>*.jpeg</span></span>
<span class="line"><span>*.gif</span></span>
<span class="line"><span>*.svg</span></span></code></pre></div><h3 id="_5-在开发时自动修复eslint-可选" tabindex="-1">5. 在开发时自动修复<code>ESLint</code>(可选) <a class="header-anchor" href="#_5-在开发时自动修复eslint-可选" aria-label="Permalink to &quot;5. 在开发时自动修复\`ESLint\`(可选)&quot;">​</a></h3><ul><li>在开发服务器运行时，<code>ESLint</code> 错误将会在控制台显示，并且保存时自动修复</li></ul><ul><li>安装 <code>npm install vite-plugin-eslint --save-dev</code></li></ul><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  //vite.config.js</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { defineConfig } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vite&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> vue </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@vitejs/plugin-vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> eslintPlugin </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vite-plugin-eslint&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> default</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> defineConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  plugins: [</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">vue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">eslintPlugin</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  cache: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 启用缓存提高性能</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  fix: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自动修复</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  include: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;src/**/*.ts&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;src/**/*.tsx&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;src/**/*.vue&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  exclude: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;node_modules&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;dist&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  formatter: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;stylish&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 格式化输出</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  emitWarning: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 开发时显示警告</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  emitError: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 构建时错误会失败</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  failOnWarning: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 警告不导致构建失败</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  failOnError: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 错误导致构建失败</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  )],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><h3 id="_6-package-json-脚本-可选" tabindex="-1">6. package.json 脚本(可选) <a class="header-anchor" href="#_6-package-json-脚本-可选" aria-label="Permalink to &quot;6. package.json 脚本(可选)&quot;">​</a></h3><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  &quot;scripts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;build&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;npm run lint &amp;&amp; vite build&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;lint&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;eslint . --ext .js,.jsx,.ts,.tsx,.vue&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    &quot;format&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;prettier --write .&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="_7-编辑器集成" tabindex="-1">7.编辑器集成 <a class="header-anchor" href="#_7-编辑器集成" aria-label="Permalink to &quot;7.编辑器集成&quot;">​</a></h3><ul><li><ol><li>安装 eslint</li></ol></li><li><ol start="2"><li>Preitter-Code formatter</li></ol></li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// .vscode/settings.json</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;,</span></span>
<span class="line"><span>  &quot;editor.formatOnSave&quot;: true,</span></span>
<span class="line"><span>  &quot;editor.codeActionsOnSave&quot;: {</span></span>
<span class="line"><span>    &quot;source.fixAll.eslint&quot;: true,</span></span>
<span class="line"><span>    &quot;source.fixAll.stylelint&quot;: true</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  &quot;[javascript]&quot;: {</span></span>
<span class="line"><span>    &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  &quot;[typescript]&quot;: {</span></span>
<span class="line"><span>    &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  &quot;[vue]&quot;: {</span></span>
<span class="line"><span>    &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  &quot;[json]&quot;: {</span></span>
<span class="line"><span>    &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  &quot;[jsonc]&quot;: {</span></span>
<span class="line"><span>    &quot;editor.defaultFormatter&quot;: &quot;esbenp.prettier-vscode&quot;</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>  &quot;eslint.validate&quot;: [</span></span>
<span class="line"><span>    &quot;javascript&quot;,</span></span>
<span class="line"><span>    &quot;javascriptreact&quot;,</span></span>
<span class="line"><span>    &quot;typescript&quot;,</span></span>
<span class="line"><span>    &quot;typescriptreact&quot;,</span></span>
<span class="line"><span>    &quot;vue&quot;</span></span>
<span class="line"><span>  ]</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="_8-git-hooks-配置" tabindex="-1">8.Git Hooks 配置 <a class="header-anchor" href="#_8-git-hooks-配置" aria-label="Permalink to &quot;8.Git Hooks 配置&quot;">​</a></h3><ul><li><h4 id="_1-使用-husky" tabindex="-1">1. 使用 husky <a class="header-anchor" href="#_1-使用-husky" aria-label="Permalink to &quot;1. 使用 husky&quot;">​</a></h4></li></ul><ul><li><ol><li>安装husky</li></ol></li><li>npm install --save-dev <code>husky</code></li><li><ol start="2"><li>执行命令生成<code>.husky</code>目录</li></ol></li><li>npx husky install</li><li><ol start="3"><li>生成<code>pre-commit</code>文件: <code>git commit</code>的时候会执行的命令</li></ol></li><li>npm husky add .husky/pre-commit &#39;npm run lint&#39;</li></ul>`,26)])])}const E=a(l,[["render",e]]);export{d as __pageData,E as default};
