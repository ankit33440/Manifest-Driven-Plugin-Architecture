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

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── UI / user-editable fields ────────────────────────────────────────────────

  @Column()
  name: string;

  @Column({ nullable: true })
  projectProponent: string | null;

  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ nullable: true })
  enrollment: string | null;

  @Column({ nullable: true })
  protocol: string | null;

  @Column({ nullable: true })
  protocolVersion: string | null;

  @Column({ nullable: true })
  applicationYear: number | null;

  @Column({ nullable: true })
  vintage: number | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  proposedCarbonCredits: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  averageAccrualRate: number | null;

  @Column('text')
  description: string;

  // ── Location: user-provided ──────────────────────────────────────────────────

  /** Raw geocoded address as typed by the user (e.g. "Brazil, Amazonas") */
  @Column({ nullable: true })
  geocodedAddress: string | null;

  /** Set by backend geocoding service; not editable by users */
  @Column({ default: false })
  geofenceVerified: boolean;

  // ── Location: system-managed (preserved for internal/geospatial logic) ───────

  @Column({ nullable: true })
  country: string | null;

  @Column({ nullable: true })
  region: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  areaHectares: number | null;

  // ── Status & workflow ────────────────────────────────────────────────────────

  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.DRAFT })
  status: ProjectStatus;

  @Column('uuid')
  developerId: string;

  @Column({ nullable: true })
  assignedVerifierId: string | null;

  @Column({ nullable: true })
  assignedCertifierId: string | null;

  // ── Relations ────────────────────────────────────────────────────────────────

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
