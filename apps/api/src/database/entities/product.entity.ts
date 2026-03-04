import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'store_id', type: 'int' })
  storeId!: number;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId!: number | null;

  @Column({ length: 180 })
  name!: string;

  @Column({ length: 220, unique: true })
  slug!: string;

  @Column({ length: 20, default: 'draft' })
  status!: string;

  @Column({ name: 'is_visible', type: 'boolean', default: false })
  isVisible!: boolean;

  @Column({ type: 'int', default: 1 })
  moq!: number;

  @Column({ name: 'moq_inquiry_only', type: 'boolean', default: false })
  moqInquiryOnly!: boolean;

  @Column({
    name: 'base_supply_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  baseSupplyCost!: string;

  @Column({ name: 'vat_type', length: 20, default: 'exclusive' })
  vatType!: string;

  @Column({
    name: 'vat_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 10,
  })
  vatRate!: string;

  @Column({ name: 'is_printable', type: 'boolean', default: false })
  isPrintable!: boolean;

  @Column({
    name: 'print_method',
    type: 'varchar',
    length: 120,
    nullable: true,
  })
  printMethod!: string | null;

  @Column({ name: 'print_area', type: 'varchar', length: 120, nullable: true })
  printArea!: string | null;

  @Column({ name: 'proof_lead_time_days', type: 'int', nullable: true })
  proofLeadTimeDays!: number | null;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 700,
    nullable: true,
  })
  thumbnailUrl!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
