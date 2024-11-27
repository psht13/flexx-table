// Next Imports
import { NextResponse } from 'next/server'

// Data Imports
import { data } from '@/app/api/fake-db/pages/flexx-table'

export async function GET(req: Request) {
  const total = req

  console.log(total)

  return NextResponse.json(data)
}
