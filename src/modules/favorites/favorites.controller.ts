import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { CurrentUserData } from '@/auth/decorators/current-user.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

/**
 * Favorites Controller
 * Handles user's favorite locations
 * All endpoints require authentication
 */
@Controller()
@UseGuards(SupabaseAuthGuard)
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) { }

    /**
     * GET /favorites
     * Get current user's favorite locations
     * 
     * @param user - Authenticated user
     * @returns Array of favorite locations
     */
    @Get('favorites')
    async findAll(@CurrentUser() user: CurrentUserData) {
        return this.favoritesService.findAll(user.id);
    }

    /**
     * POST /locations/:locationId/favorite
     * Add location to favorites
     * 
     * @param locationId - Location UUID
     * @param user - Authenticated user
     * @returns Success message
     */
    @Post('locations/:locationId/favorite')
    async add(
        @Param('locationId') locationId: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.favoritesService.add(locationId, user.id);
    }

    /**
     * DELETE /locations/:locationId/favorite
     * Remove location from favorites
     * 
     * @param locationId - Location UUID
     * @param user - Authenticated user
     * @returns Success message
     */
    @Delete('locations/:locationId/favorite')
    async remove(
        @Param('locationId') locationId: string,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.favoritesService.remove(locationId, user.id);
    }
}
