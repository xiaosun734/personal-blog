<template>
  <div class="classification-container">
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

<script>
import articles from '../data/articles.js';

export default {
  name: 'ClassificationComponent',
  data() {
    return {
      categories: []
    };
  },
  mounted() {
    this.getCategories();
  },
  methods: {
    getCategories() {
      // 统计每个分类的文章数量
      const categoryMap = {};
      
      articles.forEach(article => {
        if (categoryMap[article.category]) {
          categoryMap[article.category]++;
        } else {
          categoryMap[article.category] = 1;
        }
      });
      
      // 转换为数组格式
      this.categories = Object.entries(categoryMap).map(([name, count]) => ({
        name,
        count
      }));
    },
    navigateToCategory(categoryName) {
      // 跳转到分类页面
      this.$router.push(`/classification/${categoryName}`);
    }
  }
};
</script>

<style scoped>
.classification-container {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.classification-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 10px;
}

.classification-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.classification-item {
  background-color: #fff;
  border: 1px solid #eaeaea;
  border-radius: 16px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.classification-item:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-name {
  color: #333;
}

.category-count {
  background-color: #eaeaea;
  color: #666;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
}
</style>