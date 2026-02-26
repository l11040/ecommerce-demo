import { FoUserEntity } from '../../../../database/entities/fo-user.entity';

export const FO_AUTH_REPOSITORY = Symbol('FO_AUTH_REPOSITORY');

export interface FoAuthRepository {
  findByEmail(email: string): Promise<FoUserEntity | null>;
}
