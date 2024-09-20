import { Module } from '@nestjs/common';
import { QrPdfController } from './qrpdf.controller';
import { QrPdfService } from './qrpdf.service';

@Module({
  controllers: [QrPdfController],
  providers: [QrPdfService],
})
export class AppModule {}
