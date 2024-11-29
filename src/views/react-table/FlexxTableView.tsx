'use client'

// React Imports
import type { ChangeEvent } from 'react'
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'

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
    cell: info =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(info.getValue())
  }),
  columnHelper.accessor('method', {
    cell: info => info.getValue(),
    header: 'Method'
  }),
  columnHelper.accessor('status', {
    cell: info => (
      <span
        className='rounded-full bg-purple-400 text-white font-bold block text-center w-26 py-0.5'
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
      <div className='flex justify-center gap-4'>
        <div className='ri-eye-line cursor-pointer'></div>
        <div className='ri-file-edit-line cursor-pointer'></div>
      </div>
    )
  }
]

const FlexxTableView = () => {
  // States
  const [data, setData] = useState<[FlexxTableType] | []>([])
  const [cardsData, setCardsData] = useState(null)

  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  const [isLoading, setIsLoading] = useState(true)

  // Hooks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(() => true)

        const [res1, res2] = await Promise.all([
          fetch(`/api/pages/flexx-table?page=${page + 1}&limit=${perPage}`),
          fetch(`/api/pages/flexx-table/aggregate`)
        ])

        if (!res1.ok || !res2.ok) throw new Error('Failed to fetch data')

        const [{ data: fetchedData, total: fetchedTotal }, fetchedCardsData] = await Promise.all([
          res1.json(),
          res2.json()
        ])

        setData(() => fetchedData)
        setCardsData(() => fetchedCardsData)
        setTotal(() => fetchedTotal)
      } catch (error) {
        console.error('Error fetching data')
      } finally {
        setIsLoading(() => false)
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

  // Conditions
  if (isLoading) return <div className='text-center h-full text-lg'>Loading...</div>

  return (
    <Card>
      <div className='overflow-x-auto'>
        {cardsData && (
          <div className='flex items-center justify-between gap-12'>
            {Object.keys(cardsData).map((el, i) => (
              <div className='flex flex-col gap-6 rounded-xl p-8 shadow-md' key={el}>
                <div className='flex items-start justify-between gap-6 h-16 w-[220px]'>
                  <span className='capitalize text-lg w-12'>
                    {el.length > 8 ? el.slice(0, 7) + ' ' + el.slice(7) : el}
                  </span>
                  <span className='rounded-xl p-2 bg-purple-400 flex items-center justify-center'>
                    <span className='ri-account-circle-line w-8 h-8 text-white' />
                  </span>
                </div>
                <div className='text-3xl font-bold'>
                  {i + 1 !== Object.keys(cardsData).length
                    ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(cardsData[el])
                    : new Intl.NumberFormat('en-US', {
                        currency: 'USD'
                      }).format(cardsData[el])}
                </div>
              </div>
            ))}
          </div>
        )}

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
