import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationMeta } from '../interfaces/api-response.interface';

/**
 * Base pagination DTO for list endpoints
 * Provides consistent pagination parameters across all list queries
 * 
 * @example
 * GET /locations?page=1&limit=20
 */
export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Page must be an integer' })
    @Min(1, { message: 'Page must be at least 1' })
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer' })
    @Min(1, { message: 'Limit must be at least 1' })
    @Max(100, { message: 'Limit cannot exceed 100' })
    limit?: number = 20;
}

/**
 * Paginated response wrapper
 * Used by services to return data with pagination metadata
 */
export class PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;

    constructor(data: T[], meta: PaginationMeta) {
        this.data = data;
        this.meta = meta;
    }

    /**
     * Helper method to create paginated response
     */
    static create<T>(
        data: T[],
        page: number,
        limit: number,
        total: number,
    ): PaginatedResponse<T> {
        const totalPages = Math.ceil(total / limit);

        return new PaginatedResponse(data, {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        });
    }
}
