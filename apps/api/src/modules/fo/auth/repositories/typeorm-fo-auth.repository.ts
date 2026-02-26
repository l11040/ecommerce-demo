import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoUserEntity } from '../../../../database/entities/fo-user.entity';
import { FoAuthRepository } from './fo-auth.repository';

@Injectable()
export class TypeOrmFoAuthRepository implements FoAuthRepository {
  constructor(
    @InjectRepository(FoUserEntity)
    private readonly foUserRepository: Repository<FoUserEntity>,
  ) {}

  findByEmail(email: string): Promise<FoUserEntity | null> {
    return this.foUserRepository.findOne({ where: { email } });
  }
}
