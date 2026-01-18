import { createZodDto, ZodDto } from 'nestjs-zod';
import { loginSchema, registerSchema } from '@cortex/shared';

const RegisterZodDto: ZodDto<typeof registerSchema> = createZodDto(registerSchema);
export class RegisterDto extends RegisterZodDto {}

const LoginZodDto: ZodDto<typeof loginSchema> = createZodDto(loginSchema);
export class LoginDto extends LoginZodDto {}
