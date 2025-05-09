// Types
type Priority = 'high' | 'medium' | 'low';

type Task = {
  id: string;
  priority: Priority;
  data: any;
  type: string;
};

type QueueMessage = {
  type: 'ADD_TASK' | 'PROCESS_TASKS' | 'CLEAR_QUEUE';
  task?: Task;
};

type TaskResult = {
  success: boolean;
  data: any;
};

// File d'attente des tâches
const taskQueue: Task[] = [];

// Fonction de tri des tâches par priorité
function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// Traitement spécifique par type de tâche
async function executeTask(task: Task): Promise<TaskResult> {
  switch (task.type) {
    case 'IMAGE_OPTIMIZATION':
      return processImageOptimization(task.data);
    case 'DATA_AGGREGATION':
      return processDataAggregation(task.data);
    case 'PRODUCT_RECOMMENDATIONS':
      return processProductRecommendations(task.data);
    case 'USER_PREFERENCES':
      return processUserPreferences(task.data);
    default:
      // Pour les types non implémentés, on retourne une simulation
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        success: true,
        data: `Tâche ${task.id} de type ${task.type} traitée avec succès`
      };
  }
}

// Traitement d'optimisation d'image
async function processImageOptimization(data: any): Promise<TaskResult> {
  try {
    // Simulation du traitement d'image
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      data: {
        url: data.url,
        optimized: true,
        size: data.size ? Math.floor(data.size * 0.7) : 100, // Simulation réduction 30%
        format: data.format || 'webp'
      }
    };
  } catch (error) {
    return {
      success: false,
      data: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Traitement d'agrégation de données
async function processDataAggregation(data: any): Promise<TaskResult> {
  try {
    // Simulation d'agrégation de données
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Si on a un tableau, on simule un regroupement
    if (Array.isArray(data.items)) {
      const result = data.items.reduce((acc: any, item: any) => {
        const key = item[data.groupBy || 'id'];
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {});
      
      return {
        success: true,
        data: { 
          aggregated: true,
          result,
          count: Object.keys(result).length
        }
      };
    }
    
    return {
      success: true,
      data: { 
        aggregated: true,
        message: 'Données agrégées avec succès'
      }
    };
  } catch (error) {
    return {
      success: false,
      data: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Traitement de recommandations produits
async function processProductRecommendations(data: any): Promise<TaskResult> {
  try {
    // Simulation de calcul de recommandations
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (data.productId) {
      // Simuler des recommandations basées sur un produit
      return {
        success: true,
        data: {
          recommendations: [
            { id: 'rec1', score: 0.92, reason: 'similar' },
            { id: 'rec2', score: 0.85, reason: 'bought_together' },
            { id: 'rec3', score: 0.78, reason: 'viewed_also_viewed' }
          ],
          source: `Product ${data.productId}`
        }
      };
    } else if (data.userId) {
      // Simuler des recommandations basées sur un utilisateur
      return {
        success: true,
        data: {
          recommendations: [
            { id: 'urec1', score: 0.89, reason: 'purchase_history' },
            { id: 'urec2', score: 0.74, reason: 'viewed_recently' },
            { id: 'urec3', score: 0.67, reason: 'wishlist' }
          ],
          source: `User ${data.userId}`
        }
      };
    }
    
    return {
      success: true,
      data: {
        recommendations: [],
        message: 'Aucun contexte pour générer des recommandations'
      }
    };
  } catch (error) {
    return {
      success: false,
      data: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Traitement des préférences utilisateur
async function processUserPreferences(data: any): Promise<TaskResult> {
  try {
    // Simulation de traitement des préférences
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return {
      success: true,
      data: {
        processed: true,
        preferences: { ...data },
        recommendations: {
          categories: data.categories || [],
          brands: data.brands || []
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      data: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Fonction de traitement des tâches
async function processTasks(): Promise<void> {
  if (taskQueue.length === 0) {
    self.postMessage({ type: 'QUEUE_EMPTY' });
    return;
  }

  const sortedTasks = sortTasksByPriority(taskQueue);
  
  for (const task of sortedTasks) {
    try {
      const result = await executeTask(task);
      
      self.postMessage({
        type: 'TASK_COMPLETE',
        taskId: task.id,
        result
      });
    } catch (error) {
      self.postMessage({
        type: 'TASK_ERROR',
        taskId: task.id,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  // Vider la file d'attente après traitement
  taskQueue.length = 0;
}

// Gestionnaire de messages
self.onmessage = (event: MessageEvent) => {
  const message = event.data as QueueMessage;

  try {
    switch (message.type) {
      case 'ADD_TASK':
        if (message.task) {
          taskQueue.push(message.task);
          self.postMessage({ type: 'TASK_ADDED', taskId: message.task.id });
        }
        break;

      case 'PROCESS_TASKS':
        processTasks();
        break;

      case 'CLEAR_QUEUE':
        taskQueue.length = 0;
        self.postMessage({ type: 'QUEUE_CLEARED' });
        break;

      default:
        self.postMessage({ type: 'ERROR', error: 'Type de message non supporté' });
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
}; 