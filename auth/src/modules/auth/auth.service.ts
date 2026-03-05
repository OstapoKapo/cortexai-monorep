import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from '@/common/dto/auth.dto';
import { AppErrors } from '@cortex/shared';
import * as argon2 from 'argon2';
import { User } from '@prisma/auth-client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  private async validateUser(dto: LoginDto): Promise<User> {
    const user = await this.usersService.getUserByEmail(dto.email);
    if (user === null)
      throw new UnauthorizedException(AppErrors.AUTH.INVALID_CREDENTIALS);
    if (
      !user.password ||
      !(await this.verifyPassword(dto.password, user.password))
    )
      throw new UnauthorizedException(AppErrors.AUTH.INVALID_CREDENTIALS);
    return user;
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, password);
    } catch {
      return false;
    }
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.validateUser(dto);
    return this.createTokens(user.id, user.email);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.changeUserData(userId, { refreshToken: null });
  }

  private async createTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email: email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '1h',
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }),
    ]);
    const hashedRefreshToken = await this.hashPassword(refreshToken);
    await this.usersService.changeUserData(userId, {
      refreshToken: hashedRefreshToken,
    });
    return { accessToken, refreshToken };
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const hashedPassword = await this.hashPassword(dto.password);
    const user = await this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });
    return this.createTokens(user.id, user.email);
  }

  private async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
  }
}
