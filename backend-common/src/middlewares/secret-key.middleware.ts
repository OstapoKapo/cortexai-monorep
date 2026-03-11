import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecretKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const secretKey = req.headers["x-secret-key"] as string | undefined;
    const validSecret = process.env.INTERNAL_SECRET_KEY || 'my-default-secret';

    if (!secretKey || secretKey !== validSecret) {
      throw new UnauthorizedException('Invalid or missing secret key');
    }
    next();
  }
}
