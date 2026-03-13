import { HttpService } from '@nestjs/axios';
import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ProxyService } from '../../common/services/proxy.service';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { UploadResponseDto } from 'src/common/dto/reports.dto';
import { AtGuard } from 'src/common/guards/at.guard';
import type { AuthenticatedRequest } from 'src/common/services/proxy.service';

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

  @Post('template')
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        description: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Report template created successfully.',
    type: UploadResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async createReportTemplate(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxyService.forwardRequest(
      req,
      res,
      (headers) =>
        this.httpService.axiosRef({
          method: 'POST',
          url: `${this.reportsUrl}/templates/template`,
          data: req,
          responseType: 'stream',
          headers,
        }),
      {
        forwardSetCookie: false,
        forwardUserId: true,
      },
    );
  }
}
