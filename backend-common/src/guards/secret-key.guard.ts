import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SecretKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const secretKey = request.headers['x-internal-secret'] as string | undefined;
    const validSecret = process.env.INTERNAL_SECRET_KEY || '';
    console.log('[SecretKeyGuard] ENV:', validSecret, '| Header:', secretKey);
    if (!secretKey || secretKey !== validSecret) {
      throw new UnauthorizedException('Invalid or missing secret key');
    }
    return true;
  }
}
