import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Global response transformation interceptor
 * Automatically wraps all successful responses in a standard format
 * 
 * This ensures consistent response structure across all endpoints:
 * - Adds success: true flag
 * - Wraps data in data field
 * - Adds metadata (timestamp, pagination if present)
 * 
 * @example
 * Controller returns: { id: 1, name: 'Test' }
 * Client receives: { success: true, data: { id: 1, name: 'Test' }, meta: { timestamp: '...' } }
 */
@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        return next.handle().pipe(
            map((data) => {
                // If response already has success field, return as is
                // This allows controllers to override the standard format if needed
                if (data && typeof data === 'object' && 'success' in data) {
                    return data as ApiResponse<T>;
                }

                // Check if data is a PaginatedResponse (has data and meta fields)
                const isPaginated = data && typeof data === 'object' && 'data' in data && 'meta' in data;

                // Transform to standard format
                const response: ApiResponse<T> = {
                    success: true,
                    data: isPaginated ? data.data : data,
                    meta: {
                        timestamp: new Date().toISOString(),
                        ...(isPaginated && { pagination: data.meta }),
                    },
                };

                return response;
            }),
        );
    }
}
