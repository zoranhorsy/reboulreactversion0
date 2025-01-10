import type { jsPDF } from 'jspdf';

interface CellDef {
  content: string | number;
  styles?: CellStyle;
}

interface CellStyle {
  font?: string;
  fontStyle?: string;
  fontSize?: number;
  textColor?: string | number[];
  fillColor?: string | number[];
  lineColor?: string | number[];
  lineWidth?: number;
  halign?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
}

interface AutoTableSettings {
  head?: (string | CellDef)[][];
  body: (string | CellDef)[][];
  margin?: { top: number; right: number; bottom: number; left: number };
  startY?: number;
  theme?: 'striped' | 'grid' | 'plain';
  styles?: CellStyle;
  headStyles?: CellStyle;
  bodyStyles?: CellStyle;
  alternateRowStyles?: CellStyle;
  columnStyles?: { [key: number]: CellStyle };
  didDrawCell?: (data: { table: object; cell: object; row: number; column: number; section: 'head' | 'body' | 'foot' }) => void;
  didParseCell?: (data: { table: object; cell: object; row: number; column: number; section: 'head' | 'body' | 'foot' }) => void;
  didDrawPage?: (data: { pageNumber: number; pageCount: number; table: object; cursor: { x: number; y: number } }) => void;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableSettings) => jsPDF;
  }
}

