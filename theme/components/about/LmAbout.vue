<script setup lang="ts">
import { useAboutProfile } from '../../features/about'

const {
  authorAvatar,
  authorName,
  description,
  pageCover,
  pageTitle,
  profileLabel,
  socialLinks,
} = useAboutProfile()
</script>

<template>
  <section class="lm-about-page">
    <LmAggregateHeader
      :title="pageTitle"
      :cover="pageCover"
    />

    <div class="lm-about-page__content">
      <section class="lm-about-profile" :aria-label="profileLabel">
        <div v-if="authorAvatar" class="lm-about-profile__avatar-wrap">
          <img
            class="lm-about-profile__avatar"
            :src="authorAvatar"
            :alt="authorName"
            loading="lazy"
          >
        </div>

        <div class="lm-about-profile__body">
          <h2 class="lm-about-profile__name">
            {{ authorName }}
          </h2>

          <p v-if="description" class="lm-about-profile__description">
            {{ description }}
          </p>

          <LmAboutSocialLinks
            v-if="socialLinks.length"
            :items="socialLinks"
          />
        </div>
      </section>

      <div class="lm-about-page__body markdown-body prose dark:prose-invert">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.lm-about-page {
  @apply flex flex-col pb-12 sm:pb-16;
}

.lm-about-page__content {
  @apply mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-6 xl:px-0;
}

.lm-about-profile {
  @apply relative grid gap-5 overflow-hidden rounded-5 border p-5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:p-6;
  color: var(--lm-c-text-primary);
  border-color: color-mix(in srgb, var(--lm-c-brand) 16%, var(--lm-c-border));
  background:
    radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--lm-c-brand) 12%, transparent), transparent 32%),
    color-mix(in srgb, var(--lm-surface-reading-bg) 84%, transparent);
}

.lm-about-profile__avatar-wrap {
  @apply h-24 w-24 overflow-hidden rounded-5 border p-1 sm:h-26 sm:w-26;
  border-color: color-mix(in srgb, var(--lm-c-brand) 28%, var(--lm-c-border));
  background: var(--lm-c-brand-subtle);
}

.lm-about-profile__avatar {
  @apply h-full w-full rounded-4 object-cover;
}

.lm-about-profile__body {
  @apply flex min-w-0 flex-col justify-center;
}

.lm-about-profile__name {
  @apply m-0 text-2xl leading-9 font-900 sm:text-3xl;
}

.lm-about-profile__description {
  @apply m-0 mt-2 max-w-2xl text-sm leading-7 sm:text-base;
  color: var(--lm-c-text-secondary);
}

.lm-about-page__body {
  @apply max-w-none;
}

.lm-about-page__body:empty {
  @apply hidden;
}
</style>
