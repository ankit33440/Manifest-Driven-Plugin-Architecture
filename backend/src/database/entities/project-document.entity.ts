import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('project_documents')
export class ProjectDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  projectId: string;

  @ManyToOne(() => Project, (p) => p.documents, { onDelete: 'CASCADE' })
  project: Project;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  type: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
