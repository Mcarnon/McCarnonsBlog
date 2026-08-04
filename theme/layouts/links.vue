<template>
  <Layout>
    <div class="lm-links-layout">
      <LmLinks>
        <RouterView />
      </LmLinks>

      <div class="lm-links-layout__comment">
        <LmComment />
      </div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
.lm-links-layout {
  @apply w-full;
}

.lm-links-layout__comment {
  @apply mx-auto w-full max-w-5xl;
}
</style>
