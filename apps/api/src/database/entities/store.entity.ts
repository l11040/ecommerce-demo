import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'stores' })
export class StoreEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 60, unique: true })
  code!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 20, default: 'active' })
  status!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
