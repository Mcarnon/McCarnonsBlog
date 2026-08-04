<script setup lang="ts">
import { usePinnedEntries } from '../../features/home'

const {
  sectionTitle,
  entries,
  trackClass,
  visible,
  getFallbackLabel,
} = usePinnedEntries()
</script>

<template>
  <section v-if="visible" class="lm-pinned" aria-labelledby="lm-pinned-title">
    <div class="lm-pinned__header">
      <h2 id="lm-pinned-title" class="lm-pinned__title">
        {{ sectionTitle }}
      </h2>
    </div>

    <div class="lm-pinned__track" :class="trackClass">
      <AppLink
        v-for="entry in entries"
        :key="`${entry.title}-${entry.link}`"
        class="lm-pinned-card"
        :to="entry.link"
      >
        <div
          class="lm-pinned-card__media"
          :class="{ 'lm-pinned-card__media--fallback': !entry.img }"
        >
          <img
            v-if="entry.img"
            :src="entry.img"
            :alt="entry.title"
            class="lm-pinned-card__image"
          >
          <div v-else class="lm-pinned-card__fallback" aria-hidden="true">
            {{ getFallbackLabel(entry.title) }}
          </div>

          <div class="lm-pinned-card__shade" aria-hidden="true" />

          <div class="lm-pinned-card__content">
            <h3 class="lm-pinned-card__title">
              {{ entry.title }}
            </h3>
            <p v-if="entry.desc" class="lm-pinned-card__desc">
              {{ entry.desc }}
            </p>
          </div>
        </div>
      </AppLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../../styles/mixins/surface' as *;

.lm-pinned {
  @apply pt-6 md:pt-8;
}

.lm-pinned__header {
  @apply mb-6 border-b pb-3 md:mb-7;
  border-color: color-mix(in srgb, var(--lm-c-border) 72%, transparent);
}

.lm-pinned__title {
  @apply m-0 text-[1.5rem] leading-[1.3] font-700;
  color: var(--lm-c-text-primary);
}

.lm-pinned__track {
  @apply grid grid-flow-col auto-cols-[minmax(15rem,1fr)] gap-4 overflow-x-auto pb-1 snap-x snap-proximity md:auto-cols-[minmax(17.5rem,1fr)];
  --lm-scrollbar-size: 0.5rem;
  --lm-scrollbar-thumb: color-mix(in srgb, var(--lm-c-border-hover) 52%, transparent);
  --lm-scrollbar-thumb-hover: color-mix(in srgb, var(--lm-c-brand) 45%, var(--lm-c-border-hover));
}

.lm-pinned-card {
  @include lm-surface-panel(
    color-mix(in srgb, var(--lm-c-bg-glass) 30%, transparent),
    color-mix(in srgb, var(--lm-c-border-hover) 34%, transparent),
    0 14px 28px rgb(15 23 42 / 0.08),
    8px
  );

  @apply block overflow-hidden rounded-6 no-underline snap-start;
  border: 1px solid color-mix(in srgb, var(--lm-c-border-hover) 34%, transparent);
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    box-shadow 220ms ease;
}

.lm-pinned-card:hover,
.lm-pinned-card:focus-visible {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--lm-c-brand) 30%, var(--lm-c-border-hover));
}

.lm-pinned-card__media {
  @apply relative min-h-[14.5rem] overflow-hidden md:min-h-[15.75rem];
  background: color-mix(in srgb, var(--lm-c-brand-soft) 10%, var(--lm-c-bg-glass));
}

.lm-pinned-card__media--fallback {
  background:
    radial-gradient(circle at 18% 20%, color-mix(in srgb, var(--lm-c-brand) 22%, transparent), transparent 36%),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--lm-c-brand-soft) 26%, transparent),
      color-mix(in srgb, var(--lm-c-bg-glass) 88%, white)
    );
}

.lm-pinned-card__image {
  @apply absolute inset-0 h-full w-full object-cover;
  transform: scale(1);
  transition: transform 320ms ease;
}

