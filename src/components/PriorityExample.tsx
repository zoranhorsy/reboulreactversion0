'use client'

import React, { useEffect, useState } from 'react'
import { usePriority, Priority, TaskResult } from '@/app/contexts/PriorityContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PriorityExample() {
  const { addTask, processTasks, clearQueue, executeTask, isProcessing, error, completedTasks, taskCount } = usePriority()
  const [results, setResults] = useState<Array<{ id: string, type: string, priority: Priority, result: any }>>([])

  // Convertir la Map en tableau pour l'affichage
  useEffect(() => {
    const resultArray = Array.from(completedTasks.entries()).map(([taskId, result]) => {
      // Extraire les informations de l'ID de la tâche (format: "TYPE-PRIORITY-ID")
      const parts = taskId.split('-')
      const type = parts[0]
      const priority = parts[1] as Priority
      
      return {
        id: taskId,
        type,
        priority,
        result: result.data
      }
    })
    
    setResults(resultArray)
  }, [completedTasks])

  // Exemple d'ajout de tâches
  const handleAddImageTask = (priority: Priority) => {
    const taskId = `IMAGE_OPTIMIZATION-${priority}-${Date.now()}`
    addTask({
      id: taskId,
      priority,
      type: 'IMAGE_OPTIMIZATION',
      data: {
        url: 'https://example.com/image.jpg',
        size: 1200,
        format: 'jpg'
      }
    })
  }

  const handleAddRecommendationTask = (priority: Priority) => {
    const taskId = `PRODUCT_RECOMMENDATIONS-${priority}-${Date.now()}`
    addTask({
      id: taskId,
      priority,
      type: 'PRODUCT_RECOMMENDATIONS',
      data: {
        productId: 'prod-123',
        userId: 'user-456'
      }
    })
  }

  const handleAddUserPreferencesTask = (priority: Priority) => {
    const taskId = `USER_PREFERENCES-${priority}-${Date.now()}`
    addTask({
      id: taskId,
      priority,
      type: 'USER_PREFERENCES',
      data: {
        categories: ['vêtements', 'chaussures'],
        brands: ['Nike', 'Adidas'],
        sizes: ['M', 'L']
      }
    })
  }

  // Exemple d'exécution directe d'une tâche
  const handleExecuteDirectTask = async () => {
    try {
      const result = await executeTask({
        id: `DIRECT-high-${Date.now()}`,
        priority: 'high',
        type: 'DATA_AGGREGATION',
        data: {
          items: [
            { id: 1, category: 'A', value: 10 },
            { id: 2, category: 'B', value: 20 },
            { id: 3, category: 'A', value: 30 },
            { id: 4, category: 'C', value: 40 },
            { id: 5, category: 'B', value: 50 }
          ],
          groupBy: 'category'
        }
      })
      
      console.log('Tâche directe terminée:', result)
    } catch (error) {
      console.error('Erreur dans l\'exécution directe:', error)
    }
  }

  // Affichage du résultat formaté
  const renderResult = (result: any) => {
    if (typeof result === 'string') {
      return result
    } else if (typeof result === 'object') {
      return (
        <pre className="text-xs bg-zinc-100 dark:bg-zinc-900 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(result, null, 2)}
        </pre>
      )
    }
    return String(result)
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Système de Priorité</CardTitle>
        <CardDescription>
          Démonstration du système de priorité avec Web Worker
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <h3 className="font-medium">Priorité Haute</h3>
              <div className="space-x-2">
                <Button size="sm" variant="default" onClick={() => handleAddImageTask('high')}>
                  Image
                </Button>
                <Button size="sm" variant="default" onClick={() => handleAddRecommendationTask('high')}>
                  Reco
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Priorité Moyenne</h3>
              <div className="space-x-2">
                <Button size="sm" variant="secondary" onClick={() => handleAddImageTask('medium')}>
                  Image
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAddRecommendationTask('medium')}>
                  Reco
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Priorité Basse</h3>
              <div className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleAddImageTask('low')}>
                  Image
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAddUserPreferencesTask('low')}>
                  Préf
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Button 
              onClick={processTasks} 
              disabled={isProcessing || taskCount === 0}
              variant="default"
            >
              {isProcessing ? 'Traitement...' : 'Traiter les tâches'}
            </Button>
            
            <Button
              onClick={clearQueue}
              variant="destructive"
              size="sm"
              disabled={taskCount === 0}
            >
              Vider la file
            </Button>
            
            <Button
              onClick={handleExecuteDirectTask}
              variant="outline"
              size="sm"
            >
              Exécution directe
            </Button>
            
            <div className="ml-auto">
              <Badge variant="outline">
                {taskCount} tâche{taskCount !== 1 ? 's' : ''} en attente
              </Badge>
            </div>
          </div>
          
          {error && (
            <div className="p-2 bg-red-50 text-red-500 rounded border border-red-200 my-2">
              Erreur: {error}
            </div>
          )}
          
          {/* Liste des résultats */}
          {results.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Résultats ({results.length})</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {results.map(item => (
                  <div 
                    key={item.id} 
                    className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant={
                          item.priority === 'high' ? 'default' :
                          item.priority === 'medium' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {item.priority}
                      </Badge>
                      <span className="text-sm font-medium">{item.type}</span>
                      <span className="text-xs text-zinc-500">{item.id.split('-')[2]}</span>
                    </div>
                    <div className="mt-1">
                      {renderResult(item.result)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-zinc-500">
        Les tâches sont exécutées dans l&apos;ordre de priorité: haute → moyenne → basse
      </CardFooter>
    </Card>
  )
} 