import { createZodDto } from 'nestjs-zod';
import { loginSchema, registerSchema } from '@cortex/shared';

const BaseRegisterDto = createZodDto(registerSchema);
export class RegisterDto extends (BaseRegisterDto as new () => any) {}

const BaseLoginDto = createZodDto(loginSchema);
export class LoginDto extends (BaseLoginDto as new () => any) {}
