import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecretKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(process.env.INTERNAL_SECRET_KEY) 
    const secretKey = req.headers["x-internal-secret"] as string | undefined
    const validSecret = process.env.INTERNAL_SECRET_KEY || '';

    if (!secretKey || secretKey !== validSecret) {
      throw new UnauthorizedException('Invalid or missing secret key');
    }
    next();
  }
}
