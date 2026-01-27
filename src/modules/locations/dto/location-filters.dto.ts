import { IsOptional, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@/common/dto/pagination.dto';

/**
 * DTO for filtering locations
 * Extends PaginationDto to include pagination parameters
 * 
 * @example
 * GET /locations?cuisine=Hàn Quốc&district=Hải Châu&page=1&limit=20
 */
export class LocationFiltersDto extends PaginationDto {
    @IsOptional()
    @IsString()
    cuisine?: string;

    @IsOptional()
    @IsString()
    district?: string;

    @IsOptional()
    @IsString()
    priceRange?: string;

    @IsOptional()
    @IsArray()
    @Type(() => String)
    tags?: string[];

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    category_id?: string; // food | cafe | bar
}
