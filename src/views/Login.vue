<template>
  <div class="min-h-screen flex">
    <!-- Left Side: Image & Branding -->
    <div class="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
      <img 
        src="https://picsum.photos/seed/neighborhood/1920/1080" 
        alt="Neighborhood Background" 
        class="absolute inset-0 w-full h-full object-cover opacity-60"
        referrerPolicy="no-referrer"
      />
      <!-- Gradient overlay to match the brand colors -->
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/60 to-teal-600/80 mix-blend-multiply"></div>
      
      <div class="relative z-10 flex flex-col justify-center px-16 text-white w-full">
        <div class="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-2xl border border-white/30">
          <Send :size="32" class="text-white transform translate-x-1 -translate-y-1" />
        </div>
        <h1 class="text-5xl font-bold mb-6 leading-tight">烟火邻里<br/>同城配送服务</h1>
        <p class="text-lg text-white/90 max-w-md leading-relaxed font-medium">
          同城配送 · 鲜活到家<br/>
          新鲜实惠，每日精选源头好货，品质保证
        </p>
      </div>
    </div>

    <!-- Right Side: Login Form -->
    <div class="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-8 sm:px-16">
      <div class="w-full max-w-md space-y-8">
        <div class="text-center lg:text-left">
          <div class="lg:hidden w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mx-auto mb-6">
            <Send :size="24" class="transform translate-x-0.5 -translate-y-0.5" />
          </div>
          <h2 class="text-3xl font-bold text-gray-900 tracking-tight">欢迎回来</h2>
          <p class="text-sm text-gray-500 mt-2">烟火邻里管理后台 · 新鲜实惠，每天为您精选源头好货</p>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">用户名</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User class="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  v-model="username"
                  type="text" 
                  required
                  class="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white shadow-sm"
                  placeholder="请输入用户名 (如: admin)"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">密码</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock class="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  v-model="password"
                  type="password" 
                  required
                  class="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white shadow-sm"
                  placeholder="请输入密码"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember-me" type="checkbox" class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer">
              <label for="remember-me" class="ml-2 block text-sm text-gray-600 cursor-pointer">
                记住我
              </label>
            </div>
            <div class="text-sm">
              <a href="#" class="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">忘记密码？</a>
            </div>
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-emerald-500/30 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Send, User, Lock } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { encryptPassword } from '@/utils/rsaEncrypt'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) return
  loading.value = true
  try {
    const encryptedPassword = await encryptPassword(password.value)
    await userStore.login({ username: username.value, password: encryptedPassword })
    router.push('/')
  } catch {
    // 错误已由 request 拦截器统一提示
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const msg = route.query.msg
  if (typeof msg === 'string' && msg) {
    ElMessage.warning(decodeURIComponent(msg))
    router.replace({ path: '/login', query: {} })
  }
})
</script>
