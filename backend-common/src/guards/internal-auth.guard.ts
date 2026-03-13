import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.headers['x-user-id'];

    // Якщо Gateway не передав userId, значить користувач не авторизований
    if (!userId || typeof userId !== 'string') {
      throw new UnauthorizedException('User is not authenticated');
    }

    // Кладемо userId в об'єкт запиту, щоб ваш старий код працював без змін!
    // @ts-ignore - ігноруємо типізацію express, бо ми динамічно додаємо user
    request.user = { userId };

    return true;
  }
}