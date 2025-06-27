"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <div className="flex items-center text-sm text-muted-foreground">
        <span>
          Page{" "}
          <span className="font-medium text-foreground">{currentPage}</span> sur{" "}
          <span className="font-medium text-foreground">{totalPages}</span>
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <span>←</span>
          <span className="sr-only">Page précédente</span>
        </Button>

        <div className="flex items-center">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;

            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full",
                  "mx-0.5",
                  currentPage === pageNum && "pointer-events-none",
                )}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
                <span className="sr-only">Page {pageNum}</span>
              </Button>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="mx-1 text-muted-foreground">...</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full mx-0.5"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
                <span className="sr-only">Dernière page</span>
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <span>→</span>
          <span className="sr-only">Page suivante</span>
        </Button>
      </div>
    </div>
  );
}
