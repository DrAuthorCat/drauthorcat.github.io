# Content Maintenance Guide

这份说明用于日后给个人主页添加或修改内容。当前站点是纯静态结构，不需要打包工具。GitHub Pages 会直接发布这些 HTML、CSS、JS、图片和字体文件。

## 1. `.nojekyll` 是什么

`.nojekyll` 是一个空文件。它告诉 GitHub Pages 不要用 Jekyll 处理这个站点，而是按普通静态文件原样发布。

我加它的原因是：

1. 当前网站已经是完整的静态站点，入口是 `index.html`，移动端入口是 `mobile.html`。
2. 内容由 `assets/js/main.js` 和 `assets/js/mobile.js` 通过 `fetch()` 加载 HTML 片段。
3. 这个项目不需要 Jekyll 的模板、主题、Markdown 转换或构建过程。
4. 关闭 Jekyll 可以减少发布时的额外处理，让 GitHub Pages 直接托管现有文件。

如果以后你决定把站点改成 Jekyll 博客或 Jekyll 模板站点，再删除 `.nojekyll`。

## 2. 文件结构

主要文件如下：

```text
github-pages-ready/
  index.html
  mobile.html
  404.html
  robots.txt
  sitemap.xml
  assets/
    css/
      styles.css
      mobile.css
    js/
      main.js
      mobile.js
    img/
    fonts/
  content/
    left/
    middle/
    mobile/
    profile/
```

各部分作用如下：

```text
index.html                  桌面端入口
mobile.html                 移动端入口
assets/css/styles.css       桌面端样式
assets/css/mobile.css       移动端样式
assets/js/main.js           桌面端路由和内容加载
assets/js/mobile.js         移动端路由和内容加载
assets/img/                 图片文件
content/left/               Short Story 栏目的内容
content/middle/             Novel 栏目的内容
content/profile/about.html  桌面端 About Me 内容
content/mobile/cv.html      移动端 CV 内容
content/mobile/drawer-content.json  移动端抽屉菜单内容
```

## 3. 修改个人信息

桌面端个人信息在：

```text
content/profile/about.html
```

移动端首页个人信息在：

```text
assets/js/mobile.js
```

需要修改 `profileTemplate()` 里的姓名、邮箱、Substack 链接和个人简介。

邮箱还出现在两个 JS 文件里：

```text
assets/js/main.js
assets/js/mobile.js
```

搜索 `hello@example.com`，替换成真实邮箱。

## 4. 添加一篇新的 Short Story

假设要添加一篇叫 `new-story` 的短篇。

第一步，新增内容文件：

```text
content/left/new-story.html
```

可以复制现有文章文件作为模板，例如：

```text
content/left/i-killed-a-fly.html
```

第二步，在桌面端路由中注册它。打开：

```text
assets/js/main.js
```

在 `contentPaths.left` 中添加：

```js
"new-story": "content/left/new-story.html",
```

在 `hrefRoutes` 中添加：

```js
"left-new-story": ["left", "new-story"],
```

第三步，在移动端路由中注册它。打开：

```text
assets/js/mobile.js
```

在 `fragments` 中添加：

```js
"new-story": "content/left/new-story.html",
```

在 `routeMap` 中添加：

```js
"left-new-story": "story-new-story",
```

在 `fragmentForRoute()` 的 `detailMap` 中添加：

```js
"story-new-story": "new-story",
```

第四步，把它加入移动端 Short Story 菜单。打开：

```text
content/mobile/drawer-content.json
```

在 `shortStory.items` 数组中新增一项：

```json
{
  "title": "3. New Story",
  "image": "new-story.png",
  "imageAlt": "Short description of the image.",
  "route": "story-new-story",
  "description": "A short preview sentence for the drawer.",
  "linkLabel": "[More..]"
}
```

第五步，如果这篇文章有封面图，把图片放进：

```text
assets/img/
```

图片名要和 JSON 里的 `image` 一致。

## 5. 添加新的 Novel 章节

假设要添加 `chapter-3`。

第一步，新增章节文件：

