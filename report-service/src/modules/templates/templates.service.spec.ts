import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { S3Service } from '../s3/s3.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from 'src/common/dto/reports.dto';

const mockS3Service = {
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
};
const mockPrismaService = {
  template: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

describe('TemplatesService', () => {
  let service: TemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplatesService,
        { provide: S3Service, useValue: mockS3Service },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get(TemplatesService);
    jest.clearAllMocks();
  });

  const userId = 'user-1';
  const file = {
    originalname: 'test.docx',
    buffer: Buffer.from('test'),
    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 123,
  } as any;
  const dto: CreateTemplateDto = { name: 'Test', description: 'Desc' };
  
  const mockTemplate = {
    id: 'template-1',
    name: 'Test Template',
    description: 'Test description',
    fileUrl: 'http://s3.url/file.pdf',
    originalFileName: 'file.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    storageKey: `templates/${userId}/file.pdf`,
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTemplate', () => {
    it('should upload file, create db record, and return url', async () => {
      mockS3Service.uploadFile.mockResolvedValue('http://s3.url/file');
      mockPrismaService.template.create.mockResolvedValue({});
      const result = await service.createTemplate(userId, file, dto);
      expect(mockS3Service.uploadFile).toHaveBeenCalled();
      expect(mockPrismaService.template.create).toHaveBeenCalled();
      expect(result).toEqual({ url: 'http://s3.url/file' });
    });

    it('should delete file from S3 and throw if db create fails', async () => {
      mockS3Service.uploadFile.mockResolvedValue('http://s3.url/file');
      mockPrismaService.template.create.mockRejectedValue(new Error('DB error'));
      mockS3Service.deleteFile.mockResolvedValue(undefined);
      await expect(service.createTemplate(userId, file, dto)).rejects.toThrow('DB error');
      expect(mockS3Service.deleteFile).toHaveBeenCalled();
    });
  });

  describe('getTemplatesForUser', () => {
    it('should return user templates', async () => {
      mockPrismaService.template.findMany.mockResolvedValue([mockTemplate]);
      const result = await service.getTemplatesForUser(userId);
      expect(mockPrismaService.template.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual([mockTemplate]);
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template from S3 and database', async () => {
      mockPrismaService.template.findUnique.mockResolvedValue(mockTemplate);
      mockS3Service.deleteFile.mockResolvedValue(undefined);
      mockPrismaService.template.delete.mockResolvedValue(undefined);
      
      await service.deleteTemplate('template-1', userId);
      
      expect(mockPrismaService.template.findUnique).toHaveBeenCalledWith({
        where: { id: 'template-1' },
      });
      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(mockTemplate.storageKey);
      expect(mockPrismaService.template.delete).toHaveBeenCalledWith({
        where: { id: 'template-1' },
      });
    });

    it('should throw error if template not found', async () => {
      mockPrismaService.template.findUnique.mockResolvedValue(null);
      
      await expect(service.deleteTemplate('template-1', userId)).rejects.toThrow('Template not found');
    });

    it('should throw error if user unauthorized', async () => {
      mockPrismaService.template.findUnique.mockResolvedValue({
        ...mockTemplate,
        userId: 'different-user',
      });
      
      await expect(service.deleteTemplate('template-1', userId)).rejects.toThrow('Unauthorized to delete this template');
    });
  });

  describe('getTemplateDownloadUrlById', () => {
    it('should return template download URL', async () => {
      mockPrismaService.template.findUnique.mockResolvedValue(mockTemplate);
      
      const result = await service.getTemplateDownloadUrlById('template-1', userId);
      
      expect(mockPrismaService.template.findUnique).toHaveBeenCalledWith({
        where: { id: 'template-1' },
      });
      expect(result).toEqual({ url: mockTemplate.fileUrl });
    });

    it('should throw error if template not found', async () => {
      mockPrismaService.template.findUnique.mockResolvedValue(null);
      
      await expect(service.getTemplateDownloadUrlById('template-1', userId)).rejects.toThrow('Template not found');
    });

    it('should throw error if user unauthorized', async () => {
      mockPrismaService.template.findUnique.mockResolvedValue({
        ...mockTemplate,
        userId: 'different-user',
      });
      
      await expect(service.getTemplateDownloadUrlById('template-1', userId)).rejects.toThrow('Unauthorized to access this template');
    });
  });
});
