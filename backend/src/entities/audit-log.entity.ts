import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'actor_user_id', nullable: true })
  actorUserId?: string | null;

  @Column({ name: 'action' })
  action!: string;

  @Column({ name: 'resource_type', nullable: true })
  resourceType?: string | null;

  @Column({ name: 'resource_id', nullable: true })
  resourceId?: string | null;

  @Column({ name: 'details', type: 'json', nullable: true })
  details?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
