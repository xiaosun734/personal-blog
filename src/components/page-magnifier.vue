<template>
  <div
    class="page-magnifier"
    @mouseenter="handleSurfaceEnter"
    @mousemove="handleSurfaceMove"
    @mouseleave="handleSurfaceLeave"
  >
    <slot />

    <div
      v-if="isMagnifierEnabled"
      class="page-magnifier-overlay"
      :style="magnifierOverlayStyle"
      aria-hidden="true"
    >
      <div class="page-magnifier-scroll-layer" :style="magnifierScrollLayerStyle">
        <slot name="scroll-overlay" />    //放大镜里要跟着页面滚动的内容
      </div>

      <div class="page-magnifier-fixed-layer" :style="magnifierFixedLayerStyle">
        <slot name="fixed-overlay" />    //放大镜里固定定位的内容
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
      class="page-magnifier-toggle-button"
      :class="{ active: isMagnifierEnabled }"
      :style="toggleButtonStyle"
      :title="isMagnifierEnabled ? enabledTitle : disabledTitle"
      :aria-pressed="String(isMagnifierEnabled)"
      @click="toggleMagnifier"
    >
      <slot name="toggle-icon">    //按钮图标
        <svg viewBox="0 0 24 24" class="page-magnifier-toggle-icon" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="5.5"></circle>
          <line x1="15" y1="15" x2="20" y2="20"></line>
        </svg>
      </slot>
    </button>
  </div>
</template>

<script>
export default {
  name: 'PageMagnifier',
  props: {
    radius: {    //放大镜半径
      type: Number,
      default: 60
    },
    zoomLevel: {    //放大倍数
      type: Number,
      default: 1.8
    },
    enabledTitle: {   //放大镜启用时按钮的提示文本
      type: String,
      default: '关闭放大镜'
    },
    disabledTitle: {    //放大镜禁用时按钮的提示文本
      type: String,
      default: '打开放大镜'
    },
    buttonOffsetBottom: {    //按钮底部偏移量
      type: Number,
      default: 80
    },
    buttonOffsetLeft: {    //按钮左侧偏移量
      type: Number,
      default: 20
    },
    buttonOffsetBottomMobile: {
      type: Number,
      default: 63
    },
    buttonOffsetLeftMobile: {
      type: Number,
      default: 15
    },
    buttonSize: {
      type: Number,
      default: 48
    },
    buttonSizeMobile: {
      type: Number,
      default: 40
    }
  },
  data() {
    return {
      isMagnifierEnabled: false,
      showMagnifierLens: false,
      mouseX: 0,
      mouseY: 0,
      surfaceLeft: 0,
      surfaceTop: 0,
      surfaceWidth: 0
    };
  },
  computed: {
    magnifierOverlayStyle() {
      const clipPath = this.showMagnifierLens
        ? `circle(${this.radius}px at ${this.mouseX}px ${this.mouseY}px)`
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
      const diameter = this.radius * 2;

      return {
        width: `${diameter}px`,
        height: `${diameter}px`,
        left: `${this.mouseX - this.radius}px`,
        top: `${this.mouseY - this.radius}px`
      };
    },
    toggleButtonStyle() {
      return {
        '--page-magnifier-button-size': `${this.buttonSize}px`,
        '--page-magnifier-button-size-mobile': `${this.buttonSizeMobile}px`,
        '--page-magnifier-button-bottom': `${this.buttonOffsetBottom}px`,
        '--page-magnifier-button-left': `${this.buttonOffsetLeft}px`,
        '--page-magnifier-button-bottom-mobile': `${this.buttonOffsetBottomMobile}px`,
        '--page-magnifier-button-left-mobile': `${this.buttonOffsetLeftMobile}px`
      };
    }
  },
  mounted() {
    this.syncSurfaceBounds();
  },
  beforeDestroy() {
    this.removeViewportListeners();
  },
  methods: {
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
.page-magnifier {
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

.page-magnifier-toggle-button {
  width: var(--page-magnifier-button-size, 48px);
  height: var(--page-magnifier-button-size, 48px);
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
  bottom: var(--page-magnifier-button-bottom, 80px);
  left: var(--page-magnifier-button-left, 20px);
  z-index: 1000;
}

.page-magnifier-toggle-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #414548;
}

.page-magnifier-toggle-button.active {
  background-color: #f8fafc;
  border-color: #414548;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
}

.page-magnifier-toggle-icon {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: #2c3e50;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke 0.3s ease;
}

.page-magnifier-toggle-button:hover .page-magnifier-toggle-icon,
.page-magnifier-toggle-button.active .page-magnifier-toggle-icon {
  stroke: #414548;
}

@media (max-width: 768px) {
  .page-magnifier-toggle-button {
    width: var(--page-magnifier-button-size-mobile, 40px);
    height: var(--page-magnifier-button-size-mobile, 40px);
    bottom: var(--page-magnifier-button-bottom-mobile, 63px);
    left: var(--page-magnifier-button-left-mobile, 15px);
  }

  .page-magnifier-toggle-icon {
    width: 18px;
    height: 18px;
  }
}
</style>
