import { Module } from '@nestjs/common';
import { S3Module } from '../s3/s3.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [S3Module],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
