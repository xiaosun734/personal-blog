<template>
  <div class="text-homepage">
    <BackButton />
    <HeaderComponent />

    <main class="content">
      <section class="hero">
        <h1 class="hero-title">欢迎来到我的博客</h1>
        <p>这里记录了我的前端、后端、生活思考与成长路线，持续更新。</p>
      </section>

      <section class="articles">
        <h2>全部文章</h2>
        <!-- 加载中 -->
        <div v-if="state.loading" class="status-msg">加载中...</div>
        <!-- 加载出错 -->
        <div v-else-if="state.error" class="status-msg error">
          <p>加载失败：{{ state.error }}</p>
          <button class="retry-btn" @click="retry">重试</button>
        </div>
        <!-- 文章列表 -->
        <ul v-else-if="articleList.length > 0" class="article-list">
          <li class="article-item" v-for="item in articleList" :key="item.id">
            <router-link :to="{ name: 'TextRead', params: { id: item.id } }">
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
              <span class="meta">{{ formatDate(item.date) }} · {{ item.category }}</span>
            </router-link>
          </li>
        </ul>
        <!-- 无数据 -->
        <div v-else class="status-msg">暂无文章</div>
      </section>
    </main>

    <ClassificationComponent />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import HeaderComponent from '../components/header-component.vue'
import ClassificationComponent from '../components/classification-component.vue'
import BackButton from '../components/back-button.vue'
import { fetchArticleSummaries, getArticlesState } from '@/api/articles'
import type { ArticleSummary } from '@/api/articles'
import { formatDate } from '@/utils/format'

const state = getArticlesState()
const articleList = computed<ArticleSummary[]>(() => {
  if (!state.fetched) return []
  return [...state.summaries].sort((a, b) => b.id - a.id)
})

const retry = () => {
  state.error = null
  fetchArticleSummaries()
}

onMounted(() => {
  fetchArticleSummaries()
})
</script>

<style scoped>
.text-homepage {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f0ff 0%, #fdfdff 60%, #ffffff 100%);
  color: #2f3a4b;
}

.content {
  width: min(1000px, 92vw);
  margin: 0 auto;
  padding: calc(120px + 30px) 0 40px; /* 留出 header 空间 */
}

.hero {
  padding: 36px 28px;
  margin-bottom: 26px;
  background: #ffffff;
  border-left: 4px solid #4a90e2;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(32, 52, 80, 0.08);
}

.hero .hero-title{
  margin: 0 0 10px;
  font-size: 2.2rem;
  color: #1f2a38;
}

.hero p {
  margin: 0;
  color: #546775;
  font-size: 1.05rem;
  line-height: 1.6;
}

.articles h2 {
  margin: 0 0 14px;
  font-size: 1.8rem;
  color: #213045;
  border-bottom: 2px solid #d9e5f3;
  padding-bottom: 10px;
}

/* 状态提示 */
.status-msg {
  text-align: center;
  padding: 40px 20px;
  color: #7a8da5;
  font-size: 1rem;
}

.status-msg.error {
  color: #e74c3c;
}

.retry-btn {
  margin-top: 12px;
  padding: 8px 24px;
  border: none;
  border-radius: 6px;
  background: #3498db;
  color: #fff;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #2980b9;
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.article-item {
  background: #ffffff;
  border: 1px solid #e5ecf8;
  border-radius: 12px;
  transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
  position: relative;
  overflow: visible;
}

.article-item::before,
.article-item::after,
.article-item a::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  transition: transform .3s ease;
  z-index: -1;
}

.article-item::before {
  background: #ffffff;
  border: 1px solid #e5ecf8;
  transform: translate(0, 0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.article-item::after {
  background: #ffffff;
  border: 1px solid #e5ecf8;
  transform: translate(0, 0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.article-item a {
  display: block;
  padding: 18px;
  text-decoration: none;
  color: inherit;
  position: relative;
  z-index: 3;
  opacity: 1;
  transition: transform .3s ease;
}

.article-item:hover {
  transform: translate(0, 0);
  box-shadow: 0 10px 22px rgba(31, 49, 76, 0.12);
  border-color: #e5ecf8;
}

.article-item:hover::before {
  transform: translate(4px, 4px);
}

.article-item:hover::after {
  transform: translate(8px, 8px);
}

.article-item:hover a {
  transform: translate(4px, 4px);
}

.article-item h3 {
  margin: 0 0 8px;
  font-size: 1.15rem;
  color: #172238;
}

.article-item p {
  margin: 0 0 10px;
  color: #64748b;
  font-size: .96rem;
}

.meta {
  display: inline-block;
  font-size: .82rem;
  color: #7a8da5;
}

.categories {
  margin-top: 40px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.categories h2 {
  margin: 0 0 20px;
  font-size: 1.8rem;
  color: #213045;
  border-bottom: 2px solid #d9e5f3;
  padding-bottom: 10px;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.category-item {
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.category-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  /* border-color: #4a90e2; */
}

.category-item h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  color: #172238;
}

.category-item p {
  margin: 0 0 12px;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.4;
}

.category-count {
  font-size: 0.8rem;
  color: #7a8da5;
  font-weight: 500;
}

.error-banner {
  grid-column: 1 / -1;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  list-style: none;
}

.error-banner p {
  color: #c53030;
  margin: 0 0 12px;
  font-size: 0.95rem;
}

.retry-btn {
  border: none;
  border-radius: 6px;
  padding: 8px 20px;
  background: #c53030;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #9b2c2c;
}

@media (max-width: 992px) {
  .classification-container {
    position: relative;
    right: auto;
    top: auto;
    width: 100%;
    margin: 20px auto;
    max-width: 800px;
  }

  .classification-list {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .classification-item {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 26px 18px;
  }

  .hero .hero-title{
    font-size: 1.75rem;
  }

  .content {
    padding: calc(120px + 16px) 0 24px;
  }
}
</style>
