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
    /**
     * Get all tags grouped by category
     * 
     * @returns Object with positive and negative tags
     * @example
     * {
     *   positive: [{ id: '...', name_vi: 'Ăn ngon', ... }],
     *   negative: [{ id: '...', name_vi: 'Đắt', ... }]
     * }
     */
    async findAll(): Promise<{ positive: Tag[]; negative: Tag[] }> {
        const supabase = createPublicClient();

        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .order('name_vi', { ascending: true });

        if (error) {
            throw new Error('Failed to fetch tags');
        }

        // Group tags by category
        const positive = data.filter((tag) => tag.category === 'positive');
        const negative = data.filter((tag) => tag.category === 'negative');

        return { positive, negative };
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
