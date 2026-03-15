<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索类目名称..."
          class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 transition-all w-80 shadow-sm"
        />
      </div>
      <button
        v-if="userStore.hasPermission('pms:category:add')"
        class="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
        @click="openAddDialog"
      >
        <Plus :size="20" />
        <span>新增类目</span>
      </button>
    </div>

    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-50">
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">类目名称</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">排序</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">状态</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="item in filteredList" :key="item.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-8 py-5 text-sm text-gray-500">{{ item.id }}</td>
              <td class="px-8 py-5">
                <p class="text-sm font-bold text-gray-900">{{ item.name }}</p>
              </td>
              <td class="px-8 py-5">
                <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {{ item.sort }}
                </span>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-2">
                  <div :class="`w-2 h-2 rounded-full ${item.status === 1 ? 'bg-green-500' : 'bg-gray-300'}`" />
                  <span class="text-sm font-medium text-gray-700">{{ item.status === 1 ? '启用' : '禁用' }}</span>
                </div>
              </td>
              <td class="px-8 py-5 text-right">
                <button
                  v-if="userStore.hasPermission('pms:category:edit')"
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  @click="openEditDialog(item)"
                >
                  <Edit2 :size="18" />
                </button>
                <button
                  v-if="userStore.hasPermission('pms:category:delete')"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-1"
                  @click="handleDelete(item)"
                >
                  <Trash2 :size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!filteredList.length" class="py-16 text-center text-gray-400 text-sm">
        暂无类目数据，点击「新增类目」开始添加
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑类目' : '新增类目'"
      width="420px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="类目名称" prop="name">
          <el-input v-model="form.name" placeholder="如：水果蔬菜" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" controls-position="right" class="w-full" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Edit2, Trash2 } from 'lucide-vue-next'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  listCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  type PmsProductCategory,
  type AddCategoryParam,
  type UpdateCategoryParam
} from '@/api/category'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const keyword = ref('')
const list = ref<PmsProductCategory[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const form = ref<AddCategoryParam & { sort?: number; status?: number }>({
  name: '',
  sort: 0,
  status: 1
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入类目名称', trigger: 'blur' }]
}

const filteredList = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return list.value
  return list.value.filter((r) => r.name?.toLowerCase().includes(k))
})

async function fetchList() {
  try {
    const res = await listCategories()
    const data = res.data
    list.value = Array.isArray(data) ? data : []
  } catch {
    list.value = []
  }
}

function openAddDialog() {
  isEdit.value = false
  dialogVisible.value = true
  form.value = { name: '', sort: 0, status: 1 }
}

function openEditDialog(item: PmsProductCategory) {
  isEdit.value = true
  editingId.value = item.id
  form.value = {
    name: item.name,
    sort: item.sort ?? 0,
    status: item.status ?? 1
  }
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  editingId.value = null
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value && editingId.value != null) {
        const param: UpdateCategoryParam = {
          name: form.value.name,
          sort: form.value.sort,
          status: form.value.status
        }
        await updateCategory(editingId.value, param)
        ElMessage.success('编辑成功')
      } else {
        const param: AddCategoryParam = {
          name: form.value.name!,
          sort: form.value.sort,
          status: form.value.status
        }
        await addCategory(param)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      await fetchList()
    } catch {
      // 错误已由 request 拦截器统一提示
    } finally {
      submitLoading.value = false
    }
  })
}

async function handleDelete(item: PmsProductCategory) {
  try {
    await ElMessageBox.confirm(`确认删除类目「${item.name}」？`, '提示', {
      type: 'warning'
    })
    await deleteCategory(item.id)
    ElMessage.success('删除成功')
    await fetchList()
  } catch (e) {
    if ((e as string) !== 'cancel') {
      ElMessage.error((e as Error).message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchList()
})
</script>
