import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import { Template } from '@cortex/shared';
import { v4 as uuid } from 'uuid';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTemplateDto } from '@cortex/backend-common';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly prismaService: PrismaService,
  ) {}

  private buildS3Key(userId: string, originalName: string): string {
    const fileExt = path.extname(originalName);
    const uniqueId = uuid();
    return `templates/${userId}/${uniqueId}${fileExt}`;
  }

  async createTemplate(
    userId: string,
    file: Express.Multer.File,
    dto: CreateTemplateDto,
  ): Promise<{ url: string }> {
    const s3Key = this.buildS3Key(userId, file.originalname);
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
      this.logger.error(
        'Failed to create template in DB, rolling back S3 upload',
        error,
      );
      await this.s3Service.deleteFile(s3Key);
      throw error;
    }
  }

  async getTemplatesForUser(userId: string): Promise<Template[]> {
    return this.prismaService.template.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        fileUrl: true,
        originalFileName: true,
        mimeType: true,
        size: true,
        userId: true,
        updatedAt: true,
        createdAt: true,
      },
    });
  }

  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const template = await this.prismaService.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.userId !== userId) {
      throw new ForbiddenException('Unauthorized to delete this template');
    }

    await this.s3Service.deleteFile(template.storageKey);
    await this.prismaService.template.delete({ where: { id: templateId } });
  }

  async getTemplateDownloadUrlById(
    templateId: string,
    userId: string,
  ): Promise<{ url: string }> {
    const template = await this.prismaService.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.userId !== userId) {
      throw new ForbiddenException('Unauthorized to access this template');
    }

    return { url: template.fileUrl };
  }
}
