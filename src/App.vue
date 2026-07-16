<template>
  <router-view />
  <AuthModal
    :visible="authModalVisible"
    @close="closeAuthModal"
    @submit="handleAuthSubmit"
  />
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import AuthModal from '@/components/auth-modal.vue'

const { authModalVisible, closeAuthModal, login, register } = useAuth()

async function handleAuthSubmit(data: { email: string; password: string; username?: string; mode: 'login' | 'register' }) {
  let result: { success: boolean; error?: string }

  if (data.mode === 'login') {
    result = await login(data.email, data.password)
  } else {
    result = await register(data.username || data.email.split('@')[0], data.email, data.password)
  }

  if (result.success) {
    closeAuthModal()
  } else {
    // 错误提示后续可以接入 Toast 组件
    console.error('认证失败:', result.error)
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0;
}
</style>
