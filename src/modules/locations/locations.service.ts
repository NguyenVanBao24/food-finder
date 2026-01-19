import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    InternalServerErrorException,
} from '@nestjs/common';
import { createPublicClient, createUserClient } from '@/supabase/supabase.user';
import { PaginatedResponse } from '@/common/dto/pagination.dto';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationFiltersDto } from './dto/location-filters.dto';
import { CurrentUserData } from '@/auth/decorators/current-user.decorator';

/**
 * Locations Service
 * Handles all business logic for location operations
 * 
 * Responsibilities:
 * - CRUD operations for locations
 * - Filtering and searching
 * - Pagination
 * - Authorization checks (owner/admin)
 */
@Injectable()
export class LocationsService {
    /**
     * Get all approved locations with filters and pagination
     * Public endpoint - no authentication required
     * 
     * @param filters - Filter criteria (cuisine, district, price, tags, search)
     * @param userId - Optional user ID for personalized results
     * @returns Paginated list of locations
     */
    async findAll(
        filters: LocationFiltersDto,
        userId?: string,
    ): Promise<PaginatedResponse<Location>> {
        const {
            page = 1,
            limit = 20,
            cuisine,
            district,
            priceRange,
            tags,
            search,
            category,
        } = filters;

        const supabase = createPublicClient();

        // Build query
        let query = supabase
            .from('locations')
            .select('*', { count: 'exact' })
            .eq('status', 'approved');

        // Apply filters
        if (cuisine) {
            query = query.eq('cuisine_vi', cuisine);
        }

        if (district) {
            query = query.eq('district_vi', district);
        }

        if (priceRange) {
            query = query.eq('price_range', priceRange);
        }

        if (category) {
            query = query.eq('category', category);
        }

        if (search) {
            query = query.or(
                `name_vi.ilike.%${search}%,name_en.ilike.%${search}%,address_vi.ilike.%${search}%`,
            );
        }

        // TODO: Filter by tags (requires join with location_tags table)
        // This will be implemented when we add the location_tags module

        // Pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        // Order by created_at descending (newest first)
        query = query.order('created_at', { ascending: false });

        const { data, error, count } = await query;

        if (error) {
            throw new InternalServerErrorException('Failed to fetch locations');
        }

        return PaginatedResponse.create(data || [], page, limit, count || 0);
    }

    /**
     * Get single location by ID with full details
     * Includes photos and tags
     * 
     * @param id - Location UUID
     * @param userId - Optional user ID for personalized data
     * @returns Location with related data
     * @throws NotFoundException if location not found
     */
    async findOne(id: string, userId?: string): Promise<any> {
        const supabase = createPublicClient();

        const { data, error } = await supabase
            .from('locations')
            .select(
                `
        *,
        photos(id, url, is_primary),
        submitted_by_user:users!locations_submitted_by_fkey(id, name)
      `,
            )
            .eq('id', id)
            .eq('status', 'approved')
            .single();

        if (error || !data) {
            throw new NotFoundException(`Location with ID '${id}' not found`);
        }

        // TODO: Add tag statistics and user's favorite status
        // This will be implemented when we add location_tags and favorites modules

        return data;
    }

    /**
     * Create new location (pending approval)
     * Requires authentication
     * 
     * @param dto - Location data
     * @param userId - Authenticated user ID
     * @returns Created location
     */
    async create(dto: CreateLocationDto, userId: string): Promise<Location> {
        const supabase = createPublicClient();

        const { data, error } = await supabase
            .from('locations')
            .insert({
                ...dto,
                slug_vi: this.generateSlug(dto.name_vi),
                slug_en: dto.name_en ? this.generateSlug(dto.name_en) : null,
                status: 'pending',
                submitted_by: userId,
            })
            .select()
            .single();

        if (error) {
            throw new BadRequestException('Failed to create location: ' + error.message);
        }

        return data;
    }

    /**
     * Update location
     * Only owner or admin can update
     * 
     * @param id - Location UUID
     * @param dto - Updated data
     * @param user - Current user
     * @returns Updated location
     */
    async update(
        id: string,
        dto: UpdateLocationDto,
        user: CurrentUserData,
    ): Promise<Location> {
        const supabase = createPublicClient();

        // Check if location exists and get ownership info
        const { data: location, error: fetchError } = await supabase
            .from('locations')
            .select('*, location_owners!inner(user_id, status)')
            .eq('id', id)
            .single();

        if (fetchError || !location) {
            throw new NotFoundException(`Location with ID '${id}' not found`);
        }

        // Check authorization: admin OR approved owner
        const isAdmin = user.role === 'admin';
        const isOwner = location.location_owners?.some(
            (owner: any) => owner.user_id === user.id && owner.status === 'approved',
        );

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException('You do not have permission to update this location');
        }

        // Update location
        const { data, error } = await supabase
            .from('locations')
            .update({
                ...dto,
                ...(dto.name_vi && { slug_vi: this.generateSlug(dto.name_vi) }),
                ...(dto.name_en && { slug_en: this.generateSlug(dto.name_en) }),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new BadRequestException('Failed to update location: ' + error.message);
        }

        return data;
    }

    /**
     * Delete location (admin only)
     * 
     * @param id - Location UUID
     */
    async remove(id: string): Promise<{ message: string }> {
        const supabase = createPublicClient();

        const { error } = await supabase.from('locations').delete().eq('id', id);

        if (error) {
            throw new BadRequestException('Failed to delete location: ' + error.message);
        }

        return { message: 'Location deleted successfully' };
    }

    /**
     * Generate URL-friendly slug from Vietnamese text
     * 
     * @param text - Input text
     * @returns Slugified string
     * @example
     * "Quán Cơm Nhà" → "quan-com-nha"
     */
    private generateSlug(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
            .replace(/đ/g, 'd') // Replace đ
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
    }
}
