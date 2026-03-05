import { LoginDto, RegisterDto } from '@/common/dto/auth.dto';
import { Body, Controller, Req, Res, UsePipes } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Conflict. User already exists.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @UsePipes(ZodValidationPipe)
  @Throttle({
    short: { limit: 100, ttl: 60000 },
    long: { limit: 300, ttl: 60000 },
  })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message?: string }> {
    console.log('Register DTO:', dto);
    const result = await this.authService.register(dto);
    this.createCookie(res, result.accessToken, result.refreshToken);
    return { message: 'User registered successfully' };
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @UsePipes(ZodValidationPipe)
  @Throttle({
    short: { limit: 100, ttl: 60000 },
    long: { limit: 300, ttl: 60000 },
  })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message?: string }> {
    const result = await this.authService.login(dto);
    this.createCookie(res, result.accessToken, result.refreshToken);
    return { message: 'User logged in successfully' };
  }

  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Post('logout')
  async logout(
    @Req() req: Request & { user: { userId: string } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await this.authService.logout(req.user.userId);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/auth/refresh-token' });
    return { message: 'User logged out successfully' };
  }

  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({
    status: 200,
    description: 'Current user info retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User not logged in.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Post('me')
  me(): string {
    return 'me endpoint';
  }

  private createCookie(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie('accessToken', accessToken, {
      httpOnly: process.env.HTTP_ONLY === 'true',
      secure: process.env.SECURE === 'true',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: process.env.HTTP_ONLY === 'true',
      secure: process.env.SECURE === 'true',
      sameSite: 'strict',
      path: '/auth/refresh-token',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
