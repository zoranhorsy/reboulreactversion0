import { NotFoundContent } from "@/components/NotFoundContent";
import { ClientPageWrapper } from "@/components/ClientPageWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page non trouvée - Reboul Store",
  description: "La page que vous recherchez n'existe pas.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'noimageindex': true,
    },
  },
};

export default function NotFound() {
  return (
    <ClientPageWrapper>
      <NotFoundContent />
    </ClientPageWrapper>
  );
}
