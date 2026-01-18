import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CorrelationIDMiddleware } from '@cortex/backend-common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env` }),
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    consumer
      .apply(CorrelationIDMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
