<template>
  <div class="space-y-6">
    <!-- 筛选 -->
    <div class="flex flex-col gap-4">
      <div class="flex flex-col xl:flex-row xl:items-end flex-wrap gap-4">
        <div class="relative flex items-center min-w-[200px] flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
          <input
            v-model.trim="query.orderNo"
            type="text"
            placeholder="订单号（精确）"
            class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 shadow-sm w-full"
            @keyup.enter="fetchOrders"
          />
        </div>
        <input
          v-model.number="query.userId"
          type="number"
          placeholder="用户 ID"
          class="w-32 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
        />
        <select
          v-model="orderStatusStr"
          class="bg-white border border-gray-200 rounded-2xl text-sm px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 shadow-sm min-w-[140px]"
        >
          <option value="">全部订单状态</option>
          <option value="0">待支付</option>
          <option value="1">已支付</option>
          <option value="2">已取消</option>
          <option value="3">已关闭</option>
          <option value="4">已完成</option>
        </select>
        <select
          v-model="payStatusStr"
          class="bg-white border border-gray-200 rounded-2xl text-sm px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 shadow-sm min-w-[140px]"
        >
          <option value="">全部支付状态</option>
          <option value="0">未支付</option>
          <option value="1">支付中</option>
          <option value="2">支付成功</option>
          <option value="3">支付失败</option>
          <option value="4">已关闭</option>
        </select>
        <div class="flex items-center gap-1 flex-wrap">
          <input
            v-model="query.createTimeStart"
            type="date"
            :max="query.createTimeEnd || undefined"
            class="px-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            @change="onTimeStartChange"
          />
          <span class="text-gray-400">至</span>
          <input
            v-model="query.createTimeEnd"
            type="date"
            :min="query.createTimeStart || undefined"
            class="px-3 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            @change="onTimeEndChange"
          />
        </div>
        <div class="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all"
            @click="applyQuickTime(0)"
          >
            今天
          </button>
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
            @click="clearTimeRange"
          >
            清除日期
          </button>
        </div>
        <button
          type="button"
          class="px-5 py-2.5 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
          @click="search"
        >
          查询
        </button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="loading" class="py-20 text-center text-gray-500 text-sm">加载中...</div>
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-left min-w-[960px]">
            <thead>
              <tr class="bg-gray-50/50 border-b border-gray-50">
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">订单信息</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">用户</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">商品摘要</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">金额</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">订单状态</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">支付状态</th>
                <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="orders.length === 0">
                <td colspan="7" class="px-6 py-16 text-center text-gray-400 text-sm">暂无订单数据</td>
              </tr>
              <tr v-for="row in orders" :key="row.id" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-6 py-5">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-sm font-bold text-gray-900 font-mono tracking-tight">{{ row.orderNo }}</span>
                    <span class="text-xs text-gray-400">{{ formatDateTime(row.createTime) }}</span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span class="text-sm font-medium text-gray-800">{{ row.userId }}</span>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                      <Package :size="20" :stroke-width="2" />
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm text-gray-800 font-medium">共 {{ row.itemCount ?? 0 }} 件</span>
                      <span class="text-xs text-gray-400">{{ sourceTypeText(row.sourceType) }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-gray-900">¥{{ formatMoney(row.payAmount) }}</span>
                    <span v-if="row.totalAmount != null && Number(row.totalAmount) !== Number(row.payAmount)" class="text-xs text-gray-400">
                      合计 ¥{{ formatMoney(row.totalAmount) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span :class="['px-3 py-1 rounded-full text-xs font-bold inline-block', orderStatusClass(row.orderStatus)]">
                    {{ orderStatusText(row.orderStatus) }}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <span :class="['px-3 py-1 rounded-full text-xs font-medium inline-block', payStatusClass(row.payStatus)]">
                    {{ payStatusText(row.payStatus) }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right whitespace-nowrap">
                  <button
                    v-if="userStore.hasPermission('oms:order:detail')"
                    type="button"
                    class="text-sm font-bold text-emerald-600 hover:text-emerald-700 mr-3"
                    @click="openDetail(row.orderNo)"
                  >
                    详情
                  </button>
                  <button
                    v-if="userStore.hasPermission('oms:order:close') && row.orderStatus === 0"
                    type="button"
                    class="text-sm font-bold text-amber-600 hover:text-amber-700"
                    @click="onCloseOrder(row)"
                  >
                    关闭
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="orders.length > 0" class="px-6 py-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
          <p class="text-sm text-gray-500">{{ paginationText }}</p>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50"
              :disabled="query.pageNum! <= 1"
              @click="goPage(query.pageNum! - 1)"
            >
              <ChevronLeft :size="18" />
            </button>
            <button
              v-for="p in pageNumbers"
              :key="p"
              type="button"
              class="min-w-[2.25rem] px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
              :class="p === query.pageNum ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
              @click="goPage(p)"
            >
              {{ p }}
            </button>
            <button
              type="button"
              class="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50"
              :disabled="query.pageNum! >= totalPages"
              @click="goPage(query.pageNum! + 1)"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>
      </template>
    </div>

    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="720px"
      destroy-on-close
      class="order-detail-dialog"
      @closed="detailRow = null"
    >
      <div v-if="detailLoading" class="py-16 text-center text-gray-500">加载中...</div>
      <div v-else-if="detailRow" class="space-y-6 max-h-[70vh] overflow-y-auto pr-1 -mr-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p class="text-xs font-bold text-gray-400 uppercase mb-2">订单号</p>
            <p class="text-sm font-mono font-bold text-gray-900 break-all">{{ detailRow.orderNo }}</p>
          </div>
          <div class="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p class="text-xs font-bold text-gray-400 uppercase mb-2">用户 ID</p>
            <p class="text-sm font-bold text-gray-900">{{ detailRow.userId }}</p>
          </div>
          <div class="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p class="text-xs font-bold text-gray-400 uppercase mb-2">订单状态</p>
            <span :class="['px-3 py-1 rounded-full text-xs font-bold inline-block', orderStatusClass(detailRow.orderStatus)]">
              {{ orderStatusText(detailRow.orderStatus) }}
            </span>
          </div>
          <div class="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p class="text-xs font-bold text-gray-400 uppercase mb-2">支付状态</p>
            <span :class="['px-3 py-1 rounded-full text-xs font-medium inline-block', payStatusClass(detailRow.payStatus)]">
              {{ payStatusText(detailRow.payStatus) }}
            </span>
          </div>
          <div class="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p class="text-xs font-bold text-gray-400 uppercase mb-2">下单来源</p>
            <p class="text-sm text-gray-800">{{ sourceTypeText(detailRow.sourceType) }}</p>
          </div>
          <div class="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p class="text-xs font-bold text-gray-400 uppercase mb-2">创建时间</p>
            <p class="text-sm text-gray-800">{{ formatDateTime(detailRow.createTime) }}</p>
          </div>
          <div class="rounded-2xl bg-gray-50 border border-gray-100 p-4 sm:col-span-2">
            <p class="text-xs font-bold text-gray-400 uppercase mb-2">金额</p>
            <p class="text-lg font-bold text-red-500">实付 ¥{{ formatMoney(detailRow.payAmount) }}</p>
            <p class="text-xs text-gray-500 mt-1">订单合计 ¥{{ formatMoney(detailRow.totalAmount) }} · 共 {{ detailRow.itemCount ?? 0 }} 件</p>
          </div>
          <div v-if="detailRow.payTime" class="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p class="text-xs font-bold text-gray-400 uppercase mb-2">支付时间</p>
            <p class="text-sm text-gray-800">{{ formatDateTime(detailRow.payTime) }}</p>
          </div>
          <div v-if="detailRow.expireTime" class="rounded-2xl bg-amber-50 border border-amber-100 p-4">
            <p class="text-xs font-bold text-amber-700 uppercase mb-2">支付截止</p>
            <p class="text-sm text-amber-900">{{ formatDateTime(detailRow.expireTime) }}</p>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-100 overflow-hidden">
          <div class="px-4 py-3 bg-emerald-50/80 border-b border-emerald-100 flex items-center gap-2">
            <MapPin class="w-4 h-4 text-emerald-600" />
            <span class="text-sm font-bold text-emerald-900">收货信息</span>
          </div>
          <div class="p-4 space-y-2 text-sm text-gray-700">
            <p>
              <span class="text-gray-400 mr-2">收货人</span>
              {{ detailRow.receiverName || '—' }}
            </p>
            <p>
              <span class="text-gray-400 mr-2">电话</span>
              {{ detailRow.receiverPhone || '—' }}
            </p>
            <p class="leading-relaxed">
              <span class="text-gray-400 mr-2 align-top">地址</span>
              {{ fullAddress(detailRow) }}
            </p>
            <p v-if="detailRow.remark">
              <span class="text-gray-400 mr-2">备注</span>
              {{ detailRow.remark }}
            </p>
          </div>
        </div>

        <div v-if="detailRow.cancelTime || detailRow.cancelReason" class="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-sm">
          <p class="font-bold text-amber-900 mb-1">取消 / 关闭信息</p>
          <p v-if="detailRow.cancelTime" class="text-amber-800">时间：{{ formatDateTime(detailRow.cancelTime) }}</p>
          <p v-if="detailRow.cancelReason" class="text-amber-800 mt-1">原因：{{ detailRow.cancelReason }}</p>
        </div>

        <div>
          <p class="text-sm font-bold text-gray-800 mb-3">商品明细</p>
          <div class="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <div
              v-for="(it, idx) in detailRow.items || []"
              :key="idx"
              class="flex gap-4 p-4 hover:bg-gray-50/50 transition-colors"
            >
              <div class="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                <img
                  :src="itemImageUrl(it.productImage)"
                  alt=""
                  class="w-full h-full object-cover"
                  referrerpolicy="no-referrer"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 line-clamp-2">{{ it.productTitle }}</p>
                <p class="text-xs text-gray-400 mt-1">ID {{ it.productId }}</p>
                <div class="flex flex-wrap items-center gap-3 mt-2 text-sm">
                  <span class="text-gray-600">¥{{ formatMoney(it.productPrice) }} × {{ it.quantity }}</span>
                  <span class="font-bold text-gray-900">小计 ¥{{ formatMoney(it.totalAmount) }}</span>
                  <span v-if="it.priceChanged" class="text-xs text-amber-600 font-medium">价格曾变动</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, Package, ChevronLeft, ChevronRight, MapPin } from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  listOrders,
  getOrderDetail,
  closeOrder,
  type OmsOrderListItemVO,
  type OmsOrderDetailVO,
} from '@/api/order'

const userStore = useUserStore()
const orders = ref<OmsOrderListItemVO[]>([])
const total = ref(0)
const loading = ref(true)
const orderStatusStr = ref('')
const payStatusStr = ref('')

const query = reactive({
  orderNo: '',
  userId: undefined as number | undefined,
  createTimeStart: undefined as string | undefined,
  createTimeEnd: undefined as string | undefined,
  pageNum: 1,
  pageSize: 10,
})

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailRow = ref<OmsOrderDetailVO | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / (query.pageSize || 10))))
const pageNumbers = computed(() => {
  const max = 5
  const pages: number[] = []
  if (totalPages.value <= 0) {
    return [1]
  }
  let start = Math.max(1, query.pageNum - 2)
  const end = Math.min(totalPages.value, start + max - 1)
  if (end - start + 1 < max) {
    start = Math.max(1, end - max + 1)
  }
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const paginationText = computed(() => {
  const from = total.value === 0 ? 0 : (query.pageNum - 1) * query.pageSize + 1
  const to = Math.min(query.pageNum * query.pageSize, total.value)
  return `显示 ${from} 到 ${to} 条，共 ${total.value} 条订单`
})

function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function onTimeStartChange() {
  const start = query.createTimeStart
  const end = query.createTimeEnd
  if (start && end && start > end) {
    query.createTimeEnd = start
  }
  fetchOrders()
}

function onTimeEndChange() {
  const start = query.createTimeStart
  const end = query.createTimeEnd
  if (start && end && end < start) {
    query.createTimeStart = end
  }
  fetchOrders()
}

function applyQuickTime(days: number) {
  const end = new Date()
  const start = new Date()
  if (days === 0) {
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } else {
    start.setDate(start.getDate() - days)
  }
  query.createTimeStart = toYmd(start)
  query.createTimeEnd = toYmd(end)
  search()
}

function clearTimeRange() {
  query.createTimeStart = undefined
  query.createTimeEnd = undefined
  search()
}

function buildParams() {
  const orderNo = query.orderNo.trim()
  let userId = query.userId
  if (userId === null || (typeof userId === 'number' && Number.isNaN(userId))) {
    userId = undefined
  }
  return {
    orderNo: orderNo || undefined,
    userId,
    orderStatus: orderStatusStr.value === '' ? undefined : Number(orderStatusStr.value),
    payStatus: payStatusStr.value === '' ? undefined : Number(payStatusStr.value),
    createTimeStart: query.createTimeStart,
    createTimeEnd: query.createTimeEnd,
    pageNum: query.pageNum,
    pageSize: query.pageSize,
  }
}

async function fetchOrders() {
  loading.value = true
  try {
    const res = await listOrders(buildParams())
    orders.value = res.data?.list || []
    total.value = Number(res.data?.total ?? 0)
  } catch {
    orders.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function search() {
  query.pageNum = 1
  fetchOrders()
}

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) {
    return
  }
  query.pageNum = p
  fetchOrders()
}

function formatMoney(v: number | string | undefined | null): string {
  const n = Number(v)
  if (Number.isNaN(n)) {
    return '0.00'
  }
  return n.toFixed(2)
}

function formatDateTime(s?: string | null): string {
  if (!s) {
    return '—'
  }
  try {
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) {
      return s
    }
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return s
  }
}

function sourceTypeText(t?: number): string {
  if (t === 1) {
    return '购物车下单'
  }
  if (t === 2) {
    return '立即购买'
  }
  return '—'
}

function orderStatusText(s?: number): string {
  const map: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '已取消',
    3: '已关闭',
    4: '已完成',
  }
  return s === undefined || s === null ? '—' : map[s] ?? '未知'
}

