import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'product_media' })
export class ProductMediaEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int' })
  productId!: number;

  @Column({ length: 20 })
  type!: string;

  @Column({ name: 'source_type', length: 20 })
  sourceType!: string;

  @Column({ length: 700 })
  url!: string;

  @Column({ name: 'alt_text', type: 'varchar', length: 180, nullable: true })
  altText!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
