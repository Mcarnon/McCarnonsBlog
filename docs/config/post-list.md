# 文章列表

文章列表配置由 `themeConfig.postList` 控制，只负责首页文章卡片展示。分页方式请阅读 [分页](/config/pagination)。

## 标题

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    postList: {
      title: 'Discovery',
    },
  },
})
```

## 封面策略

主题会按以下顺序尝试文章卡片封面：

1. 文章 Frontmatter 中的 `cover`
2. `postList.coverApiUrls`，仅当 `coverRandom` 为 `true` 时启用
3. `postList.coverFallback`
4. 所有候选均失败后，退化为纯文本卡片

主题会根据文章路径等稳定标识确定 API 和 fallback 的候选起点，再依次尝试列表中的其余地址。文章具备稳定路径时，列表排序或分页变化不会改变其首选封面。

加载失败时遵循以下规则：

- Frontmatter 封面失败后不会直接退化为纯文本卡片；启用 `coverRandom` 时继续尝试随机图 API，否则直接进入静态 fallback。
- 每个 API 地址首次失败后最多重试 3 次，即单个 API 最多请求 4 次。
- 单次图片请求超过 60 秒仍未完成，按加载失败处理。
- API 候选耗尽后继续尝试全部 `coverFallback`；静态 fallback 失败后不重试，直接切换下一项。
- 切换候选期间保留加载占位层，成功后淡入图片；全部失败后移除媒体区域和占位层。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    postList: {
      coverFallback: [
        '/images/cover-1.webp',
        '/images/cover-2.webp',
      ],
      coverApiUrls: ['https://img.xjh.me/random_img.php?return=302'],
      coverRandom: true,
    },
  },
})
```

## 摘要

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    postList: {
      showExcerpt: true,
      excerptLength: 140,
    },
  },
})
```

## 列数与卡片宽度

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    postList: {
      maxColumns: 2,
      minCardWidth: '18rem',
    },
  },
})
```

## 字段说明

| 字段            | 说明                           | 默认值        |
| --------------- | ------------------------------ | ------------- |
| `title`         | 文章列表标题                   | `'Discovery'` |
| `imageReversed` | 有封面文章是否使用交错翻转布局 | `true`        |
| `coverFallback` | 本地或静态封面兜底列表         | `[]`          |
| `coverApiUrls`  | 远程随机封面源列表             | `[]`          |
| `coverRandom`   | 是否启用远程随机封面策略       | `false`       |
| `showExcerpt`   | 是否显示摘要                   | `true`        |
| `excerptLength` | 摘要长度                       | `140`         |
| `maxColumns`    | 最大列数                       | `1`           |
| `minCardWidth`  | 单张卡片最小宽度               | `'18rem'`     |
