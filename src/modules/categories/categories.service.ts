import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createPublicClient } from '../../supabase/supabase.user';

@Injectable()
export class CategoriesService {
    private readonly supabase = createPublicClient();

    async findAll() {
        const { data, error } = await this.supabase
            .from('categories')
            .select('*')
            .order('order', { ascending: true });

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabase
            .from('categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) throw new NotFoundException('Category not found');
        return data;
    }
}
