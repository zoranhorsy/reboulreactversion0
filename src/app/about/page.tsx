import { AboutContent } from "@/components/about/AboutContent";
import {
  ClientPageWrapper,
  defaultViewport,
} from "@/components/ClientPageWrapper";
import type { Viewport } from "next";

export const viewport: Viewport = defaultViewport;

export default function About() {
  return (
    <ClientPageWrapper>
      <AboutContent />
    </ClientPageWrapper>
  );
}
