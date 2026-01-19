import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import { createUserClient } from '@/supabase/supabase.user';

/**
 * Admin Guard
 * Ensures only users with 'admin' role can access protected endpoints
 * 
 * This guard:
 * 1. Validates JWT token
 * 2. Fetches user data from Supabase
 * 3. Checks if user.role === 'admin'
 * 4. Attaches user data to request object
 * 
 * @example
 * @Delete(':id')
 * @UseGuards(AdminGuard)
 * async deleteLocation(@Param('id') id: string) {
 *   // Only admins can access this
 * }
 */
@Injectable()
export class AdminGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('No authorization token provided');
        }

        try {
            const supabase = createUserClient(authHeader);

            // Verify JWT and get user
            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new UnauthorizedException('Invalid or expired token');
            }

            // Get user role from public.users table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (userError) {
                throw new ForbiddenException('User not found in database');
            }

            if (!userData || userData.role !== 'admin') {
                throw new ForbiddenException('Admin access required');
            }

            // Attach user data to request for use in controllers
            request.user = {
                id: user.id,
                email: user.email,
                role: userData.role,
            };

            return true;
        } catch (error) {
            if (
                error instanceof UnauthorizedException ||
                error instanceof ForbiddenException
            ) {
                throw error;
            }
            throw new UnauthorizedException('Authentication failed');
        }
    }
}
