import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { SupabaseAuthGuard } from '@/auth/supabase-auth.guard';
import type { CurrentUserData } from '@/auth/decorators/current-user.decorator';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { CreateCommentDto } from './dto/create-comment.dto';
import type { UpdateCommentDto } from './dto/update-comment.dto';

/**
 * Comments Controller
 * Handles HTTP requests for comments/reviews
 * 
 * Endpoints:
 * - GET /locations/:locationId/comments - List comments (public)
 * - POST /locations/:locationId/comments - Create comment (authenticated)
 * - PUT /comments/:id - Update own comment (authenticated)
 * - DELETE /comments/:id - Delete own comment (authenticated)
 */
@Controller()
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    /**
     * GET /locations/:locationId/comments
     * Get all comments for a location
     * Public endpoint
     * 
     * @param locationId - Location UUID
     * @returns Array of comments with nested replies
     */
    @Get('locations/:locationId/comments')
    async findByLocation(@Param('locationId') locationId: string) {
        return this.commentsService.findByLocation(locationId);
    }

    /**
     * POST /locations/:locationId/comments
     * Create a new comment or reply
     * Requires authentication
     * 
     * @param locationId - Location UUID
     * @param dto - Comment data (content, optional parent_id)
     * @param user - Authenticated user
     * @returns Created comment
     */
    @Post('locations/:locationId/comments')
    @UseGuards(SupabaseAuthGuard)
    async create(
        @Param('locationId') locationId: string,
        @Body() dto: CreateCommentDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.commentsService.create(locationId, dto, user.id);
    }

    /**
     * PUT /comments/:id
     * Update own comment
     * Requires authentication and ownership
     * 
     * @param id - Comment UUID
     * @param dto - Updated content
     * @param user - Authenticated user
     * @returns Updated comment
     */
    @Put('comments/:id')
    @UseGuards(SupabaseAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCommentDto,
        @CurrentUser() user: CurrentUserData,
    ) {
        return this.commentsService.update(id, dto, user.id);
    }

    /**
     * DELETE /comments/:id
     * Soft delete own comment
     * Requires authentication and ownership
     * 
     * @param id - Comment UUID
     * @param user - Authenticated user
     * @returns Success message
     */
    @Delete('comments/:id')
    @UseGuards(SupabaseAuthGuard)
    async remove(@Param('id') id: string, @CurrentUser() user: CurrentUserData) {
        return this.commentsService.remove(id, user.id);
    }
}
