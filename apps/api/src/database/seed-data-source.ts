import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../config/typeorm.config';

const seedDataSource = new DataSource({
  ...dataSourceOptions,
  migrations: [join(__dirname, './seeds/*{.ts,.js}')],
  migrationsTableName: 'seed_migrations',
});

export default seedDataSource;
