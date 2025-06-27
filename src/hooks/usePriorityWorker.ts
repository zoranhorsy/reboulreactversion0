import { useCallback, useEffect, useRef, useState } from "react";

type Priority = "high" | "medium" | "low";

type Task = {
  id: string;
  priority: Priority;
  type: string;
  data: any;
};

type TaskResult = {
  success: boolean;
  data: any;
};

export function usePriorityWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Map<string, TaskResult>>(
    new Map(),
  );
  const [taskCount, setTaskCount] = useState<number>(0);

  useEffect(() => {
    // Initialisation du worker
    workerRef.current = new Worker(
      new URL("../workers/priorityWorker.ts", import.meta.url),
    );

    // Gestionnaire de messages
    const messageHandler = (e: MessageEvent) => {
      switch (e.data.type) {
        case "TASK_COMPLETE":
          setCompletedTasks((prev) =>
            new Map(prev).set(e.data.taskId, e.data.result),
          );
          break;
        case "TASK_ERROR":
          setError(e.data.error);
          break;
        case "QUEUE_EMPTY":
          setIsProcessing(false);
          break;
        case "TASK_ADDED":
          setTaskCount((prev) => prev + 1);
          break;
        case "QUEUE_CLEARED":
          setTaskCount(0);
          setCompletedTasks(new Map());
          break;
      }
    };

    workerRef.current.addEventListener("message", messageHandler);

    // Nettoyage
    return () => {
      workerRef.current?.removeEventListener("message", messageHandler);
      workerRef.current?.terminate();
    };
  }, []);

  const addTask = useCallback((task: Task) => {
    if (!workerRef.current) {
      throw new Error("Worker non initialisé");
    }

    workerRef.current.postMessage({
      type: "ADD_TASK",
      task,
    });
  }, []);

  const processTasks = useCallback(() => {
    if (!workerRef.current) {
      throw new Error("Worker non initialisé");
    }

    setIsProcessing(true);
    setError(null);
    workerRef.current.postMessage({ type: "PROCESS_TASKS" });
  }, []);

  const clearQueue = useCallback(() => {
    if (!workerRef.current) {
      throw new Error("Worker non initialisé");
    }

    workerRef.current.postMessage({ type: "CLEAR_QUEUE" });
    setCompletedTasks(new Map());
    setTaskCount(0);
  }, []);

  // Méthode utilitaire pour récupérer les résultats par type
  const getResultsByType = useCallback(
    (type: string): TaskResult[] => {
      const results: TaskResult[] = [];
      completedTasks.forEach((result, taskId) => {
        // Si on peut déterminer le type de la tâche d'après son ID (format: "type-id")
        if (taskId.startsWith(`${type}-`)) {
          results.push(result);
        }
      });
      return results;
    },
    [completedTasks],
  );

  // Méthode utilitaire pour récupérer un résultat par ID
  const getResultById = useCallback(
    (taskId: string): TaskResult | undefined => {
      return completedTasks.get(taskId);
    },
    [completedTasks],
  );

  // Ajouter une tâche et traiter immédiatement
  const executeTask = useCallback(
    async (task: Task): Promise<TaskResult> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error("Worker non initialisé"));
          return;
        }

        // Créer un gestionnaire de message unique pour cette tâche
        const handler = (e: MessageEvent) => {
          if (e.data.type === "TASK_COMPLETE" && e.data.taskId === task.id) {
            workerRef.current?.removeEventListener("message", handler);
            resolve(e.data.result);
          } else if (
            e.data.type === "TASK_ERROR" &&
            e.data.taskId === task.id
          ) {
            workerRef.current?.removeEventListener("message", handler);
            reject(new Error(e.data.error));
          }
        };

        workerRef.current.addEventListener("message", handler);

        // Ajouter la tâche et la traiter immédiatement
        addTask(task);
        processTasks();
      });
    },
    [addTask, processTasks],
  );

  return {
    addTask,
    processTasks,
    clearQueue,
    executeTask,
    isProcessing,
    error,
    completedTasks,
    taskCount,
    getResultsByType,
    getResultById,
  };
}
