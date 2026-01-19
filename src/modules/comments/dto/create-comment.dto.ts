import { IsString, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';

/**
 * DTO for creating a comment
 */
export class CreateCommentDto {
    @IsString()
    @MinLength(10, { message: 'Comment must be at least 10 characters' })
    @MaxLength(1000, { message: 'Comment cannot exceed 1000 characters' })
    content: string;

    @IsOptional()
    @IsUUID('4', { message: 'Invalid parent comment ID' })
    parent_id?: string; // For replies
}
