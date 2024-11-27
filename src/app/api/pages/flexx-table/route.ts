// Next Imports
import { NextResponse } from 'next/server'

// Data Imports
import { data } from '@/app/api/fake-db/pages/flexx-table'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = Number(url.searchParams.get('page') ?? '1')
  const limit = Number(url.searchParams.get('limit') ?? '10')

  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const partialData = data.slice(startIndex, endIndex)

  return NextResponse.json({ data: partialData, total: data.length })
}
