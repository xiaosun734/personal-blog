<template>
  <div class="reset-page">
    <div class="reset-card">
      <!-- 加载中 -->
      <div v-if="loading" class="reset-loading">
        <div class="spinner"></div>
        <p>正在验证重置链接...</p>
      </div>

      <!-- 验证失败 -->
      <div v-else-if="tokenError" class="reset-error">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2>链接无效或已过期</h2>
        <p>{{ tokenError }}</p>
        <button class="back-btn" @click="goHome">返回首页</button>
      </div>

      <!-- 设置新密码 -->
      <div v-else-if="!success">
        <h2 class="reset-title">设置新密码</h2>
        <p class="reset-subtitle">请输入你的新密码（至少6位）</p>

        <form class="reset-form" @submit.prevent="handleReset">
          <div class="form-group">
            <label for="new-password" class="form-label">新密码</label>
            <div class="password-wrapper">
              <input
                id="new-password"
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请输入新密码"
                autocomplete="new-password"
                :class="{ 'input-error': error }"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirm-password" class="form-label">确认密码</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="请再次输入新密码"
              autocomplete="new-password"
              :class="{ 'input-error': confirmError }"
            />
            <span v-if="confirmError" class="error-text">{{ confirmError }}</span>
          </div>

          <div v-if="error" class="server-error">{{ error }}</div>

          <button type="submit" class="submit-btn" :disabled="submitting">
            <span v-if="submitting" class="btn-spinner"></span>
            <span v-else>重置密码</span>
          </button>
        </form>
      </div>

      <!-- 重置成功 -->
      <div v-else class="reset-success">
        <div class="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2>密码重置成功！</h2>
        <p>你的密码已经更新，现在可以使用新密码登录了</p>
        <button class="back-btn primary" @click="goLogin">去登录</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { updatePassword } = useAuth()

const loading = ref(true)
const tokenError = ref('')
const success = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const submitting = ref(false)
const error = ref('')
const confirmError = ref('')

// 从 URL hash 或 query 中提取参数
function getUrlParams(): Record<string, string> {
  const params: Record<string, string> = {}

  // Supabase 重置链接格式: /reset-password#access_token=xxx&type=xxx
  const hash = window.location.hash
  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1))
    hashParams.forEach((v, k) => { params[k] = v })
  }

  // 兼容 query 格式
  const search = window.location.search
  if (search) {
    const queryParams = new URLSearchParams(search)
    queryParams.forEach((v, k) => { params[k] = v })
  }

  return params
}

onMounted(() => {
  const params = getUrlParams()
  const accessToken = params.access_token
  const type = params.type

  // 如果没有 access_token，说明链接无效
  if (!accessToken) {
    tokenError.value = '请通过邮件中的链接访问此页面'
    loading.value = false
    return
  }

  // 如果是密码重置类型（recovery），验证 token 有效
  if (type === 'recovery') {
    loading.value = false
  } else {
    tokenError.value = '无效的重置链接类型'
    loading.value = false
  }
})

async function handleReset() {
  error.value = ''
  confirmError.value = ''

  if (!newPassword.value) {
    error.value = '请输入新密码'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = '密码长度不能少于6位'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    confirmError.value = '两次输入的密码不一致'
    return
  }

  const params = getUrlParams()
  const accessToken = params.access_token

  if (!accessToken) {
    error.value = '重置链接无效'
    return
  }

  submitting.value = true

  const result = await updatePassword(accessToken, newPassword.value)

  if (result.success) {
    success.value = true
  } else {
    error.value = result.error || '重置失败，请稍后重试'
    submitting.value = false
  }
}

function goHome() {
  router.push('/')
}

function goLogin() {
  router.push('/')
}
</script>

<style scoped>
.reset-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.reset-card {
  width: 100%;
  max-width: 420px;
  padding: 40px 32px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 40px 80px rgba(0, 0, 0, 0.12);
  text-align: center;
}

.reset-title {
  margin: 0 0 8px;
  font-size: 1.6rem;
  font-weight: 700;
  color: #1f3246;
}

.reset-subtitle {
  margin: 0 0 28px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.reset-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e1e8ed;
  border-top-color: #5b8def;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.reset-loading p {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.reset-error,
.reset-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-icon,
.success-icon {
  margin-bottom: 8px;
}

.reset-error h2,
.reset-success h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #1f3246;
}

.reset-error p,
.reset-success p {
  margin: 0;
  font-size: 0.9rem;
  color: #7f8c8d;
  text-align: center;
  line-height: 1.5;
}

.back-btn {
  margin-top: 12px;
  padding: 10px 24px;
  border: 1.5px solid #e1e8ed;
  border-radius: 12px;
  background: #fff;
  color: #5f7184;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  border-color: #c4cdd5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.back-btn.primary {
  background: linear-gradient(135deg, #5b8def, #4a7de0);
  border: none;
  color: #fff;
  box-shadow: 0 4px 14px rgba(91, 141, 239, 0.35);
}

.back-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(91, 141, 239, 0.45);
}

/* ========== 表单 ========== */
.reset-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e1e8ed;
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #2c3e50;
  background: #f8fafc;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

.form-input:focus {
  border-color: #5b8def;
  box-shadow: 0 0 0 3px rgba(91, 141, 239, 0.15);
  background: #fff;
}

.form-input.input-error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

.form-input::placeholder {
  color: #b0bec5;
}

.password-wrapper {
  position: relative;
}

.password-wrapper .form-input {
  padding-right: 44px;
}

.toggle-password {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

.toggle-password:hover {
  color: #5f7184;
  background: rgba(0, 0, 0, 0.04);
}

.error-text {
  font-size: 0.78rem;
  color: #e74c3c;
}

.server-error {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.84rem;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  line-height: 1.5;
}

.submit-btn {
  width: 100%;
  padding: 13px 0;
  margin-top: 4px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  color: #fff;
  background: linear-gradient(135deg, #5b8def, #4a7de0);
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(91, 141, 239, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(91, 141, 239, 0.45);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ========== 响应式 ========== */
@media (max-width: 480px) {
  .reset-card {
    padding: 28px 20px;
    border-radius: 16px;
  }

  .reset-title {
    font-size: 1.3rem;
  }

  .form-input {
    padding: 10px 14px;
    font-size: 0.88rem;
  }

  .submit-btn {
    padding: 11px 0;
    font-size: 0.95rem;
  }
}
</style>
