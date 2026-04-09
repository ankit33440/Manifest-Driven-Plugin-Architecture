import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EVENTS } from '../../core/events/carbon.events';
import { IssueCreditDto } from './dto/issue-credit.dto';

export enum CreditStatus {
  ACTIVE = 'ACTIVE',
  RETIRED = 'RETIRED',
  PENDING = 'PENDING',
}

export interface Credit {
  id: string;
  serialNumber: string;
  projectId: string;
  projectName: string;
  carbonTonnes: number;
  status: CreditStatus;
  issuedBy: string;
  issuedAt: string;
  vintageYear: number;
}

let creditStore: Credit[] = [
  {
    id: 'c1',
    serialNumber: 'CCR-2024-0001',
    projectId: 'p1',
    projectName: 'Amazon Reforestation Initiative',
    carbonTonnes: 5000,
    status: CreditStatus.ACTIVE,
    issuedBy: '4',
    issuedAt: '2024-02-01T10:00:00.000Z',
    vintageYear: 2024,
  },
  {
    id: 'c2',
    serialNumber: 'CCR-2024-0002',
    projectId: 'p1',
    projectName: 'Amazon Reforestation Initiative',
    carbonTonnes: 3000,
    status: CreditStatus.RETIRED,
    issuedBy: '4',
    issuedAt: '2024-02-15T10:00:00.000Z',
    vintageYear: 2024,
  },
  {
    id: 'c3',
    serialNumber: 'CCR-2024-0003',
    projectId: 'p1',
    projectName: 'Amazon Reforestation Initiative',
    carbonTonnes: 2000,
    status: CreditStatus.ACTIVE,
    issuedBy: '4',
    issuedAt: '2024-03-01T10:00:00.000Z',
    vintageYear: 2024,
  },
  {
    id: 'c4',
    serialNumber: 'CCR-2024-0004',
    projectId: 'p3',
    projectName: 'Solar Farm Delta',
    carbonTonnes: 10000,
    status: CreditStatus.PENDING,
    issuedBy: '4',
    issuedAt: '2024-03-20T10:00:00.000Z',
    vintageYear: 2024,
  },
  {
    id: 'c5',
    serialNumber: 'CCR-2024-0005',
    projectId: 'p3',
    projectName: 'Solar Farm Delta',
    carbonTonnes: 8000,
    status: CreditStatus.ACTIVE,
    issuedBy: '4',
    issuedAt: '2024-03-25T10:00:00.000Z',
    vintageYear: 2024,
  },
  {
    id: 'c6',
    serialNumber: 'CCR-2023-0006',
    projectId: 'p1',
    projectName: 'Amazon Reforestation Initiative',
    carbonTonnes: 1500,
    status: CreditStatus.RETIRED,
    issuedBy: '4',
    issuedAt: '2023-12-01T10:00:00.000Z',
    vintageYear: 2023,
  },
  {
    id: 'c7',
    serialNumber: 'CCR-2024-0007',
    projectId: 'p2',
    projectName: 'Midwest Soil Carbon Program',
    carbonTonnes: 4500,
    status: CreditStatus.PENDING,
    issuedBy: '4',
    issuedAt: '2024-04-01T10:00:00.000Z',
    vintageYear: 2024,
  },
  {
    id: 'c8',
    serialNumber: 'CCR-2024-0008',
    projectId: 'p1',
    projectName: 'Amazon Reforestation Initiative',
    carbonTonnes: 6000,
    status: CreditStatus.ACTIVE,
    issuedBy: '1',
    issuedAt: '2024-04-05T10:00:00.000Z',
    vintageYear: 2024,
  },
];

let idCounter = 9;
let serialCounter = 9;

function generateSerial(): string {
  const year = new Date().getFullYear();
  return `CCR-${year}-${String(serialCounter++).padStart(4, '0')}`;
}

@Injectable()
export class CreditsService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @OnEvent(EVENTS.PROJECT_APPROVED)
  handleProjectApproved(payload: { projectId: string; project: any }) {
    const credit: Credit = {
      id: `c${idCounter++}`,
      serialNumber: generateSerial(),
      projectId: payload.projectId,
      projectName: payload.project.name,
      carbonTonnes: 1000,
      status: CreditStatus.PENDING,
      issuedBy: 'system',
      issuedAt: new Date().toISOString(),
      vintageYear: new Date().getFullYear(),
    };
    creditStore.push(credit);
    console.log(`[Credits] Auto-created PENDING credit ${credit.serialNumber} for project ${payload.projectId}`);
    this.eventEmitter.emit(EVENTS.CREDIT_ISSUED, { creditId: credit.id, credit });
  }

  findAll(): Credit[] {
    return creditStore;
  }

  findOne(id: string): Credit {
    const credit = creditStore.find((c) => c.id === id);
    if (!credit) throw new NotFoundException(`Credit ${id} not found`);
    return credit;
  }

  issue(dto: IssueCreditDto, issuedBy: string): Credit {
    const credit: Credit = {
      id: `c${idCounter++}`,
      serialNumber: generateSerial(),
      projectId: dto.projectId,
      projectName: dto.projectName || `Project ${dto.projectId}`,
      carbonTonnes: dto.carbonTonnes,
      status: CreditStatus.ACTIVE,
      issuedBy,
      issuedAt: new Date().toISOString(),
      vintageYear: dto.vintageYear,
    };
    creditStore.push(credit);
    this.eventEmitter.emit(EVENTS.CREDIT_ISSUED, { creditId: credit.id, credit });
    return credit;
  }

  retire(id: string): Credit {
    const credit = this.findOne(id);
    credit.status = CreditStatus.RETIRED;
    this.eventEmitter.emit(EVENTS.CREDIT_RETIRED, { creditId: id, credit });
    return credit;
  }

  remove(id: string): { deleted: boolean } {
    const index = creditStore.findIndex((c) => c.id === id);
    if (index === -1) throw new NotFoundException(`Credit ${id} not found`);
    creditStore.splice(index, 1);
    return { deleted: true };
  }
}
