<template>
  <div class="text-read-container">
    <!-- 加载中骨架 -->
    <div v-if="isLoading" class="read-loading">
      <div class="skeleton-title"></div>
      <div class="skeleton-meta"></div>
      <div class="skeleton-line" v-for="i in 6" :key="i"></div>
    </div>

    <!-- 文章不存在 -->
    <div v-else-if="notFound" class="read-not-found">
      <h2>文章不存在</h2>
      <p>抱歉，您访问的文章未找到。</p>
      <router-link to="/text-homepage" class="back-link">返回文章列表</router-link>
    </div>

    <!-- 正常渲染 -->
    <!-- 桌面端：使用放大镜组件 -->
    <template v-else-if="article && !isMobile">
      <PageMagnifier :radius="60" :zoom-level="1.8">
        <TextTemplate :article="article" />
        <ClassificationComponent />
        <CommentSection :article-id="article.id" />

        <template #scroll-overlay>
          <div class="magnifier-scroll-stage">
            <ArticlePanel :article="article" />
            <CommentSection :article-id="article.id" />
          </div>
        </template>

        <template #fixed-overlay>
          <HeaderComponent />
          <ClassificationComponent />
        </template>
      </PageMagnifier>
    </template>

    <!-- 手机端：不使用放大镜，直接渲染 -->
    <template v-else-if="article && isMobile">
      <TextTemplate :article="article" :show-header="false" />
      <ClassificationComponent :inline="true" />
      <CommentSection :article-id="article.id" />
    </template>

    <BackButton />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import TextTemplate from '../components/text-template.vue'
import ClassificationComponent from '../components/classification-component.vue'
import BackButton from '../components/back-button.vue'
import HeaderComponent from '../components/header-component.vue'
import ArticlePanel from '../components/article-panel.vue'
import PageMagnifier from '../components/page-magnifier.vue'
import CommentSection from '../components/comment-section.vue'
import { fetchArticleById } from '@/api/articles'
import type { Article } from '@/types/article'

const route = useRoute()

const article = ref<Article | null>(null)
const isLoading = ref(false)
const notFound = ref(false)

// Mobile detection
const isMobile = ref(false)
const MOBILE_BREAKPOINT = 768

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= MOBILE_BREAKPOINT
}

const loadArticle = async () => {
  const articleId = Number(route.params.id)
  if (!articleId || isNaN(articleId)) {
    notFound.value = true
    return
  }

  isLoading.value = true
  notFound.value = false

  const result = await fetchArticleById(articleId)
  if (result) {
    article.value = result
  } else {
    notFound.value = true
  }

  isLoading.value = false
}

onMounted(() => {
  loadArticle()
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile)
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

/* Loading skeleton */
.read-loading {
  min-height: 100vh;
  background: #fff;
  padding: calc(120px + 30px) 20px 40px;
  max-width: 800px;
  margin: 0 auto;
}

.skeleton-title {
  height: 36px;
  width: 60%;
  background: linear-gradient(90deg, #e8e8e8 25%, #f0f0f0 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  margin-bottom: 16px;
  animation: shimmer 1.5s infinite;
}

.skeleton-meta {
  height: 18px;
  width: 40%;
  background: linear-gradient(90deg, #e8e8e8 25%, #f0f0f0 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 30px;
  animation: shimmer 1.5s infinite;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #e8e8e8 25%, #f0f0f0 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin-bottom: 12px;
  animation: shimmer 1.5s infinite;
}

.skeleton-line:nth-child(3) { width: 95%; }
.skeleton-line:nth-child(4) { width: 80%; }
.skeleton-line:nth-child(5) { width: 90%; }
.skeleton-line:nth-child(6) { width: 70%; }
.skeleton-line:nth-child(7) { width: 85%; }
.skeleton-line:nth-child(8) { width: 60%; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Not found */
.read-not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  text-align: center;
  padding: 40px 20px;
}

.read-not-found h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 12px;
}

.read-not-found p {
  color: #7f8c8d;
  margin-bottom: 24px;
}

.back-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #2980b9;
}
</style>
