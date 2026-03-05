import { PrismaClient } from '@prisma/auth-client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private static resolveDatabaseUrl(): string {
    const fallbackUrl =
      'postgres://postgres:admin@localhost:5432/cortexai-users-db';
    const rawUrl = process.env.DATABASE_URL;

    if (!rawUrl) {
      return fallbackUrl;
    }

    try {
      const parsedUrl = new URL(rawUrl);
      if (
        parsedUrl.protocol.startsWith('postgres') &&
        parsedUrl.password.length === 0
      ) {
        parsedUrl.password = 'admin';
      }
      return parsedUrl.toString();
    } catch {
      return fallbackUrl;
    }
  }

  constructor() {
    const pool = new Pool({
      connectionString: PrismaService.resolveDatabaseUrl(),
    });

    const adapter = new PrismaPg(pool);

    super({ adapter });
  }
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
