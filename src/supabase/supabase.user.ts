import { createClient } from '@supabase/supabase-js';

/**
 * Create Supabase client with user's JWT token
 * Used for authenticated requests
 * 
 * @param authHeader - Authorization header (Bearer token)
 * @returns Supabase client with user context
 */
export function createUserClient(authHeader: string) {
    return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
        global: {
            headers: {
                Authorization: authHeader,
            },
        },
    });
}

/**
 * Create Supabase client for public/anonymous access
 * Used for public endpoints (no authentication required)
 * 
 * @returns Supabase client with anonymous access
 */
export function createPublicClient() {
    return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
}
