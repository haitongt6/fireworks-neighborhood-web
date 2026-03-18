<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button
          class="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
          @click="goBack"
        >
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ isEdit ? '编辑商品' : '新增商品' }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ isEdit ? '修改商品信息' : '填写商品基本信息' }}</p>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <form class="p-8 space-y-6" @submit.prevent="submit">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700">商品标题 <span class="text-red-500">*</span></label>
            <input
              v-model="form.title"
              type="text"
              required
              maxlength="200"
              placeholder="如：新鲜红富士苹果 5kg 礼盒装"
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700">副标题</label>
            <input
              v-model="form.subTitle"
              type="text"
              maxlength="300"
              placeholder="如：顺丰包邮"
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700">所属分类 <span class="text-red-500">*</span></label>
            <select
              v-model.number="form.categoryId"
              required
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option :value="undefined" disabled>请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700">展示价（元） <span class="text-red-500">*</span></label>
            <input
              :value="form.price"
              type="number"
              required
              step="0.01"
              min="0.01"
              placeholder="如：59.90"
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              @input="onPriceInput"
              @blur="onPriceBlur"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700">库存 <span class="text-red-500">*</span></label>
            <input
              v-model.number="form.stock"
              type="number"
              required
              min="0"
              placeholder="0"
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <!-- 主图（5张）-->
        <div class="space-y-2">
          <label class="block text-sm font-bold text-gray-700">主图（最多5张） <span class="text-red-500">*</span></label>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="(url, idx) in mainImageList"
              :key="'main-' + idx"
              class="relative w-24 h-24 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden group"
            >
              <img v-if="url" :src="toFullUrl(url)" class="w-full h-full object-cover" alt="" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-2xl">+</div>
              <input
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer"
                @change="(e) => onMainImageChange(e, idx)"
              />
              <button
                v-if="url"
                type="button"
                class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                @click.stop="removeMainImage(idx)"
              >
                ×
              </button>
              <p v-if="url" class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 truncate">{{ getFileName(url) }}</p>
            </div>
            <div
              v-if="mainImageList.filter(Boolean).length < 5"
              class="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 cursor-pointer transition-colors"
              @click="triggerMainUpload"
            >
              <span class="text-2xl">+</span>
            </div>
          </div>
          <input ref="mainFileInput" type="file" accept="image/*" class="hidden" @change="onMainFileSelect" />
        </div>

        <!-- 主图视频 -->
        <div class="space-y-2">
          <label class="block text-sm font-bold text-gray-700">主图视频</label>
          <div class="flex items-center gap-4">
            <div
              v-if="form.mainVideo"
              class="relative w-64 h-36 rounded-2xl border border-gray-200 bg-gray-900 overflow-hidden group"
            >
              <video
                :src="toFullUrl(form.mainVideo)"
                class="w-full h-full object-contain"
                controls
                preload="metadata"
                playsinline
              />
              <p class="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-2 py-1 truncate">{{ getFileName(form.mainVideo) }}</p>
              <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  class="w-6 h-6 rounded-full bg-gray-800/90 text-white text-xs flex items-center justify-center hover:bg-gray-700"
                  title="放大查看"
                  @click.stop="showVideoModal = true"
                >
                  <Maximize2 :size="14" />
                </button>
                <button
                  type="button"
                  class="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                  @click.stop="form.mainVideo = ''"
                >
                  ×
                </button>
              </div>
            </div>
            <div
              class="w-40 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 cursor-pointer transition-colors"
              @click="triggerVideoUpload"
            >
              <span class="text-2xl">+</span>
              <span class="text-xs mt-1">上传视频</span>
            </div>
          </div>
          <input ref="videoFileInput" type="file" accept="video/*" class="hidden" @change="onVideoSelect" />
        </div>

        <!-- 详情图（5张）-->
        <div class="space-y-2">
          <label class="block text-sm font-bold text-gray-700">详情图（最多5张） <span class="text-red-500">*</span></label>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="(url, idx) in detailImageList"
              :key="'desc-' + idx"
              class="relative w-24 h-24 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden group"
            >
              <img v-if="url" :src="toFullUrl(url)" class="w-full h-full object-cover" alt="" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-2xl">+</div>
              <input
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer"
                @change="(e) => onDetailImageChange(e, idx)"
              />
              <button
                v-if="url"
                type="button"
                class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                @click.stop="removeDetailImage(idx)"
              >
                ×
              </button>
              <p v-if="url" class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 truncate">{{ getFileName(url) }}</p>
            </div>
            <div
              v-if="detailImageList.filter(Boolean).length < 5"
              class="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 cursor-pointer transition-colors"
              @click="triggerDetailUpload"
            >
              <span class="text-2xl">+</span>
            </div>
          </div>
          <input ref="detailFileInput" type="file" accept="image/*" class="hidden" @change="onDetailFileSelect" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-gray-700">状态</label>
            <select
              v-model.number="form.status"
              class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option :value="1">上架</option>
              <option :value="0">下架</option>
              <option :value="2">待上架</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            class="px-6 py-2.5 rounded-2xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all"
            @click="goBack"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="submitLoading"
            class="px-6 py-2.5 rounded-2xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ submitLoading ? '提交中...' : '保存' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 视频全屏查看弹窗 -->
    <ElDialog
      v-model="showVideoModal"
      title="主图视频"
      width="80%"
      :style="{ maxWidth: '900px' }"
      destroy-on-close
      @close="showVideoModal = false"
    >
      <div v-if="form.mainVideo" class="bg-black rounded-xl overflow-hidden">
        <video
          :src="toFullUrl(form.mainVideo)"
          class="w-full aspect-video"
          controls
          autoplay
          preload="auto"
          playsinline
        />
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Maximize2 } from 'lucide-vue-next'
import { ElMessage, ElDialog } from 'element-plus'
import { listCategories } from '@/api/category'
import { getProduct, addProduct, updateProduct, type PmsProductAddParam, type PmsProductUpdateParam } from '@/api/product'
import { uploadFile } from '@/api/file'
import type { PmsProductCategory } from '@/api/category'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const productId = computed(() => Number(route.params.id))

