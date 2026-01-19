import {
    IsString,
    IsNumber,
    IsOptional,
    MinLength,
    MaxLength,
    IsIn,
    IsLatitude,
    IsLongitude,
} from 'class-validator';

/**
 * DTO for creating a new location
 * Used when users submit new restaurants/cafes
 */
export class CreateLocationDto {
    @IsString()
    @MinLength(3, { message: 'Name must be at least 3 characters' })
    @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
    name_vi: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    name_en?: string;

    @IsNumber()
    @IsLatitude({ message: 'Invalid latitude' })
    latitude: number;

    @IsNumber()
    @IsLongitude({ message: 'Invalid longitude' })
    longitude: number;

    @IsString()
    @MinLength(5, { message: 'Address must be at least 5 characters' })
    address_vi: string;

    @IsOptional()
    @IsString()
    address_en?: string;

    @IsString()
    district_vi: string;

    @IsOptional()
    @IsString()
    district_en?: string;

    @IsString()
    cuisine_vi: string;

    @IsOptional()
    @IsString()
    cuisine_en?: string;

    @IsIn(['food', 'cafe', 'bar'], { message: 'Category must be food, cafe, or bar' })
    category: 'food' | 'cafe' | 'bar';

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsString()
    hours_open?: string;

    @IsOptional()
    @IsString()
    hours_close?: string;

    @IsIn(['duoi-100k', '100-300k', '300-500k', 'tren-500k'], {
        message: 'Invalid price range',
    })
    price_range: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
    description_vi?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description_en?: string;
}
