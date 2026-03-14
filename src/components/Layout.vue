<template>
  <div class="layout-container h-screen flex overflow-hidden bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div class="p-6 flex items-center gap-3 border-b border-gray-100">
        <div class="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200">
          <Send :size="22" class="transform translate-x-0.5 -translate-y-0.5" />
        </div>
        <div>
          <h1 class="font-bold text-gray-900 leading-tight text-lg tracking-tight">烟火邻里</h1>
          <p class="text-[10px] text-gray-400 font-medium tracking-wider mt-0.5">同城配送 · 点对点</p>
        </div>
      </div>
      
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <MenuGroup
          v-for="item in menuItems"
          :key="item.id ?? item.path ?? item.name"
          :item="item"
          :depth="0"
          :expanded-ids="expandedDirIds"
          :current-path="route.path"
          @toggle="toggleDir"
        />
      </nav>

      <div class="p-4 border-t border-gray-100">
        <div class="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <button
            class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm hover:bg-orange-200 transition-colors flex-shrink-0"
            @click="openProfileDialog"
          >
            {{ avatarText }}
          </button>
          <div class="flex-1 min-w-0 cursor-pointer" @click="openProfileDialog">
            <p class="text-sm font-semibold text-gray-900 truncate">{{ userStore.displayName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ userStore.email || '—' }}</p>
          </div>
          <button @click="handleLogout" class="text-gray-400 hover:text-gray-600 transition-colors">
            <LogOut :size="18" />
          </button>
        </div>
      </div>

    <!-- 个人信息弹窗 -->
    <el-dialog
      v-model="profileDialogVisible"
      title="个人信息"
      width="400px"
      :close-on-click-modal="false"
      @closed="resetProfileForm"
    >
      <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="profileForm.username" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="profileForm.nickname" placeholder="显示昵称" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" placeholder="联系邮箱" maxlength="128" />
        </el-form-item>
        <el-form-item label="修改密码" prop="password">
          <el-input
            v-model="profileForm.password"
            type="password"
            placeholder="不修改请留空"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="profileLoading" @click="submitProfile">确定</el-button>
      </template>
    </el-dialog>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-bold text-gray-900">{{ currentRouteName }}</h2>
          <div class="h-4 w-px bg-gray-200 mx-2"></div>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Home :size="16" />
            <span>/</span>
            <span>{{ currentRouteName }}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-6">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
            <input 
              type="text" 
              placeholder="搜索功能或订单..." 
              class="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-orange-500/20 transition-all w-64"
            />
          </div>
          <button class="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Bell :size="20" />
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-y-auto p-8">
        <router-view v-slot="{ Component }">
          <transition 
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-4"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  Send,
  Package,
  ClipboardList,
  Users,
  MapPin,
  Settings,
  Shield,
  List,
  LogOut,
  Search,
  Bell,
  Home,
  FolderOpen
} from 'lucide-vue-next'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import MenuGroup from './MenuGroup.vue'
import { useUserStore } from '@/stores/user'
import { getMenuTree, type MenuTreeNode } from '@/api/menu'
import { getProfile, updateProfile } from '@/api/login'
import { encryptPassword } from '@/utils/rsaEncrypt'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const profileDialogVisible = ref(false)
const profileLoading = ref(false)
const profileFormRef = ref<FormInstance>()
const profileForm = ref({ username: '', nickname: '', email: '', password: '' })
const profileRules: FormRules = {}

const iconMap: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  MapPin,
  Settings,
  Shield,
  List,
  FolderOpen
}

type MenuItem = { id: number; name: string; path: string; icon: typeof LayoutDashboard; children?: MenuItem[] }
const menuItems = ref<MenuItem[]>([])
const expandedDirIds = ref<Set<number>>(new Set())

function toggleDir(id: number) {
  const next = new Set(expandedDirIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedDirIds.value = next
}

function toAbsolutePath(path: string): string {
  if (!path) return '/'
  return path.startsWith('/') ? path : '/' + path
}

let _menuKeyCounter = 0
function buildMenu(nodes: MenuTreeNode[]): MenuItem[] {
  return nodes.map((node) => {
    const icon = iconMap[node.icon] || LayoutDashboard
    const children = node.children?.length ? buildMenu(node.children) : undefined
    const path = toAbsolutePath(node.path || '')
    const id = node.id ?? --_menuKeyCounter
    return { id, name: node.name, path, icon, children }
  })
}

function findNameInMenu(items: MenuItem[], path: string): string | undefined {
  for (const item of items) {
    if (item.path === path) return item.name
    if (item.children) {
      const found = findNameInMenu(item.children, path)
      if (found) return found
    }
  }
  return undefined
}

onMounted(async () => {
  try {
    const res = await getMenuTree()
    menuItems.value = buildMenu(res.data || [])
  } catch {
    menuItems.value = []
  }
  userStore.fetchPermissions()
})

const avatarText = computed(() => {
  const name = userStore.displayName
  if (!name) return '—'
  const chars = [...name]
  return chars.length >= 2 ? chars.slice(0, 2).join('').toUpperCase() : name.toUpperCase()
})

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}

async function openProfileDialog() {
  profileDialogVisible.value = true
  try {
    const res = await getProfile()
    const data = res.data
    profileForm.value = {
      username: data?.username ?? userStore.username,
      nickname: data?.nickname ?? userStore.nickname ?? '',
      email: data?.email ?? userStore.email ?? '',
      password: ''
    }
  } catch {
    profileForm.value = {
      username: userStore.username,
      nickname: userStore.nickname ?? '',
      email: userStore.email ?? '',
      password: ''
    }
  }
}

function resetProfileForm() {
  profileFormRef.value?.resetFields()
  profileForm.value = { username: '', nickname: '', email: '', password: '' }
}

async function submitProfile() {
  if (!profileFormRef.value) return
  profileLoading.value = true
  try {
    const param: { nickname?: string; email?: string; password?: string } = {
      nickname: profileForm.value.nickname?.trim() || '',
      email: profileForm.value.email?.trim() || ''
    }
    if (profileForm.value.password?.trim()) {
      param.password = await encryptPassword(profileForm.value.password.trim())
    }
    await updateProfile(param)
    if (param.password) {
      userStore.clearSessionAndRedirect('密码已修改，请使用新密码重新登录')
      return
    }
    userStore.nickname = param.nickname ?? ''
    userStore.email = param.email ?? ''
    const userInfo = localStorage.getItem('user_info')
    if (userInfo) {
      try {
        const data = JSON.parse(userInfo) as Record<string, string>
        data.nickname = param.nickname ?? ''
        data.email = param.email ?? ''
        localStorage.setItem('user_info', JSON.stringify(data))
      } catch {
        //
      }
    }
    profileDialogVisible.value = false
    ElMessage.success('修改成功')
  } catch (e) {
    ElMessage.error((e as Error).message || '修改失败')
  } finally {
    profileLoading.value = false
  }
}

const currentRouteName = computed(() => {
  const name = findNameInMenu(menuItems.value, route.path)
  return name || '管理系统'
})
</script>

<style scoped>
.layout-container {
  font-family: 'Inter', sans-serif;
}
</style>