const categories = ref<PmsProductCategory[]>([])
const submitLoading = ref(false)
const uploadLoading = ref(false)
const mainFileInput = ref<HTMLInputElement>()
const videoFileInput = ref<HTMLInputElement>()
const detailFileInput = ref<HTMLInputElement>()
const pendingMainIndex = ref<number>(-1)
const pendingDetailIndex = ref<number>(-1)
const showVideoModal = ref(false)

const form = reactive<Record<string, unknown>>({
  title: '',
  subTitle: '',
  categoryId: undefined as number | undefined,
  images: '',
  mainVideo: '',
  detailPics: '',
  price: 0,
  stock: 0,
  status: 1
})

function parseUrls(s?: string): string[] {
  if (!s?.trim()) return []
  const raw = s.trim()
  if (raw.startsWith('[')) {
    try {
      const arr = JSON.parse(raw)
      return Array.isArray(arr) ? arr.map(String).filter(Boolean) : raw.split(/[,;\n]/).map((x: string) => x.trim()).filter(Boolean)
    } catch {
      return raw.split(/[,;\n]/).map((x: string) => x.trim()).filter(Boolean)
    }
  }
  return raw.split(/[,;\n]/).map((x: string) => x.trim()).filter(Boolean)
}

function joinUrls(arr: string[]): string {
  return arr.filter(Boolean).join(',')
}

const mainImageList = computed({
  get: () => {
    const urls = parseUrls(form.images as string)
    while (urls.length < 5) urls.push('')
    return urls.slice(0, 5)
  },
  set: (val: string[]) => {
    form.images = joinUrls(val.filter(Boolean))
  }
})