```text
content/middle/chapter-3.html
```

第二步，在桌面端路由中注册它。打开：

```text
assets/js/main.js
```

在 `contentPaths.middle` 中添加：

```js
"chapter-3": "content/middle/chapter-3.html",
```

在 `hrefRoutes` 中添加：

```js
"middle-chapter-3": ["middle", "chapter-3"],
```

第三步，在移动端路由中注册它。打开：

```text
assets/js/mobile.js
```

在 `fragments` 中添加：

```js
"chapter-3": "content/middle/chapter-3.html",
```

在 `routeMap` 中添加：

```js
"middle-chapter-3": "novel-chapter-3",
```

在 `fragmentForRoute()` 的 `detailMap` 中添加：

```js
"novel-chapter-3": "chapter-3",
```

第四步，在章节目录里加入口。打开：

```text
content/middle/chapter-list.html
```

参照已有章节链接，新增一个指向 `middle-chapter-3` 的链接。

## 6. 添加或替换图片

图片统一放在：

```text
assets/img/
```

如果图片通过普通 HTML 使用，直接写：

```html
<img src="assets/img/example.png" alt="Clear image description.">
```

如果图片通过 `media-item` 使用，需要在 JS 里登记图片映射。桌面端和移动端各有一份 `hashImages`：

```text
assets/js/main.js
assets/js/mobile.js
```

新增格式如下：

```js
SOME_HASH_VALUE: ["example.png", "Clear image description."],
```

现有 `media-item` 多数来自 Cargo 导出的结构。为了少改代码，建议优先复用现有写法和现有 hash 映射。

## 7. 修改首页标题和搜索引擎信息

主要改这两个文件：

```text
index.html
mobile.html
```

常见需要修改的内容包括：

```html
<title>Josiah Ferrer</title>
<meta name="description" content="...">
<link rel="canonical" href="https://drauthorcat.github.io/">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="...">
<meta property="og:image" content="...">
```

如果更换网站地址，也要同步修改：

```text
robots.txt
sitemap.xml
404.html
README.md
```

搜索 `drauthorcat.github.io`，确认它和真实网址一致。

## 8. sitemap 和 Google 收录

当前 `sitemap.xml` 只列出首页：

```text
https://drauthorcat.github.io/
```

原因是当前文章和章节主要通过 JS 在同一个页面中切换，不是独立 URL。Google 可以看到公开页面，但单篇文章不一定会作为独立搜索结果出现。

如果以后想让每篇文章和章节都更容易被搜索引擎单独收录，建议为每篇内容建立独立 HTML 页面，例如：

```text
stories/i-killed-a-fly.html
novel/chapter-1.html
```

然后把这些完整 URL 加入 `sitemap.xml`。

## 9. 本地检查

在发布前，可以在 `github-pages-ready` 的上一级目录运行：

```sh
python3 -m http.server 8026 --directory github-pages-ready
```

然后访问：

```text
http://127.0.0.1:8026/
http://127.0.0.1:8026/mobile.html
http://127.0.0.1:8026/robots.txt
http://127.0.0.1:8026/sitemap.xml
```

检查重点：

1. 桌面端三栏是否正常显示。
2. 移动端是否自动或手动能打开。
3. 图片是否显示。
4. 新增文章或章节的链接是否能打开。
5. 浏览器控制台是否有 404 或 JS 报错。
6. `robots.txt` 和 `sitemap.xml` 是否能直接访问。

## 10. 发布前清单

发布前逐项确认：

1. 仓库名是 `<你的 GitHub 用户名>.github.io`。
2. `github-pages-ready/` 里面的文件位于仓库根目录。
3. `index.html` 在仓库根目录。
4. `.nojekyll` 保留在仓库根目录。
5. 所有站点地址都使用 `https://drauthorcat.github.io/`。
6. 邮箱和个人简介不是占位内容。
7. 字体有公开网页使用和公开仓库再分发授权。
8. `robots.txt` 允许抓取。
9. `sitemap.xml` 使用真实网址。
10. 发布后在 Google Search Console 提交 sitemap。
