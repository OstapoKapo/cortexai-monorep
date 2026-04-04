import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { Template } from '@cortex/shared';
import { InternalAuthGuard, UserId } from '@cortex/backend-common';


const mockDto = { name: 'Test', description: 'Test desc' };
const mockFile = { originalname: 'file.docx', buffer: Buffer.from('test') } as any;
const mockUserId = 'user-123';

const mockTemplate: Template = {
  id: 'template-1',
  name: 'Test Template',
  description: 'Test description',
  fileUrl: 'http://s3.url/file.pdf',
  originalFileName: 'file.pdf',
  mimeType: 'application/pdf',
  size: 1024,
  userId: mockUserId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTemplatesService = {
  createTemplate: jest.fn().mockResolvedValue({ url: 'http://test.url' }),
  getTemplatesForUser: jest.fn().mockResolvedValue([mockTemplate]),
  deleteTemplate: jest.fn().mockResolvedValue(undefined),
  getTemplateDownloadUrlById: jest.fn().mockResolvedValue({ url: 'http://download.url' }),
};

describe('TemplatesController', () => {
  let controller: TemplatesController;
  let service: TemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [
        { provide: TemplatesService, useValue: mockTemplatesService },
      ],
    })
      .overrideGuard(InternalAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(TemplatesController);
    service = module.get(TemplatesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTemplate', () => {
    it('should call service and return url', async () => {
      const result = await controller.createTemplate(
        mockDto as any,
        mockFile,
        mockUserId,
      );
      expect(service.createTemplate).toHaveBeenCalledWith(
        mockUserId,
        mockFile,
        mockDto,
      );
      expect(result).toEqual({ url: 'http://test.url', message: 'Template created successfully' });
    });

    it('should throw if service throws', async () => {
      (service.createTemplate as jest.Mock).mockRejectedValueOnce(new Error('Service error'));
      await expect(
        controller.createTemplate(mockDto as any, mockFile, mockUserId)
      ).rejects.toThrow('Service error');
    });
  });

  describe('getTemplates', () => {
    it('should call service and return templates with message', async () => {
      const result = await controller.getTemplates(mockUserId);
      expect(service.getTemplatesForUser).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual({
        message: 'Report templates retrieved successfully.',
        templates: [mockTemplate],
      });
    });

    it('should return empty array if no templates', async () => {
      (service.getTemplatesForUser as jest.Mock).mockResolvedValueOnce([]);
      const result = await controller.getTemplates(mockUserId);
      expect(result).toEqual({
        message: 'Report templates retrieved successfully.',
        templates: [],
      });
    });
  });

  describe('deleteTemplate', () => {
    it('should call service and return success message', async () => {
      const templateId = 'template-1';
      const result = await controller.deleteTemplate(mockUserId, templateId);
      expect(service.deleteTemplate).toHaveBeenCalledWith(templateId, mockUserId);
      expect(result).toEqual({ message: 'Report template deleted successfully.' });
    });

    it('should throw if service throws (delete)', async () => {
      (service.deleteTemplate as jest.Mock).mockRejectedValueOnce(new Error('Delete error'));
      await expect(
        controller.deleteTemplate(mockUserId, 'template-1')
      ).rejects.toThrow('Delete error');
    });
  });

  describe('downloadTemplate', () => {
    it('should call service and return download URL with message', async () => {
      const templateId = 'template-1';
      const result = await controller.downloadTemplate(mockUserId, templateId);
      expect(service.getTemplateDownloadUrlById).toHaveBeenCalledWith(templateId, mockUserId);
      expect(result).toEqual({
        url: 'http://download.url',
        message: 'Report template download URL retrieved successfully.',
      });
    });

    it('should throw if service throws (download)', async () => {
      (service.getTemplateDownloadUrlById as jest.Mock).mockRejectedValueOnce(new Error('Download error'));
      await expect(
        controller.downloadTemplate(mockUserId, 'template-1')
      ).rejects.toThrow('Download error');
    });
  });
});
