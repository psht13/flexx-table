// Next Imports
import { NextResponse } from 'next/server'

export async function GET() {
  const payments = 14345760
  const pendingPayments = 1157200
  const payouts = 13623600
  const pendingPayouts = 1610550

  return NextResponse.json({ payments, pendingPayments, payouts, pendingPayouts })
}
