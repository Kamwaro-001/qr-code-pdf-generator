import { Module } from '@nestjs/common';
import { PoleQrPdfController } from './qrpdf.controller';
import { PoleQrPdfService } from './qrpdf.service';

@Module({
  controllers: [PoleQrPdfController],
  providers: [PoleQrPdfService],
})
export class AppModule {}
