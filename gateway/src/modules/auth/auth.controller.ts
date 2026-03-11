import { Body, Controller, Post, Req, Res, UsePipes } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ProxyService } from '../../common/services/proxy.service';
import type { AuthenticatedRequest } from '../../common/services/proxy.service';
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
} from 'src/common/dto/auth.dto';
import { firstValueFrom } from 'rxjs';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';

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
}
