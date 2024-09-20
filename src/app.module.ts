import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QrPdfController } from './fatPdfs/qrpdf.controller';
import { QrPdfService } from './fatPdfs/qrpdf.service';
import { PoleQrPdfController } from './polePdfs/qrpdf.controller';
import { PoleQrPdfService } from './polePdfs/qrpdf.service';

@Module({
  imports: [],
  controllers: [AppController, QrPdfController, PoleQrPdfController],
  providers: [AppService, QrPdfService, PoleQrPdfService],
})
export class AppModule {}
