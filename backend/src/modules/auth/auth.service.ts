import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { EVENTS } from '../../core/events/carbon.events';
import { User, UserStatus } from '../../database/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOneBy({
      email: dto.email.toLowerCase(),
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(`Account is ${user.status}`);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
    };
    const token = this.jwtService.sign(payload);
    return { token, user: payload };
  }

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      status: UserStatus.PENDING_APPROVAL,
    });
    const saved = await this.usersRepo.save(user);

    this.eventEmitter.emit(EVENTS.USER_REGISTERED, {
      userId: saved.id,
      email: saved.email,
      role: saved.role,
    });

    return { message: 'Registration submitted. Awaiting approval.' };
  }

  getMe(user: any) {
    return user;
  }
}
