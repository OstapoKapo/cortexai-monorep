import { HttpService } from '@nestjs/axios';
import { Controller } from '@nestjs/common';
import { ProxyService } from '../../common/services/proxy.service';
import { ConfigService } from '@nestjs/config';

@Controller('reports')
export class ReportsController {
  private readonly reportsUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly proxyService: ProxyService,
  ) {
    this.reportsUrl =
      this.configService.get<string>('REPORTS_SERVICE_URL') ??
      'http://localhost:3003';
  }
}
