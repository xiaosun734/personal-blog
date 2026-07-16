import { ref, computed } from 'vue'

export interface User {
  id: string
  username: string
  email: string
}

interface Session {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

// ========== 持久化 key ==========
const STORAGE_KEY_USER = 'blog_user'
const STORAGE_KEY_SESSION = 'blog_session'

// ========== 从 localStorage 恢复 ==========
function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION)
    if (!raw) return null
    const session = JSON.parse(raw) as Session
    // 检查 token 是否过期（留 60 秒缓冲）
    if (session.expiresAt && Date.now() / 1000 >= session.expiresAt - 60) {
      // token 已过期，清除
      localStorage.removeItem(STORAGE_KEY_SESSION)
      localStorage.removeItem(STORAGE_KEY_USER)
      return null
    }
    return session
  } catch {
    return null
  }
}

function saveUser(u: User) {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u))
}

function saveSession(s: Session) {
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(s))
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY_USER)
  localStorage.removeItem(STORAGE_KEY_SESSION)
}

// ========== 全局共享状态 ==========
const storedUser = loadUser()
const storedSession = loadSession()

const user = ref<User | null>(storedUser)
const isAuthenticated = computed(() => user.value !== null)
const session = ref<Session | null>(storedSession)

// 模态框可见性
const authModalVisible = ref(false)

// 初始化时如果有 token 但没用户信息，尝试重新获取
if (storedSession && !storedUser) {
  clearStorage()
  session.value = null
}

export function useAuth() {
  // ========== 认证状态 ==========
  function setUser(newUser: User) {
    user.value = newUser
    saveUser(newUser)
  }

  function clearUser() {
    user.value = null
    session.value = null
    clearStorage()
  }

  /** 获取当前 access token（供其他 API 调用使用） */
  function getAccessToken(): string | null {
    return session.value?.accessToken || null
  }

  // ========== 登录 ==========
  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      })

      const data = await res.json()

      if (!res.ok || !data.session) {
        return { success: false, error: (data.error as string) || '登录失败' }
      }

      const u: User = data.user
      const s: Session = {
        accessToken: data.session.accessToken,
        refreshToken: data.session.refreshToken,
        expiresAt: data.session.expiresAt
      }

      setUser(u)
      saveSession(s)
      session.value = s

      return { success: true }
    } catch (e) {
      return { success: false, error: '网络错误，请稍后重试' }
    }
  }

  // ========== 注册 ==========
  async function register(username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', username, email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: (data.error as string) || '注册失败' }
      }

      // 注册成功，保存用户信息和 session
      if (data.session) {
        const u: User = data.user
        const s: Session = {
          accessToken: data.session.accessToken,
          refreshToken: data.session.refreshToken,
          expiresAt: data.session.expiresAt
        }

        setUser(u)
        saveSession(s)
        session.value = s
      }

      return { success: true }
    } catch (e) {
      return { success: false, error: '网络错误，请稍后重试' }
    }
  }

  // ========== 登出 ==========
  async function logout() {
    try {
      // 通知服务端（可选，用于使 refresh token 失效）
      await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session.value?.accessToken
            ? { Authorization: `Bearer ${session.value.accessToken}` }
            : {})
        },
        body: JSON.stringify({ action: 'logout' })
      }).catch(() => {})
    } finally {
      clearUser()
    }
  }

  // ========== 模态框控制 ==========
  function openAuthModal(_mode: 'login' | 'register' = 'login') {
    // 模态框内部有登录/注册切换按钮，_mode 预留后续使用
    authModalVisible.value = true
  }

  function closeAuthModal() {
    authModalVisible.value = false
  }

  return {
    // 状态
    user,
    isAuthenticated,
    authModalVisible,
    session,

    // 方法
    login,
    register,
    logout,
    openAuthModal,
    closeAuthModal,
    setUser,
    clearUser,
    getAccessToken
  }
}
