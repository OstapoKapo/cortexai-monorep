import {
  BasicResponseDto,
  LoginDto,
  RegisterDto,
} from '@cortex/backend-common';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { InternalAuthGuard, UserId } from '@cortex/backend-common';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
    type: BasicResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Conflict. User already exists.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @UsePipes(ZodValidationPipe)
  @Post('register')
  @HttpCode(201)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BasicResponseDto> {
    this.logger.debug(`Register attempt for email: ${dto.email}`);
    const result = await this.authService.register(dto);
    this.createCookie(res, result.accessToken, result.refreshToken);
    return { message: 'User registered successfully' };
  }

  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
    type: BasicResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @UsePipes(ZodValidationPipe)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BasicResponseDto> {
    const result = await this.authService.login(dto);
    this.createCookie(res, result.accessToken, result.refreshToken);
    return { message: 'User logged in successfully' };
  }

  @UseGuards(InternalAuthGuard)
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully.',
    type: BasicResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User not logged in.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @UserId() userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<BasicResponseDto> {
    await this.authService.logout(userId);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/auth/refresh-token' });
    return { message: 'User logged out successfully' };
  }

  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully.',
    type: BasicResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing refresh token.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request & { user: { userId: string } },
    @Res({ passthrough: true }) res: Response,
  ): Promise<BasicResponseDto & { refreshed: boolean }> {
    const { accessToken, newRefreshToken } =
      await this.authService.refreshTokens(req);
    this.createCookie(res, accessToken, newRefreshToken);
    return { message: 'Tokens refreshed successfully', refreshed: true };
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
  @Get('me')
  @HttpCode(HttpStatus.OK)
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
