'use client'

// React Imports
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Style Imports
import { Checkbox, TablePagination } from '@mui/material'

import styles from '@core/styles/table.module.css'

// Type Imports
import type { FlexxTableType } from '@/types/pages/flexxTableType'

// Column Definitions
const columnHelper = createColumnHelper<FlexxTableType>()

const columns = [
  {
    id: 'select',
    header: ({ table }: any) => (
      <Checkbox
        {...{
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler()
        }}
      />
    ),
    cell: ({ row }: any) => (
      <Checkbox
        {...{
          checked: row.getIsSelected(),
          disabled: !row.getCanSelect(),
          indeterminate: row.getIsSomeSelected(),
          onChange: row.getToggleSelectedHandler()
        }}
      />
    )
  },
  columnHelper.accessor('transaction_id', {
    cell: info => info.getValue(),
    header: 'Transaction'
  }),
  columnHelper.accessor('policy_holder', {
    cell: info => info.getValue(),
    header: 'Policyholder'
  }),
  columnHelper.accessor('amount', {
    cell: info => info.getValue(),
    header: 'Amount'
  }),
  columnHelper.accessor('method', {
    cell: info => info.getValue(),
    header: 'Method'
  }),
  columnHelper.accessor('status', {
    cell: info => (
      <span
        className='rounded-full bg-blue-300 text-white block text-center w-26 py-0.5'
        dangerouslySetInnerHTML={{
          __html: info.getValue()
        }}
      />
    ),
    header: 'Status'
  }),
  columnHelper.accessor(row => `${row.upcoming_task || ''} <br /> ${row.overdue_task || ''}`, {
    cell: info => (
      <span
        dangerouslySetInnerHTML={{
          __html: info.getValue()
        }}
      />
    ),
    header: 'Tasks'
  }),
  {
    id: 'action',
    header: 'Action',
    cell: () => (
      <div className='flex gap-8'>
        <div className='ri-eye-line cursor-pointer'></div>
        <div className='ri-file-edit-line cursor-pointer'></div>
      </div>
    )
  }
]

const FlexxTableView = () => {
  // States
  const [data, setData] = useState<[FlexxTableType] | []>(() => [])
  const [perPage, setPerPage] = useState(() => 10)
  const [page, setPage] = useState(() => 0)
  const [total, setTotal] = useState(() => 0)

  // Hooks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/pages/flexx-table?page=${page + 1}&limit=${perPage}`)

        if (!res.ok) throw new Error('Failed to fetch data')
        const { data: fetchedData, total: fetchedTotal } = await res.json()

        setData(() => fetchedData)
        setTotal(() => fetchedTotal)
      } catch (error) {
        console.error('Error fetching data')
      }
    }

    fetchData()
  }, [page, perPage])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: () => false
    }
  })

  // Handlers
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPerPage(() => parseInt(event.target.value, 10))
    setPage(() => 0)
  }

  return (
    <Card>
      <CardHeader title='Flexx Table' />
      <div className='overflow-x-auto'>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className='text-center'>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table
              .getRowModel()
              .rows.slice(0, 100)
              .map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className='text-center'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
        <TablePagination
          component='span'
          count={total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={perPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </div>
    </Card>
  )
}

export default FlexxTableView
