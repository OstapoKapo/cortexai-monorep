import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from '@cortex/backend-common';
import { AppErrors } from '@cortex/shared';
import * as argon2 from 'argon2';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  email: string;
  sub: string;
  iat: number;
  exp: number;
}

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

  async refreshTokens(
    req: Request,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    const cookies = req.cookies as Record<string, string | undefined>;
    const refreshToken = cookies?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.getUserByEmail(payload.email);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('User not found');

    const valid = await argon2.verify(user.refreshToken, refreshToken);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const { accessToken, refreshToken: newRefreshToken } =
      await this.createTokens(user.id, user.email);
    await this.usersService.changeUserData(user.id, {
      refreshToken: await this.hashPassword(newRefreshToken),
    });

    return { accessToken, newRefreshToken };
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.changeUserData(userId, { refreshToken: null });
  }

  private async createTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const accessExpiresIn =
      this.configService.get<string>('JWT_ACCESS_EXPIRES') ?? '1h';
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES') ?? '7d';

    if (!accessSecret || !refreshSecret) {
      throw new Error(
        'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET environment variables are required',
      );
    }

    const payload = { sub: userId, email: email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: accessExpiresIn as `${number}h`,
        secret: accessSecret,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: refreshExpiresIn as `${number}d`,
        secret: refreshSecret,
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
