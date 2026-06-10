# dress-up-h5

一个仅使用 HTML、CSS、JavaScript 实现的 H5 2D 换装小游戏。

## 运行方式

建议在项目目录启动任意静态文件服务器，例如：

```bash
python3 -m http.server 8080
```

然后访问 `http://localhost:8080`。

直接双击 `index.html` 也可以体验，代码会在浏览器无法读取本地 JSON 时自动使用备用数据。

## 素材规则

人物与所有服装图层均使用 `600 x 800 px` 透明 PNG，并保持人物位置一致。图层顺序在
`style.css` 中通过 `z-index` 控制：

1. 背景
2. 人物身体
3. 鞋子
4. 下装
5. 上衣
6. 发型
7. 饰品

## 重新生成占位图

生成脚本需要 Node.js 和 `sharp`。安装依赖后可重新生成项目自带的示意 PNG：

```bash
npm install sharp
node scripts/generate-placeholders.js
```
