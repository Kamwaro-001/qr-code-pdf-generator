import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as sharp from 'sharp';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class QrPdfService {
  async generateQrPdf(links: { url: string; id: string }[]): Promise<Buffer> {
    const pageHeight = 198.72;
    const pageWidth = 169.92;
    const doc = new PDFDocument({ size: [pageWidth, pageHeight], margin: 0 });
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      console.log('PDF generation completed');
    });

    try {
      for (const linkObj of links) {
        const { url, id } = linkObj;
        console.log('Generating QR code for link:', url);

        // Generate a larger QR code
        const qrCodeDataUrl = await QRCode.toDataURL(url, {
          // width: 1000,
          width: 332,
          margin: 1,
          errorCorrectionLevel: 'H',
        });
        console.log('Generated QR code data URL:', qrCodeDataUrl);

        // Load the QR code and logo images
        const qrCodeImageBuffer = Buffer.from(
          qrCodeDataUrl.split(',')[1],
          'base64',
        );
        const logoBuffer = await sharp(
          '/home/job/setup/nest-quick/src/images/camusat_logo_bg.png',
        )
          .resize({ width: 67 })
          .toBuffer();

        // Get metadata of QR code image
        const qrCodeMetadata = await sharp(qrCodeImageBuffer).metadata();

        // Resize the logo to fit within the QR code
        const logoSize =
          Math.min(qrCodeMetadata.width, qrCodeMetadata.height) / 4; // Increased logo size ratio
        const resizedLogoBuffer = await sharp(logoBuffer)
          .resize(logoSize, logoSize, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toBuffer();

        // Composite the logo onto the QR code
        const qrCodeWithLogoBuffer = await sharp(qrCodeImageBuffer)
          .composite([
            {
              input: resizedLogoBuffer,
              gravity: 'center',
            },
          ])
          .png()
          .toBuffer();

        const qrCodeWithLogoDataUrl = `data:image/png;base64,${qrCodeWithLogoBuffer.toString('base64')}`;

        const borderRadius = 5; // Adjust this for more or less rounding
        const borderWidth = 1.5; // Thickness of the border
        const borderInset = 0.5; // Space between the border and the page edges

        // Set the border color and line width
        doc.lineWidth(borderWidth);
        doc.strokeColor('black');

        // Draw the rounded border rectangle
        doc
          .roundedRect(
            borderInset, // X position (inset from the left)
            borderInset, // Y position (inset from the top)
            pageWidth - 2 * borderInset, // Width of the rectangle
            pageHeight - 2 * borderInset, // Height of the rectangle
            borderRadius, // Border corner radius
          )
          .stroke();

        // Add the QR code with logo to the PDF
        const qrCodeWidth = 158.4;
        const qrCodeHeight = 158.4;
        const xPosition = (pageWidth - qrCodeWidth) / 2;
        const yPosition = 10;

        doc.image(qrCodeWithLogoDataUrl, xPosition, yPosition, {
          fit: [qrCodeWidth, qrCodeHeight],
          align: 'center',
        });

        // Add the ID text to bottom center of the page
        const text = id;
        const fontSize = 16;
        doc.fontSize(fontSize);
        const textWidth = doc.widthOfString(text);
        const textXPosition = (pageWidth - textWidth) / 2;
        const textYPosition = pageHeight - (pageHeight - qrCodeHeight) / 2 - 3;

        doc.text(text, textXPosition, textYPosition, {
          continued: false,
        });

        if (linkObj !== links[links.length - 1]) {
          doc.addPage();
        }
      }
    } catch (error) {
      console.error('Error generating QR code or adding to PDF:', error);
      throw new Error('Failed to generate QR code PDF');
    }

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', (error) => {
        console.error('Error generating PDF:', error);
        reject(new Error('Failed to generate PDF'));
      });
    });
  }
}
