import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

/**
 * Tags Module
 * Manages predefined tags for location voting
 */
@Module({
    controllers: [TagsController],
    providers: [TagsService],
    exports: [TagsService], // Export for use in other modules
})
export class TagsModule { }
