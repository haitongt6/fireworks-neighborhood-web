<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900">自提点管理</h2>
      <button class="bg-emerald-500 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2">
        <Plus :size="20" />
        <span>新增自提点</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="point in points" :key="point.id" class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <MapPin :size="24" />
          </div>
          <span :class="`px-3 py-1 rounded-full text-xs font-bold ${point.status === '营业中' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`">
            {{ point.status }}
          </span>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-1">{{ point.name }}</h3>
        <p class="text-sm text-gray-500 mb-4 flex items-center gap-1">
          <User :size="14" />
          团长：{{ point.leader }} | {{ point.phone }}
        </p>
        <div class="p-4 bg-gray-50 rounded-2xl mb-6">
          <p class="text-xs text-gray-400 uppercase font-bold mb-1">详细地址</p>
          <p class="text-sm text-gray-700 line-clamp-2">{{ point.address }}</p>
        </div>
        <div class="flex items-center justify-between pt-4 border-t border-gray-50">
          <div class="flex items-center gap-4">
            <div class="text-center">
              <p class="text-xs text-gray-400">今日订单</p>
              <p class="text-sm font-bold text-gray-900">{{ point.todayOrders }}</p>
            </div>
            <div class="w-px h-8 bg-gray-100"></div>
            <div class="text-center">
              <p class="text-xs text-gray-400">待提货</p>
              <p class="text-sm font-bold text-emerald-600">{{ point.pendingPickups }}</p>
            </div>
          </div>
          <button class="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapPin, User, Plus, ChevronRight } from 'lucide-vue-next'

const points = [
  { id: 1, name: '幸福小区3号楼菜鸟驿站', leader: '张大妈', phone: '138****1234', address: '上海市浦东新区幸福路123号幸福小区3号楼101室', status: '营业中', todayOrders: 45, pendingPickups: 12 },
  { id: 2, name: '阳光嘉园南门便利店', leader: '李老板', phone: '139****5678', address: '上海市浦东新区阳光路456号阳光嘉园南门商铺', status: '营业中', todayOrders: 28, pendingPickups: 5 },
  { id: 3, name: '金地格林东门超市', leader: '王小二', phone: '135****9012', address: '上海市浦东新区格林路789号金地格林东门102号', status: '营业中', todayOrders: 62, pendingPickups: 18 },
  { id: 4, name: '美邻里社区服务站', leader: '赵女士', phone: '137****3456', address: '上海市浦东新区美邻路101号美邻里社区服务中心', status: '休息中', todayOrders: 0, pendingPickups: 0 },
]
</script>
