import { Module } from '@nestjs/common';
import { S3Module } from '../s3/s3.module';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from './entities/template.entity';

@Module({
  imports: [S3Module, TypeOrmModule.forFeature([Template])],
  providers: [TemplatesService],
  controllers: [TemplatesController],
})
export class TemplatesModule {}
