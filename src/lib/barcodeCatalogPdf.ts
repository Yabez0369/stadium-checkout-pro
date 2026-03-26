import { jsPDF } from 'jspdf';
import JsBarcode from 'jsbarcode';

import { PRODUCTS } from '@/data/posProducts';

export function downloadBarcodeCatalogPdf(): void {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const maxBarcodeW = pageW - 2 * margin - 4;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Stadium Store — barcode labels', margin, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'EAN-13 retail barcodes. Scan with your phone or scanner; the POS matches these digits exactly.',
    margin,
    y,
    { maxWidth: pageW - 2 * margin }
  );
  y += 12;
  doc.setTextColor(0, 0, 0);

  const canvas = document.createElement('canvas');
  const rowGap = 6;
  const textW = pageW - 2 * margin;

  for (const p of PRODUCTS) {
    try {
      JsBarcode(canvas, p.barcode, {
        format: 'EAN13',
        width: 2,
        height: 56,
        displayValue: true,
        fontSize: 11,
        textMargin: 2,
        margin: 6,
        background: '#ffffff',
        lineColor: '#000000',
      });
    } catch {
      JsBarcode(canvas, p.barcode, {
        format: 'CODE128',
        width: 2,
        height: 56,
        displayValue: true,
        fontSize: 11,
        textMargin: 2,
        margin: 6,
        background: '#ffffff',
        lineColor: '#000000',
      });
    }

    const imgData = canvas.toDataURL('image/png');
    const props = doc.getImageProperties(imgData);
    const imgW = Math.min(maxBarcodeW, 100);
    const imgH = (props.height * imgW) / props.width;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    const nameLines = doc.splitTextToSize(p.name, textW);
    const nameBlockH = nameLines.length * 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const skuLineH = 4;

    const footerLines = 1 + (p.variants?.length ? 1 : 0);
    const footerH = footerLines * 4 + 2;
    const blockH = 6 + nameBlockH + skuLineH + 4 + imgH + footerH;

    if (y + blockH > pageH - margin) {
      doc.addPage();
      y = margin;
    }

    let cursorY = y + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(nameLines, margin, cursorY);
    cursorY += nameBlockH + 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`SKU ${p.sku}`, margin, cursorY);
    cursorY += skuLineH + 4;

    doc.addImage(imgData, 'PNG', margin, cursorY, imgW, imgH);
    cursorY += imgH + 4;

    doc.text(`Barcode: ${p.barcode}`, margin, cursorY);
    cursorY += 4;

    if (p.variants?.length) {
      doc.setTextColor(90, 90, 90);
      doc.text('Sizes: scan opens size picker on POS.', margin, cursorY);
      doc.setTextColor(0, 0, 0);
      cursorY += 4;
    }

    y = cursorY + rowGap;
  }

  const date = new Date().toISOString().slice(0, 10);
  doc.save(`stadium-store-barcodes-${date}.pdf`);
}
