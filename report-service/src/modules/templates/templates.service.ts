import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import { Template } from './entities/template.entity';
import { v4 as uuid } from 'uuid';
import { CreateTemplateDto } from '@cortex/backend-common';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    private readonly s3Service: S3Service,
    @InjectRepository(Template)
    private readonly templateRepo: Repository<Template>,
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
      const template = this.templateRepo.create({
        name: dto.name,
        description: dto.description,
        storageKey: s3Key,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        userId: userId,
        fileUrl: uploadResult,
      });
      await this.templateRepo.save(template);
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
    return this.templateRepo.find({
      where: { userId },
      select: [
        'id',
        'name',
        'description',
        'fileUrl',
        'originalFileName',
        'mimeType',
        'size',
        'userId',
        'updatedAt',
        'createdAt',
      ],
      order: { updatedAt: 'DESC' },
    });
  }

  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const template = await this.templateRepo.findOne({
      where: { id: templateId },
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    if (template.userId !== userId) {
      throw new ForbiddenException('Unauthorized to delete this template');
    }
    await this.s3Service.deleteFile(template.storageKey);
    await this.templateRepo.delete({ id: templateId });
  }

  async getTemplateDownloadUrlById(
    templateId: string,
    userId: string,
  ): Promise<{ url: string }> {
    const template = await this.templateRepo.findOne({
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
