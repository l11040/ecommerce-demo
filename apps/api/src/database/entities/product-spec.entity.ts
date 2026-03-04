import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'product_specs' })
export class ProductSpecEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'spec_group_id', type: 'int' })
  specGroupId!: number;

  @Column({ length: 120 })
  label!: string;

  @Column({ length: 255 })
  value!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
