import React from "react";

interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

// Icône X (fermer)
export const XIcon: React.FC<IconProps> = ({
  className = "h-4 w-4",
  size,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// Icône Loader2 (chargement)
export const Loader2Icon: React.FC<IconProps> = ({
  className = "h-4 w-4",
  size,
  strokeWidth = 2,
}) => (
  <svg
    className={`${className} animate-spin`}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.49 8.49l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.49-8.49l2.83-2.83"
    />
  </svg>
);

// Icône Search
export const SearchIcon: React.FC<IconProps> = ({
  className = "h-4 w-4",
  size,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

// Icône ChevronRight
export const ChevronRightIcon: React.FC<IconProps> = ({
  className = "h-4 w-4",
  size,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

// Icône ChevronLeft
export const ChevronLeftIcon: React.FC<IconProps> = ({
  className = "h-4 w-4",
  size,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

// Icône Heart
export const HeartIcon: React.FC<IconProps> = ({
  className = "h-4 w-4",
  size,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

// Icône ShoppingCart
export const ShoppingCartIcon: React.FC<IconProps> = ({
  className = "h-4 w-4",
  size,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
    />
  </svg>
);

// Icône Plus
export const PlusIcon: React.FC<IconProps> = ({
  className = "h-4 w-4",
  size,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

// Icône Minus
export const MinusIcon: React.FC<IconProps> = ({
  className = "h-4 w-4",
  size,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);

// Icône AlertCircle
export const AlertCircleIcon: React.FC<IconProps> = ({
  className = "h-4 w-4",
  size,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={strokeWidth}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L5.35 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);
