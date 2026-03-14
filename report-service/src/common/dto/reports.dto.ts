import { createZodDto, ZodDto } from 'nestjs-zod';
import { UploadTemplateSchema } from '@cortex/shared';
import { ApiProperty } from '@nestjs/swagger';

const CreateTemplateZodDto: ZodDto<typeof UploadTemplateSchema> =
  createZodDto(UploadTemplateSchema);
export class CreateTemplateDto extends CreateTemplateZodDto {}

export class UploadResponseDto {
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
