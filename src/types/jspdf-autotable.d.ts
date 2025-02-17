import type { jsPDF as JsPDFType } from "jspdf"

declare module "jspdf" {
  interface jsPDF extends JsPDFType {
    autoTable: (options: AutoTableOptions) => jsPDF
  }
}

interface AutoTableOptions {
  head?: string[][]
  body?: string[][]
  foot?: string[][]
  startY?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  pageBreak?: "auto" | "avoid" | "always"
  rowPageBreak?: "auto" | "avoid"
  tableWidth?: "auto" | "wrap" | number
  showHead?: "everyPage" | "firstPage" | "never"
  showFoot?: "everyPage" | "lastPage" | "never"
  tableLineWidth?: number
  tableLineColor?: string
  fontSize?: number
  cellPadding?: number
  cellWidth?: "auto" | "wrap" | number
  cellHeight?: number | "auto"
  headerStyles?: Partial<CellStyle>
  bodyStyles?: Partial<CellStyle>
  footStyles?: Partial<CellStyle>
  alternateRowStyles?: Partial<CellStyle>
  columnStyles?: { [key: string]: Partial<CellStyle> }
}

interface CellStyle {
  fillColor?: string
  textColor?: string
  fontStyle?: "normal" | "bold" | "italic" | "bolditalic"
  fontSize?: number
  cellPadding?: number
  lineColor?: string
  lineWidth?: number
  font?: string
  halign?: "left" | "center" | "right"
  valign?: "top" | "middle" | "bottom"
}

