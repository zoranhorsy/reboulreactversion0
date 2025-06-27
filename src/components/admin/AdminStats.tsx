"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  api,
  type SalesStats,
  type CategoryStats,
  type BrandStats,
} from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns/addDays";
import { format } from "date-fns/format";
import { fr } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function AdminStats() {
  const [salesData, setSalesData] = useState<SalesStats[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryStats[]>([]);
  const [brandData, setBrandData] = useState<BrandStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const { toast } = useToast();

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sales, categories, brands] = await Promise.all([
        api.fetchSalesStats({
          from: dateRange.from || new Date(),
          to: dateRange.to || new Date(),
        }),
        api.fetchCategoryStats(),
        api.fetchBrandStats(),
      ]);
      setSalesData(sales);
      setCategoryData(categories);
      setBrandData(brands);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, dateRange]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span>⏳</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <span>⚠️</span>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!salesData.length && !categoryData.length && !brandData.length) {
    return (
      <Alert>
        <span>⚠️</span>
        <AlertDescription>
          Aucune donnée statistique disponible pour la période sélectionnée.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Statistiques</h2>
        <Button variant="outline" onClick={loadStats} disabled={isLoading}>
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="brands">Marques</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des ventes</CardTitle>
              <CardDescription>
                Analyse des ventes sur la période sélectionnée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <XAxis
                        dataKey="date"
                        className="text-sm text-muted-foreground"
                      />
                      <YAxis className="text-sm text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        name="Montant"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        name="Commandes"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      Aucune donnée de vente disponible
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ventes par catégorie</CardTitle>
                <CardDescription>
                  Répartition des ventes entre les catégories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Aucune donnée de catégorie disponible
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top des catégories</CardTitle>
                <CardDescription>
                  Catégories les plus performantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <XAxis
                          dataKey="name"
                          className="text-sm text-muted-foreground"
                        />
                        <YAxis className="text-sm text-muted-foreground" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Aucune donnée de catégorie disponible
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="brands">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ventes par marque</CardTitle>
                <CardDescription>
                  Répartition des ventes entre les marques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {brandData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={brandData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {brandData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Aucune donnée de marque disponible
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top des marques</CardTitle>
                <CardDescription>Marques les plus performantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {brandData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={brandData}>
                        <XAxis
                          dataKey="name"
                          className="text-sm text-muted-foreground"
                        />
                        <YAxis className="text-sm text-muted-foreground" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        Aucune donnée de marque disponible
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
