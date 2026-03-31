<template>
  <div class="text-read-container">
    <TextTemplate :article="article" />
    <ClassificationComponent />
  </div>
</template>

<script>
import TextTemplate from '../components/text-template.vue'
import ClassificationComponent from '../components/classification-component.vue'
import articles from '../data/articles'

export default {
  name: 'TextRead',
  components: {
    TextTemplate,
    ClassificationComponent
  },
  data() {
    return {
      articles: articles,
      article: {}
    }
  },
  mounted() {
    // 根据路由参数获取文章数据
    const articleId = this.$route.params.id;
    this.article = this.articles.find(item => item.id == articleId) || this.articles[0];
  }
}
</script>

<style scoped>
.text-read-container {
  width: 100%;
}
</style>