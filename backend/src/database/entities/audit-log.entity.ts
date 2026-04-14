import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entity: string;

  @Column({ nullable: true })
  entityId: string | null;

  @Column()
  action: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ nullable: true })
  performedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
