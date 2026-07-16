<template>
  <div class="comment-section">
    <h2 class="section-title">评论</h2>

    <!-- ====== 已登录：评论表单 ====== -->
    <form v-if="isAuthenticated" class="comment-form" @submit.prevent="handleSubmit">
      <!-- 当前用户信息条 -->
      <div class="current-user-bar">
        <div class="comment-avatar" :style="{ backgroundColor: avatarColor(user?.username || '') }">
          {{ userInitial }}
        </div>
        <span class="current-user-name">{{ user?.username }}</span>
      </div>

      <div class="form-group">
        <textarea
          id="comment-content"
          v-model="form.content"
          class="form-textarea"
          rows="4"
          placeholder="写下你的想法…"
          maxlength="500"
        ></textarea>
        <div class="textarea-footer">
          <p v-if="errors.content" class="form-error">{{ errors.content }}</p>
          <span class="char-count">{{ form.content.length }}/500</span>
        </div>
      </div>

      <button type="submit" class="submit-btn" :disabled="submitting">
        {{ submitting ? '提交中…' : '发布评论' }}
      </button>
    </form>

    <!-- ====== 未登录：登录提示 ====== -->
    <div v-else class="login-prompt">
      <div class="login-prompt-icon">🔒</div>
      <p class="login-prompt-text">请登录后发表评论</p>
      <button type="button" class="login-prompt-btn" @click="openAuthModal('login')">
        去登录
      </button>
    </div>

    <!-- ====== 评论列表 ====== -->
    <div class="comment-divider"></div>

    <div v-if="comments.length === 0" class="empty-state">
      <div class="empty-icon">💬</div>
      <p>暂无评论，来说两句吧</p>
    </div>

    <ul v-else class="comment-list">
      <li
        v-for="comment in comments"
        :key="comment.id"
        class="comment-item"
      >
        <div class="comment-avatar" :style="{ backgroundColor: avatarColor(comment.nickname) }">
          {{ comment.nickname.charAt(0).toUpperCase() }}
        </div>

        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-nickname">{{ comment.nickname }}</span>
            <span class="comment-date">{{ formatDate(comment.date) }}</span>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import type { Comment } from '@/types/comment'
import { getComments } from '@/utils/comment-store'
import { formatDate } from '@/utils/format'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{
  articleId: number
}>()

const { isAuthenticated, user, openAuthModal, getAccessToken } = useAuth()

const comments = ref<Comment[]>([])

// ---- 用户信息 ----
const userInitial = computed(() => {
  if (!user.value) return '?'
  return user.value.username.charAt(0).toUpperCase()
})

// ---- 表单 ----
const initialForm = { content: '' }
const form = reactive({ ...initialForm })
const errors = reactive({ content: '' })
const submitting = ref(false)

function validate(): boolean {
  let valid = true
  errors.content = ''

  if (!form.content) {
    errors.content = '请输入评论内容'
    valid = false
  } else if (form.content.length < 2) {
    errors.content = '评论至少 2 个字符'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate() || !user.value) return

  submitting.value = true

  const accessToken = getAccessToken()

  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
      body: JSON.stringify({
        articleId: props.articleId,
        nickname: user.value.username,
        email: user.value.email,
        content: form.content,
      }),
    })

    if (!res.ok) {
      // 尝试解析错误消息
      const data = await res.json().catch(() => ({ error: '提交失败' }))
      errors.content = data.error || '评论提交失败，请稍后重试'
      submitting.value = false
      return
    }

    Object.assign(form, initialForm)
    errors.content = ''
    submitting.value = false

    await loadComments()
  } catch {
    errors.content = '网络错误，请稍后重试'
    submitting.value = false
  }
}

// ---- 加载 ----
async function loadComments() {
  comments.value = await getComments(props.articleId)
}

onMounted(() => {
  loadComments()
})

watch(() => props.articleId, async () => {
  await loadComments()
})

// ---- 头像颜色 ----
function avatarColor(name: string): string {
  const colors = [
    '#4a90e2', '#5b9bd5', '#6c5ce7', '#a29bfe',
    '#e17055', '#d63031', '#00b894', '#00cec9',
    '#0984e3', '#6c5ce7', '#fdcb6e', '#e84393',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
</script>

<style scoped>
.comment-section {
  width: min(800px, 90vw);
  margin: 0 auto;
  padding-bottom: 60px;
}

.section-title {
  font-size: 1.3rem;
  color: #1f2a38;
  margin: 0 0 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #d9e5f3;
}

/* ====== 当前用户信息条 ====== */
.current-user-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f4f8;
}

.current-user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
}

/* ====== 登录提示 ====== */
.login-prompt {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 40px 32px;
  text-align: center;
}

.login-prompt-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.login-prompt-text {
  font-size: 0.95rem;
  color: #5f7184;
  margin: 0 0 20px;
}

.login-prompt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 32px;
  background: #4a90e2;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.25s ease, transform 0.15s ease;
}

.login-prompt-btn:hover {
  background: #3a7bd5;
  transform: translateY(-1px);
}

/* ====== 表单 ====== */
.comment-form {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 28px 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-textarea {
  padding: 12px 14px;
  border: 1px solid #dce3ec;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #2f3a4b;
  background: #fafbfd;
  outline: none;
  resize: none;
  min-height: 100px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  font-family: inherit;
  line-height: 1.6;
}

.form-textarea:focus {
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.12);
  background: #fff;
}

.form-textarea::placeholder {
  color: #bcc7d4;
}

.textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.char-count {
  font-size: 0.8rem;
  color: #a0b0c0;
  margin-left: auto;
}

.form-error {
  font-size: 0.82rem;
  color: #e17055;
  margin: 4px 0 0;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  padding: 0 28px;
  margin-top: 20px;
  background: #4a90e2;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.15s ease;
  font-family: inherit;
}

.submit-btn:hover:not(:disabled) {
  background: #3a7bd5;
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: #b0c8e8;
  cursor: not-allowed;
}

/* ====== 分割线 ====== */
.comment-divider {
  height: 0;
  margin: 32px 0;
}

/* ====== 空状态 ====== */
.empty-state {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 48px 32px;
  text-align: center;
  color: #a0b0c0;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 0.95rem;
  margin: 0;
}

/* ====== 评论列表 ====== */
.comment-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 16px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 20px 24px;
  transition: box-shadow 0.25s ease;
}

.comment-item:hover {
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.1);
}

.comment-avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  user-select: none;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.comment-nickname {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2f3a4b;
}

.comment-date {
  font-size: 0.8rem;
  color: #a0b0c0;
}

.comment-content {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.7;
  color: #4a5568;
  word-break: break-word;
}

/* ====== 响应式 ====== */
@media (max-width: 768px) {
  .comment-form {
    padding: 20px;
  }

  .comment-item {
    padding: 16px;
    gap: 12px;
  }

  .comment-avatar {
    width: 38px;
    height: 38px;
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.15rem;
  }
}
</style>
