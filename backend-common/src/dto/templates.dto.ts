import { ApiProperty } from '@nestjs/swagger';
import { createZodDto, ZodDto } from 'nestjs-zod';
import { UploadTemplateSchema } from '@cortex/shared/schemas/reports.schema';
import type { UploadTemplateResponse, GetTemplatesResponse, DeleteTemplateResponse, DownloadTemplateResponse } from '@cortex/shared/types/template-responses';
import type { Template } from '@cortex/shared/types/template';

// --- CreateTemplateDto ---
const CreateTemplateZodDto: ZodDto<typeof UploadTemplateSchema> = createZodDto(UploadTemplateSchema);
export class CreateTemplateDto extends CreateTemplateZodDto {}

// --- Response DTOs ---
export class UploadTemplateResponseDto implements UploadTemplateResponse {
  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/file.pdf' })
  url: string;

  @ApiProperty({ example: 'Report template created successfully.' })
  message: string;
}

export class GetTemplatesResponseDto implements GetTemplatesResponse {
  @ApiProperty({ example: 'Report templates retrieved successfully.' })
  message: string;

  @ApiProperty({
    example: [
      {
        id: 'template-id-123',
        name: 'Monthly Report Template',
        description: 'Template for monthly sales reports',
        fileUrl: 'https://s3.amazonaws.com/bucket/template.pdf',
        originalFileName: 'template.pdf',
        mimeType: 'application/pdf',
        size: 102400,
        userId: 'user-id-456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  })
  templates: Template[];
}

export class DeleteTemplateResponseDto implements DeleteTemplateResponse {
  @ApiProperty({ example: 'Report template deleted successfully.' })
  message: string;
}

export class DownloadTemplateResponseDto implements DownloadTemplateResponse {
  @ApiProperty({ example: 'https://s3.amazonaws.com/bucket/template.pdf' })
  url: string;

  @ApiProperty({ example: 'Report template download URL retrieved successfully.' })
  message: string;
}
