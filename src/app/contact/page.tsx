"use client";

// Importer la configuration globale pour forcer le rendu dynamique
import { dynamic, revalidate, fetchCache } from "@/app/config";
import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

export const viewport: Viewport = defaultViewport;

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("https://reboul-store-api-production.up.railway.app/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        toast({
          title: "Message envoyé",
          description: "Nous vous répondrons dans les plus brefs délais.",
        });
        setName("");
        setEmail("");
        setMessage("");
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de contacter le serveur. Veuillez réessayer.",
      });
    }
  };

  return (
    <ClientPageWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-primary">Contactez-nous</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
            />
          </div>
          <Button type="submit" className="w-full">
            Envoyer
          </Button>
        </form>
      </div>
    </ClientPageWrapper>
  );
}
