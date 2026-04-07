import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'cortexai-users-db',
  entities: [User],
  migrations: ['src/db/migrations/*.ts'],
  synchronize: false,
});
