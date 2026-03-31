import request from '@/utils/request'
import type { PageResult } from '@/api/product'

/** 与后端 OmsOrderQueryParam 一致 */
export interface OmsOrderQueryParam {
  orderNo?: string
  userId?: number
  orderStatus?: number
  payStatus?: number
  createTimeStart?: string
  createTimeEnd?: string
  pageNum?: number
  pageSize?: number
}

export interface OmsOrderListItemVO {
  id: number
  orderNo: string
  userId: number
  orderStatus: number
  payStatus: number
  sourceType: number
  totalAmount: number
  payAmount: number
  itemCount: number
  expireTime?: string
  payTime?: string
  createTime?: string
}

export interface OmsOrderItemVO {
  productId: number
  productTitle: string
  productImage?: string
  productPrice: number
  quantity: number
  totalAmount: number
  priceChanged?: boolean
  previousPrice?: number
}

export interface OmsOrderDetailVO {
  id: number
  orderNo: string
  userId: number
  orderStatus: number
  payStatus: number
  sourceType: number
  totalAmount: number
  payAmount: number
  itemCount: number
  receiverName?: string
  receiverPhone?: string
  receiverProvince?: string
  receiverCity?: string
  receiverDistrict?: string
  receiverDetailAddress?: string
  remark?: string
  expireTime?: string
  payTime?: string
  cancelTime?: string
  cancelReason?: string
  createTime?: string
  items?: OmsOrderItemVO[]
}

export function listOrders(params: OmsOrderQueryParam) {
  return request.get<any, { code: number; message: string; data: PageResult<OmsOrderListItemVO> }>(
    '/admin/order/list',
    { params }
  )
}

export function getOrderDetail(orderNo: string) {
  return request.get<any, { code: number; message: string; data: OmsOrderDetailVO }>(
    '/admin/order/detail',
    { params: { orderNo } }
  )
}

export function closeOrder(orderNo: string) {
  return request.post<any, { code: number; message: string; data: unknown }>(
    '/admin/order/close',
    null,
    { params: { orderNo } }
  )
}
