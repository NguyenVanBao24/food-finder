import { Injectable, BadRequestException } from '@nestjs/common';
import { createPublicClient } from '@/supabase/supabase.user';

/**
 * Favorites Service
 * Handles user's favorite locations
 */
@Injectable()
export class FavoritesService {
    /**
     * Get user's favorite locations
     * 
     * @param userId - Authenticated user ID
     * @returns Array of favorite locations
     */
    async findAll(userId: string): Promise<any[]> {
        const supabase = createPublicClient();

        const { data, error } = await supabase
            .from('favorites')
            .select(
                `
        created_at,
        location:locations(*)
      `,
            )
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new BadRequestException('Failed to fetch favorites');
        }

        return data || [];
    }

    /**
     * Add location to favorites
     * 
     * @param locationId - Location UUID
     * @param userId - Authenticated user ID
     * @returns Success message
     */
    async add(locationId: string, userId: string): Promise<{ message: string }> {
        const supabase = createPublicClient();

        const { error } = await supabase.from('favorites').insert({
            user_id: userId,
            location_id: locationId,
        });

        if (error) {
            // Handle duplicate (already favorited)
            if (error.code === '23505') {
                throw new BadRequestException('Location already in favorites');
            }
            throw new BadRequestException('Failed to add favorite');
        }

        return { message: 'Added to favorites successfully' };
    }

    /**
     * Remove location from favorites
     * 
     * @param locationId - Location UUID
     * @param userId - Authenticated user ID
     * @returns Success message
     */
    async remove(locationId: string, userId: string): Promise<{ message: string }> {
        const supabase = createPublicClient();

        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('location_id', locationId);

        if (error) {
            throw new BadRequestException('Failed to remove favorite');
        }

        return { message: 'Removed from favorites successfully' };
    }
}
