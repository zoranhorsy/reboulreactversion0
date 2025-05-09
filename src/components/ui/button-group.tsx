import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps {
  variant?: 'solid' | 'outline' | 'ghost'
  [key: string]: any
}

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: number
  children: React.ReactNode
  direction?: 'row' | 'column'
  isAttached?: boolean
  variant?: 'solid' | 'outline' | 'ghost'
}

/**
 * ButtonGroup - Composant pour grouper les boutons
 * Remplacement du ButtonGroup de Chakra UI
 */
export function ButtonGroup({
  spacing = 4,
  className,
  children,
  direction = 'row',
  isAttached = false,
  variant,
  ...props
}: ButtonGroupProps) {
  // Convertir l'espacement Chakra en taille Tailwind
  const gap = `gap-${spacing}`;
  
  // Appliquer la direction (row ou column)
  const flexDirection = direction === 'column' ? 'flex-col' : 'flex-row';
  
  // Gérer les boutons attachés (sans espace entre eux)
  const attachedStyles = isAttached 
    ? 'divide-x divide-gray-200 dark:divide-gray-700 [&>*:first-child]:rounded-r-none [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:last-child]:rounded-l-none'
    : gap;
  
  return (
    <div 
      className={cn(
        'flex',
        flexDirection,
        !isAttached && gap,
        isAttached && attachedStyles,
        className
      )}
      {...props}
    >
      {/* 
        Si un variant est spécifié, nous l'appliquons à tous les enfants
        Note: Ceci nécessite de cloner les éléments React pour ajouter la prop
      */}
      {variant
        ? React.Children.map(children, (child) => {
            if (React.isValidElement<ButtonProps>(child)) {
              return React.cloneElement(child, {
                variant: child.props.variant || variant,
              });
            }
            return child;
          })
        : children}
    </div>
  )
} 