import { Module } from '@nestjs/common';
import { ProxyService } from '../../common/services/proxy.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [AuthController],
  imports: [ConfigModule, HttpModule],
  providers: [ProxyService],
})
export class AuthModule {}
