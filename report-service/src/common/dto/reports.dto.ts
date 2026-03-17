import { createZodDto, ZodDto } from 'nestjs-zod';
import { UploadTemplateSchema } from '@cortex/shared';
import type { Template } from '@cortex/shared';
import { ApiProperty } from '@nestjs/swagger';

const CreateTemplateZodDto: ZodDto<typeof UploadTemplateSchema> =
  createZodDto(UploadTemplateSchema);
export class CreateTemplateDto extends CreateTemplateZodDto {}

export class UploadTemplateResponseDto {
  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/file.pdf',
    description: 'S3 URL, where the uploaded report template can be accessed',
  })
  url: string;

  @ApiProperty({
    example: 'Report template created successfully.',
    description:
      'Message indicating successful creation of the report template',
  })
  message: string;
}

export class GetTemplatesResponseDto {
  @ApiProperty({
    example: 'Report templates retrieved successfully.',
    description: 'Message indicating successful retrieval of report templates',
  })
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
    description: 'List of report templates belonging to the user',
  })
  templates: Template[];
}

export class DeleteTemplateResponseDto {
  @ApiProperty({
    example: 'Report template deleted successfully.',
    description:
      'Message indicating successful deletion of the report template',
  })
  message: string;
}

export class DownloadTemplateResponseDto {
  @ApiProperty({
    example: {
      url: 'https://s3.amazonaws.com/bucket/template.pdf',
    },
    description:
      'S3 URL, where the requested report template can be downloaded',
  })
  url: string;
  @ApiProperty({
    example: 'Report template download URL retrieved successfully.',
    description:
      'Message indicating successful retrieval of the report template download URL',
  })
  message: string;
}
