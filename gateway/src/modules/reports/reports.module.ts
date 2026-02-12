import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy } from 'src/common/strategies/at.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [ReportsController],
  imports: [
    ConfigModule,
    HttpModule,
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [AtStrategy],
})
export class ReportsModule {}
