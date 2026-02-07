import { Controller, Get, Post } from '@nestjs/common';

@Controller('reports')
export class ReportsController {
  constructor() {}

  @Post()
  async createReport() {}

  @Get()
  async getReports() {
    // Логіка для отримання звітів
  }
}
