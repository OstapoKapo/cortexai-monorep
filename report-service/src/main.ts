import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  HttpExceptionFilter,
  TransformInterceptor,
} from '@cortex/backend-common';
import { ZodValidationPipe } from 'nestjs-zod';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'Set-Cookie',
    ],
  });

  app.useGlobalPipes(new ZodValidationPipe());

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('CortexAI API/reports')
    .setDescription(
      'API documentation for CortexAI application - Reports Service',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = process.env.PORT;
  if (!PORT) throw new Error('No PORT specified in env file');

  await app.listen(process.env.PORT ?? 8000);
}
void bootstrap();
