<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索角色名称..."
          class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 transition-all w-80 shadow-sm"
        />
      </div>
      <button
        v-if="userStore.hasPermission('ums:role:add')"
        class="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
        @click="openAddDialog"
      >
        <Plus :size="20" />
        <span>新增角色</span>
      </button>
    </div>

    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-50">
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">角色名称</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">描述</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">权限</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">状态</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="role in filteredRoles" :key="role.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-8 py-5">
                <p class="text-sm font-bold text-gray-900">{{ role.name }}</p>
                <p class="text-xs text-gray-400 mt-0.5">ID: {{ role.id }}</p>
              </td>
              <td class="px-8 py-5 text-sm text-gray-700 max-w-xs truncate">{{ role.description || '-' }}</td>
              <td class="px-8 py-5">
                <div class="flex flex-wrap gap-1 max-w-md">
                  <span
                    v-for="p in role.permissions"
                    :key="p.id"
                    class="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                    :title="p.value || p.name"
                  >
                    {{ p.name }}
                  </span>
                  <span v-if="!role.permissions?.length" class="text-gray-400 text-sm">-</span>
                </div>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-2">
                  <div :class="`w-2 h-2 rounded-full ${role.status === 1 ? 'bg-green-500' : 'bg-gray-300'}`" />
                  <span class="text-sm font-medium text-gray-700">{{ role.status === 1 ? '启用' : '禁用' }}</span>
                </div>
              </td>
              <td class="px-8 py-5 text-right">
                <button
                  v-if="userStore.hasPermission('ums:role:edit')"
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  @click="openEditDialog(role)"
                >
                  <Edit2 :size="18" />
                </button>
                <button
                  v-if="userStore.hasPermission('ums:role:delete') && role.name !== 'SUPER_ADMIN'"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-1"
                  @click="handleDelete(role)"
                >
                  <Trash2 :size="18" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="580px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="如 OPERATOR" :disabled="isEdit" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="角色描述" :rows="2" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限" prop="permissionIds">
          <div class="permission-tree-wrap">
            <el-tree
              ref="permissionTreeRef"
              :data="permissionTree"
              :props="{ label: 'name', children: 'children' }"
              node-key="id"
              show-checkbox
              :check-strictly="true"
              default-expand-all
              :indent="28"
            />
          </div>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { Search, Plus, Edit2, Trash2 } from 'lucide-vue-next'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import type { ElTree } from 'element-plus'
import {
  listRolesWithPermissions,
  listPermissionTree,
  addRole,
  updateRole,
  deleteRole,
  type UmsRoleWithPermissions,
  type AddRoleParam,
  type UpdateRoleParam
} from '@/api/role'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const keyword = ref('')
const roles = ref<UmsRoleWithPermissions[]>([])
const permissionTree = ref<{ id: number; name: string; value?: string; type: number; leaf?: boolean; children?: unknown[] }[]>([])
const permissionTreeRef = ref<InstanceType<typeof ElTree>>()
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const form = ref<AddRoleParam>({
  name: '',
  description: '',
  status: 1,
  permissionIds: []
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

const filteredRoles = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return roles.value
  return roles.value.filter((r) => r.name?.toLowerCase().includes(k) || r.description?.toLowerCase().includes(k))
})

async function fetchRoles() {
  try {
    const res = await listRolesWithPermissions()
    const data = res.data
    roles.value = Array.isArray(data) ? data : []
  } catch {
    roles.value = []
  }
}

async function fetchPermissionTree() {
  try {
    const res = await listPermissionTree()
    const data = res.data
    permissionTree.value = Array.isArray(data) ? data : []
  } catch {
    permissionTree.value = []
  }
}

function openAddDialog() {
  isEdit.value = false
  dialogVisible.value = true
  form.value = { name: '', description: '', status: 1, permissionIds: [] }
  nextTick(() => {
    permissionTreeRef.value?.setCheckedKeys([])
  })
}

function openEditDialog(role: UmsRoleWithPermissions) {
  isEdit.value = true
  editingId.value = role.id
  const ids = role.permissions?.map((p) => p.id) || []
  form.value = {
    name: role.name,
    description: role.description || '',
    status: role.status,
    permissionIds: ids
  }
  dialogVisible.value = true
  nextTick(() => {
    permissionTreeRef.value?.setCheckedKeys(ids)
  })
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
      const checkedIds = permissionTreeRef.value
        ? [...permissionTreeRef.value.getCheckedKeys(), ...permissionTreeRef.value.getHalfCheckedKeys()]
        : form.value.permissionIds || []
      const permissionIds = checkedIds.filter((id): id is number => typeof id === 'number')

      if (isEdit.value && editingId.value != null) {
        const param: UpdateRoleParam = {
          description: form.value.description,
          status: form.value.status,
          permissionIds
        }
        await updateRole(editingId.value, param)
        ElMessage.success('编辑成功')
      } else {
        const param: AddRoleParam = {
          name: form.value.name!,
          description: form.value.description,
          status: form.value.status,
          permissionIds
        }
        await addRole(param)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      await fetchRoles()
    } catch (e) {
      ElMessage.error((e as Error).message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

async function handleDelete(role: UmsRoleWithPermissions) {
  try {
    await ElMessageBox.confirm(`确认删除角色「${role.name}」？`, '提示', {
      type: 'warning'
    })
    await deleteRole(role.id)
    ElMessage.success('删除成功')
    await fetchRoles()
  } catch (e) {
    if ((e as string) !== 'cancel') {
      ElMessage.error((e as Error).message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchRoles()
  fetchPermissionTree()
})
</script>

<style scoped>
.permission-tree-wrap {
  border: 1px solid rgb(229 231 235);
  border-radius: 1rem;
  background-color: rgb(249 250 251 / 0.5);
  padding: 1.25rem;
  max-height: 18rem;
  overflow-y: auto;
}

/* el-tree 层级样式：与现有 UI 统一，字号与表格/表单一致 */
:deep(.el-tree) {
  --el-tree-node-hover-bg-color: rgb(255 247 237);
}

:deep(.el-tree-node__content) {
  height: 40px;
  padding-left: 0;
  font-size: 14px;
  color: rgb(55 65 81);
  border-radius: 12px;
  transition: background-color 0.2s;
}

:deep(.el-tree-node__content:hover) {
  background-color: rgb(243 244 246);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: rgb(255 247 237);
  color: rgb(234 88 12);
}

:deep(.el-tree-node__expand-icon) {
  font-size: 14px;
  color: rgb(156 163 175);
}

:deep(.el-tree .el-checkbox) {
  height: 18px;
}

:deep(.el-tree .el-checkbox__inner) {
  width: 16px;
  height: 16px;
}

:deep(.el-tree .el-checkbox__inner::after) {
  height: 8px;
}
</style>
