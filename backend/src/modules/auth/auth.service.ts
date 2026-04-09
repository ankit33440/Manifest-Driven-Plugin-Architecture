import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

const USERS = [
  { id: '1', email: 'admin@natures.io', password: 'admin123', role: 'SUPERADMIN', name: 'Admin User' },
  { id: '2', email: 'dev@natures.io', password: 'dev123', role: 'PROJECT_DEVELOPER', name: 'Dev User' },
  { id: '3', email: 'verifier@natures.io', password: 'verify123', role: 'VERIFIER', name: 'Verifier User' },
  { id: '4', email: 'certifier@natures.io', password: 'cert123', role: 'CERTIFIER', name: 'Certifier User' },
  { id: '5', email: 'buyer@natures.io', password: 'buyer123', role: 'BUYER', name: 'Buyer User' },
];

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(dto: LoginDto) {
    const user = USERS.find(
      (u) => u.email === dto.email && u.password === dto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    };
  }

  getMe(user: any) {
    return user;
  }
}
