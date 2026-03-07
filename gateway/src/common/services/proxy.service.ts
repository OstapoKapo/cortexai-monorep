import { Injectable, Logger, HttpException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { Response } from 'express';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  async forwardRequest<T = unknown>(
    axiosRequest: () => Promise<AxiosResponse<T>>,
    res: Response,
    options?: {
      forwardSetCookie?: boolean;
      logCorrelationId?: string;
    },
  ): Promise<T> {
    try {
      const response = await axiosRequest();
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
            (options?.logCorrelationId ? ` [${options.logCorrelationId}]` : ''),
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
