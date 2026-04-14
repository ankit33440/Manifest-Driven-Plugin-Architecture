import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const userId = (req as any).user?.id ?? 'anonymous';

    return next.handle().pipe(
      tap((responseBody: any) => {
        if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
          this.eventEmitter.emit('http.mutation', {
            userId,
            method: req.method,
            path: req.path,
            entityId: responseBody?.id ?? null,
          });
        }
      }),
    );
  }
}
