import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from './project.entity';

export enum UserStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  PROJECT_DEVELOPER = 'PROJECT_DEVELOPER',
  VERIFIER = 'VERIFIER',
  CERTIFIER = 'CERTIFIER',
  BUYER = 'BUYER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Project, (p) => p.developer)
  projects: Project[];
}
