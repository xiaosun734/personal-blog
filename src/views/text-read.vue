<template>
  <div
    class="text-read-container"
    @mouseenter="handleSurfaceEnter"
    @mousemove="handleSurfaceMove"
    @mouseleave="handleSurfaceLeave"
  >
    <TextTemplate :article="article" />
    <ClassificationComponent />

    <div
      v-if="isMagnifierEnabled"
      class="page-magnifier-overlay"
      :style="magnifierOverlayStyle"
      aria-hidden="true"
    >
      <div class="page-magnifier-scroll-layer" :style="magnifierScrollLayerStyle">
        <div class="magnifier-scroll-stage">
          <ArticlePanel :article="article" />
        </div>
      </div>

      <div class="page-magnifier-fixed-layer" :style="magnifierFixedLayerStyle">
        <HeaderComponent />
        <ClassificationComponent />
      </div>
    </div>

    <div
      v-if="isMagnifierEnabled && showMagnifierLens"
      class="page-magnifier-lens"
      :style="magnifierLensStyle"
      aria-hidden="true"
    ></div>

    <button
      type="button"
      class="magnifier-toggle-button"
      :class="{ active: isMagnifierEnabled }"
      :title="isMagnifierEnabled ? '关闭放大镜' : '打开放大镜'"
      :aria-pressed="String(isMagnifierEnabled)"
      @click="toggleMagnifier"
    >
      <svg viewBox="0 0 24 24" class="magnifier-toggle-icon" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="5.5"></circle>
        <line x1="15" y1="15" x2="20" y2="20"></line>
      </svg>
    </button>

    <BackButton />
  </div>
</template>

<script>
import TextTemplate from '../components/text-template.vue';
import ClassificationComponent from '../components/classification-component.vue';
import BackButton from '../components/back-button.vue';
import HeaderComponent from '../components/header-component.vue';
import ArticlePanel from '../components/article-panel.vue';
import articles from '../data/articles';

export default {
  name: 'TextRead',
  components: {
    TextTemplate,
    ClassificationComponent,
    BackButton,
    HeaderComponent,
    ArticlePanel
  },
  data() {
    return {
      articles: articles,
      article: {},
      isMagnifierEnabled: false,
      showMagnifierLens: false,
      mouseX: 0,
      mouseY: 0,
      lensRadius: 60,
      zoomLevel: 1.8,
      surfaceLeft: 0,
      surfaceTop: 0,
      surfaceWidth: 0
    };
  },
  computed: {
    magnifierOverlayStyle() {
      const clipPath = this.showMagnifierLens
        ? `circle(${this.lensRadius}px at ${this.mouseX}px ${this.mouseY}px)`
        : 'circle(0px at 0 0)';

      return {
        clipPath: clipPath,
        WebkitClipPath: clipPath
      };
    },
    magnifierScrollLayerStyle() {
      const localMouseX = this.mouseX - this.surfaceLeft;
      const localMouseY = this.mouseY - this.surfaceTop;
      const translateX = (1 - this.zoomLevel) * localMouseX;
      const translateY = (1 - this.zoomLevel) * localMouseY;

      return {
        left: `${this.surfaceLeft}px`,
        top: `${this.surfaceTop}px`,
        width: `${this.surfaceWidth}px`,
        transform: `translate(${translateX}px, ${translateY}px) scale(${this.zoomLevel})`
      };
    },
    magnifierFixedLayerStyle() {
      const translateX = (1 - this.zoomLevel) * this.mouseX;
      const translateY = (1 - this.zoomLevel) * this.mouseY;

      return {
        transform: `translate(${translateX}px, ${translateY}px) scale(${this.zoomLevel})`
      };
    },
    magnifierLensStyle() {
      const diameter = this.lensRadius * 2;

      return {
        width: `${diameter}px`,
        height: `${diameter}px`,
        left: `${this.mouseX - this.lensRadius}px`,
        top: `${this.mouseY - this.lensRadius}px`
      };
    }
  },
  mounted() {
    this.loadArticle();
    this.syncSurfaceBounds();
  },
  beforeDestroy() {
    this.removeViewportListeners();
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

      this.$nextTick(() => {
        this.syncSurfaceBounds();
      });
    },
    toggleMagnifier() {
      this.isMagnifierEnabled = !this.isMagnifierEnabled;

      if (this.isMagnifierEnabled) {
        this.syncSurfaceBounds();
        this.addViewportListeners();
        return;
      }

      this.showMagnifierLens = false;
      this.removeViewportListeners();
    },
    handleSurfaceEnter(event) {
      if (!this.isMagnifierEnabled) {
        return;
      }

      this.updatePointer(event);
      this.showMagnifierLens = true;
    },
    handleSurfaceMove(event) {
      if (!this.isMagnifierEnabled) {
        return;
      }

      this.updatePointer(event);
      this.showMagnifierLens = true;
    },
    handleSurfaceLeave() {
      this.showMagnifierLens = false;
    },
    updatePointer(event) {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    },
    syncSurfaceBounds() {
      if (!this.$el) {
        return;
      }

      const rect = this.$el.getBoundingClientRect();
      this.surfaceLeft = rect.left;
      this.surfaceTop = rect.top;
      this.surfaceWidth = rect.width;
    },
    handleViewportBlur() {
      this.showMagnifierLens = false;
    },
    addViewportListeners() {
      window.addEventListener('scroll', this.syncSurfaceBounds, { passive: true });
      window.addEventListener('resize', this.syncSurfaceBounds);
      window.addEventListener('blur', this.handleViewportBlur);
    },
    removeViewportListeners() {
      window.removeEventListener('scroll', this.syncSurfaceBounds);
      window.removeEventListener('resize', this.syncSurfaceBounds);
      window.removeEventListener('blur', this.handleViewportBlur);
    }
  }
};
</script>

<style scoped>
.text-read-container {
  width: 100%;
}

.page-magnifier-overlay {
  position: fixed;
  inset: 0;
  z-index: 920;
  overflow: hidden;
  pointer-events: none;
}

.page-magnifier-scroll-layer,
.page-magnifier-fixed-layer {
  position: absolute;
  left: 0;
  width: 100%;
  transform-origin: top left;
  pointer-events: none;
}

.page-magnifier-scroll-layer {
  min-height: 100vh;
}

.page-magnifier-fixed-layer {
  top: 0;
  height: 100vh;
}

.magnifier-scroll-stage {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f0ff 0%, #fdfdff 60%, #ffffff 100%);
  color: #2f3a4b;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-magnifier-lens {
  position: fixed;
  z-index: 930;
  pointer-events: none;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.22);
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: saturate(1.05);
}

.magnifier-toggle-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid #e1e8ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: fixed;
  bottom: 80px;
  left: 20px;
  z-index: 1000;
}

.magnifier-toggle-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #414548;
}

.magnifier-toggle-button.active {
  background-color: #f8fafc;
  border-color: #414548;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
}

.magnifier-toggle-icon {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: #2c3e50;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke 0.3s ease;
}

.magnifier-toggle-button:hover .magnifier-toggle-icon,
.magnifier-toggle-button.active .magnifier-toggle-icon {
  stroke: #414548;
}

@media (max-width: 768px) {
  .magnifier-toggle-button {
    width: 40px;
    height: 40px;
    bottom: 63px;
    left: 15px;
  }

  .magnifier-toggle-icon {
    width: 18px;
    height: 18px;
  }
}
</style>
