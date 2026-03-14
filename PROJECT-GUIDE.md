# 烟火邻里 - 前端项目开发指南

> 本文档面向后端 Java 开发者，帮助你快速理解本项目的前端技术栈、项目结构和开发模式。

---

## 一、技术栈总览

| 技术 | 作用 | 类比 Java 生态 |
|------|------|----------------|
| **Vue 3** | 前端框架，构建用户界面 | 类似 Spring MVC 的 View 层 |
| **TypeScript** | JavaScript 的强类型超集 | 类似 Java 本身的类型系统 |
| **Vite** | 构建工具 & 开发服务器 | 类似 Maven/Gradle + Tomcat 热部署 |
| **Vue Router** | 前端路由，控制页面跳转 | 类似 Spring MVC 的 `@RequestMapping` |
| **Pinia** | 全局状态管理 | 类似 Spring 的 `@Service` 单例 Bean |
| **Axios** | HTTP 请求库 | 类似 Java 的 `HttpClient` / `RestTemplate` |
| **Element Plus** | UI 组件库（表格、按钮、弹窗等） | 类似后端模板引擎的 UI 组件 |
| **Tailwind CSS** | 原子化 CSS 框架，用 class 直接写样式 | 无直接对应，取代传统 CSS 文件 |
| **Lucide** | 图标库 | — |

---

## 二、项目结构

```
fireworks-neighborhood-web/
├── index.html                 # 入口 HTML（类似 web.xml 的起点）
├── package.json               # 依赖管理（类似 pom.xml）
├── vite.config.ts             # Vite 配置（类似 application.yml）
├── tsconfig.json              # TypeScript 编译配置
├── .env.example               # 环境变量模板
│
└── src/                       # 源码目录（类似 src/main/java）
    ├── main.ts                # 应用入口（类似 Spring Boot 的 main 方法）
    ├── App.vue                # 根组件
    ├── index.css              # 全局样式（引入 Tailwind）
    ├── env.d.ts               # TypeScript 类型声明
    │
    ├── router/                # 路由配置（类似 Controller 层的 URL 映射）
    │   └── index.ts
    │
    ├── stores/                # 状态管理（类似 Service 层）
    │   └── user.ts            # 用户认证状态
    │
    ├── api/                   # 接口定义（类似 Feign Client）
    │   └── login.ts
    │
    ├── utils/                 # 工具类
    │   └── request.ts         # Axios 封装（类似 HttpClient 配置）
    │
    ├── components/            # 公共组件
    │   └── Layout.vue         # 主布局（侧边栏 + 顶栏 + 内容区）
    │
    └── views/                 # 页面组件（类似 Controller 对应的页面）
        ├── Login.vue          # 登录页
        ├── Dashboard.vue      # 仪表盘首页
        ├── ProductList.vue    # 商品管理
        ├── OrderList.vue      # 订单管理
        ├── PointList.vue      # 自提点管理
        └── Placeholder.vue    # 占位页（功能开发中）
```

---

## 三、核心文件详解

### 3.1 应用入口 `src/main.ts`

```typescript
const app = createApp(App)    // 创建 Vue 应用实例
app.use(createPinia())        // 注册 Pinia（状态管理）
app.use(router)               // 注册路由
app.use(ElementPlus)          // 注册 UI 组件库
app.mount('#root')            // 挂载到 index.html 中的 <div id="root">
```

**类比**：相当于 Spring Boot 的 `main()` 方法 + `@EnableAutoConfiguration`，把各种模块注册进来。

---

### 3.2 路由配置 `src/router/index.ts`

路由定义了 **URL → 页面组件** 的映射关系：

| URL 路径 | 组件 | 说明 |
|----------|------|------|
| `/login` | `Login.vue` | 登录页（无布局框架） |
| `/` | `Dashboard.vue` | 仪表盘（嵌套在 Layout 中） |
| `/products` | `ProductList.vue` | 商品管理 |
| `/orders` | `OrderList.vue` | 订单管理 |
| `/users` | `Placeholder.vue` | 用户管理（待开发） |
| `/points` | `PointList.vue` | 自提点管理 |
| `/settings` | `Placeholder.vue` | 系统设置（待开发） |

**路由守卫**（类比 Spring 的 `Filter` / `Interceptor`）：

```typescript
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')              // 未登录 → 跳转登录页
  } else if (to.path === '/login' && token) {
    next('/')                   // 已登录访问登录页 → 跳转首页
  } else {
    next()                      // 正常放行
  }
})
```

---

### 3.3 HTTP 请求封装 `src/utils/request.ts`

这是整个项目的 HTTP 客户端，类比 Java 中配置 `RestTemplate` 或 `OkHttp` 的拦截器：

