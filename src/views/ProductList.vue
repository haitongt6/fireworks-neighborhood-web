<template>
  <div class="space-y-6">
    <!-- Header Actions -->
    <div class="flex flex-col gap-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <input
            v-model.number="query.productId"
            type="number"
            placeholder="商品ID"
            class="w-28 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 shadow-sm"
          />
          <div class="relative flex items-center">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
            <input
              v-model="query.keyword"
              type="text"
              placeholder="搜索商品名称..."
              class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 transition-all w-64 shadow-sm"
              @keyup.enter="fetchProducts"
            />
          </div>
          <div class="flex items-center gap-1">
            <input
              v-model.number="query.priceMin"
              type="number"
              step="0.01"
              placeholder="最低价"
              class="w-24 px-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 shadow-sm"
            />
            <span class="text-gray-400">-</span>
            <input
              v-model.number="query.priceMax"
              type="number"
              step="0.01"
              placeholder="最高价"
              class="w-24 px-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 shadow-sm"
            />
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              <input
                v-model="query.createTimeStart"
                type="date"
                :max="query.createTimeEnd || undefined"
                class="px-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                @change="onTimeStartChange"
              />
              <span class="text-gray-400">至</span>
              <input
                v-model="query.createTimeEnd"
                type="date"
                :min="query.createTimeStart || undefined"
                class="px-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                @change="onTimeEndChange"
              />
            </div>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all"
                @click="applyQuickTime(3)"
              >
                近三天
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all"
                @click="applyQuickTime(7)"
              >
                近七天
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all"
                @click="applyQuickTime(30)"
              >
                近一月
              </button>
            </div>
          </div>
          <button
            class="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-2xl text-sm font-medium transition-all"
            @click="fetchProducts"
          >
            搜索
          </button>
          <select
            v-model="query.categoryId"
            class="bg-white border border-gray-200 rounded-2xl text-sm px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 shadow-sm"
            @change="fetchProducts"
          >
            <option :value="undefined">所有分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <router-link
          v-if="userStore.hasPermission('pms:product:add')"
          to="/products/add"
          class="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
        >
          <Plus :size="20" />
          <span>新增商品</span>
        </router-link>
      </div>
    </div>

    <!-- Product Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-50">
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">商品信息</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">分类</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">价格</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">库存</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">状态</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">创建时间</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-50">
                    <img :src="getFirstImage(product.images)" class="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">{{ product.title }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">ID: {{ product.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5">
                <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {{ product.categoryName }}
                </span>
              </td>
              <td class="px-8 py-5">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-900">¥{{ product.price }}</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="flex flex-col gap-1">
                  <div class="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full"
                      :class="(product.stock ?? 0) < 20 ? 'bg-red-500' : 'bg-green-500'"
                      :style="{ width: `${Math.min(product.stock ?? 0, 100)}%` }"
                    ></div>
                  </div>
                  <span class="text-xs font-medium" :class="(product.stock ?? 0) < 20 ? 'text-red-500' : 'text-gray-500'">
                    {{ product.stock ?? 0 }} 件
                  </span>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-2">
                  <div :class="`w-2 h-2 rounded-full ${product.status === 1 ? 'bg-green-500' : 'bg-gray-300'}`"></div>
                  <span class="text-sm font-medium text-gray-700">{{ statusText(product.status) }}</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <span class="text-sm text-gray-600">{{ formatCreateTime(product.createTime) }}</span>
              </td>
              <td class="px-8 py-5 text-right">
                <router-link
                  v-if="userStore.hasPermission('pms:product:edit')"
                  :to="`/products/edit/${product.id}`"
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all inline-block"
                >
                  <Edit2 :size="18" />
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
        <p class="text-sm text-gray-500">
          {{ paginationText }}
        </p>
        <div class="flex items-center gap-2">
          <button
            class="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50"
            :disabled="query.pageNum <= 1"
            @click="goPage(query.pageNum! - 1)"
          >
            <ChevronLeft :size="18" />
          </button>
          <button
            v-for="p in pageNumbers"
            :key="p"
            class="w-10 h-10 rounded-xl font-bold shadow-md"
            :class="p === query.pageNum ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
            @click="goPage(p)"
          >
            {{ p }}
          </button>
          <button
            class="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50"
            :disabled="query.pageNum >= totalPages"
            @click="goPage(query.pageNum! + 1)"
          >
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Plus, Edit2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { listCategories } from '@/api/category'
import { listProducts, type PmsProductListVO, type PmsProductQueryParam } from '@/api/product'
import type { PmsProductCategory } from '@/api/category'

const userStore = useUserStore()
const categories = ref<PmsProductCategory[]>([])
const products = ref<PmsProductListVO[]>([])
const total = ref(0)
const query = reactive<PmsProductQueryParam>({
  productId: undefined,
  keyword: '',
  categoryId: undefined,
  priceMin: undefined,
  priceMax: undefined,
  createTimeStart: undefined,
  createTimeEnd: undefined,
  pageNum: 1,
  pageSize: 10,
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / (query.pageSize || 10))))
const pageNumbers = computed(() => {
  const max = 5
  const pages: number[] = []
  if (totalPages.value <= 0) return [1]
  let start = Math.max(1, (query.pageNum || 1) - 2)
  const end = Math.min(totalPages.value, start + max - 1)
  if (end - start + 1 < max) start = Math.max(1, end - max + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
const paginationText = computed(() => {
  const from = total.value === 0 ? 0 : (query.pageNum! - 1) * query.pageSize! + 1
  const to = Math.min(query.pageNum! * query.pageSize!, total.value)
  return `显示 ${from} 到 ${to} 条，共 ${total.value} 条商品`
})

function getFirstImage(images?: string): string {
  if (!images?.trim()) return ''
  const s = images.trim()
  if (s.startsWith('[')) {
    try {
      const arr = JSON.parse(s)
      return Array.isArray(arr) && arr[0] ? String(arr[0]) : ''
    } catch {
      return s.split(',')[0]?.trim() || ''
    }
  }
  return s.split(',')[0]?.trim() || ''
}

function statusText(status: number): string {
  const map: Record<number, string> = { 1: '上架中', 0: '已下架', 2: '待上架' }
  return map[status] ?? '未知'
}

function formatCreateTime(s?: string): string {
  if (!s) return '-'
  try {
    const d = new Date(s)
    return isNaN(d.getTime()) ? s : d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return s
  }
}

/** 获取 yyyy-MM-dd 格式日期 */
function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** 开始时间变更：若大于结束时间则联动修正结束时间 */
function onTimeStartChange() {
  const start = query.createTimeStart
  const end = query.createTimeEnd
  if (start && end && start > end) {
    query.createTimeEnd = start
  }
  fetchProducts()
}

/** 结束时间变更：若小于开始时间则联动修正开始时间 */
function onTimeEndChange() {
  const start = query.createTimeStart
  const end = query.createTimeEnd
  if (start && end && end < start) {
    query.createTimeStart = end
  }
  fetchProducts()
}

/** 近 N 天快速回显 */
function applyQuickTime(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  query.createTimeStart = toYmd(start)
  query.createTimeEnd = toYmd(end)
  fetchProducts()
}

async function fetchCategories() {
  const res = await listCategories()
  categories.value = res.data || []
}

async function fetchProducts() {
  const res = await listProducts(query)
  products.value = res.data?.list || []
  total.value = res.data?.total ?? 0
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  query.pageNum = p
  fetchProducts()
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>
