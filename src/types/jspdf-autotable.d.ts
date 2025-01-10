import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      head?: any[][];
      body: any[][];
      margin?: { top: number; right: number; bottom: number; left: number };
      startY?: number;
      theme?: 'striped' | 'grid' | 'plain';
      styles?: any;
      headStyles?: any;
      bodyStyles?: any;
      alternateRowStyles?: any;
      columnStyles?: any;
      didDrawCell?: (data: any) => void;
      didParseCell?: (data: any) => void;
      didDrawPage?: (data: any) => void;
    }) => jsPDF;
  }
}

