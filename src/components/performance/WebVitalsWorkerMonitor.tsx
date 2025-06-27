"use client";

import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Progress, ProgressPrimitive } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type WorkerPerformanceMeasure = {
  name: string;
  withWorker: number;
  withoutWorker: number;
  improvement: number;
  timestamp: number;
};

export function WebVitalsWorkerMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [workersMeasures, setWorkersMeasures] = useState<
    WorkerPerformanceMeasure[]
  >([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [currentMode, setCurrentMode] = useState<"with" | "without">("with");

  // Observer les mesures de performance liées aux Workers
  useEffect(() => {
    if (typeof window === "undefined" || !window.performance) return;

    // Observer spécifiquement les mesures liées aux workers
    const handlePerformanceEntry = (entries: PerformanceEntry[]) => {
      for (const entry of entries) {
        // Filtrer les entrées qui nous intéressent
        if (
          entry.entryType === "measure" &&
          (entry.name.includes("worker") ||
            entry.name.includes("filter-") ||
            entry.name.includes("sort-"))
        ) {
          const measureEntry = entry as PerformanceMeasure;

          // Analyser le nom de la mesure pour déterminer le type
          const isWithWorker = entry.name.includes("-with-worker");
          const measureType = entry.name
            .replace("filter-with-worker", "filter")
            .replace("filter-without-worker", "filter")
            .replace("sort-with-worker", "sort")
            .replace("sort-without-worker", "sort")
            .replace("-with-worker", "")
            .replace("-without-worker", "");

          // Trouver la mesure existante ou en créer une nouvelle
          setWorkersMeasures((prev) => {
            const existingIndex = prev.findIndex((m) => m.name === measureType);
            const newMeasures = [...prev];

            if (existingIndex >= 0) {
              // Mettre à jour la mesure existante
              if (isWithWorker) {
                newMeasures[existingIndex].withWorker = measureEntry.duration;
              } else {
                newMeasures[existingIndex].withoutWorker =
                  measureEntry.duration;
              }

              // Calculer l'amélioration si les deux valeurs sont disponibles
              if (
                newMeasures[existingIndex].withWorker &&
                newMeasures[existingIndex].withoutWorker
              ) {
                const withWorker = newMeasures[existingIndex].withWorker;
                const withoutWorker = newMeasures[existingIndex].withoutWorker;
                newMeasures[existingIndex].improvement =
                  ((withoutWorker - withWorker) / withoutWorker) * 100;
              }

              newMeasures[existingIndex].timestamp = Date.now();
              return newMeasures;
            } else {
              // Créer une nouvelle mesure
              return [
                ...prev,
                {
                  name: measureType,
                  withWorker: isWithWorker ? measureEntry.duration : 0,
                  withoutWorker: isWithWorker ? 0 : measureEntry.duration,
                  improvement: 0,
                  timestamp: Date.now(),
                },
              ];
            }
          });
        }
      }
    };

    // Créer l'observateur de performance
    const observer = new PerformanceObserver((list) => {
      handlePerformanceEntry(list.getEntries());
    });

    // Observer les mesures
    try {
      observer.observe({ entryTypes: ["measure"] });
      setIsVisible(true);
    } catch (e) {
      console.error(
        "Erreur lors de l'observation des mesures de performance",
        e,
      );
    }

    return () => {
      try {
        observer.disconnect();
      } catch (e) {
        console.error(
          "Erreur lors de la déconnexion de l'observateur de performance",
          e,
        );
      }
    };
  }, []);

  // Démarrer la collecte manuelle des données de performance
  const startCollection = () => {
    setIsCollecting(true);

    // Charger la page avec les workers
    const withWorkersUrl = new URL(window.location.href);
    withWorkersUrl.searchParams.delete("disableWorkers");

    // Ajouter un paramètre de timestamp pour éviter le cache
    withWorkersUrl.searchParams.set("t", Date.now().toString());

    setCurrentMode("with");
    window.location.href = withWorkersUrl.toString();

    // Après 10 secondes, charger la page sans workers
    setTimeout(() => {
      if (document.visibilityState === "visible") {
        const withoutWorkersUrl = new URL(window.location.href);
        withoutWorkersUrl.searchParams.set("disableWorkers", "true");
        withoutWorkersUrl.searchParams.set("t", Date.now().toString());

        setCurrentMode("without");
        window.location.href = withoutWorkersUrl.toString();
      }
    }, 10000);
  };

  // Afficher un indicateur de progression pour la collecte
  const renderCollectionStatus = () => {
    if (!isCollecting) return null;

    return (
      <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
        <span>⏳</span>
        <span className="text-sm">
          {currentMode === "with"
            ? "Collection des données avec Workers..."
            : "Collection des données sans Workers..."}
        </span>
      </div>
    );
  };

  // Ne rien afficher tant que le composant n'est pas visible
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <Button className="bg-purple-500 text-white flex items-center gap-2 px-3 py-2 rounded-full shadow-md hover:bg-purple-600 transition-all">
            <span>SplitIcon</span>
            <span className="text-xs font-medium">Workers</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex justify-between items-center border-b p-3">
            <div className="flex items-center gap-2">
              <span>BarChart</span>
              <h3 className="font-medium">Impact des Web Workers</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <span>×</span>
            </Button>
          </div>

          <div className="p-4 space-y-3">
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
                <span>SplitIcon</span>
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
                <span>ℹ️</span>
                <p className="text-sm text-muted-foreground">
                  Aucune mesure disponible.
                  <br />
                  Interagissez avec l&apos;application pour collecter des
                  données.
                </p>
              </div>
            ) : (
              <Tabs defaultValue="summary">
                <TabsList>
                  <TabsTrigger value="summary">Résumé</TabsTrigger>
                  <TabsTrigger value="details">Détails</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        Amélioration moyenne
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Comparaison des performances avec et sans Workers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Calculer l'amélioration moyenne */}
                      {(() => {
                        const validMeasures = workersMeasures.filter(
                          (m) => m.withWorker > 0 && m.withoutWorker > 0,
                        );

                        if (validMeasures.length === 0) {
                          return (
                            <div className="text-center py-2">
                              <p className="text-sm text-muted-foreground">
                                Pas assez de données pour calculer
                                l&apos;amélioration
                              </p>
                            </div>
                          );
                        }

                        const totalImprovement = validMeasures.reduce(
                          (sum, measure) => sum + measure.improvement,
                          0,
                        );
                        const averageImprovement =
                          totalImprovement / validMeasures.length;

                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Score global</span>
                              <span
                                className={`text-sm font-medium ${
                                  averageImprovement > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {averageImprovement > 0 ? "+" : ""}
                                {averageImprovement.toFixed(2)}%
                              </span>
                            </div>

                            <Progress
                              value={Math.min(
                                Math.max(averageImprovement, 0),
                                100,
                              )}
                              className="h-2"
                            >
                              <ProgressPrimitive.Indicator
                                className={`h-full w-full flex-1 transition-all ${
                                  averageImprovement > 0
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  transform: `translateX(-${100 - (Math.min(Math.max(averageImprovement, 0), 100) || 0)}%)`,
                                }}
                              />
                            </Progress>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Résumé par type */}
                  <div className="mt-3 space-y-2">
                    {["filter", "sort"].map((type) => {
                      const typeMeasures = workersMeasures.filter(
                        (m) =>
                          m.name === type &&
                          m.withWorker > 0 &&
                          m.withoutWorker > 0,
                      );

                      if (typeMeasures.length === 0) return null;

                      const latestMeasure = typeMeasures.reduce(
                        (latest, current) =>
                          current.timestamp > latest.timestamp
                            ? current
                            : latest,
                        typeMeasures[0],
                      );

                      return (
                        <div
                          key={type}
                          className="flex justify-between items-center p-2 bg-muted/40 rounded-md"
                        >
                          <div>
                            <h4 className="text-sm font-medium capitalize">
                              {type}
                            </h4>
                            <div className="flex text-xs text-muted-foreground gap-1">
                              <span>
                                {latestMeasure.withWorker.toFixed(2)}ms
                              </span>
                              <span>vs</span>
                              <span>
                                {latestMeasure.withoutWorker.toFixed(2)}ms
                              </span>
                            </div>
                          </div>
                          <Badge
                            className={`${
                              latestMeasure.improvement > 0
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            }`}
                          >
                            {latestMeasure.improvement > 0 ? "+" : ""}
                            {latestMeasure.improvement.toFixed(2)}%
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="details">
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {workersMeasures
                      .filter((m) => m.withWorker > 0 || m.withoutWorker > 0)
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((measure, index) => (
                        <div
                          key={`${measure.name}-${index}`}
                          className="p-2 bg-muted/40 rounded-md"
                        >
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium capitalize">
                              {measure.name}
                            </h4>
                            {measure.withWorker > 0 &&
                              measure.withoutWorker > 0 && (
                                <Badge
                                  className={`${
                                    measure.improvement > 0
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                  }`}
                                >
                                  {measure.improvement > 0 ? "+" : ""}
                                  {measure.improvement.toFixed(2)}%
                                </Badge>
                              )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="text-xs">
                              <div className="text-muted-foreground">
                                Avec Workers
                              </div>
                              <div className="font-medium">
                                {measure.withWorker > 0
                                  ? `${measure.withWorker.toFixed(2)}ms`
                                  : "Non mesuré"}
                              </div>
                            </div>
                            <div className="text-xs">
                              <div className="text-muted-foreground">
                                Sans Workers
                              </div>
                              <div className="font-medium">
                                {measure.withoutWorker > 0
                                  ? `${measure.withoutWorker.toFixed(2)}ms`
                                  : "Non mesuré"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
