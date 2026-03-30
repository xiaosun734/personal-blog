<template>
  <div class="classification-page">
    <HeaderComponent />
    
    <main class="content">
      <div class="content-wrapper">
        <div class="main-content">
          <h1 class="page-title">{{ currentCategory || '所有分类' }}</h1>
          <div class="article-list">
      <div 
        v-for="article in filteredArticles" 
        :key="article.id"
        class="article-item"
        @click="navigateToArticle(article.id)"
      >
        <h2 class="article-title">{{ article.title }}</h2>
        <div class="article-meta">
          <span class="article-author">{{ article.author }}</span>
          <span class="article-date">{{ article.date }}</span>
          <span class="article-category">{{ article.category }}</span>
        </div>
        <p class="article-desc">{{ article.desc }}</p>
      </div>
      <div v-if="filteredArticles.length === 0" class="no-articles">
        该分类下暂无文章
      </div>
          </div>
        </div>
        
        <aside class="sidebar">
          <ClassificationComponent />
        </aside>
      </div>
    </main>
  </div>
</template>

<script>
import articles from '../data/articles.js';
import ClassificationComponent from '../components/classification-component.vue';
import HeaderComponent from '../components/header-component.vue';

export default {
  name: 'ClassificationPage',
  components: {
    ClassificationComponent,
    HeaderComponent
  },
  data() {
    return {
      currentCategory: '',
      articles: articles
    };
  },
  computed: {
    filteredArticles() {
      if (!this.currentCategory) {
        return this.articles;
      }
      return this.articles.filter(article => article.category === this.currentCategory);
    }
  },
  mounted() {
    // 从路由参数中获取分类名称
    this.currentCategory = this.$route.params.category || '';
  },
  watch: {
    // 监听路由变化，更新当前分类
    '$route.params.category': function(newCategory) {
      this.currentCategory = newCategory || '';
    }
  },
  methods: {
    navigateToArticle(id) {
      this.$router.push(`/article/${id}`);
    }
  }
};
</script>

<style scoped>
.classification-page {
  min-height: 100vh;
  background: #ffffff;
  color: #2f3a4b;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: calc(120px + 30px) 20px 40px; /* 留出 header 空间，与header的容器padding一致 */
}

.content-wrapper {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.main-content {
  flex: 1;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 30px;
  color: #2c3e50;
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #e1e8ed;
  text-shadow: 0 2px 4px rgba(44, 62, 80, 0.1);
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 0;
}

.article-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e8ed;
}

.article-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: #e1e8ed;
}

.article-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2c3e50;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.article-item:hover .article-title {
  color: #3498db;
}

.article-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 12px;
}

.article-desc {
  font-size: 15px;
  line-height: 1.6;
  color: #546775;
  margin: 0;
}

.no-articles {
  text-align: center;
  padding: 60px;
  color: #7f8c8d;
  font-size: 18px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e8ed;
}

@media (max-width: 992px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .classification-container {
    position: relative;
    top: 0;
    width: 100%;
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
</style>