function payStatusText(s?: number): string {
  const map: Record<number, string> = {
    0: '未支付',
    1: '支付中',
    2: '支付成功',
    3: '支付失败',
    4: '已关闭',
  }
  return s === undefined || s === null ? '—' : map[s] ?? '未知'
}

function orderStatusClass(s?: number): string {
  switch (s) {
    case 0:
      return 'bg-gray-100 text-gray-600'
    case 1:
      return 'bg-blue-50 text-blue-700'
    case 2:
      return 'bg-orange-50 text-orange-700'
    case 3:
      return 'bg-slate-100 text-slate-600'
    case 4:
      return 'bg-emerald-50 text-emerald-700'
    default:
      return 'bg-gray-100 text-gray-500'
  }
}

function payStatusClass(s?: number): string {
  switch (s) {
    case 0:
      return 'bg-gray-100 text-gray-500'
    case 1:
      return 'bg-indigo-50 text-indigo-600'
    case 2:
      return 'bg-green-50 text-green-700'
    case 3:
      return 'bg-red-50 text-red-600'
    case 4:
      return 'bg-slate-100 text-slate-500'
    default:
      return 'bg-gray-100 text-gray-500'
  }
}

function fullAddress(d: OmsOrderDetailVO): string {
  const parts = [d.receiverProvince, d.receiverCity, d.receiverDistrict, d.receiverDetailAddress].filter(
    (x) => x && String(x).trim()
  )
  return parts.length ? parts.join(' ') : '—'
}

