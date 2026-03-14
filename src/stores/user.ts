import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  login as loginApi,
  logout as logoutApi,
  getCurrentUserPermissions,
  type LoginParam
} from '@/api/login'

const USER_INFO_KEY = 'user_info'

function loadUserInfoFromStorage(): { username: string; nickname: string; email: string } {
  try {
    const info = localStorage.getItem(USER_INFO_KEY)
    if (info) {
      const data = JSON.parse(info) as { username?: string; nickname?: string; email?: string }
      return { username: data.username ?? '', nickname: data.nickname ?? '', email: data.email ?? '' }
    }
  } catch {
    //
  }
  return { username: '', nickname: '', email: '' }
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const tokenHead = ref(localStorage.getItem('tokenHead') || '')
  const initialUser = loadUserInfoFromStorage()
  const username = ref(initialUser.username)
  const nickname = ref(initialUser.nickname)
  const email = ref(initialUser.email)
  const permissions = ref<string[]>([])

  const isLoggedIn = computed(() => !!token.value)

  const displayName = computed(() => (nickname.value?.trim() || username.value) || '管理员')

  /** 判断是否有指定权限（用于按钮显隐） */
  function hasPermission(perm: string): boolean {
    return permissions.value.includes(perm)
  }

  async function fetchPermissions() {
    if (!token.value) {
      permissions.value = []
      return
    }
    try {
      const res = await getCurrentUserPermissions()
      permissions.value = Array.isArray(res.data) ? res.data : []
    } catch {
      permissions.value = []
    }
  }

  async function login(params: LoginParam) {
    const res = await loginApi(params)
    const data = res.data
    token.value = data.token
    tokenHead.value = data.tokenHead
    localStorage.setItem('token', data.token)
    localStorage.setItem('tokenHead', data.tokenHead)
    const userInfo = { username: data.username, nickname: data.nickname, email: data.email }
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
    username.value = data.username
    nickname.value = data.nickname ?? ''
    email.value = data.email ?? ''
    await fetchPermissions()
  }

  async function logout() {
    try {
      await logoutApi()
    } catch {
      // 忽略登出接口失败（如 token 已过期）
    } finally {
      doClearSession()
    }
  }

  /** 仅清除本地会话并跳转登录页（用于修改密码/禁用后强制下线，不调用登出接口） */
  function clearSessionAndRedirect(message?: string) {
    doClearSession()
    const url = message ? `/login?msg=${encodeURIComponent(message)}` : '/login'
    window.location.href = url
  }

  function doClearSession() {
    token.value = ''
    tokenHead.value = ''
    username.value = ''
    nickname.value = ''
    email.value = ''
    permissions.value = []
    localStorage.removeItem('token')
    localStorage.removeItem('tokenHead')
    localStorage.removeItem(USER_INFO_KEY)
  }

  return {
    token,
    tokenHead,
    username,
    nickname,
    email,
    permissions,
    isLoggedIn,
    displayName,
    hasPermission,
    fetchPermissions,
    login,
    logout,
    clearSessionAndRedirect
  }
})
