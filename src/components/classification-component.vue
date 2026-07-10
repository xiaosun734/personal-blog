<template>
  <div class="classification-container" :style="{ transform: `translateY(${translateY}px)` }">
    <h2 class="classification-title">文章分类</h2>
    <div class="classification-list">
      <div 
        v-for="category in categories" 
        :key="category.name"
        class="classification-item"
        @click="navigateToCategory(category.name)"
      >
        <span class="category-name">{{ category.name }}</span>
        <span class="category-count">{{ category.count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import debounce from '@/utils/debounce'
import { fetchArticleSummaries, getArticlesState } from '@/api/articles'

interface Category {
  name: string
  count: number
}

const router = useRouter()

const categories = ref<Category[]>([])
const translateY = ref(0)
const lastScrollTop = ref(0)
let scrollTimeout: ReturnType<typeof setTimeout> | null = null

const getCategories = () => {
  const s = getArticlesState()
  const categoryMap: Record<string, number> = {}

  s.summaries.forEach(article => {
    if (categoryMap[article.category]) {
      categoryMap[article.category]++
    } else {
      categoryMap[article.category] = 1
    }
  })

  categories.value = Object.entries(categoryMap).map(([name, count]) => ({
    name,
    count
  }))
}

const navigateToCategory = (categoryName: string) => {
  router.push(`/classification/${categoryName}`)
}

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollDelta = scrollTop - lastScrollTop.value

  translateY.value = Math.max(Math.min(translateY.value + scrollDelta * 0.2, 10), -10)

  lastScrollTop.value = scrollTop

  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }

  scrollTimeout = setTimeout(() => {
    translateY.value = 0
  }, 150)
}

const debouncedHandleScroll = debounce(handleScroll, 80, { leading: true, trailing: true })

onMounted(async () => {
  await fetchArticleSummaries()
  getCategories()
  lastScrollTop.value = window.pageYOffset || document.documentElement.scrollTop || 0
  window.addEventListener('scroll', debouncedHandleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', debouncedHandleScroll)
  debouncedHandleScroll.cancel()
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
</script>

<style scoped>
.classification-container {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e8ed;
  width: 200px;
  position: fixed;
  right: 50px;
  top: 160px;
  z-index: 10;
  transition: transform 0.3s ease-out;
}

.classification-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 15px;
  color: #2c3e50;
  border-bottom: 1px solid #e1e8ed;
  padding-bottom: 10px;
  text-align: center;
}

.classification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.classification-item {
  background-color: #ffffff;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.classification-item:hover {
  background-color: #f8fafc;
  transform: translateX(5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: #3498db;
}

.category-name {
  color: #2c3e50;
  font-weight: 500;
}

.category-count {
  background-color: #e1e8ed;
  color: #7f8c8d;
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
}
</style>
