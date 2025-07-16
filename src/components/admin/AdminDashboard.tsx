"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Archive, 
  BarChart3, 
  Ticket,
  Euro,
  ClipboardList,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Loader2
} from "lucide-react";

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !(user as any).is_admin) {
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 🔧 SYNCHRONISATION TOKEN : Récupérer depuis NextAuth et synchroniser avec localStorage
        let token = localStorage.getItem("token");
        const nextAuthToken = (user as any)?.token;
        
        console.log("🔍 Token Debug:", {
          localStorageToken: token ? `${token.substring(0, 20)}...` : 'null',
          nextAuthToken: nextAuthToken ? `${nextAuthToken.substring(0, 20)}...` : 'null'
        });

        // Si localStorage n'a pas de token mais NextAuth en a un, synchroniser
        if (!token && nextAuthToken) {
          console.log("🔄 Synchronisation token NextAuth -> localStorage");
          localStorage.setItem("token", nextAuthToken);
          token = nextAuthToken;
        }
        
        // Si le token localStorage est différent de NextAuth, utiliser NextAuth
        if (token !== nextAuthToken && nextAuthToken) {
          console.log("🔄 Mise à jour token depuis NextAuth");
          localStorage.setItem("token", nextAuthToken);
          token = nextAuthToken;
        }

        if (!token) {
          throw new Error("Aucun token d'authentification disponible");
        }

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
            console.log("🚨 Token invalide - nettoyage et redirection");
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

        console.log("✅ Données récupérées avec succès");
        setStats(data);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
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
  }, [(user as any)?.is_admin, (user as any)?.token, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Card className="w-[400px] shadow-none border-none bg-transparent">
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <CardDescription>
                Chargement de l&apos;interface d&apos;administration...
              </CardDescription>
            </div>
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
              <ShieldAlert className="h-5 w-5 text-destructive" />
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
      icon: <Package className="h-5 w-5" />,
      color: "from-primary/2 to-primary/5",
      href: "/admin/products",
    },
    {
      id: "orders",
      title: "Commandes",
      description: "Suivez et gérez les commandes",
      icon: <ShoppingCart className="h-5 w-5" />,
      color: "from-primary/2 to-primary/5",
      href: "/admin/orders",
    },
    {
      id: "users",
      title: "Utilisateurs",
      description: "Gérez les comptes utilisateurs",
      icon: <Users className="h-5 w-5" />,
      color: "from-primary/2 to-primary/5",
      href: "/admin/users",
    },
    {
      id: "archives",
      title: "Archives",
      description: "Gérez vos photos d&apos;archives",
      icon: <Archive className="h-5 w-5" />,
      color: "from-primary/2 to-primary/5",
      href: "/admin/archives",
    },
    {
      id: "stats",
      title: "Statistiques",
      description: "Analysez les performances",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "from-primary/2 to-primary/5",
      href: "/admin/stats",
    },
    {
      id: "promos",
      title: "Codes promo",
      description: "Gérez vos codes promo",
      icon: <Ticket className="h-5 w-5" />,
      color: "from-primary/2 to-primary/5",
      href: "/admin/promos",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tableau de bord Administration</h1>
      </div>
      
      {/* Statistiques rapides */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chiffre d&apos;affaires
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue}€</div>
              <p className="text-xs text-muted-foreground">
                Total des ventes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Commandes
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Total des commandes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Produits
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Dans le catalogue
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilisateurs
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Comptes actifs
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Menu de navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="group relative flex flex-col items-start p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200 hover:bg-accent"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.color} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
            />
            <div className="relative z-10 w-full">
              <div className="p-2.5 rounded-lg bg-primary/5 text-primary mb-3 w-fit">
                {card.icon}
              </div>
              <h3 className="text-base font-medium mb-1.5 text-foreground">
                {card.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {card.description}
              </p>
              <div className="flex items-center text-xs text-primary/80">
                <span>Accéder</span>
                <ArrowRight className="ml-1 h-3 w-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Graphiques et données récentes */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <Overview data={stats.weeklySales} />
          </div>
          
          <div className="lg:col-span-3">
            <RecentSales orders={stats.recentOrders} />
          </div>
        </div>
      )}
    </div>
  );
}
