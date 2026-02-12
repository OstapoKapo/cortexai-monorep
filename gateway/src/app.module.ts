import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
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
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: configService.getOrThrow<number>('THROTTLE_SHORT_TTL'),
            limit: configService.getOrThrow<number>('THROTTLE_SHORT_LIMIT'),
          },
          {
            name: 'long',
            ttl: configService.getOrThrow<number>('THROTTLE_LONG_TTL'),
            limit: configService.getOrThrow<number>('THROTTLE_LONG_LIMIT'),
          },
        ],
        storage: new ThrottlerStorageRedisService({
          host: configService.getOrThrow<string>('REDIS_HOST'),
          port: configService.getOrThrow<number>('REDIS_PORT'),
        }),
        errorMessage: 'Too many requests, please try again later.',
      }),
    }),
  ],
})
export class AppModule {}
