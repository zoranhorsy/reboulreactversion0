'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchMonthlyStats, fetchTopProductsByCategory, fetchCustomerStats, type MonthlyStats, type TopProductByCategory, type CustomerStats } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function DashboardStats() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [topProducts, setTopProducts] = useState<TopProductByCategory[]>([])
  const [customerStats, setCustomerStats] = useState<CustomerStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('Chargement des statistiques...')

        // Charger les statistiques mensuelles d'abord
        const monthly = await fetchMonthlyStats()
        console.log('Statistiques mensuelles reçues:', monthly)

        if (!Array.isArray(monthly)) {
          throw new Error('Format invalide pour les statistiques mensuelles')
        }

        // Formater les dates pour les statistiques mensuelles
        const formattedMonthly = monthly.map(stat => {
          console.log('Traitement stat mensuelle:', stat)
          return {
            ...stat,
            month: format(new Date(stat.month), 'MMM yyyy', { locale: fr }),
            revenue: typeof stat.revenue === 'string' ? parseFloat(stat.revenue) : stat.revenue,
            order_count: typeof stat.order_count === 'string' ? parseInt(stat.order_count) : stat.order_count,
            unique_customers: typeof stat.unique_customers === 'string' ? parseInt(stat.unique_customers) : stat.unique_customers
          }
        })

        console.log('Statistiques mensuelles formatées:', formattedMonthly)
        setMonthlyStats(formattedMonthly.reverse())

        // Charger les autres statistiques
        const [products, customers] = await Promise.all([
          fetchTopProductsByCategory(),
          fetchCustomerStats()
        ])

        console.log('Produits par catégorie:', products)
        console.log('Statistiques clients:', customers)

        if (Array.isArray(products)) {
          setTopProducts(products)
        }

        if (Array.isArray(customers)) {
          const formattedCustomers = customers.map(stat => ({
            ...stat,
            month: format(new Date(stat.month), 'MMM yyyy', { locale: fr }),
            new_users: typeof stat.new_users === 'string' ? parseInt(stat.new_users) : stat.new_users,
            active_users: typeof stat.active_users === 'string' ? parseInt(stat.active_users) : stat.active_users
          }))
          setCustomerStats(formattedCustomers.reverse())
        }

      } catch (error) {
        console.error('Erreur détaillée lors du chargement des statistiques:', error)
        setError('Impossible de charger les statistiques. Veuillez réessayer.')
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!monthlyStats.length && !topProducts.length && !customerStats.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Aucune donnée statistique disponible.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Graphique des ventes mensuelles */}
      <Card>
        <CardHeader>
          <CardTitle>Ventes Mensuelles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  name="Revenus (€)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="order_count"
                  stroke="#82ca9d"
                  name="Nombre de commandes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques des clients */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="new_users" fill="#8884d8" name="Nouveaux clients" />
                <Bar dataKey="active_users" fill="#82ca9d" name="Clients actifs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top produits par catégorie */}
      {topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Produits par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{product.product_name}</p>
                    <p className="text-sm text-gray-500">{product.category_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{product.total_sold} vendus</p>
                    <p className="text-sm text-gray-500">{product.revenue.toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résumé des statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Commandes Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.reduce((acc, curr) => acc + curr.order_count, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenus Totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.reduce((acc, curr) => acc + curr.revenue, 0).toFixed(2)} €
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nouveaux Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerStats.reduce((acc, curr) => acc + curr.new_users, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clients Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerStats.reduce((acc, curr) => acc + curr.active_users, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 