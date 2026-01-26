import { Controller, Get, Post, Delete, Put, Param, UseGuards, Body } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/decorators/current-user.decorator';

@Controller('photos')
export class PhotosController {
    constructor(private readonly service: PhotosService) { }

    @Get('location/:locationId')
    async getByLocation(@Param('locationId') locationId: string) {
        return this.service.findByLocation(locationId);
    }

    @Post('location/:locationId')
    @UseGuards(SupabaseAuthGuard)
    async upload(
        @Param('locationId') locationId: string,
        @Body('url') url: string,
        @CurrentUser() user: CurrentUserData
    ) {
        return this.service.create(locationId, user.id, url);
    }

    @Put(':id/primary')
    @UseGuards(SupabaseAuthGuard)
    async setPrimary(
        @Param('id') photoId: string,
        @Body('locationId') locationId: string,
        @CurrentUser() user: CurrentUserData
    ) {
        return this.service.setPrimary(photoId, locationId, user.id);
    }

    @Delete(':id')
    @UseGuards(SupabaseAuthGuard)
    async delete(
        @Param('id') photoId: string,
        @CurrentUser() user: CurrentUserData
    ) {
        return this.service.delete(photoId, user.id);
    }
}
