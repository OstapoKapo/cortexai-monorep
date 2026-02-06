import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CorrelationIDMiddleware } from '@cortex/backend-common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env` }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short-term',
          ttl: 1000,
          limit: 10,
        },
        {
          name: 'long-term',
          ttl: 60 * 1000,
          limit: 100,
        },
      ],
      storage: new ThrottlerStorageRedisService({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      }),
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
