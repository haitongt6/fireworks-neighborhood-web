<template>
  <div class="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
    <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
      <Construction :size="40" />
    </div>
    <h3 class="text-xl font-bold text-gray-600">功能开发中</h3>
    <p class="text-sm">该模块正在加紧建设中，敬请期待...</p>
    <button @click="$router.push('/')" class="px-6 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all">
      返回仪表盘
    </button>
  </div>
</template>

<script setup lang="ts">
import { Construction } from 'lucide-vue-next'
</script>
