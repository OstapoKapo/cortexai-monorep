import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../../common/services/proxy.service';
import type { AuthenticatedRequest } from '../../common/services/proxy.service';
import { AuthResponseDto, LoginDto, RegisterDto } from '@cortex/backend-common';
import { firstValueFrom } from 'rxjs';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { AtGuard } from '../../common/guards/at.guard';

@Controller('auth')
export class AuthController {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly proxyService: ProxyService,
  ) {
    this.authServiceUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ??
      'http://localhost:3002';
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @UsePipes(ZodValidationPipe)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
  ): Promise<AuthResponseDto> {
    return this.proxyService.forwardRequest<AuthResponseDto>(
      req,
      res,
      (headers) =>
        firstValueFrom(
          this.httpService.post<AuthResponseDto>(
            `${this.authServiceUrl}/auth/login`,
            loginDto,
            { headers },
          ),
        ),
      { forwardSetCookie: true },
    );
  }

  @Post('register')
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Conflict. User already exists.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @UsePipes(ZodValidationPipe)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
  ): Promise<AuthResponseDto> {
    return this.proxyService.forwardRequest<AuthResponseDto>(
      req,
      res,
      (headers) =>
        firstValueFrom(
          this.httpService.post(
            `${this.authServiceUrl}/auth/register`,
            registerDto,
            { headers },
          ),
        ),
      { forwardSetCookie: true },
    );
  }

  @UseGuards(AtGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    return this.proxyService.forwardRequest<{ message: string }>(
      req,
      res,
      (headers) =>
        firstValueFrom(
          this.httpService.post(
            `${this.authServiceUrl}/auth/logout`,
            {},
            { headers },
          ),
        ),
      { forwardSetCookie: true, forwardUserId: true },
    );
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string; refreshed: boolean }> {
    return this.proxyService.forwardRequest<{
      message: string;
      refreshed: boolean;
    }>(
      req,
      res,
      (headers) =>
        firstValueFrom(
          this.httpService.post(
            `${this.authServiceUrl}/auth/refresh-token`,
            {},
            { headers },
          ),
        ),
      { forwardSetCookie: true },
    );
  }

  @UseGuards(AtGuard)
  @Get('me')
  @HttpCode(200)
  async me(
    @Res({ passthrough: true }) res: Response,
    @Req() req: AuthenticatedRequest,
  ): Promise<any> {
    return this.proxyService.forwardRequest<any>(
      req,
      res,
      (headers) =>
        firstValueFrom(
          this.httpService.get(`${this.authServiceUrl}/auth/me`, { headers }),
        ),
      { forwardSetCookie: true, forwardUserId: true },
    );
  }
}
