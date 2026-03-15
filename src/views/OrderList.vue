<template>
  <div class="space-y-6">
    <!-- Filters -->
    <div class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-bold text-gray-400 uppercase mb-2">订单搜索</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="16" />
          <input type="text" placeholder="订单号/手机号/姓名" class="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20" />
        </div>
      </div>
      <div class="w-48">
        <label class="block text-xs font-bold text-gray-400 uppercase mb-2">订单状态</label>
        <select class="w-full bg-gray-50 border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-emerald-500/20">
          <option>全部状态</option>
          <option>待支付</option>
          <option>待发货</option>
          <option>配送中</option>
          <option>待提货</option>
          <option>已完成</option>
        </select>
      </div>
      <div class="w-48">
        <label class="block text-xs font-bold text-gray-400 uppercase mb-2">下单时间</label>
        <select class="w-full bg-gray-50 border-none rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-emerald-500/20">
          <option>今天</option>
          <option>最近3天</option>
          <option>最近7天</option>
          <option>自定义范围</option>
        </select>
      </div>
      <div class="flex items-end h-full pt-6">
        <button class="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
          查询
        </button>
      </div>
    </div>

    <!-- Order Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-50">
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">订单编号</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">客户信息</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">商品详情</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">实付金额</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">自提点</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">状态</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-8 py-5">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-900">#{{ order.id }}</span>
                  <span class="text-xs text-gray-400">{{ order.time }}</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">{{ order.customer }}</span>
                  <span class="text-xs text-gray-500">{{ order.phone }}</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-2">
                  <div class="flex -space-x-2">
                    <div v-for="(img, i) in order.images" :key="i" class="w-8 h-8 rounded-lg border-2 border-white bg-gray-100 overflow-hidden">
                      <img :src="img" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                  <span class="text-xs text-gray-500 font-medium">等 {{ order.count }} 件商品</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-900">¥{{ order.amount }}</span>
                  <span class="text-xs text-gray-400">{{ order.payMethod }}</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-2">
                  <MapPin :size="14" class="text-gray-400" />
                  <span class="text-xs text-gray-600 truncate max-w-[120px]">{{ order.point }}</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <span :class="`px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(order.status)}`">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-8 py-5 text-right">
                <button class="text-sm font-bold text-emerald-600 hover:text-emerald-700">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, MapPin } from 'lucide-vue-next'

const orders = [
  { 
    id: 'ORD-20240311-001', 
    time: '2024-03-11 10:24', 
    customer: '张伟', 
    phone: '138****8888', 
    count: 3, 
    amount: 89.5, 
    payMethod: '微信支付', 
    point: '幸福小区3号楼菜鸟驿站', 
    status: '已完成',
    images: ['https://picsum.photos/seed/1/50/50', 'https://picsum.photos/seed/2/50/50']
  },
  { 
    id: 'ORD-20240311-002', 
    time: '2024-03-11 11:15', 
    customer: '李娜', 
    phone: '139****7777', 
    count: 1, 
    amount: 55.0, 
    payMethod: '支付宝', 
    point: '阳光嘉园南门便利店', 
    status: '待发货',
    images: ['https://picsum.photos/seed/3/50/50']
  },
  { 
    id: 'ORD-20240311-003', 
    time: '2024-03-11 11:45', 
    customer: '王芳', 
    phone: '135****6666', 
    count: 2, 
    amount: 124.8, 
    payMethod: '微信支付', 
    point: '幸福小区3号楼菜鸟驿站', 
    status: '配送中',
    images: ['https://picsum.photos/seed/4/50/50', 'https://picsum.photos/seed/5/50/50']
  },
  { 
    id: 'ORD-20240311-004', 
    time: '2024-03-11 12:05', 
    customer: '刘洋', 
    phone: '137****5555', 
    count: 1, 
    amount: 45.0, 
    payMethod: '微信支付', 
    point: '金地格林东门超市', 
    status: '待支付',
    images: ['https://picsum.photos/seed/6/50/50']
  },
  { 
    id: 'ORD-20240311-005', 
    time: '2024-03-11 12:30', 
    customer: '陈静', 
    phone: '136****4444', 
    count: 5, 
    amount: 67.2, 
    payMethod: '微信支付', 
    point: '幸福小区3号楼菜鸟驿站', 
    status: '待提货',
    images: ['https://picsum.photos/seed/7/50/50', 'https://picsum.photos/seed/8/50/50']
  },
]

const getStatusClass = (status: string) => {
  switch (status) {
    case '已完成': return 'bg-green-50 text-green-600'
    case '待发货': return 'bg-blue-50 text-blue-600'
    case '配送中': return 'bg-emerald-50 text-emerald-600'
    case '待提货': return 'bg-purple-50 text-purple-600'
    case '待支付': return 'bg-gray-100 text-gray-500'
    default: return 'bg-gray-100 text-gray-500'
  }
}
</script>
