import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'product_seo_meta' })
export class ProductSeoMetaEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int', unique: true })
  productId!: number;

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle!: string | null;

  @Column({ name: 'meta_description', type: 'text', nullable: true })
  metaDescription!: string | null;

  @Column({
    name: 'meta_keywords',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  metaKeywords!: string | null;

  @Column({
    name: 'canonical_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  canonicalUrl!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  robots!: string | null;

  @Column({ name: 'og_title', type: 'varchar', length: 255, nullable: true })
  ogTitle!: string | null;

  @Column({ name: 'og_description', type: 'text', nullable: true })
  ogDescription!: string | null;

  @Column({ name: 'og_image', type: 'varchar', length: 500, nullable: true })
  ogImage!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
