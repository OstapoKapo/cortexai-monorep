import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ProxyService } from '../../common/services/proxy.service';
import { ConfigService } from '@nestjs/config';
import { AtGuard } from 'src/common/guards/at.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { AuthenticatedRequest } from 'src/common/services/proxy.service';
import {
  UploadTemplateResponseDto,
  GetTemplatesResponseDto,
  DeleteTemplateResponseDto,
  DownloadTemplateResponseDto,
} from '@cortex/backend-common';

@Controller('templates')
export class TemplatesController {
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

  @Get()
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @ApiResponse({
    status: 200,
    description: 'List of report templates retrieved successfully.',
    type: GetTemplatesResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async getTemplates(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<void> {
    await this.proxyService.forwardRequest(
      req,
      res,
      (headers) =>
        this.httpService.axiosRef({
          method: 'GET',
          url: `${this.reportsUrl}/templates`,
          headers,
        }),
      {
        forwardSetCookie: false,
        forwardUserId: true,
      },
    );
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
        file: { type: 'string', format: 'binary' },
        description: { type: 'string' },
        name: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Report template created successfully.',
    type: UploadTemplateResponseDto,
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

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @ApiResponse({
    status: 200,
    description: 'Report template deleted successfully.',
    type: DeleteTemplateResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Template not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async deleteTemplate(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<void> {
    await this.proxyService.forwardRequest(
      req,
      res,
      (headers) =>
        this.httpService.axiosRef({
          method: 'DELETE',
          url: `${this.reportsUrl}/templates/${id}`,
          headers,
        }),
      {
        forwardSetCookie: false,
        forwardUserId: true,
      },
    );
  }

  @Get(':id/download')
  @ApiBearerAuth()
  @UseGuards(AtGuard)
  @ApiResponse({
    status: 200,
    description: 'Report template download URL retrieved successfully.',
    type: DownloadTemplateResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Template not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async downloadTemplate(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Param('id') id: string,
  ): Promise<void> {
    await this.proxyService.forwardRequest(
      req,
      res,
      (headers) =>
        this.httpService.axiosRef({
          method: 'GET',
          url: `${this.reportsUrl}/templates/${id}/download`,
          headers,
        }),
      {
        forwardSetCookie: false,
        forwardUserId: true,
      },
    );
  }
}
