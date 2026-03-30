<template>
  <div class="text-read">
    <HeaderComponent />
    
    <main class="content">
      <article class="article">
        <header class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <span class="author">作者：{{ article.author }}</span>
            <span class="date">发布日期：{{ article.date }}</span>
            <span class="category">分类：{{ article.category }}</span>
          </div>
        </header>
        
        <div class="article-content" v-html="article.content"></div>
        
        <footer class="article-footer">
          <div class="tags">
            <span class="tag">Vue 3</span>
            <span class="tag">组合式 API</span>
            <span class="tag">前端开发</span>
          </div>
          <div class="share">
            <span>分享到：</span>
            <a href="#" class="share-link">微信</a>
            <a href="#" class="share-link">微博</a>
            <a href="#" class="share-link">Twitter</a>
          </div>
        </footer>
      </article>
    </main>
  </div>
</template>

<script>
import HeaderComponent from './header-component.vue'

export default {
  name: 'TextTemplate',
  components: {
    HeaderComponent
  },
  props: {
    article: {
      type: Object,
      default: () => ({})
    }
  },

}
</script>

<style scoped>
.text-read {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f0ff 0%, #fdfdff 60%, #ffffff 100%);
  color: #2f3a4b;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.content {
  width: min(800px, 90vw);
  margin: 0 auto;
  padding: calc(72px + 40px) 0 60px;
}

.article {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 40px;
  margin-bottom: 40px;
}

.article-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5ecf8;
}

.article-title {
  font-size: 2.2rem;
  color: #1f2a38;
  margin: 0 0 15px;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 0.9rem;
  color: #7a8da5;
}

.article-content {
  line-height: 1.8;
  margin-bottom: 30px;
}

.article-content p {
  margin-bottom: 20px;
  color: #34495e;
}

.article-content h2 {
  font-size: 1.6rem;
  color: #213045;
  margin: 40px 0 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #d9e5f3;
}

.article-content ul,
.article-content ol {
  margin-bottom: 20px;
  padding-left: 25px;
}

.article-content li {
  margin-bottom: 8px;
  color: #34495e;
}

.article-content pre {
  background: #f8faff;
  border: 1px solid #e5ecf8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.article-content code {
  background: #f8faff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
}

/* 照片展示样式 */
.photo-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.photo-item {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.photo-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.photo-item img {
  width: 100%;
  height: auto;
  border-radius: 6px;
  margin-bottom: 10px;
  object-fit: cover;
}

.photo-caption {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.article-footer {
  padding-top: 20px;
  border-top: 1px solid #e5ecf8;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  background: #f8faff;
  border: 1px solid #e5ecf8;
  border-radius: 15px;
  padding: 5px 12px;
  font-size: 0.85rem;
  color: #4a90e2;
}

.share {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #7a8da5;
}

.share-link {
  color: #4a90e2;
  text-decoration: none;
  transition: color 0.3s ease;
}

.share-link:hover {
  color: #2980b9;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .content {
    padding: calc(72px + 20px) 0 40px;
  }
  
  .article {
    padding: 25px;
  }
  
  .article-title {
    font-size: 1.8rem;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 5px;
  }
  
  .article-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>