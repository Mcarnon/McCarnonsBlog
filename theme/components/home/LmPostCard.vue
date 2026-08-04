<script lang="ts" setup>
import type { Post } from 'valaxy'
import { computed, shallowRef, toRef } from 'vue'
import { usePostCardMediaState, usePostCardViewModel } from '../../features/post'

/** 文章卡片支持的图文排列方式。 */
type PostCardLayout = 'alternating' | 'text-first'

const props = withDefaults(defineProps<{
  post: Post
  index?: number
  layout?: PostCardLayout
}>(), {
  index: 0,
  layout: 'alternating',
})

const {
  title,
  currentCover: cover,
  dateLabel,
  displayDate,
  excerpt,
  tags,
  hasMedia,
  isTextOnly,
  isReversed,
  handleCoverError,
} = usePostCardViewModel(toRef(props, 'post'), toRef(props, 'index'))

const shouldReverse = computed(() => {
  if (props.layout === 'text-first')
    return hasMedia.value

  return isReversed.value
})

const imageElement = shallowRef<HTMLImageElement | null>(null)

const {
  imageLoaded,
  showLoadingPlaceholder,
  handleImageError,
  handleImageLoad,
} = usePostCardMediaState({
  hasMedia,
  cover,
  imageElement,
  onCoverFailure: handleCoverError,
})
</script>

<template>
  <RouterLink
    :to="post.path || ''"
    class="lm-post-card"
    :class="{
      'lm-post-card--reversed': shouldReverse,
      'lm-post-card--text-only': isTextOnly,
    }"
  >
    <div v-if="hasMedia" class="lm-post-card__media">
      <div class="lm-post-card__media-shape">
        <div
          v-if="showLoadingPlaceholder"
          class="lm-post-card__loading-placeholder"
          aria-hidden="true"
        />

        <img
          v-if="cover"
          :key="cover"
          ref="imageElement"
          :src="cover"
          alt=""
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          class="lm-post-card__image"
          :class="{ 'lm-post-card__image--visible': imageLoaded }"
          @load="handleImageLoad"
          @error="handleImageError"
        >
      </div>
    </div>

    <div class="lm-post-card__content">
      <LmDate :date="displayDate" :label="dateLabel" />
      <h2 class="lm-post-card__title">
        {{ title }}
      </h2>

      <div v-if="tags.length" class="lm-post-card__tags">
        <span
          v-for="tag in tags"
          :key="tag"
          class="lm-post-card__tag"
        >
          {{ tag }}
        </span>
      </div>

      <p v-if="excerpt" class="lm-post-card__excerpt">
        {{ excerpt }}
      </p>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
@use '../../styles/mixins/surface' as *;

@mixin lm-post-card-compact-layout {
  .lm-post-card,
  .lm-post-card--reversed {
    grid-template-columns: 1fr;
    min-height: unset;
  }

  .lm-post-card__media,
  .lm-post-card--reversed .lm-post-card__media {
    order: 1;
  }

  .lm-post-card__content,
  .lm-post-card--reversed .lm-post-card__content {
    order: 2;
  }

  .lm-post-card__media-shape,
  .lm-post-card--reversed .lm-post-card__media-shape {
    clip-path: none;
  }

  .lm-post-card__media {
    min-height: 9rem;
  }

  .lm-post-card__content,
  .lm-post-card--reversed .lm-post-card__content {
    align-items: flex-start;
    text-align: left;
  }

  .lm-post-card__excerpt,
  .lm-post-card--reversed .lm-post-card__excerpt {
    text-align: left;
  }
}

.lm-post-card {
  @include lm-surface-panel;
  @apply group relative block h-full w-full overflow-hidden rounded-2xl no-underline;

  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
  min-height: 12rem;
  border: 1px solid var(--lm-c-border);
  transition:
    border-color 240ms ease,
    transform 240ms ease,
    box-shadow 240ms ease;

  &:hover {
    border-color: color-mix(in srgb, var(--lm-c-brand) 28%, var(--lm-c-border));
    transform: translateY(-2px);
  }
}

.lm-post-card--text-only {
  grid-template-columns: 1fr;
  min-height: auto;
}

.lm-post-card--text-only::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 18% 22%, var(--lm-c-brand-subtle), transparent 40%),
    linear-gradient(135deg, transparent 0 62%, rgba(255, 255, 255, 0.08) 62% 100%);
  opacity: 0.8;
}

.lm-post-card--text-only {
  .lm-post-card__content {
    align-items: flex-start;
    text-align: left;
  }
  .lm-post-card__excerpt {
    text-align: left;
  }
}

.lm-post-card__media-shape {
  @apply absolute inset-0 overflow-hidden;
  clip-path: polygon(0 0, 80% 0, 100% 100%, 0 100%);
}

.lm-post-card__image {
  @apply absolute inset-0 block h-full w-full object-cover;
  opacity: 0;
  transition: opacity 220ms ease;
}

.lm-post-card__image--visible {
  opacity: 1;
}

.lm-post-card__loading-placeholder {
  @apply absolute inset-0;
  background: linear-gradient(
    115deg,
    color-mix(in srgb, var(--lm-c-bg-glass) 92%, white) 0%,
    color-mix(in srgb, var(--lm-c-brand-soft) 20%, var(--lm-c-bg-glass)) 100%
  );
}

.lm-post-card__loading-placeholder::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, transparent 0%, rgba(255, 255, 255, 0.3) 45%, transparent 100%);
  transform: translateX(-100%);
  animation: lm-post-card-shimmer 1.8s ease-in-out infinite;
}

@keyframes lm-post-card-shimmer {
  to {
    transform: translateX(100%);
  }
}

.lm-post-card__media {
  @apply relative min-h-full self-stretch overflow-hidden;
}

.lm-post-card__content {
  @apply flex min-w-0 flex-col justify-start px-5 py-5;
  align-items: flex-end;
  text-align: right;
}

.lm-post-card__title {
  @apply mt-2 line-clamp-2 text-[1.45rem] font-700 leading-[1.3];
  color: var(--lm-c-text-primary);
}

.lm-post-card__tags {
  @apply mt-2.5 flex flex-wrap gap-1.5;
}

.lm-post-card__tag {
  @apply rounded-full px-2 py-0.5 text-xs;
  color: var(--lm-c-text-secondary);
  background: var(--lm-c-brand-subtle);
}

.lm-post-card__excerpt {
  @apply mt-3 line-clamp-3 leading-[1.7];
  color: var(--lm-c-text-muted);
  text-align: right;
}

.lm-post-card--reversed {
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);

  .lm-post-card__media {
    order: 2;
  }

  .lm-post-card__media-shape {
    clip-path: polygon(20% 0, 100% 0, 100% 100%, 0 100%);
  }

  .lm-post-card__content {
    order: 1;
    align-items: flex-start;
    text-align: left;
  }

  .lm-post-card__excerpt {
    text-align: left;
  }
}

@container (max-width: 24rem) {
  @include lm-post-card-compact-layout;

  .lm-post-card__content,
  .lm-post-card--reversed .lm-post-card__content {
    justify-content: flex-start;
  }
}

@media (max-width: 767px) {
  @include lm-post-card-compact-layout;
}
</style>
