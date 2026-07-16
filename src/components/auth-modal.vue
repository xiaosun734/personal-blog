<template>
  <Teleport to="body">
    <transition name="overlay-fade">
      <div v-if="visible" class="auth-overlay" @click.self="$emit('close')">
        <transition name="modal-slide" appear>
          <div v-if="visible" class="auth-modal" role="dialog" aria-modal="true" :aria-label="isLogin ? '登录' : '注册'">
            <!-- 关闭按钮 -->
            <button class="modal-close" @click="$emit('close')" aria-label="关闭">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="5" y1="5" x2="15" y2="15" />
                <line x1="15" y1="5" x2="5" y2="15" />
              </svg>
            </button>

            <!-- 标题 -->
            <h2 class="modal-title">{{ isLogin ? '欢迎回来' : '创建账号' }}</h2>
            <p class="modal-subtitle">{{ isLogin ? '登录你的账号继续阅读' : '注册一个新账号开始你的博客之旅' }}</p>

            <!-- 表单 -->
            <form class="auth-form" @submit.prevent="handleSubmit">
              <!-- 用户名（仅注册） -->
              <transition name="field-expand">
                <div v-if="!isLogin" class="form-group">
                  <label for="auth-username" class="form-label">用户名</label>
                  <input
                    id="auth-username"
                    v-model.trim="form.username"
                    type="text"
                    class="form-input"
                    placeholder="请输入用户名"
                    autocomplete="username"
                    :class="{ 'input-error': errors.username }"
                    @input="clearError('username')"
                  />
                  <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
                </div>
              </transition>

              <!-- 邮箱 -->
              <div class="form-group">
                <label for="auth-email" class="form-label">邮箱</label>
                <input
                  id="auth-email"
                  v-model.trim="form.email"
                  type="email"
                  class="form-input"
                  placeholder="请输入邮箱地址"
                  autocomplete="email"
                  :class="{ 'input-error': errors.email }"
                  @input="clearError('email')"
                />
                <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
              </div>

              <!-- 密码 -->
              <div class="form-group">
                <label for="auth-password" class="form-label">密码</label>
                <div class="password-wrapper">
                  <input
                    id="auth-password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-input"
                    :placeholder="isLogin ? '请输入密码' : '请设置密码（至少6位）'"
                    autocomplete="current-password"
                    :class="{ 'input-error': errors.password }"
                    @input="clearError('password')"
                  />
                  <button type="button" class="toggle-password" @click="showPassword = !showPassword" :aria-label="showPassword ? '隐藏密码' : '显示密码'">
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
                <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
              </div>

              <!-- 确认密码（仅注册） -->
              <transition name="field-expand">
                <div v-if="!isLogin" class="form-group">
                  <label for="auth-confirm-password" class="form-label">确认密码</label>
                  <input
                    id="auth-confirm-password"
                    v-model.trim="form.confirmPassword"
                    type="password"
                    class="form-input"
                    placeholder="请再次输入密码"
                    autocomplete="new-password"
                    :class="{ 'input-error': errors.confirmPassword }"
                    @input="clearError('confirmPassword')"
                  />
                  <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
                </div>
              </transition>

              <!-- 记住我（仅登录） -->
              <div v-if="isLogin" class="form-options">
                <label class="checkbox-label">
                  <input v-model="form.rememberMe" type="checkbox" class="checkbox" />
                  <span class="checkbox-text">记住我</span>
                </label>
                <button type="button" class="forgot-link" @click="handleForgotPassword">忘记密码？</button>
              </div>

              <!-- 服务端错误提示 -->
              <div v-if="serverError" class="server-error">{{ serverError }}</div>

              <!-- 提交按钮 -->
              <button type="submit" class="submit-btn" :disabled="submitting">
                <span v-if="submitting" class="btn-spinner"></span>
                <span v-else>{{ isLogin ? '登 录' : '注 册' }}</span>
              </button>
            </form>

            <!-- 切换登录/注册 -->
            <div class="switch-mode">
              <span>{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
              <button type="button" class="switch-btn" @click="toggleMode">
                {{ isLogin ? '立即注册' : '去登录' }}
              </button>
            </div>

            <!-- 分割线+第三方登录（占位） -->
            <div class="divider">
              <span class="divider-text">或</span>
            </div>
            <div class="social-login">
              <button type="button" class="social-btn github-btn" title="GitHub 登录（即将支持）" disabled>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'

// ========== Props & Emits ==========
const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { login, register } = useAuth()

// ========== State ==========
const isLogin = ref(true)
const showPassword = ref(false)
const submitting = ref(false)
const serverError = ref('')

interface FormData {
  username: string
  email: string
  password: string
  confirmPassword: string
  rememberMe: boolean
}

interface FormErrors {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const form = reactive<FormData>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  rememberMe: false
})

