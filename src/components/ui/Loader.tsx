"use client";

export function LoaderComponent() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <span>⏳</span>
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}
