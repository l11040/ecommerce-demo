import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../config/typeorm.config';

const appDataSource = new DataSource(dataSourceOptions);

export default appDataSource;
