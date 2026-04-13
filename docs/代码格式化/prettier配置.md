### 1. `Prettier`: 代码格式化工具

#### 2. 安装与使用
1. 第一步:  npm install --save-dev prettier;
2. 第二步:  执行命令，`prettier . --write`,使用 `--write` 参数会直接修改文件，将代码格式化;
3. 第三步： 创建配置文件 `.prettierrc`;
```
// https://prettier.nodejs.cn/docs/install/ : 官方文档
{
  "semi": true,               // 是否在语句末尾加分号
  "singleQuote": true,        // 是否使用单引号
  "tabWidth": 2,              // 一个 tab 等于几个空格
  "trailingComma": "es5",     // 是否添加尾随逗号
  "printWidth": 80            // 每行代码的建议最大宽度
  ......
}
```
4. 第四步: 创建`.prettierignore`文件，排除不需要格式化的目录
```
**/.git
**/.svn
**/.hg
**/node_modules
```
### 3. 编辑器集成 (以 VS Code 为例)
1. 安装插件: 在 VS Code 扩展商店搜索并安装 `Prettier - Code formatter`;
2. 配置自动格式化：在 VS Code 的设置（settings.json）中开启保存时自动格式化功能;
```
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```
3. 在hBuilderX集成: https://hx.dcloud.net.cn/Tutorial/extension/prettier

### 3. 可以与ESLint配合使用
* 在项目中需要安装 `eslint-config-prettier` ,关闭 ESLint 中与 Prettier 可能产生冲突的格式化规则，确保两者和谐共存
* 修改 ESLint 配置：在 ESLint 配置文件中，将 `"prettier"` 添加到 `"extends" `数组的**最后一项**