.lm-pinned-card:hover .lm-pinned-card__image,
.lm-pinned-card:focus-visible .lm-pinned-card__image {
  transform: scale(1.03);
}

.lm-pinned-card__fallback {
  @apply absolute inset-0 flex items-center justify-center text-[2rem] font-700 tracking-[0.14em];
  color: color-mix(in srgb, var(--lm-c-text-primary) 86%, white);
}

.lm-pinned-card__shade {
  @apply absolute inset-0;
  background: linear-gradient(
    180deg,
    rgb(15 23 42 / 0.06) 0%,
    transparent 30%,
    rgb(15 23 42 / 0.24) 58%,
    rgb(15 23 42 / 0.72) 100%
  );
  transition: background 220ms ease;
}

.lm-pinned-card:hover .lm-pinned-card__shade,
.lm-pinned-card:focus-visible .lm-pinned-card__shade {
  background: linear-gradient(
    180deg,
    rgb(15 23 42 / 0.08) 0%,
    rgb(15 23 42 / 0.04) 28%,
    rgb(15 23 42 / 0.32) 58%,
    rgb(15 23 42 / 0.82) 100%
  );
}

.lm-pinned-card__content {
  @apply absolute inset-x-0 bottom-0 z-[var(--lm-z-raised)] flex flex-col items-start px-4 pb-4 pt-12 md:px-5 md:pb-5;
  gap: 0.55rem;
  transition:
    transform 300ms ease,
    gap 300ms ease;
}

.lm-pinned-card__title {
  @apply m-0 max-w-full text-[1.02rem] leading-[1.35] font-700 md:text-[1.08rem];
  color: color-mix(in srgb, white 96%, var(--lm-c-brand-soft));
  text-shadow: 0 2px 10px rgb(15 23 42 / 0.28);
  transition: transform 300ms ease;
}

.lm-pinned-card__desc {
  @apply m-0 line-clamp-2 max-w-[92%] text-sm leading-6;
  color: color-mix(in srgb, white 90%, var(--lm-c-brand-soft));
  text-shadow: 0 2px 12px rgb(15 23 42 / 0.22);
}

@media (min-width: 1024px) {
  .lm-pinned__track--single {
    @apply grid-flow-row auto-cols-auto grid-cols-1 justify-center overflow-visible;
  }

  .lm-pinned__track--single .lm-pinned-card {
    @apply mx-auto w-full max-w-[26rem];
  }

  .lm-pinned__track--double {
    @apply grid-flow-row auto-cols-auto grid-cols-2 overflow-visible;
  }

  .lm-pinned__track--triple {
    @apply grid-flow-row auto-cols-auto grid-cols-3 overflow-visible;
  }

  .lm-pinned__track--scroll {
    @apply grid-flow-col auto-cols-[minmax(17.5rem,23rem)] overflow-x-auto;
  }
}

@media (hover: hover) and (pointer: fine) {
  .lm-pinned-card__content {
    gap: 0;
  }

  .lm-pinned-card__desc {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transform: translateY(8px);
    transition:
      max-height 300ms ease,
      opacity 300ms ease,
      transform 300ms ease;
  }

  .lm-pinned-card:hover .lm-pinned-card__content,
  .lm-pinned-card:focus-visible .lm-pinned-card__content {
    gap: 0.55rem;
    transform: translateY(-6px);
  }

  .lm-pinned-card:hover .lm-pinned-card__title,
  .lm-pinned-card:focus-visible .lm-pinned-card__title {
    transform: translateY(-1px);
  }

  .lm-pinned-card:hover .lm-pinned-card__desc,
  .lm-pinned-card:focus-visible .lm-pinned-card__desc {
    max-height: 3.4rem;
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 767px) {
  .lm-pinned {
    @apply py-6;
  }

  .lm-pinned__header {
    @apply mb-5;
  }

  .lm-pinned-card {
    @apply rounded-[1.2rem];
  }

  .lm-pinned-card__media {
    @apply min-h-[13rem];
  }

  .lm-pinned-card__content {
    @apply px-4 pb-4;
  }

  .lm-pinned-card__title {
    @apply text-base;
  }
}
</style>
