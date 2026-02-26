import { BoAdminEntity } from '../../../../database/entities/bo-admin.entity';

export const BO_AUTH_REPOSITORY = Symbol('BO_AUTH_REPOSITORY');

export interface BoAuthRepository {
  findByUsername(username: string): Promise<BoAdminEntity | null>;
}
