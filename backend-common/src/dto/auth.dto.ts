import { ApiProperty } from '@nestjs/swagger';
import { createZodDto, ZodDto } from 'nestjs-zod';
import { loginSchema, registerSchema } from '@cortex/shared';

// --- Register/Login DTO ---
const RegisterZodDto: ZodDto<typeof registerSchema> = createZodDto(registerSchema);
export class RegisterDto extends RegisterZodDto {}

const LoginZodDto: ZodDto<typeof loginSchema> = createZodDto(loginSchema);
export class LoginDto extends LoginZodDto {}

// --- Response DTO ---
export class AuthResponseDto {
  @ApiProperty({
    example: 'User logged in successfully.',
    description: 'Повідомлення про успішний вхід користувача',
  })
  message!: string;
}

export class BasicResponseDto {
  @ApiProperty({
    example: 'Operation successful.',
    description: 'Базове повідомлення про успішну операцію',
  })
  message!: string;
}
