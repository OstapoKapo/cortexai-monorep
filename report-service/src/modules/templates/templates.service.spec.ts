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
