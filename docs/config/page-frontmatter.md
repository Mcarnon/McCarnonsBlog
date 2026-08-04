# 页面 Frontmatter

页面 Frontmatter 用于控制单个 Markdown 页面的元信息，例如页面模板、标题、封面、评论开关等。

完整字段以 Valaxy 文档为准。这里只整理博客主题中最常用、且 Lolimeow 会直接使用或继承支持的字段。

## 基础写法

```md
---
title: 文章标题
date: 2026-01-01
categories:
  - Notes
tags:
  - Valaxy
cover: /images/cover.webp
---
```

## 通用页面字段

| 字段              | 类型                                | 说明                     |
| ----------------- | ----------------------------------- | ------------------------ |
| `title`           | `string` / `Record<string, string>` | 页面标题                 |
| `date`            | `string` / `number` / `Date`        | 创建日期                 |
| `updated`         | `string` / `number` / `Date`        | 更新日期                 |
| `path`            | `string`                            | 自定义路径               |
| `lang`            | `string`                            | 页面语言                 |
| `author`          | `string`                            | 页面作者                 |
| `cover`           | `string`                            | 封面图片                 |
| `ogImage`         | `string`                            | Open Graph 图片          |
| `icon`            | `string`                            | 标题前图标               |
| `comment`         | `boolean`                           | 是否显示评论             |
| `toc`             | `boolean`                           | 是否显示目录             |
| `aside`           | `boolean`                           | 是否显示右侧侧边栏       |
| `sidebar`         | `boolean`                           | 是否显示左侧侧边栏       |
| `markdownClass`   | `string`                            | 自定义 Markdown 内容类名 |
| `pageTitleClass`  | `string`                            | 自定义页面标题类名       |
| `katex`           | `boolean`                           | 是否启用 KaTeX           |
| `codepen`         | `boolean`                           | 是否启用 CodePen 支持    |
| `medium_zoom`     | `boolean`                           | 是否启用图片缩放         |
| `codeHeightLimit` | `number`                            | 限制代码块高度，单位 px  |
| `from`            | `string` / `string[]`               | 客户端重定向源路径       |

## 文章字段

| 字段             | 类型                                  | 说明                                 |
| ---------------- | ------------------------------------- | ------------------------------------ |
| `categories`     | `string` / `string[]`                 | 分类，数组可表示多级分类             |
| `tags`           | `string[]`                            | 标签                                 |
| `excerpt`        | `string`                              | 手动指定摘要                         |
| `excerpt_type`   | `'md'` / `'text'` / `'html'` / `'ai'` | 摘要渲染类型                         |
| `type`           | `string`                              | 文章卡片类型，是否生效取决于主题支持 |
| `url`            | `string`                              | 覆盖文章链接，直接跳转               |
| `nav`            | `boolean`                             | 是否显示上一篇 / 下一篇导航          |
| `top`            | `number`                              | 置顶权重，数字越大越靠前             |
| `draft`          | `boolean`                             | 是否为草稿，通常仅开发时展示         |
| `hide`           | `'index'` / `boolean`                 | 是否隐藏文章                         |
| `time_warning`   | `boolean` / `number`                  | 文章过期提醒配置                     |
| `readingTime`    | `number`                              | 阅读时间，通常由统计功能生成         |
| `wordCount`      | `string`                              | 字数统计，通常由统计功能生成         |
| `postTitleClass` | `string`                              | 文章列表中的标题类名                 |

## 页面 layout

`layout` 用于指定当前 Markdown 页面使用哪个页面模板。

| layout       | 用途               | 常见路径                    |
| ------------ | ------------------ | --------------------------- |
| `post`       | 文章页             | `pages/posts/*.md`          |
| `about`      | 关于页             | `pages/about/index.md`      |
| `archives`   | 归档页             | `pages/archives/index.md`   |
| `categories` | 分类页             | `pages/categories/index.md` |
| `tags`       | 标签页             | `pages/tags/index.md`       |
| `links`      | 友链页             | `pages/links/index.md`      |
| `404`        | 404 页面           | `pages/404/index.md`        |
| `default`    | 普通 Markdown 页面 | 任意普通页面                |

## 关于页

```md
---
layout: about
title: 关于
description: 这里是关于页描述
cover: /images/about-cover.webp
---

这里可以写个人介绍、项目说明或普通 Markdown 内容。
```

## 友链页

```md
---
layout: links
title: 友链
cover: /images/links-cover.webp
comment: true
---

这里可以写友链申请说明。
```

## 归档页

```md
---
layout: archives
title: 归档
cover: /images/archives-cover.webp
---
```

## 分类页

```md
---
layout: categories
title: 分类
cover: /images/categories-cover.webp
---
```

## 标签页

```md
---
layout: tags
title: 标签
cover: /images/tags-cover.webp
---
```

## 404 页面

Lolimeow 内置了 `404` 布局。若你希望 GitHub Pages、Cloudflare Pages 等静态托管平台使用主题 404 页面，需要在站点侧添加实际页面：

```md
---
layout: 404
---
```

重新构建后，确认产物根目录存在 `404.html`。静态托管平台通常会读取这个文件作为自定义 404 页面。

## 加密相关字段

Valaxy 支持加密相关 Frontmatter 字段，是否可用取决于你的站点配置和插件能力。

| 字段               | 类型      | 说明         |
| ------------------ | --------- | ------------ |
| `encrypt`          | `boolean` | 是否启用加密 |
| `password`         | `string`  | 加密密码     |
| `password_hint`    | `string`  | 密码提示     |
| `gallery_password` | `string`  | 相册密码     |

## 相册与集合字段

这些字段通常用于相册、图库或集合类页面，是否展示取决于主题或插件支持。

| 字段          | 类型                 | 说明     |
| ------------- | -------------------- | -------- |
| `albums`      | `Album[]`            | 相册列表 |
| `photos`      | `Photo[]`            | 图片列表 |
| `collections` | `CollectionConfig[]` | 集合配置 |

## 更多字段

Frontmatter 是 Valaxy 的通用能力。更多字段、自动生成字段与插件扩展字段，请参考 [Valaxy 文档](https://valaxy.site/guide/config)。
