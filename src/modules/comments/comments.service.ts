import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { createPublicClient, createUserClient } from '@/supabase/supabase.user';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

/**
 * Comments Service
 * Handles business logic for comments/reviews
 * 
 * Features:
 * - Nested comments (replies)
 * - Soft delete
 * - User ownership validation
 */
@Injectable()
export class CommentsService {
    /**
     * Get all comments for a location
     * Includes user information and nested replies
     * 
     * @param locationId - Location UUID
     * @returns Array of comments with user data
     */
    async findByLocation(locationId: string): Promise<any[]> {
        const supabase = createPublicClient();

        const { data, error } = await supabase
            .from('comments')
            .select(
                `
        *,
        user:users(id, name, avatar_url),
        replies:comments!parent_id(
          *,
          user:users(id, name, avatar_url)
        )
      `,
            )
            .eq('location_id', locationId)
            .eq('is_deleted', false)
            .is('parent_id', null) // Only get top-level comments
            .order('created_at', { ascending: false });

        if (error) {
            throw new BadRequestException('Failed to fetch comments');
        }

        return data || [];
    }

    /**
     * Create a new comment
     * 
     * @param locationId - Location UUID
     * @param dto - Comment data
     * @param userId - Authenticated user ID
     * @returns Created comment
     */
    async create(
        locationId: string,
        dto: CreateCommentDto,
        userId: string,
    ): Promise<Comment> {
        const supabase = createPublicClient();

        // If parent_id is provided, verify it exists
        if (dto.parent_id) {
            const { data: parentComment, error: parentError } = await supabase
                .from('comments')
                .select('id')
                .eq('id', dto.parent_id)
                .eq('location_id', locationId)
                .single();

            if (parentError || !parentComment) {
                throw new NotFoundException('Parent comment not found');
            }
        }

        const { data, error } = await supabase
            .from('comments')
            .insert({
                location_id: locationId,
                user_id: userId,
                content: dto.content,
                parent_id: dto.parent_id || null,
            })
            .select()
            .single();

        if (error) {
            throw new BadRequestException('Failed to create comment: ' + error.message);
        }

        return data;
    }

    /**
     * Update own comment
     * Only the comment owner can update
     * 
     * @param id - Comment UUID
     * @param dto - Updated content
     * @param userId - Authenticated user ID
     * @returns Updated comment
     */
    async update(id: string, dto: UpdateCommentDto, userId: string): Promise<Comment> {
        const supabase = createPublicClient();

        // Check ownership
        const { data: comment, error: fetchError } = await supabase
            .from('comments')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.user_id !== userId) {
            throw new ForbiddenException('You can only update your own comments');
        }

        // Update comment
        const { data, error } = await supabase
            .from('comments')
            .update({
                content: dto.content,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new BadRequestException('Failed to update comment');
        }

        return data;
    }

    /**
     * Soft delete comment
     * Only the comment owner can delete
     * 
     * @param id - Comment UUID
     * @param userId - Authenticated user ID
     * @returns Success message
     */
    async remove(id: string, userId: string): Promise<{ message: string }> {
        const supabase = createPublicClient();

        // Check ownership
        const { data: comment, error: fetchError } = await supabase
            .from('comments')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !comment) {
            throw new NotFoundException('Comment not found');
        }

        if (comment.user_id !== userId) {
            throw new ForbiddenException('You can only delete your own comments');
        }

        // Soft delete
        const { error } = await supabase
            .from('comments')
            .update({ is_deleted: true })
            .eq('id', id);

        if (error) {
            throw new BadRequestException('Failed to delete comment');
        }

        return { message: 'Comment deleted successfully' };
    }
}
