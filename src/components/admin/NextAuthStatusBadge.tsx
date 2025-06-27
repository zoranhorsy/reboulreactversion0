"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
export function NextAuthStatusBadge() {
  const [status, setStatus] = useState<
    "loading" | "connected" | "disconnected"
  >("loading");
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkStatus = async () => {
    try {
      setIsChecking(true);
      const response = await fetch("/api/auth/test");
      const data = await response.json();

      if (data.authenticated) {
        setStatus("connected");
      } else {
        setStatus("disconnected");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de la session NextAuth:",
        error,
      );
      setStatus("disconnected");
    } finally {
      setIsChecking(false);
    }
  };

  const syncSession = async () => {
    try {
      setIsChecking(true);
      const response = await fetch("/api/auth/sync");
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Session synchronisée",
          description: "Session NextAuth synchronisée avec succès.",
        });
        checkStatus(); // Vérifier à nouveau le statut
      } else {
        toast({
          variant: "destructive",
          title: "Échec de synchronisation",
          description: data.message || "Impossible de synchroniser la session.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la synchronisation.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Vérifier le statut au chargement
  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={
          status === "connected"
            ? "secondary"
            : status === "disconnected"
              ? "destructive"
              : "secondary"
        }
        className={`px-2 py-0.5 flex items-center gap-1 ${
          status === "connected" 
            ? "bg-green-500 text-white hover:bg-green-600" 
            : ""
        }`}
      >
        {status === "connected" ? (
          <>
            <span>CheckCircle2</span>
            <span>NextAuth Actif</span>
          </>
        ) : status === "disconnected" ? (
          <>
            <span>XCircle</span>
            <span>NextAuth Inactif</span>
          </>
        ) : (
          <span>Vérification...</span>
        )}
      </Badge>

      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1"
        onClick={syncSession}
        disabled={isChecking}
      >
        <span>🔄</span>
        <span className="text-xs">Sync</span>
      </Button>
    </div>
  );
}
