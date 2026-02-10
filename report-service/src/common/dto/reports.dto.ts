import { createZodDto, ZodDto } from 'nestjs-zod';
import { UploadTemplateSchema } from '@cortex/shared';

const CreateTemplateZodDto: ZodDto<typeof UploadTemplateSchema> =
  createZodDto(UploadTemplateSchema);
export class CreateTemplateDto extends CreateTemplateZodDto {}
