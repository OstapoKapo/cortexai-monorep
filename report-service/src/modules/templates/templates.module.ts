import { Module } from '@nestjs/common';
import { S3Module } from '../s3/s3.module';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [S3Module, PrismaModule],
  providers: [TemplatesService],
  controllers: [TemplatesController],
})
export class TemplatesModule {}
