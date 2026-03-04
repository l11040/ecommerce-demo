import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'product_audit_logs' })
export class ProductAuditLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'product_id', type: 'int' })
  productId!: number;

  @Column({ name: 'actor_admin_id', type: 'int', nullable: true })
  actorAdminId!: number | null;

  @Column({ length: 60 })
  action!: string;

  @Column({ name: 'payload_json', type: 'json', nullable: true })
  payloadJson!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
