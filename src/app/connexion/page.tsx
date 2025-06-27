import { Metadata } from "next";
import { defaultViewport } from "@/components/ClientPageWrapper";
import dynamic from "next/dynamic";

const DynamicLoginForm = dynamic(() => import("./LoginForm"), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false,
});

export const metadata: Metadata = {
  title: "Connexion - Reboul Store",
  description: "Connectez-vous à votre compte Reboul Store.",
};

export const viewport = defaultViewport;

export default function LoginPage() {
  return <DynamicLoginForm />;
}
