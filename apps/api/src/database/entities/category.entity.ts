import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'categories' })
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId!: number | null;

  @ManyToOne(() => CategoryEntity, (category) => category.children, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: CategoryEntity | null;

  @OneToMany(() => CategoryEntity, (category) => category.parent)
  children?: CategoryEntity[];

  @Column({ type: 'tinyint' })
  depth!: number;

  @Column({ length: 255, unique: true })
  path!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 140 })
  slug!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_visible', type: 'boolean', default: true })
  isVisible!: boolean;

  @Column({ name: 'is_main_exposed', type: 'boolean', default: false })
  isMainExposed!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}
