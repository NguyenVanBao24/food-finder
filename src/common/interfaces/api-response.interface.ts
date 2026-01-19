/**
 * Standard API response interface for all endpoints
 * Ensures consistent response structure across the application
 */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta: {
        timestamp: string;
        pagination?: PaginationMeta;
    };
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        statusCode: number;
        details?: any;
    };
    meta: {
        timestamp: string;
        path?: string;
    };
}
