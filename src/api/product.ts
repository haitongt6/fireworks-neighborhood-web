import request from '@/utils/request'

export interface PmsProductListVO {
  id: number
  title: string
  subTitle?: string
  categoryId: number
  categoryName: string
  images?: string
  price: number
  stock: number
  status: number
  sort: number
  createTime?: string
  updateTime?: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export interface PmsProductQueryParam {
  productId?: number
  keyword?: string
  categoryId?: number
  status?: number
  priceMin?: number
  priceMax?: number
  createTimeStart?: string
  createTimeEnd?: string
  pageNum?: number
  pageSize?: number
}

export interface PmsProduct {
  id: number
  title: string
  subTitle?: string
  categoryId: number
  images?: string
  mainVideo?: string
  detailPics?: string
  price: number
  status: number
  sort: number
  createTime?: string
  updateTime?: string
}

export interface PmsProductAddParam {
  title: string
  subTitle?: string
  categoryId: number
  images?: string
  mainVideo?: string
  detailPics?: string
  price: number
  status?: number
  sort?: number
}

export interface PmsProductUpdateParam {
  title?: string
  subTitle?: string
  categoryId?: number
  images?: string
  mainVideo?: string
  detailPics?: string
  price?: number
  status?: number
  sort?: number
}

export function listProducts(params: PmsProductQueryParam) {
  return request.get<any, { code: number; message: string; data: PageResult<PmsProductListVO> }>(
    '/admin/product/list',
    { params }
  )
}

export function getProduct(id: number) {
  return request.get<any, { code: number; message: string; data: PmsProduct }>(
    `/admin/product/${id}`
  )
}

export function addProduct(data: PmsProductAddParam) {
  return request.post<any, { code: number; message: string; data: PmsProduct }>(
    '/admin/product',
    data
  )
}

export function updateProduct(id: number, data: PmsProductUpdateParam) {
  return request.put<any, { code: number; message: string }>(
    `/admin/product/${id}`,
    data
  )
}
