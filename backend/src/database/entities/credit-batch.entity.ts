import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('credit_batches')
export class CreditBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @Column('uuid')
  certifierId: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  creditVolume: number;

  @Column()
  serialNumberStart: string;

  @Column()
  serialNumberEnd: string;

  @Column({ nullable: true })
  certificationNote: string | null;

  @CreateDateColumn()
  issuedAt: Date;
}
