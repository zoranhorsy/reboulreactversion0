"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/app/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Overview } from "./Overview";
import { RecentSales } from "./RecentSales";
import config from "@/config";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminStats } from "@/components/admin/AdminStats";
import { ArchiveManager } from "@/components/admin/ArchiveManager";
import { PromoManagement } from "@/components/admin/PromoManagement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: {
    id: string;
    customer: string;
    total: number;
    date: string;
    status: string;
  }[];
  weeklySales: {
    date: string;
    total: number;
  }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        router.push("/connexion");
        return;
      }

      // Si on a déjà des stats et qu'on est admin, pas besoin de recharger
      if (stats && (user as any).is_admin) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${config.urls.api}/admin/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            router.push("/connexion");
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || typeof data !== "object") {
          throw new Error("Invalid data format received");
        }

        setStats(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors de la récupération des données",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [(user as any)?.is_admin, router, stats, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Card className="w-[400px] shadow-none border-none bg-transparent">
          <CardContent>
            <span>⏳</span>
            <CardDescription>
              Chargement de l&apos;interface d&apos;administration...
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!(user as any).is_admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Card className="w-[400px]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <span>ShieldAlert</span>
              <CardTitle>Accès Restreint</CardTitle>
            </div>
            <CardDescription>
              Vous n&apos;avez pas les permissions nécessaires pour accéder à
              l&apos;interface d&apos;administration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Retour à l&apos;accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      id: "products",
      title: "Produits",
      description: "Gérez votre catalogue de produits",
      icon: <span>📦</span>,
      color: "from-primary/2 to-primary/5",
      content: <AdminProducts />,
    },
    {
      id: "orders",
      title: "Commandes",
      description: "Suivez et gérez les commandes",
      icon: <span>🛒</span>,
      color: "from-primary/2 to-primary/5",
      content: <AdminOrders />,
    },
    {
      id: "users",
      title: "Utilisateurs",
      description: "Gérez les comptes utilisateurs",
      icon: <span>Users</span>,
      color: "from-primary/2 to-primary/5",
      content: <AdminUsers />,
    },
    {
      id: "archives",
      title: "Archives",
      description: "Gérez vos photos d&apos;archives",
      icon: <span>Archive</span>,
      color: "from-primary/2 to-primary/5",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Gestion des archives</CardTitle>
            <CardDescription>
              Gérez les photos d&apos;archives de votre boutique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ArchiveManager />
          </CardContent>
        </Card>
      ),
    },
    {
      id: "stats",
      title: "Statistiques",
      description: "Analysez les performances",
      icon: <span>BarChart2</span>,
      color: "from-primary/2 to-primary/5",
      content: <AdminStats />,
    },
    {
      id: "promos",
      title: "Codes promo",
      description: "Gérez vos codes promo",
      icon: <span>Ticket</span>,
      color: "from-primary/2 to-primary/5",
      content: <PromoManagement />,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveCard(card.id)}
            className="group relative flex flex-col items-start p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.color} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
            />
            <div className="relative z-10 w-full">
              <div className="p-2.5 rounded-lg bg-primary/5 text-primary mb-3">
                {card.icon}
              </div>
              <h3 className="text-base font-medium mb-1.5 text-foreground">
                {card.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {card.description}
              </p>
              <div className="flex items-center text-xs text-primary/80">
                <span>Voir plus</span>
                <span>→</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!activeCard} onOpenChange={() => setActiveCard(null)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {cards.find((card) => card.id === activeCard)?.title}
            </DialogTitle>
            <DialogClose>
              <span>×</span>
            </DialogClose>
          </div>
        </DialogHeader>
        <DialogContent>
          <div className="p-6">
            {cards.find((card) => card.id === activeCard)?.content}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