const errors = reactive<FormErrors>({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// ========== Methods ==========
function clearError(field: keyof FormErrors) {
  errors[field] = ''
}

function resetForm() {
  form.username = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  form.rememberMe = false
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  serverError.value = ''
  submitting.value = false
}

function toggleMode() {
  isLogin.value = !isLogin.value
  resetForm()
  showPassword.value = false
}

function validate(): boolean {
  let valid = true
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  // 用户名（仅注册）
  if (!isLogin.value && !form.username) {
    errors.username = '请输入用户名'
    valid = false
  }

  // 邮箱
  if (!form.email) {
    errors.email = '请输入邮箱地址'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    valid = false
  }

  // 密码
  if (!form.password) {
    errors.password = '请输入密码'
    valid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度不能少于6位'
    valid = false
  }

  // 确认密码（仅注册）
  if (!isLogin.value && form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate() || submitting.value) return

  submitting.value = true
  serverError.value = ''

  let result: { success: boolean; error?: string }

  if (isLogin.value) {
    result = await login(form.email, form.password)
  } else {
    result = await register(form.username, form.email, form.password)
  }

  if (result.success) {
    emit('close')
  } else {
    serverError.value = result.error || '操作失败，请稍后重试'
    submitting.value = false
  }
}

function handleForgotPassword() {
  // 忘记密码（后续实现）
}

// 弹窗关闭时延迟重置（等动画结束）
watch(() => props.visible, (val) => {
  if (!val) {
    setTimeout(() => {
      isLogin.value = true
      resetForm()
      showPassword.value = false
    }, 300)
  }
})
</script>

<style scoped>
/* ========== 遮罩层 ========== */
.auth-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* ========== 模态框 ========== */
.auth-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 40px 32px 32px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 40px 80px rgba(0, 0, 0, 0.12);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

/* ========== 关闭按钮 ========== */
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  color: #5f7184;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #1f3246;
}

/* ========== 标题 ========== */
.modal-title {
  margin: 0 0 8px;
  font-size: 1.6rem;
  font-weight: 700;
  color: #1f3246;
}

.modal-subtitle {
  margin: 0 0 28px;
  font-size: 0.9rem;
  color: #7f8c8d;
  line-height: 1.5;
}

/* ========== 表单 ========== */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
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

/* ========== 密码输入框 ========== */
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

/* ========== 错误提示 ========== */
.error-text {
  font-size: 0.78rem;
  color: #e74c3c;
  line-height: 1.4;
}

/* ========== 表单选项（记住我 + 忘记密码） ========== */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: #5b8def;
  cursor: pointer;
}

.checkbox-text {
  font-size: 0.85rem;
  color: #5f7184;
}

.forgot-link {
  border: none;
  background: none;
  padding: 0;
  font-size: 0.85rem;
  font-family: inherit;
  color: #5b8def;
  cursor: pointer;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #3b6fd4;
  text-decoration: underline;
}

/* ========== 提交按钮 ========== */
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

/* ========== 服务端错误 ========== */
.server-error {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 0.84rem;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  line-height: 1.5;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== 切换模式 ========== */
.switch-mode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 24px;
  font-size: 0.88rem;
  color: #7f8c8d;
}

.switch-btn {
  border: none;
  background: none;
  padding: 0;
  font-size: 0.88rem;
  font-family: inherit;
  font-weight: 600;
  color: #5b8def;
  cursor: pointer;
  transition: color 0.2s ease;
}

.switch-btn:hover {
  color: #3b6fd4;
  text-decoration: underline;
}

/* ========== 分割线 ========== */
.divider {
  position: relative;
  display: flex;
  align-items: center;
  margin: 20px 0 16px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e1e8ed;
}

.divider-text {
  padding: 0 16px;
  font-size: 0.82rem;
  color: #b0bec5;
}

/* ========== 第三方登录 ========== */
.social-login {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px 0;
  border: 1.5px solid #e1e8ed;
  border-radius: 12px;
  font-size: 0.9rem;
  font-family: inherit;
  color: #5f7184;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
}

.social-btn:hover:not(:disabled) {
  border-color: #c4cdd5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  color: #2c3e50;
}

.social-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ========== 过渡动画 ========== */
.overlay-fade-enter-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active {
  transition: transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease;
}
.modal-slide-leave-active {
  transition: transform 0.22s ease, opacity 0.18s ease;
}
.modal-slide-enter-from {
  transform: translateY(30px) scale(0.96);
  opacity: 0;
}
.modal-slide-leave-to {
  transform: translateY(-20px) scale(0.97);
  opacity: 0;
}

/* ========== 注册额外字段展开/收起 ========== */
.field-expand-enter-active {
  transition: all 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}
.field-expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.field-expand-enter-from,
.field-expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
}
.field-expand-enter-to,
.field-expand-leave-from {
  opacity: 1;
  max-height: 100px;
}

/* ========== 响应式 ========== */
@media (max-width: 480px) {
  .auth-modal {
    padding: 32px 20px 24px;
    border-radius: 16px;
  }

  .modal-title {
    font-size: 1.4rem;
  }
}
</style>
