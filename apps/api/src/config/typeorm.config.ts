import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { env } from './env';
import { FoUserEntity } from '../database/entities/fo-user.entity';
import { BoAdminEntity } from '../database/entities/bo-admin.entity';
import { InitSchema1700000000000 } from '../database/migrations/1700000000000-init-schema';

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'mysql',
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.name,
  entities: [FoUserEntity, BoAdminEntity],
  migrations: [InitSchema1700000000000],
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
  migrations: [InitSchema1700000000000],
  synchronize: false,
};
