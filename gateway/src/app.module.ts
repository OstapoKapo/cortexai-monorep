import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { AuthModule } from './modules/auth/auth.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    AuthModule,
    ReportsModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env` }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => {
        const shortTtl = Number(
          configService.get<string>('THROTTLE_SHORT_TTL') ?? '60',
        );
        const shortLimit = Number(
          configService.get<string>('THROTTLE_SHORT_LIMIT') ?? '10',
        );
        const longTtl = Number(
          configService.get<string>('THROTTLE_LONG_TTL') ?? '3600',
        );
        const longLimit = Number(
          configService.get<string>('THROTTLE_LONG_LIMIT') ?? '100',
        );

        const options: ThrottlerModuleOptions = {
          throttlers: [
            {
              name: 'short',
              ttl: shortTtl,
              limit: shortLimit,
            },
            {
              name: 'long',
              ttl: longTtl,
              limit: longLimit,
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
})
export class AppModule {}
