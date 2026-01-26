import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { LocationTagsService } from './location-tags.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/decorators/current-user.decorator';

@Controller('locations/:locationId/tags')
export class LocationTagsController {
    constructor(private readonly service: LocationTagsService) { }

    @Get()
    async getStats(
        @Param('locationId') locationId: string,
        @Req() req: any
    ) {
        // Optional userId for userVoted status
        const userId = req.user?.id;
        return this.service.getLocationStats(locationId, userId);
    }

    @Post(':tagId/vote')
    @UseGuards(SupabaseAuthGuard)
    async vote(
        @Param('locationId') locationId: string,
        @Param('tagId') tagId: string,
        @CurrentUser() user: CurrentUserData
    ) {
        return this.service.vote(locationId, tagId, user.id);
    }

    @Delete(':tagId/vote')
    @UseGuards(SupabaseAuthGuard)
    async unvote(
        @Param('locationId') locationId: string,
        @Param('tagId') tagId: string,
        @CurrentUser() user: CurrentUserData
    ) {
        return this.service.unvote(locationId, tagId, user.id);
    }
}
