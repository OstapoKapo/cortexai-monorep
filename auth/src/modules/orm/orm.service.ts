import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class OrmService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrmService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }
      this.logger.log('TypeORM connected');
    } catch (error) {
      this.logger.error('Failed to connect TypeORM', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
      }
      this.logger.log('TypeORM disconnected');
    } catch (error) {
      this.logger.error('Error during TypeORM disconnect', error);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
