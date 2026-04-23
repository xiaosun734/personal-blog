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

<script>
import TextTemplate from '../components/text-template.vue';
import ClassificationComponent from '../components/classification-component.vue';
import BackButton from '../components/back-button.vue';
import HeaderComponent from '../components/header-component.vue';
import ArticlePanel from '../components/article-panel.vue';
import PageMagnifier from '../components/page-magnifier.vue';
import articles from '../data/articles';

export default {
  name: 'TextRead',
  components: {
    TextTemplate,
    ClassificationComponent,
    BackButton,
    HeaderComponent,
    ArticlePanel,
    PageMagnifier
  },
  data() {
    return {
      articles: articles,
      article: {}
    };
  },
  mounted() {
    this.loadArticle();
  },
  watch: {
    '$route.params.id'() {
      this.loadArticle();
    }
  },
  methods: {
    loadArticle() {
      const articleId = this.$route.params.id;
      this.article = this.articles.find(item => item.id == articleId) || this.articles[0];
    }
  }
};
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
