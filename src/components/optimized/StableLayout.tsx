import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface StableLayoutProps {
  children: React.ReactNode;
  className?: string;
  aspectRatio?: number;
  minHeight?: number | string;
  width?: number | string;
  height?: number | string;
  placeholder?: React.ReactNode;
}

export function StableLayout({
  children,
  className,
  aspectRatio,
  minHeight,
  width,
  height,
  placeholder,
  ...props
}: StableLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Réserver l'espace avant le chargement
  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            containerRef.current?.style.setProperty(
              "--content-width",
              `${width}px`,
            );
            containerRef.current?.style.setProperty(
              "--content-height",
              `${height}px`,
            );
          }
        }
      });

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  // Calculer les styles
  const styles: React.CSSProperties = {
    position: "relative",
    width: width || "100%",
    height: height || (aspectRatio ? "auto" : "auto"),
    minHeight: minHeight || "auto",
    ...(aspectRatio && {
      paddingBottom: `${(1 / aspectRatio) * 100}%`,
    }),
  };

  return (
    <div
      ref={containerRef}
      className={cn("stable-layout", className)}
      style={styles}
      {...props}
    >
      {/* Placeholder pendant le chargement */}
      {placeholder && <div className="absolute inset-0">{placeholder}</div>}

      {/* Contenu principal */}
      <div className={cn("absolute inset-0", aspectRatio && "w-full h-full")}>
        {children}
      </div>
    </div>
  );
}
