'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronDown, ChevronUp, Download, Printer } from 'lucide-react'
import { DatePicker } from "@/components/ui/date-picker"
import { CSVLink } from "react-csv"
import { jsPDF } from "jspdf"
import autoTable from 'jspdf-autotable'
import { ReturnForm } from '@/components/admin/ReturnForm'
import { fetchOrders, type Order } from '@/lib/api'
import type { DateRange } from '@/types/date'

type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: keyof Order;
  direction: SortDirection;
}

type CSVData = {
  ID: string;
  'User ID': string;
  'Total Amount': number;
  Status: string;
  'Created At': string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'createdAt',
    direction: 'descending',
  })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      const fetchedOrders = await fetchOrders()
      setOrders(fetchedOrders)
    }
    loadOrders()
  }, [])

  const handleSort = (key: keyof Order) => {
    setSortConfig(current => ({
      key,
      direction:
        current.key === key && current.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }))
  }

  const getSortIcon = (key: keyof Order) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'ascending' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    )
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      !searchTerm ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDateRange =
      !dateRange?.from ||
      !dateRange?.to ||
      (new Date(order.createdAt) >= dateRange.from &&
        new Date(order.createdAt) <= dateRange.to)

    return matchesSearch && matchesDateRange
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!(sortConfig.key in a) || !(sortConfig.key in b)) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === undefined || bValue === undefined) return 0;

    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
    return 0;
  })

  const csvData: CSVData[] = sortedOrders.map(order => ({
    ID: order.id,
    'User ID': order.userId,
    'Total Amount': order.totalAmount,
    Status: order.status,
    'Created At': format(new Date(order.createdAt), 'Pp', { locale: fr }),
  }))

  const handleExportPDF = () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [['ID', 'User ID', 'Total Amount', 'Status', 'Created At']],
      body: sortedOrders.map(order => [
        order.id,
        order.userId,
        `${order.totalAmount}€`,
        order.status,
        format(new Date(order.createdAt), 'Pp', { locale: fr }),
      ]),
    })
    doc.save('orders.pdf')
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Commandes</h2>
        <div className="flex items-center gap-2">
          <CSVLink
            data={csvData}
            filename="orders.csv"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </CSVLink>
          <Button variant="outline" onClick={handleExportPDF}>
            <Printer className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <DatePicker
              selected={dateRange}
              onSelect={setDateRange}
              locale={fr}
              showTime={false}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Liste des commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      ID {getSortIcon('id')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('userId')}
                  >
                    <div className="flex items-center">
                      User ID {getSortIcon('userId')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('totalAmount')}
                  >
                    <div className="flex items-center">
                      Total {getSortIcon('totalAmount')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status {getSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Date {getSortIcon('createdAt')}
                    </div>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.userId}</TableCell>
                    <TableCell>{order.totalAmount}€</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), 'Pp', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Gérer le retour
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {selectedOrder && (
          <ReturnForm
            order={selectedOrder}
            onReturnProcessed={(updatedOrder) => {
              setOrders(orders.map(o =>
                o.id === updatedOrder.id ? updatedOrder : o
              ))
              setSelectedOrder(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