```
┌─────────────────────────────────────────────────────────────┐
│                    Axios 实例配置                             │
│  baseURL: '/api'        → 所有请求自动加 /api 前缀            │
│  timeout: 15000         → 15 秒超时                          │
├─────────────────────────────────────────────────────────────┤
│  请求拦截器（类似 Java 的 ClientHttpRequestInterceptor）      │
│  → 自动从 localStorage 取出 token                            │
│  → 设置 Authorization: Bearer xxx 请求头                     │
├─────────────────────────────────────────────────────────────┤
│  响应拦截器（类似 Java 的 ResponseErrorHandler）              │
│  → code === 200  → 返回 data                                │
│  → code !== 200  → ElMessage.error 弹出错误提示              │
│  → code === 401  → 清除 token，跳转登录页                    │
│  → 网络异常      → 提示"网络异常，请稍后重试"                  │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.4 接口定义 `src/api/login.ts`

```typescript
// 类比 Java 的 DTO
export interface LoginParam {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  tokenHead: string       // 值为 "Bearer "
}

// 类比 Feign Client 的接口方法
export function login(data: LoginParam) {
  return request.post('/admin/login', data)
}
```

**如需新增接口**，在 `src/api/` 目录下创建新文件，例如：

```typescript
// src/api/product.ts
import request from '@/utils/request'

export function getProductList(params: { page: number; size: number }) {
  return request.get('/admin/product/list', { params })
}

export function deleteProduct(id: number) {
  return request.delete(`/admin/product/${id}`)
}
```

---

### 3.5 状态管理 `src/stores/user.ts`

Pinia Store 类比 Spring 的 `@Service` 单例 Bean，在整个应用中共享状态：

```typescript
export const useUserStore = defineStore('user', () => {
  // 响应式状态（类似 Bean 的属性）
  const token = ref(localStorage.getItem('token') || '')
  const tokenHead = ref(localStorage.getItem('tokenHead') || '')

  // 计算属性（类似 getter）
  const isLoggedIn = computed(() => !!token.value)

  // 方法（类似 Service 方法）
  async function login(params) { /* 调用 API，保存 token */ }
  function logout() { /* 清除 token */ }

  return { token, tokenHead, isLoggedIn, login, logout }
})
```

**在组件中使用**：

```typescript
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()

await userStore.login({ username: 'admin', password: '123456' })
console.log(userStore.isLoggedIn)  // true
userStore.logout()
```

---

### 3.6 Vue 组件基本结构 (`.vue` 文件)

每个 `.vue` 文件由三部分组成：

```vue
<template>
  <!-- HTML 模板（类似 JSP/Thymeleaf） -->
  <div>{{ message }}</div>
</template>

<script setup lang="ts">
// JavaScript/TypeScript 逻辑（类似 Controller 的处理逻辑）
import { ref } from 'vue'
const message = ref('Hello')
</script>

<style scoped>
/* CSS 样式（scoped 表示只作用于当前组件） */
div { color: red; }
</style>
```

---

## 四、请求代理机制（前后端联调的关键）

开发环境下，前端运行在 `localhost:3000`，后端运行在 `localhost:8081`，存在跨域问题。
通过 Vite 的 proxy 配置解决：

```
浏览器请求                 Vite 代理                         后端服务
───────────────────────────────────────────────────────────────────
POST /api/admin/login  →  去掉 /api 前缀  →  POST /admin/login
                          转发到 localhost:8081
```

配置位于 `vite.config.ts`：

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8081',   // 后端地址
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),  // 去掉 /api 前缀
  },
},
```

**如果后端端口变更**，只需修改这里的 `target` 即可。

---

## 五、登录流程全链路

```
用户输入账号密码 → 点击登录
      │
      ▼
Login.vue: handleLogin()
      │
      ▼
userStore.login({ username, password })
      │
      ▼
api/login.ts: request.post('/admin/login', data)
      │
      ▼
utils/request.ts: Axios 发出 POST /api/admin/login
      │
      ▼
vite proxy: 转发到 http://localhost:8081/admin/login
      │
      ▼
后端返回: { code: 200, data: { token: "xxx", tokenHead: "Bearer " } }
      │
      ▼
响应拦截器: code === 200，返回 res
      │
      ▼
userStore: 存储 token 到 localStorage
      │
      ▼
router.push('/') → 跳转首页
      │
      ▼
路由守卫: 检测到 token 存在 → 放行 → 渲染 Dashboard
```

---

## 六、常用命令

```bash
# 安装依赖（类似 mvn install）
npm install

# 启动开发服务器（类似 mvn spring-boot:run）
npm run dev
# 访问 http://localhost:3000

# 构建生产包（类似 mvn package）
npm run build
# 产物在 dist/ 目录

# 预览生产构建
npm run preview

# 类型检查（类似编译检查）
npm run lint
```

---

## 七、如何新增一个页面（以"用户管理"为例）

### 第 1 步：创建页面组件

新建 `src/views/UserList.vue`：

```vue
<template>
  <div>
    <h3 class="text-xl font-bold mb-4">用户管理</h3>
    <!-- 页面内容 -->
  </div>
</template>

<script setup lang="ts">
// 逻辑代码
</script>
```

### 第 2 步：注册路由

在 `src/router/index.ts` 中修改：

