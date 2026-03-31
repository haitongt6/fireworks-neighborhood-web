import request from '@/utils/request'

export interface OrderStatusCountVO {
  waitPay: number
  paid: number
  canceled: number
  closed: number
  finished: number
}

export interface TopProductVO {
  productId: number
  productTitle: string
  productImage: string
  totalSales: number
}

export interface SalesTrendVO {
  date: string
  amount: number
}

export interface RecentOrderVO {
  orderNo: string
  orderStatus: number
  totalAmount: number
  payAmount: number
  createTime: string
}

export interface AdminHomeStatisticsVO {
  totalSalesAmount: number
  orderStatusCount: OrderStatusCountVO
  newMemberCount: number
  topProducts: TopProductVO[]
  salesTrend: SalesTrendVO[]
  recentOrders: RecentOrderVO[]
}

function toNum(v: unknown): number {
  if (v == null || v === '') {
    return 0
  }
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

/** 将后端 Result.data 规范为前端类型，兼容 BigDecimal 序列化为数字/字符串、null 列表等 */
function normalizeAdminHomeStatistics(raw: AdminHomeStatisticsVO): AdminHomeStatisticsVO {
  const oc = raw.orderStatusCount
  return {
    totalSalesAmount: toNum(raw.totalSalesAmount),
    orderStatusCount: {
      waitPay: toNum(oc?.waitPay),
      paid: toNum(oc?.paid),
      canceled: toNum(oc?.canceled),
      closed: toNum(oc?.closed),
      finished: toNum(oc?.finished),
    },
    newMemberCount: toNum(raw.newMemberCount),
    topProducts: (Array.isArray(raw.topProducts) ? raw.topProducts : []).map((p) => ({
      productId: toNum(p.productId),
      productTitle: p.productTitle ?? '',
      productImage: p.productImage ?? '',
      totalSales: toNum(p.totalSales),
    })),
    salesTrend: (Array.isArray(raw.salesTrend) ? raw.salesTrend : []).map((s) => ({
      date: s.date ?? '',
      amount: toNum(s.amount),
    })),
    recentOrders: (Array.isArray(raw.recentOrders) ? raw.recentOrders : []).map((r) => ({
      orderNo: r.orderNo ?? '',
      orderStatus: toNum(r.orderStatus),
      totalAmount: toNum(r.totalAmount),
      payAmount: toNum(r.payAmount),
      createTime: r.createTime != null ? String(r.createTime) : '',
    })),
  }
}

export function getHomeStatistics(startTime: string, endTime: string): Promise<AdminHomeStatisticsVO> {
  return request
    .get<any, { code: number; message: string; data: AdminHomeStatisticsVO }>(
      '/admin/home/statistics',
      { params: { startTime, endTime } }
    )
    .then((res) => normalizeAdminHomeStatistics(res.data))
}
