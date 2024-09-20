import { Body, Controller, Post } from '@nestjs/common';
import { Readable } from 'stream';
import { QrPdfService } from './qrpdf.service';
import { StreamableFile } from '@nestjs/common';

@Controller('fatqrpdf')
export class QrPdfController {
  constructor(private qrPdfService: QrPdfService) {}

  @Post('generate')
  async generateQrPdf(
    @Body() body: { links: { url: string; id: string }[] },
  ): Promise<StreamableFile> {
    const pdfBuffer = await this.qrPdfService.generateQrPdf(body.links);
    const stream = new Readable();
    stream.push(pdfBuffer);
    stream.push(null);

    return new StreamableFile(stream);
  }
}