const detailImageList = computed({
  get: () => {
    const urls = parseUrls(form.detailPics as string)
    while (urls.length < 5) urls.push('')
    return urls.slice(0, 5)
  },
  set: (val: string[]) => {
    form.detailPics = joinUrls(val.filter(Boolean))
  }
})

function toFullUrl(path: string): string {
  if (!path?.trim()) return ''
  if (path.startsWith('http')) return path
  return path.startsWith('/') ? path : '/' + path
}

function getFileName(url: string): string {
  if (!url) return ''
  try {
    const p = url.split('?')[0]
    return p.split('/').pop() || p
  } catch {
    return url
  }
}

/** 价格输入：限制只能输入到两位小数 */
function onPriceInput(e: Event) {
  const input = e.target as HTMLInputElement
  const val = input.value
  if (val === '' || val === '-') {
    form.price = 0
    return
  }
  const m = val.match(/^\d*\.?\d{0,2}/)
  const fixed = m ? m[0] : ''
  if (fixed !== val) {
    input.value = fixed
  }
  const num = parseFloat(fixed)
  form.price = isNaN(num) ? 0 : num
}

/** 价格失焦：统一为两位小数 */
function onPriceBlur() {
  if (typeof form.price === 'number' && !isNaN(form.price)) {
    form.price = Math.round(form.price * 100) / 100
  }
}

function triggerMainUpload() {
  pendingMainIndex.value = mainImageList.value.findIndex((u) => !u)
  if (pendingMainIndex.value < 0) pendingMainIndex.value = mainImageList.value.length - 1
  mainFileInput.value?.click()
}

function onMainFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  input && (input.value = '')
  if (!file) return
  doUpload(file, 'main').then((url) => {
    const list = [...mainImageList.value]
    const idx = list.findIndex((u) => !u)
    if (idx >= 0) list[idx] = url
    else list[list.length - 1] = url
    form.images = joinUrls(list.filter(Boolean))
  }).catch(() => {})
}

function onMainImageChange(e: Event, idx: number) {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  input && (input.value = '')
  if (!file) return
  doUpload(file, 'main').then((url) => {
    const list = [...mainImageList.value]
    list[idx] = url
    form.images = joinUrls(list.filter(Boolean))
  }).catch(() => {})
}

function removeMainImage(idx: number) {
  const list = [...mainImageList.value]
  const filled = list.filter(Boolean)
  if (filled.length <= 1) {
    ElMessage.warning('主图至少保留一张')
    return
  }
  list[idx] = ''
  form.images = joinUrls(list.filter(Boolean))
}

function triggerVideoUpload() {
  videoFileInput.value?.click()
}

function onVideoSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  input && (input.value = '')
  if (!file) return
  doUpload(file, 'video').then((url) => {
    form.mainVideo = url
  }).catch(() => {})
}

function triggerDetailUpload() {
  detailFileInput.value?.click()
}

function onDetailFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  input && (input.value = '')
  if (!file) return
  doUpload(file, 'desc').then((url) => {
    const list = [...detailImageList.value]
    const idx = list.findIndex((u) => !u)
    if (idx >= 0) list[idx] = url
    else list[list.length - 1] = url
    form.detailPics = joinUrls(list.filter(Boolean))
  }).catch(() => {})
}

function onDetailImageChange(e: Event, idx: number) {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  input && (input.value = '')
  if (!file) return
  doUpload(file, 'desc').then((url) => {
    const list = [...detailImageList.value]
    list[idx] = url
    form.detailPics = joinUrls(list.filter(Boolean))
  }).catch(() => {})
}

function removeDetailImage(idx: number) {
  const list = [...detailImageList.value]
  const filled = list.filter(Boolean)
  if (filled.length <= 1) {
    ElMessage.warning('详情图至少保留一张')
    return
  }
  list[idx] = ''
  form.detailPics = joinUrls(list.filter(Boolean))
}

