<template>
  <div class="space-y-8 min-h-[320px]">
    <!-- 时间筛选 -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <el-button-group>
        <el-button
          :type="activeQuick === 'today' ? 'primary' : 'default'"
          @click="onQuickRange('today')"
        >
          今日
        </el-button>
        <el-button
          :type="activeQuick === 'week' ? 'primary' : 'default'"
          @click="onQuickRange('week')"
        >
          本周
        </el-button>
        <el-button
          :type="activeQuick === 'month' ? 'primary' : 'default'"
          @click="onQuickRange('month')"
        >
          本月
        </el-button>
        <el-button
          :type="activeQuick === '90days' ? 'primary' : 'default'"
          @click="onQuickRange('90days')"
        >
          最近90天
        </el-button>
      </el-button-group>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="!w-[280px] md:!w-[320px]"
        @change="onDateRangeChange"
      />
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <template v-if="loading">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
        >
          <el-skeleton :rows="3" animated />
        </div>
      </template>
      <template v-else>
        <!-- 销售总额 -->
        <div
          class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
              <CreditCard :size="24" />
            </div>
          </div>
          <p class="text-sm text-gray-500 font-medium">销售总额</p>
          <h3 class="text-2xl font-bold text-gray-900 mt-1">
            {{ formatCurrency(statisticsData?.totalSalesAmount ?? 0) }}
          </h3>
        </div>

        <!-- 订单概览 -->
        <div
          class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 rounded-2xl bg-blue-100 text-blue-600">
              <ShoppingBag :size="24" />
            </div>
          </div>
          <p class="text-sm text-gray-500 font-medium">订单概览</p>
          <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ orderTotalCount }}</h3>
          <div class="flex flex-wrap gap-2 mt-3">
            <el-tag size="small">待支付 {{ oc.waitPay }}</el-tag>
            <el-tag size="small" type="primary">已支付 {{ oc.paid }}</el-tag>
            <el-tag size="small" type="danger">已取消 {{ oc.canceled }}</el-tag>
            <el-tag size="small" type="warning">已关闭 {{ oc.closed }}</el-tag>
            <el-tag size="small" type="success">已完成 {{ oc.finished }}</el-tag>
          </div>
        </div>

        <!-- 新增用户 -->
        <div
          class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 rounded-2xl bg-purple-100 text-purple-600">
              <Users :size="24" />
            </div>
          </div>
          <p class="text-sm text-gray-500 font-medium">新增用户数</p>
          <h3 class="text-2xl font-bold text-gray-900 mt-1">
            {{ statisticsData?.newMemberCount ?? 0 }}
          </h3>
        </div>
      </template>
    </div>

    <!-- 图表 & 热销 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-bold text-gray-900">销售趋势</h3>
            <p class="text-sm text-gray-500">所选区间内每日销售额（元）</p>
          </div>
        </div>
        <div class="relative h-[300px] w-full">
          <div ref="chartRef" class="h-full w-full" />
          <div
            v-show="loading"
            class="absolute inset-0 z-[1] flex items-stretch justify-center bg-white/90 p-4 rounded-xl"
          >
            <el-skeleton :rows="6" animated class="w-full" />
          </div>
          <div
            v-show="!loading && !hasTrendData"
            class="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none bg-white/80 z-[1]"
          >
            暂无数据
          </div>
        </div>
      </div>

      <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 class="text-lg font-bold text-gray-900 mb-6">热销商品 Top5</h3>
        <div v-if="!topProductsList.length" class="text-center text-gray-400 text-sm py-12">
          暂无数据
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="(p, idx) in topProductsList"
            :key="`${p.productId}-${idx}`"
            class="flex items-center gap-3"
          >
            <div
              class="w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center"
            >
              <img
                v-if="!imageErrorMap[idx]"
                :src="p.productImage"
                alt=""
                class="w-full h-full object-cover"
                referrerpolicy="no-referrer"
                @error="onImgError(idx)"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ p.productTitle }}</p>
            </div>
            <div class="text-sm font-bold text-gray-900 flex-shrink-0">{{ p.totalSales }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近订单 -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between gap-4">
        <h3 class="text-lg font-bold text-gray-900">最近订单</h3>
        <el-button type="primary" link @click="goOrders">查看所有订单</el-button>
      </div>
      <div class="max-h-[400px] overflow-y-auto overflow-x-auto">
        <div v-if="!recentList.length" class="px-8 py-16 text-center text-gray-400 text-sm">
          暂无订单
        </div>
        <el-table v-else :data="recentList" stripe class="!rounded-none">
          <el-table-column prop="orderNo" label="订单编号" min-width="160" />
          <el-table-column label="订单金额" min-width="110">
            <template #default="{ row }">
              {{ formatMoney(row.totalAmount) }}
            </template>
          </el-table-column>
          <el-table-column label="实付金额" min-width="110">
            <template #default="{ row }">
              {{ formatMoney(row.payAmount) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.orderStatus === 0" size="small">
                {{ orderStatusLabel(row.orderStatus) }}
              </el-tag>
              <el-tag v-else :type="orderStatusTagType(row.orderStatus)" size="small">
                {{ orderStatusLabel(row.orderStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" min-width="170" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CreditCard, ShoppingBag, Users } from 'lucide-vue-next'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  getHomeStatistics,
  type AdminHomeStatisticsVO,
} from '@/api/home'

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const router = useRouter()

const loading = ref(false)
const statisticsData = ref<AdminHomeStatisticsVO | null>(null)

type QuickKey = 'today' | 'week' | 'month' | '90days'
const activeQuick = ref<QuickKey | null>('month')
const dateRange = ref<[string, string] | null>(null)

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const imageErrorMap = ref<Record<number, boolean>>({})

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function getToday(): [string, string] {
  const t = new Date()
  const s = formatDateStr(t)
  return [s, s]
}

function getThisWeek(): [string, string] {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? 6 : day - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - diffToMonday)
  return [formatDateStr(monday), formatDateStr(now)]
}

function getThisMonth(): [string, string] {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return [formatDateStr(start), formatDateStr(now)]
}

function getLast90Days(): [string, string] {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - 89)
  return [formatDateStr(start), formatDateStr(now)]
}

function applyRange(range: [string, string]) {
  dateRange.value = [range[0], range[1]]
}

const oc = computed(() => {
  const c = statisticsData.value?.orderStatusCount
  if (!c) {
    return { waitPay: 0, paid: 0, canceled: 0, closed: 0, finished: 0 }
  }
  return c
})

const orderTotalCount = computed(() => {
  const c = oc.value
  return c.waitPay + c.paid + c.canceled + c.closed + c.finished
})

const hasTrendData = computed(() => {
  const t = statisticsData.value?.salesTrend
  return Array.isArray(t) && t.length > 0
})

const topProductsList = computed(() => statisticsData.value?.topProducts ?? [])
const recentList = computed(() => statisticsData.value?.recentOrders ?? [])

function formatCurrency(n: number): string {
  const v = Number(n)
  const fixed = Number.isFinite(v) ? v.toFixed(2) : '0.00'
  const parts = fixed.split('.')
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `¥${intPart}.${parts[1] ?? '00'}`
}

function formatMoney(n: number): string {
  const v = Number(n)
  if (!Number.isFinite(v)) {
    return '¥0.00'
  }
  return `¥${v.toFixed(2)}`
}

function orderStatusLabel(status: number): string {
  switch (status) {
    case 0:
      return '待支付'
    case 1:
      return '已支付'
    case 2:
      return '已取消'
    case 3:
      return '已关闭'
    case 4:
      return '已完成'
    default:
      return '未知'
  }
}

function orderStatusTagType(status: number): 'success' | 'warning' | 'danger' | 'primary' {
  switch (status) {
    case 1:
      return 'primary'
    case 2:
      return 'danger'
    case 3:
      return 'warning'
    case 4:
      return 'success'
    default:
      return 'primary'
  }
}

function onImgError(idx: number) {
  imageErrorMap.value = { ...imageErrorMap.value, [idx]: true }
}

function onQuickRange(key: QuickKey) {
  activeQuick.value = key
  let range: [string, string]
  if (key === 'today') {
    range = getToday()
  } else if (key === 'week') {
    range = getThisWeek()
  } else if (key === 'month') {
    range = getThisMonth()
  } else {
    range = getLast90Days()
  }
  applyRange(range)
  fetchData(range[0], range[1])
}

function onDateRangeChange(val: [string, string] | null) {
  activeQuick.value = null
  if (!val || !val[0] || !val[1]) {
    return
  }
  fetchData(val[0], val[1])
}

async function fetchData(startTime: string, endTime: string) {
  loading.value = true
  try {
    const data = await getHomeStatistics(startTime, endTime)
    statisticsData.value = data
    imageErrorMap.value = {}
  } catch {
    ElMessage.error('数据加载失败，请重试')
  } finally {
    loading.value = false
    await nextTick()
    renderOrDisposeChart()
  }
}

function renderOrDisposeChart() {
  const trend = statisticsData.value?.salesTrend
  if (!chartRef.value) {
    return
  }
  if (!trend || trend.length === 0) {
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
    return
  }
  const dates = trend.map((x) => x.date)
  const amounts = trend.map((x) => Number(x.amount))
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  chartInstance.setOption({
    grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
    tooltip: { trigger: 'axis' },
    legend: { data: ['销售额'], top: 0 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
    },
    yAxis: {
      type: 'value',
      name: '元',
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: amounts,
        itemStyle: { color: '#10b981' },
        lineStyle: { color: '#10b981' },
        areaStyle: { color: 'rgba(16, 185, 129, 0.12)' },
      },
    ],
  })
  chartInstance.resize()
}

watch(
  () => statisticsData.value?.salesTrend,
  () => {
    nextTick(() => {
      renderOrDisposeChart()
    })
  },
  { deep: true }
)

onMounted(() => {
  const r = getThisMonth()
  applyRange(r)
  fetchData(r[0], r[1])
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

function goOrders() {
  router.push('/orders')
}
</script>
