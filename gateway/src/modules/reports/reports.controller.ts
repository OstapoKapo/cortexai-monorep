import { HttpService } from '@nestjs/axios';
import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
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
import { Readable } from 'stream'; // 👈 1. Імпортуємо тип Stream

@Controller('reports')
export class ReportsController {
  private readonly reportsUrl: string | undefined;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.reportsUrl = this.configService.get<string>('REPORTS_SERVICE_URL');
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      response.data.pipe(res);
    } catch (err) {
      const error = err as AxiosError<any>;

      if (error.response) {
        const responseData = error.response.data as unknown;

        if (responseData instanceof Readable) {
          const errorBuffer: Buffer[] = [];

          for await (const chunk of responseData) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            errorBuffer.push(Buffer.from(chunk));
          }
          const errorString = Buffer.concat(errorBuffer).toString('utf8');
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const errorJson = JSON.parse(errorString);
            console.error('🔴 ПОМИЛКА ВІД СЕРВІСУ (JSON):', errorJson);

            res.status(error.response.status).json(errorJson);
          } catch {
            console.error('🔴 ПОМИЛКА ВІД СЕРВІСУ (TEXT):', errorString);

            res.status(error.response.status).send(errorString);
          }
          return;
        }

        console.error('🔴 ПОМИЛКА ВІД СЕРВІСУ:', error.response.data);

        res.status(error.response.status).json(error.response.data);
      } else {
        console.error('🔴 КРИТИЧНА ПОМИЛКА ГЕЙТВЕЯ:', error.message);
        res.status(500).json({ message: error.message });
      }
    }
  }
}
