<template>
  <Layout>
    <div class="lm-projects-layout">
      <LmProjects>
        <RouterView />
      </LmProjects>

      <div class="lm-projects-layout__comment">
        <LmComment />
      </div>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
.lm-projects-layout {
  @apply w-full;
}

.lm-projects-layout__comment {
  @apply mx-auto w-full max-w-5xl;
}
</style>
