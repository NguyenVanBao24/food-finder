import { Module } from '@nestjs/common';
import { LocationTagsController } from './location-tags.controller';
import { LocationTagsService } from './location-tags.service';

@Module({
    controllers: [LocationTagsController],
    providers: [LocationTagsService],
    exports: [LocationTagsService],
})
export class LocationTagsModule { }
