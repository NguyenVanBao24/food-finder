import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponse } from '../interfaces/api-response.interface';

/**
 * Global exception filter
 * Catches all exceptions and transforms them into a standard error format
 * 
 * Features:
 * - Consistent error response structure
 * - Proper HTTP status codes
 * - Error logging for debugging
 * - Handles both HttpException and unknown errors
 * 
 * @example
 * throw new NotFoundException('Location not found')
 * → { success: false, error: { code: 'NOT_FOUND', message: '...', statusCode: 404 } }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let code = 'INTERNAL_SERVER_ERROR';
        let details: any = null;

        // Handle NestJS HttpException
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;
                message = Array.isArray(responseObj.message)
                    ? responseObj.message.join(', ')
                    : responseObj.message || message;
                code = responseObj.error || this.getErrorCode(status);
                details = responseObj.details || null;
            } else {
                message = exceptionResponse as string;
                code = this.getErrorCode(status);
            }
        } else if (exception instanceof Error) {
            // Handle standard Error objects
            message = exception.message;
            this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
        } else {
            // Handle unknown exceptions
            this.logger.error('Unknown exception occurred', exception);
        }

        // Build error response
        const errorResponse: ErrorResponse = {
            success: false,
            error: {
                code: code.toUpperCase().replace(/ /g, '_'),
                message,
                statusCode: status,
                ...(details && { details }),
            },
            meta: {
                timestamp: new Date().toISOString(),
                path: request.url,
            },
        };

        // Log error for monitoring (only log 5xx errors in production)
        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url} - ${status} - ${message}`,
                exception instanceof Error ? exception.stack : '',
            );
        }

        response.status(status).json(errorResponse);
    }

    /**
     * Get error code from HTTP status
     */
    private getErrorCode(status: number): string {
        const codes: Record<number, string> = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'UNPROCESSABLE_ENTITY',
            429: 'TOO_MANY_REQUESTS',
            500: 'INTERNAL_SERVER_ERROR',
            502: 'BAD_GATEWAY',
            503: 'SERVICE_UNAVAILABLE',
        };

        return codes[status] || 'UNKNOWN_ERROR';
    }
}
