import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { ProjectModule } from './modules/project/project.module';
import { VerifierModule } from './modules/verifier/verifier.module';
import { CertifierModule } from './modules/certifier/certifier.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    AuthModule,
    ProjectModule,
    AuditModule,
    EmailModule,
    VerifierModule,
    CertifierModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
