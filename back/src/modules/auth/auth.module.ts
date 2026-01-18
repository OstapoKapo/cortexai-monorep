import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy } from '@/common/strategies/at.strategy';

@Module({
  controllers: [AuthController],
  imports: [UsersModule, JwtModule.register({})],
  providers: [AuthService, AtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
