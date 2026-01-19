import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { createUserClient } from '@/supabase/supabase.user';
import type { CurrentUserData } from './decorators/current-user.decorator';

/**
 * Supabase Authentication Guard
 * Validates JWT token and attaches user data to request
 * 
 * This guard:
 * 1. Checks for Authorization header
 * 2. Validates JWT token with Supabase
 * 3. Fetches user data from public.users table
 * 4. Attaches user data to request.user
 * 
 * @example
 * @Post()
 * @UseGuards(SupabaseAuthGuard)
 * async create(@CurrentUser() user: CurrentUserData) {
 *   // user.id, user.email, user.role available
 * }
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Missing Authorization header');
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
                .select('role, name, email')
                .eq('id', user.id)
                .single();

            // If user doesn't exist in public.users, create basic record
            if (userError || !userData) {
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: user.id,
                        email: user.email,
                        role: 'user',
                    });

                if (insertError) {
                    throw new UnauthorizedException('Failed to create user record');
                }

                // Attach basic user data
                request.user = {
                    id: user.id,
                    email: user.email,
                    role: 'user',
                } as CurrentUserData;
            } else {
                // Attach full user data
                request.user = {
                    id: user.id,
                    email: userData.email || user.email,
                    role: userData.role || 'user',
                } as CurrentUserData;
            }

            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Authentication failed');
        }
    }
}

