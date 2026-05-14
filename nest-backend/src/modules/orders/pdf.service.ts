import { Injectable } from '@nestjs/common';
const PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
  async generateOrderInvoice(order: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Header
        doc.fillColor('#444444').fontSize(20).text('FACTURE', 50, 50);
        doc.fontSize(10).text(`Facture #: ${order._id.toString().slice(-6).toUpperCase()}`, 200, 50, { align: 'right' });
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 200, 65, { align: 'right' });
        doc.text(`Statut: ${order.status.toUpperCase()}`, 200, 80, { align: 'right' });

        doc.moveDown();
        doc.moveTo(50, 100).lineTo(550, 100).stroke();

        // Customer Info (safe defaults)
        const ship = order.shippingAddress || {};
        const shipName = ship.name || order.customerName || 'Client';
        const shipStreet = ship.street || ship.address || '—';
        const shipCity = ship.city || '—';
        const shipZip = ship.zipCode || ship.postalCode || '—';
        const shipPhone = ship.phone || '—';

        doc.fontSize(12).text('Facturé à:', 50, 120, { underline: true });
        doc.fontSize(10).text(String(shipName), 50, 140);
        doc.text(String(shipStreet), 50, 155);
        doc.text(`${String(shipCity)}, ${String(shipZip)}`, 50, 170);
        doc.text(`Tél: ${String(shipPhone)}`, 50, 185);

        // Table Header
        const tableTop = 230;
        doc.fontSize(10).text('Article', 50, tableTop, { bold: true });
        doc.text('Prix Unit.', 280, tableTop, { width: 90, align: 'right' });
        doc.text('Qté', 370, tableTop, { width: 90, align: 'right' });
        doc.text('Total', 460, tableTop, { width: 90, align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Items
        let rowY = tableTop + 30;
        order.items.forEach((item) => {
          doc.text(item.name, 50, rowY, { width: 200 });
          doc.text(`${item.price} €`, 280, rowY, { width: 90, align: 'right' });
          doc.text(item.quantity.toString(), 370, rowY, { width: 90, align: 'right' });
          doc.text(`${(item.price * item.quantity).toFixed(2)} €`, 460, rowY, { width: 90, align: 'right' });
          rowY += 20;
        });

        // Summary
        doc.moveTo(50, rowY + 10).lineTo(550, rowY + 10).stroke();
        rowY += 25;
        doc.fontSize(12).text('TOTAL:', 370, rowY, { bold: true });
        doc.text(`${order.totalPrice.toFixed(2)} €`, 460, rowY, { width: 90, align: 'right', bold: true });

        // Footer
        doc.fontSize(10).fillColor('#888888').text('Merci de votre confiance !', 50, 750, { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
