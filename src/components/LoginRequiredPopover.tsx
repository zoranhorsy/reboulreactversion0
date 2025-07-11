"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LoginRequiredPopoverProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginRequiredPopover({
  children,
  isOpen,
  onOpenChange,
}: LoginRequiredPopoverProps) {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-2xl border-0" side="top">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4 text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-3">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">
              Connexion requise
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Connectez-vous à votre compte Reboul pour finaliser votre commande
            </p>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            {/* Bouton Se connecter */}
            <Button
              asChild
              className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Link href="/connexion" className="flex items-center justify-center gap-3">
                <User className="w-5 h-5" />
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            {/* Séparateur */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground font-medium">OU</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* Bouton S'inscrire */}
            <Button
              asChild
              variant="outline"
              className="w-full py-3 border-2 border-primary/20 hover:border-primary/40 font-semibold hover:bg-primary/5 transition-all duration-200"
            >
              <Link href="/inscription" className="flex items-center justify-center gap-3">
                <UserPlus className="w-5 h-5" />
                <span>Créer un compte</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            {/* Avantages */}
            <div className="mt-6 p-4 bg-accent/20 rounded-lg border border-accent/30">
              <h4 className="font-semibold text-sm text-foreground mb-2">
                Avantages d&apos;un compte Reboul :
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Suivi de vos commandes</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Historique d&apos;achat</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Offres exclusives</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Paiement rapide</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
} 