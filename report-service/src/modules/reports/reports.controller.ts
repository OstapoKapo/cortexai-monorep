import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { S3Service } from '../s3/s3.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateTemplateDto } from 'src/common/dto/reports.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('template')
  @ApiOperation({ summary: 'Create a new report template' })
  @ApiResponse({
    status: 201,
    description: 'Report template created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @UseInterceptors(FileInterceptor('file'))
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
  @UsePipes(ZodValidationPipe)
  async addTemplate(
    @Body() dto: CreateTemplateDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: '.(docx|pdf)' })
        .addMaxSizeValidator({ maxSize: 4 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    const fileUrl = await this.s3Service.uploadFile(
      file.originalname,
      file.buffer,
      file.mimetype,
    );
    return { message: 'Report template created successfully', fileUrl };
  }

  @Get()
  async getReports() {
    // Логіка для отримання звітів
  }
}
