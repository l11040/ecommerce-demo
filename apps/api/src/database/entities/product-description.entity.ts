import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'product_descriptions' })
export class ProductDescriptionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', type: 'int', unique: true })
  productId!: number;

  @Column({ name: 'description_html_raw', type: 'longtext' })
  descriptionHtmlRaw!: string;

  @Column({ name: 'description_html_sanitized', type: 'longtext' })
  descriptionHtmlSanitized!: string;

  @Column({ name: 'updated_by_admin_id', type: 'int', nullable: true })
  updatedByAdminId!: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
