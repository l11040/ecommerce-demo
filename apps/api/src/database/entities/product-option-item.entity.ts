import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'product_option_items' })
export class ProductOptionItemEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'option_group_id', type: 'int' })
  optionGroupId!: number;

  @Column({ length: 160 })
  label!: string;

  @Column({
    name: 'extra_supply_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  extraSupplyCost!: string;

  @Column({
    name: 'extra_unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  extraUnitPrice!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
