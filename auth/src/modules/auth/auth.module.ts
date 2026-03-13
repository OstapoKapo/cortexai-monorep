import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy } from '@cortex/backend-common';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [AuthController],
  imports: [UsersModule, JwtModule.register({}),PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [AuthService, AtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
