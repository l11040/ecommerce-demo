import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'product_price_tiers' })
export class ProductPriceTierEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  productId!: number;

  @Column({ name: 'customer_segment', length: 20 })
  customerSegment!: string;

  @Column({ name: 'min_qty', type: 'int' })
  minQty!: number;

  @Column({ name: 'margin_rate', type: 'decimal', precision: 5, scale: 2 })
  marginRate!: string;

  @Column({
    name: 'unit_price_override',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  unitPriceOverride!: string | null;

  @Column({
    name: 'computed_unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  computedUnitPrice!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
