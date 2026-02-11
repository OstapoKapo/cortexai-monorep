import { Controller, Get } from '@nestjs/common';

@Controller('reports')
export class ReportsController {
  constructor() {}

  @Get()
  async getReports() {
    // Логіка для отримання звітів
  }
}
