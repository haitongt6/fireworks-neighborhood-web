<template>
  <div v-if="item.children?.length" class="space-y-1">
    <button
      type="button"
      class="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition-all duration-200 text-left group"
      :class="isExpanded ? 'text-gray-900 bg-gray-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
      :style="{ paddingLeft: `${8 + depth * 12}px` }"
      @click="$emit('toggle', item.id!)"
    >
      <ChevronRight
        :size="depth === 0 ? 16 : 14"
        class="flex-shrink-0 transition-transform duration-200"
        :class="isExpanded ? 'rotate-90' : ''"
      />
      <component :is="item.icon" :size="depth === 0 ? 18 : 16" class="text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
      <span class="truncate" :class="depth === 0 ? 'text-xs font-bold uppercase tracking-wider' : 'text-sm'">{{ item.name }}</span>
    </button>
    <div
      v-show="isExpanded"
      class="space-y-1 overflow-hidden"
    >
      <MenuGroup
        v-for="child in item.children"
        :key="child.id ?? child.path"
        :item="child"
        :depth="depth + 1"
        :expanded-ids="expandedIds"
        :current-path="currentPath"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
  <router-link
    v-else
    :to="item.path"
    class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group"
    :class="[currentPath === item.path ? 'bg-orange-50 text-orange-600 font-semibold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900']"
    :style="{ paddingLeft: `${8 + depth * 12 + 16}px` }"
  >
    <component :is="item.icon" :size="depth === 0 ? 20 : 18" :class="[currentPath === item.path ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600']" />
    <span :class="depth === 0 ? '' : 'text-sm'">{{ item.name }}</span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  item: { id: number; name: string; path: string; icon: unknown; children?: unknown[] }
  depth: number
  expandedIds: Set<number>
  currentPath: string
}>()

defineEmits<{ (e: 'toggle', id: number): void }>()

const isExpanded = computed(() =>
  props.item.id != null && props.expandedIds.has(props.item.id as number)
)
</script>
