import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';
import { AppErrors } from '@cortex/shared';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.usersRepository.findAll();
    } catch {
      throw new InternalServerErrorException(AppErrors.SYSTEM.INTERNAL_ERROR);
    }
  }

  async changeUserData(id: string, data: Partial<User>): Promise<User> {
    if (data.password) {
      delete data.password;
    }
    try {
      return await this.usersRepository.update(data, id);
    } catch (err) {
      if (err instanceof Error && err.message === 'User not found') {
        throw new NotFoundException(AppErrors.AUTH.USER_NOT_FOUND);
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
    } catch (err: unknown) {
      if (err instanceof QueryFailedError) {
        throw new ServiceUnavailableException(
          'Auth database is unavailable. Check Postgres connection.',
        );
      }
      if (err instanceof Error) {
        this.logger.error(`getUserByEmail failed: ${err.message}`, err.stack);
      }
      throw new InternalServerErrorException(AppErrors.SYSTEM.INTERNAL_ERROR);
    }
  }

  async createUser(data: Partial<User>): Promise<User> {
    try {
      return await this.usersRepository.create(data);
    } catch (err) {
      if (err instanceof QueryFailedError && (err.driverError as { code: string }).code === '23505') {
        throw new ConflictException(AppErrors.AUTH.USER_EXISTS);
      }
      throw new InternalServerErrorException(AppErrors.SYSTEM.INTERNAL_ERROR);
    }
  }

  async deleteUser(id: string): Promise<User | null> {
    try {
      return await this.usersRepository.delete(id);
    } catch (err) {
      if (err instanceof Error && err.message === 'User not found') {
        throw new NotFoundException(AppErrors.AUTH.USER_NOT_FOUND);
      }
      throw new InternalServerErrorException(AppErrors.SYSTEM.INTERNAL_ERROR);
    }
  }
}
