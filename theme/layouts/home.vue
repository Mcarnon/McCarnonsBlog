<template>
  <Layout>
    <div class="home">
      <LmHero />

      <div class="lm-home-content">
        <slot>
          <RouterView />
        </slot>
      </div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
.lm-home-content {
  @apply mx-auto max-w-3xl px-4 sm:px-6 xl:max-w-5xl xl:px-0;
}
</style>
