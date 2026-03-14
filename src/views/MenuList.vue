<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索菜单或按钮名称..."
          class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 transition-all w-80 shadow-sm"
        />
      </div>
      <button
        v-if="userStore.hasPermission('ums:button:add')"
        class="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
        @click="openAddRootDialog"
      >
        <Plus :size="20" />
        <span>新增根目录/菜单</span>
      </button>
    </div>

    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-50">
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">名称</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">类型</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">路由/权限值</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="item in visibleList"
              :key="item.id"
              class="hover:bg-gray-50/50 transition-colors"
              :class="item.type === 2 ? 'bg-gray-50/30' : ''"
            >
              <td class="px-8 py-5">
                <div
                  class="flex items-center gap-2"
                  :style="{ paddingLeft: (item.level * 20) + (hasChildren(item.id) ? 0 : 20) + 'px' }"
                >
                  <button
                    v-if="hasChildren(item.id)"
                    class="p-0.5 text-gray-400 hover:text-orange-600 rounded transition-colors"
                    @click="toggleExpand(item.id)"
                  >
                    <ChevronRight v-if="!expandedIds.has(item.id)" :size="18" />
                    <ChevronDown v-else :size="18" />
                  </button>
                  <span v-else class="w-5 inline-block" />
                  <p class="text-sm font-medium text-gray-900">{{ item.name }}</p>
                  <span class="text-xs text-gray-400">ID: {{ item.id }}</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <span
                  class="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-gray-100 text-gray-600': item.type === 0,
                    'bg-blue-50 text-blue-600': item.type === 1,
                    'bg-orange-50 text-orange-600': item.type === 2
                  }"
                >
                  {{ typeLabel[item.type] }}
                </span>
              </td>
              <td class="px-8 py-5 text-sm text-gray-600 font-mono max-w-xs truncate" :title="item.value">
                {{ item.value || '-' }}
              </td>
              <td class="px-8 py-5 text-right">
                <button
                  v-if="item.type === 1 && userStore.hasPermission('ums:button:add')"
                  class="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                  title="添加按钮"
                  @click="openAddButton(item)"
                >
                  <Plus :size="18" />
                </button>
                <button
                  v-if="item.type === 2 && userStore.hasPermission('ums:button:edit')"
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all ml-1"
                  title="编辑"
                  @click="openEditButton(item)"
                >
                  <Edit2 :size="18" />
                </button>
                <button
                  v-if="(item.type === 0 || item.type === 1) && userStore.hasPermission('ums:button:delete')"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-1"
                  title="删除"
                  @click="handleDeleteDirectory(item)"
                >
                  <Trash2 :size="18" />
                </button>
                <button
                  v-if="item.type === 2 && userStore.hasPermission('ums:button:delete')"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-1"
                  title="删除"
                  @click="handleDeleteButton(item)"
                >
                  <Trash2 :size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加按钮弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加按钮"
      width="460px"
      :close-on-click-modal="false"
      @closed="resetAddForm"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item label="所属菜单">
          <el-input :model-value="addForm.menuName" disabled />
        </el-form-item>
        <el-form-item label="按钮名称" prop="name">
          <el-input v-model="addForm.name" placeholder="如：新增角色" maxlength="32" show-word-limit />
        </el-form-item>
        <el-form-item label="权限值" prop="value">
          <el-input v-model="addForm.value" placeholder="如：ums:role:add" maxlength="64" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="addLoading" @click="submitAddButton">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑按钮弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑按钮"
      width="460px"
      :close-on-click-modal="false"
      @closed="resetEditForm"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item label="按钮名称" prop="name">
          <el-input v-model="editForm.name" placeholder="如：新增角色" maxlength="32" show-word-limit />
        </el-form-item>
        <el-form-item label="权限值" prop="value">
          <el-input v-model="editForm.value" placeholder="如：ums:role:add" maxlength="64" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="submitEditButton">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增根目录/菜单弹窗 -->
    <el-dialog
      v-model="addRootDialogVisible"
      title="新增根目录/菜单"
      width="460px"
      :close-on-click-modal="false"
      @closed="resetAddRootForm"
    >
      <el-form ref="addRootFormRef" :model="addRootForm" :rules="addRootFormRules" label-width="100px">
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="addRootForm.type">
            <el-radio :label="0">目录</el-radio>
            <el-radio :label="1">菜单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="addRootForm.name" placeholder="如：系统设置" maxlength="32" show-word-limit />
        </el-form-item>
        <el-form-item v-if="addRootForm.type === 1" label="路由" prop="value">
          <el-input v-model="addRootForm.value" placeholder="如：/settings/users" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="addRootForm.icon" placeholder="如：Settings（可选）" maxlength="32" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addRootDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="addRootLoading" @click="submitAddRoot">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-vue-next'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  listMenuManage,
  addRootMenu,
  addButton,
  updateButton,
  deleteButton,
  deleteDirectoryOrMenu,
  type MenuManageItem
} from '@/api/menu'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const keyword = ref('')
const list = ref<MenuManageItem[]>([])
const expandedIds = ref<Set<number>>(new Set())
const addDialogVisible = ref(false)
const addRootDialogVisible = ref(false)
const editDialogVisible = ref(false)
const addLoading = ref(false)
const addRootLoading = ref(false)
const editLoading = ref(false)
const addFormRef = ref<FormInstance>()
const addRootFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()
const editingButtonId = ref<number | null>(null)

const typeLabel: Record<number, string> = {
  0: '目录',
  1: '菜单',
  2: '按钮'
}

