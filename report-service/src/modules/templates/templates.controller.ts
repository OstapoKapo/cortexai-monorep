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
import { TemplatesService } from './templates.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  CreateTemplateDto,
  UploadResponseDto,
} from 'src/common/dto/reports.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post('template')
  @ApiOperation({ summary: 'Create a new report template' })
  @ApiResponse({
    status: 201,
    description: 'Report template created successfully.',
    type: UploadResponseDto,
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
  async createTemplate(
    @Body() dto: CreateTemplateDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: '.(docx|pdf)' })
        .addMaxSizeValidator({ maxSize: 4 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const userId = 'some-user-id'; // Replace with actual user I

    const result = await this.templatesService.createTemplate(
      userId,
      file,
      dto,
    );
    return { url: result.url, message: 'Template created successfully' };
  }

  @Get()
  async getTemplates() {
    // Логіка для отримання шаблонів
  }
}
