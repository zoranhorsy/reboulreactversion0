import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns/format'
import { fr } from 'date-fns/locale'
import type { Order } from '@/lib/api'

export const generateInvoicePDF = (order: Order) => {
  const doc = new jsPDF()

  // En-tête
  doc.setFontSize(20)
  doc.text('REBOUL', 20, 20)
  
  doc.setFontSize(12)
  doc.text('Facture', 20, 30)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`N° ${order.id}`, 20, 35)
  doc.text(`Date: ${format(new Date(order.created_at), 'd MMMM yyyy', { locale: fr })}`, 20, 40)

  // Informations client
  doc.setFontSize(11)
  doc.text('Adresse de livraison:', 20, 55)
  if (order.shipping_address) {
    doc.setFontSize(10)
    doc.text([
      order.shipping_address.street,
      `${order.shipping_address.postal_code} ${order.shipping_address.city}`,
      order.shipping_address.country
    ], 20, 62)
  }

  // Informations commande
  doc.setFontSize(11)
  doc.text('Détails de la commande:', 20, 85)

  // Tableau des articles
  const tableData = order.items?.map(item => [
    item.product_name,
    item.quantity.toString(),
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(item.price),
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(item.price * item.quantity)
  ]) || []

  autoTable(doc, {
    startY: 90,
    head: [['Article', 'Quantité', 'Prix unitaire', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [51, 51, 51],
      textColor: [255, 255, 255],
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    }
  })

  // Calcul de la position Y après le tableau
  const finalY = (doc as any).lastAutoTable.finalY || 150

  // Totaux
  const subTotal = order.total_amount * 0.8
  const tva = order.total_amount * 0.2
  const total = order.total_amount

  doc.setFontSize(10)
  doc.text('Sous-total:', 130, finalY + 10)
  doc.text(new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(subTotal), 170, finalY + 10, { align: 'right' })

  doc.text('TVA (20%):', 130, finalY + 15)
  doc.text(new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(tva), 170, finalY + 15, { align: 'right' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Total:', 130, finalY + 25)
  doc.text(new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(total), 170, finalY + 25, { align: 'right' })

  // Pied de page
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const footerText = [
    'REBOUL - Société par actions simplifiée',
    'Capital social : 100 000€ - RCS Paris B 123 456 789',
    'TVA Intracommunautaire : FR 12 345 678 901',
    'Siège social : 123 Avenue de la Mode, 75001 Paris'
  ]
  doc.text(footerText, doc.internal.pageSize.width / 2, 280, { align: 'center' })

  // Génération du nom de fichier
  const fileName = `facture_${order.id}_${format(new Date(order.created_at), 'yyyy-MM-dd')}.pdf`

  // Retourner le document et le nom de fichier
  return {
    doc,
    fileName
  }
} 