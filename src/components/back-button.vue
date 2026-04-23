<template>
  <button class="back-button" @click="goBack" :style="{ transform: `translateY(${translateY}px)` }">
    <span class="back-arrow">←</span>
  </button>
</template>

<script>
export default {
  name: 'BackButton',
  data() {
    return {
      translateY: 0,
      lastScrollTop: 0,
      scrollTimeout: null
    };
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  },
  methods: {
    goBack() {
      this.$router.back();
    },
    handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollDelta = scrollTop - this.lastScrollTop;
      
      // 计算新的位置，限制在-10px到10px之间
      this.translateY = Math.max(Math.min(this.translateY + scrollDelta * 0.2, 10), -10);
      
      this.lastScrollTop = scrollTop;
      
      // 清除之前的定时器
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      
      // 设置新的定时器，当滚动停止后恢复原位
      this.scrollTimeout = setTimeout(() => {
        this.translateY = 0;
      }, 150);
    }
  }
};
</script>

<style scoped>
.back-button {
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
  bottom: 20px;
  left: 20px;
  z-index: 1000;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #414548;
}

.back-arrow {
  font-size: 24px;
  color: #2c3e50;
  font-weight: bold;
}

.back-button:hover .back-arrow {
  color: #414548;
}

@media (max-width: 768px) {
  .back-button {
    width: 40px;
    height: 40px;
    bottom: 15px;
    left: 15px;
  }
  
  .back-arrow {
    font-size: 20px;
  }
}
</style>
