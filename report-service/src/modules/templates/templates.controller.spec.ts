import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { InternalAuthGuard, UserId } from '@cortex/backend-common';
import { ZodValidationPipe } from 'nestjs-zod';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExecutionContext } from '@nestjs/common';

const mockDto = { name: 'Test', description: 'Test desc' };
const mockFile = { originalname: 'file.docx', buffer: Buffer.from('test') } as any;
const mockUserId = 'user-123';

const mockTemplatesService = {
  createTemplate: jest.fn().mockResolvedValue({ url: 'http://test.url' }),
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
        mockUserId,
        mockFile,
      );
      expect(service.createTemplate).toHaveBeenCalledWith(
        mockUserId,
        mockFile,
        mockDto,
      );
      expect(result).toEqual({ url: 'http://test.url', message: 'Template created successfully' });
    });
  });

  describe('getTemplates', () => {
    it('should return not implemented message', async () => {
      const result = await controller.getTemplates();
      expect(result).toEqual({ message: 'Not implemented yet' });
    });
  });
});
