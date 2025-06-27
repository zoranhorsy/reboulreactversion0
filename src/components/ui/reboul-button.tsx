"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

const reboulButtonVariants = cva(
  // Classes de base - Mobile First avec GPU optimization
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group gpu-optimized",
  {
    variants: {
      variant: {
        // Bouton principal (style du bouton "Panier" dans les cartes)
        primary:
          "bg-primary hover:bg-primary/90 text-white dark:bg-white dark:text-black shadow-sm hover:shadow-md",

        // Bouton secondaire (style du bouton "Voir détails")
        secondary:
          "bg-gray-100 dark:bg-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-100 text-gray-900 dark:text-black",

        // Bouton outline (style du bouton principal du catalogue)
        outline:
          "bg-gradient-to-r from-background to-background/95 text-foreground border-2 border-primary/20 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:scale-105 hover:shadow-xl hover:shadow-primary/10",

        // Bouton hover (style du bouton hover sur les cartes)
        hover:
          "bg-white dark:bg-black text-gray-900 dark:text-white hover:bg-primary hover:text-white border dark:border-white/20 shadow-lg transform translate-y-4 group-hover:translate-y-0",

        // Bouton de succès (état loading/success)
        success: "bg-green-500 text-white cursor-not-allowed",

        // Bouton ghost
        ghost: "hover:bg-accent hover:text-accent-foreground",

        // Bouton destructif
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-sm tracking-wide",
        xl: "h-14 px-10 text-base",
        // Tailles spécifiques mobile
        mobile: "h-8 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm",
        card: "py-2 px-3 sm:px-4 text-xs sm:text-sm",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      uppercase: {
        true: "uppercase tracking-wide",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
      uppercase: false,
    },
  },
);

export interface ReboulButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof reboulButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const ReboulButton = React.forwardRef<HTMLButtonElement, ReboulButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      uppercase,
      asChild = false,
      loading = false,
      loadingText,
      icon,
      iconPosition = "left",
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    const isDisabled = disabled || loading;
    const displayVariant = loading ? "success" : variant;

    // Si asChild est utilisé, on passe directement les enfants sans modification
    if (asChild) {
      return (
        <Comp
          className={cn(
            reboulButtonVariants({
              variant: displayVariant,
              size,
              fullWidth,
              uppercase,
              className,
            }),
          )}
          ref={ref}
          disabled={isDisabled}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    // Logique normale pour les boutons non-asChild
    return (
      <Comp
        className={cn(
          reboulButtonVariants({
            variant: displayVariant,
            size,
            fullWidth,
            uppercase,
            className,
          }),
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {loadingText && (
              <span className="hidden sm:inline">{loadingText}</span>
            )}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && icon}
            {children}
            {icon && iconPosition === "right" && icon}
          </>
        )}

        {/* Effet de gradient pour le variant outline */}
        {variant === "outline" && !asChild && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out gpu-optimized" />
        )}
      </Comp>
    );
  },
);

ReboulButton.displayName = "ReboulButton";

export { ReboulButton, reboulButtonVariants };
