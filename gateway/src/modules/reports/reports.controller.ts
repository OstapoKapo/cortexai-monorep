import { HttpService } from '@nestjs/axios';
import { Controller, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UploadResponseDto } from 'src/common/dto/reports.dto';
import { AtGuard } from 'src/common/guards/at.guard';
import { AxiosError } from 'axios';
import { Readable } from 'stream';

const MAX_ERROR_BODY_SIZE = 1024 * 1024; // 1MB limit for error responses

@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);
  private readonly reportsUrl: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async createReportTemplate(
    @Req() req: Request & { user: { userId: string; email: string } },
    @Res() res: Response,
  ): Promise<void> {
    const userId = req.user.userId;

    const headers: Record<string, any> = { ...req.headers };

    delete headers['content-length'];
    delete headers['host'];
    delete headers['connection'];
    delete headers['transfer-encoding'];
    headers['X-User-Id'] = userId;

    try {
      const response = await this.httpService.axiosRef({
        method: 'POST',
        url: `${this.reportsUrl}/templates/template`,
        data: req,
        responseType: 'stream',
        headers: headers,
      });

      res.status(response.status);

      Object.keys(response.headers).forEach((key) => {
        res.setHeader(key, response.headers[key]);
      });

      (response.data as Readable).pipe(res);
    } catch (err) {
      const error = err as AxiosError<unknown>;

      if (error.response) {
        const responseData = error.response.data;

        if (responseData instanceof Readable) {
          const errorBuffer: Buffer[] = [];
          let totalSize = 0;

          for await (const chunk of responseData) {
            const buffer = Buffer.from(chunk as ArrayBuffer);
            totalSize += buffer.length;

            if (totalSize > MAX_ERROR_BODY_SIZE) {
              responseData.destroy();
              res.status(502).json({
                message: 'Error response from service exceeded size limit',
              });
              return;
            }

            errorBuffer.push(buffer);
          }
          const errorString = Buffer.concat(errorBuffer).toString('utf8');
          try {
            const errorJson: unknown = JSON.parse(errorString);
            this.logger.error('Service error (JSON):', errorJson);

            res.status(error.response.status).json(errorJson);
          } catch {
            this.logger.error('Service error (TEXT):', errorString);

            res.status(error.response.status).send(errorString);
          }
          return;
        }

        this.logger.error('Service error:', error.response.data);

        res.status(error.response.status).json(error.response.data);
      } else {
        this.logger.error('Gateway critical error:', error.message);
        res.status(500).json({ message: error.message });
      }
    }
  }
}
