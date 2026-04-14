import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('project_status_history')
export class ProjectStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  projectId: string;

  @ManyToOne(() => Project, (p) => p.statusHistory, { onDelete: 'CASCADE' })
  project: Project;

  @Column({ nullable: true })
  fromStatus: string | null;

  @Column()
  toStatus: string;

  @Column('uuid')
  changedByUserId: string;

  @Column({ nullable: true })
  note: string | null;

  @CreateDateColumn()
  changedAt: Date;
}
