import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CorrelationIDMiddleware } from '@cortex/backend-common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ThrottlerGuard,
  ThrottlerModule,
  ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env` }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => {
        const options: ThrottlerModuleOptions = {
          throttlers: [
            {
              name: 'short',
              ttl: 1000,
              limit: 10,
            },
            {
              name: 'long',
              ttl: 60 * 1000,
              limit: 100,
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
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
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
