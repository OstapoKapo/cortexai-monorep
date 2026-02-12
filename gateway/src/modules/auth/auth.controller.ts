import {
  Body,
  Controller,
  HttpException,
  Post,
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
import { AxiosError } from 'axios'; // 👈 1. Імпортуємо тип помилки

@Controller('auth')
export class AuthController {
  private readonly authServiceUrl: string | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL');
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
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<AuthResponseDto>(
          `${this.authServiceUrl}/auth/login`,
          loginDto,
        ),
      );
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const message = axiosError.message;
      
      console.error(`Помилка при виклику AuthService: ${message}`);

      if (axiosError.response) {
        throw new HttpException(
          axiosError.response.data || message, 
          axiosError.response.status || 500,
        );
      }
      throw new HttpException(message, 500);
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
  ): Promise<AuthResponseDto> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<AuthResponseDto>(
          `${this.authServiceUrl}/auth/register`,
          registerDto,
        ),
      );
      return data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const message = axiosError.message;

      console.error(`Помилка при виклику AuthService: ${message}`);

      if (axiosError.response) {
        throw new HttpException(
          axiosError.response.data || message,
          axiosError.response.status || 500,
        );
      }
      throw new HttpException(message, 500);
    }
  }
}