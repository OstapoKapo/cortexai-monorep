import { LoginDto, RegisterDto } from '@/common/dto/auth.dto';
import { Body, Controller, UsePipes } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Conflict. User already exists.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @UsePipes(ZodValidationPipe)
  @Post('register')
  register(@Body() dto: RegisterDto): string {
    console.log(dto);
    return 'register endpoint';
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
  @Post('login')
  login(@Body() dto: LoginDto): string {
    console.log(dto);
    return 'login endpoint';
  }

  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  @Post('logout')
  logout(): string {
    return 'logout endpoint';
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
}
