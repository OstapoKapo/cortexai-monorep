import { Module } from '@nestjs/common';
import { ProxyService } from '../../common/services/proxy.service';
import { ReportsController } from './reports.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AtStrategy } from '../../common/strategies/at.strategy';
@Module({
  controllers: [ReportsController],
  imports: [
    ConfigModule,
    HttpModule,
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [AtStrategy, ProxyService],
})
export class ReportsModule {}
