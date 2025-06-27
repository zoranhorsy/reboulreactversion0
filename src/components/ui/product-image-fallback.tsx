"use client";

interface ProductImageFallbackProps {
  className?: string;
}

export function ProductImageFallback({
  className = "",
}: ProductImageFallbackProps) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-secondary/20 ${className}`}
    >
      <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
        <span>ImageIcon</span>
        <span className="text-xs font-medium">Image non disponible</span>
      </div>
    </div>
  );
}
