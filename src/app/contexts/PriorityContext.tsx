'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { usePriorityWorker } from '@/hooks/usePriorityWorker'

// Types
export type Priority = 'high' | 'medium' | 'low'

export type PriorityTask = {
  id: string
  priority: Priority
  type: string
  data: any
}

export type TaskResult = {
  success: boolean
  data: any
}

// Interface du contexte
interface PriorityContextType {
  addTask: (task: PriorityTask) => void
  processTasks: () => void
  clearQueue: () => void
  executeTask: (task: PriorityTask) => Promise<TaskResult>
  isProcessing: boolean
  error: string | null
  completedTasks: Map<string, TaskResult>
  taskCount: number
  getResultsByType: (type: string) => TaskResult[]
  getResultById: (taskId: string) => TaskResult | undefined
}

// Création du contexte
const PriorityContext = createContext<PriorityContextType | undefined>(undefined)

// Hook personnalisé pour utiliser le contexte
export function usePriority() {
  const context = useContext(PriorityContext)
  if (!context) {
    throw new Error('usePriority doit être utilisé à l\'intérieur d\'un PriorityProvider')
  }
  return context
}

// Props du Provider
interface PriorityProviderProps {
  children: ReactNode
}

// Composant Provider
export function PriorityProvider({ children }: PriorityProviderProps) {
  const priorityWorker = usePriorityWorker()

  // Valeur du contexte
  const value: PriorityContextType = {
    addTask: priorityWorker.addTask,
    processTasks: priorityWorker.processTasks,
    clearQueue: priorityWorker.clearQueue,
    executeTask: priorityWorker.executeTask,
    isProcessing: priorityWorker.isProcessing,
    error: priorityWorker.error,
    completedTasks: priorityWorker.completedTasks,
    taskCount: priorityWorker.taskCount,
    getResultsByType: priorityWorker.getResultsByType,
    getResultById: priorityWorker.getResultById
  }

  return (
    <PriorityContext.Provider value={value}>
      {children}
    </PriorityContext.Provider>
  )
} 