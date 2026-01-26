import { Injectable, BadRequestException } from '@nestjs/common';
import { createPublicClient } from '../../supabase/supabase.user';

@Injectable()
export class LocationTagsService {
    private readonly supabase = createPublicClient();

    async vote(locationId: string, tagId: string, userId: string) {
        const { error } = await this.supabase
            .from('location_tags')
            .upsert({
                location_id: locationId,
                tag_id: tagId,
                user_id: userId
            }, { onConflict: 'location_id, tag_id, user_id' });

        if (error) throw new BadRequestException(error.message);
        return { success: true };
    }

    async unvote(locationId: string, tagId: string, userId: string) {
        const { error } = await this.supabase
            .from('location_tags')
            .delete()
            .match({
                location_id: locationId,
                tag_id: tagId,
                user_id: userId
            });

        if (error) throw new BadRequestException(error.message);
        return { success: true };
    }

    async getLocationStats(locationId: string, userId?: string) {
        // Get all votes for this location
        const { data: votes, error } = await this.supabase
            .from('location_tags')
            .select('tag_id, tags!inner(name_vi)')
            .eq('location_id', locationId);

        if (error) throw new BadRequestException(error.message);

        // Aggregate stats
        const stats: Record<string, { tagId: string; name: string; voteCount: number; userVoted: boolean }> = {};

        votes.forEach((v: any) => {
            if (!stats[v.tag_id]) {
                stats[v.tag_id] = {
                    tagId: v.tag_id,
                    name: v.tags.name_vi,
                    voteCount: 0,
                    userVoted: false
                };
            }
            stats[v.tag_id].voteCount++;
        });

        if (userId) {
            const { data: userVotes } = await this.supabase
                .from('location_tags')
                .select('tag_id')
                .eq('location_id', locationId)
                .eq('user_id', userId);

            userVotes?.forEach((uv) => {
                if (stats[uv.tag_id]) {
                    stats[uv.tag_id].userVoted = true;
                }
            });
        }

        return Object.values(stats).sort((a, b) => b.voteCount - a.voteCount);
    }
}
