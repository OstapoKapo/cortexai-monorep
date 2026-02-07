import { Module } from '@nestjs/common';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [ReportsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
