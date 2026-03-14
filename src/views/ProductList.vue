<template>
  <div class="space-y-6">
    <!-- Header Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
          <input 
            type="text" 
            placeholder="搜索商品名称、条码..." 
            class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 transition-all w-80 shadow-sm"
          />
        </div>
        <select class="bg-white border border-gray-200 rounded-2xl text-sm px-4 py-2.5 focus:ring-2 focus:ring-orange-500/20 shadow-sm">
          <option>所有分类</option>
          <option>水果蔬菜</option>
          <option>肉禽蛋奶</option>
          <option>海鲜水产</option>
          <option>粮油调味</option>
        </select>
      </div>
      <button class="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
        <Plus :size="20" />
        <span>新增商品</span>
      </button>
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
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-50">
                    <img :src="product.image" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">{{ product.name }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">ID: {{ product.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5">
                <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {{ product.category }}
                </span>
              </td>
              <td class="px-8 py-5">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-900">¥{{ product.price }}</span>
                  <span class="text-xs text-gray-400 line-through">¥{{ product.originalPrice }}</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="flex flex-col gap-1">
                  <div class="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full" 
                      :class="product.stock < 20 ? 'bg-red-500' : 'bg-green-500'"
                      :style="{ width: `${Math.min(product.stock, 100)}%` }"
                    ></div>
                  </div>
                  <span class="text-xs font-medium" :class="product.stock < 20 ? 'text-red-500' : 'text-gray-500'">
                    {{ product.stock }} 件
                  </span>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-2">
                  <div :class="`w-2 h-2 rounded-full ${product.status === '上架中' ? 'bg-green-500' : 'bg-gray-300'}`"></div>
                  <span class="text-sm font-medium text-gray-700">{{ product.status }}</span>
                </div>
              </td>
              <td class="px-8 py-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Edit2 :size="18" />
                  </button>
                  <button class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 :size="18" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
        <p class="text-sm text-gray-500">显示 1 到 10 条，共 124 条商品</p>
        <div class="flex items-center gap-2">
          <button class="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled>
            <ChevronLeft :size="18" />
          </button>
          <button class="w-10 h-10 rounded-xl bg-orange-500 text-white font-bold shadow-md shadow-orange-200">1</button>
          <button class="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">2</button>
          <button class="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">3</button>
          <button class="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:bg-gray-50">
            <ChevronRight :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-vue-next'

const products = [
  { id: 'P1001', name: '新鲜红富士苹果 5kg 礼盒装', category: '水果蔬菜', price: 59.9, originalPrice: 79.0, stock: 156, status: '上架中', image: 'https://picsum.photos/seed/apple/200/200' },
  { id: 'P1002', name: '特仑苏纯牛奶 250ml*12 提', category: '肉禽蛋奶', price: 49.9, originalPrice: 65.0, stock: 85, status: '上架中', image: 'https://picsum.photos/seed/milk/200/200' },
  { id: 'P1003', name: '精选黑猪五花肉 500g', category: '肉禽蛋奶', price: 32.5, originalPrice: 45.0, stock: 12, status: '上架中', image: 'https://picsum.photos/seed/meat/200/200' },
  { id: 'P1004', name: '阳光玫瑰葡萄 1kg 顺丰包邮', category: '水果蔬菜', price: 39.9, originalPrice: 59.0, stock: 45, status: '上架中', image: 'https://picsum.photos/seed/grape/200/200' },
  { id: 'P1005', name: '鲁花 5S 一级花生油 5L', category: '粮油调味', price: 159.0, originalPrice: 189.0, stock: 230, status: '上架中', image: 'https://picsum.photos/seed/oil/200/200' },
  { id: 'P1006', name: '泰国进口金枕头榴莲 2-3kg', category: '水果蔬菜', price: 129.0, originalPrice: 159.0, stock: 8, status: '上架中', image: 'https://picsum.photos/seed/durian/200/200' },
  { id: 'P1007', name: '三只松鼠 坚果大礼包 1.5kg', category: '休闲零食', price: 89.0, originalPrice: 129.0, stock: 0, status: '已下架', image: 'https://picsum.photos/seed/nuts/200/200' },
  { id: 'P1008', name: '可口可乐 330ml*24 听', category: '酒水饮料', price: 45.0, originalPrice: 55.0, stock: 500, status: '上架中', image: 'https://picsum.photos/seed/cola/200/200' },
]
</script>
