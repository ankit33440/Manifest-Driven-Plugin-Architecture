import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../core/events/carbon.events';
import { CreateProjectDto } from './dto/create-project.dto';

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Project {
  id: string;
  name: string;
  type: string;
  status: ProjectStatus;
  developerId: string;
  location: string;
  description: string;
  createdAt: string;
}

let projectStore: Project[] = [
  {
    id: 'p1',
    name: 'Amazon Reforestation Initiative',
    type: 'REFORESTATION',
    status: ProjectStatus.APPROVED,
    developerId: '2',
    location: 'Brazil, Amazon Basin',
    description: 'Large-scale reforestation project targeting 50,000 hectares in the Amazon basin to restore biodiversity and sequester carbon.',
    createdAt: '2024-01-15T09:00:00.000Z',
  },
  {
    id: 'p2',
    name: 'Midwest Soil Carbon Program',
    type: 'SOIL_CARBON',
    status: ProjectStatus.SUBMITTED,
    developerId: '2',
    location: 'Iowa, USA',
    description: 'Regenerative agriculture practices across 10,000 farms in the US Midwest to build soil organic carbon.',
    createdAt: '2024-02-20T10:30:00.000Z',
  },
  {
    id: 'p3',
    name: 'Solar Farm Delta',
    type: 'RENEWABLE_ENERGY',
    status: ProjectStatus.UNDER_REVIEW,
    developerId: '2',
    location: 'Rajasthan, India',
    description: 'Utility-scale solar installation displacing coal generation, avoiding 120,000 tCO2 annually.',
    createdAt: '2024-03-10T08:00:00.000Z',
  },
  {
    id: 'p4',
    name: 'Cattle Ranch Methane Capture',
    type: 'METHANE_CAPTURE',
    status: ProjectStatus.DRAFT,
    developerId: '2',
    location: 'Mato Grosso, Brazil',
    description: 'Anaerobic digestion systems on cattle ranches to capture and utilize methane emissions.',
    createdAt: '2024-04-01T14:00:00.000Z',
  },
  {
    id: 'p5',
    name: 'Scottish Peatland Restoration',
    type: 'SOIL_CARBON',
    status: ProjectStatus.REJECTED,
    developerId: '2',
    location: 'Highlands, Scotland',
    description: 'Restoration of degraded peatland to prevent carbon release and restore natural hydrology.',
    createdAt: '2024-04-05T11:00:00.000Z',
  },
];

let idCounter = 6;

@Injectable()
export class ProjectService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  findAll(): Project[] {
    return projectStore;
  }

  findOne(id: string): Project {
    const project = projectStore.find((p) => p.id === id);
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  create(dto: CreateProjectDto, developerId: string): Project {
    const project: Project = {
      id: `p${idCounter++}`,
      name: dto.name,
      type: dto.type,
      status: ProjectStatus.DRAFT,
      developerId,
      location: dto.location,
      description: dto.description,
      createdAt: new Date().toISOString(),
    };
    projectStore.push(project);
    return project;
  }

  submit(id: string): Project {
    const project = this.findOne(id);
    project.status = ProjectStatus.SUBMITTED;
    this.eventEmitter.emit(EVENTS.PROJECT_SUBMITTED, { projectId: id, project });
    return project;
  }

  approve(id: string): Project {
    const project = this.findOne(id);
    project.status = ProjectStatus.APPROVED;
    this.eventEmitter.emit(EVENTS.PROJECT_APPROVED, { projectId: id, project });
    return project;
  }

  reject(id: string): Project {
    const project = this.findOne(id);
    project.status = ProjectStatus.REJECTED;
    this.eventEmitter.emit(EVENTS.PROJECT_REJECTED, { projectId: id, project });
    return project;
  }

  remove(id: string): { deleted: boolean } {
    const index = projectStore.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException(`Project ${id} not found`);
    projectStore.splice(index, 1);
    return { deleted: true };
  }
}
