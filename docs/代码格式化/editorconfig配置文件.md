### `editorconfig: ` 可以帮助开发者在不同的编辑器和IDE之间定义和维护一致的代码风格

### 1. 在项目根目录创建   `.editorconfig`文件
```
root = true

[*]
indent_style = tab
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[package.json]
indent_style = space
indent_size = 2

......

```
### 2. 在hBuilderX 生效: https://hx.dcloud.net.cn/Tutorial/UserGuide/editorconfig
* 在【设置】中，有个editorconfig开关，您可以自由选择开启与关闭`.editorconfig`

### 3. 在 vs code生效
* 安装插件: `EditorConfig for VS code`