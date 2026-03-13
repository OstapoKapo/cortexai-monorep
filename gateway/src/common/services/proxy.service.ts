import { randomBytes } from 'crypto';
import { Injectable, Logger, HttpException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { Response, Request } from 'express';

export type AuthenticatedRequest = Request & {
  correlationID: string;
  user?: { userId: string; email: string };
};
@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly internalSecret: string;

  constructor() {
    this.internalSecret =
      process.env.INTERNAL_SECRET_KEY || randomBytes(32).toString('hex');
  }

  async forwardRequest<T = unknown>(
    req: AuthenticatedRequest,
    res: Response,
    axiosRequest: (
      headers: Record<string, string>,
    ) => Promise<AxiosResponse<T>>,
    options?: {
      forwardSetCookie?: boolean;
      forwardUserId?: boolean;
      extraHeaders?: Record<string, string>;
    },
  ): Promise<T> {
    const correlationId = req.correlationID;

    try {
      const headers: Record<string, string> = {
        'X-Internal-Secret': this.internalSecret,
        'X-Correlation-ID': correlationId,
      };

      if (options?.forwardUserId && req.user?.userId) {
        headers['X-User-Id'] = req.user.userId;
      }

      if (options?.extraHeaders) {
        Object.assign(headers, options.extraHeaders);
      }

      // Forward cookies from client to downstream service
      if (req.headers.cookie) {
        headers['cookie'] = req.headers.cookie;
      }

      const response = await axiosRequest(headers);

      if (options?.forwardSetCookie && response.headers['set-cookie']) {
        this.forwardSetCookieHeaders(response.headers['set-cookie'], res);
      }

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error;
        const message = axiosError.message || 'Downstream service unavailable';
        this.logger.error(
          `Proxy error: ${message}` +
            (correlationId ? ` [${correlationId}]` : ''),
        );
        if (axiosError.response) {
          throw new HttpException(
            (axiosError.response.data as string | object | undefined) ||
              message,
            axiosError.response.status || 500,
          );
        }
        throw new HttpException(message, 503);
      }
      throw new HttpException('Unexpected proxy error', 500);
    }
  }

  forwardSetCookieHeaders(
    setCookieHeader: string[] | string,
    res: Response,
  ): void {
    if (Array.isArray(setCookieHeader) && setCookieHeader.length > 0) {
      res.setHeader('Set-Cookie', setCookieHeader);
    } else if (
      typeof setCookieHeader === 'string' &&
      setCookieHeader.length > 0
    ) {
      res.setHeader('Set-Cookie', [setCookieHeader]);
    }
  }
}
