import { join } from 'node:path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { env } from './env';
import { FoUserEntity } from '../database/entities/fo-user.entity';
import { BoAdminEntity } from '../database/entities/bo-admin.entity';

const migrationPaths = [join(__dirname, '../database/migrations/*{.ts,.js}')];

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'mysql',
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.name,
  entities: [FoUserEntity, BoAdminEntity],
  migrations: migrationPaths,
  migrationsRun: true,
  synchronize: false,
};

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.name,
  entities: [FoUserEntity, BoAdminEntity],
  migrations: migrationPaths,
  synchronize: false,
};