const MAX_UPLOAD_SIZE_MB = 10

async function doUpload(file: File, category: 'main' | 'video' | 'desc'): Promise<string> {
  if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
    ElMessage.error(`上传文件大小不能超过 ${MAX_UPLOAD_SIZE_MB}MB`)
    throw new Error(`上传文件大小不能超过 ${MAX_UPLOAD_SIZE_MB}MB`)
  }
  uploadLoading.value = true
  try {
    const res = await uploadFile(file, category)
    return res.data
  } catch (e) {
    ElMessage.error((e as Error).message || '上传失败')
    throw e
  } finally {
    uploadLoading.value = false
  }
}

async function loadCategories() {
  const res = await listCategories()
  categories.value = res.data || []
}

async function loadProduct() {
  if (!isEdit.value || !productId.value) return
  try {
    const res = await getProduct(productId.value)
    const p = res.data
    form.title = p.title
    form.subTitle = p.subTitle ?? ''
    form.categoryId = p.categoryId
    form.images = p.images ?? ''
    form.mainVideo = p.mainVideo ?? ''
    form.detailPics = p.detailPics ?? ''
    form.price = p.price
    form.stock = p.stock ?? 0
    form.status = p.status ?? 1
  } catch (e) {
    ElMessage.error((e as Error).message || '加载商品失败')
    goBack()
  }
}

async function submit() {
  if (!form.title?.toString().trim()) {
    ElMessage.warning('请输入商品标题')
    return
  }
  if (form.categoryId == null || form.categoryId === undefined) {
    ElMessage.warning('请选择分类')
    return
  }
  const price = Number(form.price)
  if (isNaN(price) || price < 0) {
    ElMessage.warning('请输入有效价格')
    return
  }
  const stock = Number(form.stock)
  if (form.stock == null || form.stock === '' || isNaN(stock) || stock < 0) {
    ElMessage.warning('库存必填且必须大于等于0')
    return
  }
  const mainUrls = parseUrls(form.images as string).filter(Boolean)
  if (mainUrls.length === 0) {
    ElMessage.warning('主图至少保留一张')
    return
  }
  const detailUrls = parseUrls(form.detailPics as string).filter(Boolean)
  if (detailUrls.length === 0) {
    ElMessage.warning('详情图至少保留一张')
    return
  }
  submitLoading.value = true
  try {
    if (isEdit.value && productId.value) {
      const param: PmsProductUpdateParam = {
        title: String(form.title).trim(),
        subTitle: form.subTitle ? String(form.subTitle).trim() : undefined,
        categoryId: Number(form.categoryId),
        images: String(form.images ?? '').trim(),
        mainVideo: form.mainVideo ? String(form.mainVideo).trim() : '',
        detailPics: String(form.detailPics ?? '').trim(),
        price: price,
        stock: Number(form.stock),
        status: Number(form.status)
      }
      await updateProduct(productId.value, param)
      ElMessage.success('编辑成功')
    } else {
      const param: PmsProductAddParam = {
        title: String(form.title).trim(),
        subTitle: form.subTitle ? String(form.subTitle).trim() : undefined,
        categoryId: Number(form.categoryId),
        images: String(form.images ?? '').trim(),
        mainVideo: form.mainVideo ? String(form.mainVideo).trim() : undefined,
        detailPics: String(form.detailPics ?? '').trim(),
        price: price,
        stock: Number(form.stock),
        status: Number(form.status) ?? 1
      }
      await addProduct(param)
      ElMessage.success('新增成功')
    }
    router.push('/products')
  } catch {
    // 错误已由 request 拦截器统一提示
  } finally {
    submitLoading.value = false
  }
}

function goBack() {
  router.push('/products')
}

onMounted(async () => {
  await loadCategories()
  if (isEdit.value) {
    await loadProduct()
  }
})
</script>