const addForm = ref({
  menuId: 0,
  menuName: '',
  name: '',
  value: ''
})

const addRootForm = ref({
  type: 0,
  name: '',
  value: '',
  icon: ''
})

const editForm = ref({
  name: '',
  value: ''
})

const addRootFormRules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  value: [
    {
      validator: (_rule: unknown, val: string, cb: (e?: Error) => void) => {
        if (addRootForm.value.type === 1 && !val?.trim()) cb(new Error('请输入路由'))
        else cb()
      },
      trigger: 'blur'
    }
  ]
}

const addFormRules: FormRules = {
  name: [{ required: true, message: '请输入按钮名称', trigger: 'blur' }],
  value: [{ required: true, message: '请输入权限值', trigger: 'blur' }]
}

const editFormRules: FormRules = {
  name: [{ required: true, message: '请输入按钮名称', trigger: 'blur' }],
  value: [{ required: true, message: '请输入权限值', trigger: 'blur' }]
}

const filteredList = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return list.value
  return list.value.filter(
    (it) =>
      it.name?.toLowerCase().includes(k) ||
      it.value?.toLowerCase().includes(k)
  )
})

function hasChildren(id: number): boolean {
  return list.value.some((it) => (it.pid ?? 0) === id)
}

function getAncestorIds(item: MenuManageItem): number[] {
  const ids: number[] = []
  let pid = item.pid ?? 0
  while (pid) {
    const parent = list.value.find((p) => p.id === pid)
    if (!parent) break
    ids.push(parent.id)
    pid = parent.pid ?? 0
  }
  return ids
}

function isItemVisible(item: MenuManageItem): boolean {
  if (item.level === 0) return true
  const ancestorIds = getAncestorIds(item)
  return ancestorIds.every((id) => expandedIds.value.has(id))
}

const visibleList = computed(() => {
  return filteredList.value.filter(isItemVisible)
})

function toggleExpand(id: number) {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
}

async function fetchList() {
  try {
    const res = await listMenuManage()
    list.value = Array.isArray(res.data) ? res.data : []
    expandedIds.value = new Set()
  } catch {
    list.value = []
  }
}

function openAddRootDialog() {
  addRootForm.value = { type: 0, name: '', value: '', icon: '' }
  addRootDialogVisible.value = true
}

function resetAddRootForm() {
  addRootFormRef.value?.resetFields()
}

async function submitAddRoot() {
  if (!addRootFormRef.value) return
  await addRootFormRef.value.validate(async (valid) => {
    if (!valid) return
    if (addRootForm.value.type === 1 && !addRootForm.value.value?.trim()) {
      return
    }
    addRootLoading.value = true
    try {
      await addRootMenu({
        type: addRootForm.value.type,
        name: addRootForm.value.name,
        value: addRootForm.value.type === 1 ? addRootForm.value.value : undefined,
        icon: addRootForm.value.icon || undefined
      })
      ElMessage.success('添加成功')
      addRootDialogVisible.value = false
      await fetchList()
    } catch (e) {
      ElMessage.error((e as Error).message || '添加失败')
    } finally {
      addRootLoading.value = false
    }
  })
}

function openAddButton(menu: MenuManageItem) {
  addForm.value = {
    menuId: menu.id,
    menuName: menu.name,
    name: '',
    value: ''
  }
  addDialogVisible.value = true
}

function resetAddForm() {
  addFormRef.value?.resetFields()
}

async function submitAddButton() {
  if (!addFormRef.value) return
  await addFormRef.value.validate(async (valid) => {
    if (!valid) return
    addLoading.value = true
    try {
      await addButton({
        menuId: addForm.value.menuId,
        name: addForm.value.name,
        value: addForm.value.value
      })
      ElMessage.success('添加成功')
      addDialogVisible.value = false
      await fetchList()
    } catch (e) {
      ElMessage.error((e as Error).message || '添加失败')
    } finally {
      addLoading.value = false
    }
  })
}

function openEditButton(btn: MenuManageItem) {
  editingButtonId.value = btn.id
  editForm.value = {
    name: btn.name,
    value: btn.value || ''
  }
  editDialogVisible.value = true
}

function resetEditForm() {
  editFormRef.value?.resetFields()
  editingButtonId.value = null
}

async function submitEditButton() {
  if (!editFormRef.value || editingButtonId.value == null) return
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return
    editLoading.value = true
    try {
      await updateButton(editingButtonId.value!, {
        name: editForm.value.name,
        value: editForm.value.value
      })
      ElMessage.success('修改成功')
      editDialogVisible.value = false
      await fetchList()
    } catch (e) {
      ElMessage.error((e as Error).message || '修改失败')
    } finally {
      editLoading.value = false
    }
  })
}

async function handleDeleteDirectory(item: MenuManageItem) {
  const hasChildren = list.value.some((it) => (it.pid ?? 0) === item.id)
  const msg = hasChildren
    ? `确认删除「${item.name}」及其下所有子菜单、按钮？`
    : `确认删除「${item.name}」？`
  try {
    await ElMessageBox.confirm(msg, '提示', { type: 'warning' })
    await deleteDirectoryOrMenu(item.id)
    ElMessage.success('删除成功')
    await fetchList()
  } catch (e) {
    if ((e as string) !== 'cancel') {
      ElMessage.error((e as Error).message || '删除失败')
    }
  }
}

async function handleDeleteButton(btn: MenuManageItem) {
  try {
    await ElMessageBox.confirm(`确认删除按钮「${btn.name}」？`, '提示', {
      type: 'warning'
    })
    await deleteButton(btn.id)
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
