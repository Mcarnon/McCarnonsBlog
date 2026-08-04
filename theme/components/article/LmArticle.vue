<template>
  <article class="lm-article">
    <LmArticleHeader />
    <LmTocMobile />

    <div class="lm-article__content-stack">
      <div class="lm-article__content-main">
        <div class="lm-article__reading">
          <div class="markdown-body pb-4 max-w-none prose dark:prose-invert">
            <slot />
          </div>
        </div>

        <LmPostNav />
        <LmComment />
      </div>

      <div class="lm-article__toc-shell">
        <LmToc class="lm-article__toc" />
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.lm-article {
  @apply pb-6;
}

.lm-article__content-stack {
  @apply relative mx-auto w-full max-w-3xl;
}

.lm-article__content-main {
  @apply w-full min-w-0;
}

.lm-article__reading {
  @apply w-full px-4 sm:px-6 xl:px-0;
}

.lm-article__toc-shell {
  @apply hidden xl:block;
  position: absolute;
  top: 0;
  left: calc(100% + 2.75rem);
  width: 16rem;
  height: 100%;
}
</style>
