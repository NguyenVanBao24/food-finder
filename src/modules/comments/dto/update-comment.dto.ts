import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO for updating a comment
 */
export class UpdateCommentDto {
    @IsString()
    @MinLength(10, { message: 'Comment must be at least 10 characters' })
    @MaxLength(1000, { message: 'Comment cannot exceed 1000 characters' })
    content: string;
}
