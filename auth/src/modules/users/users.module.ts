import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
  imports: [PrismaModule],
})
export class UsersModule {}
