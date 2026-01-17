import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  imports: [UsersModule],
  providers: [AuthService],
})
export class AuthModule {}
