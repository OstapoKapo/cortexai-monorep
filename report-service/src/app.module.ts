import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReportsModule } from './modules/reports/reports.module';
import { S3Module } from './modules/s3/s3.module';
import {
  CorrelationIDMiddleware,
  SecretKeyGuard,
} from '@cortex/backend-common';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';
import { OrmModule } from './modules/orm/orm.module';
import { TemplatesModule } from './modules/templates/templates.module';

@Module({
  imports: [
    ReportsModule,
    S3Module,
    TemplatesModule,
    OrmModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env` }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => {
        const defaultTtl = Number(
          configService.get<string>('THROTTLE_TTL') ?? '60',
        );
        const defaultLimit = Number(
          configService.get<string>('THROTTLE_LIMIT') ?? '10',
        );
        const options: ThrottlerModuleOptions = {
          throttlers: [
            {
              name: 'default',
              ttl: defaultTtl * 1000,
              limit: defaultLimit,
            },
          ],
          errorMessage: 'Too many requests, please try again later.',
        };

        const redisHost = configService.get<string>('REDIS_HOST');
        const redisPortRaw = configService.get<string>('REDIS_PORT');
        const redisPort = redisPortRaw ? Number(redisPortRaw) : null;

        if (redisHost && redisPort !== null && Number.isFinite(redisPort)) {
          return {
            ...options,
            storage: new ThrottlerStorageRedisService({
              host: redisHost,
              port: redisPort,
            }),
          };
        }

        return options;
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SecretKeyGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIDMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
