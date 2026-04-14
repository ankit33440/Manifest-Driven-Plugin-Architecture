import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ProjectDocument } from './project-document.entity';
import { ProjectStatusHistory } from './project-status-history.entity';

export enum ProjectType {
  REFORESTATION = 'REFORESTATION',
  SOLAR = 'SOLAR',
  WIND = 'WIND',
  METHANE = 'METHANE',
  REDD_PLUS = 'REDD_PLUS',
  OTHER = 'OTHER',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  INFO_REQUESTED = 'INFO_REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  VERIFIED = 'VERIFIED',
  CERTIFIED = 'CERTIFIED',
  ACTIVE = 'ACTIVE',
}

export enum ProjectStandard {
  VCS = 'VCS',
  GOLD_STANDARD = 'GOLD_STANDARD',
  CAR = 'CAR',
  CDM = 'CDM',
  OTHER = 'OTHER',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: ProjectType })
  type: ProjectType;

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.DRAFT })
  status: ProjectStatus;

  @Column({ type: 'enum', enum: ProjectStandard })
  standard: ProjectStandard;

  @Column()
  country: string;

  @Column()
  region: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  areaHectares: number | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  estimatedCredits: number | null;

  @Column({ nullable: true })
  vintageStartYear: number | null;

  @Column({ nullable: true })
  vintageEndYear: number | null;

  @Column('uuid')
  developerId: string;

  @Column({ nullable: true })
  assignedVerifierId: string | null;

  @Column({ nullable: true })
  assignedCertifierId: string | null;

  @ManyToOne(() => User, (u) => u.projects, { eager: false })
  developer: User;

  @OneToMany(() => ProjectDocument, (d) => d.project, { cascade: true })
  documents: ProjectDocument[];

  @OneToMany(() => ProjectStatusHistory, (h) => h.project, { cascade: true })
  statusHistory: ProjectStatusHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