function itemImageUrl(raw?: string): string {
  if (!raw?.trim()) {
    return 'https://picsum.photos/seed/order-placeholder/80/80'
  }
  let u = raw.trim()
  if (u.startsWith('[')) {
    try {
      const arr = JSON.parse(u)
      u = Array.isArray(arr) && arr[0] ? String(arr[0]) : u
    } catch {
      u = u.split(',')[0]?.trim() || u
    }
  } else if (u.includes(',')) {
    u = u.split(',')[0].trim()
  }
  if (u.startsWith('http')) {
    return u
  }
  if (u.startsWith('/api/file/')) {
    u = '/file/' + u.slice('/api/file/'.length)
  }
  return u
}

async function openDetail(orderNo: string) {
  detailVisible.value = true
  detailLoading.value = true
  detailRow.value = null
  try {
    const res = await getOrderDetail(orderNo)
    detailRow.value = res.data
  } catch {
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

async function onCloseOrder(row: OmsOrderListItemVO) {
  try {
    await ElMessageBox.confirm(
      `确定关闭订单「${row.orderNo}」？关闭后将释放锁定库存，且仅限待支付订单。`,
      '关闭订单',
      { type: 'warning', confirmButtonText: '确定关闭', cancelButtonText: '取消' }
    )
  } catch {
    return
  }
  try {
    await closeOrder(row.orderNo)
    ElMessage.success('订单已关闭')
    await fetchOrders()
    if (detailVisible.value && detailRow.value?.orderNo === row.orderNo) {
      detailVisible.value = false
    }
  } catch {
    //
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
:deep(.order-detail-dialog .el-dialog__body) {
  padding-top: 8px;
}
</style>
