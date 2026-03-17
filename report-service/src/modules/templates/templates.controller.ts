import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
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
import { CreateTemplateDto } from 'src/common/dto/reports.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  DeleteTemplateResponseDto,
  DownloadTemplateResponseDto,
  GetTemplatesResponseDto,
  InternalAuthGuard,
  UploadTemplateResponseDto,
  UserId,
} from '@cortex/backend-common';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @UseGuards(InternalAuthGuard)
  @Post('template')
  @ApiOperation({ summary: 'Create a new report template' })
  @ApiResponse({
    status: 201,
    description: 'Report template created successfully.',
    type: UploadTemplateResponseDto,
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
    // TODO: For MVP only basic file validation (type/size). Consider adding mime-type/content checks post-MVP.
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: '.(docx|pdf)' })
        .addMaxSizeValidator({ maxSize: 4 * 1024 * 1024 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    @UserId()
    userId: string,
    file: Express.Multer.File,
  ): Promise<UploadTemplateResponseDto> {
    const result = await this.templatesService.createTemplate(
      userId,
      file,
      dto,
    );
    return { url: result.url, message: 'Template created successfully' };
  }

  @Get()
  @UseGuards(InternalAuthGuard)
  @ApiResponse({
    status: 200,
    type: GetTemplatesResponseDto,
    description: 'List of report templates retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @HttpCode(HttpStatus.OK)
  async getTemplates(
    @UserId() userId: string,
  ): Promise<GetTemplatesResponseDto> {
    const templates = await this.templatesService.getTemplatesForUser(userId);
    return { message: 'Report templates retrieved successfully.', templates };
  }

  @Delete(':id')
  @UseGuards(InternalAuthGuard)
  @ApiOperation({ summary: 'Delete a report template' })
  @ApiResponse({
    status: 200,
    description: 'Report template deleted successfully.',
    type: DeleteTemplateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Template not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async deleteTemplate(
    @UserId() userId: string,
    @Param('id') templateId: string,
  ): Promise<{ message: string }> {
    await this.templatesService.deleteTemplate(templateId, userId);
    return { message: 'Report template deleted successfully.' };
  }

  @Get(':id/download')
  @UseGuards(InternalAuthGuard)
  @ApiOperation({ summary: 'Download a report template' })
  @ApiResponse({
    status: 200,
    description: 'Report template download URL retrieved successfully.',
    type: DownloadTemplateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Template not found.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async downloadTemplate(
    @UserId() userId: string,
    @Param('id') templateId: string,
  ): Promise<DownloadTemplateResponseDto> {
    const { url } = await this.templatesService.getTemplateDownloadUrlById(
      templateId,
      userId,
    );
    return {
      url,
      message: 'Report template download URL retrieved successfully.',
    };
  }
}
