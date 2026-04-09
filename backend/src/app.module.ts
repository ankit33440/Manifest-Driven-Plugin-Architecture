import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { PluginLoaderModule } from './core/plugin-loader/plugin-loader.module';
import { ManifestRbacGuard } from './core/guards/manifest-rbac.guard';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PluginLoaderModule.forRoot() as any,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ManifestRbacGuard,
    },
  ],
})
export class AppModule {}
