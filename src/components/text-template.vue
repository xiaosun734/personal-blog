<template>
  <div class="text-read">
    <HeaderComponent />
    <ArticlePanel :article="article" />
  </div>
</template>

<script setup lang="ts">
import HeaderComponent from './header-component.vue'
import ArticlePanel from './article-panel.vue'
import type { Article } from '@/types/article'

defineProps<{
  article: Article
}>()
</script>

<style scoped>
.text-read {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f0ff 0%, #fdfdff 60%, #ffffff 100%);
  color: #2f3a4b;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
