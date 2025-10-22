import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async signup(dto: SignupDto) {
    const existing = await this.users.findOneByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');
    const user = await this.users.create(dto);
    return this.sign(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOneByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.sign(user.id, user.email, user.role);
  }

  private sign(sub: string, email: string, role: string) {
    const payload = { sub, email, role };
    return {
      accessToken: this.jwt.sign(payload),
      user: { id: sub, email, role },
    };
  }
}
