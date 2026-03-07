import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger, 
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '@cortex/shared'; 

interface IRequestCorrelation extends Request {
  correlationID?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<IRequestCorrelation>();

    const correlationID = request.correlationID;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorName = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message ?? message;
        errorName = (res as any).error ?? exception.name;
      }
    } else if (exception instanceof Error) {
        errorName = exception.name;
        // message = exception.message; 
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error: errorName,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationID,
    };

    const service = process.env.npm_package_name || process.env.SERVICE_NAME || 'unknown-service';



    this.logger.error(
      `[${service}] [${status}] ${request.method} ${request.url} - Error: ${JSON.stringify({ ...errorResponse, service })}`,
      exception instanceof Error ? exception.stack : String(exception)
    );

    response.status(status).json(errorResponse);
  }
}