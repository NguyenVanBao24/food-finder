import { Injectable, NotFoundException } from '@nestjs/common';
import { createPublicClient } from '@/supabase/supabase.user';
import { Tag } from './entities/tag.entity';

/**
 * Tags Service
 * Handles business logic for tag operations
 * 
 * Tags are predefined and used for voting on locations
 * Example: "Ăn ngon", "View đẹp", "Romantic", etc.
 */
@Injectable()
export class TagsService {
    async findAll(): Promise<Tag[]> {
        const supabase = createPublicClient();

        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .order('name_vi', { ascending: true });

        if (error) {
            throw new Error('Failed to fetch tags');
        }

        return data;
    }

    /**
     * Get single tag by ID
     * 
     * @param id - Tag UUID
     * @returns Tag object
     * @throws NotFoundException if tag not found
     */
    async findOne(id: string): Promise<Tag> {
        const supabase = createPublicClient();

        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            throw new NotFoundException(`Tag with ID '${id}' not found`);
        }

        return data;
    }
}
