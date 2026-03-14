import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service implements OnModuleInit {
  private s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);
  private bucketName: string;
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      endpoint: this.configService.getOrThrow<string>('AWS_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
      forcePathStyle: true,
    });
    this.bucketName = this.configService.getOrThrow<string>('AWS_BUCKET_NAME');
  }

  async uploadFile(
    key: string,
    file: Buffer,
    mimeType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: mimeType,
    });
    try {
      await this.s3Client.send(command);
      const endpoint = this.configService.getOrThrow<string>('AWS_ENDPOINT');
      return `${endpoint}/${this.bucketName}/${key}`;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to upload file to S3: ${message}`);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    try {
      await this.s3Client.send(command);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete file from S3: ${message}`);
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({
          Bucket: this.bucketName,
        }),
      );
      return true;
    } catch (error) {
      this.logger.error('S3 health check failed', error);
      return false;
    }
  }
}
