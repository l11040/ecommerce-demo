import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoAdminEntity } from '../../../../database/entities/bo-admin.entity';
import { BoAuthRepository } from './bo-auth.repository';

@Injectable()
export class TypeOrmBoAuthRepository implements BoAuthRepository {
  constructor(
    @InjectRepository(BoAdminEntity)
    private readonly boAdminRepository: Repository<BoAdminEntity>,
  ) {}

  findByUsername(username: string): Promise<BoAdminEntity | null> {
    return this.boAdminRepository.findOne({ where: { username } });
  }
}
