import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

function extractToken(request: Request): string | null {
  const cookieToken = request.cookies?.nr_access_token;
  if (cookieToken) {
    return cookieToken;
  }

  return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractToken]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: Record<string, unknown>) {
    return payload;
  }
}
