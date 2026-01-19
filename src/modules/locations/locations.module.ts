import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

/**
 * Locations Module
 * Manages restaurant/cafe/bar locations
 */
@Module({
    controllers: [LocationsController],
    providers: [LocationsService],
    exports: [LocationsService], // Export for use in other modules
})
export class LocationsModule { }
