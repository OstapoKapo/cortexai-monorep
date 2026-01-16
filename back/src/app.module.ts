import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CorrelationIDMiddleware } from '@backend-common';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIDMiddleware)
      .forRoutes({path: '*', method: RequestMethod.ALL});
  }
}
