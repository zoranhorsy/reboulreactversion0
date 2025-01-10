declare module 'react-csv' {
  import { ComponentType } from 'react';

  export interface CSVData {
    [key: string]: string | number | boolean | null;
  }

  export interface CSVProps {
    data: CSVData[];
    headers?: Array<{ label: string; key: string }>;
    filename?: string;
    separator?: string;
    target?: string;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
  }

  export const CSVLink: ComponentType<CSVProps>;
  export const CSVDownload: ComponentType<CSVProps>;
}
