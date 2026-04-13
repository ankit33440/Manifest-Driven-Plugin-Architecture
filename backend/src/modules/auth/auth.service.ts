import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InvitationStatus, UserStatus } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterInvitedDto } from './dto/register-invited.dto';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '../../common/constants/auth.constants';
import { AccessControlService } from './access-control.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly accessControlService: AccessControlService,
    private readonly auditService: AuditService,
  ) {}

  /** Authenticates an active user and creates a fresh session. */
  async login(dto: LoginDto, response: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(`User account is ${user.status.toLowerCase()}.`);
    }

    return this.createSession(user.id, response);
  }

  /** Rotates a refresh token and returns a new access session. */
  async refresh(request: Request, response: Response) {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required.');
    }

    const payload = this.verifyToken(refreshToken, 'JWT_REFRESH_SECRET');
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: String(payload.sub),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    let matchedTokenId: string | null = null;
    for (const token of activeTokens) {
      const matches = await bcrypt.compare(refreshToken, token.tokenHash);
      if (matches) {
        matchedTokenId = token.id;
        break;
      }
    }

    if (!matchedTokenId) {
      throw new UnauthorizedException('Refresh token is invalid.');
    }

    await this.prisma.refreshToken.update({
      where: { id: matchedTokenId },
      data: { revokedAt: new Date() },
    });

    return this.createSession(String(payload.sub), response);
  }

  /** Logs the user out by revoking the current refresh token and clearing cookies. */
  async logout(request: Request, response: Response) {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE];
    if (refreshToken) {
      const tokens = await this.prisma.refreshToken.findMany({
        where: {
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      for (const token of tokens) {
        const matches = await bcrypt.compare(refreshToken, token.tokenHash);
        if (matches) {
          await this.prisma.refreshToken.update({
            where: { id: token.id },
            data: { revokedAt: new Date() },
          });
          break;
        }
      }
    }

    this.clearCookies(response);
    return { success: true };
  }

  /** Registers a self-service project developer awaiting approval. */
  async registerDeveloper(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('An account with this email already exists.');
    }

    const developerRole = await this.prisma.role.findUnique({
      where: { name: 'PROJECT_DEVELOPER' },
    });

    if (!developerRole) {
      throw new BadRequestException('PROJECT_DEVELOPER role is not configured.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: UserStatus.PENDING_APPROVAL,
        userRoles: {
          create: {
            roleId: developerRole.id,
          },
        },
      },
    });

    await this.auditService.createLog({
      entityType: 'USER',
      entityId: user.id,
      action: 'REGISTERED',
      userId: user.id,
    });

    return {
      id: user.id,
      email: user.email,
      status: user.status,
    };
  }

  /** Validates an invitation token before the invited registration form is shown. */
  async validateInvitation(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: { role: true },
    });

    if (!invitation) {
      throw new BadRequestException('Invitation not found.');
    }

    if (invitation.status !== InvitationStatus.PENDING || invitation.expiresAt <= new Date()) {
      await this.expireInvitationIfNeeded(invitation.id, invitation.expiresAt, invitation.status);
      throw new BadRequestException('Invitation is no longer valid.');
    }

    return {
      email: invitation.email,
      role: invitation.role.name,
      expiresAt: invitation.expiresAt,
    };
  }

  /** Completes invited registration and immediately creates an authenticated session. */
  async registerInvited(dto: RegisterInvitedDto, response: Response) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token: dto.token },
    });

    if (!invitation) {
      throw new BadRequestException('Invitation not found.');
    }

    if (invitation.status !== InvitationStatus.PENDING || invitation.expiresAt <= new Date()) {
      await this.expireInvitationIfNeeded(invitation.id, invitation.expiresAt, invitation.status);
      throw new BadRequestException('Invitation is no longer valid.');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new BadRequestException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: invitation.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        status: UserStatus.ACTIVE,
        invitedById: invitation.invitedByUserId,
        userRoles: {
          create: {
            roleId: invitation.roleId,
          },
        },
      },
    });

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });

    return this.createSession(user.id, response);
  }

  /** Returns the authenticated user's flattened profile payload. */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const access = await this.accessControlService.getUserAccess(userId);

    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      roles: access.roles,
      permissions: access.permissions,
    };
  }

  /** Clears cached access for a single user after role changes. */
  invalidateAccess(userId: string) {
    this.accessControlService.invalidateUserAccess(userId);
  }

  private async createSession(userId: string, response: Response) {
    const user = await this.getMe(userId);
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        status: user.status,
        roles: user.roles,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_TTL', '15m'),
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        sessionId: randomUUID(),
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_TTL', '7d'),
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, 10),
        expiresAt: this.resolveExpiryDate(
          this.configService.get<string>('JWT_REFRESH_TTL', '7d'),
        ),
      },
    });

    response.cookie(ACCESS_TOKEN_COOKIE, accessToken, this.cookieOptions(false));
    response.cookie(REFRESH_TOKEN_COOKIE, refreshToken, this.cookieOptions(true));

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  private verifyToken(token: string, secretKey: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET') {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>(secretKey),
      });
    } catch {
      throw new UnauthorizedException('Token is invalid or expired.');
    }
  }

  private resolveExpiryDate(duration: string) {
    if (duration.endsWith('d')) {
      return new Date(Date.now() + Number(duration.replace('d', '')) * 24 * 60 * 60 * 1000);
    }

    if (duration.endsWith('h')) {
      return new Date(Date.now() + Number(duration.replace('h', '')) * 60 * 60 * 1000);
    }

    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  private cookieOptions(isRefreshToken: boolean) {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: isProduction,
      path: '/',
      maxAge: isRefreshToken ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000,
    };
  }

  private clearCookies(response: Response) {
    response.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
    response.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
  }

  private async expireInvitationIfNeeded(
    invitationId: string,
    expiresAt: Date,
    status: InvitationStatus,
  ) {
    if (status === InvitationStatus.PENDING && expiresAt <= new Date()) {
      await this.prisma.invitation.update({
        where: { id: invitationId },
        data: { status: InvitationStatus.EXPIRED },
      });
    }
  }
}
