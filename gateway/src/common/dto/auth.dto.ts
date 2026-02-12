import { createZodDto, ZodDto } from 'nestjs-zod';
import { loginSchema, registerSchema } from '@cortex/shared';
import { ApiProperty } from '@nestjs/swagger';

const RegisterZodDto: ZodDto<typeof registerSchema> =
  createZodDto(registerSchema);
export class RegisterDto extends RegisterZodDto {}

const LoginZodDto: ZodDto<typeof loginSchema> = createZodDto(loginSchema);
export class LoginDto extends LoginZodDto {}

export class AuthResponseDto {
  @ApiProperty({
    example: 'User logged in successfully.',
    description: 'Повідомлення про успішний вхід користувача',
  })
  message: string;
}
