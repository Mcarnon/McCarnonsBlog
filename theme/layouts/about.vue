<template>
  <Layout>
    <div class="lm-about-layout">
      <LmAbout>
        <RouterView />
      </LmAbout>

      <div class="lm-about-layout__comment">
        <LmComment />
      </div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
.lm-about-layout {
  @apply w-full;
}

.lm-about-layout__comment {
  @apply mx-auto w-full max-w-5xl;
}
</style>
