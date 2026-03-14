<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索用户名、昵称..."
          class="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-orange-500/20 transition-all w-80 shadow-sm"
        />
      </div>
      <button
        v-if="userStore.hasPermission('ums:admin:add')"
        class="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
        @click="openAddDialog"
      >
        <Plus :size="20" />
        <span>新增用户</span>
      </button>
    </div>

    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-50">
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">用户名</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">昵称</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">邮箱</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">角色</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">状态</th>
              <th class="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50/50 transition-colors">
              <td class="px-8 py-5">
                <p class="text-sm font-bold text-gray-900">{{ user.username }}</p>
                <p class="text-xs text-gray-400 mt-0.5">ID: {{ user.id }}</p>
              </td>
              <td class="px-8 py-5 text-sm text-gray-700">{{ user.nickname || '-' }}</td>
              <td class="px-8 py-5 text-sm text-gray-700">{{ user.email || '-' }}</td>
              <td class="px-8 py-5">
                <span
                  v-for="role in user.roles"
                  :key="role.id"
                  class="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium mr-1"
                >
                  {{ role.name }}
                </span>
                <span v-if="!user.roles?.length" class="text-gray-400 text-sm">-</span>
              </td>
              <td class="px-8 py-5">
                <div class="flex items-center gap-2">
                  <div :class="`w-2 h-2 rounded-full ${user.status === 1 ? 'bg-green-500' : 'bg-gray-300'}`" />
                  <span class="text-sm font-medium text-gray-700">{{ user.status === 1 ? '启用' : '禁用' }}</span>
                </div>
              </td>
              <td class="px-8 py-5 text-right">
                <button
                  v-if="userStore.hasPermission('ums:admin:edit') && !(isSuperAdmin(user) && user.username === userStore.username)"
                  class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  @click="openEditDialog(user)"
                >
                  <Edit2 :size="18" />
                </button>
                <button
                  v-if="userStore.hasPermission('ums:admin:delete') && !isSuperAdmin(user)"
                  class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-1"
                  title="删除"
                  @click="handleDelete(user)"
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
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="480px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="登录用户名" :disabled="isEdit" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="登录密码" show-password />
        </el-form-item>
        <el-form-item v-if="isEdit" label="修改密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="不修改请留空"
            show-password
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="显示昵称" maxlength="64" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="联系邮箱" maxlength="128" />
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-checkbox-group v-model="form.roleIds">
            <el-checkbox v-for="role in selectableRoles" :key="role.id" :label="role.id">
              {{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
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
import { listUsers, addUser, updateUser, deleteUser, listRoles, type UmsAdminWithRoles, type AddUserParam, type UpdateUserParam } from '@/api/admin'
import { useUserStore } from '@/stores/user'
import { encryptPassword } from '@/utils/rsaEncrypt'

const userStore = useUserStore()
const keyword = ref('')
const users = ref<UmsAdminWithRoles[]>([])
const roles = ref<{ id: number; name: string }[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const form = ref<AddUserParam & { password?: string; newPassword?: string }>({
  username: '',
  password: '',
  nickname: '',
  email: '',
  status: 1,
  roleIds: [],
  newPassword: ''
})

function isSuperAdmin(user: UmsAdminWithRoles): boolean {
  return user.roles?.some((r) => r.name === 'SUPER_ADMIN') ?? false
}

const formRules = computed<FormRules>(() => ({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: isEdit.value ? [] : [{ required: true, message: '请输入密码', trigger: 'blur' }],
  roleIds: [{ required: true, type: 'array', min: 1, message: '请至少选择一个角色', trigger: 'change' }]
}))

const selectableRoles = computed(() =>
  roles.value.filter((r) => r.name !== 'SUPER_ADMIN')
)

const filteredUsers = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return users.value
  return users.value.filter(
    (u) =>
      u.username?.toLowerCase().includes(k) ||
      u.nickname?.toLowerCase().includes(k) ||
      u.email?.toLowerCase().includes(k)
  )
})

async function fetchUsers() {
  try {
    const res = await listUsers()
    const data = res.data
    users.value = Array.isArray(data) ? data : []
  } catch {
    users.value = []
  }
}

async function fetchRoles() {
  try {
    const res = await listRoles()
    const data = res.data
    const list = Array.isArray(data) ? data : []
    roles.value = list.map((r) => ({ id: r.id, name: r.name }))
  } catch {
    roles.value = []
  }
}

function openAddDialog() {
  isEdit.value = false
  dialogVisible.value = true
  form.value = { username: '', password: '', nickname: '', email: '', status: 1, roleIds: [], newPassword: '' }
}

async function handleDelete(user: UmsAdminWithRoles) {
  try {
    await ElMessageBox.confirm(`确认删除用户「${user.username}」？`, '提示', { type: 'warning' })
    await deleteUser(user.id)
    ElMessage.success('删除成功')
    await fetchUsers()
  } catch (e) {
    if ((e as string) !== 'cancel') {
      ElMessage.error((e as Error).message || '删除失败')
    }
  }
}

function openEditDialog(user: UmsAdminWithRoles) {
  isEdit.value = true
  editingId.value = user.id
  const superAdminId = roles.value.find((r) => r.name === 'SUPER_ADMIN')?.id
  const roleIds = (user.roles?.map((r) => r.id) || []).filter((id) => id !== superAdminId)
  const firstSelectable = selectableRoles.value[0]
  form.value = {
    username: user.username,
    nickname: user.nickname || '',
    email: user.email || '',
    status: user.status,
    roleIds: roleIds.length > 0 ? roleIds : (firstSelectable ? [firstSelectable.id] : []),
    newPassword: ''
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
        const param: UpdateUserParam = {
          roleIds: form.value.roleIds,
          nickname: form.value.nickname,
          email: form.value.email,
          status: form.value.status
        }
        if (form.value.newPassword?.trim()) {
          param.password = await encryptPassword(form.value.newPassword.trim())
        }
        await updateUser(editingId.value, param)
        const isSelf = form.value.username === userStore.username
        const passwordChanged = !!param.password
        const disabled = form.value.status === 0
        if (isSelf && (passwordChanged || disabled)) {
          const msg = disabled ? '账号已被禁用，请联系管理员' : '密码已修改，请使用新密码重新登录'
          userStore.clearSessionAndRedirect(msg)
          return
        }
        ElMessage.success('编辑成功')
      } else {
        const param: AddUserParam = {
          username: form.value.username!,
          password: await encryptPassword(form.value.password!),
          nickname: form.value.nickname,
          email: form.value.email,
          status: form.value.status,
          roleIds: form.value.roleIds
        }
        await addUser(param)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
      await fetchUsers()
    } catch (e) {
      ElMessage.error((e as Error).message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>
