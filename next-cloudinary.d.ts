declare module 'next-cloudinary' {
  import { FC, ReactNode } from 'react';

  export interface CldImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    sizes?: string;
    className?: string;
    priority?: boolean;
    fill?: boolean;
    quality?: number;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    onLoad?: () => void;
    onError?: () => void;
    style?: React.CSSProperties;
    onClick?: () => void;
    [key: string]: any;
  }

  export const CldImage: FC<CldImageProps>;
} 