import { useState, useEffect, useCallback } from "react";

interface UseImageWorkerOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg";
}

interface UseImageWorkerResult {
  processedImage: ImageData | null;
  error: string | null;
  isProcessing: boolean;
  processImage: (imageData: ImageData) => Promise<void>;
}

export function useImageWorker(
  options: UseImageWorkerOptions = {},
): UseImageWorkerResult {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialiser le worker
  useEffect(() => {
    const imageWorker = new Worker(
      new URL("../workers/imageWorker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    imageWorker.onmessage = (e: MessageEvent) => {
      const { type, processedImage: result, error: workerError } = e.data;

      if (type === "process") {
        if (workerError) {
          setError(workerError);
        } else {
          setProcessedImage(result);
        }
        setIsProcessing(false);
      }
    };

    imageWorker.onerror = (error) => {
      setError(error.message);
      setIsProcessing(false);
    };

    setWorker(imageWorker);

    return () => {
      imageWorker.terminate();
    };
  }, []);

  // Fonction pour traiter une image
  const processImage = useCallback(
    async (imageData: ImageData) => {
      if (!worker) {
        setError("Worker non initialisé");
        return;
      }

      setIsProcessing(true);
      setError(null);

      worker.postMessage({
        type: "process",
        imageData,
        options,
      });
    },
    [worker, options],
  );

  return {
    processedImage,
    error,
    isProcessing,
    processImage,
  };
}
