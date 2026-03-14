import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    const map = {
      AWS_REGION: 'us-east-1',
      AWS_ENDPOINT: 'http://localhost:9000',
      AWS_ACCESS_KEY_ID: 'test',
      AWS_SECRET_ACCESS_KEY: 'test',
      AWS_BUCKET_NAME: 'test-bucket',
    };
    return map[key];
  }),
};

describe('S3Service', () => {
  let service: S3Service;
  let s3ClientSendMock: jest.Mock;

  beforeEach(async () => {
    s3ClientSendMock = jest.fn();
    jest.spyOn(S3Client.prototype, 'send').mockImplementation(s3ClientSendMock);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get<S3Service>(S3Service);
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should upload file successfully', async () => {
    s3ClientSendMock.mockResolvedValueOnce({});
    const url = await service.uploadFile('file.txt', Buffer.from('test'), 'text/plain');
    expect(url).toContain('test-bucket/file.txt');
    expect(s3ClientSendMock).toHaveBeenCalledWith(expect.any(PutObjectCommand));
  });

  it('should throw and log error on upload fail', async () => {
    s3ClientSendMock.mockRejectedValueOnce(new Error('fail'));
    await expect(service.uploadFile('file.txt', Buffer.from('test'), 'text/plain')).rejects.toThrow('fail');
  });

  it('should delete file successfully', async () => {
    s3ClientSendMock.mockResolvedValueOnce({});
    await expect(service.deleteFile('file.txt')).resolves.toBeUndefined();
    expect(s3ClientSendMock).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
  });

  it('should throw and log error on delete fail', async () => {
    s3ClientSendMock.mockRejectedValueOnce(new Error('fail'));
    await expect(service.deleteFile('file.txt')).rejects.toThrow('fail');
  });

  it('should return true if health check passes', async () => {
    s3ClientSendMock.mockResolvedValueOnce({});
    await expect(service.isHealthy()).resolves.toBe(true);
    expect(s3ClientSendMock).toHaveBeenCalledWith(expect.any(HeadBucketCommand));
  });

  it('should return false if health check fails', async () => {
    s3ClientSendMock.mockRejectedValueOnce(new Error('fail'));
    await expect(service.isHealthy()).resolves.toBe(false);
  });
});
