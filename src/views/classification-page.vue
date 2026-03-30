<template>
  <div class="classification-page">
    <h1 class="page-title">{{ currentCategory || '所有分类' }}</h1>
    <ClassificationComponent />
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
</template>

<script>
import articles from '../data/articles.js';
import ClassificationComponent from '../components/classification-component.vue';

export default {
  name: 'ClassificationPage',
  components: {
    ClassificationComponent
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
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaea;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
}

.article-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.article-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.article-desc {
  font-size: 14px;
  line-height: 1.5;
  color: #555;
  margin: 0;
}

.no-articles {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>