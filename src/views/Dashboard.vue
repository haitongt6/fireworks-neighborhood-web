<template>
  <div class="space-y-8">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.title" class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between mb-4">
          <div :class="`p-3 rounded-2xl ${stat.bgClass} ${stat.textClass}`">
            <component :is="stat.icon" :size="24" />
          </div>
          <span :class="`text-xs font-bold px-2 py-1 rounded-full ${stat.trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`">
            {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
          </span>
        </div>
        <p class="text-sm text-gray-500 font-medium">{{ stat.title }}</p>
        <h3 class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</h3>
      </div>
    </div>

    <!-- Charts & Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Sales Chart Placeholder -->
      <div class="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-lg font-bold text-gray-900">销售趋势</h3>
            <p class="text-sm text-gray-500">最近7天的销售额统计</p>
          </div>
          <select class="bg-gray-50 border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-emerald-500/20">
            <option>最近7天</option>
            <option>最近30天</option>
          </select>
        </div>
        
        <div class="h-64 flex items-end justify-between gap-4 px-4">
          <div v-for="(val, i) in [45, 60, 35, 80, 55, 90, 75]" :key="i" class="flex-1 flex flex-col items-center gap-3">
            <div 
              class="w-full bg-emerald-500 rounded-t-xl transition-all duration-500 hover:bg-emerald-600 cursor-pointer relative group"
              :style="{ height: `${val}%` }"
            >
              <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ¥{{ val * 120 }}
              </div>
            </div>
            <span class="text-xs text-gray-400 font-medium">03-{{ 10 + i }}</span>
          </div>
        </div>
      </div>

      <!-- Top Products -->
      <div class="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h3 class="text-lg font-bold text-gray-900 mb-6">热销商品排行</h3>
        <div class="space-y-6">
          <div v-for="(product, i) in topProducts" :key="i" class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
              <img :src="product.image" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-900 truncate">{{ product.name }}</p>
              <p class="text-xs text-gray-500">{{ product.category }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-gray-900">{{ product.sales }}</p>
              <p class="text-xs text-gray-400">销量</p>
            </div>
          </div>
        </div>
        <button class="w-full mt-8 py-3 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-colors">
          查看全部商品
        </button>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="p-8 border-b border-gray-50 flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900">最近订单</h3>
        <button class="text-sm font-bold text-emerald-600 hover:underline">查看所有订单</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50">
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">订单编号</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">客户</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">商品</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">金额</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">状态</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-8 py-5 text-sm font-bold text-gray-900">#{{ order.id }}</td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                    {{ order.customer.charAt(0) }}
                  </div>
                  <span class="text-sm font-medium text-gray-700">{{ order.customer }}</span>
                </div>
              </td>
              <td class="px-8 py-5 text-sm text-gray-600">{{ order.product }}</td>
              <td class="px-8 py-5 text-sm font-bold text-gray-900">¥{{ order.amount }}</td>
              <td class="px-8 py-5">
                <span :class="`px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(order.status)}`">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-8 py-5 text-right">
                <button class="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                  <MoreHorizontal :size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Users, 
  ShoppingBag, 
  CreditCard, 
  TrendingUp,
  MoreHorizontal
} from 'lucide-vue-next'

const stats = [
  { title: '总销售额', value: '¥128,430', icon: CreditCard, trend: 12.5, bgClass: 'bg-emerald-100', textClass: 'text-emerald-600' },
  { title: '今日订单', value: '1,240', icon: ShoppingBag, trend: 8.2, bgClass: 'bg-blue-100', textClass: 'text-blue-600' },
  { title: '新增用户', value: '452', icon: Users, trend: -2.4, bgClass: 'bg-purple-100', textClass: 'text-purple-600' },
  { title: '转化率', value: '3.2%', icon: TrendingUp, trend: 4.1, bgClass: 'bg-green-100', textClass: 'text-green-600' },
]

const topProducts = [
  { name: '新鲜红富士苹果 5kg', category: '水果', sales: 1240, image: 'https://picsum.photos/seed/apple/100/100' },
  { name: '特仑苏纯牛奶 250ml*12', category: '乳品', sales: 980, image: 'https://picsum.photos/seed/milk/100/100' },
  { name: '精选五花肉 500g', category: '肉禽', sales: 850, image: 'https://picsum.photos/seed/meat/100/100' },
  { name: '阳光玫瑰葡萄 1kg', category: '水果', sales: 720, image: 'https://picsum.photos/seed/grape/100/100' },
]

const recentOrders = [
  { id: 'ORD-8821', customer: '张伟', product: '红富士苹果等3件', amount: 89.5, status: '已完成' },
  { id: 'ORD-8822', customer: '李娜', product: '特仑苏牛奶等1件', amount: 55.0, status: '待发货' },
  { id: 'ORD-8823', customer: '王芳', product: '精选五花肉等2件', amount: 124.8, status: '配送中' },
  { id: 'ORD-8824', customer: '刘洋', product: '阳光玫瑰葡萄等1件', amount: 45.0, status: '待支付' },
  { id: 'ORD-8825', customer: '陈静', product: '新鲜蔬菜包等5件', amount: 67.2, status: '已完成' },
]

const getStatusClass = (status: string) => {
  switch (status) {
    case '已完成': return 'bg-green-50 text-green-600'
    case '待发货': return 'bg-blue-50 text-blue-600'
    case '配送中': return 'bg-emerald-50 text-emerald-600'
    case '待支付': return 'bg-gray-100 text-gray-500'
    default: return 'bg-gray-100 text-gray-500'
  }
}
</script>
