<template>
  <button class="back-button" @click="goBack" :style="{ transform: `translateY(${translateY}px)` }">
    <span class="back-arrow">←</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const translateY = ref(0)
const lastScrollTop = ref(0)
let scrollTimeout: ReturnType<typeof setTimeout> | null = null
let rafId: number | null = null

const goBack = () => {
  router.back()
}

const handleScroll = () => {
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    rafId = null

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollDelta = scrollTop - lastScrollTop.value

    translateY.value = Math.max(Math.min(translateY.value + scrollDelta * 0.2, 10), -10)

    lastScrollTop.value = scrollTop

    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }

    scrollTimeout = setTimeout(() => {
      translateY.value = 0
    }, 150)
  })
}

onMounted(() => {
  lastScrollTop.value = window.pageYOffset || document.documentElement.scrollTop || 0
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})
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
