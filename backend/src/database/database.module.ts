import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Project } from './entities/project.entity';
import { ProjectDocument } from './entities/project-document.entity';
import { ProjectStatusHistory } from './entities/project-status-history.entity';
import { ProjectReview } from './entities/project-review.entity';
import { CreditBatch } from './entities/credit-batch.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        entities: [User, Project, ProjectDocument, ProjectStatusHistory, ProjectReview, CreditBatch, AuditLog],
        synchronize: config.get('NODE_ENV', 'development') !== 'production',
        logging: config.get('NODE_ENV', 'development') === 'development',
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
