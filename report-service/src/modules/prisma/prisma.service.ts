import { PrismaClient } from '@prisma/report-service-client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private static resolveDatabaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL environment variable is required but not set',
      );
    }

    return databaseUrl;
  }

  constructor() {
    const pool = new Pool({
      connectionString: PrismaService.resolveDatabaseUrl(),
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }
}
