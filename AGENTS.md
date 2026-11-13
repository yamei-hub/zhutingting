# AGENTS.md

## 新建 HTML 文件规则

新建任何 HTML 文件时，必须在文件顶部（`<!DOCTYPE html>` 之前或之后紧邻位置）加入注释，注释必须包含以下内容：

1. **作者**：朱婷婷
2. **建立时间**：创建文件时的日期（格式：YYYY-MM-DD）
3. **使用大模型**：生成该文件所用的大模型名称（如 GLM）
4. **功能名称**：该 HTML 文件实现的功能或页面用途

示例：

```html
<!DOCTYPE html>
<!--
  作者：朱婷婷
  建立时间：2026-11-04
  使用大模型：GLM
  功能名称：xxx 页面 / 功能描述
-->
<html lang="zh-CN">
...
</html>
```

## JavaScript 函数注释规则

在 HTML 文件或独立的 `.js` 文件中编写 JavaScript 函数时，必须在每个函数上方加上注释，说明该函数主要实现的功能。

示例：

```javascript
// 函数功能：校验表单输入，校验通过返回 true，否则提示错误并返回 false
function validateForm() {
  ...
}

/**
 * 函数功能：发送登录请求并处理响应
 */
async function login(username, password) {
  ...
}
```
