import { z } from 'zod';

export const UploadTemplateSchema = z.object({
  name: z
    .string()
    .describe('Назва темплейту (напр. Лабораторна №1)'),
  description: z
    .string()
    .optional()
    .describe('Опис темплейту (напр. Лабораторна №1)'),
});

export type UploadTemplateDto = z.infer<typeof UploadTemplateSchema>;
