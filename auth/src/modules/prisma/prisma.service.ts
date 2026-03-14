import { PrismaClient } from '@prisma/auth-client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private static resolveDatabaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL environment variable is required but not set',
      );
    }
    try {
      new URL(databaseUrl);
      return databaseUrl;
    } catch {
      throw new Error('DATABASE_URL environment variable is not a valid URL');
    }
  }

  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const pool = new Pool({
      connectionString: PrismaService.resolveDatabaseUrl(),
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected');
    } catch (error) {
      this.logger.error('Failed to connect Prisma', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Prisma disconnected');
    } catch (error) {
      this.logger.error('Error during Prisma disconnect', error);
    }
  }

  // Placeholder for Prisma middleware
  // Example: this.$use(async (params, next) => { /* ... */ });

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
