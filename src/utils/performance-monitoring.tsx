'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'

// Types pour nos métriques
export type WebVitalMetric = {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

// Seuils pour l'évaluation des performances
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  INP: { good: 200, poor: 500 }    // Interaction to Next Paint
}

// Créer un contexte simple pour partager les métriques
const PerformanceContext = React.createContext({
  metrics: [] as WebVitalMetric[],
  score: 0,
  hasLoaded: false
})

// Provider pour le contexte
export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  return (
    <PerformanceContext.Provider value={{
      metrics: [],
      score: 0,
      hasLoaded: false
    }}>
      {children}
    </PerformanceContext.Provider>
  )
}

// Hook pour accéder au contexte (pour compatibilité)
export const usePerformance = () => React.useContext(PerformanceContext)

// Fonction vide pour compatibilité
export function usePerformanceMonitoring() {}

// Évaluer la métrique selon les seuils
const rateMetric = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Indicateur de performance avec collecte de métriques réelles
export function PerformanceMonitor() {
  const [isVisible, setIsVisible] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([])
  const [score, setScore] = useState(0)
  
  // Collecter les métriques de performance réelles
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      // Observer les métriques de peinture (FCP, etc.)
      const paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint' || entry.name === 'first-paint') {
            const value = Math.round(entry.startTime)
            const name = entry.name === 'first-contentful-paint' ? 'FCP' : 'FP'
            const rating = rateMetric(name, value)
            
            setMetrics(prev => {
              // Éviter les doublons
              const filtered = prev.filter(m => m.name !== name)
              return [...filtered, { id: name, name, value, rating }]
            })
          }
        }
      })
      
      // Observer le Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          const value = Math.round(lastEntry.startTime)
          const name = 'LCP'
          const rating = rateMetric(name, value)
          
          setMetrics(prev => {
            const filtered = prev.filter(m => m.name !== name)
            return [...filtered, { id: name, name, value, rating }]
          })
        }
      })
      
      // Observer le First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const value = Math.round((entry as any).processingStart - (entry as any).startTime)
          const name = 'FID'
          const rating = rateMetric(name, value)
          
          setMetrics(prev => {
            const filtered = prev.filter(m => m.name !== name)
            return [...filtered, { id: name, name, value, rating }]
          })
        }
      })
      
      // Observer le TTFB (Time to First Byte)
      const navigationObserver = new PerformanceObserver((entryList) => {
        const navEntry = entryList.getEntriesByType('navigation')[0]
        if (navEntry) {
          const value = Math.round((navEntry as any).responseStart)
          const name = 'TTFB'
          const rating = rateMetric(name, value)
          
          setMetrics(prev => {
            const filtered = prev.filter(m => m.name !== name)
            return [...filtered, { id: name, name, value, rating }]
          })
        }
      })
      
      // Observer les métriques
      paintObserver.observe({ type: 'paint', buffered: true })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      fidObserver.observe({ type: 'first-input', buffered: true })
      navigationObserver.observe({ type: 'navigation', buffered: true })
      
      // Rendre l'indicateur visible après un délai pour s'assurer que
      // les métriques ont été collectées
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)
      
      return () => {
        paintObserver.disconnect()
        lcpObserver.disconnect()
        fidObserver.disconnect()
        navigationObserver.disconnect()
        clearTimeout(timer)
      }
    } catch (error) {
      console.error('Erreur lors de la collecte des métriques:', error)
      // En cas d'erreur, afficher quand même l'indicateur après un délai
      setTimeout(() => setIsVisible(true), 3000)
    }
  }, [])
  
  // Calculer le score basé sur les métriques
  useEffect(() => {
    if (metrics.length > 0) {
      let totalScore = 0
      metrics.forEach(metric => {
        if (metric.rating === 'good') totalScore += 100
        else if (metric.rating === 'needs-improvement') totalScore += 50
        else totalScore += 0
      })
      
      const averageScore = Math.round(totalScore / metrics.length)
      setScore(averageScore)
    }
  }, [metrics])
  
  // Ne rien afficher tant que les métriques n'ont pas été collectées
  if (!isVisible || metrics.length === 0) return null
  
  // Déterminer le style de l'indicateur selon le score
  const getIndicatorProps = () => {
    if (score >= 90) {
      return {
        color: 'bg-green-500',
        icon: <CheckCircle className="w-4 h-4 text-white" />,
        text: 'Excellent'
      }
    } else if (score >= 50) {
      return {
        color: 'bg-yellow-500',
        icon: <AlertTriangle className="w-4 h-4 text-white" />,
        text: 'Moyen'
      }
    } else {
      return {
        color: 'bg-red-500',
        icon: <AlertCircle className="w-4 h-4 text-white" />,
        text: 'Faible'
      }
    }
  }
  
  const { color, icon, text } = getIndicatorProps()
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Panneau détaillé */}
      {isOpen && (
        <div className="mb-2 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-3 border border-zinc-200 dark:border-zinc-800 w-64 text-sm">
          <h3 className="font-medium mb-2 text-zinc-900 dark:text-zinc-100">Performance: {score}/100</h3>
          <div className="space-y-1">
            {metrics.map(metric => (
              <div key={metric.id} className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">{metric.name}:</span>
                <span className={
                  metric.rating === 'good'
                    ? 'text-green-600 dark:text-green-400'
                    : metric.rating === 'needs-improvement'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
                }>
                  {metric.value}{metric.name === 'CLS' ? '' : 'ms'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Indicateur */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${color} flex items-center gap-2 px-3 py-2 rounded-full shadow-md hover:opacity-90 transition-opacity`}
      >
        {icon}
        <span className="text-white text-xs font-medium">{text} ({score})</span>
      </button>
    </div>
  )
} 