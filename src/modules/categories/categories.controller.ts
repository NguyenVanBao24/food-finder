import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly service: CategoriesService) { }

    @Get()
    async findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }
}
