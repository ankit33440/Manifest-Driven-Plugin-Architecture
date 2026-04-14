import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreditBatch } from './entities/credit-batch.entity';
import { ProjectDocument } from './entities/project-document.entity';
import { ProjectReview } from './entities/project-review.entity';
import { ProjectStatusHistory } from './entities/project-status-history.entity';
import { Project } from './entities/project.entity';
import { User, UserRole, UserStatus } from './entities/user.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgresql://postgres:admin123@localhost:5432/natures_registry_v3',
  entities: [User, Project, ProjectDocument, ProjectStatusHistory, ProjectReview, CreditBatch, AuditLog],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('Connected to database');

  const usersRepo = dataSource.getRepository(User);

  const seeds = [
    {
      email: 'admin@naturesregistry.com',
      password: 'Admin123!',
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.SUPERADMIN,
    },
    {
      email: 'dev@naturesregistry.com',
      password: 'Dev123!',
      firstName: 'Alice',
      lastName: 'Developer',
      role: UserRole.PROJECT_DEVELOPER,
    },
    {
      email: 'verifier@naturesregistry.com',
      password: 'Verify123!',
      firstName: 'Bob',
      lastName: 'Verifier',
      role: UserRole.VERIFIER,
    },
    {
      email: 'certifier@naturesregistry.com',
      password: 'Cert123!',
      firstName: 'Carol',
      lastName: 'Certifier',
      role: UserRole.CERTIFIER,
    },
    {
      email: 'buyer@naturesregistry.com',
      password: 'Buyer123!',
      firstName: 'Dave',
      lastName: 'Buyer',
      role: UserRole.BUYER,
    },
  ];

  for (const s of seeds) {
    const existing = await usersRepo.findOneBy({ email: s.email });
    if (existing) {
      console.log(`Skipping ${s.email} — already exists`);
      continue;
    }
    const passwordHash = await bcrypt.hash(s.password, 10);
    await usersRepo.save(
      usersRepo.create({
        email: s.email,
        passwordHash,
        firstName: s.firstName,
        lastName: s.lastName,
        role: s.role,
        status: UserStatus.ACTIVE,
      }),
    );
    console.log(`Seeded: ${s.email} (${s.role})`);
  }

  await dataSource.destroy();
  console.log('Done.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
