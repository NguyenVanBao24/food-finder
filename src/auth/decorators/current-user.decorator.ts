import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Current authenticated user data
 * Extracted from JWT token by auth guards
 */
export interface CurrentUserData {
    id: string;
    email: string;
    role: string;
}

/**
 * @CurrentUser() decorator
 * Extracts authenticated user from request object
 * 
 * Must be used with SupabaseAuthGuard or AdminGuard
 * 
 * @example
 * @Get('profile')
 * @UseGuards(SupabaseAuthGuard)
 * async getProfile(@CurrentUser() user: CurrentUserData) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): CurrentUserData | undefined => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
