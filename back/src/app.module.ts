import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CorrelationIDMiddleware } from '@cortex/backend-common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIDMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
