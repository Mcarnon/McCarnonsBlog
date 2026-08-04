<script setup lang="ts">
import { useArticleHeaderMeta } from '../../features/article'

const {
  title,
  cover,
  categories,
  tags,
  publishedDate,
  infoItems,
} = useArticleHeaderMeta()
</script>

<template>
  <header
    class="lm-article-header"
    :class="{ 'lm-article-header--plain': !cover }"
  >
    <div v-if="cover" class="lm-article-header__cover">
      <img
        :src="cover"
        alt=""
        class="lm-article-header__cover-image"
      >

      <div class="lm-article-header__cover-overlay">
        <div class="lm-article-header__cover-content">
          <div class="lm-article-header__content lm-article-header__content--cover">
            <h1 class="lm-article-header__title lm-article-header__title--cover">
              {{ title }}
            </h1>

            <LmArticleMeta
              :published-date="publishedDate"
              :info-items="infoItems"
              :categories="categories"
              :tags="tags"
              :cover="true"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      class="lm-article-header__content"
      :class="{ 'lm-article-header__content--plain': !cover }"
    >
      <h1 v-if="!cover" class="lm-article-header__title">
        {{ title }}
      </h1>

      <LmArticleMeta
        v-if="!cover"
        :published-date="publishedDate"
        :info-items="infoItems"
        :categories="categories"
        :tags="tags"
      />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.lm-article-header {
  @apply w-full pb-6;
}

.lm-article-header--plain {
  @apply md:pt-24 pt-22;
}

.lm-article-header__cover {
  @apply relative overflow-hidden;
  min-height: 22rem;
}

.lm-article-header__cover-image {
  @apply absolute inset-0 h-full w-full object-cover;
}

.lm-article-header__cover-overlay {
  @apply relative h-full w-full;
  min-height: 22rem;
  background:
    linear-gradient(180deg, rgba(10, 16, 28, 0.14) 0%, rgba(10, 16, 28, 0.54) 100%),
    linear-gradient(90deg, rgba(10, 16, 28, 0.54) 0%, rgba(10, 16, 28, 0.14) 72%);
}

.lm-article-header__cover-content {
  @apply mx-auto flex h-full w-full max-w-3xl;
  min-height: 22rem;
}

.lm-article-header__content {
  @apply flex flex-col;
}

.lm-article-header__content--cover {
  @apply w-full justify-end px-4 py-7 text-left sm:px-6 xl:px-0;
  min-height: 22rem;
}

.lm-article-header__content--plain {
  @apply mx-auto max-w-3xl px-4 text-left sm:px-6 xl:px-0;
}

.lm-article-header__title {
  @apply text-3xl leading-9 tracking-tight font-extrabold md:text-5xl md:leading-14;
  color: var(--lm-c-text-primary);
}

.lm-article-header__title--cover {
  @apply mt-auto;
  color: white;
  text-shadow: 0 4px 18px rgba(0, 0, 0, 0.28);
}

@media (max-width: 767px) {
  .lm-article-header__cover,
  .lm-article-header__cover-overlay,
  .lm-article-header__cover-content,
  .lm-article-header__content--cover {
    min-height: 15rem;
  }

  .lm-article-header__content--cover {
    @apply px-5 py-5;
  }
}
</style>
