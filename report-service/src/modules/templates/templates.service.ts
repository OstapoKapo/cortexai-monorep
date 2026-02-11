import { Injectable } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { CreateTemplateDto } from 'src/common/dto/reports.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly prismaService: PrismaService,
  ) {}

  async createTemplate(
    userId: string,
    file: Express.Multer.File,
    dto: CreateTemplateDto,
  ): Promise<{ url: string }> {
    const fileExt = path.extname(file.originalname);
    const uniqueId = uuid();
    const s3Key = `templates/${userId}/${uniqueId}${fileExt}`;

    const uploadResult = await this.s3Service.uploadFile(
      s3Key,
      file.buffer,
      file.mimetype,
    );

    try {
      await this.prismaService.template.create({
        data: {
          name: dto.name,
          description: dto.description,
          storageKey: s3Key,
          originalFileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          userId: userId,
          fileUrl: uploadResult,
        },
      });
      return { url: uploadResult };
    } catch (error) {
      await this.s3Service.deleteFile(s3Key);
      throw error;
    }
  }
}