```typescript
{
  path: 'users',
  name: 'Users',
  component: () => import('../views/UserList.vue')  // 替换 Placeholder
}
```

### 第 3 步：创建 API 接口（如需要）

新建 `src/api/user.ts`：

```typescript
import request from '@/utils/request'

export function getUserList(params: { page: number; size: number }) {
  return request.get('/admin/user/list', { params })
}
```

### 第 4 步：在页面中调用接口

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserList } from '@/api/user'

const userList = ref([])

onMounted(async () => {
  const res = await getUserList({ page: 1, size: 10 })
  userList.value = res.data
})
</script>
```

---

## 八、Vue 3 核心概念速查

### 响应式数据

```typescript
import { ref, reactive } from 'vue'

const count = ref(0)           // 基础类型用 ref
count.value++                  // 通过 .value 访问

const form = reactive({        // 对象类型用 reactive
  username: '',
  password: ''
})
form.username = 'admin'        // 直接访问，无需 .value
```

### 生命周期

```typescript
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  // 组件挂载后执行（类似 @PostConstruct）
  console.log('页面加载完成')
})

onUnmounted(() => {
  // 组件销毁前执行（类似 @PreDestroy）
})
```

### 计算属性

```typescript
import { computed } from 'vue'

const fullName = computed(() => firstName.value + ' ' + lastName.value)
// 类似 Java 的 getter，依赖变化时自动重新计算
```

### 模板语法

```vue
<template>
  <!-- 文本插值 -->
  <span>{{ message }}</span>

  <!-- 条件渲染（类似 th:if） -->
  <div v-if="isLoggedIn">已登录</div>
  <div v-else>未登录</div>

  <!-- 列表渲染（类似 th:each） -->
  <div v-for="item in list" :key="item.id">{{ item.name }}</div>

  <!-- 事件绑定（类似 onclick） -->
  <button @click="handleClick">点击</button>

  <!-- 双向绑定（表单专用） -->
  <input v-model="username" />

  <!-- 动态属性 -->
  <img :src="imageUrl" />
  <div :class="{ active: isActive }"></div>
</template>
```

---

## 九、Tailwind CSS 速查

Tailwind 通过 class 名直接写样式，不需要写 CSS 文件：

| Class | 效果 | CSS 等价 |
|-------|------|----------|
| `text-lg` | 大号文字 | `font-size: 1.125rem` |
| `font-bold` | 粗体 | `font-weight: 700` |
| `text-gray-500` | 灰色文字 | `color: #6b7280` |
| `bg-white` | 白色背景 | `background: #fff` |
| `p-4` | 内边距 1rem | `padding: 1rem` |
| `px-6` | 水平内边距 1.5rem | `padding-left/right: 1.5rem` |
| `mt-2` | 上外边距 0.5rem | `margin-top: 0.5rem` |
| `flex` | 弹性布局 | `display: flex` |
| `items-center` | 垂直居中 | `align-items: center` |
| `justify-between` | 两端对齐 | `justify-content: space-between` |
| `rounded-xl` | 圆角 | `border-radius: 0.75rem` |
| `shadow-lg` | 大阴影 | `box-shadow: ...` |
| `hover:bg-gray-100` | 悬停时背景色 | `:hover { background: ... }` |
| `w-full` | 宽度 100% | `width: 100%` |
| `h-screen` | 高度 100vh | `height: 100vh` |
| `hidden lg:flex` | 默认隐藏，大屏显示 | 响应式设计 |

---

## 十、项目依赖说明

### 正在使用的依赖

| 包名 | 用途 |
|------|------|
| `vue` | 核心框架 |
| `vue-router` | 路由管理 |
| `pinia` | 状态管理 |
| `axios` | HTTP 请求 |
| `element-plus` | UI 组件库 |
| `lucide-vue-next` | 图标库 |
| `tailwindcss` / `@tailwindcss/vite` | CSS 框架 |
| `@vitejs/plugin-vue` | Vite 的 Vue 插件 |
| `typescript` | 类型检查 |

### 未使用的依赖（可安全移除）

| 包名 | 说明 |
|------|------|
| `react` / `react-dom` | React 框架，本项目用 Vue |
| `@vitejs/plugin-react` | React 的 Vite 插件 |
| `lucide-react` | React 版图标库 |
| `@google/genai` | Google AI SDK |
| `better-sqlite3` | SQLite 数据库 |
| `express` | Node.js 服务端框架 |
| `motion` | 动画库 |

---

## 十一、与后端联调检查清单

- [ ] 后端服务已启动在 `localhost:8081`
- [ ] 前端 `npm run dev` 启动在 `localhost:3000`
- [ ] `vite.config.ts` 中 proxy target 端口与后端一致
- [ ] 后端已配置 CORS 或依赖前端 proxy 转发
- [ ] 新增后端接口后，在 `src/api/` 下创建对应的接口文件
- [ ] 接口的请求/响应格式与后端 `Result<T>` 保持一致：`{ code, message, data }`
