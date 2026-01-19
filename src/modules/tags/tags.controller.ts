import { Controller, Get, Param } from '@nestjs/common';
import { TagsService } from './tags.service';

/**
 * Tags Controller
 * Handles HTTP requests for tag operations
 * 
 * All endpoints are public (no authentication required)
 */
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    /**
     * GET /tags
     * Get all tags grouped by category (positive/negative)
     * 
     * @returns Object with positive and negative tag arrays
     * @example
     * Response:
     * {
     *   "success": true,
     *   "data": {
     *     "positive": [
     *       { "id": "...", "name_vi": "Ăn ngon", "name_en": "Delicious", "icon": "👍" }
     *     ],
     *     "negative": [
     *       { "id": "...", "name_vi": "Đắt", "name_en": "Expensive", "icon": "👎" }
     *     ]
     *   }
     * }
     */
    @Get()
    async findAll() {
        return this.tagsService.findAll();
    }

    /**
     * GET /tags/:id
     * Get single tag by ID
     * 
     * @param id - Tag UUID
     * @returns Tag object
     */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.tagsService.findOne(id);
    }
}
