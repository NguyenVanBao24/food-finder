import {
    Body,
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { CurrentUserData } from '@/auth/decorators/current-user.decorator';
import type { CreateLocationDto } from './dto/create-location.dto';
import type { UpdateLocationDto } from './dto/update-location.dto';
import type { LocationFiltersDto } from './dto/location-filters.dto';

/**
 * Locations Controller
 * Handles HTTP requests for location operations
 * 
 * Endpoints:
 * - GET /locations - List all approved locations (public, with filters)
 * - GET /locations/:id - Get single location details (public)
 * - POST /locations - Submit new location (authenticated)
 * - PUT /locations/:id - Update location (owner/admin)
 * - DELETE /locations/:id - Delete location (admin only)
 */
@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) { }

    /**
     * GET /locations
     * List all approved locations with optional filters
     * Public endpoint - no authentication required
     * 
     * @param filters - Query parameters for filtering and pagination
     * @returns Paginated list of locations
     * 
     * @example
     * GET /locations?cuisine=Hàn Quốc&district=Hải Châu&page=1&limit=20
     */
    @Get()
    async findAll(@Query() filters: LocationFiltersDto) {
        return this.locationsService.findAll(filters);
    }

    /**
     * GET /locations/:id
     * Get single location with full details
     * Public endpoint
     * 
     * @param id - Location UUID
     * @returns Location with photos, tags, etc.
     */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.locationsService.findOne(id);
    }

    /**
     * POST /locations
     * Submit new location for approval
     * Requires authentication
     * 
     * @param dto - Location data
     * @param user - Authenticated user
     * @returns Created location (status: pending)
     */
    @Post()
    @UseGuards(SupabaseAuthGuard)
    async create(
        @Body() dto: CreateLocationDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.locationsService.create(dto, user.id);
    }

    /**
     * PUT /locations/:id
     * Update location
     * Requires authentication and ownership or admin role
     * 
     * @param id - Location UUID
     * @param dto - Updated data
     * @param user - Authenticated user
     * @returns Updated location
     */
    @Put(':id')
    @UseGuards(SupabaseAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateLocationDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.locationsService.update(id, dto, user);
    }

    /**
     * DELETE /locations/:id
     * Delete location (admin only)
     * 
     * @param id - Location UUID
     * @returns Success message
     */
    @Delete(':id')
    @UseGuards(AdminGuard)
    async remove(@Param('id') id: string) {
        return this.locationsService.remove(id);
    }
}

