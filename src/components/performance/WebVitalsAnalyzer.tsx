'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, LineChart, ResponsiveContainer, XAxis, YAxis, Bar, Line, Tooltip, Legend, CartesianGrid } from 'recharts'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Download, RefreshCw, Zap } from 'lucide-react'

// Types pour les métriques
type WebVitalMetric = {
  metricName: string
  value: number
  page: string
  timestamp: number
  sessionId: string
}

type AggregatedMetric = {
  metricName: string
  median: number
  p75: number
  p95: number
  count: number
}

type PageMetrics = {
  page: string
  metrics: AggregatedMetric[]
}

type ChartDataPoint = {
  name: string
  value: number
  target: number
  limit: number
}

export function WebVitalsAnalyzer({ initialData }: { initialData?: WebVitalMetric[] }) {
  // État pour les données
  const [rawData, setRawData] = useState<WebVitalMetric[]>(initialData || [])
  const [aggregatedData, setAggregatedData] = useState<PageMetrics[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [activeMetric, setActiveMetric] = useState<string>('LCP')
  const [error, setError] = useState<string | null>(null)
  
  // Fonction pour traiter les données brutes
  const processData = useCallback((data: WebVitalMetric[]) => {
    // Regrouper par page
    const pageGroups = data.reduce((groups: Record<string, WebVitalMetric[]>, item) => {
      const page = item.page || '/'
      if (!groups[page]) groups[page] = []
      groups[page].push(item)
      return groups
    }, {})
    
    // Calculer les métriques agrégées pour chaque page
    const processed: PageMetrics[] = Object.entries(pageGroups).map(([page, metrics]) => {
      // Regrouper par type de métrique
      const metricGroups = metrics.reduce((groups: Record<string, number[]>, item) => {
        if (!groups[item.metricName]) groups[item.metricName] = []
        groups[item.metricName].push(item.value)
        return groups
      }, {})
      
      // Calculer les statistiques pour chaque métrique
      const aggregatedMetrics = Object.entries(metricGroups).map(([name, values]) => {
        values.sort((a, b) => a - b)
        const count = values.length
        
        return {
          metricName: name,
          median: values[Math.floor(count / 2)] || 0,
          p75: values[Math.floor(count * 0.75)] || 0,
          p95: values[Math.floor(count * 0.95)] || 0,
          count
        }
      })
      
      return { page, metrics: aggregatedMetrics }
    })
    
    setAggregatedData(processed)
  }, [])
  
  // Fonction pour charger les données depuis l'API
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/analytics/web-vitals')
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setRawData(data.metrics || [])
      processData(data.metrics || [])
    } catch (err) {
      setError(`Erreur lors du chargement des données: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }, [processData])
  
  // Charger les données initiales si non fournies
  useEffect(() => {
    if (!initialData) {
      loadData()
    } else {
      processData(initialData)
    }
  }, [initialData, loadData, processData])
  
  // Préparer les données pour le graphique
  const prepareChartData = (metricName: string): ChartDataPoint[] => {
    const targets = {
      'LCP': { target: 2500, limit: 4000 },
      'FID': { target: 100, limit: 300 },
      'CLS': { target: 0.1, limit: 0.25 },
      'INP': { target: 200, limit: 500 },
      'TTFB': { target: 800, limit: 1800 }
    }
    
    return aggregatedData.map(page => {
      const metric = page.metrics.find(m => m.metricName === metricName)
      const currentTarget = targets[metricName as keyof typeof targets]
      
      return {
        name: formatPagePath(page.page),
        value: metric?.p75 || 0,
        target: currentTarget?.target || 0,
        limit: currentTarget?.limit || 0
      }
    })
  }
  
  // Formatter le chemin de la page pour l'affichage
  const formatPagePath = (path: string): string => {
    if (path === '/') return 'Accueil'
    
    // Supprimer le slash initial et formater
    const formatted = path.substring(1)
      .split('/')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' / ')
    
    return formatted
  }
  
  // Formater la valeur d'une métrique pour l'affichage
  const formatMetricValue = (name: string, value: number): string => {
    if (name === 'CLS') return value.toFixed(3)
    return `${value}ms`
  }
  
  // Identifier les problèmes potentiels
  const getIssues = (): { title: string, description: string }[] => {
    const issues: { title: string, description: string }[] = []
    
    // Vérifier chaque page pour les métriques problématiques
    aggregatedData.forEach(page => {
      page.metrics.forEach(metric => {
        let threshold = 0
        let unit = 'ms'
        
        switch (metric.metricName) {
          case 'LCP':
            threshold = 4000
            break
          case 'FID':
            threshold = 300
            break
          case 'CLS':
            threshold = 0.25
            unit = ''
            break
          case 'INP':
            threshold = 500
            break
          case 'TTFB':
            threshold = 1800
            break
          default:
            return
        }
        
        if (metric.p75 > threshold) {
          issues.push({
            title: `${metric.metricName} élevé sur ${formatPagePath(page.page)}`,
            description: `La valeur P75 est de ${formatMetricValue(metric.metricName, metric.p75)} (seuil: ${formatMetricValue(metric.metricName, threshold)})`
          })
        }
      })
    })
    
    return issues
  }
  
  // Télécharger les données
  const downloadData = () => {
    const json = JSON.stringify(rawData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `web-vitals-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  // Contenus des onglets
  const renderOverviewTab = () => {
    const issues = getIssues()
    
    return (
      <div className="grid gap-6">
        {/* Graphique principal */}
        <Card>
          <CardHeader>
            <CardTitle>Performance par page</CardTitle>
            <CardDescription>
              Valeurs P75 pour {activeMetric} sur les différentes pages
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareChartData(activeMetric)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [
                    formatMetricValue(activeMetric, Number(value)), 
                    activeMetric
                  ]}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  fill="#8884d8" 
                  name={`${activeMetric} (P75)`}
                />
                <Bar 
                  dataKey="target" 
                  fill="#82ca9d" 
                  name="Objectif" 
                  opacity={0.3}
                />
                <Bar 
                  dataKey="limit" 
                  fill="#ff8042" 
                  name="Limite" 
                  opacity={0.3}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Sélection de la métrique */}
        <div className="flex flex-wrap gap-2">
          {['LCP', 'FID', 'CLS', 'INP', 'TTFB'].map(metric => (
            <Button
              key={metric}
              variant={activeMetric === metric ? "default" : "outline"}
              onClick={() => setActiveMetric(metric)}
              size="sm"
            >
              {metric}
            </Button>
          ))}
        </div>
        
        {/* Problèmes détectés */}
        {issues.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Problèmes détectés</h3>
            {issues.map((issue, i) => (
              <Alert key={i} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{issue.title}</AlertTitle>
                <AlertDescription>
                  {issue.description}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  const renderDetailsTab = () => {
    return (
      <div className="space-y-6">
        {aggregatedData.map((pageData) => (
          <Card key={pageData.page} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle>{formatPagePath(pageData.page)}</CardTitle>
              <CardDescription>{pageData.page}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {pageData.metrics.map((metric) => (
                  <div key={metric.metricName} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{metric.metricName}</span>
                      <span className="text-sm text-muted-foreground">
                        {metric.count} mesures
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Médiane</div>
                        <div>{formatMetricValue(metric.metricName, metric.median)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">P75</div>
                        <div>{formatMetricValue(metric.metricName, metric.p75)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">P95</div>
                        <div>{formatMetricValue(metric.metricName, metric.p95)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  // Si aucune donnée disponible
  if (rawData.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse des Web Vitals</CardTitle>
          <CardDescription>
            Aucune donnée disponible pour le moment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Zap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Pas encore de données collectées</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Les métriques Web Vitals commenceront à être collectées lorsque des utilisateurs visiteront votre site.
            </p>
            <Button onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analyse des Web Vitals</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadData}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="details">Détails par page</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          {renderOverviewTab()}
        </TabsContent>
        <TabsContent value="details" className="pt-4">
          {renderDetailsTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
} 