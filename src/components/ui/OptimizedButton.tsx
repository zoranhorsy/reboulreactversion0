import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  animateHover?: boolean;
  animateClick?: boolean;
}

/**
 * Bouton optimisé qui utilise uniquement Tailwind CSS et nos animations CSS
 * Remplace les versions Chakra UI et styled-components
 */
const OptimizedButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      disabled,
      loading = false,
      fullWidth = false,
      animateHover = false,
      animateClick = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Mappings de style basés sur variant et size
    const variantStyles = {
      primary: 'bg-primary text-white hover:bg-primary/90',
      secondary: 'bg-secondary text-white hover:bg-secondary/90',
      outline: 'border border-primary text-primary hover:bg-primary/10',
      ghost: 'bg-transparent text-primary hover:bg-primary/10',
      link: 'bg-transparent text-primary underline-offset-4 hover:underline'
    };

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 rounded',
      md: 'text-sm px-4 py-2 rounded-md',
      lg: 'text-base px-5 py-2.5 rounded-lg'
    };

    // Animations
    const hoverAnimation = animateHover ? 'transition-transform hover:scale-105' : '';
    const clickAnimation = animateClick ? 'active:scale-95' : '';
    
    // État disabled/loading
    const isDisabled = disabled || loading;
    const disabledStyles = isDisabled ? 'opacity-60 cursor-not-allowed' : '';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          variantStyles[variant],
          sizeStyles[size],
          hoverAnimation,
          clickAnimation,
          disabledStyles,
          widthStyles,
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-rotate mx-2"></div>
            <span className="ml-2">{children}</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

OptimizedButton.displayName = 'OptimizedButton';

export default OptimizedButton; 