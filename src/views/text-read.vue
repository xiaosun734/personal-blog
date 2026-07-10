<template>
  <div class="text-read-container">
    <PageMagnifier :radius="60" :zoom-level="1.8">
      <TextTemplate :article="article" />
      <ClassificationComponent />

      <template #scroll-overlay>
        <div class="magnifier-scroll-stage">
          <ArticlePanel :article="article" />
        </div>
      </template>

      <template #fixed-overlay>
        <HeaderComponent />
        <ClassificationComponent />
      </template>
    </PageMagnifier>

    <BackButton />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TextTemplate from '../components/text-template.vue'
import ClassificationComponent from '../components/classification-component.vue'
import BackButton from '../components/back-button.vue'
import HeaderComponent from '../components/header-component.vue'
import ArticlePanel from '../components/article-panel.vue'
import PageMagnifier from '../components/page-magnifier.vue'
import articles from '@/data/articles'
import type { Article } from '@/types/article'

const route = useRoute()

const allArticles = articles as Article[]
const article = ref<Article>(allArticles[0])

const loadArticle = () => {
  const articleId = Number(route.params.id)
  article.value = allArticles.find(item => item.id === articleId) || allArticles[0]
}

onMounted(() => {
  loadArticle()
})

watch(() => route.params.id, () => {
  loadArticle()
})
</script>

<style scoped>
.text-read-container {
  width: 100%;
}

.magnifier-scroll-stage {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f0ff 0%, #fdfdff 60%, #ffffff 100%);
  color: #2f3a4b;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>
