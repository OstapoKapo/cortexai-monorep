import {
  Body,
  Controller,
  HttpException,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  AuthResponseDto,
  LoginDto,
  RegisterDto,
} from 'src/common/dto/auth.dto';
import { firstValueFrom } from 'rxjs';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiResponse } from '@nestjs/swagger';
import axios, { AxiosError } from 'axios';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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
  ): Promise<AuthResponseDto> {
    try {
      const authResponse = await firstValueFrom(
        this.httpService.post<AuthResponseDto>(
          `${this.authServiceUrl}/auth/login`,
          loginDto,
        ),
      );
      this.forwardSetCookieHeaders(authResponse.headers['set-cookie'], res);
      return authResponse.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError: AxiosError = error;
        const message = axiosError.message || 'Auth service is unavailable';
        console.error(`Помилка при виклику AuthService: ${message}`);

        if (axiosError.response) {
          throw new HttpException(
            axiosError.response.data || message,
            axiosError.response.status || 500,
          );
        }

        throw new HttpException(message, 503);
      }

      throw new HttpException('Unexpected auth gateway error', 500);
    }
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
  ): Promise<AuthResponseDto> {
    try {
      const authResponse = await firstValueFrom(
        this.httpService.post<AuthResponseDto>(
          `${this.authServiceUrl}/auth/register`,
          registerDto,
        ),
      );
      this.forwardSetCookieHeaders(authResponse.headers['set-cookie'], res);
      return authResponse.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError: AxiosError = error;
        const message = axiosError.message || 'Auth service is unavailable';
        console.error(`Помилка при виклику AuthService: ${message}`);

        if (axiosError.response) {
          throw new HttpException(
            axiosError.response.data || message,
            axiosError.response.status || 500,
          );
        }

        throw new HttpException(message, 503);
      }

      throw new HttpException('Unexpected auth gateway error', 500);
    }
  }

  private forwardSetCookieHeaders(
    setCookieHeader: string[] | string | undefined,
    res: Response,
  ): void {
    if (Array.isArray(setCookieHeader) && setCookieHeader.length > 0) {
      res.setHeader('Set-Cookie', setCookieHeader);
      return;
    }

    if (typeof setCookieHeader === 'string' && setCookieHeader.length > 0) {
      res.setHeader('Set-Cookie', [setCookieHeader]);
    }
  }
}
