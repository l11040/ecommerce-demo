import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { env } from './env';
import { UserEntity } from '../database/entities/user.entity';
import { InitSchema1700000000000 } from '../database/migrations/1700000000000-init-schema';

export const typeOrmModuleOptions: TypeOrmModuleOptions = {
  type: 'mysql',
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.name,
  entities: [UserEntity],
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
  entities: [UserEntity],
  migrations: [InitSchema1700000000000],
  synchronize: false,
};
