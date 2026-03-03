import { join } from 'node:path';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../config/typeorm.config';

const nodeEnv = (process.env.NODE_ENV ?? 'production').toLowerCase();
const isDevOnlySeedAllowed = nodeEnv === 'development' || nodeEnv === 'local';

if (!isDevOnlySeedAllowed) {
  throw new Error(
    'Seed migrations are disabled in production. Run seeds only in development environments.',
  );
}

const seedDataSource = new DataSource({
  ...dataSourceOptions,
  migrations: [join(__dirname, './seeds/*{.ts,.js}')],
  migrationsTableName: 'seed_migrations',
});

export default seedDataSource;
