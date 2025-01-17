export type FlexxTableType = {
  id: number
  transaction_id: string
  policy_holder: string
  amount: number
  method: string
  status: string
  upcoming_task: string
  overdue_task: string
}

export type FlexxTableCardsDataType = {
  payments: number
  pendingPayments: number
  payouts: number
  pendingPayouts: number
}
