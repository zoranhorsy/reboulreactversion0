'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, BarChart, X, SplitIcon, Info, Loader2 } from 'lucide-react'
import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Progress, ProgressPrimitive } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Types pour les métriques
export type WebVitalName = 'CLS' | 'FID' | 'LCP' | 'INP' | 'TTFB'
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor'

export type WebVitalMetric = {
  name: WebVitalName
  value: number
  rating: WebVitalRating
  delta: number
}

// Type pour les mesures de performance des Workers
type WorkerPerformanceMeasure = {
  name: string
  withWorker: number
  withoutWorker: number
  improvement: number
  timestamp: number
}

// Seuils pour l'évaluation des métriques Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  INP: { good: 200, poor: 500 }    // Interaction to Next Paint
}

// Fonction pour noter une métrique selon les seuils
const rateMetric = (name: WebVitalName, value: number): WebVitalRating => {
  const threshold = THRESHOLDS[name]
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Formatage de la valeur selon la métrique
const formatValue = (name: WebVitalName, value: number): string => {
  if (name === 'CLS') return value.toFixed(3)
  return `${Math.round(value)}ms`
}

export function WebVitalsMonitor() {
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([])
  const [score, setScore] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [currentTab, setCurrentTab] = useState<'metrics' | 'workers'>('metrics')
  const [infiniteScrollMetrics, setInfiniteScrollMetrics] = useState<{
    loadTime: number
    itemsLoaded: number
    timestamp: number
  }[]>([])
  
  // État pour le monitoring des Workers
  const [workersMeasures, setWorkersMeasures] = useState<WorkerPerformanceMeasure[]>([])
  const [isCollecting, setIsCollecting] = useState(false)
  const [currentMode, setCurrentMode] = useState<'with' | 'without'>('with')

  // Collecter les métriques Web Vitals 
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Observer les métriques Web Vitals principales
    const addMetric = ({ name, value, delta }: { name: string, value: number, delta: number }) => {
      const metricName = name.toUpperCase() as WebVitalName
      const rating = rateMetric(metricName, value)
      
      setMetrics(prev => {
        // Éviter les doublons en filtrant les métriques existantes
        const filtered = prev.filter(m => m.name !== metricName)
        return [...filtered, { name: metricName, value, rating, delta }]
      })
    }

    // Enregistrer les handlers pour les métriques Web Vitals
    // Note: certaines fonctions peuvent ne pas retourner de fonction unsubscribe
    const metricsReporters: Array<void | (() => void)> = []
    try {
      metricsReporters.push(onCLS(addMetric))
      metricsReporters.push(onFID(addMetric))
      metricsReporters.push(onLCP(addMetric))
      metricsReporters.push(onINP(addMetric))
      metricsReporters.push(onTTFB(addMetric))
    } catch (e) {
      console.error('Erreur l&apos;enregistrement des métriques Web Vitals', e)
    }

    // Observer les performances du chargement infini
    const handlePerformanceMark = (event: Event) => {
      const markEvent = event as CustomEvent<{
        mark: string;
        detail: {
          duration: number;
          items: number;
        };
      }>
      if (markEvent.detail.mark?.startsWith('infinite-scroll-')) {
        setInfiniteScrollMetrics(prev => [
          ...prev,
          {
            loadTime: markEvent.detail.detail.duration,
            itemsLoaded: markEvent.detail.detail.items,
            timestamp: Date.now()
          }
        ])
      }
    }

    // Écouter les marks de performance 
    performance.addEventListener('mark', handlePerformanceMark)

    // Rendre le moniteur visible après un délai
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)
    
    return () => {
      // S'assurer que chaque reporter est une fonction avant de l'appeler
      metricsReporters.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          try {
            unsubscribe()
          } catch (e) {
            console.error('Erreur lors du désabonnement des métriques Web Vitals', e)
          }
        }
      })
      
      try {
        performance.removeEventListener('mark', handlePerformanceMark)
      } catch (e) {
        console.error('Erreur lors de la suppression de l&apos;écouteur de performance', e)
      }
      
      clearTimeout(timer)
    }
  }, [])

  // Observer les mesures de performance liées aux Workers
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return
    
    // Observer spécifiquement les mesures liées aux workers
    const handlePerformanceEntry = (entries: PerformanceEntry[]) => {
      for (const entry of entries) {
        // Filtrer les entrées qui nous intéressent
        if (
          entry.entryType === 'measure' &&
          entry.name.startsWith('worker-')
        ) {
          setWorkersMeasures(prev => [
            ...prev,
            {
              name: entry.name,
              withWorker: entry.duration,
              withoutWorker: 0,
              improvement: 0,
              timestamp: entry.startTime
            }
          ])
        }
      }
    }

    // Créer l'observateur de performance
    const observer = new PerformanceObserver(list => {
      handlePerformanceEntry(list.getEntries())
    })
    
    // Observer les mesures
    try {
      observer.observe({ entryTypes: ['measure'] })
    } catch (e) {
      console.error('Erreur lors de l&apos;observation des mesures de performance', e)
    }
    
    return () => {
      try {
        observer.disconnect()
      } catch (e) {
        console.error('Erreur lors de la déconnexion de l&apos;observateur de performance', e)
      }
    }
  }, [])

  // Démarrer la collecte manuelle des données de performance des workers
  const startCollection = () => {
    setIsCollecting(true);
    
    // Nouvelle méthode : mesurer directement sans recharger la page
    const testWithWithoutWorkers = async () => {
      try {
        // Phase 1: Test avec workers
        console.log("📊 Début du test avec Workers");
        setCurrentMode('with');
        
        // Créer des données de test (sans utiliser de hooks)
        const testProducts = Array(1000).fill(0).map((_, i) => ({
          id: i,
          name: `Product ${i}`,
          price: Math.random() * 1000,
          category: ['Chaussures', 'Vêtements', 'Accessoires'][i % 3],
          colors: ['red', 'blue', 'green'].slice(0, (i % 3) + 1),
          sizes: ['S', 'M', 'L', 'XL'].slice(0, (i % 4) + 1),
          inStock: i % 5 !== 0,
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
          popularity: Math.floor(Math.random() * 100)
        }));
        
        // Phase 1: Mesures avec Workers
        // Mesure directe sans utiliser de hooks qui ne sont pas disponibles ici
        console.log("📊 Test de filtrage avec Workers");
        performance.mark('filter-with-worker-start');
        
        // Filtrer manuellement avec Web Worker
        const filterWorker = new Worker('/workers/filterWorker.js');
        
        const filterResult = await new Promise((resolve) => {
          filterWorker.onmessage = (e) => {
            if (e.data.type === 'FILTER_SUCCESS') {
              resolve(e.data.result);
            }
          };
          
          filterWorker.postMessage({
            type: 'FILTER_PRODUCTS',
            products: testProducts,
            options: {
              categories: ['Chaussures'],
              priceRange: { min: 100, max: 500 },
              inStock: true
            }
          });
        });
        
        performance.mark('filter-with-worker-end');
        performance.measure('filter-with-worker', {
          start: 'filter-with-worker-start',
          end: 'filter-with-worker-end',
          detail: { count: Array.isArray(filterResult) ? filterResult.length : 0 }
        });
        
        // Test de tri avec Workers
        console.log("📊 Test de tri avec Workers");
        performance.mark('sort-with-worker-start');
        
        // Trier manuellement avec Web Worker
        const sortResult = await new Promise((resolve) => {
          filterWorker.onmessage = (e) => {
            if (e.data.type === 'SORT_SUCCESS') {
              resolve(e.data.result);
            }
          };
          
          filterWorker.postMessage({
            type: 'SORT_PRODUCTS',
            products: testProducts,
            sortBy: 'price',
            sortOrder: 'desc'
          });
        });
        
        performance.mark('sort-with-worker-end');
        performance.measure('sort-with-worker', {
          start: 'sort-with-worker-start',
          end: 'sort-with-worker-end',
          detail: { count: Array.isArray(sortResult) ? sortResult.length : 0 }
        });
        
        // Terminer le worker
        filterWorker.terminate();
        
        // Phase 2: Test sans workers (implémentation manuelle)
        console.log("📊 Début du test sans Workers");
        setCurrentMode('without');
        
        // Forcer manuellement l'implémentation sans worker
        console.log("📊 Test de filtrage sans Workers");
        performance.mark('filter-without-worker-start');
        let result = [...testProducts];
        
        // Filtrage par catégories
        result = result.filter(product => 
          product.category === 'Chaussures'
        );
        
        // Filtrage par prix
        result = result.filter(product => 
          product.price >= 100 && product.price <= 500
        );
        
        // Filtrage par stock
        result = result.filter(product => product.inStock);
        
        performance.mark('filter-without-worker-end');
        performance.measure('filter-without-worker', {
          start: 'filter-without-worker-start',
          end: 'filter-without-worker-end',
          detail: { count: result.length }
        });
        
        // Test de tri sans Workers
        console.log("📊 Test de tri sans Workers");
        performance.mark('sort-without-worker-start');
        result = [...testProducts];
        result.sort((a, b) => b.price - a.price); // tri par prix descendant
        performance.mark('sort-without-worker-end');
        performance.measure('sort-without-worker', {
          start: 'sort-without-worker-start',
          end: 'sort-without-worker-end',
          detail: { count: result.length }
        });
        
        console.log("📊 Tests terminés");
        setIsCollecting(false);
      } catch (error) {
        console.error("❌ Erreur lors des tests:", error);
        setIsCollecting(false);
      }
    };
    
    testWithWithoutWorkers();
  }

  // Afficher un indicateur de progression pour la collecte
  const renderCollectionStatus = () => {
    if (!isCollecting) return null
    
    return (
      <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        <span className="text-sm">
          {currentMode === 'with' 
            ? 'Collection des données avec Workers...' 
            : 'Collection des données sans Workers...'}
        </span>
      </div>
    )
  }

  // Calculer le score global basé sur les métriques
  useEffect(() => {
    if (metrics.length === 0) return
    
    const scores = {
      'good': 100,
      'needs-improvement': 60,
      'poor': 30
    }
    
    let totalScore = 0
    metrics.forEach(metric => {
      totalScore += scores[metric.rating]
    })
    
    setScore(Math.round(totalScore / metrics.length))
  }, [metrics])

  // Ne rien afficher tant que les métriques n'ont pas été collectées
  if (!isVisible) return null

  // Style de l'indicateur selon le score
  const getIndicatorProps = () => {
    if (score >= 90) {
      return {
        color: 'bg-green-500',
        textColor: 'text-green-500',
        bgColor: 'bg-green-100',
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'Excellent'
      }
    } else if (score >= 60) {
      return {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        icon: <AlertTriangle className="w-4 h-4" />,
        text: 'Moyen'
      }
    } else {
      return {
        color: 'bg-red-500',
        textColor: 'text-red-500',
        bgColor: 'bg-red-100',
        icon: <AlertCircle className="w-4 h-4" />,
        text: 'Faible'
      }
    }
  }

  const indicatorProps = getIndicatorProps()

  // Déterminer la hauteur du bouton
  const hasWorkersMeasures = workersMeasures.length > 0;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 items-start">
      {/* Bouton pour les mesures des Workers */}
      {hasWorkersMeasures && (
        <Button 
          className="bg-purple-500 text-white flex items-center gap-2 px-3 py-2 rounded-full shadow-md hover:bg-purple-600 transition-all"
          onClick={() => {
            setCurrentTab('workers');
            setIsOpen(true);
          }}
        >
          <SplitIcon className="w-4 h-4" />
          <span className="text-xs font-medium">Workers</span>
        </Button>
      )}
      
      {/* Bouton principal pour les Web Vitals */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            className={`${indicatorProps.color} text-white flex items-center gap-2 px-3 py-2 rounded-full shadow-md hover:opacity-90 transition-opacity`}
            onClick={() => setCurrentTab('metrics')}
          >
            {indicatorProps.icon}
            <span className="text-xs font-medium">Perf: {score}</span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[380px] p-0 bg-background/95 backdrop-blur-sm" side="top">
          <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'metrics' | 'workers')}>
            <div className="flex justify-between items-center border-b p-3">
              <div className="flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                <h3 className="font-medium">
                  {currentTab === 'metrics' ? 'Web Vitals' : 'Impact des Workers'}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <TabsList className="h-8">
                  <TabsTrigger value="metrics" className="text-xs px-2 h-6">
                    Vitals
                  </TabsTrigger>
                  <TabsTrigger value="workers" className="text-xs px-2 h-6">
                    Workers
                  </TabsTrigger>
                </TabsList>
                
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <TabsContent value="metrics" className="p-4 space-y-3 focus-visible:outline-none">
              {/* Score global */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Score global</span>
                  <span className={`text-sm font-medium ${indicatorProps.textColor}`}>
                    {indicatorProps.text} ({score}/100)
                  </span>
                </div>
                <Progress 
                  value={score} 
                  className="h-2"
                >
                  <ProgressPrimitive.Indicator
                    className={`h-full w-full flex-1 transition-all ${indicatorProps.color}`}
                    style={{ transform: `translateX(-${100 - (score || 0)}%)` }}
                  />
                </Progress>
              </div>
              
              {/* Métriques individuelles */}
              <div className="space-y-2">
                {metrics.map(metric => (
                  <div key={metric.name} className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      {metric.rating === 'good' && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                      {metric.rating === 'needs-improvement' && <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />}
                      {metric.rating === 'poor' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                      <span className="text-sm">{metric.name}</span>
                    </div>
                    <span 
                      className={`text-sm font-medium
                        ${metric.rating === 'good' ? 'text-green-600' : 
                          metric.rating === 'needs-improvement' ? 'text-yellow-600' : 
                          'text-red-600'}`}
                    >
                      {formatValue(metric.name, metric.value)}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Défilement infini statistiques */}
              {infiniteScrollMetrics.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <h4 className="text-sm font-medium mb-2">Chargement infini</h4>
                  <div className="text-xs space-y-1.5">
                    {infiniteScrollMetrics.slice(-3).map((metric, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{metric.itemsLoaded} éléments</span>
                        <span className="font-medium">{metric.loadTime}ms</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="workers" className="p-4 space-y-3 focus-visible:outline-none">
              {/* Indicateur de collecte */}
              {renderCollectionStatus()}
              
              {/* Actions */}
              <div className="flex justify-between mb-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  disabled={isCollecting}
                  onClick={startCollection}
                >
                  <SplitIcon className="w-3 h-3 mr-1" />
                  Tester impact
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-xs"
                  onClick={() => setWorkersMeasures([])}
                >
                  Réinitialiser
                </Button>
              </div>

              {workersMeasures.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Info className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aucune mesure disponible.<br />
                    Interagissez avec l&apos;application pour collecter des données.
                  </p>
                </div>
              ) : (
                <Tabs defaultValue="summary">
                  <TabsList className="w-full mb-2">
                    <TabsTrigger value="summary" className="text-xs">Résumé</TabsTrigger>
                    <TabsTrigger value="details" className="text-xs">Détails</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary">
                    <Card>
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm">Amélioration moyenne</CardTitle>
                        <CardDescription className="text-xs">
                          Comparaison des performances avec et sans Workers
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2">
                        {/* Calculer l&apos;amélioration moyenne */}
                        {(() => {
                          const validMeasures = workersMeasures.filter(
                            m => m.withWorker > 0 && m.withoutWorker > 0
                          )
                          
                          if (validMeasures.length === 0) {
                            return (
                              <div className="text-center py-2">
                                <p className="text-sm text-muted-foreground">
                                  Pas assez de données pour calculer l&apos;amélioration
                                </p>
                              </div>
                            )
                          }
                          
                          const totalImprovement = validMeasures.reduce(
                            (sum, measure) => sum + measure.improvement, 
                            0
                          )
                          const averageImprovement = totalImprovement / validMeasures.length
                          
                          return (
                            <div className="space-y-2">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm">Score global</span>
                                <span className={`text-sm font-medium ${
                                  averageImprovement > 0 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                }`}>
                                  {averageImprovement > 0 ? '+' : ''}
                                  {averageImprovement.toFixed(2)}%
                                </span>
                              </div>
                              
                              <Progress 
                                value={Math.min(Math.max(averageImprovement, 0), 100)} 
                                className="h-2"
                              >
                                <ProgressPrimitive.Indicator
                                  className={`h-full w-full flex-1 transition-all ${
                                    averageImprovement > 0 
                                      ? 'bg-green-500' 
                                      : 'bg-red-500'
                                  }`}
                                  style={{ transform: `translateX(-${100 - (Math.min(Math.max(averageImprovement, 0), 100) || 0)}%)` }}
                                />
                              </Progress>
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>
                    
                    {/* Résumé par type */}
                    <div className="mt-3 space-y-2">
                      {['filter', 'sort'].map(type => {
                        const typeMeasures = workersMeasures.filter(
                          m => m.name === type && m.withWorker > 0 && m.withoutWorker > 0
                        )
                        
                        if (typeMeasures.length === 0) return null
                        
                        const latestMeasure = typeMeasures.reduce(
                          (latest, current) => 
                            current.timestamp > latest.timestamp ? current : latest,
                          typeMeasures[0]
                        )
                        
                        return (
                          <div key={type} className="flex justify-between items-center p-2 bg-muted/40 rounded-md">
                            <div>
                              <h4 className="text-sm font-medium capitalize">{type}</h4>
                              <div className="flex text-xs text-muted-foreground gap-1">
                                <span>{latestMeasure.withWorker.toFixed(2)}ms</span>
                                <span>vs</span>
                                <span>{latestMeasure.withoutWorker.toFixed(2)}ms</span>
                              </div>
                            </div>
                            <Badge 
                              className={`${
                                latestMeasure.improvement > 0 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              }`}
                            >
                              {latestMeasure.improvement > 0 ? '+' : ''}
                              {latestMeasure.improvement.toFixed(2)}%
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {workersMeasures
                        .filter(m => m.withWorker > 0 || m.withoutWorker > 0)
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((measure, index) => (
                          <div 
                            key={`${measure.name}-${index}`} 
                            className="p-2 bg-muted/40 rounded-md"
                          >
                            <div className="flex justify-between">
                              <h4 className="text-sm font-medium capitalize">{measure.name}</h4>
                              {measure.withWorker > 0 && measure.withoutWorker > 0 && (
                                <Badge 
                                  className={`${
                                    measure.improvement > 0 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                  }`}
                                >
                                  {measure.improvement > 0 ? '+' : ''}
                                  {measure.improvement.toFixed(2)}%
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div className="text-xs">
                                <div className="text-muted-foreground">Avec Workers</div>
                                <div className="font-medium">
                                  {measure.withWorker > 0 
                                    ? `${measure.withWorker.toFixed(2)}ms` 
                                    : 'Non mesuré'}
                                </div>
                              </div>
                              
                              <div className="text-xs">
                                <div className="text-muted-foreground">Sans Workers</div>
                                <div className="font-medium">
                                  {measure.withoutWorker > 0 
                                    ? `${measure.withoutWorker.toFixed(2)}ms` 
                                    : 'Non mesuré'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(measure.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
} 