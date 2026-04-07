import { DataSource } from 'typeorm';
import { Template } from '../modules/templates/entities/template.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'postgres',
  password: 'admin',
  database: 'cortexai-reports-db',
  entities: [Template],
  migrations: ['src/db/migrations/*.ts'],
  synchronize: false,
});
