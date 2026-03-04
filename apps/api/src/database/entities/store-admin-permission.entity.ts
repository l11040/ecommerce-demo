import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'store_admin_permissions' })
export class StoreAdminPermissionEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'store_id', type: 'int' })
  storeId!: number;

  @Column({ name: 'bo_admin_id', type: 'int' })
  boAdminId!: number;

  @Column({ length: 20, default: 'store_admin' })
  role!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
