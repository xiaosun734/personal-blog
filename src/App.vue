<template>
  <router-view />
  <AuthModal
    :visible="authModalVisible"
    @close="closeAuthModal"
  />
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import AuthModal from '@/components/auth-modal.vue'

const { authModalVisible, closeAuthModal } = useAuth()
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
