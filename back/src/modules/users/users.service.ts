import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { Prisma, User } from '@prisma/client';
import { AppErrors } from '@cortex/shared';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.usersRepository.findAll();
    } catch {
      throw new InternalServerErrorException(AppErrors.SYSTEM.INTERNAL_ERROR);
    }
  }

  async changeUserData(
    id: string,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    if (data.password) {
      delete data.password;
    }
    try {
      return await this.usersRepository.update(data, id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException(AppErrors.AUTH.USER_NOT_FOUND);
        }
      }
      throw new InternalServerErrorException(AppErrors.SYSTEM.INTERNAL_ERROR);
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await this.usersRepository.findById(id);
    } catch {
      throw new InternalServerErrorException(AppErrors.SYSTEM.INTERNAL_ERROR);
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findByEmail(email);
    } catch {
      throw new InternalServerErrorException(AppErrors.SYSTEM.INTERNAL_ERROR);
    }
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.usersRepository.create(data);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ConflictException(AppErrors.AUTH.USER_EXISTS);
        }
      }
      throw new InternalServerErrorException(AppErrors.SYSTEM.INTERNAL_ERROR);
    }
  }

  async deleteUser(id: string): Promise<User | null> {
    try {
      return await this.usersRepository.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          throw new NotFoundException(AppErrors.AUTH.USER_NOT_FOUND);
        }
      }
      throw new InternalServerErrorException(AppErrors.SYSTEM.INTERNAL_ERROR);
    }
  }
}
