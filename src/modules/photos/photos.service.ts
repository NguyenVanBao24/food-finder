import { Injectable, BadRequestException } from '@nestjs/common';
import { createPublicClient } from '../../supabase/supabase.user';

@Injectable()
export class PhotosService {
    private readonly supabase = createPublicClient();

    async findByLocation(locationId: string) {
        const { data, error } = await this.supabase
            .from('photos')
            .select('*')
            .eq('location_id', locationId)
            .order('is_primary', { ascending: false });

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async create(locationId: string, userId: string, url: string, isPrimary: boolean = false) {
        // If setting as primary, unset others for this location
        if (isPrimary) {
            await this.supabase
                .from('photos')
                .update({ is_primary: false })
                .eq('location_id', locationId);
        }

        const { data, error } = await this.supabase
            .from('photos')
            .insert({
                location_id: locationId,
                user_id: userId,
                url,
                is_primary: isPrimary
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async setPrimary(photoId: string, locationId: string, userId: string) {
        // Check ownership or admin (simplified to ownership for now)
        const { data: photo } = await this.supabase
            .from('photos')
            .select('user_id')
            .eq('id', photoId)
            .single();

        if (!photo || photo.user_id !== userId) {
            throw new BadRequestException('Not authorized to modify this photo');
        }

        // Unset current primary
        await this.supabase
            .from('photos')
            .update({ is_primary: false })
            .eq('location_id', locationId);

        // Set new primary
        const { data, error } = await this.supabase
            .from('photos')
            .update({ is_primary: true })
            .eq('id', photoId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async delete(photoId: string, userId: string) {
        const { error } = await this.supabase
            .from('photos')
            .delete()
            .match({ id: photoId, user_id: userId });

        if (error) throw new BadRequestException(error.message);
        return { success: true };
    }
}
