import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';

export enum ReviewOutcome {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  INFO_REQUESTED = 'INFO_REQUESTED',
}

@Entity('project_reviews')
export class ProjectReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  project: Project;

  @Column('uuid')
  verifierId: string;

  @Column({ default: false })
  methodologyCheck: boolean;

  @Column({ default: false })
  boundaryCheck: boolean;

  @Column({ default: false })
  additionalityCheck: boolean;

  @Column({ default: false })
  permanenceCheck: boolean;

  @Column({ nullable: true })
  reviewNote: string | null;

  @Column({ type: 'enum', enum: ReviewOutcome, nullable: true })
  outcome: ReviewOutcome | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
